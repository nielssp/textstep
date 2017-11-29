/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var paths = require('./common/paths');
var ui = require('./common/ui');

require('highlightjs/styles/solarized_dark.css');
window.hljs = require('highlightjs/highlight.pack.js');
require('simplemde/dist/simplemde.min.css');

var self = null;

var buffers = {};

var bufferPanel = null;

var path = null;

var cwd = null;

var SimpleMDE = require('simplemde');

var simplemde = null;

function addBuffer(path) {
    var item = $('<a class="file">');
    item.text(paths.fileName(path));
    item.click(function () {
	reopen(self, { path: path });
    });
    bufferPanel.append(item);
    buffers[path] = {
	item: item,
	data: ''
    };
}

function openBuffer(path) {
    if (buffers.hasOwnProperty(path)) {
	bufferPanel.children().removeClass('active');
	buffers[path].item.addClass('active');
	return true;
    }
    return false;
}

function open(app, args) {
    path = args.path;
    cwd = paths.dirName(path);
    app.setTitle(path + ' – Editor');
    
    addBuffer(path);
    openBuffer(path);
    app.frame.find('textarea').val('');
    
    simplemde = new SimpleMDE({
	autofocus: true,
	element: app.frame.find('textarea')[0],
	renderingConfig: {
	    codeSyntaxHighlighting: true
	},
	previewRender: function (text) {
	    var html = SimpleMDE.prototype.markdown(text);
	    return html.replace(/src\s*=\s*"([^"]*)"/ig, function (match, url) {
		return 'src="' + BLOGSTEP.PATH + '/api/download?path=' + encodeURIComponent(paths.convert(url, cwd)) + '"';
	    });
	},
	toolbar: [
	    {
		name: "custom",
		action: function (editor) {
		    saveFile();
		},
		className: "fa fa-save",
		title: "Save"
	    },
	    "|",
	    "bold",
	    "italic",
	    "heading",
	    "|",
	    "quote",
	    "code",
	    "unordered-list",
	    "ordered-list",
	    "|",
	    "link",
	    "image",
	    "table",
	    "|",
	    "preview",
	    "side-by-side",
	    "fullscreen",
	    "|",
	    "guide"
	]
    });
    
    simplemde.codemirror.on('change', function () {
	app.setTitle(path + ' (*) – Editor');
    });
    
    BLOGSTEP.get('download', { path: path }).done(function (data) {
	simplemde.value(data);
	simplemde.codemirror.clearHistory();
	app.setTitle(path + ' – Editor');
    });
}

function reopen(app, args) {
    path = args.path;
    cwd = paths.dirName(path);
    app.setTitle(path + ' – Editor');
    
    if (!openBuffer(path)) {
	addBuffer(path);
	openBuffer(path);
    }
    app.frame.find('textarea').val('');
    
    BLOGSTEP.get('download', { path: path }).done(function (data) {
	simplemde.value(data);
	simplemde.codemirror.clearHistory();
	app.setTitle(path + ' – Editor');
    });
}

function close() {
    simplemde.toTextArea();
    simplemde = null;
    buffers = [];
    bufferPanel.empty();
}

function saveFile()
{
    if (simplemde !== null) {
	BLOGSTEP.post('edit', { path: path, data: simplemde.value() }).done(function () {
	    self.setTitle(path + ' – Editor');
	    simplemde.clearAutosavedValue();
	});
    }
}

function newFile()
{
    alert('not implemented');
}

function resizeView()
{
    simplemde.codemirror.refresh();
}

BLOGSTEP.init('editor', function (app) {
    self = app;

    app.defineAction('save', saveFile);
    app.defineAction('new', newFile);
    
    app.bindKey('c-s', 'save');
    
    var menu = app.addMenu('Editor');
    menu.addItem('New', 'new');
    menu.addItem('Save', 'save');
    menu.addItem('Close', 'close');
    
    bufferPanel = app.toolFrames.buffers.find('.files-list');
    
    app.onOpen = open;
    app.onReopen = reopen;
    app.onClose = close;
    app.onResize = resizeView;
});