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

var SimpleMDE = require('simplemde');

var self = null;

var current = null;

var buffers = {};

var bufferPanel = null;

var simplemde = null;

function createBuffer(path) {
    var item = $('<a class="file file-md">');
    item.text(paths.fileName(path));
    item.click(function () {
        reopen(self, {path: path});
    });
    bufferPanel.append(item);
    buffer = {
        path: path,
        name: paths.fileName(path),
        cwd: paths.dirName(path),
        item: item,
        data: null,
        loaded: false,
        unsaved: false,
        history: null
    };
    buffers[path] = buffer;
    if (current !== null) {
        current.item.removeClass('active');
    }
    current = buffer;
    current.item.addClass('active');
    BLOGSTEP.get('download', {path: path}).done(function (data) {
        buffer.data = data;
        if (current === buffer) {
            openBuffer(path);
        }
    });
}

function openBuffer(path) {
    if (buffers.hasOwnProperty(path)) {
        if (current !== null) {
            current.item.removeClass('active');
        }
        current = buffers[path];
        current.item.addClass('active');
        if (current.data !== null) {
            var data = current.data;
            current.data = null;
            simplemde.value(data);
            current.data = data;
            if (current.history !== null) {
                simplemde.codemirror.setHistory(current.history);
            } else {
                simplemde.codemirror.clearHistory();
            }
            if (current.unsaved) {
                self.setTitle(current.path + ' (*) – Editor');
            } else {
                self.setTitle(current.path + ' – Editor');
            }
        } else {
            self.setTitle(current.path + ' (...) – Editor');
        }
        return true;
    }
    return false;
}

function open(app, args) {
    path = args.path;
    app.frame.find('textarea').val('');
    app.setTitle(path + ' (...) – Editor');

    simplemde = new SimpleMDE({
        autofocus: true,
        element: app.frame.find('textarea')[0],
        renderingConfig: {
            codeSyntaxHighlighting: true
        },
        previewRender: function (text) {
            var html = SimpleMDE.prototype.markdown(text);
            return html.replace(/src\s*=\s*"([^"]*)"/ig, function (match, url) {
                return 'src="' + BLOGSTEP.PATH + '/api/download?path=' + encodeURIComponent(paths.convert(url, current.cwd)) + '"';
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

    simplemde.codemirror.on('changes', function () {
        if (current !== null && current.data !== null) {
            current.unsaved = true;
            current.item.text(current.name + ' (*)');
            current.data = simplemde.value();
            current.history = simplemde.codemirror.getHistory();
            app.setTitle(current.path + ' (*) – Editor');
        }
    });

    createBuffer(path);
}

function reopen(app, args) {
    path = args.path;
    app.setTitle(path + ' (...) – Editor');
    app.frame.find('textarea').val('');

    if (!openBuffer(path)) {
        createBuffer(path);
    }
}

function close() {
    for (var path in buffers) {
        if (buffers.hasOwnProperty(path) && buffers[path].unsaved) {
            var ok = confirm('One or more buffers contain unsaved changed.');
            if (ok) {
                break;
            } else {
                if (current === null || !current.unsaved) {
                    openBuffer(path);
                }
                return false;
            }
        }
    }
    simplemde.toTextArea();
    simplemde = null;
    buffers = [];
    bufferPanel.empty();
    return true;
}

function saveFile() {
    if (simplemde !== null && current !== null) {
        var buffer = current;
        BLOGSTEP.post('edit', {path: buffer.path, data: buffer.data}).done(function () {
            buffer.unsaved = false;
            buffer.item.text(buffer.name);
            if (current === buffer) {
                self.setTitle(current.path + ' – Editor');
                simplemde.clearAutosavedValue();
            }
        });
    }
}

function closeBuffer() {
    if (simplemde !== null && current !== null) {
        var ok = true;
        if (current.unsaved) {
            ok = confirm('The buffer contains unsaved changed.');
        }
        if (ok) {
            delete(buffers[current.path]);
            current.item.remove();
            current = null;
            for (var path in buffers) {
                if (buffers.hasOwnProperty(path)) {
                    openBuffer(path);
                }
            }
            if (current === null) {
                self.close();
            }
        }
    }
}

function isUnsaved() {
    for (var path in buffers) {
        if (buffers.hasOwnProperty(path) && buffers[path].unsaved) {
            return true;
        }
    }
    return false;
}

function newFile() {
    alert('not implemented');
}

function resizeView() {
    simplemde.codemirror.refresh();
}

BLOGSTEP.init('editor', function (app) {
    self = app;

    app.defineAction('save', saveFile);
    app.defineAction('new', newFile);
    app.defineAction('close-buffer', closeBuffer);

    app.bindKey('c-s', 'save');

    var menu = app.addMenu('Editor');
    menu.addItem('New', 'new');
    menu.addItem('Save', 'save');
    menu.addItem('Close buffer', 'close-buffer');
    menu.addItem('Close', 'close');

    bufferPanel = app.toolFrames.buffers.find('.files-list');

    app.onOpen = open;
    app.onReopen = reopen;
    app.onClose = close;
    app.onResize = resizeView;
    app.isUnsaved = isUnsaved;
});