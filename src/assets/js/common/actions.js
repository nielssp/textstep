/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');

exports.define = defineAction;

function defineAction(name, callback) {
    $('[data-action="' + name + '"]').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        callback();
        return false;
    });
}