import json

EXTRA = [
    {"swedish":"att ange","german":"angeben","example":"Ange ditt personnummer.","exampleTranslation":"Gib deine Personalnummer an."},
    {"swedish":"att avsluta","german":"beenden / abschließen","example":"Hon avslutade kursen med bra betyg.","exampleTranslation":"Sie schloss den Kurs mit guten Noten ab."},
    {"swedish":"att bedöma","german":"beurteilen","example":"Det är svårt att bedöma situationen.","exampleTranslation":"Es ist schwer, die Situation zu beurteilen."},
    {"swedish":"att bekräfta","german":"bestätigen","example":"Kan du bekräfta bokningen?","exampleTranslation":"Kannst du die Buchung bestätigen?"},
    {"swedish":"att dela med sig","german":"teilen / mitteilen","example":"Hon delade med sig av sina erfarenheter.","exampleTranslation":"Sie teilte ihre Erfahrungen mit."},
    {"swedish":"att förbättra","german":"verbessern","example":"Vi arbetar med att förbättra tjänsten.","exampleTranslation":"Wir arbeiten daran, den Dienst zu verbessern."},
    {"swedish":"att genomföra","german":"durchführen","example":"De genomförde projektet i tid.","exampleTranslation":"Sie führten das Projekt pünktlich durch."},
    {"swedish":"att kontrollera","german":"kontrollieren / überprüfen","example":"Kontrollera att allt stämmer.","exampleTranslation":"Überprüf, ob alles stimmt."},
    {"swedish":"att planera","german":"planen","example":"Vi planerar ett möte för nästa vecka.","exampleTranslation":"Wir planen ein Meeting für nächste Woche."},
    {"swedish":"att presentera","german":"vorstellen / präsentieren","example":"Hon presenterade sina resultat.","exampleTranslation":"Sie präsentierte ihre Ergebnisse."},
    {"swedish":"att prioritera","german":"priorisieren","example":"Du måste prioritera dina uppgifter.","exampleTranslation":"Du musst deine Aufgaben priorisieren."},
    {"swedish":"att representera","german":"vertreten / repräsentieren","example":"Han representerade Sverige utomlands.","exampleTranslation":"Er vertrat Schweden im Ausland."},
    {"swedish":"att ta ansvar","german":"Verantwortung übernehmen","example":"Du måste ta ansvar för dina handlingar.","exampleTranslation":"Du musst Verantwortung für deine Handlungen übernehmen."},
    {"swedish":"att uppnå","german":"erreichen / erzielen","example":"Vi uppnådde våra mål.","exampleTranslation":"Wir haben unsere Ziele erreicht."},
    {"swedish":"att utvärdera","german":"auswerten / bewerten","example":"Vi utvärderar resultaten i slutet av månaden.","exampleTranslation":"Wir werten die Ergebnisse am Ende des Monats aus."},
    {"swedish":"avdelning","german":"Abteilung","example":"Han jobbar på försäljningsavdelningen.","exampleTranslation":"Er arbeitet in der Verkaufsabteilung."},
    {"swedish":"balans","german":"Balance / Gleichgewicht","example":"Det är viktigt med balans i livet.","exampleTranslation":"Balance im Leben ist wichtig."},
    {"swedish":"chans","german":"Chance","example":"Det är en stor chans för dig.","exampleTranslation":"Das ist eine große Chance für dich."},
    {"swedish":"diskussion","german":"Diskussion","example":"Vi hade en lång diskussion.","exampleTranslation":"Wir hatten eine lange Diskussion."},
    {"swedish":"ekonomi","german":"Wirtschaft / Finanzen","example":"Landets ekonomi går bra.","exampleTranslation":"Die Wirtschaft des Landes läuft gut."},
    {"swedish":"erbjudande","german":"Angebot","example":"Det är ett bra erbjudande.","exampleTranslation":"Das ist ein gutes Angebot."},
    {"swedish":"föreläsare","german":"Dozent / Referent","example":"Föreläsaren var mycket kunnig.","exampleTranslation":"Der Dozent war sehr kompetent."},
    {"swedish":"genomgång","german":"Durchgang / Besprechung","example":"Vi har en genomgång av resultaten.","exampleTranslation":"Wir haben eine Besprechung der Ergebnisse."},
    {"swedish":"handledare","german":"Betreuer / Mentor","example":"Min handledare hjälper mig med uppsatsen.","exampleTranslation":"Mein Betreuer hilft mir bei der Arbeit."},
    {"swedish":"individuell","german":"individuell","example":"Du får individuell feedback.","exampleTranslation":"Du bekommst individuelles Feedback."},
    {"swedish":"kapacitet","german":"Kapazität","example":"Systemet har begränsad kapacitet.","exampleTranslation":"Das System hat begrenzte Kapazität."},
    {"swedish":"kompetens","german":"Kompetenz","example":"Han har hög kompetens inom IT.","exampleTranslation":"Er hat hohe Kompetenz im IT-Bereich."},
    {"swedish":"kommunikation","german":"Kommunikation","example":"God kommunikation är nyckeln.","exampleTranslation":"Gute Kommunikation ist der Schlüssel."},
    {"swedish":"metod","german":"Methode","example":"Vi använder en ny metod.","exampleTranslation":"Wir verwenden eine neue Methode."},
    {"swedish":"möjlig","german":"möglich","example":"Är det möjligt att ändra?","exampleTranslation":"Ist es möglich, es zu ändern?"},
    {"swedish":"nivå","german":"Niveau / Ebene","example":"Din nivå är mycket bra.","exampleTranslation":"Dein Niveau ist sehr gut."},
    {"swedish":"period","german":"Zeitraum / Periode","example":"Under en kortare period bodde han i Stockholm.","exampleTranslation":"Für eine kurze Zeit lebte er in Stockholm."},
    {"swedish":"perspektiv","german":"Perspektive","example":"Det ger ett nytt perspektiv.","exampleTranslation":"Das gibt eine neue Perspektive."},
    {"swedish":"prestation","german":"Leistung","example":"Det var en imponerande prestation.","exampleTranslation":"Das war eine beeindruckende Leistung."},
    {"swedish":"strävan","german":"Streben / Bestreben","example":"Hans strävan efter kunskap är beundransvärd.","exampleTranslation":"Sein Streben nach Wissen ist bewundernswert."},
    {"swedish":"strategi","german":"Strategie","example":"Vi behöver en tydlig strategi.","exampleTranslation":"Wir brauchen eine klare Strategie."},
    {"swedish":"vana","german":"Gewohnheit","example":"Det är en bra vana att motionera.","exampleTranslation":"Es ist eine gute Gewohnheit, Sport zu treiben."},
    {"swedish":"villkor","german":"Bedingung / Konditionen","example":"Läs igenom villkoren noga.","exampleTranslation":"Lies die Bedingungen sorgfältig durch."},
    {"swedish":"avsikt","german":"Absicht","example":"Vad är din avsikt?","exampleTranslation":"Was ist deine Absicht?"},
    {"swedish":"bedömning","german":"Beurteilung","example":"Det krävs en noggrann bedömning.","exampleTranslation":"Es ist eine sorgfältige Beurteilung erforderlich."},
    {"swedish":"deltagande","german":"Teilnahme","example":"Deltagandet var frivilligt.","exampleTranslation":"Die Teilnahme war freiwillig."},
    {"swedish":"framgång","german":"Erfolg","example":"Projektet var en stor framgång.","exampleTranslation":"Das Projekt war ein großer Erfolg."},
    {"swedish":"frihet","german":"Freiheit","example":"Frihet är ett grundläggande värde.","exampleTranslation":"Freiheit ist ein grundlegender Wert."},
    {"swedish":"förväntan","german":"Erwartung","example":"Mina förväntningar infriades.","exampleTranslation":"Meine Erwartungen wurden erfüllt."},
    {"swedish":"hinder","german":"Hindernis","example":"Vi stötte på ett oväntat hinder.","exampleTranslation":"Wir stießen auf ein unerwartetes Hindernis."},
    {"swedish":"insats","german":"Einsatz / Beitrag","example":"Det kräver en stor insats.","exampleTranslation":"Es erfordert einen großen Einsatz."},
    {"swedish":"kontakt","german":"Kontakt","example":"Håll kontakten!","exampleTranslation":"Bleib in Kontakt!"},
    {"swedish":"kostnad","german":"Kosten","example":"Kostnaden för projektet var hög.","exampleTranslation":"Die Kosten des Projekts waren hoch."},
    {"swedish":"mål","german":"Ziel","example":"Sätt upp tydliga mål.","exampleTranslation":"Setze klare Ziele."},
    {"swedish":"rapport","german":"Bericht","example":"Skriv en rapport om projektet.","exampleTranslation":"Schreib einen Bericht über das Projekt."},
    {"swedish":"risk","german":"Risiko","example":"Det finns en risk för förseningar.","exampleTranslation":"Es besteht ein Risiko für Verzögerungen."},
    {"swedish":"rubrik","german":"Überschrift","example":"Välj en tydlig rubrik.","exampleTranslation":"Wähle eine klare Überschrift."},
    {"swedish":"rutin","german":"Routine","example":"Det är en del av min rutin.","exampleTranslation":"Das ist Teil meiner Routine."},
    {"swedish":"syfte","german":"Zweck / Absicht","example":"Vad är syftet med mötet?","exampleTranslation":"Was ist der Zweck des Meetings?"},
    {"swedish":"tillstånd","german":"Erlaubnis / Zustand","example":"Du behöver tillstånd för det.","exampleTranslation":"Du brauchst eine Erlaubnis dafür."},
    {"swedish":"trygghet","german":"Sicherheit / Geborgenheit","example":"Trygghet är viktig för barn.","exampleTranslation":"Sicherheit ist wichtig für Kinder."},
    {"swedish":"öppenhet","german":"Offenheit","example":"Öppenhet skapar förtroende.","exampleTranslation":"Offenheit schafft Vertrauen."},
    {"swedish":"omgivning","german":"Umgebung","example":"Vi bor i en vacker omgivning.","exampleTranslation":"Wir leben in einer schönen Umgebung."},
    {"swedish":"rörelse","german":"Bewegung","example":"Rörelse är bra för hälsan.","exampleTranslation":"Bewegung ist gut für die Gesundheit."},
    {"swedish":"takt","german":"Takt / Tempo","example":"Håll takten!","exampleTranslation":"Halte das Tempo!"},
    {"swedish":"upplevelse","german":"Erlebnis","example":"Det var en fantastisk upplevelse.","exampleTranslation":"Es war ein fantastisches Erlebnis."},
    {"swedish":"växel","german":"Gang / Wechsel","example":"Lägg i rätt växel.","exampleTranslation":"Lege den richtigen Gang ein."},
]


def pad_a2():
    with open("app/data/vocabulary/a1.json", encoding="utf-8") as f:
        a1_words = {w["swedish"].lower() for w in json.load(f)["words"]}
    with open("app/data/vocabulary/a2.json", encoding="utf-8") as f:
        a2_data = json.load(f)

    existing = {w["swedish"].lower() for w in a2_data["words"]}
    exclusions = a1_words | existing

    added = []
    skipped = []
    for word in EXTRA:
        key = word["swedish"].lower()
        if key in exclusions:
            skipped.append(word["swedish"])
            continue
        added.append(word)
        exclusions.add(key)

    a2_data["words"].extend(added)
    for i, w in enumerate(a2_data["words"], 1):
        w["id"] = f"a2_{i:03d}"

    with open("app/data/vocabulary/a2.json", "w", encoding="utf-8") as f:
        json.dump(a2_data, f, ensure_ascii=False, indent=2)

    print(f"Added: {len(added)}, Skipped: {len(skipped)}, Total: {len(a2_data['words'])}")
    if skipped:
        print("Skipped:", skipped)


pad_a2()
