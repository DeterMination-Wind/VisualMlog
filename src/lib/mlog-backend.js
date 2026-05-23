import {
    compileProject as compileEmbeddedProject,
    serializeProject as serializeEmbeddedProject
} from './mlog-compiler';

let registeredChecker = null;

const lowerLevel = level => {
    if (level && typeof level === 'object' && level.name) {
        return lowerLevel(level.name);
    }
    const text = String(level || 'warning').toLowerCase();
    if (text.includes('error')) return 'error';
    if (text.includes('warn')) return 'warning';
    if (text.includes('success')) return 'success';
    if (text.includes('info')) return 'success';
    return text || 'warning';
};

const diagnosticMessage = item => {
    if (typeof item === 'string') return item;
    if (!item || typeof item !== 'object') return String(item);
    return item.message || item.text || item.description || JSON.stringify(item);
};

const parseCheckerCliDiagnostics = text => {
    if (!text) return [];
    const diagnostics = [];
    const lines = String(text).split(/\r?\n/);
    lines.forEach(line => {
        const match = line.match(/^(.+?):(\d+):(\d+):\s*(Error|Warning|Info):\s*(.*)$/i);
        if (!match) return;
        diagnostics.push({
            fileName: match[1],
            line: Number(match[2]),
            column: Number(match[3]),
            level: lowerLevel(match[4]),
            message: match[5],
            source: 'checker'
        });
    });
    return diagnostics;
};

const normalizeDiagnostic = (item, processor, fallbackLevel = 'warning', source = 'checker') => {
    if (typeof item === 'string') {
        return {
            level: fallbackLevel,
            message: item,
            fileName: processor && processor.fileName,
            processorId: processor && processor.id,
            source
        };
    }

    const diagnostic = item && typeof item === 'object' ? item : {};
    return {
        ...diagnostic,
        level: lowerLevel(diagnostic.level || diagnostic.severity || fallbackLevel),
        message: diagnosticMessage(item),
        fileName: diagnostic.fileName || diagnostic.file || (processor && processor.fileName),
        processorId: diagnostic.processorId || (processor && processor.id),
        source: diagnostic.source || source
    };
};

const diagnosticsFromCheckerResult = (result, processor) => {
    if (!result) return [];
    if (Array.isArray(result)) {
        return result.map(item => normalizeDiagnostic(item, processor));
    }
    if (typeof result === 'string') {
        return [normalizeDiagnostic(result, processor)];
    }

    const diagnostics = [];
    if (Array.isArray(result.diagnostics)) {
        diagnostics.push(...result.diagnostics.map(item => normalizeDiagnostic(item, processor)));
    }
    if (Array.isArray(result.errors)) {
        diagnostics.push(...result.errors.map(item => normalizeDiagnostic(item, processor, 'error')));
    }
    if (Array.isArray(result.warnings)) {
        diagnostics.push(...result.warnings.map(item => normalizeDiagnostic(item, processor, 'warning')));
    }
    if (typeof result.stdout === 'string') {
        diagnostics.push(...parseCheckerCliDiagnostics(result.stdout).map(item => normalizeDiagnostic(item, processor)));
    }
    if (typeof result.stderr === 'string') {
        diagnostics.push(...parseCheckerCliDiagnostics(result.stderr).map(item => normalizeDiagnostic(item, processor)));
    }
    if (diagnostics.length === 0 && typeof result.exitCode === 'number' && result.exitCode !== 0) {
        diagnostics.push(normalizeDiagnostic({
            level: result.exitCode === 1 ? 'error' : 'warning',
            message: `MlogChecker CLI exited with code ${result.exitCode}.`,
            fileName: processor && processor.fileName
        }, processor));
    }
    return diagnostics;
};

const resolveGlobalChecker = () => {
    if (registeredChecker) return registeredChecker;
    if (typeof window === 'undefined') return null;
    return window.MlogScratchChecker ||
        window.MlogCheckerKernel ||
        window.MlogCheckerBackend ||
        window.MlogChecker ||
        null;
};

const invokeCheckerForProcessor = (checker, processor) => {
    if (typeof checker === 'function') {
        return checker(processor.code, processor.fileName, processor.worldProcessor);
    }
    if (checker && typeof checker.check === 'function') {
        return checker.check(processor.code, processor.fileName, processor.worldProcessor);
    }
    if (checker && typeof checker.checkProcessor === 'function') {
        return checker.checkProcessor({
            source: processor.code,
            code: processor.code,
            fileName: processor.fileName,
            worldProcessor: processor.worldProcessor,
            processor
        });
    }
    if (checker && typeof checker.checkSource === 'function') {
        return checker.checkSource({
            source: processor.code,
            code: processor.code,
            fileName: processor.fileName,
            worldProcessor: processor.worldProcessor,
            processor
        });
    }
    return null;
};

