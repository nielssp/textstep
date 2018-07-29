/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = require('jquery');
var Cookies = require('js-cookie');
var ui = require('./common/ui');
var paths = require('./common/paths');

import Config from './Config';

window.BLOGSTEP = {};

window.BLOGSTEP.ui = ui;
window.BLOGSTEP.paths = paths;

window.BLOGSTEP.config = new Config(function (keys) {
    return BLOGSTEP.get('get-conf', { keys: keys });
}, function (data) {
    return BLOGSTEP.post('set-conf', { data: data });
});

var apps = {};

var tasks = [];
var running = null;
var skipHistory = false;
var previousTitle = null;

function Menu(app, title) {
    this.app = app;
    this.title = title;
    this.frame = $('<div><header></header><nav><ul></ul></div>');
    this.header = this.frame.find('header');
    this.itemList = this.frame.find('ul');
    this.header.text(title);
}

Menu.prototype.addItem = function (label, action) {
    var button = $('<button/>');
    button.text(label);
    if (typeof action === 'string') {
        button.attr('data-action', action);
    }
    var app = this.app;
    button.click(function () {
        app.activate(action);
    });
    var item = $('<li>');
    item.append(button);
    for (var key in this.app.keyMap) {
        if (this.app.keyMap.hasOwnProperty(key) && this.app.keyMap[key] === action) {
            button.append('<span class="shortcut">' + key + '</span>');
        }
    }
    this.itemList.append(item);
};

function Dialog(parent) {
    this.deferred = null;
    this.parent = parent;
    this.overlay = $('<div class="dialog-overlay">');
    this.frame = $('<div class="frame">').appendTo(this.overlay);
    this.head = $('<div class="frame-head">').appendTo(this.frame);
    this.body = $('<form class="frame-body">').appendTo(this.frame);
    $('<div class="frame-title">').appendTo(this.head);
};

Dialog.prototype.setTitle = function (title) {
    this.head.find('.frame-title').text(title);
};

Dialog.prototype.open = function () {
    this.deferred = $.Deferred();
    if (this.parent.children('.dialog-overlay').length > 0) {
        // TODO: what to do? queue or something else?
        this.deferred.reject();
    } else {
        this.overlay.appendTo(this.parent);
    }
    return this.deferred.promise();
};

Dialog.prototype.close = function (result) {
    this.overlay.detach();
    this.deferred.resolve(result);
};

Dialog.alert = function (parent, title, message) {
    var dialog = new Dialog(parent);
    dialog.setTitle(title);
    $('<div class="frame-content">').text(message).appendTo(dialog.body);
    var footer = $('<div class="frame-footer frame-footer-buttons">').appendTo(dialog.body);
    var okButton = $('<button>').text('OK').appendTo(footer);
    okButton.click(function () {
        dialog.close();
    }).keydown(function (e) {
        if (e.key === 'Escape') {
            dialog.close(null);
        }
    });
    var dfr = dialog.open();
    okButton.focus();
    return dfr;
};

Dialog.confirm = function (parent, title, message, choices = ['OK', 'Cancel'], defaultChoice = 'OK') {
    var dialog = new Dialog(parent);
    dialog.setTitle(title);
    $('<div class="frame-content">').text(message).appendTo(dialog.body);
    var footer = $('<div class="frame-footer frame-footer-buttons">').appendTo(dialog.body);
    var defaultButton = null;
    for (var i = 0; i < choices.length; i++) {
        footer.append(' ');
        var button = $('<button>').text(choices[i]).appendTo(footer);
        button.click(function () {
            dialog.close($(this).text());
        }).keydown(function (e) {
            if (e.key === 'Escape') {
                dialog.close(null);
            }
        });
        if (choices[i] === defaultChoice) {
            defaultButton = button;
        }
    }
    var dfr = dialog.open();
    if (defaultButton !== null) {
        defaultButton.focus();
    }
    return dfr;
};

