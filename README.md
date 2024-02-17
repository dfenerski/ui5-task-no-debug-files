# Intro

The UI5 tooling V3 always generates `-dbg.js` & `.js.map` files, with no option to remove them. While helpful for debugging purposes, this behavior is sometimes undesirable.

Unfortunately the tooling has no native support for disabling this. However `ui5-task-no-debug-files` plugs this gap. By installing this task, your final bundles will only contain the files you want.

# Installation

### Prerequisites

-   Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

### Setup

1. Start by installing the task as `devDependency`

```bash
npm install ui5-task-no-debug-files --save-dev
```

2. Enable the task in your project's `ui5.yaml`

```yaml
builder:
    customTasks:
        - name: ui5-task-no-debug-files
          afterTask: generateComponentPreload
```

### Configuration Options

The task has a couple of options available which determine which files get omitted. Tweak those to achieve desired build output.

-   `omitDbgFiles` - whether to filter `-dbg.js` files from the output. Defaults to `true`
-   `omitSourceMapFiles` - whether to filter `.js.map` files from the output. Defaults to `true`
-   `omitTSFiles` - whether to filter `.ts` files from the output. Useful when developing in TypeScript setup. Defaults to `true`
-   `omitNonBundled` - whether to filter the original `.js/.xml` files from the output. Defaults to `true`
-   `omitDirs` - Additional directories to be filtered out from the build output. Defaults to `['test', 'i18n']`
-   `preserveNonBundled` - List of glob patterns to be explicitly kept in the output. Useful when a `self-contained` build fails to bundle everything (e.g. it does not bundle lazy loaded fragments)

#### Examples

##### Keep everything

```yaml
builder:
    customTasks:
        - name: ui5-tooling-transpile-task
          afterTask: replaceVersion
        - name: ui5-task-no-debug-files
          afterTask: generateComponentPreload
          configuration:
              omitDbgFiles: false
              omitSourceMapFiles: false
              omitNonBundled: false
              omitTSFiles: false
              omitDirs: []
```

##### Keep i18n.properties & xml files

```yaml
builder:
    customTasks:
        - name: ui5-tooling-transpile-task
          afterTask: replaceVersion
        - name: ui5-task-no-debug-files
          afterTask: generateLibraryPreload
          configuration:
              omitDirs: []
              preserveNonBundled: ['**/*.xml']
```

#### Build modes

-   When building libraries, `ui5-task-no-debug-files` should run after `generateLibraryPreload`
-   When building applications, `ui5-task-no-debug-files` should run
    -   after `generateComponentPreload` if build is not `self-contained`
    -   after `generateStandaloneAppBundle` if build is `self-contained`

## License

This work is [licensed](../../LICENSE) under Apache 2.0.
