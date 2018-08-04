/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';

export default function ToolFrame(title) {
    this.title = title;
    this.headElem = ui.elem('div', {'class': 'tool-frame-head'}, [title]);
    this.bodyElem = ui.elem('div', {'class': 'tool-frame-body'});
    this.elem = ui.elem('div', {'class': 'tool-frame'}, [
        this.headElem,
        this.bodyElem
    ]);
}

ToolFrame.prototype.setTitle = function (title) {
    this.title = tile;
    this.headElem.textContent = title;
};

ToolFrame.prototype.show = function () {
    this.elem.style.display = '';
};

ToolFrame.prototype.hide = function () {
    this.elem.style.display = 'none';
};

ToolFrame.prototype.appendChild = function (element) {
    this.bodyElem.appendChild(element);
};