Dialog.prompt = function (parent, title, message, value = '') {
    var dialog = new Dialog(parent);
    dialog.setTitle(title);
    var content = $('<div class="frame-content">').appendTo(dialog.body);
    $('<div>').text(message).appendTo(content);
    var input = $('<input type="text">').appendTo(content);
    var footer = $('<div class="frame-footer frame-footer-buttons">').appendTo(dialog.body);
    dialog.body.submit(function (e) {
        dialog.close(input.val());
    });
    input.keydown(function (e) {
        if (e.key === 'Escape') {
            dialog.close(null);
        }
    });
    $('<input type="submit">').text('OK').appendTo(footer)
        .click(function () {
            dialog.close(input.val());
        }).keydown(function (e) {
            if (e.key === 'Escape') {
                dialog.close(null);
            }
        });
    footer.append(' ');
    $('<button>').text('Cancel').appendTo(footer)
        .click(function () {
            dialog.close(null);
        }).keydown(function (e) {
            if (e.key === 'Escape') {
                dialog.close(null);
            }
        });
    var dfr = dialog.open();
    input.focus();
    if (value.length > 0) {
        input.val(value);
        input[0].setSelectionRange(0, value.length)
    }
    return dfr;
};

function App(name) {
    this.name = name;
    this.title = '';
    this.state = 'loading';
    this.deferred = null;
    this.args = null;
    this.frame = null;
    this.head = null;
    this.body = null;
    this.dockFrame = null;
    this.actions = {};
    this.actionGroups = {};
    this.keyMap = {};
    this.menus = [];
    this.toolFrames = {};
    this.onInit = null;
    this.onSuspend = null;
    this.onResume = null;
    this.onOpen = null;
    this.onReopen = null;
    this.onFocus = null;
    this.onKeydown = null;
    this.onUnfocus = null;
    this.onClose = null;
    this.onResize = null;
    this.isUnsaved = null;
}

App.prototype.addMenu = function (title) {
    var menu = new Menu(this, title);
    this.menus.push(menu);
    return menu;
};

App.prototype.alert = function (title, message) {
    return Dialog.alert(this.body, title, message);
};

App.prototype.confirm = function (title, message, choices, defaultChoice) {
    return Dialog.confirm(this.body, title, message, choices, defaultChoice);
};

App.prototype.prompt = function (title, message, value) {
    return Dialog.prompt(this.body, title, message, value);
};

App.prototype.keydown = function (e) {
    if (e.defaultPrevented || this.isDialogOpen()) {
        return;
    }
    if (this.onKeydown !== null) {
        if (!this.onKeydown(e)) {
            return false;
        }
    }
    var key = '';
    if (e.ctrlKey) {
        key += 'Ctrl+';
    }
    if (e.altKey) {
        key += 'Alt+';
    }
    if (e.shiftKey) {
        key += 'Shift+';
    }
    if (e.metaKey) {
        key += 'Meta+';
    }
    key += e.key.toUpperCase();
    if (this.keyMap.hasOwnProperty(key)) {
        e.preventDefault();
        this.activate(this.keyMap[key]);
        return false;
    }
};

App.prototype.bindKey = function (key, action) {
    var parts = key.toLowerCase().split(/-|\+/);
    var e = {ctrlKey: '', altKey: '', shiftKey: ''};
    var key = parts[parts.length - 1];
    for (var i = 0; i < parts.length - 1; i++) {
        switch (parts[i]) {
            case 'c':
                e.ctrlKey = 'Ctrl+';
                break;
            case 'a':
                e.altKey = 'Alt+';
                break;
            case 's':
                e.shiftKey = 'Shift+';
                break;
            case 'm':
                e.metaKey = 'Meta+';
                break;
        }
    }
    key = e.ctrlKey + e.altKey + e.shiftKey + key.toUpperCase();
    this.keyMap[key] = action;
};

App.prototype.defineAction = function (name, callback, groups) {
    var app = this;
    this.actions[name] = callback;
    this.frame.find('[data-action="' + name + '"]').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        app.activate(name);
        return false;
    });
    if (typeof groups !== 'undefined') {
        groups.forEach(function (group) {
            if (!this.actionGroups.hasOwnProperty(group)) {
                this.actionGroups[group] = [];
            }
            this.actionGroups[group].push(name);
        }, this);
    }
};

App.prototype.activate = function (name) {
    if (typeof name === 'string') {
        this.actions[name].apply(this, [name]);
    } else {
        name.apply(this);
    }
};

App.prototype.isDialogOpen = function () {
    return this.body.children('.dialog-overlay').length > 0;
};

App.prototype.enableGroup = function (group) {
    if (this.actionGroups.hasOwnProperty(group)) {
        this.actionGroups[group].forEach(this.enableAction, this);
    }
};

App.prototype.disableGroup = function (group) {
    if (this.actionGroups.hasOwnProperty(group)) {
        this.actionGroups[group].forEach(this.disableAction, this);
    }
};

