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
                    pairs.push(encodedKey + '[]=' + encodeURIComponent(value[i]));
                }
            } else if (typeof value === 'object' && value !== null) {
                for (var vKey in value) {
                    if (value.hasOwnProperty(vKey)) {
                        pairs.push(encodedKey + '[' + encodeURIComponent(vKey) + ']=' + encodeURIComponent(value[vKey]));
                    }
                }
            } else {
                pairs.push(encodedKey + '=' + encodeURIComponent(value));
            }
        }
    }
    return pairs.join('&');
}

export function unserializeQuery(query) {
    var pairs = query.replace(/^\?/, '').split('&');
    var object = {};
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if (pair.length == 2) {
            if (pair[0].endsWith('[]')) {
                var key = decodeURIComponent(pair[0].replace(/\[\]$/, ''));
                if (!object.hasOwnProperty(key)) {
                    object[key] = [];
                }
                object[key].push(decodeURIComponent(pair[1]));
            } else {
                object[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
        }
    }
    return object;
}

export function eventManager() {
    var em = function (eventType, handler) {
        if (!em.eventHandlers.hasOwnProperty(eventType)) {
            em.eventHandlers[eventType] = [];
        }
        em.eventHandlers[eventType].push(handler);
    };
    em.eventHandlers = {};
    em.fire = function (eventType, eventData) {
        if (em.eventHandlers.hasOwnProperty(eventType)) {
            em.eventHandlers[eventType].forEach(function (handler) {
                handler(eventData);
            });
        }
    };
    return em;
}

export function eventify(prototype) {
    prototype.on = function (eventType, handler) {
        if (!this.hasOwnProperty('eventHandlers')) {
            this.eventHandlers = {};
        }
        if (!this.eventHandlers.hasOwnProperty(eventType)) {
            this.eventHandlers[eventType] = [];
        }
        this.eventHandlers[eventType].push(handler);
    };

    prototype.fire = function (eventType, eventData) {
        if (!this.hasOwnProperty('eventHandlers')) {
            return;
        }
        if (this.eventHandlers.hasOwnProperty(eventType)) {
            this.eventHandlers[eventType].forEach(function (handler) {
                handler(eventData);
            });
        }
    };
}

export function humanSize(size) {
    if (size < 1024) {
        return size + ' B';
    } else if (size < 1024 * 1024) {
        return parseFloat(size / 1024).toFixed(1) + ' KiB';
    } else if (size < 1024 * 1024 * 1024) {
        return parseFloat(size / (1024 * 1024)).toFixed(1) + ' MiB';
    } else if (size < 1024 * 1024 * 1024 * 1024) {
        return parseFloat(size / (1024 * 1024 * 1024)).toFixed(1) + ' GiB';
    } else {
        return parseFloat(size / (1024 * 1024 * 1024 * 1024)).toFixed(1) + ' TiB';
    }
}

export function parseDate(dateString) {
    let m = dateString.match(/^(\d{4})-?(\d{2})-?(\d{2})[ T](\d{2}):?(\d{2}):?(\d{2})(?:\.(\d{3}))?(Z|[-+]\d{2}(?::?\d{2})?)?$/);
    if (!m) {
        return null;
    }
    let year = parseInt(m[1]);
    let month = parseInt(m[2]);
    let day = parseInt(m[3]);
    let hour = parseInt(m[4]);
    let minute = parseInt(m[5]);
    let second = parseInt(m[6]);
    let millisecond = 0;
    if (m[7]) {
        millisecond = parseInt(m[7]);
    }
    let date = new Date(year, month - 1, day, hour, minute, second, millisecond);
    if (m[8]) {
        let offset = date.getTimezoneOffset();
        if (m[8] !== 'Z') {
            let sign = m[8][0] === '+' ? 1 : -1;
            let offsetString = m[8].substring(1).replace(':', '');
            offset += sign * parseInt(offsetString.substring(0, 2)) * 60;
            if (offsetString.length > 2) {
                offset += sign * parseInt(offsetString.substring(2));
            }
        }
        date.setTime(date.getTime() - offset * 60000);
    }
    return date;
}
