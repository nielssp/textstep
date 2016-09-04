/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = require('jquery');
var actions = require('./common/actions');

var PATH = $('body').data('path').replace(/\/$/, '');

var $columns = $('.files-columns');

var TOKEN = $columns.data('token');

var $currentColumn = $columns.children().first();

var cwd = $currentColumn.data('path');
$currentColumn.data('path', null);

var stack = [];

var selection = [];

var stackOffset = 0;

function open(path) {
    location.href = PATH + '/open' + path;
}

function initColumn($column) {
    $column[0].ondragenter = function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dropEffect = "copy";
        $column.addClass('accept');
        return false;
    };
    $column[0].ondragleave = function (e) {
        e.stopPropagation();
        e.preventDefault();
        $column.removeClass('accept');
        return false;
    };
    $column[0].ondragover = function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dropEffect = "copy";
        return false;
    };
    $column[0].ondrop = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var files = event.dataTransfer.files;
        var data = new FormData();
        data.append('request_token', TOKEN);
        for (var i = 0; i < files.length; i++) {
            data.append('file' + i, files[i]);
        }
        var request = new XMLHttpRequest();
        request.open("POST", PATH + '/api/upload?path=' + $column.data('path'));
        request.send(data);
        return false;
    };
}

function initFile($file) {
    if (!$(this).hasClass('file-directory')) {
        $file.dblclick(function () {
            open($(this).data('path'));
            return false;
        });
    }
    $file.click(function (event) {
        if (event.shiftKey) {
            // TODO: add to selection
            $(this).addClass('active');
        } else {
            cd($(this).data('path'));
            history.pushState({cwd: cwd}, document.title, PATH + '/files' + cwd);
            $(this).parent().parent().find('a').removeClass('active');
            $(this).addClass('active');
        }
        return false;
    });
}

function createFile(file) {
    var $file = $('<a class="file">');
    $file.text(file.name);
    if (stack.filter(function (elem) {
        return elem === file.path;
    }).length > 0) {
        $file.addClass('active');
    }
    $file.attr('data-path', file.path);
    $file.attr('href', PATH + '/files' + file.path);
    $file.addClass('file-' + file.type);
    initFile($file);
    return $file;
}

function addFile($column, file) {
    var $li = $('<li>');
    $li.append(createFile(file));
    $column.children('ul').append($li);
}

function addFileInfo($column, file) {
    var $li = $('<li class="file-info">');
    var $icon = $('<span class="file">');
    $icon.addClass('file-' + file.type);
    var $name = $('<span class="file-name">');
    $name.text(file.name);
    var $modified = $('<span class="file-modified">');
    $modified.text(new Date(file.modified * 1000).toString());
    var $button = $('<button>Open in editor</button>');
    $button.click(function () {
        open(file.path); 
    });
    $li.append($icon).append($name).append($modified).append($button);
    $column.children('ul').append($li);
}

var originalCwd = cwd;
window.onpopstate = function (event) {
    if (event.state !== null) {
        cd(event.state.cwd);
    } else if (originalCwd !== cwd) {
        cd(originalCwd);
    }
};

function goUp() {
    if (stack.length <= 1) {
        return;
    }
    stack.pop();
    cwd = stack[stack.length - 1];
    updateColumns();
    history.pushState({cwd: cwd}, document.title, PATH + '/files' + cwd);
}

function refresh() {
    $currentColumn.data('path', null);
    updateColumn($currentColumn, cwd);
}

function cd(path) {
    var names = path.split('/');
    var path = '';
    stack = ['/'];
    for (var i = 0; i < names.length; i++) {
        if (names[i] === '..') {
            if (stack.length > 1) {
                stack.pop();
                path = stack[stack.length - 1];
            }
        } else if (names[i] !== '' && names[i] !== '.') {
            path += '/' + names[i];
            stack.push(path);
        }
    }
    cwd = stack[stack.length - 1];
    updateColumns();
}

