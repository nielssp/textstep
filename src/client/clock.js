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

function initAnalog() {
    const face = ui.elem('canvas');
    face.style.width = '42px';
    face.style.height = '42px';
    face.width = 42;
    face.height = 42;
    return face;
}

function initDigital() {
    const clock = ui.elem('div');
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
    return clock;
}

function renderAnalog(face, date) {
    let ctx = face.getContext('2d');

    ctx.clearRect(0, 0, face.width, face.height);

    ctx.beginPath();
    for (let s = 0; s < 12; s++) {
        let x = Math.sin(s / 6 * Math.PI);
        let y = Math.cos(s / 6 * Math.PI);
        ctx.moveTo(21 + x * 20, 21 + y * 20);
        if (s % 3 == 0) {
            ctx.lineTo(21 + x * 16, 21 + y * 16);
        } else {
            ctx.lineTo(21 + x * 18, 21 + y * 18);
        }
    }
    ctx.stroke();

    let x = Math.sin((18 - date.getHours() - date.getMinutes() / 60) / 6 * Math.PI);
    let y = Math.cos((18 - date.getHours() - date.getMinutes() / 60) / 6 * Math.PI);
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineWidth = 3.0;
    ctx.moveTo(21, 21);
    ctx.lineTo(21 + x * 5, 21 + y * 5);
    ctx.stroke();

    x = Math.sin((90 - date.getMinutes()) / 30 * Math.PI);
    y = Math.cos((90 - date.getMinutes()) / 30 * Math.PI);
    ctx.beginPath();
    ctx.lineWidth = 2.0;
    ctx.moveTo(21, 21);
    ctx.lineTo(21 + x * 9, 21 + y * 9);
    ctx.stroke();

    x = Math.sin((90 - date.getSeconds()) / 30 * Math.PI);
    y = Math.cos((90 - date.getSeconds()) / 30 * Math.PI);
    ctx.beginPath();
    ctx.lineCap = 'butt';
    ctx.lineWidth = 1.0;
    ctx.moveTo(21, 21);
    ctx.lineTo(21 + x * 15, 21 + y * 15);
    ctx.stroke();
}

TEXTSTEP.initApp('clock', [], app => {
    let analog = localStorage.getItem('textstepClockMode') === 'analog';
    let face = null;
    let clock = null;
    app.dockFrame.innerHTML = '';
    app.dockFrame.style.padding = '0';
    app.dockFrame.style.display = 'flex';
    app.dockFrame.style.justifyContent = 'center';
    if (analog) {
        face = initAnalog();
        app.dockFrame.appendChild(face);
    } else {
        clock = initDigital();
        app.dockFrame.appendChild(clock);
    }

    function changeMode() {
        analog = !analog;
        if (analog) {
            localStorage.setItem('textstepClockMode', 'analog');
            app.dockFrame.removeChild(clock);
            clock = null;
            face = initAnalog();
            app.dockFrame.appendChild(face);
        } else {
            localStorage.setItem('textstepClockMode', 'digital');
            app.dockFrame.removeChild(face);
            face = null;
            clock = initDigital();
            app.dockFrame.appendChild(clock);
        }
        update();
    }

    app.dockMenu.insertItem(1, 'Mode', () => changeMode());
    app.dockFrame.addEventListener('dblclick', () => changeMode());

    let interval = null;

    function update() {
        let d = new Date();
        if (clock) {
            clock.textContent = lead(d.getHours()) + ':' + lead(d.getMinutes());
        } else if (face) {
            renderAnalog(face, d);
        }
    }

    app.onOpen = () => {
        if (!interval) {
            update();
            interval = setInterval(() => update(), 1000);
        }
    };

    app.onClose = () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    };
});
