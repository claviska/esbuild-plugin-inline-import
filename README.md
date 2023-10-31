# Inline Import Plugin for esbuild

This plugin lets you inline the contents of select static imports. It will turn this:

```js
import string from 'inline:./path/to/file.ext';
```

Into this:

```js
const string = `[contents of ./path/to/file.ext here]`;
```

Optionally, you can configure the import prefix and run the contents of the file through a transform callback. See the example below for details.

**Did this help you out?** Consider [sponsoring my open source work](https://github.com/sponsors/claviska) on GitHub! 🙌

## Installation

```sh
npm install --save-dev esbuild-plugin-inline-import
```

## Usage

Always include this plugin _before_ other plugins, otherwise you may see resolution errors.

```js
const esbuild = require('esbuild');
const inlineImportPlugin = require('esbuild-plugin-inline-import');

esbuild.build({
  entryPoints: ['app.js'],
  bundle: true,
  outfile: 'out.js',
  plugins: [
    // Always include this plugin before others
    inlineImportPlugin()    
  ]
}).catch(() => process.exit(1))
```

## Plugin Options

You can pass any of the following options to the plugin (default values shown):

```js
const plugins = [
  inlineImportPlugin({
    /**
     *  A regex filter to match the desired import. Defaults to imports that start with `inline:`, e.g.
     *  import 'inline:./file.ext';
     */
    filter: /^inline:/,

    /**
     * The namespace to use. If you use more than one instance of this plugin, each one should have a unique
     * namespace. This is a random string by default, so you won't need to change it unless you're targeting a
     * specific namespace.
     */
    namespace: '_' + Math.random().toString(36).substr(2, 9),

    /**
     * A function to transform the contents of the imported file. This can be a simple string replace or a more
     * complex operation, such as a call to PostCSS, Sass, etc. The function must return a string.
     *
     * The contents argument will be a string containing the file's contents. The args argument is passed through from
     * esbuild, but the most useful is probably args.path which references the file path.
     *
     * Note that heavy operations here can impact esbuild's performance!
     */
    transform: async (contents, args) => contents
  })
];
```

## Recipes

### Stacking

You can stack the plugin multiple times to process different types of imports. Remember that this plugin should run _before_ others, otherwise you may see resolution errors.

```js
const plugins = [
  // Inline text with no transforms
  inlineImportPlugin({
    filter: /^text:/
  }),
  // Inline CSS and prepend license info
  inlineImportPlugin({
    filter: /^css:/,
    transform: contents => `/** Licensed under the MIT license */\n${contents}`
  })
];
```

### Inline Sass

The inspiration for this plugin came from the need to parse and inline web component styles. While it may be heavy, sometimes there's no other way. Note that expensive operations like this can impact esbuild's performance. If you're seeing a slowdown, remove the plugin and compare the result. Chances are, the bottleneck is in your transform code.

```js
const sass = require('sass');

const plugins = [
  inlineImportPlugin({
    filter: /^sass:/,
    transform: async (contents, args) => {
      return await new Promise((resolve, reject) => {
        sass.render(
          {
            data: contents,
            includePaths: [path.dirname(args.path)]
          },
          (err, result) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(result.css.toString());
          }
        );
      });
    }
  })
];
```

To use it:

```js
import styles from 'sass:./components/button/button.scss';

// becomes

const styles = '[resulting CSS styles here]';
```

## Changelog

### 1.0.2

- Added TypeScript types [#2](https://github.com/claviska/esbuild-plugin-inline-import/pull/2)

### 1.0.1

- Bug fixes

### 1.0.0 

- Initial release