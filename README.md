# Google Trends Supplements Analysis

## 1. Executive Summary

In diesem Projekt analysieren wir die Google-Trends-Kategorie `Supplements` für Deutschland.
Verglichen werden die fünf Begriffe Proteinpulver, Kreatin, Vitamin D, Omega 3 und Magnesium.
Die Daten stammen aus dem Zeitraum des letzten Monats und aus der Websuche.
Technisch besteht das System aus einem Data Service, einem AI Service und einem Frontend-Dashboard.
Der Data Service berechnet Kennzahlen aus `interest over time` sowie Query-Signale und Business Use Cases aus `top queries` und `rising queries`, der AI Service interpretiert diese per HTTP und OpenAI, und das Frontend visualisiert die Ergebnisse.
Magnesium zeigt im Datensatz den höchsten Durchschnitt und den höchsten Peak, während Kreatin als einziger Begriff ein positives Wachstum besitzt.
Zusätzlich zeigen die Query-Dateien, dass Kreatin die grösste Überlappung zwischen etablierten und steigenden Suchanfragen besitzt, während Proteinpulver trotz schwacher Basis die meisten Breakouts in der Long-Tail-Suche aufweist.
Damit verbindet das Projekt Datenaufbereitung, API-Kommunikation, AI-Auswertung, Containerisierung und Kubernetes in einer durchgängigen Anwendung.

## 2. Ziele des Projekts

Ziel des Projekts ist es, öffentliche Google-Trends-Daten in einen konkreten Anwendungsfall für Marketing- und Produktentscheidungen im Supplements-Bereich zu überführen.
Im Mittelpunkt steht die Frage, welche Supplements aktuell stark gesucht werden und welche Begriffe an Dynamik gewinnen oder verlieren, sodass Kampagnenbudgets, Content-Themen und Sortimente datenbasiert priorisiert werden können.
Konkret beantwortet die Anwendung drei Use-Case-Fragen: Welcher Begriff hat das höchste Suchinteresse, welcher Begriff wächst am stärksten und wo lohnt sich ein schneller Marketing-Schwerpunkt.
Damit liefert das Projekt keine reine Datenanzeige, sondern eine kurze fachliche Einordnung pro Begriff, die direkt in Entscheidungen einfliessen kann.
Aus technischer Sicht soll zusätzlich gezeigt werden, wie mehrere Services über HTTP zusammenarbeiten, wie Daten reproduzierbar verarbeitet werden und wie das Projekt sowohl lokal als auch in Kubernetes betrieben werden kann.

## 3. Anwendung und Nutzung

Lokal wird die Anwendung im Projekt-Root mit `docker compose up --build -d` gestartet. Andernfalls kann sie über das Skript gestartet werden:

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

Wichtige Endpunkte sind `GET /metrics`, `GET /timeseries`, `GET /queries` und `GET /overview` im Data Service, `GET /analysis` im AI Service sowie `GET /live` und `GET /ready` für Health Checks.
In Kubernetes ist das Dashboard zusätzlich über `http://dashboard.localhost` und der AI Service über `http://ai.localhost` erreichbar.
Der AI Service liest nie direkt Dateien, sondern ruft die Daten ausschliesslich per HTTP vom Data Service ab.

Die Anwendung wird über das Frontend-Dashboard genutzt: Nach dem Start öffnen Nutzer:innen das Dashboard im Browser, sehen sofort die berechneten Kennzahlen, das Zeitverlaufsdiagramm, das Mean-Peak-Vergleichsdiagramm, die Query-Highlights und die automatische AI-Interpretation. Über den Refresh-Button lassen sich die Werte jederzeit neu abrufen.
Potenzielle Nutzer:innen sind Marketing- und Produktteams im Supplements-Umfeld, Content- und SEO-Verantwortliche, kleine D2C-Marken sowie Studierende und Lehrende, die ein konkretes Beispiel für eine datenbasierte AI-Anwendung suchen.

## 4. Datenanalyse und Ergebnisse

Die Kennzahlen zeigen klare Unterschiede zwischen den fünf Supplements.
Magnesium erreicht mit einem Durchschnitt von 87,7 und einem Peak von 100 die höchsten relativen Werte im Vergleich der fünf Begriffe.
Vitamin D liegt mit einem Durchschnitt von 50,7 im oberen Mittelfeld und zeigt einzelne starke Ausschläge.
Omega 3 erreicht einen Durchschnitt von 41,2, weist aber ein negatives Wachstum von -21,7 Prozent auf.
Kreatin liegt mit einem Durchschnitt von 26,4 unter Magnesium, Vitamin D und Omega 3, ist aber der einzige Begriff mit positivem Wachstum von 18,2 Prozent.
Proteinpulver zeigt mit 15,6 den niedrigsten Durchschnitt und mit -31,6 Prozent auch den stärksten Rückgang.
Die zweite Analyseebene über `top queries` und `rising queries` ergänzt dieses Bild deutlich: Magnesium bleibt auch auf Query-Ebene stark, weil `magnesium komplex` die wichtigste Top Query ist und mehrere Melaviva-bezogene Suchanfragen als Breakout auftauchen.
Kreatin zeigt mit 21 gemeinsamen Anfragen zwischen Top und Rising Queries die stärkste Überlappung, was auf stabile Nachfrage bei gleichzeitig steigender Aufmerksamkeit hindeutet.
Proteinpulver hat zwar die schwächste Zeitreihenbasis, aber mit 12 Breakouts und 19 starken Rising Queries die höchste Long-Tail-Dynamik.
Für Unternehmen entstehen daraus drei konkrete Use Cases: Content- und Education-Planung rund um stark nachgefragte Wirkungs- und Anwendungsfragen, Produkt- und Formulierungsplanung anhand von Signalen wie `magnesium komplex`, `kreatin monohydrat` oder `vitamin d k2`, und Channel- und Retail-Aktivierung über Händler- und Markenqueries wie `dm`, `amazon`, `esn` oder `norsan`.

