import { edgecloudControllerClient } from '../clients/edgecloudController.js';
async function fetchAllStandardTemplateNames(cfg, category) {
    const pageSize = 50;
    const names = [];
    for (let page = 0; page < 20; page += 1) {
        const resp = await edgecloudControllerClient.listStandardTemplates(cfg, category, page, pageSize);
        const templates = resp?.body?.templates ?? [];
        for (const t of templates) {
            if (t?.name)
                names.push(t.name);
        }
        if (templates.length < pageSize)
            break;
    }
    return names;
}
async function listDedicatedByTemplateCatalog(cfg, projectId) {
    const [all, standardNames, custom] = await Promise.all([
        edgecloudControllerClient.listDeployments(cfg, projectId),
        fetchAllStandardTemplateNames(cfg, 'serving').catch(() => []),
        edgecloudControllerClient.listCustomTemplates(cfg, projectId).catch(() => ({ body: { templates: [] } }))
    ]);
    const customNames = (custom?.body?.templates ?? [])
        .filter((t) => !t?.category || String(t.category).toLowerCase() === 'serving')
        .map((t) => t?.name)
        .filter(Boolean);
    const allowed = new Set([...standardNames, ...customNames].map((n) => String(n).trim().toLowerCase()));
    const body = (all?.body ?? []).filter((d) => allowed.has(String(d?.TemplateName ?? '').trim().toLowerCase()));
    return {
        ...(all ?? {}),
        body,
        filter: {
            mode: 'serving-template-allowlist',
            templateCount: allowed.size
        }
    };
}
export const deployments = {
    listStandard: (cfg, category, page = 0, number = 50) => edgecloudControllerClient.listStandardTemplates(cfg, category, page, number),
    listCustom: (cfg, projectId) => edgecloudControllerClient.listCustomTemplates(cfg, projectId),
    listVm: (cfg) => edgecloudControllerClient.listVmTypes(cfg),
    balance: (cfg, orgId) => edgecloudControllerClient.getBalance(cfg, orgId ?? cfg.edgecloudOrgId),
    listJupyter: (cfg, projectId) => edgecloudControllerClient.listJupyterNotebooks(cfg, projectId),
    listGpuNodes: (cfg, projectId) => edgecloudControllerClient.listGpuNodes(cfg, projectId),
    listDedicated: (cfg, projectId) => listDedicatedByTemplateCatalog(cfg, projectId),
    listClusters: (cfg, projectId) => edgecloudControllerClient.listClusters(cfg, projectId),
    listStorageClaims: (cfg, projectId, page = 1, number = 20) => edgecloudControllerClient.listStorageClaims(cfg, projectId, page, number),
    listChatbots: (cfg, projectId) => edgecloudControllerClient.listChatbots(cfg, projectId),
    create: (cfg, payload) => cfg.dryRun ? { dryRun: true, payload } : edgecloudControllerClient.createDeployment(cfg, payload),
    list: (cfg, projectId) => edgecloudControllerClient.listDeployments(cfg, projectId),
    stop: (cfg, projectId, shard, suffix) => cfg.dryRun ? { dryRun: true, shard, suffix } : edgecloudControllerClient.stopDeployment(cfg, projectId, shard, suffix),
    delete: (cfg, projectId, shard, suffix, deploymentId) => {
        if (cfg.dryRun)
            return { dryRun: true, shard, suffix, deploymentId };
        if (deploymentId) {
            return edgecloudControllerClient.deleteDeploymentBase(cfg, projectId, deploymentId);
        }
        return edgecloudControllerClient.deleteDeployment(cfg, projectId, shard, suffix);
    }
};
