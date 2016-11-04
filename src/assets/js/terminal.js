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

var user = {};
var cwd = '/';

var PATH = $('body').data('path').replace(/\/$/, '');
var TOKEN = $terminal.data('token');

var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

actions.define('close', function () {
    location.href = PATH + '/files' + cwd;
});

function convertPath(path)
{
    path = path.trim();
    if (path.startsWith('~')) {
        path = user.home + path.substr(1);
    } else if (!path.startsWith('/')) {
        path = cwd + '/' + path;
    }
    var names = path.split('/');
    var stack = [];
    for (var i = 0; i < names.length; i++) {
        if (names[i] === '..') {
            if (stack.length >= 1) {
                stack.pop();
            }
        } else if (names[i] !== '' && names[i] !== '.') {
            stack.push(names[i]);
        }
    }
    return '/' + stack.join('/');
}

var commands = {
    clear: function (args) {
        buffer = '';
        flush();
        prompt();
    },
    cd: function (args) {
        var nwd = convertPath(args);
        exec('list-files?path=' + nwd, {}, function (data) {
            if (data.type === 'directory') {
                cwd = nwd;
            } else {
                writeLine('not a directory');
            }
        });
    },
    pwd: function (args) {
        writeLine(cwd);
        prompt();
    },
    ls: function (args) {
        exec('list-files?path=' + cwd, {}, function (data) {
            if (typeof data.files !== 'undefined') {
                data.files.forEach(function (file) {
                    var line = file.modeString;
                    line += ' \t' + file.owner;
                    line += ' \t' + file.group;
                    var date = new Date(file.modified * 1000);
                    line += ' \t' + date.getFullYear();
                    line += ' ' + months[date.getMonth()];
                    line += ' ' + date.getDate();
                    line += ' \t' + file.name;
                    if (file.type === 'directory') {
                        line += '/';
                    }
                    writeLine(line);
                });
            }
        });
    },
    touch: function (args) {
        exec('make-file', {path: convertPath(args)}, function (data) {
        });
    },
    mkdir: function (args) {
        exec('make-dir', {path: convertPath(args)}, function (data) {
        });
    },
    rm: function (args) {
        exec('delete', {path: convertPath(args)}, function (data) {
        });
    },
    cp: function (args) {
        args = args.split(' ');
        exec('copy', {path: convertPath(args[0]), destination: convertPath(args[1])}, function (data) {
        });
    },
    mv: function (args) {
        args = args.split(' ');
        exec('move', {path: convertPath(args[0]), destination: convertPath(args[1])}, function (data) {
        });
    },
    cat: function (args) {
        exec('download?path=' + convertPath(args), {}, function (data) {
            writeLine(data);
        });
    },
    exit: function (args) {
        location.href = PATH + '/files' + convertPath(args);
    },
    open: function (args) {
        location.href = PATH + '/open' + convertPath(args);
    },
    edit: function (args) {
        location.href = PATH + '/edit' + convertPath(args);
    },
    cedit: function (args) {
        location.href = PATH + '/code-edit' + convertPath(args);
    }
};

function flush()
{
    $terminal.val(buffer);
    $terminal[0].scrollTop = $terminal[0].scrollHeight;
//    $terminal.scrollTop($terminal.innerHeight());
}

function write(content)
{
    buffer += content;
    flush();
}

function writeLine(content)
{
    write(content + '\n');
}

function readLine(callback)
{
    $terminal.attr('readonly', false).focus();
    readCallback = callback;
}

function exec(command, data, success)
{
    data['request_token'] = TOKEN;
    $.ajax({
        url: PATH + '/api/' + command,
        method: 'post',
        data: data,
        success: success,
        error: function (xhr) {
            writeLine(xhr.status + ' ' + xhr.statusText);
        },
        complete: prompt
    });
}

function prompt()
{
    write(user.username + ' ' + cwd + '> ');
    cmdHistoryPos = -1;
    readLine(function (line) {
        var m = line.trim().match(/^([^ ]+)(?: (.*))?/);
        if (m === null) {
            writeLine('Invalid command');
            prompt();
        } else {
            var command = m[1];
            if (commands.hasOwnProperty(command)) {
                commands[command]((typeof m[2] === 'undefined')? '' : m[2]);
            } else {
                try {
                    var data = (typeof m[2] === 'undefined') ? {} : JSON.parse(m[2]);
                    exec(command, data, function (data) {
                        writeLine(JSON.stringify(data, null, '  '));
                    });
                } catch (e) {
                    writeLine(e);
                    prompt();
                }
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
    } else if (e.key == 'ArrowLeft' || e.key == 'Backspace') {
        var start = $terminal[0].selectionStart;
        var end = $terminal[0].selectionEnd;
        if (start === end) {
            if (start <= buffer.length) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }
});

$terminal.click(function () {
    var start = $terminal[0].selectionStart;
    var end = $terminal[0].selectionEnd;
    if (start === end) {
        if (start < buffer.length) {
            $terminal[0].selectionStart = $terminal.val().length;
        }
    }
});

exec('who-am-i', {}, function (data) {
    user = data;
});