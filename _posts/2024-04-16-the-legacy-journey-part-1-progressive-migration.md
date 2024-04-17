---
layout: post
title:  'The legacy journey (part 1: progressive migration)'
date:   2024-04-16 15:06:31 +0200
lang: en
lang-ref: the-legacy-journey-part-1-progressive-migration
---

Is your legacy rotten? Are you fed up with your devs spending weeks fixing a bug?

"We just wanted to add a feature when we click on this button! How complicated can it be?

Don't worry, it's the same for everyone.

Over the years, I've helped in tons of app rewrites and progressive migrations.

I've learned a lot, especially what not to do!

My last "progressive migration" project was presumably simple: an app with 2 frames in the web page: one with a backoffice made with plain PHP, and the other with a cartography app made in Java.

All we had to do was rewrite the Java part and integrate it into the backoffice.

After a good month of R&D on the project, I realized that this integration of the new mapping application (which we started with LeafletJS but then reworked with OpenLayers, which is much more suitable) is super simple, really. There are a few tweaks to be made to the legacy, but in general it's super easy.

To the point where it's even easier to integrate the legacy PHP in a "conditional" way.

Thanks to the power of component-oriented front-end development (thanks to Svelte for that 🚀 much more practical than Vue or React in our case because of the lack of Virtual DOM), it took me less than a week to develop an architecture that made it easy to redevelop all the old screens/pages in PHP with new components with Svelte and Typescript.

Another big advantage: we had the liberty to create a new portion of the DB infra for future new features (and future DB migration, which is much more complex), and we could have an API (thanks API Platform for that 🎆).

Result: in 6 months, *everything* was ready.<br>
Users could use the legacy application just like before (we changed almost nothing 👌), but it now was easy to rewrite certain screens, which we did in particular for sign-in pages, and changing the work/agency context in the same application.

So, what was done well here?

Simple: we took our time. That's the only relevant thing about it.

Here are some quick examples of what we've been able to do:

* Ask users directly: it might seem silly for some people, but it's the simplest way to find out what's more important in the project, even if it takes a long time. We asked several people what they were working on on a daily basis, what map tools they used the most, etc.
* Adding a production logging tool to find out which PHP pages/files in the legacy application were the most used (and therefore the most critical), less than 1 hour of work, and it allowed us to highlight the priorities for the progressive migration.
* Update the stack, just a few days to be sure.
* Attempt to automatically test the legacy (super hard, but great value!)

Things we didn't do?

* Change the current DB schema. A very bad idea! An application that is more than 15 years old is almost certain to contain architectural errors, often a lack of foreign key constraints, and sometimes even stored procedures that you probably won't see at first glance!
* Force a complete rewrite. It's pointless and it makes the work more complex.
* Use the Doctrine ORM for SQL queries on old tables. One should ever copy and paste the DB schema to transform it into objects! A misplaced command could risk adding thousands of indexes, or changing the definition of certain tables! And in our case, some tables contained tens of millions of rows, so stopping everything for an "ALTER TABLE" query was out of the question!
* For time reasons, we didn't anonymise the production and staging databases. This is something I strongly care about (to avoid leaks, but also for GDPR compliance…), but we only had 6 months. With a bit of extra time, we could have done it!

And as it is, it's a success 🎉

Because we took the time and thought about it thoroughly.

The next article will talk about the full rewrite.
