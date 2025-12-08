---
layout: post
title:  "Gérer ses utilisateurs avec EasyAdmin"
date:   2015-12-28 22:27:20 +2
lastUpdate:   2020-08-27 10:12:25 +2
lang: fr
lang-ref: manage-fosuser-in-easyadmin
---

Edit (2020-08-19) : Cet article est valide pour EasyAdmin 1 et 2, mais pas pour la version 3 qui a complètement changé le système de configuration.

Edit (2018-08-27) : FOSUserBundle n'est pas recommandé pour gérer vos utilisateurs. Si vous voulez un bon gestionnaire d'utilisateurs,
vous devrez l'écrire vous-même pour éviter le bazar à base d'héritage de FOSUserBundle. Si vous voulez un bon cours à ce sujet, consultez le
[Screencast Symfony Security de KNPUniversity](https://knpuniversity.com/screencast/symfony-security) pour les bonne pratiques.

---

[EasyAdmin](https://github.com/javiereguiluz/EasyAdminBundle) est un puissant générateur de panneau d'admin qui se base sur un simple fichier `Yaml`.

Cependant, il n'a pas de support de FOSUserBundle, opinion spécifique du créateur de ne pas ajouter trop de "ponts"
au bundle, pour qu'il soit le plus léger possible.

Mais comme EasyAdmin est cool, nous pouvons facilement implémenter la gestion des utilisateurs directement dedans.

Comme FOSUser utilise certains services pour gérer les utilisateurs, nous devons ajouter la logique de gestion à l'intérieur de notre `AdminController` pour le faire fonctionner
correctement.

Partons du principe qu'EasyAdmin est déjà installé sur votre application.

* Dans un premier temps, [Installez FOSUserBundle](https://symfony.com/doc/master/bundles/FOSUserBundle/index.html) et configurez-le pour qu'il fonctionne. Cela peut vous prendre un certain temps si vous ne l'avez jamais utilisé, dans ce cas, n'hésitez pas à prendre le temps nécessaire pour appréhender le bundle.
* Ensuite, ajoutez cette config pour EasyAdmin :{% highlight yaml %}
easy_admin:
   entities:
       Users:
           class: AppBundle\Entity\User
           list:
               fields:
                   - id
                   - username
                   - email
           form:
               fields:
                   - username
                   - email
                   - roles
                   - enabled
{% endhighlight %}
* Si vous n'en avez pas encore,
[créez votre propre AdminController](https://symfony.com/doc/current/bundles/EasyAdminBundle/book/complex-dynamic-backends.html#customization-based-on-entity-controllers)
étendant celui d'EasyAdmin. Testez-le dans votre navigateur, et vous devriez voir l'entité `User` dans le menu.
* Ajoutez ces 3 méthodes à votre contrôleur :
{% highlight php %}
public function createNewUsersEntity()
{
  return $this->container->get('fos_user.user_manager')->createUser();
}

public function prePersistUsersEntity(User $user)
{
  $this->container->get('fos_user.user_manager')->updateUser($user, false);
}

public function preUpdateUsersEntity(User $user)
{
  $this->container->get('fos_user.user_manager')->updateUser($user, false);
}
{% endhighlight %}

Et voilà !

Vous pouvez ajouter manuellement d'autres champs, mais la base fonctionnelle est là. Facile, non ?

Pour les groupes, c'est très similaire : activez la gestion des groupes avec FOSUserBundle, et ajouter le champ `groups` à la config de l'entité `User` de votre bcakend sous le paramètre `form > fields`.

Si vous décidez d'utiliser les groupes, vous devrez définir un backend pour l'entité `Group` en plus, et comme EasyAdmin est fait pour ça, vous pourrez le faire sans trop de soucis !
