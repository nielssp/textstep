<?php $this->import('css/editor.css;dist/editor.js'); ?><div class="frame">
<div class="frame-header">
<div class="frame-header-actions">
<a href="" data-action="toggle-menu"></a>
</div>
<div class="frame-header-title">
            Editor
</div>
<div class="frame-header-actions">
<a href="" data-action="close"></a>
</div>
</div>
<div class="frame-content editor-frame">
<textarea></textarea>
</div>
</div>
<div class="tool-frame" data-name="buffers">
<div class="tool-frame-header">
        Buffers
</div>
<div class="tool-frame-content">
<div class="files-panel">
<div class="files-list">
</div>
</div>
</div>
</div>
<div class="dock-frame">
<img src="<?php echo $this->link('asset:img/icons/32/editor.png'); ?>" />
</div>