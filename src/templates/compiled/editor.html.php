<?php $this->import('css/editor.css;dist/editor.js'); ?><div class="xcme-frame">
<?php echo $this->begin('appmenu'); ?><div>
<header>Editor</header>
<nav>
<ul>
<li><a href="" class="app-action" data-action="new">New</a></li>
<li><a href="" class="app-action" data-action="save">Save</a></li>
<li><a href="#">Close</a></li>
</ul>
</nav>
</div><?php echo $this->end(); ?>
<div class="xcme-frame-header">
<?php echo \Jivoo\View\Html::h($fs->getName()); ?>
        &ndash; Editor
</div>
<div class="xcme-frame-content xcme-editor-frame">
<textarea id="editor"><?php echo \Jivoo\View\Html::h($content); ?></textarea>
</div>
</div>