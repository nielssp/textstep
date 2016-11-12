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
            .animate({marginLeft: '+=' + amount}, 50)
            .animate({marginLeft: '-=' + dbl}, 50)
            .animate({marginLeft: '+=' + dbl}, 50)
            .animate({marginLeft: '-=' + amount}, 50)
            .queue(function () {
                $(el).css('width', '')
                        .css('margin-left', '')
                        .finish();
            });
};

exports.onLongPress = function(el, callback) {
    var touching = false;
    
    var start = function (e) {
        touching = true;
    };
    
    var end = function (e) {
        touching = false;
    };
    
    el.addEventListener('touchstart', start);
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    el.addEventListener('touchmove', end);
    el.addEventListener('contextmenu', function (e) {
        if (touching) {
            return callback(e);
        }
    });
};

exports.setProgress = function(el, progress, status) {
    var bar = el.children[0];
    var label = el.children[1];
    progress = Math.floor(progress);
    if (progress >= 100) {
        el.className = 'progress success';
    } else {
        el.className = 'progress active';
    }
    bar.style.width = progress + '%';
    bar.innerText = progress + '%';
    if (typeof status !== 'undefined') {
        label.innerText = status;
    }
};

exports.handleError = function (event, jqxhr, settings, thrownError) {
    if (typeof jqxhr.responseJSON !== 'undefined') {
        alert(jqxhr.responseJSON.message);
    } else {
        alert(jqxhr.responseText);
    }
    exports.shake($('.frame'));
    console.log(event, jqxhr, settings, thrownError);
};