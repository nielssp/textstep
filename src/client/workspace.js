/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './common/ui';
import * as util from './common/util';
import * as paths from './common/paths';
import {Frame} from './common/frame';
import Menu from './common/menu';
import App from './common/app';
import Lib from './common/lib';
import Config from './common/config';

import dragula from 'dragula';
import 'dragula/dist/dragula.min.css';

if (window.TEXTSTEP) {
  alert('TEXTSTEP Workspace already loaded!');
  throw 'Workspace already loaded';
}

window.TEXTSTEP = {};
TEXTSTEP.util = util;
TEXTSTEP.ui = ui;
TEXTSTEP.paths = paths;
TEXTSTEP.Menu = Menu;
TEXTSTEP.Config = Config;

var root = document.body;
var workspaceMenu = createWorkspaceMenu();
var menu = ui.elem('aside', {id: 'menu'}, [workspaceMenu.elem]);
var main = ui.elem('main');
var dock = ui.elem('div', {id: 'dock'});
var dockDrag = dragula([dock]);
var loginFrame = null;

var apps = {};
var libs = {};
var frames = {};

var sessionId = null;

var focus = null;

var floatingMenu = null;

var activeSkin = null;

var events = {};

TEXTSTEP.SERVER = root.getAttribute('data-server').replace(/\/$/, '');

TEXTSTEP.DIST_PATH = root.getAttribute('data-dist');

TEXTSTEP.LOAD_TIMEOUT = 10000;

TEXTSTEP.user = null;

TEXTSTEP.isCurrentSession = function (id) {
    return id === sessionId;
};

TEXTSTEP.trigger = function (eventName, eventData) {
    if (events.hasOwnProperty(eventName)) {
        events[eventName](eventData);
    }
};

TEXTSTEP.addEventListener = function (eventName, handler) {
    if (events.hasOwnProperty(eventName)) {
        let previous = events[ eventName];
        events[eventName] = (eventData) => {
            if (previous(eventData) !== false) {
                return handler(eventData);
            }
        };
    } else {
        events[eventName] = handler;
    }
};

TEXTSTEP.prepareRequest = function(xhr) {
    if (sessionId !== null) {
        xhr.setRequestHeader('X-Auth-Token', sessionId);
    }
};

TEXTSTEP.RequestData = function (data, type = 'application/json') {
    this.data = data;
    this.type = type;
};

TEXTSTEP.RequestData.prototype.serialize = function () {
    if (this.type == 'application/json') {
        return JSON.stringify(this.data);
    }
    return this.data;
};

TEXTSTEP.ajax = function(url, method, data = null, responseType = null) {
    if (!(data instanceof TEXTSTEP.RequestData) && !(data instanceof FormData)) {
        data = new TEXTSTEP.RequestData(data);
    }
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        if (responseType !== null) {
            xhr.responseType = responseType;
        }
        if (sessionId !== null) {
            xhr.setRequestHeader('X-Auth-Token', sessionId);
        }
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
            } else if (xhr.status === 204) {
                resolve('');
            } else if (xhr.status === 401) {
                TEXTSTEP.requestLogin(true).then(
                    () => TEXTSTEP.ajax(url, method, data, responseType).then(resolve, reject),
                    reject
                );
            } else if (xhr.status >= 500) {
                reject({
                    errorType: 'SERVER_ERROR',
                    message: 'Internal server error',
                    context: { details: xhr.response }
                });
            } else {
                try {
                    const parsed = JSON.parse(xhr.response)
                    if (typeof parsed === 'object' && parsed.errorType && parsed.message && parsed.context) {
                        reject(parsed);
                    } else {
                        throw 'Invalid response';
                    }
                } catch (e) {
                    reject({
                        errorType: 'UNSPECIFIED',
                        message: 'Server returned ' + xhr.status,
                        context: {
                            status: xhr.status
                        }
                    });
                }
            }
        };
        xhr.onerror = () => reject({
            errorType: 'UNSPECIFIED',
            message: xhr.response,
            context: {}
        });
        if (data !== null) {
            if (data instanceof FormData) {
                xhr.send(data);
            } else {
                if (data.type) {
                    xhr.setRequestHeader('Content-Type', data.type);
                }
                xhr.send(data.serialize());
            }
        } else {
            xhr.send();
        }
    });
};

