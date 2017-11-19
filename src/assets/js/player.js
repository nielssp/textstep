/* 
 * BlogSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = require('jquery');

BLOGSTEP.init('player', function (app) {
    var $videoContainer = app.frame.find('#player');
    var $video = null;
    var paused = false;

    var menu = app.addMenu('Player');
    menu.addItem('Close', 'close');    

    app.onOpen = function (app, args) {
	app.frame.find('.header-path').text(args.path);
	
	$video = $("<video autoplay controls loop/>");
	$video.attr('src', BLOGSTEP.PATH + '/api/download?path=' + args.path);
	$videoContainer.append($video);
    };
    
    app.onSuspend = function (app) {
	paused = $video[0].paused;
	$video[0].pause();
    };
    
    app.onResume = function (app) {
	if (!paused) {
	    $video[0].play();
	}
    };
    
    app.onClose = function (app) {
	$video.remove();
    };
});
