<?php $this->import('dist/files.js'); ?><div class="frame">
<?php echo $this->begin('appmenu'); ?><div>
<header>Editor</header>
<nav>
<ul>
<li><a href="#" data-action="new-folder">New folder</a></li>
<li><a href="#" data-action="new-file">New file</a></li>
<li><a href="#" date-action="close">Close</a></li>
</ul>
</nav>
</div><?php echo $this->end(); ?>
<div class="frame-header">
<span class="header-path"><?php echo \Jivoo\View\Html::h($fs->getPath()); ?></span>
        &ndash; Files
</div>
<div class="frame-content">
<div class="toolbar">
<div class="button-group">
<button data-action="back" title="Go back">
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
</div>
<span class="toolbar-separator"></span>
<div class="button-group">
<button data-action="new-folder">
<span class="icon icon-edit-new-folder"></span>
</button>
</div>
<span class="toolbar-separator"></span>
<div class="button-group">
<button data-action="cut">
<span class="icon icon-edit-cut"></span>
</button>
<button data-action="copy">
<span class="icon icon-edit-copy"></span>
</button>
<button data-action="paste">
<span class="icon icon-edit-paste"></span>
</button>
<button data-action="trash">
<span class="icon icon-edit-trash"></span>
</button>
</div>
</div>
<div class="files-columns" data-token="<?php echo $token; ?>">
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