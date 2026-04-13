# Workflow

## Ziel der Aufgabe

Wir müssen eine lauffaehige, containerisierte Anwendung bauen, die Google-Trends-Daten aus genau einer Produktkategorie verarbeitet, visualisiert und automatisch interpretiert. Technisch sind mindestens zwei per HTTP gekoppelte Services gefordert: ein Data Service fuer CSV-Einlesen und Kennzahlen sowie ein AI Service fuer die datenbasierte Interpretation. Zusaetzlich muss das Projekt lokal mit Docker Compose startbar sein, in Kubernetes mit mindestens zwei Deployments und zwei Services laufen, als vollstaendiges GitHub-Repository abgegeben werden und eine inhaltliche README sowie ein kurzer Pitch muessen erstellt werden.

## Analyse der Anforderungen

### Fachliche Anforderungen

- Es muss genau eine Kategorie aus der Aufgabenstellung gewaehlt werden.
- Innerhalb der Kategorie duerfen maximal 5 Begriffe gleichzeitig in Google Trends verglichen werden.
- Die Daten muessen fuer Deutschland, Zeitraum letzter Monat, Suchtyp Web Search exportiert werden.
- Es werden drei CSV-Typen benoetigt:
  - Interest over time
  - Top queries
  - Rising queries
- Die Anwendung muss auf Basis realer Daten konkrete Aussagen erzeugen, nicht nur allgemeine Texte.

### Technische Muss-Kriterien

- Mindestens 2 Services:
  - Data Service
  - AI Service
- Kommunikation ausschliesslich ueber HTTP.
- Kein direkter Dateizugriff zwischen den Services.
- Mindestens 2 Visualisierungen.
- Docker fuer alle Services.
- Lokaler Start ueber `docker compose up -d`.
- Kubernetes mit mindestens 2 Deployments und 2 Services.
- Repository muss Code, Dockerfiles, Kubernetes-Dateien und CSV-Dateien enthalten.
- README im Root mit Antworten auf die 7 Fragen, maximal 220 Zeilen.
- Pitch mit 1 bis 3 Minuten Dauer.

### Bewertungsrelevante Schwerpunkte

- README und Konzept sind mit 40 Punkten stark gewichtet.
- AI-Komponente ist mit 25 Punkten ebenfalls zentral.
- Docker und Kubernetes muessen funktional sein, sonst gehen viele Punkte verloren.
- Die Abgabe ist nicht nur Code, sondern ein vollstaendig dokumentiertes Projekt.

## Empfohlene Projektstruktur

```text
.
|-- README.md
|-- Workflow.md
|-- docker-compose.yml
|-- data/
|   |-- csv/
|   |   |-- interest_over_time.csv
|   |   |-- top_queries.csv
|   |   |-- rising_queries.csv
|-- services/
|   |-- data-service/
|   |   |-- Dockerfile
|   |   |-- app/...
|   |-- ai-service/
|   |   |-- Dockerfile
|   |   |-- app/...
|-- frontend/                # optional, falls Visualisierung separat gebaut wird
|-- k8s/
|   |-- data-service-deployment.yml
|   |-- data-service-service.yml
|   |-- ai-service-deployment.yml
|   |-- ai-service-service.yml
```

## Sinnvolle Arbeitsschritte

### Phase 1: Thema und Datensatz festlegen

Ziel: Eine Kategorie und bis zu 5 vergleichbare Begriffe festlegen, damit der Datenexport konsistent bleibt.

Arbeitsschritte:

1. Eine der Kategorien auswaehlen:
   - Schuhe
   - Matcha
   - Cold Drinks
   - Supplements
2. Innerhalb dieser Kategorie 3 bis 5 klar vergleichbare Begriffe festlegen.
3. Begriffe darauf pruefen, ob sie in Google Trends sinnvoll Vergleichswerte liefern.
4. Entscheidung dokumentieren, damit spaeter README und Pitch konsistent bleiben.

Ergebnis:

- Finales Thema
- Finale Begriffsliste
- Begruendung, warum diese Begriffe sinnvoll vergleichbar sind

### Phase 2: Google-Trends-Daten exportieren und ablegen

Ziel: Die verpflichtenden Rohdaten sauber im Repository ablegen.

Arbeitsschritte:

1. Google Trends mit den geforderten Filtern aufrufen:
   - Region: Deutschland
   - Zeitraum: letzter Monat
   - Suchtyp: Web Search
2. Die gewaehlten Begriffe eingeben.
3. CSV-Dateien exportieren fuer:
   - Interest over time
   - Top queries
   - Rising queries
4. Die CSV-Dateien in einem festen Ordner im Repository speichern.
5. Dateinamen vereinheitlichen und kurz dokumentieren.
6. Rohdaten kurz pruefen:
   - Spaltennamen
   - Datumsformat
   - Sonderzeichen
   - Dezimaltrennzeichen

Ergebnis:

- Vollstaendige CSV-Daten im Repo
- Reproduzierbare Datenbasis fuer beide Services

### Phase 3: Architektur und Technologien festlegen

