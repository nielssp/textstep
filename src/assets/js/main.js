/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var ui = require('./common/ui');
window.$ = $;

$('[data-toggle]').each(function () {
    var $buttons = $(this).find($(this).data('toggle'));
    $buttons.click(function () {
        $(this).toggleClass('active');
    });
});

$('[data-choice]').each(function () {
    var $buttons = $(this).find($(this).data('choice'));
    $buttons.click(function () {
        $buttons.removeClass('active');
        $(this).addClass('active');
    });
});

$('body').on('click', '[data-action="toggle-menu"]', function (e) {
    $('body').toggleClass('show-menu');
    return false;
});
$('body').click(function (e) {
    if ($('body').hasClass('show-menu')) {
        $('body').removeClass('show-menu');
    }
});
