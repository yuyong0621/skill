---
name: news-sentiment-analyzer
version: 1.0.0
description: Analyze sentiment from news articles and headlines using AI. Each call charges 0.001 USDT via SkillPay.
category: News
tags:
  - news
  - sentiment
  - AI
  - analysis
author: moson
price: 0.001
currency: USDT
triggers:
  - "analyze news sentiment"
  - "sentiment analysis"
  - "news emotion"
  - "headline sentiment"
config:
  OPENAI_API_KEY:
    type: string
    required: false
    secret: true
---

# News Sentiment Analyzer

## 功能

- 分析新闻文章的情感倾向
- 判断 headlines 是积极、消极还是中性
- 提供情感评分和置信度
- 支持批量分析多条新闻

## 使用方法

```json
{
  "texts": [
    "Fed signals interest rate cuts coming soon",
    "Stock market crashes amid recession fears"
  ]
}
```

## 输出

```json
{
  "results": [
    {"text": "...", "sentiment": "POSITIVE", "score": 0.85, "confidence": 0.92},
    {"text": "...", "sentiment": "NEGATIVE", "score": 0.78, "confidence": 0.88}
  ]
}
```

## 定价

每次调用: 0.001 USDT
