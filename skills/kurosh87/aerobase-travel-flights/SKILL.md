---
name: aerobase-travel-flights
description: Search, compare, and score flights with jetlag optimization
metadata: {"openclaw": {"emoji": "🛫", "primaryEnv": "AEROBASE_API_KEY", "user-invocable": true, "homepage": "https://aerobase.app"}}
---

# Flight Search & Jetlag Scoring

Search flights, compare options, and get jetlag optimization scores.

## API Endpoints

### Search

**POST /api/v1/flights/search**
Search flights with jetlag scoring.

Request:
```json
{
  "from": "JFK",
  "to": "LHR", 
  "date": "2026-03-15",
  "returnDate": "2026-03-22",
  "cabinClass": "economy"
}
```

Returns flights sorted by jetlag composite score (best first).

### Score

**POST /api/v1/flights/score**
Score a specific flight for jetlag impact (0-100).

Request:
```json
{
  "from": "LAX",
  "to": "NRT",
  "departure": "2026-04-15T13:25:00-07:00",
  "arrival": "2026-04-16T15:40:00+09:00",
  "cabin": "business"
}
```

Response includes:
- Score (0-100, higher = less jetlag)
- Recovery days estimate
- Direction (eastbound/westbound)
- Strategy tips

### Compare

**POST /api/v1/flights/compare**
Compare 2-10 flights side-by-side.

### Lookup

**GET /api/v1/flights/lookup/{carrier}/{number}**
Look up flight details by airline code and flight number.

## Rate Limits

- **Free tier**: 5 API requests per day
- **Premium tier**: Unlimited requests

## Configuration

```bash
export AEROBASE_API_KEY="your_api_key_here"
```

Get your API key at: https://aerobase.app/connect
