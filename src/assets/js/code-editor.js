/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var actions = require('./common/actions');
var ui = require('./common/ui');

var CodeMirror = require('codemirror');
require('codemirror/lib/codemirror.css');
require('codemirror/mode/php/php');
require('codemirror/mode/css/css');
require('codemirror/mode/sass/sass');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');

var PATH = $('body').data('path').replace(/\/$/, '');
var TOKEN = $('#editor').data('token');

var path = $('#editor').data('path');

$(document).ajaxError(ui.handleError);

actions.define('new', newFile);
actions.define('save', saveFile);
actions.define('close', function () {
    location.href = PATH + '/files?path=' + path;
});

var mode = path.replace(/^.*\.([^.]+)$/, '$1');
switch (mode) {
    case 'scss':
        mode = 'sass';
        break;
    case 'html':
    case 'htm':
        mode = 'php';
        break;
    case 'json':
    case 'js':
        mode = 'javascript';
        break;
}
var codemirror = CodeMirror.fromTextArea($('#editor')[0], {
    lineNumbers: true,
    mode: mode
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
        }
    });
}

function newFile()
{
    alert('not implemented');
}

function resizeView()
{
    codemirror.refresh();
}

$(document).keydown(function (e) {
    if (e.key === 's' && e.ctrlKey) {
        saveFile();
        return false;
    }
});

resizeView();
$(window).resize(resizeView);