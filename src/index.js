#! /usr/bin/env node

'use strict';

const prompt = require('prompt');
const promisify = require('promisify-function').default;

const fs = require('fs');
const path = require('path');
const filenamify = require('filenamify');

const GitClient = require('simple-git');
const GitHubClient = require('github');

const createLogger = require('loggety-mclogface');
const colors = require('colors/safe');

const minimist = require('minimist');

const stdlog =
	createLogger({ type: 'info', color: 'yellow'});
const stdcmd =
	createLogger({ type: 'info', color: 'white' });
const stderr =
	createLogger({ type: 'error', color: 'red'});

const argv =
	minimist(process.argv.slice(2));

/* disable GitHub repo creation */
const NO_GITHUB =
	argv['github'] === false;
/* disable dir creation */
const SKIP_MKDIR =
	argv['mkdir'] === false;

/* handy globals */
var name, description, author;
var githubCredentials;
var git;
var projectDir;
var githubUrl;

prompt.message = '';
prompt.start();

promisify(prompt.get)({
	properties: {
		name: {
			description: colors.yellow('Choose an awesome project name'),
			required: true
		},
		description: {
			description: colors.yellow('Brief description'),
			required: true
		},
		author: {
			description: colors.yellow('Your name'),
			required: true
		}
	}
})
/* get name and description of the project */
.then((result) => {
	name =
		result.name;
	description =
		result.description;
	author =
		result.author;
})
/* get GitHub settings */
.then(() => {
	if (NO_GITHUB) return;

	return promisify(prompt.get)({
		properties: {
			username: {
				description: colors.yellow('Your GitHub username'),
				required: true
			},
			password: {
				description: colors.yellow('Your GitHub password'),
				hidden: true,
				required: true
			}
		}
	})
	.then((result) => {
		githubCredentials =
			result;
		githubUrl =
			'https://github.com/' + githubCredentials.username + '/' + name + '.git';
	});
})
/* create project folder */
.then(() => {
	projectDir =
		filenamify(name);

	if (SKIP_MKDIR) return;

	stdlog('Creating dir \'' + projectDir + '\'...');
	stdcmd('mkdir', projectDir);

	fs.mkdirSync(projectDir);
})
/* create README and .gitignore */
.then(() => {
	const gitignore =
		require('../templates/.gitignore.template');
	const readme =
		require('../templates/README.md.template')
			.replace('{package_name}', name)
			.replace('{package_description}', description);

	stdlog('Creating .gitignore and README...');
	stdcmd('npm init');

	fs.writeFileSync(
		path.join(projectDir, '.gitignore'),
		gitignore
	);
	fs.writeFileSync(
		path.join(projectDir, 'README.md'),
		readme
	);
})
/* create a package.json file */
.then(() => {
	const packagejson = {
		name:
			name,
		version:
			'1.0.0',
		description:
			description,
		main:
			'index.js',
		author:
			author,
		license:
			'MIT'
	};

	if (!NO_GITHUB) {
		packagejson.repository =
			githubUrl;
	}

	stdlog('Creating package.json...');
	stdcmd('npm init');

	fs.writeFileSync(
		path.join(projectDir, 'package.json'),
		JSON.stringify(packagejson, null, 2)
	);
})
.then(() =>
	stdlog('Setting up git...')
)
/* git init */
.then(() => {
	stdcmd('git init');

	git = GitClient(projectDir);
	return promisify(git.init.bind(git))();
})
/* git add ./* */
.then(() => {
	stdcmd('git add ./*');
	return promisify(git.add.bind(git))('./*');
})
/* git commit -m  "✨ initial setup ✨" */
.then(() => {
	stdcmd('git commit -m  "✨ initial setup ✨"');
	return promisify(git.commit.bind(git))("✨ initial setup ✨");
})
.then(() => {
	if (NO_GITHUB) return;

	stdlog('Setting up GitHub...');

	const github = new GitHubClient();

	github.authenticate({
		type:
			'basic',
		username:
			githubCredentials.username,
		password:
			githubCredentials.password
	});

	return promisify(github.repos.create.bind(github.repos))({
		name:
			name,
		description:
			description
	})
	/* git remote add origin https://<username>:<password>@github.com/<username>/<project>.git */
	.then(() => {
		stdcmd('git remote add origin ' + githubUrl);

		return promisify(git.addRemote.bind(git))(
			'origin',
			'https://' +
				githubCredentials.username + ':' + githubCredentials.password +
			'@github.com/' +
				githubCredentials.username + '/' + name + '.git'
		);
	})
	/* git push -u origin master */
	.then(() => {
		stdcmd('git push -u origin master');

		return promisify(git.push.bind(git))([
			'-u', 'origin', 'master'
		]);
	})
	/* reset origin url to hide credentials */
	.then(() => {
		return promisify(git.raw.bind(git))([
			'remote', 'set-url', 'origin', githubUrl
		])
	})
	.catch((error) => {
		if (error && error.code === 401) {
			console.error('The GitHub credentials you provided are not valid: skipping GitHub configuration.');
		} else {
			throw error;
		}
	})
})
.then(() =>
	stdlog('Done!')
)
.catch((error) => {
	if (error && error.message === 'canceled') {
		/* Ctrl+C during prompt() */
		return;
	} else {
		console.error('An error occurred:\n', error && (error.stack || error.stack || error));
	}
});