App.prototype.enableAction = function (name) {
    if (typeof name === 'string') {
        this.frame.find('[data-action="' + name + '"]').attr('disabled', false);
        this.menus.forEach(function (menu) {
            menu.frame.find('[data-action="' + name + '"]').attr('disabled', false);
        });
    } else {
        name.forEach(this.enableAction, this);
    }
};

App.prototype.disableAction = function (name) {
    if (typeof name === 'string') {
        this.frame.find('[data-action="' + name + '"]').attr('disabled', true);
        this.menus.forEach(function (menu) {
            menu.frame.find('[data-action="' + name + '"]').attr('disabled', true);
        });
    } else {
        name.forEach(this.disableAction, this);
    }
};

App.prototype.setTitle = function (title) {
    this.title = title;
    this.head.find('.frame-title').text(this.title);
    this.dockFrame.attr('title', this.title);
    document.title = this.title;
};

App.prototype.setArgs = function (args) {
    this.args = args;
    if (!skipHistory) {
        var path = BLOGSTEP.PATH + '/app/' + this.name;
        if (!$.isEmptyObject(args)) {
            path += '?' + $.param(args).replace(/%2F/gi, '/');
        }
        if (previousTitle !== null) {
            document.title = previousTitle;
        }
        history.pushState({app: this.name, args: args}, previousTitle, path);
        document.title = this.title;
        previousTitle = this.title;
    }
};

App.prototype.init = function () {
    if (this.state !== 'loaded') {
        console.error('init: unexpected state', this.state, 'app', this.name);
        return;
    }
    this.state = 'initializing';
    this.defineAction('close', this.close);
    this.bindKey('c-s-c', 'close');
    if (this.onInit !== null) {
        this.onInit(this);
    }
    for (var name in this.toolFrames) {
        if (this.toolFrames.hasOwnProperty(name)) {
            $('#menu').prepend(this.toolFrames[name]);
        }
    }
    for (var i = 0; i < this.menus.length; i++) {
        $('#menu').prepend(this.menus[i].frame);
    }
    this.state = 'initialized';
};

App.prototype.open = function (args) {
    if (this.state !== 'initialized') {
        console.error(this.name + ': open: unexpected state:', this.state);
        return;
    }
    this.state = 'opening';
    this.setTitle(this.title);
    this.frame.addClass('active').show();
    for (var i = 0; i < this.menus.length; i++) {
        this.menus[i].frame.show();
    }
    for (var name in this.toolFrames) {
        if (this.toolFrames.hasOwnProperty(name)) {
            this.toolFrames[name].show();
        }
    }
    if (this.onOpen !== null) {
        try {
            this.onOpen(this, args || {});
        } catch (e) {
            console.error(this.name + ': open: exception caught:', e);
            alert('Could not open application: ' + this.name);
            this.kill();
            return;
        }
    }
    if (this.dockFrame !== null) {
        $('#dock').append(this.dockFrame);
    }
    this.setArgs(args);
    this.state = 'running';
};

App.prototype.kill = function () {
    this.state = 'closing';
    if (this.onClose !== null) {
        try {
            this.onClose(this);
        } catch (e) {
        }
    }
    this.frame.removeClass('active').hide();
    for (var i = 0; i < this.menus.length; i++) {
        this.menus[i].frame.hide();
    }
    for (var name in this.toolFrames) {
        if (this.toolFrames.hasOwnProperty(name)) {
            this.toolFrames[name].hide();
        }
    }
    if (running === this) {
        if (tasks.length > 0) {
            running = tasks.pop();
            running.resume();
        } else {
            running = null;
        }
    }
    if (this.dockFrame !== null) {
        this.dockFrame.detach();
    }
    this.state = 'initialized';
};

App.prototype.close = function (action) {
    if (this.state !== 'running') {
        console.error(this.name + ': close: unexpected state:', this.state);
        return;
    }
    this.state = 'closing';
    if (this.onClose !== null) {
        var ok = this.onClose(this, action);
        if (ok === false) {
            this.state = 'running';
            return false;
        }
    }
    this.frame.removeClass('active').hide();
    for (var i = 0; i < this.menus.length; i++) {
        this.menus[i].frame.hide();
    }
    for (var name in this.toolFrames) {
        if (this.toolFrames.hasOwnProperty(name)) {
            this.toolFrames[name].hide();
        }
    }
    if (running === this) {
        if (tasks.length > 0) {
            running = tasks.pop();
            running.resume();
        } else {
            running = null;
        }
    }
    if (this.dockFrame !== null) {
        this.dockFrame.detach();
    }
    this.state = 'initialized';
    return true;
};

