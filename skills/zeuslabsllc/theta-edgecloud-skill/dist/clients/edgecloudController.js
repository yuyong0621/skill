import { deleteEmpty, getJson, postJson, putEmpty } from './http.js';
import { fromConfigError } from '../errors.js';
const BASE_CTRL = 'https://controller.thetaedgecloud.com';
const BASE_API = 'https://api.thetaedgecloud.com';
function k(cfg) {
    if (!cfg.edgecloudApiKey)
        throw fromConfigError('THETA_EC_API_KEY missing. In thetaedgecloud.com go to Account -> Projects -> select project -> Create API Key.', 'MISSING_THETA_EC_API_KEY');
    return { 'x-api-key': cfg.edgecloudApiKey };
}
function net(cfg, service, headers) {
    return {
        service,
        headers,
        timeoutMs: cfg.httpTimeoutMs,
        maxRetries: cfg.httpMaxRetries,
        retryBackoffMs: cfg.httpRetryBackoffMs
    };
}
export const edgecloudControllerClient = {
    listStandardTemplates: (cfg, category, page = 0, number = 50) => getJson(`${BASE_CTRL}/deployment_template/list_standard_templates?category=${category}&page=${page}&number=${number}`, net(cfg, 'edgecloud-controller', k(cfg))),
    listCustomTemplates: (cfg, projectId) => getJson(`${BASE_CTRL}/deployment_template/list_custom_templates?project_id=${projectId}`, net(cfg, 'edgecloud-controller', k(cfg))),
    listVmTypes: (cfg) => getJson(`${BASE_API}/resource/vm/list`, net(cfg, 'edgecloud-controller')),
    getBalance: (cfg, orgId) => {
        if (!orgId)
            throw fromConfigError('orgId is required (set THETA_ORG_ID or pass args.orgId)', 'MISSING_THETA_ORG_ID');
        return getJson(`${BASE_API}/balance?orgID=${orgId}`, net(cfg, 'edgecloud-controller', k(cfg)));
    },
    createDeployment: (cfg, payload) => postJson(`${BASE_CTRL}/deployment`, payload, net(cfg, 'edgecloud-controller', k(cfg))),
    listDeployments: (cfg, projectId) => getJson(`${BASE_CTRL}/deployment/list?project_id=${projectId}`, net(cfg, 'edgecloud-controller', k(cfg))),
    listJupyterNotebooks: (cfg, projectId) => getJson(`${BASE_CTRL}/deployment/list?project_id=${projectId}&template_name=Jupyter%20Notebook`, net(cfg, 'edgecloud-controller', k(cfg))),
    listGpuNodes: (cfg, projectId) => getJson(`${BASE_CTRL}/deployment/list?project_id=${projectId}&template_name=GPU%20Node`, net(cfg, 'edgecloud-controller', k(cfg))),
    listDedicatedDeployments: (cfg, projectId) => getJson(`${BASE_CTRL}/deployment/list?project_id=${projectId}&not_template_name=Jupyter%20Notebook&not_template_name=GPU%20Node`, net(cfg, 'edgecloud-controller', k(cfg))),
    listClusters: (cfg, projectId) => getJson(`${BASE_CTRL}/cluster/list?project_id=${projectId}`, net(cfg, 'edgecloud-controller', k(cfg))),
    listStorageClaims: (cfg, projectId, page = 1, number = 20) => getJson(`${BASE_CTRL}/volume/claim?projectId=${projectId}&page=${page}&number=${number}`, net(cfg, 'edgecloud-controller', k(cfg))),
    listChatbots: (cfg, projectId) => getJson(`${BASE_CTRL}/chatbot/list?project_id=${projectId}&number=100`, net(cfg, 'edgecloud-controller', k(cfg))),
    stopDeployment: (cfg, projectId, shard, suffix) => putEmpty(`${BASE_CTRL}/deployment/${shard}/${suffix}/stop?project_id=${projectId}`, net(cfg, 'edgecloud-controller', k(cfg))),
    deleteDeployment: (cfg, projectId, shard, suffix) => deleteEmpty(`${BASE_CTRL}/deployment/${shard}/${suffix}?project_id=${projectId}`, net(cfg, 'edgecloud-controller', k(cfg))),
    deleteDeploymentBase: (cfg, projectId, deploymentId) => deleteEmpty(`${BASE_CTRL}/deployment/base/${deploymentId}?project_id=${projectId}`, net(cfg, 'edgecloud-controller', k(cfg)))
};
