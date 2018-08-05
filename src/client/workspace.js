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
import Lib from './common/lib';
import Config from './Config';

window.TEXTSTEP = {};
TEXTSTEP.cookies = cookies;
TEXTSTEP.util = util;
TEXTSTEP.ui = ui;
TEXTSTEP.paths = paths;

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

var focus = null;

TEXTSTEP.SERVER = root.getAttribute('data-server').replace(/\/$/, '');

TEXTSTEP.TIMEOUT = 10000;

TEXTSTEP.getToken = function () {
    return cookies.get('csrf_token');
};

TEXTSTEP.ajax = function(url, method, data = null, responseType = null) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        if (responseType !== null) {
            xhr.responseType = responseType;
        }
        var token = TEXTSTEP.getToken();
        xhr.setRequestHeader('X-Csrf-Token', token);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onload = function () {
            if (xhr.status === 200) {
                var response;
                if (responseType === null) {
                    responseType = xhr.getResponseHeader('Content-Type').toLowerCase();
                    if (responseType === 'application/json') {
                        response = JSON.parse(xhr.responseText);
                    } else {
                        response = xhr.response;
                    }
                } else {
                    response = xhr.response;
                }
                resolve(response);
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
        if (data !== null) {
            xhr.send(util.serializeQuery(data));
        } else {
            xhr.send();
        }
    });
};

TEXTSTEP.get = function (action, data = null, responseType = null) {
    if (data !== null) {
        var query = util.serializeQuery(data);
        if (action.indexOf('?') < 0) {
            action += '?' + query;
        } else {
            action += '&' + query;
        }
    }
    return TEXTSTEP.ajax(TEXTSTEP.SERVER + '/' + action, 'get', null, responseType);
};
TEXTSTEP.post = function (action, data = null, responseType = null) {
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
            loginFrame.elem.style.display = '';
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
                ui.shake(loginFrame.elem);
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
    var promises = [];
    for (var i = 0; i < dependencies.length; i++) {
        promises.push(loadLib(dependencies[i]));
    }
    Promise.all(promises).then(function (dependencies) {
        for (var i = 0; i < dependencies.length; i++) {
            apps[name].libs[dependencies[i].name] = dependencies[i];
        }
        apps[name].state = 'loaded';
        apps[name].onInit = init;
        apps[name].init();
        if (apps[name].deferred !== null) {
            apps[name].deferred.resolve(apps[name]);
            apps[name].deferred = null;
        }
    }).catch(function (error) {
        if (apps[name].deferred !== null) {
            apps[name].deferred.reject(error);
            apps[name].deferred = null;
        }
        unloadApp(name);
    });
};

TEXTSTEP.initLib = function (name, dependencies, init) {
    if (typeof init === 'undefined') {
        init = dependencies;
        dependencies = [];
    }
    if (!libs.hasOwnProperty(name)) {
        // ???
        return;
    }
    var promises = [];
    for (var i = 0; i < dependencies.length; i++) {
        promises.push(loadLib(dependencies[i])); }
    Promise.all(promises).then(function (dependencies) {
        for (var i = 0; i < dependencies.length; i++) {
            libs[name].libs[dependencies[i].name] = dependencies[i];
        }
        libs[name].state = 'loaded';
        libs[name].onInit = init;
        libs[name].init();
        if (libs[name].deferred !== null) {
            libs[name].deferred.resolve(libs[name]);
            libs[name].deferred = null;
        }
    }).catch(function (error) {
        if (libs[name].deferred !== null) {
            libs[name].deferred.reject(error);
            libs[name].deferred = null;
        }
        delete libs[name];
    });
};

TEXTSTEP.run = function (name, args) {
    return new Promise(function (resolve, reject) {
        args = args || {};
        if (apps.hasOwnProperty(name)) {
            if (apps[name].state === 'initialized') {
                dock.appendChild(apps[name].dockFrame);
            }
            try {
                apps[name].open(args);
                resolve(apps[name]);
            } catch (e) {
                reject(e);
            }
        } else {
            loadApp(name).then(function (app) {
                app.open(args);
                resolve(app);
            }).catch(reject);
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
            apps[name].dockFrame = ui.elem('div', {'class': 'dock-frame'}, [
                ui.elem('label', {}, [name])
            ]);
            apps[name].dockFrame.onmousedown = function (e) {
                e.preventDefault();
            };
            apps[name].dockFrame.onclick = function (e) {
                TEXTSTEP.run(name);
            };
            dock.appendChild(apps[name].dockFrame);
            apps[name].deferred = {promise: promise, resolve: resolve, reject: reject};
            var scriptSrc = TEXTSTEP.SERVER + '/download?path=/dist/apps/' + name + '.app/main.js';
            apps[name].scriptElem = ui.elem('script', {type: 'text/javascript', src: scriptSrc});
            apps[name].scriptElem.onerror = function () {
                dock.removeChild(apps[name].dockFrame);
                unloadApp(name);
                reject('Not found');
            };
            apps[name].timeout = setTimeout(function () {
                if (apps.hasOwnProperty(name)) {
                    if (apps[name].state === 'loading') {
                        unloadApp(name);
                        reject(name + ': Timeout');
                    }
                }
            }, TEXTSTEP.TIMEOUT);
            root.appendChild(apps[name].scriptElem);
        }
    });
    return promise;
}

