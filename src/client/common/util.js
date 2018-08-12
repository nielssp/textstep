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
