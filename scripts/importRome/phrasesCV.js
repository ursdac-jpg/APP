'use strict';
/* ============================================================
   scripts/importRome/phrasesCV.js
   Phrases prêtes à cocher pour le CV (consigne 285, 14/11/2026) : les missions du ROME sont écrites à la troisième personne
   (« Assure l'accueil… ») ; sur un CV elles s'écrivent à l'infinitif (« Assurer l'accueil… »).
   Méthode « règles + correction + test » : (1) conversion automatique, (2) détecteur de phrases suspectes, (3) phrases réécrites à la main
   dans scripts/importRome/phrasesCorrigees.json (clé = phrase d'origine du ROME, valeur = phrase finale, ou liste de phrases quand une phrase
   trop longue est coupée), (4) test du dépôt (tests/phrasesCV.test.js). Une correction manuelle l'emporte toujours sur la conversion automatique.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const FICHIER_CORRECTIONS = path.join(__dirname, 'phrasesCorrigees.json');

// Verbes irréguliers (3e personne du singulier -> infinitif). Les verbes réguliers en « -e » prennent « r » (assure -> assurer).
const IRR = { 'conçoit':'concevoir','maintient':'maintenir','met':'mettre','mets':'mettre','suit':'suivre','définit':'définir','intervient':'intervenir','garantit':'garantir','est':'être','conduit':'conduire','entretient':'entretenir','fournit':'fournir','choisit':'choisir','répond':'répondre','prescrit':'prescrire','promeut':'promouvoir','prend':'prendre','résout':'résoudre','fait':'faire','vend':'vendre','etablit':'établir','établit':'établir','interagit':'interagir','construit':'construire','transmet':'transmettre','connait':'connaître','connaît':'connaître','soutient':'soutenir','remet':'remettre','produit':'produire','traduit':'traduire','réagit':'réagir','prévient':'prévenir','abat':'abattre','nourrit':'nourrir','répartit':'répartir','tient':'tenir','agit':'agir','lit':'lire','rend':'rendre','concourt':'concourir','écrit':'écrire','enrichit':'enrichir','sertit':'sertir','instruit':'instruire','parcourt':'parcourir','refroidit':'refroidir','réécrit':'réécrire','saisit':'saisir','sait':'savoir','sert':'servir','comprend':'comprendre','permet':'permettre','secourt':'secourir','coconstruit':'coconstruire','co-construit':'co-construire','revend':'revendre','conclut':'conclure','prévoit':'prévoir','vient':'venir','fend':'fendre','offre':'offrir','ouvre':'ouvrir','couvre':'couvrir','souffre':'souffrir','découvre':'découvrir','recouvre':'recouvrir','emploie':'employer','envoie':'envoyer','nettoie':'nettoyer','essuie':'essuyer','appuie':'appuyer','paie':'payer','vérifie':'vérifier','apprend':'apprendre','dit':'dire','peint':'peindre','joint':'joindre','atteint':'atteindre','défend':'défendre','entend':'entendre','attend':'attendre','étend':'étendre','surprend':'surprendre','reprend':'reprendre','soumet':'soumettre','promet':'promettre','commet':'commettre','accueille':'accueillir','cueille':'cueillir','recueille':'recueillir','détient':'détenir','obtient':'obtenir','retient':'retenir','contient':'contenir','revient':'revenir','devient':'devenir','parvient':'parvenir','convient':'convenir','cuit':'cuire','bat':'battre','combat':'combattre','perd':'perdre','tend':'tendre','descend':'descendre','suspend':'suspendre','plaît':'plaire','suffit':'suffire','exclut':'exclure','inclut':'inclure','réduit':'réduire','déduit':'déduire','introduit':'introduire','détruit':'détruire','reconstruit':'reconstruire','poursuit':'poursuivre','rejoint':'rejoindre','revoit':'revoir','voit':'voir','reçoit':'recevoir','perçoit':'percevoir','aperçoit':'apercevoir','élit':'élire','relit':'relire','déploie':'déployer','broie':'broyer','balaie':'balayer','essaie':'essayer','renvoie':'renvoyer','convoie':'convoyer','ennuie':'ennuyer','relaie':'relayer','etre':'être' };
const E_GRAVE = new Set(['lève','mène','amène','achète','pèse','promène','soulève','emmène','ramène','enlève','gèle','modèle','harcèle','relève','prélève','surélève','sème','crève','achève','élève']);
const DOUBLE = { 'appelle':'appeler','rappelle':'rappeler','renouvelle':'renouveler','jette':'jeter','projette':'projeter','étiquette':'étiqueter','épelle':'épeler','interpelle':'interpeller' };
// Mots qui ne sont pas des verbes conjugués en tête de phrase : la phrase est laissée à la correction manuelle.
const PAS_UN_VERBE = new Set(['il','elle','en','selon','garant','après','l','a','peur','bien','lors','contrairement','par','pour','sous','ses','réparation','dans','la','le','les','ou','avec','s','se','peut','doit','est','au','aux','du','des','un','une','ce','cette','sur','sans','dès','durant','pendant','tout','toute','tous','chez','entre','vers','afin','ainsi','lorsque','quand','si','comme','dont','où','que','qui','mais','car','donc','or','ni','et','de','d']);
// Noms qui ouvrent des phrases (« Mise en œuvre de… ») : jamais pris pour des verbes
const NOMS_SURS = new Set(['mise','expertise','soutien','appui','gestion','conduite','suivi','réparation','vente','achat','étude','mission','activité','responsable','fonction','action','vérification','réalisation','participation','accueil','démontage','montage']);
const ADVERBES_TETE = /^(également|aussi|souvent|parfois|généralement|ensuite|enfin|régulièrement|ponctuellement|éventuellement|notamment)\s+/i;
const TETE_A_SUPPRIMER = /^(est|peut-être|peut être|peut aussi être|doit être|peut également être|est également|est aussi)\s+(amené|amenée|amenés|amenées)\s+à\s+/i;
const SEUIL_LONG = 200;
const FORME_INFINITIF = /(er|ir|re|oir|ître|uire)$/;
// Mots qui, juste après un verbe, annoncent un complément : signe sûr que le mot d'avant est bien un verbe (« et contrôle les travaux »)
const SIGNAL_VERBE = /^(ces|cet|toute|tout|plusieurs|différents|différentes|nos|vos|mes|tes|les|le|la|l’|des|du|de|d’|un|une|à|au|aux|en|que|qu’|ses|son|sa|leur|leurs|ce|cette|chaque|tous|toutes|par|pour|sur|dans|avec|selon|auprès|afin|y|lui)$/;
const DETERMINANTS = /^(et|ou|puis|le|la|les|l’|un|une|des|du|de|d’|au|aux|son|sa|ses|leur|leurs|ce|cette|ces|en|à|dans|sur|avec|pour|par|sans|y|me|se|s’|lui)$/;
const SUFFIXES_NOMS = /(age|ages|tion|tions|ment|ments|ité|ités|isme)$/;   // « assure », « mesure », « influence » sont des verbes : « ure », « ance », « ence » ne sont pas listés

let CONNUS = new Set();       // formes verbales à la 3e personne connues (premiers mots des missions)
let INF_VOCAB = new Set();    // infinitifs connus (premiers mots des activités du ROME et des missions)
let TEXTE = '';
const _homographes = new Map();

// Terminaisons qu'aucun verbe français n'a : « inscrire » + « r » = « inscrirer » (le mot était déjà un infinitif)
const IMPOSSIBLES = /(ttrer|îtrer|uirer|crirer|aincrer|oudrer)$/;
function infinitifDe(bas) {
  if (IRR[bas]) { return IRR[bas]; }
  if (DOUBLE[bas]) { return DOUBLE[bas]; }
  if (/e$/.test(bas)) {
    let inf;
    if (E_GRAVE.has(bas)) { inf = bas.replace(/è/, 'e') + 'r'; }
    else { inf = bas.replace(/è([^aeiouyàâéèêëîïôûù]+)e$/, 'é$1e') + 'r'; }
    return IMPOSSIBLES.test(inf) ? null : inf;
  }
  return null;
}

const INF_IRREGULIERS = new Set(Object.values(IRR).concat(Object.values(DOUBLE)).concat(['rejoindre','éteindre','craindre','contraindre','restreindre','boire','croire','suffire','plaire','taire','paraître','apparaître','disparaître','naître','admettre','omettre','émettre','détruire','cuire','réduire','séduire','induire','introduire','déduire','reconstruire','nuire','battre','combattre','débattre','perdre','répandre','tendre','descendre','suspendre','fondre','tondre','coudre','moudre','prévoir','revoir','voir','vivre','suivre','poursuivre','courir','mourir','ouvrir','offrir','recevoir','devoir','pouvoir','vouloir','falloir','valoir','asseoir','faire','refaire','satisfaire','dire','redire','interdire','prédire','contredire','éteindre','teindre','feindre','plaindre','joindre','enfreindre','étreindre']));
// Un mot est un infinitif s'il finit par « er », « ir », « oir », ou s'il est un infinitif connu en « re » (« mettre », « prendre ») : « assure », « prépare » finissent par « re » mais sont conjugués.
function estInfinitif(mot) { return /(er|ir|oir)$/.test(mot) || INF_VOCAB.has(mot) || INF_IRREGULIERS.has(mot); }

function preparer(missions, activites) {
  const premiers = new Map();
  missions.forEach((m) => { const mot = String(m).split(/[ ’',]/)[0].toLowerCase(); premiers.set(mot, (premiers.get(mot) || 0) + 1); });
  PAS_UN_VERBE.forEach((x) => premiers.delete(x));
  Array.from(premiers.keys()).forEach((mot) => { if (NOMS_SURS.has(mot) || SUFFIXES_NOMS.test(mot)) { premiers.delete(mot); } });
  CONNUS = new Set(premiers.keys());
  INF_VOCAB = new Set();
  // Les activités du ROME sont à l'infinitif : leurs verbes en « -re » (« inscrire », « convaincre », « reproduire ») sont aussi des infinitifs,
  // sauf s'ils servent de verbe conjugué en tête de mission (« montre », « rencontre »).
  (activites || []).forEach((a) => {
    const mot = accentuerTete(String(a).trim()).split(/[ ’',]/)[0].toLowerCase();   // mêmes accents que les activités originales ou déjà remises en forme
    if (/(er|ir|oir)$/.test(mot)) { INF_VOCAB.add(mot); }
    else if (/(ire|ître|uire|crire|aincre|clure|soudre|ivre|aire|oire|indre|oudre|ndre|ttre)$/.test(mot) && !CONNUS.has(mot)) { INF_VOCAB.add(mot); }
  });
  CONNUS.forEach((mot) => { const inf = infinitifDe(mot); if (inf) { INF_VOCAB.add(inf); } });
  TEXTE = missions.join('\n').toLowerCase();
  _homographes.clear();
}

// Un mot est « homographe » quand il sert aussi de nom (« le contrôle », « une analyse ») : sa conversion au milieu d'une phrase demande un signe sûr.
function estHomographe(mot) {
  if (!_homographes.has(mot)) {
    const re = new RegExp('(^|[ ’\'])((?:le|la|les|un|une|du|des|au|aux|son|sa|ses|leur|leurs|ce|cette|de) |d’|l’)' + mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([ ,.;:)]|$)');
    _homographes.set(mot, re.test(TEXTE));
  }
  return _homographes.get(mot);
}

// Le mot est-il une forme conjuguée d'un verbe connu (3e personne) ?
function estVerbe(mot) {
  if (NOMS_SURS.has(mot) || SUFFIXES_NOMS.test(mot)) { return false; }
  if (estInfinitif(mot)) { return false; }   // déjà un infinitif
  const inf = infinitifDe(mot);
  // Une forme irrégulière de la liste IRR (« peint », « rend », « soumet ») est un verbe même si aucune mission ne commence par elle (« est » est trop courant pour être signalé)
  return !!(inf && FORME_INFINITIF.test(inf) && (CONNUS.has(mot) || INF_VOCAB.has(inf) || (IRR[mot] && mot !== 'est')));
}
// Phrase relue et corrigée à la main (clé = phrase d'origine du ROME)
function estCorrigee(origine) { return Object.prototype.hasOwnProperty.call(corrections(), String(origine)); }

const FORMES_ACCENT = [[/^Elabor/, 'Élabor'], [/^Etabl/, 'Établ'], [/^Evalu/, 'Évalu'], [/^Eclair/, 'Éclair'], [/^Elimin/, 'Élimin'], [/^Etudi/, 'Étudi'], [/^Echang/, 'Échang'], [/^Equip/, 'Équip'], [/^Ecout/, 'Écout'], [/^Edit/, 'Édit']];
// Orthographe : le ROME écrit « oeuvre », « maitriser », « entrainer », « chaine » (sans œ ni accent circonflexe). Appliquée à toute phrase finale.
const ORTHO = [
  [/oe(?=uvr|il|uf|ud|ur\b|nolog|tal)/g, 'œ'], [/Oe(?=uvr|il|uf|ud|ur\b|nolog|tal)/g, 'Œ'],
  [/([Mm])aitr/g, '$1aîtr'], [/([Ee]ntra)in(?=er|é|ement|eur|e\b|ant)/g, '$1în'], [/([Cc]onna)it(?=re|\b)/g, '$1ît'],
  [/\b([Cc])haines?\b/g, (t, c) => c + 'haîne' + (/s$/.test(t) ? 's' : '')], [/\b([Bb])oites?\b/g, (t, b) => b + 'oîte' + (/s$/.test(t) ? 's' : '')],
  [/\bcouts?\b/g, (t) => 'coût' + (/s$/.test(t) ? 's' : '')], [/\baigüe/g, 'aiguë'], [/\b(i)lots?\b/gi, (t) => (/^I/.test(t) ? 'Î' : 'î') + 'lot' + (/s$/.test(t) ? 's' : '')],
  [/\s*,?\s*etc\.{2,}/g, ', etc.'], [/\s*,?\s*\.\.\.(?=\)|$)/g, ', etc.'],   // « (lande, marais, ...) » -> « (lande, marais, etc.) » ; les « ... » au milieu d'une phrase sont corrigés à la main
  [/\s+,/g, ','], [/,\s*\.{1,2}$/, ', etc.'], [/([a-zà-ÿ])\.\.(?=\)|$)/g, '$1'], [/(^|[^.])\betc$/, '$1etc.'], [/,$/, ''],   // « (…) , suite » ; « couture, . » ; « internes.. » ; « etc » ; virgule finale
  [/\boral et a l’écrit/g, 'oral et à l’écrit'], [/\bEcout/g, 'Écout'], [/\becout/g, 'écout']
];
function orthographe(s) {
  let t = String(s);
  ORTHO.forEach((r) => { t = t.replace(r[0], r[1]); });
  t = t.replace(/,\s*\.{2}\)/g, ', etc.)');
  // Parenthèse ouverte jamais refermée (texte tronqué par le ROME) : elle est refermée en fin de phrase
  const ouvertes = (t.match(/\(/g) || []).length - (t.match(/\)/g) || []).length;
  if (ouvertes > 0) { t += ')'.repeat(ouvertes); }
  return t;
}
function accentuer(s) { for (let i = 0; i < FORMES_ACCENT.length; i++) { if (FORMES_ACCENT[i][0].test(s)) { return s.replace(FORMES_ACCENT[i][0], FORMES_ACCENT[i][1]); } } return s; }
function majuscule(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// Verbes coordonnés (« et », « puis », « , », « ou »), avec ou sans pronom (« et en assure le suivi » -> « et en assurer le suivi »), hors parenthèses.
// Un mot à la fois nom et verbe n'est converti que si le mot suivant annonce un complément (« et contrôle les travaux »).
function convertirHorsParentheses(s) {
  // Le mot suivant est lu par anticipation (sans être consommé) : il peut être lui-même un séparateur (« … et assure … »)
  return s.replace(/(, et |, ou | et | puis |, | ou )((?:en |y |se |s’|lui |les |le |la |l’)?)([a-zà-ÿœ’-]+)(?=( ?)([a-zà-ÿœ]*’?))/g, (tout, sep, pron, mot, esp, suivant) => {
    if (!estVerbe(mot)) { return tout; }
    if (/^(le |la |l’)$/.test(pron) && estHomographe(mot)) { return tout; }   // « et le contrôle » : nom ; « et les contrôle » : verbe (« les » + forme singulière)
    if (estHomographe(mot) && !pron && !SIGNAL_VERBE.test(suivant)) { return tout; }
    return sep + pron + infinitifDe(mot);
  });
}
// Suite de verbes qui suit immédiatement le premier infinitif (« Accueille, informe, conseille et oriente… ») : tous sont des verbes, connus ou non.
const NON_VERBES_CHAINE = new Set(['les','des','ses','une','ces','aux','leur','leurs','plus','sans','sous','dont','avec','pour','dans','chez','vers','tout','toute','tous','très','bien','mieux','alors']);
function convertirChaine(reste) {
  const m = reste.match(/^((?:, [a-zà-ÿœ’-]+)*)( (?:et|ou) )([a-zà-ÿœ’-]+)/);
  if (!m) { return reste; }
  const mots = (m[1] ? m[1].slice(2).split(', ') : []).concat([m[3]]);
  const conv = mots.map((w) => {
    if (NON_VERBES_CHAINE.has(w) || w.length < 4 || estInfinitif(w) || NOMS_SURS.has(w) || SUFFIXES_NOMS.test(w)) { return null; }
    const inf = infinitifDe(w);
    return inf && FORME_INFINITIF.test(inf) ? inf : null;
  });
  if (conv.some((x, i) => x === null && !estInfinitif(mots[i]))) { return reste; }   // un mot n'est pas un verbe : rien n'est touché
  const tout = mots.map((w, i) => conv[i] || w);
  const virgules = m[1] ? ', ' + tout.slice(0, -1).join(', ') : '';
  return virgules + m[2] + tout[tout.length - 1] + reste.slice(m[0].length);
}
function convertirSuivants(s) {
  // Les parenthèses sont laissées telles quelles
  return s.split(/(\([^)]*\))/).map((morceau, i) => (i % 2 === 1 ? morceau : convertirHorsParentheses(morceau))).join('');
}

// Conversion automatique seule (sans les corrections manuelles). Renvoie { texte, ok } : ok = faux quand la phrase n'a pas pu être convertie.
function convertir(origine) {
  let t = String(origine).trim().replace(/\s+/g, ' ');
  t = t.replace(/\.$/, '');
  t = t.replace(ADVERBES_TETE, '').replace(/^(il|elle) (?=[a-zà-ÿ])/i, '');
  const amene = t.match(TETE_A_SUPPRIMER);
  if (amene) { return { texte: convertirSuivants(majuscule(t.slice(amene[0].length))), ok: true }; }
  let pre = '';
  const r = t.match(/^(S|Se|s|se)(?:’|'|\s)(.*)$/);
  if (r) { pre = /’|'/.test(t.charAt(r[1].length)) ? 'S’' : 'Se '; t = r[2]; }
  const mm = t.match(/^([A-Za-zÀ-ÿœŒ’-]+)(.*)$/);
  if (!mm) { return { texte: t, ok: false }; }
  const mot = mm[1], reste = mm[2], bas = mot.toLowerCase();
  if (bas === 'peut' || bas === 'doit') {
    const s = reste.trim();
    if (!s) { return { texte: t, ok: false }; }
    return { texte: convertirSuivants(pre + majuscule(s)), ok: true };
  }
  // Déjà un infinitif (« Faire », « Suivre », « Mettre ») : laissé tel quel, sinon un « r » lui serait ajouté
  let inf = (estInfinitif(bas) && !PAS_UN_VERBE.has(bas)) ? bas : infinitifDe(bas);
  if (!inf || !FORME_INFINITIF.test(inf) || PAS_UN_VERBE.has(bas)) { return { texte: pre + t, ok: false }; }
  const tete = pre ? pre + inf : accentuer(majuscule(inf));
  return { texte: convertirSuivants(tete + convertirChaine(reste)), ok: true };
}

// Corrections écrites à la main
let _corrections = null;
function corrections() {
  if (!_corrections) { try { _corrections = JSON.parse(fs.readFileSync(FICHIER_CORRECTIONS, 'utf8')); } catch (e) { _corrections = {}; } }
  return _corrections;
}
// Renvoie TOUJOURS une liste de phrases (une seule en général ; une correction manuelle peut couper une phrase trop longue en deux).
function phrasesCV(origine) {
  const c = corrections()[String(origine)];
  if (typeof c === 'string' && c) { return [orthographe(c)]; }
  if (Array.isArray(c)) { return c.map(orthographe); }   // liste vide : la phrase n'est pas une mission à cocher (« Se spécialiser dans… »)
  return [orthographe(convertir(origine).texte)];
}
function phraseCV(origine) { return phrasesCV(origine)[0] || ''; }
function rechargerCorrections() { _corrections = null; }


// ---- Activités détaillées (champ k des fiches) : déjà à l'infinitif à 99,9 %, mais le ROME oublie parfois l'accent des majuscules (« Etre » -> « Être »)
// ou écrit une phrase à la 3e personne ou sans verbe. Remplacement un pour un (jamais de coupure : la liste k garde son nombre de « cœur de métier »).
const ACCENTS_TETE = { 'Etre':'Être','Etablir':'Établir','Evaluer':'Évaluer','Eviter':'Éviter','Emettre':'Émettre','Ecrire':'Écrire','Ecouter':'Écouter','Echanger':'Échanger','Elaborer':'Élaborer','Eliminer':'Éliminer','Eclairer':'Éclairer','Editer':'Éditer','Etudier':'Étudier','Equilibrer':'Équilibrer','Evacuer':'Évacuer','Etendre':'Étendre','Elargir':'Élargir','Eduquer':'Éduquer','Executer':'Exécuter','Economiser':'Économiser','Ecarter':'Écarter','Echantillonner':'Échantillonner','Egaliser':'Égaliser','Elever':'Élever','Emettre':'Émettre','Ebavurer':'Ébavurer','Eplucher':'Éplucher','Equiper':'Équiper','Evaluer':'Évaluer','Connaitre':'Connaître','Apparaitre':'Apparaître','Reconnaitre':'Reconnaître','Paraitre':'Paraître','Etayer':'Étayer','Etaler':'Étaler','Eprouver':'Éprouver','Epauler':'Épauler','Etanchéifier':'Étanchéifier','Eco-concevoir':'Éco-concevoir','Entrainer':'Entraîner','Procèder':'Procéder','Célèbrer':'Célébrer' };
function accentuerTete(s) {
  const m = String(s).match(/^([A-Za-zÀ-ÿ]+)(.*)$/s);
  if (!m) { return s; }
  return (ACCENTS_TETE[m[1]] || m[1]) + m[2];
}
function phraseActivite(libelle) {
  const c = corrections()[String(libelle)];
  if (typeof c === 'string' && c) { return orthographe(c); }
  const t = accentuerTete(String(libelle).trim());
  const premier = (t.match(/^(?:S’|Se )?([A-Za-zÀ-ÿœŒ’-]+)/) || [])[1] || '';
  // Déjà à l'infinitif : laissé tel quel (les rares verbes restés conjugués au milieu d'une activité sont corrigés à la main dans phrasesCorrigees.json,
  // une conversion automatique en milieu de phrase transformait des adjectifs en verbes : « individuelle » -> « individueller »)
  if (estInfinitif(premier.toLowerCase()) && /^[A-ZÀ-Ý]/.test(t)) { return orthographe(t); }
  const r = convertir(t);
  return orthographe(r.ok ? r.texte : t);
}
// « il » ou « elle » comme mot entier (« réelles » n'en est pas un), hors les emplois qui restent corrects dans une phrase à l'infinitif :
// « s’il y a », « qu’il est », « qu’elles fonctionnent », « entre elles », « d’elles », « où il existe »
const PRONOM_SUJET_BRUT = /(?<![a-zà-ÿœ’'])(il|elle|ils|elles)(?![a-zà-ÿœ])/i;
const PRONOM_SUJET = { test: (t) => PRONOM_SUJET_BRUT.test(String(t).replace(/entre elles|où il existe|(?:lequel|laquelle|lesquels|lesquelles|dont) (?:il|elle|ils|elles) /gi, ' ')) };

function raisonsActivite(finale) {
  const t = String(finale);
  const r = [];
  const premier = (t.match(/^(?:S’|Se )?([A-Za-zÀ-ÿœŒ’-]+)/) || [])[1] || '';
  if (!(estInfinitif(premier.toLowerCase()) && /^[A-ZÀ-Ý]/.test(t)) || PAS_UN_VERBE.has(premier.toLowerCase())) { r.push('ne commence pas par un infinitif'); }
  if (PRONOM_SUJET.test(t)) { r.push('contient il ou elle'); }
  if (/[—–]/.test(t)) { r.push('tiret long'); }
  if (t.length > 260) { r.push('trop longue (' + t.length + ' caractères)'); }
  controlesCommuns(t, r);
  return r;
}

// ---- Une fiche du ROME enrichie pour le CV : mi = missions à l'infinitif (phrases cochables, sans doublon) ; k = activités remises en forme.
// Appelée par le générateur (genererMetiersRome.js) ET par ajouterPhrasesCV.js (qui applique la même chose aux fichiers déjà produits).
function enrichirFiche(e) {
  if (Array.isArray(e.m)) {
    const vu = new Set();
    e.mi = [];
    e.m.forEach((o) => { phrasesCV(o).forEach((ph) => { if (ph && !vu.has(ph)) { vu.add(ph); e.mi.push(ph); } }); });
    if (!e.mi.length) { delete e.mi; }
  }
  if (Array.isArray(e.k)) { e.k = e.k.map((g) => [g[0], g[1], g[2].map(phraseActivite)]); }
  return e;
}

// « … et peut former des apprentis », « … et a le souci de… », « …, et est garant de… » : un verbe conjugué au milieu d'une phrase à l'infinitif
const VERBE_CONJUGUE_APRES_ET = /(?:^|[ ,])(?:et|ou|puis) (?:est|a|sont|peut|doit|fait|va|assure|gère|prend|met|dispose|veille)(?![a-zà-ÿœ’-])/;

// Contrôles communs aux missions et aux activités (verbe conjugué au milieu, orthographe ancienne, points de suspension, espaces dans les parenthèses)
// « leur » ou « leurs » doit renvoyer à quelque chose qui est dans la même phrase (au pluriel ou un nom collectif) : « Vérifier leur disponibilité » seule ne dit pas de quoi on parle
function leurSansAntecedent(t) {
  const m = String(t).match(/(?<![a-zà-ÿœ])leurs?(?![a-zà-ÿœ])/i);
  if (!m) { return false; }
  const avant = String(t).slice(0, m.index);
  return !/(?<![a-zà-ÿœ])(les|des|aux|ses|ces|plusieurs|personnel|équipe|clientèle|public|famille|entourage|usagers?|[a-zà-ÿœ]{4,}[sx])(?![a-zà-ÿœ])/i.test(avant);
}
// Un statut ou une évolution possible n'est pas une mission : « Se spécialiser dans… », « Être spécialisé dans… », « Être spécialiste de… »
const INTENTION_OU_STATUT = /^(?:Se |S’)spécialis|^Être spécialis/;

function controlesCommuns(t, r) {
  if (leurSansAntecedent(t)) { r.push('leur sans antécédent dans la phrase'); }
  if (INTENTION_OU_STATUT.test(t)) { r.push('statut ou évolution possible, pas une mission'); }
  if (VERBE_CONJUGUE_APRES_ET.test(t)) { r.push('verbe conjugué après « et » ou une virgule'); }
  if (/(^|[^a-zà-ÿœ])(oeuvre|maitris|entrain(er|eur|ement)|coeur|connait)/i.test(t)) { r.push('orthographe ancienne'); }
  if (/\.\.\./.test(t)) { r.push('points de suspension'); }
  if (/\( | \)/.test(t)) { r.push('espace dans la parenthèse'); }
  if ((t.match(/\(/g) || []).length !== (t.match(/\)/g) || []).length) { r.push('parenthèse non fermée'); }
  if (/\s,|(^|[^.])\.\.([^.]|$)|,$|(?<!etc)\.$/.test(t)) { r.push('ponctuation à corriger'); }
}

// Détecteur : liste des raisons pour lesquelles une phrase finale est suspecte (liste vide = acceptée).
function raisons(finale) {
  const t = String(finale);
  const r = [];
  const premier = (t.match(/^(?:S’|Se )?([A-Za-zÀ-ÿœŒ’-]+)/) || [])[1] || '';
  const bas = premier.toLowerCase();
  if (!(estInfinitif(bas) && /^[A-ZÀ-Ý]/.test(t)) || PAS_UN_VERBE.has(bas)) { r.push('ne commence pas par un infinitif'); }
  if (PRONOM_SUJET.test(t)) { r.push('contient il ou elle'); }
  // Verbe resté conjugué après une coordination, hors parenthèses ; dans une parenthèse, tout verbe conjugué est signalé
  t.split(/(\([^)]*\))/).forEach((morceau, i) => {
    if (i % 2 === 1) {
      (morceau.slice(1, -1).match(/[a-zà-ÿœ’-]+/g) || []).forEach((w) => { if (estVerbe(w) && !estHomographe(w)) { r.push('verbe conjugué dans une parenthèse : ' + w); } });
      return;
    }
    const re = /(?: et | puis |, | ou )(?:en |y |se |s’|lui |les |le |la |l’)?([a-zà-ÿœ’-]+)/g;
    let m;
    while ((m = re.exec(morceau)) !== null) {
      if (estVerbe(m[1])) { r.push((estHomographe(m[1]) ? 'verbe ou nom à vérifier : ' : 'verbe resté conjugué : ') + m[1]); }
    }
  });
  if (/ (le|la|l’|un|une) (professionnel|professionnelle|salarié|salariée|opérateur|opératrice|technicien|technicienne|agent|conducteur|conductrice|artisan|jardinier) /i.test(t)) { r.push('sujet à la 3e personne dans la phrase'); }
  if (/[:;]$/.test(t)) { r.push('finit par deux-points'); }
  controlesCommuns(t, r);
  if (t.length > SEUIL_LONG) { r.push('trop longue (' + t.length + ' caractères)'); }
  if (t.length < 12) { r.push('trop courte'); }
  if (/\s{2,}/.test(t)) { r.push('espaces en trop'); }
  if (/[—–]/.test(t)) { r.push('tiret long'); }
  return r;
}

// Mot à la fois nom et verbe en tête de phrase (« Contrôle qualité des produits ») : à vérifier quand le mot suivant n'annonce pas un complément.
function homographeEnTete(origine) {
  const mm = String(origine).match(/^([A-Za-zÀ-ÿœŒ’-]+) ([A-Za-zÀ-ÿœŒ’-]+)/);
  if (!mm) { return false; }
  const suivant = mm[2].toLowerCase();
  return estHomographe(mm[1].toLowerCase()) && !DETERMINANTS.test(suivant) && !SIGNAL_VERBE.test(suivant) && !estInfinitif(suivant);
}

function etatPrepare() { return { connus: CONNUS.size, infinitifs: INF_VOCAB.size }; }

module.exports = { orthographe, phraseActivite, raisonsActivite, enrichirFiche, estCorrigee, preparer, convertir, phraseCV, phrasesCV, rechargerCorrections, raisons, homographeEnTete, etatPrepare, infinitifDe, estVerbe, FICHIER_CORRECTIONS, SEUIL_LONG };
