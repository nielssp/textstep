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
<div class="frame-header">Log in</div>
<div class="frame-content">
<form action="#" method="post" id="login">
<div class="field">
<label for="username">Username</label>
<input type="text" name="username" id="username" />
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
<button type="submit">
<span class="icon icon-unlock">
</span>
<span class="label">Log in</span>
</button>
</div>
</form>
</div>
</div>
</body>
</html>