# init-npm-project
### arrange a minimal setup for an npm project

## Installation
This package is best consumed as a CLI command, so
```
npm install --global init-npm-project
```

## Usage
```bash
init-npm-project [--name] [--description] [--author] [--no-github] [--no-mkdir]
```
By default, name, description and author name are asked before creation. If you like one-liners, you may provide them using the named args.<br />
GitHub credentials cannot be provided as args, you always have to type them.

![console output](https://raw.githubusercontent.com/mattecapu/init-npm-project/master/screen.png)

#### `--name`
The name of your next project.

#### `--description`
The description of you next project.

#### `--author`
Your name (and optionally email). This gets directly dumped in the `package.json` author field.

#### `--no-mkdir`
Do not create a dir but use an existent one.<br />
Be careful because the tool may overwrite existing files (`package.json`, `README.md`, `.gitignore`).

#### `--no-github`
If this flag is specified, nothing GitHub-related will be done.<br />
Otherwise, the tool will ask for your GitHub credentials (which are not stored in any way, you can check the code).

## License
MIT
