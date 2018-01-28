<?php $this->import('dist/test.js'); ?><div class="frame">
<div class="frame-head">
<div class="frame-actions">
<a href="" data-action="toggle-menu"></a>
</div>
<div class="frame-title">
            Test
</div>
</div>
<div class="frame-body">
<div class="frame-content">
<p>Hello, World!</p>
<button data-action="test">Test</button>
<p>Dialogs:
<button data-action="test-alert">Alert</button>
<button data-action="test-confirm">Confirm</button>
</p>
<p>Binding 1:
<input type="text" class="textbox-1" /></p>
<p>Binding 2:
<input type="text" class="textbox-2" /></p>
<p>Anatomy of a frame:</p>
<div class="frame">
<div class="frame-head">
<div class="frame-title">.frame > .frame-head > .frame-title</div>
</div>
<div class="frame-body">
<div class="frame-header">
                        .frame > .frame-body > .frame-header
</div>
<div class="frame-content">
                        .frame > .frame-body > .frame-content
</div>
<div class="frame-footer">
                        .frame > .frame-body > .frame-footer
</div>
</div>
</div>
</div>
<div class="frame-footer frame-footer-buttons">
<button>Foo</button>
<button>Bar</button>
</div>
</div>
</div>
