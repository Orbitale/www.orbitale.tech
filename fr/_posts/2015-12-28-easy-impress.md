---
layout: post
title:  "EasyImpress"
date:   2015-12-28 18:48:24 +0200
lang: fr
lang-ref: easy-impress
---

EasyImpress est un outil en PHP développé avec le framework Symfony qui vous permet de réaliser de superbes présentations 3D en utilisant la puissante bibliothèque [Impress.js](https://github.com/bartaz/impress.js/).

La démonstration est réalisée avec [EasyImpressBundle](https://github.com/Orbitale/EasyImpressBundle), qui vous permet de bénéficier de tous les avantages d'Impress.js dans un seul fichier de configuration.

Avec un simple fichier [YAML](http://en.wikipedia.org/wiki/YAML), vous pouvez réaliser toutes vos slides.

{% highlight yaml %}
slides:
   first:
       data:
           x: 0
           y: 0
           z: 0 
   second:
       data:
           x: 500
           y: 500
           z: 500
{% endhighlight %}

Réalisez des transitions horizontales simples:

{% highlight yaml %}
config:
  increments:
      x:
          base: 0
          i: 100
{% endhighlight %}

Ou des présentations plus complexes!

* [Voir EasyImpressBundle sur Github](https://github.com/Orbitale/EasyImpressBundle), avec sa documentation.
* [Voir la démo ici](http://demo.orbitale.io/easy_impress/).
