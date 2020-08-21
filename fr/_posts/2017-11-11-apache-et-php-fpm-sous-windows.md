---
layout: post
title:  'Apache et PHP-FPM sous Windows'
date:   2017-11-11 13:14:15 +0100
lang: fr
lang-ref: apache-and-php-fpm-in-windows
---

Dernière modification : 2020-08-21

Edit du 2020-08-21 : Je n'utilise plus cette configuration, mais je suis persuadé qu'elle fonctionne encore très bien. Je suis passé à Docker, qui est plus flexible, mais c'est aussi parce que je bosse sur beaucoup de projets, donc c'est plus simple à gérer.

--- 

Pas mal de gens cherchent sur le net comment installer PHP-FPM sous Windows.

Mais la première chose à savoir est la suivante : **`php-fpm` n'existe pas sous Windows**. Et beaucoup de gens abandonnent face à ça, à cause de la quantité ou complexité des solutions que l'on peut trouver.

Pour des raisons de cohérence, je ne parlerai pas de FPM sous Windows, mais plutôt de FastCGI.<br>
Parce que FPM signifie _FastCGI Process Manager_. C'est en réalité un _gestionnaire_ pour les processus FastCGI.

Faisons donc un premier rappel sur la façon dont nous gérons Apache et PHP sous Windows, ensuite on s'intéressera à FastCGI.

## Installer Apache et PHP sous Windows

Pour certaines personnes, le service Apache est fourni par WampServer, EasyPHP ou une autre configuration de type _*AMP_ (Apache, MySQL, PHP).

Personnellement, je n'aime pas ces config prédéfinies car leur mise à niveau est un bazar pas possible, et la plupart du temps la configuration n'est pas super performante, les outils dépendent les uns des autres, etc., malgré le fait que j'aie en effet utilisé ces outils au début de ma carrière.

Dans mon cas, j'utilise [Apache Lounge](https://www.apachelounge.com) qui est un serveur Apache autonome pour Windows.

