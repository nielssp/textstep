# BLOGSTEP

## API

### append

Append `data` to `path`.

URL: `POST /append`

Data:
```
{
  path: [string],
  data: [string]
}
```

### build [WIP]

URL: `POST /build`

### change-group

Change group of file.

URL: `POST /change-group`

Data:
```
{
  path: [string],
  group: [string],
  recursive: [string]
}
```

### change-mode

Change permissions of file.

URL: `POST /change-mode`

Data:
```
{
  path: [string],
  mode: [string],
  recursive: [string]
}
```

### change-owner

Change owner of file.

URL: `POST /change-owner`

Data:
```
{
  path: [string],
  owner: [string],
  recursive: [string]
}
```

### copy

Copy one or more files.

URL: `POST /copy`

Data:
```
{
  path: [string],
  destination: [string],
  paths: [object]
}
```

### delete

Delete one or more files.

URL: `POST /delete`

Data:
```
{
  path: [string],
  paths: [array]
}
```

### download

Read contents of a file.

URL: `GET /download[/:filename]?path=:path[&force]`

### fast-build [REMOVE]

URL: `POST /fast-build`

### generate-test-content [REMOVE]

URL: `POST /generate-test-content`

Data:
```
{
  num: [int]
}
```

### list-files

Get file metadata and contents of directories.

URL: `GET /list-files?path=:path`

### load [REMOVE]

URL: `GET /load?name=:name`

### login

URL: `POST /login`

Data:
```
{
  username: [string],
  password: [string],
  remember: [string]
}
```

### logout

URL: `POST /logout`

### make-dir

Create a new empty directory.

URL: `POST /make-dir`

Data:
```
{
  path: [string]
}
```

### make-file

Create a new empty file.

URL: `POST /make-file`

Data:
```
{
  path: [string]
}
```

### move

Move one or more files.

URL: `POST /move`

Data:
```
{
  path: [string],
  destination: [string],
  paths: [object]
}
```

### setup [REMOVE]

URL: `POST /setup`

### thumbnail

Get thumbnail.

URL: `GET /thumbnail?path=:path[&width=:width][&height=:height]`

### upload

Upload a file.

URL: `POST /upload?path=:path`

Data: files

### who-am-i

Returns username and home directory of current user.

URL: `GET /who-am-i`

### write

Write `data` to `path`.

URL: `POST /write`

Data:
```
{
  path: [string],
  data: [string]
}
```

## File system

### /build

Temporary build files.

### /content

Site content and files.

### /home

User configuration.

### /home/:user/.sessions.php

Session ids for user.

### /site

Site templates and assets.

### /site.site.json

Site configuration.

### /system

System configuration and files.

### /system/cache

Cached files.

### /system/cache/thumbnails

Thumbnails.

### /system/config.php

Main configuration file.

### /system/fileacl.php

File system access control lists.

### /system/groups.php

Groups.

### /system/log

Log files.

### /system/sessions.php

Main session id map.

### /system/sysacl.php

Permission key access control lists.

### /users.php

Users.
