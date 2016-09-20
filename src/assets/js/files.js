/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = require('jquery');
var actions = require('./common/actions');
var ui = require('./common/ui');

var PATH = $('body').data('path').replace(/\/$/, '');

var $columns = $('.files-columns');

var TOKEN = $columns.data('token');

var $currentColumn = $columns.children().first();

var cwd = $currentColumn.data('path');
$currentColumn.data('path', null);

var stack = [];

var files = {};

var selection = [];

var stackOffset = 0;

function open(path)
{
    location.href = PATH + '/open' + path;
}

function initColumn($column)
{
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
            addFile($column, {
                name: files[i].name,
                path: $column.data('path') + '/' + files[i].name,
                type: 'uploading'
            });
        }
        var request = new XMLHttpRequest();
        request.open("POST", PATH + '/api/upload?path=' + $column.data('path'));
        request.send(data);
        request.onreadystatechange = function () {
            if (this.readyState === 3 || this.readyState === 4) {
                var path = $column.data('path');
                $column.data('path', null);
                updateColumn($column, path);
            }
        };
        return false;
    };
}

function initFile($file, file)
{
    files[file.path] = {
        link: $file,
        data: file
    };
    if (!$file.hasClass('file-directory')) {
        $file.dblclick(function () {
            open($(this).data('path'));
            return false;
        });
    }
    $file.click(function (event) {
        if (event.shiftKey) {
            select(file.path);
        } else {
            enter(file.path);
        }
        return false;
    });
}

function createFile(file)
{
    var $file = $('<a class="file">');
    $file.text(file.name);
    if (stack.filter(function (elem) {
        return elem === file.path;
    }).length > 0) {
        $file.addClass('active');
    }
    if (!file.read) {
        $file.addClass('locked');
    }
    $file.attr('data-path', file.path);
    $file.attr('href', PATH + '/files' + file.path);
    $file.addClass('file-' + file.type);
    initFile($file, file);
    return $file;
}

function addFile($column, file)
{
    var $li = $('<li>');
    var $file = createFile(file);
    $li.append($file);
    $column.children('ul').append($li);
    return $file;
}

function addFileInfo($column, file)
{
    var $li = $('<li class="file-info">');
    var $icon = $('<span class="file">');
    $icon.addClass('file-' + file.type);
    if (!file.read) {
        $icon.addClass('locked');
    }
    var $name = $('<span class="file-name">');
    $name.text(file.name);
    var $modified = $('<span class="file-modified">');
    $modified.text(new Date(file.modified * 1000).toString());
    var $access = $('<span class="file-access">');
    $access.text(file.modeString + ' ' + file.owner + ':' + file.group + ' (' + (file.read ? 'r' : '-') + (file.write ? 'w' : '-') + ')');
    $li.append($icon).append($name).append($modified).append($access);
    if (file.read) {
        var $button = $('<button>Open in editor</button>');
        $button.click(function () {
            open(file.path);
        }).appendTo($li);
    }
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

function goUp()
{
    if (stack.length <= 1) {
        return;
    }
    stack.pop();
    cwd = stack[stack.length - 1];
    updateColumns();
    history.pushState({cwd: cwd}, document.title, PATH + '/files' + cwd);
}

function refresh()
{
    $currentColumn.data('path', null);
    updateColumn($currentColumn, cwd);
}

function enter(path)
{
    cd(path);
    if (files.hasOwnProperty(path)) {
        files[path].link.addClass('active');
    }
    history.pushState({cwd: cwd}, document.title, PATH + '/files' + cwd);
}

function select(path)
{
    selection.push(path);
}

function cd(path)
{
    selection = [path];
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

function updateColumns()
{
    console.log('stack', stack, 'cwd', cwd, 'stackOffset', stackOffset);
    var columns = $columns.children();
    var length = columns.length;
    // Does not move stackOffset when going up:
//    stackOffset = Math.max(0, Math.min(stackOffset, stack.length - 1), stack.length - length);
    // Always shows as much of the stack as possible: (maybe more confusing when moving up? but better overview)
    stackOffset = Math.max(0, stack.length - length);
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

function updateColumn($column, path)
{
    if ($column.data('path') === path) {
        $column.find('a').removeClass('active');
        if (files.hasOwnProperty(path)) {
            files[path].link.addClass('active');
        }
        return;
    }
    var $list = $column.children('ul');
    $list.empty();
    $column.data('path', null);
    $column.removeClass('readonly');
    if (path !== null) {
        $.ajax({
            url: PATH + '/api/list-files',
            data: {path: path},
            success: function (data) {
                $list.empty();
                $column.removeClass('readonly');
                $column.data('path', path);
                if (!data.write) {
                    $column.addClass('readonly');
                }
                if (data.type === 'directory' && typeof data.files !== 'undefined') {
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

function openFile(name, $column)
{
    $.ajax({
        url: PATH + '/api/list-files',
        data: {path: cwd + '/' + name},
        success: function (data) {
        }
    });
}

function createColumns()
{
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

function resizeView()
{
    $columns.height($(window).height() - 150);
}

$columns.empty();
createColumns();
cd(cwd);
resizeView();

$(window).resize(function () {
    if (createColumns()) {
        updateColumns();
    }
    resizeView();
});

$(document).keypress(function (e) {
    if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
        // TODO: Search/filter current folder
//        console.log(e.key);
    }
});


actions.define('back', function () {
    history.back();
});
actions.define('foreward', function () {
    history.go(1);
});
actions.define('up', function () {
    goUp();
});
actions.define('home', function () {
    enter('/');
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
                addFile($currentColumn, data);
                enter(path);
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
                enter(path);
            },
            error: function () {
                ui.shake($('.frame'));
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