## 5. Visualisierung

Das Frontend-Dashboard wurde passend zur Aufgabenstellung als klare, kompakte Visualisierung umgesetzt.
Es kombiniert Kennzahlen, AI-Auswertung und zwei zentrale Diagrammtypen.
Das Zeitverlaufsdiagramm zeigt die tägliche Entwicklung aller fünf Begriffe über den betrachteten Monat und macht Peaks und Verläufe direkt sichtbar.
Ein Vergleichsdiagramm stellt Mean und Peak je Begriff gegenüber und erlaubt einen schnellen Strukturvergleich.
Ergänzt wird das Dashboard durch KPI-Karten, ein Trend-Ranking nach Growth Percent, Business-Use-Case-Karten, Query-Highlight-Karten für Breakouts und Overlap sowie Detailkarten pro Supplement für Top- und Rising-Queries.
Dadurch werden die Daten nicht nur technisch sichtbar, sondern auch fachlich leichter interpretierbar.

## 6. Herausforderungen und Learnings

Die grösste fachliche Hürde lag im Frontend, weil wir uns klare Vorstellungen davon gemacht hatten, wie die Informationen am Ende aussehen sollten, aber die Umsetzung deutlich aufwendiger war als gedacht.
Vor allem die Aufteilung von Kennzahlen, Diagrammen, Query-Highlights und Business-Use-Case-Karten musste mehrmals überarbeitet werden, bis das Dashboard wirklich verständlich war und die richtigen Informationen im Vordergrund standen.
An mehreren Stellen tauchten bestimmte Daten im Dashboard zunächst gar nicht auf, obwohl es keinen offensichtlichen Grund dafür gab; in solchen Fällen mussten wir die Datenflüsse vom Data Service über den AI Service bis ins Frontend einzeln nachvollziehen, um die Ursache überhaupt einzugrenzen.
Eine zweite grosse Herausforderung war Kubernetes, mit dem wir vorher noch nie gearbeitet hatten und das uns am Anfang ehrlich gesagt überfordert hat.
Es hat einige Zeit gebraucht, bis wir wirklich verstanden haben, was wir genau anlegen, wozu Deployments, Services und Ingress jeweils gut sind und wie alles zusammenhängt.
Genau daraus ist aber auch unser stärkstes Learning entstanden: Kubernetes wirkt anfangs sehr abstrakt, macht aber gerade für eine Anwendung aus mehreren Services und mehreren Komponenten vieles spürbar einfacher und nachvollziehbarer.
Insgesamt haben wir mitgenommen, wie wichtig saubere Schnittstellen, gute Visualisierungsentscheidungen und ein ruhiges, schrittweises Herantasten an neue Technologien für ein funktionierendes Gesamtsystem sind.

## 7. Zukunftsvision

Das System kann fachlich und technisch weiter ausgebaut werden.
Der wichtigste nächste Schritt wäre eine automatisierte Data Pipeline, die die Google-Trends-Daten nicht mehr manuell als CSV exportiert, sondern regelmässig per Scheduler abruft, normalisiert und versioniert im Data Service ablegt.
Dadurch würde aus der heutigen Momentaufnahme ein laufendes Monitoring, in dem sich Verläufe über mehrere Monate vergleichen und Veränderungen sofort sichtbar machen lassen.
Aufbauend darauf könnte ein Opportunity Score entstehen, der Mean, Peak, Trend, Wachstum, Breakouts, Overlap und Schwankung kombiniert und Begriffe automatisch nach Marketingpotenzial priorisiert.
Der AI Service könnte zusätzlich konkrete Handlungsempfehlungen formulieren, zum Beispiel für Kampagnen, Produktplatzierung oder SEO-Inhalte.
Technisch wären Authentifizierung, persistente Speicherung historischer Analysen und ein CI/CD-Deployment sinnvolle Erweiterungen.
Langfristig könnte aus dem Projekt ein datengetriebenes Monitoring für reale Produkt- und Marketingentscheidungen im Supplements-Bereich entstehen.
