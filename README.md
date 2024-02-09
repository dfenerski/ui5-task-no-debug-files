# UI5 task for omitting debug files from a project

> :wave: Feel free to use it, open issues and contribute.

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling non-minified file filtering.

## Prerequisites

-   Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

## Install

```bash
npm install ui5-task-no-debug-files --save-dev
```

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-no-debug-files": "*"
    // ...
}
```

2. enable it in `$yourapp/ui5.yaml`:

```yaml
builder:
    customTasks:
        - name: ui5-task-no-debug-files
          afterTask: generateVersionInfo
```

## How it works

The task can be used to omit any debug, map or non-minified files from the deployed bundle.

## License

This work is [licensed](../../LICENSE) under Apache 2.0.
