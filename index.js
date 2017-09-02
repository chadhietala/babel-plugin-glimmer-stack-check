function stripGlimmerUtils(babel) {
  return {
    name: 'strip stackChecks',
    visitor: {
      Program(path, state) {
        let { source, bindings: bindingsToRemove, stackCheck } = state.opts;
        let { bindings } = path.scope;

        if (bindings[stackCheck] && bindings[stackCheck].kind === 'module' ) {
          let sc = bindings[stackCheck];
          if (sc.path.parent.source.value === source) {
            sc.referencePaths.forEach(p => {
              let rawBody = p.parentPath.parentPath
                            .get('consequent.body').map(p => p.node);
              p.parentPath.parentPath.replaceWithMultiple(rawBody);
            });

            sc.path.remove();

            if (sc.path.parentPath.node.specifiers.length === 0) {
              sc.path.parentPath.remove();
            }
          }
        }

        Object.keys(bindings).forEach((binding) => {
          let b = bindings[binding];
          if (b.kind === 'module' &&
            bindingsToRemove.indexOf(binding) > -1 &&
            bindingsToRemove.indexOf(b.path.node.local.name) > -1 &&b.path.parent.source.value === source) {
            b.referencePaths.forEach((p) => p.remove());
            b.path.remove();
            if (!b.path.parentPath.get('specifiers').length) {
              b.path.parentPath.remove();
            }
          }
        });
      }
    }
  }
}

stripGlimmerUtils.baseDir = function() {
  return __dirname;
}

module.exports = stripGlimmerUtils;
