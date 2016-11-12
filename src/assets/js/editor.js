/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var actions = require('./common/actions');
var paths = require('./common/paths');
var ui = require('./common/ui');

require('highlightjs/styles/solarized_dark.css');
window.hljs = require('highlightjs/highlight.pack.js');
require('simplemde/dist/simplemde.min.css');

var PATH = $('body').data('path').replace(/\/$/, '');
var TOKEN = $('#editor').data('token');

var path = $('#editor').data('path');
var cwd = paths.convert('..', path);

$(document).ajaxError(ui.handleError);

actions.define('new', newFile);
actions.define('save', saveFile);
actions.define('close', function () {
    location.href = PATH + '/files' + path;
});

var SimpleMDE = require('simplemde');

var simplemde = new SimpleMDE({
    autofocus: true,
    renderingConfig: {
        codeSyntaxHighlighting: true
    },
    previewRender: function (text) {
        var html = SimpleMDE.prototype.markdown(text);
        return html.replace(/src\s*=\s*"([^"]*)"/ig, function (match, url) {
            return 'src="' + PATH + '/api/download?path=' + encodeURIComponent(paths.convert(url, cwd)) + '"';
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

function saveFile()
{
    $.ajax({
        url: PATH + '/api/edit',
        method: 'post',
        data: {request_token: TOKEN, path: path, data: simplemde.value()},
        success: function (data) {
            alert('Saved!');
            simplemde.clearAutosavedValue();
        }
    });
}

function newFile()
{
    alert('not implemented');
}

function resizeView()
{
    simplemde.codemirror.refresh();
}

$(document).keydown(function (e) {
    if (e.key === 's' && e.ctrlKey) {
        saveFile();
        return false;
    }
});

resizeView();
$(window).resize(resizeView);