# Google Trends Supplements Analysis

## 1. Executive Summary

In diesem Projekt analysieren wir die Google-Trends-Kategorie `Supplements` für Deutschland.
Verglichen werden die fünf Begriffe Proteinpulver, Kreatin, Vitamin D, Omega 3 und Magnesium.
Die Daten stammen aus dem Zeitraum des letzten Monats und aus der Websuche.
Technisch besteht das System aus einem Data Service, einem AI Service und einem Frontend-Dashboard.
Der Data Service berechnet Kennzahlen aus `interest over time` sowie Query-Signale und Business Use Cases aus `top queries` und `rising queries`, der AI Service interpretiert diese per HTTP und OpenAI, und das Frontend visualisiert die Ergebnisse.
Magnesium zeigt im Datensatz den höchsten Durchschnitt und den höchsten Peak, während Kreatin als einziger Begriff ein positives Wachstum besitzt.
Zusätzlich zeigen die Query-Dateien, dass Kreatin die größte Überlappung zwischen etablierten und steigenden Suchanfragen besitzt, während Proteinpulver trotz schwacher Basis die meisten Breakouts in der Long-Tail-Suche aufweist.
Damit verbindet das Projekt Datenaufbereitung, API-Kommunikation, AI-Auswertung, Containerisierung und Kubernetes in einer durchgängigen Anwendung.

## 2. Ziele des Projekts (Fix mehr Fokus auf use case)

Ziel des Projekts ist es, öffentliche Google-Trends-Daten in eine nutzbare Analyseanwendung zu überführen.
Die Anwendung soll nicht nur Rohdaten anzeigen, sondern konkrete Kennzahlen und eine kurze fachliche Einordnung liefern.
Im Mittelpunkt steht die Frage, welche Supplements aktuell stark gesucht werden und welche Begriffe an Dynamik gewinnen oder verlieren.
Aus technischer Sicht soll gezeigt werden, wie mehrere Services über HTTP zusammenarbeiten, wie Daten reproduzierbar verarbeitet werden und wie ein Projekt lokal und in Kubernetes betrieben werden kann.
Fachlich soll die Anwendung Marketing-, Produkt- und Content-Entscheidungen datenbasiert unterstützen.

## 3. Anwendung und Nutzung (Anpassung: Wie wird Ihre Anwendung genutzt? Wer sind die potenziellen Nutzer:innen?)

Lokal wird die Anwendung im Projekt-Root mit `docker compose up --build -d` gestartet. Andernfalls kann die Anwendung auch über das Script gestartet werden:
MacOS / Linux:

```bash
./deploy.sh
```

Windows (Git Bash oder WSL):

```bash
bash deploy.sh
```
Danach sind die wichtigsten Komponenten unter folgenden URLs erreichbar:

- Data Service: `http://127.0.0.1:8000`
- AI Service: `http://127.0.0.1:8001`
- Frontend-Dashboard: `http://127.0.0.1:8080`

Wichtige Endpunkte sind:

- `GET /metrics` im Data Service fuer Mean, Peak, Trend und Growth Percent
- `GET /queries` im Data Service fuer Top Queries, Rising Queries, Breakouts und Overlap
- `GET /overview` im Data Service fuer die kombinierte Analysebasis des AI Service
- `GET /timeseries` im Data Service fuer den Zeitverlauf
- `GET /analysis` im AI Service fuer Daten plus Textinterpretation
- `GET /live` und `GET /ready` fuer Health Checks

In Kubernetes ist das Dashboard zusaetzlich ueber `http://dashboard.localhost` erreichbar und der AI Service ueber `http://ai.localhost`.
Der AI Service liest nie direkt Dateien, sondern ruft die Daten ausschliesslich per HTTP vom Data Service ab.

## 4. Datenanalyse und Ergebnisse

