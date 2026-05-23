(function () {
  const stubDiagnostic = {
    level: 'warning',
    message: '后端解析/编译器尚未接入；当前只返回 UI 项目快照。',
  };

  const adapter = {
    async compileProject(projectSnapshot) {
      return {
        ok: false,
        code: '',
        processors: projectSnapshot.processors.map((processor) => ({
          id: processor.id,
          name: processor.name,
          blockCount: processor.program.blocks.length,
          linkCount: processor.links.length,
          code: '',
        })),
        diagnostics: [stubDiagnostic],
      };
    },

    serializeProject(projectSnapshot) {
      return JSON.stringify(projectSnapshot, null, 2);
    },

    async importMlog() {
      return {
        ok: false,
        diagnostics: [{
          level: 'warning',
          message: 'Mlog 反向解析接口尚未接入。',
        }],
      };
    },

    register(nextAdapter) {
      if (!nextAdapter || typeof nextAdapter !== 'object') {
        throw new TypeError('Backend adapter must be an object.');
      }
      Object.assign(this, nextAdapter);
      return this;
    },
  };

  window.MlogScratchBackend = adapter;
}());

