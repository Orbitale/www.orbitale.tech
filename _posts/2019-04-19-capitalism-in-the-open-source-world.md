---
layout: post
title:  'Capitalisme dans le monde de l''Open Source'
date:   2019-04-19 17:16:38 +0200
lang: en
lang-ref: capitalism-in-the-open-source-world
---

Last modified: 2019-05-21 12:38

Une bonne expression de la façon dont un esprit capitaliste peut être introduit dans l'Open Source :

**Réinventer la roue, mais "mieux".** 

Je pensais que c'était juste un problème dans le monde du Javascript (d'où la tonne d'outils qui font la même chose. Vous avez déjà cherché [uglify sur npm](https://www.npmjs.com/search?q=uglify) ?), mais ça arrive aussi en PHP (et dans d'autres langages, au final).

> Je n'attends pas de réponse du style _"C'est Open Source, on fait ce qu'on veut"_, ou _"Si t'aimes pas, t'as qu'à pas t'en servir"_. Le but de cet article est ailleurs. Vous pouvez lire jusqu'au bout.

# L'état (totalement subjectif) de l'Open Source

Quand un outil est utilisé par beaucoup de monde, on trouve parfois des détracteurs qui le trouvent "nul". 
Pourquoi "nul" ? Vous avez 4 heures (ou années) de débat pour en discuter. Ce que je veux dire, c'est que **tout le monde a un moment donné peut avoir des arguments pour améliorer quelque chose**.
L'Open Source, c'est aussi cet engagement.

Un cas où ça s'applique peu : les frameworks.

Par exemple, l'éternel débat "Symfony vs Laravel". Ce débat n'a aucun sens, parce que la plupart des arguments sont subjectifs et dépendent de ce que les gens estiment être "les bonnes pratiques". Chacun a son avis, et pour chaque avis il y a un détracteur. Et dans le cas d'un framework aussi utilisé que Symfony ou Laravel, l'impact peut être très large.

Non, ici je parle plutôt des BIBLIOTHÈQUES (qu'on va abréger ici en _lib_).

Une lib c'est un outil qui devrait être "réutilisable dans tout l'écosystème". Que ce soit une lib en C, un module Javascript, une Gem en Ruby, un package PHP, ou une extension PHP.
Du coup au bout d'un moment, certaines libs deviennent populaires, même dans plusieurs frameworks.

C'est le cas de certains : [League/Flysystem](https://github.com/thephpleague/flysystem ), assez populaire (avec [Gaufrette](https://github.com/KnpLabs/Gaufrette) mais moins célèbre), ou encore [HTMLPurifier](http://htmlpurifier.org/), et d'autres milliers de libs.

Ces packages existent depuis un moment, ils sont tous très bons, mais ils sont vieux, du coup dans un tel cas, la maintenance peut être complexe.

Du coup, on fait quoi ?

Je pense qu'il y a 2 solutions :

1. Recréer quelque chose de "mieux"
2. Améliorer l'existant

## Créer quelque chose de nouveau

La solution 1 présente quelques facilités :

> « Hey, cette lib est vieille, j'en ai fait une nouvelle, elle fait la même chose, mais c'est plus joli ! »

On pourrait penser que c'est intéressant, voilà quelques raisons :

* _Clean code_ dès le départ, yep. C'est une bonne stratégie, parce qu'on enlève directement ce qui est vieux et mauvais, avec un code tout beau tout neuf, une nouvelle documentation toute fraîche. En fonction de qui s'en occupe, on peut avoir un tout nouveau package avec une nouvelle équipe de mainteneurs (ou juste une seule personne), et une opinion différente des "bonnes pratiques". Certaines personnes préfèrent aussi cette solution parce qu'elle pensent que "la compétition est bénéfique".
* On peut supprimer toutes les vieilles fonctionnalités qui ne sont plus utilisées, notamment si le langage a beaucoup évolué (par exemple, de PHP 5 à PHP 8, ou de Python 2 à 3, etc.).
* On peut se concentrer sur des "nouvelles pratiques". Si le langage permet maintenant le typage strict, on peut le rajouter partout. Si c'est un langage de POO, on peut arrêter d'utiliser des fonctions globales et commencer à utiliser des objets. Avec PHP, on peut commencer à utiliser Composer et l'autoload, etc.

Quelques inconvénients cela dit :

* Évidemment, on peut en arriver à faire des copier/coller de l'ancien code et l'adapter, ou tout réécrire à partir de zéro, ce qui peut être plus long (genre _une année_ ou plus).
* Si c'est un nouvel outil, vous n'aurez peut-être pas tout de suite de la popularité, et beaucoup de gens ne migreront pas sur l'outil, soit parce qu'ils n'aiment pas l'idée, soit à cause du point suivant:
* Le nouvel outil ne sera pas aussi bien mis en situation et éprouvé que l'ancien, donc vous aurez probablement beaucoup de tâches de maintenance au début, et n'aurez peut-être pas ce temps à dispo parce que la communauté d'un nouvel outil est forcément réduite.

Tout cela peut légèrement se corriger si jamais vous êtes déjà une personne célèbre (si vous avez créé un framework très populaire, par exemple).

Il y a d'autres raisons qui me font penser que ce n'est pas la meilleure idée, j'en parle plus loin (est-ce que j'ai déjà dit que cet article est subjectif ?).

