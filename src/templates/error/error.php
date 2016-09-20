<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title><?php echo Jivoo\I18n\I18n::get('Error'); ?></title>

<meta name="viewport" content="width=device-width, initial-scale=1" />

<style type="text/css">
* {
  padding: 0;
  margin: 0;
  font-family: sans-serif;
  font-weight: normal;
}
#status {
  color: #cc2222;
  background-color: #fff;
  font-size: 48px;
  position: absolute;
  top: 0;
  bottom: 50%;
  left: 0;
  right: 0;
}
#status > div {
  text-align: center;
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
}
#message {
  color: #333;
  background-color: #f1f1f1;
  font-size: 20px;
  position: absolute;
  top: 50%;
  bottom: 0;
  left: 0;
  right: 0;
}
#message > div {
  text-align: center;
  position: absolute;
  top: 32px;
  left: 0;
  right: 0;
}
#reference {
  margin-top:32px;
  font-size:0.8em;
  color: #999;
}
</style>

</head>
<body>

<div id="status">
<div>
<?php echo Jivoo\I18n\I18n::get('Error'); ?>
</div>
</div>

<div id="message">
<div>
<p><?php echo Jivoo\I18n\I18n::get('An error occurred while loading this page&hellip;'); ?></p>

<?php if (isset($hash)) : ?>
<p id="reference">Reference: #<?php echo $hash; ?></p>
<?php endif; ?>
</div>
</div>

</body>
</html>