App.prototype.reopen = function (args) {
    if (this.state !== 'running') {
        console.error(this.name + ': reopen: unexpected state:', this.state);
        return;
    }
    if (this.onReopen !== null) {
        try {
            this.onReopen(this, args || {});
        } catch (e) {
            console.error(this.name + ': reopen: exception caught:', e);
            alert('Could not open application: ' + this.name);
            this.kill();
            return;
        }
    } else {
        this.state = 'closing';
        if (this.onClose !== null) {
            this.onClose(this);
        }
        this.state = 'initialized';
        this.open(args);
    }
};

App.prototype.suspend = function () {
    if (this.state !== 'running') {
        console.error(this.name + ': suspend: unexpected state:', this.state);
        return;
    }
    this.state = 'suspending';
    if (this.onSuspend !== null) {
        this.onSuspend(this);
    }
    if (this.state === 'suspending') {
        this.frame.removeClass('active').hide();
        for (var i = 0; i < this.menus.length; i++) {
            this.menus[i].frame.hide();
        }
        for (var name in this.toolFrames) {
            if (this.toolFrames.hasOwnProperty(name)) {
                this.toolFrames[name].hide();
            }
        }
        this.state = 'suspended';
    }
};

App.prototype.resume = function () {
    if (this.state !== 'suspended') {
        console.error(this.name + ': resume: unexpected state:', this.state);
        return;
    }
    this.state = 'resuming';
    this.setTitle(this.title);
    this.frame.addClass('active').show();
    for (var i = 0; i < this.menus.length; i++) {
        this.menus[i].frame.show();
    }
    for (var name in this.toolFrames) {
        if (this.toolFrames.hasOwnProperty(name)) {
            this.toolFrames[name].show();
        }
    }
    if (this.onResume !== null) {
        this.onResume(this);
    }
    this.setArgs(this.args);
    if (this.onResize !== null) {
        this.onResize();
    }
    this.state = 'running';
};

BLOGSTEP.PATH = $('body').data('path').replace(/\/$/, '');

BLOGSTEP.init = function (name, onInit) {
    apps[name].onInit = onInit;
    apps[name].init();
    if (apps[name].deferred !== null) {
        apps[name].deferred.resolve(apps[name]);
        apps[name].deferred = null;
    }
};

BLOGSTEP.restore = function (name) {
    if (apps.hasOwnProperty(name)) {
        if (apps[name].state === 'suspended') {
            if (running !== null) {
                running.suspend();
                tasks.push(running);
            }
            running = apps[name];
            var index = tasks.indexOf(apps[name]);
            if (index >= 0) {
                tasks.splice(index, 1);
            }
            apps[name].resume();
            return true;
        } else if (apps[name].state === 'running') {
            return true;
        }
    }
    return false;
};

BLOGSTEP.getTasks = function () {
    return Object.values(apps);
};

BLOGSTEP.run = function (name, args) {
    var dfr = $.Deferred();
    args = args || {};
    if (apps.hasOwnProperty(name)) {
        if (apps[name].state === 'running') {
            apps[name].reopen(args);
        } else {
            if (running !== null) {
                running.suspend();
                tasks.push(running);
            }
            running = apps[name];
            if (apps[name].state === 'suspended') {
                var index = tasks.indexOf(apps[name]);
                if (index >= 0) {
                    tasks.splice(index, 1);
                }
                apps[name].resume();
                apps[name].reopen(args);
            } else {
                apps[name].open(args);
            }
        }
        dfr.resolve(apps[name]);
    } else {
        if (running !== null) {
            running.suspend();
            tasks.push(running);
            running = null;
        }
        load(name).done(function (app) {
            running = app;
            app.open(args);
            dfr.resolve(app);
        });
    }
    return dfr.promise();
};

