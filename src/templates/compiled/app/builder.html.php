<?php $this->import('dist/build.js'); ?><div class="frame">
<div class="frame-header">
<div class="frame-header-actions">
<a href="" data-action="toggle-menu"></a>
</div>
<div class="frame-header-title">
            Builder
</div>
<div class="frame-header-actions">
<a href="" data-action="close"></a>
</div>
</div>
<div class="frame-content">
<form id="build" data-token="<?php echo $token; ?>">

<input type="submit" value="Build" data-action="build" />
<input type="submit" value="Cancel" data-action="cancel" disabled />
</form>
<div class="progress primary active build-progress" data-progress="0">
<div class="progress-bar" style="width:0%;">0%</div>
<div class="label">Ready to build</div>
</div>
<textarea readonly="readonly" class="build-status-history"></textarea>
</div>
</div>