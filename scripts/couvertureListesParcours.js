// Mesure ce que couvrent les listes de choix de « Votre parcours » par rapport à l'ensemble des métiers de France Travail (ROME, 1 923 codes ; consigne 262 de Denis, 12/11/2026).
//
// Usage : node scripts/couvertureListesParcours.js <mesures.json> <mesures.parcode.json>
//   (les deux fichiers sont produits par : node scripts/mesureCouvertureRome.js <dossier CSV ROME> <mesures.json>)
//
// Les listes actuelles sont lues dans data/*.js (jamais recopiées). Les TABLES DE CORRESPONDANCE ci-dessous (quel terme du ROME correspond à quel choix de l'application)
// sont de notre fait : elles sont à relire et valider par Denis. Un choix précédé de « + » est un AJOUT PROPOSÉ (il n'existe pas encore dans l'application).
// Le script affiche : la part des 1 923 codes dont au moins un contexte est couvert aujourd'hui, puis avec les ajouts proposés, et les termes du ROME restés sans choix.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const fichierMesures = process.argv[2];
const fichierParCode = process.argv[3];
if (!fichierMesures || !fichierParCode) { console.error('Usage : node scripts/couvertureListesParcours.js <mesures.json> <mesures.parcode.json>'); process.exit(1); }
const mesures = JSON.parse(fs.readFileSync(fichierMesures, 'utf8'));
const parCode = JSON.parse(fs.readFileSync(fichierParCode, 'utf8'));
const codes = Object.keys(parCode);

