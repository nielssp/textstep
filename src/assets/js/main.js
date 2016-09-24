/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');

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

$('[data-action="toggle-menu"]').click(function (e) {
    e.preventDefault();
    $('body').toggleClass('show-menu');
    e.stopPropagation();
});
$('body').click(function (e) {
    if ($('body').hasClass('show-menu')) {
        $('body').removeClass('show-menu');
    }
});