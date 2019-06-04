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

    frame.appendChild(field('Title', config, 'title'));
    frame.appendChild(field('Subtitle', config, 'subtitle'));
    frame.appendChild(field('Description', config, 'description'));
    frame.appendChild(field('Copyright', config, 'copyright'));
    frame.appendChild(field('Time zone', config, 'timeZone'));

    frame.defineAction('save', () => {
        config.commit();
    });
    frame.defineAction('reload', () => {
        config.update();
    });
    
    let menu = frame.addMenu('Control panel');
    menu.addItem('Save', 'save');
    menu.addItem('Reload', 'reload');
    menu.addItem('Close', 'close');

    frame.onClose = () => app.close();
    
    app.onOpen = args => {
        if (!frame.isOpen) {
            frame.open();
            config.update();
        } else {
            frame.requestFocus();
        }
        app.setArgs({});
    };
});
