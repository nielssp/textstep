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

$(document).ajaxError(ui.handleError);

window.BLOGSTEP = {};

var apps = {};

function App(name) {
    this.name = name;
    this.state = 'loading';
    this.frame = null;
    this.onInit = null;
    this.onSuspend = null;
    this.onResume = null;
    this.onClose = null;
}

App.prototype.init = function () {
    if (this.state !== 'loaded') {
        console.error('init: unexpected state', this.state, 'app', this.name);
        return;
    }
    this.state = 'initializing';
    if (this.onInit !== null) {
        this.onInit(this);
    }
    this.state = 'running';
};

App.prototype.suspend = function () {
    if (this.state !== 'running') {
        console.error('suspend: unexpected state', this.state, 'app', this.name);
        return;
    }
    this.state = 'suspending';
    if (this.onSuspend !== null) {
        this.onSuspend(this);
    }
    if (this.state === 'suspending') {
        this.frame.hide();
        this.state = 'suspended';
    }
};

App.prototype.resume = function () {
    if (this.state !== 'suspended') {
        console.error('resume: unexpected state', this.state, 'app', this.name);
        return;
    }
    this.state = 'resuming';
    if (this.onResume !== null) {
        this.onResume(this);
    }
    if (this.state === 'resuming') {
        this.frame.show();
        this.state = 'running';
    }
};

BLOGSTEP.PATH = $('body').data('path').replace(/\/$/, '');

BLOGSTEP.init = function (name, onInit) {
    apps[name].onInit = onInit;
    apps[name].init();
};

BLOGSTEP.run = function (name) {
    
};

BLOGSTEP.server = {};
BLOGSTEP.server.get = function (action, data, handle) {
};

function load(name) {
    apps[name] = new App(name);
    $.ajax({
        url: BLOGSTEP.PATH + '/api/load',
        data: { name: name },
        method: 'get',
        success: function (data) {
            var $doc = $('<div></div>');
            $doc.html(data);
            var $styles = $doc.find('link[rel="stylesheet"]');
            var $scripts = $doc.find('script[src]');
            apps[name].frame = $doc.find('.frame');
            apps[name].state = 'loaded';
            $('head').append($styles);
            $('main').append(apps[name].frame);
            $('body').append($scripts);
        }
    });
}

$(document).ready(function () {
    $.ajax({
	url: BLOGSTEP.PATH + '/api/who-am-i',
	method: 'get',
	success: function (data) {
	    $('#workspace-menu').show();
	    $('#workspace-menu .username').text(data.username);
	    $('#login-username').val(data.username);
	    $('#login-overlay').addClass('login-overlay-dark');
	    load('test');
	}
    });
});