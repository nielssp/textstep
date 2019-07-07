/* 
 * BlogSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

const ui = TEXTSTEP.ui;
const Config = TEXTSTEP.Config;

function input(config, key, type = 'text') {
    let elem = ui.elem('input', {type: type});
    config.get(key).bind(elem);
    return elem;
}

function label(label) {
    let elem = ui.elem('label', {}, [label]);
    elem.style.alignSelf = 'center';
    return elem;
}

function field(label, config, key, type = 'text') {
    return ui.elem('div', {className: 'field'}, [
        ui.elem('label', {}, [label]),
        input(config, key, type)
    ])
}

class PageView extends ui.Component {
    constructor() {
        super();
        this.pages = [];
        this.pageId = null;
        this.activePage = null;

        this.container = new ui.StackRow();
        this.outer = this.container.outer;

        this.pageList = new ui.ListView();
        this.pageList.width = '200px';
        this.pageList.onselect = id => this.open(id);
        this.container.append(this.pageList);

        this.main = new ui.StackColumn();
        this.container.append(this.main, {grow: 1});

        this.pageToolbar = new ui.Toolbar(); 
        this.pageToolbar.padding('bottom');
        this.pageToolbar.addItem('Back', 'go-back', () => this.close());
        this.main.append(this.pageToolbar, {shrink: 0});

        this.pageContainer = new ui.DialogContainer();
        this.pageContainer.padding();
        this.pageContainer.maxWidth = 450;
        this.main.append(this.pageContainer, {grow: 1});

        this.onopen = () => {};
    }

    open(id) {
        this.pageContainer.clear();
        for (let page of this.pages) {
            if (page.id === id) {
                this.pageId = page.id;
                this.activePage = page.component;
                this.pageContainer.append(this.activePage);
                break;
            }
        }
        if (!this.main.visible) {
            this.main.visible = true;
            this.pageList.visible = false;
        }
        this.pageList.select(id);
        this.trigger('open', id);
    }

    select(id) {
        if (this.main.visible) {
            this.open(id);
        }
    }

    close() {
        if (!this.pageList.visible) {
            this.main.visible = false;
            this.pageList.visible = true;
        }
        this.pageList.removeSelection();
    }

    readjust() {
        this.pageList.visible = true;
        if (this.container.width < 400) {
            this.main.visible = false;
            this.pageToolbar.visible = true;
            this.pageList.width = '100%';
        } else {
            this.main.visible = true;
            this.pageToolbar.visible = false;
            this.pageList.width = '200px';
        }
        this.pageContainer.readjust();
    }

    addPage(id, label, component) {
        this.pages.push({
            id: id,
            label: label,
            component: component
        });
        this.pageList.add(label, id);
    }
}

function sitePanel(config) {
    let dialogForm = new ui.StackColumn();
    dialogForm.innerPadding = true;

    let fieldSet1 = new ui.FieldSet();
    fieldSet1.legend = 'Site properties';
    dialogForm.append(fieldSet1);

    let grid = new ui.Grid();
    grid.columns = 'min-content auto';
    grid.rowPadding = true;
    grid.columnPadding = true;
    fieldSet1.append(grid);

    grid.append(label('Title:'));
    grid.append(input(config, 'title'));

    grid.append(label('Subtitle:'));
    grid.append(input(config, 'subtitle'));

    grid.append(label('Description:'));
    grid.append(input(config, 'description'));

    grid.append(label('Copyright:'));
    grid.append(input(config, 'copyright'));

    let fieldSet2 = new ui.FieldSet();
    fieldSet2.legend = 'Time zone';
    dialogForm.append(fieldSet2);

    let timeZoneSelect = ui.elem('select', {size: 1, disabled: true});
    TEXTSTEP.get('storage', {path: '/system/timezones.json'}).then(timeZones => {
        timeZones.forEach(zone => {
            timeZoneSelect.appendChild(ui.elem('option', {value: zone}, [zone]));
        });
        timeZoneSelect.disabled = false;
    });
    timeZoneSelect.style.width = '100%';
    timeZoneSelect.onchange = e => config.get('timeZone').set(timeZoneSelect.value);
    config.get('timeZone').change(value => {
        timeZoneSelect.value = value;
    });
    fieldSet2.append(timeZoneSelect);

    let saveButton = ui.elem('button', {}, ['Save']);
    saveButton.onclick = () => config.commit();
    let cancelButton = ui.elem('button', {}, ['Cancel']);
    cancelButton.onclick = () => config.update();

    let buttons = new ui.StackRow();
    buttons.innerPadding = true;
    buttons.justifyContent = 'flex-end';
    buttons.append(saveButton);
    buttons.append(cancelButton);
    dialogForm.append(buttons);

    return dialogForm;
}

function sessionPanel() {
    let dialog = new ui.StackColumn();

    let list = new ui.ListView();
    dialog.append(list);

    return dialog;
}

function userPanel() {
    let dialog = new ui.StackColumn();

    let list = new ui.ListView();
    dialog.append(list);

    return dialog;
}

class BgSelector extends ui.Component {
    constructor(frame) {
        super();
        this.container = new ui.StackRow();
        this.container.wrap = true;
        this.outer = this.container.outer;

        this.typeSelect = ui.elem('select', {size: 1});
        this.typeSelect.appendChild(ui.elem('option', {value: 'solid'}, ['Solid']));
        this.typeSelect.appendChild(ui.elem('option', {value: 'horizontal'}, ['Horizontal gradient']));
        this.typeSelect.appendChild(ui.elem('option', {value: 'vertical'}, ['Vertical gradient']));
        this.typeSelect.appendChild(ui.elem('option', {value: 'se'}, ['SE diagonal gradient']));
        this.typeSelect.appendChild(ui.elem('option', {value: 'ne'}, ['NE diagonal gradient']));
        this.container.append(this.typeSelect);

        this.color1 = new ui.ColorButton(frame);
        this.container.append(this.color1);

        this.color2 = new ui.ColorButton(frame);
        this.color2.visible = false;
        this.container.append(this.color2);

        this.typeSelect.onchange = () => {
            this.color1.visible = true;
            if (this.typeSelect.value === 'solid') {
                this.color2.visible = false;
            } else {
                this.color2.visible = true;
            }
            this.trigger('change', this.value);
        };
        this.color1.onchange = () => this.trigger('change', this.value);
        this.color2.onchange = () => this.trigger('change', this.value);

        this.onchange = () => {};
    }

    get value() {
        switch (this.typeSelect.value) {
            case 'horizontal':
                return `linear-gradient(to right, ${this.color1.color}, ${this.color2.color})`;
            case 'vertical':
                return `linear-gradient(to bottom, ${this.color1.color}, ${this.color2.color})`;
            case 'se':
                return `linear-gradient(to bottom right, ${this.color1.color}, ${this.color2.color})`;
            case 'ne':
                return `linear-gradient(to top right, ${this.color1.color}, ${this.color2.color})`;
            case 'solid':
            default:
                return this.color1.color;
        }
    }

    set value(value) {
        if (value.match(/^#[0-9a-z]{6}$/i)) {
            this.typeSelect.value = 'solid';
            this.color1.visible = true;
            this.color1.color = value;
            this.color2.visible = false;
        } else {
            let m = value.match(/^linear-gradient *\( *to +(bottom(?: right)?|(?:top )?right) *, *(#[0-9a-z]{6}) *, *(#[0-9a-z]{6}) *\)$/i);
            if (m) {
                switch (m[1]) {
                    case 'right':
                        this.typeSelect.value = 'horizontal';
                        break;
                    case 'bottom':
                        this.typeSelect.value = 'vertical';
                        break;
                    case 'bottom right':
                        this.typeSelect.value = 'se';
                        break;
                    case 'top right':
                        this.typeSelect.value = 'ne';
                        break;
                }
                this.color1.visible = true;
                this.color1.color = m[2];
                this.color2.visible = true;
                this.color2.color = m[3];
            } else {
                this.typeSelect.value = null;
                this.color1.visible = false;
                this.color2.visible = false;
            }
        }
    }
}

function widgetStyle(frame, title, name) {
    let fieldSet = new ui.FieldSet();
    fieldSet.legend = title;

    let grid = new ui.Grid();
    grid.columns = 'min-content auto';
    grid.rowPadding = true;
    grid.columnPadding = true;
    fieldSet.append(grid);

    grid.append(label('Background:'));
    let bg = new BgSelector(frame);
    let bgVar = `${name}-bg`;
    bg.value = TEXTSTEP.getSkinProperty(bgVar).trim();
    bg.onchange = value => TEXTSTEP.setSkinProperty(bgVar, value);
    grid.append(bg);

    grid.append(label('Text:'));
    let fg = new ui.ColorButton(frame);
    let fgVar = `${name}-fg`;
    fg.color = TEXTSTEP.getSkinProperty(fgVar).trim();
    fg.onchange = value => TEXTSTEP.setSkinProperty(fgVar, value);
    grid.append(ui.elem('div', {}, [fg.outer]));

    TEXTSTEP.addEventListener('skinChanged', () => {
        bg.value = TEXTSTEP.getSkinProperty(bgVar).trim();
        fg.color = TEXTSTEP.getSkinProperty(fgVar).trim();
    });
    return fieldSet;
}

function appearancePanel(frame) {
    let skin = TEXTSTEP.getSkin();

    let dialog = new ui.StackColumn();
    dialog.innerPadding = true;

    let themeFieldSet = new ui.FieldSet();
    themeFieldSet.legend = 'Theme';
    dialog.append(themeFieldSet);

    let themeRow = new ui.StackRow();
    themeRow.innerPadding =  true;
    themeFieldSet.append(themeRow);

    let themeSelect = ui.elem('select', {size: 1, disabled: true});
    let themeInstall = ui.elem('button', {disabled: true}, ['Install theme']);
    TEXTSTEP.get('file', {path: '/dist/themes', list: true}).then(dir => {
        dir.files.forEach(theme => {
            themeSelect.appendChild(ui.elem('option', {value: theme.name}, [theme.name]));
        });
        themeSelect.disabled = false;
        if (dir.write) {
            themeInstall.disabled = false;
        } else {
            themeInstall.title = '/dist/themes is not writable';
        }
    });
    themeRow.append(themeSelect, {grow: 1});
    themeRow.append(themeInstall);

    let skinFieldSet = new ui.FieldSet();
    skinFieldSet.legend = 'Color scheme';
    dialog.append(skinFieldSet);

    let skinRow = new ui.StackRow();
    skinRow.innerPadding =  true;
    skinFieldSet.append(skinRow);

    let skinSelect = ui.elem('select', {size: 1, disabled: true});
    TEXTSTEP.get('file', {path: '/dist/themes/default/skins', list: true}).then(dir => {
        dir.files.forEach(skin => {
            if (skin.name.match(/\.json$/i)) {
                let name = skin.name.replace(/\.json$/i, '');
                skinSelect.appendChild(ui.elem('option', {value: skin.path}, [name]));
            }
        });
        if (skin.hasOwnProperty('path')) {
            skinSelect.value = skin.path;
        }
        skinSelect.disabled = false;
    });
    skinSelect.onchange = () => {
        TEXTSTEP.get('content', {path: skinSelect.value}).then(skin => {
            skin.path = skinSelect.value;
            TEXTSTEP.applySkin(skin);
        });
    };
    skinRow.append(skinSelect, {grow: 1});

    let skinBrowse = ui.elem('button', {}, ['Browse']);
    skinBrowse.onclick = () => {
        frame.file('Load skin').then(path => {
            TEXTSTEP.get('content', {path: path[0]}).then(skin => {
                skin.path = path;
                TEXTSTEP.applySkin(skin);
            });
        });
    };
    skinRow.append(skinBrowse);

    let bgFieldSet = new ui.FieldSet();
    bgFieldSet.legend = 'Background';
    dialog.append(bgFieldSet);

    let colorPicker = new ui.HsvPicker();
    colorPicker.outer.style.minHeight = '200px';
    colorPicker.onchange = color => TEXTSTEP.setSkinProperty('desktop-bg', color);
    colorPicker.color = TEXTSTEP.getSkinProperty('desktop-bg').trim();
    bgFieldSet.append(colorPicker, {grow: 1});
    TEXTSTEP.addEventListener('skinChanged', () => colorPicker.color = TEXTSTEP.getSkinProperty('desktop-bg').trim());

    dialog.append(widgetStyle(frame, 'Active title bars', 'active-titlebar'));

    dialog.append(widgetStyle(frame, 'Inactive title bars', 'inactive-titlebar'));

    dialog.append(widgetStyle(frame, 'Frames', 'frame'));

    dialog.append(widgetStyle(frame, 'Dock frames', 'dock-frame'));

    dialog.append(widgetStyle(frame, 'Inputs', 'input'));

    dialog.append(widgetStyle(frame, 'Items', 'item'));

    dialog.append(widgetStyle(frame, 'Highlighted items', 'active-item'));

    return dialog;
}

TEXTSTEP.initApp('control-panel', [], function (app) {
    let frame = app.createFrame('Control panel');

    let config = new Config(() => TEXTSTEP.get('content', {path: '/site/site.json'}), data =>
        TEXTSTEP.put('content', {path: '/site/site.json'}, data));

    app.dockFrame.innerHTML = '';
    app.dockFrame.appendChild(TEXTSTEP.getIcon('control-panel', 32));

    let pageView = new PageView();
    pageView.padding();
    pageView.addPage('site', 'Site', sitePanel(config));
    pageView.addPage('appearance', 'Appearance', appearancePanel(frame));
    if (TEXTSTEP.hasPermission('sessions.self.view')) {
        pageView.addPage('sessions', 'Sessions', sessionPanel());
    }
    if (TEXTSTEP.hasPermission('users.view')) {
        pageView.addPage('users', 'Users', userPanel());
    }
    pageView.onopen = page => app.setArgs({page: page});
    frame.append(pageView, {grow: 1});

    let adjustContent = () => pageView.readjust();

    frame.onResize = adjustContent;

    frame.onClose = () => app.close();
    
    app.onOpen = args => {
        if (!frame.isOpen) {
            frame.open();
            adjustContent();
            if (args.page) {
                pageView.select(args.page);
            } else {
                pageView.select('site');
            }
            config.update();
        } else {
            frame.requestFocus();
        }
        app.setArgs({page: pageView.pageId});
    };
});
