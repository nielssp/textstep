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

TEXTSTEP.initApp('control-panel', [], function (app) {
    let frame = app.createFrame('Control panel');

    let config = new Config(() => TEXTSTEP.get('content', {path: '/site/site.json'}), data =>
        TEXTSTEP.put('content', {path: '/site/site.json'}, data));

    app.dockFrame.innerHTML = '';
    app.dockFrame.appendChild(TEXTSTEP.getIcon('control-panel', 32));

    let pageContainer = new ui.StackRow();
    pageContainer.padding();
    frame.append(pageContainer, {grow: 1});

    let pageList = new ui.ListView();
    pageList.width = '200px';
    pageList.add('Site');
    pageContainer.append(pageList);
    pageList.onselect = item => {
        pageList.select(item);
        if (!main.visible) {
            main.visible = true;
            pageList.visible = false;
        }
    };

    let main = new ui.StackColumn();
    pageContainer.append(main, {grow: 1});

    let mainToolbar = new ui.Toolbar(); 
    mainToolbar.padding('bottom');
    mainToolbar.addItem('Back', 'go-back', () => {
        if (!pageList.visible) {
            main.visible = false;
            pageList.visible = true;
        }
    });
    main.append(mainToolbar);

    let mainContent = new ui.DialogContainer();
    mainContent.padding();
    mainContent.maxWidth = 450;
    main.append(mainContent, {grow: 1});

    let adjustContent = () => {
        pageList.visible = true;
        if (pageContainer.width < 400) {
            main.visible = false;
            mainToolbar.visible = true;
            pageList.width = '100%';
        } else {
            main.visible = true;
            mainToolbar.visible = false;
            pageList.width = '200px';
        }
    };

    frame.onResize = adjustContent;

    let fieldSet1 = new ui.FieldSet();
    fieldSet1.legend = 'Site properties';
    mainContent.append(fieldSet1);

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
    mainContent.append(fieldSet2);

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
    buttons.outer.style.gridColumn = 'span 2';
    buttons.outer.style.justifySelf = 'end';
    buttons.append(saveButton);
    buttons.append(cancelButton);
    mainContent.append(buttons.outer);

    frame.onClose = () => app.close();
    
    app.onOpen = args => {
        if (!frame.isOpen) {
            frame.open();
            adjustContent();
            config.update();
        } else {
            frame.requestFocus();
        }
        app.setArgs({});
    };
});
