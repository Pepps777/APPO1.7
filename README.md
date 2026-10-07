# APPO Familienkalender – Web-App

Gemeinsamer Familienkalender für APPO-Betreuung, Termine, INFO, SPEZIELL und FC BASEL.

## Lokal starten

```bash
npm start
```
Dann `http://localhost:3000` öffnen.

## Online mit Render

Die Datei `render.yaml` ist vorbereitet. Sie legt einen Node-Web-Service mit persistentem Speicher an. `APP_PIN` kann im Render-Dashboard als geheimes Environment-Variable gesetzt werden.

Wichtig: Render-Free-Web-Services haben ein flüchtiges Dateisystem. Für diese Variante ist deshalb ein persistenter Datenträger vorgesehen; dieser ist bei Render an einen kostenpflichtigen Service gebunden.

## Gemeinsame Nutzung

Alle Browser greifen auf dieselbe serverseitige `calendar.json` zu. Die Oberfläche fragt zusätzlich alle 2 Sekunden nach neuen Daten, damit Änderungen in bereits geöffneten Kalendern zeitnah erscheinen.


## Mobile-Optimierung / gemeinsame Speicherung

Die Web-App ist für Smartphones optimiert. Änderungen werden serverseitig in `calendar.json`
gespeichert und geöffnete Geräte prüfen den gemeinsamen Datenstand alle 2 Sekunden sowie
beim Zurückkehren zur App. Damit sehen alle denselben gespeicherten Kalender.

Für dauerhafte Speicherung auf Render muss der in `render.yaml` definierte Persistent Disk
aktiv sein. Ein Redeploy auf Render ist nach Änderungen am Code erforderlich.


## Feiertage
Die Kalenderansicht berechnet feste und bewegliche Schweizer Feiertage automatisch (u. a. Neujahr, Karfreitag, Ostermontag, Auffahrt, Pfingstmontag, 1. August, Weihnachten am 25.12. und Stephanstag am 26.12.). Die fehlerhaften historischen Feiertags-Einträge wurden entfernt.
