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

var path = null;

var SimpleMDE = require('simplemde');

var simplemde = null;

function open(app, args) {
    path = args.path;
    app.frame.find('.header-path').text(path);
    
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
	app.frame.find('.header-path').text(path + ' (*)');
    });
    
    BLOGSTEP.get('download', { path: path }).done(function (data) {
	simplemde.value(data);
	simplemde.codemirror.clearHistory();
	app.frame.find('.header-path').text(path);
    });
}

function close() {
    simplemde.toTextArea();
    simplemde = null;
}

function saveFile()
{
    var app = this;
    if (simplemde !== null) {
	BLOGSTEP.post('edit', { path: path, data: simplemde.value() }).done(function () {
	    app.frame.find('.header-path').text(path);
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