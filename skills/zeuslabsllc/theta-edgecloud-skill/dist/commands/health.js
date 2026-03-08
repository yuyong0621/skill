import { edgecloudControllerClient } from '../clients/edgecloudController.js';
function summarizeError(error) {
    if (!error)
        return 'unknown error';
    if (typeof error === 'string')
        return error;
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return String(error);
}
export async function healthCheck(cfg) {
    const vm = await edgecloudControllerClient.listVmTypes(cfg);
    const authConfigured = Boolean(cfg.edgecloudApiKey && cfg.edgecloudProjectId);
    let authVerified = false;
    let authError;
    if (authConfigured) {
        try {
            await edgecloudControllerClient.listDeployments(cfg, cfg.edgecloudProjectId);
            authVerified = true;
        }
        catch (error) {
            authVerified = false;
            authError = summarizeError(error);
        }
    }
    return {
        ok: authConfigured ? authVerified : true,
        publicApiReachable: true,
        authConfigured,
        authVerified,
        authError,
        vmCount: Array.isArray(vm?.body?.vms) ? vm.body.vms.length : undefined,
        timestamp: new Date().toISOString()
    };
}