// Listes actuelles de l'application.
const ctx = {}; vm.createContext(ctx);
['personnesMaterielsLieux', 'actionsProfessionnelles', 'environnementsTravail'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', f + '.js'), 'utf8') + ';', ctx));
const ids = (nom) => new Set(vm.runInContext(nom, ctx).reduce((a, g) => a.concat(g.items.map((i) => i.id)), []));
const ACTUEL = { personnes: ids('CATALOGUE_PERSONNES_MATERIELS_LIEUX'), actions: ids('CATALOGUE_ACTIONS_PRO'), lieux: ids('CATALOGUE_ENVIRONNEMENTS_TRAVAIL') };
const estActuel = (famille, id) => ACTUEL[famille].has(id);

// ---------------------------------------------------------------------------------------------
// 1. AVEC QUI : publics spécifiques du ROME -> choix
// ---------------------------------------------------------------------------------------------
const PUBLICS = {
  clients: ["Clientèle de particuliers", "Clientèle d'entreprises", "Clientèle de professionnels", "Clientèle d'affaires", "Particuliers", "Clientèle d'organismes publics"],
  enfants: ["Enfants", "Mineurs (- 18 ans)", "Nourrissons", "Enfants de 3 à 6 ans", "Enfants de moins de 3 ans", "Enfants de 6 à 10 ans", "Enfants de moins de 3 ans en situation de handicap", "Enfants de plus de 3 ans en situation de handicap"],
  personnes_agees: ["Personnes âgées", "Résidents"],
  patients: ["Patients", "Personnes médicalisées"],
  eleves_etudiants: ["Public scolaire", "Etudiants"],
  '+adolescents': ["Adolescents"],
  '+handicap': ["Personnes en situation de handicap", "Public mal entendant", "Public mal voyant", "Personnes à mobilité réduite", "Enfants de moins de 3 ans en situation de handicap", "Enfants de plus de 3 ans en situation de handicap"],
  '+personnes_en_difficulte': ["Personnes vulnérables", "Personnes sous main de justice", "Jeunes en insertion", "Demandeurs d'emploi", "Publics en situation d'illettrisme"],
  '+familles': ["Familles"],
  '+professionnels_salaries': ["Salariés", "Professionnels de santé", "Créateurs d'entreprise", "Bénévoles"],
  '+partenaires_fournisseurs': ["Partenaires Publics et Privés", "Travail avec des organisations ou partenaires internationaux"],
  '+sportifs': ["Sportifs"],
  '+grand_public_usagers': ["Tous types de public", "Usagers", "Adultes"]
};

// ---------------------------------------------------------------------------------------------
// 2. OÙ VOUS TRAVAILLIEZ : structures et conditions de lieu du ROME -> choix (les termes génériques, qui ne disent pas un lieu, sont ignorés)
// ---------------------------------------------------------------------------------------------
const GENERIQUES = ["Entreprises et milieux professionnels", "Prestataire de services", "Entreprise industrielle_"];
const LIEUX = {
  bureau: ["En bureau d'études"],
  teletravail_domicile: ["Possibilité de télétravail"],
  usine: ["En atelier", "En milieu industriel", "En ligne ou ilot de production", "Entreprise industrielle", "Industries chimiques", "Industries de santé", "Industrie pharmaceutique", "Entreprises spécialisées en carrosserie-peinture"],
  magasin: ["Commerce de proximité", "Etablissement de distribution en gros", "Concessions"],
  sante: ["Etablissement de santé", "En bloc opératoire", "En salle d'accouchement"],
  ecole_formation: ["Etablissement scolaire", "Organisme de formation"],
  cuisine: ["Etablissement de restauration traditionnelle", "Etablissement de restauration rapide", "Etablissement de restauration collective", "Bar, Brasserie", "Hôtellerie / Restauration"],
  hotel: ["Hôtellerie", "Hébergement et hôtellerie de plein air"],
  administration: ["Organisme public", "Collectivités territoriales", "Instances de santé", "Organismes de logements sociaux", "Secteur de la Défense", "Organisme militaire"],
  laboratoire: ["En laboratoire", "Laboratoire de recherche et développement", "Laboratoire de biologie médicale", "En salle blanche"],
  domicile: ["Au domicile d'un particulier", "Au domicile de l'intervenant", "Particuliers employeurs"],
  exterieur: ["En extérieur", "Sur chantier", "Entreprises de travaux publics", "En grande hauteur", "En altitude"],
  exploitation_agricole: ["Exploitation agricole", "Travail avec des animaux"],
  espaces_verts: ["Entreprises de génie écologique"],
  evenementiel: ["Structure de loisirs, culturelle ou touristique", "Institution culturelle", "Opérateurs de voyages et de séjours"],
  salle_sport: ["Structure sportive", "En club sportif", "En milieu aquatique"],
  aeroport_gare: ["En zone aéroportuaire", "Opérateurs aéroportuaires", "Opérateurs de transports en commun"],
  port: ["En zone portuaire", "En milieu maritime", "Structures maritimes"],
  route: ["Déplacements professionnels", "Entreprises privées de transport sanitaire"],
  entrepot_logistique: ["En zone frigorifique"],
  '+social_medicosocial_creche': ["Etablissement social ou médico-social (EHPAD, résidence senior, ...)", "Structure médico-sociale", "Crèche, halte-garderie", "Maison d'Assistantes Maternelles (MAM)"],
  '+association': ["Association", "Structures de l'Economie Sociale et Solidaire"],
  '+cabinet_pharmacie': ["Cabinet libéral", "Officine"],
  '+medias_studio_edition': ["Entreprises de médias", "En studio", "Société de production audiovisuelle", "Structures de l'édition"],
  '+centre_appels': ["Centres d'appels"],
  '+securite_prison': ["Etablissement pénitentiaire", "Entreprises de sécurité privée", "Port d'arme et de munitions", "Port de gilet pare-balles"]
};

// ---------------------------------------------------------------------------------------------
// 3. AVEC QUOI : sous-catégories de savoirs « Produits, outils et matières » (et deux voisines) -> choix
// ---------------------------------------------------------------------------------------------
const MATIERES = {
  machines_outils_appareils: ["Produits, outils et matières > Outils, machines, équipement matériel"],
  vehicules: ["Produits, outils et matières > Véhicules"],
  produits: ["Produits, outils et matières > Produits finis, services"],
  animaux: ["Produits, outils et matières > Animaux, végétaux"],
  ordinateur_logiciels: ["Domaines d'expertise > Logiciels, progiciels"],
  documents: ["Normes et procédés > Documentations, cartes et plans"],
  '+matieres_materiaux': ["Produits, outils et matières > Matières, matériaux"],
  '+tissus_textile': ["Produits, outils et matières > Mode, textile et accessoires"],
  '+aliments': ["Produits, outils et matières > Aliments et spécialités culinaires"],
  '+instruments_objets_art': ["Produits, outils et matières > Instruments de musique", "Produits, outils et matières > Objets d'art"]
};
// Les « végétaux » sont mêlés aux animaux dans le ROME : mesurés à part par mot.
const MOTS_VEGETAUX = /plante|végétaux|arbre|semis|culture|fleur|gazon|forêt|bois d|essences/i;

// ---------------------------------------------------------------------------------------------
// 4. CE QUE VOUS FAISIEZ : les 84 « objectifs » de compétences du ROME -> choix actuel ou ajout proposé
//    couvert : 'oui' (un choix actuel le dit), 'partiel' (un choix s'en approche), 'non' ; ajout : choix proposé ; cadre : objectif de cadre dirigeant ou de fonction support, hors public principal
// ---------------------------------------------------------------------------------------------
const OBJECTIFS = {
  '1A1': { couvert: 'non', ajout: '+animer' }, '1B1': { couvert: 'non', ajout: '+encadrer' }, '1B2': { couvert: 'non', ajout: '+encadrer' },
  '1C1': { couvert: 'non', cadre: true }, '1C2': { couvert: 'non', ajout: '+recruter_personnel' }, '1C3': { couvert: 'non', cadre: true },
  '1D1': { couvert: 'oui' }, '1D2': { couvert: 'oui' }, '1D3': { couvert: 'oui' }, '1D4': { couvert: 'partiel' },
  '1E1': { couvert: 'oui' }, '1E2': { couvert: 'partiel' }, '1E3': { couvert: 'oui' }, '1E4': { couvert: 'partiel', ajout: '+soigner_animaux' },
  '2A2': { couvert: 'partiel' }, '2A3': { couvert: 'non', ajout: '+organiser_evenement_communiquer' }, '2A4': { couvert: 'partiel' },
  '2B1': { couvert: 'partiel' }, '2B2': { couvert: 'oui' }, '2B3': { couvert: 'non', ajout: '+se_produire' },
  '2C1': { couvert: 'partiel' }, '2C2': { couvert: 'partiel' }, '2C3': { couvert: 'non', ajout: '+rechercher_tester' },
  '2D1': { couvert: 'oui' }, '2D2': { couvert: 'partiel' }, '2D3': { couvert: 'oui' },
  '3A1': { couvert: 'partiel', ajout: '+concevoir' }, '3A2': { couvert: 'non', cadre: true },
  '3B1': { couvert: 'partiel', ajout: '+utiliser_machines_outils' }, '3B2': { couvert: 'non', ajout: '+manipuler_preparer_produits' },
  '3B3': { couvert: 'partiel', ajout: '+utiliser_machines_outils' }, '3B4': { couvert: 'non', ajout: '+cultiver_entretenir_plantes' },
  '3B5': { couvert: 'non', cadre: true }, '3B6': { couvert: 'oui' },
  '3C1': { couvert: 'partiel', ajout: '+amenager' }, '3D1': { couvert: 'partiel', ajout: '+piloter_projet_chantier' }, '3D2': { couvert: 'oui' },
  '3E1': { couvert: 'partiel', ajout: '+entretenir_maintenir' }, '3E2': { couvert: 'oui' }, '3E3': { couvert: 'partiel', ajout: '+entretenir_maintenir' },
  '3F1': { couvert: 'oui' }, '3F2': { couvert: 'non', ajout: '+appliquer_consignes_securite' },
  '3G1': { couvert: 'partiel' }, '3G2': { couvert: 'oui' }, '3G3': { couvert: 'oui' },
  '3H1': { couvert: 'non', ajout: '+gerer_stocks_acheter' }, '3H2': { couvert: 'partiel', ajout: '+manutentionner_emballer' },
  '3I1': { couvert: 'partiel', ajout: '+livrer' }, '3J1': { couvert: 'oui' },
  '4A1': { couvert: 'oui' }, '4A2': { couvert: 'partiel' }, '4B1': { couvert: 'partiel', ajout: '+gerer_stocks_acheter' },
  '4C1': { couvert: 'oui' }, '4C2': { couvert: 'partiel' }, '4D1': { couvert: 'non', ajout: '+appliquer_consignes_securite' },
  '4D2': { couvert: 'non', cadre: true }, '4D3': { couvert: 'partiel' },
  '4E1': { couvert: 'non', ajout: '+surveiller_securiser' }, '4E2': { couvert: 'non', ajout: '+proteger_environnement_trier' },
  '4F1': { couvert: 'non', cadre: true }, '4F2': { couvert: 'non', cadre: true }, '4F3': { couvert: 'non', cadre: true },
  '5A1': { couvert: 'oui' }, '5A2': { couvert: 'oui' }, '5B1': { couvert: 'oui' }, '5B2': { couvert: 'partiel' }, '5B3': { couvert: 'partiel' },
  '5B4': { couvert: 'partiel' }, '5B5': { couvert: 'non', cadre: true }, '5C1': { couvert: 'partiel', ajout: '+piloter_projet_chantier' },
  '5C2': { couvert: 'non', cadre: true }, '5C3': { couvert: 'non', cadre: true }, '5C4': { couvert: 'non', cadre: true }, '5C5': { couvert: 'non', ajout: '+encadrer' },
  '6A1': { couvert: 'oui' /* « Des collègues » dans « avec qui » */ }, '6A2': { couvert: 'partiel', ajout: '+expliquer_presenter_oral' }, '6A3': { couvert: 'oui' }, '6A4': { couvert: 'partiel' },
  '6B1': { couvert: 'non', ajout: '+appliquer_consignes_securite' }, '6B2': { couvert: 'non', ajout: '+reagir_imprevu_urgence' }, '6B3': { couvert: 'oui' },
  '6C1': { couvert: 'non', cadre: true }, '6C2': { couvert: 'non', cadre: true }, '6D1': { couvert: 'non', cadre: true }
};

// ---------------------------------------------------------------------------------------------
// Calculs
// ---------------------------------------------------------------------------------------------
const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0) + ' %';
function inverse(table) { const m = {}; Object.keys(table).forEach((id) => table[id].forEach((t) => { (m[t] = m[t] || []).push(id); })); return m; }
function mesurerParTermes(titre, famille, table, selecteur) {
  const parTerme = inverse(table);
  let avecTermes = 0, couvertActuel = 0, couvertAvecAjouts = 0, aucun = 0, sommeParts = 0, toutCouvert = 0;
  const parChoix = {};   // id -> nb de codes où il sert
  const termesSansChoix = {};
  codes.forEach((c) => {
    const termes = selecteur(parCode[c]);
    if (!termes.length) { aucun++; return; }
    avecTermes++;
    const choix = new Set();
    let nbCouverts = 0; termes.forEach((t) => { if ((parTerme[t] || []).length || GENERIQUES.indexOf(t) !== -1) { nbCouverts++; } });
    sommeParts += nbCouverts / termes.length; if (nbCouverts === termes.length) { toutCouvert++; }
    termes.forEach((t) => { (parTerme[t] || []).forEach((id) => choix.add(id)); if (!(parTerme[t] || []).length) { termesSansChoix[t] = (termesSansChoix[t] || 0) + 1; } });
    choix.forEach((id) => { parChoix[id] = (parChoix[id] || 0) + 1; });
    if ([...choix].some((id) => id.charAt(0) !== '+' && estActuel(famille, id))) { couvertActuel++; }
    if (choix.size) { couvertAvecAjouts++; }
  });
  console.log('\n## ' + titre);
  console.log('Codes ROME ayant au moins un terme de ce type : ' + avecTermes + ' sur ' + codes.length);
  console.log('  couverts par un choix ACTUEL : ' + couvertActuel + ' (' + pct(couvertActuel, avecTermes) + ')');
  console.log('  couverts avec les AJOUTS PROPOSÉS : ' + couvertAvecAjouts + ' (' + pct(couvertAvecAjouts, avecTermes) + ')');
  console.log('  STRICT : part moyenne des termes du ROME d’un code couverts = ' + pct(sommeParts, avecTermes) + ' ; codes dont TOUS les termes sont couverts = ' + toutCouvert + ' (' + pct(toutCouvert, avecTermes) + ')');
  console.log('Nombre de codes ROME par choix (+ = ajout proposé) :');
  Object.keys(parChoix).sort((a, b) => parChoix[b] - parChoix[a]).forEach((id) => console.log('  ' + String(parChoix[id]).padStart(5) + '  ' + id));
  const actuelsSansCode = [...ACTUEL[famille]].filter((id) => !parChoix[id]);
  if (actuelsSansCode.length) { console.log('Choix actuels sans aucune correspondance mesurée : ' + actuelsSansCode.join(', ')); }
  const reste = Object.keys(termesSansChoix).sort((a, b) => termesSansChoix[b] - termesSansChoix[a]).filter((t) => GENERIQUES.indexOf(t) === -1);
  if (reste.length) { console.log('Termes du ROME restés SANS choix (codes) : ' + reste.slice(0, 25).map((t) => t + ' ' + termesSansChoix[t]).join(' | ')); }
}

