/* 
 * TEXTSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

const ui = TEXTSTEP.ui;
const Menu = TEXTSTEP.Menu;

function ListView(model) {
    this.listElem = ui.elem('div', {'class': 'ts-list-view-items'});
    this.elem = ui.elem('div', {'class': 'ts-list-view'}, [this.listElem]);
}

ListView.prototype.add = function (label) {
    let elem = ui.elem('a', {'class': 'ts-list-view-item'}, [label]);
    this.listElem.appendChild(elem);
    return elem;
};

function StackColumn() {
    this.elem = ui.elem('div', {'class': 'ts-stack-column'});
}

StackColumn.prototype.appendChild = function (child, options) {
    if (options) {
        if (options.grow) {
            child.style.flexGrow = options.grow;
        }
        if (options.align) {
            child.style.alignSelf = options.align;
        }
        if (options.justify) {
            child.style.justifySelf = options.justify;
        }
    }
    this.elem.appendChild(child);
};

function StackRow() {
    this.elem = ui.elem('div', {'class': 'ts-stack-row'});
}

Object.assign(StackRow.prototype, StackColumn.prototype);

function ScrollPanel() {
    this.innerElem = ui.elem('div', {'class': 'ts-scroll-panel-inner'});
    this.elem = ui.elem('div', {'class': 'ts-scroll-panel'}, [this.innerElem]);
}

ScrollPanel.prototype.appendChild = function (child) {
    this.innerElem.appendChild(child);
};

TEXTSTEP.initApp('test', ['libtest'], function (app) {
    app.require('libtest').test();

    var frame = app.createFrame('Test');
    frame.contentElem.className += ' frame-content-flex';

    let stackPanel = new StackRow();
    stackPanel.elem.style.flexGrow = '1';
    frame.appendChild(stackPanel.elem);

    let listView = new ListView();

    listView.elem.style.width = '200px';
    listView.add('foo');
    listView.add('bar');
    listView.add('baz');

    stackPanel.appendChild(listView.elem);

    let panel = new ScrollPanel();
    panel.appendChild(ui.elem('div', {}, ['Test']));

    let column = new StackColumn();
    column.appendChild(ui.elem('div', {}, ['test']));
    column.appendChild(panel.elem, {grow: 1});

    stackPanel.appendChild(column.elem, {grow: 1});

    var contextMenu = new Menu(frame, 'Context menu');
    contextMenu.addItem('Alert', 'alert');
    contextMenu.addSubmenu('Submenu')
        .addItem('Foo', () => {})
        .addItem('Bar', () => {})
        .addSubmenu('Submenu')
            .addItem('Baz', () => {});
    frame.elem.oncontextmenu = e => {
        e.preventDefault();
        contextMenu.contextOpen(e);
    };

    frame.defineAction('alert', function () {
        frame.disableGroup('dialogs');
        frame.alert('Alert', 'Hello, World!').finally(function () {
            frame.enableGroup('dialogs');
        });
    }, ['dialogs']);

    frame.defineAction('confirm', function () {
        frame.disableGroup('dialogs');
        frame.confirm('Confirm', 'Hello, World?', ['Delete', 'No', 'Cancel'], 'Delete').then(function (choice) {
            frame.alert('Choice:', choice);
        }).finally(function () {
            frame.enableGroup('dialogs');
        });
    }, ['dialogs']);

    frame.defineAction('prompt', function () {
        frame.disableGroup('dialogs');
        frame.prompt('Prompt', 'Hello, World?', 'default').then(function (choice) {
            frame.alert('Choice:', choice);
        }).finally(function () {
            frame.enableGroup('dialogs');
        });
    }, ['dialogs']);

    frame.defineAction('file', function () {
        frame.disableGroup('dialogs');
        frame.file('Select file').then(function (choice) {
            frame.alert('Choice:', choice);
        }).finally(function () {
            frame.enableGroup('dialogs');
        });
    }, ['dialogs']);

    frame.defineAction('terminal', function () {
        TEXTSTEP.run('terminal');
    });

    frame.bindKey('a-a', 'alert');
    frame.bindKey('a-c', 'confirm');
    frame.bindKey('a-p', 'prompt');
    frame.bindKey('a-t', 'terminal');
    frame.bindKey('a-f', 'file');

    var menu = frame.addMenu('Test menu');
    menu.addItem('Alert', 'alert');
    menu.addItem('Confirm', 'confirm');
    menu.addSubmenu('A submenu')
      .addItem('Test 1', () => {})
      .addItem('Test 2', () => {})
      .addItem('Test 3', () => {})
      .addItem('Test 4', () => {});
    menu.addItem('Prompt', 'prompt');
    menu.addSubmenu('A submenu')
      .addItem('Test 1', () => {})
      .addItem('Test 2', () => {})
      .addItem('Test 3', () => {})
      .addSubmenu('Test 4')
          .addItem('Test 5', () => {});
    menu.addItem('File', 'file');
    menu.addItem('Open terminal', 'terminal');

    frame.onClose = function () {
        app.close();
    };

    app.onOpen = function (args) {
        if (!frame.isOpen) {
            frame.open();
        } else if (!frame.hasFocus) {
            frame.requestFocus();
        }
        app.setArgs({});
    };
});
