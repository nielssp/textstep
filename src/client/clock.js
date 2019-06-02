/*
 * TEXTSTEP 
 * Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

const ui = TEXTSTEP.ui;

function lead(n) {
    return n < 10 ? '0' + n : '' + n;
}

TEXTSTEP.initApp('clock', [], function (app) {
    let clock = ui.elem('div');
    clock.textContent = '00:00';
    clock.style.fontSize = '10px';
    clock.style.fontFamily = 'monospace';
    clock.style.fontStyle = 'italic';
    clock.style.alignSelf = 'center';
    clock.style.color = '#00C9C1';
    clock.style.background = '#202020';
    clock.style.borderTop = '1px solid #000';
    clock.style.borderLeft = '1px solid #000';
    clock.style.borderBottom = '1px solid #fff';
    clock.style.borderRight = '1px solid #fff';
    clock.style.padding = '2px';
    app.dockFrame.innerHTML = '';
    app.dockFrame.style.padding = '0';
    app.dockFrame.style.display = 'flex';
    app.dockFrame.style.justifyContent = 'center';
    app.dockFrame.appendChild(clock);

    let interval = null;

    app.onOpen = () => {
        if (!interval) {
            interval = setInterval(() => {
                let d = new Date();
                clock.textContent = lead(d.getHours()) + ':' + lead(d.getMinutes());
            }, 1000);
        }
    };

    app.onClose = () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    };
});
