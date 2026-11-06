// Construit data/repertoireRome.js (répertoire élargi des métiers) à partir des fichiers officiels du ROME 4.0 de France Travail
// (data.gouv.fr, « Répertoire Opérationnel des Métiers et des Emplois (ROME) », Licence Ouverte).
//
// Usage : node scripts/construireRepertoireRome.js <dossier des CSV ROME décompressés> [--table]
//   --table : écrit seulement la table de correspondance à relire (docs/CORRESPONDANCE_ROME_21_DOMAINES.md), sans toucher au fichier de données.
//
// Entrées utilisées : unix_referentiel_code_rome, unix_referentiel_appellation, unix_cr_gd_dp (fiche -> domaine professionnel), version.txt.
// Rien n'est écrit « de mémoire » : tout vient des fichiers officiels ; seule la table domaines ROME -> 21 domaines de l'application est de notre fait
// (à relire et valider par Denis).
const fs = require('fs');
const path = require('path');

const dossierSource = process.argv[2];
const seulementTable = process.argv.includes('--table');
if (!dossierSource) { console.error('Indiquez le dossier des CSV ROME.'); process.exit(1); }

function lireCsv(nomFichier) {
  const texte = fs.readFileSync(path.join(dossierSource, nomFichier), 'utf8').replace(/^﻿/, '');
  const lignes = [];
  let champ = '', ligne = [], entreGuillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (entreGuillemets) {
      if (c === '"') { if (texte[i + 1] === '"') { champ += '"'; i++; } else { entreGuillemets = false; } }
      else { champ += c; }
    } else if (c === '"') { entreGuillemets = true; }
    else if (c === ',') { ligne.push(champ); champ = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texte[i + 1] === '\n') { i++; }
      ligne.push(champ); champ = '';
      if (ligne.length > 1 || ligne[0] !== '') { lignes.push(ligne); }
      ligne = [];
    } else { champ += c; }
  }
  if (champ !== '' || ligne.length) { ligne.push(champ); lignes.push(ligne); }
  const entete = lignes.shift();
  return lignes.map(function (l) { const o = {}; entete.forEach(function (k, i) { o[k] = l[i]; }); return o; });
}

// Les 21 domaines de l'application (mêmes libellés que data/competencesSecteurs.js, vérifié par un test).
const DOMAINES = [
  'Administration, gestion et bureau', 'Agriculture, nature et espaces verts', 'Artisanat et création', 'Banque, assurance et immobilier',
  'Bâtiment et travaux publics', 'Coiffure et esthétique', 'Commerce et vente', 'Communication, culture et événementiel',
  'Éducation et formation', 'Hôtellerie, restauration et tourisme', 'Industrie, production et énergie', 'Informatique et numérique',
  'Mécanique et automobile', 'Métiers animaliers', 'Métiers de bouche (artisanat)', 'Propreté et gestion des déchets',
  'Santé et soins', 'Sécurité', 'Social et services à la personne', 'Sport, animation et loisirs', 'Transport et logistique'
];
const ADM = 0, AGR = 1, ART = 2, BAN = 3, BTP = 4, COI = 5, COM = 6, CULT = 7, EDU = 8, HOT = 9, IND = 10, INFO = 11, MEC = 12, ANI = 13, BOU = 14, PRO = 15, SAN = 16, SEC = 17, SOC = 18, SPO = 19, TRA = 20;

