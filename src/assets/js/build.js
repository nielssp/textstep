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
    
    var progress = 0;
    var status = 'Building...';
    
    var updateProgress = function (pct) {
        progress = pct;
        ui.setProgress(progressBar, progress, status);
    };
    
    var updateStatus = function (message, error) {
        status = message;
        ui.setProgress(progressBar, progress, status);
    };
    

    var post = function (url, success) {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        request.onreadystatechange = function () {
            if (this.readyState === 3 || this.readyState === 4) {
                if (this.status >= 200 && this.status < 400) {
                    if (this.responseText)
                        success(this.responseText, this.readyState, this.status);
                }
            }
        };

        request.send('request_token=' + TOKEN);
    };

    var done = false;
    var repeat = function () {
        var received = 0;
        post(PATH + '/api/build', function (text, state, status) {
            var events = text.split(/[\n\r]/);
            for (var i = received; i < events.length; i++) {
                var matches = events[i].match(/^([a-zA-Z]+): *(.*)$/);
                if (matches !== null) {
                    received++;
                    var type = matches[1];
                    var data = matches[2];
                    switch (type) {
                        case 'done':
                            updateProgress(100);
                            done = true;
                            return;
                        case 'error':
                            done = true;
                            updateStatus(data, true);
                            return;
                        case 'status':
                            updateStatus(data, false);
                            break;
                        case 'progress':
                            updateProgress(data);
                            break;
                    }
                }
            }
            if (!done && state === 4) {
                if (received === 0)
                    setTimeout(repeat, 2000);
                else
                    repeat();
            }
        });
    };
    repeat();
}

actions.define('build', build);