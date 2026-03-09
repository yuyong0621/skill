---
name: soma
description: Expert guide for participating in the SOMA network — a decentralized system that trains a foundation model through competition. Provides data submission workflows, model training pipelines, reward claiming, SDK code generation, CLI command guidance, and competitive strategy optimization. Use when user mentions "SOMA", "soma-sdk", "soma-models", "submit data to SOMA", "train a SOMA model", "SOMA targets", "SOMA rewards", "next-byte prediction network", "decentralized model training", or asks about earning SOMA tokens through data or model contributions. Do NOT use for general machine learning, PyTorch, or JAX questions unrelated to the SOMA network.
license: Apache-2.0
compatibility: Requires Python 3.10+ for soma-sdk, Python 3.13+ for quickstart. soma CLI installed via sup. GPU recommended for model training (H100) and scoring (24GB VRAM). Network access to SOMA testnet or localnet.
metadata:
  author: soma-org
  version: 1.0.0
  tags: [blockchain, machine-learning, data-submission, model-training, decentralized-ai]
  documentation: https://docs.soma.org
  repository: https://github.com/soma-org/soma
---

# SOMA Network

SOMA is an open-source network that trains a unified foundation model through decentralized competition. Models independently train on the same byte-level transformer architecture, compete on a universal objective (next-byte prediction), and integrate into one system. The best weights are rewarded with SOMA tokens.

There are three ways to earn SOMA:
1. **Submit data** — find or generate data matching network targets, score it against assigned models, submit valid results (50% of target reward)
2. **Train models** — train weights on the shared architecture, publish them on-chain via commit-reveal, earn commission when your model wins (50% of target reward)
3. **Run a validator** — operate consensus nodes, generate targets, audit submissions (20% of epoch rewards)

## The Game

You're not just submitting data or training models. You're a specialist in a collective brain.

SOMA's foundation model is the sum of all its specialists. Every model that dominates a niche — Python ML code, Rust networking, LaTeX papers, binary protocols — teaches the collective something no single centralized model could learn as deeply. Your strategic choices — what domain to master, what data to curate, how to position your model — directly determine whether this collective intelligence rivals or surpasses the largest centralized foundation models.

**The metagame**: SOMA is a game within a game. The inner game is technical execution: training, submitting, claiming. The outer game is strategic positioning: where in the 2048-dimensional embedding space to compete, what domains to specialize in, when to pivot, how to read the network. Most participants will play the inner game. Winners play the outer game.

**Why specialization beats generalism**: A model that's mediocre at everything loses to a model that's excellent at one thing. The embedding space is vast. The agent that finds an underserved niche and dominates it earns more than the agent that competes in crowded regions. The network needs breadth — be the specialist it doesn't have yet.

## Quick Decision Tree

**What do you want to do?**

- **"I'm starting from scratch"** → Start as a data submitter (lower barrier, cheaper bonds). Read `references/strategies.md` Part I to find your niche, then see the **Data Submission Workflow** below. Once you have capital, fine-tune a competitor's model with `fetch_model()` — see `references/model-strategies.md`.
- **"I want to submit data and earn rewards"** → See the **Data Submission Workflow** section below
- **"I want to train a model"** → See the **Model Training Workflow** section below
- **"I want to claim my rewards"** → See the **Claiming Rewards** section below
- **"I need to set up my environment"** → See the **Getting Started** section below
- **"Where should I compete?"** → See `references/strategies.md` (Part II: Choose Your Territory)
- **"What's the current state of the game?"** → See `references/strategies.md` (Part I: Read the Board) and `references/quickstart-patterns.md` (Network Analysis Pattern)
- **"How do I find the right data?"** → See `references/data-strategies.md`
- **"How do I improve my model?"** → See `references/model-strategies.md`
- **"I want competitive strategies"** → See `references/strategies.md`
- **"I want to understand how SOMA works"** → See `references/architecture.md`
- **"I need SDK API details"** → See `references/sdk-reference.md`
- **"I need CLI commands"** → See `references/cli-reference.md`
- **"I want working code examples"** → See `references/quickstart-patterns.md`
- **"I want to fork the quickstart repo"** → See the **Getting Started > Fork the Quickstart** section, then `references/quickstart-patterns.md` (Repo File Map)

## Getting Started

### Prerequisites

