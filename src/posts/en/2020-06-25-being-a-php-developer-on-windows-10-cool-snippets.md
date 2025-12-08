---
layout: post
title:  'Being a PHP developer on Windows: 10 cool snippets'
date:   2020-06-25 11:58:22 +2
lang: en
lang-ref: being-a-php-developer-on-windows
---

I am coding on Windows, and sometimes, I need aliases, scripts and handy tools.

Trust me, if you start learning about windows batch, you will definitely be able to get closer from a unix-like setup, thanks to your tons of scripts :)

I have created a [dotfiles](https://github.com/Pierstoval/dotfiles) repository a long time ago, like many other developers do, to centralize all the tools that I reuse across my computer setups. I actually have only 2 computers and I did not change my machine for years, so I do not need it often, but I still keep it up-to-date "just in case", or for showcase.<br>
That is what this post is about.

I am particularly proud of some really handy scripts, so here it is:

# My top 10 snippets to make life better for PHP devs on Windows

Let's start!

**🚀**

## 1. MySQL in a blink of an eye

**Snippet**: [https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/mysqldocker.bat](https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/mysqldocker.bat)

Start MySQL using docker in 1 second so you can reuse it anytime, while even keeping its data persistent:

This script will start a global Docker container named `mysql` with port `3316` (to avoid conflicting with other servers).

Now you can connect to it using the `root` / `root` username/password couple, and the `127.0.0.1` hostname!

To run a shell on it, run `docker exec -i mysql mysql -uroot -proot`.

**Pro tip**: Create an alias for the above snippet and run it whenever you want to launch a `mysql` shell on your container 😉.

## 2. Traefik in a blink of an eye

**Snippet**: [https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/traefikd.bat](https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/traefikd.bat)

This one launches an instance of Traefik using Docker.

⚠️ Note that this instance will **listen to ports 80, 8080 and 443**, so be careful with your other projects or tools that might also listen to these ports!

When running globally like this, Traefik can be used as a proxy to organize your projects and their architecture.

## 3. Symfony binary, the HTTP server

**Snippet**: [https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/sfserve.bat](https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/sfserve.bat)

The Symfony CLI binary is sometimes really problematic because it will crash from time to time on Windows, and you **do not even get a notice** (nor a reason why it crashed either). I noted that sometimes it happens during a `composer install` or `composer update`, but I do not know what it has to do with. Possibly cache, or something.

Anyway, I sometimes prefer to run it in an infinite loop so that any server crash will restart it afterwards.

That is what this snippet does, basically.

**Note**: this will be running in front in a terminal window, so I suggest you run it in a separate terminal instance or tab.

## 4. Symfony binary, the PHP server

**Snippet**: [https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/stopphp.bat](https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/stopphp.bat)

Symfony CLI on Windows will try to use `php-cgi.exe` when starting a server, and there are some inconsistencies when stopping `php-cgi`. When doing `symfony server:stop`, sometimes, it is… not really stopped.

So I execute this `stopphp` snippet and I am 100% certain that no other server will be running.

## 5. Merge PDFs on Windows using GhostScript

**Snippet**: [https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/merge-pdfs.bat](https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/merge-pdfs.bat)

If like me you sometimes have to merge PDFs together, install [Ghostscript for Windows](https://www.ghostscript.com/download/gsdnld.html), make `gs.exe` available in the `PATH`.

You can then do `merge-pdfs pdf1.pdf pdf2.pdf ...` and it will create an `output.pdf` file in the current dir!

## 6. Get current timestamp with Windows cmd

**Snippet**: [https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/localdate.bat](https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/localdate.bat)

Seriously, getting "time" values in Windows `cmd` is cumbersome.

So, I created this `localdate` script.

It outputs the date formated like this: `2020-06-25 11:49:25.161`.

## 7. Stop all running containers with Docker For Windows

**Snippet**: [https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/dockerstopall.bat](https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/dockerstopall.bat)

Stop all running docker containers by running this `dockerstopall` script!

You should be able to backport this script to other platforms, by the way.

## 8. Git aliases

**Snippets**:
* [https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/gst.bat](https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/gst.bat)
* [https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/gd.bat](https://github.com/Pierstoval/dotfiles/blob/main/windows_bin/gd.bat)

Here comes the legendary `gst` alias that just executes `git status`, or `gd` that executes `git diff`.

## 9. Create daemons on Windows

Windows does not really have this concept of a "daemon", but instead it has a similar concept: "services".

To create a service, it is theoretically easy to do with the built-in `sc` command on Windows.

However, this program is not really intuitive, and `sc create` is not easy as it looks at first glance.

That is why I am using [NSSM](https://nssm.cc/download), and I added it to my dotfiles so I don't have to re-download it from its main site each time I setup a new machine.

I already talked about [NSSM in a previous post about Apache and PHP-FPM on Windows](/en/blog/2017/11/11/apache-and-php-fpm-in-windows.html), check it out.

You now can create daemons by running `nssm install {your daemon name}`, and you can then **customize everything**: binary, arguments, working directory, environment variables, i/o, timeouts, rotate log files…<br>
**Everything**.

## 10. Unix `alias` equivalent for Windows.
 
Since Windows does not have a shell similar to `sh` or `bash`, you cannot have a one-single file to store your aliases, and cannot do something like `alias something="my other command"`.

Therefore, what you need is to write `.bat` or `.cmd` files with your script alias, and make sure this file is accessible in the `PATH` environment variable.

I then got tons of other shortcuts like that, such as "dcp" for "docker-compose" or "sf" for "php bin/console". Check the 

I have shared in point n°8 my aliases for Git, but you can actually create tons of other aliases!

What I like the most is that since Windows does not support hashbangs/shebang lines (the `#!/bin/bash` line you see on top of many unix-compliant executables), you can somehow "bypass" this by creating an alias to any non-Windows executable.

Here is an example for `php-cs-fixer`:

```bash
@echo OFF
:: in case DelayedExpansion is on and a path contains "!"
setlocal DISABLEDELAYEDEXPANSION
php "%~dp0php-cs-fixer.phar" %*
```

Let me explain all of this, since there is a lot of code for a few behavior:

* `@echo off` is here to avoid Windows to output **every line** of the cmd script when you execute it.
* `::` is a line-comment (well, it is actually not, it in fact is a goto/call label, but as it is always invalid since `:` is an invalid label, it then works just like a comment). You could also have used `REM` instead (which stands for "remark").
* `setlocal DISABLEDELAYEDEXPANSION`, is a safety mark to avoid having issues with the `!` character. There is a really nice explanation on [this StackOverflow issue](https://stackoverflow.com/questions/22278456/enable-and-disable-delayed-expansion-what-does-it-do) if you are keen to learn more about this statement.
* We start the instruction with the `php` binary, that should be accessible from the `PATH`.
* The `%~dp0` instruction contains more information than it looks:
  * `%0` is equivalent to `$0` in a Unix-like script, which contains the file being executed (your `.bat/.cmd` file).
  * `~` is a modifier that operates on the `0` var being processed, and will trim `"` characters around the filename.
  * `d` is a modifier that forces to expand to a drive letter, if it was not present.
  * `p` makes sure that the variable is expanded to full path, to have the "real path".
  
  There also is a nice [StackOverflow issue](https://stackoverflow.com/questions/5034076/what-does-dp0-mean-and-how-does-it-work) explaining the other modifiers you can use to expand variables to paths in Window batch scripts.
* Then, we glue the "full directory path" with the `php-cs-fixer.phar` PHAR file (which you could replace with anything else you wanted to execute, hence the reasons why I have many cmd scripts looking similar).
* Finally, the `%*` instruction is similar to `$@` in unix scripts: it expands to all the other arguments you passed to the current scripts.<br>
  With something like this:
  ```
  php-cs-fixer.bat fix --config=.php_cs
  ```
  It will expand to this:
  ```
  php c:\path\to\php-cs-fixer.phar fix --config=.php_cs
  ```
  In this case, `%*` equals `fix --config=.php_cs`.
  
Wow, all these explanations on how to create aliases!

In the end, what you mostly have to do is copy/paste any existing alias-file, and thoroughly check it to make sure it works properly.

Create everything you need in the same way to have a much better windows cmd experience!
 
Hope you liked this post 😄.
