/*
 * TEXTSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var paths = TEXTSTEP.paths;
var ui = TEXTSTEP.ui;

var SimpleMDE = null;

var self = null;
var frame = null;
var textarea = null;
var current = null;
var buffers = {};
var bufferPanel = null;
var simplemde = null;

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
        history: null,
        scrollInfo: null
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
            current.scrollInfo = simplemde.codemirror.getScrollInfo();
        }
        current = buffers[path];
        current.item.className = 'file file-md active';
        if (current.data !== null) {
            self.setArgs({ path: path });
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
                frame.setTitle(current.path + ' (*) – Write');
            } else {
                frame.setTitle(current.path + ' – Write');
            }
            if (current.scrollInfo !== null) {
                console.log(current.scrollInfo);
                simplemde.codemirror.scrollTo(current.scrollInfo.left, current.scrollInfo.top);
            }
        } else {
            frame.setTitle(current.path + ' (...) – Write');
        }
        return true;
    }
    return false;
}

function open(args) {
    var path = args.path;
    textarea.value = '';
    frame.setTitle(path + ' (...) – Write');

    simplemde = new SimpleMDE({
        autofocus: true,
        element: textarea,
        renderingConfig: {
            codeSyntaxHighlighting: true
        },
        previewRender: function (text) {
            var html = SimpleMDE.prototype.markdown(text);
            return html.replace(/src\s*=\s*"([^"]*)"/ig, function (match, url) {
                return 'src="' + TEXTSTEP.url('download', {path: paths.convert(url, current.cwd)}) + '"';
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
            current.item.textContent = current.name + ' (*)';
            current.data = simplemde.value();
            current.history = simplemde.codemirror.getHistory();
            frame.setTitle(current.path + ' (*) – Write');
        }
    });

    createBuffer(path);
}

function reopen(args) {
    var path = args.path;
    frame.setTitle(path + ' (...) – Write');
    textarea.value = '';

    if (!openBuffer(path)) {
        createBuffer(path);
    }
}

function confirmClose() {
    var unsaved = null;
    for (var path in buffers) {
        if (buffers.hasOwnProperty(path) && buffers[path].unsaved) {
            unsaved = path;
            break;
        }
    }
    if (unsaved) {
        if (current === null || !current.unsaved) {
            openBuffer(unsaved);
        }
        return frame.confirm('Write', 'One or more buffers contain unsaved changes.', ['Close without saving', 'Cancel'], 'Cancel').then(function (choice) {
            return choice === 'Close without saving';
        });
    } else {
        return Promise.resolve(true);
    }
}

function close() {
    simplemde.toTextArea();
    simplemde = null;
    buffers = [];
    bufferPanel.innerHTML = '';
    self.close();
}

function saveFile() {
    if (simplemde !== null && current !== null) {
        let buffer = current;
        return TEXTSTEP.post('write', {}, {path: buffer.path, data: buffer.data}).then(function () {
            buffer.unsaved = false;
            buffer.item.textContent = buffer.name;
            if (current === buffer) {
                frame.setTitle(current.path + ' – Write');
                simplemde.clearAutosavedValue();
            }
        });
    } else {
        return Promise.resolve();
    }
}

function closeBuffer() {
    if (simplemde !== null && current !== null) {
        let ok;
        if (current.unsaved) {
            ok = frame.confirm('Write', 'Do you want to save the buffer before closing?', ['Yes', 'No', 'Cancel'],
                'Yes').then(choice => {
                    if (choice === 'Yes') {
                        return saveFile().then(() => true);
                    }
                    return choice === 'No';
                });
        } else {
            ok = Promise.resolve(true);
        }
        ok.then(close => {
            if (close) {
                delete buffers[current.path];
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
    frame.alert('New file', 'not implemented');
}

function resizeView() {
    simplemde.codemirror.refresh();
}

TEXTSTEP.initApp('write', ['libedit'], function (app) {
    self = app;
    SimpleMDE = app.require('libedit').SimpleMDE;

    app.dockFrame.innerHTML = '';
    app.dockFrame.appendChild(TEXTSTEP.getIcon('editor', 32));

    frame = self.createFrame('Code');
    frame.className += ' editor-frame';
    frame.bodyElem.className += ' libedit-simplemde';

    textarea = ui.elem('textarea');
    frame.appendChild(textarea);

    bufferPanel = ui.elem('div', {'class': 'files-list'});
    var bufferTool = frame.createToolFrame('buffers', 'Buffers');
    bufferTool.appendChild(ui.elem('div', {'class': 'files-panel'}, [bufferPanel]));

    frame.defineAction('save', saveFile);
    frame.defineAction('new', newFile);
    frame.defineAction('close-buffer', closeBuffer);

    frame.bindKey('c-s', 'save');

    var menu = frame.addMenu('Write');
    menu.addItem('New', 'new');
    menu.addItem('Save', 'save');
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
