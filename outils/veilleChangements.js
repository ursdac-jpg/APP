/* ============================================================
   veilleChangements.js  --  le « sas des changements » : les changements du balayage trimestriel, valides UN PAR UN avant d'etre publies
   ------------------------------------------------------------
   Utilise par outils/veilleDepot.js. Aucune dependance.
   Regle (decision de Denis, 2026-10-15) : rien n'est publie dans le digest « Ce qui a change recemment » sans validation. Tout ce que le balayage
   ramene est range dans un fichier que l'APPLICATION NE LIT JAMAIS (outils/sas/changements.sas.txt) ; un changement ne devient public que quand
   la personne a ouvert la source, rempli ce qui manquait et clique « C'est bon ». Il entre alors dans contenu/balayage/<mois>.md avec la ligne
   « Verifie le : <date du jour> » (marque verte dans l'application). Une information « a verifier » ne peut JAMAIS etre validee.
   Format du sas (une ligne = un changement, colonnes separees par « | ») :
     id | mois | domaine | intitule | nature | en_vigueur | concerne | ce_qui_change | source_titre | source_url | origine
   origine : « balayage » (propose par l'assistant) ou « reprise » (deja publie avant la regle, a reconfirmer).
   ============================================================ */
'use strict';
const crypto = require('crypto');
const CHEMIN_SAS = 'outils/sas/changements.sas.txt';
const DOSSIER_DIGESTS = 'modules/comprendre-le-cadre/contenu/balayage';
const COLONNES = ['id', 'mois', 'domaine', 'intitule', 'nature', 'en_vigueur', 'concerne', 'ce_qui_change', 'source_titre', 'source_url', 'origine', 'periode'];
const RE_MOIS = /^\d{4}-(0[1-9]|1[0-2])$/;
const RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const TIRET_LONG = new RegExp(String.fromCharCode(0x2013) + '|' + String.fromCharCode(0x2014));
const EN_TETE = ['# Sas des changements : changements du balayage PROPOSES, pas encore verifies. L\'application NE LIT PAS ce fichier.',
  '# Format : id | mois | domaine | intitule | nature | en_vigueur | concerne | ce_qui_change | source_titre | source_url | origine | periode',
  '# Un changement sort d\'ici quand il est valide (outil de veille, bouton « C\'est bon ») : il entre alors dans contenu/balayage/<mois>.md avec « Verifie le ».', ''].join('\n');

