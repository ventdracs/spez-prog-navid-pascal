# Data Service

Dieses Verzeichnis ist der Einstiegspunkt fuer den Data Service.

Aufgaben:

- CSV-Dateien aus `/app/data/csv` einlesen
- Kennzahlen wie Mean, Peak, Trend und Growth Percent berechnen
- Ergebnisse als JSON per HTTP bereitstellen

## Endpunkte

- `GET /health`
- `GET /live`
- `GET /ready`
- `GET /terms`
- `GET /metrics`
- `GET /metrics?term=Kreatin`
- `GET /timeseries`

Standardmaessig wertet `/metrics` alle vorhandenen Begriffe aus:

- Proteinpulver
- Kreatin
- Vitamin D
- Omega 3
- Magnesium

Beispiel:

```json
{
  "terms": [
    {
      "name": "Proteinpulver",
      "mean": 15.6,
      "peak": 20,
      "trend": "decreasing",
      "growth_percent": -26.3
    }
  ]
}
```
