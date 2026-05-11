# AI Service

Der AI Service ruft Kennzahlen per HTTP vom Data Service ab und erzeugt daraus
eine kurze Interpretation fuer das Supplements-Projekt.

## Endpunkte

- `GET /analysis`
- `GET /health`
- `GET /live`
- `GET /ready`

## Umgebungsvariablen

- `DATA_SERVICE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
