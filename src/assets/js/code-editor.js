/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var paths = require('./common/paths');
var ui = require('./common/ui');

var CodeMirror = require('codemirror');
require('codemirror/lib/codemirror.css');
require('codemirror/mode/php/php');
require('codemirror/mode/css/css');
require('codemirror/mode/sass/sass');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');

var self = null;

var current = null;

var buffers = {};

var bufferPanel = null;

var codemirror = null;


function createBuffer(path) {
    var item = $('<a class="file file-md">');
    item.text(paths.fileName(path));
    item.click(function () {
        reopen(self, {path: path});
    });
    bufferPanel.append(item);
    var buffer = {
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
    BLOGSTEP.get('download', {path: path}, 'text').done(function (data) {
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
            self.setArgs({ path: path });
            var data = current.data;
            current.data = null;
            
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
            
            codemirror.setOption('mode', mode);
            codemirror.setValue(data);
            current.data = data;
            if (current.history !== null) {
                codemirror.setHistory(current.history);
            } else {
                codemirror.clearHistory();
            }
            if (current.unsaved) {
                self.setTitle(current.path + ' (*) – Code Editor');
            } else {
                self.setTitle(current.path + ' – Code Editor');
            }
        } else {
            self.setTitle(current.path + ' (...) – Code Editor');
        }
        return true;
    }
    return false;
}

function open(app, args) {
    var path = args.path;
    app.frame.find('textarea').val('').focus();
    app.setTitle(path + ' (...) – Code editor');
    
    codemirror = CodeMirror.fromTextArea(app.frame.find('textarea')[0], {
        lineNumbers: true
    });

    codemirror.on('changes', function () {
        if (current !== null && current.data !== null) {
            current.unsaved = true;
            current.item.text(current.name + ' (*)');
            current.data = codemirror.getValue();
            current.history = codemirror.getHistory();
            app.setTitle(current.path + ' (*) – Code Editor');
        }
    });
    
    createBuffer(path);
}


function reopen(app, args) {
    var path = args.path;
    app.setTitle(path + ' (...) – Code Editor');
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
    codemirror.toTextArea();
    codemirror = null;
    buffers = [];
    bufferPanel.empty();
    return true;
}

function saveFile() {
    if (codemirror !== null && current !== null) {
        var buffer = current;
        BLOGSTEP.post('write', {path: buffer.path, data: buffer.data}).done(function () {
            buffer.unsaved = false;
            buffer.item.text(buffer.name);
            if (current === buffer) {
                self.setTitle(current.path + ' – Code Editor');
            }
        });
    }
}

function closeBuffer() {
    if (codemirror !== null && current !== null) {
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
    codemirror.refresh();
}

BLOGSTEP.init('code-editor', function (app) {
    self = app;
    
    app.defineAction('save', saveFile);
    app.defineAction('new', newFile);
    app.defineAction('close-buffer', closeBuffer);
    
    app.bindKey('c-s', 'save');
    
    var menu = app.addMenu('Code Editor');
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
