
import * as ui from './ui';

export default function Menu(parentFrame, title) {
    this.parentFrame = parentFrame;
    this.title = title;
    this.header = ui.elem('header');
    this.itemList = ui.elem('ul');
    this.frame = ui.elem('div', {}, [
        this.header,
        util.elem('nav', {}, [this.itemList])
    ]);
    this.header.textContent = title;
}

Menu.prototype.addItem = function (label, action) {
    var button = ui.elem('button', {}, [label]);
    if (typeof action === 'string') {
        button.setAttribute('data-action', action);
    }
    var app = this.app;
    button.onclick = function () {
        app.activate(action);
    };
    var item = ui.elem('li', {}, [button]);
    for (var key in this.app.keyMap) {
        if (this.app.keyMap.hasOwnProperty(key) && this.app.keyMap[key] === action) {
            button.appendChild(ui.elem('span', {'class': 'shortcut'}, [key]));
        }
    }
    this.itemList.appendChild(item);
};