BLOGSTEP.open = function (path) {
    var fileName = paths.fileName(path);
    if (fileName.match(/\.md/i)) {
        BLOGSTEP.run('editor', {path: path});
    } else if (fileName.match(/\.webm/i)) {
        BLOGSTEP.run('player', {path: path});
    } else if (fileName.match(/\.(?:jpe?g|png|gif|ico)/i)) {
        BLOGSTEP.run('viewer', {path: path});
    } else if (fileName.match(/\.(?:php|log|json|html|css|js|sass|scss)/i)) {
        BLOGSTEP.run('code-editor', {path: path});
    } else {
        BLOGSTEP.get('list-files', {path: path}).done(function (data) {
            if (data.type === 'directory') {
                BLOGSTEP.run('files', {path: path});
            } else {
                BLOGSTEP.run('code-editor', {path: path});
            }
        });
    }
};

BLOGSTEP.getToken = function () {
    return Cookies.get('csrf_token');
};

BLOGSTEP.addToken = function (xhr) {
    xhr.setRequestHeader('X-Csrf-Token', BLOGSTEP.getToken());
};

BLOGSTEP.ajax = function (url, method, data, responseType) {
    var dfr = $.Deferred();

    var settings = {
        url: url,
        method: method,
        data: data,
        dataType: responseType,
        headers: {'X-Csrf-Token': BLOGSTEP.getToken()}
    };

    var xhr = $.ajax(settings);
    xhr.done(dfr.resolve);
    xhr.fail(function (jqXhr, textStatus, errorThrown) {
        console.log(jqXhr, textStatus, errorThrown);
        var newToken = BLOGSTEP.getToken();
        if (settings.headers['X-Csrf-Token'] !== newToken) {
            settings.headers['X-Csrf-Token'] = newToken;
            if (xhr.status === 400) {
                $.ajax(settings).then(dfr.resolve, dfr.reject);
                return;
            }
        }
        if (xhr.status === 401) {
            $('#login-overlay').show();
            if ($('#login-username').val() === '') {
                $('#login-username').focus();
            } else {
                $('#login-password').focus();
            }
            handleLogin(function () {
                $('#login-overlay').hide();
                $.ajax(settings).then(dfr.resolve, dfr.reject);
            });
            return;
        } else if (typeof xhr.responseJSON !== 'undefined') {
            console.warn(xhr.responseJSON.message);
        }
        ui.shake($('main > .frame.active'));

        var args = Array.prototype.slice.call(arguments);
        dfr.rejectWith(xhr, args);
    });

    return dfr.promise();
};

BLOGSTEP.get = function (action, data, responseType) {
    return BLOGSTEP.ajax(BLOGSTEP.PATH + '/api/' + action, 'get', data, responseType);
};
BLOGSTEP.post = function (action, data, responseType) {
    return BLOGSTEP.ajax(BLOGSTEP.PATH + '/api/' + action, 'post', data, responseType);
};

function load(name) {
    var dfr = $.Deferred();
    if (apps.hasOwnProperty(name)) {
        if (apps[name].deferred === null) {
            dfr.resolve(apps[name]);
        } else {
            apps[name].deferred.then(dfr.resolve, dfr.reject);
        }
    } else {
        apps[name] = new App(name);
        apps[name].deferred = dfr;
        BLOGSTEP.get('load', {name: name}, 'html').done(function (data) {
            var $doc = $('<div></div>');
            $doc.html(data);
            var $styles = $doc.children('link[rel="stylesheet"]');
            var $scripts = $doc.children('script[src]');
            apps[name].frame = $doc.children('.frame');
            apps[name].head = apps[name].frame.children('.frame-head');
            apps[name].body = apps[name].frame.children('.frame-body');
            apps[name].title = apps[name].head.find('.frame-title').text();
            apps[name].state = 'loaded';
            $doc.children('.tool-frame').each(function () {
                apps[name].toolFrames[$(this).data('name')] = $(this);
            });
            var $dockFrame = $doc.children('.dock-frame').first();
            if ($dockFrame.length === 0) {
                $dockFrame = $('<div class="dock-frame">');
                $('<img>')
                        .attr('src', BLOGSTEP.PATH + '/assets/img/icons/32/app.png')
                        .attr('alt', name)
                        .appendTo($dockFrame);
                $('<label>')
                        .text(name)
                        .appendTo($dockFrame);
            }
            $dockFrame.click(function () {
                BLOGSTEP.restore(name);
            });
            apps[name].dockFrame = $dockFrame;
            $('head').append($styles);
            $('main').append(apps[name].frame);
            $scripts.each(function () {
                $.getScript($(this).attr('src')).fail(dfr.reject);
            });
        }).fail(dfr.reject);
    }
    return dfr.promise();
}

