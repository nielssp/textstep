

// libedit

require('highlightjs/styles/solarized_dark.css');
window.hljs = require('highlightjs/highlight.pack.js');
require('simplemde/dist/simplemde.min.css');

export var SimpleMDE = require('simplemde');

export var CodeMirror = require('codemirror');

require('codemirror/lib/codemirror.css');
require('codemirror/mode/php/php');
require('codemirror/mode/css/css');
require('codemirror/mode/sass/sass');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');

TEXTSTEP.initLib('libedit', function (lib) {
    lib.export({
        SimpleMDE: SimpleMDE,
        CodeMirror: CodeMirror
    });
});
