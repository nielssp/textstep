<?php $this->import('dist/build.js'); ?><div class="frame">
<div class="frame-header">
<div class="frame-header-actions">
<a href="" data-action="toggle-menu"></a>
</div>
<div class="frame-header-title">
            Builder
</div>
</div>
<div class="frame-content">
<form id="build" data-token="<?php echo $token; ?>">
<div class="field">
<label>Destination</label>
<input type="text" />
</div>
<input type="submit" value="Build" data-action="build" />
</form>
<div class="progress primary active" data-progress="0" id="build-progress">
<div class="progress-bar" style="width:0%;">0%</div>
<div class="label">Ready to build</div>
</div>
<textarea readonly="readonly"></textarea>
</div>
</div>