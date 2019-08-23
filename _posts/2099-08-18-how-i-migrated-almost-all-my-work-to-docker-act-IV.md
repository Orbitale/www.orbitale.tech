---
layout: post
title:  'How I migrated almost all my work to Docker: Act IV'
date:   2099-08-18 15:11:53 +0100
---

This post is the last one of a series of four posts about how I dockerized all my projects.

If you have not read the other ones, you may give them a go before reading this one:

* [Act I](/2099/08/18/how-i-migrated-almost-all-my-work-to-docker-act-I.html)
* [Act II](/2099/08/18/how-i-migrated-almost-all-my-work-to-docker-act-II.html)
* [Act III](/2099/08/18/how-i-migrated-almost-all-my-work-to-docker-act-III.html)
* Act IV (current)

## Reminder of previous posts

In the previous posts, we saw how to use Docker to simplify services creation for many subjects: PHP at first, and other services after, like MySQL, Redis, etc.

This last post will focus on **projects**.

To help dockerizing a project, here comes our savior: Docker Compose!

## Compose? Like, with music?

Compose, Composer, Symfony, Sonata... Do devs love music? Anyway, get back to the subject.

Docker Compose is a tool that is provided with Docker in order to create multi-container applications, link them together, and store the app's configuration in one single file: `docker-compose.yaml` (Yeah, I know... Yaml...).

As said in the first post of this series, I assume you know the basics of Docker Compose.

## Compose a base PHP project

What does PHP need to work when building a standard project? Most of the time: a web-server (we'll use `nginx`), `php-fpm` (else, no PHP, of course), and possibly a database (we'll use `mariadb`).

The best example is a Symfony project: if you create a project based on the `symfony/website-skeleton`, it will come with Doctrine ORM, therefore need a relational database (MySQL, MariaDB, PostgreSQL...). 

Let's create the base services:

```yaml
version: '3'

services:
    php: # Here will come something

    database: # Something else here

    http: # And here something else again.
```

> **Note:** Remember in the [second post](/2099/08/18/how-i-migrated-almost-all-my-work-to-docker-act-II.html) when I talked about permissions?
> Please be aware that **any container that will touch your files must handle permissions correctly**. Therefore, for any service you create that may have a shared volume with your machine, you **must** create a base Docker image and use the proposed hack to make sure permissions are handled correctly.
> Of course, as the hack I added to this post is focused on `php-fpm`, you must adapt it to the script you need to run, be it nodejs, mysql or anything.

### PHP

Your PHP container will need an image, as it will certainly modify your files, and of course you will need a specific PHP configuration or additional extensions.

I won't show the Docker image because you already know it after the second post of this series.

Here is a sample PHP service I may recommend:

```
services:
    php:
        build: .            # The PHP dockerfile is better at the root of the project
        working_dir: /srv   # As we used /srv in the image already
        volumes:
            - ./:/srv       # Necessary, so PHP can use your source code :p
        links:
            - database      # This is to help you connect to your database later
```

This could be optimized a bit, but for now it should be fairly enough.
