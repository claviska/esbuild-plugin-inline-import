// typings/esbuild-plugin-inline-import.d.ts

import { Plugin } from 'esbuild';

declare function esbuildPluginInlineImport(options?: {
  /**
   *  A regex filter to match the desired import. Defaults to imports that start with `inline:`, e.g.
   *  import 'inline:./file.ext';
   */
  filter?: RegExp;

  /**
   * The namespace to use. If you use more than one instance of this plugin, each one should have a unique
   * namespace. This is a random string by default, so you won't need to change it unless you're targeting a
   * specific namespace.
   */
  namespace?: string;

  /**
   * A function to transform the contents of the imported file. This can be a simple string replace or a more
   * complex operation, such as a call to PostCSS, Sass, etc. The function must return a string.
   *
   * The contents argument will be a string containing the file's contents. The args argument is passed through from
   * esbuild, but the most useful is probably args.path which references the file path.
   *
   * Note that heavy operations here can impact esbuild's performance!
   */
  transform?: (contents: string, args: { path: string; [key: string]: any }) => Promise<string> | string;
}): Plugin;

export = esbuildPluginInlineImport;

// This allows TypeScript to understand the syntax `import content from 'inline:./file.ext';`
declare module 'inline:*' {
  const content: string;
  export default content;
}