function updateColumns() {
    console.log('stack', stack, 'cwd', cwd, 'stackOffset', stackOffset);
    var columns = $columns.children();
    var length = columns.length;
    stackOffset = Math.max(0, Math.min(stackOffset, stack.length - 1), stack.length - length);
    for (var i = 0; i < length; i++) {
        if (stackOffset + i < stack.length) {
            var id = i;
            updateColumn(columns.eq(id), stack[stackOffset + id]);
            $currentColumn = columns.eq(id);
        } else {
            updateColumn(columns.eq(i), null);
        }
    }
    $('.header-path').text(cwd);
    document.title = cwd + ' – Files';
}

function updateColumn($column, path) {
    if ($column.data('path') === path) {
        return;
    }
    var $list = $column.children('ul');
    $list.empty();
    $column.data('path', null);
    if (path !== null) {
        $.ajax({
            url: PATH + '/api/list-files',
            data: {path: path},
            success: function (data) {
                $column.data('path', path);
                if (data.type === 'directory') {
                    for (var i = 0; i < data.files.length; i++) {
                        var file = data.files[i];
                        addFile($column, file);
                    }
                } else {
                    addFileInfo($column, data);
                }
            }
        });
    }
}

function openFile(name, $column) {
    $.ajax({
        url: PATH + '/api/list-files',
        data: {path: cwd + '/' + name},
        success: function (data) {
        }
    });
}

function createColumns() {
    var current = $columns.children().length;
    var ideal = Math.max(1, Math.floor($columns.width() / 200));
    if (ideal > current) {
        var add = ideal - current;
        for (var i = 0; i < add; i++) {
            var $column = $('<div class="files-panel">');
            $column.append('<ul>');
            $column.appendTo($columns);
            initColumn($column);
        }
    } else if (ideal < current) {
        var remove = current - ideal;
        for (var i = 0; i < remove; i++) {
            $columns.children().last().remove();
        }
    } else {
        return false;
    }
    $columns.children().css('width', 100 / ideal + '%');
    return true;
}

function resizeView() {
    $columns.height($(window).height() - 150);
}

initColumn($columns.children().first());
createColumns();
cd(cwd);
resizeView();

$(window).resize(function () {
    if (createColumns()) {
        updateColumns();
    }
    resizeView();
});

initFile($columns.find('a'));


actions.define('back', function () {
    history.back();
});
actions.define('foreward', function () {
    history.forward();
});
actions.define('up', function () {
    goUp();
});
actions.define('home', function () {
    cd('/');
    history.pushState({cwd: cwd}, document.title, PATH + '/files' + cwd);
    $columns.find('a').removeClass('active');
});
actions.define('new-folder', function () {
    var name = prompt('Enter the new name:');
    if (name !== null) {
        if (name === '') {
            alert('Invalid name');
            return;
        }
        var path;
        if (cwd === '/') {
            path = cwd + name;
        } else {
            path = cwd + '/' + name;
        }
        $.ajax({
            url: PATH + '/api/make-dir',
            method: 'post',
            data: {request_token: TOKEN, path: path},
            success: function (data) {
                addFile($currentColumn, {
                    name: name,
                    path: path,
                    type: 'directory'
                });
                cd(path);
            }
        });
    }
});
actions.define('new-file', function () {
    var name = prompt('Enter the new name:');
    if (name !== null) {
        if (name === '') {
            alert('Invalid name');
            return;
        }
        var path;
        if (cwd === '/') {
            path = cwd + name;
        } else {
            path = cwd + '/' + name;
        }
        $.ajax({
            url: PATH + '/api/make-file',
            method: 'post',
            data: {request_token: TOKEN, path: path},
            success: function (data) {
                addFile($currentColumn, data);
                cd(path);
            }
        });
    }
});
actions.define('trash', function () {
    if (confirm('Delete file: ' + cwd)) {
        $.ajax({
            url: PATH + '/api/delete',
            method: 'post',
            data: {request_token: TOKEN, path: cwd},
            success: function (data) {
                goUp();
                refresh();
            }
        });
    }
});