Ensuite, je télécharge [PHP pour Windows](http://windows.php.net/download/) sur [windows.php.net](http://windows.php.net), je l'installe où j'en ai envie, et c'est fait.

⚡⚠ Attention: pour `mod_php`, vous avez besoin de la version **thread safe (`ts`)** de PHP.<br>
Lorsque nous installerons notre configuration FastCGI, vous devrez télécharger à nouveau PHP avec la version **non thread-safe (`nts`)**. <br>
Personnellement, j'ai les deux versions installées dans les répertoires `php-ts` et` php-nts` de mon ordinateur, au cas où.

Je télécharge également une version Windows de MariaDB et PostgreSQL pour mes projets, mais c'est un sujet à part.

Toute cette **configuration découplée** est **très flexible**, et c'est précisément ce dont nous avons besoin.

Ensuite, passons à la config.

Avant de parler de FastCGI, voyons ce que nous avons l'habitude de faire la plupart du temps.

## Configurer Apache et PHP avec `mod_php` : ce que tout le monde dit

Configurer PHP de base est assez simple. Ouvrez le fichier `{ApacheLounge}/conf/httpd.conf` :

```apacheconfig
# Charge le module PHP pour notre config.
LoadModule php7_module e:\dev\php71\php7apache2_4.dll

# Un fichier "php.ini" personnalisé, parce que c'est parfois très utile
# d'en avoir un différent de la ligne de commande, pour des optimisations, xdebug, etc.
PHPIniDir "e:/dev/php71/php-apache.ini"

# Et enfin la config par défaut d'Apache pour lui dire d'exécuter PHP
# sur les fichiers ".php" et autres comme ".phtml" (et oui, le legacy...)
<FilesMatch ".+\.ph(p[345]?|t|tml)$">
    SetHandler application/x-httpd-php
</FilesMatch>

# On interdit l'accès aux fichiers sources (legacy, encore une fois)
<FilesMatch ".+\.phps$">
    SetHandler application/x-httpd-php-source
    Require all denied
</FilesMatch>

# Et dans le doute on interdit l'accès spécifique à d'autres formats (facultatif)
<FilesMatch "^\.ph(p[345]?|t|tml|ps)$">
    Require all denied
</FilesMatch>
```

C'est tout pour PHP.

Ensuite, il faut configurer votre _virtual host_ pour pointer vers votre projet, et c'est fini :

```apacheconfig
<VirtualHost *:80>
    ServerName 127.0.0.1
    DocumentRoot e:/dev/www
    <Directory e:/dev/www>
        AllowOverride all
        Options Indexes FollowSymLinks MultiViews
        Require all granted
    </Directory>
</VirtualHost>
```

Mais.<br>
On se sert ici de `mod_php`.

## Pourquoi FastCGI ?

Il est assez connu depuis pas mal d'années que `mod_php` peut avoir de légers soucis au niveau RAM, CPU, concurrence. Quand il y a beaucoup de requêtes d'un coup, il peut y avoir des timeouts, etc.

De plus, l'utilisation de cette extension vous empêche d'installer plusieurs versions de PHP. Parce qu'avec `mod_php` vous ne pouvez avoir qu'une seule extension php chargée, et un seul gestionnaire de fichiers pour les mêmes modèles.

Avec FastCGI en général, vous pouvez configurer la communication entre Apache et PHP de différentes manières, et en particulier entre les _virtual hosts_. Donc, si vous avez votre application PHP 7.1 et votre vieille appli legacy en PHP 5.4 et que vous souhaitez conserver le tout sur une seule machine Windows, utiliser FastCGI devient obligatoire.

La seule solution pour avoir plusieurs versions de PHP avec Apache et mod_php est de commenter/décommenter les lignes de code concernant le chargement de l'extension `mod_php` dans votre `httpd.conf` chaque fois que vous changez de projet.

Et si plusieurs projets avec des versions de PHP différentes communiquaient ensembles avec des appels d'API ? Eh bien, vous l'avez dans l'os…

Passons donc à FastCGI.

## Configurer Apache avec FastCGI

Première chose à faire : configurer Apache. On s'occupera de PHP plus tard.

C'est encore plus simple avec `mod_php`, quelle chance !

**Vous pouvez supprimer toute la config de `mod_php` que nous avons ajoutée juste avant**. Nous la remplacerons par autre chose. C'était surtout un rappel, car c'est cool de savoir ce que nous faisons.

Ouvrez votre fichier `httpd.conf`, et après avoir supprimé tous ce qui conccerne `mod_php`, activez ces deux extensions :

```apacheconfig
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_fcgi_module modules/mod_proxy_fcgi.so
```

Le module `proxy` est là pour nous aider à utiliser Apache comme un proxy.

Rien d'extraordinaire ici. Pour le dire simplement, disons qu'Apache sera en quelque sorte capable de _déléguer_ des requêtes HTTP à un autre service via un _protocole_ (et ce service sera parfois appelé _gateway_).

Le module `proxy_fcgi` est juste ici pour ajouter le protocole `fcgi` au Proxy, afin que nous puissions communiquer avec une passerelle via ce protocole. Mais nous aurions pu utiliser d'autres protocoles pour d'autres besoins, comme `ftp`, `http` ou même `ws` (Web-sockets).

Lorsque le proxy FastCGI est activé, disons à Apache que nous voulons l'utiliser pour notre configuration PHP :

```apacheconfig
<Files ~ "\.php$">
    SetHandler "proxy:fcgi://127.0.0.1:9000#"
</Files>
```

Ok, la configuration PHP n'est pas encore prête, mais ce qu'elle fait, c'est que tout fichier correspondant à l'expression rationnelle `\.(php|phtml)$` "dira" à Apache de transmettre la requête via un `proxy`, qui utilisera le protocole `fcgi` pour envoyer la requête HTTP à `127.0.0.1`.

Le port `9000` est celui que nous utiliserons dans notre configuration PHP, surtout parce que c'est celui par défaut utilisé dans `php-fpm` dans les systèmes unix.

Et le `#` vient apparemment d'un bug dans les modules Apache qui n'enverraient pas le bon chemin au proxy, et ce problème est résolu en ajoutant ce caractère à la fin de l'url de la cible fastcgi. J'avoue que j'ai pas trop cherché plus loin…

C'est tout. Nous pouvons laisser la config Apache et passer à celle de PHP.

## Configurer le module PHP CGI

CGI est très vieux (1993) et très cool. C'est une interface pour les serveurs HTTP pour pouvoir exécuter un autre programme au lieu de simplement afficher la ressource (généralement du HTML ou des images) demandée par l'utilisateur.

En bref, il est là pour à _exécuter_ nos fichiers PHP au lieu de simplement _afficher le contenu_ du fichier PHP.

C'est un protocole qui est vraiment sympa lorsqu'il s'agit d'utiliser des langages interprétés comme PHP, Ruby, etc., car il nous permet d'utiliser simplement notre serveur Web sans savoir ce qu'il fait (donc pas besoin d'apprendre grand chose sur les serveurs web).

Juste un petit rappel : j'ai précisé dans la partie [Installer Apache et PHP sous Windows](#installer-apache-et-php-sous-windows) que ici vous **devez** avoir la version `nts` de PHP pour utiliser le protocole FastCGI. Assurez-vous que vous avez la bonne version de PHP quand vous arrivez à cette étape.

Sous Windows, PHP doit donc être éxécuté **en tant que service**. Mais dites-moi Doc, c'est quoi un gigowatt..., euh, c'est quoi un Service Windows ?

C'est un processus particulier qui s'exécute en gros « en arrière-plan » afin de traiter des tâches, des alertes, du monitoring, ou simplement faire fonctionner votre ordinateur.

Ils peuvent être comparés à ce que l'on trouve dans `/etc/init.d` dans les systèmes Unix. Mais c'est pas pareil. Parce que bon, vous savez, la différence entre les trucs UNIX et NT, etc., bref.

Pourquoi l'exécuter en tant que service ? Eh bien sans ça, vous devrez double-cliquer sur le script CGI et vous assurer que la fenêtre `cmd` n'est pas fermée, et le redémarrer sera ennuyeux, et ça utilise un terminal, etc., bref, c'est pas le pied.

Avoir un service c'est bien car on peut simplement le redémarrer dans le panneau "Services" si on en a besoin, et il peut être lancé automatiquement au démarrage de Windows. On peut aussi le faire via la commande `sc` dans votre terminal.

### Créer le service CGI

Pour créer un service, nous pourrions utiliser la commande `sc` sous Windows, mais je trouve très intéressant que nous puissions configurer un service sans nous torturer l'esprit.

J'utilise [NSSM](https://nssm.cc) pour gérer mes services persos.

Cet outil est super pratique, j'ai pu configurer PHP-CGI, Apache, MariaDB et Blackfire-Agent avec, et ça c'est le pied.

Vous pouvez donc le télécharger, exécuter `nssm install`, et une fenêtre contextuelle sympa apparaîtra.

Il y a pas mal d'options sympa :

![Options NSSM](/img/nssm_app.jpg)

Juste une explication sur les options :

* `php-cgi.exe` est le script que nous devons exécuter. `php.exe` est une interface de ligne de commande (CLI), pas une CGI.
* `-c E:\dev\php71\php-apache.ini` est utilisé pour spécifier notre fichier` php.ini`. Vous pouvez mettre le fichier `php.ini` que vous voulez.
* `-b 127.0.0.1:9000` est l'adresse IP et le port que PHP CGI écoutera. Nous avons besoin qu'il soit aussi fermé que possible, pour n'autoriser que les requêtes qui correspondent à `127.0.0.1`. Et comme indiqué lors de la configuration d'Apache, `9000` est le port par défaut pour la config unix de `php-fpm`, alors utilisons-la, c'est un genre de standard.

C'est tout !

Maintenant, votre projet devrait fonctionner.

## Plus de flexibilité : plusieurs versions de PHP avec Apache

C'est aussi quelque chose qui est souvent demandé, alors voyons comment nous pouvons gérer ça.

Premièrement, si vous avez plusieurs versions de PHP, vous **devez** créer plusieurs services `php-cgi`, c'est pourquoi `nssm` est vraiment sympa : c'est aussi simple que deux lignes de configuration. Créez simplement un nouveau service pointant vers votre autre version de PHP et changez le port en `9001`, `9002`, ou tout autre port qui n'entre pas en conflit avec un autre logiciel.

Ensuite, vous devrez **supprimer la configuration `SetHandler` de `httpd.conf`** et la mettre dans chacun de vos _vhosts_, comme ceci :

```apacheconfig
<VirtualHost *:80>
    # Notre appli PHP 7.1, utilisant le premier module CGI écoutant sur le port 9000
    ServerName php71-app.local
    DocumentRoot e:/dev/www/app1
    <Files ~ "\.(php|phtml)$">
        SetHandler "proxy:fcgi://127.0.0.1:9000#"
    </Files>
    <Directory e:/dev/www/app1>
        AllowOverride all
        Options Indexes FollowSymLinks MultiViews
        Require all granted
    </Directory>
</VirtualHost>

<VirtualHost *:80>
    # Notre appli PHP 5.4, utilisant le premier module CGI écoutant sur le port 9001
    ServerName php54-app.local
    DocumentRoot e:/dev/www/app2
    <Files ~ "\.(php|phtml)$">
        SetHandler "proxy:fcgi://127.0.0.1:9001#"
    </Files>
    <Directory e:/dev/www/app2>
        AllowOverride all
        Options Indexes FollowSymLinks MultiViews
        Require all granted
    </Directory>
</VirtualHost>
```

Voilà, vous pouvez maintenant profiter de plusieurs versions de PHP !

⚠️ Si vous utilisez Apache 2.4.25+, vous **devez** spécifier cette directive :

```apacheconfig
ProxyFCGIBackendType GENERIC
```

Uniquement nécessaire pour Apache 2.4.26 et les versions supérieures, car cette version a introduit un nouveau comportement dans le protocole FastCGI géré par le module `mod_proxy_fcgi`.<br>
Si vous ne spécifiez pas cette directive, vous rencontrerez probablement une erreur du style `No input file specified.`, car elle est liée à une erreur d'interprétation de la chaîne `proxy:fcgi://...` passée à PHP qui n'est pas interprétée correctement.

Ce comportement n'est pas nécessaire lors de l'utilisation d'Apache + php-fpm sous Linux/Mac, car nous pouvons utiliser sur un socket unix dans un fichier.
