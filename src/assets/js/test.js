/* 
 * BlogSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = require('jquery');

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
