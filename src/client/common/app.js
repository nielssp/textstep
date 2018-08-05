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

    this.libs = {};

    this.frames = [];

    this.dockFrame = null;
    this.onInit = null;
    this.onOpen = null;
    this.onClose = null;
}

App.prototype.require = function (name) {
    return this.libs[name].module;
};

App.prototype.setArgs = function (args) {
    this.args = args;
    if (!skipHistory) {
        var path = '#' + this.name;
        if (Object.keys(args).length !== 0) {
            path += '?' + util.serializeQuery(args).replace(/%2F/gi, '/');
        }
        if (previousTitle !== null) {
            //document.title = previousTitle;
        }
        history.pushState({app: this.name, args: args}, previousTitle, path);
        //document.title = this.title;
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
            throw e;
        }
    }
    this.state = 'initialized';
};

App.prototype.open = function (args) {
    if (this.state !== 'initialized' && this.state !== 'running') {
        console.error(this.name + ': open: unexpected state:', this.state);
        return;
    }
    this.state = 'opening';
    if (this.onOpen !== null) {
        try {
            this.onOpen(args || {});
        } catch (e) {
            console.error(this.name + ': open: exception caught:', e);
            throw e;
        }
    }
    this.state = 'running';
};

App.prototype.kill = function () {
    this.state = 'closing';
    if (this.onClose !== null) {
        try {
            this.onClose();
        } catch (e) {
        }
    }
    for (var i = 0; i < this.frames.length; i++) {
        try {
            this.frames[i].close();
        } catch (e) {
        }
    }
    if (this.dockFrame !== null && this.dockFrame.parentNode !== null) {
        this.dockFrame.parentNode.removeChild(this.dockFrame);
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
        var ok = this.onClose(action);
        if (ok === false) {
            this.state = 'running';
            return false;
        }
    }
    for (var i = 0; i < this.frames.length; i++) {
        this.frames[i].close();
    }
    if (this.dockFrame !== null) {
        this.dockFrame.parentNode.removeChild(this.dockFrame);
    }
    this.state = 'initialized';
    return true;
};

App.prototype.getUnsavedFrame = function () {
    if (this.state !== 'running') {
        return null;
    }
    for (var i = 0; i < this.frames.length; i++) {
        if (this.frames[i].isUnsaved !== null) {
            if (this.frames[i].isUnsaved()) {
                return this.frames[i];
            }
        }
    }
    return null;
};


App.prototype.createFrame = function (title) {
    var frame = new Frame(title);
    this.frames.push(frame);
    return frame;
};