function handleLogin(done) {
    $('#login').find('input').prop('disabled', false);
    $('#login-frame').show();
    $('#login').submit(function () {
        $(this).find('input').prop('disabled', true);
        var data = {
            username: $('#login-username').val(),
            password: $('#login-password').val(),
            remember: $('#login-remember').is(':checked') ? {remember: 'remember'} : null
        };
        BLOGSTEP.post('login', data).done(function () {
            $('#login').find('input').prop('disabled', false);
            $('#workspace-menu .username').text(data.username);
            $('#login-frame').css({overflow: 'hidden', whiteSpace: 'no-wrap'}).animate({width: 0}, function () {
                $(this).hide().css({overflow: '', whiteSpace: '', width: ''});
                $('#login').off('submit');
                $('#login-password').val('');
                done();
            });
        }).fail(function () {
            $('#login').find('input').prop('disabled', false);
            ui.shake($('#login-frame'));
            $('#login-username').select();
            $('#login-password').val('');
        });
        return false;
    });
}
;

$.ajaxSetup({
    headers: {'X-Csrf-Token': BLOGSTEP.getToken()}
});

$(document).ready(function () {
    BLOGSTEP.get('who-am-i').done(function (data) {
        $('#workspace-menu').show();
        $('#workspace-menu .username').text(data.username);

        $('#workspace-menu [data-action="file-system"]').click(function () {
            if (!BLOGSTEP.restore('files')) {
                BLOGSTEP.run('files');
            }
        });
        $('#workspace-menu [data-action="builder"]').click(function () {
            BLOGSTEP.run('builder');
        });
        $('#workspace-menu [data-action="terminal"]').click(function () {
            BLOGSTEP.run('terminal');
        });
        $('#workspace-menu [data-action="control-panel"]').click(function () {
            BLOGSTEP.run('control-panel');
        });
        $('#workspace-menu [data-action="switch-user"]').click(function () {
            BLOGSTEP.post('logout').done(function () {
                $('#login-overlay').show();
                $('#login-frame').show();
                $('#login-username').select().focus();
                handleLogin(function () {
                    $('#login-overlay').hide();
                });
            });
        });
        $('#workspace-menu [data-action="logout"]').click(function () {
            BLOGSTEP.post('logout').done(function () {
                location.reload();
            });
        });

        $('#login-username').val(data.username);
        $('#login-overlay').addClass('login-overlay-dark');

        var run = $('body').data('run');
        if (run !== '') {
            var args = $('body').data('args');
            console.log(args);
            BLOGSTEP.run(run, args);
        } else {
            BLOGSTEP.run('files', {path: '/'});
        }
    });
});

$(document).on('click', '[data-action="toggle-menu"]', function (e) {
    $('body').toggleClass('show-menu');
    return false;
});

$('body').click(function (e) {
    if ($('body').hasClass('show-menu')) {
        $('body').removeClass('show-menu');
    }
});

$(document).on('click', '[data-toggle] > *', function (e) {
    if ($(this).is($(this).parent().data('toggle'))) {
        $(this).toggleClass('active');
    }
});

$(document).on('click', '[data-choice] > *', function (e) {
    var selector = $(this).parent().data('choice');
    if ($(this).is(selector)) {
        $(this).parent().children(selector).removeClass('active');
        $(this).addClass('active');
    }
});

$(window).resize(function () {
    for (var name in apps) {
        if (apps.hasOwnProperty(name) && apps[name].state === 'running') {
            if (apps[name].onResize !== null) {
                apps[name].onResize();
            }
        }
    }
});

$(window).keydown(function (e) {
    for (var name in apps) {
        if (apps.hasOwnProperty(name) && apps[name].state === 'running') {
            apps[name].keydown(e);
        }
    }
});

window.onpopstate = function (event) {
    if (event.state !== null) {
        skipHistory = true;
        BLOGSTEP.run(event.state.app, event.state.args);
        skipHistory = false;
    }
};

window.onbeforeunload = function (event) {
    for (var name in apps) {
        if (apps.hasOwnProperty(name) && (apps[name].state === 'running' || apps[name].state === 'suspended')) {
            if (apps[name].isUnsaved !== null) {
                if (apps[name].isUnsaved()) {
                    if (apps[name].state === 'suspended') {
                        BLOGSTEP.restore(name);
                    }
                    return 'Unsaved data in: ' + apps[name].title;
                }
            }
        }
    }
};