// Domaine professionnel ROME (110) -> domaine de l'application (21).
const PAR_DOMAINE_PRO = {
  A11: AGR, A12: AGR, A13: AGR, A14: AGR, A15: ANI,
  B11: ART, B12: ART, B13: ART, B14: ART, B15: ART, B16: ART, B17: ART, B18: ART,
  C11: BAN, C12: BAN, C13: BAN, C14: BAN, C15: BAN,
  D11: BOU, D12: COM, D13: COM, D14: COM, D15: COM,
  E11: CULT, E12: CULT, E13: IND, E14: CULT,
  F11: BTP, F12: BTP, F13: BTP, F14: BTP, F15: BTP, F16: BTP, F17: BTP,
  G11: HOT, G12: SPO, G13: HOT, G14: HOT, G15: HOT, G16: HOT, G17: HOT, G18: HOT,
  H11: IND, H12: IND, H13: IND, H14: IND, H15: IND, H21: IND, H22: IND, H23: IND, H24: IND, H25: IND, H26: IND, H27: IND, H28: IND, H29: IND,
  H31: IND, H32: IND, H33: IND, H34: IND,
  I11: IND, I12: BTP, I13: IND, I14: IND, I15: IND, I16: MEC,
  J11: SAN, J12: SAN, J13: SAN, J14: SAN, J15: SAN,
  K11: SOC, K12: SOC, K13: SOC, K14: ADM, K15: ADM, K16: CULT, K17: SEC, K18: SOC, K19: ADM,
  K21: EDU, K22: PRO, K23: PRO, K24: EDU, K25: SEC, K26: SOC,
  L11: CULT, L12: CULT, L13: CULT, L14: SPO, L15: CULT,
  M11: ADM, M12: ADM, M13: ADM, M14: ADM, M15: ADM, M16: ADM, M17: COM, M18: INFO,
  N11: TRA, N12: TRA, N13: TRA, N21: TRA, N22: TRA, N31: TRA, N32: TRA, N41: TRA, N42: TRA, N43: TRA, N44: TRA
};
// Exceptions fiche par fiche (code ROME) : métiers rangés dans un domaine ROME voisin mais dont la place naturelle est ailleurs.
// Clé = code ROME ; valeur = [domaine de l'application, raison].
const EXCEPTIONS = {
  D1106: [COM, 'Vendeur en épicerie'],
  D1107: [COM, 'Vendeur grossiste en produits frais'],
  D1110: [COM, 'Vendeur ambulant'],
  D1113: [COM, 'Commercial itinérant en commerce de gros'],
  D1116: [COM, 'Négociant en bétail'],
  D1202: [COI, 'Coiffure'],
  D1208: [COI, 'Soins esthétiques'],
  I1401: [INFO, 'Maintenance informatique et bureautique'],
  I1212: [IND, 'Opérateur de maintenance industrielle (le reste de l’entretien technique va en bâtiment)'],
  G1405: [SPO, 'Directeur de structure sportive'],
  G1406: [SPO, 'Directeur d’équipement sportif']
};

const fiches = lireCsv('unix_referentiel_code_rome_v462_utf8.csv');
const liens = lireCsv('unix_cr_gd_dp_v462_utf8.csv');
const appellations = lireCsv('unix_referentiel_appellation_v462_utf8.csv');
const versionTxt = fs.readFileSync(path.join(dossierSource, 'version.txt'), 'utf8');
const numeroVersion = (versionTxt.match(/Numero de version\s*:\s*(\d+)/) || [])[1] || '?';
const datePublication = (versionTxt.match(/Date de publication\s*:\s*([\d/]+)/) || [])[1] || '?';

const dpDeFiche = {};
const libelleDp = {};
liens.forEach(function (l) { dpDeFiche[l.code_rome] = l.code_domaine_professionel; libelleDp[l.code_domaine_professionel] = l.libelle_domaine_professionel; });

function domaineDe(codeRome) {
  if (EXCEPTIONS[codeRome]) { return EXCEPTIONS[codeRome][0]; }
  const dp = dpDeFiche[codeRome];
  if (!(dp in PAR_DOMAINE_PRO)) { throw new Error('Domaine professionnel non rangé : ' + dp + ' (fiche ' + codeRome + ')'); }
  return PAR_DOMAINE_PRO[dp];
}

