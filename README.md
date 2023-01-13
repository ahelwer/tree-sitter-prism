This grammar is not currently being worked on nor do I intend to work on it within the next few years. If you are looking to create a tree-sitter grammar for PRISM this might be a good starting point and I encourage you to take ownership. PRISM doesn't really have a language standard spec; you'll have to draw from the JavaCC grammar. See https://groups.google.com/g/prismmodelchecker/c/RhlVevq9GsU/m/1hf4aVy8AgAJ

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
