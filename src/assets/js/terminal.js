/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var actions = require('./common/actions');

var $terminal = $('#terminal');

var buffer = '';
var cmdHistory = [];
var cmdHistoryPos = -1;
var readCallback = null;

var PATH = $('body').data('path').replace(/\/$/, '');
var TOKEN = $terminal.data('token');

function saveFile() {
    $.ajax({
        url: PATH + '/api/edit',
        method: 'post',
        data: {request_token: TOKEN, path: path, data: simplemde.value()},
        success: function (data) {
            alert('Saved!');
        },
        error: function () {
            alert('could not save file');
        }
    });
}

function resizeView() {
    $terminal.height($(window).height() - 200);
}

function flush() {
    $terminal.val(buffer);
    $terminal.scrollTop($terminal.innerHeight());
}

function write(content) {
    buffer += content;
    flush();
}

function writeLine(content) {
    write(content + '\n');
}

function readLine(callback) {
    $terminal.attr('readonly', false).focus();
    readCallback = callback;
}

function prompt() {
    write('> ');
    cmdHistoryPos = -1;
    readLine(function (line) {
        var m = line.match(/^([^ ]+)(?: (.*))?/);
        if (m === null) {
            writeLine('Invalid command');
            prompt();
        } else {
            var command = m[1];
            try {
                var data = (typeof m[2] === 'undefined') ? {} : JSON.parse(m[2]);
                data['request_token'] = TOKEN;
                $.ajax({
                    url: PATH + '/api/' + command,
                    method: 'post',
                    data: data,
                    success: function (data) {
                        writeLine(JSON.stringify(data, null, '  '));
                        prompt();
                    },
                    error: function (xhr, status) {
                        writeLine(xhr.status + ' ' + xhr.statusText);
                        prompt();
                    }
                });
            } catch (e) {
                writeLine(e);
                prompt();
            }
        }
    });
}

$terminal.attr('readonly', true);
$terminal.keydown(function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        if (readCallback !== null) {
            $terminal.attr('readonly', true).blur();
            var line = $terminal.val().substr(buffer.length);
            cmdHistory.push(line);
            buffer += line + '\n';
            flush();
            var callback = readCallback;
            readCallback = null;
            callback(line);
        }
        e.preventDefault();
        e.stopPropagation();
    } else if (e.key == 'ArrowUp') {
        if (readCallback !== null) {
            if (cmdHistory.length > 0) {
                if (cmdHistoryPos < 0) {
                    cmdHistoryPos = cmdHistory.length - 1;
                } else if (cmdHistoryPos > 0) {
                    cmdHistoryPos--;
                }
                $terminal.val(buffer + cmdHistory[cmdHistoryPos]);
            }
        }
        e.preventDefault();
        e.stopPropagation();
    } else if (e.key == 'ArrowDown') {
        if (readCallback !== null) {
            if (cmdHistory.length > 0 && cmdHistoryPos >= 0) {
                if (cmdHistoryPos < cmdHistory.length - 1) {
                    cmdHistoryPos++;
                    $terminal.val(buffer + cmdHistory[cmdHistoryPos]);
                } else {
                    cmdHistoryPos = -1;
                    $terminal.val(buffer);
                }
            }
        }
        e.preventDefault();
        e.stopPropagation();
    }
});
prompt();

resizeView();
$(window).resize(resizeView);