function finDeLigne(texte) { return String(texte).indexOf('\r\n') !== -1 ? '\r\n' : '\n'; }
function normaliser(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
function nettoyerChamp(s) { return String(s === undefined || s === null ? '' : s).replace(/\|/g, '/').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim(); }
// Identifiant stable : le trimestre + l'intitule (tronque) + une courte empreinte du domaine et de l'intitule complets. Deux intitules qui commencent
// pareil, ou le meme intitule dans deux domaines (cas reel : « Annonce, pas encore en vigueur »), restent distincts.
function identifiant(mois, domaine, intitule) {
  const base = normaliser(intitule).replace(/ /g, '-');
  const empreinte = crypto.createHash('sha1').update(normaliser(domaine) + '|' + normaliser(intitule)).digest('hex').slice(0, 6);
  return String(mois) + '-' + base.slice(0, 60).replace(/-+$/, '') + '-' + empreinte;
}
function aVerifier(s) { return /à vérifier|a verifier|à confirmer|a confirmer/i.test(String(s || '')); }

// ---------- le fichier du sas ----------
function parserSas(texte) {
  const lignes = [];
  String(texte || '').split(/\r?\n/).forEach(function (brut) {
    const l = brut.trim();
    if (!l || l.charAt(0) === '#') { return; }
    const c = l.split('|').map(function (x) { return x.trim(); });
    if (c.length < COLONNES.length) { return; }
    const v = {}; COLONNES.forEach(function (nom, i) { v[nom] = c[i] || ''; });
    lignes.push(v);
  });
  return lignes;
}
function formaterLigne(v) {
  return COLONNES.map(function (nom) { return nettoyerChamp(v[nom]); }).join(' | ');
}
function ecrireSas(lignes, fin) {
  return (EN_TETE + lignes.map(formaterLigne).join('\n') + '\n').replace(/\n/g, fin || '\n');
}

// ---------- controle d'un changement avant publication ----------
// Rend la liste des problemes (vide = le changement peut etre valide).
function verifierChangement(v) {
  const e = [];
  const exige = function (cle, libelle) { if (!String(v[cle] || '').trim()) { e.push(libelle + ' : obligatoire.'); } };
  if (!RE_MOIS.test(String(v.mois || ''))) { e.push('Le trimestre (mois du fichier, AAAA-MM) est invalide.'); }
  exige('domaine', 'Le domaine'); exige('intitule', 'L\'intitule'); exige('nature', 'La nature et la date du texte');
  exige('concerne', 'Le public concerne'); exige('ce_qui_change', 'Ce qui change'); exige('source_titre', 'Le titre de la source');
  const ev = String(v.en_vigueur || '').trim();
  if (!ev) { e.push('La date d\'entree en vigueur est obligatoire (AAAA-MM-JJ, « prevu AAAA-MM-JJ » si le texte n\'est pas encore en vigueur, ou « sans objet »).'); }
  else if (!RE_DATE.test(ev) && !/^pr[ée]vu\s+\d{4}-\d{2}-\d{2}$/i.test(ev) && !/^sans objet$/i.test(ev)) {
    e.push('La date d\'entree en vigueur doit s\'ecrire AAAA-MM-JJ (ou « prevu AAAA-MM-JJ », ou « sans objet » pour une information qui n\'est pas un texte).');
  }
  if (!/^https:\/\/[^\s|)\]]+$/.test(String(v.source_url || '').trim())) { e.push('L\'adresse de la source doit commencer par https:// (sans espace).'); }
  ['intitule', 'nature', 'en_vigueur', 'concerne', 'ce_qui_change', 'source_titre', 'domaine'].forEach(function (cle) {
    if (aVerifier(v[cle])) { e.push('Le champ « ' + cle + ' » contient « a verifier » : une information possiblement fausse ne se valide pas.'); }
    if (TIRET_LONG.test(String(v[cle] || ''))) { e.push('Le champ « ' + cle + ' » contient un tiret cadratin ou demi-cadratin (interdit).'); }
  });
  return e;
}

