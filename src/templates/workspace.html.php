<!DOCTYPE html>
<?php $this->disableLayout(); ?><html>
<head><?php $this->import('themes/default/theme.css;icons/default/icons.css;apps/workspace.app/main.js'); ?>
<meta charset="UTF-8" />
<title>TEXTSTEP</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="mobile-web-app-capable" content="yes">
<link rel="manifest" href="<?php echo $this->link('snippet:Snippets\Manifest'); ?>" />
<?php echo $this->block('meta'); ?>
<link rel="shortcut icon" href="<?php echo $this->link('asset:themes/default/icon.ico'); ?>" />
<link rel="apple-touch-icon" href="<?php echo $this->link('asset:themes/default/icon-57.png'); ?>" />
<link rel="apple-touch-icon" sizes="72x72" href="<?php echo $this->link('asset:themes/default/icon-72.png'); ?>" />
<link rel="apple-touch-icon" sizes="114x114" href="<?php echo $this->link('asset:themes/default/icon-114.png'); ?>" />
<link rel="apple-touch-icon" sizes="144x144" href="<?php echo $this->link('asset:themes/default/icon-144.png'); ?>" />
<link rel="icon" sizes="32x32" href="<?php echo $this->link('asset:themes/default/icon-32.png'); ?>" />
<link rel="icon" sizes="64x64" href="<?php echo $this->link('asset:themes/default/icon-64.png'); ?>" />
<link rel="icon" sizes="128x128" href="<?php echo $this->link('asset:themes/default/icon-128.png'); ?>" />
<link rel="icon" sizes="192x192" href="<?php echo $this->link('asset:themes/default/icon-192.png'); ?>" />
<meta name="theme-color" content="#515171" />
<meta name="application-name" content="TEXTSTEP" />
<link rel="fluid-icon" href="<?php echo $this->link('asset:themes/default/icon-512.png'); ?>" title="TEXTSTEP" />
<link rel="logo" type="image/svg" href="<?php echo $this->link('asset:themes/default/logo.svg'); ?>" />
<?php echo $this->resourceBlock("style"); ?>
</head>
<body data-server="<?php echo $this->link('path:api'); ?>">
<noscript>
            JavaScript is required.
</noscript>
<?php echo $this->resourceBlock("script"); ?>
</body>
</html>
