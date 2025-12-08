---
layout: post
title:  'Comment j''ai migré tout mon travail sous Docker Acte IV : Compose'
date:   2019-09-16 10:00:00 +2
lang: fr
lang-ref: how-I-migrated-almost-all-my-work-to-docker-act-IV-compose
---

Cet article est le dernier d'une série de quatre articles sur la migration de quasiment tous mes projets sous Docker.

Si vous voulez lire les autres articles, vous pouvez vous référer à cet index :

* [Acte I: Genèse](/fr/2019/08/26/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-I-genese.html)
* [Acte II: PHP](/fr/2019/09/02/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-II-php.html)
* [Acte III: Services](/fr/2019/09/09/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-III-services.html)
* Acte IV: Projet (actuel)

## Résumé des épisodes précédents

Dans les articles précédents, nous avons vu comment utiliser Docker pour simplifier la création de services pour de nombreux sujets : PHP dans un premier temps, et d'autres services ensuite, comme MySQL, Redis, etc.

Ce dernier article portera sur les **projets**.

Pour aider à "dockeriser" un projet, voici notre sauveur : Docker Compose !

## Compose ? Genre, comme en musique ?

Compose, Composer, Symfony, Sonata… Les devs aiment-ils la musique ? Enfin bref, retour au sujet.

Docker Compose est un outil fourni avec Docker afin de créer des applications à plusieurs conteneurs, de les lier entre eux, et stocker la configuration de l'application dans un seul fichier : `docker-compose.yaml` (Ouais, je sais… Yaml…).

Comme indiqué dans le premier article de cette série, je pars du principe que vous connaissez les bases de Docker Compose.

## Composez un petit projet PHP

De quoi PHP a-t-il besoin pour créer un projet standard ? La plupart du temps : un serveur Web (nous utiliserons `nginx`), `php-fpm` (sinon, pas de PHP, bien sûr), et éventuellement une base de données (nous utiliserons `mariadb`).

Le meilleur exemple est un projet Symfony : si vous créez un projet basé sur le `symfony/website-skeleton`, Doctrine ORM sera installé, donc vous aurez besoin d'une base de données relationnelle (MySQL, MariaDB, PostgreSQL…).

Créons les services de base :

```yaml
version: '3'

services:
    php: # On va en rajouter ici

    database: # On va rajouter ici aussi

    http: # Et ici aussi
```

> **Note :** Souvenez-vous dans le [deuxième article](/fr/2019/09/02/comment-j-ai-migre-tout-mon-travail-sous-docker-acte-II-php.html) quand je parlais de permissions ?
> Rappelez-vous que **tout conteneur qui manipulera vos fichiers doit gérer correctement les permissions**. Par conséquent, pour tout service que vous créez et qui peut avoir un volume partagé avec votre machine, vous **devez** créer une image Docker de base et utiliser le hack proposé pour vous assurer que les permissions sont gérées correctement.
> Évidemment, vu que le hack que j'ai mis dans cet article utilise `php-fpm`, vous devez l'adapter au script que vous devez exécuter, que ce soit nodejs, mysql ou autre.

### PHP

Votre conteneur PHP aura besoin d'une image, et vu qu'il modifiera probablement vos fichiers (le cache notamment), vous aurez besoin d'une config supplémentaire et peut-être d'extensions.

Je ne vais pas montrer l'image Docker, vu que vous devriez l'avoir vue dans le deuxième article.

Voici un exemple de configuration de service PHP :

```yaml
services:
    php:
        build: ./docker/php # Le Dockerfile pour PHP doit être dans ce chemin "./docker/php/Dockerfile"
        working_dir: /srv   # Vu qu'on utilise déjà "/srv" dans l'image 
        volumes:
            - ./:/srv       # Nécessaire, pour que PHP utilise votre code :p
        links:
            - database      # Ce sera utile pour connecter PHP à votre base de données plus tard
```

On pourrait optimiser un peu, mais pour l'instant ça devrait suffire.

N'oubliez pas de créer les fichiers `docker/php/etc/php.ini` et` docker/php/bin/entrypoint.sh` et d'ajouter les instructions `COPY` pour ces fichiers dans votre `docker/php/Dockerfile`, comme dit dans le deuxième article de cette série.

### MariaDB

Un service de base de données est également assez simple à mettre en place:

```yaml
services:
    database:
        image: mariadb:10.4     # C'est une bonne pratique de noter au moins la version mineure
        volumes:
            - db_data_volume:/var/lib/mysql

volumes:
    db_data_volume: 
```

Ici on utilise une petite astuce vue dans l'article précédent : le volume `db_data_volume` est là pour s'assurer que les données sont persistantes. Si vous exécutez `docker-compose down` et supprimez le conteneur, les données seront quand même conservées.

Il y a une [bonne explication](https://stackoverflow.com/questions/39175194/docker-compose-persistent-data-mysql/39208187#39208187) sur StackOverflow donnant plus de détails sur ce sujet (n'oubliez pas de voter pour la réponse si vous pensez que c'est utile, l'auteur de la réponse vous en remerciera).<br>
Par exemple, les réponses disent que MySQL a des problèmes de permissions, contrairement à MariaDB. Bon point pour le fork Open Source de MySQL :)

