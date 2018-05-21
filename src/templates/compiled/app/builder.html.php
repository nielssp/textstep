<?php $this->import('css/build.css;dist/build.js'); ?><div class="frame Build-app">
<div class="frame-head">
<div class="frame-actions">
<a href="" data-action="toggle-menu"></a>
</div>
<div class="frame-title">
            Builder
</div>
<div class="frame-actions">
<a href="" data-action="close"></a>
</div>
</div>
<div class="frame-body">
<div class="frame-content frame-content-flex">
<form data-token="<?php echo $token; ?>">

<input type="submit" value="Build all" data-action="build-all" />
<input type="submit" value="Compile content" data-action="build-content" />
<input type="submit" value="Compile templates" data-action="build-template" />
<input type="submit" value="Assemble" data-action="build-assemble" />
<input type="submit" value="Install" data-action="build-install" />
<input type="submit" value="Cancel" data-action="cancel" disabled />
</form>
<div class="progress primary active build-progress" data-progress="0">
<div class="progress-bar" style="width:0%;">0%</div>
<div class="label">Ready to build</div>
</div>
<textarea readonly="readonly" class="build-status-history"></textarea>
<iframe class="build-preview"></iframe>
</div>
</div>
</div>