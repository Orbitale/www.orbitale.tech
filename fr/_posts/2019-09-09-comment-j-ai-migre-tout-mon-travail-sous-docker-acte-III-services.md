---
layout: post
title:  'Comment j''ai migré tout mon travail sous Docker Acte III : Services'
date:   2019-09-09 10:00:00 +0200
lang: fr
lang-ref: how-I-migrated-almost-all-my-work-to-docker-act-III-services
---

Cet article est le troisième d'une série de quatre articles sur la migration de quasiment tous mes projets sous Docker.

Si vous voulez lire les autres articles, vous pouvez vous référer à cet index :

* [Acte I: Genèse](/fr/2019/08/26/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-I-genese.html)
* [Acte II: PHP](/fr/2019/09/02/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-II-php.html)
* Acte III: Services (actuel)
* [Acte IV: Projet](/fr/2019/09/16/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-IV-compose)

## Résumé des épisodes précédents

Dans l'article précédent, j'ai donné des exemples sur la façon d'utiliser Docker pour PHP.

Ce troisième article a pour but d'expliquer comment migrer nos **services** vers Docker dans le but de se simplifier la vie.

## Un service ?

Les bases de données sont l'exemple le plus classique, mais c'est valable pour _n'importe_ quel type de service, que ce soit un service de mail, un système de cache, etc.

Habituellement, avec les configurations PHP, on commence à coder en installant un environnement "*AMP" (LAMP pour Linux, WAMP pour Windows, etc.). WAMP pour "Windows, Apache, Mysql et PHP".

Je ne vais pas rappeler pourquoi Apache n'est pas la meilleure solution, vous pouvez déjà en avoir un aperçu dans mon article [Apache et PHP-FPM sous Windows](/fr/2017/11/11/apache-et-php-fpm-sous-windows.html), mais aussi sur d'autres ressources sur le web.

Le problème avec ce _setup_, lorsque vous l'utilisez en natif, est que les trois services sont liés ensemble et si vous ne faites pas de PHP, vous vous en fichez, et vous voulez peut-être seulement un serveur MySQL. Avec NodeJS, vous n'avez peut-être même pas besoin d'Apache. Avec Ruby, vous avez bien sûr besoin de Ruby, et peut-être Passenger (qui est un serveur web connu des devs Ruby). Dans tous les cas, vous aurez peut-être besoin d'une base de données.

Et ce n'est pas seulement comme ça pour MySQL : un jour, vous pouvez avoir besoin file d'attente RabbitMQ, ou un serveur Mailcatcher pour vos e-mails de dev, ou un serveur Redis pour vos sessions ou du cache, eh bien, à un moment donné, vous devez installer tout un tas de trucs qui ont besoin de tout un tas de coonfiguration.<br>
Tout comme PHP.

Commençons par regarder l'installation de services **natifs** (natifs à Windows, Linux ou Mac, donc), puis nous verrons comment les _dockeriser_.

## MySQL

