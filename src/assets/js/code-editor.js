/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var actions = require('./common/actions');
var ui = require('./common/ui');

var CodeMirror = require('codemirror');
require('codemirror/lib/codemirror.css');
require('codemirror/mode/php/php');
require('codemirror/mode/css/css');
require('codemirror/mode/sass/sass');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');

var path = null;
var textarea = null;
var codemirror = null;

function open(app, args) {
    path = args.path;
    app.frame.find('.header-path').text(path);
    textarea = app.frame.find('textarea');
    textarea.val('').focus();
    
    var mode = path.replace(/^.*\.([^.]+)$/, '$1');
    switch (mode) {
	case 'scss':
	    mode = 'sass';
	    break;
	case 'html':
	case 'htm':
	    mode = 'php';
	    break;
	case 'json':
	case 'js':
	    mode = 'javascript';
	    break;
    }
    codemirror = CodeMirror.fromTextArea(textarea[0], {
	lineNumbers: true,
	mode: mode
    });

    codemirror.on('change', function () {
	app.frame.find('.header-path').text(path + ' (*)');
    });
    
    BLOGSTEP.get('download', { path: path }).done(function (data) {
	codemirror.setValue(data);
	codemirror.clearHistory();
	app.frame.find('.header-path').text(path);
    });
}

function close() {
    codemirror.toTextArea();
    codemirror = null;
}

function saveFile()
{
    var app = this;
    codemirror.save();
    BLOGSTEP.post('edit', { path: path, data: textarea.val() }).done(function () {
	app.frame.find('.header-path').text(path);
    });
}

function newFile()
{
    alert('not implemented');
}

function resizeView()
{
    codemirror.refresh();
}

BLOGSTEP.init('code-editor', function (app) {
    app.defineAction('save', saveFile);
    app.defineAction('new', newFile);
    
    app.bindKey('c-s', 'save');
    
    var menu = app.addMenu('Editor');
    menu.addItem('New', 'new');
    menu.addItem('Save', 'save');
    menu.addItem('Close', 'close');
    
    app.onOpen = open;
    app.onClose = close;
    app.onResize = resizeView;
});