/*
 * TEXTSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import './build.scss';

var paths = TEXTSTEP.paths;
var ui = TEXTSTEP.ui;

var self = null;
var frame = null;
var progressBar = null;
var statusHistory = null;
var preview = null;

var doCancel = false; 
function build(target) {
    target = target.replace(/^build-/, '');
    doCancel = false;
    frame.disableGroup('build');
    frame.enableAction('cancel');
    var start = performance.now();
    progressBar.progress = 0;
    progressBar.status = 'Building...';
    statusHistory.innerHTML = '';

    var progress = 0;
    var status = 'Building...';

    var updateProgress = function (pct) {
        progress = pct;
        progressBar.progress = progress;
        progressBar.status = status;
    };

    var updateStatus = function (message, error) {
        status = message;
        progressBar.progress = progress;
        progressBar.status = status;
        var t = (performance.now() - start) / 1000;
        var line = t.toFixed(3) + ': ' + status;
        statusHistory.textContent = line + '\n' + statusHistory.textContent;
    };


    var post = function (url, success) {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        TEXTSTEP.prepareRequest(request);

        request.onreadystatechange = function () {
            if (this.readyState === 3 || this.readyState === 4) {
                if (this.status >= 200 && this.status < 400) {
                    if (this.responseText) {
                        success(this.responseText, this.readyState, this.status);
                    }
                } else if (this.readyState === 4) {
                    done = true;
                    frame.enableGroup('build');
                    frame.disableAction('cancel');
                    if (this.status >= 500) {
                        updateStatus('Server error', true);
                        frame.alert('Server error', 'Internal server error', {
                            errorType: 'SERVER_ERROR',
                            message: 'Internal server error',
                            context: { details: this.response }
                        });
                    } else {
                        try {
                            updateStatus(JSON.parse(this.response).message, true);
                        } catch (e) {
                            updateStatus(this.response, true);
                        }
                    }
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
        post(TEXTSTEP.url('build'), function (text, state, status) {
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
                            frame.enableGroup('build');
                            frame.disableAction('cancel');
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
    frame.enableGroup('build');
    frame.disableAction('cancel');
}

function clean() {
    doCancel = true;
    TEXTSTEP.delete('file', {path: '/site/build', recursive: true});
}


TEXTSTEP.initApp('build', [], function (app) {
    self = app;

    frame = self.createFrame('Build');
    frame.padding();
    frame.inner.classList.add('Build-app');

    progressBar = new ui.ProgressBar();
    progressBar.progress = 0;
    progressBar.status = 'Ready to build';
    frame.appendChild(progressBar.outer);

    statusHistory = ui.elem('textarea', { readonly: true, class: 'build-status-history' });
    frame.appendChild(statusHistory);

    preview = ui.elem('iframe', { class: 'build-preview' });
    preview.src = TEXTSTEP.url('preview');
    frame.appendChild(preview);

    frame.defineAction('build-all', build, ['build']);
    frame.defineAction('build-content', build, ['build']);
    frame.defineAction('build-index', build, ['build']);
    frame.defineAction('build-template', build, ['build']);
    frame.defineAction('build-install', build, ['build']);
    frame.defineAction('cancel', cancel);
    frame.defineAction('clean', clean);

    let toolbar = frame.createToolbar();
    toolbar.addItem('Build all', null, 'build-all');
    toolbar.addItem('Compile content', null, 'build-content');
    toolbar.addItem('Compile site map', null, 'build-index');
    toolbar.addItem('Compile templates ', null, 'build-template');
    toolbar.addItem('Install ', null, 'build-install');
    toolbar.addItem('Cancel ', null, 'cancel');
    toolbar.addItem('Clean ', null, 'clean');

    let menu = frame.addMenu('Build');
    menu.addItem('Reload preview', () => preview.src = TEXTSTEP.url('preview'));

    frame.onClose = () => self.close();

    self.onOpen = function (app, args) {
        if (!frame.isOpen) {
            frame.open();
        } else {
            frame.requestFocus();
        }
        self.setArgs({});
        frame.enableGroup('build');
        frame.disableAction('cancel');
    };
});
