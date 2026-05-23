import {createMlogCheckerHttpBridge} from './mlog-checker-http-bridge';

const registerChecker = checker => {
    if (typeof window === 'undefined' || !checker) {
        return;
    }

    window.MlogScratchChecker = checker;
    if (window.MlogScratchBackend && typeof window.MlogScratchBackend.registerChecker === 'function') {
        try {
            window.MlogScratchBackend.registerChecker(checker);
        } catch (error) {
            // ignore bridge registration failures
        }
    }
};

export const bootstrapMlogChecker = async () => {
    if (typeof window === 'undefined' || window.MlogScratchChecker) {
        return window.MlogScratchChecker || null;
    }
    if (typeof fetch !== 'function') {
        return null;
    }

    try {
        const response = await fetch('/api/mlog-check', {
            headers: {
                accept: 'application/json'
            },
            method: 'GET'
        });
        if (!response.ok) {
            return null;
        }

        const bridge = createMlogCheckerHttpBridge({endpoint: '/api/mlog-check'});
        registerChecker(bridge);
        return bridge;
    } catch (error) {
        return null;
    }
};

if (typeof window !== 'undefined') {
    Promise.resolve().then(() => bootstrapMlogChecker());
}

export default {
    bootstrapMlogChecker
};
