<?php $this->import('dist/terminal.js'); ?><div class="frame">
<?php echo $this->begin('appmenu'); ?><div>
<header>Terminal</header>
<nav>
<ul>
<li><a class="<?php if ($this->isCurrent('snippet:Files')) {
    echo 'current';
} ?>" href="<?php echo $this->link('snippet:Files'); ?>">Close</a></li>
</ul>
</nav>
</div><?php echo $this->end(); ?>
<div class="frame-header">
        Terminal
</div>
<div class="frame-content">
<textarea id="terminal" data-token="<?php echo $token; ?>"></textarea>
</div>
</div>