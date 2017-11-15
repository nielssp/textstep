/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = require('jquery');
var actions = require('./common/actions');
var ui = require('./common/ui');
var paths = require('./common/paths');

var PATH = $('body').data('path').replace(/\/$/, '');
var TOKEN = $('body').data('token');

var blogstep = window.BLOGSTEP = {};

blogstep.register = function (application) {
    
};

function load(application) {
    
    $.ajax({
        url: PATH + '/api/load',
        data: { name: application },
        method: 'get',
        dataType: 'html',
        success: function (data) {
            var $doc = $('<div></div>');
            $doc.html(data);
            var $styles = $doc.find('link[rel="stylesheet"]');
            var $scripts = $doc.find('script[src]');
            var $main = $doc.find('.frame');
            console.log($scripts);
            $('head').append($styles);
            $('main').append($main);
            $('body').append($scripts);
        }
    });
}

load('files');