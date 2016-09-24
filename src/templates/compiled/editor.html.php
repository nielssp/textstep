<?php $this->import('css/editor.css;dist/editor.js'); ?><div class="frame">
<?php echo $this->begin('appmenu'); ?><div>
<header>Editor</header>
<nav>
<ul>
<li><a href="" class="app-action" data-action="new">New</a></li>
<li><a href="" class="app-action" data-action="save">Save</a></li>
<li><a class="<?php if ($this->isCurrent($fs->getFilesRoute())) echo 'current'; ?>" href="<?php echo $this->link($fs->getFilesRoute()); ?>">Close</a></li>
</ul>
</nav>
</div><?php echo $this->end(); ?>
<div class="frame-header">
<span class="actions-left">
<a href="" data-action="toggle-menu"></a>
</span>
<?php echo \Jivoo\View\Html::h($fs->getName()); ?>
        &ndash; Editor
<span class="actions">
<a href="" data-action="close"></a>
</span>
</div>
<div class="frame-content editor-frame">
<textarea id="editor" data-token="<?php echo $token; ?>" data-path="<?php echo $fs->getPath(); ?>"><?php echo \Jivoo\View\Html::h($content); ?></textarea>
</div>
</div>