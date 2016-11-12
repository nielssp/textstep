/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var actions = require('./common/actions');
var paths = require('./common/paths');
var ui = require('./common/ui');

var PATH = $('body').data('path').replace(/\/$/, '');

var TOKEN = $('#build').data('token');

var progressBar = $('#build-progress')[0];

function build()
{
    ui.setProgress(progressBar, 0, 'Building...');
    $.ajax({
        url: PATH + '/api/build',
        method: 'post',
        data: {request_token: TOKEN},
        progress: function (xhr) {
            xhr.upload.onprogress = function (e) {
                if (e.lengthComputable) {
                    var pct = e.loaded / e.total * 50;
                    ui.setProgress(progressBar, pct);
                }
            }
            xhr.onprogress = function (e) {
                if (e.lengthComputable) {
                    var pct = 50 + e.loaded / e.total * 50;
                    ui.setProgress(progressBar, pct);
                }
            };
        },
        success: function (data) {
            ui.setProgress(progressBar, 100, 'Done');
        },
        error: function () {
            ui.shake($('.frame'));
            ui.setProgress(progressBar, 100, 'Error');
        }
    });
}

actions.define('build', build);