function unloadApp(name) {
    if (apps.hasOwnProperty(name)) {
        apps[name].kill();
        root.removeChild(apps[name].scriptElem);
        delete(apps[name]);
    }
}

function loadLib(name) {
    var promise = new Promise(function (resolve, reject) {
        if (libs.hasOwnProperty(name)) {
            if (libs[name].deferred === null) {
                resolve(libs[name]);
            } else {
                libs[name].deferred.then(resolve, reject);
            }
        } else {
            libs[name] = new Lib(name);
            libs[name].deferred = {promise: promise, resolve: resolve, reject: reject};
            var scriptSrc = TEXTSTEP.SERVER + '/download?path=/dist/lib/' + name + '.js';
            libs[name].scriptElem = ui.elem('script', {type: 'text/javascript', src: scriptSrc});
            libs[name].scriptElem.onerror = function () {
                root.removeChild(script);
                delete libs[name];
                reject(name + 'Not found');
            };
            libs[name].timeout = setTimeout(function () {
                if (libs.hasOwnProperty(name)) {
                    if (libs[name].state === 'loading') {
                        unloadLib(name);
                        reject(name + ': Timeout');
                    }
                }
            }, TEXTSTEP.TIMEOUT);
            root.appendChild(libs[name].scriptElem);
        }
    });
    return promise;
}

function unloadLib(name) {
    if (libs.hasOwnProperty(name)) {
        root.removeChild(libs[name].scriptElem);
        delete(libs[name]);
    }
}


TEXTSTEP.getIcon = function (name, size = 32) {
    // TODO: onerror
    return ui.elem('img', {
        src: TEXTSTEP.SERVER + '/download?path=/dist/icons/default/' + size + '/' + name + '.png',
        width: size,
        height: size
    });
};

var nextFrameId = 0;

TEXTSTEP.openFrame = function (frame) {
    if (!frame.isOpen) {
        frame.id = nextFrameId++;
        frames[frame.id] = frame;
        main.appendChild(frame.elem);
        for (var tool in frame.toolFrames) {
            if (frame.toolFrames.hasOwnProperty(tool)) {
                menu.insertBefore(frame.toolFrames[tool].elem, menu.childNodes[0]);
            }
        }
        for (var i = 0; i < frame.menus.length; i++) {
            menu.insertBefore(frame.menus[i].elem, menu.childNodes[0]);
        }
        frame.isOpen = true;
        TEXTSTEP.focusFrame(frame);
    }
};

TEXTSTEP.closeFrame = function (frame) {
    if (frame.isOpen && frame.id !== null) {
        if (focus === frame) {
            focus.loseFocus();
            focus = null;
            // TODO: focus next frame
        }
        frame.isOpen = false;
        main.removeChild(frame.elem);
        delete frames[frame.id];
        for (var i = 0; i < frame.menus.length; i++) {
            menu.removeChild(frame.menus[i].elem);
        }
        for (var tool in frame.toolFrames) {
            if (frame.toolFrames.hasOwnProperty(tool)) {
                menu.removeChild(frame.toolFrames[tool].elem);
            }
        }
    }
};

TEXTSTEP.focusFrame = function (frame) {
    if (frame.isOpen) {
        if (focus !== null) {
            focus.loseFocus();
            focus.hide();
        }
        focus = frame;
        focus.show();
        focus.receiveFocus();
        document.title = frame.title;
    }
};

TEXTSTEP.getTasks = function () {
    return Object.values(apps);
};

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

window.onkeydown = function (e) {
    if (focus !== null) {
        focus.keydown(e);
    }
};

window.onresize = function () {
    for (var frame in frames) {
        if (frames.hasOwnProperty(frame)) {
            frames[frame].resized();
        }
    }
};

window.onpopstate = function (e) {
    if (e.state !== null) {
        skipHistory = true;
        TEXTSTEP.run(e.state.app, e.state.args);
        skipHistory = false;
    }
};

window.onbeforeunload = function (event) {
    for (var name in apps) {
        if (apps.hasOwnProperty(name) && apps[name].state === 'running') {
            var frame = apps[name].getUnsavedFrame();
            if (frame !== null) {
                if (!frame.hasFocus) {
                    frame.requestFocus();
                }
                return 'Unsaved data in: ' + frame.title;
            }
        }
    }
};

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
