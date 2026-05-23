const fs = require('fs');
const os = require('os');
const path = require('path');
const {spawnSync} = require('child_process');

const sanitizeFileName = fileName => String(fileName || 'input.mlog').replace(/[\\/:*?"<>|]/g, '_');

function createMlogCheckerRunner ({
    javaPath = 'java',
    jarPath,
    timeoutMs = 15000,
    extraArgs = []
} = {}) {
    if (!jarPath) {
        throw new Error('jarPath is required.');
    }

    const resolvedJarPath = path.resolve(jarPath);

    const isAvailable = () => fs.existsSync(resolvedJarPath);

    const check = ({source, fileName, worldProcessor} = {}) => {
        if (!isAvailable()) {
            return {
                exitCode: 2,
                stdout: '',
                stderr: `MlogChecker jar not found: ${resolvedJarPath}`,
                available: false
            };
        }

        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mlog-checker-'));
        try {
            const inputPath = path.join(tempDir, sanitizeFileName(fileName));
            fs.writeFileSync(inputPath, String(source || ''), 'utf8');

            const args = ['-jar', resolvedJarPath, 'check', '--input', inputPath, ...extraArgs];
            if (worldProcessor) {
                args.push('--worldprocessor');
            }

            const result = spawnSync(javaPath, args, {
                encoding: 'utf8',
                timeout: timeoutMs,
                windowsHide: true
            });

            const stderr = [result.stderr || '', result.error ? String(result.error.message || result.error) : '']
                .filter(Boolean)
                .join('\n');

            return {
                exitCode: typeof result.status === 'number' ? result.status : (result.error ? 2 : 0),
                stdout: result.stdout || '',
                stderr,
                available: true
            };
        } finally {
            try {
                fs.rmSync(tempDir, {recursive: true, force: true});
            } catch (error) {
                // ignore cleanup failures
            }
        }
    };

    return {
        jarPath: resolvedJarPath,
        javaPath,
        timeoutMs,
        extraArgs,
        isAvailable,
        check
    };
}

module.exports = {
    createMlogCheckerRunner
};
