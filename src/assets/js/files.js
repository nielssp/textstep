/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = require('jquery');
var ui = require('./common/ui');
var paths = require('./common/paths');
var dragula = require('dragula');

require('dragula/dist/dragula.min.css');

var self = null;

var $frame = null;

var $columns = null;

var $shelf = null;

var $currentColumn = null;

var cwd = null;

var stack = [];
var previousStackSize = 0;

var files = {};

var selection = [];
var selectionRoot = '/';

var stackOffset = 0;

function open(app, args) {
    console.log('open', args.path);
    cwd = args.path || '/';
    $columns.empty();
    createColumns();
    cd(cwd);
}

function close(app) {
    console.log('close');
}

function reopen(app, args) {
    console.log('reopen', args.path);
    enter(args.path || '/');
}

function initColumn($column) {
    $column.on('dragenter', function (e) {
        if ($column.data('path') === null || event.dataTransfer.types.indexOf('Files') < 0) {
            event.dataTransfer.dropEffect = 'none';
        } else {
            event.dataTransfer.dropEffect = 'copy';
            $column.addClass('accept');
        }
        return false;
    });
    $column.on('dragleave', function (e) {
        $column.removeClass('accept');
        return false;
    });
    $column.on('dragover', function (e) {
        if ($column.data('path') === null || event.dataTransfer.types.indexOf('Files') < 0) {
            event.dataTransfer.dropEffect = 'none';
        } else {
            event.dataTransfer.dropEffect = 'copy';
            $column.addClass('accept');
        }
        return false;
    });
    $column.on('drop', function (e) {
        if ($column.data('path') === null) {
            return false;
        }
        $column.removeClass('accept');
        var files = event.dataTransfer.files;
        var data = new FormData();
        for (var i = 0; i < files.length; i++) {
            data.append('file' + i, files[i]);
            addFile($column, {
                name: files[i].name,
                path: $column.data('path') + '/' + files[i].name,
                type: 'uploading'
            });
        }
        var request = new XMLHttpRequest();
        var handleError = function () {
            if (typeof request.responseJSON !== 'undefined') {
                alert(request.responseJSON.message);
            } else {
                alert(request.responseText);
            }
            ui.shake($('main > .frame'));
        };
        request.open('POST', BLOGSTEP.PATH + '/api/upload?path=' + $column.data('path'));
	BLOGSTEP.addToken(request);
        request.send(data);
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status !== 200) {
                    handleError();
                }
                var path = $column.data('path');
                $column.data('path', null);
                updateColumn($column, path);
            }
        };
        return false;
    });
}

var touchSelectMode = false;

