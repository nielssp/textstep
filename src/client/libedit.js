/*
 * TEXTSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var paths = TEXTSTEP.paths;
var ui = TEXTSTEP.ui;

window.hljs = require('highlightjs/highlight.pack.js');

export var SimpleMDE = require('simplemde');

export var CodeMirror = require('codemirror');

require('codemirror/mode/php/php');
require('codemirror/mode/css/css');
require('codemirror/mode/sass/sass');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');

require('./libedit.scss');

TEXTSTEP.initLib('libedit', function (lib) {
    lib.export({
        SimpleMDE: SimpleMDE,
        CodeMirror: CodeMirror
    });
});
