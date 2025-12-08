import {addMessages, locale, init as baseInit} from 'svelte-i18n';
import { dictionary as fr } from '../translations/_fr';
import { dictionary as en } from '../translations/_en';

addMessages('fr', fr);
addMessages('en', en);

export function init(lang: string) {
    if (lang !== 'fr' && lang !== 'en') {
        throw new Error(`Invalid locale ${lang}`);
    }

    locale.set(lang);

    baseInit({
        fallbackLocale: lang,
        initialLocale: lang,
    });
}
