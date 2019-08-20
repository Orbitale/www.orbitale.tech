---
layout: post
title:  'How I migrated almost all my work to Docker: Act II'
date:   2019-08-18 15:11:53 +0100
---

This post is the second of a series of three posts about how I started to used Docker for all my projects.

## Reminder of previous post

In the previous post, I said that having a "native" environment can be faster in terms of performances and handiness, but cumbersome when handling updates or multiple projects.

This second post will explain how we can use Docker with our favourite programming language (even though this post is PHP-oriented).

## PHP: State of the art

This is not a secret: PHP's native web server introduced in PHP 5.4 is not the best.

[Fabien Potencier](https://speakerdeck.com/fabpot/symfony-local-web-server-dot-dot-dot-reloaded) started a poll to ask what web server people tend to use, and if we exclude Docker (which is the subject of this series of posts) and `php bin/console server:start` with Symfony (which is focused on Symfony), the most used solutions are native Nginx or native Apache servers.

This means that with PHP we **need** a web server.

The Symfony CLI partly solved this issue: a Go-based web server running in the background, proxying requests to your `php-fpm` or `php-cgi` or `php -S` server (in this order of preference) depending on their availability.

However, this still needs a PHP version installed.

> **Note:** If you don't use PHP at all, just imagine the same kind of workflow for your favourite language, could it be Ruby, Python, Javascript, or another. After all, they all have language & system dependencies, so the behavior could be really similar.

Installing PHP is probably the biggest part of this post. That's why I'll make another post for _other_ services than PHP.

## PHP: how to?

> Q: What is PHP?
> A: It is an interpreted language (for short)
> Q: How do we run it?
> A: Compile PHP or download an already-compiled version for your OS, and (... blah blah)

PHP is mostly run in two different manners: command-line, and web-server.

> **Note:** Actually, there can be tons of different other manners to run PHP. According to the [non-exhaustive list of SAPIs in PHP documentation](https://www.php.net/manual/en/function.php-sapi-name.php), there are at least 23 known SAPIs.
> The most common ones are probably `cli`, `fpm-fcgi`, `apache` and `cli-server`.

For each solution, there's an associated [official Docker image for PHP](https://hub.docker.com/_/php) that you can use.

The ones I recommend are the following: `php:7.3-fpm` if you need it as a web-server, and `php:7.3-cli` if you just need the CLI.

Of course, here I'm talking about `7.3`, but in a few months, I'll update this post and recommend `7.4` after its stable release.

Checkout [all tags](https://hub.docker.com/_/php?tab=tags) if you need to know what versions you can install. You can even find older PHP versions, like 5.4 or 5.3, for legacy projects!

They are based on Debian and are pretty much safe. Some people prefer Alpine, but I don't like it: even if it's lightweight, it's not using the same C compiler and to me it doesn't have the same stability.

Other tags (like `-apache`, `-stretch`, etc.) are mostly when you need to use PHP with a legacy project, and to replicate an old behavior.

**For new projects, I recommend to use the `fpm` version anyway, so you're safe**.

## Don't _use_ PHP! Rebuilt it instead!

I don't mean to _recompile_ it, but it's almost the same thing.

I recommend to **always** use a custom Dockerfile to **build your own PHP version for your project**.

PHP is not meant to be "global" when working with multiple projects. And even when working with one single project.

If you still want "your" PHP version to be "global", you could still create a "PHP Docker base" project and store the config there, because we'll be building a Docker image anyway, and we can use it anytime and anywhere. Here, it's up to you.<br>
I'll personally consider that PHP will be a per-project one, but you can do otherwise if you like.

It almost always start with something like this:

```
# Directory structure:
MyProject/
├─── docker/                         <-- Where to store the config for all your Docker images
│    └─── php/
│         ├─── bin/                  <-- Sometimes we can have executables/helpers
│         │    └─── entrypoint.sh    <-- I'll talk about this later, don't worry :)
│         └─── etc/
│              └─── php.ini          <-- And indeed, every PHP project has its own PHP configuration
└─── Dockerfile
```

```dockerfile
# ./Dockerfile
FROM php:7.3-fpm

LABEL maintainer="pierstoval@gmail.com"

## Having it named as "99-..." makes sure your file is the last one to be loaded,
## therefore helping you override any part of PHP's native config.
COPY docker/php/etc/php.ini /usr/local/etc/php/conf.d/99-custom.ini
```

In my next post, I will talk about other services: database, cache, mail...

This is the **base**.

## Base non-PHP dependencies

As it's Debian-based, we also need **to update system dependencies**, and prepare the path for adding other dependencies, sometimes mandatory!<br>
To do so, I add this to the Dockerfile:

```dockerfile
RUN set -xe \
    && apt-get update \
    && apt-get upgrade -y \
    \
    && `# Libs that are needed and  will be REMOVED in the final image` \
    && export BUILD_LIBS=" \
    " \
    && `# Libs that need to be installed for some dependencies (mostly PHP ones) but that will be KEPT in the final image` \
    && export PERSISTENT_LIBS=" \
    " \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        make \
        curl \
        git \
        unzip \
        $BUILD_LIBS \
        $PERSISTENT_LIBS \
    \
```

Let's sum up what we have here:

* You can note that all of this is a **one-line** `RUN` statement. Just remember that it makes Docker images lighter.
* You may also note that I'm abusing `\` and "useless" comments, but this is important to me to **document the Dockerfile**. I've seen too many Dockerfiles without any explanation on why a dependency is added etc., so that's why I'm doing this.
* And finally, you may note the difference between `BUILD_LIBS` and `PERSISTENT_LIBS`.<br>
Sometimes when installing dependencies, you need the whole lib, but when it's installed, you just need the headers (most of the time, it's the package name ending with `-dev`). To make the image lighter, we differentiate both.
* Also, there are reasons why I add `make`, `curl`, `git` and `unzip` by default: it makes dependencies installation easier, and Composer may use it to install dist dependencies, and when one needs to debug the whole image/running container, it's also faster. But these are not 100% mandatory (and some packages you will install in the future may require and install them anyway).

That's it for _system_ dependencies, but that's not finished.

## User permissions

Docker has a strange way to manage user permissions: by default, it's `root`.

The problem with `root` is that it will cascade to your filesystem. Therefore, any file created in a directory that is shared between the container and your filesystem will belong to `root`.

That's why we need a workaround to make sure the user in the container is the same as the user _running_ the container (your machine user).

> **Note:** On Windows, this issue is not happening at all, because Windows does not use the same permission system as Linux.
> Be careful: every Docker image you create **must** be tested on Linux, as it's probably going to be used on Linux anytime.
> Without this workaround, your image will work on Windows but not on Linux.
>
> Also note that this workaround will have to be repeated for **every** Docker image that **manipulates your filesystem**. Images that don't touch your filesystem don't need this.

I add this to my Dockerfile:

```dockerfile
# ... the "RUN" Docker statement
    && `# User management for entrypoint` \
    && curl -L -s -o /bin/gosu https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-$(dpkg --print-architecture | awk -F- '{ print $NF }') \
    && chmod +x /bin/gosu \
    && groupadd _www \
    && adduser --home=/home --shell=/bin/bash --ingroup=_www --disabled-password --quiet --gecos "" --force-badname _www \
    \
```

First, I'm using [tianon/gosu](https://github.com/tianon/gosu), it helps using features like setuid, setgid, etc., in order to "mock" the final Unix user.

And after that, I add a `_www` user and group, and I need to remember the name, because I will use it.

This is not finished, but this is the base for better user permissions.

Next is...

### The Entrypoint

If you know a few "advanced" things about Docker, you probably know that a Docker image has two parameters to run it: the entrypoint and the command.

* The command is something like `php -S 127.0.0.1:8080`. It's the final command that's executed by the container. It's not mandatory and can be easily overriden, for example when you just want to run a shell in a container based on your image. This means we could replace the command with `bash` to run a [Bourne again shell](https://en.wikipedia.org/wiki/Bourne_again_shell).
* The entrypoint however is the script that is used when the container is run as an executable. By default, it is `/bin/sh -c`, and it can be used to run **any** command in the container, available for the user. However, some people tend to change it.

For our workaround, we need to override the entrypoint, because it is using the default `root` user, and we don't want this.

Let's first add this new Docker command in our Dockerfile:

```dockerfile
## Remember to make this script executable!
COPY docker/php/bin/entrypoint.sh /bin/entrypoint

ENTRYPOINT ["/bin/entrypoint"]
```

Remember the image's directory structure at the beginning of this post?

The entrypoint will use `gosu` to use the machine user inside the container:

```shell script
#!/bin/sh

## ./docker/php/bin/entrypoint.sh

set -e

uid=$(stat -c %u /srv)
gid=$(stat -c %g /srv)

if [ "${uid}" -eq 0 ] && [ "${gid}" -eq 0 ]; then
    if [ $# -eq 0 ]; then
        php-fpm
    else
        exec "$@"
        exit
    fi
fi

# Override php-fpm user & group config
sed -i "s/user = www-data/user = _www/g" /usr/local/etc/php-fpm.d/www.conf
sed -i "s/group = www-data/group = _www/g" /usr/local/etc/php-fpm.d/www.conf

# Override native user and use the "_www" one created in the image
sed -i -r "s/_www:x:\d+:\d+:/_www:x:$uid:$gid:/g" /etc/passwd
sed -i -r "s/_www:x:\d+:/_www:x:$gid:/g" /etc/group
chown _www /home

if [ $# -eq 0 ]; then
    php-fpm
else
    exec gosu _www "$@"
fi
```

Yes, this seems hacky. I know it, and I wish we could get rid of this with a single option, like `USE_MACHINE_USER=true` or something like that. But this is not possible, as it does not exist.

However, if you install `gosu`, create the `_www` user, customize the `ENTRYPOINT`, add this `entrypoint.sh`, you're almost safe with user permissions.

Phew!

## Cleaning the image

It's known that Docker images can be REALLY heavy. The biggest image I'm using is 475MB and I installed TONS of things on it.

However, when building this image, before I execute the scripts I'm going to give you, it can be like 1GB. This is heavy.

That's why we need to clean it up entirely and remove everything we don't need when delivering this image to the hub:

```dockerfile
    && `# Clean apt cache and remove unused libs/packages to make image smaller` \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false -o APT::AutoRemove::SuggestsImportant=false $BUILD_LIBS \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/www/* /var/cache/*
```

You may note the presence of `$BUILD_LIBS`: this is the variable we created in the beginning of the `RUN` script, it stores the system dependencies that we do not need and want to remove to make the image lighter. 

## And that's not it!

Now that everything is set up, let's see the **final Dockerfile** we have:

```dockerfile
# ./Dockerfile
FROM php:7.3-fpm

LABEL maintainer="pierstoval@gmail.com"

## Remember to make this script executable!
COPY docker/php/bin/entrypoint.sh /bin/entrypoint

ENTRYPOINT ["/bin/entrypoint"]

## Having it named as "99-..." makes sure your file is the last one to be loaded,
## therefore helping you override any part of PHP's native config.
COPY docker/php/etc/php.ini /usr/local/etc/php/conf.d/99-custom.ini

RUN set -xe \
    && apt-get update \
    && apt-get upgrade -y \
    \
    && `# Libs that are needed and  will be REMOVED in the final image` \
    && export BUILD_LIBS=" \
    " \
    && `# Libs that need to be installed for some dependencies (mostly PHP ones) but that will be KEPT in the final image` \
    && export PERSISTENT_LIBS=" \
    " \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        make \
        curl \
        git \
        unzip \
        $BUILD_LIBS \
        $PERSISTENT_LIBS \
    \
    \
    && `# Here come the PHP dependencies (see later)` \
    \
    \
    && `# User management for entrypoint` \
    && curl -L -s -o /bin/gosu https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-$(dpkg --print-architecture | awk -F- '{ print $NF }') \
    && chmod +x /bin/gosu \
    && groupadd _www \
    && adduser --home=/home --shell=/bin/bash --ingroup=_www --disabled-password --quiet --gecos "" --force-badname _www \
    \
    && `# Clean apt cache and remove unused libs/packages to make image smaller` \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false -o APT::AutoRemove::SuggestsImportant=false $BUILD_LIBS \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/www/* /var/cache/*
```

## TODO
