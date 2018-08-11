/* 
 * BlogSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var ui = TEXTSTEP.ui;

var dirView;

class Property {
    constructor() {
        this.listeners = [];
        this.value = null;
    }

    bind(element) {
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

    change(callback) {
        this.listeners.push(callback);
    };

    set(value) {
        this.value = value;
        for (var i = 0; i < this.listeners.length; i++) {
            this.listeners[i].apply(this, [value]);
        }
    };

    get() {
        return this.value;
    };

}

TEXTSTEP.initApp('test', ['libtest'], function (app) {
    app.require('libtest').test();

    var frame = app.createFrame('Test');
    frame.setFloating(true);

    frame.appendChild(ui.elem('div', {}, ['Hello, World!']));

    frame.defineAction('alert', function () {
        frame.disableGroup('dialogs');
        frame.alert('Alert', 'Hello, World!').finally(function () {
            frame.enableGroup('dialogs');
        });
    }, ['dialogs']);

    frame.defineAction('confirm', function () {
        frame.disableGroup('dialogs');
        frame.confirm('Confirm', 'Hello, World?', ['Delete', 'No', 'Cancel'], 'Delete').then(function (choice) {
            frame.alert('Choice:', choice);
        }).finally(function () {
            frame.enableGroup('dialogs');
        });
    }, ['dialogs']);

    frame.defineAction('prompt', function () {
        frame.disableGroup('dialogs');
        frame.prompt('Prompt', 'Hello, World?', 'default').then(function (choice) {
            frame.alert('Choice:', choice);
        }).finally(function () {
            frame.enableGroup('dialogs');
        });
    }, ['dialogs']);

    frame.defineAction('file', function () {
        frame.disableGroup('dialogs');
        frame.file('Select file').then(function (choice) {
            frame.alert('Choice:', choice);
        }).finally(function () {
            frame.enableGroup('dialogs');
        });
    }, ['dialogs']);

    frame.defineAction('terminal', function () {
        TEXTSTEP.run('terminal');
    });

    frame.bindKey('a-a', 'alert');
    frame.bindKey('a-c', 'confirm');
    frame.bindKey('a-p', 'prompt');
    frame.bindKey('a-t', 'terminal');
    frame.bindKey('a-f', 'file');

    var menu = frame.addMenu('Test menu');
    menu.addItem('Alert', 'alert');
    menu.addItem('Confirm', 'confirm');
    menu.addItem('Prompt', 'prompt');
    menu.addItem('File', 'file');
    menu.addItem('Open terminal', 'terminal');

    frame.onClose = function () {
        app.close();
    };

    app.onOpen = function (args) {
        if (!frame.isOpen) {
            frame.open();
        } else if (!frame.hasFocus) {
            frame.requestFocus();
        }
    };
});

/*
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
});*/
