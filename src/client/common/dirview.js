/*
 * TEXTSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';
import * as util from './util';
import * as paths from './paths';

export default function DirView() {
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

util.eventify(DirView.prototype);

DirView.prototype.reload = function (paths = null) {
    if (!paths) {
        this.columns[this.stack.length - 1].reload();
    } else {
        this.columns.forEach(column => {
            if (paths.indexOf(column.path) >= 0) {
                column.reload();
            }
        });
    }
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

DirView.prototype.upload = function () {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.click();
    fileInput.onchange = () => {
        var files = fileInput.files;
        var data = new FormData();
        for (var i = 0; i < files.length; i++) {
            data.append('files[]', files[i]);
        }
        TEXTSTEP.post('content', {path: this.cwd}, data).then(() => {
            this.reload();
        }).finally(() => {
            fileInput.outerHTML = '';
        });
        return false;
    };
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

DirView.prototype.clearSelection = function () {
    this.selection = [];
    this.columns[this.stack.length - 1].setSelection(this.selection);
    this.fire('selectionChanged', this.selection);
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

    this.elem.addEventListener('dragenter', e => {
        e.stopPropagation();
    });

    this.elem.addEventListener('dragleave', e => {
        this.elem.classList.remove('accept');
    });

    this.elem.addEventListener('dragover', e => {
        e.preventDefault();
        let type = e.dataTransfer.types.find(t => t === 'Files' || t === 'application/x-textstep-path');
        if (this.files !== null && type) {
            if (type === 'Files' || e.ctrlKey) {
                e.dataTransfer.dropEffect = 'copy';
            } else {
                e.dataTransfer.dropEffect = 'move';
            }
            e.stopPropagation();
            this.elem.classList.add('accept');
        }
    });

    this.elem.addEventListener('dragend', e => {
        e.preventDefault();
    });

    this.elem.addEventListener('drop', e => {
        e.preventDefault();
        this.elem.classList.remove('accept');
        if (this.files === null) {
            return;
        }
        let type = e.dataTransfer.types.find(t => t === 'Files' || t === 'application/x-textstep-path');
        if (type === 'Files') {
            let files = e.dataTransfer.files;
            if (!files.length) {
                return;
            }
            let data = new FormData();
            for (var i = 0; i < files.length; i++) {
                data.append('files[]', files[i]);
            }
            TEXTSTEP.post('content', {path: this.path}, data).then(() => {
                this.reload();
            }); // TODO: frame.alert() on error
        } else if (type === 'application/x-textstep-path') {
            let path = e.dataTransfer.getData('application/x-textstep-path');
            TEXTSTEP.post(e.ctrlKey ? 'copy' : 'move', {}, {
                path: path,
                destination: paths.convert(paths.fileName(path), this.path)
            }).then(() => this.dirView.reload([paths.dirName(path), this.path]));
        }
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

DirColumn.prototype.reload = function () {
    if (this.files !== null) {
        this.listElem.innerHTML = '';
        this.files = null;
        this.list = null;
    }
    TEXTSTEP.get('file', {path: this.path, list: true}).then(data => {
        if (data.type === 'directory' && typeof data.files !== 'undefined') {
            this.listElem.innerHTML = '';
            this.files = {};
            this.list = [];
            data.files.sort(function(a, b) {
                // TODO: optional sorting of directories before files
                if ((a.type === 'directory') !== (b.type === 'directory')) {
                    if (a.type === 'directory') {
                        return -1;
                    } else {
                        return 1;
                    }
                }
                var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                } else if (nameA > nameB) {
                    return 1;
                } else {
                    return 0;
                }
            });
            for (var i = 0; i < data.files.length; i++) {
                var file = new DirFile(this, data.files[i]);
                this.list.push(file);
                this.files[file.path] = file;
                this.listElem.appendChild(file.elem);
            }
            for (var i = 0; i < this.selection.length; i++) {
                if (this.files.hasOwnProperty(this.selection[i])) {
                    this.files[this.selection[i]].setSelected(true);
                }
            }
        }
    });
};

DirColumn.prototype.show = function () {
    this.elem.style.display = 'block';
    if (this.files === null && this.path !== null) {
        this.reload();
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

    this.elem = ui.elem('a', {
        'draggable': true,
        'href': TEXTSTEP.url('content/' + this.name, {path: this.path})
    }, [this.name]);
    this.elem.addEventListener('touchend', e => {
        e.preventDefault();
        if (this.column.dirView.touchSelectMode) {
            if (this.selected) {
                this.column.dirView.removeSelection(this.path);
            } else {
                this.column.dirView.addSelection(this.path);
            }
        } else {
            this.column.dirView.open(this.path);
        }
    });
    ui.onLongPress(this.elem, e => {
        e.preventDefault();
        e.stopPropagation();
        this.column.dirView.touchSelectMode = true;
    });
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
                if (this.path === other) {
                    if (!this.selected) {
                        this.column.dirView.addSelection(file.path);
                    }
                } else {
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
                + location.origin + TEXTSTEP.url('content', {path: this.path});
        e.dataTransfer.setData('DownloadURL', download);
        e.dataTransfer.setData('application/x-textstep-path', this.path);
        e.dataTransfer.effectAllowed = 'copyMove';
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

