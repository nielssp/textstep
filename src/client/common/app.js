/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as util from './util';
import Frame from './frame';

var skipHistory = false;
var previousTitle = null;

export default function App(name) {
    this.name = name;
    this.state = 'loading';

    this.deferred = null;

    this.args = null;

    this.frames = [];

    this.dockFrame = null;
    this.onInit = null;
    this.onOpen = null;
    this.onClose = null;
}

App.prototype.setArgs = function (args) {
    this.args = args;
    if (!skipHistory) {
        var path = '#' + this.name;
        if (Object.keys(args).length !== 0) {
            path += '?' + util.serializeQuery(args).replace(/%2F/gi, '/');
        }
        if (previousTitle !== null) {
            document.title = previousTitle;
        }
        history.pushState({app: this.name, args: args}, previousTitle, path);
        document.title = this.title;
        previousTitle = this.title;
    }
};

App.prototype.init = function () {
    if (this.state !== 'loaded') {
        console.error('init: unexpected state', this.state, 'app', this.name);
        return;
    }
    this.state = 'initializing';
    if (this.onInit !== null) {
        try {
            this.onInit(this);
        } catch (e) {
            console.error(this.name + ': init: exception caught:', e);
            alert('Could not open application: ' + this.name);
            this.kill();
            return;
        }
    }
    this.state = 'initialized';
};

App.prototype.open = function (args) {
    if (this.state !== 'initialized') {
        console.error(this.name + ': open: unexpected state:', this.state);
        return;
    }
    this.state = 'opening';
    if (this.onOpen !== null) {
        try {
            this.onOpen(this, args || {});
        } catch (e) {
            console.error(this.name + ': open: exception caught:', e);
            alert('Could not open application: ' + this.name);
            this.kill();
            return;
        }
    }
    if (this.dockFrame !== null) {
        $('#dock').append(this.dockFrame);
    }
    this.setArgs(args);
    this.state = 'running';
};

App.prototype.kill = function () {
    this.state = 'closing';
    if (this.onClose !== null) {
        try {
            this.onClose(this);
        } catch (e) {
        }
    }
    this.frame.removeClass('active').hide();
    for (var i = 0; i < this.menus.length; i++) {
        this.menus[i].frame.hide();
    }
    for (var name in this.toolFrames) {
        if (this.toolFrames.hasOwnProperty(name)) {
            this.toolFrames[name].hide();
        }
    }
    if (running === this) {
        if (tasks.length > 0) {
            running = tasks.pop();
            running.resume();
        } else {
            running = null;
        }
    }
    if (this.dockFrame !== null) {
        this.dockFrame.detach();
    }
    this.state = 'initialized';
};

App.prototype.close = function (action) {
    if (this.state !== 'running') {
        console.error(this.name + ': close: unexpected state:', this.state);
        return;
    }
    this.state = 'closing';
    if (this.onClose !== null) {
        var ok = this.onClose(this, action);
        if (ok === false) {
            this.state = 'running';
            return false;
        }
    }
    this.frame.removeClass('active').hide();
    for (var i = 0; i < this.menus.length; i++) {
        this.menus[i].frame.hide();
    }
    for (var name in this.toolFrames) {
        if (this.toolFrames.hasOwnProperty(name)) {
            this.toolFrames[name].hide();
        }
    }
    if (running === this) {
        if (tasks.length > 0) {
            running = tasks.pop();
            running.resume();
        } else {
            running = null;
        }
    }
    if (this.dockFrame !== null) {
        this.dockFrame.detach();
    }
    this.state = 'initialized';
    return true;
};

App.prototype.reopen = function (args) {
    if (this.state !== 'running') {
        console.error(this.name + ': reopen: unexpected state:', this.state);
        return;
    }
    if (this.onReopen !== null) {
        try {
            this.onReopen(this, args || {});
        } catch (e) {
            console.error(this.name + ': reopen: exception caught:', e);
            alert('Could not open application: ' + this.name);
            this.kill();
            return;
        }
    } else {
        this.state = 'closing';
        if (this.onClose !== null) {
            this.onClose(this);
        }
        this.state = 'initialized';
        this.open(args);
    }
};

App.prototype.suspend = function () {
    if (this.state !== 'running') {
        console.error(this.name + ': suspend: unexpected state:', this.state);
        return;
    }
    this.state = 'suspending';
    if (this.onSuspend !== null) {
        this.onSuspend(this);
    }
    if (this.state === 'suspending') {
        this.frame.removeClass('active').hide();
        for (var i = 0; i < this.menus.length; i++) {
            this.menus[i].frame.hide();
        }
        for (var name in this.toolFrames) {
            if (this.toolFrames.hasOwnProperty(name)) {
                this.toolFrames[name].hide();
            }
        }
        this.state = 'suspended';
    }
};

App.prototype.resume = function () {
    if (this.state !== 'suspended') {
        console.error(this.name + ': resume: unexpected state:', this.state);
        return;
    }
    this.state = 'resuming';
    this.setTitle(this.title);
    this.frame.addClass('active').show();
    for (var i = 0; i < this.menus.length; i++) {
        this.menus[i].frame.show();
    }
    for (var name in this.toolFrames) {
        if (this.toolFrames.hasOwnProperty(name)) {
            this.toolFrames[name].show();
        }
    }
    if (this.onResume !== null) {
        this.onResume(this);
    }
    this.setArgs(this.args);
    if (this.onResize !== null) {
        this.onResize();
    }
    this.state = 'running';
};


App.prototype.createFrame = function (title) {
    var frame = new Frame(title):
    this.frames.push(frame);
    return frame;
};

