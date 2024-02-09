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
 * @param {boolean} parameters.options.configuration.omitNonBundledJSXMLFiles
 *    Boolean flag whether to omit non-bundled JS and XML files from the build result
 * @param {boolean} parameters.options.configuration.isSelfContained
 *    Boolean flag whether build is made for self-contained application (such bundles look differently and require adjustments to the omission steps)
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
        options.configuration.omitDbgFiles === undefined
            ? true
            : options.configuration.omitDbgFiles;
    const omitSourceMapFiles =
        options.configuration.omitSourceMapFiles === undefined
            ? true
            : options.configuration.omitSourceMapFiles;
    const omitTSFiles =
        options.configuration.omitTSFiles === undefined
            ? true
            : options.configuration.omitTSFiles;
    const omitNonBundledJSXMLFiles =
        options.configuration.omitNonBundledJSXMLFiles === undefined
            ? true
            : options.configuration.omitNonBundledJSXMLFiles;
    const isSelfContained =
        options.configuration.isSelfContained === undefined
            ? false
            : options.configuration.isSelfContained;
    // Get all application related resources
    const dbgResources = omitDbgFiles ? await workspace.byGlob('**/*dbg*') : [];
    const sourceMapResources = omitSourceMapFiles
        ? await workspace.byGlob('**/*.map')
        : [];
    const tsResources = omitTSFiles ? await workspace.byGlob('**/*.ts') : [];
    const nonBundledResources = omitNonBundledJSXMLFiles
        ? await workspace.byGlob('**/*.{js,xml}')
        : [];
    //
    [...dbgResources, ...sourceMapResources, ...tsResources].forEach(
        (resource) => {
            taskUtil.setTag(
                resource,
                taskUtil.STANDARD_TAGS.OmitFromBuildResult,
            );
        },
    );
    //
    nonBundledResources.forEach((resource) => {
        const resourcePath = resource.getPath().toLowerCase();
        const bannedPaths = [
            'preload',
            ...(isSelfContained ? ['sap-ui-custom.js'] : []),
        ];
        //
        if (bannedPaths.every((path) => !resourcePath.includes(path))) {
            taskUtil.setTag(
                resource,
                taskUtil.STANDARD_TAGS.OmitFromBuildResult,
            );
        }
    });
};