Pour jouer l'avocat du diable face à mes propres dires, j'ai au moins un "bon" exemple d'une lib totalement réécrite de zéro :<br>
[Swiftmailer](https://swiftmailer.symfony.com/).<br>
Cet outil utilise énormément d'anciennes (parfois mauvaises) pratiques, et même s'il fonctionne bien, pas mal de problématiques d'architectures freinent la maintenance et empêchent l'usage de ce qu'une lib d'envoi de mail moderne devrait pouvoir faire (par exemple, envoi asynchrone, appels HTTP plutôt que SMTP, configuration d'API diverses pour des services tiers d'envoi de mail, etc.).

Ce sont d'ailleurs les raisons qui ont fait que cette lib a été totalement réécrite sous la forme de [Symfony Mailer](https://github.com/symfony/mailer).<br>
Il n'y a pas de "facilité de migration" spécifique, car l'architecture a vraiment changé, donc c'est trop compliqué. Le temps de migration dépendra surtout d'à quel point vous utilisez les fonctions du cœur de Swiftmailer, les surcharges que vous faites, etc.

Pour moi, par exemple, la migration était rapide : l'appli sur laquelle je l'utilisais n'envoyait que 3 mails différents (inscription, mot de passe, formulaire de contact). Plus simple, mais évidemment ce n'est pas le cas de plus grosses applications.

Je pense donc que réécrire Swiftmailer de zéro était une bonne solution, l'architecture étant **vraiment** trop complexe pour être juste mise à jour. Et il n'y a pas vraiment de compétition : c'est la même équipe, et Swiftmailer ne sera plus maintenu au bout d'un moment, donc c'est une incitation à migrer vers un nouvel outil.

## Améliorer l'existant

C'est une solution qui "inverse" pratiquement le problème de la philosophie "réinventer la roue".

Certaines libs bénéficient vraiment de cette option, comme [Twig](https://twig.symfony.com), et l'avantage c'est qu'il n'y a pas vraiment de compétiteurs directs dans le monde de PHP (à part Blade, sponsorisé par Laravel), et créer un nouveau moteur ne serait pas pertinent, car Twig a déjà tout ce qu'il faut. Du coup, l'améliorer a plus de sens.

Cela dit, faire du _refactoring_ de façon granulaire peut prendre pas mal de temps.

Il y a une discussion intéressante dans une [Pull-Request sur Symfony](https://github.com/symfony/symfony/pull/30672). Le sujet parle ici de changer le système  de "Kernel" dans Symfony 4, et quelques pensées vont vers une méthode du style _"Déprécier dans Symfony 5, supprimer dans Symfony 6"_. Pour info, la PR date de Mars 2019, Symfony 5 est sorti en Novembre 2019, et Symfony 6 sortira en Novembre 2021. Cela fait donc plus de 3 ans entre le temps auquel la PR a été créée et le temps éventuel où la fonctionnalité sera supprimée.

C'est ce que j'appelle un "chemin de migration clair". Surtout quand on parle d'un composant aussi important que HttpKernel.

Après, améliorer l'existant a également des inconvénients :

* La rétrocompatibilité c'est le pire. Soit vous vous en fichez et vous faites une nouvelle version majeure du style _"On a tout changé, adaptez-vous"_, ou vous dépréciez des tas de trucs dans la version actuelle, en rajoutant des appels du type `@trigger_error('Deprecated (...)', E_USER_DEPRECATED);` (vive PHP pour ça), faites bien gaffe à ne pas tout casser en sortant la nouvelle version mineure, et supprimez tout ça à la prochaine version majeure en faisant bien gaffe à ne pas péter tout l'existant. Bref, la rétrocompatiblité, c'est tout un métier.
* Il faudra faire avec du vieux code. Vieux, moche, sale, mal organisé, souvent du code que vous n'avez écrit, d'ailleurs qui l'a écrit ? Personne ne sait. Des fois, ce sera du code illisible, qui est en bazar partout.
* Oh, et je le dis encore une fois, DU VIEUX CODE ! Des pratiques qu'on n'a pas vu depuis des décennies, genre du HTML dans du PHP dans un vieux script CGI, et… Nan, c'est pas possible ça, si ??

Yep, améliorer l'existant, c'est chaud. Mais :

* Vous pouvez faire appel à votre communauté ! Et oui, du coup des gens qui connaissent au moins un peu l'outil. Avec plusieurs cerveaux, ça peut aller plus vite.
* Quand une version majeure est presque terminée, il est même possible de sortir des versions beta ou "release candidate", et demandez aux gens qui utilisent déjà l'outil de le tester dans leur projet, balancer tout ça dans leur intégration continue, en général ça devrait suffire à détecter les bugs les plus directs. Évidemment ça ne fonctionnera que pour les gens qui ne surchargent pas trop votre code. Sinon, bah... c'est un problème d'architecture, et ça se règle aussi.
* Si votre lib est déjà popuplaire, et que la nouvelle version est meilleure, eh bien elle sera probablement encore plus populaire après. Bon point pour vous.

## La philosophie "encore un nouvel outil"

Quelque chose est arrivé aujourd'hui et qui m'a donné envie d'écrire cet article : [un nouveau "FlysystemBundle" a été créé](https://titouangalopin.com/introducing-the-official-flysystem-bundle/), et il est hébergé sur l'organisation Github de ThePhpLeague.

On m'a dit que ce nouveau bundle avait "3 avantages".

Il est soi-disant :

1. Officiel
2. Mieux codé, genre il gère mieux les nouvelles fonctionnalités de Symfony 4.2
3. Suit les standards de code de Symfony et de Flysystem

Oui, sur le papier, c'est joli.

Mais.

(oui, toujours un "mais", sinon ça sert à rien d'écrire un article et de faire l'[odieux connard](https://unodieuxconnard.com/))

Il existait un bundle depuis un loong moment pour l'exact même usage : [OneupFlysystemBundle](https://github.com/1up-lab/OneupFlysystemBundle), créé par 1-up Lab.
C'est une implémentation directe de `ThePHPLeague/Flysystem` et il a déjà plein de fonctionnalités.

> La suite sera encore plus subjective.

Les trois points ci-dessus m'ayant été donnés comme des "bonnes raisons" **auraient pu être tous corrigés sans aucun nouveau bundle**.

### "C'est officiel"

Oui, ça l'est. Ok. D'accord. Super. Cool.

Ça veut dire quoi, "être officiel" ?

Ça veut dire que **les mainteneurs de la lib initiale vont maintenir cette lib également**, en gros. Si j'ai tort, arrêtez-moi là, hein.

Être officiel c'est "juste un nom". Il est déjà arrivé plusieurs fois dans le passé que des outils changent d'équipe et que la notion d'outils "officiels" soit juste valide pendant un certain temps, ou pas.

Un bon exemple, c'est le bundle [FOSCKEditorBundle](https://github.com/FriendsOfSymfony/FOSCKEditorBundle). Au début, c'était juste [IvoryCKEditorBundle](https://github.com/egeloen/IvoryCKEditorBundle), et après **des discussions et une décision de la communauté**, il a été transféré à l'organisation FriendsOfSymfony, pour une maintenance communautaire plus large et un "meilleur" support. Aucun chemin de migration complexe nécessaire : c'est exactement le même outil, il suffit de changer le nom et la version dans votre `composer.json` et c'est le même code, juste un _namespace_ différent. Vous pouvez aussi utiliser la vieille version si vous ne voulez pas migrer, de toute façon c'est la même chose, n'est-ce pas ?

C'est aussi arrivé avec [Laminas](https://framework.zend.com/blog/2019-04-17-announcing-laminas.html) qui est la suite historique de Zend Framework. Bon, je n'ai pas tous les détails pour ce cas précis, mais l'idée est la même : changez le nom et la version, et la base de code est la même. En tout cas je pense que vous avez saisi l'idée.

Du coup, contre quoi je me prends la tête, déjà ?

Ah oui : "officiel" n'est pas un argument.

L'équipe de Flysystem aurait pu proposer à 1up-Lab de reprendre la maintenance de leur projet et de la rendre "officielle". Après tout, c'est la plus utilisée de toutes les implémentations de Flysystem pour Symfony, sinon la seule, donc pourquoi pas ? 1up-Lab resterait l'équipe créatrice initiale, c'est écrit partout dans l'historique et les contributions de toute façon, les commentaires, les pull-requests, la licence, etc.

"Officiel" pourraît être un argument seulement si 1up-Lab avait **refusé** que son outil devienne "officiel". Seulement. Dans. Ce. Cas.

Et même, c'est Open Source, donc si quelqu'un de ThePhpLeague avait fait un _fork_ de ce bundle pour le rendre officiel, pas de problème, la licence est là pour préparer à ça justement.

Cependant, il n'y a eu **aucune** proposition. **Aucune** discussion. **Aucune contribution à l'existant**.

Rien de tout ça.

### "Mieux codé, gère mieux les nouvelles fonctionnalités de Symfony 4.2"

Yep, "meilleur code". C'est sûr. Il est aussi possible d'optimiser le code du repo d'origine.

"Gère mieux (…)", dans la plupart des cas on peut ajouter quelques lignes de code pour ça (bon, peut-être un peu plus que ça, mais c'est toujours moins de code à écrire que de tout réécrire).

"(…) fonctionnalités de Symfony 4.2", c'est toujours possible de façon automatisée en rajoutant une couche de compatibilité spécifique en détectant la version du framework, ou même en créant une nouvelle version majeure de l'outil qui supprime le support de vieilles versions de Symfony et gère "mieux" les nouvelles.

Un bon example sur ce nouveau bundle Flysystem, la seule et unique fonctionnalité "nouvelle" m'a pris une seule heure de travail & tests & relecture et je l'ai envoyée [via cette PR](https://github.com/1up-lab/OneupFlysystemBundle/pull/190), et elle a été acceptée sans problème. Une heure, et tout le monde a cette "nouvelle super cool fonctionnalité, such wow" promue ailleurs.

Aucun réel argument ici, du coup, seulement des choses qui auraient probablement coûté bien moins que de juste contribuer à l'outil initial.

On m'a d'ailleurs dit que ce nouveau bundle avait mis près d'un an à être codé.

Une année vs une heure, vous préférez quoi ?

### "Suit les standards de code de Symfony et de Flysystem"

Quels standards ? Indentation K&R vs Allman ? Modèles riches vs modèles anémiques ? Mediator plutôt qu'Observer ?

Oui, certaines organisations ont des standards de code stricts, comme [Doctrine](https://github.com/doctrine/coding-standard), et [Symfony](https://symfony.com/doc/current/contributing/code/standards.html).

Si les styles diffèrent, la plupart du temps c'est une affaire de "goût", un "détail d'implémentation" peut-être. Tant que le code fonctionne pareil et qu'il est assez performants (benchmarks et profiling à l'appui), et que les fonctionnalités sont extensibles (rapport aux principes SOLID), quels "standards" pourrions-nous clairement raisonnablement avoir de plus ?
 
On peut utiliser [PHPStan](https://phpstan.org/) ou [Psalm](https://psalm.dev/docs/installation/) pour renforcer ces standards, c'est une décision du mainteneur ou de l'équipe, ou même simplement une [simple PR exécutant les outils en question](https://github.com/gabrielrcouto/php-gui/pull/123) par exemple.

Les standards sont des guides que vous _pouvez_ suivre si vous avez des problématiques d'organisation dans l'équipe. Si vous maintenez une lib, les standards ne seront pas utilisés de la même façon que pour un framework triple-A, l'impact n'est pas le même. Idem pour un projet clé-en-main (comme OctoberCMS, Wordpress, etc.), qui n'ont pas les mêmes exigences.

Si vous décidez quand même de suivre un standard, j'ai quand même des doutes sur le fait que 1up-Lab pusse avoir refusé une PR exécutant `php-cs-fixer` avec les standards de code de Symfony.

Après tout, [travaillent bien sur des correctifs de style de code](https://github.com/1up-lab/OneupFlysystemBundle/pull/191), et tout le monde peut venir en discuter.<br>
Ah, et au fait, l'auteur de ce nouveau FlysystemBundle [n'a jamais ouvert une seule discussion avec la communauté](https://github.com/1up-lab/OneupFlysystemBundle/issues?utf8=%E2%9C%93&q=author%3Atgalopin) sur une nouvelle version ou une nouvelle intégration ou que sais-je. Cliquez sur le lien: jamais.

Une fonctionnalité est juste à la portée d'une pull-request.

Tous ces états de faits sont vrais pour ce FlysystemBundle, mais si j'écris c'est article, c'est qu'en réalité c'est vrai pour N'IMPORTE QUEL OUTIL.

## C'est pas juste à propos d'une lib, ça va bien plus loin

Je me prends la tête sur ce sujet à cause d'un problème plus grand.

Cela ne surprendra probablement pas grand monde si je dis que nous vivons dans une société de consumérisme gouvernée par le capitalisme.

Consommez, si vous n'aimez pas, allez voir ailleurs, ou faites-le vous-même. Et vous **payez** pour tout ça. Tout le temps.

### Le "passé"

Cette histoire de "faites-le vous-même" était plutôt intéressante quand les "choses" n'étaient pas aussi avancées qu'aujourd'hui.

Les machines remplacent les humains au travail, dans les usines par exemple, pour une "bonne" raison : elles font plus de "choses", pour moins cher, et permettent aux patrons de gagner encore plus. Du coup, les humains rentrent chez eux, ou cherchent un autre boulot.

Dans l'industrie de l'IT, genre il y a 20-30 ans, c'était vraiment "l'âge d'or" du _do it yourself_, car il n'y avait quasiment pas de documentation, très peu de standards, et les langages de programmation étaient un peu moins simples qu'aujourd'hui. Je me souviens de mon grand frère lisant un livre de genre 200 pages format A4, rempli de lignes de codes à copier sur son propre ordinateur, juste pour avoir un jeu vidéo.

Aujourd'hui, c'est plutôt de l'élitisme.

Les travailleurs sont remplacés par des machines automatisées, et de leur côté les devs "bas-niveau" sont remplacés par des interfaces de programmation "haut-niveau". Le problème c'est que l'industrie de l'IT a besoin de tellement de devs qu'il faut les former, les éduquer à cette industrie, et plein de centres de formations se vantent de faire ça en 3 à 6 mois. Je pense que c'est n'importe quoi. On ne devient pas dev en 6 mois. Au mieux, on devient dev junior qui a des notions théoriques sur plusieurs sujets, mais c'est insuffisant. Toute l'expérience, la théorie sur l'architecture, l'Open Source, les différents langages, les concepts, etc., rien de tout ça ne peut être acquis en une période si courte. Les seules formations disponibles il y a plus de quinze ans étaient des DUT ou BTS, donc au minimum 2 ans, ainsi que d'autres études supérieures pouvant aller jusqu'au doctorat.
Du coup, les devs qui arrivent dans l'IT aujourd'hui sont beaucoup moins expérimentés. Après, si ce sont des débutants, c'est logique. Mais. (oui, encore un "mais")

Ce que l'on peut constater est que les devs avec plus de 10 ans d'expérience, un ou plusieurs diplômes dans l'informatique, ou juste une passion dévorante où le temps libre est également consacré à l'informatique, ou tout ça en même temps, sont tellement plus expérimentés, l'écart s'agrandit de plus en plus chaque année avec la recrudescence de nouvelles technologies, et on en arrive à un genre de "conflit de générations". Les devs "hipster-JS-fullstack-react" versus "vieux barbu dans sa cave avec un donut et un Apple II" (je caricature très grossièrement).
C'est un peu normal, en soi, mais ça peut aboutir à des problèmes comme [l'élitisme sur StackOverflow](https://stackoverflow.blog/2018/04/26/stack-overflow-isnt-very-welcoming-its-time-for-that-to-change/).

### Le "présent"

Et du coup, l'élitisme est partout.

Les travailleurs disparaissent, et de nouveaux emplois apparaîssent, avec un niveau d'exigence et de compétence encore plus grand. Et tout le monde en a besoin. Et c'est difficile de trouver des profils avec un bon niveau (surtout vu que beaucoup de juniors sont sur le marché). Un peu comme la pénurie de pilotes de ligne, ou de devs COBOL.

Il faut des "top-level" partout, et moins de compétences n'est pas vraiment acceptable car les architectures et environnements des applications sont de plus en plus complexes (docker, kubernetes, async partout, APIs et web-services, micro-services, etc.). Dans le passé, il y avait "l'intégrateur HTML/CSS", le "sysadmin", l'"UX Designer", etc. Maintenant on a un truc du style _"devops qui fait tout parce que c'est cool d'avoir un full-stack-ninja-jedi-babyfoot-bière-pizza-react-laravel-wordpress"_. Même les désignations de métiers sont insensées quand ça tourne autour de l'IT. Le métier de "dev" est maintenant tout aussi vague que ne l'était le métier "d'informaticien" il y a 15 ans. 

Je me répète :

Les métiers qui nécessitent un niveau plus bas de compétences sont en train de disparaître.

Cela force les personnes qui ont un moins bon niveau à soit galérer sur le marché du travail, ou alors se former pour un job avec encore plus d'exigences. Et c'est injuste (gna gna gna caliméro), parce que je pense que tout le monde n'a pas forcément le niveau pour changer, et surtout, je pense que tout le monde n'a pas forcément envie. Du coup les projets avec moins de "skills" s'étiolent, pour le moins. Les devs en ont marre, ils se barrent rapidement (turn-over de 1 à 3 ans dans notre métier, c'est quand même gros), et recommencent dans une autre entreprise. Encore et encore. Et du coup les connaissances acquises se perdent, le projet "vit" moins bien, l'entreprise en est impactée, et ainsi de suite.

Ces entreprises sont donc désormais contraintes à participer à cette "consommation de devs", au même titre que la société nous enjoint à "consommer des choses".

## Retour au sujet initial

FOSS (Free Open Source Software) c'est donc un petit peu "consommer des logiciels libres". Et gratuits. Et tout le monde fait selon ses envies.

Mais le mieux dans l'Open Source c'est **l'esprit de partage**. On partage, on discute, on débat, on contribue, tout le monde en profite, et ainsi de suite.

Partager gratuitement n'est pas vraiment une valeur principale dans le monde du capitalisme.<br>
Dans ce monde, les valeurs viennent plutôt de ce qui fait du profit. De la thune. Des bas d'laines. Tout c'qui traîne.

Le capitalisme **se sert de l'Open Source** comme d'un **moyen** pour faire du profit. Point. Barre.

Le profit interne de l'Open Source n'est pas un profit financier, c'est plutôt le partage d'outils utiles pour les gens. C'est plutôt un **profit communautaire**.

En son cœur, **le logiciel libre et Open Source est une forme d'humanisme**.

Mais pas seulement. En tout cas, j'en ai peur :

### Ego

[We're only human, after all](https://www.youtube.com/watch?v=L3wKzyIN1yk).

Mais des fois (souvent ? Ouais, cet article est subjectif, je sais) j'ai le sentiment que l'égo domine partout.

Comme dit plus haut, pour des logiciels open source, on a parlé de deux stratégies : recréer de zéro, ou améliorer l'existant.

Le capitalisme dirait probablement "On recrée, en privé, et on vend". Évidemment, l'Open Source ne vend pas vraiment. Du coup, chacun "fait ce qu'il veut", et finalement il reste juste des "satisfactions personnelles". L'égo, du coup, catalyseur de satisfaction personnelle des Hommes.

(je parle surtout d'hommes et moins de femmes, car j'ai le sentiment que les femmes sont moins sujettes à l'ego dans l'Open Source, probablement parce que l'IT est une industrie avec malheureusement 95% d'hoommes, et que la plupart des femmes dans l'IT souffrent de cette situation, mais c'est un autre sujet)

La satisfaction peut venir sous plusieurs formes, mais je dirais que dans l'IT, l'égo vient surtout en fonction de comment on est considérés dans note champ d'expertise, notamment comme une forme "d'autorité".

Un petit exemple : devenez dev Symfony ou Laravel, accumulez plein de compétences, contribuez au framework avec des fonctionnalités utiles, et beaucoup de monde vous considèrera comme une forme "d'autorité", ou "d'influence". Et des fois, avec quelques compétences avancées, vous allez déclencher sans faire exprès le syndrome de l'imposteur d'autres devs qui n'auront pas ces compétences ou connaissances. Alors que ces personnes savent certainement faire plein d'autres choses aussi.

Théoriquement, si l'on regarde bien, n'importe quel dev peut contribuer à de tels frameworks. C'est d'ailleurs grâce à la documentation de contribution de ces outils que l'on se rend compte qu'il suffit d'une idée, d'un cas particulier, et ensuite lire la doc de contribution, pour pouvoir contribuer soi-même.

Oui, mais non.

Tout le monde n'est pas forcément impliqué dans l'Open Source que les membres des équipes de Symfony ou Laravel ou d'autres contributeurs réguliers. Certaines personnes sont vraiment passionnées par leur sujet, d'autres s'en fichent tant qu'elles ont leur salaire. J'ai connu pas mal de gens qui se contentent de faire leur 8 heures quotidiennes et retourner chez eux sans allumer leur ordinateur à la maison. C'est ok. L'Open Source, on "fait ce qu'on veut", de toute façon, et c'est pas parce qu'on ne contribue pas qu'on n'a pas un bon niveau.

Plein de devs cependant sont dans une sorte de _zone grise_, c'est-à-dire que ces personnes ont un intérêt pour l'Open Source mais ne contribue pas, peut-être par manque de temps. Ou de soutien, notamment de la hiérarchie professionnelle (plein de patrons s'en fichent complètement de l'Open Source et voient ça comme du temps et de l'argent perdu. Sauf que si ces gens réfléchissaient un peu mieux, ils réaliseraient que l'Open Source fait bien leur beurre).

Du coup il y a une apparence d'élitisme dans le fait de dire _"Si t'aimes pas, fais-le toi-même"_. Parce que **tout le monde n'en a pas forcément la possibilité**. Sans compter la culpabilisation faite par certains mainteneurs lorsqu'une personne ne contribue pas.

J'ai déjà, personnellement, reçu des injonctions tu style _"Tu peux discuter tant que tu veux, je m'intéresse uniquement aux gens qui codent"_. Des gens qui n'ont donc pas compris que la contribution à l'Open Source ce n'est **pas juste du code**.

[Je disais dans un tweet](https://twitter.com/Pierstoval/status/1300407749252128772) qu'il existe trois étapes faciles pour contribuer au monde de l'Open Source :

* Utiliser des logiciels Open Source
* Promouvoir leur usage (famille, travail, institutions…)
* Aider les gens à comprendre et utiliser l'Open Source

### Tout le monde ne le peut pas, d'où le paradoxe

C'est le principal paradoxe de l'open-source à mes yeux :

* Vous partagez des outils libres et gratuits pour le bien commun
* Tout le monde peut faire ce qui lui plait avec (dans les limites de la licence, bien sûr)
* Quiconque veut contribuer peut commencer à discuter, débattre, réfléchir, et peut-être finir par un consensus qui améliorera la qualité des outils, pour le bien commun toujours
* Mais si ce "quiconque" ne sied pas à vos opinions sur la façon de contribuer, vous les envoyez ch*er

Le dernier point est le plus important, parce qu'il est souvent présent _avant_ toute contribution.

Vous n'aimez pas la personne qui a fait tel ou tel outil ? Il suffit de le _fork_ et de promouvoir votre propre travail. Baston d'égo.

L'équipe qui maintient l'outil n'aime pas votre idée, ou pire, ne vous aime pas vous ? L'équipe va juste supprimer votre contribution, la refaire elle-même, et promouvoir son travail.

Si vous me dites "La compétition a du bon", vous êtes clairement à fond dans le capitalisme.

La compétition est intéressante quand il y a des bénéfices des deux côtés, ainsi que du côté utilisateur ou consommateur.

Par exemple, Laravel vs Symfony est une compétition intéressante parce que les deux frameworks ont une philosophie très différente, et chacun peut s'inspirer de l'autre pour apporter des petites nouveautés. Par exemple, Laravel emprunte des tas de concepts issus de Symfony et utilise même ses composants, et de son côté, Symfony a introduit quelques nouvelles fonctionnalités inspirées de Laravel (comme la fonction `dd()`, ou les assertions de tests inspirées de Laravel Dusk). C'est une compétition saine, en tout cas au regard des frameworks (parce que c'est vachement moins sain du côté des humains derrière…).

Une compétition entre des outils A et B, l'un étant un fork ou une réécriture de l'autre, n'est pas saine, car vous finissez avec 2 libs faisant la même chose, et seule la popularité de l'outil (ou de son mainteneur…) gagnera à la fin. Personne n'a jamais créé un fork de Twig pour l'optimiser ou que sais-je, non. Twig a juste été optimisé, et un petit peu réécrit, peut-être.

Ici je parle plutôt d'un concept : une lib qui fait la même chose que la lib concurrente, mais est juste vendue comme "meilleure".

À mes yeux, c'est juste du pur égo que de réécrire la lib d'origine et clamer que cette nouvelle version est "meilleure", surtout sans avoir jamais contribué à la lib d'origine ni jamais avoir démarré de discussion.

C'est pas du logiciel libre et Open Source.<br>
C'est de l'ego.<br>
C'est du capitalisme.
