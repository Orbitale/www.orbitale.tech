---
layout: post
title:  'How I migrated almost all my work to Docker: Act III'
date:   2019-08-18 15:11:53 +0100
---

This post is the third of a series of three posts about how I started to used Docker for all my projects.

## Reminder of previous post

In the previous post, I gave a lot of examples related to PHP with Docker.

This third post will explain how we can migrate of our environment **services** with Docker in order to simplify our lives.

## External services

I will mostly talk about databases, because it's the most straightforward solution, but this is valid for _any_ type of service, could it be a mailer, a queue system or a cache engine.

## What is a "service"?

Usually with PHP setups we start learning by installing an *AMP environment (LAMP for Linux, WAMP for Windows, etc.). They correspond to "Apache, Mysql and PHP".

I will not explain why Apache is a bad solution, there is already a glance of this opinion on my [Apache and PHP-FPM in Windows](/2017/11/11/apache-and-php-fpm-in-windows.html) post.

The problem with this setup is that all three services are tied together and if you don't do PHP, you just don't care about it and just want a MySQL server for example. With NodeJS you might not need Apache at all. With Ruby, well you need Ruby of course, and you'll need a database.

And this is not only for MySQL: one day you'll end up adding a RabbitMQ queue, or a Mailcatcher server to debug your e-mails, or a Redis server for your HTTP sessions, well, at some point you need to install something that needs tons of configuration.<br>
Just like PHP.

## Installing MySQL

Okay, let's install MySQL: `apt-get install mysql-server` (or [follow the guide for Windows](https://dev.mysql.com/downloads/mysql/)).

Now, how do you manage the `root` account?

Well, it depends on your OS, on the way it is installed, on its version, etc.

Now, let me show you how we can run a MySQL server with one single command using Docker:

```shell script
docker run --name=mysql -dit -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql:5.7
```

This will start a MySQL server, expose the `3306` port (default for MySQL) and set it up with `root` as root password.

Really straightforward.

**Bonuses:**

* You can make it always available by appending the `--restart=always` (be careful, if it bugs all the time, you'll need to remove the container)
* You can store all data from it in your machine by adding a volume mounted on the container's mysql `datadir`: `--volume /your/mysql/data:/var/lib/mysql` (customize your mysql data dir), making data persistent even if you remove the container.
* You can start many other mysql servers with the same versions just by changing the exposed port, like `-p 10000:3306`
* It's a one-liner command: make it an alias too!

## That's it (for now)

In my next post, I will show some examples of fully dockerized projects
