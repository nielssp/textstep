<?php $this->import('vendor/simplemde/dist/simplemde.min.js;vendor/simplemde/dist/simplemde.min.css;vendor/highlightjs/highlight.pack.min.js;vendor/highlightjs/styles/solarized_light.css'); ?><aside>
<header>Editor</header>
<nav>
<ul>
<li><a href="#">New</a></li>
<li><a href="#">Save</a></li>
<li><a href="#">Close</a></li>
</ul>
</nav>
<header>Workspace</header>
<nav>
<ul>
<li><a href="#">File system</a></li>
<li><a href="#">Control panel</a></li>
</ul>
</nav>
</aside>
<div class="shortcuts">
<div class="shortcut">
<img src="<?php echo $this->link('asset:img/desktop.png'); ?>" />
<label>Desktop</label>
</div>
<div class="shortcut">
<img src="<?php echo $this->link('asset:img/trash.png'); ?>" />
<label>Trash</label>
</div>
</div>
<div class="main xcme-frame">
<div class="xcme-frame-header">
<?php echo \Jivoo\View\Html::h($fs->getVirtualPath()); ?>
        &ndash; Files
</div>
<div class="xcme-frame-content xcme-files-frame">
<ul>
<?php foreach ($fs as $file): ?>
<li>
<a class="<?php echo $file->getType(); ?>" href="<?php echo $this->link($file); ?>"><?php echo \Jivoo\View\Html::h($file->getName()); ?></a>
</li><?php endforeach; ?>

</ul>
</div>
</div>
