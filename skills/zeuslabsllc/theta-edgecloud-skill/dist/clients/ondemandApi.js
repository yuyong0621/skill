import { getJson, postJson } from './http.js';
import { fromConfigError } from '../errors.js';
const BASE = 'https://ondemand.thetaedgecloud.com';
function h(cfg) {
    if (!cfg.onDemandApiToken)
        throw fromConfigError('THETA_ONDEMAND_API_TOKEN missing', 'MISSING_THETA_ONDEMAND_API_TOKEN');
    return {
        Authorization: `Bearer ${cfg.onDemandApiToken}`,
        'content-type': 'application/json'
    };
}
function net(cfg) {
    return {
        headers: h(cfg),
        service: 'theta-ondemand-api',
        timeoutMs: cfg.httpTimeoutMs,
        maxRetries: cfg.httpMaxRetries,
        retryBackoffMs: cfg.httpRetryBackoffMs
    };
}
export const onDemandApiClient = {
    listServices: () => getJson(`${BASE}/service/list?expand=template_id`, {
        service: 'theta-ondemand-api',
        timeoutMs: 20000,
        maxRetries: 2,
        retryBackoffMs: 250
    }),
    createInferRequest: (cfg, service, payload) => {
        const body = payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'input')
            ? payload
            : { input: payload };
        if (body?.input && typeof body.input === 'object' && body.input !== null && !Object.prototype.hasOwnProperty.call(body.input, 'stream') && Array.isArray(body.input.messages)) {
            body.input = { ...body.input, stream: false };
        }
        return postJson(`${BASE}/infer_request/${service}`, body, net(cfg));
    },
    getInferRequest: (cfg, requestId) => getJson(`${BASE}/infer_request/${requestId}`, net(cfg)),
    createInputPresignedUrls: (cfg, service) => postJson(`${BASE}/infer_request/${service}/input_presigned_urls`, {}, net(cfg))
};
