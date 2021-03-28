---
layout: post
title:  '[PHP Basics] Prototype de fonctions et de méthodes'
date:   2017-10-25 11:29:57 +0200
lang: fr
lang-ref: php-basics-functions-and-methods-prototypes
---

Une fonction PHP est faite de 3 choses :

* Son code
* Sa documentation (via PHPDoc)
* Son prototype

En PHP, le prototype d'une fonction (également appelé sa « signature ») est constitué du **nom**, des **arguments** et, depuis PHP 7, de son **type de retour**.

Les arguments peuvent être typés, ça s'appelle un "type-hint", et depuis PHP 7 nous pouvons type un argument avec des types scalaires (`bool`, `int`,` string` ...), mais comme PHP est aussi orienté objet, nous pouvons typer avec une classe. De plus, les arguments peuvent avoir une valeur par défaut.
 
Exemple de base :

```php
public function __construct($a, $b, $c) { /* */ }
```

Ici aucun type, mais la signature utilise 3 arguments.

Un exemple plus complet :
```php
public function loginAction(
    Request $request,
    string $username,
    bool $useReferer = true
): Response
{
    // ...
}
```

Ici, nous avons un type-hint scalaire pour `$username` et `$useReferer`, et un type-hint de classe pour `$request`.
Nous avons même une valeur par défaut pour `$useReferer` qui est à `true`.

Le type de retour et ici de `Response`. Cela signifie que `loginAction()` **DOIT** retourner une instance de
la classe `Response`, sinon PHP lève une exception lors de l'exécution.

Le type de retour est similaire au type d'argument : il accepte les classes et les scalaires, mais depuis PHP 7.1, il accepte également un type de retour particulier : `void`.

Le type de retour `void` signifie que l'instruction `return` dans la méthode/fonction ne doit **jamais** avoir d'argument. Avec un type de retour `void`, nous ne pouvons jamais faire quelque chose comme `return 1;` ou `return $response`, sinon PHP lève une exception à l'exécution.<br>

On ne peut écrire que `return;` avec le type de retour `void`.

Mais rien n'empêche de faire quelque chose comme ça :

```php
function test(): void {
    echo "ok";
    
    return;
}
$a = test();
var_dump($a);
// Outputs:
// "ok"
// null
```

Vous pouvez aller lire la [RFC de void](https://wiki.php.net/rfc/void_return_type) pour plus d'informations.
