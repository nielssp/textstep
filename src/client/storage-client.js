/*
 * TEXTSTEP 
 * Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

const ui = TEXTSTEP.ui;

TEXTSTEP.initApp('storage-client', [], app => {
    let frame = app.createFrame('Storage client');

    let pathInput = ui.elem('input', {type: 'text'});
    frame.appendChild(pathInput);

    let updateButton = ui.elem('button', {}, ['Update']);
    frame.appendChild(updateButton);

    let grid = ui.elem('table', {}, [ui.elem('thead', {}, [ui.elem('tr', {}, [
        ui.elem('th', {}, ['Key']),
        ui.elem('th', {}, ['Value']),
    ])])]);
    frame.appendChild(ui.elem('div', {'class': 'data-grid'}, [grid]));

    let gridBody = ui.elem('tbody');
    grid.appendChild(gridBody);

    updateButton.onclick = () => {
        let path = pathInput.value;
        TEXTSTEP.get('storage', {path: path}).then(data => {
            while (gridBody.rows.length > 0) {
                gridBody.deleteRow(0);
            }
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    let row = gridBody.insertRow();
                    row.insertCell().textContent = key;
                    if (typeof data[key] === 'object' && !Array.isArray(data[key]) && data[key] !== null) {
                        for (let valueKey in data[key]) {
                            if (data[key].hasOwnProperty(valueKey)) {
                                row.insertCell().textContent = JSON.stringify(data[key][valueKey]);
                            }
                        }
                    } else {
                        row.insertCell().textContent = JSON.stringify(data[key]);
                    }
                }
            }
        }, error => frame.alert('Error', error.message, error));
    };

    frame.onClose = () => app.close();

    app.onOpen = args => {
        if (!frame.isOpen) {
            frame.open();
        } else if (!frame.hasFocus) {
            frame.requestFocus();
        }
        app.setArgs({});
    };
});

