---
layout: post
title:  'How I migrated almost all my work to Docker: Act I'
date:   2019-03-03 15:11:53 +0100
---

I made some tweets a while ago talking about [Docker](https://www.docker.com/), and I must say that I'm a bit afraid
that they get lost in an endless timeline.

So here's a small (or not) post about Docker.

## A long time ago, on a computer far far away...

As I have autism, I can understand some complex things, but I have to "practice" them for a long time sometimes. For
example, I now know many things about cartography (since I work on an app for this purpose), and it took me a long time
to understand the mathematical concepts underneath this simple thing that is cartography.

For Docker, it's the same thing.

Between my first "[whalesay](https://docs.docker.com/get-started/)" and my first "real-life" use of Docker, there's a
span of 3 years.

3 years, to be "comfortable" with the concept of an image-that-is-like-an-ISO-file-but-is-not-really-like-an-ISO-file 
and the concept of a container-that-is-like-a-virtual-machine-but-is-not-like-a-virtual-machine. 

Now, I'm _dockerizing_ almost all my projects.

## [How did it come to this?](https://open.spotify.com/track/0UMROwhQyAbWWLSnBH0e1L?si=gaj5R4H3TvWCWgIdngNZpQ) 

I was trapped behind my environment.

I was (and still am) mostly using Windows to work, because, well, I like to have the same machine to do everything. Even
though people tell me this is not optimized, I could find nice solutions to optimize my environment (use `cmd` but with
some plugins, don't use WSL to keep native stuff native, use [Apache & PHP on Windows](/2017/11/11/apache-and-php-fpm-in-windows.html)
with multiple versions of PHP, etc.).

This is not optimized because if I ever lost my machine (which did not happen in 6 years), I would have to restart from
scratch, all setup and stuff.

I was pretty satisfied with Apache Lounge + php-cgi, actually. And even [SymfonyCloud CLI tool](https://symfony.com/cloud/)
uses it when serving an app with `symfony serve`, so this is a nice solution.

I even installed multiple NodeJS versions to fit the different projects I work on.

However, reusability becomes difficult in a few cases:

* Use different PHP extensions everytime. For example, xdebug is not installed everywhere, but that's not the worse part
(because I can still do `-dzend_extension=xdebug.dll` when running a script). The worse part is when you need some for a
specific project, and don't need it for another.
Testing features that rely or not on PHP extensions can be tricky (intl, mbstring, fileinfo, etc.), and I was quite tired
of enabling/disabling extensions manually & restarting server before working on something.
* Multiple PHP versions is nice, but sometimes a project uses a specific PHP 5.5 or 5.6, and this is a bit harder because
I can't have hundreds of PHP versions on my machine. With Docker, I just don't care.
* Restarting the web-server or php-cgi is boring on Windows. Even if I can do `nssm restart php7.1-cgi` or 
`nssm restart apache`, it's not as straightforward as `make restart` on a project. Which doesn't need restart as much
often as when working on multiple projects.
* Databases. Most of my projects use MySQL or MariaDB, and I have to have both on my machine. Conflicting ports, root
password, etc., things that nobody wants to take care of. I just want a f*** database ☺.
* External components: redis, ElasticSearch, Blackfire (installing Blackfire for **all** versions of PHP, phew…), RabbitMQ,
and tons of other tools that anybody may need during development. I was lazy so most of the time I configured "nothing in 
dev, redis in prod". Bad idea. Have redis in prod? Then, have redis in dev. Period, end of story.

I could find more cases, but at least these ones might help understanding why "native tools" is not a good idea when
working on multiple projects…

## Dockerize all the things!
