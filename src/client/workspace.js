/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as cookies from 'js-cookie';
import * as ui from './common/ui';
import * as util from './common/util';
import * as paths from './common/paths';
import Frame from './common/frame';
import Menu from './common/menu';
import App from './common/app';
import Config from './Config';

window.TEXTSTEP = {};
TEXTSTEP.cookies = cookies;
TEXTSTEP.util = ui;
TEXTSTEP.ui = ui;
TEXTSTEP.paths = ui;

TEXTSTEP.config = new Config(function (keys) {
    return TEXTSTEP.get('get-conf', { keys: keys });
}, function (data) {
    return TEXTSTEP.post('set-conf', { data: data });
});

var root = document.body;
var menu = createMainMenu();
var dock = ui.elem('div', {id: 'dock'});
var main = ui.elem('main');
var loginFrame = null;

var apps = {};
var libs = {};
var frames = {};

var skipHistory = false;
var previousTitle = null;

TEXTSTEP.SERVER = root.getAttribute('data-server').replace(/\/$/, '');

TEXTSTEP.getToken = function () {
    return cookies.get('csrf_token');
};

TEXTSTEP.ajax = function(url, method, data, responseType) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.responseType = responseType;
        var token = TEXTSTEP.getToken();
        xhr.setRequestHeader('X-Csrf-Token', token);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                var newToken = TEXTSTEP.getToken();
                if (newToken !== token && xhr.status === 400) {
                    TEXTSTEP.ajax(url, method, data, responseType).then(resolve, reject);
                } else if (xhr.status === 401) {
                    TEXTSTEP.requestLogin().then(
                        () => TEXTSTEP.ajax(url, method, data, responseType).then(resolve, reject),
                        reject
                    );
                } else {
                    reject(xhr);
                }
            }
        };
        xhr.onerror = () => reject(xhr);
        if (typeof data !== 'undefined') {
            xhr.send(util.serializeQuery(data));
        } else {
            xhr.send();
        }
    });
};

TEXTSTEP.get = function (action, data, responseType) {
    return TEXTSTEP.ajax(TEXTSTEP.SERVER + '/' + action, 'get', data, responseType);
};
TEXTSTEP.post = function (action, data, responseType) {
    return TEXTSTEP.ajax(TEXTSTEP.SERVER + '/' + action, 'post', data, responseType);
};

TEXTSTEP.requestLogin = function() {
    return new Promise(function (resolve, reject) {
        if (loginFrame === null) {
            loginFrame = new Frame('Log in');
            loginFrame.formElem = ui.elem('form', {method: 'post', id: 'login'}, [
                ui.elem('div', {'class': 'field'}, [
                    ui.elem('label', {'for': 'login-username'}, ['Username']),
                    ui.elem('input', {type: 'text', name: 'username', id: 'login-username'})
                ]),
                ui.elem('div', {'class': 'field'}, [
                    ui.elem('label', {'for': 'login-password'}, ['Password']),
                    ui.elem('input', {type: 'password', name: 'password', id: 'login-password'})
                ]),
                ui.elem('div', {'class': 'field remember'}, [
                    ui.elem('input', {type: 'checkbox', name: 'remember', value: 'remember', id: 'login-remember'}),
                    ui.elem('label', {'for': 'login-remember'}, ['Remember'])
                ]),
                ui.elem('div', {'class': 'buttons'}, [
                    ui.elem('button', {type: 'submit', title: 'Log in'}, [
                        ui.elem('span', {'class': 'icon icon-unlock'})
                    ])
                ]),
            ]);
            loginFrame.contentElem.appendChild(loginFrame.formElem);
            loginFrame.overlayElem = ui.elem('div', {id: 'login-overlay'}, [loginFrame.elem]);
            root.appendChild(loginFrame.overlayElem);
        }
        loginFrame.overlayElem.style.display = 'block';
        loginFrame.formElem.username.disabled = false;
        loginFrame.formElem.password.disabled = false;
        loginFrame.formElem.remember.disabled = false;
        loginFrame.formElem.username.focus();
        loginFrame.formElem.onsubmit = function () {
            loginFrame.formElem.username.disabled = true;
            loginFrame.formElem.password.disabled = true;
            loginFrame.formElem.remember.disabled = true;
            var data = {
                username: loginFrame.formElem.username.value,
                password: loginFrame.formElem.password.value,
                remember: loginFrame.formElem.remember.checked ? 'remember' : null
            };
            TEXTSTEP.post('login', data).then(function () {
                loginFrame.formElem.username.disabled = false;
                loginFrame.formElem.password.disabled = false;
                loginFrame.formElem.remember.disabled = false;
                loginFrame.overlayElem.style.display = 'none';
                loginFrame.formElem.password.value = '';
                loginFrame.formElem.onsubmit = null;
                resolve();
            }, function () {
                loginFrame.formElem.username.disabled = false;
                loginFrame.formElem.password.disabled = false;
                loginFrame.formElem.remember.disabled = false;
                loginFrame.formElem.username.focus();
                loginFrame.formElem.username.select();
                loginFrame.formElem.password.value = '';
            });
            return false;
        };
    });
};

TEXTSTEP.initApp = function (name, dependencies, init) {
    if (typeof init === 'undefined') {
        init = dependencies;
        dependencies = [];
    }
    if (!apps.hasOwnProperty(name)) {
        // ???
        return;
    }
    apps[name].state = 'loaded';
    apps[name].onInit = init;
    apps[name].init();
    if (apps[name].deferred !== null) {
        apps[name].deferred.resolve(apps[name]);
        apps[name].deferred = null;
    }
};

TEXTSTEP.initLib = function (name, dependencies, init) {
    if (typeof init === 'undefined') {
        init = dependencies;
        dependencies = [];
    }
};

TEXTSTEP.run = function (name, args) {
    return new Promise(function (resolve, reject) {
        args = args || {};
        if (apps.hasOwnProperty(name)) {
        } else {
            loadApp(name).then(function (app) {
                app.open(args);
            });
        }
    });
};

function loadApp(name) {
    var promise = new Promise(function (resolve, reject) {
        if (apps.hasOwnProperty(name)) {
            if (apps[name].deferred === null) {
                resolve(apps[name]);
            } else {
                apps[name].deferred.then(resolve, reject);
            }
        } else {
            apps[name] = new App(name);
            apps[name].deferred = {promise: promise, resolve: resolve, reject: reject};
            var scriptSrc = TEXTSTEP.SERVER + '/download?path=/dist/apps/' + name + '.app/main.js';
            var script = ui.elem('script', {type: 'text/javascript', src: scriptSrc});
            root.appendChild(script);
        }
    });
    return promise;
}

function createMainMenu() {
    var list = ui.elem('ul');
    var logout = ui.elem('button', {}, ['Log out']);
    logout.onclick = function () {
        TEXTSTEP.post('logout').then(function () {
            location.reload();
        });
    };
    list.appendChild(ui.elem('li', {}, [logout]));
    return ui.elem('aside', {id: 'menu'}, [
        ui.elem('div', {id: 'workspace-menu'}, [
            ui.elem('header', {}, ['Workspace']),
            ui.elem('nav', {}, [
                list
            ])
        ])
    ]);
}

TEXTSTEP.init = function (root) {
    TEXTSTEP.get('who-am-i', {}, 'json').then(function (data) {
        root.appendChild(menu);
        root.appendChild(dock);
        root.appendChild(main);
        ui.byId('workspace-menu').style.display = 'block';
        TEXTSTEP.run('test');
    });
};

TEXTSTEP.init(root);
