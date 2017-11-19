<!DOCTYPE html>
<?php $this->disableLayout(); ?><html>
<head><?php $this->import('css/main.css;dist/init.js;dist/main.js;css/icons.css;dist/workspace.js'); ?>
<meta charset="UTF-8" />
<title>BLOGSTEP</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<?php echo $this->block('meta'); ?>
<?php echo $this->resourceBlock("style"); ?>
</head>
<body data-path="<?php echo $this->link(''); ?>" data-run="<?php echo $run; ?>" data-args="<?php echo $args; ?>">
<aside id="menu">
<div id="workspace-menu">
<header>
                    Workspace (<span class="username">username</span>)
<span class="version"><?php echo \Jivoo\View\Html::h('v' . Blogstep\Main::VERSION); ?></span>
</header>
<nav>
<ul>
<li><button data-action="file-system">File system</button></li>
<li><button data-action="builder">Builder</button></li>
<li><button data-action="terminal">Terminal</button></li>
<li><button data-action="control-panel">Control panel</button></li>
<li><button data-action="switch-user">Switch user</button></li>
<li><button data-action="logout">Log out</button></li>
</ul>
</nav>
</div>
</aside>
<div id="dock">
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
</main>
<div id="login-overlay">
<div class="frame" id="login-frame">
<div class="frame-header">
<div class="frame-header-title">Log in</div>
</div>
<div class="frame-content">
<form method="post" id="login">
<div class="field">
<label for="username">Username</label>
<input type="text" name="username" id="login-username" />
</div>
<div class="field">
<label for="password">Password</label>
<input type="password" name="password" id="login-password" />
</div>
<div class="field remember">
<input type="checkbox" name="remember[remember]" value="remember" id="login-remember" />
<label for="login-remember">Remember</label>
</div>
<div class="buttons">
<button type="submit" title="Log in">
<span class="icon icon-unlock">
</span>
</button>
</div>
</form>
</div>
</div>
</div>
<?php echo $this->resourceBlock("script"); ?>
</body>
</html>
