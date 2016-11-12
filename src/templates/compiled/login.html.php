<!DOCTYPE html>
<?php $this->disableLayout(); ?><html>
<head><?php $this->import('css/main.css;css/icons.css;dist/init.js;dist/login.js'); ?>
<meta charset="UTF-8" />
<title>BlogSTEP</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<?php echo $this->block('meta'); ?>
<?php echo $this->resourceBlock("style"); ?>
</head>
<body data-path="<?php echo $this->link(''); ?>">
<div class="frame login-frame">
<div class="frame-header">
<div class="frame-header-title">Log in</div>
</div>
<div class="frame-content">
<form action="<?php echo $this->link([]); ?>" method="post" id="login">
<input type="hidden" name="request_token" value="<?php echo $token; ?>" />
<div class="field">
<label for="username">Username</label>
<input type="text" name="username" id="username" value="<?php echo isset($username) ? $username : ''; ?>" />
</div>
<div class="field">
<label for="password">Password</label>
<input type="password" name="password" id="password" />
</div>
<div class="field remember">
<input type="checkbox" name="remember[remember]" value="remember" id="remember_remember" />
<label for="remember_remember">Remember</label>
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
<?php echo $this->resourceBlock("script"); ?>
</body>
</html>