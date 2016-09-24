/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var actions = require('./common/actions');

var CodeMirror = require('codemirror');
require('codemirror/lib/codemirror.css');
require('codemirror/mode/php/php');
require('codemirror/mode/htmlmixed/htmlmixed');

var PATH = $('body').data('path').replace(/\/$/, '');
var TOKEN = $('#editor').data('token');

var path = $('#editor').data('path');

actions.define('new', newFile);
actions.define('save', saveFile);
actions.define('close', function () {
    location.href = PATH + '/files' + path;
});


var codemirror = CodeMirror.fromTextArea($('#editor')[0], {
    lineNumbers: true,
    mode: 'php'
});


function saveFile()
{
    codemirror.save();
    $.ajax({
        url: PATH + '/api/edit',
        method: 'post',
        data: {request_token: TOKEN, path: path, data: $('#editor').val()},
        success: function (data) {
            alert('Saved!');
        },
        error: function () {
            alert('could not save file');
        }
    });
}

function newFile()
{
    alert('not implemented');
}

function resizeView()
{
    $('.CodeMirror').height($(window).height() - 200);
}

$(document).keydown(function (e) {
    if (e.key === 's' && e.ctrlKey) {
        saveFile();
        return false;
    }
});

resizeView();
$(window).resize(resizeView);