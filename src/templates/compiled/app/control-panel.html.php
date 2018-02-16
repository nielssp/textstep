<?php $this->import('dist/control-panel.js'); ?><div class="frame">
<div class="frame-head">
<div class="frame-actions">
<a href="" data-action="toggle-menu"></a>
</div>
<div class="frame-title">
            Control panel
</div>
<div class="frame-actions">
<a href="" data-action="close"></a>
</div>
</div>
<div class="frame-body">
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
<button data-action="about" title="About BLOGSTEP">
<span class="icon icon-blogstep"></span>
</button>
</div>
</div>
<div class="frame-content control-panel-page control-panel-site active">
<div class="horizontal-fieldset-panel">
<fieldset>
<legend>Site</legend>
<div class="field">
<label>Title</label>
<input type="text" data-binding="system.config.title" />
</div>
<div class="field">
<label>Subtitle</label>
<input type="text" data-binding="system.config.subtitle" />
</div>
<div class="field">
<label>Description</label>
<input type="text" data-binding="system.config.description" />
</div>
<div class="field">
<label>Copyright</label>
<input type="text" data-binding="system.config.copyright" />
</div>
<div class="field">
<label>Time zone</label>
<select size="1">
<option>UTC</option>
</select>
</div>
</fieldset>
</div>
</div>
<div class="frame-content control-panel-page control-panel-users">
<div class="horizontal-fieldset-panel">
<fieldset>
<legend>Change password</legend>
<div class="field">
<label>Current password</label>
<input type="password" />
</div>
<div class="field">
<label>New password</label>
<input type="password" />
</div>
<div class="field">
<label>Repeat new password</label>
<input type="password" />
</div>
</fieldset>
</div>
</div>
<div class="frame-content control-panel-page control-panel-personalization">
<div class="horizontal-fieldset-panel">
<fieldset>
<legend>Theme</legend>
</fieldset>
</div>
</div>
<div class="frame-content control-panel-page control-panel-system">
<div class="horizontal-fieldset-panel">
<fieldset>
<legend>System</legend>
</fieldset>
</div>
</div>
<div class="frame-content control-panel-page control-panel-about">
<div class="horizontal-fieldset-panel">
<fieldset>
<legend>BLOGSTEP</legend>
</fieldset>
</div>
</div>
<div class="frame-footer frame-footer-buttons">
<button data-action="save">Apply</button>
<button data-action="cancel">Cancel</button>
</div>
</div>
</div>
<div class="dock-frame">
<img src="<?php echo $this->link('asset:img/icons/32/control-panel.png'); ?>" />
</div>
