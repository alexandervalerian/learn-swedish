interface Topic {
  name: string
  keywords: string[]
}

// Matched against word.german.toLowerCase() via .includes(). First topic match wins.
// Farben & Formen uses COLOR_REGEX instead of keywords (see getTopicForWord).
const TOPICS: Topic[] = [
  {
    name: 'Familie',
    keywords: [
      'familie', 'mutter', 'vater', 'bruder', 'schwester', 'sohn', 'tochter',
      'großmutter', 'großvater', 'onkel', 'tante', 'cousin', 'ehemann',
      'ehefrau', 'enkel', 'mama', 'papa', 'eltern', 'geschwister',
      'verwandte', 'schwiegermutter', 'schwiegervater', 'nichte', 'neffe',
      'geburtstag',
    ],
  },
  {
    name: 'Essen & Trinken',
    keywords: [
      'essen', 'trinken', 'speise', 'mahlzeit', 'getränk', 'hunger',
      'wasser', 'milch', 'brot', 'kaffee', 'tee', 'zucker', 'salz', 'pfeffer',
      'fleisch', 'fisch', 'gemüse', 'kartoffel', 'reis', 'suppe', 'butter',
      'käse', 'hähnchen', 'tomate', 'banane', 'orange', 'apfel', 'birne',
      'erdbeere', 'himbeere', 'blaubeere', 'pilz', 'öl', 'honig', 'nüsse',
      'bohnen', 'mais', 'sahne', 'marmelade', 'senf', 'pizza', 'lachs',
      'hering', 'schinken', 'kabeljau', 'garnelen', 'hackfleisch', 'wurst',
      'steak', 'rindfleisch', 'schweinefleisch', 'hamburger', 'snack',
      'vegetarisch', 'vegan', 'glutenfrei', 'kochen', 'backen', 'grillen',
      'frühstück', 'mittagessen', 'abendessen', 'vorspeise', 'hauptgericht',
      'dessert', 'nachspeise', 'speisekarte', 'restaurant', 'rezept', 'zutat',
      'pfannkuchen', 'fleischbällchen', 'preiselbeere', 'smörgåsbord',
      'surströmming', 'kaffeepause', 'zimtschnecke', 'saft', 'bier', 'wein',
      'schokolade', 'kuchen', 'torte', 'pasta', 'nudeln', 'salat', 'zwiebel',
      'karotte', 'möhre', 'gurke', 'paprika', 'kanelbullar',
    ],
  },
  {
    name: 'Körper & Gesundheit',
    keywords: [
      'kopf', 'auge', 'ohr', 'nase', 'mund', 'zahn', 'arm', 'bein',
      'hand', 'finger', 'fuß', 'rücken', 'bauch', 'magen', 'herz', 'hals',
      'nacken', 'schulter', 'knie', 'brust', 'gesicht', 'haar', 'haut',
      'leber', 'niere', 'lunge', 'gehirn', 'gelenk', 'muskel', 'nerv', 'zeh',
      'krank', 'gesund', 'krankenhaus', 'apotheke', 'zahnarzt',
      'krankenschwester', 'krankenpfleger', 'husten', 'niesen', 'fieber',
      'erkältung', 'schmerz', 'allergie', 'medizin', 'medikament', 'pflaster',
      'verband', 'diagnose', 'symptom', 'impfung', 'blutdruck', 'blutzucker',
      'krebs', 'diabetes', 'grippe', 'kalorien', 'vitamin', 'protein',
      'cholesterin', 'blutgruppe', 'operation', 'narbe', 'ultraschall',
      'therapie', 'rehabilitation', 'verletzung', 'wunde', 'knochenbruch',
      'dosis', 'tablette', 'spritze', 'bluttest', 'wartezimmer',
      'krankschreibung', 'gesundheitscheck', 'burnout', 'notaufnahme',
      'überweisung', 'arzneimittel', 'arzt', 'ärztin', 'körper',
      'durstig', 'hungrig', 'müde', 'erschöpft',
    ],
  },
  {
    name: 'Kleidung & Mode',
    keywords: [
      'hemd', 'hose', 'rock', 'kleid', 'jacke', 'mantel', 'pullover',
      'sweatshirt', 'socken', 'strümpfe', 'schuhe', 'stiefel', 'mütze',
      'fäustlinge', 'handschuhe', 'schal', 'brille', 'ring', 'halskette',
      'hut', 'kleidung', 'mode', 'bekleidung', 'strickjacke', 'cardigan',
      'anzug', 'badeanzug', 'kostüm', 'bekleidungsgeschäft', 'größe',
      'unterwäsche', 'gürtel', 'reißverschluss',
    ],
  },
  {
    name: 'Zuhause & Wohnen',
    keywords: [
      'zimmer', 'raum', 'küche', 'badezimmer', 'wohnzimmer', 'schlafzimmer',
      'flur', 'diele', 'garten', 'treppe', 'fußboden', 'wand', 'balkon',
      'keller', 'schrank', 'regal', 'teppich', 'vorhang', 'gardine',
      'kissen', 'bettdecke', 'kühlschrank', 'herd', 'backofen', 'ofen',
      'geschirrspüler', 'waschmaschine', 'dusche', 'badewanne', 'spiegel',
      'handtuch', 'seife', 'zahnbürste', 'zahnpasta', 'waschbecken',
      'sofa', 'lampe', 'wohnung', 'miete', 'aufzug', 'fahrstuhl', 'etage',
      'terrasse', 'villa', 'abstellraum', 'speisekammer', 'kommode',
      'bücherregal', 'kleiderschrank', 'spülbecken', 'wasserhahn',
      'esszimmer', 'steckdose', 'thermostat', 'heizung', 'vermieter',
      'mieter', 'mietvertrag', 'wohnfläche', 'fassade', 'einfahrt',
      'parkplatz', 'reparatur', 'gartenarbeit', 'spielplatz', 'werkzeug',
      'eingang', 'briefkasten', 'zaun', 'kamin', 'müll', 'abfall',
      'möbel', 'bett', 'tisch', 'stuhl', 'toilette', 'hausnummer', 'haus',
    ],
  },
  {
    name: 'Schule & Bildung',
    keywords: [
      'schule', 'schüler', 'studentin', 'student', 'lehrer', 'lehrerin',
      'unterricht', 'tafel', 'kreide', 'lineal', 'schere', 'rucksack',
      'notizbuch', 'bibliothek', 'universität', 'prüfung', 'hausaufgabe',
      'bildung', 'ausbildung', 'forschung', 'kurs', 'vorlesung', 'zeugnis',
      'abschluss', 'examen', 'praktikum', 'stipendium', 'seminar', 'lehrplan',
      'aula', 'semester', 'labor', 'gymnasium', 'studienkredit', 'federmäppchen',
      'radiergummi', 'klassenraum', 'dissertation', 'studienberater',
      'volkshochschule', 'ausbildungsplatz', 'lehrling', 'auszubildender',
      'weiterbildung', 'abhandlung', 'grundschule', 'oberschule', 'abitur',
      'schulpause', 'lernen', 'lesen', 'schreiben', 'rechnen', 'klasse',
    ],
  },
  {
    name: 'Arbeit & Beruf',
    keywords: [
      'beruf', 'büro', 'chef', 'vorgesetzter', 'kollege', 'kollegin',
      'meeting', 'besprechung', 'gehalt', 'lohn', 'unternehmen', 'firma',
      'ingenieur', 'anwalt', 'journalist', 'verkäufer', 'elektriker',
      'tischler', 'zimmermann', 'friseur', 'künstler', 'musiker', 'koch',
      'köchin', 'arbeitgeber', 'arbeitszeit', 'rente', 'pension', 'rentner',
      'freiberufler', 'vollzeit', 'teilzeit', 'überstunden', 'lebenslauf',
      'bewerbung', 'vorstellungsgespräch', 'vertrag', 'kontrakt', 'gleitzeit',
      'gewerkschaft', 'startup', 'karriere', 'arbeitnehmer', 'branche',
      'abteilung', 'arbeitsmarkt', 'arbeitslosengeld', 'freelancer', 'jobsuche',
      'gehaltsverhandlung', 'tarifvertrag', 'job', 'arbeit',
      'kellner', 'kellnerin',
    ],
  },
  {
    name: 'Reisen & Transport',
    keywords: [
      'reise', 'auto', 'bus', 'zug', 'fahrrad', 'flugzeug', 'flug',
      'boot', 'schiff', 'u-bahn', 'straßenbahn', 'taxi', 'lastwagen',
      'motorrad', 'moped', 'hubschrauber', 'fähre', 'haltestelle', 'ankunft',
      'abfahrt', 'flughafen', 'bahnhof', 'hafen', 'reisepass', 'fahrkarte',
      'ticket', 'gepäck', 'hotel', 'landkarte', 'tourist', 'ausland',
      'koffer', 'check-in', 'einchecken', 'route', 'direktflug', 'mietauto',
      'zwischenstopp', 'ausflug', 'reiseziel', 'kreuzfahrt', 'wanderung',
      'campingplatz', 'zelt', 'schlafsack', 'jugendherberge', 'rezeption',
      'sightseeing', 'sehenswürdigkeit', 'souvenir', 'währung', 'wechselkurs',
      'visum', 'leihfahrrad', 'fahrplan', 'umstieg', 'unterkunft', 'rundfahrt',
      'tagesausflug', 'brücke', 'tunnel', 'straße', 'richtung',
      'norden', 'süden', 'osten', 'westen', 'links', 'rechts',
    ],
  },
  {
    name: 'Natur & Wetter',
    keywords: [
      'natur', 'wetter', 'wald', 'meer', 'berg', 'blume', 'baum',
      'gras', 'fluss', 'wiese', 'tal', 'frost', 'nebel', 'regenbogen',
      'himmel', 'sonne', 'regen', 'schnee', 'wind', 'wolke', 'gewitter',
      'donner', 'temperatur', 'grad', 'sturm', 'licht', 'dunkelheit', 'hagel',
      'sonnenschein', 'regenschirm', 'thermometer', 'feld', 'busch', 'strauch',
      'moos', 'insel', 'strand', 'fels', 'klippe', 'bach', 'sand', 'stein',
      'blatt', 'ast', 'zweig', 'wurzel', 'samen', 'korn', 'klima',
      'recycling', 'emissionen', 'naturschutzgebiet', 'ökologie',
      'erneuerbare', 'solarenergie', 'windkraft', 'nachhaltigkeit',
      'kohlendioxid', 'treibhauseffekt', 'artenvielfalt', 'naturkatastrophe',
      'überschwemmung', 'erdbeben', 'verschmutzung', 'abholzung', 'klimawandel',
      'wasserfall', 'moor', 'sumpf', 'ökosystem', 'naturschutz', 'see (', 'der see',
    ],
  },
  {
    name: 'Tiere',
    keywords: [
      'hund', 'katze', 'pferd', 'vogel', 'kuh', 'schwein', 'kaninchen',
      'maus', 'bär', 'elch', 'fuchs', 'schlange', 'löwe', 'elefant',
      'affe', 'zebra', 'giraffe', 'schwan', 'tier', 'wildtier', 'tierwelt',
      'imkerei', 'bienenzucht', 'haustier', 'fisch (', 'lachs (', 'vogel (',
      'wal', 'delfin', 'frosch', 'spinne', 'biene', 'schmetterling',
      'rentier', 'wolf', 'luchs', 'adler', 'eule',
    ],
  },
  {
    name: 'Freizeit & Kultur',
    keywords: [
      'sport', 'fußball', 'eishockey', 'tennis', 'schwimmen', 'joggen',
      'gitarre', 'klavier', 'tanz', 'tanzen', 'film', 'hobby', 'yoga',
      'theater', 'konzert', 'fitnessstudio', 'roman', 'kurzgeschichte',
      'gedicht', 'bühne', 'aufführung', 'regisseur', 'schauspieler',
      'premiere', 'galerie', 'fotografie', 'architektur', 'ballett', 'oper',
      'sinfonie', 'orchester', 'konzerthaus', 'chor', 'zeitschrift', 'magazin',
      'unterhaltung', 'vernissage', 'handwerk', 'kunsthandwerk', 'folklore',
      'tournee', 'kulturhaus', 'tradition', 'midsommar', 'mittsommer',
      'walpurgisnacht', 'krebsparty', 'weihnachten', 'neujahr',
      'feiertag', 'fest', 'feier', 'fika', 'jedermannsrecht', 'musik',
      'laufen', 'rudern', 'segeln', 'skifahren', 'snowboarden', 'klettern',
      'angeln', 'jagd', 'malen', 'zeichnen', 'basteln', 'fotografieren',
      'lesen (hobby)', 'spielen', 'kino',
    ],
  },
  {
    name: 'Einkaufen & Geld',
    keywords: [
      'geschäft', 'laden', 'kaufen', 'geld', 'billig', 'günstig',
      'teuer', 'bezahlen', 'einkaufen', 'quittung', 'kassenbon', 'rabatt',
      'ermäßigung', 'ausverkauf', 'sale', 'angebot', 'korb', 'tüte',
      'beutel', 'lebensmittelgeschäft', 'supermarkt', 'preis', 'rechnung',
      'trinkgeld', 'krone', 'schulden', 'sparen', 'ersparnisse',
      'steuererklärung', 'steuer', 'konto', 'bank', 'aktie', 'anleihe',
      'finanzierung', 'rendite', 'einkommen', 'ausgaben', 'gewinn', 'verlust',
      'kasse', 'münze', 'schein', 'wechselgeld', 'kredit', 'debit',
      'budget', 'investition',
    ],
  },
  {
    name: 'Technologie & Medien',
    keywords: [
      'telefon', 'computer', 'handy', 'mobiltelefon', 'internet', 'app',
      'e-mail', 'webseite', 'homepage', 'kamera', 'radio', 'zeitung',
      'programm', 'bildschirm', 'laptop', 'tablet', 'ladekabel', 'ladegerät',
      'batterie', 'akku', 'wlan', 'wifi', 'passwort', 'soziale medien',
      'computerspiel', 'streaming', 'abonnement', 'profil', 'kommentar',
      'hashtag', 'suchmaschine', 'webbrowser', 'link', 'blog', 'podcast',
      'online', 'drucker', 'tastatur', 'kopfhörer', 'lautsprecher',
      'sicherungskopie', 'backup', 'drohne', 'gps', 'cloud', 'videoanruf',
      'screenshot', 'benachrichtigung', 'digitalisierung', 'datenbank',
      'verschlüsselung', 'cybersicherheit', 'technik', 'technologie',
      'nachrichten', 'sendung', 'fernsehen', 'fernseher', 'kanal',
    ],
  },
  {
    name: 'Gefühle & Charakter',
    keywords: [
      'froh', 'glücklich', 'traurig', 'enttäuscht', 'stolz',
      'beschämt', 'schüchtern', 'mutig', 'eifrig', 'begeistert', 'faul',
      'fleißig', 'ungeduldig', 'wütend', 'böse', 'ängstlich', 'angst',
      'besorgt', 'unruhig', 'erstaunt', 'überrascht', 'nervös', 'zufrieden',
      'großzügig', 'selbstsüchtig', 'egoistisch', 'ehrlich', 'humorvoll',
      'kreativ', 'klug', 'schlau', 'geduldig', 'ehrgeizig', 'ambitioniert',
      'lächeln', 'lachen', 'weinen', 'küssen', 'umarmen', 'träumen',
      'vermissen', 'freundschaft', 'vertrauen', 'respekt', 'toleranz',
      'missverständnis', 'solidarität', 'lieben', 'fühlen', 'gefühl',
      'emotion', 'stimmung', 'loyalität', 'treue', 'feige', 'offen',
      'seele', 'geist', 'freude', 'liebe', 'hass', 'neid', 'scham',
      'mut', 'einfühlsam', 'empathie', 'charakter', 'persönlichkeit',
    ],
  },
  {
    name: 'Gesellschaft & Politik',
    keywords: [
      'gesellschaft', 'politik', 'demokratie', 'bürger', 'einwanderung',
      'integration', 'minderheit', 'mehrheit', 'menschenrechte',
      'gleichstellung', 'gleichberechtigung', 'wohlfahrt', 'sozialstaat',
      'steuerzahler', 'behörde', 'frieden', 'krieg', 'parlament', 'verordnung',
      'richtlinie', 'verfassung', 'grundgesetz', 'gesetz', 'urteil',
      'gericht', 'gerechtigkeit', 'diskriminierung', 'segregation',
      'diversität', 'krankenversicherung', 'personnummer',
      'einwohnermeldeamt', 'gemeinde', 'kommune', 'sozialhilfe', 'kindergeld',
      'elternzeit', 'krankengeld', 'wohngeld', 'finanzamt',
      'einwanderungsbehörde', 'staatsbürgerschaft', 'aufenthaltserlaubnis',
      'einwanderer', 'ombudsmann', 'ombudsperson', 'jantegesetz',
      'verwaltungsrecht', 'vertragsrecht', 'pflicht', 'freiheit', 'recht',
      'regierung', 'minister', 'präsident', 'wahl', 'partei', 'abstimmung',
      'polizei', 'feuerwehr', 'rettungsdienst',
    ],
  },
  {
    name: 'Zeit & Kalender',
    keywords: [
      // weekdays
      'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag',
      // months
      'januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli',
      'august', 'september', 'oktober', 'november', 'dezember',
      // time units & expressions
      'uhr', 'stunde', 'minute', 'sekunde', 'woche', 'monat', 'datum',
      'kalender', 'heute', 'gestern', 'übermorgen', 'vorgestern',
      'mittag', 'mitternacht', 'abend', 'nacht', 'tag',
      'jahreszeit', 'jahrhundert', 'jahrzehnt',
      // numbers
      'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht',
      'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn',
      'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig', 'dreißig',
      'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig',
      'hundert', 'tausend', 'million', 'milliard',
    ],
  },
  {
    name: 'Farben & Formen',
    keywords: [], // assigned via COLOR_REGEX in getTopicForWord, not keyword matching
  },
  {
    name: 'Alltag',
    keywords: [], // catch-all
  },
]

// Word-boundary regex so "rot" doesn't match "Brot", "Protest", etc.
const COLOR_REGEX = /\b(rot|blau|grün|gelb|orange|violett|lila|schwarz|weiß|grau|braun|rosa|pink|türkis|beige|goldfarben|silber)\b/i

export function getTopicForWord(german: string): string {
  const lower = german.toLowerCase()
  for (const topic of TOPICS) {
    if (topic.keywords.length === 0) continue // skip Farben & Alltag — handled below
    if (topic.keywords.some(kw => lower.includes(kw))) {
      return topic.name
    }
  }
  if (COLOR_REGEX.test(german)) return 'Farben & Formen'
  return 'Alltag'
}

export function getTodayTopic(): string {
  const dayIndex = Math.floor(Date.now() / 86400000)
  return TOPICS[dayIndex % TOPICS.length]!.name
}

export const TOPIC_NAMES: string[] = TOPICS.map(t => t.name)
