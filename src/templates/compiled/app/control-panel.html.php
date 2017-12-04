<?php $this->import('dist/control-panel.js'); ?><div class="frame">
<div class="frame-header">
<div class="frame-header-actions">
<a href="" data-action="toggle-menu"></a>
</div>
<div class="frame-header-title">
            Control panel
</div>
<div class="frame-header-actions">
<a href="" data-action="close"></a>
</div>
</div>
<div class="frame-iconbar">
<div class="button-group" data-choice="button">
<button data-action="site" title="Site" class="active">
<span class="icon icon-site"></span>
</button>
<button data-action="users" title="Users and groups">
<span class="icon icon-users"></span>
</button>
<button data-action="personalization" title="Personalization">
<span class="icon icon-appearance"></span>
</button>
<button data-action="system" title="System">
<span class="icon icon-system"></span>
</button>
</div>
</div>
<div class="frame-content control-panel-site">
<fieldset>
<legend>Site</legend>
<div class="field">
<label>Title</label>
<input type="text" />
</div>
<div class="field">
<label>Subtitle</label>
<input type="text" />
</div>
<div class="field">
<label>Description</label>
<input type="text" />
</div>
<div class="field">
<label>Copyright</label>
<input type="text" />
</div>
<div class="field">
<label>Time zone</label>
<select size="1">
<option>UTC</option>
</select>
</div>
</fieldset>
<fieldset>
<legend>Deployment</legend>
<div class="field">
<label>Target directory</label>
<input type="text" />
</div>
<div class="field">
<label>Target URI</label>
<input type="text" />
</div>
<button>Save</button>
</fieldset>
</div>
</div>
<div class="dock-frame">
<img src="<?php echo $this->link('asset:img/icons/32/control-panel.png'); ?>" />
</div>
