<!DOCTYPE html>
<html>
<head><?php $this->import('css/main.css;dist/init.js;dist/main.js;css/icons.css'); ?>
<meta charset="UTF-8" />
<title>BlogSTEP</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<?php echo $this->block('meta'); ?>
<?php echo $this->resourceBlock("style"); ?>
</head>
<body data-path="<?php echo $this->link('path:'); ?>">
<aside>
<?php echo $this->block('appmenu'); ?>
<header>Workspace</header>
<nav>
<ul>
<li><a class="<?php if ($this->isCurrent('snippet:Files')) echo 'current'; ?>" href="<?php echo $this->link('snippet:Files'); ?>">File system</a></li>
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
<main>
<?php echo $this->block('content'); ?>
</main>
<?php echo $this->resourceBlock("script"); ?>
</body>
</html>
