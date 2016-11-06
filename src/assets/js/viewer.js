/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var actions = require('./common/actions');
var paths = require('./common/paths');

require('viewerjs/dist/viewer.min.css');

var Viewer = require('viewerjs');

var PATH = $('body').data('path').replace(/\/$/, '');

var first = true;

var viewer = new Viewer($('#viewer')[0], {
    inline: true,
    viewed: function (e) {
        if (first) {
            viewer.view($('#viewer').children('.active').index());
            first = false;
            e.stopPropagation();
            return false;
        }
        $('#viewer img.active').removeClass('active');
        var $image = $(e.detail.originalImage);
        $image.addClass('active');
        $('#viewer-name').text($image.attr('alt'));
    }
});

actions.define('close', function () {
    location.href = PATH + '/files' + $('#viewer img.active').data('path');
});