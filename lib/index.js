/**
 * @param {object} parameters
 *
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies
 *      Reader to access resources of the project's dependencies
 * @param {@ui5/logger/Logger} parameters.log
 *      Logger instance for use in the custom task.
 *      This parameter is only available to custom task extensions
 *      defining Specification Version 3.0 and later.
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName
 *      Name of the project currently being built
 * @param {string} parameters.options.projectNamespace
 *      Namespace of the project currently being built
 * @param {string} parameters.options.configuration
 *      Custom task configuration, as defined in the project's ui5.yaml
 * @param {string} parameters.options.taskName
 *      Name of the custom task.
 *      This parameter is only provided to custom task extensions
 *      defining Specification Version 3.0 and later.
 * @param {object} parameters.options.configuration Custom Options
 * @param {boolean} parameters.options.configuration.omitDbgFiles
 *      Boolean flag whether to omit dbg files from the build result
 * @param {boolean} parameters.options.configuration.omitSourceMapFiles
 *     Boolean flag whether to omit source map files from the build result
 * @param {boolean} parameters.options.configuration.omitTSFiles
 *     Boolean flag whether to omit TS files from the build result
 * @param {boolean} parameters.options.configuration.omitNonBundled
 *    Boolean flag whether to omit non-bundled JS and XML files from the build result
 * @param {string[]} parameters.options.configuration.omitDirs
 *    List of any addtional directories to be omitted from the final build result
 * @param {string[]} parameters.options.configuration.preserveNonBundled
 *    List of glob patterns which should be kept despite not being bundled. List has no effect if `omitNonBundled` is set to false.
 * @param {@ui5/builder.tasks.TaskUtil} parameters.taskUtil
 *      Specification Version-dependent interface to a TaskUtil instance.
 *      See the corresponding API reference for details:
 *      https://sap.github.io/ui5-tooling/v3/api/@ui5_project_build_helpers_TaskUtil.html
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace
 *      Reader/Writer to access and modify resources of the
 *      project currently being built
 * @returns {Promise<undefined>}
 *      Promise resolving once the task has finished
 */
module.exports = async function ({
    dependencies,
    log,
    options,
    taskUtil,
    workspace,
}) {
    // Populate behavior flags
    const omitDbgFiles =
        options.configuration?.omitDbgFiles === undefined
            ? true
            : options.configuration.omitDbgFiles;
    const omitSourceMapFiles =
        options.configuration?.omitSourceMapFiles === undefined
            ? true
            : options.configuration.omitSourceMapFiles;
    const omitTSFiles =
        options.configuration?.omitTSFiles === undefined
            ? true
            : options.configuration.omitTSFiles;
    const omitNonBundled =
        options.configuration?.omitNonBundled === undefined
            ? true
            : options.configuration.omitNonBundled;
    const omitDirs = options.configuration?.omitDirs || ['test', 'i18n'];
    const preserveNonBundled = options.configuration?.preserveNonBundled || [];
    // Get all application related resources
    const dbgResources = omitDbgFiles ? await workspace.byGlob('**/*dbg*') : [];
    const sourceMapResources = omitSourceMapFiles
        ? await workspace.byGlob('**/*.map')
        : [];
    const tsResources = omitTSFiles ? await workspace.byGlob('**/*.ts') : [];
    const explicitlyOmmitedResources = await (async () => {
        const resources = [];
        for (const dir of omitDirs) {
            resources.push(...(await workspace.byGlob(`**/${dir}/**`)));
        }
        return resources;
    })();
    const preservedNonBundledResources = await (async () => {
        const resources = [];
        for (const pattern of preserveNonBundled) {
            resources.push(...(await workspace.byGlob(pattern)));
        }
        return resources;
    })();
    const nonBundledResources = omitNonBundled
        ? (await workspace.byGlob('**/*.{js,xml}')).filter((resource) => {
              return !preservedNonBundledResources.some((preservedResource) =>
                  resource.getPath().includes(preservedResource.getPath()),
              );
          })
        : [];
    // Collect unconditionally omitted resources & mark them for omission
    [
        ...dbgResources,
        ...sourceMapResources,
        ...tsResources,
        ...explicitlyOmmitedResources,
    ].forEach((resource) => {
        taskUtil.setTag(resource, taskUtil.STANDARD_TAGS.OmitFromBuildResult);
    });
    // Iterate over conditionally omittable resources and mark them for omission if they do not contain the app bundle
    nonBundledResources.forEach((resource) => {
        const resourcePath = resource.getPath().toLowerCase();
        const bannedPaths = ['preload', 'sap-ui-custom.js'];
        //
        if (bannedPaths.every((path) => !resourcePath.includes(path))) {
            taskUtil.setTag(
                resource,
                taskUtil.STANDARD_TAGS.OmitFromBuildResult,
            );
        }
    });
};
