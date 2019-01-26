/*
 * TEXTSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var paths = TEXTSTEP.paths;
var ui = TEXTSTEP.ui;

var self;
var frame;
var dirView;

function newFile() {
    frame.prompt('New file', 'Enter filename:').then(function (name) {
        if (name !== null) {
            if (name === '') {
                frame.alert('Invalid name', 'The filename cannot be empty');
                return;
            }
            var path = dirView.cwd;
            if (path !== '/') {
                path += '/';
            }
            path += name;
            TEXTSTEP.post('make-file', {path: path}).then(function (data) {
                dirView.setSelection(path);
                dirView.reload();
            });
        }
    });
}

function download() {
    for (var i = 0; i < dirView.selection.length; i++) {
        var path = dirView.selection[i];
        var name = paths.fileName(path);
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = TEXTSTEP.url('download/' + encodeURIComponent(name), {
            force: true,
            path: path
        });
        iframe.onload = () => {
            // TODO: this is never called...
            console.log('download finished');
            iframe.remove();
        };
        document.body.appendChild(iframe);
    }
}

function rename() {
    if (dirView.selection.length !== 1) {
        frame.alert('Multiple files selected', 'It is not possible to rename multiple files');
        return;
    }
    var path = dirView.selection[0];
    
    frame.prompt('Rename', 'Enter filename:', paths.fileName(path)).then(function (name) {
        if (name !== null) {
            if (name === '') {
                frame.alert('Invalid name', 'The filename cannot be empty');
                return;
            }
            var destination = paths.convert(name, paths.dirName(path));
            TEXTSTEP.post('move', { path: path, destination: destination }).then(function (data) {
                dirView.setSelection(destination);
                dirView.reload();
            });
        }
    });
}

function trash() {
    var confirmation;
    var data = {};
    if (dirView.selection.length === 1) {
        confirmation = 'Permanently delete "' + dirView.selection[0] + '"?';
        data.path = dirView.selection[0];
    } else {
        confirmation = 'Permanently delete the ' + dirView.selection.length + ' selected files?';
        data.paths = dirView.selection;
    }
    frame.confirm('Files', confirmation, ['Delete', 'Cancel'], 'Delete').then(function (choice) {
        if (choice === 'Delete') {
            TEXTSTEP.post('delete', data).then(function (data) {
                dirView.clearSelection();
                dirView.reload();
            });
        }
    });
}


TEXTSTEP.initApp('files', function (app) {
    self = app;

    app.dockFrame.innerHTML = '';
    app.dockFrame.appendChild(TEXTSTEP.getIcon('files', 32));

    frame = self.createFrame('Files');
    frame.contentElem.className += ' frame-content-flex';
    dirView = new ui.DirView();
    frame.appendChild(dirView.elem);

    frame.defineAction('go-up', () => dirView.goUp(), ['nav']);
    frame.defineAction('root', () => dirView.cd('/'), ['nav']);
    frame.defineAction('reload', () => dirView.reload(), ['nav']);

    frame.defineAction('new-file', newFile, ['dir']);
    frame.defineAction('upload', () => dirView.upload(), ['dir']);

    frame.defineAction('download', download, ['selection']);
    frame.defineAction('rename', rename, ['selection']);
    frame.defineAction('trash', trash, ['selection']);

    var toolbar = frame.createToolbar();
    toolbar.createGroup()
      .addItem('Go up', 'go-up', 'go-up')
      .addItem('Go to root', 'go-home', 'root')
      .addItem('Reload', 'reload', 'reload');

    toolbar.addSeparator();

    toolbar.createGroup()
      .addItem('New file', 'edit-new-file', 'new-file');
    toolbar.createGroup()
      .addItem('Upload file', 'edit-upload', 'upload');

    toolbar.addSeparator();

    toolbar.createGroup()
      .addItem('Download', 'edit-copy', 'download')
      .addItem('Rename', 'edit-rename', 'rename')
      .addItem('Delete seleciton', 'edit-trash', 'trash');

    dirView.on('fileOpen', function (path) {
        TEXTSTEP.open(path);
    });

    dirView.on('cwdChanged', function (path) {
        self.setArgs({path: path});
    });

    dirView.on('selectionChanged', function (selection) {
        if (selection.length > 0) {
            frame.enableGroup('selection');
        } else {
            frame.disableGroup('selection');
        }
    });

    /*
    frame.defineAction('back', back, ['nav']);
    frame.defineAction('foreward', forward, ['nav']);
    frame.defineAction('up', goUp, ['nav']);
    frame.defineAction('home', home, ['nav']);
    frame.defineAction('new-folder', newFolder, ['dir']);
    frame.defineAction('new-file', newFile, ['dir']);
    frame.defineAction('upload', upload, ['dir']);
    frame.defineAction('terminal', terminal, ['selection-single']);
    frame.defineAction('rename', rename, ['selection-single']);
    frame.defineAction('trash', trash, ['selection']);
    frame.defineAction('download', download, ['selection']);
    frame.defineAction('cut', cut, ['selection']);
    frame.defineAction('copy', copy, ['selection']);
    frame.defineAction('paste', paste, ['dir']);
    frame.defineAction('select-all', selectAll, ['dir']);
    frame.defineAction('remove-selection', function () {
        if (selection.length === 1 && selection[0] === selectionRoot) {
            return;
        }
        removeSelection();
    }, ['dir']);
    frame.defineAction('focus-prev', focusPrev, ['nav']);
    frame.defineAction('focus-next', focusNext, ['nav']);
    frame.defineAction('enter', focusEnter, ['nav']);
    frame.defineAction('exit', focusExit, ['nav']);
    
    frame.bindKey('F2', 'rename');
    frame.bindKey('C-C', 'copy');
    frame.bindKey('C-X', 'cut');
    frame.bindKey('C-V', 'paste');
    frame.bindKey('Delete', 'trash');

    frame.bindKey('C-A', 'select-all');
    frame.bindKey('Escape', 'remove-selection');

    frame.bindKey('C-H', 'exit');
    frame.bindKey('C-K', 'focus-prev');
    frame.bindKey('C-J', 'focus-next');
    frame.bindKey('C-L', 'enter');
    frame.bindKey('ArrowLeft', 'exit');
    frame.bindKey('ArrowUp', 'focus-prev');
    frame.bindKey('ArrowDown', 'focus-next');
    frame.bindKey('ArrowRight', 'enter');

    frame.disableGroup('selection');
    frame.disableGroup('selection-single');
    frame.disableGroup('dir');
    
    var menu = frame.addMenu('Files');
    menu.addItem('New folder', 'new-folder');
    menu.addItem('New file', 'new-file');
    menu.addItem('Download', 'download');
    menu.addItem('Close', 'close');
    
    frame.onClose = close;
    frame.onResize = resizeView;
    frame.isUnsaved = isUnsaved;

    */

    frame.onResize = function () {
        dirView.updateColumns();
    };

    self.onOpen = function (args) {
        if (!frame.isOpen) {
            frame.open();
            var path = '/';
            if (args.hasOwnProperty('path')) {
                path = args['path'];
            }
            dirView.cd(path);
        } else {
            frame.requestFocus();
            if (args.hasOwnProperty('path')) {
                dirView.cd(args['path']);
            } else {
                self.setArgs({path: dirView.cwd});
            }
        }
    };
});