Allez, on va installer MySQL sur notre machine en [suivant la documentation officielle (en anglais)](https://dev.mysql.com/downloads/mysql/). (vous pouvez aussi installer [MariaDB](https://mariadb.org/download/), un clone de MySQL mais totalement Open Source et pas racheté par Oracle) 

Maintenant, comment on fait pour le compte `root` pour créer d'autres utilisateurs MySQL ?

Eh bien, ça dépend de votre système d'exploitation, de la façon dont il est installé, de sa version, et peut également dépendre du choix entre MySQL ou MariaDB, etc.

En bref, selon la plateforme, des fois ça se passe bien, des fois moins. Et si vous avez besoin de plusieurs versions de MySQL, bonjour le bazar.

Maintenant, laissez-moi vous montrer comment on peut lancer un serveur MySQL avec une seule commande avec Docker :

```
docker run --name=mysql -dit -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql:5.7
```

Cette commande démarre un serveur MySQL, expose le port `3306` (par défaut pour MySQL, mais vous pouvez mettre ce que vous voulez) et le mot de passe pour le compte `root` sera `root`.

Pour Pour l'instant, on peut difficilement faire plus simple.

Si vous souhaitez exécuter un shell MySQL à l'intérieur du conteneur :

```
$ docker exec -it mysql mysql -uroot -proot
# ...
mysql> -- Hey, je suis une requête SQL !
```

**Quelques bonus :**

* Vous pouvez le rendre **toujours disponible** en ajoutant l'option `--restart=always` (attention avec cette option cependant, si elle bug ou plante, vous devrez stopper et supprimer le conteneur et le recréer manuellement).
* Vous pouvez **conserver toutes les données** de celui-ci dans votre machine en ajoutant un volume monté sur le mysql `datadir` du conteneur : `--volume /votre/mysql/data:/var/lib/mysql` (personnalisez votre "data dir" pour MySQL si besoin), rendant les données persistantes même si vous supprimez le conteneur. Le premier chemin (`/votre/mysql/data`) est le chemin sur **votre machine**. Le deuxième chemin correspond à l'emplacement par défaut où MySQL stocke toutes vos données à l'intérieur du conteneur.
* Il existe aussi une solution pour conserver les données mais ne pas forcément les stocker définitivement sur votre machine en créant un volume Docker personnalisé. C'est un peu plus avancé, mais l'avantage est que vous pouvez facilement le supprimer avec `docker volume rm ...`. Sauf que le fait de le supprimer facilement est aussi un inconvénient, si vous n'avez pas trop l'habitude. Je ne donnerai pas plus de détails, comme dit, c'est peut-être un peu plus avancé, mais sachez simplement que c'est une autre possibilité.
* Vous pouvez démarrer **plusieurs autres serveurs mysql** avec la même version ou d'autres versions en changeant le port exposé et le nom du conteneur, comme `--name=other_mysql -p 13306:3306`.
* C'est une commande à une ligne: **faites-en un alias** comme vous l'avez fait avant avec PHP!

```
$ alias mysql_docker_install="docker run --name=mysql -dit -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql:5.7"
$ alias mysql_docker="docker exec -it mysql mysql -uroot -proot"
```

Je m'en sers même dans [mes dotfiles](https://github.com/Pierstoval/dotfiles/blob/master/bin/mysqldocker).

## PostgreSQL

Si on peut le faire avec MySQL, on peut le faire avec PostgreSQL !

```
$ docker run --name=postgres -dit -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres
```

Et à l'usage :

```
$ docker exec -it postgres psql -Upostgres -W
Password: postgres
psql (11.5 (Debian 11.5-1.pgdg90+1))
Type "help" for help.

postgres=#
```

## Redis

Configurez-le :

```
$ docker run --name=redis -d redis
```

Et pour l'utiliser :

```
$ docker exec redis redis-cli set my_key any_value
OK
$ docker exec redis redis-cli get my_key
any_value
```

## Et autres...

Vous pouvez également utiliser mailcatcher, RabbitMQ, mongodb...

Presque tous les services que vous connaissez déjà peuvent être utilisés avec cette méthode.

## Quelques désavantages

* Vous devez vous souvenir de leur documentation, en particulier le port par défaut. Ceci dit, une fois que c'est installé, ou si vous avez déjà l'habitude, pas de problème à ce niveau.
* Vous devrez peut-être démarrer et arrêter les conteneurs manuellement. Donc il faudra se souvenir de régulièrement lancer `docker start mysql` ou autres. À moins d'utiliser `--restart=always` lors de la création du conteneur.
* Si vous avez plusieurs applications, vous devrez créer de nouveaux conteneurs, ou vous devrez utiliser le même conteneur, ce qui peut entrer en conflit (par exemple lorsque vous utilisez les mêmes clés dans Redis dans différentes applications).
* Les stockages persistants peuvent nécessiter plus de configuration (volumes, montages, délégation, etc., voir la documentation de Docker pour tout ça).

## Avantage de tous ces nouveaux conteneurs

* Nous pouvons rapidement les démarrer et les arrêter avec `docker start postgres` ou` docker stop postgres`.
* Tant que nous ne touchons à rien sur le conteneur (recréer/supprimer/etc), les données qu'il contient seront conservées entre les démarrages et les arrêts. Même si vous ne montez pas un volume spécifique pour les données.
* Certains d'entre eux peuvent utiliser des stockages persistants et les mettre dans des fichiers (comme MySQL par exemple), et la plupart des documentations de ces images Docker expliquent quel est le répertoire que vous devez monter en tant que volume Docker afin de stocker les données sur votre machine pour qu'elles soient conservées. Vous pouvez également utiliser les volumes Docker sans les partager sur votre machine (Docker l'enregistrera ailleurs quand même).
* Ces conteneurs peuvent être utilisés par n'importe quelle application, et tout ce que vous avez à faire est de configurer l'ip `127.0.0.1` dans vos applis et d'utiliser un port que vous avez exposé manuellement. Veillez à ne pas exposer deux fois le même port pour éviter les conflits (Docker ne le permet pas de toute façon). La plupart des services exposeront leurs ports par défaut afin que vous puissiez déjà utiliser un standard (3306 pour MySQL, 5432 pour PostgreSQL, 6379 pour Redis, etc.).
* Il peut être "aliasé" et utilisé comme point de départ lorsque vous avez une toute nouvelle machine et que vous ne voulez pas tout configurer dessus (vous installez Docker et tout le reste n'est que "download & run", pas de config additionnelle).
* Vous pouvez utiliser la même version que celle que vous utilisez sur votre serveur de production, ce qui est quand même vachement utile pour les applications _legacy_.
* Vous pouvez créer autant de conteneurs que vous le souhaitez avec les noms que vous souhaitez pour plusieurs applications sur votre machine. Il est un peu plus compliqué d'installer plusieurs serveurs MySQL ou PostgreSQL sur une même machine, par exemple...

## C'est tout (pour le moment)

Pour moi, les inconvénients ci-dessus ne sont pas _complètement_ problématiques. Certains d'entre eux peuvent être corrigés avec Docker Compose, et c'est justement le sujet du prochain article dans lequel je montrerai quelques exemples de projets entièrement "dockerisés", à l'aide de Docker Compose.