Ziel: Vor dem Coden die einfachste Architektur waehlen, die alle Muss-Kriterien erfuellt.

Empfehlung:

- `data-service`: REST-API fuer CSV-Einlesen, Kennzahlen und aggregierte JSON-Ausgabe
- `ai-service`: REST-API, die Daten vom Data Service abruft und Interpretation erzeugt
- Optional:
  - kleiner Web-Client oder statische HTML-Seite fuer Visualisierungen
  - alternativ Visualisierung direkt im Data Service, wenn die Anforderungen damit sauber erfuellt werden

Wichtige Entscheidung:

Die Aufgabe verlangt mindestens zwei Services, aber nicht zwingend einen dritten Frontend-Service. Wenn wir die Visualisierung in einen bestehenden Service integrieren, bleibt die Architektur einfacher. Falls die Visualisierung sauberer als separates Frontend umsetzbar ist, kann ein dritter Service sinnvoll sein.

Ergebnis:

- Architekturdiagramm auf Papier oder in Markdown
- Entscheidung fuer Programmiersprache und Framework pro Service
- Festlegung der HTTP-Endpunkte

### Phase 4: Data Service bauen

Ziel: Der Data Service liefert alle strukturierten Daten fuer Analyse und Visualisierung.

Muss-Funktionen:

- CSV-Dateien einlesen
- Daten bereinigen
- Mean berechnen
- Peak berechnen
- Trendrichtung bestimmen

Sinnvolle Zusatzfunktionen:

- Peak-Datum ermitteln
- Ranking nach durchschnittlichem Interesse
- Erkennung der groessten Schwankung
- Zusammenfassung von Top und Rising Queries

Arbeitsschritte:

1. CSV-Parser implementieren.
2. Rohdaten in ein internes Datenmodell ueberfuehren.
3. Bereinigung implementieren:
   - leere Werte
   - Datumsparse
   - einheitliche Begriffsnamen
4. Kennzahlen berechnen:
   - Mean je Begriff
   - Maximum je Begriff
   - Trend je Begriff
5. API-Endpunkte bereitstellen, z. B.:
   - `GET /health`
   - `GET /metrics`
   - `GET /timeseries`
   - `GET /queries/top`
   - `GET /queries/rising`
6. JSON-Antworten so strukturieren, dass der AI Service damit direkt arbeiten kann.
7. Testen, ob die API mit echten CSV-Dateien konsistente Ergebnisse liefert.

Ergebnis:

- Laufender Data Service
- Strukturierte JSON-Datenbasis fuer alle weiteren Teile

### Phase 5: AI Service bauen

Ziel: Aus Kennzahlen konkrete, nachvollziehbare Aussagen generieren.

Wichtig:

Die AI darf nicht nur Texte erzeugen, sondern muss auf den berechneten Daten beruhen. Das heisst, die Prompts oder Regeln muessen Mean, Peak, Trend und weitere Metriken explizit verwenden.

Arbeitsschritte:

1. HTTP-Abruf zum Data Service implementieren.
2. Die Daten in ein Analyseobjekt uebernehmen.
3. Analyse-Logik definieren:
   - Welcher Begriff hat den hoechsten Mean?
   - Welcher Begriff hat den staerksten Peak?
   - Welche Begriffe steigen, fallen oder bleiben stabil?
   - Welche Unterschiede sind besonders auffaellig?
4. Eine AI-Funktion integrieren:
   - LLM-API fuer formale Interpretation
   - oder hybride Loesung aus Regelwerk plus LLM-Textformulierung
5. API-Endpunkt bereitstellen, z. B.:
   - `GET /health`
   - `GET /analysis`
6. Sicherstellen, dass die Antwort konkrete Aussagen enthaelt und nicht generisch bleibt.
7. Fehlerfaelle behandeln, falls der Data Service nicht erreichbar ist.

Empfehlung:

Fuer eine belastbare Bewertung ist eine hybride Loesung sinnvoll: zuerst harte Analyse-Regeln auf Basis der Daten, danach sprachliche Verdichtung durch ein LLM. So bleibt die AI fachlich nachvollziehbar.

Ergebnis:

- AI Service mit automatischer datenbasierter Interpretation

### Phase 6: Visualisierungen implementieren

Ziel: Mindestens zwei Visualisierungen, die Erkenntnisse klar sichtbar machen.

Empfohlene Visualisierungen:

1. Line Chart fuer den Zeitverlauf aller Begriffe
2. Balkendiagramm fuer Mean oder Peak im Vergleich

Optional zusaetzlich:

- Ranking-Ansicht
- Tabelle fuer Top Queries und Rising Queries

Arbeitsschritte:

1. Entscheiden, wo die Visualisierung liegt:
   - eingebettet im Data Service
   - separater Frontend-Service
2. Datenendpunkte fuer Charts anbinden.
3. Mindestens zwei Diagramme umsetzen.
4. Beschriftungen und Legenden sauber halten.
5. Kurze Textzusammenfassung neben den Diagrammen ergaenzen.

Ergebnis:

