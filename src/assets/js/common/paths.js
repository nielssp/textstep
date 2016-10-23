/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

exports.convert = convert;

function convert(path, cwd)
{
    path = path.trim();
    if (!path.startsWith('/')) {
        path = cwd + '/' + path;
    }
    var names = path.split('/');
    var stack = [];
    for (var i = 0; i < names.length; i++) {
        if (names[i] === '..') {
            if (stack.length >= 1) {
                stack.pop();
            }
        } else if (names[i] !== '' && names[i] !== '.') {
            stack.push(names[i]);
        }
    }
    return '/' + stack.join('/');
}