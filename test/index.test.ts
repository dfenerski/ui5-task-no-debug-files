import assert from 'assert';
import { spawnSync } from 'child_process';
import { randomBytes } from 'crypto';
import { existsSync, readdirSync, rmSync } from 'fs';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { resolve } from 'path';

type SuiteContext = {
    name: string;
    signal: AbortSignal;
    // Custom properties
    tmpDir?: string;
};

/**
 * Learning from the masters https://github.com/ui5-community/ui5-ecosystem-showcase/blob/main/packages/ui5-task-zipper/test/zipper.test.js
 * Augmented to use the native node test runner - zero dep testing, given you have node 20+ https://github.com/nvm-sh/nvm
 */
describe('app', () => {
    beforeEach((ctx: SuiteContext) => {
        ctx.tmpDir = resolve(
            `./test/__dist__/${randomBytes(5).toString('hex')}`,
        );
    });

    afterEach((ctx: SuiteContext) => {
        rmSync(ctx.tmpDir!, { recursive: true, force: true });
    });

    it('should result in only 4 files with default options', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.app/ui5.basic.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.app'),
            },
        );
        const Paths = {
            componentPreload: resolve(
                ctx.tmpDir!,
                'dist',
                'Component-preload.js',
            ),
            indexCdn: resolve(ctx.tmpDir!, 'dist', 'index-cdn.html'),
            index: resolve(ctx.tmpDir!, 'dist', 'index.html'),
            manifest: resolve(ctx.tmpDir!, 'dist', 'manifest.json'),
            dist: resolve(ctx.tmpDir!, 'dist'),
        };
        assert.equal(existsSync(Paths.componentPreload), true);
        assert.equal(existsSync(Paths.indexCdn), true);
        assert.equal(existsSync(Paths.index), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(readdirSync(Paths.dist).length, 4);
    });

    it('should do nothing if settings are not enabled', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.app/ui5.noOmissions.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.app'),
            },
        );
        const Paths = {
            component: resolve(ctx.tmpDir!, 'dist', 'Component.js'),
            componentMap: resolve(ctx.tmpDir!, 'dist', 'Component.js.map'),
            componentDbg: resolve(ctx.tmpDir!, 'dist', 'Component-dbg.js'),
            componentDbgMap: resolve(
                ctx.tmpDir!,
                'dist',
                'Component-dbg.js.map',
            ),
            componentPreload: resolve(
                ctx.tmpDir!,
                'dist',
                'Component-preload.js',
            ),
            componentPreloadMap: resolve(
                ctx.tmpDir!,
                'dist',
                'Component-preload.js.map',
            ),
            componentTS: resolve(ctx.tmpDir!, 'dist', 'Component.ts'),
            indexCdn: resolve(ctx.tmpDir!, 'dist', 'index-cdn.html'),
            index: resolve(ctx.tmpDir!, 'dist', 'index.html'),
            manifest: resolve(ctx.tmpDir!, 'dist', 'manifest.json'),
            controller: resolve(ctx.tmpDir!, 'dist', 'controller'),
            i18n: resolve(ctx.tmpDir!, 'dist', 'i18n'),
            model: resolve(ctx.tmpDir!, 'dist', 'model'),
            test: resolve(ctx.tmpDir!, 'dist', 'test'),
            view: resolve(ctx.tmpDir!, 'dist', 'view'),
            dist: resolve(ctx.tmpDir!, 'dist'),
        };
        assert.equal(existsSync(Paths.component), true);
        assert.equal(existsSync(Paths.componentMap), true);
        assert.equal(existsSync(Paths.componentDbg), true);
        assert.equal(existsSync(Paths.componentDbgMap), true);
        assert.equal(existsSync(Paths.componentPreload), true);
        assert.equal(existsSync(Paths.componentPreloadMap), true);
        assert.equal(existsSync(Paths.componentTS), true);
        assert.equal(existsSync(Paths.indexCdn), true);
        assert.equal(existsSync(Paths.index), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(readdirSync(Paths.dist).length, 15);
    });

    it('should output both dbg & normal assets when both flags are raised', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.app/ui5.withDbgFiles.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.app'),
            },
        );
        const Paths = {
            componentPreload: resolve(
                ctx.tmpDir!,
                'dist',
                'Component-preload.js',
            ),
            componentDbg: resolve(ctx.tmpDir!, 'dist', 'Component-dbg.js'),
            component: resolve(ctx.tmpDir!, 'dist', 'Component.js'),
            indexCdn: resolve(ctx.tmpDir!, 'dist', 'index-cdn.html'),
            index: resolve(ctx.tmpDir!, 'dist', 'index.html'),
            manifest: resolve(ctx.tmpDir!, 'dist', 'manifest.json'),
            controller: resolve(ctx.tmpDir!, 'dist', 'controller'),
            model: resolve(ctx.tmpDir!, 'dist', 'model'),
            view: resolve(ctx.tmpDir!, 'dist', 'view'),
            dist: resolve(ctx.tmpDir!, 'dist'),
        };
        assert.equal(existsSync(Paths.componentPreload), true);
        assert.equal(existsSync(Paths.component), true);
        assert.equal(existsSync(Paths.componentDbg), true);
        assert.equal(existsSync(Paths.indexCdn), true);
        assert.equal(existsSync(Paths.index), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(readdirSync(Paths.controller).length, 6);
        assert.equal(readdirSync(Paths.model).length, 4);
        assert.equal(readdirSync(Paths.view).length, 2);
        assert.equal(readdirSync(Paths.dist).length, 9);
    });

    it('should output dbg, sourceMap & normal assets when flags are raised', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.app/ui5.withSourceMapFiles.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.app'),
            },
        );
        const Paths = {
            component: resolve(ctx.tmpDir!, 'dist', 'Component.js'),
            componentMap: resolve(ctx.tmpDir!, 'dist', 'Component.js.map'),
            componentDbg: resolve(ctx.tmpDir!, 'dist', 'Component-dbg.js'),
            componentDbgMap: resolve(
                ctx.tmpDir!,
                'dist',
                'Component-dbg.js.map',
            ),
            componentPreload: resolve(
                ctx.tmpDir!,
                'dist',
                'Component-preload.js',
            ),
            componentPreloadMap: resolve(
                ctx.tmpDir!,
                'dist',
                'Component-preload.js.map',
            ),
            indexCdn: resolve(ctx.tmpDir!, 'dist', 'index-cdn.html'),
            index: resolve(ctx.tmpDir!, 'dist', 'index.html'),
            manifest: resolve(ctx.tmpDir!, 'dist', 'manifest.json'),
            controller: resolve(ctx.tmpDir!, 'dist', 'controller'),
            model: resolve(ctx.tmpDir!, 'dist', 'model'),
            view: resolve(ctx.tmpDir!, 'dist', 'view'),
            dist: resolve(ctx.tmpDir!, 'dist'),
        };
        assert.equal(existsSync(Paths.component), true);
        assert.equal(existsSync(Paths.componentMap), true);
        assert.equal(existsSync(Paths.componentDbg), true);
        assert.equal(existsSync(Paths.componentDbgMap), true);
        assert.equal(existsSync(Paths.componentPreload), true);
        assert.equal(existsSync(Paths.componentPreloadMap), true);
        assert.equal(existsSync(Paths.indexCdn), true);
        assert.equal(existsSync(Paths.index), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(readdirSync(Paths.controller).length, 6 * 2);
        assert.equal(readdirSync(Paths.model).length, 4 * 2);
        assert.equal(readdirSync(Paths.view).length, 2);
        assert.equal(readdirSync(Paths.dist).length, 12);
    });

    it('should output TS assets when flag is raised', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.app/ui5.withTSFiles.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.app'),
            },
        );
        const Paths = {
            componentPreload: resolve(
                ctx.tmpDir!,
                'dist',
                'Component-preload.js',
            ),
            componentTS: resolve(ctx.tmpDir!, 'dist', 'Component.ts'),
            indexCdn: resolve(ctx.tmpDir!, 'dist', 'index-cdn.html'),
            index: resolve(ctx.tmpDir!, 'dist', 'index.html'),
            manifest: resolve(ctx.tmpDir!, 'dist', 'manifest.json'),
            controller: resolve(ctx.tmpDir!, 'dist', 'controller'),
            model: resolve(ctx.tmpDir!, 'dist', 'model'),
            view: resolve(ctx.tmpDir!, 'dist', 'view'),
            dist: resolve(ctx.tmpDir!, 'dist'),
        };
        assert.equal(existsSync(Paths.componentPreload), true);
        assert.equal(existsSync(Paths.componentTS), true);
        assert.equal(existsSync(Paths.indexCdn), true);
        assert.equal(existsSync(Paths.index), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(readdirSync(Paths.controller).length, 3);
        assert.equal(readdirSync(Paths.model).length, 2);
        assert.equal(readdirSync(Paths.dist).length, 7);
    });

    it('should omit arbitrary dirs based on array input', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.app/ui5.withSomeDirs.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.app'),
            },
        );
        const Paths = {
            component: resolve(ctx.tmpDir!, 'dist', 'Component.js'),
            componentMap: resolve(ctx.tmpDir!, 'dist', 'Component.js.map'),
            componentDbg: resolve(ctx.tmpDir!, 'dist', 'Component-dbg.js'),
            componentDbgMap: resolve(
                ctx.tmpDir!,
                'dist',
                'Component-dbg.js.map',
            ),
            componentPreload: resolve(
                ctx.tmpDir!,
                'dist',
                'Component-preload.js',
            ),
            componentPreloadMap: resolve(
                ctx.tmpDir!,
                'dist',
                'Component-preload.js.map',
            ),
            indexCdn: resolve(ctx.tmpDir!, 'dist', 'index-cdn.html'),
            index: resolve(ctx.tmpDir!, 'dist', 'index.html'),
            manifest: resolve(ctx.tmpDir!, 'dist', 'manifest.json'),
            i18n: resolve(ctx.tmpDir!, 'dist', 'i18n'),
            view: resolve(ctx.tmpDir!, 'dist', 'view'),
            dist: resolve(ctx.tmpDir!, 'dist'),
        };
        assert.equal(existsSync(Paths.component), true);
        assert.equal(existsSync(Paths.componentMap), true);
        assert.equal(existsSync(Paths.componentDbg), true);
        assert.equal(existsSync(Paths.componentDbgMap), true);
        assert.equal(existsSync(Paths.componentPreload), true);
        assert.equal(existsSync(Paths.componentPreloadMap), true);
        assert.equal(existsSync(Paths.indexCdn), true);
        assert.equal(existsSync(Paths.index), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(readdirSync(Paths.i18n).length, 3);
        assert.equal(readdirSync(Paths.view).length, 2);
        assert.equal(readdirSync(Paths.dist).length, 12);
    });

    it('should contain only the indexes, the manifest, resources, test-resources & custom bootstrap in self-contained mode', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.app/ui5.selfContained.yaml',
            ),
        };
        spawnSync(
            `ui5 build self-contained --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.app'),
            },
        );
        const Paths = {
            indexCdn: resolve(ctx.tmpDir!, 'dist', 'index-cdn.html'),
            index: resolve(ctx.tmpDir!, 'dist', 'index.html'),
            manifest: resolve(ctx.tmpDir!, 'dist', 'manifest.json'),
            customBoot: resolve(
                ctx.tmpDir!,
                'dist',
                'resources',
                'sap-ui-custom.js',
            ),
            dist: resolve(ctx.tmpDir!, 'dist'),
        };
        assert.equal(existsSync(Paths.indexCdn), true);
        assert.equal(existsSync(Paths.index), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(existsSync(Paths.customBoot), true);
        assert.equal(readdirSync(Paths.dist).length, 4);
    });
});

describe('lib', () => {
    beforeEach((ctx: SuiteContext) => {
        ctx.tmpDir = resolve(
            `./test/__dist__/${randomBytes(5).toString('hex')}`,
        );
    });

    afterEach((ctx: SuiteContext) => {
        rmSync(ctx.tmpDir!, { recursive: true, force: true });
    });

    it('should result in only 4 files with default options', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.library/ui5.basic.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.library'),
            },
        );
        const libSrc = resolve(
            ctx.tmpDir!,
            'dist',
            'resources',
            'com',
            'github',
            'dfenerski',
            'library',
        );
        const Paths = {
            themes: resolve(libSrc, 'themes'),
            dotLibrary: resolve(libSrc, '.library'),
            libraryPreload: resolve(libSrc, 'library-preload.js'),
            manifest: resolve(libSrc, 'manifest.json'),
        };
        assert.equal(existsSync(Paths.themes), true);
        assert.equal(existsSync(Paths.dotLibrary), true);
        assert.equal(existsSync(Paths.libraryPreload), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(readdirSync(libSrc).length, 7);
    });

    it('should do nothing if settings are not enabled', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.library/ui5.noOmissions.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.library'),
            },
        );
        const libSrc = resolve(
            ctx.tmpDir!,
            'dist',
            'resources',
            'com',
            'github',
            'dfenerski',
            'library',
        );
        const Paths = {
            indexDTS: resolve(ctx.tmpDir!, 'dist', 'index.d.ts'),
            themes: resolve(libSrc, 'themes'),
            dotLibrary: resolve(libSrc, '.library'),
            libraryPreload: resolve(libSrc, 'library-preload.js'),
            manifest: resolve(libSrc, 'manifest.json'),
        };
        assert.equal(existsSync(Paths.indexDTS), true);
        assert.equal(existsSync(Paths.themes), true);
        assert.equal(existsSync(Paths.dotLibrary), true);
        assert.equal(existsSync(Paths.libraryPreload), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(readdirSync(libSrc).length, 31);
    });

    it('should output both dbg & normal assets when both flags are raised', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.library/ui5.withDbgFiles.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.library'),
            },
        );
        const libSrc = resolve(
            ctx.tmpDir!,
            'dist',
            'resources',
            'com',
            'github',
            'dfenerski',
            'library',
        );
        const Paths = {
            themes: resolve(libSrc, 'themes'),
            dotLibrary: resolve(libSrc, '.library'),
            ExampleDbg: resolve(libSrc, 'Example-dbg.js'),
            Example: resolve(libSrc, 'Example.js'),
            ExampleRendererDbg: resolve(libSrc, 'ExampleRenderer-dbg.js'),
            ExampleRenderer: resolve(libSrc, 'ExampleRenderer.js'),
            libraryDbg: resolve(libSrc, 'library-dbg.js'),
            libraryPreload: resolve(libSrc, 'library-preload.js'),
            library: resolve(libSrc, 'library.js'),
            manifest: resolve(libSrc, 'manifest.json'),
        };
        assert.equal(existsSync(Paths.themes), true);
        assert.equal(existsSync(Paths.dotLibrary), true);
        assert.equal(existsSync(Paths.ExampleDbg), true);
        assert.equal(existsSync(Paths.Example), true);
        assert.equal(existsSync(Paths.ExampleRendererDbg), true);
        assert.equal(existsSync(Paths.ExampleRenderer), true);
        assert.equal(existsSync(Paths.libraryDbg), true);
        assert.equal(existsSync(Paths.libraryPreload), true);
        assert.equal(existsSync(Paths.library), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(readdirSync(libSrc).length, 14);
    });

    it('should output dbg, sourceMap & normal assets when flags are raised', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.library/ui5.withSourceMapFiles.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.library'),
            },
        );
        const libSrc = resolve(
            ctx.tmpDir!,
            'dist',
            'resources',
            'com',
            'github',
            'dfenerski',
            'library',
        );
        const Paths = {
            themes: resolve(libSrc, 'themes'),
            dotLibrary: resolve(libSrc, '.library'),
            ExampleDbg: resolve(libSrc, 'Example-dbg.js'),
            ExampleDbgMap: resolve(libSrc, 'Example-dbg.js.map'),
            Example: resolve(libSrc, 'Example.js'),
            ExampleMap: resolve(libSrc, 'Example.js.map'),
            ExampleRendererDbg: resolve(libSrc, 'ExampleRenderer-dbg.js'),
            ExampleRendererDbgMap: resolve(
                libSrc,
                'ExampleRenderer-dbg.js.map',
            ),
            ExampleRenderer: resolve(libSrc, 'ExampleRenderer.js'),
            ExampleRendererMap: resolve(libSrc, 'ExampleRenderer.js.map'),
            libraryDbg: resolve(libSrc, 'library-dbg.js'),
            libraryDbgMap: resolve(libSrc, 'library-dbg.js.map'),
            libraryPreload: resolve(libSrc, 'library-preload.js'),
            libraryPreloadMap: resolve(libSrc, 'library-preload.js.map'),
            library: resolve(libSrc, 'library.js'),
            libraryMap: resolve(libSrc, 'library.js.map'),
            manifest: resolve(libSrc, 'manifest.json'),
        };
        assert.equal(existsSync(Paths.themes), true);
        assert.equal(existsSync(Paths.dotLibrary), true);
        assert.equal(existsSync(Paths.ExampleDbg), true);
        assert.equal(existsSync(Paths.ExampleDbgMap), true);
        assert.equal(existsSync(Paths.Example), true);
        assert.equal(existsSync(Paths.ExampleMap), true);
        assert.equal(existsSync(Paths.ExampleRendererDbg), true);
        assert.equal(existsSync(Paths.ExampleRendererDbgMap), true);
        assert.equal(existsSync(Paths.ExampleRenderer), true);
        assert.equal(existsSync(Paths.ExampleRendererMap), true);
        assert.equal(existsSync(Paths.libraryDbg), true);
        assert.equal(existsSync(Paths.libraryDbgMap), true);
        assert.equal(existsSync(Paths.libraryPreload), true);
        assert.equal(existsSync(Paths.libraryPreloadMap), true);
        assert.equal(existsSync(Paths.library), true);
        assert.equal(existsSync(Paths.libraryMap), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(readdirSync(libSrc).length, 24);
    });

    it('should output TS assets when flag is raised', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.library/ui5.withTSFiles.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.library'),
            },
        );
        const libSrc = resolve(
            ctx.tmpDir!,
            'dist',
            'resources',
            'com',
            'github',
            'dfenerski',
            'library',
        );
        const Paths = {
            indexDTS: resolve(ctx.tmpDir!, 'dist', 'index.d.ts'),
            themes: resolve(libSrc, 'themes'),
            dotLibrary: resolve(libSrc, '.library'),
            libraryPreload: resolve(libSrc, 'library-preload.js'),
            libraryDTS: resolve(libSrc, 'library.d.ts'),
            libraryTS: resolve(libSrc, 'library.ts'),
            manifest: resolve(libSrc, 'manifest.json'),
            ExampleDTS: resolve(libSrc, 'Example.d.ts'),
            ExampleGenDTS: resolve(libSrc, 'Example.gen.d.ts'),
            ExampleTS: resolve(libSrc, 'Example.ts'),
            ExampleRendererDTS: resolve(libSrc, 'ExampleRenderer.d.ts'),
            ExampleRendererTS: resolve(libSrc, 'ExampleRenderer.ts'),
        };
        assert.equal(existsSync(Paths.indexDTS), true);
        assert.equal(existsSync(Paths.themes), true);
        assert.equal(existsSync(Paths.dotLibrary), true);
        assert.equal(existsSync(Paths.libraryPreload), true);
        assert.equal(existsSync(Paths.libraryDTS), true);
        assert.equal(existsSync(Paths.libraryTS), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(existsSync(Paths.ExampleDTS), true);
        assert.equal(existsSync(Paths.ExampleGenDTS), true);
        assert.equal(existsSync(Paths.ExampleTS), true);
        assert.equal(existsSync(Paths.ExampleRendererDTS), true);
        assert.equal(existsSync(Paths.ExampleRendererTS), true);
        assert.equal(readdirSync(libSrc).length, 14);
    });

    it('should omit arbitrary dirs based on array input', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.library/ui5.withSomeDirs.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.library'),
            },
        );
        const libSrc = resolve(
            ctx.tmpDir!,
            'dist',
            'resources',
            'com',
            'github',
            'dfenerski',
            'library',
        );
        const Paths = {
            themes: resolve(libSrc, 'themes'),
        };
        assert.equal(existsSync(Paths.themes), false);
        assert.equal(readdirSync(libSrc).length, 23);
    });

    it('should respect preserveNonBundled patterns', (ctx: SuiteContext) => {
        const ui5 = {
            yaml: resolve(
                './test/__assets__/com.github.dfenerski.library/ui5.preserveNonBundled.yaml',
            ),
        };
        spawnSync(
            `ui5 build --config "${ui5.yaml}" --dest "${resolve(
                `${ctx.tmpDir}/dist`,
            )}"`,
            {
                stdio: 'inherit',
                shell: true,
                cwd: resolve('./test/__assets__/com.github.dfenerski.library'),
            },
        );
        const libSrc = resolve(
            ctx.tmpDir!,
            'dist',
            'resources',
            'com',
            'github',
            'dfenerski',
            'library',
        );
        const Paths = {
            themes: resolve(libSrc, 'themes'),
            scriptsCustom: resolve(libSrc, 'scripts-custom'),
            fiddle: resolve(libSrc, 'scripts-custom', 'dontDeleteMe.js'),
            dotLibrary: resolve(libSrc, '.library'),
            libraryPreload: resolve(libSrc, 'library-preload.js'),
            manifest: resolve(libSrc, 'manifest.json'),
        };
        assert.equal(existsSync(Paths.themes), true);
        assert.equal(existsSync(Paths.scriptsCustom), true);
        assert.equal(existsSync(Paths.fiddle), true);
        assert.equal(existsSync(Paths.dotLibrary), true);
        assert.equal(existsSync(Paths.libraryPreload), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(readdirSync(libSrc).length, 8);
    });
});

