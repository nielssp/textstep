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
    this.elem = ui.elem('div', {'class': 'menu-frame'}, [
        this.header,
        ui.elem('nav', {}, [this.itemList])
    ]);
    this.header.textContent = title;
    this.isFloating = false;
    this.activeSubmenu = null;
    this.parent = null;
}

Menu.prototype.setTitle = function (title) {
    this.title = title;
    this.header.textContent = title;
};

Menu.prototype.addItem = function (label, action) {
    let button = ui.elem('button', {}, [label]);
    if (this.parentFrame) {
        button.onclick = () => {
            this.parentFrame.activate(action);
            TEXTSTEP.closeFloatingMenu();
        };
        this.parentFrame.bindAction(action, button);
        for (let key in this.parentFrame.keyMap) {
            if (this.parentFrame.keyMap.hasOwnProperty(key) && this.parentFrame.keyMap[key] === action) {
                button.appendChild(ui.elem('span', {'class': 'shortcut'}, [key]));
            }
        }
    } else {
        button.onclick = () => {
            action();
            TEXTSTEP.closeFloatingMenu();
        }
    }
    let item = ui.elem('li', {}, [button]);
    this.itemList.appendChild(item);
    return this;
};

Menu.prototype.addSubmenu = function (label) {
    let menu = new Menu(this.parentFrame, label);
    menu.parent = this;
    let button = ui.elem('button', {'class': 'submenu'}, [label]);
    button.onclick = e => this.openSubmenu(menu, e);
    let item = ui.elem('li', {}, [button]);
    this.itemList.appendChild(item);
    return menu;
};

Menu.prototype.openSubmenu = function (submenu, clickEvent) {
    if (submenu.isFloating) {
        submenu.close();
        return;
    }
    if (this.activeSubmenu) {
        this.activeSubmenu.close();
    }
    submenu.contextOpen(clickEvent, false, !this.isFloating);
    this.activeSubmenu = submenu;
};

Menu.prototype.positionAtButton = function (button) {
    let rect = this.elem.getBoundingClientRect();
    let headRect = this.header.getBoundingClientRect();
    let buttonRect = button.getBoundingClientRect();
    let x = buttonRect.left + buttonRect.width;
    if (rect.width + x > document.body.clientWidth) {
            x = Math.max(0, buttonRect.left - rect.width);
    }
    let y = buttonRect.top - headRect.height;
    if (rect.height + y > document.body.clientHeight) {
        y = document.body.clientHeight - rect.height;
    }
    this.elem.style.left = x + 'px';
    this.elem.style.top = y + 'px';
};

Menu.prototype.positionAtPointer = function (x, y) {
    let rect = this.elem.getBoundingClientRect();
    x += 5;
    if (rect.width + x > document.body.clientWidth) {
        x = document.body.clientWidth - rect.width;
    }
    y += 5;
    if (rect.height + y > document.body.clientHeight) {
        y = document.body.clientHeight - rect.height;
    }
    this.elem.style.left = x + 'px';
    this.elem.style.top = y + 'px';
};

Menu.prototype.contextOpen = function (clickEvent, atPointer = true, root = true) {
    if (this.isFloating) {
        return;
    }
    clickEvent.stopPropagation();
    this.elem.onclick = e => e.stopPropagation();
    this.elem.classList.add('floating-menu');
    this.isFloating = true;
    document.body.appendChild(this.elem);
    if (atPointer) {
        this.positionAtPointer(clickEvent.pageX, clickEvent.pageY);
    } else {
        this.positionAtButton(clickEvent.srcElement);
    }
    if (root) {
        TEXTSTEP.openFloatingMenu(this);
    }
};

Menu.prototype.close = function () {
    if (this.isFloating) {
        if (this.activeSubmenu) {
            this.activeSubmenu.close();
        }
        document.body.removeChild(this.elem);
        this.isFloating = false;
    }
};

Menu.prototype.show = function () {
    this.elem.style.display = '';
};

Menu.prototype.hide = function () {
    this.elem.style.display = 'none';
};
