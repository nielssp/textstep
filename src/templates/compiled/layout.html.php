<!DOCTYPE html>
<html>
<head><?php $this->import('css/main.css;dist/init.js;dist/main.js;css/icons.css'); ?>
<meta charset="UTF-8" />
<title><?php echo \Jivoo\View\Html::h(isset($title) ? $title : 'BlogSTEP'); ?></title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<?php echo $this->block('meta'); ?>
<?php echo $this->resourceBlock("style"); ?>
</head>
<body data-path="<?php echo $this->link(''); ?>">
<aside>
<?php echo $this->block('appmenu'); ?>
<header>Workspace (<span><?php echo \Jivoo\View\Html::h($user ? $user->getUsername() : ''); ?></span>)</header>
<nav>
<ul>
<li><a class="<?php if ($this->isCurrent('snippet:Files')) echo 'current'; ?>" href="<?php echo $this->link('snippet:Files'); ?>">File system</a></li>
<li><a class="<?php if ($this->isCurrent('snippet:Builder')) echo 'current'; ?>" href="<?php echo $this->link('snippet:Builder'); ?>">Builder</a></li>
<li><a class="<?php if ($this->isCurrent('snippet:Terminal')) echo 'current'; ?>" href="<?php echo $this->link('snippet:Terminal'); ?>">Terminal</a></li>
<li><a class="<?php if ($this->isCurrent('snippet:ControlPanel')) echo 'current'; ?>" href="<?php echo $this->link('snippet:ControlPanel'); ?>">Control panel</a></li>
<li>
<form action="<?php echo $this->link('snippet:Logout'); ?>" method="post">
<input type="hidden" name="request_token" value="<?php echo $token; ?>" />
<input type="submit" value="Log out" />
</form>
</li>
</ul>
</nav>
</aside>
<div class="shortcuts">
<div class="shortcut">
<img src="<?php echo $this->link('asset:img/icons/32/desktop.png'); ?>" />
<label>Desktop</label>
</div>
<div class="shortcut">
<img src="<?php echo $this->link('asset:img/icons/32/trash.png'); ?>" />
<label>Trash</label>
</div>
</div>
<main>
<?php echo $this->block('content'); ?>
</main>
<?php echo $this->resourceBlock("script"); ?>
</body>
</html>
