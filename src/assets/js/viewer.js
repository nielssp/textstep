/*
 * BlogSTEP 
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var paths = require('./common/paths');

require('viewerjs/dist/viewer.min.css');

var Viewer = require('viewerjs');

BLOGSTEP.init('viewer', function (app) {
    var $viewer = app.frame.find('#viewer');
    var viewer = null;
    var first = true;
    
    var menu = app.addMenu('Viewer');
    menu.addItem('Close', 'close');
    
    app.onOpen = function (app, args) {
	app.setTitle(args.path + ' – Viewer');
	first = true;
	BLOGSTEP.get('list-files', { path: paths.dirName(args.path) }).done(function (data) {
	    for (var i = 0; i < data.files.length; i++) {
		if (data.files[i].name.match(/\.(?:jpe?g|png|gif|ico)/i)) {
		    var $img = $('<img/>');
		    $img.attr('src', BLOGSTEP.PATH + '/api/download?path=' + data.files[i].path);
		    $img.attr('alt', data.files[i].name);
		    $img.data('path', data.files[i].path);
		    if (data.files[i].path === args.path) {
			$img.addClass('active');
		    }
		    $viewer.append($img);
		}
	    }
	    
	    viewer = new Viewer($viewer[0], {
		inline: true,
		viewed: function (e) {
		    if (first) {
			viewer.view($viewer.children('.active').index());
			first = false;
			e.stopPropagation();
			return false;
		    }
		    $viewer.find('img.active').removeClass('active');
		    var $image = $(e.detail.originalImage);
		    $image.addClass('active');
		    app.setTitle($image.data('path') + ' – Viewer');
		}
	    });
	});
    };
    
    app.onClose = function (app) {
	viewer.destroy();
	$viewer.empty();
    };
});