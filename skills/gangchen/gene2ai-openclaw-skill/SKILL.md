---
name: gene2ai
description: Your personal health data hub for AI agents. Query genomic insights (health risks, drug responses, CYP450 metabolizer status, HLA allele typing, APOE genotype, nutrition, traits, ancestry), upload medical documents for AI-powered parsing, record daily health metrics, and explore genomic-lab cross-references — all through natural conversation.
version: 3.0.0
metadata:
  openclaw:
    requires:
      env:
        - GENE2AI_API_KEY
    primaryEnv: GENE2AI_API_KEY
    emoji: "🧬"
    homepage: https://gene2.ai/guide
---

# Gene2AI — Your Health Data for AI Agents

You have access to the user's personal health data through the Gene2AI platform. This includes:

- **Genomic data**: 324+ indicators from raw genetic testing files (23andMe, AncestryDNA, WeGene) — 933 SNPs across 273 genes in 9 categories
- **Health documents**: Lab reports, checkup results, medical records, and imaging reports — parsed by AI into structured indicators
- **Self-reported metrics**: Blood pressure, blood sugar, weight, heart rate, and other daily measurements
- **Cross-references**: Bidirectional links between lab indicators and genomic markers (e.g., LDL-C ↔ cholesterol genes)

## When to Use This Skill

Use this skill whenever the user:

### Genomic Data Queries
- Asks about their **genetic health risks** (e.g., "Am I at risk for type 2 diabetes?", "What about Alzheimer's?")
- Asks about **drug responses** or pharmacogenomics (e.g., "How do I metabolize caffeine?", "Am I sensitive to warfarin?")
- Asks about **CYP450 metabolizer status** (e.g., "What's my CYP2D6 status?", "Am I a poor metabolizer?")
- Asks about **HLA alleles** (e.g., "Do I carry HLA-B*57:01?", "Am I at risk for drug hypersensitivity?")
- Asks about **APOE genotype** (e.g., "What's my APOE status?", "Do I have the ε4 allele?")
- Asks about **nutrition** and nutrigenomics (e.g., "Do I need more vitamin D?", "Am I lactose intolerant?")
- Asks about **physical traits** (e.g., "What does my DNA say about my muscle type?")
- Asks about **ancestry** composition
- Wants **personalized recommendations** based on their genetics
- Mentions their **DNA**, **genes**, **SNPs**, or **genetic variants**

### Health Data Management
- Sends a health-related document (lab report, checkup result, medical record, prescription, imaging report)
- Asks to upload, save, or record health data
- Reports health metrics verbally (blood pressure, blood sugar, weight, heart rate, etc.)
- Asks to check their health data status or summary
- Says things like "帮我保存这个体检报告", "upload this to my health vault", "记录一下我的血压"

### Cross-Reference Queries
- Asks about connections between lab results and genetics (e.g., "My LDL is high — do I have genetic risk factors?")
- Wants a comprehensive risk overview combining genomic and lab data
- Asks for a holistic health assessment

## Configuration

The user's Gene2AI API key is available as environment variable `GENE2AI_API_KEY`.

API keys are **profile-scoped** — each key is bound to a specific health profile (e.g., "Self", "Mom", "Dad"). When you use this key, all data queries automatically return data for the bound profile only. This prevents accidentally mixing health data across family members.

> **Important:** Each key operates on one profile only. If the user manages health data for multiple family members, they should generate a separate key for each profile. The `?profileId=` query parameter can override the key’s default profile for advanced use cases.

