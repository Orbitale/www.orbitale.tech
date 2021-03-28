---
layout: post
title:  'Comment j''ai migré tout mon travail sous Docker Acte II : PHP'
date:   2019-09-02 10:00:00 +0200
lang: fr
lang-ref: how-I-migrated-almost-all-my-work-to-docker-act-II-php
---

Cet article est le deuxième d'une série de quatre articles sur la migration de quasiment tous mes projets sous Docker.

Si vous voulez lire les autres articles, vous pouvez vous référer à cet index :

* [Acte I: Genèse](/fr/2019/08/26/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-I-genese.html)
* Acte II: PHP (actuel)
* [Acte III: Services](/fr/2019/09/09/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-III-services.html)
* [Acte IV: Projet](/fr/2019/09/16/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-IV-compose)

## Résumé des épisodes précédents

Dans le précédent article, je disais que le fait d'avoir un environnement de développement "natif" a beau être plus performant, il peut être assez contraignant quand on multiplie les projets, que l'on doit faire des mises à jour, ou qu'on a des projets legacy assez spécifiques.

Ce second article va me permettre de vous présenter comment utiliser Docker avec votre langage de programmation préféré (bon, ok, c'est seulement PHP, mais ça peut fonctionner avec n'importe quel autre langage).

## PHP : l'état de l'art

Parlons un peu de PHP en tant que serveur web.

Ce n'est un secret pour personne : le serveur web natif de PHP est loin d'être bon.

