/* ============================================================
   Bloc « Vos diplômes » : LOGIQUE PURE des propositions de métiers et de missions (aucun DOM).
   Testée par tests/formationsMetiers.test.js (Node, sur le répertoire réel du ROME).
   Maquette validée par Denis le 15/11/2026 (consignes 341 à 352) : docs/MAQUETTE_VOS_DIPLOMES_2026-11-15.html.

   Principe : on améliore seulement la LOGIQUE DES PROPOSITIONS du bloc (le rendu et les boutons restent ceux du code existant).
   - Une question d'intention par formation : « Voulez-vous détailler cette formation sur votre CV ? », préréglée d'après le diplôme et
     le dossier (jamais une décision : la personne garde toujours la main).
   - Si « Oui » : 4 métiers proposés pour le diplôme (table courte de diplômes courants vers des codes du ROME, complétée par la même
     famille de métiers), puis tous les métiers du secteur rangés par famille, puis les missions prêtes à cocher de la fiche de chaque
     métier choisi (3 au plus). Les missions décrivent le métier, jamais la formation : la phrase de la maquette le dit à la personne.
   Données : le répertoire du ROME (REPERTOIRE_ROME, chargé à la demande par js/app.js) et les fiches data/rome/fiche_X.js (champ « mi »).
   La table de diplômes est un EXTRAIT (31 entrées dont tous les codes sont vérifiés dans le répertoire réel) : elle sera étendue et
   validée avec Denis.
   ============================================================ */

var FM_MAX_METIERS = 3;     // la personne choisit trois métiers au plus (décision de Denis, consigne 348)
var FM_NB_PROPOSES = 4;     // toujours quatre métiers proposés (consigne 351)
var FM_NB_VISIBLES = 12;    // au-delà, une famille se déplie par un bouton « Voir les N autres »

// Noms des 110 familles de métiers du ROME (les trois premiers caractères du code ROME). Source : docs/CORRESPONDANCE_ROME_21_DOMAINES.md.
var FM_FAMILLES = {"K14":"Conception et mise en oeuvre des politiques publiques","K15":"Contrôle public","K19":"Droit","M11":"Achats","M12":"Comptabilité et gestion","M13":"Direction d'entreprise","M14":"Organisation et études","M15":"Ressources humaines","M16":"Secrétariat et assistance","A11":"Engins agricoles et forestiers","A12":"Espaces naturels et espaces verts","A13":"Etudes et assistance technique","A14":"Production","B11":"Arts plastiques","B12":"Céramique","B13":"Décoration","B14":"Fibres et papier","B15":"Instruments de musique","B16":"Métal, verre, bijouterie et horlogerie","B17":"Taxidermie","B18":"Tissu et cuirs","C11":"Assurance","C12":"Banque","C13":"Finance","C14":"Gestion administrative banque et assurances","C15":"Immobilier","F11":"Conception et études","F12":"Conduite et encadrement de chantier - travaux","F13":"Engins de chantier","F14":"Extraction","F15":"Montage de structures","F16":"Second oeuvre","F17":"Travaux et gros oeuvre","I12":"Entretien technique","D12":"Commerce non alimentaire et de prestations de confort","D13":"Direction de magasin de détail","D14":"Force de vente","D15":"Grande distribution","M17":"Stratégie commerciale, marketing et supervision des ventes","E11":"Edition et communication","E12":"Images et sons","E14":"Publicité","K16":"Culture et gestion documentaire","L11":"Animation de spectacles","L12":"Artistes - interprètes du spectacle","L13":"Conception et production de spectacles","L15":"Techniciens du spectacle","K21":"Formation initiale et continue","K24":"Recherche","G11":"Accueil et promotion touristique","G13":"Conception, commercialisation et vente de produits touristiques","G14":"Gestion et direction","G15":"Personnel d'étage en hôtellerie","G16":"Production culinaire","G17":"Accueil en hôtellerie","G18":"Service","E13":"Industries graphiques","H11":"Affaires et support technique client","H12":"Conception, recherche, études et développement","H13":"Hygiène Sécurité Environnement -HSE- industriels","H14":"Méthodes et gestion industrielles","H15":"Qualité et analyses industrielles","H21":"Alimentaire","H22":"Bois","H23":"Chimie et pharmacie","H24":"Cuir et textile","H25":"Direction, encadrement et pilotage de fabrication et production industrielles","H26":"Electronique et électricité","H27":"Energie","H28":"Matériaux de construction, céramique et verre","H29":"Mécanique, travail des métaux et outillage","H31":"Papier et carton","H32":"Plastique, caoutchouc","H33":"Préparation et conditionnement","H34":"Traitements thermiques et traitements de surfaces","I11":"Encadrement","I13":"Equipements de production, équipements collectifs","I14":"Equipements domestiques et informatique","I15":"Travaux d'accès difficile","M18":"Systèmes d'information et de télécommunication","I16":"Véhicules, engins, aéronefs","A15":"Soins aux animaux","D11":"Commerce alimentaire et métiers de bouche","K22":"Nettoyage et propreté industriels","K23":"Propreté et environnement urbain","J11":"Praticiens médicaux","J12":"Praticiens médico-techniques","J13":"Professionnels médico-techniques","J14":"Rééducation et appareillage","J15":"Soins paramédicaux","K17":"Défense, sécurité publique et secours","K25":"Sécurité privée","K11":"Accompagnement de la personne","K12":"Action sociale, socio-éducative et socio-culturelle","K13":"Aide à la vie quotidienne","K18":"Développement territorial et emploi","K26":"Services funéraires","G12":"Animation d'activités de loisirs","L14":"Sport professionnel","N11":"Magasinage, manutention des charges et déménagement","N12":"Organisation de la circulation des marchandises","N13":"Personnel d'encadrement de la logistique","N21":"Personnel navigant du transport aérien","N22":"Personnel sédentaire du transport aérien","N31":"Personnel navigant du transport maritime et fluvial","N32":"Personnel sédentaire du transport maritime et fluvial","N41":"Personnel de conduite du transport routier","N42":"Personnel d'encadrement du transport routier","N43":"Personnel navigant du transport terrestre","N44":"Personnel sédentaire du transport ferroviaire et réseau filo guidé"};

