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
    elem.style.whiteSpace = 'nowrap';
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
        if (this.container.width < 500) {
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

    grid.append(label('Website URI:'));
    grid.append(input(config, 'websiteUri'));

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

function passwordPanel(frame) {
    let dialogForm = new ui.StackColumn();
    dialogForm.innerPadding = true;

    let fieldSet1 = new ui.FieldSet();
    fieldSet1.legend = 'Change password';
    dialogForm.append(fieldSet1);

    let grid = new ui.Grid();
    grid.columns = 'min-content auto';
    grid.rowPadding = true;
    grid.columnPadding = true;
    fieldSet1.append(grid);

    /* TODO:
    grid.append(label('Old password:'));
    let current = ui.elem('input', {type: 'password'});
    grid.append(current);
    */

    grid.append(label('New password:'));
    let newPassword = ui.elem('input', {type: 'password'});
    grid.append(newPassword);

    grid.append(label('Confirm password:'));
    let confirmPassword = ui.elem('input', {type: 'password'});
    grid.append(confirmPassword);

    let saveButton = new ui.Button('OK');
    saveButton.onclick = () => {
        if (newPassword.value === '') {
            frame.alert('Change password', 'The password is empty.');
            return;
        }
        if (newPassword.value !== confirmPassword.value) {
            frame.alert('Change password', 'The passwords do not match.');
            return;
        }
        TEXTSTEP.put('storage', {path: '/system/users.json', key: TEXTSTEP.user.username}, {
            'password': newPassword.value
        }).then(() => {
            current.value = '';
            newPassword.value = '';
            confirmPassword.value = '';
            frame.alert('Change password', 'Your password has been changed.');
        }, () => {
            frame.alert('Error', 'Password could not be changed');
        });
    };
    let cancelButton = new ui.Button('Cancel');
    cancelButton.onclick = () => {
        // current.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
    };

    let buttons = new ui.StackRow();
    buttons.innerPadding = true;
    buttons.justifyContent = 'flex-end';
    buttons.append(saveButton);
    buttons.append(cancelButton);
    dialogForm.append(buttons);

    return dialogForm;
}


function guessBrowser(ua) {
    if (ua.indexOf('chrome') >= 0) return 'Chrome';
    if (ua.indexOf('firefox') >= 0) return 'Firefox';
    if (ua.indexOf('edge') >= 0) return 'Edge';
    if (ua.indexOf('msie') >= 0) return 'Internet Explorer';
    if (ua.indexOf('safari') >= 0) return 'Safari';
    return 'unknown browser';
}

function guessOs(ua) {
    if (ua.indexOf('windows') >= 0) return 'Windows';
    if (ua.indexOf('mac os') >= 0) return 'macOS';
    if (ua.indexOf('iphone') >= 0) return 'iOS';
    if (ua.indexOf('ipad') >= 0) return 'iOS';
    if (ua.indexOf('android') >= 0) return 'Android';
    if (ua.indexOf('linux') >= 0) return 'Linux';
    return 'unknown OS';
}

function sessionPanel(username, outerDialog) {
    let dialog = new ui.StackColumn();

    let row = new ui.StackRow();
    row.innerPadding = true;
    dialog.append(row, {grow: 1});

    let list = new ui.ListView();
    list.height = '300px';
    row.append(list, {grow: 1});

    let actions = new ui.StackColumn();
    actions.innerPadding = true;
    row.append(actions);

    if (outerDialog) {
        let closeButton = ui.elem('button', {}, ['Close']);
        actions.append(closeButton);
        closeButton.onclick = function () {
            outerDialog.close(null);
        };
        closeButton.onkeydown = function (e) {
            if (e.key === 'Escape') {
                outerDialog.close(null);
            }
        };
        outerDialog.addEventListener('open', () => {
            closeButton.focus();
        });
    }

    let deleteButton = new ui.Button('Delete');
    deleteButton.disabled = true;
    if ((!username && TEXTSTEP.hasPermission('sessions.self.delete')) ||
            TEXTSTEP.hasPermission('sessions.delete')) {
        actions.append(deleteButton);
    }

    let selection = null;

    list.onselect = id => {
        selection = id;
        list.select(id);
        deleteButton.disabled = !selection;
    };

    deleteButton.onclick = () => {
        if (selection) {
            TEXTSTEP.delete('storage', {path: '/system/sessions.json', key: selection}).then(() => {
                list.removeItem(selection);
            });
        }
    };
    
    if (!username) {
        username = TEXTSTEP.user.username;
    }

    TEXTSTEP.get('storage', {path: '/system/sessions.json', 'filter[username]': username}).then(sessions => {
        for (let sessionId in sessions) {
            if (sessions.hasOwnProperty(sessionId)) {
                let session = sessions[sessionId];
                let name = sessionId.substring(0, 6);
                if (typeof session.userAgent === 'string') {
                    let ua = session.userAgent.toLowerCase();
                    name += ' (' + guessBrowser(ua);
                    name += ' on ' + guessOs(ua) + ')';
                } else {
                    name += ' (unknown)';
                }
                let item = list.add(name, sessionId);
                if (TEXTSTEP.isCurrentSession(sessionId)) {
                    item.label += ' (current)';
                    item.outer.style.fontWeight = '600';
                }
            }
        }
    });

    return dialog;
}

function userPanel(frame) {
    let dialog = new ui.StackColumn();

    let row = new ui.StackRow();
    row.innerPadding = true;
    dialog.append(row, {grow: 1});

    let list = new ui.ListView();
    list.height = '300px';
    row.append(list, {grow: 1});

    let actions = new ui.StackColumn();
    actions.innerPadding = true;
    row.append(actions);

    let newButton = new ui.Button('New user');
    if (TEXTSTEP.hasPermission('users.create')) {
        actions.append(newButton);
    }

    let passwordButton = new ui.Button('Password');
    passwordButton.disabled = true;
    if (TEXTSTEP.hasPermission('users.update.password')) {
        actions.append(passwordButton);
    }

    let groupsButton = new ui.Button('Groups');
    groupsButton.disabled = true;
    if (TEXTSTEP.hasPermission('users.update.groups')) {
        actions.append(groupsButton);
    }

    let sessionsButton = new ui.Button('Sessions');
    sessionsButton.disabled = true;
    if (TEXTSTEP.hasPermission('sessions.view')) {
        actions.append(sessionsButton);
    }

    let deleteButton = new ui.Button('Delete');
    deleteButton.disabled = true;
    if (TEXTSTEP.hasPermission('users.delete')) {
        actions.append(deleteButton);
    }

    let users = {};
    let selection = null;

    list.onselect = id => {
        selection = id;
        list.select(id);
        passwordButton.disabled = !selection;
        groupsButton.disabled = !selection;
        sessionsButton.disabled = !selection;
        deleteButton.disabled = !selection;
    };

    newButton.onclick = () => {
        frame.prompt('New user', 'Enter username').then(username => {
            if (username) {
                TEXTSTEP.post('storage', {path: '/system/users.json', key: username}, {username: username}).then(user => {
                    list.add(user.username, user.username);
                });
            }
        });
    };

    passwordButton.onclick = () => {
        if (!selection) {
            return;
        }
        frame.prompt('Change password', 'Enter new password', '', 'password').then(password => {
            if (password) {
                TEXTSTEP.put('storage', {path: '/system/users.json', key: selection}, {password: password}).then(() => {
                    frame.alert('Success', 'Password changed!');
                });
            }
        });
    };

    sessionsButton.onclick = () => {
        if (!selection) {
            return;
        }
        let dialog = new ui.Dialog(frame);
        dialog.width = '100%';
        dialog.maxWidth = '400px';
        dialog.padding();
        dialog.title = 'Sessions for: ' + selection;
        dialog.append(sessionPanel(selection, dialog));
        dialog.open();
    };

    groupsButton.onclick = () => {
        if (!selection) {
            return;
        }
        let dialog = new ui.Dialog(frame);
        dialog.width = '100%';
        dialog.maxWidth = '400px';
        dialog.padding();
        dialog.title = 'Groups for: ' + selection;
        let groupList = new ui.ListView();
        groupList.height = '300px';
        for (let group of users[selection].groups) {
            groupList.add(group, group);
        }
        dialog.append(groupList);
        let row = new ui.StackRow();
        row.padding('top');
        row.innerPadding = true;
        row.alignItems = 'center';
        dialog.append(row);
        row.append(ui.elem('label', {}, ['Add group:']), {shrink: 0});
        row.append(ui.elem('input', {type: 'text'}));
        row.append(new ui.Button('Add'));
        dialog.append(ui.Dialog.footer(dialog, ['Close']));
        dialog.open();
    };

    deleteButton.onclick = () => {
        if (!selection) {
            return;
        }
        frame.confirm('Delete user', 'Delete user: ' + selection + '?').then(choice => {
            if (choice === 0) {
                TEXTSTEP.delete('storage', {path: '/system/users.json', key: selection}).then(() => {
                    delete users[selection];
                    list.removeItem(selection);
                });
            }
        });
    };

    TEXTSTEP.get('storage', {path: '/system/users.json'}).then(data => {
        users = data;
        for (let username in users) {
            if (users.hasOwnProperty(username)) {
                let item = list.add(username, username);
                if (username === TEXTSTEP.user.username) {
                    item.label += ' (you)';
                    item.outer.style.fontWeight = '600';
                }
            }
        }
    });

    return dialog;
}

function groupPanel(frame) {
    let dialog = new ui.StackColumn();

    let row = new ui.StackRow();
    row.innerPadding = true;
    dialog.append(row, {grow: 1});

    let list = new ui.ListView();
    list.height = '300px';
    row.append(list, {grow: 1});

    let actions = new ui.StackColumn();
    actions.innerPadding = true;
    row.append(actions);

    let newButton = new ui.Button('New group');
    if (TEXTSTEP.hasPermission('groups.create')) {
        actions.append(newButton);
    }

    let permissionsButton = new ui.Button('Permissions');
    permissionsButton.disabled = true;
    if (TEXTSTEP.hasPermission('sysacl.view')) {
        actions.append(permissionsButton);
    }

    let membersButton = new ui.Button('Members');
    membersButton.disabled = true;
    if (TEXTSTEP.hasPermission('users.update.groups')) {
        actions.append(membersButton);
    }

    let deleteButton = new ui.Button('Delete');
    deleteButton.disabled = true;
    if (TEXTSTEP.hasPermission('groups.delete')) {
        actions.append(deleteButton);
    }

    let selection = null;

    list.onselect = id => {
        selection = id;
        list.select(id);
        permissionsButton.disabled = !selection;
        membersButton.disabled = !selection;
        deleteButton.disabled = !selection;
    };

    newButton.onclick = () => {
        frame.prompt('New group', 'Enter group name').then(name => {
            if (name) {
                TEXTSTEP.post('storage', {path: '/system/groups.json', key: name}, {name: name}).then(group => {
                    list.add(group.name, group.name);
                });
            }
        });
    };

    deleteButton.onclick = () => {
        if (!selection) {
            return;
        }
        frame.confirm('Delete group', 'Delete group: ' + selection + '?').then(choice => {
            if (choice === 0) {
                TEXTSTEP.delete('storage', {path: '/system/groups.json', key: selection}).then(() => {
                    list.removeItem(selection);
                });
            }
        });
    };


    TEXTSTEP.get('storage', {path: '/system/groups.json'}).then(groups => {
        for (let group in groups) {
            if (groups.hasOwnProperty(group)) {
                list.add(group, group);
            }
        }
    });

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
    bg.onchange = value => {
        TEXTSTEP.setSkinProperty(bgVar, value);
        TEXTSTEP.setSkinProperty('path', null)
    };
    grid.append(bg);

    grid.append(label('Text:'));
    let fg = new ui.ColorButton(frame);
    let fgVar = `${name}-fg`;
    fg.color = TEXTSTEP.getSkinProperty(fgVar).trim();
    fg.onchange = value => {
        TEXTSTEP.setSkinProperty(fgVar, value);
        TEXTSTEP.setSkinProperty('path', null)
    };
    grid.append(ui.elem('div', {}, [fg.outer]));

    TEXTSTEP.addEventListener('skinChanged', () => {
        bg.value = TEXTSTEP.getSkinProperty(bgVar).trim();
        fg.color = TEXTSTEP.getSkinProperty(fgVar).trim();
    });
    return fieldSet;
}

function appearancePanel(frame) {

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
    let selectCurrentSkin = () => {
        let skin = TEXTSTEP.getSkin();
        if (skin.hasOwnProperty('path') && typeof skin.path === 'string') {
            let existing = Array.prototype.find.call(skinSelect.options, option => option.value === skin.path);
            if (!existing) {
                let name = skin.path.replace(/^.*?\/([^\/]*?)(\.json)?$/i, '$1');
                skinSelect.appendChild(ui.elem('option', {value: skin.path}, [name]));
            }
            skinSelect.value = skin.path;
        } else {
            let existing = Array.prototype.find.call(skinSelect.options, option => option.value === '');
            if (!existing) {
                skinSelect.appendChild(ui.elem('option', {value: ''}, ['Unnamed color scheme']));
            }
            skinSelect.value = '';
        }
    };
    TEXTSTEP.get('file', {path: '/dist/themes/default/skins', list: true}).then(dir => {
        dir.files.forEach(skin => {
            if (skin.name.match(/\.json$/i)) {
                let name = skin.name.replace(/\.json$/i, '');
                skinSelect.appendChild(ui.elem('option', {value: skin.path}, [name]));
            }
        });
        skinSelect.disabled = false;
        selectCurrentSkin();
    });
    skinSelect.onchange = () => {
        if (!skinSelect.value) {
            return;
        }
        TEXTSTEP.get('content', {path: skinSelect.value}).then(skin => {
            skin.path = skinSelect.value;
            TEXTSTEP.applySkin(skin);
        });
    };
    skinRow.append(skinSelect, {grow: 1});

    let skinBrowse = ui.elem('button', {}, ['Open']);
    skinBrowse.onclick = () => {
        frame.openFile('Load skin').then(path => {
            if (!path) {
                return;
            }
            TEXTSTEP.get('content', {path: path[0]}).then(skin => {
                skin.path = path[0];
                TEXTSTEP.applySkin(skin);
                let name = skin.path.replace(/^.*?\/([^\/]*?)(\.json)?$/i, '$1');
                skinSelect.appendChild(ui.elem('option', {value: skin.path}, [name]));
                skinSelect.value = skin.path;
            });
        });
    };
    skinRow.append(skinBrowse);

    let skinSave = ui.elem('button', {}, ['Save as']);
    skinSave.onclick = () => {
        frame.saveFile('Save skin').then(path => {
            if (!path) {
                return;
            }
            let skin = TEXTSTEP.getSkin();
            delete skin.path;
            TEXTSTEP.put('content', {path: path}, TEXTSTEP.getSkin()).then(() => {
                skin.path = path;
                TEXTSTEP.applySkin(skin);
            });
        });
    };
    skinRow.append(skinSave);

    dialog.append(widgetStyle(frame, 'Background', 'desktop'));

    dialog.append(widgetStyle(frame, 'Active title bars', 'active-titlebar'));

    dialog.append(widgetStyle(frame, 'Inactive title bars', 'inactive-titlebar'));

    dialog.append(widgetStyle(frame, 'Frames', 'frame'));

    dialog.append(widgetStyle(frame, 'Dock frames', 'dock-frame'));

    dialog.append(widgetStyle(frame, 'Menu buttons', 'menu-item'));

    dialog.append(widgetStyle(frame, 'Buttons', 'button'));

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
    if (TEXTSTEP.hasPermission('users.self.update.password')) {
        pageView.addPage('password', 'Change password', passwordPanel(frame));
    }
    if (TEXTSTEP.hasPermission('sessions.self.view')) {
        pageView.addPage('sessions', 'Sessions', sessionPanel());
    }
    if (TEXTSTEP.hasPermission('users.view')) {
        pageView.addPage('users', 'Users', userPanel(frame));
    }
    if (TEXTSTEP.hasPermission('groups.view')) {
        pageView.addPage('groups', 'Groups', groupPanel(frame));
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
            if (args.page) {
                pageView.select(args.page);
            }
        }
        app.setArgs({page: pageView.pageId});
    };
});
