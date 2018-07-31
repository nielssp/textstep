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
<noscript>
            JavaScript is required.
</noscript>
<?php echo $this->resourceBlock("script"); ?>
</body>
</html>
