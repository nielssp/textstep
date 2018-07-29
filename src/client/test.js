/* 
 * BlogSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = require('jquery');

function Property() {
    this.listeners = [];
    this.value = null;
}

Property.prototype.bind = function (element) {
    if (element.is('input')) {
        var property = this;
        element.val(this.value);
        element.on('keydown keyup', function () {
            property.set($(this).val());
        });
        this.change(function (value) {
            element.val(value);
        });
    }
};

Property.prototype.change = function (callback) {
    this.listeners.push(callback);
};

Property.prototype.set = function (value) {
    this.value = value;
    for (var i = 0; i < this.listeners.length; i++) {
        this.listeners[i].apply(this, [value]);
    }
};

Property.prototype.get = function () {
    return this.value;
};

BLOGSTEP.init('test', function (app) {
    app.defineAction('test', function () {
        app.frame.find('.header-path').text('activated');
        app.disableAction('test');
        setTimeout(function () {
            app.enableAction('test');
        }, 5000);
    });
    
    app.defineAction('test-alert', function () {
        app.alert('Alert', 'This is an alert!');
    });
    
    app.defineAction('test-confirm', function () {
        app.confirm('Confirm', 'Delete everything???', ['Delete it', 'No', 'Cancel'], 'Delete it').done(function (choice) {
            app.alert('Choice', choice);
        });
    });
    
    app.defineAction('test-prompt', function () {
        app.prompt('Prompt', 'Foo bar:', 'baz').done(function (choice) {
            app.alert('Choice', choice);
        });
    });
    
    app.bindKey('c-a', 'test');
    
    var menu = app.addMenu('Test menu');
    menu.addItem('Test', 'test');
    menu.addItem('Open terminal', function () {
        BLOGSTEP.run('terminal');
    });
    menu.addItem('Open file', function () {
        BLOGSTEP.run('editor', { path: '/content/pages/things.md' });
    });
    menu.addItem('Who am I', function () {
        BLOGSTEP.get('who-am-i').done(function (data) {
            alert('you are ' + data.username);
        });
    });
    menu.addItem('File selection', function () {
        var $overlay = $('<div class="dialog-overlay">');
        
        app.body.append($overlay);
        
        var $dialog = $('<div class="frame">');
        $('<div class="frame-head">')
            .append($('<div class="frame-title">').text('Confirm'))
            .appendTo($dialog);
        var $body = $('<div class="frame-body">').appendTo($dialog);
        $('<div class="frame-content">').text('Delete all files in all directories?').appendTo($body);
        var $footer = $('<div class="frame-footer frame-footer-buttons">').appendTo($body);
        $('<button>').text('OK').click(function () {
            $dialog.detach();
            $overlay.detach();
        }).appendTo($footer);
        $dialog.appendTo($overlay);
        
//        BLOGSTEP.selectFile().done(function (data) {
//            alert('you selected ' + data.path);
//        });
    });
    
    var prop = new Property();
    prop.bind(app.frame.find('.textbox-1'));
    prop.bind(app.frame.find('.textbox-2'));
    prop.set('foo');
    
    app.onOpen = function (app, args) {
        app.frame.find('.header-path').text('opened');
    };
    
    app.onResume = function (app, args) {
        app.frame.find('.header-path').text('resumed');
    };
    
    app.onResize = function () {
        app.frame.find('.header-path').text('resized');
    };
});
