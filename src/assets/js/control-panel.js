/* 
 * BlogSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */


var $ = require('jquery');

BLOGSTEP.init('control-panel', function (app) {
    var menu = app.addMenu('Control panel');
    menu.addItem('Close', 'close');    
});
