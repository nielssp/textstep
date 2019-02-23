/* 
 * TEXTSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var paths = TEXTSTEP.paths;
var ui = TEXTSTEP.ui;

require('./play.scss');

TEXTSTEP.initApp('play', function (app) {
    app.dockFrame.innerHTML = '';
    app.dockFrame.appendChild(TEXTSTEP.getIcon('generic-video', 32));

    var frame = app.createFrame('Play');
    var videoContainer = document.createElement('div');
    videoContainer.className = 'playapp-player';
    frame.appendChild(videoContainer);
    var video = null;

    var menu = frame.addMenu('Play');
    menu.addItem('Close', 'close');

    var paused = false;

    frame.onClose = function () {
        videoContainer.innerHTML = '';
        video = null;
    };

    frame.onHide = function () {
        paused = video.paused;
        video.pause();
    };

    frame.onShow = function () {
        if (video && !paused) {
            video.play();
        }
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
        frame.setTitle(args.path + ' – Play');
        
        videoContainer.innerHTML = '';
        video = document.createElement('video');
        video.autoplay = true;
        video.controls = true;
        video.loop = true;
        video.src = TEXTSTEP.url('download', {path: args.path});
        videoContainer.appendChild(video);
    };
});