if (seulementTable) {
  const compte = {};
  fiches.forEach(function (f) { const d = domaineDe(f.code_rome); compte[d] = (compte[d] || 0) + 1; });
  const nbParDp = {};
  fiches.forEach(function (f) { const dp = dpDeFiche[f.code_rome]; nbParDp[dp] = (nbParDp[dp] || 0) + 1; });
  let md = '# Correspondance entre les domaines du ROME et les 21 domaines de l’application\n\n';
  md += 'Table à relire et valider par Denis avant de brancher le répertoire élargi. Source : ROME 4.0 version ' + numeroVersion + ' (' + datePublication + '), France Travail, Licence Ouverte. ';
  md += 'Le ROME compte 14 grands domaines, ' + Object.keys(libelleDp).length + ' domaines professionnels et ' + fiches.length + ' fiches métier. Chaque domaine professionnel est rangé dans l’un de nos 21 domaines ; ';
  md += 'quelques fiches font exception (tableau final).\n\n';
  DOMAINES.forEach(function (nom, idx) {
    md += '## ' + nom + ' (' + (compte[idx] || 0) + ' fiches)\n\n';
    Object.keys(PAR_DOMAINE_PRO).filter(function (dp) { return PAR_DOMAINE_PRO[dp] === idx; }).sort().forEach(function (dp) {
      md += '- ' + dp + ' ' + libelleDp[dp] + ' (' + nbParDp[dp] + ' fiches)\n';
    });
    Object.keys(EXCEPTIONS).filter(function (c) { return EXCEPTIONS[c][0] === idx; }).forEach(function (c) {
      const f = fiches.filter(function (x) { return x.code_rome === c; })[0];
      md += '- Exception : fiche ' + c + ' ' + (f ? f.libelle_rome : '') + ' (rangée sinon dans ' + dpDeFiche[c] + ')\n';
    });
    md += '\n';
  });
  const sortie = path.join(__dirname, '..', 'docs', 'CORRESPONDANCE_ROME_21_DOMAINES.md');
  fs.writeFileSync(sortie, md);
  console.log('Table écrite : ' + sortie);
  console.log(DOMAINES.map(function (n, i) { return (compte[i] || 0) + ' ' + n; }).join('\n'));
  process.exit(0);
}

// Forme d'affichage : le ROME écrit « Boucher / Bouchère » ou « Abatteur / Abatteuse de carrière ». Comme dans notre base de métiers
// (« Conseiller de vente »), on garde la forme masculine suivie de la fin de l'intitulé : « Boucher », « Abatteur de carrière ».
// La fin de l'intitulé = les mots de la partie féminine au-delà du nombre de mots de la partie masculine.
function formeMasculine(nom) {
  const parties = nom.split(' / ');
  if (parties.length !== 2) { return nom; }
  const mots1 = parties[0].trim().split(/\s+/);
  const mots2 = parties[1].trim().split(/\s+/);
  const fin = mots2.slice(mots1.length);
  return (mots1.join(' ') + (fin.length ? ' ' + fin.join(' ') : '')).trim();
}

// Données : une ligne par appellation (hors appellations « peu usitées »), avec le code ROME de la fiche et l'indice du domaine.
// Nettoyage de l'affichage (contrôle de qualité du 04/11/2026, rien d'inventé) :
//  1. initiale « E » sans accent (« Educateur », « Etat ») corrigée en « É » quand la forme accentuée existe ailleurs dans le ROME ;
//  2. formes « principal(e) », « Diplômé(e) » ramenées à la forme simple ;
//  3. « Tubiste tubiste » (doublon du ROME) ramené à « Tubiste » ;
//  4. « X - précision » et « X -SIGLE- » écrits « X (précision) » et « X (SIGLE) », pour une présentation unique sans tiret.
const motsAccentues = {};
appellations.forEach(function (a) {
  (a.libelle_appellation_long.match(/[ÉéÈè][A-Za-zÀ-ÿ]+/g) || []).forEach(function (w) { motsAccentues[w.toLowerCase()] = true; });
});
// Mots du ROME écrits sans accent sur la majuscule initiale alors que la langue en demande un (liste relue mot à mot, 04/11/2026).
const INITIALES_A_ACCENTUER = ['Ebarbeur', 'Eboueur', 'Ecailler', 'Ecailleur', 'Echantillonneur', 'Echarneur', 'Echassier', 'Echiniculteur', 'Econome', 'Economètre',
  'Ecotoxicologue', 'Ecoutant', 'Ecuyer', 'Ehouppeur', 'Electro', 'Electrobobinier', 'Electroplaste', 'Emailleur', 'Emissaire', 'Energéticien', 'Epicier',
  'Epidémiologiste', 'Epigraphiste', 'Epithésiste', 'Eplucheur', 'Equilibriste', 'Equipementier', 'Equipier', 'Erodeur', 'Etainier', 'Etalonnier', 'Etameur',
  'Etampeur', 'Etancheur', 'Etinceleur', 'Etiqueteur', 'Etirageur', 'Eventailliste', 'Eviscérateur'];
