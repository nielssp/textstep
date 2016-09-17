<!DOCTYPE html>
<?php $this->disableLayout(); ?><html>
<head><?php $this->import('css/main.css'); ?>
<meta charset="UTF-8" />
<title>BlogSTEP</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<?php echo $this->block('meta'); ?>
<?php echo $this->resourceBlock("style"); ?>
</head>
<body>
<div class="frame login-frame">
<div class="frame-header">Log out</div>
<div class="frame-content">
<form action="<?php echo $this->link([]); ?>" method="post" id="logout">
<input type="hidden" name="request_token" value="<?php echo $token; ?>" />
<div class="buttons">
<button type="submit">
<span class="icon icon-lock">
</span>
<span class="label">Log out</span>
</button>
</div>
</form>
</div>
</div>
</body>
</html>