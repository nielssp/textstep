# TEXSTEP

TEXTSTEP is a file-oriented content management system and static site generator.

Features:

* Template language
* Markdown
* Automatic resize of images
* GUI
  * File manager with Miller columns
  * Image viewer and video player
  * Markdown and text editors with multiple buffers
  * Skinnable NeXTSTEP-inspired multitasking user interface

## Installation

*NB* TEXTSTEP is work in progress and still missing many features.

Requirements:

* PHP 5.5 or newer
* A web server such as Apache, Lighttpd, or nginx.

There are currently no prebuilt easy-to-install releases of TEXTSTEP. To manually build and install TEXTSTEP you need the following additional tools:

* NPM
* Composer

First clone the TEXTSTEP Git repository into a new directory:

```
git clone https://github.com/nielssp/textstep.git textstep
cd textstep
```

Install the PHP dependencies using Composer:

```
composer install --no-dev
```

Install the JavaScript dependencies using NPM:

```
npm install
```

Build the TEXTSTEP GUI:

```
npm run build:prod
```

The `dist`-directory should now contain several subdirectories as well as an `index.html` file. In the `dist`-directory there will also be two PHP-files: `api.example.php` and `dev.php`.
First delete `dev.php` since it's not used for a production build.
Then Rename `api.example.php` to `api.php`. `api.php` can be modified to change the locations of the `user`-, `system`-, `vendor`-, and `dist`-directories. The defaults should work fine in most cases though.

```
rm dist/dev.php
mv dist/api.example.php dist/api.php
```

Next create the `user`-directory. This will be the root of the TEXTSTEP file system:

```
mkdir user
```

In the `system`-directory rename the file `users.example.php` to `users.php`:

```
mv system/users.example.php system/users.php
```

By default the file contains a user `root` with password `root`. The password can be changed and more users can be added added in the control panel.

For TEXSTEP to function properly, it needs write-access to the `user`- and the `system`-directories. How exactly that is done depends on how your web server is configured. Ideally you make the web server user the owner of those directories, e.g. `chown www-data:www-data user system`. Alternatively, the lazy solution is to give everyone access, e.g. `chmod -R 0777 user system`.

At this point the directory structure should look roughly like this:

```
textstep
├── dist
│   ├── api.php
│   ├── index.html
│   ├── manifest.json
│   ├── apps
│   │   └── ...
│   ├── apps
│   │   └── ...
│   ├── icons
│   │   └── ...
│   ├── lib
│   │   └── ...
│   └── themes
│       └── ...
├── src
│   └── ...
├── system
│   └── users.php
├── user
│   └── ...
└── vendor
    ├── autoload.php
    └── ...
```

The web server should ideally be configured with two endpoints:

* The main public-facing website should point at `textstep/user/target`. The target directory will be created the first time you run the static site generator. This endpoint does not need PHP enabled.
* A separate admin site (maybe a separate subdomain) should point at the `textstep/dist` directory and should have PHP enabled.

No other directory should be publicly accessible.

## Usage

Open the website serving the TEXTSTEP GUI.

Log in using the configured user, e.g. user "root" with password "root".

Open the control panel from the main menu. Select "Change password" to change the password.

Open the file manager from the main menu. Create a new directory called "site". Open it by double clicking on it.

Create two new files in the site-directory: "index.tss" and "index.html".

Open "index.html" by double clicking on it. Write some HTML.

Open "index.tss" and add the following line to it:

```
add_static("index.html")
```

Open the build tool from the main menu. Click on the "Build all" button. The `target`-directory should now be created with your `index.html` file in it.
