<?php $this->import('dist/files.js'); ?><div class="frame">
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
<div class="frame-header">
<span class="header-path"><?php echo \Jivoo\View\Html::h($fs->getPath()); ?></span>
        &ndash; Files
</div>
<div class="frame-content">
<div class="toolbar">
<button data-action="back">
<span class="icon icon-go-back"></span>
</button>
<button data-action="foward">
<span class="icon icon-go-forward"></span>
</button>
<button data-action="up">
<span class="icon icon-go-up"></span>
</button>
<button data-action="home">
<span class="icon icon-go-home"></span>
</button>
<span class="toolbar-separator"></span>
<button>
<span class="icon icon-edit-copy"></span>
</button>
<select size="1" style="width:100px;">
<option>Name</option>
<option>Size</option>
</select>
</div>
<div class="files-columns">
<div class="files-panel" data-path="<?php echo $fs->getPath(); ?>">
<ul>
<?php foreach ($fs as $file): ?>
<li>
<a data-path="<?php echo $file->getPath(); ?>" class="<?php echo 'file file-' . $file->getType(); ?>" href="<?php echo $this->link($file); ?>"><?php echo \Jivoo\View\Html::h($file->getName()); ?></a>
</li><?php endforeach; ?>

</ul>
</div>
</div>
</div>
</div>