function initFile($file, file) {
    files[file.path] = {
        link: $file,
        data: file
    };
    if (!$file.hasClass('file-directory')) {
        $file.dblclick(function () {
            if (!touchSelectMode) {
                BLOGSTEP.open($(this).data('path'));
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
    $file.on('dragstart', function (e) {
        var download = 'application/octet-stream:' + encodeURIComponent(file.name) + ':'
                + location.origin + BLOGSTEP.PATH + '/api/download?path='
                + encodeURIComponent(file.path);
        e.originalEvent.dataTransfer.setData('DownloadURL', download);
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

function createFile(file) {
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
    $file.attr('draggable', true);
    $file.attr('data-path', file.path);
    $file.attr('href', BLOGSTEP.PATH + '/app/files?path=' + file.path);
    $file.addClass('file-' + file.type);
    initFile($file, file);
    return $file;
}

function addFile($column, file) {
    var $file = createFile(file);
    $column.children('.files-list').append($file);
    return $file;
}

function addFileInfo($column, file) {
    if (!files.hasOwnProperty(file.path)) {
        createFile(file);
    }
    var $li = $('<div class="file-info">');
    var $icon;
    var action = 'Edit';
    switch (file.type.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
        case 'png':
        case 'ico':
            $icon = $('<img class="file-thumbnail">');
            $icon.attr('src', BLOGSTEP.PATH + '/api/download?path=' + encodeURIComponent(file.path));
            action = 'View';
            break;
        case 'webm':
            action = 'Play';
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
        var $button = $('<button>' + action + '</button>');
        $button.click(function () {
            BLOGSTEP.open(file.path);
        }).appendTo($li);
    }
    $column.children('.files-list').replaceWith($li);
}

function goUp() {
    if (stack.length <= 1) {
        return;
    }
    stack.pop();
    cwd = stack[stack.length - 1];
    touchSelectMode = false;
    if (stack.length > 1) {
        selection = [cwd];
        self.enableGroup('selection');
        self.enableGroup('selection-single');
    } else {
        selection = [];
        self.disableGroup('selection');
        self.disableGroup('selection-single');
    }
    selectionRoot = stack[stack.length - 1];
    updateColumns();
    self.setArgs({ path: cwd });
}

function refresh() {
    $currentColumn.data('path', null);
    updateColumn($currentColumn, cwd);
}

function enter(path) {
    if (path === cwd) {
	return;
    }
    cd(path);
    if (files.hasOwnProperty(path)) {
        files[path].link.addClass('active');
    }
    self.setArgs({ path: cwd });
}

function removeSelection() {
    if (selection.length === 1 && selection[0] === selectionRoot) {
        goUp();
        return;
    }
    selection.forEach(function (path) {
        files[path].link.removeClass('active');
    });
    selection = [];
    touchSelectMode = false;
    self.disableGroup('selection');
    self.disableGroup('selection-single');
    enter(selectionRoot);
}

function unselect(path) {
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
            if (selection.length === 1) {
                self.enableGroup('selection-single');
            } else {
                self.disableGroup('selection-single');
            }
            var $fileInfo = $currentColumn.next().children('.file-info');
            if ($fileInfo.length > 0) {
                var $name = $fileInfo.children('.file-name');
                $name.text(selection.length + ' files');
            }
        }
    }
}

function select(path) {
    var dir = paths.dirName(path);
    if (dir !== selectionRoot) {
        if (selection.length > 1) {
            return;
        }
        selectionRoot = dir;
        var newSelection = [];
        for (var i = 0; i < stack.length; i++) {
            if (stack[i] === selectionRoot && i + 1 < stack.length) {
                newSelection.push(stack[i + 1]);
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
    self.enableGroup('selection');
    selection.push(path);
    self.disableGroup('dir');
    if (selection.length === 1) {
        self.enableGroup('selection-single');
    } else {
        self.disableGroup('selection-single');
    }
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
    touchSelectMode = false;
    if (stack.length > 1) {
        selection = [path];
        self.enableGroup('selection');
        self.enableGroup('selection-single');
    } else {
        selection = [];
        self.disableGroup('selection');
        self.disableGroup('selection-single');
    }
    selectionRoot = stack[stack.length - 1];
    updateColumns();
}

function updateColumns() {
    console.log('stack', stack, 'cwd', cwd, 'stackOffset', stackOffset);
    var columns = $columns.children();
    var length = columns.length;
    // Does not move stackOffset when going up:
//    stackOffset = Math.max(0, Math.min(stackOffset, stack.length - 1), stack.length - length);
    // Always shows as much of the stack as possible: (maybe more confusing when moving up? but better overview)
    stackOffset = Math.max(0, stack.length - length);
    $columns.find('a').removeClass('active');
    $currentColumn.children('.filter').remove();
    $currentColumn = columns.eq(Math.min(length, stack.length) - 1);
    if (stack.length >= previousStackSize) {
        for (var i = 0; i < length; i++) {
            var $column = columns.eq(i);
            if (stackOffset + i < stack.length) {
                updateColumn($column, stack[stackOffset + i]);
            } else {
                updateColumn($column, null);
            }
        }
    } else {
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
    self.setTitle(cwd + ' – Files');
}

function updateColumn($column, path) {
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
	    BLOGSTEP.get('list-files', { path: path }).done(function (data) {
		$column.removeClass('loading');
		$list.empty();
		$column.removeClass('readonly');
		$column.data('path', path);
		if (!data.write) {
		    $column.addClass('readonly');
		}
		if (!files.hasOwnProperty(data.path)) {
		    createFile(data);
		}
		if (data.type === 'directory' && typeof data.files !== 'undefined') {
		    for (var i = 0; i < data.files.length; i++) {
			var file = data.files[i];
			addFile($column, file);
		    }
		    if ($column.is($currentColumn)) {
			self.enableGroup('dir');
		    }
		} else {
		    addFileInfo($column, data);
		    if ($column.is($currentColumn)) {
			self.disableGroup('dir');
		    }
		}
		$column.trigger('loaded');
	    });
        }
    }
    if (files.hasOwnProperty(path)) {
        files[path].link.addClass('active');
        if ($column.is($currentColumn)) {
            if (files[path].data.type === 'directory') {
                self.enableGroup('dir');
            } else {
                self.disableGroup('dir');
            }
        }
    }
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

function createColumns() {
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

function matchFilter(filter) {
    var matchCase = true;
    if (filter === filter.toLowerCase()) {
        matchCase = false;
    }
    var match = null;
    $currentColumn.find('.file').each(function () {
        var name = $(this).text();
        if (!matchCase)
            name = name.toLowerCase();
        if (name.slice(0, filter.length) === filter) {
            match = $(this);
            return false;
        }
    });
    return match;
}

function updateFilter() {
    var $filter = $currentColumn.children('.filter');
    $currentColumn.find('.match').removeClass('match');
    if ($filter.length > 0) {
        if ($filter.val() === '') {
            $filter.remove();
        } else {
            var match = matchFilter($filter.val());
            if (match !== null) {
                match.addClass('match');
            }
        }
    }
}

function keydown(e) {
    if ($('input:focus').length > 0) {
        return true;
    }
    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
        return true;
    }
    var $filter = $currentColumn.children('.filter');
    if (e.key.length !== 1) {
        return true;
    }
    if ($filter.length === 0) {
        $('<input type="text" class="filter">')
                .val(e.key)
                .appendTo($currentColumn)
                .focus()
                .keydown(function (e) {
                    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
                        return;
                    }
                    if (e.key === 'Escape') {
                        $(this).remove();
                        updateFilter();
                        return false;
                    } else if (e.key === 'Enter') {
                        var $match = $currentColumn.find('.match');
                        if ($match.length > 0) {
                            $(this).remove();
                            $match.click();
                        }
                        return false;
                    }
                })
                .keyup(updateFilter)
                .blur(function () {
                    $(this).remove();
                    updateFilter();
                });
        updateFilter();
        return false;
    }
    return true;
}

function back() {
    history.back();
}

function forward() {
    history.go(1);
}

function home() {
    enter('/');
}

function newFolder() {
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
	BLOGSTEP.post('make-dir', { path: path }).done(function (data) {
	    addFile($currentColumn, data);
	    enter(path);
	});
    }
}

function newFile() {
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
	BLOGSTEP.post('make-file', { path: path }).done(function (data) {
	    addFile($currentColumn, data);
	    enter(path);
	});
    }
}

function upload() {
    var $fileInput = $('<input type="file" />').appendTo($('body'));
    var $column = $currentColumn;
    $fileInput.hide();
    $fileInput.click();
    $fileInput.change(function () {
        var files = $fileInput[0].files;
        var data = new FormData();
        for (var i = 0; i < files.length; i++) {
            data.append('file' + i, files[i]);
            addFile($column, {
                name: files[i].name,
                path: $column.data('path') + '/' + files[i].name,
                type: 'uploading'
            });
        }
        var request = new XMLHttpRequest();
        var handleError = function () {
            if (typeof request.responseJSON !== 'undefined') {
                alert(request.responseJSON.message);
            } else {
                alert(request.responseText);
            }
            ui.shake($('main > .frame'));
        };
        request.open('POST', BLOGSTEP.PATH + '/api/upload?path=' + encodeURIComponent($column.data('path')));
	BLOGSTEP.addToken(request);
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status !== 200) {
                    handleError();
                }
                var path = $column.data('path');
                $column.data('path', null);
                updateColumn($column, path);
                $fileInput.remove();
            }
        };
        request.send(data);
        return false;
    });
}

function terminal() {
    BLOGSTEP.run('terminal', {path: cwd});
}

function rename() {
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
	BLOGSTEP.post('move', { path: path, destination: destination }).done(function (data) {
	    enter(destination);
	    refresh();
	});
    }
}

function trash() {
    var confirmation;
    var data = {};
    if (selection.length === 1) {
        confirmation = confirm('Permanently delete file: ' + selection[0]);
        data.path = selection[0];
    } else {
        confirmation = confirm('Permanently delete ' + selection.length + ' files?');
        data.paths = selection;
    }
    if (confirmation) {
	BLOGSTEP.post('delete', data).done(function (data) {
	    removeSelection();
	    refresh();
	});
    }
}

function download() {
    if (selection.length === 1) {
        var file = files[selection[0]].data;
        location.href = BLOGSTEP.PATH + '/api/download/' + encodeURIComponent(file.name)
                + '?force&path=' + encodeURIComponent(file.path);
    } else {
        for (var i = 0; i < selection.length; i++) {
            var file = files[selection[i]].data;
            var iframe = $('<iframe>');
            iframe.hide();
            iframe.attr('src', BLOGSTEP.PATH + '/api/download/' + encodeURIComponent(file.name)
                    + '?force&path=' + encodeURIComponent(file.path));
            iframe.on('load', function () {
                // TODO: this is never called...
                console.log('download finished');
                iframe.remove();
            });
            iframe.appendTo($('body'));
        }
    }
}

function cut() {
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
}

function copy() {
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
}

function paste() {
    if ($shelf.children().length > 0) {
        var $pastee = $shelf.children().last();
        var duplicate = $pastee.hasClass('duplicate');
        var data = {};
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
	BLOGSTEP.post(duplicate ? 'copy' : 'move', data).done(function (data) {
	    $pastee.remove();
	    if (!duplicate) {
		fileData.forEach(function (file) {
		    file.link.remove();
		});
	    }
	    refresh();
	});
    }
}

function selectAll() {
    $currentColumn.find('.file').each(function () {
        select($(this).data('path'));
    });
}

function focusPrev() {
    var $current = $currentColumn.find('.file:focus');
    if ($current.length > 0) {
        var $prev = $current.prev();
        if ($prev.length > 0) {
            $prev.focus();
        }
    } else {
        $currentColumn.find('.file').last().focus();
    }
}

function focusNext() {
    var $current = $currentColumn.find('.file:focus');
    if ($current.length > 0) {
        var $next = $current.next();
        if ($next.length > 0) {
            $next.focus();
        }
    } else {
        $currentColumn.find('.file').first().focus();
    }
}

function focusEnter() {
    var $current = $currentColumn.find('.file:focus');
    if ($current.length > 0) {
        enter($current.data('path'));
        $currentColumn.one('loaded', function () {
            $(this).find('.file').first().focus();
        });
    }
}

function focusExit() {
    if (stack.length > 1) {
        var path = cwd;
        goUp();
        files[path].link.focus();
    }
}

BLOGSTEP.init('files', function (app) {
    self = app;

    app.defineAction('back', back, ['nav']);
    app.defineAction('foreward', forward, ['nav']);
    app.defineAction('up', goUp, ['nav']);
    app.defineAction('home', home, ['nav']);
    app.defineAction('new-folder', newFolder, ['dir']);
    app.defineAction('new-file', newFile, ['dir']);
    app.defineAction('upload', upload, ['dir']);
    app.defineAction('terminal', terminal, ['selection-single']);
    app.defineAction('rename', rename, ['selection-single']);
    app.defineAction('trash', trash, ['selection']);
    app.defineAction('download', download, ['selection']);
    app.defineAction('cut', cut, ['selection']);
    app.defineAction('copy', copy, ['selection']);
    app.defineAction('paste', paste, ['dir']);
    app.defineAction('select-all', selectAll, ['dir']);
    app.defineAction('remove-selection', function () {
        if (selection.length === 1 && selection[0] === selectionRoot) {
            return;
        }
        removeSelection();
    }, ['dir']);
    app.defineAction('focus-prev', focusPrev, ['nav']);
    app.defineAction('focus-next', focusNext, ['nav']);
    app.defineAction('enter', focusEnter, ['nav']);
    app.defineAction('exit', focusExit, ['nav']);

    app.bindKey('F2', 'rename');
    app.bindKey('C-C', 'copy');
    app.bindKey('C-X', 'cut');
    app.bindKey('C-V', 'paste');
    app.bindKey('Delete', 'trash');

    app.bindKey('C-A', 'select-all');
    app.bindKey('Escape', 'remove-selection');

    app.bindKey('C-H', 'exit');
    app.bindKey('C-K', 'focus-prev');
    app.bindKey('C-J', 'focus-next');
    app.bindKey('C-L', 'enter');
    app.bindKey('ArrowLeft', 'exit');
    app.bindKey('ArrowUp', 'focus-prev');
    app.bindKey('ArrowDown', 'focus-next');
    app.bindKey('ArrowRight', 'enter');

    app.disableGroup('selection');
    app.disableGroup('selection-single');
    app.disableGroup('dir');

    app.onOpen = open;
    app.onClose = close;
    app.onReopen = reopen;
    app.onKeydown = keydown;
    app.onResize = function () {
        if (createColumns()) {
            updateColumns();
        }
    };
    
    var menu = app.addMenu('Files');
    menu.addItem('New folder', 'new-folder');
    menu.addItem('New file', 'new-file');
    menu.addItem('Download', 'download');

    $columns = app.frame.find('.files-columns');
    $shelf = app.frame.find('.files-shelf > .files-grid');
    $currentColumn = $columns.children().first();

    $columns.click(function (e) {
        if (e.defaultPrevented) {
            return;
        }
        if (selection.length === 1 && selection[0] === selectionRoot) {
            return;
        }
        removeSelection();
    });
});