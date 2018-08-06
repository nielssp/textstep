/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

export function serializeQuery(query) {
    var pairs = [];
    for (var key in query) {
        if(query.hasOwnProperty(key)) {
            var encodedKey = encodeURIComponent(key);
            var value = query[key];
            if (Array.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    pairs.push(encodedKey + "[]=" + encodeURIComponent(value[i]));
                }
            } else {
                pairs.push(encodedKey + "=" + encodeURIComponent(value));
            }
        }
    }
    return pairs.join('&');
}