// Diplôme courant -> métiers auxquels il mène (codes du ROME, tous présents dans le répertoire). EXTRAIT, à étendre avec Denis.
var FM_TABLE_DIPLOMES = [
  [/lectrotechn/i, ['I1324', 'F1602', 'I1304']],
  [/boulang/i, ['D1102']],
  [/p[âa]tiss/i, ['D1104']],
  [/bouch|charcut/i, ['D1101', 'D1103']],
  [/cuisin/i, ['G1602', 'G1606']],
  [/restauration|service en salle|commercialisation et services/i, ['G1803', 'G1607', 'G1603']],
  [/coiffure/i, ['D1202']],
  [/esth[ée]tique|cosm[ée]tique/i, ['D1240', 'D1208']],
  [/peinture|peintre/i, ['F1606']],
  [/plomberie|plombier|sanitaire et thermique/i, ['F1603']],
  [/carrel/i, ['F1608']],
  [/charpent/i, ['F1503']],
  [/couvr|zingu/i, ['F1619']],
  [/menuis/i, ['H2206']],
  [/[ée]lectricien|melec|[ée]lectricit[ée]/i, ['F1602', 'I1304']],
  [/maintenance industrielle|m[ée]catron|pilote de ligne|[ée]quipements industriels/i, ['I1212', 'H1245', 'H2924']],
  [/soudage|chaudronn/i, ['H2913']],
  [/maintenance des v[ée]hicules|automobile|m[ée]canique auto|carrosserie/i, ['I1604', 'I1608']],
  [/paysag|espaces verts|jardin/i, ['A1208', 'A1211']],
  [/commerce|vente|employ[ée] de vente|\bevs\b|\bmcv|\bmco\b|\bndrc\b/i, ['D1507', 'D1505', 'D1401']],
  [/accompagnement.*(soins|personne)|\bassp\b|advf|assistant de vie|deaes|\baes\b|aide.*domicile/i, ['K1304', 'K1306']],
  [/aide-soignant|\bdeas\b/i, ['J1501']],
  [/petite enfance|aepe/i, ['K1307', 'K1308', 'K1310']],
  [/auxiliaire de pu[ée]riculture/i, ['J1304']],
  [/propret[ée]|nettoyage|agent d.entretien/i, ['K2204']],
  [/s[ée]curit[ée]|ssiap/i, ['K2504', 'K2509']],
  [/logistique|magasinier|cariste|pr[ée]parateur de commandes|manutention/i, ['N1105', 'N4120']],
  [/conducteur routier|transport routier|livraison/i, ['N4105', 'N4121']],
  [/gestion administrative|secr[ée]tariat|assistant de gestion|gestion de la pme|\bga\b|gpme/i, ['M1608', 'M1611', 'M1601']],
  [/syst[èe]mes num[ée]riques|r[ée]seaux|assistance informatique/i, ['I1404', 'M1801']],
  [/\bsio\b|services informatiques|informatique|d[ée]veloppeur|dwwm/i, ['M1805', 'M1855', 'M1801', 'I1404']]
];

