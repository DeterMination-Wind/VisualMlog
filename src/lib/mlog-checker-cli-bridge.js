const nodeRequire = typeof require === 'function' ? require : null;

const loadNodeModule = name => {
    if (!nodeRequire) {
        throw new Error('MlogChecker CLI bridge requires a Node.js runtime.');
    }
    return nodeRequire(name);
};

const sanitizeFileName = fileName => String(fileName || 'input.mlog').replace(/[\\/:*?"<>|]/g, '_');

export function createMlogCheckerCliBridge ({
    javaPath = 'java',
    jarPath,
    timeoutMs = 15000,
    extraArgs = []
} = {}) {
    if (!jarPath) {
        throw new Error('jarPath is required.');
    }

    const fs = loadNodeModule('fs');
    const os = loadNodeModule('os');
    const path = loadNodeModule('path');
    const {spawnSync} = loadNodeModule('child_process');

    return {
        async check (source, fileName, worldProcessor) {
            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mlog-checker-'));
            const inputPath = path.join(tempDir, sanitizeFileName(fileName));
            fs.writeFileSync(inputPath, String(source || ''), 'utf8');

            const args = ['-jar', jarPath, 'check', '--input', inputPath, ...extraArgs];
            if (worldProcessor) {
                args.push('--worldprocessor');
            }

            const result = spawnSync(javaPath, args, {
                encoding: 'utf8',
                timeout: timeoutMs,
                windowsHide: true
            });

            return {
                exitCode: typeof result.status === 'number' ? result.status : (result.error ? 2 : 0),
                stdout: result.stdout || '',
                stderr: result.stderr || ''
            };
        }
    };
}

export default {
    createMlogCheckerCliBridge
};
