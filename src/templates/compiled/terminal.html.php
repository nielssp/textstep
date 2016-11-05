<?php $this->import('dist/terminal.js'); ?><div class="frame">
<?php echo $this->begin('appmenu'); ?><div>
<header>Terminal</header>
<nav>
<ul>
<li><a data-action="close" class="<?php if ($this->isCurrent('snippet:Files')) echo 'current'; ?>" href="<?php echo $this->link('snippet:Files'); ?>">Close</a></li>
</ul>
</nav>
</div><?php echo $this->end(); ?>
<div class="frame-header">
<div class="frame-header-actions">
<a href="" data-action="toggle-menu"></a>
</div>
<div class="frame-header-title">
            Terminal
</div>
<div class="frame-header-actions">
<a href="" data-action="close"></a>
</div>
</div>
<div class="frame-content frame-content-flex">
<textarea id="terminal" class="stretch" data-token="<?php echo $token; ?>"></textarea>
</div>
</div>