TEXTSTEP.url = function (action, query = {}, addToken = true) {
    if (addToken && sessionId !== null) {
        query.access_token = sessionId;
    }
    let serialized = util.serializeQuery(query);
    if (serialized !== '') {
        if (action.indexOf('?') < 0) {
            action += '?' + serialized;
        } else {
            action += '&' + serialized;
        }
    }
    return TEXTSTEP.SERVER + '/' + action;
};

TEXTSTEP.get = function (action, query = {}, responseType = null) {
    return TEXTSTEP.ajax(TEXTSTEP.url(action, query, false), 'get', null, responseType);
};

TEXTSTEP.post = function (action, query = {}, data = null, responseType = null) {
    return TEXTSTEP.ajax(TEXTSTEP.url(action, query, false), 'post', data, responseType);
};

TEXTSTEP.put = function (action, query = {}, data = null, responseType = null) {
    return TEXTSTEP.ajax(TEXTSTEP.url(action, query, false), 'put', data, responseType);
};

TEXTSTEP.delete = function (action, query = {}, responseType = null) {
    return TEXTSTEP.ajax(TEXTSTEP.url(action, query, false), 'delete', null, responseType);
};

TEXTSTEP.hasPermission = function (permission) {
    if (!TEXTSTEP.user) {
        return false;
    }
    if (TEXTSTEP.user.system) {
        return true;
    }
    for (let p of TEXTSTEP.user.permissions) {
        if (p === permission || permission.startsWith(p + '.')) {
            return true;
        }
    }
    return false;
};

