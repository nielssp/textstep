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

TEXTSTEP.initApp('files', function (app) {
    self = app;

    app.dockFrame.innerHTML = '';
    app.dockFrame.appendChild(TEXTSTEP.getIcon('files', 32));

    frame = self.createFrame('Files');
    frame.contentElem.className += ' frame-content-flex';
    dirView = new ui.DirView();
    frame.appendChild(dirView.elem);

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

    self.onOpen = function (args) {
        if (!frame.isOpen) {
            frame.open();
            dirView.cd('/content');
        } else {
            frame.requestFocus();
            if (args.hasOwnProperty('path')) {
                reopen(args);
            }
        }
    };
});
