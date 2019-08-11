/* 
 * TEXTSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

export function dirName(path) {
    var path = path.replace(/\/[^\/]+$/, '');
    if (path === '') {
        return '/';
    }
    return path;
}

export function fileName(path) {
    return path.replace(/^.*\//, '');
}

export function fileExt(path) {
    return path.replace(/^.*?(?:\.([^.]+))?$/, '$1');
}

export function convert(path, cwd) {
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
