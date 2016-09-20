/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');

exports.define = defineAction;
exports.enable = enable;
exports.disable = disable;

function defineAction(name, callback)
{
    $('[data-action="' + name + '"]').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        callback();
        return false;
    });
}

function enable(name)
{
    if (typeof name === 'string') {
        $('[data-action="' + name + '"]').attr('disabled', false);
    } else {
        name.forEach(enable);
    }
}

function disable(name)
{
    if (typeof name === 'string') {
        $('[data-action="' + name + '"]').attr('disabled', true);
    } else {
        name.forEach(disable);
    }
}