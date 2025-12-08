---
layout: post
title:  'Comment j''ai migré tout mon travail sous Docker Acte II : PHP'
date:   2019-09-02 10:00:00 +2
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

Il existe beaucoup d'alternatives au serveur natif (j'en ai moi-même développé une nommée [Rymfony](https://github.com/Orbitale/Rymfony), solution incomplète mais fonctionnelle et basée sur [Caddy](https://caddyserver.com/)), cela dit, pour des projets plus avancés, ou lorsque l'on gère plusieurs projets, chacun peut avoir besoin de sa propre configuration, et d'un serveur web différent, même en dev.

Cependant, sans Docker, il faut quand même avoir installé PHP sur sa machine.

> **Note:** Si vous n'utilisez pas du tout PHP, imaginez le même genre de workflow pour votre langage favori, que ce soit Ruby, Python, Javascript, ou d'autres. Au final, ces langages ont tous des dépendances et la possibilité de faire du web avec, donc le résultat devrait être très similaire.

Dockeriser PHP nécessite de créer sa propre image, au point où je vais dédier cet article sur la _dockerisation_ de mes projets uniquement à PHP, et qu'il faudra d'autres articles pour les autres outils (voir les autres articles).

## PHP : comment ça marche ?

> Q: C'est quoi PHP ?<br>
> A: C'est un langage interprété (pour faire court).<br>
> Q: Comment on le lance ?<br>
> A: Compilez PHP ou téléchargez une version compilée pour votre système, et (... blablabla)

Le "mode d'exécution" de PHP s'appelle un SAPI (Server API).

PHP est généralement exécuté de deux manières différentes : en ligne de commande, ou avec un serveur web.

> **Note :** En réalité, il existe plein d'autres manières d'utiliser PHP. D'après [la liste non-exhaustive des SAPIs dans la documentation PHP](https://www.php.net/manual/fr/function.php-sapi-name.php), il y a au moins 23 différents SAPIs.
> Les plus communs étant probablement `cli`, `fpm-fcgi`, `apache` et `cli-server`, qui correspondent justement à la ligne de commande et à des SAPIs orientés web.

Pour chaque solution, il y a une [image Docker officielle pour PHP](https://hub.docker.com/_/php) que vous pouvez utiliser.

Les plus communes étant donc `php:8.1-fpm` pour le web, et `php:8.1-cli` pour seulement la ligne de commande.

> **Note :** Si j'écris PHP 8.1 aujourd'hui, dites-vous bien que si vous lisez cet article bien plus loin dans le temps, vous devrez prendre la dernière version que vous trouverez sur le Docker Hub, et pas juste ce que je vous dis aujourd'hui.

Vous pouvez voir [tous les tags](https://hub.docker.com/_/php?tab=tags) si vous voulez d'autres versions. Il y a même de vieilles versions comme PHP 5.4 ou 5.3 pour vos projets legacy !

Ces images sont basées sur Debian et sont plutôt pratique. D'autres préfèrent Alpine, mais ce n'est pas mon cas : ok, c'est plus léger, mais ce n'est pas le même compilateur C, et l'installation des libs natives n'est pas du tout aussi intuitives. Et puis si vous n'utilisez pas Docker en prod, vous n'utiliserez probablement pas Alpine non plus, donc autant utiliser le même OS que la prod (Debian, la plupart du temps, donc).

D'autres tags (comme `*-apache` ou `*-stretch`) peuvent être utilisés si vous avez besoin de PHP avec d'autres versions de l'OS ou en utilisant l'extension Apache.

Cependant, **je n'utilise plus les images officielles** depuis quelques années.
En effet, l'installation d'extensions n'est pas très intuitive, et si vous utilisez Docker essentiellement pour le dev, et que vos projets sont hébergés sur un système non-dockerisé (comme, pour ma part, un serveur dédié), l'image PHP officielle est peut-être trop différente de votre façon de travailler en production.

Du coup, j'installe PHP moi-même à partir d'une image `debian`.

Et ensuite, je rajoute tout ce dont j'ai besoin.

## N'allez pas _utiliser_ PHP ! Configurez-le !

Quand on utilise Docker pour nos langages de programmation, il est toujours mieux d'utiliser un Dockerfile, pour **construire votre propre image avec votre propre configuration PHP dedans**.

PHP n'est pas pratique s'il est "global" sur votre machine, surtout avec plusieurs projets. Et même avec un seul projet, au final.

> La raison pour laquelle avoir PHP globalement installé n'est pas pratique est que les extensions dont vous aurez besoin changeront peut-être, la version aussi, la configuration de `php.ini` aura peut-être besoin d'être différente également.<br>
> L'intérêt de _dockeriser_ PHP pour chaque projet peut paraître limité, voire redondant, mais en réalité, vous ferez souvent du copier-coller de vos `Dockerfile` habituels, pour finir par modifier des petits bouts de config, pour s'adapter à votre projet.

Si vous voulez toujours que "votre" version de PHP soit "globale", vous pouvez créer un projet "PHP Docker base" pour y stocker la config de base, que vous pourrez réutiliser, mais faites-moi confiance, c'est plus simple de refaire toute la config pour chacun de vos projets, parce que vous finirez invariablement par avoir des "spécificités" dans chacune de vos images. C'est vous qui voyez.<br>
Je considère chaque langage de programmation, dont PHP, comme un pré-requis **par projet**.

## Structure et Dockerfile

Je démarre quasiment tous mes projets avec une structure comme celle-ci en générale :

```
# Structure de dossiers :
MonProjet/
│       ⮮ Là où on stocke toute la config pour les images Docker du projet
├─── docker/
│    │
│    └─── php/
│         │     ⮮ Un dossier "bin" pour les exécutables de l'image Docker
│         ├─── bin/
│         │    └─── entrypoint.sh
│         └─── etc/
│              │     ⮮ Chaque projet ayant sa propre config PHP, on la place ici
│              └─── php.ini
│
│    ⮮ Et un fichier "Dockerfile" correspondant au langage du projet, ici PHP
└─── Dockerfile
```

```dockerfile
# ./Dockerfile
FROM debian:10-slim

## Pas obligatoire, mais pratique de l'utiliser comme une convention
WORKDIR /srv

## En le nommant "99-...", on est sûrs que le fichier de config du projet est le
## dernier à être chargé, ce qui nous permet de surcharger n'importe quelle 
## configuration de PHP.
COPY docker/php/etc/php.ini /etc/php/${PHP_VERSION}/fpm/conf.d/99-custom.ini

## L'entrypoint sera utilisé par la commande "ENTRYPOINT" du Dockerfile
COPY docker/php/bin/entrypoint.sh /bin/entrypoint

## Permet d'éviter certaines erreurs d'affichage lors de l'installation
ARG DEBIAN_FRONTEND=noninteractive

## On spécifie la version de PHP ici.
## Notez que d'autres variables d'environnement seront rajoutées plus tard !
ENV \
    PHP_VERSION=8.1
```

```ini
; docker/php/etc/php.ini
; Une config que je réutilise un peu partout, assez pratique.
; À vous de l'adapter à vos besoins en fonction de chacun de vos projets !
; Idéalement, ça doit être la même config qu'en prod, sauf pour les erreurs
; (Note : affichez TOUJOURS les erreurs en dev).

date.timezone = Europe/Paris
max_execution_time = 180
memory_limit = 1024M
post_max_size = 100M
upload_max_filesize = 100M

allow_url_include = off
assert.active = off
phar.readonly = off
precision = 17
realpath_cache_size = 5M
realpath_cache_ttl = 3600
serialize_precision = -1
session.use_strict_mode = On
short_open_tag = off
zend.detect_unicode = Off

[assert]
zend_assertions = 1
assert.exception = 1

; Pour voir tous les paramètres de configuration d'APCU, consultez ce lien :
; https://www.php.net/manual/fr/apcu.configuration.php
[apcu]
apc.enable_cli = 1
apc.enabled = 1
apc.shm_size = 128M
apc.ttl = 7200

[errors]
display_errors = On
display_startup_errors = off
error_reporting = E_ALL

; Pour voir tous les paramètres de configuration d'OPcache, consultez ce lien :
; https://www.php.net/manual/fr/opcache.configuration.php
[opcache]
opcache.enable = 1
opcache.enable_cli = 1
opcache.max_accelerated_files = 50000

; "develop" est un mode par défaut qui enjolive "var_dump()".
; Pour voir les autres valeurs possibles, consultez ce lien :
; https://xdebug.org/docs/all_settings#mode
[xdebug]
xdebug.mode = develop
```

Dans le prochain article, je parlerai plus en détails : base de données, cache, mail...

Ça, c'est notre configuration **de base**.

## Dépendances de base non-PHP

Comme c'est basé sur Debian, on va **mettre à jour toutes les dépendances du système** dès le départ, et préparer le terrain pour d'autres dépendances, dont certaines sont obligatoires!<br>
Pour ça, je rajoute ceci dans le Dockerfile :

```dockerfile
RUN set -xe \
    && apt-get update \
    && apt-get upgrade -y --no-install-recommends \
        ca-certificates \
        curl \
        wget \
        git \
        unzip \
    \
```

Résumons un peu tout ce gros fatras de code :

* On peut voir que tout ceci est en réalité **une seule instruction** `RUN`. Cela permet de limiter la quantité de _layers_ créés par Docker, rendant l'image finale plus légère.
* Vous pouvez voir que j'abuse un peu des `\` (pour les sauts de lignes) et des `#` (pour les commentaires), mais c'est important à mes yeux de **documenter votre Dockerfile**. J'ai vu tellement de Dockerfiles sans aucune explication sur le pourquoi du comment d'une dépendance ou d'un script exécuté que du coup je fais ça pour avoir un maximum d'infos. D'ailleurs, je vais même jusqu'à séparer l'installation de certains outils (vous verrez ça plus loin).
* Aussi, il y a une bonne raison pour laquelle je rajoute `curl`, `wget`, `git` et `unzip` par défaut : ça facilite grandement l'installation de certaines dépendances, et Composer s'en servira peut-être lui-même pour installer vos dépendances PHP plus tard, et c'est plus rapide. Elles ne sont cependant pas 100% obligatoires (certains packages que vous installerez les installeront peut-être de toute façon).

Et ça, c'est pour les dépendances _système_. Comme vous l'imaginez bien, on est à peine à la moitié de l'article, donc c'est pas fini.

## Installation de PHP

Pour installer PHP sur Debian, il y a plusieurs méthodes, mais nous voulons une **version précise** (comme spécifée par notre variable `PHP_VERSION` plus haut), et la version système disponible par défaut sur Debian n'est peut-être pas à notre convenance pour notre projet.

### Le repository "deb sury"

Nous allons utiliser le repository [deb.sury.org](https://deb.sury.org/) pour installer PHP, qui est l'un des contributeurs principaux pour fournir des packages PHP à l'écosystème Debian.

Nous allons rajouter ceci à notre instruction `RUN` :

```
# ...
RUN \
  # ... \
  && apt-get -y install apt-transport-https lsb-release ca-certificates curl \
  && curl -sSLo /usr/share/keyrings/deb.sury.org-php.gpg https://packages.sury.org/php/apt.gpg  \
  && (sh -c 'echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list') \
  && apt-get update \
```

> **Note :** Ces instructions ne sont pas choisies au hasard, elles viennent du README qui est présent sur la documentation d'installation du repository deb.sury.org.
> Vous pouvez d'ailleurs le retrouver ici : [https://packages.sury.org/php/README.txt](https://packages.sury.org/php/README.txt)

### Enfin ! On installe PHP !

Le repository maintenant installé, in faut installer PHP.

Nous allons le faire uniquement avec `apt-get`, puisque le repository nous fournit une façon simple d'installer PHP : `php-VERSION_DE_PHP` (d'où notre variable d'environnement créée au départ).

Voici les commandes que nous rajoutons à l'instruction `RUN` :


```
# ...
RUN \
  # ... \
  && `# PHP` \
  && apt-get install -y \
      php${PHP_VERSION} \
      php${PHP_VERSION}-cli \
      php${PHP_VERSION}-common \
      php${PHP_VERSION}-fpm \
```

Nous aurons là par défaut PHP en ligne de commande ainsi que PHP-FPM !

Il faut donc passer à la suite.

### Installer des extensions PHP

Et là, c'est la même chose que précédemment : la façon d'installer est la même, mais il suffit de changer le suffixe à notre `php${PHP_VERSION}-...` et le remplacer par le nom de l'extension !

Quasiment toutes les extensions peuvent être installées de cette manière.

> Vous aurez peut-être parfois des différences d'installation pour certaines extensions comme APCu ou XDebug, mais ce sont à ma connaissance les seules extensions natives impactées, et l'installation se fera avec l'outil `pecl`, un gestionnaire d'extensions natif de PHP.<br>
> Blackfire ou d'autres extensions comme Swoole ont leur propre méthode d'installation, et je vous renvoie vers leur documentation respective.

Voici un **exemple** de liste d'extensions que vous pouvez rajouter à votre Dockerfile :

```dockerfile
# ...
RUN \
  # ... \
  && `# PHP` \
  && apt-get install -y \
      php${PHP_VERSION} \
      php${PHP_VERSION}-cli \
      php${PHP_VERSION}-common \
      php${PHP_VERSION}-fpm \
      \
      `# PHP extensions` \
      php${PHP_VERSION}-apcu \
      php${PHP_VERSION}-curl \
      php${PHP_VERSION}-gd \
      php${PHP_VERSION}-intl \
      php${PHP_VERSION}-json \
      php${PHP_VERSION}-mbstring \
      php${PHP_VERSION}-mysql \
      php${PHP_VERSION}-opcache \
      php${PHP_VERSION}-readline \
      php${PHP_VERSION}-xdebug \
      php${PHP_VERSION}-xml \
      php${PHP_VERSION}-zip \
```

C'est un **exemple**, vous n'aurez **pas besoin** de tout cela sur tous vos projets.<br>
Installez seulement les dépendances dont vous avez réellement besoin.

## Permissions utilisateurs

Docker a une façon bizarre de gérer ses permissions utilisateur : par défaut, c'est `root` partout.

Le problème avec ça, c'est que les permissions `root` vont se propager à votre système de fichier à vous, en plus de l'image Docker. Du coup, tout fichier créé dans un dossier qui est partagé entre votre container Docker et votre machine "hôte" va appartenir à `root`, et c'est pas cool.

C'est pour ça qu'il nous faut une solution pour être sûr que l'utilisateur dans le container sera le même que celui qui _exécute_ le container (le même que l'utilisateur de votre machine).

> **Note :** Sous Windows, vous n'aurez pas ce problème, parce que Windows n'a pas du tout le même système de gestion de permissions que Linux.<br>
> Par conséquent, vous devez faire attention : chaque image Docker que vous créez **doit** être testée sous Linux, sauf si vous êtes 100% certain(e) qu'elle ne sera utilisée que sous Windows.<br>
> Sans cette astuce, vos images fonctionneront sous Windows mais pas sous Linux.
>
> Notez aussi que cette solution va devoir être réutilisée pour **chaque** image qui **manipule votre système de fichier**. Les images qui ne changent pas vos fichiers n'auront pas besoin de ça.

### Gosu

J'utilise [tianon/gosu](https://github.com/tianon/gosu) pour régler ce souci, il utilise des fonctions comme setuid, setgid, etc., dans le but de "simuler" l'utilisateur Unix en se basant sur un autr utilisateur (celui qui exécute le container, dans notre cas).

Voilà ce que j'ajoute au Dockerfile:

```dockerfile
# ...
ENV ... \
    GOSU_VERSION=1.14 # Rajoutez cette variable à la liste des autres déjà rajoutées précédemment au Dockerfile.

RUN \
    # ... \
    && `# User management for entrypoint` \
    && curl -L -s -o /bin/gosu https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-$(dpkg --print-architecture | awk -F- '{ print $NF }') \
    && chmod +x /bin/gosu \
    && groupadd _www \
    && adduser --home=/home --shell=/bin/bash --ingroup=_www --disabled-password --quiet --gecos "" --force-badname _www \
    \
```

Résumé de ces 4 lignes de commande :

* Avec `curl`, on télécharge Gosu en fonction de la version qu'on a mise dans la variable d'environnement plus haut.
* En utilisant `chmod`, on rend l'exécutable téléchargé, bah... exécutable.
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

sed -i "s/user = www-data/user = _www/g" /etc/php/${PHP_VERSION}/fpm/php-fpm.conf
sed -i "s/group = www-data/group = _www/g" /etc/php/${PHP_VERSION}/fpm/php-fpm.conf

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

## Installer Composer

Que serait l'écosystème PHP sans son gestionnaire de dépendances préféré ?


```dockerfile
RUN \
    # ... \
    && `# Composer` \
    && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && EXPECTED_COMPOSER_CHECKSUM="$(php -r 'copy("https://composer.github.io/installer.sig", "php://stdout");')" \
    && ACTUAL_COMPOSER_CHECKSUM="$(php -r \"echo hash_file('sha384', 'composer-setup.php');\")" \
    && if [ "$EXPECTED_COMPOSER_CHECKSUM" != "$ACTUAL_COMPOSER_CHECKSUM" ]; then (>&2 echo 'ERROR: Invalid installer checksum'); rm composer-setup.php; exit 1; fi \
    && php composer-setup.php \
    && rm composer-setup.php \
    && mv composer.phar /usr/local/bin/composer \
```

Comme précédemment pour d'autres cas, ce code n'est pas posé ici au hasard : il vient de la [documentation d'installation de Composer](https://getcomposer.org/download/).

## Nettoyer l'image

Les images Docker sont souvent TRÈS lourdes, c'est connu. L'image PHP la plus lourde que j'utilise fait 824 Mo, et j'ai installé des TAS de trucs dessus.<br>
Cependant, en construisant ces images, avant que j'exécute les scripts que je vous donne, ça peut aller au-delà d'1Go. C'est relou.

C'est pour ça que je nettoie l'image à la fin et que je supprime tout ce que je peux et dont je n'ai pas besoin quand j'envoie cette image sur le Docker Hub :

```dockerfile
    && `# Clean apt cache and remove unused libs/packages to make image smaller` \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false -o APT::AutoRemove::SuggestsImportant=false \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/www/* /var/cache/* /home/.composer/cache /root/.composer/cache
```

## Et c'est pas fini !

Oui, je dis ça tout le temps, mais regardons le **fichier Dockerfile** que nous avons là :

```dockerfile
# ./Dockerfile
FROM debian:10-slim

LABEL maintainer="pierstoval@gmail.com"

COPY docker/php/bin/entrypoint.sh /bin/entrypoint

ENTRYPOINT ["/bin/entrypoint"]

ARG DEBIAN_FRONTEND=noninteractive

ENV \
    PHP_VERSION=8.1 \
    GOSU_VERSION=1.14

COPY docker/php/etc/php.ini /etc/php/${PHP_VERSION}/fpm/conf.d/99-custom.ini

RUN set -xe \
    && apt-get update \
    && apt-get upgrade -y --no-install-recommends \
        ca-certificates \
        curl \
        wget \
        git \
        unzip \
    \
    \
    && `# Deb Sury PHP repository` \
    && apt-get -y install apt-transport-https lsb-release ca-certificates curl \
    && curl -sSLo /usr/share/keyrings/deb.sury.org-php.gpg https://packages.sury.org/php/apt.gpg  \
    && (sh -c 'echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list') \
    && apt-get update \
    \
    \
    && `# PHP` \
    && apt-get install -y --no-install-recommends \
        php${PHP_VERSION} \
        php${PHP_VERSION}-cli \
        php${PHP_VERSION}-common \
        php${PHP_VERSION}-fpm \
        \
    `# PHP extensions` \
        php${PHP_VERSION}-apcu \
        php${PHP_VERSION}-curl \
        php${PHP_VERSION}-gd \
        php${PHP_VERSION}-intl \
        php${PHP_VERSION}-mbstring \
        php${PHP_VERSION}-mysql \
        php${PHP_VERSION}-opcache \
        php${PHP_VERSION}-readline \
        php${PHP_VERSION}-xdebug \
        php${PHP_VERSION}-xml \
        php${PHP_VERSION}-zip \
    \
    \
    && `# User management for entrypoint` \
    && chmod a+x /bin/entrypoint \
    && curl -L -s -o /bin/gosu https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-$(dpkg --print-architecture | awk -F- '{ print $NF }') \
    && chmod +x /bin/gosu \
    && groupadd _www \
    && adduser --home=/home --shell=/bin/bash --ingroup=_www --disabled-password --quiet --gecos "" --force-badname _www \
    \
    \
    && `# Composer` \
    && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && EXPECTED_COMPOSER_CHECKSUM=$(php -r 'copy("https://composer.github.io/installer.sig", "php://stdout");') \
    && ACTUAL_COMPOSER_CHECKSUM=$(php -r "echo hash_file('sha384', 'composer-setup.php');") \
    && if [ "$EXPECTED_COMPOSER_CHECKSUM" != "$ACTUAL_COMPOSER_CHECKSUM" ]; then (>&2 echo 'ERROR: Invalid installer checksum'); rm composer-setup.php; exit 1; fi \
    && php composer-setup.php \
    && rm composer-setup.php \
    && mv composer.phar /usr/local/bin/composer \
    \
    \
    && `# Clean apt cache and remove unused libs/packages to make image smaller` \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false -o APT::AutoRemove::SuggestsImportant=false \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/www/* /var/cache/* /home/.composer/cache /root/.composer/cache
```

C'est déjà lourd !

## Utiliser votre image

Construisez votre image en exécutant `docker build . --tag=php81`, et si vous voulez l'utiliser, vous pouvez créer un container directement dans un shell comme ceci :

```
# Linux, Mac, Powershell
$ docker run -it --rm -v `pwd`:/srv php81 bash

# Windows CMD
> docker run -it --rm -v %cd%:/srv php81 bash
```

Voilà ! Vous pouvez l'utiliser pour vos projets, et ça vous fait un exécutable PHP 🙂.

Notez le volume `-v ...:/srv` : c'est important en ouvrant un shell dans le container, puisque `/srv` sera le dossier de votre projet.

Souvenez-vous que vous pouvez faire plein de choses avec votre image : analyse statique, Composer, etc., c'est très utile !

Bonus : sous Linux vous pouvez créer un alias dans votre `.bashrc` pour simplifier l'appel à l'image de base :

```bash
alias php-docker="docker run -it --rm -v `pwd`:/srv php81 php"
```

Et utilisez-le comme ceci ::

```bash
php-docker any_php_file.php
```

> **Note :**<br>
> Windows CMD ne gère pas les alias, mais vous pouvez créer un fichier `php-docker.bat` contenant ceci :
> ```cmd
@echo off
docker run -it --rm -v %cd%:/srv php81 php %*
```
> Faites en sorte que ce fichier soit accessible par la variable PATH. En général, je crée un dossier `%HOME%/bin` et je mets à jour le `PATH` manuellement dans la configuration de Windows.

## C'est tout (pour le moment)

Une fois que vous avez une image PHP de base, en général c'est assez limité en termes de flexibilité, donc il nous faudra pouvoir créer d'autres services.

Nous verrons ça dans l'article suivant !

PS : Voici un [example de gros Dockerfile pour PHP](https://github.com/StudioAgate/DockerPortalApp) que j'utilise pour un projet perso. Vous pouvez y voir toutes les pratiques dont j'ai parlé, et j'ai installé plein d'autres choses comme ImageMagick, phpstan ou php-cs-fixer.