- Mindestens zwei funktionierende Visualisierungen
- Bessere Grundlage fuer README und Pitch

### Phase 7: Containerisierung mit Docker

Ziel: Alle Services lokal reproduzierbar starten.

Arbeitsschritte:

1. Pro Service ein eigenes Dockerfile erstellen.
2. Falls noetig gemeinsame Umgebungsvariablen definieren.
3. `docker-compose.yml` anlegen.
4. Services per Compose verbinden.
5. Testen mit:

```bash
docker compose up -d
docker compose ps
```

6. API-Endpunkte lokal pruefen.

Ergebnis:

- Vollstaendig containerisierte Anwendung
- Lokaler Start gemaess Aufgabenstellung

### Phase 8: Kubernetes-Manifeste erstellen

Ziel: Die Anwendung lokal in Kubernetes deployen.

Arbeitsschritte:

1. Ordner `k8s/` anlegen.
2. Fuer jeden Service mindestens ein Deployment erstellen.
3. Fuer jeden Service mindestens ein Service-Objekt erstellen.
4. Container-Images korrekt referenzieren.
5. Ports und Selektoren konsistent setzen.
6. Healthchecks ergaenzen, falls moeglich.
7. Deployment lokal pruefen mit:

```bash
kubectl apply -f k8s/
kubectl get deployments
kubectl get services
kubectl get pods
```

Ergebnis:

- Kubernetes-konforme Anwendung mit mindestens 2 Deployments und 2 Services

### Phase 9: README als benoteter Abgabeteil schreiben

Ziel: Den wichtigsten Bewertungsteil fruehzeitig vorbereiten und nicht erst am Schluss improvisieren.

Arbeitsschritte:

1. Fuer jede der 7 Pflichtfragen einen eigenen Abschnitt anlegen.
2. Antworten in vollstaendigen Saetzen mit ca. 7 bis 10 Zeilen schreiben.
3. Darauf achten, dass keine Stichpunkte als Endfassung verwendet werden.
4. Die technischen Startanweisungen klar und knapp formulieren.
5. Die maximale Laenge von 220 Zeilen einhalten.
6. Den datenbasierten Mehrwert und die AI-Logik deutlich erklaeren.

Ergebnis:

- Bewertungsreife README

### Phase 10: Pitch vorbereiten

Ziel: Den Projektwert in 1 bis 3 Minuten klar kommunizieren.

Arbeitsschritte:

1. Pitch-Skript schreiben.
2. Struktur festlegen:
   - Problemstellung
   - Datengrundlage
   - wichtigste Erkenntnisse
   - technische Umsetzung
3. Aufnahme erstellen.
4. Pruefen, ob Dauer und Aussagekraft passen.

Ergebnis:

- Abgabefertiger Pitch

### Phase 11: Abschlusskontrolle

Ziel: Vor Abgabe gezielt gegen die Bewertungsrubrik pruefen.

Checkliste:

1. Sind alle CSV-Dateien im Repository enthalten?
2. Gibt es mindestens zwei Services mit HTTP-Kommunikation?
3. Funktioniert die AI auf Basis strukturierter Daten?
4. Sind mindestens zwei Visualisierungen vorhanden?
5. Startet alles lokal mit Docker Compose?
6. Laeuft alles in Kubernetes mit mindestens zwei Deployments und zwei Services?
7. Ist das README vollstaendig und unter 220 Zeilen?
8. Ist der GitHub-Stand sauber und vollstaendig?
9. Ist der Pitch fertig?

## Empfohlene Reihenfolge fuer uns

Die sinnvollste Reihenfolge ist:

1. Kategorie und Begriffe festlegen
2. CSV-Dateien exportieren und ins Repo legen
3. Data Service implementieren
4. AI Service implementieren
5. Visualisierung ergaenzen
6. Docker Compose aufsetzen
7. Kubernetes-Manifeste erstellen
8. README schreiben
9. Pitch aufnehmen
10. Endkontrolle und Abgabe

## Konkrete naechste Schritte ab jetzt

Die ersten operativen Schritte fuer uns sind:

1. Eine Kategorie auswaehlen.
2. Fuenf oder weniger Begriffe final definieren.
3. Die drei CSV-Arten aus Google Trends exportieren.
4. Die Zielarchitektur fuer zwei Services festzurren.
5. Danach direkt den Data Service bauen, weil er die Grundlage fuer AI und Visualisierung ist.

## Kritische Punkte, auf die wir achten muessen

- Die AI darf nicht frei halluzinieren, sondern muss sichtbar auf Metriken beruhen.
- Die Begriffe muessen wirklich vergleichbar und aus derselben Kategorie sein.
- Visualisierung ist Pflicht und darf nicht vergessen werden.
- Docker Compose ist explizit gefordert, nicht nur einzelne Dockerfiles.
- Kubernetes-Dateien sollen laut Aufgabenstellung im Ordner `k8s/` liegen.
- README ist ein zentraler Bewertungspunkt und darf weder zu kurz noch zu lang sein.
- Die Abgabe ist spaetestens am 23.05.2026 faellig.
