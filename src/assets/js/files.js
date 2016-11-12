/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = require('jquery');
var actions = require('./common/actions');
var ui = require('./common/ui');
var paths = require('./common/paths');
var dragula = require('dragula');

require('dragula/dist/dragula.min.css');

var PATH = $('body').data('path').replace(/\/$/, '');

var $columns = $('.files-columns');

var TOKEN = $columns.data('token');

var $shelf = $('.files-shelf > .files-grid');

var $currentColumn = $columns.children().first();

var cwd = $currentColumn.data('path');
$currentColumn.data('path', null);

var stack = [];
var previousStackSize = 0;

var files = {};

var selection = [];
var selectionRoot = '/';

var stackOffset = 0;

$(document).ajaxError(ui.handleError);

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

var touchSelectMode = false;

function initFile($file, file)
{
    files[file.path] = {
        link: $file,
        data: file
    };
    if (!$file.hasClass('file-directory')) {
        $file.dblclick(function () {
            if (!touchSelectMode) {
                open($(this).data('path'));
                return false;
            }
        });
    }
    ui.onLongPress($file[0], function (e) {
        e.preventDefault();
        e.stopPropagation();
        if ($file.hasClass('active')) {
            unselect(file.path);
        } else {
            select(file.path);
        }
        touchSelectMode = true;
        return false;
    });
    $file.click(function (event) {
        if (event.ctrlKey || touchSelectMode) {
            if ($file.hasClass('active')) {
                unselect(file.path);
            } else {
                select(file.path);
            }
        } else if (event.shiftKey) {
            var last = selection[selection.length - 1];
            var oldSelectionRoot = selectionRoot;
            if (!$file.hasClass('active')) {
                select(file.path);
            }
            if (selectionRoot !== oldSelectionRoot) {
                last = selection[0];
            }
            if (files.hasOwnProperty(last)) {
                var $other = files[last].link;
                if ($other.parent().is($file.parent())) {
                    var between = false;
                    $file.parent().children().each(function () {
                        var $child = $(this);
                        if ($child.is($file) || $child.is($other)) {
                            between = !between;
                        }
                        if (between && !$child.hasClass('active')) {
                            select($child.data('path'));
                        }
                    });
                }
            }
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
    var $file = createFile(file);
    $column.children('.files-list').append($file);
    return $file;
}

function addFileInfo($column, file)
{
    if (!files.hasOwnProperty(file.path)) {
        createFile(file);
    }
    var $li = $('<div class="file-info">');
    var $icon;
    switch (file.type.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
        case 'png':
        case 'ico':
            $icon = $('<img class="file-thumbnail">');
            $icon.attr('src', PATH + '/api/download?path=' + encodeURIComponent(file.path));
            break;
        default:
            $icon = $('<span class="file">');
            $icon.addClass('file-' + file.type);
            if (!file.read) {
                $icon.addClass('locked');
            }
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
    $column.children('.files-list').replaceWith($li);
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
    touchSelectMode = false;
    if (stack.length > 1) {
        selection = [cwd];
    } else {
        selection = [];
    }
    selectionRoot = stack[stack.length - 1];
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

function removeSelection()
{
    selection.forEach(function (path) {
        files[path].link.removeClass('active');
    });
    selection = [];
    touchSelectMode = false;
    enter(selectionRoot);
}

function unselect(path)
{
    var idx = selection.indexOf(path);
    if (idx >= 0) {
        selection.splice(idx, 1);
        console.log(selection);
        files[path].link.removeClass('active');
        if (selection.length === 0) {
            touchSelectMode = false;
            $currentColumn.next().children('.file-info').empty();
            enter(selectionRoot);
        } else {
            var $fileInfo = $currentColumn.next().children('.file-info');
            if ($fileInfo.length > 0) {
                var $name = $fileInfo.children('.file-name');
                $name.text(selection.length + ' files');
            }
        }
    }
}

function select(path)
{
    var dir = paths.dirName(path);
    if (dir !== selectionRoot) {
        if (selection.length > 1) {
            return;
        }
        selectionRoot = dir;
        var newSelection = [];
        for (var i = 0; i < stack.length; i++) {
            if (stack[i] === selectionRoot && i + 1 < stack.length) {
                newSelection.push(stack[i+1]);
                break;
            }
        }
        cd(dir);
        selection = newSelection;
        if (selection.length > 0) {
            files[selection[0]].link.addClass('active');
        }
    } else if (selection.length === 1 && paths.dirName(selection[0]) !== selectionRoot) {
        selection = [];
    }
    selection.push(path);
    console.log(selection, selectionRoot);
    files[path].link.addClass('active');
    var $fileInfo = $currentColumn.next().children('.file-info');
    if ($fileInfo.length > 0) {
        $fileInfo.empty();
        var $icon = $('<span class="file file-multiple">');
        var $name = $('<span class="file-name">');
        $name.text(selection.length + ' files');
        $fileInfo.append($icon).append($name);
    } else if ($currentColumn.next().length > 0) {
        $currentColumn.next().empty();
        var $fileInfo = $('<div class="file-info">');
        $fileInfo.appendTo($currentColumn.next());
        var $icon = $('<span class="file file-multiple">');
        var $name = $('<span class="file-name">');
        $name.text(selection.length + ' files');
        $fileInfo.append($icon).append($name);
    }
}

function cd(path)
{
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
    touchSelectMode = false;
    if (stack.length > 1) {
        selection = [path];
    } else {
        selection = [];
    }
    selectionRoot = stack[stack.length - 1];
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
    $columns.find('a').removeClass('active');
    if (stack.length >= previousStackSize) {
        for (var i = 0; i < length; i++) {
            var $column = columns.eq(i);
            if (stackOffset + i < stack.length) {
                updateColumn($column, stack[stackOffset + i]);
                $currentColumn = columns.eq(i);
            } else {
                updateColumn($column, null);
            }
        }
    } else {
        $currentColumn = columns.eq(Math.min(length, stack.length) - 1);
        for (var i = length - 1; i >= 0; i--) {
            var $column = columns.eq(i);
            if (stackOffset + i < stack.length) {
                updateColumn($column, stack[stackOffset + i]);
            } else {
                updateColumn($column, null);
            }
        }
    }
    previousStackSize = stack.length;
    $('.header-path').text(cwd);
    document.title = cwd + ' – Files';
}

function updateColumn($column, path)
{
    if ($column.data('path') !== path || path === null) {
        var $list = $column.children('.files-list');
        if ($list.length === 0) {
            $column.empty();
            $list = $('<div class="files-list">');
            $column.append($list);
        }
        $list.empty();
        $column.data('path', null);
        $column.removeClass('readonly');
        if ($column.next().data('path') === path) {
            $column.data('path', path);
            $column.next().children('.files-list').children().appendTo($list);
            if ($column.next().hasClass('readonly')) {
                $column.addClass('readonly');
            }
        } else if ($column.prev().data('path') === path) {
            $column.data('path', path);
            $column.prev().children('.files-list').children().appendTo($list);
            if ($column.prev().hasClass('readonly')) {
                $column.addClass('readonly');
            }
        } else if (path !== null) {
            $column.addClass('loading');
            $.ajax({
                url: PATH + '/api/list-files',
                data: {path: path},
                success: function (data) {
                    $column.removeClass('loading');
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
                    $column.trigger('loaded');
                }
            });
        }
    }
    if (files.hasOwnProperty(path)) {
        files[path].link.addClass('active');
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

//var drag = dragula([$shelf[0]], {
//    copy: true,
//    revertOnSpill: true
//});
//
//var currentMousePos = { x: -1, y: -1 };
//$(document).mousemove(function(event) {
//    currentMousePos.x = event.pageX;
//    currentMousePos.y = event.pageY;
//});

//drag.on('cloned', function (clone, original, type) {
//    clone.style.width = '';
//    clone.style.height = '';
//    if (type === 'mirror') {
//        console.log(1);
//        clone.style.left = currentMousePos.x + 'px';
//        clone.style.top = currentMousePos.y + 'px';
//    }
//    $(clone).removeClass('active');
//});

function createColumns()
{
    var current = $columns.children().length;
    var ideal = Math.max(1, Math.floor($columns.width() / 200));
    if (ideal > current) {
        var add = ideal - current;
        for (var i = 0; i < add; i++) {
            var $column = $('<div class="files-panel">');
            $column.append('<div class="files-list">');
            $column.appendTo($columns);
            initColumn($column);
//            drag.containers.push($column.children()[0]);
        }
    } else if (ideal < current) {
        var remove = current - ideal;
        for (var i = 0; i < remove; i++) {
            $columns.children().last().remove();
//            drag.containers.splice(-1);
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

$(window).resize(function () {
    if (createColumns()) {
        updateColumns();
    }
});

$(document).keypress(function (e) {
    if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
        // TODO: Search/filter current folder
        console.log(e);
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
            }
        });
    }
});
actions.define('upload', function () {
    var $fileInput = $('<input type="file" />').appendTo($('body'));
    var $column = $currentColumn;
    $fileInput.hide();
    $fileInput.click();
    $fileInput.change(function () {
        var files = $fileInput[0].files;
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
                $fileInput.remove();
            }
        };
        return false;
    });
});
actions.define('rename', function () {
    if (stack.length <= 1) {
        return;
    }
    if (selection.length !== 1) {
        alert('Cannot rename multiple files');
        return;
    }
    var path = selection[0];
    var name = prompt('Enter the new name:', files[path].data.name);
    if (name !== null) {
        if (name === '') {
            alert('Invalid name');
        }
        var destination = paths.convert(name, paths.dirName(path));
        $.ajax({
            url: PATH + '/api/move',
            method: 'post',
            data: {request_token: TOKEN, path: path, destination: destination},
            success: function (data) {
                enter(destination);
                refresh();
            }
        });
    }
});
actions.define('trash', function () {
    var confirmation;
    var data = {request_token: TOKEN};
    if (selection.length === 1) {
        confirmation = confirm('Permanently delete file: ' + selection[0]);
        data.path = selection[0];
    } else {
        confirmation = confirm('Permanently delete ' + selection.length + ' files?');
        data.paths = selection;
    }
    if (confirmation) {
        $.ajax({
            url: PATH + '/api/delete',
            method: 'post',
            data: data,
            success: function (data) {
                removeSelection();
                refresh();
            }
        });
    }
});
actions.define('cut', function () {
    if (selection.length === 1) {
        files[selection[0]].link.clone().removeClass('active').appendTo($shelf);
    } else {
        var paths = selection;
        var $file = $('<a class="file file-multiple">');
        $file.text(selection.length + ' files');
        $file.data('paths', paths);
        $file.appendTo($shelf);
    }
    removeSelection();
});
actions.define('copy', function () {
    if (selection.length === 1) {
        files[selection[0]].link.clone().removeClass('active').addClass('duplicate').appendTo($shelf);
    } else {
        var paths = selection;
        var $file = $('<a class="file file-multiple duplicate">');
        $file.text(selection.length + ' files');
        $file.data('paths', paths);
        $file.appendTo($shelf);
    }
    removeSelection();
});
actions.define('paste', function () {
    if ($shelf.children().length > 0) {
        var $pastee = $shelf.children().last();
        var duplicate = $pastee.hasClass('duplicate');
        var data = {request_token: TOKEN};
        var fileData = [];
        if (typeof $pastee.data('paths') !== 'undefined') {
            data.paths = {};
            $pastee.data('paths').forEach(function (path) {
                data.paths[path] = paths.convert(files[path].data.name, cwd);
                fileData.push(files[path]);
            });
        } else {
            data.path = $pastee.data('path');
            var file = files[data.path];
            data.destination = paths.convert(file.data.name, cwd);
            fileData.push(file);
        }
        $.ajax({
            url: PATH + (duplicate ? '/api/copy' : '/api/move'),
            method: 'post',
            data: data,
            success: function (data) {
                $pastee.remove();
                if (!duplicate) {
                    fileData.forEach(function (file) {
                        file.link.remove();
                    });
                }
                refresh();
            }
        });
    }
});
actions.define('focus-prev', function () {
    var $current = $currentColumn.find('.file:focus');
    if ($current.length > 0) {
        var $prev = $current.prev();
        if ($prev.length > 0) {
            $prev.focus();
        }
    } else {
        $currentColumn.find('.file').last().focus();
    }
});
actions.define('focus-next', function () {
    var $current = $currentColumn.find('.file:focus');
    if ($current.length > 0) {
        var $next = $current.next();
        if ($next.length > 0) {
            $next.focus();
        }
    } else {
        $currentColumn.find('.file').first().focus();
    }
});
actions.define('enter', function () {
    var $current = $currentColumn.find('.file:focus');
    if ($current.length > 0) {
        enter($current.data('path'));
        $currentColumn.one('loaded', function () {
            $(this).find('.file').first().focus();
        });
    }
});
actions.define('exit', function () {
    if (stack.length > 1) {
        var path = cwd;
        goUp();
        files[path].link.focus();
    }
});
actions.bind('F2', 'rename');
actions.bind('C-C', 'copy');
actions.bind('C-X', 'cut');
actions.bind('C-V', 'paste');
actions.bind('Delete', 'trash');

actions.bind('C-H', 'exit');
actions.bind('C-K', 'focus-prev');
actions.bind('C-J', 'focus-next');
actions.bind('C-L', 'enter');
actions.bind('ArrowLeft', 'exit');
actions.bind('ArrowUp', 'focus-prev');
actions.bind('ArrowDown', 'focus-next');
actions.bind('ArrowRight', 'enter');