function fmNormaliser(texte) {
  return String(texte || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Index du répertoire : métiers uniques par code (le premier intitulé rencontré), rangés par secteur (21) puis par famille (110).
// Construit une seule fois par répertoire.
function fmIndexRepertoire(repertoire) {
  if (!repertoire || !repertoire.metiers) { return null; }
  if (repertoire._fmIndex) { return repertoire._fmIndex; }
  var parCode = {};
  repertoire.metiers.forEach(function (l) { if (!parCode[l[1]]) { parCode[l[1]] = { code: l[1], nom: l[0], d: l[2], fam: l[1].slice(0, 3) }; } });
  var parDomaine = repertoire.domaines.map(function () { return []; });
  Object.keys(parCode).forEach(function (c) { parDomaine[parCode[c].d].push(parCode[c]); });
  parDomaine.forEach(function (t) { t.sort(function (a, b) { return a.fam < b.fam ? -1 : a.fam > b.fam ? 1 : a.nom.localeCompare(b.nom, 'fr'); }); });
  var index = { parCode: parCode, parDomaine: parDomaine, domaines: repertoire.domaines };
  try { Object.defineProperty(repertoire, '_fmIndex', { value: index, enumerable: false }); } catch (e) { /* sans mémorisation, jamais un blocage */ }
  return index;
}

// Métiers auxquels mène un diplôme (table courte), sans le compléter. Liste vide si le diplôme n'est pas reconnu.
function fmMetiersDuDiplome(intitule, index) {
  if (!index) { return []; }
  var t = String(intitule || '');
  for (var i = 0; i < FM_TABLE_DIPLOMES.length; i++) {
    if (FM_TABLE_DIPLOMES[i][0].test(t)) {
      return FM_TABLE_DIPLOMES[i][1].filter(function (c) { return index.parCode[c]; }).map(function (c) { return index.parCode[c]; });
    }
  }
  return [];
}

// Les quatre métiers proposés : la table d'abord, complétée par la même famille de métiers puis par le même secteur.
function fmProposes(intitule, index, nb) {
  var max = nb || FM_NB_PROPOSES;
  var p = fmMetiersDuDiplome(intitule, index).slice(0, max);
  if (p.length && p.length < max) {
    var codes = {};
    p.forEach(function (m) { codes[m.code] = 1; });
    var secteur = index.parDomaine[p[0].d] || [];
    secteur.forEach(function (m) { if (p.length < max && m.fam === p[0].fam && !codes[m.code]) { codes[m.code] = 1; p.push(m); } });
    secteur.forEach(function (m) { if (p.length < max && !codes[m.code]) { codes[m.code] = 1; p.push(m); } });
  }
  return p;
}

// Secteurs (indices) des métiers proposés, sans doublon, dans l'ordre.
function fmSecteursDesPropositions(proposes) {
  var vus = {}, r = [];
  (proposes || []).forEach(function (m) { if (!vus[m.d]) { vus[m.d] = 1; r.push(m.d); } });
  return r;
}

// Aide au préréglage : la formation comprend-elle de la pratique (atelier, stage, alternance) ? 'beaucoup' | 'un-peu' | 'cours' | null (inconnu).
function fmDetecterPratique(intitule, type) {
  var t = String(intitule || '').toLowerCase();
  if (type === 'titrepro' || type === 'cqp') { return 'beaucoup'; }
  if (t.length < 3) { return null; }
  if (/g[ée]n[ée]ral/.test(t) && /bac/.test(t)) { return 'cours'; }
  if (/licence(?!\s*pro)|master|doctorat|pr[ée]pa|classe pr[ée]paratoire|deug|ma[iî]trise|capacit[ée] en droit|magist[èe]re/.test(t)) { return 'cours'; }
  if (/techno|stmg|sti2d|st2s|stl\b|std2a|sti\b/.test(t)) { return null; }
  if (/\bcap\b|\bbep\b|bac\s*pro|brevet professionnel|\bbp\b|mention compl/.test(t)) { return 'beaucoup'; }
  if (/bts|\bbut\b|\bdut\b|licence\s*pro|ing[ée]nieur|bachelor|alternance|apprentissage/.test(t)) { return 'un-peu'; }
  return null;
}

// Préréglage de la question « détailler ? » : 'oui' | 'non' | null (rien de coché). Sans expérience : « oui » pour un diplôme pratique, un titre
// professionnel ou un CQP ; avec expérience ou diplôme théorique : « non » ; intitulé inconnu ou bac technologique : rien de coché.
function fmPresetDetail(intitule, type, aExperience) {
  var p = fmDetecterPratique(intitule, type);
  if (p === 'cours') { return 'non'; }
  if (p) { return aExperience ? 'non' : 'oui'; }
  return null;
}

// Liste du secteur : les métiers du secteur SANS les métiers déjà proposés plus haut, rangés par famille (celles des métiers proposés en
// premier), filtrés par les mots tapés. Renvoie [{ code, nom, metiers: [...] }].
function fmListeSecteur(index, idxSecteur, codesExclus, filtre) {
  if (!index || idxSecteur === null || idxSecteur === undefined || !index.parDomaine[idxSecteur]) { return []; }
  var exclus = {};
  (codesExclus || []).forEach(function (c) { exclus[c] = 1; });
  var tous = index.parDomaine[idxSecteur].filter(function (m) { return !exclus[m.code]; });
  var mots = fmNormaliser(filtre).split(' ').filter(function (x) { return x.length > 1; });
  if (mots.length) {
    tous = tous.filter(function (m) { var n = fmNormaliser(m.nom); return mots.every(function (w) { return n.indexOf(w) !== -1; }); });
  }
  var familles = [], parFam = {};
  tous.forEach(function (m) { if (!parFam[m.fam]) { parFam[m.fam] = []; familles.push(m.fam); } parFam[m.fam].push(m); });
  var famProposees = {};
  (codesExclus || []).forEach(function (c) { if (index.parCode[c]) { famProposees[index.parCode[c].fam] = 1; } });
  familles.sort(function (a, b) { return (famProposees[b] ? 1 : 0) - (famProposees[a] ? 1 : 0); });
  return familles.map(function (f) { return { code: f, nom: FM_FAMILLES[f] || f, metiers: parFam[f] }; });
}

// Missions prêtes à cocher de la fiche d'un métier (champ « mi » des fiches du ROME), vide si la fiche n'est pas chargée.
function fmMissionsDeFiche(fiches, code) {
  var f = fiches && fiches[code];
  return (f && f.mi) ? f.mi : [];
}

// Retire les missions cochées qui n'appartiennent plus à aucun métier choisi (le texte libre n'est jamais touché).
function fmNettoyerMissions(missions, metiers, fiches) {
  var permises = {};
  (metiers || []).forEach(function (m) { fmMissionsDeFiche(fiches, m.code).forEach(function (x) { permises[x] = 1; }); });
  return (missions || []).filter(function (x) { return permises[x]; });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FM_MAX_METIERS: FM_MAX_METIERS, FM_NB_PROPOSES: FM_NB_PROPOSES, FM_NB_VISIBLES: FM_NB_VISIBLES, FM_FAMILLES: FM_FAMILLES, FM_TABLE_DIPLOMES: FM_TABLE_DIPLOMES,
    fmNormaliser: fmNormaliser, fmIndexRepertoire: fmIndexRepertoire, fmMetiersDuDiplome: fmMetiersDuDiplome, fmProposes: fmProposes,
    fmSecteursDesPropositions: fmSecteursDesPropositions, fmDetecterPratique: fmDetecterPratique, fmPresetDetail: fmPresetDetail,
    fmListeSecteur: fmListeSecteur, fmMissionsDeFiche: fmMissionsDeFiche, fmNettoyerMissions: fmNettoyerMissions
  };
}