If `GENE2AI_API_KEY` is not set, guide the user to:
1. Visit https://gene2.ai and log in (or create an account)
2. Go to the **API Keys** page (https://gene2.ai/api-keys)
3. Click **Generate New Key** and select the health profile this key should access
4. Copy the generated token and configure it in OpenClaw:

```json
{
  "skills": {
    "entries": {
      "gene2ai": {
        "enabled": true,
        "apiKey": "<paste-your-token-here>"
      }
    }
  }
}
```

---

## Part 1: Querying Health Data

### Health Profile (Recommended Starting Point)

```bash
curl -s "https://gene2.ai/api/v1/health-data/profile" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

Returns a **compact, conclusions-only health profile** (~2-4KB). This is the recommended first call for any agent session. The response contains:

- **APOE genotype** conclusion (e.g., "APOE ε3/ε4 — Increased risk")
- **CYP450 metabolizer status** for each gene (e.g., "CYP2D6: Normal Metabolizer") with affected drugs
- **HLA carrier status** (positive alleles only)
- **Elevated health risks** (condition + risk level + brief note, no raw SNPs)
- **Drug sensitivities** (drug + sensitivity level)
- **Nutrition flags** (nutrient concerns from genetic variants)
- **Abnormal lab/checkup indicators** (latest values only: name, value, unit, flag)
- **Medical findings** — ALL examination results (CT, ultrasound, X-ray, MRI, ECG, physical exam, functional tests, etc.) grouped by category, including both normal and abnormal findings, with original language preserved
- **Medical findings summary** — total and abnormal counts per category
- **Suggested focus areas** (auto-generated from cross-referencing genomic + clinical + imaging data)

```json
{
  "_format": "gene2ai-health-profile-v1",
  "_description": "Compact health profile from Gene2AI. Contains interpretive conclusions only.",
  "dataCoverage": { "genomicMarkers": 324, "labIndicators": 247, "medicalFindings": 18, ... },
  "genomicHighlights": {
    "apoe": "APOE ε3/ε4 — Increased (1 copy of ε4)",
    "cyp450": [{ "gene": "CYP2D6", "status": "Normal Metabolizer", "affectedDrugs": [] }],
    "elevatedRisks": [{ "condition": "Alzheimer's Disease", "risk": "elevated", "note": "..." }],
    "drugSensitivities": [{ "drug": "Warfarin", "sensitivity": "increased", "note": "..." }],
    "nutritionFlags": [{ "nutrient": "Vitamin D", "note": "..." }]
  },
  "abnormalIndicators": [{ "name": "LDL Cholesterol", "value": 3.8, "unit": "mmol/L", "flag": "high" }],
  "medicalFindings": {
    "imaging": [
      { "type": "imaging", "examType": "CT", "bodyPart": "Liver", "finding": "肝脏密度减低", "conclusion": "Mild fatty liver", "severity": "mild", "clinicalSignificance": "Common finding", "recommendation": "Lifestyle modification", "date": "2026-01-15" },
      { "type": "imaging", "examType": "Ultrasound", "bodyPart": "Thyroid", "finding": "右叶小结节", "conclusion": "Thyroid nodule, likely benign", "severity": "mild", "recommendation": "Follow-up in 12 months", "date": "2026-01-15" }
    ],
    "physical_exam": [
      { "type": "physical_exam", "examType": "General", "bodyPart": "Heart", "finding": "心律齐，无杂音", "conclusion": "Normal cardiac exam", "severity": "normal", "date": "2026-01-15" }
    ],
    "functional_test": [
      { "type": "functional_test", "examType": "ECG", "bodyPart": "Heart", "finding": "窦性心律", "conclusion": "Normal ECG", "severity": "normal", "date": "2026-01-15" }
    ]
  },
  "medicalFindingsSummary": {
    "total": 18, "abnormal": 4,
    "byCategory": {
      "imaging": { "total": 8, "abnormal": 3 },
      "physical_exam": { "total": 6, "abnormal": 0 },
      "functional_test": { "total": 4, "abnormal": 1 }
    }
  },
  "suggestedFocusAreas": ["Alzheimer's risk management (APOE ε4 carrier)", ...]
}
```

> **This profile is designed to be cached and reused across conversations.** It contains no raw genetic data (no rs-IDs, no genotypes, no SNP details), so it is safe for agent memory and cross-session reference. Medical findings include ALL examination results (both normal and abnormal) grouped by category, with findings sorted by date (newest first) within each category. The `finding` field preserves the original language from the medical report (Chinese or English). When the user needs specific genetic details, drill down using the endpoints below.

### Summary Overview

```bash
curl -s "https://gene2.ai/api/v1/health-data/summary" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

Returns total documents, total records, and breakdown by category and genomic subcategory.

### Full Records (with filtering)

```bash
# All records
curl -s "https://gene2.ai/api/v1/health-data/full" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"

# Filter by category
curl -s "https://gene2.ai/api/v1/health-data/full?category=genomic" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"

# Filter by subcategory (genomic only)
curl -s "https://gene2.ai/api/v1/health-data/full?category=genomic&subcategory=cyp450" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"

# Grouped format (organized by category → subcategory)
curl -s "https://gene2.ai/api/v1/health-data/full?category=genomic&format=grouped" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

**Query Parameters:**

| Parameter | Values | Description |
|-----------|--------|-------------|
| `category` | `genomic`, `lab_result`, `checkup`, `self_reported`, `medical_record`, `imaging` | Filter by data category |
| `subcategory` | `health_risk`, `drug_response`, `trait`, `nutrition`, `ancestry`, `apoe`, `hla`, `cyp450` | Filter genomic subcategory |
| `format` | `grouped` | Organize records by category → subcategory hierarchy |

### Incremental Changes (for sync)

```bash
curl -s "https://gene2.ai/api/v1/health-data/delta?since_version={version_number}" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

---

## Part 2: Genomic Data Categories

The genomic data is organized into 9 subcategories. When querying with `?category=genomic`, each record includes a `data` field with the parsed structured object (no need to parse `valueText` JSON manually).

### health_risk (193 markers)

Disease risk assessments grouped by condition/gene (CFTR, LDLR, Alzheimer's Disease, CAD, T2D, etc.)

```json
{
  "indicatorName": "Alzheimer's Disease",
  "indicatorCode": "alzheimers_disease_rs429358",
  "subcategory": "health_risk",
  "valueText": "{...}",
  "data": {
    "condition": "Alzheimer's Disease",
    "risk": "elevated",
    "confidence": "high",
    "description": "Variant associated with increased risk",
    "snps": ["rs429358"],
    "genotype": "CT",
    "populationNote": "Found in ~15% of European populations"
  }
}
```

**Risk levels**: `low`, `average`, `slightly_elevated`, `elevated`, `high`

### drug_response (61 markers)

Pharmacogenomic predictions (PharmGKB + CPIC) for Warfarin, Clopidogrel, SSRIs, Codeine, Tamoxifen, etc.

```json
{
  "indicatorName": "Warfarin Sensitivity",
  "subcategory": "drug_response",
  "data": {
    "drug": "Warfarin",
    "gene": "VKORC1",
    "sensitivity": "increased",
    "recommendation": "Consider lower initial dose",
    "confidence": "high",
    "snps": ["rs9923231"]
  }
}
```

### cyp450 (3 genes: CYP2C19, CYP2D6, CYP2C9)

CYP450 metabolizer phenotyping with CPIC star allele definitions and drug-specific recommendations.

```json
{
  "indicatorName": "CYP2D6",
  "subcategory": "cyp450",
  "data": {
    "metabolizerStatus": "Normal Metabolizer",
    "activityScore": "2.0",
    "allele1": "*1",
    "allele2": "*2",
    "drugRecommendations": [
      {
        "drug": "Codeine",
        "recommendation": "Use label-recommended age- or weight-specific dosing",
        "evidence": "Strong (CPIC)"
      },
      {
        "drug": "Tamoxifen",
        "recommendation": "Use tamoxifen at standard dosing",
        "evidence": "Strong (CPIC)"
      }
    ],
    "limitations": "Star allele calling based on common variants only",
    "methodology": "CPIC star allele definitions"
  }
}
```

**Metabolizer statuses**: `Ultrarapid Metabolizer`, `Normal Metabolizer`, `Intermediate Metabolizer`, `Poor Metabolizer`

### hla (9 alleles)

HLA allele typing via tag SNP inference for immune-related conditions and drug hypersensitivity.

```json
{
  "indicatorName": "HLA-B*57:01",
  "subcategory": "hla",
  "data": {
    "allele": "HLA-B*57:01",
    "carrierStatus": "Negative",
    "associations": [
      {
        "drug": "Abacavir",
        "name": "Abacavir Hypersensitivity",
        "evidence": "Strong (CPIC)",
        "recommendation": "Standard abacavir use is appropriate"
      }
    ]
  }
}
```

### apoe (1 record)

APOE genotyping — ε2/ε3/ε4 allele determination for Alzheimer's and cardiovascular risk.

```json
{
  "indicatorName": "APOE Genotype",
  "subcategory": "apoe",
  "data": {
    "alleles": ["ε3", "ε4"],
    "alzheimerRisk": "Increased (1 copy of ε4)",
    "cardiovascularNote": "ε4 associated with higher LDL cholesterol levels",
    "snps": {
      "rs429358": { "genotype": "CT", "chromosome": "19" },
      "rs7412": { "genotype": "CC", "chromosome": "19" }
    }
  }
}
```

### trait (21 markers)

Genetic trait predictions: hair color, skin pigmentation, caffeine metabolism, alcohol flush, lactose tolerance, muscle fiber type.

### nutrition (32 markers)

Nutrigenomics: Vitamin D, Folate/MTHFR, B12, Omega-3, Iron, Calcium needs based on genetic variants.

### ancestry (4 regions)

Regional ancestry percentages from population-specific variant analysis.

```json
{
  "indicatorName": "East Asian",
  "subcategory": "ancestry",
  "data": {
    "region": "East Asian",
    "percentage": 95.2
  }
}
```

---

## Part 3: Risk Overview & Cross-References

### Risk Overview (Comprehensive Dashboard)

```bash
curl -s "https://gene2.ai/api/v1/health-data/risk-overview" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

Returns a comprehensive risk dashboard combining genomic and lab data:

```json
{
  "genomic": {
    "totalIndicators": 324,
    "elevatedRisks": [
      {
        "indicatorName": "Alzheimer's Disease",
        "subcategory": "health_risk",
        "risk": "elevated",
        "snps": ["rs429358"],
        "genotype": "CT"
      }
    ],
    "subcategoryCounts": {
      "health_risk": 193,
      "drug_response": 61,
      "nutrition": 32,
      "trait": 21,
      "hla": 9,
      "ancestry": 4,
      "cyp450": 3,
      "apoe": 1
    }
  },
  "lab": {
    "totalIndicators": 247,
    "abnormalIndicators": [
      {
        "indicatorName": "LDL Cholesterol",
        "indicatorCode": "LDL-C",
        "valueNumeric": 3.8,
        "valueUnit": "mmol/L",
        "abnormalFlag": "high",
        "refRangeHigh": 3.4
      }
    ]
  },
  "crossReferences": [
    {
      "labIndicator": {
        "code": "LDL-C",
        "name": "LDL Cholesterol",
        "latestValue": 3.8,
        "unit": "mmol/L",
        "abnormalFlag": "high"
      },
      "relatedGenomicCount": 12,
      "conditions": ["Familial Hypercholesterolemia", "Coronary Artery Disease"]
    }
  ]
}
```

### Genomic Links for a Lab Indicator

```bash
# Find genomic markers related to LDL cholesterol
curl -s "https://gene2.ai/api/v1/health-data/genomic-links/LDL-C" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

**Supported indicator codes**: TC, TG, LDL-C, HDL-C, SBP, DBP, FBG, HbA1c, BMI, UA, TSH, FT3, FT4, ALT, AST, GGT, ALP, TBIL, SCr, BUN, WBC, HGB, PLT, CRP

Returns genomic records related to that lab indicator, enabling cross-referencing (e.g., "Your LDL is high AND you have genetic variants in LDLR associated with familial hypercholesterolemia").

### Lab-Genomic Summary

```bash
curl -s "https://gene2.ai/api/v1/health-data/lab-genomic-summary" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

Returns all lab indicators with their related genomic record counts, for building cross-reference dashboards.

---

## Part 4: Querying Genomic Data by Job ID (Legacy)

For backward compatibility, you can also query genomic data by job ID:

```bash
curl -s -X GET "https://gene2.ai/api/v1/genomics/${GENE2AI_JOB_ID}" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

If `GENE2AI_JOB_ID` is not set, ask the user for their Job ID (visible on the My Jobs page at https://gene2.ai/my-jobs).

> **Note**: The `/health-data/full?category=genomic` endpoint (Part 1) is preferred as it returns enriched, parsed data and supports filtering/grouping.

---

## Part 5: Uploading Health Documents

When the user sends a file (image or PDF) that appears to be a health document:

### Step 1: Confirm with the user

Always ask for confirmation before uploading: "I'll upload this to your Gene2AI Health Data Vault for AI analysis. The system will automatically extract all health indicators. Proceed?"

### Step 2: Determine document category

- `lab_result` — blood tests, urine tests, biochemistry panels
- `checkup` — annual physical exam reports
- `medical_record` — doctor visit notes, diagnoses
- `imaging` — X-ray, CT, MRI, ultrasound reports

### Step 3: Upload the file

```bash
curl -s -X POST "https://gene2.ai/api/v1/health-data/upload" \
  -H "Authorization: Bearer $GENE2AI_API_KEY" \
  -F "file=@{filepath}" \
  -F "source=openclaw" \
  -F "category={detected_category}" \
  -F "documentDate={date_if_known_YYYY-MM-DD}" \
  -F "title={brief_description}"
```

The response includes a document ID and status `"parsing"`. Save the document ID.

### Step 4: Poll parsing status

Wait 15 seconds, then check:

```bash
curl -s "https://gene2.ai/api/v1/health-data/doc/{doc_id}" \
  -H "Authorization: Bearer $GENE2AI_API_KEY"
```

### Step 5: Report results

- **If status is `"completed"`**: Show the number of extracted indicators, highlight any abnormal findings (`abnormalFlag` = `"high"`, `"low"`, `"critical_high"`, `"critical_low"`, or `"abnormal"`), and list the detected institution and document type.
- **If status is `"parsing"`**: Tell the user parsing is still in progress. They can check at https://gene2.ai/health-data later, or ask you to check again in a minute.
- **If status is `"failed"`**: Report the `parseError` message and suggest uploading directly on https://gene2.ai/health-data.

---

## Part 6: Submitting Structured Health Metrics

When the user reports health metrics verbally (e.g., "my blood pressure is 125/82", "血糖 5.8", "体重 72kg"):

### Common indicators and reference ranges

| Indicator | Chinese | Unit | Normal Range |
|-----------|---------|------|-------------|
| Systolic Blood Pressure | 收缩压 | mmHg | 90-140 |
| Diastolic Blood Pressure | 舒张压 | mmHg | 60-90 |
| Heart Rate | 心率 | bpm | 60-100 |
| Fasting Blood Glucose | 空腹血糖 | mmol/L | 3.9-6.1 |
| Body Temperature | 体温 | °C | 36.1-37.2 |
| Weight | 体重 | kg | — |
| Height | 身高 | cm | — |
| BMI | 体质指数 | kg/m² | 18.5-24.9 |
| Blood Oxygen | 血氧饱和度 | % | 95-100 |

### Determine abnormalFlag

- `"normal"` — within reference range
- `"high"` — above reference range
- `"low"` — below reference range
- `"critical_high"` — dangerously above (e.g., SBP > 180)
- `"critical_low"` — dangerously below (e.g., blood glucose < 2.8)

### Submit the data

```bash
curl -s -X POST "https://gene2.ai/api/v1/health-data/records" \
  -H "Authorization: Bearer $GENE2AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "self_reported",
    "title": "{brief_description}",
    "documentDate": "{today_YYYY-MM-DD}",
    "source": "openclaw",
    "records": [
      {
        "indicatorName": "{english_name}",
        "indicatorNameZh": "{chinese_name}",
        "valueNumeric": {numeric_value},
        "valueUnit": "{unit}",
        "refRangeLow": {low_bound_or_null},
        "refRangeHigh": {high_bound_or_null},
        "abnormalFlag": "{flag}"
      }
    ]
  }'
```

Confirm to the user that the data has been saved, and mention any abnormal values.

---

## Error Handling

| HTTP Status | Error Code | Meaning |
|---|---|---|
| 401 | `missing_token` | No Authorization header — check `GENE2AI_API_KEY` is set |
| 401 | `invalid_token` | API key is malformed or invalid |
| 403 | `token_expired` | API key expired (30-day limit) — user needs to regenerate at https://gene2.ai/api-keys |
| 403 | `key_revoked` | API key was manually revoked |
| 403 | `job_id_mismatch` | Key not authorized for this job ID (job-scoped keys only) |
| 404 | `job_not_found` | Job ID does not exist |
| 404 | `data_not_available` | Analysis not yet complete |

If you receive a `token_expired` or `key_revoked` error, instruct the user to visit https://gene2.ai/api-keys to generate a fresh API key.

---

## Recommended Query Strategy for Agents

### Data Tiers

Gene2AI organizes health data into three tiers for efficient agent usage:

| Tier | Endpoint | Size | Contains | Persistence |
|------|----------|------|----------|-------------|
| **Tier 1: Health Profile** | `/health-data/profile` | ~2-4KB | Conclusions only (risk levels, metabolizer status, abnormal flags) | **Cache and reuse** across sessions |
| **Tier 2: Detailed Records** | `/health-data/full`, `/health-data/risk-overview` | ~50-500KB | Specific genotypes, SNPs, lab values, cross-references | Use per-session, do not persist |
| **Tier 3: Raw Data** | Website only (gene2.ai) | MB+ | Original genetic files, full analysis JSON | Never enters agent context |

### Recommended Flow

1. **Start with the Health Profile**: Call `/health-data/profile` to get a compact overview. This is enough for most health-aware decisions (diet, exercise, general wellness questions). **Cache this in agent memory** for cross-session awareness.

2. **Drill down only when needed**: When the user asks a specific question (e.g., "What's my CYP2D6 genotype exactly?", "Show me my APOE SNPs"), call `/health-data/full?category=genomic&subcategory=cyp450` to get detailed records.

3. **Use risk-overview for comprehensive analysis**: Call `/health-data/risk-overview` when the user wants a full risk assessment combining genomic and lab data with cross-references.

4. **Cross-reference when relevant**: When discussing lab results, check `/health-data/genomic-links/{code}` to see if there are related genetic factors (e.g., high LDL → check for LDLR variants).

5. **Use grouped format for overviews**: `/health-data/full?format=grouped` organizes all data by category and subcategory, ideal for building comprehensive health summaries.

### Data Handling Guidelines

- **Tier 1 (Health Profile)**: Safe to cache, memorize, and reference across conversations. Contains no raw genetic data that could be used to reconstruct DNA information. Includes all medical findings (CT, ultrasound, X-ray, ECG, physical exam, etc.) as conclusion-level text grouped by category.
- **Tier 2 (Detailed Records)**: Use within the current conversation only. Contains specific genotypes and lab values that are more sensitive.
- When in doubt about which tier to use, **start with Tier 1**. The health profile's `suggestedFocusAreas` field will guide you on what to investigate further.
- The `medicalFindings` object groups all examination results by type (imaging, physical_exam, functional_test, clinical_notes). Each finding includes `examType` (CT/Ultrasound/X-ray/ECG/etc.), `bodyPart`, `finding` (original language), `conclusion`, `severity` (normal/mild/moderate/severe), and `date`. Findings within each category are sorted by date, newest first.

---

## Guidelines for Presenting Health Data

1. **Always include disclaimers**: Genetic data provides risk estimates, not diagnoses. Lab results should be interpreted by healthcare professionals. Always remind users to consult their doctor for medical decisions.

2. **Explain risk levels clearly**: "Elevated risk" does not mean certainty. Genetics is one factor among many (lifestyle, environment, family history).

3. **Be actionable**: When sharing pharmacogenomics data, suggest the user discuss findings with their doctor before making medication changes.

4. **Respect sensitivity**: Health and ancestry data can be emotionally sensitive. Present findings with care and context.

5. **Cross-reference data**: For holistic advice, combine genomic insights with lab results and self-reported metrics. For example, genetic vitamin D metabolism data combined with actual blood test levels provides more complete recommendations.

6. **Cite specific variants**: When discussing genomic findings, mention the rsID (e.g., rs7903146) so the user can verify or research further.

7. **Highlight abnormal values**: When presenting lab results, clearly flag any out-of-range values and provide context about what they mean.

8. **Always ask before uploading**: Health data is sensitive — never upload files without explicit user confirmation.

9. **Do NOT give medical advice**: When reporting abnormal values, provide context but always recommend consulting a healthcare professional.

10. **Data tiering**: Use the Health Profile (`/health-data/profile`) as the default data source. Only fetch detailed records when the user asks specific questions that require genotype-level or lab-value-level detail. The Health Profile is designed to be cached across sessions; detailed records should be treated as ephemeral.