### Nginx

Les choses se complexifient ici. Ne vous en faites pas, vous n'allez pas perdre vos cheveux ☺.

On va configurer un serveur `nginx`.

Cependant, un serveur a besoin d'un _virtual host_, on va donc le créer et l'injecter dans la config.

Étape 1 : créer un service :

```yaml
services:
    http:
        build: ./docker/nginx/
        working_dir: /srv/
        ports: 
            - '8080:80'         # Vous pouvez également n'utiliser aucun port et ne le remplacer que dans un "docker-compose.override.yaml" 
        links: 
            - 'php'             # Obligatoire, pour transmettre la requête à php-fpm
        volumes:
            - './:/srv/public'  # Obligatoire pour servir les fichiers statiques avant de rediriger vers php-fpm
```

Ceci dit, une config du style sera pareille pour tout serveur Web + proxy (comme php-fpm, Phusion Passenger ou autre).

Vous pouvez même aller plus loin pour des applications plus volumineuses en ajoutant un proxy inverse Traefik, HAProxy ou Varnish…

Étape 2 : créer le Dockerfile pour `nginx` :

```dockerfile
FROM nginx:alpine

COPY vhost.conf /etc/nginx/conf.d/default.conf
```

(ici, pas de problème pour utiliser Alpine, car il n'y a rien d'autre à installer)

