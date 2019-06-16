/*
 * TEXTSTEP
 * Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

export class CommandMap {
    constructor() {
        this.commands = {};
        this.groups = {};
        this.keys = {};
    }

    define(command, handler, groups = []) {
        if (!this.commands.hasOwnProperty(command)) {
            this.commands[command] = {
                handler: handler,
                bindings: []
            };
        } else {
            this.commands[command].handler = handler;
        }
        groups.forEach(group => {
            if (!this.groups.hasOwnProperty(group)) {
                this.groups[group] = [];
            }
            this.groups[group].push(command);
        });
    }

    activate(command) {
        if (typeof command === 'string') {
            if (!this.commands.hasOwnProperty(command) || this.commands[command].handler === null) {
                console.error('Undefined command: ' + command);
            } else {
                this.commands[command].handler.call(this, command);
            }
        } else {
            command.apply(this);
        }
    }

    activateKey(keyboardEvent) {
        let key = '';
        if (keyboardEvent.ctrlKey) {
            key += 'Ctrl+';
        }
        if (keyboardEvent.altKey) {
            key += 'Alt+';
        }
        if (keyboardEvent.shiftKey) {
            key += 'Shift+';
        }
        if (keyboardEvent.metaKey) {
            key += 'Meta+';
        }
        key += keyboardEvent.key.toUpperCase();
        if (this.keys.hasOwnProperty(key)) {
            this.activate(this.keys[key]);
            return true;
        }
        return false;
    }

    bindKey(key, command) {
        let parts = key.toLowerCase().split(/-|\+/);
        let e = {ctrlKey: '', altKey: '', shiftKey: ''};
        key = parts[parts.length - 1];
        for (let i = 0; i < parts.length - 1; i++) {
            switch (parts[i]) {
                case 'c':
                    e.ctrlKey = 'Ctrl+';
                    break;
                case 'a':
                    e.altKey = 'Alt+';
                    break;
                case 's':
                    e.shiftKey = 'Shift+';
                    break;
                case 'm':
                    e.metaKey = 'Meta+';
                    break;
            }
        }
        key = e.ctrlKey + e.altKey + e.shiftKey + key.toUpperCase();
        this.keys[key] = command;
    }

    bindElement(element, command) {
        if (typeof command !== 'string') {
            return;
        }
        if (!this.commands.hasOwnProperty(command)) {
            this.commands[command] = {
                handler: null,
                bindings: []
            };
        }
        this.commands[command].bindings.push(element);
    }

    enable(command) {
        if (typeof command === 'string') {
            if (this.commands.hasOwnProperty(command)) {
                this.commands[command].bindings.forEach(function (element) {
                    element.disabled = false;
                });
            }
        } else {
            command.forEach(this.enable, this);
        }
    }

    disable(command) {
        if (typeof command === 'string') {
            if (this.commands.hasOwnProperty(command)) {
                this.commands[command].bindings.forEach(function (element) {
                    element.disabled = true;
                });
            }
        } else {
            command.forEach(this.disable, this);
        }
    }

    enableGroup(group) {
        if (this.groups.hasOwnProperty(group)) {
            this.groups[group].forEach(this.enable, this);
        }
    }

    disableGroup(group) {
        if (this.groups.hasOwnProperty(group)) {
            this.groups[group].forEach(this.disable, this);
        }
    }
}
