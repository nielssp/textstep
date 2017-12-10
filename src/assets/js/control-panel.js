/* 
 * BlogSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = require('jquery');

BLOGSTEP.init('control-panel', function (app) {
    var menu = app.addMenu('Control panel');
    menu.addItem('Site', 'site');
    menu.addItem('Users and groups', 'users');
    menu.addItem('Personalization', 'personalization');
    menu.addItem('System', 'system');
    menu.addItem('About BLOGSTEP', 'about');
    menu.addItem('Close', 'close');
    
    app.frame.find('.frame-content').hide();
    app.frame.find('.control-panel-site').show();
});
