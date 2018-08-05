/*
 * TEXTSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';
import * as paths from './paths';

export default function DirView() {
    this.eventHandlers = {};
    this.columns = [];
    this.currentColumn = null;
    this.cwd = null;
    this.stack = [];
    this.previousStackSize = 0;
    this.stackOffset = 0;
    this.files = {};
    this.selection = [];
    this.touchSelectMode = false;

    this.elem = ui.elem('div', {'class': 'files-columns'});
}

DirView.prototype.on = function (eventType, handler) {
    if (!this.eventHandlers.hasOwnProperty(eventType)) {
        this.eventHandlers[eventType] = [];
    }
    this.eventHandlers[eventType].push(handler);
};

DirView.prototype.fire = function (eventType, eventData) {
    if (this.eventHandlers.hasOwnProperty(eventType)) {
        this.eventHandlers[eventType].forEach(function (handler) {
            handler(eventData);
        });
    }
};

DirView.prototype.refresh = function () {
};

DirView.prototype.cd = function (path) {
    var names = path.split('/');
    var path = '';
    this.stack = ['/'];
    for (var i = 0; i < names.length; i++) {
        if (names[i] === '..') {
            if (this.stack.length > 1) {
                this.stack.pop();
                path = this.stack[this.stack.length - 1];
            }
        } else if (names[i] !== '' && names[i] !== '.') {
            path += '/' + names[i];
            this.stack.push(path);
        }
    }
    this.cwd = this.stack[this.stack.length - 1];
    this.touchSelectMode = false;
    this.selection = [];
    this.fire('selectionChanged', this.selection);
    this.fire('cwdChanged', this.cwd);
    this.updateColumns();
};

DirView.prototype.goUp = function () {
    if (this.stack.length > 1) {
        this.stack.pop();
        this.cwd = this.stack[this.stack.length - 1];
        this.touchSelectMode = false;
        this.selection = [];
        this.fire('selectionChanged', this.selection);
        this.fire('cwdChanged', this.cwd);
        this.updateColumns();
    }
};

DirView.prototype.open = function (path) {
    this.fire('fileOpen', path);
};

DirView.prototype.setSelection = function (path) {
    var dir = paths.dirName(path);
    if (this.cwd !== dir) {
        this.cd(dir);
    }
    this.selection = [path];
    this.columns[this.stack.length - 1].setSelection(this.selection);
    this.fire('selectionChanged', this.selection);
};

DirView.prototype.addSelection = function (path) {
    var dir = paths.dirName(path);
    if (this.cwd !== dir) {
        var selectedDir = null;
        for (var i = 0; i < this.stack.length; i++) {
            if (this.stack[i] === dir) {
                selectedDir = this.stack[i + 1];
                break;
            }
        }
        this.cd(dir);
        if (selectedDir !== null) {
            this.selection = [selectedDir, path];
        } else {
            this.selection = [path];
        }
    } else {
        this.selection.push(path);
    }
    this.columns[this.stack.length - 1].setSelection(this.selection);
    this.fire('selectionChanged', this.selection);
};

DirView.prototype.removeSelection = function (path) {
    for (var i = 0; i < this.selection.length; i++) {
        if (this.selection[i] === path) {
            this.selection.splice(i, 1);
            this.columns[this.stack.length - 1].setSelection(this.selection);
            this.fire('selectionChanged', this.selection);
            break;
        }
    }
};

DirView.prototype.updateColumns = function () {
    var rect = this.elem.getBoundingClientRect();
    var maxColumns = Math.max(1, Math.floor(rect.width / 200));
    this.stackOffset = Math.max(0, this.stack.length - maxColumns);
    var n = Math.max(maxColumns, this.stack.length);
    if (this.columns.length > n) {
        this.columns.splice(n).forEach(function (column) {
            this.elem.removeChild(column.elem);
        }, this);
    }
    for (var i = 0; i < n; i++) {
        var column;
        if (i < this.stack.length) {
            if (i < this.columns.length) {
                column = this.columns[i];
                if (column.path !== this.stack[i]) {
                    this.columns.splice(i).forEach(function (column) {
                        this.elem.removeChild(column.elem);
                    }, this);
                    column = new DirColumn(this, this.stack[i]);
                    this.columns.push(column);
                    this.elem.appendChild(column.elem);
                }
            } else {
                column = new DirColumn(this, this.stack[i]);
                this.columns.push(column);
                this.elem.appendChild(column.elem);
            }
        } else {
            if (i < this.columns.length) {
                column = this.columns[i];
                if (column.path !== null) {
                    this.columns.splice(i).forEach(function (column) {
                        this.elem.removeChild(column.elem);
                    }, this);
                    column = new DirColumn(this, null);
                    this.columns.push(column);
                    this.elem.appendChild(column.elem);
                }
            } else {
                column = new DirColumn(this, null);
                this.columns.push(column);
                this.elem.appendChild(column.elem);
            }
        }

        if (i + 1 < this.stack.length) {
            column.setSelection([this.stack[i + 1]]);
        } else if (i === this.stack.length - 1) {
            column.setSelection(this.selection);
        }

        if (i < this.stackOffset) {
            column.hide();
        } else {
            column.show();
        }
    }
};

function DirColumn(dirView, path) {
    this.dirView = dirView;
    this.path = path;
    this.listElem = ui.elem('div', {'class': 'files-list'});
    this.elem = ui.elem('div', {'class': 'files-panel'}, [this.listElem]);

    this.list = null;
    this.files = null;
    this.selection = [];

    this.elem.addEventListener('dragenter', function () {
        // TODO
    });

    this.elem.addEventListener('dragleave', function () {
        // TODO
    });

    this.elem.addEventListener('dragover', function () {
        // TODO
    });

    this.elem.addEventListener('drop', function () {
        // TODO
    });
}

DirColumn.prototype.setSelection = function (paths) {
    if (this.files !== null) {
        for (var i = 0; i < this.selection.length; i++) {
            if (this.files.hasOwnProperty(this.selection[i])) {
                this.files[this.selection[i]].setSelected(false);
            }
        }
    }
    this.selection = paths.slice();
    if (this.files !== null) {
        for (var i = 0; i < this.selection.length; i++) {
            if (this.files.hasOwnProperty(this.selection[i])) {
                this.files[this.selection[i]].setSelected(true);
            }
        }
    }
};

DirColumn.prototype.show = function () {
    this.elem.style.display = 'block';
    if (this.files === null && this.path !== null) {
        var self = this;
        TEXTSTEP.get('list-files', {path: this.path}).then(function (data) {
            if (data.type === 'directory' && typeof data.files !== 'undefined') {
                self.files = {};
                self.list = [];
                for (var i = 0; i < data.files.length; i++) {
                    var file = new DirFile(self, data.files[i]);
                    self.list.push(file);
                    self.files[file.path] = file;
                    self.listElem.appendChild(file.elem);
                }
                for (var i = 0; i < self.selection.length; i++) {
                    if (self.files.hasOwnProperty(self.selection[i])) {
                        self.files[self.selection[i]].setSelected(true);
                    }
                }
            }
        });
    }
};

DirColumn.prototype.hide = function () {
    this.elem.style.display = 'none';
};

function DirFile(column, data) {
    this.column = column;
    this.data = data;
    this.name = data.name;
    this.path = data.path;
    this.type = data.type;
    this.selected = false;

    this.elem = ui.elem('a', {'draggable': true, 'href': '#'}, [this.name]);
    this.elem.onclick = (e) => {
        if (e.ctrlKey) {
            if (this.selected) {
                this.column.dirView.removeSelection(this.path);
            } else {
                this.column.dirView.addSelection(this.path);
            }
        } else if (e.shiftKey) {
            if (this.column.selection.length === 0) {
                this.column.dirView.setSelection(this.path);
            } else {
                var other = this.column.selection[this.column.selection.length - 1];
                var between = false;
                this.column.list.forEach(function (file) {
                    if (file.path === this.path || file.path === other) {
                        between = !between;
                    } else if (!between) {
                        return;
                    }
                    if (!file.selected) {
                        this.column.dirView.addSelection(file.path);
                    }
                }, this);
            }
        } else if (this.type === 'directory') {
            this.column.dirView.cd(this.path);
        } else {
            this.column.dirView.setSelection(this.path);
        }
        return false;
    };
    this.elem.ondblclick = () => {
        this.column.dirView.open(this.path);
    };
    this.elem.ondragstart = (e) => {
        var download = 'application/octet-stream:' + encodeURIComponent(this.name) + ':'
                + location.origin + TEXTSTEP.SERVER + '/download?path='
                + encodeURIComponent(this.path);
        e.dataTransfer.setData('DownloadURL', download);
    };
    this.updateElement();
}

DirFile.prototype.updateElement = function () {
    this.elem.className = 'file';
    this.elem.className += ' file-' + this.type;
    if (this.selected) {
        this.elem.className += ' active';
    }
    if (!this.data.read) {
        this.elem.className += ' locked';
    }
};

DirFile.prototype.setSelected = function (selected) {
    this.selected = selected;
    this.updateElement();
};

