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
    app.frame.find('.header-path').text('loaded');
    
    app.defineAction('test', function () {
	app.frame.find('.header-path').text('activated');
	app.disableAction('test');
	setTimeout(function () {
	    app.enableAction('test');
	}, 5000);
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
	BLOGSTEP.selectFile().done(function (data) {
	    alert('you selected ' + data.path);
	});
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
