---
layout: post
title:  'Comment j''ai migré tout mon travail sous Docker Acte I : genèse'
date:   2019-08-26 10:00:00 +2
lang: fr
lang-ref: how-I-migrated-almost-all-my-work-to-docker-act-I-genesis
---

Cet article est le premier d'une série de quatre articles sur la migration de quasiment tous mes projets sous Docker.

Si vous voulez lire les autres articles, vous pouvez vous référer à cet index :

* Acte I: Genèse (actuel)
* [Acte II: PHP](/fr/2019/09/02/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-II-php.html)
* [Acte III: Services](/fr/2019/09/09/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-III-services.html)
* [Acte IV: Projet](/fr/2019/09/16/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-IV-compose)

## Il y a bien longtemps, dans un ordinateur fort fort lointain...

À titre personnel, j'arrive à comprendre certaines choses assez complexes, mais j'ai besoin de pratiquer parfois pendant un long moment. Par exemple, j'ai des notions de cartographie (vu que je bosse sur une appli qui en a besoin), mais il m'a fallu des années pour mieux comprendre les concepts mathématiques sous-jacents.  

Pour Docker, c'est un peu pareil.

Entre mon premier "[whalesay](https://docs.docker.com/get-started/)" et mon premier usage réel de Docker, il y a une période de 3 ans.

3 ans, pour être "confortable" avec le concept d'une "image-qui-est-comme-un-fichier-ISO-mais-pas-vraiment-un-ISO" et le concept d'un "conteneur-comme-une-machine-virtuelle-mais-pas-vraiment-une-machine-virtuelle".

Maintenant, je _dockerise_ quasiment tous mes projets.

> **Note :** je vais sciemment et audacieusement employer le néologisme "dockeriser" un peu partout dans cette série d'article, parce que je le trouve sympa, et qu'il représente en un seul mot la quasi totalité de ce dont parle cette série d'articles, profitez-en, et à bas les règles de l'Académie Française ☺.

## [How did it come to this?](https://open.spotify.com/track/0UMROwhQyAbWWLSnBH0e1L?si=gaj5R4H3TvWCWgIdngNZpQ) 

Comment en suis-je arrivé là ?

J'étais bloqué par mon environnement de travail.

