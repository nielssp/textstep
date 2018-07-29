/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as cookies from 'js-cookie';
import * as ui from './common/ui';
import * as paths from './common/paths';
import Frame from './common/frame';
import Config from './Config';

window.TEXTSTEP = {};
TEXTSTEP.cookies = cookies;
TEXTSTEP.ui = ui;
TEXTSTEP.paths = ui;

TEXTSTEP.config = new Config(function (keys) {
    return TEXTSTEP.get('get-conf', { keys: keys });
}, function (data) {
    return TEXTSTEP.post('set-conf', { data: data });
});

var root = document.body;
var menu = createMenu();
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


function serializeData(data) {
    var pairs = [];
    for (var key in data) {
        if(data.hasOwnProperty(key)) {
            pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
        }
    }
    return pairs.join('&');
}


TEXTSTEP.ajax = function(url, method, data, responseType) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.responseType = responseType;
    var token = TEXTSTEP.getToken();
    xhr.setRequestHeader('X-Csrf-Token', token);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        var newToken = TEXSTEP.getToken();
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
        xhr.send(serializeData(data));
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
        ui.elem('input', {type: 'checkbox', name: 'remember[remember]', value: 'remember', id: 'login-remember'}),
        ui.elem('label', {'for': 'login-remember'}, ['Remember'])
      ]),
      ui.elem('div', {'class': 'buttons'}, [
        ui.elem('button', {type: 'submit', title: 'Log in'}, [
          ui.elem('span', {'class': 'icon icon-unlock'})
        ])
      ]),
    ]);
    loginFrame.contentElem.appendChild(formElem);
    loginFrame.overlayElem = ui.elem('div', {id: 'login-overlay'}, [loginFrame.elem]);
    root.appendChild(loginFrame.overlayElem);
  }
  loginFrame.overLayElem.style.display = 'block';
};

TEXTSTEP.initApp = function (name, dependencies, init) {
  if (typeof init === 'undefined') {
    init = dependencies;
    dependencies = [];
  }
};

TEXTSTEP.initLib = function (name, dependencies, init) {
  if (typeof init === 'undefined') {
    init = dependencies;
    dependencies = [];
  }
};

function createMenu() {
  return ui.elem('aside', {id: 'menu'}, [
    ui.elem('div', {id: 'workspace-menu'}, [
      ui.elem('header', {}, ['Workspace']),
      ui.elem('nav', {}, [
      ])
    ])
  ]);
}

TEXTSTEP.init = function (root) {
  TEXTSTEP.get('who-am-i', {}, 'json').then(function (data) {
    root.appendChild(menu);
    root.appendChild(dock);
    root.appendChild(main);
  });
};

