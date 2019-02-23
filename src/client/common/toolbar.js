/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';

function ActionMap() {
    this.actions = {};
    this.actionGroups = {};
}

ActionMap.prototype.activate = function (action) {
    action.apply(this);
};

ActionMap.prototype.bindAction = function (action, button) {
};

export default function Toolbar(frame) {
    if (!frame) {
        frame = new ActionMap();
    }
    this.frame = frame;
    this.elem = ui.elem('div', {'class': 'frame-toolbar'});
}

Toolbar.prototype.addItem = function (label, icon, action) {
    var icon = ui.elem('span', {'class': 'icon icon-' + icon});
    var button = ui.elem('button', {title: label}, [icon]);
    button.onclick = () => {
        this.frame.activate(action);
    };
    this.frame.bindAction(action, button);
    this.elem.appendChild(button);
    return this;
};

Toolbar.prototype.addSeparator = function () {
    this.elem.appendChild(ui.elem('span', {'class': 'frame-toolbar-separator'}));
};

Toolbar.prototype.createGroup = function () {
    var group = new ButtonGroup(this.frame);
    this.elem.appendChild(group.elem);
    return group;
};

Toolbar.prototype.show = function () {
    this.elem.style.display = '';
};

Toolbar.prototype.hide = function () {
    this.elem.style.display = 'none';
};

function ButtonGroup(frame) {
    this.frame = frame;
    this.elem = ui.elem('div', {'class': 'button-group'});
}

ButtonGroup.prototype.addItem = function (label, icon, action) {
    var icon = ui.elem('span', {'class': 'icon icon-' + icon});
    var button = ui.elem('button', {title: label}, [icon]);
    button.onclick = () => {
        this.frame.activate(action);
    };
    this.frame.bindAction(action, button);
    this.elem.appendChild(button);
    return this;
};
