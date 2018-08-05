/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';

export default function Menu(parentFrame, title) {
    this.parentFrame = parentFrame;
    this.title = title;
    this.header = ui.elem('header');
    this.itemList = ui.elem('ul');
    this.elem = ui.elem('div', {}, [
        this.header,
        ui.elem('nav', {}, [this.itemList])
    ]);
    this.header.textContent = title;
}

Menu.prototype.setTitle = function (title) {
    this.title = title;
    this.header.textContent = title;
};

Menu.prototype.addItem = function (label, action) {
    var button = ui.elem('button', {}, [label]);
    var frame = this.parentFrame;
    button.onclick = function () {
        frame.activate(action);
    };
    frame.bindAction(action, button);
    var item = ui.elem('li', {}, [button]);
    for (var key in frame.keyMap) {
        if (frame.keyMap.hasOwnProperty(key) && frame.keyMap[key] === action) {
            button.appendChild(ui.elem('span', {'class': 'shortcut'}, [key]));
        }
    }
    this.itemList.appendChild(item);
};

Menu.prototype.show = function () {
    this.elem.style.display = '';
};

Menu.prototype.hide = function () {
    this.elem.style.display = 'none';
};
