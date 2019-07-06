/* 
 * BlogSTEP
 * Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

const ui = TEXTSTEP.ui;
const Config = TEXTSTEP.Config;

function input(config, key, type = 'text') {
    let elem = ui.elem('input', {type: type});
    config.get(key).bind(elem);
    return elem;
}

function label(label) {
    let elem = ui.elem('label', {}, [label]);
    elem.style.alignSelf = 'center';
    return elem;
}

function field(label, config, key, type = 'text') {
    return ui.elem('div', {className: 'field'}, [
        ui.elem('label', {}, [label]),
        input(config, key, type)
    ])
}

class PageView extends ui.Component {
    constructor() {
        super();
        this.pages = [];
        this.pageId = null;
        this.activePage = null;

        this.container = new ui.StackRow();
        this.outer = this.container.outer;

        this.pageList = new ui.ListView();
        this.pageList.width = '200px';
        this.pageList.onselect = id => this.open(id);
        this.container.append(this.pageList);

        this.main = new ui.StackColumn();
        this.container.append(this.main, {grow: 1});

        this.pageToolbar = new ui.Toolbar(); 
        this.pageToolbar.padding('bottom');
        this.pageToolbar.addItem('Back', 'go-back', () => this.close());
        this.main.append(this.pageToolbar);

        this.pageContainer = new ui.DialogContainer();
        this.pageContainer.padding();
        this.pageContainer.maxWidth = 450;
        this.main.append(this.pageContainer, {grow: 1});

        this.onopen = () => {};
    }

    open(id) {
        this.pageContainer.clear();
        for (let page of this.pages) {
            if (page.id === id) {
                this.pageId = page.id;
                this.activePage = page.component;
                this.pageContainer.append(this.activePage);
                break;
            }
        }
        if (!this.main.visible) {
            this.main.visible = true;
            this.pageList.visible = false;
        }
        this.pageList.select(id);
        this.trigger('open', id);
    }

    select(id) {
        if (this.main.visible) {
            this.open(id);
        }
    }

    close() {
        if (!this.pageList.visible) {
            this.main.visible = false;
            this.pageList.visible = true;
        }
        this.pageList.removeSelection();
    }

    readjust() {
        this.pageList.visible = true;
        if (this.container.width < 400) {
            this.main.visible = false;
            this.pageToolbar.visible = true;
            this.pageList.width = '100%';
        } else {
            this.main.visible = true;
            this.pageToolbar.visible = false;
            this.pageList.width = '200px';
        }
        this.pageContainer.readjust();
    }

    addPage(id, label, component) {
        this.pages.push({
            id: id,
            label: label,
            component: component
        });
        this.pageList.add(label, id);
    }
}

function sitePanel(config) {
    let dialogForm = new ui.StackColumn();
    dialogForm.innerPadding = true;

    let fieldSet1 = new ui.FieldSet();
    fieldSet1.legend = 'Site properties';
    dialogForm.append(fieldSet1);

    let grid = new ui.Grid();
    grid.columns = 'min-content auto';
    grid.rowPadding = true;
    grid.columnPadding = true;
    fieldSet1.append(grid);

    grid.append(label('Title:'));
    grid.append(input(config, 'title'));

    grid.append(label('Subtitle:'));
    grid.append(input(config, 'subtitle'));

    grid.append(label('Description:'));
    grid.append(input(config, 'description'));

    grid.append(label('Copyright:'));
    grid.append(input(config, 'copyright'));

    let fieldSet2 = new ui.FieldSet();
    fieldSet2.legend = 'Time zone';
    dialogForm.append(fieldSet2);

    let timeZoneSelect = ui.elem('select', {size: 1, disabled: true});
    TEXTSTEP.get('storage', {path: '/system/timezones.json'}).then(timeZones => {
        timeZones.forEach(zone => {
            timeZoneSelect.appendChild(ui.elem('option', {value: zone}, [zone]));
        });
        timeZoneSelect.disabled = false;
    });
    timeZoneSelect.style.width = '100%';
    timeZoneSelect.onchange = e => config.get('timeZone').set(timeZoneSelect.value);
    config.get('timeZone').change(value => {
        timeZoneSelect.value = value;
    });
    fieldSet2.append(timeZoneSelect);

    let saveButton = ui.elem('button', {}, ['Save']);
    saveButton.onclick = () => config.commit();
    let cancelButton = ui.elem('button', {}, ['Cancel']);
    cancelButton.onclick = () => config.update();

    let buttons = new ui.StackRow();
    buttons.innerPadding = true;
    buttons.justifyContent = 'flex-end';
    buttons.append(saveButton);
    buttons.append(cancelButton);
    dialogForm.append(buttons);

    return dialogForm;
}

class HueSlider extends ui.Component {
    constructor() {
        super();
        this.value = 0;

        this.outer.className = 'ts-inset';
        this.outer.style.display = 'flex';
        
        this.gradient = ui.elem('div');
        this.gradient.style.background = 'linear-gradient(to bottom, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)';
        this.gradient.style.position = 'relative';
        this.gradient.style.minWidth = '20px';
        this.gradient.style.flexGrow = '1';

        let move = e => {
            e.preventDefault();
            let rect = this.gradient.getBoundingClientRect();
            this.hue = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
            this.trigger('change', this.hue);
        };
        let stop = e => {
            move(e);
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', stop);
        };
        this.gradient.onmousedown = e => {
            move(e);
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', stop);
        };
        this.outer.appendChild(this.gradient);

        this.slider = ui.elem('div');
        this.slider.style.position = 'absolute';
        this.slider.style.top = '0';
        this.slider.style.left = '0';
        this.slider.style.right = '0';
        this.slider.style.height = '4px';
        this.slider.style.background = '#000';
        this.slider.style.borderTop = '1px solid #fff';
        this.slider.style.borderBottom = '1px solid #fff';
        this.slider.style.marginTop = '-2px';
        this.gradient.appendChild(this.slider);

        this.onchange = () => {};
    }

    get hue() {
        return this.value;
    }

    set hue(value) {
        this.value = value;
        this.slider.style.top = (value * 100) + '%';
    }
}

class ValueSaturation extends ui.Component {
    constructor() {
        super();
        this._hue = 0;
        this._saturation = 0;
        this._value = 0;

        this.outer.className = 'ts-inset';
        this.outer.style.display = 'flex';

        this.color = ui.elem('div');
        this.color.style.background = 'hsl(0deg, 100%, 50%)';
        this.color.style.position = 'relative';
        this.color.style.flexGrow = '1';
        this.outer.appendChild(this.color);

        let move = e => {
            e.preventDefault();
            let rect = this.color.getBoundingClientRect();
            this.value = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
            this.saturation = 1 - Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
            this.trigger('change', {value: this.value, saturation: this.saturation});
        };
        let stop = e => {
            move(e);
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', stop);
        };
        this.color.onmousedown = e => {
            move(e);
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', stop);
        };

        this.satGradient = ui.elem('div');
        this.satGradient.style.position = 'absolute';
        this.satGradient.style.top = this.satGradient.style.left = this.satGradient.style.bottom = this.satGradient.style.right = '0';
        this.satGradient.style.background = 'linear-gradient(to top, #fff, transparent)';
        this.color.appendChild(this.satGradient);

        this.valueGradient = ui.elem('div');
        this.valueGradient.style.position = 'absolute';
        this.valueGradient.style.top = this.valueGradient.style.left = this.valueGradient.style.bottom = this.valueGradient.style.right = '0';
        this.valueGradient.style.background = 'linear-gradient(to right, #000, transparent)';
        this.satGradient.appendChild(this.valueGradient);

        this.dragger = ui.elem('div');
        this.dragger.style.position = 'absolute';
        this.dragger.style.width = '6px';
        this.dragger.style.height = '6px';
        this.dragger.style.border = '1px solid #fff';
        this.dragger.style.background = '#000';
        this.dragger.style.borderRadius = '3px';
        this.dragger.style.marginTop = '-3px';
        this.dragger.style.marginLeft = '-3px';
        this.valueGradient.appendChild(this.dragger);
    }

    get hue() {
        return this._hue;
    }

    set hue(value) {
        this._hue = value;
        this.color.style.background = 'hsl(' + Math.floor(value * 360) + ', 100%, 50%)';
    }

    get saturation() {
        return this._saturation;
    }

    set saturation(value) {
        this._saturation = value;
        this.dragger.style.top = ((1 - value) * 100) + '%';
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.dragger.style.left = (value * 100) + '%';
    }
}

class HsvPicker extends ui.Component {
    constructor() {
        super();
        this._color = '#0000000';

        this.container = new ui.StackRow();
        this.outer = this.container.outer;

        this.hue = new HueSlider();
        this.container.append(this.hue);

        this.valSat = new ValueSaturation();
        this.container.append(this.valSat, {grow: 1});

        this.hue.onchange = hue => {
            this.valSat.hue = hue;
            this.updateColor();
        };

        this.valSat.onchange = () => this.updateColor();

        this.onchange = () => {};
    }

    toHex(val) {
        val = Math.floor(val * 255);
        if (val < 16) {
            return '0' + val.toString(16);
        }
        return val.toString(16);
    }

    setRgb(r, g, b) {
        this._color = '#' + this.toHex(r) + this.toHex(g) + this.toHex(b);
        this.trigger('change', this._color);
    }

    updateColor() {
        let h = this.hue.hue;
        let s = this.valSat.saturation;
        let v = this.valSat.value;
        if (h >= 1) h -= 1;
        if (h < 0) h += 1;
        if (s === 0) {
            this.setRgb(v, v, v);
        } else {
            h *= 6;
            let i = h | 0;
            let f = h - i;
            let p = v * (1 - s);
            let q = v * (1 - s * f);
            let t = v * (1 - s * ( 1 - f));
            switch (i) {
                case 0:
                    this.setRgb(v, t, p);
                    break;
                case 1:
                    this.setRgb(q, v, p);
                    break;
                case 2:
                    this.setRgb(p, v, t);
                    break;
                case 3:
                    this.setRgb(p, q, v);
                    break;
                case 4:
                    this.setRgb(t, p, v);
                    break;
                default:
                    this.setRgb(v, p, q);
                    break;
            }
        }
    }

    rgbToHsv(r, g, b) {
        let M = Math.max(r, g, b);
        let m = Math.min(r, g, b);
        let C = M - m;
        let V = M;
        let H = 0;
        let S = 0;
        if (C !== 0) {
            if (M === r) H = (g - b) / C;
            if (M === g) H = (b - r) / C + 2;
            if (M === b) H = (r - g) / C + 4;
        }
        if (M !== 0) {
            S = C / M;
        }
        let h = 0.1666667 * H;
        if (h < 0) h += 1;
        if (h >= 1) h -= 1;
        this.hue.hue = h;
        this.valSat.hue = h;
        this.valSat.value = V;
        this.valSat.saturation = S;
    }

    get color() {
        return this._color;
    }

    set color(color) {
        color = color.replace(/^#/, '');
        this.rgbToHsv(
            parseInt(color.substring(0, 2), 16) / 255,
            parseInt(color.substring(2, 4), 16) / 255,
            parseInt(color.substring(4, 6), 16) / 255
        );
    }
}

function appearancePanel(frame) {
    let skin = TEXTSTEP.getSkin();

    let dialog = new ui.StackColumn();
    dialog.innerPadding = true;

    let fieldSet = new ui.FieldSet();
    fieldSet.legend = 'Background';
    dialog.append(fieldSet);

    let bg = ui.elem('input', {type: 'color'});
    if (skin.hasOwnProperty('desktop-bg')) {
        bg.value = skin['desktop-bg'];
    } else {
        bg.value = '#515171'; // TODO: default skin
    }
    bg.onchange = () => {
        TEXTSTEP.applySkin({'desktop-bg': bg.value});
    };
    fieldSet.append(bg);

    let openButton = ui.elem('button', {}, ['Select skin']);
    openButton.onclick = () => {
        frame.file('Select skin').then(path => {
            TEXTSTEP.get('content', {path: path[0]}).then(skin => {
                TEXTSTEP.applySkin(skin);
            });
        });
    };
    fieldSet.append(openButton);

    let resetButton = ui.elem('button', {}, ['Reset']);
    resetButton.onclick = () => {
        TEXTSTEP.resetSkin();
    };
    fieldSet.append(resetButton);

    let colorPicker = new HsvPicker();
    colorPicker.outer.style.minHeight = '200px';
    colorPicker.onchange = color => {
        bg.value = color;
        TEXTSTEP.applySkin({'desktop-bg': color});
    };
    colorPicker.color = bg.value;
    dialog.append(colorPicker, {grow: 1});

    return dialog;
}

TEXTSTEP.initApp('control-panel', [], function (app) {
    let frame = app.createFrame('Control panel');

    let config = new Config(() => TEXTSTEP.get('content', {path: '/site/site.json'}), data =>
        TEXTSTEP.put('content', {path: '/site/site.json'}, data));

    app.dockFrame.innerHTML = '';
    app.dockFrame.appendChild(TEXTSTEP.getIcon('control-panel', 32));

    let pageView = new PageView();
    pageView.padding();
    pageView.addPage('site', 'Site', sitePanel(config));
    pageView.addPage('appearance', 'Appearance', appearancePanel(frame));
    pageView.onopen = page => app.setArgs({page: page});
    frame.append(pageView, {grow: 1});

    let adjustContent = () => pageView.readjust();

    frame.onResize = adjustContent;

    frame.onClose = () => app.close();
    
    app.onOpen = args => {
        if (!frame.isOpen) {
            frame.open();
            adjustContent();
            if (args.page) {
                pageView.select(args.page);
            } else {
                pageView.select('site');
            }
            config.update();
        } else {
            frame.requestFocus();
        }
        app.setArgs({page: pageView.pageId});
    };
});
