/*
 * TEXTSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var paths = TEXTSTEP.paths;
var ui = TEXTSTEP.ui;

var CodeMirror = null;

var self = null;

var frame = null;

var textarea = null;

var current = null;

var buffers = {};

var bufferPanel = null;

var codemirror = null;

function createBuffer(path) {
    var item = ui.elem('a', {'class': 'file file-md'}, [paths.fileName(path)]);
    item.onclick = function () {
        reopen({path: path});
    };
    bufferPanel.appendChild(item);
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
        current.item.className = 'file file-md';
    }
    current = buffer;
    current.item.className = 'file file-md active';
    TEXTSTEP.get('download', {path: path}, 'text').then(function (data) {
        buffer.data = data;
        if (current === buffer) {
            openBuffer(path);
        }
    });
}

function openBuffer(path) {
    if (buffers.hasOwnProperty(path)) {
        if (current !== null) {
            current.item.className = 'file file-md';
        }
        current = buffers[path];
        current.item.className = 'file file-md active';
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
                frame.setTitle(current.path + ' (*) – Code Editor');
            } else {
                frame.setTitle(current.path + ' – Code Editor');
            }
        } else {
            frame.setTitle(current.path + ' (...) – Code Editor');
        }
        return true;
    }
    return false;
}

function open(args) {
    var path = args.path;
    textarea.value = '';
    textarea.focus();
    frame.setTitle(path + ' (...) – Code editor');
    
    codemirror = CodeMirror.fromTextArea(textarea, {
        lineNumbers: true
    });

    codemirror.on('changes', function () {
        if (current !== null && current.data !== null) {
            current.unsaved = true;
            current.item.textContent = current.name + ' (*)';
            current.data = codemirror.getValue();
            current.history = codemirror.getHistory();
            frame.setTitle(current.path + ' (*) – Code Editor');
        }
    });
    
    createBuffer(path);
}


function reopen(args) {
    var path = args.path;
    frame.setTitle(path + ' (...) – Code Editor');
    textarea.value = '';

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
    bufferPanel.innerHTML = '';
    return true;
}

function saveFile() {
    if (codemirror !== null && current !== null) {
        var buffer = current;
        TEXTSTEP.post('write', {path: buffer.path, data: buffer.data}).then(function () {
            buffer.unsaved = false;
            buffer.item.textContent = buffer.name;
            if (current === buffer) {
                frame.setTitle(current.path + ' – Code Editor');
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

TEXTSTEP.initApp('code', ['libedit'], function (app) {
    self = app;
    CodeMirror = app.require('libedit').CodeMirror;

    frame = self.createFrame('Code');

    textarea = ui.elem('textarea');
    frame.appendChild(textarea);

    bufferPanel = ui.elem('div', {'class': 'files-list'});
    var bufferTool = frame.createToolFrame('buffers', 'Buffers');
    bufferTool.appendChild(ui.elem('div', {'class': 'files-panel'}, [bufferPanel]));

    frame.defineAction('save', saveFile);
    frame.defineAction('new', newFile);
    frame.defineAction('close-buffer', closeBuffer);
    
    frame.bindKey('c-s', 'save');
    
    var menu = frame.addMenu('Code');
    menu.addItem('New', 'new');
    menu.addItem('Save', 'save');
    menu.addItem('Close buffer', 'close-buffer');
    menu.addItem('Close', 'close');
    
    frame.onClose = close;
    frame.onResize = resizeView;
    frame.isUnsaved = isUnsaved;

    self.onOpen = function (args) {
        if (!frame.isOpen) {
            frame.open();
            open(args);
        } else {
            frame.requestFocus();
            if (args.hasOwnProperty('path')) {
                reopen(args);
            }
        }
    };
});