function nettoyer(nom) {
  nom = nom.replace(/(^|[\s'’(\-])E([a-zà-ÿ]+)/g, function (tout, avant, reste) {
    return (motsAccentues['é' + reste] || INITIALES_A_ACCENTUER.indexOf('E' + reste) !== -1) ? avant + 'É' + reste : tout;
  });
  nom = nom.replace(/\((e|se|ne|ère)\)/g, '');
  nom = nom.replace(/^(\S+) \1$/i, '$1');
  nom = nom.replace(/ -([A-Z]{2,8})-/g, ' ($1)');
  if (nom.split(' - ').length === 2 && nom.indexOf('(') === -1) { nom = nom.replace(' - ', ' (') + ')'; }
  return nom.replace(/\s{2,}/g, ' ').trim();
}

const lignes = [];
const vus = {};
// Les appellations principales (celles qui portent le nom de la fiche) passent avant les synonymes : si deux fiches partagent un même intitulé,
// c'est la fiche qui porte ce nom qui le garde.
appellations.slice().sort(function (x, y) { return (x.classification === 'PRINCIPALE' ? 0 : 1) - (y.classification === 'PRINCIPALE' ? 0 : 1); }).forEach(function (a) {
  if (a.peu_usite === 'O') { return; }
  const nom = nettoyer(formeMasculine(a.libelle_appellation_long.trim()));
  // Même intitulé à l'accent près (le ROME écrit parfois « d'eleves » et « d'élèves ») : on garde la version la mieux accentuée.
  const cle = nom.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const accents = (nom.match(/[^\x00-\x7F]/g) || []).length;
  if (vus[cle]) {
    const existant = vus[cle];
    if (accents > existant.accents) { existant.ligne[0] = nom; existant.accents = accents; }
    return;
  }
  const ligne = [nom, a.code_rome, domaineDe(a.code_rome)];
  vus[cle] = { ligne: ligne, accents: accents };
  lignes.push(ligne);
});
lignes.sort(function (x, y) { return x[0].localeCompare(y[0], 'fr'); });

const entete = '// Répertoire élargi des métiers (appellations du ROME 4.0, version ' + numeroVersion + ', publiée le ' + datePublication + ').\n' +
  '// Source : France Travail, « Répertoire Opérationnel des Métiers et des Emplois (ROME) », données ouvertes, Licence Ouverte (Etalab).\n' +
  '// Fichier GÉNÉRÉ par scripts/construireRepertoireRome.js : ne pas modifier à la main. Chaque ligne : [intitulé, code ROME, indice du domaine].\n' +
  '// Les indices renvoient à la liste « domaines » (les 21 domaines de l’application, identiques à data/competencesSecteurs.js).\n';
const corps = 'var REPERTOIRE_ROME = {\n  version: ' + JSON.stringify('ROME 4.0 version ' + numeroVersion + ' du ' + datePublication) + ',\n  domaines: ' + JSON.stringify(DOMAINES) + ',\n  metiers: [\n' +
  lignes.map(function (l) { return '    ' + JSON.stringify(l); }).join(',\n') + '\n  ]\n};\n';
fs.writeFileSync(path.join(__dirname, '..', 'data', 'repertoireRome.js'), entete + corps);
console.log(lignes.length + ' appellations écrites.');
