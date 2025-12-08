import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import {marked} from 'marked';
import {DateTime} from 'luxon';

const TRUNCATE_LENGTH = 200;

type PostConfig = {
	[key: string]: string,
	title?: string,
	date?: string,
	lang?: 'fr'|'en',
	'lang-ref'?: string,
};

export const load = ({ params }) => {

	const { locale } = params;

	const rootDir = process.cwd();

	const postsDir = path.join(rootDir, 'src', 'posts', locale);

	if (!fs.lstatSync(postsDir).isDirectory()) {
		return error(404);
	}

	const dirs = fs.readdirSync(postsDir);

	const posts = dirs
		.sort((a, b) => a > b ? -1 : 1)
		.map(file => getPost(locale, postsDir, file));

	return {
		posts: posts,
	};
};

function getPost(locale: string, postsDir: string, filePath: string): [PostConfig, string] {
	let type: 'md'|'html';
	if (filePath.endsWith('.md')) {
		type = 'md';
	} else if (filePath.endsWith('.html')) {
		type = 'html';
	} else {
		throw new Error(`Unsupported file path "${filePath}", expected "md" or "html".`);
	}

	const [yamlConfig, postContent] = getPostContent(fs.readFileSync(path.join(postsDir, filePath)).toString(), type);

	let date: Date;
	if (yamlConfig.date) {
		date = DateTime.fromFormat(yamlConfig.date, 'yyyy-MM-dd HH:mm:ss Z').toJSDate();
	} else {
		throw new Error('File path "' + filePath + '" does not contain any date.');
	}

	const strDate = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: undefined, timeZone: "Europe/Paris" }).format(date);

	const url = `/${locale}/blog/${filePath.replace('.md', '.html').replace(/^(\d+)-(\d+)-(\d+)-/gi, '$1/$2/$3/')}`;

	return {yamlConfig, postContent, date: strDate, url};
}

function getPostContent(fileContent: string, type: 'md'|'html'): [PostConfig, string] {
	fileContent = fileContent.trim();
	if (!fileContent.startsWith('---')) {
		return [{}, fileContent];
	}

	const endIndex = fileContent.indexOf('---', 3);
	if (endIndex === -1) {
		return [{}, fileContent.substring(3)];
	}

	const yamlContent = fileContent.substring(3, endIndex).trim();
	let postContent = fileContent.substring(endIndex + 3).trim();

	if (postContent.length > TRUNCATE_LENGTH) {
		postContent = postContent.substring(0, TRUNCATE_LENGTH) + "\n(...)";
	}

	if (type === 'md') {
		postContent = marked.parse(postContent);
	}

	postContent = postContent.replace(/<[^>]+>/g, '');
	postContent = postContent.replace("\n", '<br>');

	return [yaml.parse(yamlContent), postContent];
}