const applyChecker = async (compiled, projectSnapshot) => {
    const checker = resolveGlobalChecker();
    if (!checker) {
        const diagnostics = compiled.diagnostics.concat([{
            level: 'warning',
            message: 'MlogChecker bridge 尚未注册；当前显示内嵌编译器输出，未执行语法检查。',
            source: 'checker'
        }]);
        return {
            ...compiled,
            ok: !diagnostics.some(item => item.level === 'error'),
            diagnostics
        };
    }

    const checkerDiagnostics = [];
    const processors = compiled.processors.map(processor => ({
        ...processor,
        diagnostics: [...(processor.diagnostics || [])]
    }));

    try {
        if (typeof checker.checkProject === 'function') {
            const result = await checker.checkProject(compiled, projectSnapshot);
            checkerDiagnostics.push(...diagnosticsFromCheckerResult(result, null));
        } else {
            for (const processor of processors) {
                const result = await invokeCheckerForProcessor(checker, processor);
                if (!result) {
                    checkerDiagnostics.push({
                        level: 'warning',
                        message: '已注册的 checker 没有暴露 check(source, fileName, worldProcessor) / checkProcessor / checkSource 接口。',
                        fileName: processor.fileName,
                        processorId: processor.id,
                        source: 'checker'
                    });
                    continue;
                }
                const diagnostics = diagnosticsFromCheckerResult(result, processor);
                processor.diagnostics.push(...diagnostics);
                checkerDiagnostics.push(...diagnostics);
                if (typeof result.instructionCount === 'number') {
                    processor.instructionCount = result.instructionCount;
                }
            }
        }
    } catch (error) {
        checkerDiagnostics.push({
            level: 'error',
            message: error instanceof Error ? error.message : String(error),
            source: 'checker'
        });
    }

    const diagnostics = compiled.diagnostics.concat(checkerDiagnostics);
    return {
        ...compiled,
        processors,
        ok: !diagnostics.some(item => item.level === 'error'),
        diagnostics
    };
};

const adapter = {
    async compileProject (projectSnapshot) {
        return applyChecker(compileEmbeddedProject(projectSnapshot), projectSnapshot);
    },

    serializeProject (projectSnapshot) {
        return serializeEmbeddedProject(projectSnapshot);
    },

    async importMlog () {
        return {
            ok: false,
            diagnostics: [{
                level: 'warning',
                message: 'Mlog 反向解析接口尚未接入。'
            }]
        };
    },

    register (nextAdapter) {
        if (!nextAdapter || typeof nextAdapter !== 'object') {
            throw new TypeError('Backend adapter must be an object.');
        }
        if (nextAdapter.checker) {
            this.registerChecker(nextAdapter.checker);
        } else if (
            !nextAdapter.compileProject &&
            (typeof nextAdapter.check === 'function' ||
                typeof nextAdapter.checkProject === 'function' ||
                typeof nextAdapter.checkProcessor === 'function' ||
                typeof nextAdapter.checkSource === 'function')
        ) {
            this.registerChecker(nextAdapter);
        }

        Object.keys(nextAdapter).forEach(key => {
            if (key !== 'checker' && key !== 'register' && key !== 'registerChecker') {
                this[key] = nextAdapter[key];
            }
        });
        return this;
    },

    registerChecker (nextChecker) {
        if (!nextChecker || (typeof nextChecker !== 'object' && typeof nextChecker !== 'function')) {
            throw new TypeError('Checker adapter must be an object or function.');
        }
        registeredChecker = nextChecker;
        return this;
    }
};

if (typeof window !== 'undefined') {
    const existing = window.MlogScratchBackend;
    if (existing && existing !== adapter && typeof existing === 'object') {
        adapter.register(existing);
    }
    window.MlogScratchBackend = adapter;
}

export const compileProject = projectSnapshot => adapter.compileProject(projectSnapshot);

export const serializeProject = projectSnapshot => adapter.serializeProject(projectSnapshot);

export const importMlog = (...args) => adapter.importMlog(...args);

export const registerBackend = nextAdapter => adapter.register(nextAdapter);

export const registerChecker = nextChecker => adapter.registerChecker(nextChecker);

export default adapter;
