# Frontend

Dieses Verzeichnis enthaelt ein statisches Dashboard fuer das Supplements-Projekt.

## Ziel

Das Frontend verbindet:

- Kennzahlen aus dem Data Service
- Zeitreihen fuer Visualisierungen
- AI-Interpretation aus dem AI Service

## Inhalt

- KPI-Karten fuer Mean, Peak und Growth
- Verlaufschart fuer das Suchinteresse
- Vergleichsansicht fuer Mean und Peak
- AI-Auswertung fuer die fachliche Einordnung

## Start

Lokal ueber Docker Compose:

```bash
docker compose up --build -d
```

Dann ist das Dashboard unter `http://127.0.0.1:8080` erreichbar.
