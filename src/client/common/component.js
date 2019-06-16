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
        this.inner.appendChild(child);
    }

    remove(child) {
        if (child instanceof Component) {
            this.inner.removeChild(child.outer);
        } else {
            this.inner.removeChild(child);
        }
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
}

export class ListView extends Container {
    constructor() {
        super();
        this.inner = elem('div', {'class': 'ts-list-view-items'});
        this.outer.className = 'ts-list-view';
        this.outer.appendChild(this.inner);
        this.onselect = () => {};
    }

    add(label) {
        let item = elem('a', {'class': 'ts-list-view-item'}, [label]);
        item.onclick = () => this.onselect(item);
        this.inner.appendChild(item);
        return item;
    }
    
    select(item) {
        for (let i = 0; i < this.inner.children.length; i++) {
            this.inner.children[i].classList.remove('active');
        }
        if (item) {
            item.classList.add('active');
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
