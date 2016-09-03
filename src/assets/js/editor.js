/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');

require('highlightjs/styles/solarized_dark.css');
window.hljs = require('highlightjs/highlight.pack.js');
require('simplemde/dist/simplemde.min.css');

function saveFile() {
    alert('not implemented');
}

function newFile() {
    alert('not implemented');
}

var actions = document.getElementsByClassName("app-action");
for (var i = 0; i < actions.length; i++) {
    var action = actions[i];
    action.addEventListener('click', function (e) {
        e.preventDefault();
        switch (action.getAttribute('data-action')) {
            case 'save':
                saveFile();
                break;
            case 'new':
                newFile();
                break;
            default:
                alert('not implemented');
                break;
        }
        return false;
    });
}

var SimpleMDE = require('simplemde');

var simplemde = new SimpleMDE({
    autofocus: true,
//        autosave: {
//            enabled: true,
//            uniqueId: 'todo'
//        },
    renderingConfig: {
        codeSyntaxHighlighting: true
    },
    toolbar: [
        {
            name: "custom",
            action: function (editor) {
                saveFile();
            },
            className: "fa fa-save",
            title: "Save",
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

function resizeView() {
    $('.CodeMirror').height($(window).height() - 200);
}

resizeView();
$(window).resize(resizeView);