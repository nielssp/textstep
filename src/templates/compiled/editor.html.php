<?php $this->import('vendor/simplemde/dist/simplemde.min.js;vendor/simplemde/dist/simplemde.min.css;vendor/highlightjs/highlight.pack.min.js;vendor/highlightjs/styles/solarized_light.css'); ?><aside>
<header>Editor</header>
<nav>
<ul>
<li><a href="#">New</a></li>
<li><a href="#">Save</a></li>
<li><a href="#">Close</a></li>
</ul>
</nav>
<header>Workspace</header>
<nav>
<ul>
<li><a href="#">File system</a></li>
<li><a href="#">Control panel</a></li>
</ul>
</nav>
</aside>
<div class="shortcuts">
<div class="shortcut">
<img src="<?php echo $this->link('asset:img/desktop.png'); ?>" />
<label>Desktop</label>
</div>
<div class="shortcut">
<img src="<?php echo $this->link('asset:img/trash.png'); ?>" />
<label>Trash</label>
</div>
</div>
<div class="main xcme-frame">
<div class="xcme-frame-header">
        some-file.md - Editor
</div>
<div class="xcme-frame-content xcme-editor-frame">
<textarea>test goes here</textarea>
</div>
</div>
<script type="text/javascript">
    var simplemde = new SimpleMDE({
        autofocus: true,
        autosave: {
            enabled: true
        },
        renderingConfig: {
            codeSyntaxHighlighting: true
        }
    });
</script>