// ---------- le texte d'un changement dans le digest ----------
function formeVigueur(ev) {
  const t = String(ev).trim();
  if (RE_DATE.test(t)) { return 'en vigueur le ' + t; }
  return 'entrée en vigueur prévue le ' + t.replace(/^pr[ée]vu\s+/i, '');
}
function blocChangement(v, date) {
  const nature = String(v.nature).replace(/[.\s]+$/, '');
  return ['### ' + nettoyerChamp(v.intitule),
    'Type : ' + nettoyerChamp(nature) + (/^sans objet$/i.test(String(v.en_vigueur).trim()) ? '' : ', ' + formeVigueur(v.en_vigueur)) + '.',
    'Concerne : ' + nettoyerChamp(v.concerne),
    'Ce qui change : ' + nettoyerChamp(v.ce_qui_change),
    'Source : [' + nettoyerChamp(v.source_titre) + '](' + String(v.source_url).trim() + ')',
    'Vérifié le : ' + date];
}
function entreeSource(v, date) {
  let hote = '';
  try { hote = new URL(String(v.source_url).trim()).hostname.replace(/^www\./, ''); } catch (e) { hote = ''; }
  const u = String(v.source_url).trim();
  return '  - "' + nettoyerChamp(hote || v.source_titre).replace(/"/g, '\\"') + ' | ' + nettoyerChamp(v.source_titre).replace(/"/g, '\\"') + ' | [' + u + '](' + u + ') | ' + date + '"';
}

// Digest vide d'un trimestre pas encore cree.
function nouveauDigest(mois, periode) {
  const p = nettoyerChamp(periode || mois).replace(/"/g, '\\"');
  return ['---', 'type: balayage', 'periode: "' + p + '"', 'publie_le: ' + mois, 'territoire: national', 'sources:', '---', '',
    '# Ce qui a changé, ' + nettoyerChamp(periode || mois), '', ''].join('\n');
}

// Ajoute le changement au digest (ou REMPLACE celui de meme intitule dans le meme domaine). Rend { ok, texte, remplace } ou { ok:false, erreur }.
function integrerDansDigest(texteDigest, v, date, periode) {
  const pbs = verifierChangement(v);
  if (pbs.length) { return { ok: false, erreur: pbs[0] }; }
  let texte = String(texteDigest || '');
  const fin = texte ? finDeLigne(texte) : '\n';
  if (!texte.trim()) { texte = nouveauDigest(v.mois, periode); }
  const lignes = texte.split(/\r?\n/);
  const bloc = blocChangement(v, date);
  const cleDomaine = normaliser(v.domaine), cleItem = normaliser(v.intitule);

  // 1. le domaine
  let iDom = lignes.findIndex(function (l) { return /^##\s+/.test(l) && !/^###/.test(l) && normaliser(l.replace(/^##\s+/, '')) === cleDomaine; });
  let remplace = false;
  if (iDom < 0) {
    while (lignes.length && lignes[lignes.length - 1].trim() === '') { lignes.pop(); }
    lignes.push('', '## ' + nettoyerChamp(v.domaine), '');
    iDom = lignes.length - 2;
  }
  let fDom = lignes.length;
  for (let i = iDom + 1; i < lignes.length; i++) { if (/^##\s+/.test(lignes[i]) && !/^###/.test(lignes[i])) { fDom = i; break; } }

  // 2. le changement existant (meme intitule) : remplace
  let iItem = -1;
  for (let i = iDom + 1; i < fDom; i++) { if (/^###\s+/.test(lignes[i]) && normaliser(lignes[i].replace(/^###\s+/, '')) === cleItem) { iItem = i; break; } }
  if (iItem >= 0) {
    let fItem = fDom;
    for (let i = iItem + 1; i < fDom; i++) { if (/^###\s+/.test(lignes[i]) || /^_/.test(lignes[i].trim())) { fItem = i; break; } }
    while (fItem > iItem + 1 && lignes[fItem - 1].trim() === '') { fItem--; }
    lignes.splice(iItem, fItem - iItem, ...bloc);
    remplace = true;
  } else {
    // domaine « rien de nouveau » : la note disparait des qu'un changement arrive
    for (let i = fDom - 1; i > iDom; i--) { if (/^_Rien de nouveau retenu ce trimestre\._$/.test(lignes[i].trim())) { lignes.splice(i, 1); fDom--; } }
    let pos = fDom;
    while (pos > iDom + 1 && lignes[pos - 1].trim() === '') { pos--; }
    const avant = lignes[pos - 1];
    const ajout = (avant !== undefined && avant.trim() !== '' && !/^##\s/.test(avant) ? [''] : []).concat(bloc);
    // une ligne vide entre le domaine et son premier changement
    if (pos === iDom + 1) { ajout.unshift(''); }
    lignes.splice(pos, 0, ...ajout);
    // une ligne vide apres le dernier changement, avant le domaine suivant
    const apres = pos + ajout.length;
    if (apres < lignes.length && lignes[apres].trim() !== '') { lignes.splice(apres, 0, ''); }
  }

  // 3. la liste des sources de l'en-tete
  const u = String(v.source_url).trim();
  const fe = lignes.indexOf('---', 1);
  const entete = fe > 0 ? lignes.slice(0, fe) : [];
  if (!entete.some(function (l) { return l.indexOf(u) !== -1; })) {
    const iSrc = entete.findIndex(function (l) { return /^sources:\s*$/.test(l); });
    if (iSrc >= 0) {
      let derniere = iSrc;
      for (let i = iSrc + 1; i < fe; i++) { if (/^\s+-/.test(lignes[i])) { derniere = i; } else { break; } }
      lignes.splice(derniere + 1, 0, entreeSource(v, date));
    }
  }
  let sortie = lignes.join(fin);
  if (!/\n$/.test(sortie)) { sortie += fin; }
  return { ok: true, texte: sortie, remplace: remplace };
}

// Le changement tel qu'il est deja publie dans un digest (pour dire « deja publie, a reconfirmer » dans le sas). Rend true / false.
function dejaPublie(texteDigest, v) {
  if (!texteDigest) { return false; }
  const cleDomaine = normaliser(v.domaine), cleItem = normaliser(v.intitule);
  const lignes = String(texteDigest).split(/\r?\n/);
  let domaine = '';
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i];
    if (/^##\s+/.test(l) && !/^###/.test(l)) { domaine = normaliser(l.replace(/^##\s+/, '')); continue; }
    if (/^###\s+/.test(l) && domaine === cleDomaine && normaliser(l.replace(/^###\s+/, '')) === cleItem) { return true; }
  }
  return false;
}

// ---------- reprise d'un digest deja publie (avant la regle de validation) ----------
// Lit les changements d'un digest et les rend sous forme de lignes du sas (origine « reprise »). Un changement « a verifier » arrive avec la
// date d'entree en vigueur VIDE : il faut la trouver avant de pouvoir le valider.
function changementsDuDigest(texteDigest, mois) {
  const lignes = String(texteDigest || '').split(/\r?\n/);
  const out = []; let domaine = '', cur = null;
  const pousser = function () { if (cur) { out.push(cur); cur = null; } };
  lignes.forEach(function (l) {
    if (/^##\s+/.test(l) && !/^###/.test(l)) { pousser(); domaine = l.replace(/^##\s+/, '').trim(); return; }
    if (/^###\s+/.test(l)) { pousser(); cur = { mois: mois, domaine: domaine, intitule: l.replace(/^###\s+/, '').trim(), nature: '', en_vigueur: '', concerne: '', ce_qui_change: '', source_titre: '', source_url: '', origine: 'reprise' }; return; }
    if (!cur) { return; }
    let m;
    if ((m = /^Type\s*:\s*(.+)$/.exec(l))) {
      let t = m[1].trim().replace(/\.$/, '');
      const mv = /,?\s*(?:en vigueur|entrée en vigueur)(?:\s+à compter du|\s+le|\s+prévue le)?\s+(\d{4}-\d{2}-\d{2})\s*(\([^)]*\))?\s*$/i.exec(t);
      const prevu = /entrée en vigueur prévue/i.test(t);
      if (mv) { cur.en_vigueur = (prevu ? 'prévu ' : '') + mv[1]; t = t.slice(0, mv.index).trim(); }
      else if (/,?\s*en vigueur\s+(?:le\s+)?N\/A\s*$/i.test(t)) { cur.en_vigueur = 'sans objet'; t = t.replace(/,?\s*en vigueur\s+(?:le\s+)?N\/A\s*$/i, '').trim(); }
      else {
        // date absente, incomplete (« 2026-09 », « 2026 »), « en cours » ou « a verifier » : la personne doit la trouver, on ne devine rien
        cur.en_vigueur = '';
        t = t.replace(/,?\s*en vigueur\s*(?::|le|à vérifier)?[^,]*$/i, '').trim();
      }
      cur.nature = t.replace(/,\s*$/, '');
    } else if ((m = /^Concerne\s*:\s*(.+)$/.exec(l))) { cur.concerne = m[1].trim(); }
    else if ((m = /^Ce qui change\s*:\s*(.+)$/.exec(l))) { cur.ce_qui_change = m[1].trim(); }
    else if ((m = /^Source\s*:\s*\[(.+?)\]\((https?:\/\/[^\s)]+)\)/.exec(l))) { cur.source_titre = m[1].trim(); cur.source_url = m[2].trim(); }
  });
  pousser();
  out.forEach(function (c) { c.id = identifiant(mois, c.domaine, c.intitule); });
  return out;
}

// ---------- actions du sas (appliquees par le depot) ----------
// actions : { op: 'importer', lignes: [valeurs] } | { op: 'retirer', id } | { op: 'valider', id, valeurs? (corrections) }
// ctx : { digest(mois) -> texte ou '' , aujourdhui, periodes? }
// Rend { ok, texteSas, digests: { 'AAAA-MM': texte }, resume } ou { ok:false, erreur }.
function appliquer(texteSas, actions, ctx) {
  const fin = finDeLigne(texteSas || '\n');
  let lignes = parserSas(texteSas);
  const digests = {}; const resume = { importes: 0, ignores: 0, valides: 0, remplaces: 0, retires: 0 };
  const lireDigest = function (mois) { return Object.prototype.hasOwnProperty.call(digests, mois) ? digests[mois] : ctx.digest(mois); };
  for (let a = 0; a < actions.length; a++) {
    const act = actions[a] || {};
    if (act.op === 'importer') {
      const liste = Array.isArray(act.lignes) ? act.lignes : [];
      if (!liste.length) { return { ok: false, erreur: 'Rien a importer dans le sas des changements.' }; }
      for (let i = 0; i < liste.length; i++) {
        const v = {}; COLONNES.forEach(function (c) { v[c] = nettoyerChamp(liste[i] && liste[i][c]); });
        v.origine = v.origine === 'reprise' ? 'reprise' : 'balayage';
        if (!RE_MOIS.test(v.mois) || !v.intitule || !v.domaine) { return { ok: false, erreur: 'Un changement importe n\'a pas de trimestre, de domaine ou d\'intitule.' }; }
        v.id = identifiant(v.mois, v.domaine, v.intitule);
        if (lignes.some(function (x) { return x.id === v.id; })) { resume.ignores++; continue; }
        lignes.push(v); resume.importes++;
      }
    } else if (act.op === 'retirer') {
      const n = lignes.length; lignes = lignes.filter(function (x) { return x.id !== act.id; });
      if (lignes.length === n) { return { ok: false, erreur: 'Changement introuvable dans le sas (« ' + String(act.id).slice(0, 60) + ' »).' }; }
      resume.retires++;
    } else if (act.op === 'valider') {
      const i = lignes.findIndex(function (x) { return x.id === act.id; });
      if (i < 0) { return { ok: false, erreur: 'Changement introuvable dans le sas (« ' + String(act.id).slice(0, 60) + ' »).' }; }
      const v = Object.assign({}, lignes[i]);
      const corr = act.valeurs || {};
      ['domaine', 'intitule', 'nature', 'en_vigueur', 'concerne', 'ce_qui_change', 'source_titre', 'source_url'].forEach(function (c) { if (corr[c] !== undefined) { v[c] = nettoyerChamp(corr[c]); } });
      const r = integrerDansDigest(lireDigest(v.mois), v, ctx.aujourdhui, v.periode);
      if (!r.ok) { return { ok: false, erreur: '« ' + v.intitule.slice(0, 60) + ' » : ' + r.erreur }; }
      digests[v.mois] = r.texte;
      lignes.splice(i, 1);
      resume.valides++; if (r.remplace) { resume.remplaces++; }
    } else {
      return { ok: false, erreur: 'Action inconnue sur le sas des changements.' };
    }
  }
  return { ok: true, texteSas: ecrireSas(lignes, fin), digests: digests, resume: resume };
}

// Le texte du changement tel qu'il est publie aujourd'hui dans le digest (de « ### intitule » jusqu'au suivant), ou '' s'il n'y est pas.
function blocPublie(texteDigest, v) {
  if (!texteDigest) { return ''; }
  const cleDomaine = normaliser(v.domaine), cleItem = normaliser(v.intitule);
  const lignes = String(texteDigest).split(/\r?\n/);
  let domaine = '';
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i];
    if (/^##\s+/.test(l) && !/^###/.test(l)) { domaine = normaliser(l.replace(/^##\s+/, '')); continue; }
    if (/^###\s+/.test(l) && domaine === cleDomaine && normaliser(l.replace(/^###\s+/, '')) === cleItem) {
      let f = i + 1;
      while (f < lignes.length && !/^##/.test(lignes[f]) && !/^_/.test(lignes[f].trim())) { f++; }
      while (f > i + 1 && lignes[f - 1].trim() === '') { f--; }
      return lignes.slice(i, f).join('\n');
    }
  }
  return '';
}

// Le contenu du sas pour l'ecran : chaque changement, ses problemes eventuels, et s'il est deja publie.
function lister(texteSas, lireDigest) {
  const lignes = parserSas(texteSas).map(function (v) {
    const bloc = blocPublie(lireDigest(v.mois), v);
    return { id: v.id, valeurs: v, problemes: verifierChangement(v), dejaPublie: !!bloc, publie: bloc };
  });
  return { ok: true, lignes: lignes, total: lignes.length, colonnes: COLONNES };
}

// ---------- « Faire verifier par un assistant » : le prompt et la lecture de sa reponse ----------
// Le prompt reprend le socle de recherche commun de l'outil (passe par l'ecran), le changement tel qu'il est ecrit, trois cartes deja publiees comme
// modeles de style, et impose un bloc de reponse que lireReponse() sait ranger case par case. L'assistant PROPOSE ; la personne confirme a la source.
const CHAMPS_VERIF = ['en_vigueur', 'nature', 'concerne', 'ce_qui_change', 'source_titre', 'source_url'];

// Trois cartes du digest le plus recent, de domaines differents, comme exemples de style (phrases courtes, deja relues par Denis).
function exemplesDeStyle(texteDigest, mois) {
  const out = []; const domaines = {};
  changementsDuDigest(texteDigest, mois || '0000-00').forEach(function (c) {
    if (out.length >= 3 || domaines[c.domaine]) { return; }
    if (!c.ce_qui_change || c.ce_qui_change.length < 50 || c.ce_qui_change.length > 230 || aVerifier([c.concerne, c.ce_qui_change, c.nature].join(' '))) { return; }
    domaines[c.domaine] = true;
    out.push({ intitule: c.intitule, concerne: c.concerne, ce_qui_change: c.ce_qui_change });
  });
  return out;
}

function construirePrompt(v, exemples, socle) {
  const val = function (c) { return String(v[c] || '').trim() || '(vide)'; };
  const ex = (exemples || []).map(function (e, i) {
    return 'Exemple ' + (i + 1) + ' : « ' + e.intitule + ' »\n  Concerne : ' + e.concerne + '\n  Ce qui change : ' + e.ce_qui_change;
  }).join('\n');
  return [
    String(socle || '').trim(),
    '',
    'Je tiens un résumé trimestriel des changements officiels (emploi, formation, droits sociaux, séjour) destiné à des personnes en insertion professionnelle. Je dois contrôler UN changement avant de le publier. Voici ce qui est écrit aujourd\'hui :',
    '',
    'Domaine : ' + val('domaine'),
    'Intitulé : ' + val('intitule'),
    'Nature et date du texte : ' + val('nature'),
    'En vigueur le : ' + val('en_vigueur'),
    'Public concerné : ' + val('concerne'),
    'Ce qui change : ' + val('ce_qui_change'),
    'Source indiquée : ' + val('source_titre') + ', ' + val('source_url'),
    '',
    'Ta mission :',
    '1. Ouvre la source indiquée. Si elle est illisible, trouve la page officielle précise (ou un relais fiable) et dis-le.',
    '2. Pour chacune des cases ci-dessous, dis si ce qui est écrit est confirmé, à corriger, ou introuvable.',
    '3. N\'écris une valeur que si tu l\'as lue sur une page que tu as ouverte, et donne la page (adresse complète) ainsi qu\'une courte citation de ce que tu as lu (15 mots au plus). Ne reformule pas de mémoire.',
    '4. La date « en vigueur le » est la date à partir de laquelle le texte s\'applique. Si le texte s\'applique à partir d\'un événement (par exemple « aux contrats conclus à compter du ... »), écris cette date. Distingue-la de la date de publication. Une circulaire, un discours, un programme d\'accompagnement ou une publication statistique n\'entre pas en vigueur : écris « sans objet ».',
    '5. Si une case est introuvable, écris « non trouvé ». Si une case est déjà exacte, écris « inchangé ». Ne propose jamais de tiret long.',
    '',
    'Style d\'écriture attendu pour « Public concerné » et « Ce qui change » (ce sont des textes lus par le public) : phrases courtes et simples, mots du quotidien, un fait par phrase, pas de jargon sans explication, aucun jugement sur la personne, accents corrects. « Ce qui change » commence par un verbe ou un nom, sans majuscule, comme dans les exemples déjà publiés :',
    ex || '(aucun exemple disponible)',
    '',
    'Réponds UNIQUEMENT par ce bloc, rien avant ni après :',
    '',
    '[VERIFICATION]',
    'statut: confirmé | corrigé | partiel | introuvable',
    'en_vigueur: AAAA-MM-JJ (ou « prévu AAAA-MM-JJ » si pas encore en vigueur, ou « sans objet », ou « non trouvé »)',
    'en_vigueur_page: adresse complète de la page où tu l\'as lu',
    'en_vigueur_citation: courte citation',
    'nature: texte proposé, ou « inchangé »',
    'nature_page: adresse complète',
    'concerne: texte proposé, ou « inchangé »',
    'ce_qui_change: texte proposé (une ou deux phrases), ou « inchangé »',
    'ce_qui_change_page: adresse complète',
    'source_titre: titre exact de la page précise, ou « inchangé »',
    'source_url: adresse complète de la page précise, ou « inchangé »',
    'remarque: une phrase au plus sur ce que tu n\'as pas pu confirmer',
    '[/VERIFICATION]'
  ].join('\n');
}

function nettoyerValeurReponse(s) {
  return String(s || '').replace(/^[\s*_`>-]+|[\s*_`]+$/g, '').replace(/^["«]\s*|\s*["»]$/g, '').replace(/\s+/g, ' ').trim();
}
const ABSENT = /^(non trouv[ée]e?|inchang[ée]e?|[àa] v[ée]rifier|aucune?|n\/?a|introuvable|vide|\(vide\))(?![a-zA-Zà-ÿ])|^[-\u2014]+$/i;

// Lit le bloc [VERIFICATION] colle par la personne. actuel = les valeurs de la carte (avec les corrections deja saisies).
// Rend { ok, statut, remarque, propositions: [{ champ, actuel, propose, page, citation, probleme, identique }] } ou { ok:false, erreur }.
function lireReponse(texte, actuel) {
  const t = String(texte || '');
  let corps = null;
  const m = /\[VERIFICATION\]([\s\S]*?)(?:\[\/VERIFICATION\]|$)/i.exec(t);
  if (m) { corps = m[1]; }
  if (corps === null || !/:/.test(corps)) {
    return { ok: false, erreur: 'Je ne trouve pas le bloc [VERIFICATION] dans cette réponse. Redemandez à l\'assistant de répondre UNIQUEMENT par ce bloc, puis collez-le ici.' };
  }
  const brut = {};
  corps.split(/\r?\n/).forEach(function (ligne) {
    const k = /^\s*(?:[-*•]\s*)?\**\s*([a-z_]+)\s*\**\s*:\s*(.*)$/i.exec(ligne);
    if (k) { brut[k[1].toLowerCase()] = nettoyerValeurReponse(k[2]); }
  });
  if (!Object.keys(brut).length) { return { ok: false, erreur: 'Le bloc [VERIFICATION] est vide ou mal écrit : une ligne par case, sous la forme « case: valeur ».' }; }
  const propositions = [];
  const page = function (champ) {
    const p = brut[champ + '_page'] || '';
    const u = /https:\/\/[^\s|)\]>]+/.exec(p);
    return u ? u[0].replace(/[.,;]+$/, '') : '';
  };
  CHAMPS_VERIF.forEach(function (champ) {
    let valeur = brut[champ];
    if (valeur === undefined || valeur === '' || ABSENT.test(valeur)) { return; }
    let probleme = '';
    if (champ === 'en_vigueur') {
      const d = /\d{4}-\d{2}-\d{2}/.exec(valeur);
      if (/^sans objet/i.test(valeur)) { valeur = 'sans objet'; }
      else if (d && /^pr[ée]vu/i.test(valeur)) { valeur = 'prévu ' + d[0]; }
      else if (d && valeur.replace(d[0], '').replace(/[\s().,:;-]|en vigueur|le|à compter du|application/gi, '') === '') { valeur = d[0]; }
      else if (d) { valeur = d[0]; }
      else { probleme = 'Date mal écrite : il faut AAAA-MM-JJ, « prévu AAAA-MM-JJ » ou « sans objet ».'; }
    } else if (champ === 'source_url') {
      const u = /https:\/\/[^\s|)\]>]+/.exec(valeur);
      if (u) { valeur = u[0].replace(/[.,;]+$/, ''); } else { probleme = 'L\'adresse doit commencer par https://.'; }
    }
    if (!probleme && aVerifier(valeur)) { probleme = 'Contient « à vérifier » : refusé.'; }
    if (!probleme && TIRET_LONG.test(valeur)) { probleme = 'Contient un tiret long : refusé.'; }
    const courant = String((actuel && actuel[champ]) || '').trim();
    const identique = !probleme && normaliser(courant) === normaliser(valeur);
    propositions.push({
      champ: champ, actuel: courant, propose: valeur,
      page: champ === 'source_url' ? valeur : (champ === 'source_titre' ? (brut.source_url && /https:\/\//.test(brut.source_url) ? (/https:\/\/[^\s|)\]>]+/.exec(brut.source_url) || [''])[0] : '') : page(champ)),
      citation: champ === 'en_vigueur' ? (brut.en_vigueur_citation || '') : '',
      probleme: probleme, identique: identique
    });
  });
  return { ok: true, statut: brut.statut || '', remarque: brut.remarque || '', propositions: propositions };
}

module.exports = {
  CHEMIN_SAS: CHEMIN_SAS, DOSSIER_DIGESTS: DOSSIER_DIGESTS, COLONNES: COLONNES, EN_TETE: EN_TETE,
  parserSas: parserSas, formaterLigne: formaterLigne, ecrireSas: ecrireSas, verifierChangement: verifierChangement,
  integrerDansDigest: integrerDansDigest, changementsDuDigest: changementsDuDigest, appliquer: appliquer, lister: lister,
  exemplesDeStyle: exemplesDeStyle, construirePrompt: construirePrompt, lireReponse: lireReponse, CHAMPS_VERIF: CHAMPS_VERIF,
  dejaPublie: dejaPublie, blocPublie: blocPublie, identifiant: identifiant, blocChangement: blocChangement, nouveauDigest: nouveauDigest, RE_MOIS: RE_MOIS
};
