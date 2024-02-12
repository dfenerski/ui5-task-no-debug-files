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
