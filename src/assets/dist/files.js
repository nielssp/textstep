webpackJsonp([2],{

/***/ 26:
/***/ function(module, exports, __webpack_require__) {

/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = __webpack_require__(9);

var PATH = $('body').data('path').replace(/\/$/, '');

var $columns = $('.files-columns');

var TOKEN = $columns.data('token');

var cwd = $columns.children().first().data('path');

var stack = [];

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
    $file.click(function () {
        if ($(this).hasClass('file-directory')) {
            cd($(this).data('path'));
            history.pushState({cwd: cwd}, document.title, PATH + '/files' + cwd);
            $(this).parent().parent().find('a').removeClass('active');
            $(this).addClass('active');
        } else {
            open($(this).data('path'));
        }
        return false;
    });
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
                for (var i = 0; i < data.files.length; i++) {
                    var file = data.files[i];
                    var $file = $('<a class="file">');
                    $file.text(file.name);
                    if (stack.filter(function(elem) {
                        return elem === file.path;
                    }).length > 0) {
                        $file.addClass('active');
                    }
                    $file.attr('data-path', file.path);
                    $file.attr('href', PATH + '/files' + file.path);
                    $file.addClass('file-' + file.type);
                    initFile($file);
                    var $li = $('<li>');
                    $li.append($file);
                    $list.append($li);
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

$('.toolbar [data-action="back"]').click(function () {
    history.back();
});
$('.toolbar [data-action="forward"]').click(function () {
    history.forward();
});
$('.toolbar [data-action="up"]').click(function () {
    goUp();
});
$('.toolbar [data-action="home"]').click(function () {
    cd('/');
    history.pushState({cwd: cwd}, document.title, PATH + '/files' + cwd);
    $columns.find('a').removeClass('active');
});

/***/ }

},[26]);