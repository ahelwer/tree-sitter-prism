## Dependencies
 * node.js & npm
   * Windows: `choco install nodejs.install -y`
 * A C/C++ compiler
   * Windows: [Visual Studio C++ Compiler](https://visualstudio.microsoft.com/vs/features/cplusplus/)

## Build & Test
 1. Clone repo and open terminal in root directory
 1. Run `npm install`
 1. Ensure `.\node_modules\.bin` is in your PATH environment variable
 1. Run `tree-sitter generate --log`
 1. Run `tree-sitter test`

## Publish Locally
 1. Run `tree-sitter generate` to create `src` files
 1. Run `npm install` to create `build` files
 1. Consume with `const prism = require('C:\\Users\\ahelwer\\source\\tree-sitter-prism');`