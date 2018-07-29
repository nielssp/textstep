
function Menu(frame, title) {
    this.frame = frame;
    this.title = title;
    this.frame = $('<div><header></header><nav><ul></ul></div>');
    this.header = util.elem('header');
    this.itemList = util.elem('ul');
    this.frame = util.elem('div', {}, [
        this.header,
        util.elem('nav', {}, [this.itemList])
    ]);
    this.header.text(title);
}

Menu.prototype.addItem = function (label, action) {
    var button = $('<button/>');
    button.text(label);
    if (typeof action === 'string') {
        button.attr('data-action', action);
    }
    var app = this.app;
    button.click(function () {
        app.activate(action);
    });
    var item = $('<li>');
    item.append(button);
    for (var key in this.app.keyMap) {
        if (this.app.keyMap.hasOwnProperty(key) && this.app.keyMap[key] === action) {
            button.append('<span class="shortcut">' + key + '</span>');
        }
    }
    this.itemList.append(item);
};