// 1. avec qui
mesurerParTermes('AVEC QUI (publics spécifiques)', 'personnes', PUBLICS, (x) => x.contextes.filter((y) => y[1] === 'Publics spécifiques').map((y) => y[0]));
// 2. où
const LIEUX_TERMES = new Set(Object.keys(inverse(LIEUX)));
mesurerParTermes('OÙ VOUS TRAVAILLIEZ (structures et lieux)', 'lieux', LIEUX, (x) => x.contextes.filter((y) => y[1] === 'Types de structures' || LIEUX_TERMES.has(y[0])).map((y) => y[0]).filter((t) => GENERIQUES.indexOf(t) === -1));
// 3. avec quoi
(function () {
  const parSousCat = inverse(MATIERES);
  let avec = 0, actuel = 0, ajouts = 0;
  const parChoix = {};
  const sansChoix = {};
  codes.forEach((c) => {
    const x = parCode[c];
    const cats = x.savoirsSousCategories.filter((s) => s.indexOf('Produits, outils et matières') === 0 || s === "Domaines d'expertise > Logiciels, progiciels" || s === 'Normes et procédés > Documentations, cartes et plans');
    const choix = new Set();
    cats.forEach((s) => { (parSousCat[s] || []).forEach((id) => choix.add(id)); if (!(parSousCat[s] || []).length) { sansChoix[s] = (sansChoix[s] || 0) + 1; } });
    if (x.savoirsProduits.some((l) => MOTS_VEGETAUX.test(l))) { choix.add('+vegetaux'); }
    if (!choix.size && !cats.length) { return; }
    avec++;
    choix.forEach((id) => { parChoix[id] = (parChoix[id] || 0) + 1; });
    if ([...choix].some((id) => id.charAt(0) !== '+')) { actuel++; }
    if (choix.size) { ajouts++; }
  });
  console.log('\n## AVEC QUOI (matières, produits, outils : savoirs « Produits, outils et matières », logiciels, documents)');
  console.log('Codes ROME concernés : ' + avec + ' sur ' + codes.length);
  console.log('  couverts par un choix ACTUEL : ' + actuel + ' (' + pct(actuel, avec) + ')');
  console.log('  couverts avec les AJOUTS PROPOSÉS : ' + ajouts + ' (' + pct(ajouts, avec) + ')');
  Object.keys(parChoix).sort((a, b) => parChoix[b] - parChoix[a]).forEach((id) => console.log('  ' + String(parChoix[id]).padStart(5) + '  ' + id));
  console.log('Sous-catégories restées sans choix : ' + Object.keys(sansChoix).map((s) => s + ' ' + sansChoix[s]).join(' | '));
})();
// 4. ce que vous faisiez
(function () {
  const stat = { oui: 0, partiel: 0, non: 0, cadre: 0 };
  const apportAjout = {};
  mesures.objectifs.forEach((o) => {
    const m = OBJECTIFS[o.code];
    if (!m) { console.log('  !! objectif sans table : ' + o.code + ' ' + o.objectif); return; }
    stat[m.cadre ? 'cadre' : m.couvert] += o.codesRome;
    if (m.ajout) { apportAjout[m.ajout] = apportAjout[m.ajout] || { codes: 0, objectifs: [] }; apportAjout[m.ajout].codes += o.codesRome; apportAjout[m.ajout].objectifs.push(o.objectif + ' (' + o.codesRome + ')'); }
  });
  const total = stat.oui + stat.partiel + stat.non + stat.cadre;
  console.log('\n## CE QUE VOUS FAISIEZ (84 objectifs de compétences du ROME, pondérés par le nombre de codes ROME qui les portent)');
  console.log('Liens « code ROME / objectif » : ' + total);
  console.log('  couverts par un choix actuel : ' + pct(stat.oui, total) + ' | partiellement : ' + pct(stat.partiel, total) + ' | pas couverts : ' + pct(stat.non, total) + ' | objectifs de cadre dirigeant ou de fonction support, laissés de côté : ' + pct(stat.cadre, total));
  // Part des codes dont au moins la moitié des objectifs (hors cadre) restent non couverts ou partiels.
  let faibles = 0, faiblesApres = 0, utiles = 0;
  codes.forEach((c) => {
    const obj = parCode[c].objectifs.filter((o) => OBJECTIFS[o] && !OBJECTIFS[o].cadre);
    if (!obj.length) { return; }
    utiles++;
    const ok = (o) => OBJECTIFS[o].couvert === 'oui';
    const okApres = (o) => OBJECTIFS[o].couvert === 'oui' || OBJECTIFS[o].ajout;
    if (obj.filter(ok).length / obj.length < 0.5) { faibles++; }
    if (obj.filter(okApres).length / obj.length < 0.5) { faiblesApres++; }
  });
  console.log('Codes ROME dont MOINS de la moitié des objectifs sont couverts pleinement : ' + faibles + ' sur ' + utiles + ' (' + pct(faibles, utiles) + '), après les ajouts proposés : ' + faiblesApres + ' (' + pct(faiblesApres, utiles) + ')');
  console.log('Ajouts proposés, avec le nombre de liens « code ROME / objectif » qu\'ils servent :');
  Object.keys(apportAjout).sort((a, b) => apportAjout[b].codes - apportAjout[a].codes).forEach((id) => console.log('  ' + String(apportAjout[id].codes).padStart(5) + '  ' + id + '  <- ' + apportAjout[id].objectifs.join(' ; ')));
  const verbesActuels = { organiser: 1, planifier: 1, gérer: 1, contrôler: 1, analyser: 1, négocier: 1, calculer: 1, classer: 1, saisir: 1, conseiller: 1, accompagner: 1, vendre: 1, former: 1, soigner: 1, accueillir: 1, aider: 1, informer: 1, réparer: 1, transporter: 1, nettoyer: 1, construire: 1, fabriquer: 1, installer: 1, monter: 1, découper: 1, conduire: 1, diagnostiquer: 1, programmer: 1, cuisiner: 1, créer: 1, rédiger: 1, imaginer: 1, photographier: 1, dessiner: 1, archiver: 1, piloter: 1 };
  const verbesCodes = {};
  codes.forEach((c) => parCode[c].verbes.forEach((v) => { verbesCodes[v] = (verbesCodes[v] || 0) + 1; }));
  const generiques = { assurer: 1, réaliser: 1, evaluer: 1, utiliser: 1, mettre: 1, développer: 1, effectuer: 1, identifier: 1, etablir: 1, définir: 1, proposer: 1, adapter: 1, participer: 1, déterminer: 1, elaborer: 1, intégrer: 1, faire: 1, agir: 1, procéder: 1, favoriser: 1, apporter: 1, mener: 1, contribuer: 1, optimiser: 1, suivre: 1, traiter: 1, renseigner: 1, documenter: 1 };
  console.log('Verbes les plus fréquents du ROME qui n\'ont pas de choix du même nom (hors verbes trop généraux) :');
  console.log('  ' + Object.keys(verbesCodes).filter((v) => !verbesActuels[v] && !generiques[v]).sort((a, b) => verbesCodes[b] - verbesCodes[a]).slice(0, 40).map((v) => v + ' ' + verbesCodes[v]).join(' | '));
})();
