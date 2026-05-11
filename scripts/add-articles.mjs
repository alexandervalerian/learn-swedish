#!/usr/bin/env node
/**
 * Prepends "en " or "ett " to Swedish noun entries in vocabulary JSON files.
 * Mirrors the existing "att " convention for verbs.
 * Run once: node scripts/add-articles.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'app', 'data', 'vocabulary');

// Swedish word → article.
// Only nouns we're confident about; adjectives/adverbs/phrases are intentionally absent.
const articles = {
  // People
  'man': 'en', 'kvinna': 'en', 'pojke': 'en', 'flicka': 'en', 'barn': 'ett',
  'familj': 'en', 'mamma': 'en', 'pappa': 'en', 'bror': 'en', 'syster': 'en',
  'son': 'en', 'dotter': 'en', 'farmor': 'en', 'farfar': 'en',
  'mormor': 'en', 'morfar': 'en', 'farbror': 'en', 'faster': 'en',
  'morbror': 'en', 'moster': 'en', 'kusin': 'en', 'make': 'en', 'maka': 'en',
  'pojkvän': 'en', 'flickvän': 'en', 'barnbarn': 'ett', 'granne': 'en',

  // Professions
  'läkare': 'en', 'lärare': 'en', 'polis': 'en', 'tandläkare': 'en',
  'sjuksköterska': 'en', 'chef': 'en', 'kollega': 'en', 'elev': 'en',
  'student': 'en', 'kock': 'en', 'ingenjör': 'en', 'advokat': 'en',
  'journalist': 'en', 'säljare': 'en', 'elektriker': 'en', 'snickare': 'en',
  'frisör': 'en', 'konstnär': 'en', 'musiker': 'en', 'servitör': 'en',
  'servitris': 'en', 'turist': 'en', 'medborgare': 'en',
  'skattebetalare': 'en', 'frilansare': 'en', 'handledare': 'en',
  'studievägledare': 'en', 'arbetstagare': 'en', 'föreläsare': 'en',
  'regissör': 'en', 'skådespelare': 'en', 'volontär': 'en',

  // Animals
  'hund': 'en', 'katt': 'en', 'fågel': 'en', 'fisk': 'en', 'häst': 'en',
  'ko': 'en', 'gris': 'en', 'get': 'en', 'får': 'ett', 'kanin': 'en',
  'mus': 'en', 'björn': 'en', 'älg': 'en', 'räv': 'en', 'orm': 'en',
  'lejon': 'ett', 'elefant': 'en', 'apa': 'en', 'zebra': 'en',
  'giraff': 'en', 'svan': 'en',

  // Body
  'fot': 'en', 'rygg': 'en', 'mage': 'en', 'nacke': 'en', 'axel': 'en',
  'knä': 'ett', 'bröst': 'ett', 'hand': 'en', 'öga': 'ett', 'öra': 'ett',
  'näsa': 'en', 'mun': 'en', 'huvud': 'ett', 'hår': 'ett', 'arm': 'en',
  'ben': 'ett', 'tand': 'en', 'hjärta': 'ett',

  // Home / rooms
  'hus': 'ett', 'rum': 'ett', 'kök': 'ett', 'badrum': 'ett', 'sovrum': 'ett',
  'vardagsrum': 'ett', 'dörr': 'en', 'fönster': 'ett', 'säng': 'en',
  'stol': 'en', 'bord': 'ett', 'lampa': 'en', 'vägg': 'en', 'golv': 'ett',
  'tak': 'ett', 'trappa': 'en', 'toalett': 'en', 'klocka': 'en',
  'matta': 'en', 'gardin': 'en', 'kudde': 'en', 'täcke': 'ett',
  'diskmaskin': 'en', 'tvättmaskin': 'en', 'dusch': 'en',
  'tandkräm': 'en', 'papperskorg': 'en',
  // A2 housing
  'lägenhet': 'en', 'hyra': 'en', 'hiss': 'en', 'våning': 'en',
  'garderob': 'en', 'diskho': 'en', 'kran': 'en', 'matsal': 'en',
  'parkering': 'en', 'terrass': 'en', 'villa': 'en', 'förråd': 'ett',
  'tvättrum': 'ett', 'bostadsrätt': 'en', 'hyresrätt': 'en',
  'brevlåda': 'en', 'grind': 'en', 'staket': 'ett', 'kamin': 'en',
  'skafferi': 'ett', 'byrå': 'en', 'bokhylla': 'en', 'tvättstuga': 'en',
  'hyreskontrakt': 'ett', 'eluttag': 'ett', 'termostat': 'en',
  'ytterdörr': 'en', 'lås': 'ett', 'verktyg': 'ett',

  // Transport
  'bil': 'en', 'buss': 'en', 'tåg': 'ett', 'cykel': 'en', 'flygplan': 'ett',
  'båt': 'en', 'tunnelbana': 'en', 'spårvagn': 'en', 'taxi': 'en',
  'lastbil': 'en', 'motorcykel': 'en', 'moped': 'en', 'helikopter': 'en',
  'färja': 'en',

  // Places / city
  'station': 'en', 'flygplats': 'en', 'stad': 'en', 'land': 'ett',
  'by': 'en', 'park': 'en', 'sjö': 'en', 'hav': 'ett', 'berg': 'ett',
  'skog': 'en', 'gata': 'en', 'riktning': 'en', 'hållplats': 'en',
  'hotell': 'ett', 'sjukhus': 'ett', 'bibliotek': 'ett', 'restaurang': 'en',
  'kyrka': 'en', 'butik': 'en', 'apotek': 'ett', 'affär': 'en',
  'centrum': 'ett', 'tunnel': 'en', 'mataffär': 'en', 'klädaffär': 'en',

  // Nature / weather
  'träd': 'ett', 'blomma': 'en', 'gräs': 'ett', 'sol': 'en', 'måne': 'en',
  'stjärna': 'en', 'moln': 'ett', 'regn': 'ett', 'snö': 'en', 'vind': 'en',
  'väder': 'ett', 'natur': 'en', 'luft': 'en', 'mark': 'en', 'klippa': 'en',
  'å': 'en', 'fält': 'ett', 'buske': 'en', 'mossa': 'en', 'ö': 'en',
  'strand': 'en', 'gren': 'en', 'rot': 'en', 'frö': 'ett', 'jord': 'en',
  'sand': 'en', 'sten': 'en', 'flod': 'en', 'äng': 'en', 'dal': 'en',
  'is': 'en', 'frost': 'en', 'dimma': 'en', 'regnbåge': 'en', 'himmel': 'en',
  'löv': 'ett', 'temperatur': 'en', 'grad': 'en', 'storm': 'en',
  'ljus': 'ett', 'mörker': 'ett', 'hagel': 'ett', 'solsken': 'ett',
  'paraply': 'ett', 'termometer': 'en',
  // Seasons
  'vår': 'en', 'sommar': 'en', 'höst': 'en', 'vinter': 'en',

  // Food & drink
  'mat': 'en', 'vatten': 'ett', 'mjölk': 'en', 'kaffe': 'ett', 'te': 'ett',
  'bröd': 'ett', 'kött': 'ett', 'frukt': 'en', 'grönsak': 'en', 'äpple': 'ett',
  'potatis': 'en', 'ris': 'ett', 'soppa': 'en', 'smör': 'ett', 'ost': 'en',
  'ägg': 'ett', 'kyckling': 'en', 'tomat': 'en', 'banan': 'en', 'apelsin': 'en',
  'juice': 'en', 'öl': 'ett', 'vin': 'ett', 'choklad': 'en', 'glass': 'en',
  'kaka': 'en', 'tårta': 'en', 'pasta': 'en', 'sallad': 'en', 'lök': 'en',
  'morot': 'en', 'gurka': 'en', 'paprika': 'en', 'päron': 'ett',
  'jordgubbe': 'en', 'hallon': 'ett', 'blåbär': 'ett', 'svamp': 'en',
  'salt': 'ett', 'peppar': 'en', 'olja': 'en', 'honung': 'en', 'smörgås': 'en',
  'lemonad': 'en', 'grädde': 'en', 'sylt': 'en', 'senap': 'en', 'dryck': 'en',
  // A2 food
  'sill': 'en', 'skinka': 'en', 'torsk': 'en', 'lax': 'en', 'gräddfil': 'en',
  'gryta': 'en', 'paj': 'en', 'köttfärs': 'en', 'korv': 'en', 'biff': 'en',
  'hamburgare': 'en', 'macka': 'en', 'mellanmål': 'ett', 'buffé': 'en',
  'dricksvatten': 'ett', 'kastrull': 'en', 'stekpanna': 'en',
  'matlagning': 'en', 'ugnsform': 'en', 'lammkött': 'ett',
  'ingrediens': 'en', 'portion': 'en', 'smak': 'en',
  // Kitchen/table
  'tallrik': 'en', 'glas': 'ett', 'gaffel': 'en', 'kniv': 'en', 'sked': 'en',
  'meny': 'en', 'räkning': 'en', 'förrätt': 'en', 'huvudrätt': 'en',
  'dessert': 'en', 'dricks': 'ett',
  // Swedish culture foods
  'smörgåsbord': 'ett', 'kanelbulle': 'en', 'pannkaka': 'en',

  // Time expressions (nouns)
  'dag': 'en', 'natt': 'en', 'vecka': 'en', 'månad': 'en', 'år': 'ett',
  'timme': 'en', 'minut': 'en', 'sekund': 'en', 'kvart': 'en',
  'morgon': 'en', 'eftermiddag': 'en', 'kväll': 'en', 'midnatt': 'en',
  'tid': 'en',

  // Clothing / fashion
  'kappa': 'en', 'storlek': 'en', 'mode': 'ett',

  // School / study
  'bok': 'en', 'penna': 'en', 'schema': 'ett', 'skola': 'en', 'klass': 'en',
  'prov': 'ett', 'läxa': 'en', 'lektion': 'en', 'kontor': 'ett',
  'möte': 'ett', 'lön': 'en', 'semester': 'en', 'papper': 'ett',
  'suddgummi': 'ett', 'universitet': 'ett', 'klassrum': 'ett',
  'korridor': 'en', 'tavla': 'en', 'krita': 'en', 'linjal': 'en',
  'sax': 'en', 'lim': 'ett', 'ryggsäck': 'en', 'pennfodral': 'ett',
  'anteckningsbok': 'en',
  // A2 study/work
  'utbildning': 'en', 'yrke': 'ett', 'praktik': 'en', 'rapport': 'en',
  'tjänst': 'en', 'kurs': 'en', 'föreläsning': 'en', 'betyg': 'ett',
  'uppgift': 'en', 'stipendium': 'ett', 'laboratorium': 'ett', 'intervju': 'en',
  'kompetens': 'en', 'bransch': 'en', 'företag': 'ett', 'avdelning': 'en',
  'budget': 'en', 'faktura': 'en', 'kontrakt': 'ett', 'inkomst': 'en',
  'kostnad': 'en', 'vinst': 'en', 'förlust': 'en', 'investering': 'en',
  'konto': 'ett', 'ansökan': 'en', 'examen': 'en', 'forskning': 'en',
  'gymnasium': 'ett',
  // B1 study/work
  'erfarenhet': 'en', 'kunskap': 'en', 'karriär': 'en', 'meritlista': 'en',
  'vidareutbildning': 'en', 'studielån': 'ett', 'startup': 'ett',
  'avhandling': 'en', 'ämne': 'ett',

  // Tech
  'dator': 'en', 'telefon': 'en', 'app': 'en', 'mejl': 'ett',
  'meddelande': 'ett', 'hemsida': 'en', 'kamera': 'en', 'radio': 'en',
  'tidning': 'en', 'program': 'ett', 'skärm': 'en', 'laptop': 'en',
  'surfplatta': 'en', 'laddare': 'en', 'batteri': 'ett', 'lösenord': 'ett',
  'gitarr': 'en', 'piano': 'ett',
  // A2 tech
  'datorspel': 'ett', 'strömning': 'en', 'prenumeration': 'en', 'profil': 'en',
  'inlägg': 'ett', 'kommentar': 'en', 'sökmotor': 'en', 'webbläsare': 'en',
  'länk': 'en', 'blogg': 'en', 'podcast': 'en', 'skrivare': 'en',
  'tangentbord': 'ett', 'högtalare': 'en', 'virus': 'ett',
  'säkerhetskopia': 'en', 'uppdatering': 'en', 'drönare': 'en',
  'molntjänst': 'en', 'videosamtal': 'ett', 'skärmbild': 'en',
  'notifikation': 'en', 'volym': 'en', 'strömavbrott': 'ett',
  // B1 tech
  'teknik': 'en', 'digitalisering': 'en', 'innovation': 'en',
  'nätverk': 'ett', 'plattform': 'en', 'databas': 'en', 'kryptering': 'en',
  'cybersäkerhet': 'en',

  // Health
  'sport': 'en', 'simning': 'en', 'löpning': 'en', 'träning': 'en',
  'musik': 'en', 'dans': 'en', 'film': 'en', 'spel': 'ett', 'hobby': 'en',
  'huvudvärk': 'en', 'feber': 'en', 'hosta': 'en', 'förkylning': 'en',
  'medicin': 'en', 'plåster': 'ett', 'smärta': 'en', 'allergi': 'en',
  'undersökning': 'en', 'recept': 'ett', 'dos': 'en', 'tablett': 'en',
  'spruta': 'en', 'blodprov': 'ett', 'tidsbeställning': 'en',
  'sjukskrivning': 'en', 'bandage': 'ett',
  // A2 health
  'blodtryck': 'ett', 'cancer': 'en', 'influensa': 'en', 'kondition': 'en',
  'läkemedel': 'ett', 'stress': 'en', 'vikt': 'en', 'symptom': 'ett',
  'vaccination': 'en', 'skada': 'en', 'sår': 'ett', 'benbrott': 'ett',
  'hjärna': 'en', 'led': 'ett', 'muskel': 'en', 'nerv': 'en',
  'ultraljud': 'ett', 'diagnos': 'en', 'övervikt': 'en',
  // B1 health
  'hälsa': 'en', 'sjukdom': 'en', 'terapi': 'en', 'motion': 'en',
  'kost': 'en', 'sömnproblem': 'ett', 'rehabilitering': 'en',
  'välmående': 'ett',

  // Travel
  'pass': 'ett', 'biljett': 'en', 'bagage': 'ett', 'hotellrum': 'ett',
  'karta': 'en', 'resväska': 'en', 'incheckning': 'en', 'avresa': 'en',
  'ankomst': 'en',
  // A2 travel
  'flyg': 'ett', 'rutt': 'en', 'avgångstid': 'en', 'direktflyg': 'ett',
  'hyrbil': 'en', 'mellanlandning': 'en', 'resetid': 'en', 'utflykt': 'en',
  'resmål': 'ett', 'kryssning': 'en', 'vandring': 'en', 'campingplats': 'en',
  'tält': 'ett', 'sovsäck': 'en', 'vandrarhem': 'ett', 'utsikt': 'en',
  'sevärdhet': 'en', 'souvenir': 'en', 'valuta': 'en', 'växelkurs': 'en',
  'visum': 'ett', 'nattåg': 'ett', 'hyrcykel': 'en', 'tidtabell': 'en',
  'omstigning': 'en', 'rundtur': 'en', 'dagstur': 'en',

  // Shopping
  'kvitto': 'ett', 'rabatt': 'en', 'rea': 'en', 'erbjudande': 'ett',
  'korg': 'en', 'påse': 'en', 'krona': 'en',

  // Correspondence
  'brev': 'ett', 'paket': 'ett', 'adress': 'en', 'postnummer': 'ett',
  'namn': 'ett', 'efternamn': 'ett', 'förnamn': 'ett', 'underskrift': 'en',
  'formulär': 'ett', 'nummer': 'ett',

  // General abstract (A1)
  'bok': 'en', 'sak': 'en', 'svar': 'ett', 'fråga': 'en', 'problem': 'ett',
  'sanning': 'en', 'lögn': 'en', 'idé': 'en', 'plan': 'en', 'röst': 'en',
  'ljud': 'ett', 'bild': 'en', 'sång': 'en', 'historia': 'en', 'saga': 'en',
  'dröm': 'en', 'mål': 'ett', 'hopp': 'ett', 'minne': 'ett',
  'mängd': 'en', 'antal': 'ett', 'liv': 'ett', 'värld': 'en',

  // Society / civic (A2)
  'arbete': 'ett', 'avtal': 'ett', 'beslut': 'ett', 'förening': 'en',
  'information': 'en', 'konflikt': 'en', 'lista': 'en', 'mening': 'en',
  'möjlighet': 'en', 'projekt': 'ett', 'rättighet': 'en', 'situation': 'en',
  'skillnad': 'en', 'stöd': 'ett', 'system': 'ett', 'val': 'ett',
  'ansvar': 'ett', 'resultat': 'ett', 'syfte': 'ett', 'metod': 'en',
  'exempel': 'ett', 'chans': 'en', 'risk': 'en', 'regel': 'en',
  'frihet': 'en', 'fred': 'en', 'krig': 'ett', 'politik': 'en',
  'ekonomi': 'en',
  // Civic A2
  'sjukförsäkring': 'en', 'personnummer': 'ett', 'skattedeklaration': 'en',
  'skatt': 'en', 'skuld': 'en', 'medborgarskap': 'ett',
  'uppehållstillstånd': 'ett', 'arbetstillstånd': 'ett', 'legitimation': 'en',
  'blankett': 'en', 'intyg': 'ett', 'tillstånd': 'ett', 'region': 'en',
  'socialbidrag': 'ett', 'föräldraledighet': 'en', 'sjukersättning': 'en',
  'bostadsbidrag': 'ett', 'sjukvård': 'en', 'remiss': 'en',
  'patientjournal': 'en', 'akutmottagning': 'en',

  // Environment (A2/B1)
  'klimat': 'ett', 'miljöproblem': 'ett', 'återvinning': 'en', 'utsläpp': 'ett',
  'naturreservat': 'ett', 'djurliv': 'ett', 'ekologi': 'en', 'solenergi': 'en',
  'vindkraft': 'en', 'hållbarhet': 'en', 'koldioxid': 'en',
  'växthuseffekt': 'en', 'mångfald': 'en', 'naturkatastrof': 'en',
  'översvämning': 'en', 'jordbävning': 'en', 'sophantering': 'en',
  'kompost': 'en', 'skogsavverkning': 'en', 'naturskydd': 'ett',
  'biodling': 'en', 'solcell': 'en', 'vattenfall': 'ett', 'lera': 'en',
  'myr': 'en', 'ekosystem': 'ett', 'miljö': 'en', 'klimatförändring': 'en',

  // Culture (A2)
  'konstverk': 'ett', 'utställning': 'en', 'skulptur': 'en', 'roman': 'en',
  'novell': 'en', 'dikt': 'en', 'scen': 'en', 'uppträdande': 'ett',
  'premiär': 'en', 'konsthall': 'en', 'fotografi': 'ett', 'arkitektur': 'en',
  'balett': 'en', 'opera': 'en', 'symfoni': 'en', 'orkester': 'en',
  'konserthus': 'ett', 'kör': 'en', 'tidskrift': 'en', 'underhållning': 'en',
  'hantverk': 'ett', 'bildkonst': 'en', 'bokhandel': 'en', 'turné': 'en',
  'kulturhus': 'ett', 'kultur': 'en',

  // Social (A2)
  'sällskap': 'ett', 'samtal': 'ett', 'argument': 'ett', 'inbjudan': 'en',
  'besök': 'ett', 'välgörenhet': 'en', 'gemenskap': 'en', 'solidaritet': 'en',
  'engagemang': 'ett', 'förtroende': 'ett', 'ärlighet': 'en', 'respekt': 'en',
  'tolerans': 'en', 'missförstånd': 'ett', 'kompromiss': 'en',
  'överenskommelse': 'en', 'löfte': 'ett', 'jämlikhet': 'en',
  'integration': 'en', 'vänskap': 'en', 'mötesplats': 'en', 'umgänge': 'ett',
  'bekantskap': 'en', 'träff': 'en', 'försoning': 'en', 'uppskattning': 'en',

  // Abstract (A2/B1)
  'andel': 'en', 'ansats': 'en', 'aspekt': 'en', 'bidrag': 'ett',
  'brist': 'en', 'förändring': 'en', 'försäkring': 'en', 'förutsättning': 'en',
  'gräns': 'en', 'hot': 'ett', 'hänsyn': 'en', 'inriktning': 'en',
  'krav': 'ett', 'lösning': 'en', 'medvetenhet': 'en', 'nytta': 'en',
  'prioritet': 'en', 'tidsfrist': 'en', 'tillgång': 'en', 'utmaning': 'en',
  'återkoppling': 'en', 'hyresvärd': 'en', 'hyresgäst': 'en', 'läge': 'ett',
  'puls': 'en', 'hälsokontroll': 'en', 'seminarium': 'ett', 'kursplan': 'en',
  'anmälan': 'en', 'löneförhandling': 'en', 'fackförbund': 'ett',
  'balans': 'en', 'diskussion': 'en', 'genomgång': 'en', 'kapacitet': 'en',
  'kommunikation': 'en', 'nivå': 'en', 'period': 'en', 'perspektiv': 'ett',
  'prestation': 'en', 'strävan': 'en', 'strategi': 'en', 'vana': 'en',
  'villkor': 'ett', 'avsikt': 'en', 'bedömning': 'en', 'deltagande': 'ett',
  'framgång': 'en', 'förväntan': 'en', 'hinder': 'ett', 'insats': 'en',
  'rubrik': 'en', 'rutin': 'en', 'trygghet': 'en', 'öppenhet': 'en',
  'omgivning': 'en', 'rörelse': 'en', 'takt': 'en', 'upplevelse': 'en',
  'växel': 'en', 'lägenhetsyta': 'en',

  // Swedish culture
  'fika': 'en', 'jul': 'en', 'tradition': 'en', 'högtid': 'en',
  'kräftskiva': 'en', 'nöje': 'ett', 'present': 'en', 'fest': 'en',
  'flagga': 'en', 'krona': 'en',

  // B1 society
  'samhälle': 'ett', 'framtid': 'en', 'förhållande': 'ett',
  'skyldighet': 'en', 'invandring': 'en', 'minoritet': 'en',
  'majoritet': 'en', 'demokrati': 'en', 'jämställdhet': 'en',
  'välfärd': 'en', 'myndighet': 'en', 'debatt': 'en',
  'presentation': 'en', 'förhandling': 'en', 'samförstånd': 'ett',
  'medling': 'en', 'tillit': 'en', 'lojalitet': 'en', 'motivation': 'en',
  'ambition': 'en', 'kreativitet': 'en', 'flexibilitet': 'en',
  'anpassning': 'en', 'utveckling': 'en', 'tillväxt': 'en', 'resurs': 'en',
  'påverkan': 'en', 'samarbete': 'ett', 'inverkan': 'en', 'åsikt': 'en',
  'värdering': 'en', 'norm': 'en', 'identitet': 'en', 'sedvänja': 'en',
  'firande': 'ett', 'pilgrimsfärd': 'en', 'besöksnäring': 'en',
  'kulturskillnad': 'en', 'erfarenhet': 'en', 'kunskap': 'en',

  // B2 academic / legal / finance
  'konsekvens': 'en', 'analys': 'en', 'organisation': 'en',
  'administration': 'en', 'integritet': 'en', 'trovärdighet': 'en',
  'expertis': 'en', 'konsensus': 'ett', 'paradox': 'en', 'nuans': 'en',
  'tendens': 'en', 'kontext': 'en', 'implikation': 'en', 'hypotes': 'en',
  'teori': 'en', 'metafor': 'en', 'ironi': 'en', 'sarkasm': 'en',
  'allegori': 'en', 'symbolik': 'en', 'narrativ': 'ett',
  'berättarperspektiv': 'ett', 'stilistik': 'en', 'dom': 'en',
  'rättegång': 'en', 'prejudikat': 'ett', 'parlament': 'ett',
  'förordning': 'en', 'direktiv': 'ett', 'grundlag': 'en', 'aktie': 'en',
  'obligation': 'en', 'finansiering': 'en', 'avkastning': 'en',
  'riskhantering': 'en', 'affärsmodell': 'en', 'marknadsstrategi': 'en',
  'konkurrenskraft': 'en', 'experiment': 'ett', 'variabel': 'en',
  'kontrollgrupp': 'en', 'statistik': 'en', 'korrelation': 'en',
  'kausalitet': 'en', 'publicering': 'en', 'reproducerbarhet': 'en',
  'företeelse': 'en', 'sammanhang': 'ett', 'påstående': 'ett',
  'antagande': 'ett', 'resonemang': 'ett', 'tvetydighet': 'en',
  'objektivitet': 'en', 'subjektivitet': 'en', 'tillförlitlighet': 'en',
  'giltighet': 'en', 'synvinkel': 'en', 'infallsvinkel': 'en',
  'ställningstagande': 'ett', 'övervägande': 'ett', 'slutsats': 'en',

  // C1 philosophy / politics
  'rättvisa': 'en', 'lagstiftning': 'en', 'konstitution': 'en',
  'yttrandefrihet': 'en', 'diskriminering': 'en', 'segregation': 'en',
  'representation': 'en', 'kränkning': 'en', 'paradigmskifte': 'ett',
  'evidens': 'en', 'kognition': 'en', 'epistemologi': 'en', 'ontologi': 'en',
  'axiom': 'ett', 'dikotomi': 'en', 'polarisering': 'en', 'relativism': 'en',
  'empirism': 'en', 'rationalism': 'en', 'determinism': 'en',
  'pragmatism': 'en', 'postulat': 'ett', 'hypotesprövning': 'en',
  'falsifierbarhet': 'en', 'replikering': 'en', 'metaanalys': 'en',
  'implikatur': 'en', 'pretext': 'en', 'subtext': 'en', 'resonans': 'en',
  'konnotation': 'en', 'denotation': 'en', 'semiotik': 'en', 'diskurs': 'en',
  'förvaltningsrätt': 'en', 'ombudsman': 'en', 'folkhögskola': 'en',
  'arbetsmarknad': 'en', 'avtalsrätt': 'en', 'kollektivavtal': 'ett',
  'hermeneutik': 'en', 'fenomenologi': 'en', 'dialektik': 'en',
  'premiss': 'en', 'syllogism': 'en', 'tautologi': 'en', 'etik': 'en',
  'reduktionism': 'en', 'holism': 'en', 'paradigm': 'ett',
};

// Homograph overrides by ID (same Swedish spelling, different article).
// "lag" = ett lag (team, a1_899) vs en lag (law, b2_059).
const idOverrides = {
  'a1_899': 'ett', // lag = Mannschaft
  'b2_059': 'en',  // lag = Gesetz
};

const files = ['a1', 'a2', 'b1', 'b2', 'c1'];

let totalModified = 0;

for (const level of files) {
  const filePath = path.join(dataDir, `${level}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let modified = 0;
  for (const word of data.words) {
    // Skip entries that already have a prefix (att/en/ett)
    if (/^(att |en |ett )/.test(word.swedish)) continue;

    let article = idOverrides[word.id];
    if (article === undefined) {
      article = articles[word.swedish];
    }

    if (article !== undefined) {
      word.swedish = article + ' ' + word.swedish;
      modified++;
    }
  }

  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json + '\n');
  console.log(`${level}: ${modified} nouns updated`);
  totalModified += modified;
}

console.log(`\nTotal: ${totalModified} entries updated`);
