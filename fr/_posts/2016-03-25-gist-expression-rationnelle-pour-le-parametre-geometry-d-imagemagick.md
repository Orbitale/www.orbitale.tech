---
layout: post
title:  '[Gist] Expression rationnelle pour le paramètre "Geometry" d''ImageMagick'
date:   2016-03-25 10:12:43 +0200
lang: fr
lang-ref: gist-regular-expression-for-imagemagick-geometry
---

Il y a un moment, j'ai créé [ImageMagickPHP](https://github.com/Orbitale/ImageMagickPHP), une bibliothèque PHP qui vous permet de
créer des commandes ImageMagick similaires à ce que nous pouvons faire en ligne de commande avec
[convert](http://www.imagemagick.org/script/convert.php) ou [mogrify](http://www.imagemagick.org/script/mogrify.php)
par exemple.

La plupart des options d'ImageMagick sont utilisables, certaines sont manquantes mais il est assez simple de contribuer !<br>
Avec cette bibliothèque, vous créez un objet `Command`, vous pouvez ajouter des arguments options, des images, etc.<br>
Vous exécutez ensuite cette commande, et vous obtenez en retour un objet [CommandResponse](https://github.com/Orbitale/ImageMagickPHP/blob/main/src/CommandResponse.php "CommandResponse.php") que vous pouvez utiliser pour vérifier si la commande a échoué ou non.

Mais, la partie la plus difficile de cette bibliothèque concernait le traitement d'image. Si par exemple vous voulez
[redimensionner (option "resize")](http://www.imagemagick.org/script/command-line-options.php#resize) une image, vous devez passer un
paramètre de type ["Geometry"](http://www.imagemagick.org/script/command-line-processing.php#geometry), qui représente la "façon de redimensionner" l'image.

Voici un exemple :

```
$ convert my_image.jpg -resize 250x350 output.jpg
```

Cette commande va redimensionner l'image à hauteur de 250×350 pixels mais gardera les proportions et le ratio, donc si votre image est un carré de 1500×1500 pixels, elle sera redimensionnée à la valeur la plus basse du ratio, donc votre image sera de 250×250 _in fine_.

On peut faire beaucoup d'autres choses avec les arguments de type Geometry.

Vous pouvez par exemple [rogner](http://www.imagemagick.org/script/command-line-options.php#crop) une image.

Prenons un cas plus concret, avec cette image :<br>
![Logo Orbitale](/img/regex_image_to_crop.png)<br>
<br>
Nous allons la recadrer pour obtenir juste une partie au centre de l'image.
Pour rappel, sa taille est de 322×322px.

```
$ convert logo.png -crop 160x160+80+80 output.png
```

Voici le résultat:<br>
![output](/img/regex_image_cropped.png)<br>
<br>
La valeur de l'argument "Geometry" était celle-ci : **160×160+80+80**.

Les images sont analysées comme des bitmaps, donc si nous spécifions "coordonnées 0,0", cela correspond au coin supérieur gauche de l'image.

La première valeur est le décalage "vers le bas" et la seconde est le décalage "vers la droite".

Donc, avec la commande ci-dessus, nous voulons une image de **160×160** pixels de large et qui commence à 80px vers le bas et 80px vers la droite.

Voici ce qui a été recadré en réalité :<br>
![final](/img/regex_image_crop_zone.png)<br>
<br>
Le problème est que les arguments Geometry sont trèèèèèès complexes à analyser.

Si vous lisez la documentation de l'argument Geometry, vous avez peut-être remarqué qu'il est extrêmement flexible, et assez compréhensible. Pour un humain en tout cas. Toute la difficulté réside dans le fait de valider cette valeur du côté de la machine.

Par exemple, vous pouvez utiliser **200×250** (200 pixels de large, 250 pixels de haut), **200** (seulement la largeur), **×250** (seulement la hauteur), mais pas **200×** car cela renvoie une erreur.

Il y a d'autres cas d'usage, mais nous devons réfléchir très sérieusement lorsque nous voulons valider l'option Geometry dans la commande ImageMagick.

Comme il est possible de le voir dans la classe [GeometryTest](https://github.com/Orbitale/ImageMagickPHP/blob/main/Tests/References/GeometryTest.php)
, j'ai testé **tous** les cas de l'option Geometry et demandé à ImageMagick lesquels fonctionnent.

Certains cas d'erreur sont assez surprenants, d'autres sont évidents.

Mais la validation a été faite **à partir de ces tests**, donc le résultat du validateur est assez exhaustif.

Cette regex a été développée en premier, mais elle ne répondait pas efficacement à tous les besoins, donc tous les tests possibles ont été écrits et
puis regexp a été adaptée à ce que la commande ImageMagick renvoie réellement comme résultat.

* Tout d'abord, les nombres doivent être vérifiés, pour voir s'ils sont valides.
* En fait, les nombres sont limités à un seul modèle dans les commandes ImageMagick, donc je l'ai utilisé dans toutes les autres parties de la regex.
* Ensuite, nous devons vérifier la largeur et la hauteur, qui peuvent être présentes ou non, et qui peuvent être calculées en pourcentage OU en pixels.
* Ensuite, l'option "ratio hauteur/largeur", qui ne peut être présent que si la largeur et/ou la hauteur sont présentes.
* Après cela, l'`offset`, qui peut être présent même s'il n'y a ni largeur ni hauteur.

Grâce à l'excellent système derrière PCRE, j'ai pu ajouter des identifiants à chaque partie de l'expression rationnelle afin qu'un `preg_match` permette d'utiliser l'argument `$matches` pour récupérer toutes les informations de la valeur si on en a besoin.

Voici le résultat final de l'expression rationnelle, (attention, ça pique les yeux) :

```php
<?php

// Cette variable est le pattern de nombre qui sera réutilisé ailleurs
$number = "\d*(?:\.\d+)?"; 

// Première partie : la largeur, optionnelle
$width = "(?<w>(?:$number)?%?)?"; 

// Ensuite, la hauteur. Pareil que pour la largeur, mais commence par un "x"
$height = "(?:x(?<h>(?:$number)?%?))?"; 

// This is the geometry offset
$offset = "(?<x>[+-]$number)?(?<y>[+-]$number)?"; 

// Pour match soit largeur, soit hauteur, soit les deux
$size = "$width$height"; 

// Les différents filtres possibles: étirer, rétrécir, etc.
$aspect = "[!><@^]"; 

// Et enfin la regex complète
$regexp = "(?<size>$size)(?<aspect>$aspect)?(?<offset>$offset)"; 

echo $regexp;

/*

Devrait afficher ceci :
(oui, c'est sur plusieurs lignes pour la lisibilité,
mais à la base ça ne l'est pas)

(?<size>(?<w>(?:\d*(?:\.\d+)?)?%?)?(?:x(?<h>(?:\d*(?:\.\d+)?)?%?))?)
(?<aspect>[!><@^])?(?<offset>(?<x>[+-]\d*(?:\.\d+)?)?(?<y>[+-]\d*(?:\.\d+)?)?)

*/
```
