/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


export default function Lib(name) {
    this.name = name;
    this.state = 'loading';

    this.timeout = null;
    this.deferred = null;
    this.scriptElem = null;

    this.libs = {};

    this.module = {};

    this.onInit = null;
}

Lib.prototype.require = function (name) {
    return this.libs[name].module;
};

Lib.prototype.init = function () {
    if (this.state !== 'loaded') {
        console.error('init: unexpected state', this.state, 'lib', this.name);
        return;
    }
    this.state = 'initializing';
    if (this.onInit !== null) {
        this.onInit(this);
    }
    this.state = 'initialized';
};

Lib.prototype.export = function (module) {
    this.module = module;
};
