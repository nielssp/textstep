/* 
 * BlogSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');

exports.shake = function (el, amount) {
    amount = typeof amount === "undefined" ? 10 : amount;
    var dbl = amount * 2;
    return $(el).width($(el).width())
            .css('position', 'absolute')
            .animate({left: '+=' + amount}, 50)
            .animate({left: '-=' + dbl}, 50)
            .animate({left: '+=' + dbl}, 50)
            .animate({left: '-=' + amount}, 50)
            .queue(function () {
                $(el).css('position', '')
                        .css('width', '')
                        .css('left', '')
                        .finish();
            });
};
