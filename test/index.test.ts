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
 * Augmented to use the native node test runner - zero dep testing, given you have node 20+
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
            `ui5 build --config "${ui5.yaml}" --dest "${ctx.tmpDir}/dist"`,
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
});
