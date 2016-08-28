<?php $this->import('dist/files.js'); ?><div class="xcme-frame">
<?php echo $this->begin('appmenu'); ?><div>
<header>Editor</header>
<nav>
<ul>
<li><a href="#">Create folder</a></li>
<li><a href="#">Create file</a></li>
<li><a href="#">Close</a></li>
</ul>
</nav>
</div><?php echo $this->end(); ?>
<div class="xcme-frame-header">
<?php echo \Jivoo\View\Html::h($fs->getVirtualPath()); ?>
        &ndash; Files
</div>
<div class="xcme-frame-content">
<select size="1" style="width:100px;">
<option>Name</option>
<option>Size</option>
</select>
<div class="xcme-files-panel">
<ul>
<?php foreach ($fs as $file): ?>
<li>
<a class="<?php echo $file->getType(); ?>" href="<?php echo $this->link($file); ?>"><?php echo \Jivoo\View\Html::h($file->getName()); ?></a>
</li><?php endforeach; ?>

</ul>
</div>
</div>
</div>
