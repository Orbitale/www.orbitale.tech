---
layout: post
title:  "Qu'est-ce qu'un contrôleur ?"
date:   2019-07-19 02:01:09 +2
lang: fr
lang-ref: what-is-a-controller
---

Dans l'industrie de la programmation, on se tape souvent la tête contre les murs en parlant de tout un tas de trucs au lieu de coder. Comme "meilleures pratiques", "meilleur langage", "meilleur IDE", etc.

Aujourd'hui, j'ai vu une question qui m'a fait me questionner :

[![Question sur les contrôleurs](/img/controller_question.jpg)](https://twitter.com/barryosull/status/1151812280537047040)

C'est une question vraiment intéressante.

La raison pour laquelle quelqu'un peut avoir cette question peut être causée par la façon dont le concept MVC a été mis en œuvre au cours des dernières décennies.

Les gens ont tendance à induire en erreur sur les contrôleurs.

Demandez "Qu'est-ce qu'un contrôleur" et vous verrez que les frameworks et les développeurs ont tous des opinions différentes.

Dans les applications / frameworks MVC, les contrôleurs ont tendance à être des *classes* qui peuvent contenir de nombreuses *actions* (action = cas d'utilisation). Et une seule *action* peut exécuter *plusieurs tâches* (gérer le formulaire, envoyer un e-mail, enregistrer dans la base de données, etc.)

Je vois que certaines réponses parlent des principes SOLID, et c'est assez vrai : respecter le SRP (Single Responsibility Principle) est important pour s'assurer que votre code est découplé.

Du coup…

## Qu'est-ce que c'est *vraiment* qu'un contrôleur ?

Pour les frameworks MVC, un contrôleur est une classe.

Mais si vous regardez de plus près, les contrôleurs ne sont **pas des classes**.

Prenons l'exemple de Laravel.

[La documentation dit ça](https://laravel.com/docs/5.8/controllers#basic-controllers) :

```php
<?php

namespace App\Http\Controllers;

use App\User;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    public function show($id)
    {
        return view('user.profile', ['user' => User::findOrFail($id)]);
    }
}
```

```php
<?php
Route::get('user/{id}', 'UserController@show');
```

Pour Symfony, l'exemple est assez proche, comme indiqué dans le [guide "Getting Started" pour créer une page](https://symfony.com/doc/current/page_creation.html#creating-a-page-route-and-controller) :

```php
<?php
// src/Controller/LuckyController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;

class LuckyController
{
    public function number()
    {
        $number = random_int(0, 100);

        return new Response(
            '<html><body>Lucky number: '.$number.'</body></html>'
        );
    }
}
```

```yaml
# config/routes.yaml

# the "app_lucky_number" route name is not important yet
app_lucky_number:
    path: /lucky/number
    controller: App\Controller\LuckyController::number
```

**Conjecture : un contrôleur n'est pas une classe**

Quand on regarde d'un peu plus près, un contrôleur est juste une _**callable**_.

Ça veut dire que nos classes ne devraient même pas avoir le suffixe `Controller` mais plutôt `Controllers`.

Cela dit, il y a peut-être une solution : le modèle ADR.

## Le modèle ADR : Action, Domain, Responder

[Le modèle ADR](https://en.wikipedia.org/wiki/Action%E2%80%93domain%E2%80%93responder) est assez populaire chez certaines personnes très orientées "bonnes pratiques à fond" sur des projets qui s'appuient beaucoup sur les _design patterns_.

Le modèle MVC est un peu vague et n'indique pas vraiment "ce qu'est un contrôleur" (d'où cet article).

ADR est plus strict et découpe la structure en domaines logiques. Un petit exemple : la partie "Vue" de MVC (le "Répondeur" dans ADR) ne peut pas agir sur le domaine, elle ne reçoit que des données et répond avec une représentation UI de ces données (ou parfois orientée API), et ne doit rien mettre à jour en rapport avec le domaine / modèle.

Je ne creuserai pas trop sur ADR, c'est pour un autre article, mais ce qui est clair, c'est que l'action HTTP est forcément représentée par une seule action, et dans ce cas, une `callable` claire qui ne contient que des informations sur la couche HTTP (comme Request) et interagit avec le _domaine_.

Cela signifie que le modèle ADR peut recommander une action par classe de contrôleur, représentée par une seule et unique `callable`.

## Un autre problème avec plusieurs actions dans les contrôleurs

Les dépendances.

Lorsque vous avez une classe avec plusieurs actions, vous avez souvent besoin de dépendances, comme un moteur de _template_, un routeur, un gestionnaire de formulaire, un bus de commande, tout ce dont vous pourriez avoir besoin pour interagir avec le domaine ou demander un _Responder_.

Si vous avez, disons, une action "list" et une action "edit", "list" n'aura besoin que du _repository_ pour récupérer la liste des objets, mais "edit" aura besoin de la couche "formulaires". Cela signifie que vous en aurez besoin comme ceci :

```php
<?php

class PostController
{
    public function __construct(PostRepository $repository, FormFactoryInterface $formFactory)
    {
        $this->repository = $repository; 
        $this->formFactory = $formFactory; 
    }
    public function list()
    {
        // ...
    }
    public function edit(string $id)
    {
        // ...
    }
}
```

Dans ce cas, la `formFactory` sera inutile pour l'action` list`, donc le conteneur d'injection de dépendances va instancier un service pour rien.

Avec Symfony, on peut faire ça avec un _hack_ que je trouve un peu sale :

```php
<?php
class PostController
{
    public function list(PostRepository $repository)
    {
        // ...
    }
    public function edit(string $id, PostRepository $repository, FormFactoryInterface $formFactory)
    {
        // ...
    }
}
```

Cette solution vient du fait que vous pouvez utiliser l'injection de dépendances directement dans les actions du contrôleur, [comme indiqué dans la documentation](https://symfony.com/doc/current/controller.html#fetching-services), mais je ne le fais pas, comme dit je trouve ça un peu sale. J'aime pas du tout cette idée, mais c'est un autre sujet que cet article ne couvrira pas.

Ceci dit, ça veut quand même dire que les contrôleurs ne sont que des callables, rien de plus.

Avec une seule action par contrôleur, ce problème ne se produit plus.

Et avec PHP on peut même utiliser [`__invoke()`](https://www.php.net/manual/fr/language.oop5.magic.php#object.invoke), qui transforme toute instance de notre classe directement en une `callable`, du coup c'est plus simple pour inciter à n'avoir qu'une seule action par classe ! 

## Conclusion

Les contrôleurs mono-action sont meilleurs pour la cohérence, la maintenance, la clarté…

Lorsque vous recherchez une action, vous regardez soit la route, soit la classe elle-même, et si vous respectez également les bonnes pratiques des « contrôleurs légers », la maintenance d'un contrôleur est plus facile car il n'appelle que la logique métier, et donc on peut se concentrer uniquement sur votre logique plutôt que sur l'architecture.

Les bonnes pratiques nous aident à nous concentrer sur le bien-être de notre code.
