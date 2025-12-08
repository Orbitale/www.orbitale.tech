import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import {marked} from 'marked';
import {DateTime} from 'luxon';

type PostConfig = {
	[key: string]: string,
	title?: string,
	date?: string,
	lang?: 'fr'|'en',
	'lang-ref'?: string,
};

export const load = ({ params }) => {

	let { locale, year, month, day, slug } = params;

	if (isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) {
		return error(404);
	}

	// HTML isn't needed to check for the file's availability
	slug = slug.replace(/\.html$/i, '');

	const fileResult = getFileContent(locale, day, month, year, slug);

	if (!fileResult) {
		return error(404);
	}

	const [fileContent, type] = fileResult;

	const split = splitYamlAndContent(fileContent);
	const yamlConfig = split[0];
	let postContent = split[1];

	if (type === 'md') {
		postContent = marked.parse(postContent);
	}

	let date: Date;
	if (yamlConfig.date) {
		date = DateTime.fromFormat(yamlConfig.date, 'yyyy-MM-dd HH:mm:ss Z').toJSDate();
	} else {
		date = DateTime.fromFormat(`${year}-${month}-${day}`, 'yyyy-MM-dd').toJSDate();
	}

	const langRef = yamlConfig['lang-ref'] ?? null;

	const otherLanguagePostUrl = yamlConfig['lang-ref'] ? getOtherLanguagePostUrl(locale, langRef) : null;

	const strDate = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" }).format(date);

	return {
		yamlConfig,
		postContent,
		locale,
		date: strDate,
		otherLanguagePostUrl,
	};
};

function getFileContent(locale: string, day: string, month: string, year: string, slug: string): null|[string, 'md'|'html'] {
	let filePath = null;
	let type: 'md'|'html' = 'md';

	const rootDir = process.cwd();

	const postsPath = path.join(rootDir, 'src', 'posts', locale);
	const md = `${year}-${month}-${day}-${slug}.md`;
	const html = `${year}-${month}-${day}-${slug}.html`;

	try {
		filePath = path.join(postsPath, md);
		if (!fs.existsSync(filePath)) {
			filePath = path.join(postsPath, html);
			type = 'html';
		}
		if (!fs.existsSync(filePath)) {
			return null;
		}
	} catch {
		return null;
	}

	return [
		String(fs.readFileSync(filePath)),
		type,
	];
}

function splitYamlAndContent(fileContent: string): [PostConfig, string] {
	fileContent = fileContent.trim();
	if (!fileContent.startsWith('---')) {
		return [{}, fileContent];
	}

	const endIndex = fileContent.indexOf('---', 3);
	if (endIndex === -1) {
		return [{}, fileContent.substring(3)];
	}

	const yamlContent = fileContent.substring(3, endIndex).trim();
	const postContent = fileContent.substring(endIndex + 3).trim();

	return [yaml.parse(yamlContent), postContent];
}

function getOtherLanguagePostUrl(currentLocale: string, langRef: string) {
	const lookingForLocale = currentLocale === 'en' ? 'fr' : 'en';

	const rootDir = process.cwd();
	const postsDir = path.join(rootDir, 'src', 'posts', lookingForLocale);

	if (!fs.existsSync(postsDir)) {
		return null;
	}

	const files = fs.readdirSync(postsDir);

	for (const file of files) {
		const match = file.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|html)$/);
		if (!match) {
			continue;
		}

		const [, year, month, day, slug] = match;
		const filePath = path.join(postsDir, file);
		const fileContent = String(fs.readFileSync(filePath));
		const [yamlConfig] = splitYamlAndContent(fileContent);

		if (yamlConfig['lang-ref'] === langRef) {
			return {
				url: `/${lookingForLocale}/blog/${year}/${month}/${day}/${slug}`,
				anchor: (lookingForLocale === 'en' ? '🇬🇧' : '🇫🇷') + ' ' + currentLocale.toUpperCase(),
			};
		}
	}

	return null;
}
