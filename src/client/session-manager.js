/*
 * TEXTSTEP 
 * Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

const ui = TEXTSTEP.ui;

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

TEXTSTEP.initApp('session-manager', [], app => {
    let frame = app.createFrame('Session manager');

    let list = ui.elem('ul');
    frame.appendChild(list);

    let sessions = [];

    frame.onClose = () => app.close();

    app.onOpen = args => {
        if (!frame.isOpen) {
            frame.open();
            TEXTSTEP.get('storage', {path: '/system/sessions.json'}).then(result => {
                list.innerHTML = '';
                sessions = result;
                for (let sessionId in sessions) {
                    if (sessions.hasOwnProperty(sessionId)) {
                        let session = sessions[sessionId];
                        let item = ui.elem('li');
                        item.textContent = sessionId.substring(0, 6);
                        if (typeof session.userAgent === 'string') {
                            let ua = session.userAgent.toLowerCase();
                            item.textContent += ' (' + guessBrowser(ua);
                            item.textContent += ' on ' + guessOs(ua) + ')';
                        } else {
                            item.textContent += ' (unknown)';
                        }
                        item.textContent += ', expires on ' + session.validUntil;
                        let deleteButton = ui.elem('button', {}, ['Delete']);
                        item.appendChild(deleteButton);
                        deleteButton.onclick = () => TEXTSTEP.delete('storage', {path: '/system/sessions.json', key: sessionId}).then(() => {
                            list.removeChild(item);
                        });
                        list.appendChild(item);
                    }
                }
            });
        } else if (!frame.hasFocus) {
            frame.requestFocus();
        }
        app.setArgs({});
    };
});

