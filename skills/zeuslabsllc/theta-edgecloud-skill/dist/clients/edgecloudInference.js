import { getJson, postJson } from './http.js';
import { fromConfigError } from '../errors.js';
function endpoint(cfg, e) {
    const v = e ?? cfg.inferenceEndpoint;
    if (!v)
        throw fromConfigError('THETA_INFERENCE_ENDPOINT missing', 'MISSING_THETA_INFERENCE_ENDPOINT');
    return v.replace(/\/$/, '');
}
function auth(cfg, a) {
    return a ?? cfg.inferenceAuth;
}
function net(cfg, service, authOverride) {
    return {
        service,
        auth: authOverride,
        timeoutMs: cfg.httpTimeoutMs,
        maxRetries: cfg.httpMaxRetries,
        retryBackoffMs: cfg.httpRetryBackoffMs
    };
}
export const edgecloudInferenceClient = {
    listModels: (cfg, e, a) => getJson(`${endpoint(cfg, e)}/v1/models`, net(cfg, 'edgecloud-inference', auth(cfg, a))),
    chat: (cfg, body, e, a) => postJson(`${endpoint(cfg, e)}/v1/chat/completions`, body, net(cfg, 'edgecloud-inference', auth(cfg, a)))
};