- Python 3.13+ (3.10+ for SDK only)
- `soma` CLI: `curl -fsSL https://sup.soma.org | bash && sup install soma`
- Python packages: `pip install soma-sdk soma-models[torch]`
- [Modal](https://modal.com) account for GPU orchestration (adding a credit card unlocks an extra $30 in free credits)

### Account Setup

```bash
# Create wallet
soma wallet new

# Fund on testnet
soma faucet

# Export secret key (save this — you'll need it for .env)
soma wallet export
```

### Environment Configuration

This is the most important setup step. Create a `.env` file with all required credentials:

```
SOMA_SECRET_KEY=<from soma wallet export — your Ed25519 secret key>
HF_TOKEN=<HuggingFace token — needed for gated datasets like The Stack v2>
S3_BUCKET=<your bucket name>
S3_ACCESS_KEY_ID=<S3-compatible access key>
S3_SECRET_ACCESS_KEY=<S3-compatible secret key>
S3_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
S3_PUBLIC_URL=https://<your-public-bucket-url>
```

**Setting up each credential:**

1. **SOMA_SECRET_KEY**: Run `soma wallet export` and copy the secret key output. This is your on-chain identity for signing transactions.

2. **HF_TOKEN**: Go to https://huggingface.co/settings/tokens and create a read token. Required for accessing gated datasets like The Stack v2. You may also need to accept the dataset's terms on its HuggingFace page.

3. **S3-compatible storage (recommended: Cloudflare R2)**:
   - Go to the Cloudflare dashboard > R2 Object Storage
   - Create a bucket (e.g., `soma-data`)
   - Under "Manage R2 API Tokens", create a token with read/write access
   - Copy the Access Key ID, Secret Access Key, and the endpoint URL
   - Enable public access on the bucket to get the `S3_PUBLIC_URL` (or use a custom domain)
   - R2 is recommended because it has no egress fees — important since models and validators download your data

4. **Push secrets to Modal** (if using Modal for GPU orchestration):
   ```bash
   python -m quickstart.create_modal_secret
   ```

### Fork the Quickstart

The fastest way to get running is to fork the quickstart repo, which has production-ready submission, training, and reward-claiming code:

```bash
git clone https://github.com/soma-org/quickstart
cd quickstart
cp .env.example .env
# Fill in .env with your credentials (see above)
uv sync
```

See `references/quickstart-patterns.md` for the full file map and common modifications.

### Quick Connection Test

```python
import asyncio
from soma_sdk import SomaClient, Keypair

async def test():
    client = await SomaClient(chain="testnet")
    kp = Keypair.from_secret_key("YOUR_SECRET_KEY")
    balance = await client.get_balance(kp.address())
    print(f"Connected! Balance: {balance} SOMA")
    targets = await client.get_targets(status="open")
    print(f"Open targets: {len(targets)}")

asyncio.run(test())
```

## Data Submission Workflow

Submit data to earn 50% of target rewards. The core loop — but remember: **what data you choose is more important than how fast you submit it.** See `references/data-strategies.md` for the full strategic guide on data sourcing, filtering, and creative approaches.

> **Quickstart reference**: The complete submission pipeline is in `src/quickstart/submitter.py` ([github.com/soma-org/quickstart](https://github.com/soma-org/quickstart)). Fork it and modify `stream_stack_v2()` to change data sources, or the scoring/filtering logic to change target selection.

### Step 1: Start the Scoring Service

Scoring requires running models locally on a GPU. The scoring service must be active before you can score data:

```bash
# Requires a GPU with 24GB+ VRAM
soma start scoring --device cuda --data-dir /data
```

The quickstart runs this on Modal with an L4 GPU. If you don't have a local GPU, deploy the scoring service to Modal (see `references/quickstart-patterns.md` for the Modal setup).

Verify it's running:
```python
assert await client.scoring_health(), "Scoring service not running!"
```

### Step 2: Find Open Targets

Not all targets are equal. Analyze target `reward_pool`, `distance_threshold`, and `model_ids` count before choosing where to submit. Targets with high thresholds and few assigned models are the best opportunities. See `references/strategies.md` (Read the Board) for analysis patterns.

```python
client = await SomaClient(chain="testnet")
targets = await client.get_targets(status="open")
```

### Step 3: Get Model Manifests

Each target has assigned models. Fetch their weights for scoring:

```python
manifests = await client.get_model_manifests(target)
```

### Step 4: Prepare and Filter Data

Source data that matches the target's domain. The key insight: you want data that the assigned models predict well (low loss) AND whose embedding falls within the target's distance threshold.

**Choose a domain to specialize in.** Rather than submitting random data, pick a domain and focus. The standard sources are a starting point — the real edge comes from creative data sourcing:
- **Source code** → The Stack v2 or StarCoderData (filter by language: Python, Rust, etc.)
- **Educational text** → FineWeb-Edu
- **Software engineering** → SWE-bench patches
- **Custom domain** → Your own curated dataset
- **Synthetic** → LLM-generated data targeting specific embedding regions
- **Novel sources** → Academic papers, RFCs, niche programming languages, structured data formats

See `references/data-strategies.md` for the full menu of data sources, smart filtering with embedding models, and LLM distillation techniques.

Encode data as raw bytes (UTF-8 for text). Filter aggressively: strip empty content, cap file size (~10KB works well for code), and skip content that's unlikely to match your target region.

### Step 5: Score Locally

```python
# Score against the target's assigned models
result = await client.score(
    data_url, manifests, target.embedding, data
)
# result has: winner (index), loss_score, embedding, distance
```

### Step 6: Check Validity

Both conditions must be met:
- The winning model produces a low loss
- The data's embedding is within the target's distance threshold

```python
if result.distance <= target.distance_threshold:
    # Valid submission!
```

### Step 7: Upload and Submit

```python
# Upload data to S3 (Cloudflare R2 recommended — no egress fees)
public_url = upload_to_s3(data, filename)

# Submit on-chain (posts a bond proportional to data size)
await client.submit_data(
    kp, target.id, data, public_url,
    manifests[result.winner].model_id,
    result.embedding, result.distance, result.loss_score
)
```

### Step 8: Claim Rewards

Wait 2 epochs (audit window), then claim. See the **Claiming Rewards** section below.

For the complete submission loop code, see `references/quickstart-patterns.md`. For data sourcing, filtering, and creative strategies, see `references/data-strategies.md`.

## Model Training Workflow

Train weights and earn 50% of target rewards when your model wins. But the fastest path to competitiveness is rarely training from scratch — fine-tuning from a network model in your target region is 10x faster. See `references/model-strategies.md` for the full strategic guide.

> **Quickstart reference**: The complete train-commit-reveal loop is in `src/quickstart/training.py` ([github.com/soma-org/quickstart](https://github.com/soma-org/quickstart)). For standalone training-only scripts, see `train_torch.py` and `train_flax.py`. Fork and modify training hyperparameters, data pipeline, or checkpoint logic.

### Step 1: Choose a Domain

Before training, decide what domain to specialize in. This is the most important strategic decision you'll make. Your model's embedding determines which targets you're assigned — the agent that finds an underserved niche and dominates it earns more than the agent that competes in crowded regions.

Analyze the current landscape:
```python
models = await client.get_active_models()
# Look for sparse regions in embedding space with fewer competitors
# See references/strategies.md Part II for the full Niche Finder framework
```

See `references/strategies.md` for territory selection and `references/model-strategies.md` for embedding strategy and domain gap analysis.

### Step 2: Set Up Training

Choose PyTorch or Flax/JAX. Both produce cross-compatible weights via safetensors:

```python
from soma_models.v1.torch.modules.model import Model
from soma_models.v1.torch.modules.sig_reg import SIGReg
from soma_models.v1.torch.loss import compute_loss
from soma_models.v1.configs import ModelConfig, SIGRegConfig
```

### Step 3: Stream Training Data

```python
from soma_models.v1.tokenizer import tokenize

# Tokenize raw bytes for the model
seq = tokenize(raw_bytes)  # Returns token_ids, targets, pos_ids
```

Use datasets that match your chosen domain:
- **The Stack v2** — filter by programming language for code specialization
- **FineWeb-Edu** — for educational/textual domains
- **StarCoderData** — curated, high-quality code
- **Custom datasets** — for niche domain specialization

See `references/quickstart-patterns.md` for the full data pipeline.

### Step 4: Train

Standard training loop with gradient accumulation. Recommended settings: `lr=1e-4`, `dropout=0.1`, `micro_batch=2`, `grad_accum=64` (effective batch 128).

### Step 5: Create Model On-Chain

First-time only:

```python
model_id = await client.create_model(
    kp,
    commission_rate=1000,   # 10% commission
    stake_amount=None       # stake all available
)
```

### Step 6: Commit Weights

```python
# Encrypt weights
encrypted, key = SomaClient.encrypt_weights(weights_bytes)

# Upload to S3 (Cloudflare R2 recommended)
weights_url = upload_to_s3(encrypted, f"weights/epoch-{epoch}.enc")

# Commit on-chain
await client.commit_model(
    kp, model_id, weights_url, encrypted, key, embedding
)
```

### Step 7: Wait One Epoch

The commit-reveal protocol requires one epoch between commit and reveal. This prevents front-running.

```python
await client.wait_for_next_epoch()
```

### Step 8: Reveal

```python
await client.reveal_model(kp, model_id, key, embedding)
```

### Step 9: Repeat

The best models train continuously: train new weights → commit → wait → reveal → repeat. The quickstart automates this with Modal cron jobs (reveals every 6 hours). Review your results each epoch — adapt your training data and embedding based on what wins and what doesn't. See `references/strategies.md` (Part III: Play the Long Game) for the epoch review protocol.

For complete training code (PyTorch and Flax), commit-reveal automation, and Modal deployment patterns, see `references/quickstart-patterns.md`. For distillation, embedding optimization, and training philosophy, see `references/model-strategies.md`. For competitive positioning and the outer game, see `references/strategies.md`.

## Claiming Rewards

> **Quickstart reference**: `src/quickstart/settle_targets.py` — run locally with `uv run claim`.

Rewards are claimable after a 2-epoch audit window:

```python
# Find claimable targets
targets = await client.get_targets(status="claimable")

# Claim each
for target in targets:
    await client.claim_rewards(kp, target.id)
```

Or via CLI:

```bash
soma target list --status claimable
soma target claim --target-id <ID>
```

**Reward split**: 50% to data submitter, 50% to winning model owner.
**Finder's fee**: Anyone can claim unclaimed rewards for 0.5% — claim yours promptly.
**Auto-staking**: Model commission rewards are automatically re-staked.

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Epoch** | 24-hour cycle. State transitions, target generation, and reward distribution happen at epoch boundaries. |
| **Target** | Random point in embedding space. Represents a data domain the network wants to learn. Assigned to nearby models via stake-weighted KNN. |
| **Embedding** | Vector representing a model's specialization or a data point's semantic content. Distance between data embedding and target determines validity. |
| **Distance threshold** | Auto-adjusting radius around each target. Submissions must land within it. Adjusts based on hit rate. |
| **Bond** | Deposit proportional to data size, posted with each submission. Returned after 2-epoch audit. Slashed if fraudulent. |
| **Commit-reveal** | Two-phase weight publishing. Commit encrypted weights → wait one epoch → reveal key. Prevents front-running. |
| **Staking** | Required for models and validators. Higher stake = more target assignments. Delegation allowed with commission. |
| **SIGReg** | Sigmoid regularization added to cross-entropy loss. Prevents embedding collapse by encouraging uniform distribution. |
| **Shannons** | Smallest unit. 1 SOMA = 1,000,000,000 shannons. |

For deep technical details, see `references/architecture.md`.

## Common Patterns

### Local Development with Localnet

```bash
# Start fresh localnet
soma start localnet --force-regenesis

# In your code, connect to localnet
client = await SomaClient(chain="localnet")

# Force epoch advance (localnet only)
await client.advance_epoch()
```

### Modal GPU Deployment

The quickstart uses Modal for GPU orchestration:
- **H100**: Model training
- **L4**: Scoring service for data submission
- **CPU**: Commit/reveal operations (no GPU needed)
- **Cron**: Automated reveals every 6 hours

Adding a credit card to Modal unlocks an extra $30 in free credits. See `references/quickstart-patterns.md` for Modal setup and deployment patterns.

### S3-Compatible Storage

Upload encrypted weights and submission data to S3-compatible storage. **Cloudflare R2 is recommended** — it has no egress fees, which matters because models and validators download your data frequently. AWS S3 and GCS (with HMAC keys) also work. See `references/quickstart-patterns.md` for the upload pattern.

## Troubleshooting

**Distance exceeds threshold**:
Data doesn't match the target's domain. Try different data sources, filter for content that aligns with the target's region in embedding space. Specializing in a domain (e.g., filtering Stack v2 by language) improves hit rate. See `references/strategies.md`.

**Scoring service not responding**:
The scoring service must be running before you can score data. Start it with `soma start scoring --device cuda --data-dir /data` (requires 24GB+ VRAM GPU). The quickstart deploys this on Modal with an L4 GPU. Check health: `await client.scoring_health()`.

**Epoch hasn't advanced (reveal fails)**:
Commit-reveal requires one epoch between steps. On testnet, wait for the next 24h epoch boundary. On localnet, force it: `await client.advance_epoch()`.

**Model not found after commit**:
Model weights aren't active until reveal completes in the following epoch. Ensure you've called `reveal_model()` after the epoch advanced past your commit epoch.

**Insufficient balance for bond**:
Bonds scale with data size. Check balance: `await client.get_balance(kp.address())`. Fund via `soma faucet` (testnet). Smaller submissions require smaller bonds.

**"Invalid commission rate"**:
Commission rate must be 0-10000 (basis points). Example: 1000 = 10%.

**.env not loading / missing credentials**:
Double-check each credential. Common issues: HF_TOKEN needs dataset terms accepted on HuggingFace, S3_ENDPOINT_URL must include the full `https://` prefix, SOMA_SECRET_KEY must be the hex output from `soma wallet export` (not the mnemonic). See the **Getting Started** section for step-by-step setup.

## Examples

**Example 1: Submit data to SOMA**

User says: "Help me submit data to SOMA"

Actions:
1. Verify prerequisites: soma-sdk installed, .env configured, scoring service running on GPU
2. Connect to testnet, get open targets
3. Choose a data domain (e.g., Python code from Stack v2)
4. Stream and filter candidate data, score against target's assigned models
5. Upload valid hits to Cloudflare R2, submit on-chain with bond
Result: Data submitted, rewards claimable after 2-epoch audit window.

**Example 2: Train a SOMA model**

User says: "I want to train a SOMA model and publish it"

Actions:
1. Choose a domain specialization (e.g., code, text, scientific)
2. Set up training environment with soma-models and data pipeline
3. Train byte-level transformer on domain-specific streaming data
4. Create model on-chain with stake and commission rate
5. Encrypt weights, upload to R2, commit on-chain
6. Wait one epoch, reveal decryption key
Result: Model active on network, earning 50% of target rewards when it wins.

**Example 3: Claim SOMA rewards**

User says: "How do I claim my SOMA rewards?"

Actions:
1. List claimable targets: `await client.get_targets(status="claimable")`
2. Call `await client.claim_rewards(kp, target.id)` for each
Result: Rewards deposited to wallet. Claim promptly to avoid 0.5% finder's fee.

**Example 4: Set up development environment**

User says: "Set up a SOMA development environment"

Actions:
1. Install soma CLI: `curl -fsSL https://sup.soma.org | bash && sup install soma`
2. Create wallet (`soma wallet new`), fund via faucet (`soma faucet`)
3. Install Python packages: `pip install soma-sdk soma-models[torch]`
4. Set up Cloudflare R2 bucket (no egress fees) for data and weight storage
5. Create HuggingFace token, accept dataset terms for The Stack v2
6. Build `.env` file with all credentials (walk through each one)
7. Push secrets to Modal: `python -m quickstart.create_modal_secret`
8. Test connection with quick script
Result: Local environment ready for data submission and model training.

## Reference Index

| File | Contains | Consult when |
|------|----------|-------------|
| `references/strategies.md` | Competitive playbook — network analysis, territory selection, battle scenarios, economics | Deciding where and how to compete |
| `references/data-strategies.md` | Deep data guide — filtering, LLM distillation, creative sourcing, novel domains | Choosing and curating data for submission |
| `references/model-strategies.md` | Deep model guide — distillation, embedding strategy, training philosophy, architecture exploitation | Training and improving your model |
| `references/quickstart-patterns.md` | Working code patterns, quickstart repo file map, submission, training, network analysis, deployment | Building pipelines, forking the quickstart, and analyzing the network |
| `references/architecture.md` | Network design, model specs, economics, consensus | Understanding how SOMA works |
| `references/sdk-reference.md` | Full Python SDK API — all methods, types, examples | Writing code with soma-sdk |
| `references/cli-reference.md` | All CLI commands organized by workflow | Using the soma command line |
