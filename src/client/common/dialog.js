/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';

export default function Dialog(parent) {
    this.deferred = null;
    this.parent = parent;
    
    this.titleElem = ui.elem('div', {'class': 'frame-title'}, []);
    this.headElem = ui.elem('div', {'class': 'frame-head'}, [this.titleElem]);
    this.bodyElem = ui.elem('form', {'class': 'frame-body'}, []);
    this.frameElem = ui.elem('div', {'class': 'frame'}, [this.headElem, this.bodyElem]);
    this.overlayElem = ui.elem('div', {'class': 'dialog-overlay'}, [this.frameElem]);
};

Dialog.prototype.setTitle = function (title) {
    this.titleElem.textContent = title;
};

Dialog.prototype.open = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.deferred = {
            resolve: resolve,
            reject: reject
        };
        self.parent.appendChild(self.overlayElem);
    });
};

Dialog.prototype.close = function (result) {
    this.overlayElem.parentNode.removeChild(this.overlayElem);
    if (this.deferred !== null) {
        this.deferred.resolve(result);
        this.deferred = null;
    }
};

Dialog.alert = function (parent, title, message) {
    var dialog = new Dialog(parent);
    dialog.setTitle(title);
    var content = ui.elem('div', {'class': 'frame-content'}, ['' + message]);
    var okButton = ui.elem('button', {}, ['OK']);
    okButton.onclick = function () {
        dialog.close();
    };
    okButton.onkeydown = function (e) {
        if (e.key === 'Escape') {
            dialog.close(null);
        }
    };
    var footer = ui.elem('div', {'class': 'frame-footer frame-footer-buttons'}, [okButton]);
    dialog.bodyElem.appendChild(content);
    dialog.bodyElem.appendChild(footer);
    var promise = dialog.open();
    okButton.focus();
    return promise;
};

Dialog.confirm = function (parent, title, message, choices = ['OK', 'Cancel'], defaultChoice = 'OK') {
    var dialog = new Dialog(parent);
    dialog.setTitle(title);
    var content = ui.elem('div', {'class': 'frame-content'}, ['' + message]);
    var footer = ui.elem('div', {'class': 'frame-footer frame-footer-buttons'}, []);
    var defaultButton = null;
    for (var i = 0; i < choices.length; i++) {
        footer.append(' ');
        let button = ui.elem('button', {}, [choices[i]]);
        footer.appendChild(button);
        button.onclick = function () {
            dialog.close(button.textContent);
        };
        button.onkeydown = function (e) {
            if (e.key === 'Escape') {
                dialog.close(null);
            }
        };
        if (choices[i] === defaultChoice) {
            defaultButton = button;
        }
    }
    dialog.bodyElem.appendChild(content);
    dialog.bodyElem.appendChild(footer);
    var promise = dialog.open();
    if (defaultButton !== null) {
        defaultButton.focus();
    }
    return promise;
};

Dialog.prompt = function (parent, title, message, value = '') {
    var dialog = new Dialog(parent);
    dialog.setTitle(title);
    var input = ui.elem('input', {type: 'text'}, []);
    var content = ui.elem('div', {'class': 'frame-content'}, [
        ui.elem('div', {}, ['' + message]),
        input
    ]);
    dialog.bodyElem.onsubmit = function (e) {
        dialog.close(input.value);
        return false;
    };
    input.onkeydown = function (e) {
        if (e.key === 'Escape') {
            dialog.close(null);
        }
    };
    var okButton = ui.elem('button', {}, ['OK']);
    okButton.onclick = function () {
        dialog.close(input.value);
    };
    okButton.onkeydown = function (e) {
        if (e.key === 'Escape') {
            dialog.close(null);
        }
    };
    var cancelButton = ui.elem('button', {}, ['Cancel']);
    cancelButton.onclick = function () {
        dialog.close(null);
    };
    cancelButton.onkeydown = function (e) {
        if (e.key === 'Escape') {
            dialog.close(null);
        }
    };
    var footer = ui.elem('div', {'class': 'frame-footer frame-footer-buttons'}, [okButton, ' ', cancelButton]);
    dialog.bodyElem.appendChild(content);
    dialog.bodyElem.appendChild(footer);
    var promise = dialog.open();
    input.focus();
    if (value.length > 0) {
        input.value = value;
        input.setSelectionRange(0, value.length)
    }
    return promise;
};
