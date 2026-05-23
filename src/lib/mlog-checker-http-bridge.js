const DEFAULT_ENDPOINT = '/api/mlog-check';

const parseResponse = async response => {
    const text = await response.text();
    if (!text) {
        return {};
    }
    try {
        return JSON.parse(text);
    } catch (error) {
        throw new Error(`MlogChecker bridge returned invalid JSON: ${text.slice(0, 200)}`);
    }
};

export function createMlogCheckerHttpBridge ({
    endpoint = DEFAULT_ENDPOINT
} = {}) {
    if (typeof fetch !== 'function') {
        throw new Error('fetch is required.');
    }

    return {
        async check (source, fileName, worldProcessor) {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    source,
                    fileName,
                    worldProcessor: !!worldProcessor
                })
            });

            const data = await parseResponse(response);
            if (!response.ok) {
                return {
                    exitCode: typeof data.exitCode === 'number' ? data.exitCode : response.status,
                    stdout: data.stdout || '',
                    stderr: data.stderr || data.error || `MlogChecker bridge returned HTTP ${response.status}.`
                };
            }
            return data;
        }
    };
}

export default {
    createMlogCheckerHttpBridge
};
