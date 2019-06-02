/* 
 * BlogSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

const ui = TEXTSTEP.ui;

function input(key, type = 'text') {
    let elem = ui.elem('input', {type: type});
    TEXTSTEP.config.get(key).bind(elem);
    return elem;
}

function field(label, key, type = 'text') {
    return ui.elem('div', {className: 'field'}, [
        ui.elem('label', {}, [label]),
        input(key, type)
    ])
}

TEXTSTEP.initApp('control-panel', [], function (app) {
    let frame = app.createFrame('Control panel');

    app.dockFrame.innerHTML = '';
    app.dockFrame.appendChild(TEXTSTEP.getIcon('control-panel', 32));

    frame.appendChild(field('Title', 'site.site.title'));
    frame.appendChild(field('Subtitle', 'site.site.subtitle'));
    frame.appendChild(field('Description', 'site.site.description'));
    frame.appendChild(field('Copyright', 'site.site.copyright'));
    frame.appendChild(field('Time zone', 'site.site.timeZone'));

    frame.defineAction('save', () => {
        TEXTSTEP.config.commit();
    });
    frame.defineAction('reload', () => {
        TEXTSTEP.config.update();
    });
    
    let menu = frame.addMenu('Control panel');
    menu.addItem('Save', 'save');
    menu.addItem('Reload', 'reload');
    menu.addItem('Close', 'close');

    frame.onClose = () => app.close();
    
    app.onOpen = args => {
        if (!frame.isOpen) {
            frame.open();
            TEXTSTEP.config.update();
        } else {
            frame.requestFocus();
        }
        app.setArgs({});
    };
});
