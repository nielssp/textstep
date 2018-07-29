/* 
 * BlogSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = require('jquery');

var self;

function switchPage(page) {
    self.frame.find('.control-panel-page').removeClass('active');
    self.frame.find('.control-panel-' + page).addClass('active');
    self.frame.find('.frame-iconbar button').removeClass('active');
    self.frame.find('.frame-iconbar button[data-action="' + page + '"]').addClass('active');
}


function open(app, args) {
    BLOGSTEP.config.update();
}

function save() {
    BLOGSTEP.config.commit();
}

function cancel() {
    BLOGSTEP.config.update();
}

BLOGSTEP.init('control-panel', function (app) {
    self = app;

    app.defineAction('site', switchPage);
    app.defineAction('users', switchPage);
    app.defineAction('personalization', switchPage);
    app.defineAction('system', switchPage);
    app.defineAction('about', switchPage);
    
    app.defineAction('save', save);
    app.defineAction('cancel', cancel);
    
    var menu = app.addMenu('Control panel');
    menu.addItem('Site', 'site');
    menu.addItem('Users and groups', 'users');
    menu.addItem('Personalization', 'personalization');
    menu.addItem('System', 'system');
    menu.addItem('About BLOGSTEP', 'about');
    menu.addItem('Close', 'close');
    
    self.frame.find('[data-binding]').each(function () {
        BLOGSTEP.config.get($(this).data('binding')).bind($(this));
    });
    
    self.onOpen = open;
    
    switchPage('site');
});
