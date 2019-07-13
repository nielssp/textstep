/* 
 * TEXTSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

const ui = TEXTSTEP.ui;
const Menu = TEXTSTEP.Menu;

TEXTSTEP.initApp('test', ['libtest'], function (app) {
    app.require('libtest').test();

    var frame = app.createFrame('Test');

    let stackPanel = new ui.StackRow();
    stackPanel.padding();
    frame.appendChild(stackPanel, {grow: 1});

    let listView = new ui.ListView();

    listView.width = '200px';
    listView.add('foo');
    listView.add('bar');
    listView.add('baz');

    stackPanel.append(listView);

    let text = ui.elem('div', {}, ['select item']);
    let panel = new ui.ScrollPanel();
    panel.append(text);

    let column = new ui.StackColumn();
    let toolbar = new ui.Toolbar();
    toolbar.padding('bottom');
    toolbar.addItem('Back', 'go-back', () => {
        if (!listView.visible) {
            column.visible = false;
            listView.visible = true;
        }
    });
    toolbar.visible = false;
    column.append(toolbar);
    column.append(panel, {grow: 1});

    stackPanel.append(column, {grow: 1});

    listView.onselect = (item) => {
        listView.select(item);
        text.textContent = 'Item selected: ' + item.textContent;
        if (!column.visible) {
            column.visible = true;
            listView.visible = false;
        }
    };

    let adjustContent = () => {
        listView.visible = true;
        if (stackPanel.width < 400) {
            column.visible = false;
            toolbar.visible = true;
            listView.width = '100%';
        } else {
            column.visible = true;
            toolbar.visible = false;
            listView.width = '200px';
        }
    };

    frame.onResize = adjustContent;

    var contextMenu = new Menu('Context menu', frame.commands);
    contextMenu.addItem('Alert', 'alert');
    contextMenu.addSubmenu('Submenu')
        .addItem('Foo', () => {})
        .addItem('Bar', () => {})
        .addSubmenu('Submenu')
            .addItem('Baz', () => {});
    frame.inner.oncontextmenu = e => {
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
        frame.confirm('Confirm', 'Hello, World?', ['Delete', 'No', 'Cancel'], 0).then(function (choice) {
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

    frame.defineAction('color', function () {
        frame.disableGroup('dialogs');
        frame.color('Select color', '#00ff00').then(function (choice) {
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
    menu.addItem('Color', 'color');
    menu.addItem('Open terminal', 'terminal');

    frame.onClose = function () {
        app.close();
    };

    app.onOpen = function (args) {
        if (!frame.isOpen) {
            frame.open();
            adjustContent();
        } else if (!frame.hasFocus) {
            frame.requestFocus();
        }
        app.setArgs({});
    };
});
