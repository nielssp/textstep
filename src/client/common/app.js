/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as util from './util';
import * as ui from './ui';
import {Frame} from './frame';
import Menu from './menu';

export default function App(name) {
    this.name = name;
    this.state = 'loading';

    this.deferred = null;

    this.args = null;

    this.libs = {};

    this.frames = [];

    this.dockMenu = new Menu('Dock');
    this.dockMenu.addItem('Pin', () => {
    });
    this.dockMenu.addItem('Close', () => this.close());

    this.dockFrame = ui.elem('div', {'class': 'dock-frame'}, [
        ui.elem('label', {}, [name])
    ]);
    this.dockFrame.onmousedown = e => {
        if (e.button === 1) {
            this.close();
        }
        e.preventDefault();
    };
    this.dockFrame.oncontextmenu = e => {
        e.preventDefault();
        this.dockMenu.contextOpen(e);
    };
    this.dockFrame.onclick = e => {
        TEXTSTEP.run(name).catch((e) => {
            console.error('Could not restore ' + name + ':', e);
            TEXTSTEP.kill(name);
        });
    };

    this.onInit = null;
    this.onOpen = null;
    this.onClose = null;
}

App.prototype.require = function (name) {
    return this.libs[name].module;
};

App.prototype.setArgs = function (args) {
    this.args = args;
    TEXTSTEP.pushState(this.title, this.name, args);
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
        throw 'unexpected state: ' + this.state;
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
        return Promise.resolve(false);
    }
    if (this.onClose !== null) {
        var ok = this.onClose(action);
        if (ok === false) {
            return Promise.resolve(false);
        }
    }
    return Promise.all(this.frames.map(frame => frame.close())).then(closed => {
        if (closed.indexOf(false) < 0) {
            if (this.dockFrame !== null) {
                this.dockFrame.parentNode.removeChild(this.dockFrame);
            }
            this.state = 'initialized';
            return true;
        }
        this.state = 'running';
        return false;
    });
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

