---
layout: post
title:  'Histoire de pression'
date:   2021-03-22 17:48:21 +2
lang: fr
lang-ref: pressure-story
---

Je lisais récemment un super article de [@jesuisundev](https://twitter.com/jesuisundev) intitulé ["C'est la faute du développeur"](https://www.jesuisundev.com/la-faute-du-developpeur/).

Super article, vous devriez le lire, c'est vraiment cool.

Du coup, j'ai envie de raconter une petite anecdote corrélée.

## Le contexte

Je n'ai jamais tenu les deadlines.

J'ai toujours dit « Ok, mais je te le dis, ça ne sera pas prêt à temps », et tant pis pour le reste.
C'est douloureux, on a souvent beaucoup de pression, la direction est impitoyable, bref, c'est pas de la tarte du tout.

C'est aussi une bonne raison pour finir par démissionner.

Quand ça m'est arrivé, j'étais là depuis 3 mois, en CDD, et je devais assister un jeune dev sorti de BTS un an plus tôt qui avait passé l'année à réécrire un vieux projet legacy. Du vieux PHP avec des templates smarty sur 10 niveaux de sous-dossiers, aucune organisation, zéro documentation bien sûr, bref, la routine pour des devs PHP chevronnés qui arrivent sur un projet.

Évidemment, il a réécrit ce projet en partant de l'existant, parce qu'il connaissait à peine PHP. Moi je bossais sur la partie API qui devait être consommée par des apps partenaires, qui avaient le même genre d'activité commerciale.

## La réunion

Au bout de de 3 mois après mon arrivée, le projet d'API était très avancé, mais la partie principale de l'appli (le backoffice et le frontend pour les clients) était incomplets. Des bugs partout, des instabilités en masse, bref, c'était pas fini, mais en plus c'était mal fait. C'est tellement dommage qu'un complet junior ait été en charge de l'intégralité de cette "réécriture", et qu'il n'y ait aucun CTO, aucune équipe, bref, c'est un problème de mauvaise direction.

Le boss est venu nous voir et on a commencé une (très) longue réunion.

3 heures.

On était vendredi. Il voulait mettre en prod le lundi.

Mon confrère de l'époque s'écrasant devant ce sexagénaire millionnaire (et passionné par les expatriées russes qu'il prenait en secrétaires, au passage), je prends la tête de l'équipe dev.
Ça n'a pas plu au boss, bien sûr…

Pendant trois heures je n'ai pas lâché. Le projet n'était pas prêt, on ne mettrait pas en prod. Mon collègue n'en avait rien à faire, il disait "C'est son problème, nous on est payés quand même". Moi pas.
J'ai tout argumenté, en montrant les bugs en direct sur la pré-prod depuis mon ordi du bureau, expliquant tout point par point, il a tout écouté.
Au bout de près de 3 heures de délibérations, et après être parti en vrille plusieurs fois contre le boss (oui, je suis sanguin), le boss n'en démord pas non plus.

Bref, c'est clairement un gros conflit.

Et du coup, l'heure de la fin de journée était passée depuis près d'une heure, tout le monde devait rentrer chez soi (et moi j'avais ma femme qui m'attendait impatiemment avec notre fils pour que je puisse prendre la relève), je tente de maîtriser ma colère et conclus cette réunion en lui disant ceci :
« Ok. Lundi matin on arrive à 8h, on met en production. Vous serez là à 8h aussi pour constater les faits. Ça va péter, les clients ne pourront pas commander, vous êtes prévenu. »

Devinez quoi ?

Surprise.

Ou pas.

## Déploiement

Lundi matin, on arrive à 8h (alors qu'on commence à 9h d'habitude), on a déjà tout préparé le vendredi pour la mise en prod, et il n'y a plus qu'un fichier de configuration à changer puis redémarrer le serveur.

À 8h pile on est sur le pied de guerre.

Le boss n'est pas là.
On glande pendant ce temps, on papote, café & compagnie.

8h30, le boss n'est toujours pas là.

On décide de déployer quand même.

On déploie donc à 8h45.

Et de notre côté, on va monitorer le site depuis le backoffice et le serveur pour constater les changements.
Évidemment, on constate une chute drastique des commandes sur le site assez rapidement. On a même des erreurs JavasScript qui nous sont remontées par notre rapporteur d'erreur côté frontend (on avait déjà prévu ça pour se faciliter le déploiement progressif, mais pas aussi tôt).

9h30, un appel du boss sur mon téléphone perso.

Je mets le haut-parleur pour que mon collègue entende (et participe, peut-être).

« Je viens d'avoir un client habitué au tel, il arrive pas à commander sur le site, ça marche pas ! »

Rien qu'à raconter cette phrase rapportée, j'en ai encore des nœuds dans la gorge tellement ça m'a mis en rogne, ça me met encore sérieusement en colère aujourd'hui.

Je lui demande où il est, et il est dans un mas luxueux (qui lui appartient) à une vingtaine de kilomètres, il prend son petit déjeuner.
Je lui rappelle qu'il devait être là pour le déploiement à 8h.
Il me dit qu'il nous faisait confiance.
Je lui dis qu'on l'attend au bureau, et qu'on en discutera là seulement.
Après une énième engueulade, il a fini par venir au bureau, nous a demandé de remettre l'ancienne version. Ce rollback nous a pris cinq minutes en tout à déployer (on avait tout prévu, j'vous dis 😁).
Et évidemment il n'était pas content.
Mais on a tenu le coup : on avait raison.

Et là, pendant les 2 mois qui ont suivi (ma fin de CDD), j'ai passé mes journées à trouver des solutions embarquées, des partenaires potentiels, bref, tout pour qu'il se débarrasse de son "équipe IT" (un dev junior, et un dev extra-ultra-junior qui connaissait à peine PHP).
J'ai trouvé des solutions très intéressante en SaaS qui lui auraient fait économiser bien 50 000 € par an.

Puis, ma fin de contrat est arrivée. J'ai continué ma route.

## Post-apo

Dix ans plus tard ses sites sont actifs, mais je n'ai aucune idée s'ils fonctionnent, si la boîte existe, si le boss est à la retraite…
Ce genre de pression à la deadline, la performance, ou autre, y'en a partout.

Hier encore, un ancien collègue d'une société très connue dans notre petit milieu me parlait du harcèlement qu'il a subi, disait qu'il allait probablement les poursuivre en justice.

Je le soutiens totalement dans cette démarche, surtout compte tenu du fait que j'ai démissionné de l'entreprise en question en partie pour ces raisons (mais il y avait d'autres raisons, car je n'ai pas subi autant de harcèlement que ce collègue).

Il y a de la responsabilité côté dev, comme le dit `@jesuisundev`, d'où l'importance de cet article.

Néanmoins, je reste persuadé que la direction est le problème principal. Quand on est employé, il y a un biais cognitif connu face à un supérieur hiérarchique : le biais d'autorité
Il ne faut **jamais** oublié que pour beaucoup d'entreprises, la direction commerciale, le management, etc., tout cela a une valeur ÉNORME, et à leurs yeux, les devs sont remplaçables, alors que leurs idées à eux, non.

Ce qui fait de nous des "cols bleus". ([Voir "Col bleu" sur Wikipedia](https://fr.wikipedia.org/wiki/Col_bleu_(classe_sociale)))

J'ai dénoncé ça dans **TOUTES** les boîtes dans lesquelles j'ai bossé. Aucune direction n'a évidemment jamais été d'accord avec moi, ce freluquet arriviste qui bidouille son clavier et n'y connait rien au management (Je caricature les "insultes" que j'ai déjà reçues, mais on m'a déjà traité d'arriviste).

## Ne soutenez pas les gourous : VOUS avez le choix

Et j'ai envie aussi de le crier haut et fort : si votre boss est une grande figure de la tech, genre créateur d'un super gros projet Open Source, d'un outil très cool, ou autre, sachez que ces personnes-là peuvent tout-à-fait faire la même chose.

Un jour, j'étais en visio-conférence avec le boss, un gars ayant fait [HEC](https://fr.wikipedia.org/wiki/%C3%89cole_des_hautes_%C3%A9tudes_commerciales_de_Paris) et dev très connu, pour parler des problèmes techniques du projet sur lequel je bossais. Tout bug mettait un temps interminable à être corrigé, par manque de qualité, de tests, et une instabilité totale du code.

J'ai expliqué qu'on avait besoin de plusieurs choses :

* Au moins un dev en plus sur le projet, et à temps plein, pour consolider le code et corriger les bugs majeurs.
* Un [refactoring](https://fr.wikipedia.org/wiki/R%C3%A9usinage_de_code) ou réécriture de pas mal de trucs.

Il m'a répondu ceci, pratiquement mot pour mot :

« Tu vas pas m'apprendre le métier que je fais depuis 20 ans. Tu le fais, c'est tout. »

Attitude que j'ai vraiment prise pour de l'arrogance, surtout compte tenu du fait qu'aujourd'hui, des années plus tard, le projet est toujours aussi instable, il est visiblement "laissé pour compte" dans l'entreprise, et il est bidouillé de temps à autres par des devs qui le connaissent à peine, donc le projet change de main régulièrement (ce qui est mauvais pour la santé à long terme d'un projet en général).

Ce qu'il connaît depuis 20 ans, sur ce projet, ne s'applique pas.

Pourquoi ?

Parce que seuls les devs qui bossent dessus, qui plus est lorsque c'est un vieux projet issu d'une [PoC](https://fr.wikipedia.org/wiki/Preuve_de_concept) améliorée à l'arrache, savent quels sont les problèmes.

Pas le boss qui n'a pas touché au code dudit projet.

## Conclusion

Pour conclure le plus rapidement possible, _fuck_ celles et ceux qui pensent savoir quoi dire aux devs qui connaissent bien leurs projets.

C'est vous, les devs, qui devez avoir le fin mot sur vos projets.

Vous avez toute la technique, l'historique, vous connaissez l'architecture, les bugs, les instabilités, vous savez tout ça, et vous avez les connaissances et les compétences pour régler tous les problèmes des projets sur lesquels vous travaillez.

**Vous**.
