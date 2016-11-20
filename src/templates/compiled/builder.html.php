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

<input type="submit" value="Build" data-action="build"<?php $_attr = isset($inProgress);if (isset($_attr) and $_attr !== false) {echo ' disabled' . ($_attr === true ? '' : '="' . $_attr . '"');} ?> />
<input type="submit" value="Cancel" data-action="cancel"<?php $_attr = !isset($inProgress);if (isset($_attr) and $_attr !== false) {echo ' disabled' . ($_attr === true ? '' : '="' . $_attr . '"');} ?> />
</form>
<div class="progress primary active" data-progress="0" id="build-progress">
<div class="progress-bar" style="width:0%;">0%</div>
<?php if (isset($inProgress)): ?>
<div class="label">Build in progress</div>
<?php else: ?>
<div class="label">Ready to build</div><?php endif; ?>

</div>
<textarea readonly="readonly" id="status-history"></textarea>
</div>
</div>