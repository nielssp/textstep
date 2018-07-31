/*
 * BlogSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var Cookies = require('js-cookie');

$.ajaxSetup({
    headers: { 'X-Csrf-Token': Cookies.get('csrf_token') }
});

export function elem(tag, attributes = {}, children = []) {
    var elem = document.createElement(tag);
    for (var k in attributes) {
        if (attributes.hasOwnProperty(k)) {
            elem.setAttribute(k, attributes[k]);
        }
    }
    for (var i = 0; i < children.length; i++) {
        if (typeof children[i] === 'string') {
            elem.appendChild(document.createTextNode(children[i]));
        } else {
            elem.appendChild(children[i]);
        }
    }
    return elem;
}

export function byId(id) {
    return document.getElementById(id);
}

export var shake = function (el, amount) {
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

export var onLongPress = function(el, callback) {
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

export var setProgress = function(el, progress, status) {
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

export var handleLogin = function (done) {
    var path = $('body').data('path').replace(/\/$/, '');
    $('#login').find('input').prop('disabled', false);
    $('#login-frame').show();
    $('#login').submit(function () {
        $(this).find('input').prop('disabled', true);
        $.ajax({
            url: path,
            method: 'post',
            data: {
                username: $('#login-username').val(),
                password: $('#login-password').val(),
                remember: $('#login-remember').is(':checked') ? { remember: 'remember' } : null
            },
            success: function () {
                $('#login-frame').css({overflow: 'hidden', whiteSpace: 'no-wrap'}).animate({width: 0}, function () {
                    $(this).hide().css({overflow: '', whiteSpace: '', width: ''});
                    $('#login').off('submit');
                    $('#login-password').val('');
                    done();
                });
            },
            error: function (xhr) {
                $('#login').find('input').prop('disabled', false);
                shake($('#login-frame'));
                $('#login-username').select();
                $('#login-password').val('');
            },
            global: false
        });
        return false;
    });
};

export var handleError = function (event, xhr, settings, thrownError) {
    var newToken = Cookies.get('csrf_token');
    if (settings.headers['X-Csrf-Token'] !== newToken) {
        $.ajaxSetup({
            headers: { 'X-Csrf-Token': newToken }
        });
        settings.headers['X-Csrf-Token'] = newToken;
        $.ajax(settings);
        return;
    }
    if (xhr.status === 401) {
        $('#login-overlay').show();
        if ($('#login-username').val() === '') {
            $('#login-username').focus();
        } else {
            $('#login-password').focus();
        }
        handleLogin(function () {
            $('#login-overlay').hide();
            $.ajax(settings);
        });
        return;
    } else if (typeof xhr.responseJSON !== 'undefined') {
        alert(xhr.responseJSON.message);
    } else {
        alert(xhr.responseText);
    }
    shake($('main > .frame.active'));
    console.log(event, xhr, settings, thrownError);
};
