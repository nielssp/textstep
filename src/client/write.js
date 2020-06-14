/*
 * TEXTSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var paths = TEXTSTEP.paths;
var ui = TEXTSTEP.ui;

var EasyMDE = null;

var self = null;
var frame = null;
var textarea = null;
var current = null;
var buffers = {};
var bufferPanel = null;
var editorInstance = null;

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
    TEXTSTEP.get('content', {path: path}, 'text').then(function (data) {
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
            current.scrollInfo = editorInstance.codemirror.getScrollInfo();
        }
        current = buffers[path];
        current.item.className = 'file file-md active';
        if (current.data !== null) {
            self.setArgs({ path: path });
            var data = current.data;
            current.data = null;
            editorInstance.value(data);
            current.data = data;
            if (current.history !== null) {
                editorInstance.codemirror.setHistory(current.history);
            } else {
                editorInstance.codemirror.clearHistory();
            }
            if (current.unsaved) {
                frame.setTitle(current.path + ' (*) – Write');
            } else {
                frame.setTitle(current.path + ' – Write');
            }
            if (current.scrollInfo !== null) {
                console.log(current.scrollInfo);
                editorInstance.codemirror.scrollTo(current.scrollInfo.left, current.scrollInfo.top);
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

    editorInstance = new EasyMDE({
        autofocus: true,
        element: textarea,
        renderingConfig: {
            codeSyntaxHighlighting: true
        },
        previewRender: function (text) {
            var html = editorInstance.markdown(text);
            return html.replace(/src\s*=\s*"([^"]*)"/ig, function (match, url) {
                return 'src="' + TEXTSTEP.url('content', {path: paths.convert(url, current.cwd)}) + '"';
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
            "undo",
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

    editorInstance.codemirror.on('changes', function () {
        if (current !== null && current.data !== null) {
            current.unsaved = true;
            current.item.textContent = current.name + ' (*)';
            current.data = editorInstance.value();
            current.history = editorInstance.codemirror.getHistory();
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
        return frame.confirm('Write', 'One or more buffers contain unsaved changes.', ['Close without saving', 'Cancel'], 1).then(function (choice) {
            return choice === 0;
        });
    } else {
        return Promise.resolve(true);
    }
}

function close() {
    editorInstance.toTextArea();
    editorInstance = null;
    buffers = [];
    bufferPanel.innerHTML = '';
    self.close();
}

function saveFile() {
    if (editorInstance !== null && current !== null) {
        let buffer = current;
        return TEXTSTEP.put('content', {path: buffer.path}, new TEXTSTEP.RequestData(buffer.data, 'text/plain')).then(function () {
            buffer.unsaved = false;
            buffer.item.textContent = buffer.name;
            if (current === buffer) {
                frame.setTitle(current.path + ' – Write');
                editorInstance.clearAutosavedValue();
            }
        }, error => frame.alert('Error', error.message, error));
    } else {
        return Promise.resolve();
    }
}

function closeBuffer() {
    if (editorInstance !== null && current !== null) {
        let ok;
        if (current.unsaved) {
            ok = frame.confirm('Write', 'Do you want to save the buffer before closing?', ['Yes', 'No', 'Cancel'],
                0).then(choice => {
                    if (choice === 0) {
                        return saveFile().then(() => true);
                    }
                    return choice === 1;
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
    editorInstance.codemirror.refresh();
}

TEXTSTEP.initApp('write', ['libedit'], function (app) {
    self = app;
    EasyMDE = app.require('libedit').EasyMDE;

    app.dockFrame.innerHTML = '';
    app.dockFrame.appendChild(TEXTSTEP.getIcon('editor', 32));

    frame = self.createFrame('Write');
    frame.inner.className += ' editor-frame-body libedit-easymde';

    textarea = ui.elem('textarea');
    frame.append(textarea);

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
    menu.addItem('Publish', 'publish');
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
