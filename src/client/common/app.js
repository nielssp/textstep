/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

export default function App(name) {
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
    if (this.onInit !== null) {
        this.onInit(this);
    }
    this.state = 'initialized';
};

App.prototype.open = function (args) {
    if (this.state !== 'initialized') {
        console.error(this.name + ': open: unexpected state:', this.state);
        return;
    }
    this.state = 'opening';
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

