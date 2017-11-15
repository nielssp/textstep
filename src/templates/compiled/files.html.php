<?php $this->import('css/files.css;dist/files.js'); ?><div class="frame">
<?php echo $this->begin('appmenu'); ?><div>
<header>Files</header>
<nav>
<ul>
<li><a href="#" data-action="new-folder">New folder</a></li>
<li><a href="#" data-action="new-file">New file</a></li>
<li><a href="#" data-action="download">Download</a></li>
</ul>
</nav>
</div><?php echo $this->end(); ?>
<div class="frame-header">
<div class="frame-header-actions">
<a href="" data-action="toggle-menu"></a>
</div>
<div class="frame-header-title">
<span class="header-path"><?php echo \Jivoo\View\Html::h($fs->getPath()); ?></span>
            &ndash; Files
</div>
</div>
<div class="frame-toolbar">
<div class="button-group">
<button data-action="back" title="Go back">
<span class="icon icon-go-back"></span>
</button>
<button data-action="up" title="Go to parent">
<span class="icon icon-go-up"></span>
</button>
<button data-action="home" title="Go to root">
<span class="icon icon-go-home"></span>
</button>
</div>
<span class="frame-toolbar-separator"></span>
<div class="button-group">
<button data-action="new-file" title="Create file">
<span class="icon icon-edit-new-file"></span>
</button>
<button data-action="upload" title="Upload file">
<span class="icon icon-edit-upload"></span>
</button>
</div>
<span class="frame-toolbar-separator"></span>
<div class="button-group">
<button data-action="cut" title="Move selection to shelf">
<span class="icon icon-edit-cut"></span>
</button>
<button data-action="copy" title="Copy selection to shelf">
<span class="icon icon-edit-copy"></span>
</button>
<button data-action="paste" title="Place item from shelf">
<span class="icon icon-edit-paste"></span>
</button>
<button data-action="rename" title="Rename">
<span class="icon icon-edit-rename"></span>
</button>
<button data-action="trash" title="Delete selection">
<span class="icon icon-edit-trash"></span>
</button>
</div>
</div>
<div class="frame-content frame-content-flex">
<div class="files-columns" data-token="<?php echo $token; ?>">
<div class="files-panel" data-path="<?php echo $fs->getPath(); ?>">
<div class="files-list">
<?php foreach ($fs as $file): ?>
<a data-path="<?php echo $file->getPath(); ?>" class="<?php echo 'file file-' . $file->getType(); ?>" href="<?php echo $this->link($file); ?>"><?php echo \Jivoo\View\Html::h($file->getName()); ?></a><?php endforeach; ?>

</div>
</div>
</div>
<div class="files-shelf">
<div class="files-grid">
</div>
</div>
</div>
</div>
