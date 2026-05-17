# AI Service

Der AI Service ruft Kennzahlen und Query-Analysen per HTTP vom Data Service ab und erzeugt daraus
eine kurze Interpretation fuer das Supplements-Projekt.

## Endpunkte

- `GET /analysis`
- `GET /health`
- `GET /live`
- `GET /ready`

Die Analyse kombiniert:

- Interest-over-time-Kennzahlen wie Mean, Peak, Trend und Growth Percent
- Top Queries pro Begriff
- Rising Queries inklusive Breakout-Erkennung
- Query-Highlights wie Overlap und Momentum-Dichte
- drei konkrete Business Use Cases fuer Unternehmensentscheidungen

## Umgebungsvariablen

- `DATA_SERVICE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
