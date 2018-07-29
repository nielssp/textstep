/* 
 * BlogSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

export default function Locale(messages) {
    this.messages = messages;
    this.plurals = 2;
    this.pluralExpr = 'n != 1';
}

var defaultProperties = {
    name: 'English',
    localName: 'English',
    region: '',
    
    shortDate: 'Y-m-d',
    mediumDate: 'Y-m-d',
    longDate: 'Y-m-d',
    shortTime: 'H:i',
    mediumTime: 'H:i:s',
    longTime: 'H:i:s T',
    shortDateTime: 'Y-m-d H:i',
    mediumDateTime: 'Y-m-d H:i:s',
    longDateTime: 'Y-m-d H:i:s T',
    
    decimalPoint: '.',
    thousandsSep: ','
};

Locale.prototype.getProperty = function (property) {
    if (this.messages.hasOwnProperty('[Locale::' + property + ']')) {
        return this.messages['[Locale::' + property + ']'][0];
    } else if (defaultProperties.hasOwnProperty(property)) {
        return defaultProperties[property];
    }
};

Locale.prototype.setProperty = function (property, value) {
    this.messages['[Locale::' + property + ']'] = [value];
};

Locale.prototype.deleteProperty = function (property) {
    if (this.messages.hasOwnProperty('[Locale::' + property + ']')) {
        delete this.messages['[Locale::' + property + ']'];
    }
};

Locale.prototype.setPluralForms = function (pluralForms) {
    pluralForms = pluralForms.trim();
    var rx = /^nplurals *= *([0-9]+) *; *plural *=(.+);$/;
    var result = rx.exec(pluralForms);
    if (result) {
        this.plurals = parseInt(result[1]);
        this.pluralExpr = result[2];
    }
};

Locale.replacePlaceholders = function (message, values) {
    for (var i = 0; i < values.length; i++) {
        message = message.replace('%' + (i + 1), values[i]);
    }
    return message;
};

Locale.prototype.getText = function (message) {
    if (this.messages.hasOwnProperty(message)) {
        message = this.messages[message][0];
    }
    return Locale.replacePlaceholders(message, Array.prototype.slice.call(arguments, 1));
};

Locale.prototype.evalPluralExpr = function (n) {
    return eval(this.pluralExpr);
};

Locale.prototype.nGetText = function (plural, singular, n) {
    var message = plural;
    if (this.messages.hasOwnProperty(plural)) {
        var i = this.evalPluralExpr(n);
        if (typeof i === 'boolean') {
            i = i ? 1 : 0;
        }
        if (isset(this.messages[plural][i])) {
            message = this.messages[plural][i];
        } else {
            message = this.messages[plural][0];
        }
    } else if (Math.abs(n) === 1) {
        message = singular;
    }
    return Locale.replacePlaceholders(message, Array.prototype.slice.call(arguments, 2));
};