<div class="xcme-frame xcme-login-frame">
<div class="xcme-frame-header">Log in</div>
<div class="xcme-frame-content">
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
<span class="icon">
<img width="16" height="16" alt="Log in" src="<?php echo $this->link('asset:img/unlock.png'); ?>" />
</span>
<span class="label">Log in</span>
</button>
</div>
</form>
</div>
</div>
