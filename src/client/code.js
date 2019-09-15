/*
 * TEXTSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

let paths = TEXTSTEP.paths;
let ui = TEXTSTEP.ui;

let CodeMirror = null;

let self = null;
let frame = null;
let textarea = null;
let current = null;
let buffers = {};
let bufferPanel = null;
let codemirror = null;

let nextUntitled = 1;

function createBuffer(path) {
    let name, cwd, data;
    if (path) {
        name = paths.fileName(path);
        cwd = paths.dirName(path);
        data = null;
    } else {
        path = 'Untitled ' + nextUntitled;
        name = path;
        nextUntitled++;
        cwd = null;
        data = '';
    }
    let item = ui.elem('a', {'class': 'file'}, [name]);
    item.onclick = function () {
        reopen({path: path});
    };
    bufferPanel.appendChild(item);
    let buffer = {
        path: path,
        name: name,
        cwd: cwd,
        item: item,
        data: data,
        loaded: false,
        unsaved: false,
        history: null
    };
    buffers[path] = buffer;
    if (current !== null) {
        current.item.className = 'file';
    }
    current = buffer;
    current.item.className = 'file active';
    if (buffer.cwd) {
        TEXTSTEP.get('content', {path: path}, 'text').then(function (data) {
            buffer.data = data;
            if (current === buffer) {
                openBuffer(path);
            }
        }, error => {
            frame.alert('Error', error.message);
            buffer.data = '';
            if (current === buffer) {
                openBuffer(path);
            }
        });
    } else {
        openBuffer(path);
    }
}

function openBuffer(path) {
    if (buffers.hasOwnProperty(path)) {
        if (current !== null) {
            current.item.className = 'file';
        }
        current = buffers[path];
        current.item.className = 'file active';
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
                frame.setTitle(current.path + ' (*) – Code');
            } else {
                frame.setTitle(current.path + ' – Code');
            }
        } else {
            frame.setTitle(current.path + ' (...) – Code');
        }
        return true;
    }
    return false;
}

function open(args) {
    let path = null;
    if (args.path && args.path.startsWith('/')) {
        path = args.path;
    }
    textarea.value = '';
    textarea.focus();
    if (path) {
        frame.setTitle(path + ' (...) – Code');
    } else {
        frame.setTitle('Code');
    }
    
    codemirror = CodeMirror.fromTextArea(textarea, {
        lineNumbers: true,
        lineWrapping:  true, // TODO: config
    });

    codemirror.on('changes', function () {
        if (current !== null && current.data !== null) {
            current.unsaved = true;
            current.item.textContent = current.name + ' (*)';
            current.data = codemirror.getValue();
            current.history = codemirror.getHistory();
            frame.setTitle(current.path + ' (*) – Code');
        }
    });
    
    createBuffer(path);
}


function reopen(args) {
    var path = args.path;
    frame.setTitle(path + ' (...) – Code');
    textarea.value = '';

    if (!openBuffer(path)) {
        createBuffer(path);
    }
}

function confirmClose() {
    for (var path in buffers) {
        if (buffers.hasOwnProperty(path) && buffers[path].unsaved) {
            if (current === null || !current.unsaved) {
                openBuffer(path);
            }
            return frame.confirm('Code', 'One or more buffers contain unsaved changes.',
                ['Close without saving', 'Cancel'], 1).then(choice => {
                    return choice === 0;
                });
        }
    }
    return Promise.resolve(true);
}

function close() {
    codemirror.toTextArea();
    codemirror = null;
    buffers = [];
    bufferPanel.innerHTML = '';
    self.close();
}

function saveFileAs() {
    if (codemirror !== null && current !== null) {
        let buffer = current;
        let directory = '/';
        if (buffer.cwd) {
            directory = buffer.cwd;
        }
        return frame.saveFile('Save as', directory).then(path => {
            if (!path) {
                return false;
            }
            return TEXTSTEP.put('content', {path: path}, new TEXTSTEP.RequestData(buffer.data, 'text/plain')).then(function () {
                buffer.path = path;
                buffer.name = paths.fileName(path);
                buffer.cwd = paths.dirName(path);
                buffer.unsaved = false;
                buffer.item.textContent = buffer.name;
                if (current === buffer) {
                    frame.setTitle(current.path + ' – Code');
                }
                return true;
            }, error => {
                frame.alert('Save failed', 'The file could not be saved: ' + error.message, error)
                return Promise.reject();
            });
        });
    }
    return Promise.reject('Editor not initialized');
}

function saveFile() {
    if (codemirror !== null && current !== null) {
        if (!current.cwd) {
            return saveFileAs();
        }
        let buffer = current;
        return TEXTSTEP.put('content', {path: buffer.path}, new TEXTSTEP.RequestData(buffer.data, 'text/plain')).then(function () {
            buffer.unsaved = false;
            buffer.item.textContent = buffer.name;
            if (current === buffer) {
                frame.setTitle(current.path + ' – Code');
            }
            return true;
        }, error => {
            frame.alert('Save failed', 'The file could not be saved: ' + error.message, error)
            return Promise.reject();
        });
    }
    return Promise.reject('Editor not initialized');
}

function reloadFile() {
    if (codemirror !== null && current !== null && current.cwd) {
        let buffer = current;
        let promise;
        if (buffer.unsaved) {
            promise = frame.confirm('Code', 'The buffer contains unsaved changes.',
                ['Reload without saving', 'Cancel'], 1).then(choice => {
                    return choice === 0;
                });
        } else {
            promise = Promise.resolve(true);
        }
        promise.then(ok => {
            if (ok) {
                TEXTSTEP.get('content', {path: buffer.path}, 'text/plain').then(data => {
                    buffer.unsaved = false;
                    buffer.item.textContent = buffer.name;
                    buffer.data = data;
                    if (current === buffer) {
                        openBuffer(buffer.path);
                    }
                });
            }
        });
    }
}


function closeBuffer() {
    if (codemirror !== null && current !== null) {
        let ok;
        if (current.unsaved) {
            ok = frame.confirm('Code', 'Do you want to save the buffer before closing?',
                ['Yes', 'No', 'Cancel'], 0).then(choice => {
                    if (choice === 0) {
                        return saveFile();
                    }
                    return choice === 'No';
                });
        } else {
            ok = Promise.resolve(true);
        }
        ok.then(close => {
            if (close) {
                delete(buffers[current.path]);
                bufferPanel.removeChild(current.item);
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
        });
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
    createBuffer(null);
}

function openFile() {
    frame.file('Open file').then(function (choice) {
        if (choice !== null && choice.length === 1) {
            reopen({path: choice[0]});
        }
    });
}

function resizeView() {
    codemirror.refresh();
}

TEXTSTEP.initApp('code', ['libedit'], function (app) {
    self = app;
    CodeMirror = app.require('libedit').CodeMirror;

    app.dockFrame.innerHTML = '';
    app.dockFrame.appendChild(TEXTSTEP.getIcon('code-editor', 32));

    frame = self.createFrame('Code');
    frame.inner.className += ' editor-frame-body libedit-codemirror';

    textarea = ui.elem('textarea');
    frame.append(textarea, {grow: 1});

    bufferPanel = ui.elem('div', {'class': 'files-list'});
    var bufferTool = frame.createToolFrame('buffers', 'Buffers');
    bufferTool.appendChild(ui.elem('div', {'class': 'files-panel'}, [bufferPanel]));

    frame.defineAction('save', saveFile);
    frame.defineAction('save-as', saveFileAs);
    frame.defineAction('new', newFile);
    frame.defineAction('open', openFile);
    frame.defineAction('reload', reloadFile);
    frame.defineAction('close-buffer', closeBuffer);
    
    frame.bindKey('c-s', 'save');
    
    var menu = frame.addMenu('Code');
    menu.addItem('New', 'new');
    menu.addItem('Open', 'open');
    menu.addItem('Save', 'save');
    menu.addItem('Save as', 'save-as');
    menu.addItem('Reload', 'reload');
    menu.addItem('Close buffer', 'close-buffer');
    menu.addItem('Close', 'close');
    
    frame.confirmClose = confirmClose;
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
            } else {
                self.setArgs({path: current.path});
            }
        }
    };
});
