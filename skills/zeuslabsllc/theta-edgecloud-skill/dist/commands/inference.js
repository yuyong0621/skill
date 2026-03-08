import { edgecloudInferenceClient } from '../clients/edgecloudInference.js';
import { isStructuredError, thetaError } from '../errors.js';
function annotateEndpointReadinessError(error) {
    if (isStructuredError(error) && (error.status === 502 || error.status === 503)) {
        throw thetaError({
            ...error,
            code: 'THETA_DEDICATED_ENDPOINT_UPSTREAM_UNREADY',
            retriable: true,
            message: `Dedicated inference endpoint is not ready upstream (HTTP ${error.status}). ` +
                'Auth layer may be active while upstream service remains unavailable. ' +
                'Likely platform ingress/backend readiness mismatch; retry or verify endpoint health from Theta dashboard logs.'
        });
    }
    throw error;
}
export const inference = {
    models: async (cfg, endpoint) => {
        try {
            return await edgecloudInferenceClient.listModels(cfg, endpoint);
        }
        catch (error) {
            annotateEndpointReadinessError(error);
        }
    },
    chat: async (cfg, body, endpoint) => {
        if (cfg.dryRun)
            return { dryRun: true, endpoint, body };
        try {
            return await edgecloudInferenceClient.chat(cfg, body, endpoint);
        }
        catch (error) {
            annotateEndpointReadinessError(error);
        }
    }
};
