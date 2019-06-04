/* 
 * BlogSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var nsRegex = /^([a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*)?$/;

export default function Config(getter, setter) {
    this.getter = getter;
    this.setter = setter;
    this.root = this;
    this.ns = '';
    this.data = {};
}

Config.prototype.getSubconfig = function (ns) {
    var subconfig = new Config(null, null);
    subconfig.root = this.root;
    subconfig.ns = this.ns + ns + '.';
    return subconfig;
};

Config.prototype.get = function (key) {
    if (this.ns !== '') {
        return this.root.get(this.ns + key);
    }
    if (!this.data.hasOwnProperty(key)) {
        this.data[key] = new Property();
    }
    return this.data[key];
};

Config.prototype.update = function () {
    var keys = [];
    for (var key in this.data) {
        if (this.data.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    this.getter(keys).then(data => {
        for (var key in data) {
            if (!this.data.hasOwnProperty(key)) {
                this.data[key] = new Property();
            }
            this.data[key].set(data[key]);
            this.data[key].dirty = false;
        }
    });
};

Config.prototype.commit = function () {
    var data = {};
    for (var key in this.data) {
        if (this.data.hasOwnProperty(key)) {
            data[key] = this.data[key].get();
        }
    }
    this.setter(data).then(result => {
        for (var i = 0; i < result.length; i++) {
            this.data[result[i]].dirty = false;
        }
    });
};


function Property() {
    this.listeners = [];
    this.value = null;
    this.dirty = false;
}

Property.prototype.bind = function (element) {
    if (element.tagName === 'INPUT') {
        element.value = this.value;
        element.onkeydown = () => this.set(element.value);
        element.onkeyup = () => this.set(element.value);
        this.change(value => element.value = value);
    }
};

Property.prototype.change = function (callback) {
    this.listeners.push(callback);
};

Property.prototype.set = function (value) {
    this.value = value;
    this.dirty = true;
    for (var i = 0; i < this.listeners.length; i++) {
        this.listeners[i].apply(this, [value]);
    }
};

Property.prototype.get = function () {
    return this.value;
};
