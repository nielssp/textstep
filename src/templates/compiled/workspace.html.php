<!DOCTYPE html>
<?php $this->disableLayout(); ?><html>
<head><?php $this->import('themes/default/theme.css;icons/default/icons.css;apps/workspace.app/main.js'); ?>
<meta charset="UTF-8" />
<title>TEXTSTEP</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<?php echo $this->block('meta'); ?>
<link rel="shortcut icon" href="<?php echo $this->link('asset:apps/workspace.app/icon.ico'); ?>" />
<?php echo $this->resourceBlock("style"); ?>
</head>
<body data-server="<?php echo $this->link('path:api'); ?>" data-run="<?php echo $run; ?>" data-args="<?php echo $args; ?>">
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
</div>
<main>
</main>
<?php echo $this->resourceBlock("script"); ?>
</body>
</html>
