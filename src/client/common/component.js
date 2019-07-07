/*
 * TEXTSTEP
 * Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import {elem} from './ui';

export class Component {
    constructor() {
        this.outer = elem('div');
    }

    get width() {
        return this.outer.getBoundingClientRect().width;
    }

    set width(width) {
        this.outer.style.width = width;
    }

    get height() {
        return this.outer.getBoundingClientRect().height;
    }

    set height(height) {
        this.outer.style.height = height;
    }

    set minWidth(width) {
        this.outer.style.minWidth = width;
    }

    set maxWidth(width) {
        this.outer.style.maxWidth = width;
    }

    set minHeight(height) {
        this.outer.style.minHeight = height;
    }

    set maxHeight(height) {
        this.outer.style.maxHeight = height;
    }

    get visible() {
        return this.outer.style.display !== 'none';
    }

    set visible(visible) {
        this.outer.style.display = visible ? '' : 'none';
    }

    removePadding() {
        this.outer.classList.remove('ts-padding');
    }

    padding(... directions) {
        if (!directions.length) {
            this.outer.classList.add('ts-padding');
        } else {
            this.outer.classList.remove('ts-padding');
            directions.forEach(direction => {
                this.outer.classList.add('ts-padding-' + direction);
            }, this);
        }
    }

    trigger(eventName, eventData) {
        if (this.hasOwnProperty('on' + eventName)) {
            this['on' + eventName](eventData);
        }
    }

    addEventListener(eventName, handler) {
        if (this.hasOwnProperty('on' + eventName)) {
            let previous = this['on' + eventName];
            this['on' + eventName] = (eventData) => {
                if (previous(eventData) !== false) {
                    return handler(eventData);
                }
            };
        } else {
            this['on' + eventName] = handler;
        }
    }
}

export class Container extends Component {
    constructor() {
        super();
        this.inner = this.outer;
    }

    append(child, properties = {}) {
        if (child instanceof Component) {
            child = child.outer;
        }
        if (properties.hasOwnProperty('grow')) {
            child.style.flexGrow = properties.grow;
        }
        if (properties.hasOwnProperty('shrink')) {
            child.style.flexShrink = properties.shrink;
        }
        if (properties.hasOwnProperty('align')) {
            child.style.alignSelf = properties.align;
        }
        if (properties.hasOwnProperty('justify')) {
            child.style.justifySelf = properties.justify;
        }
        this.inner.appendChild(child);
    }

    remove(child) {
        if (child instanceof Component) {
            this.inner.removeChild(child.outer);
        } else {
            this.inner.removeChild(child);
        }
    }

    clear() {
        this.inner.innerHTML = '';
    }

    removePadding() {
        this.inner.classList.remove('ts-padding');
    }

    padding(... directions) {
        if (!directions.length) {
            this.inner.classList.add('ts-padding');
        } else {
            this.inner.classList.remove('ts-padding');
            directions.forEach(direction => {
                this.inner.classList.add('ts-padding-' + direction);
            }, this);
        }
    }
}

export class StackRow extends Container {
    constructor() {
        super();
        this.outer.className = 'ts-stack-row';
    }

    get innerPadding() {
        return this.outer.classList.contains('ts-stack-row-padding');
    }

    set innerPadding(enable) {
        this.outer.classList.add('ts-stack-row-padding');
    }

    set alignItems(align) {
        this.outer.style.alignItems = align;
    }

    set justifyContent(justify) {
        this.outer.style.justifyContent = justify;
    }

    set wrap(wrap) {
        this.outer.style.flexWrap = wrap ? 'wrap' : 'nowrap';
    }
}

export class StackColumn extends Container {
    constructor() {
        super();
        this.outer.className = 'ts-stack-column';
    }

    get innerPadding() {
        return this.outer.classList.contains('ts-stack-column-padding');
    }

    set innerPadding(enable) {
        this.outer.classList.add('ts-stack-column-padding');
    }

    set alignItems(align) {
        this.outer.style.alignItems = align;
    }

    set justifyContent(justify) {
        this.outer.style.justifyContent = justify;
    }

    set wrap(wrap) {
        this.outer.style.flexWrap = wrap ? 'wrap' : 'nowrap';
    }
}

export class Grid extends Container {
    constructor() {
        super();
        this.outer.className = 'ts-grid';
    }

    get columnPadding() {
        return this.outer.classList.contains('ts-grid-column-padding');
    }

    set columnPadding(enable) {
        this.outer.classList.add('ts-grid-column-padding');
    }

    get rowPadding() {
        return this.outer.classList.contains('ts-grid-row-padding');
    }

    set rowPadding(enable) {
        this.outer.classList.add('ts-grid-row-padding');
    }

    get columns() {
        return this.outer.style.gridTemplateColumns;
    }

    set columns(columns) {
        this.outer.style.gridTemplateColumns = columns;
    }
}

export class ListView extends Container {
    constructor() {
        super();
        this.inner = elem('div', {'class': 'ts-list-view-items'});
        this.outer.className = 'ts-list-view';
        this.outer.appendChild(this.inner);
        this.items = {};
    }

    add(label, value) {
        let item = elem('a', {'class': 'ts-list-view-item'}, [label]);
        item.onclick = () => this.trigger('select', value);
        this.inner.appendChild(item);
        this.items[value] = item;
        return item;
    }

    select(value) {
        this.removeSelection();
        if (this.items.hasOwnProperty(value)) {
            this.items[value].classList.add('active');
        }
    }

    removeSelection() {
        for (let i = 0; i < this.inner.children.length; i++) {
            this.inner.children[i].classList.remove('active');
        }
    }
}

export class FieldSet extends Container {
    constructor() {
        super();
        this.outer = this.inner = elem('fieldset');
        this.legendElem = null;
    }

    get legend() {
        return this.legendElem ? this.legendElem.textContent : null;
    }

    set legend(legend) {
        if (legend) {
            if (!this.legendElem) {
                this.legendElem = elem('legend');
                this.inner.appendChild(this.legendElem);
            }
            this.legendElem.textContent = legend;
        } else if (this.legendElem) {
            this.inner.removeChild(this.legendElem);
            this.legendElem = null;
        }
    }
}

export class ScrollPanel extends Container {
    constructor() {
        super();
        this.inner = elem('div', {'class': 'ts-scroll-panel-inner'});
        this.outer.className = 'ts-scroll-panel';
        this.outer.appendChild(this.inner);
    }
}

export class DialogContainer extends Container {
    constructor() {
        super();
        this.inner = elem('div', {'class': 'ts-dialog-container-inner'});
        this.outer.className = 'ts-dialog-container';
        this.outer.appendChild(this.inner);
        this._maxWidth = null;
    }

    get maxWidth() {
        return this._maxWidth;
    }

    set maxWidth(w) {
        this._maxWidth = w;
        this.inner.style.maxWidth = w + 'px';
    }

    readjust() {
        if (!this._maxWidth || this.width <= this._maxWidth) {
            this.outer.classList.remove('ts-dialog-container-large');
        } else {
            this.outer.classList.add('ts-dialog-container-large');
        }
    }
}

export class ProgressBar extends Component {
    constructor() {
        super();
        this.bar = elem('div', {'class': 'ts-progress-bar'});
        this.label = elem('div', {'class': 'ts-progress-label'});
        this.outer = elem('div', { 'class': 'ts-progress' }, [
            this.bar,
            this.label,
        ]);
    }

    set progress(progress) {
        progress = Math.floor(progress);
        if (progress >= 100) {
            this.outer.className = 'ts-progress ts-progress-success';
        } else {
            this.outer.className = 'ts-progress ts-progress-active';
        }
        this.bar.style.width = progress + '%';
        this.bar.innerText = progress + '%';
    }

    set status(status) {
        this.label.innerText = status;
    }
}

function draggable(element, handler) {
    let move = (clientX, clientY) => {
        let rect = element.getBoundingClientRect();
        handler(
            Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
            Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
        );
    };
    let moveMouse = e => {
        e.preventDefault();
        move(e.clientX, e.clientY);
    };
    let stopMouse = e => {
        moveMouse(e);
        document.removeEventListener('mousemove', moveMouse);
        document.removeEventListener('mouseup', stopMouse);
    };
    element.onmousedown = e => {
        if (e.button !== 0) {
            return;
        }
        moveMouse(e);
        document.addEventListener('mousemove', moveMouse);
        document.addEventListener('mouseup', stopMouse);
    };
    let moveTouch = e => {
        if (e.touches.length !== 1) {
            return;
        }
        move(e.touches[0].clientX, e.touches[0].clientY);
    };
    let stopTouch = e => {
        moveTouch(e);
        document.removeEventListener('touchmove', moveTouch);
        document.removeEventListener('touchend', stopTouch);
        document.removeEventListener('touchcancel', stopTouch);
    };
    element.ontouchstart = e => {
        if (e.touches.length !== 1) {
            return;
        }
        moveTouch(e);
        document.addEventListener('touchmove', moveTouch);
        document.addEventListener('touchend', stopTouch);
        document.addEventListener('touchcancel', stopTouch);
    };
};

export class HueSlider extends Component {
    constructor() {
        super();
        this.value = 0;

        this.outer.className = 'ts-inset';
        this.outer.style.display = 'flex';

        this.gradient = elem('div');
        this.gradient.style.background = 'linear-gradient(to bottom, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)';
        this.gradient.style.position = 'relative';
        this.gradient.style.minWidth = '30px';
        this.gradient.style.flexGrow = '1';
        draggable(this.gradient, (x, y) => {
            this.hue = y;
            this.trigger('change', this.hue);
        });
        this.outer.appendChild(this.gradient);

        this.slider = elem('div');
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

export class ValueSaturation extends Component {
    constructor() {
        super();
        this._hue = 0;
        this._saturation = 0;
        this._value = 0;

        this.outer.className = 'ts-inset';
        this.outer.style.display = 'flex';

        this.color = elem('div');
        this.color.style.background = 'hsl(0deg, 100%, 50%)';
        this.color.style.position = 'relative';
        this.color.style.flexGrow = '1';
        draggable(this.color, (x, y) => {
            this.value = x;
            this.saturation = 1 - y;
            this.trigger('change', {value: this.value, saturation: this.saturation});
        });
        this.outer.appendChild(this.color);

        this.satGradient = elem('div');
        this.satGradient.style.position = 'absolute';
        this.satGradient.style.top = this.satGradient.style.left = this.satGradient.style.bottom = this.satGradient.style.right = '0';
        this.satGradient.style.background = 'linear-gradient(to top, #fff, transparent)';
        this.color.appendChild(this.satGradient);

        this.valueGradient = elem('div');
        this.valueGradient.style.position = 'absolute';
        this.valueGradient.style.top = this.valueGradient.style.left = this.valueGradient.style.bottom = this.valueGradient.style.right = '0';
        this.valueGradient.style.background = 'linear-gradient(to right, #000, transparent)';
        this.satGradient.appendChild(this.valueGradient);

        this.dragger = elem('div');
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

export class HsvPicker extends Component {
    constructor() {
        super();
        this._color = '#0000000';

        this.container = new StackRow();
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
        this._color = '#' + this.toHex(r) + this.toHex(g) + this.toHex(b);
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
        if (color.length === 3) {
            this.rgbToHsv(
                parseInt(color[0], 16) / 15,
                parseInt(color[1], 16) / 15,
                parseInt(color[2], 16) / 15
            );
        } else if (color.length === 6) {
            this.rgbToHsv(
                parseInt(color.substring(0, 2), 16) / 255,
                parseInt(color.substring(2, 4), 16) / 255,
                parseInt(color.substring(4, 6), 16) / 255
            );
        }
    }
}

export class ColorButton extends Component {
    constructor(frame) {
        super();
        this.frame = frame;
        this._color = '#000000';

        this.colorElem = elem('div', {'class': 'ts-inset'});
        this.colorElem.style.backgroundColor = this._color;
        this.colorElem.style.width = '16px';
        this.colorElem.style.height = '16px';

        this.outer = elem('button', {}, [this.colorElem]);
        this.outer.onclick = () => this.open();

        this.onchange = () => {};
    }

    open() {
        return this.frame.color('Select color', this.color).then(color => {
            if (color) {
                this.color = color;
                this.trigger('change', color);
            }
        });
    }

    get color() {
        return this._color;
    }

    set color(color) {
        this._color = color;
        this.colorElem.style.backgroundColor = color;
    }

    get disabled() {
        return this.outer.disabled;
    }

    set disabled(disabled) {
        this.outer.disabled = disabled;
    }
}
