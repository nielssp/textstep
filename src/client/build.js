/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var paths = require('./common/paths');
var ui = require('./common/ui');

var self = null;

var progressBar = null;
var $statusHistory = null;
var preview = null;

var doCancel = false;

function build(target) {
    target = target.replace(/^build-/, '');
    doCancel = false;
    self.disableAction('build-all');
    self.enableAction('cancel');
    var start = performance.now();
    ui.setProgress(progressBar, 0, 'Building...');
    $statusHistory.val('');

    var progress = 0;
    var status = 'Building...';

    var updateProgress = function (pct) {
        progress = pct;
        ui.setProgress(progressBar, progress, status);
    };

    var updateStatus = function (message, error) {
        status = message;
        ui.setProgress(progressBar, progress, status);
        var t = (performance.now() - start) / 1000;
        var line = t.toFixed(3) + ': ' + status;
        $statusHistory.val(line + "\n" + $statusHistory.val());
    };


    var post = function (url, success) {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        BLOGSTEP.addToken(request);

        request.onreadystatechange = function () {
            if (this.readyState === 3 || this.readyState === 4) {
                if (this.status >= 200 && this.status < 400) {
                    if (this.responseText)
                        success(this.responseText, this.readyState, this.status);
                }
            }
        };

        request.send('target=' + target);
    };

    var done = false;
    var repeat = function () {
        if (doCancel) {
            return;
        }
        var received = 0;
        post(BLOGSTEP.PATH + '/api/build', function (text, state, status) {
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
                            self.enableAction('build-all');
                            self.disableAction('cancel');
                            preview.contentWindow.location.reload();
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

function cancel() {
    doCancel = true;
    BLOGSTEP.post('delete', {path: '/build/.build'}).always(function () {
        self.enableAction('build-all');
        self.disableAction('cancel');
    });
}

function clean() {
    doCancel = true;
    BLOGSTEP.post('delete', {path: '/build', recursive: true});
}


BLOGSTEP.init('builder', function (app) {
    self = app;

    progressBar = app.frame.find('.build-progress')[0];
    $statusHistory = app.frame.find('.build-status-history');
    preview = app.frame.find('.build-preview')[0];
    preview.src = BLOGSTEP.PATH + '/api/preview';

    app.defineAction('build-all', build);
    app.defineAction('build-content', build);
    app.defineAction('build-template', build);
    app.defineAction('build-assemble', build);
    app.defineAction('build-install', build);
    app.defineAction('cancel', cancel);
    app.defineAction('clean', clean);

    var menu = app.addMenu('Builder');
    menu.addItem('Build', 'build-all');
    menu.addItem('Preview', function () {
        preview.src = BLOGSTEP.PATH + '/api/preview';
    });
    menu.addItem('Cancel', 'cancel');
    menu.addItem('Clean', 'clean');
    menu.addItem('Close', 'close');

    app.onOpen = function (app, args) {
        app.enableAction('build-all');
        app.disableAction('cancel');
    };
});
