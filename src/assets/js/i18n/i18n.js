/* 
 * BlogSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


import Locale from './Locale';

var locale = null;

export function getLocale() {
    if (locale === null) {
        locale = new Locale({});
    }
    return locale;
}

export function tr() {
    return getLocale().getText.apply(null, arguments);
}

export function tn() {
    return getLocale().nGetText.apply(null, arguments);
}