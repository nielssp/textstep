/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';
import {Component} from './component';
import {CommandMap} from './command';

export class Toolbar extends Component {
    constructor(commands = new CommandMap()) {
        super();
        this.commands = commands;
        this.outer.className = 'ts-toolbar';
    }

    addItem(label, icon, command) {
        let button = ui.elem('button', {title: label, type: 'button'});
        if (icon) {
            button.appendChild(ui.elem('span', {'class': 'icon icon-' + icon}));
        } else {
            button.textContent = label;
        }
        button.onclick = () => {
            this.commands.activate(command);
        };
        this.commands.bindElement(button, command);
        this.outer.appendChild(button);
        return this;
    }

    addSeparator() {
        this.outer.appendChild(ui.elem('div', {'class': 'ts-toolbar-separator'}));
    }

    createGroup() {
        let group = new ButtonGroup(this.commands);
        this.outer.appendChild(group.outer);
        return group;
    }
}

export class ButtonGroup extends Component {
    constructor(commands = new CommandMap()) {
        super();
        this.commands = commands;
        this.outer.className = 'button-group';
    }

    addItem(label, icon, command) {
        var icon = ui.elem('span', {'class': 'icon icon-' + icon});
        var button = ui.elem('button', {title: label, type: 'button'}, [icon]);
        button.onclick = () => {
            this.commands.activate(command);
        };
        this.commands.bindElement(button, command);
        this.outer.appendChild(button);
        return this;
    }
}