TEXTSTEP.requestLogin = function (overlay = false) {
    if (loginFrame && loginFrame.promise) {
        return loginFrame.promise;
    }
    let promise = new Promise(function (resolve, reject) {
        if (loginFrame === null) {
            loginFrame = new Frame('Log in');
            loginFrame.padding();
            loginFrame.capsLockWarning = ui.elem('div', {'class': 'caps-lock-warning'}, [
                'Caps Lock appears to be on'
            ]),
            loginFrame.formElem = ui.elem('form', {method: 'post', id: 'login'});
            let stack = new ui.StackColumn();
            loginFrame.formElem.appendChild(stack.outer);
            stack.innerPadding = true;
            let id = ui.createId();
            stack.append(ui.elem('label', {'for': id}, ['Username']));
            stack.append(ui.elem('input', {type: 'text', name: 'username', id: id}));
            id = ui.createId();
            stack.append(ui.elem('label', {'for': id}, ['Password']));
            stack.append(ui.elem('input', {type: 'password', name: 'password', id: id}));
            let footer = new ui.StackRow();
            footer.alignItems = 'center';
            let remember = new ui.StackRow();
            remember.alignItems = 'center';
            remember.innerPadding = true;
            id = ui.createId();
            remember.append(ui.elem('input', {type: 'checkbox', name: 'remember', value: 'remember', id: id}));
            remember.append(ui.elem('label', {'for': id}, ['Remember']));
            footer.append(remember, {grow: 1});
            footer.append(ui.elem('button', {type: 'submit', title: 'Log in'}, [
                TEXTSTEP.getIcon('unlock', 22)
            ]));
            stack.append(footer);
            loginFrame.formElem.password.onkeydown = e => {
                if (loginFrame.capsLockWarning.style.display === 'block' && e.key === 'CapsLock') {
                    loginFrame.capsLockWarning.style.display = 'none';
                } else if (e.key === e.key.toUpperCase() && e.key !== e.key.toLowerCase() && !e.shiftKey) {
                    loginFrame.capsLockWarning.style.display = 'block';
                }
            };
            loginFrame.append(loginFrame.formElem);
            loginFrame.overlayElem = ui.elem('div', {id: 'login-overlay'}, [loginFrame.outer]);
            loginFrame.receiveFocus();
            loginFrame.outer.style.display = '';
            root.appendChild(loginFrame.overlayElem);
        }
        if (overlay) {
            loginFrame.overlayElem.className = 'login-overlay-dark';
        } else {
            loginFrame.overlayElem.className = '';
        }
        loginFrame.capsLockWarning.style.display = 'none';
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
            };
            TEXTSTEP.post('session', {}, data).then(data => {
                sessionId = data.sessionId;
                TEXTSTEP.user = data.user;
                if (loginFrame.formElem.remember.checked) {
                    sessionStorage.removeItem('textstepSessionId');
                    localStorage.setItem('textstepSessionId', sessionId);
                    let validUntil = new Date();
                    validUntil.setFullYear(validUntil.getFullYear() + 1);
                    TEXTSTEP.put('storage', {path: '/system/sessions.json', key: sessionId}, {
                        validUntil: validUntil
                    }).catch(error => console.error('Could not extend session', error));
                } else {
                    localStorage.removeItem('textstepSessionId');
                    sessionStorage.setItem('textstepSessionId', sessionId);
                }
                loginFrame.formElem.username.disabled = false;
                loginFrame.formElem.password.disabled = false;
                loginFrame.formElem.remember.disabled = false;
                loginFrame.overlayElem.style.display = 'none';
                loginFrame.formElem.password.value = '';
                loginFrame.formElem.onsubmit = null;
                loginFrame.promise = null;
                workspaceMenu.setTitle('Workspace for ' + TEXTSTEP.user.username + '');
                TEXTSTEP.trigger('login');
                resolve();
            }, error => {
                if (error.errorType !== 'INVALID_CREDENTIALS') {
                    alert(error.message);
                }
                ui.shake(loginFrame.outer);
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
    loginFrame.promise = promise;
    return promise;
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

TEXTSTEP.open = function (path) {
    var fileName = paths.fileName(path);
    if (fileName.match(/\.md/i)) {
        return TEXTSTEP.run('write', {path: path});
    } else if (fileName.match(/\.webm/i)) {
        return TEXTSTEP.run('play', {path: path});
    } else if (fileName.match(/\.(?:jpe?g|png|gif|ico|svg)/i)) {
        return TEXTSTEP.run('view', {path: path});
    } else if (fileName.match(/\.(?:php|log|json|html|css|js|sass|scss)/i)) {
        return TEXTSTEP.run('code', {path: path});
    } else if (fileName.match(/\.app/i)) {
        return TEXTSTEP.run(fileName.replace(/\.app/i, ''));
    } else {
        return TEXTSTEP.get('file', {path: path}).then(function (data) {
            if (data.type === 'directory') {
                return TEXTSTEP.run('files', {path: path});
            } else {
                return TEXTSTEP.run('code', {path: path});
            }
        });
    }
}

function initDock() {
    dockDrag.on('drop', (el, target, source, sibling) => {
        let settings = localStorage.getItem('textstepDock');
        if (settings) {
            try {
                settings = JSON.parse(settings);
            } catch (error) {
                console.error('Could not parse dock settings', error);
                settings = {};
            }
        } else {
            settings = {};
        }
        let order = 0;
        for (let i = 0; i < dock.children.length; i++) {
            let name = dock.children[i].getAttribute('data-app-name');
            if (settings.hasOwnProperty(name)) {
                if (settings[name].order <= order) {
                    settings[name].order = ++order;
                } else {
                    order = settings[name].order;
                }
            } else {
                settings[name] = {order: ++order};
            }
        }
        localStorage.setItem('textstepDock', JSON.stringify(settings));
    });
}

function openDockFrame(dockFrame, name) {
    let settings = localStorage.getItem('textstepDock');
    if (settings) {
        try {
            settings = JSON.parse(settings);
        } catch (error) {
            console.error('Could not parse dock settings', error);
            settings = null;
        }
    }
    dockFrame.setAttribute('data-app-name', name);
    dockFrame.tabIndex = 0;
    if (settings && settings.hasOwnProperty(name)) {
        let order = settings[name].order;
        for (let i = 0; i < dock.children.length; i++) {
            let child = dock.children[i];
            let childName = child.getAttribute('data-app-name');
            if (settings.hasOwnProperty(childName)) {
                if (settings[childName].order < order) {
                    continue;
                }
            }
            dock.insertBefore(dockFrame, child);
            return;
        }
    }
    dock.appendChild(dockFrame);
}

function closeDockFrame(dockFrame) {
    dock.removeChild(dockFrame);
}

TEXTSTEP.run = function (name, args) {
    console.log('run', name, args);
    return new Promise(function (resolve, reject) {
        args = args || {};
        if (apps.hasOwnProperty(name)) {
            if (apps[name].state === 'initialized') {
                openDockFrame(apps[name].dockFrame, name);
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
            openDockFrame(apps[name].dockFrame, name);
            apps[name].deferred = {promise: promise, resolve: resolve, reject: reject};
            var scriptSrc = TEXTSTEP.url('content', {path: '/dist/apps/' + name + '.app/main.js'});
            apps[name].scriptElem = ui.elem('script', {type: 'text/javascript', src: scriptSrc});
            apps[name].scriptElem.onerror = function () {
                closeDockFrame(apps[name].dockFrame);
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
            }, TEXTSTEP.LOAD_TIMEOUT);
            root.appendChild(apps[name].scriptElem);
        }
    });
    return promise;
}

TEXTSTEP.kill = function (name) {
    unloadApp(name);
};

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
            var scriptSrc = TEXTSTEP.url('content', {path: '/dist/lib/' + name + '.js'});
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
            }, TEXTSTEP.LOAD_TIMEOUT);
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
    let icon = ui.elem('div', {class: 'icon'});
    icon.style.width = size + 'px';
    icon.style.height = size + 'px';
    if (TEXTSTEP.user) {
        icon.style.backgroundImage = 'url(' + TEXTSTEP.url('content', {path: '/dist/icons/default/' + size + '/' + name + '.png'}) + ')';
    } else {
        icon.style.backgroundImage = 'url(' + TEXTSTEP.DIST_PATH + '/icons/default/' + size + '/' + name + '.png)';
    }
    icon.style.backgroundSize = `${size}px ${size}px`;
    return icon;
};

TEXTSTEP.getFileIcon = function (type, size = 32) {
    let icon = 'file-unknown';
    switch (type.toLowerCase()) {
        case 'html':
        case 'htm':
            icon = 'file-html';
            break;
        case 'php':
        case 'tss':
        case 'json':
            icon = 'file-php';
            break;
        case 'md':
            icon = 'file-md';
            break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'ico':
        case 'svg':
        case 'gif':
            icon = 'generic-image';
            break;
        case 'webm':
            icon = 'generic-video';
            break;
    }
    return TEXTSTEP.getIcon(icon, size);
};

var nextFrameId = 0;

TEXTSTEP.openFrame = function (frame) {
    if (!frame.isOpen) {
        frame.frameId = nextFrameId++;
        frames[frame.frameId] = frame;
        main.appendChild(frame.outer);
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
    if (frame.isOpen && frame.frameId !== null) {
        if (focus === frame) {
            focus.loseFocus();
            focus = null;
        }
        frame.isOpen = false;
        main.removeChild(frame.outer);
        delete frames[frame.frameId];
        for (var i = 0; i < frame.menus.length; i++) {
            menu.removeChild(frame.menus[i].elem);
        }
        for (var tool in frame.toolFrames) {
            if (frame.toolFrames.hasOwnProperty(tool)) {
                menu.removeChild(frame.toolFrames[tool].elem);
            }
        }
        if (!focus) {
            // TODO: use stack of most recent frames
            for (var id in frames) {
                if (frames.hasOwnProperty(id)) {
                    TEXTSTEP.focusFrame(frames[id]);
                    return;
                }
            }
            root.classList.add('show-desktop');
        }
    }
};

TEXTSTEP.focusFrame = function (frame) {
    if (frame.isOpen && frame !== focus) {
        if (focus !== null) {
            focus.loseFocus();
            if (!frame.isFloating) {
                focus.hide();
            }
        }
        focus = frame;
        focus.show();
        focus.receiveFocus();
        document.title = frame.title;
        root.classList.remove('show-desktop');
    }
};

TEXTSTEP.openFloatingMenu = function (menu) {
    if (floatingMenu) {
        floatingMenu.close();
    }
    floatingMenu = menu;
};

TEXTSTEP.closeFloatingMenu = function () {
    if (floatingMenu) {
        floatingMenu.close();
        floatingMenu = null;
    }
};

TEXTSTEP.getTasks = function () {
    return Object.values(apps);
};

TEXTSTEP.getContainerSize = function () {
    return main.getBoundingClientRect();
};

TEXTSTEP.toggleMenu = function () {
    root.classList.toggle('show-menu');
};

TEXTSTEP.applyTheme = function (name) {
    let scriptSrc = TEXTSTEP.DIST_PATH + '/themes/' + name + '/theme.css';
    let scriptElem = ui.elem('link', {rel: 'stylesheet', type: 'text/css', href: scriptSrc});
    scriptElem.onerror = function () {
        root.removeChild(scriptElem);
    };
    root.appendChild(scriptElem);
};

TEXTSTEP.applyIcons = function (name) {
    let scriptSrc = TEXTSTEP.DIST_PATH + '/icons/' + name + '/icons.js';
    let scriptElem = ui.elem('script', {type: 'text/javascript', src: scriptSrc});
    scriptElem.onerror = function () {
        root.removeChild(scriptElem);
    };
    root.appendChild(scriptElem);
};

TEXTSTEP.getSkin = function () {
    if (!activeSkin) {
        activeSkin = {};
        let skin = localStorage.getItem('textstepSkin');
        if (skin) {
            try {
                activeSkin = JSON.parse(skin);
            } catch (error) {
                console.error('Could not parse skin', error);
            }
        }
    }
    return activeSkin;
};

TEXTSTEP.getSkinProperty = function (property) {
    let skin = TEXTSTEP.getSkin();
    if (skin.hasOwnProperty(property)) {
        return skin[property];
    }
    return getComputedStyle(root).getPropertyValue('--' + property);
};

TEXTSTEP.setSkinProperty = function (property, value) {
    TEXTSTEP.getSkin()[property] = value;
    TEXTSTEP.applySkin(activeSkin);
};

TEXTSTEP.applySkin = function (skin) {
    TEXTSTEP.resetSkin();
    activeSkin = skin;
    for (let key in skin) {
        if (skin.hasOwnProperty(key)) {
            root.style.setProperty('--' + key, skin[key]);
        }
    }
    if (skin.hasOwnProperty('desktop-bg')) {
        document.querySelector('meta[name="theme-color"]').content = skin['desktop-bg'];
    }
    localStorage.setItem('textstepSkin', JSON.stringify(skin));
    TEXTSTEP.trigger('skinChanged', activeSkin);
};

TEXTSTEP.resetSkin = function () {
    for (let i = root.style.length - 1; i >= 0; i--) {
        let property = root.style[i];
        if (property.startsWith('--')) {
            root.style.removeProperty(property);
        }
    }
    localStorage.removeItem('textstepSkin');
};

function createWorkspaceMenu() {
    var menu = new Menu('Workspace');
    let runCommand = name => TEXTSTEP.run(name);
    menu.commands.define('files', runCommand);
    menu.commands.define('build', runCommand);
    menu.commands.define('terminal', runCommand);
    menu.commands.define('control-panel', runCommand);
    menu.commands.define('switch-user', () => {
        TEXTSTEP.delete('session').then(function () {
            TEXTSTEP.requestLogin(true).then(function () {
            });
        });
    });
    menu.commands.define('logout', () => {
        TEXTSTEP.delete('session').then(function () {
            localStorage.removeItem('textstepSessionId');
            sessionStorage.removeItem('textstepSessionId');
            sessionId = null;
            location.reload();
        });
    });
    menu.addItem('Files', 'files');
    menu.addItem('Build', 'build');
    menu.addItem('Terminal', 'terminal');
    menu.addItem('Control panel', 'control-panel');
    menu.addSubmenu('Session')
        .addItem('Switch user ', 'switch-user')
        .addItem('Log out', 'logout');
    return menu;
}

window.onkeydown = function (e) {
    if (focus !== null) {
        focus.keydown(e);
    }
};

window.onmousedown = function (e) {
    if (focus !== null) {
        focus.mouseDown(e);
    }
};

window.onmouseup = function (e) {
    if (focus !== null) {
        focus.mouseUp(e);
    }
};

window.onmousemove = function (e) {
    if (focus !== null) {
        focus.mouseMove(e);
    }
};

window.onresize = function () {
    for (var frame in frames) {
        if (frames.hasOwnProperty(frame)) {
            frames[frame].resized();
        }
    }
};

let skipHistory = false;
var previousTitle = null;

TEXTSTEP.pushState = function (title, name, args) {
    if (!skipHistory) {
        var path = '#' + name;
        if (Object.keys(args).length !== 0) {
            path += '?' + util.serializeQuery(args).replace(/%2F/gi, '/');
        }
        if (previousTitle !== null) {
            //document.title = previousTitle;
        }
        history.pushState({app: name, args: args}, previousTitle, path);
        previousTitle = title;
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

root.onclick = function (event) {
    TEXTSTEP.closeFloatingMenu();
    if (root.classList.contains('show-menu')) {
        root.classList.toggle('show-menu');
        dockDrag.cancel(true);
    }
};

root.ondragenter = function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'none';
};

root.ondragleave = function (e) {
    e.preventDefault();
};

root.ondragover = function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'none';
};

function requestAuthenticatedUser() {
    sessionId = sessionStorage.getItem('textstepSessionId');
    if (!sessionId) {
        sessionId = localStorage.getItem('textstepSessionId');
    }
    return new Promise((resolve, reject) => {
        function handleResult(user) {
            if (user === null) {
                TEXTSTEP.requestLogin().then(
                    () => TEXTSTEP.get('who-am-i', {}, 'json').then(handleResult, reject)
                );
            } else {
                resolve(user);
            }
        };
        TEXTSTEP.get('who-am-i', {}, 'json').then(handleResult, error => {
            alert(error.message);
            handleResult(null);
        });
    });
}

TEXTSTEP.init = function (root) {
    TEXTSTEP.applyTheme('default');
    TEXTSTEP.applyIcons('default');
    TEXTSTEP.applySkin(TEXTSTEP.getSkin());
    initDock();
    requestAuthenticatedUser().then(user => {
        TEXTSTEP.user = user;
        workspaceMenu.setTitle('Workspace for ' + user.username + '');
        workspaceMenu.header.appendChild(ui.elem('span', {'class': 'version'}, user.version));
        root.appendChild(menu);
        root.appendChild(main);
        root.appendChild(dock);
        let start = user.shell;
        let args = {};
        if (location.hash.length > 1) {
            let appAndArgs = location.hash.slice(1).split('?');
            start = appAndArgs[0];
            if (appAndArgs.length > 1) {
                args = util.unserializeQuery(appAndArgs[1]);
            }
        }
        TEXTSTEP.get('content', { path: user.home + '/autostart.json' }, 'json').then(data => {
            if (!Array.isArray(data)) {
                return;
            }
            return Promise.all(data.map(name => TEXTSTEP.run(name)));
        }, error => {
            console.log(error);
        }).finally(() => {
            TEXTSTEP.run(start, args).catch(function (error) {
                alert('Could not start application: ' + start + ': ' + error);
            });
        });
    });
};

TEXTSTEP.init(root);