describe('consumer app', () => {
    it('should produce minimalistic app & lib bundles that work; given default options provided to app & lib', (ctx: SuiteContext) => {
        // Ideally both should be copied to temp dirs but I dont have the time right now to make rsync work on this windows machine. Either way, we can allow asset dist folder contamination for the last test I guess
        spawnSync(`ui5 build --clean-dest`, {
            stdio: 'inherit',
            shell: true,
            cwd: resolve('./test/__assets__/com.github.dfenerski.library'),
        });
        spawnSync(`ui5 build self-contained --clean-dest --all`, {
            stdio: 'inherit',
            shell: true,
            cwd: resolve('./test/__assets__/com.github.dfenerski.consumer_app'),
        });
        const appSrc = resolve(
            './test/__assets__/com.github.dfenerski.consumer_app/dist',
        );
        console.error(appSrc);
        const Paths = {
            resources: resolve(appSrc, 'resources'),
            testResources: resolve(appSrc, 'test-resources'),
            indexCdn: resolve(appSrc, 'index-cdn.html'),
            index: resolve(appSrc, 'index.html'),
            manifest: resolve(appSrc, 'manifest.json'),
        };
        assert.equal(existsSync(Paths.resources), true);
        assert.equal(existsSync(Paths.testResources), true);
        assert.equal(existsSync(Paths.indexCdn), true);
        assert.equal(existsSync(Paths.index), true);
        assert.equal(existsSync(Paths.manifest), true);
        assert.equal(readdirSync(appSrc).length, 5);
        // Finally, a check should follow, whether this barebone app can run. I verified manually using live serve on the index, which loads from the custom bundle but this too should be automated
    });
});
