/*
 * TEXTSTEP 
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var paths = TEXTSTEP.paths;
var ui = TEXTSTEP.ui;

require('./view.scss');

var Viewer = require('viewerjs');

TEXTSTEP.initApp('view', function (app) {
    app.dockFrame.innerHTML = '';
    app.dockFrame.appendChild(TEXTSTEP.getIcon('generic-image', 32));

    var frame = app.createFrame('View');
    var imageList = document.createElement('div');
    imageList.className = 'image-list';
    frame.bodyElem.className += ' viewapp-viewerjs';
    frame.appendChild(imageList);
    
    var menu = frame.addMenu('View');
    menu.addItem('Close', 'close');

    var viewer = null;
    var first = true;
    
    frame.onClose = function (action) {
        viewer.destroy();
        viewer = null;
        imageList.innerHTML = '';
        app.close();
    };

    app.onOpen = function (args) {
        if (!frame.isOpen) {
            frame.open();
        } else {
            frame.requestFocus();
            if (!args.hasOwnProperty('path')) {
                return;
            }
        }
        if (viewer !== null) {
            viewer.destroy();
            imageList.innerHTML = '';
        }
        frame.setTitle(args.path + ' – View');
        var img = document.createElement('img');
        img.src = TEXTSTEP.url('download', {path: args.path});
        imageList.appendChild(img);
        viewer = new Viewer(imageList, {
            inline: true
        });
    };
});
