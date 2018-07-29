/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';

export default function Frame(title) {
    this.title = title;

    this.titleElem = ui.elem('div', {'class': 'frame-title'});
    this.headElem = ui.elem('div', {'class': 'frame-head'}, [this.titleElem]);
    this.contentElem = ui.elem('div', {'class': 'frame-content'});
    this.bodyElem = ui.elem('div', {'class': 'frame-body'}, [this.contentElem]);
    this.elem = ui.elem('div', {'class': 'frame'}, [this.headElem, this.bodyElem]);


    this.onOpen = null;
    this.onFocus = null;
    this.onUnfocus = null;
    this.onKeydown = null;
    this.onClose = null;
    this.onResize = null;
    this.isUnsaved = null;
}
