# init-npm-project
### arrange a minimal setup for an npm project

## Installation
This package is best consumed as a CLI command, so
```
npm install --global init-npm-project
```

## Usage
```bash
init-npm-project [--no-github] [--no-mkdir]
```

![console output](https://raw.githubusercontent.com/mattecapu/init-npm-project/master/screen.png)

#### `--no-mkdir`
Do not create a dir but use an existent one.<br />
Be careful because the tool may overwrite existing files (`package.json`, `README.md`, `.gitignore`).

#### `--no-github`
If this flag is specified, nothing GitHub-related will be done.<br />
Otherwise, the tool will ask for your GitHub credentials (which are not stored in any way, you can check the code).

## License
MIT
