/*
 * TEXTSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';
import * as util from './util';
import * as paths from './paths';
import Hammer from 'hammerjs';

export class DirView extends ui.Component {
    constructor() {
        super();
        this.focusable = true;
        this.outer.className = 'files-columns';

        this.columns = [];
        this.currentColumn = null;
        this.preview = null;
        this.cwd = null;
        this.stack = [];
        this.previousStackSize = 0;
        this.stackOffset = 0;
        this.files = {};
        this.selection = [];
        this.touchSelectMode = false;

        this.multiSelect = true;
        this.touchOpen = true;
        this.showEmptyColumns = false;
        this.showPreview = true;

        this.outer.addEventListener('keydown', e => {
            switch (e.key) {
                case 'ArrowDown':
                    this.selectNext();
                    break;
                case 'ArrowUp':
                    this.selectPrevious();
                    break;
                case 'ArrowLeft':
                    this.goUp();
                    break;
                case 'ArrowRight':
                    if (this.selection.length === 1) {
                        this.open(this.selection[0]);
                    }
                    break;
                default:
                    return;
            }
            e.preventDefault();
            return false;
        });
    }

    reload(paths = null) {
        if (!paths) {
            this.columns[this.stack.length - 1].reload();
        } else {
            this.columns.forEach(column => {
                if (paths.indexOf(column.path) >= 0) {
                    column.reload();
                }
            });
        }
    }

    cd(path) {
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
        this.trigger('selectionChanged', this.selection);
        this.trigger('cwdChanged', this.cwd);
        this.updateColumns();
    }

    goUp() {
        if (this.stack.length > 1) {
            let previous = this.stack.pop();
            this.cwd = this.stack[this.stack.length - 1];
            this.touchSelectMode = false;
            this.selection = [previous];
            this.trigger('selectionChanged', this.selection);
            this.trigger('cwdChanged', this.cwd);
            this.updateColumns();
        } else {
            this.clearSelection();
        }
    }

    open(path) {
        this.trigger('fileOpen', path);
    }

    upload() {
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
    }

    setSelection(path) {
        var dir = paths.dirName(path);
        if (this.cwd !== dir) {
            this.cd(dir);
        }
        this.selection = [path];
        var files = this.columns[this.stack.length - 1].setSelection(this.selection);
        if (files.length) {
            files[0].bringIntoView();
        }
        if (this.preview) {
            this.preview.preview(files);
        }
        this.trigger('selectionChanged', this.selection);
    }

    addSelection(path) {
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
        var files = this.columns[this.stack.length - 1].setSelection(this.selection);
        if (this.preview) {
            this.preview.preview(files);
        }
        this.trigger('selectionChanged', this.selection);
    }

    removeSelection(path) {
        for (var i = 0; i < this.selection.length; i++) {
            if (this.selection[i] === path) {
                this.selection.splice(i, 1);
                var files = this.columns[this.stack.length - 1].setSelection(this.selection);
                if (this.preview) {
                    this.preview.preview(files);
                }
                this.trigger('selectionChanged', this.selection);
                break;
            }
        }
    }

    selectNext() {
        let files = this.columns[this.stack.length - 1].list;
        if (files && files.length) {
            for (let i = 0; i < files.length; i++) {
                if (files[i].selected) {
                    if (i + 1 < files.length) {
                        this.setSelection(files[i + 1].path);
                    }
                    return;
                }
            }
            this.setSelection(files[0].path);
        }
    }

    selectPrevious() {
        let files = this.columns[this.stack.length - 1].list;
        if (files && files.length) {
            for (let i = 0; i < files.length; i++) {
                if (files[i].selected) {
                    if (i > 0) {
                        this.setSelection(files[i - 1].path);
                    }
                    return;
                }
            }
            this.setSelection(files[files.length - 1].path);
        }
    }

    clearSelection() {
        this.selection = [];
        var files = this.columns[this.stack.length - 1].setSelection(this.selection);
        if (this.preview) {
            this.preview.preview(files);
        }
        this.trigger('selectionChanged', this.selection);
    }

    update() {
        this.updateColumns();
    }

    updateColumns() {
        var rect = this.outer.getBoundingClientRect();
        var maxColumns = Math.max(1, Math.floor(rect.width / 200));
        let preview = false;
        if (this.showPreview && maxColumns > 1) {
            preview = true;
            maxColumns--;
        }
        if (this.preview) {
            this.outer.removeChild(this.preview.elem);
            this.preview = null;
        }
        this.stackOffset = Math.max(0, this.stack.length - maxColumns);
        var n = Math.max(maxColumns, this.stack.length);
        if (this.columns.length > n) {
            this.columns.splice(n).forEach(function (column) {
                this.outer.removeChild(column.elem);
            }, this);
        }
        let selectedFiles = [];
        for (var i = 0; i < n; i++) {
            var column;
            if (i < this.stack.length) {
                if (i < this.columns.length) {
                    column = this.columns[i];
                    if (column.path !== this.stack[i]) {
                        this.columns.splice(i).forEach(function (column) {
                            this.outer.removeChild(column.elem);
                        }, this);
                        column = new DirColumn(this, this.stack[i]);
                        this.columns.push(column);
                        this.outer.appendChild(column.elem);
                    }
                } else {
                    column = new DirColumn(this, this.stack[i]);
                    this.columns.push(column);
                    this.outer.appendChild(column.elem);
                }
            } else if (this.showEmptyColumns) {
                if (i < this.columns.length) {
                    column = this.columns[i];
                    if (column.path !== null) {
                        this.columns.splice(i).forEach(function (column) {
                            this.outer.removeChild(column.elem);
                        }, this);
                        column = new DirColumn(this, null);
                        this.columns.push(column);
                        this.outer.appendChild(column.elem);
                    }
                } else {
                    column = new DirColumn(this, null);
                    this.columns.push(column);
                    this.outer.appendChild(column.elem);
                }
            } else {
                if (i < this.columns.length) {
                    this.columns.splice(i).forEach(function (column) {
                        this.outer.removeChild(column.elem);
                    }, this);
                }
                break;
            }

            if (i + 1 < this.stack.length) {
                column.setSelection([this.stack[i + 1]]);
            } else if (i === this.stack.length - 1) {
                selectedFiles = column.setSelection(this.selection);
            }

            if (i < this.stackOffset) {
                column.hide();
            } else {
                column.show();
            }
        }
        if (preview) {
            this.preview = new PreviewColumn(this);
            this.preview.preview(selectedFiles);
            this.outer.appendChild(this.preview.elem);
        }
    }
}

class DirColumn {
    constructor(dirView, path) {
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

    setSelection(paths) {
        if (this.files !== null) {
            for (var i = 0; i < this.selection.length; i++) {
                if (this.files.hasOwnProperty(this.selection[i])) {
                    this.files[this.selection[i]].setSelected(false);
                }
            }
        }
        this.selection = paths.slice();
        let selected = [];
        if (this.files !== null) {
            for (var i = 0; i < this.selection.length; i++) {
                if (this.files.hasOwnProperty(this.selection[i])) {
                    this.files[this.selection[i]].setSelected(true);
                    selected.push(this.files[this.selection[i]]);
                }
            }
        }
        return selected;
    }

    reload() {
        if (this.files !== null) {
            this.listElem.innerHTML = '';
            this.files = null;
            this.list = null;
        }
        this.elem.classList.add('loading');
        TEXTSTEP.get('file', {path: this.path, list: true}).then(data => {
            if (data.path !== this.path) {
                return;
            }
            this.elem.classList.remove('loading');
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
                let selectedFiles = [];
                for (var i = 0; i < this.selection.length; i++) {
                    if (this.files.hasOwnProperty(this.selection[i])) {
                        this.files[this.selection[i]].setSelected(true);
                        selectedFiles.push(this.files[this.selection[i]]);
                    }
                }
                if (this.path === this.dirView.cwd && this.dirView.preview) {
                    this.dirView.preview.preview(selectedFiles);
                }
            } else {
                this.dirView.setSelection(this.path);
            }
        });
    }

    show() {
        this.elem.style.display = '';
        if (this.files === null && this.path !== null) {
            this.reload();
        }
    }

    hide() {
        this.elem.style.display = 'none';
    }
}

class PreviewColumn extends DirColumn {
    constructor(dirView) {
        super(dirView, null);
        this.previewElem = ui.elem('div', {class: 'file-preview'});
        this.elem.appendChild(this.previewElem);
    }

    createFileData(elem, file) {
        elem.appendChild(ui.elem('div', {'class': 'file-name'}, [file.name]));
        let data = new ui.Grid();
        data.outer.classList.add('file-data');
        data.columns = 'min-content auto';
        data.rowPadding = true;
        data.columnPadding = true;
        elem.appendChild(data.outer);

        data.append(ui.elem('div', {'class': 'label'}, ['Size']));
        data.append(ui.elem('div', {}, ['' + util.humanSize(file.data.size)]));

        data.append(ui.elem('div', {'class': 'label'}, ['Modified']));
        data.append(ui.elem('div', {}, [util.parseDate(file.data.modified).toLocaleString('en-GB')]));

        let joinGroups = permission => {
            if (file.data.permissions[permission]) {
                return file.data.permissions[permission].join(', ');
            } else {
                return '\u2013';
            }
        };
        data.append(ui.elem('div', {'class': 'label'}, ['Read']));
        data.append(ui.elem('div', {}, [joinGroups('read')]));
        data.append(ui.elem('div', {'class': 'label'}, ['Write']));
        data.append(ui.elem('div', {}, [joinGroups('write')]));
        data.append(ui.elem('div', {'class': 'label'}, ['Grant']));
        data.append(ui.elem('div', {}, [joinGroups('grant')]));
    }

    preview(files) {
        this.listElem.innerHTML = '';
        this.previewElem.innerHTML = '';
        this.previewElem.style.display = 'none';
        this.files = null;
        this.list = null;
        this.path = null;
        if (files.length > 1) {
            let preview = ui.elem('div', {class: 'file-preview'});
            this.listElem.appendChild(preview);
            preview.appendChild(ui.elem('div', {'class': 'file-name'}, [files.length + ' files selected']));
        } else if (files.length === 1) {
            let file = files[0];
            this.path = file.path;
            if (file.type === 'directory') {
                this.previewElem.style.display = '';
                this.createFileData(this.previewElem, file);
                this.path = file.path;
                this.reload();
            } else {
                let preview = ui.elem('div', {class: 'file-preview'});
                this.listElem.appendChild(preview);
                let type = paths.fileExt(files[0].name).toLowerCase();
                let src;
                switch (type) {
                    case 'jpeg':
                    case 'jpg':
                    case 'png':
                    case 'ico':
                        src = TEXTSTEP.url('thumbnail', {
                            path: files[0].path,
                            width: 200,
                            height: 200
                        });
                        preview.appendChild(ui.elem('div', {'class': 'file-thumbnail'}, [
                            ui.elem('img', {src: src})
                        ]));
                        break;
                    case 'svg':
                        src = TEXTSTEP.url('content', {
                            path: files[0].path
                        });
                        preview.appendChild(ui.elem('div', {'class': 'file-thumbnail'}, [
                            ui.elem('img', {src: src})
                        ]));
                        break;
                    default:
                        preview.appendChild(ui.elem('div', {'class': 'file-icon'}, [
                            TEXTSTEP.getFileIcon(type, 64)
                        ]));
                        break;
                }
                this.createFileData(preview, file);
            }
        }
    }
}

class DirFile {
    constructor(column, data) {
        this.column = column;
        this.data = data;
        this.name = data.name;
        this.path = data.path;
        this.type = data.type;
        this.selected = false;

        this.elem = ui.elem('a', {
            'draggable': true,
            'href': TEXTSTEP.url('content/' + this.name, {path: this.path})
        });
        this.mc = new Hammer(this.elem);

        if (this.type === 'directory') {
            this.icon = TEXTSTEP.getIcon('file-directory', 16);
        } else {
            this.icon = TEXTSTEP.getFileIcon(paths.fileExt(this.name), 16);
        }
        this.elem.appendChild(this.icon);
        this.label = ui.elem('span', {class: 'label'}, [this.name]);
        this.elem.appendChild(this.label);

        this.elem.ondragleave = e => {
            e.stopPropagation();
        };
        this.mc.on('tap', e => {
            if (e.pointerType === 'mouse') {
                if (e.srcEvent.ctrlKey && this.column.dirView.multiSelect) {
                    if (this.selected) {
                        this.column.dirView.removeSelection(this.path);
                    } else {
                        this.column.dirView.addSelection(this.path);
                    }
                } else if (e.srcEvent.shiftKey && this.column.dirView.multiSelect) {
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
                } else if (!this.column.dirView.preview && this.type === 'directory') {
                    this.column.dirView.cd(this.path);
                } else {
                    this.column.dirView.setSelection(this.path);
                }
            } else {
                if (this.column.dirView.touchSelectMode) {
                    if (this.selected) {
                        this.column.dirView.removeSelection(this.path);
                        if (!this.column.dirView.selection.length) {
                            this.column.dirView.touchSelectMode = false;
                        }
                    } else {
                        this.column.dirView.addSelection(this.path);
                    }
                } else {
                    this.column.dirView.open(this.path);
                }
            }
        });
        ui.onLongPress(this.elem, e => {
            e.preventDefault();
            e.stopPropagation();
            if (this.column.dirView.multiSelect) {
                this.column.dirView.touchSelectMode = true;
                if (this.selected) {
                    this.column.dirView.removeSelection(this.path);
                    if (!this.column.dirView.selection.length) {
                        this.column.dirView.touchSelectMode = false;
                    }
                } else {
                    this.column.dirView.addSelection(this.path);
                }
            }
        });
        this.elem.onmouseover = () => {
            if (this.label.scrollWidth > this.label.offsetWidth) {
                this.elem.title = this.name;
            } else {
                this.elem.title = '';
            }
        };
        this.elem.onclick = (e) => {
            e.preventDefault();
            return false;
        };
        this.elem.ondblclick = () => {
            if (!this.column.dirView.touchSelectMode) {
                this.column.dirView.open(this.path);
            }
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

    updateElement() {
        this.elem.className = 'file';
        if (this.type === 'directory') {
            this.elem.className += ' file-directory';
            let oldIcon = this.icon;
            if (this.selected) {
                this.icon = TEXTSTEP.getIcon('file-directory-open', 16);
            } else {
                this.icon = TEXTSTEP.getIcon('file-directory', 16);
            }
            this.elem.replaceChild(this.icon, oldIcon);
        }
        if (this.selected) {
            this.elem.className += ' active';
        }
        if (!this.data.read) {
            this.elem.className += ' locked';
        }
    }

    setSelected(selected) {
        this.selected = selected;
        this.updateElement();
    }

    bringIntoView() {
        let y = this.elem.offsetTop - this.column.listElem.offsetTop;
        if (y < this.column.listElem.scrollTop) {
            this.column.listElem.scrollTop = y;
        } else {
            y += this.elem.offsetHeight;
            if (y > this.column.listElem.clientHeight + this.column.listElem.scrollTop) {
                this.column.listElem.scrollTop = y - this.column.listElem.clientHeight;
            }
        }
    }
}