[Fabien Potencier](https://speakerdeck.com/fabpot/symfony-local-web-server-dot-dot-dot-reloaded) a récemment demandé à la communauté dev quel serveur web elle utilise, et si l'on exclut Docker (qui est le sujet de cette série d'articles), ainsi que `php bin/console server:start` avec Symfony (qui se concentre seulement sur Symfony), les solutions les plus utilisées restent Nginx et Apache.

Ce qui veut dire qu'on a quand même **besoin** d'un serveur web. Et un bon. Et même en dev.

Le [binaire Symfony CLI](https://symfony.com/doc/current/setup/symfony_server.html) a partiellement corrigé ce problème : un serveur web développé en Go qui s'exécute en arrière-plan, et qui va transmettre les requêtes à une instance de `php-fpm`, `php-cgi` ou de `php -S ...` (dans cet ordre de préférence) en fonction de leurs disponibilités (il peut aussi fournir un serveur HTTPS et d'autres fonctionnalités).

Cependant, il faut quand même avoir installé PHP.

> **Note:** Si vous n'utilisez pas du tout PHP, imaginez le même genre de workflow pour votre langage favori, que ce soit Ruby, Python, Javascript, ou d'autres. Au final, ces langages ont tous des dépendances et la possibilité de faire du web avec, donc le résultat devrait être très similaire.

Dockeriser PHP est assez complexe que je vais devoir faire un autre article pour les _autres_ services que juste PHP.

## PHP : comment ça marche ?

> Q: C'est quoi PHP ?
> A: C'est un langage interprété (pour faire court).
> Q: Comment on le lance ?
> A: Compilez PHP ou téléchargez une version compilée pour votre système, et (... blablabla)

Le "mode d'exécution" de PHP s'appelle un SAPI (Server API).

PHP est généralement exécuté de deux manières différentes : en ligne de commande, ou avec un serveur web.

> **Note :** En réalité, il existe plein d'autres manières d'utiliser PHP. D'après [la liste non-exhaustive des SAPIs dans la documentation PHP](https://www.php.net/manual/fr/function.php-sapi-name.php), il y a au moins 23 différents SAPIs.
> Les plus communs étant probablement `cli`, `fpm-fcgi`, `apache` et `cli-server`, qui correspondent justement à la ligne de commande et à des SAPIs orientés web.

Pour chaque solution, il y a une [image Docker officielle pour PHP](https://hub.docker.com/_/php) que vous pouvez utiliser.

Les plus communes étant donc `php:7.4-fpm` pour le web, et `php:7.4-cli` pour seulement la ligne de commande.

> **Note :** Si j'écris PHP 7.4 aujourd'hui, dites-vous bien que si vous lisez cet article bien plus loin dans le temps, vous devrez prendre la dernière version que vous trouverez sur le Docker Hub, et pas juste ce que je vous dis aujourd'hui.

Vous pouvez voir [tous les tags](https://hub.docker.com/_/php?tab=tags) si vous voulez d'autres versions. Il y a même de vieilles versions comme PHP 5.4 ou 5.3 pour vos projets legacy !

Ces images sont basées sur Debian et sont plutôt pratique. D'autres préfèrent Alpine, mais ce n'est pas mon cas : ok, c'est plus léger, mais ce n'est pas le même compilateur C, et l'installation des libs natives n'est pas du tout aussi intuitives. Et puis si vous n'utilisez pas Docker en prod, vous n'utiliserez probablement pas Alpine non plus, donc autant utiliser le même OS que la prod (Debian, la plupart du temps, donc).

D'autres tags (comme `*-apache` ou `*-stretch`) peuvent être utilisés si vous avez besoin de PHP avec d'autres versions de l'OS ou en utilisant l'extension Apache.

**Pour vos nouveaux projets, je recommande d'utiliser `fpm`, c'est plus simple**.

## N'allez pas _utiliser_ PHP ! Compilez-le !

Je veux pas dire par là qu'il faut _recompiler tout PHP_, mais c'est un peu pareil, vous allez voir.

Quand on utilise Docker pour nos langages de programmation, il est toujours mieux d'utiliser un Dockerfile, pour **construire votre propre image avec votre propre configuration PHP dedans**.

PHP n'est pas pratique s'il est "global" sur votre machine, surtout avec plusieurs projets. Et même avec un seul projet, au final.

Si vous voulez toujours que "votre" version de PHP soit "globale", vous pouvez créer un projet "PHP Docker base" pour y stocker la config de base, que vous pourrez réutiliser, mais faites-moi confiance, c'est plus simple de refaire toute la config pour chacun de vos projets, parce que vous finirez invariablement par avoir des "spécificités" dans chacune de vos images. C'est vous qui voyez.<br>
Je considère chaque langage de programmation, dont PHP, comme un pré-requis **par projet**.

Je démarre quasiment tous mes projets avec une structure comme celle-ci en générale :

```
# Structure de dossiers :
MonProjet/
├─── docker/                         <-- Là où on stocke toute la config pour les images Docker du projet
│    └─── php/
│         ├─── bin/                  <-- Un dossier "bin" pour les exécutables de l'image Docker
│         │    └─── entrypoint.sh    <-- On va parler de ce fichier un peu plus tard, je vous rassure :)
│         └─── etc/
│              └─── php.ini          <-- Chaque projet ayant sa propre config PHP, on la place ici
└─── Dockerfile                      <-- Et un fichier "Dockerfile" correspondant au langage principal du projet, ici PHP
```

```dockerfile
# ./Dockerfile
FROM php:7.4-fpm

## Mettez ce que vous voulez ici, mais c'est toujours sympa de rappeler *qui* crée un projet.
## (vous me remercierez quand vous verrez ce genre de chose sur des projets ayant plus de 5 ans !)
LABEL maintainer="pierstoval@gmail.com"

## Pas obligatoire, mais en l'utilisant comme une convention un peu partout, c'est plus simple 
WORKDIR /srv

## En le nommant "99-...", on est sûrs que le fichier de config du projet est le dernier à être chargé,
## du coup ça nous permet de surcharger n'importe quelle configuration de PHP.
COPY docker/php/etc/php.ini /usr/local/etc/php/conf.d/99-custom.ini
```

```ini
; docker/php/etc/php.ini
; Une config que je réutilise un peu partout, assez pratique.
; À vous de l'adapter à vos besoins en fonction de chacun de vos projets !
; Idéalement, ça doit être la même config qu'en prod, sauf pour les erreurs (affichez TOUJOURS les erreurs en dev).
allow_url_include = off
date.timezone = Europe/Paris
max_execution_time = 180
memory_limit = 1024M
phar.readonly = off
post_max_size = 100M
realpath_cache_size = 4M
realpath_cache_ttl = 3600
short_open_tag = off
upload_max_filesize = 100M

[errors]
display_errors = On
display_startup_errors = off
error_reporting = E_ALL

[opcache]
opcache.enable = 1
opcache.enable_cli = 1
opcache.max_accelerated_files = 50000
```

Dans le prochain article, je parlerai plus en détails : base de données, cache, mail...

Ça, c'est notre configuration **de base**.

## Dépendances de base non-PHP

Comme c'est basé sur Debian, on va **mettre à jour toutes les dépendances du système** dès le départ, et préparer le terrain pour d'autres dépendances, dont certaines sont obligatoires!<br>
Pour ça, je rajoute ceci dans le Dockerfile :

```dockerfile
RUN set -xe \
    && apt-get update \
    && apt-get upgrade -y \
    \
    && `# Les libs qui seront SUPPRIMÉES une fois l'image créée` \
    && export BUILD_LIBS=" \
    " \
    && `# Les libs qui doivent obligatoirement être installées et qui seront CONSERVÉES dans l'image finale` \
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

Résumons un peu tout ce gros fatras de code :

* On peut voir que tout ceci est en réalité **une seule instruction** `RUN`. Cela permet de limiter la quantité de _layers_ créés par Docker, rendant l'image finale plus légère.
* Vous pouvez voir que j'abuse un peu des `\` (pour les sauts de lignes) et des ``#` (pour les commentaires), mais c'est important à mes yeux de **documenter votre Dockerfile**. J'ai vu tellement de Dockerfiles sans aucune explication sur le pourquoi du comment d'une dépendance ou d'un script exécuté que du coup je fais ça pour avoir un maximum d'infos. D'ailleurs, je vais même jusqu'à séparer l'installation de certains outils (vous verrez ça plus loin). 
* Aussi, vous pouvez constater qu'il y a une différence entre `BUILD_LIBS` et `PERSISTENT_LIBS`.<br>
Parfois, en installant des packages, vous avez besoin de toute une lib, mais une fois installée, il ne faut plus que les _headers_ (la plupart du temps il s'agit des packages se terminant en `-dev`). Pour rendre l'image plus légère, on différencie les deux, et on supprime à la fin toutes celles qui étaient dans `BUILD_LIBS`, qui ne servent donc plus.
* Aussi, il y a une bonne raison pour laquelle je rajoute `make`, `curl`, `git` et `unzip` par défaut : ça facilite grandement l'installation de certaines dépendances, et Composer s'en servira peut-être lui-même pour installer vos dépendances PHP plus tard, et c'est plus rapide. Elles ne sont cependant pas 100% obligatoires (certains packages que vous installerez les installeront peut-être de toute façon).<br>
Vous pouvez les ajouter à `BUILD_LIBS` si vous êtes vraiment certain(e) de ne plus en avoir besoin après avoir créé votre image (mais je n'ai encore jamais eu ce cas, personnellement).

Et ça, c'est pour les dépendances _système_. Comme vous l'imaginez bien, on est à peine à la moitié de l'article, donc c'est pas fini.

## Permissions utilisateurs

Docker a une façon bizarre de gérer ses permissions utilisateur : par défaut, c'est `root` partout.

Le problème avec ça, c'est que les permissions `root` vont se propager à votre système de fichier à vous, en plus de l'image Docker. Du coup, tout fichier créé dans un dossier qui est partagé entre votre container Docker et votre machine "hôte" va appartenir à `root`, et c'est pas cool.

C'est pour ça qu'il nous faut une solution pour être sûr que l'utilisateur dans le container sera le même que celui qui _exécute_ le container (le même que l'utilisateur de votre machine).

> **Note :** Sous Windows, vous n'aurez pas ce problème, parce que Windows n'a pas du tout le même système de gestion de permissions que Linux.
> Faites super attention du coup : chaque image Docker que vous créez **doit** être testée sous Linux, sauf si vous êtes 100% certain(e) qu'elle ne sera utilisée que sous Windows.
> Sans cette astuce, vos images fonctionneront sous Windows mais pas sous Linux.
> 
> Notez aussi que cette solution va devoir être réutilisée pour **chaque** image qui **manipule votre système de fichier**. Les images qui ne changent pas vos fichiers n'auront pas besoin de ça.

### Gosu

J'utilise [tianon/gosu](https://github.com/tianon/gosu) pour régler ce souci, il utilise des fonctions comme setuid, setgid, etc., dans le but de "simuler" l'utilisateur Unix en se basant sur un autr utilisateur (celui qui exécute le container, dans notre cas).

Voilà ce que j'ajoute au Dockerfile:

```dockerfile
# ...
ENV GOSU_VERSION=1.12

# ... the previously created "RUN" Docker statement
    && `# User management for entrypoint` \
    && curl -L -s -o /bin/gosu https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-$(dpkg --print-architecture | awk -F- '{ print $NF }') \
    && chmod +x /bin/gosu \
    && groupadd _www \
    && adduser --home=/home --shell=/bin/bash --ingroup=_www --disabled-password --quiet --gecos "" --force-badname _www \
    \
```

Résumé de ces 4 lignes de commande :

* On télécharge Gosu en fonction de la version qu'on a mise dans la variable d'environnement plus haut.
* On rend l'exécutable téléchargé, bah... exécutable.
* On crée un groupe `_www`
* On crée un utilisateur `_www` dans le groupe éponyme, sans mot de passe

C'est pas fini, mais c'est la base pour des permissions plus simples

La suite...

### L'entrypoint

Si vous connaissez quelques trucs "avancés" à propos de Docker, vous savez probablement qu'une image Docker a 2 paramètres pour s'exécuter : l'entrypoint, et la commande.

* La commande correspond à un exécutable que vous allez lancer, comme `php -S 127.0.0.1:8080`. C'est la commande exécutée par le container. Ce n'est pas obligatoire et on peut le surcharger facilement, notamment quand vous voulez ouvrir un shell dans le container. Cela veut dire qu'on peut remplacer la commande par `bash` pour ouvrir un [Bourne again shell](https://en.wikipedia.org/wiki/Bourne_again_shell) dans le container, comme si on faisait un `ssh` sur une machine virtuelle.
* L'entrypoint, cependant, est un script qui va être utilisé à chaque fois que le container doit lancer un exécutable. Par défaut, c'est `/bin/sh -c`, et il peut être utilisé pour **n'importe quelle commande** utilisée dans le container, disponible pour l'utilisateur. Cela dit, la plupart du temps, les devs le changent. Vous allez vitre comprendre pourquoi.

Pour notre cas, il faut surcharger l'entrypoint, parce qu'il utilise l'utilisateur `root` par défaut, et ce n'est pas ce qu'on veut.

Ajoutons d'abord ces instructions au Dockerfile :

```dockerfile
COPY docker/php/bin/entrypoint.sh /bin/entrypoint

# ... the previously created "RUN" Docker statement
    && chmod a+x /bin/entrypoint
# ...


ENTRYPOINT ["/bin/entrypoint"]
```

Vous vous souvenez de la structure de dossier au début de l'article ?

L'entrypoint utilisera `gosu` pour exécuter toute commande en tant que l'utilisateur de la machine dans le container :

```bash
#!/bin/sh

# ./docker/php/bin/entrypoint.sh

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

Ouaip, on dirait un hack, je sais. J'aimerais vraiment qu'on puisse faire mieux avec juste une option ou une variable d'environnement, mais pour l'instant, il n'y a rien de tel, donc on n'a pas le choix.

Cependant, si vous faites tout ce qu'on a vu en installant `gosu`, créant l'utilisateur `_www`, personnalisant l'`ENTRYPOINT`, ajoutant `entrypoint.sh`, on est presque tranquilles pour les permissions utilisateur (presque).

Ouf !

## Nettoyer l'image

Les images Docker sont souvent TRÈS lourdes, c'est connu. L'image PHP la plus lourde que j'utilise fait 824 Mo, et j'ai installé des TAS de trucs dessus.<br>
Cependant, en constriusant ces images, avant que j'exécute les scripts que je vous donne, ça peut aller au-delà d'1Go. C'est relou.

C'est pour ça que je nettoie l'image à la fin et que je supprime tout ce que je peux et dont je n'ai pas besoin quand j'envoie cette image sur le Docker Hub :

```dockerfile
    && `# Clean apt cache and remove unused libs/packages to make image smaller` \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false -o APT::AutoRemove::SuggestsImportant=false $BUILD_LIBS \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/www/* /var/cache/*
```

Vous pouvez constater la présence de la variable `$BUILD_LIBS` : c'est celle que l'on a créée au début de l'instruction `RUN` qui stocke les dépendances système dont on n'a pas besoin une fois l'image créée. Après, faites attention à ça, c'est un peu tendu parfois : il faut toujours tester l'image complète avant d'être certain que le fait de supprimer des trucs ne pète pas complètement votre projet en dev !

## Et c'est pas fini !

Oui, je dis ça tout le temps, mais regardons le **fichier Dockerfile** que nous avons là :

```dockerfile
# ./Dockerfile
FROM php:7.4-fpm

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
    && `# Libs that need to be installed for some dependencies but that will be KEPT in the final image` \
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
    && `# Here come the PHP dependencies (see later in this post)` \
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

C'est déjà lourd !

## Dépendances PHP

Maintenant que vous avez votre Dockerfile PHP de base, vous avez besoin de dépendances.

Quand je parle de dépendances PHP, je parle majoritairement d'extensions : `gd`, `intl`, `apcu`, etc.

La plupart peuvent être installées de différentes manières (par exemple, `apcu` doit être installé via `pecl`).

C'est pour ça que j'ai rajouté cette ligne dans le Dockerfile : 

```
    && `# Here come the PHP dependencies (see later)` \  
```

Dans **votre** Dockerfile, vous allez ajouter des extensions PHP dont vous avez besoin ici.

**Par exemple**, voilà les instructions pour rajouter l'extension PHP `intl` :

* Ajoutez le package `libicu-dev` à `BUILD_LIBS`
* Ajoutez cette instruction dans vos dépendances PHP :<br>
  ```shell script
  && docker-php-ext-configure intl \
  && docker-php-ext-install intl \
  ```
* Voilà !

> **Note :** Les fonctions `docker-php-ext-configure` et `docker-php-ext-install` sont **spécifiques à l'image Docker PHP officielle**. Vous n'aurez pas ça sur Debian. C'est un outil qui facilite la configuration et l'installation d'extensions PHP, en les recompilant directement.

Voilà ce à quoi ça pourrait ressembler dans votre Dockerfile:

```dockerfile
# ...
    && `# Libs that are needed and  will be REMOVED in the final image` \
    && export BUILD_LIBS=" \
        `# php intl` libicu-dev \
    " \
# ...
    && docker-php-ext-configure intl \
    && docker-php-ext-install intl \
# ...
```

Remarquez le commentaire `#php intl` : c'est un rappel de pourquoi on a installé cette lib. C'est important si vous souhaitez garder une image claire et concise !

La plupart du temps, installer des extensions PHP est similaire à cet exemple.
 
**Quelques recommandations cependant:**

* La plupart des extensions ont besoin d'une lib système (comme `libicu-dev` pour l'extension PHP `intl`).
* Quelques extensions vont avoir besoin de la lib **à la compilation**. Cela veut dire que vous pouvez l'ajouter à `BUILD_DIR`, et le Dockerfile supprimera ladite lib à la fin de la création de l'image.<br>

  > **Note :** En faisant ça, faites bien attention à ne rien compiler **après** que l'image Docker soit nettoyée, sinon il vous manquera des libs et vous aurez des erreurs.
* D'autres extensions vont avoir besoin de libs **à l'exécution de votre code**. Par exemple, `gd` aura besoin de libs PNG ou Jpeg à l'exécution. Cela veut dire qu'il faut les rajouter à `PERSISTENT_LIBS`.<br>

  > **Note importante :** Mettez toujours vos libs dans `BUILD_LIBS` en premier, exécutez `php --version` et testez ensuite votre projet : si PHP vous renvoie des erreurs du style `PHP Warning:  PHP Startup: Unable to load dynamic library 'gd.so'`, cela signifie qu'une lib a besoin d'aller dans `PERSISTENT_LIBS`. En général, le message d'erreur indiquera quelle fonctionnalité pose problème. Par exemple, ça peut être `libjpeg-dev` pour `gd`. Testez chacune des libs une par une, pour être certain(e) de quelles libs sont nécessaires à l'exécution.

Une note de plus (ça fait un paquet de notes, je sais) : les dépendances requises peuvent clairement changer en fonction des versions de PHP et des systèmes d'exploitation. Il peut y avoir pas mal de différences entre Ubuntu, Debian ou Alpine, par exemple. Assurez-vous toujours de bien connaître votre OS utilisé avant de commencer à faire une image Docker avec.

## Utiliser votre image

Construisez votre image en exécutant `docker build . --tag=php74`, et si vous voulez l'utiliser, vous pouvez créer un container directement dans un shell comme ceci :

```
# Linux, Mac, Powershell
$ docker run -it --rm -v `pwd`:/srv php74 bash

# Windows CMD
> docker run -it --rm -v %cd%:/srv php74 bash
```

Voilà ! Vous pouvez l'utiliser pour vos projets, et ça vous fait un exécutable PHP :)

Notez le volume `-v ...:/srv` : c'est important en ouvrant un shell dans le container, puisque `/srv` sera le dossier de votre projet. 

Souvenez-vous que vous pouvez faire plein de choses avec votre image : analyse statique, Composer, etc., c'est très utile !

Bonus : sous Linux vous pouvez créer un alias dans votre `.bashrc` pour simplifier l'appel à l'image de base :

```bash
alias php-docker="docker run -it --rm -v `pwd`:/srv php74 php"
```

Et utilisez-le comme ceci ::

```bash
php-docker any_php_file.php
```

> **Note :**<br>
> Windows CMD ne gère pas les alias, mais vous pouvez créer un fichier `php-docker.bat` contenant ceci :
> ```cmd
@echo off
docker run -it --rm -v %cd%:/srv php74 php %*
```
> Faites en sorte que ce fichier soit accessible par la variable PATH. En général, je crée un dossier `%HOME%/bin` et je mets à jour le `PATH` manuellement dans la configuration de Windows.

## C'est tout (pour le moment)

Une fois que vous avez une image PHP de base, en général c'est assez limité en termes de flexibilité, donc il nous faudra pouvoir créer d'autres services.

Nous verrons ça dans l'article suivant !

PS : Voici un [example de gros Dockerfile pour PHP](https://github.com/StudioAgate/DockerPortalApp) que j'utilise pour un projet perso. Vous pouvez y voir toutes les pratiques dont j'ai parlé, et j'ai installé plein d'autres choses comme Blackfire, ImageMagick, phpstan ou php-cs-fixer.
