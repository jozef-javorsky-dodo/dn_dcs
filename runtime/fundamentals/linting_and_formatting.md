---
title: "Linting and formatting"
description: "A guide to Deno's built-in code quality tools. Learn how to use deno lint and deno fmt commands, configure rules, integrate with CI/CD pipelines, and maintain consistent code style across your projects."
---

In an ideal world, your code is always clean, consistent, and free of pesky
errors. That's the promise of Deno's built-in linting and formatting tools. By
integrating these features directly into the runtime, Deno eliminates the need
for external dependencies and complex configurations in your projects. These
inbuilt tools are fast and performant, not only saving time but also ensuring
that every line of code adheres to best practices.

With `deno fmt` and `deno lint`, you can focus on writing great code, knowing
that Deno has your back. It's like having a vigilant assistant who keeps your
codebase in top shape, allowing you to concentrate on what truly matters:
building amazing applications.

## Linting

<a href="/lint/" type="docs-cta runtime-cta">Explore all the lint rules</a>

Linting is the process of analyzing your code for potential errors, bugs, and
stylistic issues. Deno's built-in linter,
[`deno lint`](/runtime/reference/cli/linter/), supports recommended set of rules
from [ESLint](https://eslint.org/) to provide comprehensive feedback on your
code. This includes identifying syntax errors, enforcing coding conventions, and
highlighting potential issues that could lead to bugs.

To run the linter, use the following command in your terminal:

```bash
deno lint
```

By default, `deno lint` analyzes all TypeScript and JavaScript files in the
current directory and its subdirectories. If you want to lint specific files or
directories, you can pass them as arguments to the command. For example:

```bash
deno lint src/
```

This command will lint all files in the `src/` directory.

The linter can be configured in a
[`deno.json`](/runtime/fundamentals/configuration/#linting) file. You can
specify custom rules, plugins, and settings to tailor the linting process to
your needs.

### Linting rules

You can view and search the list of available rules and their usage on the
[List of rules](/lint/) documentation page.

## Formatting

Formatting is the process of automatically adjusting the layout of your code to
adhere to a consistent style. Deno's built-in formatter, `deno fmt`, uses the
powerful [dprint](https://dprint.dev/) engine to ensure that your code is always
clean, readable, and consistent.

To format your code, simply execute the following command in your terminal:

```bash
deno fmt
```

By default, `deno fmt` formats all TypeScript and JavaScript files in the
current directory and its subdirectories. If you want to format specific files
or directories, you can pass them as arguments to the command. For example:

```bash
deno fmt src/
```

This command will format all files in the `src/` directory.

### Checking your formatting

The `deno fmt --check` command is used to verify if your code is properly
formatted according to Deno's default formatting rules. Instead of modifying the
files, it checks them and reports any formatting issues. This is particularly
useful for integrating into continuous integration (CI) pipelines or pre-commit
hooks to ensure code consistency across your project.

If there are formatting issues, `deno fmt --check` will list the files that need
formatting. If all files are correctly formatted, it will simply exit without
any output.

### Integration in CI

You can add `deno fmt --check` to your CI pipeline to automatically check for
formatting issues. For example, in a GitHub Actions workflow:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x
      - run: deno fmt --check
```

This ensures that any code changes adhere to the project's formatting standards
before being merged.

### Integration in VS Code

To enable Deno as your formatter in VS Code, you have to set it up as your
default formatter in the settings, and then add a `.vscode/settings.json` file
in the root of your project with the following configuration:

```json
{
  "deno.enablePaths": [
    "./deno.json"
  ]
}
```

If your `deno.json(c)` file is located in a subdirectory of your project,
provide the correct relative path to it instead.

### Available options

#### `bracePosition`

Define brace position for blocks

- **Default:** `sameLine`
- **Possible values:** `maintain`, `sameLine`, `nextLine`,
  `sameLineUnlessHanging`

#### `jsx.bracketPosition`

Define bracket position for JSX

- **Default:** `nextLine`
- **Possible values:** `maintain`, `sameLine`, `nextLine`

#### `jsx.forceNewLinesSurroundingContent`

Forces newlines surrounding the content of JSX elements

- **Default:** `false`
- **Possible values:** `true`, `false`

#### `jsx.multiLineParens`

Surrounds the top-most JSX element or fragment in parentheses when it spans
multiple lines

- **Default:** `prefer`
- **Possible values:** `never`, `prefer`, `always`

#### `indentWidth`

Define indentation width

- **Default:** `2`
- **Possible values:** `number`

#### `lineWidth`

Define maximum line width

- **Default:** `80`
- **Possible values:** `number`

#### `newLineKind`

The newline character to use

- **Default:** `lf`
- **Possible values:** `auto`, `crlf`, `lf`, `system`

#### `nextControlFlowPosition`

Define position of next control flow

- **Default:** `sameLine`
- **Possible values:** `sameLine`, `nextLine`, `maintain`

#### `semiColons`

Whether to prefer using semicolons.

- **Default:** `true`
- **Possible values:** `true`, `false`

#### `operatorPosition`

Where to place the operator for expressions that span multiple lines

- **Default:** `sameLine`
- **Possible values:** `sameLine`, `nextLine`, `maintain`

#### `proseWrap`

Define how prose should be wrapped

- **Default:** `always`
- **Possible values:** `always`, `never`, `preserve`

#### `quoteProps`

Control quoting of object properties

- **Default:** `asNeeded`
- **Possible values:** `asNeeded`, `consistent`, `preserve`

#### `singleBodyPosition`

The position of the body in single body blocks

- **Default:** `sameLineUnlessHanging`
- **Possible values:** `sameLine`, `nextLine`, `maintain`,
  `sameLineUnlessHanging`

#### `singleQuote`

Use single quotes

- **Default:** `false`
- **Possible values:** `true`, `false`

#### `spaceAround`

Control spacing around enclosed expressions

- **Default:** `false`
- **Possible values:** `true`, `false`

#### `spaceSurroundingProperties`

Control spacing surrounding single line object-like nodes

- **Default:** `true`
- **Possible values:** `true`, `false`

#### `trailingCommas`

Control trailing commas in multi-line arrays/objects

- **Default:** `always`
- **Possible values:** `always`, `never`

#### `typeLiteral.separatorKind`

Define separator kind for type literals

- **Default:** `semiColon`
- **Possible values:** `comma`, `semiColon`

#### unstable-component

Enable formatting Svelte, Vue, Astro and Angular files

#### `unstable-sql`

Enable formatting SQL files

#### `useTabs`

Use tabs instead of spaces for indentation

- **Default:** `false`
- **Possible values:** `true`, `false`

#### `useBraces`

Whether to use braces for if statements, for statements, and while statements

- **Default:** `whenNotSingleLine`
- **Possible values:** `maintain`, `whenNotSingleLine`, `always`, preferNone

### Configuration

The formatter can be configured in a
[`deno.json`](/runtime/fundamentals/configuration/#formatting) file. You can
specify custom settings to tailor the formatting process to your needs.
