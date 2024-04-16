---
layout: post
title:  "L'aventure du legacy (partie 1 : migration progressive)"
date:   2024-04-16 15:06:31 +0200
lang: fr
lang-ref: the-legacy-journey-part-1-progressive-migration
---

Votre legacy est pourri ? Vous en avez marre que vos devs passent des semaines à corriger un bug ?

« On voulait juste rajouter une action supplémentaire en cliquant ici ! Ça ne peut pas être si compliquée quand même !? »

Ne vous inquiétez pas, c'est pareil pour tout le monde.

Depuis des années, j'ai participé à des tonnes de refontes/réécritures, ou migrations progressives.

J'ai appris plein de choses, surtout ce qu'il ne faut pas faire !

Mon dernier projet de "migration progressive" était simple : une appli avec 2 frames dans la page web : l'une avec un backoffice en PHP from scratch, et l'autre avec une appli de cartographie faite en Java.

À la base il fallait "juste" réécrire la partie en Java, et l'intégrer au backoffice.

Après un bon mois de R&D sur le projet, je constate que cette intégration de la nouvelle appli de cartographie (qu'on avait commencée avec LeafletJS mais qu'on a refaite ensuite avec OpenLayers, bien plus adapté) est super simple, vraiment. Quelques bidouilles à faire dans le legacy, mais dans l'ensemble super facile.

Au point où c'est encore plus facile d'intégrer le legacy PHP de façon "conditionnelle".

Grâce à la puissance du développement frontend orienté "composants" (merci Svelte pour ça 🚀, beaucoup plus pratique que Vue ou React dans notre cas de par l'absence de Virtual DOM), il m'a fallu moins d'une semaine pour développer une architecture qui permettait de facilement redévelopper tous les anciens écrans en PHP avec de nouveaux composants en Svelte/Typescript.

Autre gros avantage : on a eu le champ libre sur la création d'une nouvelle portion de l'infra de la BDD pour les futures nouvelles features (et la future migration de BDD, beaucoup plus complexe), et on pouvait avoir une API (merci API Platform 🎆).

Résultat : en 6 mois, *tout* était prêt.<br>
Les usagers pouvaient utiliser le legacy sans problème comme avant (on n'avait quasiment rien changé 👌), mais il était devenu facile de réécrire certains écrans, ce qu'on a fait notamment pour la connexion/déconnexion, et le changement de contexte de travail / agence dans la même appli.

Qu'est-ce qui a été bien fait ici ?

Simple : on a pris le temps. Il n'y a que ça qui soit valable.

Des exemples tous bêtes de ce qu'on a pu faire :

* Demander directement aux usagers : c'est bête mais c'est le plus simple, même si c'est long. On a demandé à plusieurs personnes ce qu'elles faisaient au quotidien, les outils de la carte qu'elle utilisait le plus, etc.
* Rajouter un outil de log sur la prod pour savoir quels pages/fichiers PHP de l'appli legacy étaient les plus utilisés (et donc les plus critiques), moins d'1h de taff, et ça nous a permis de trouver précisément les axes de priorité sur la refonte partielle.
* Mettre à jour la stack, quelques jours à peine pour être sûr
* Tenter de tester automatiquement le legacy (super dur, mais grosse valeur en sortie !)

Les choses qu'on n'a pas faites ?

* Changer le schéma actuel de la BDD. Très mauvaise idée ! Une appli qui a plus de 15 ans contiendra forcément des erreurs d'architecture, souvent une absence de contraintes de clés étrangères, et même parfois des procédures stockées que vous ne verrez probablement pas au premier coup d'œil !
* Forcer la réécriture. Ça ne sert à rien et ça complexifie le travail.
* Utiliser l'ORM Doctrine pour les requêtes SQL sur les anciennes tables. Il ne faut jamais faire un copier/coller du schéma de BDD pour le transformer en objets ! Une commande mal placée pourrait risquer de rajouter des milliers d'index, ou de changer la définition de certaines tables ! Et dans notre cas, certaines tables contenaient des dizaines de millions de lignes, donc hors de question de tout stopper !
* Pour des questions de temps, on n'a pas anonymisé la BDD de prod et de staging. C'est quelque chose qui me tient à cœur (pour éviter les leaks, mais aussi pour la conformité RGPD…), mais nous n'avions que 6 mois. Avec un peu de temps supplémentarie, on aurait pu !

Et du coup, c'est une réussite 🎉

Parce qu'on a pris le temps, parce qu'on y a réfléchi.

Le prochain article parlera de la réécriture/refonte.