Die Kennzahlen zeigen klare Unterschiede zwischen den fünf Supplements.
Magnesium erreicht mit einem Durchschnitt von 87,7 und einem Peak von 100 die höchsten relativen Werte im Vergleich der fünf Begriffe.
Vitamin D liegt mit einem Durchschnitt von 50,7 im oberen Mittelfeld und zeigt einzelne starke Ausschläge.
Omega 3 erreicht einen Durchschnitt von 41,2, weist aber ein negatives Wachstum von -21,7 Prozent auf.
Kreatin liegt mit einem Durchschnitt von 26,4 zwar unter Magnesium, Vitamin D und Omega 3, ist aber der einzige Begriff mit positivem Wachstum von 18,2 Prozent.
Proteinpulver zeigt mit 15,6 den niedrigsten Durchschnitt und mit -31,6 Prozent auch den stärksten Rückgang.
Die zweite Analyseebene über `top queries` und `rising queries` ergänzt dieses Bild deutlich.
Magnesium bleibt auch auf Query-Ebene stark, weil `magnesium komplex` die wichtigste Top Query ist und mehrere Melaviva-bezogene Suchanfragen als Breakout auftauchen.
Kreatin zeigt mit 21 gemeinsamen Anfragen zwischen Top und Rising Queries die stärkste Überlappung; das deutet auf eine stabile Nachfrage mit gleichzeitig weiter steigender Aufmerksamkeit hin.
Proteinpulver hat zwar die schwächste Zeitreihenbasis, aber mit 12 Breakouts und 19 starken Rising Queries die höchste Long-Tail-Dynamik.
Für Unternehmen entstehen daraus drei konkrete Use Cases: erstens Content- und Education-Planung rund um stark nachgefragte Wirkungs- und Anwendungsfragen, zweitens Produkt- und Formulierungsplanung anhand von Signalen wie `magnesium komplex`, `kreatin monohydrat` oder `vitamin d k2`, und drittens Channel- und Retail-Aktivierung über Händler- und Markenqueries wie `dm`, `amazon`, `esn` oder `norsan`.
Aus fachlicher Sicht signalisiert Magnesium damit das höchste konstante Grundinteresse, Kreatin das sauberste Zusammenspiel aus Bestand und Wachstum und Proteinpulver die volatilste Opportunity im Suchverhalten.

## 5. Visualisierung

Das Frontend-Dashboard wurde passend zur Aufgabenstellung als klare, kompakte Visualisierung umgesetzt.
Es kombiniert Kennzahlen, AI-Auswertung und zwei zentrale Diagrammtypen.
Das Zeitverlaufsdiagramm zeigt die tägliche Entwicklung aller fünf Begriffe über den betrachteten Monat.
Ein Vergleichsdiagramm stellt Mean und Peak je Begriff gegenüber.
Ergänzt wird das Dashboard durch KPI-Karten, ein Trend-Ranking nach Growth Percent, Business-Use-Case-Karten, Query-Highlight-Karten fuer Breakouts und Overlap sowie Detailkarten pro Supplement fuer Top- und Rising-Queries.
Dadurch werden die Daten nicht nur technisch sichtbar, sondern auch fachlich leichter interpretierbar.

## 6. Herausforderungen und Learnings (vielleicht auf KUbernetes detaillierter eingehen)

Eine wichtige Herausforderung war die saubere Verarbeitung der CSV-Daten ohne manuelle Änderung der Dateien.
Leere Werte, der Ausdruck `<1`, Unicode-Whitespace, Prozentwerte wie `4.300 %` und der Sonderfall `Breakout` mussten im Code behandelt werden.
Eine weitere Herausforderung war die Überfuehrung der Vorlesungsbeispiele in eine echte Drei-Service-Architektur mit Data Service, AI Service und Frontend.
Für den Betrieb in Docker Compose und Kubernetes mussten Pfade, Ports, Service-Namen, Probes und Ingress-Routing sauber aufeinander abgestimmt werden.
Auch die sichere Bereitstellung des OpenAI-Keys war relevant; dafür wurden Kubernetes Secret und Sealed Secret berücksichtigt.
Gelernt haben wir vor allem, dass saubere Schnittstellen, reproduzierbare Datenaufbereitung und eine klare Trennung zwischen Zeitreihenanalyse und Query-Analyse für ein funktionierendes Gesamtsystem entscheidend sind.

## 7. Zukunftsvision

Das System kann fachlich und technisch weiter ausgebaut werden.
Der nächste sinnvolle Schritt ist kein weiteres Einlesen der Query-Dateien mehr, sondern eine stärkere Verdichtung der bereits vorhandenen Analysedaten.
Darauf aufbauend könnte ein Opportunity Score entstehen, der Mean, Peak, Trend, Wachstum, Breakouts, Overlap und Schwankung kombiniert.
Der AI Service könnte zusätzlich konkrete Handlungsempfehlungen formulieren, zum Beispiel für Kampagnen, Produktplatzierung oder SEO-Inhalte.
Technisch wären Authentifizierung, persistente Speicherung historischer Analysen und ein CI/CD-Deployment sinnvolle Erweiterungen.
Langfristig könnte aus dem Projekt ein datengetriebenes Monitoring für reale Produkt- und Marketingentscheidungen im Supplements-Bereich entstehen.
