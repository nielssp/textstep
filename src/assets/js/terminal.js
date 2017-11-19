/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');
var ui = require('./common/ui');

var self;
var $terminal;

var cwd = '/';
var buffer = '';
var cmdHistory = [];
var cmdHistoryPos = -1;
var readCallback = null;

var user = {};

var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

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
		self.setTitle(cwd + ' – Terminal');
		self.setArgs({ path: cwd });
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
	self.close();
    },
    open: function (args) {
	BLOGSTEP.open(convertPath(args));
	prompt();
    },
    edit: function (args) {
	BLOGSTEP.run('code-editor', {path: convertPath(args)});
	prompt();
    },
    run: function (args) {
        args = args.split(' ');
	BLOGSTEP.run(args[0], args.length > 1 ? { path: convertPath(args[1]) } : {});
	prompt();
    }
};

function open(app, args)
{
    self = app;
    buffer = '';
    exec('who-am-i', {}, function (data) {
	user = data;
	if (typeof args.path === 'string') {
	    cwd = args.path;
	}
    });
}

function resume(app)
{
    $terminal.focus();
}

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

function flush()
{
    $terminal.val(buffer);
    $terminal[0].scrollTop = $terminal[0].scrollHeight;
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
    BLOGSTEP.post(command, data).done(success).fail(function (xhr) {
	if (xhr.status === 404) {
	    writeLine(xhr.status + ' ' + command + ': command not found');
	} else if (typeof xhr.responseJSON !== 'undefined') {
	    writeLine(xhr.status + '(' + xhr.responseJSON.code + ') ' + xhr.responseJSON.message);
	} else {
	    writeLine(xhr.status + ' ' + xhr.statusText + ': ' + xhr.responseText);
	}
    }).always(prompt);
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

BLOGSTEP.init('terminal', function (app) {
    var menu = app.addMenu('Terminal');
    menu.addItem('Close', 'close');
    
    app.onOpen = open;
    
    app.onResume = resume;
    
    $terminal = app.frame.find('textarea');
    
    $terminal.attr('readonly', true);

    $terminal.click(function () {
	var start = $terminal[0].selectionStart;
	var end = $terminal[0].selectionEnd;
	if (start === end) {
	    if (start < buffer.length) {
		$terminal[0].selectionStart = $terminal.val().length;
	    }
	}
    });
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
	    return false;
	} else if (e.key === 'ArrowUp') {
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
	    return false;
	} else if (e.key === 'ArrowDown') {
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
	    return false;
	} else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
	    var start = $terminal[0].selectionStart;
	    var end = $terminal[0].selectionEnd;
	    if (start === end) {
		if (start <= buffer.length) {
		    return false;
		}
	    }
	}
	return true;
    });

});