Étape 3 : créer le vhost `nginx` (lisez les commentaires pour plus d'infos)

> **Note :** Ce vhost est optimisé pour une appli Symfony, mais vous pouvez l'adapter pour d'autres projets PHP.

```
server {
    listen 80;

    # C'est le dossier public de votre projet pour les fichiers statiques servis par nginx.
    root /srv/public/;

    # Essaye de servir le fichier s'il existe, sinon redirige vers la règle "@rewriteapp".
    location / {
        try_files $uri @rewriteapp;
    }

    # Réécrit tout vers "index.php". Ça va matcher la prochaine instruction "location"
    location @rewriteapp {
        rewrite ^(.*)$ /index.php/$1 last;
    }

    # Redirige tout vers le conteneur PHP
    location ~ ^/index\.php(/|$) {
        include fastcgi_params;

        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        # try_files réinitialise $fastcgi_path_info, voir http://trac.nginx.org/nginx/ticket/321, on utilise "if" à la place.
        fastcgi_param PATH_INFO $fastcgi_path_info if_not_empty;
        if (!-f $document_root$fastcgi_script_name) {
            # Vérifie si le script existe
            # Sans ça, "/foo.jpg/bar.php" serait passé à FPM, ce qui ne fonctionnerait pas parce qu'il n'est pas dans la liste des extensions de fichier autorisées. Mais cette vérification est utile au cas où.
            return 404;
        }

        # Le host devrait être le même que le nom du conteneur PHP,
        # et le port doit être celui de PHP-FPM dans le conteneur,
        # soit 9000 en général, vu que c'est le port par défaut de PHP-FPM.
        fastcgi_pass php:9000;
    }

    # Retourne une erreur 404 pour tout autre fichier PHP qui ne matche pas le front controller "index.php".
    # Ça permet d'éviter d'accéder à des fichiers PHP non désirés.
    location ~ \.php$ {
        return 404;
    }
}
```

Comme on peut le voir, la configuration de Nginx est un peu plus compliquée. C'est assez lourd, mais je pense qu'il vaut mieux couvrir tous les cas.<br>
N'oubliez pas de lire les commentaires dans la config pour mieux comprendre ce que tout ça veut dire.

Une fois fait, notre configuration est terminée !

## Et ensuite ?

Résumé :

On a créé plusieurs **services** Docker Compose, basés sur des **images Docker** (certaines de notre cru, d'autres déjà prédéfinies), qui vont créer des **conteneurs** pour lancer nos divers serveurs :

* Un service `php`, l'instance de `php-fpm`
* Un service `database` pour le serveur MariaDB
* Un service `http` pour un serveur Nginx, notamment pour les fichiers statiques dans le dossier `public/`

C'est à mes yeux le plus simple pour le moment pour un projet PHP.

Et maintenant ?

Eh bien on code !

Ou alors vous pouvez lire jusqu'à la fin 😉.

On peut désormais ajouter pas mal de choses :

* Un serveur `redis` pour stocker les sessions PHP ou du cache
* Un service `mailcatcher` pour debug les envois de mails
* Un service `rabbitmq` pour des files d'attente
* Un proxy `traefik` pour les requêtes HTTPS (c'est plus simple avec ce genre d'outil qu'avec Nginx)
* Un reverse proxy `varnish` pour le cache HTTP (oui, même en dev ça peut être utile !)
* Un agent `blackfire` pour faire du profiling
* Un service `nodejs` pour générer vos assets
* Etc.

## Bonus : Rendre tout ça encore plus simple avec un Makefile

J'adore les Makefiles. Et ça fonctionne même sous Windows ! (Eh oui, mais lisez jusqu'à la fin pour savoir comment)


Un `Makefile` est un fichier qui définit des **recettes** (_recipes_ en anglais, à prononcer "ré-ci-piz") pour le célèbre outil `make` (qui existe depuis 1977, au fait).<br>
On le place en général à la racine du projet.

Une recette contient en général trois éléments :

* Une **cible** (_target_), c'est le nom de la commande qui sera exécutée par `make`. Ce peut être le nom d'un fichier, ou un nom personnalisé.
* Une **recette** (_recipe_), c'est le code à exécuter avec le shell configuré par `make` (par défaut, `sh` ou `bash` selon votre système d'exploitation).
* Des **dépendances** facultatives (sur d'autres **cibles**)

Je ne vais pas en dire trop sur `make`, car c'est un outil très puissant et très personnalisable, et ce sera peut-être l'objet d'un autre article. 

### Un Makefile de base pour un projet PHP avec Docker Compose

```makefile

# Cette variable sera utilisée pour indiquer au Makefile où trouver l'exécutable de docker-compose.
# C'est très utile pour tout ce qui peut être exécuté par plusieurs recettes,
# comme lorsque vous devez exécuter PHP, MySQL, etc.
DOCKER_COMPOSE = docker-compose

##
## Project
## -------
##

.DEFAULT_GOAL := help
help: ## Show this help
	# Ne vous inquiétez pas vraiment du fonctionnement de cette commande,  
	# sachez simplement qu'elle est là pour afficher une jolie liste de 
	# toutes les cibles de ce Makefile.
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
.PHONY: help

build:
	-@$(DOCKER_COMPOSE) pull --parallel --quiet --ignore-pull-failures
	$(DOCKER_COMPOSE) build --pull
.PHONY: build

kill:
	$(DOCKER_COMPOSE) kill
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
.PHONY: kill

install: ## Install and start the project
install: build start
.PHONY: install

reset: ## Stop and start a fresh install of the project
reset: kill install
.PHONY: reset

start: ## Start the project
	$(DOCKER_COMPOSE) up -d --remove-orphans --no-recreate
.PHONY: start

stop: ## Stop the project
	$(DOCKER_COMPOSE) stop
.PHONY: stop
```

Quelques notes sur ce Makefile:

* Exécutez la commande `make help`, elle exécutera la cible `help` qui affiche une jolie liste de toutes les commandes `make` que vous pouvez exécuter sur ce projet.
* L'instruction `.PHONY:` indique à `make` de toujours exécuter cette cible, même si le fichier de la cible est à jour. Ceci est nécessaire pour les cibles qui _peuvent_ correspondre à un fichier. C'est inhérent au comportement de `make` : **si la cible est un nom de fichier**, `make` enregistrera sa dernière date de modification, et si elle est à jour, `make` n'exécutera pas la recette. C'est pourquoi j'utilise `.PHONY`, pour être sûr que` make` exécute toujours la recette, que la cible soit un fichier à jour ou non.
* Si vous préfixez une commande dans la recette avec `@`, elle n'affichera pas l'instruction de commande complète dans la sortie du terminal. Si vous ne le faites pas, `make` affiche l'instruction de commande complète dans le terminal lors de son exécution. Le préfixe `@` rendra alors la ligne de commande un peu plus claire et plus propre.
* Si vous ajoutez le caractère `-` à une commande dans la recette, elle exécutera toutes les commandes suivantes même si la commande a renvoyé un code de sortie différent de zéro (a.k.a "si elle a renvoyé une erreur").
* La raison pour laquelle nous avons deux cibles `install` ou `reset` est parce qu'il est plus pratique d'écrire le commentaire ET d'ajouter les dépendances à cette cible (car `install` dépend de `build` et `start` par exemple). Nous pourrions supprimer les deux commandes et ajouter le commentaire juste après les dépendances, cela fonctionnerait de la même manière, mais c'est beaucoup plus pratique comme ça, au moins pour la lisibilité à l'intérieur du Makefile lui-même.

### Note : utiliser `make` sous Windows

J'ai essayé plusieurs exécutables `make` déjà compilés sur Windows, mais le seul qui m'a satisfait (et aussi parce que c'est la **dernière** version de GNU Make) est celui fourni par le [Ruby Devkit](https://rubyinstaller.org/downloads/).

L'inconvénient est qu'il faut installer Ruby… Mais il est également livré avec des tonnes d'outils UNIX (awk, sed, grep, etc.), donc ça ne me dérange pas, c'est bon quand même 🤠.

## Conclusion

Docker n'est pas obligatoire, mais il présente de nombreux avantages.

Grâce à Docker Compose, je passe un peu plus de temps à configurer le projet, mais beaucoup moins à configurer toute ma machine.<br>
Et cette configuration sera partagée avec toutes les personnes travaillant sur le projet. C'est surtout ça qui est important.

Je pense que c'est cool :)

Et vous ? 😉

Merci d'avoir lu jusqu'ici !
