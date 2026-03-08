# Theta EdgeCloud Skill (Cloud API Runtime Artifact)

This is a dist-only runtime artifact for ClawHub scanning/install path validation.

## Known temporary limitation (2026-03-07)
- Dedicated inference endpoint commands are **temporarily considered experimental/platform-blocked** until Theta confirms an upstream fix.
- Live validation showed repeated authenticated `502/503` on `/v1/models` and `/v1/chat/completions` even when dashboard/controller reported deployment as `Running`/`1/1`.
- Non-dedicated command families (controller/deployments/on-demand/video/listing flows) remain available.

## Scope
- Cloud API operations only (`deployment`, `inference`, `video`, `on-demand`).
- No local RPC command surface in this artifact.
- No local file upload/read command surface in this artifact.

## How users connect their Theta EdgeCloud account

## Install-time setup prompt
This skill is configured to request baseline env vars during setup:
- `THETA_EC_API_KEY`
- `THETA_EC_PROJECT_ID`

How to obtain them:
1. Log in to `thetaedgecloud.com`
2. Open **Account -> Projects**
3. Select your project
4. Click **Create API Key**
5. Copy API key + project id (`prj_...`) into OpenClaw


Most features require a funded Theta EdgeCloud account (credits/billing).

### 1) Choose auth mode per feature

- **Deployments:** project API key + project id
  - `THETA_EC_API_KEY`
  - `THETA_EC_PROJECT_ID`
- **Inference endpoint:** endpoint URL + auth
  - `THETA_INFERENCE_ENDPOINT`
  - Option A (basic auth):
    - `THETA_INFERENCE_AUTH_USER`
    - `THETA_INFERENCE_AUTH_PASS`
  - Option B (bearer token):
    - `THETA_INFERENCE_AUTH_TOKEN`
- **On-demand models:**
  - `THETA_ONDEMAND_API_TOKEN`
- **Video API:**
  - `THETA_VIDEO_SA_ID`
  - `THETA_VIDEO_SA_SECRET`

### 2) Safer first-run profile

Set:

- `THETA_DRY_RUN=1`

Then validate read/list endpoints before mutating calls.

### 3) Secure secret handling guidance

- Prefer OpenClaw secret provider where available (runtime resolves inference + on-demand creds through `getSecret` first).
- If using env vars, keep them outside git-tracked files.
- Rotate keys/tokens immediately if exposed.

## Troubleshooting auth (401/403)

- `401` on inference:
  - verify `THETA_INFERENCE_ENDPOINT`
  - verify chosen auth mode matches endpoint policy (basic vs bearer)
  - if using basic, confirm username/password pair
  - if using bearer, confirm token validity and scope
- `403` on deployments/video/on-demand:
  - verify account credits/billing state
  - verify key/token belongs to the intended project/account
  - verify permission scope and key is not revoked

## Dedicated endpoint upstream readiness (502/503)

If inference calls return `THETA_DEDICATED_ENDPOINT_UPSTREAM_UNREADY` (or repeated HTTP `502/503`):

- This typically means auth is accepted at the edge, but the upstream model service is not yet reachable/healthy.
- Symptom pattern seen in live tests:
  - unauthenticated `/v1/models` -> `401`
  - authenticated `/v1/models` and `/v1/chat/completions` -> `502/503`
  - dashboard may still show deployment `Running` / `1/1`

This points to platform-side ingress/backend readiness mismatch rather than incorrect client credentials.

## Notes on third-party token mechanisms

Current practical alternatives to entering a raw username/password in OpenClaw are:
- project API keys (`THETA_EC_API_KEY`) for deployments,
- on-demand access token (`THETA_ONDEMAND_API_TOKEN`) for on-demand models,
- inference bearer token (`THETA_INFERENCE_AUTH_TOKEN`) when endpoint supports it.

A future OAuth/device-code broker flow could further reduce direct credential handling, but that requires Theta-native token exchange support or a trusted proxy service.


## AI Services coverage (dashboard mapping)
Current runtime command coverage now includes:
- Deployments: list + create + stop + delete (`theta.deployments.list|create|stop|delete`)
- Dedicated model templates (`theta.deployments.listStandard`, `theta.deployments.listCustom`)
- Dedicated deployments (`theta.ai.dedicatedDeployments.list`)
- Jupyter notebook (`theta.ai.jupyter.list`)
- GPU node (`theta.ai.gpuNode.list`)
- GPU cluster (`theta.ai.gpuCluster.list`)
- Persistent Storage (`theta.ai.storage.list`)
- Agentic AI / RAG chatbot listing (`theta.ai.agent.list`)
- On-demand model APIs (`theta.ondemand.*`, live-discovered service catalog)
- Dedicated inference endpoint (`theta.inference.models`, `theta.inference.chat`)
- Theta Video APIs: list/upload/video/stream/ingestor (`theta.video.*`)

Organization/Project model:
- Website uses Organization + Project scoping.
- Runtime commands use project-scoped API key auth (`THETA_EC_API_KEY`) and explicit `projectId` arguments.
- Dashboard user/org management APIs (invite/switch/members) require web-session auth and are intentionally out of scope for this runtime artifact.

## Theta-only OpenClaw option map (no other subscriptions)
This route can serve as the primary paid execution backend for OpenClaw:

- Website/marketing content generation:
  - `flux`, `stable_diffusion_*`, `esrgan`, `instant_id`, `stable_viton`, `step_video`, `talking_head`
- Website AI assistant/chatbot features:
  - on-demand LLM services (`llama_3_8b`, `llama_3_1_70b`)
- Vision/media intelligence:
  - `blip`, `grounding_dino`, `whisper`
- Video operations:
  - `theta.video.*` upload/video/stream/ingestor workflows
- Infra management:
  - `theta.deployments.*`, `theta.ai.*`, `theta.auth.capabilities`, `theta.billing.balance`

Operational recommendation:
- Use on-demand + video + controller flows as production-default.
- Keep dedicated endpoint chat/models as experimental until Theta confirms upstream readiness fix.

## Tested auth comparison
Validated in isolated external environment:
- API key flow supports project-scoped controller operations and org balance lookup.
- Username/password login session supports account-management APIs beyond API-key scope.

Added runtime command:
- `theta.billing.balance` (uses `THETA_EC_API_KEY` + `THETA_ORG_ID` or `args.orgId`).


## On-demand API key support
For on-demand inference, the runtime accepts either:
- `THETA_ONDEMAND_API_TOKEN`
- `THETA_ONDEMAND_API_KEY` (alias)

Infer requests are sent using the expected on-demand envelope shape: `{ input: ... }`.


## Credentials are command-scoped
You do not need to set every Theta env var.
Use the minimal credential set needed per command family (controller, balance, on-demand, dedicated inference).


## Credential self-diagnosis
New command:
- `theta.auth.capabilities`

Returns a capability matrix for current credentials (configured + verified) across:
- controller project APIs
- org balance lookup
- on-demand catalog
- on-demand inference auth
- dedicated inference endpoint auth
- video API auth


## First-run setup helper
Run:
- `theta.setup`

It returns a copy/paste checklist showing where to create API keys in Theta dashboard and which env vars to provide for each feature family.
