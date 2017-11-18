/*
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

var $ = require('jquery');

exports.define = defineAction;
exports.enable = enable;
exports.disable = disable;
exports.enableGroup = enableGroup;
exports.disableGroup = disableGroup;
exports.activate = activate;
exports.bind = bind;

var actions = {};

var actionGroups = {};

var keyMap = {};

$(window).keydown(function (e) {
    if (e.defaultPrevented) {
	return;
    }
    var key = '';
    if (e.ctrlKey) {
	key += 'c-';
    }
    if (e.altKey) {
	key += 'a-';
    }
    if (e.shiftKey) {
	key += 's-';
    }
    if (e.metaKey) {
	key += 'm-';
    }
    key += e.key.toLowerCase();
    if (keyMap.hasOwnProperty(key)) {
	activate(keyMap[key]);
	return false;
    }
});

function bind(key, action)
{
    var parts = key.toLowerCase().split(/-|\+/);
    var e = {ctrlKey: '', altKey: '', shiftKey: ''};
    var key = parts[parts.length - 1];
    for (var i = 0; i < parts.length - 1; i++) {
	switch (parts[i]) {
	    case 'c':
		e.ctrlKey = 'c-';
		break;
	    case 'a':
		e.altKey = 'a-';
		break;
	    case 's':
		e.shiftKey = 's-';
		break;
	}
    }
    key = e.ctrlKey + e.altKey + e.shiftKey + key;
    keyMap[key] = action;
}

function defineAction(name, callback, groups)
{
    actions[name] = callback;
    $('[data-action="' + name + '"]').click(function (e) {
	e.preventDefault();
	e.stopPropagation();
	callback();
	return false;
    });
    if (typeof groups !== 'undefined') {
	groups.forEach(function (group) {
	    if (!actionGroups.hasOwnProperty(group)) {
		actionGroups[group] = [];
	    }
	    actionGroups[group].push(name);
	});
    }
}

function activate(name)
{
    actions[name]();
}

function enableGroup(group)
{
    if (actionGroups.hasOwnProperty(group)) {
	actionGroups[group].forEach(function (name) {
	    enable(name);
	});
    }
}

function disableGroup(group)
{
    if (actionGroups.hasOwnProperty(group)) {
	actionGroups[group].forEach(function (name) {
	    disable(name);
	});
    }
}

function enable(name)
{
    if (typeof name === 'string') {
	$('[data-action="' + name + '"]').attr('disabled', false);
    } else {
	name.forEach(enable);
    }
}

function disable(name)
{
    if (typeof name === 'string') {
	$('[data-action="' + name + '"]').attr('disabled', true);
    } else {
	name.forEach(disable);
    }
}