J'étais (et je suis toujours, en réalité) un utilisateur de Windows pour coder, surtout parce que j'aime bien que ma machine fasse tout (y compris les jeux notamment). Même si pas mal de gens me disent que ce n'est pas optimisé, j'ai pu trouver pendant des années des solutions pour améliorer mon environnement de travail (l'utilisation de `cmd` avec quelques plugins, WSL quand nécessaire, utiliser [Apache & PHP sous Windows](/fr/blog/2017/11/11/apache-et-php-fpm-sous-windows.html) avec plusieurs v ersions de PHP, etc.).

C'est toujours pas totalement optimisé, parce que ça reste Windows, que `cmd` est loin d'être parfait, que le terminal n'est pas vraiment orienté UNIX, que NTFS est un système de fichier hyper lent, enfin bref, en tout cas moi je suis à l'aise et j'aime beaucoup.

Pendant un moment, j'étais ok avec la config Apache Lounge + `php-cgi`. Et même depuis le [binaire Symfony CLI](https://symfony.com/download) (qui a ses travers, notamment le fait de ne pas être open-source), ça se passe bien, un coup de `symfony serve`, et c'est cool.

J'ai même installé [NVM](https://github.com/coreybutler/nvm-windows) pour avoir plusieurs versions de Node.js.

Cependant, la réusabilité devient difficile dans certains cas :

* Utiliser différentes extensions PHP. Par exemple, `xdebug` n'est pas installé partout, mais ce n'est pas le plus gros problème (puisqu'au final je peux toujours rajouter `-dzend_extension=xdebug` en CLI). Les problèmes arrivent quand il faut des extensions spécifiques à un projet, et pas pour d'autres. Tester des fonctionnalités dépendant d'extensions PHP peut devenir un peu complexe (`intl`, `mbstring`, `gd`, etc.), et j'en avais un peu marre de désactiver/réactiver les extensions et redémarrer le serveur à chaque fois.
* Plusieurs versions de PHP c'est bien, mais à la longue, avoir 5 ou 6 versions peut alourdir la config, surtout quand il faut rajouter de vieilles versions comme 5.5 ou 5.6. Avec Docker, on s'en cogne : chaque projet a sa propre configuration.
* Redémarrer le serveur web ou `php-cgi` est assez lourd à la longue sous Windows. Même si je peux juste faire `nssm restart php7.1-cgi` ou `nssm restart apache`, c'est pas aussi direct que `make restart` sur un projet.
* BDD. La plupart de mes projets utilisent MySQL ou MariaDB, et ça oblige à avoir les deux sur la machine. Gestion des ports, mot de passe root pour créer les autres utilisateurs, à chaque fois, réinstaller ces outils est un calvaire, alors que je veux juste une fichue base de données. 
* Les composant externes : Redis, ElasticSearch, Blackfire (punaise, allez-y pour installer Blackfire our **toutes** vos versions de PHP…), RabbitMQ, MongoDB, et tout un tas d'autres outils nécessaires à la vie du projet. Sur certains projets j'ai été fainéant au poins de me dire "rien en dev, Redis en prod". Mauvaise idée. Redis en prod ? Bah redis en dev. Point barre. Et du coup, quelle version ? Arf, chaque projet peut avoir une version différente. Encore une fois, un seul environnement de travail c'est juste une mauvaise idée.

J'aurais pu trouver encore d'autres cas, mais au moins ceux-là permettent de comprendre que les "outils natifs" sont pratiques, mais à long terme deviennent compliqués à utiliser quand on bosse sur plusieurs projets.

## Mais... pourquoi ? Est-ce qu'on doit vraiment faire tout ça ?

Pourquoi est-ce qu'on "dockeriserait" tout ?

Je vais le dire de suite : il y a **des tas de bonnes raisons de ne pas dockeriser votre environnement de travail**.

Par exemple, sur ma machine j'ai toujours la dernière version de PHP d'installée, avec quelques extensions (apcu, mysql, pgsql, etc.), et je l'utilise conjointement avec Symfony CLI, comme ça je n'ai pas besoin d'un serveur web. Ça, c'est pour PHP.

Et j'installe aussi Node.js (ou NVM) et Ruby pour pouvoir mieux gérer les projets legacy, comme ce blog fait avec Jekyll, donc Ruby (même si je l'ai dockerisé, héhé). J'utilise aussi Node.js comme simple serveur web pour certains sites, notamment pour m'amuser avec [p5.js](https://p5js.org/) ou [TypeScript](https://www.typescriptlang.org/) de temps en temps. Tout cela est beaucoup plus rapide à mettre en place qu'une configuration Docker exhaustive.

Une autre bonne raison de ne pas utiliser Docker : des fois, certains trucs sont plus simples avec un simple `apt install ...`. Genre PHP, parce que c'est facile à faire. Et même pour PHP, il y a toujours [deb.sury.org](https://deb.sury.org/), un repository `apt` qui permet de récupérer les toutes dernières versions de PHP sur les versions actives du langage.

> **Note :** Le repo de Sury est bien pour les dernières versions, mais peut avoir un inconvénient : il ne fournit que les dernières versions, pas les vieilles (comme PHP 5 ou des versions spécifiques comme 7.2.3). Le choix de version est du coup assez limité.

Finalement, la meilleure raison c'est la difficulté : il faut en réalité _apprendre_ les concepts de Docker, comment il fonctionne, les _edge cases_ (networks, volumes...), et pire : il faut créer des images. Croyez-moi, construire "l'image" qui fonctionne vraiment bien prend du temps et de l'énergie, et j'ai déjà été bloqué plusieurs jours d'affilée juste parce que j'avais oublié d'installer une lib de dev ou parce que j'avais exécuté un script plutôt qu'un autre...<br>
Si vous avez des mentors qui peuvent vous aider à corriger vos problèmes avec Docker, ou si vous avez beaucoup de temps, Docker est une très bonne solution. Mais le temps c'est de l'argent, et votre patron n'en a peut-être rien à carrer et veut que vous puissiez shipper du code rapidement, même si c'est du mauvais code, donc il vaut mieux se contenter d'un truc "qui marche" (et franchement j'aime pas ça, mais je suis pas encore le patron, donc j'ai pas moyen de régler ce problème).

Docker est surtout là pour aider à architecturer des projets un peu plus gros, ou des projets legacy, avec beaucoup de dépendances et de services externes (email, message queue...), et pour les gens qui **y trouvent le meilleur compromis entre temps, connaissances, et temps d'apprentissage**.

## Dockerisez tout !

Dans mon prochain article, je vais montrer des exemples permettant de commencer gentiment la "dockerisation" de notre environnement de travail.

**Note importante :** Je ne vais **pas** vous faire une introduction aux concepts de Docker. Pour ça, il y a la doc officielle et sa section [Get started with Docker](https://docs.docker.com/get-started/), que j'ai relu plusieurs fois et qui a pas mal évolué pour une meilleure compréhension des concepts de base. J'y retourne d'ailleurs régulièrement quand j'oublie des paramètres de configuration ou autre.

Dans les prochains articles, je vais considérer que vous avez les bases pour construire des images Docker, et même utiliser Docker-Compose.

Ne vous inquiétez pas, je vais quand même être gentil et vulgariser au possible ! Je veux juste rendre ça clair et compréhensible, autant que possible.

On se voit au prochain article !
