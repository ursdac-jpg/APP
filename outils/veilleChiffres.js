/* ============================================================
   veilleChiffres.js  --  lire et réécrire les fichiers de « Comprendre les chiffres » champ par champ (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Deux formes sont prises en charge :
     - les fiches de TERRITOIRE (departements-region, regions-france, zones-emploi, medecins / dentistes / pharmaciens / specialistes) :
       un bloc « ## Lieu » par lieu, des champs « clé: valeur », des sources par identifiant, un paragraphe ;
     - le DIGEST trimestriel (<AAAA-MM>.md) : une puce par territoire (phrase, valeur en gras, période, « précédent », « il y a un an », source),
       suivie de lignes « serie: », « serie_annuelle: », « histo: », « repere: ».
   Principe (comme veilleFiche.js) : tout ce que la personne n'a pas touché est recopié tel quel, octet pour octet ; ce qui est modifié est réécrit
   sous la forme canonique des autres lignes. L'application NE lit PAS ce fichier. Aucune dépendance (Node seul).
   Un chiffre faux passe tous les tests automatiques : l'outil exige donc la confirmation « j'ai ouvert la source », compare les chiffres entre eux
   (valeur = dernier point de la série, « précédent », « il y a un an ») et date la source dans l'en-tête.
   ============================================================ */
'use strict';

const TIRETS = new RegExp('[' + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + ']');
const RE_DATE = /^\d{4}-\d{2}(-\d{2})?$/;
const NOMS_CHAMPS = { valeur: 'valeur affichée', periode: 'période', precedent: 'précédent', anPrecedent: 'il y a un an', repere: 'repère', histoH: 'le plus haut connu', histoB: 'le plus bas connu', sourceNom: 'nom de la source' };

// Forme attendue de chaque donnée d'un lieu : pourcentage, euros, nombre entier, texte libre.
const FORMES_CHAMP = {
  valeur: 'nombre', chomage_recensement: 'pct', niveau_vie_median: 'eur', taux_pauvrete: 'pct', residences_secondaires: 'pct', part_65_et_plus: 'pct',
  part_sans_diplome: 'pct', part_diplome_superieur: 'pct', secteur_principal: 'txt', population: 'nb', part_emploi_salarie: 'pct', gros_etablissements: 'txt', part_industrie: 'pct',
  // entreprises-departements.md (repères d'entreprises, 2026-10-19) : des nombres d'annonces du BODACC, jamais une entreprise
  ouvertures: 'nb', ouvertures_an_precedent: 'nb', ventes: 'nb', ventes_an_precedent: 'nb',
  // début et fin de la période comptée : écrites en français (jour/mois/année), comme partout où une date est vue ; l'application les met en toutes lettres
  periode_du: 'jour', periode_au: 'jour'
};
const RE_FORME = { pct: /^\d+(,\d+)? ?%$/, eur: /^\d[\d  ]* ?€$/, nb: /^\d[\d  ]*$/, nombre: /^-?\d+(,\d+)?( ?%)?$/, txt: /\S/, jour: /^\d{2}\/\d{2}\/\d{4}$/ };
const AIDE_FORME = { pct: 'un pourcentage à la française, par exemple « 8,5 % »', eur: 'un montant en euros, par exemple « 23 700 € »', nb: 'un nombre entier', nombre: 'un nombre à la française, par exemple « 8,5 % » ou « 133 »', txt: 'un texte non vide', jour: 'une date jour/mois/année, par exemple « 18/10/2026 »' };
// Une date jour/mois/année qui existe vraiment (pas de 31/02).
function jourFrValide(v) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(v || ''));
  if (!m) { return false; }
  const j = parseInt(m[1], 10), mo = parseInt(m[2], 10), a = parseInt(m[3], 10), d = new Date(Date.UTC(a, mo - 1, j));
  return a >= 2000 && a <= 2100 && d.getUTCFullYear() === a && d.getUTCMonth() === mo - 1 && d.getUTCDate() === j;
}

function nombre(s) {
  const m = String(s || '').match(/-?\d[\d\s .,]*/);
  if (!m) { return null; }
  const v = parseFloat(m[0].replace(/[\s ]/g, '').replace(',', '.').replace(/\.$/, ''));
  return isNaN(v) ? null : v;
}

// ---------- en-tête commun : sources datées, date de vérification ----------
function separerEntete(texte) {
  const t = String(texte);
  if (t.charCodeAt(0) === 0xFEFF || t.indexOf('\r') !== -1) { return { ok: false, erreur: 'Fins de ligne Windows ou marque d\'ordre des octets : fichier non pris en charge.' }; }
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(t);
  if (!m) { return { ok: false, erreur: 'En-tête introuvable (le fichier doit commencer par « --- » et le fermer par « --- »).' }; }
  return { ok: true, entete: m[1], corps: m[2] };
}
// Les sources de l'en-tête : [{ i (index de ligne), id, titre, url, date }] ; la 1re colonne est un identifiant ou un nom d'organisme.
function sourcesDeLEntete(entete) {
  const sortie = [];
  entete.split('\n').forEach(function (l, i) {
    const m = /^(\s+- ")(.*)(")\s*$/.exec(l);
    if (!m) { return; }
    const c = m[2].split(' | ');
    if (c.length < 3) { return; }
    sortie.push({ i: i, id: c[0].trim(), titre: c[1].trim(), url: c[2].trim(), date: c[3] !== undefined && RE_DATE.test(c[3].trim()) ? c[3].trim() : '' });
  });
  return sortie;
}
function formeDate(modele, aujourdhui) { return /^\d{4}-\d{2}$/.test(String(modele || '').trim()) ? aujourdhui.slice(0, 7) : aujourdhui; }
// Met à jour la date des sources désignées (par leurs lignes) dans l'en-tête, dans le même format que la date existante.
function dateSources(entete, lignesASurcharger, aujourdhui) {
  const l = entete.split('\n');
  lignesASurcharger.forEach(function (i) {
    const m = /^(\s+- ")(.*)(")\s*$/.exec(l[i]);
    if (!m) { return; }
    const c = m[2].split(' | ');
    const nouvelle = formeDate(c[3], aujourdhui);
    if (c.length >= 4 && RE_DATE.test(c[c.length - 1].trim())) { c[c.length - 1] = nouvelle; } else if (c.length === 3) { c.push(nouvelle); } else { return; }
    l[i] = m[1] + c.join(' | ') + m[3];
  });
  return l.join('\n');
}
function redaterEntete(entete, aujourdhui) {
  return entete.replace(/^(verifie_le:\s*)(\S+)\s*$/m, function (m, a, b) { return a + formeDate(b, aujourdhui); });
}
function verifieDe(entete) { const m = /^verifie_le:\s*(\S+)\s*$/m.exec(entete); return m ? m[1] : ''; }

// ============================================================
// A. FICHES DE TERRITOIRE
// ============================================================
// Rend { ok, entete, sources, avant: [lignes avant le 1er bloc], blocs: [{ nom, groupe, champs: [{cle, valeur}], sepSources, sources: [ids], blancsAvant, prose, blancsApres, lignesBrutes }], entreBlocs }.
function lireTerritoire(texte) {
  const s = separerEntete(texte);
  if (!s.ok) { return s; }
  const lignes = s.corps.split('\n');           // le corps finit par « \n » : le dernier élément est vide
  const segments = [];                           // { type: 'raw', lignes } ou { type: 'bloc', ... }
  let i = 0, groupe = '';
  while (i < lignes.length) {
    const l = lignes[i];
    const mg = /^# (.+)$/.exec(l);
    if (mg) { groupe = mg[1].trim(); }
    const mb = /^## (.+)$/.exec(l);
    if (!mb) {
      const dernier = segments[segments.length - 1];
      if (dernier && dernier.type === 'raw') { dernier.lignes.push(l); } else { segments.push({ type: 'raw', lignes: [l] }); }
      i++; continue;
    }
    let j = i + 1;
    while (j < lignes.length && !/^#{1,2} /.test(lignes[j])) { j++; }
    // un bloc = lignes[i..j-1] ; les lignes vides finales appartiennent à l'espacement entre blocs
    let fin = j;
    while (fin - 1 > i && lignes[fin - 1] === '' && fin - 1 < lignes.length - 1) { fin--; }
    const corpsBloc = lignes.slice(i + 1, fin), champs = [];
    let k = 0;
    while (k < corpsBloc.length) { const mk = /^([a-z_0-9]+): ?(.*)$/.exec(corpsBloc[k]); if (!mk) { break; } champs.push({ cle: mk[1], valeur: mk[2], brut: corpsBloc[k] }); k++; }
    let a = k; while (a < corpsBloc.length && corpsBloc[a] === '') { a++; }
    let b = corpsBloc.length; while (b > a && corpsBloc[b - 1] === '') { b--; }
    const bloc = { type: 'bloc', nom: mb[1].trim(), groupe: groupe, champs: champs, blancsAvant: a - k, prose: corpsBloc.slice(a, b).join('\n'), blancsApres: corpsBloc.length - b, lignesBrutes: lignes.slice(i, fin) };
    const cs = champs.filter(function (c) { return c.cle === 'sources'; })[0];
    bloc.sources = cs ? cs.valeur.split(',').map(function (x) { return x.trim(); }).filter(Boolean) : [];
    bloc.sepSources = cs && /,\S/.test(cs.valeur) ? ',' : ', ';
    segments.push(bloc);
    // lignes vides qui suivent (espacement) : conservées en « raw »
    if (fin < j) { segments.push({ type: 'raw', lignes: lignes.slice(fin, j) }); }
    i = j;
  }
  return { ok: true, entete: s.entete, sources: sourcesDeLEntete(s.entete), segments: segments, blocs: segments.filter(function (x) { return x.type === 'bloc'; }) };
}

// Forme canonique d'un bloc (pour l'essai de réécriture et pour une modification).
function blocEnTexte(bloc) {
  const l = ['## ' + bloc.nom];
  bloc.champs.forEach(function (c) { l.push(c.cle === 'sources' ? 'sources: ' + bloc.sources.join(bloc.sepSources) : c.cle + ': ' + c.valeur); });
  for (let x = 0; x < bloc.blancsAvant; x++) { l.push(''); }
  if (bloc.prose !== '') { l.push(bloc.prose); }
  for (let x = 0; x < bloc.blancsApres; x++) { l.push(''); }
  return l.join('\n');
}
function territoireEnTexte(lu, options) {
  const opt = options || {};
  const corps = lu.segments.map(function (sg) { return sg.type === 'raw' ? sg.lignes.join('\n') : (opt.toutCanonique ? blocEnTexte(sg) : sg.lignesBrutes.join('\n')); });
  // les segments étaient séparés par « \n » dans le texte d'origine
  let sortie = '';
  lu.segments.forEach(function (sg, i) {
    const t = sg.type === 'raw' ? sg.lignes.join('\n') : (opt.toutCanonique || sg.modifie ? blocEnTexte(sg) : sg.lignesBrutes.join('\n'));
    sortie += (i > 0 ? '\n' : '') + t;
  });
  void corps;
  return '---\n' + lu.entete + '\n---\n' + sortie;
}

// Une modification d'un lieu. demande : { lieu, groupe?, champs: { cle: valeur }, sources?: [ids], prose?, datation: 'garder'|'redater', confirmeSource: bool }
// contexte : { aujourdhui }. Rend { ok, texte, resume: { champs, action } } ou { ok: false, erreur }.
function modifierTerritoire(texte, demande, contexte) {
  const d = demande || {}, cx = contexte || {};
  if (!RE_DATE.test(String(cx.aujourdhui || '')) || cx.aujourdhui.length !== 10) { return { ok: false, erreur: 'Date du jour illisible.' }; }
  const lu = lireTerritoire(texte);
  if (!lu.ok) { return lu; }
  const candidats = lu.blocs.filter(function (b) { return b.nom === d.lieu && (!d.groupe || b.groupe === d.groupe); });
  if (candidats.length !== 1) { return { ok: false, erreur: candidats.length ? 'Plusieurs lieux portent ce nom : précisez le groupe.' : 'Lieu introuvable : « ' + String(d.lieu || '').slice(0, 40) + ' ».' }; }
  const bloc = candidats[0];
  const changes = d.champs && typeof d.champs === 'object' ? d.champs : {};
  const modifies = [];
  let chiffre = false;
  for (const cle of Object.keys(changes)) {
    if (cle === 'sources') { return { ok: false, erreur: 'Les sources se règlent avec la liste de sources, pas comme un champ.' }; }
    const existant = bloc.champs.filter(function (c) { return c.cle === cle; })[0];
    if (!existant && !FORMES_CHAMP[cle]) { return { ok: false, erreur: 'Champ inconnu : « ' + cle + ' ».' }; }
    const forme = FORMES_CHAMP[cle] || 'txt', v = String(changes[cle]).trim();
    if (/[\r\n]/.test(v)) { return { ok: false, erreur: 'La donnée « ' + cle + ' » tient en une seule ligne.' }; }
    if (!RE_FORME[forme].test(v)) { return { ok: false, erreur: 'La donnée « ' + cle + ' » doit être ' + AIDE_FORME[forme] + ' (reçu : « ' + v.slice(0, 40) + ' »).' }; }
    if (forme === 'jour' && !jourFrValide(v)) { return { ok: false, erreur: 'La donnée « ' + cle + ' » doit être ' + AIDE_FORME.jour + ' (cette date n\'existe pas : « ' + v.slice(0, 40) + ' »).' }; }
    if (TIRETS.test(v)) { return { ok: false, erreur: 'La donnée « ' + cle + ' » contient un tiret long ou demi-long (interdit).' }; }
    if (existant && existant.valeur === v) { continue; }
    modifies.push({ cle: cle, valeur: v, existe: !!existant });
    if (forme !== 'txt') { chiffre = true; }
  }
  let sources = null;
  if (d.sources !== undefined) {
    if (!Array.isArray(d.sources) || d.sources.some(function (x) { return !/^[a-z0-9][a-z0-9-]*$/.test(String(x)); })) { return { ok: false, erreur: 'Les sources sont une liste d\'identifiants.' }; }
    const connues = lu.sources.map(function (x) { return x.id; });
    const inconnues = d.sources.filter(function (x) { return connues.indexOf(x) === -1 && bloc.sources.indexOf(x) === -1; });
    if (inconnues.length) { return { ok: false, erreur: 'Source absente de l\'en-tête du fichier : ' + inconnues.join(', ') + '.' }; }
    if (JSON.stringify(d.sources) !== JSON.stringify(bloc.sources)) { sources = d.sources; }
  }
  let prose = null;
  if (d.prose !== undefined) {
    const p = String(d.prose).replace(/\r\n/g, '\n').replace(/^\n+/, '').replace(/\s+$/, '');
    if (TIRETS.test(p)) { return { ok: false, erreur: 'Le paragraphe contient un tiret long ou demi-long (interdit).' }; }
    if (!p) { return { ok: false, erreur: 'Le paragraphe d\'explication ne peut pas être vide.' }; }
    if (/^#{1,2} /m.test(p) || /^---\s*$/m.test(p)) { return { ok: false, erreur: 'Le paragraphe ne peut pas contenir de titre ni de ligne « --- ».' }; }
    if (p !== bloc.prose) { prose = p; }
  }
  const datation = d.datation === 'redater' ? 'redater' : 'garder';
  if (!modifies.length && sources === null && prose === null && datation !== 'redater') { return { ok: false, erreur: 'Ces modifications ne changent rien à ce lieu.' }; }
  if (chiffre && !d.confirmeSource) { return { ok: false, erreur: 'Un chiffre a changé : confirmez que vous avez ouvert la source et que le chiffre y figure.' }; }
  // Première datation d'un fichier relevé mais jamais vérifié (« verifie_le: a-valider ») : c'est elle qui le rend public, donc elle exige la confirmation même si aucun chiffre ne change.
  if (datation === 'redater' && !/^\d{4}-\d{2}(-\d{2})?$/.test(verifieDe(lu.entete)) && !d.confirmeSource) {
    return { ok: false, erreur: 'Ce fichier n\'a pas encore de date de vérification : confirmez que vous avez ouvert la source et retrouvé les chiffres avant de le dater.' };
  }

  modifies.forEach(function (m) {
    if (m.existe) { bloc.champs.filter(function (c) { return c.cle === m.cle; })[0].valeur = m.valeur; }
    else { bloc.champs.push({ cle: m.cle, valeur: m.valeur }); }
  });
  if (sources !== null) {
    bloc.sources = sources;
    const cs = bloc.champs.filter(function (c) { return c.cle === 'sources'; })[0];
    if (!cs) { bloc.champs.splice(1, 0, { cle: 'sources', valeur: '' }); }
  }
  if (prose !== null) { bloc.prose = prose; }
  bloc.modifie = true;
  let entete = lu.entete;
  if (chiffre) {
    const lignesSrc = lu.sources.filter(function (x) { return bloc.sources.indexOf(x.id) !== -1; }).map(function (x) { return x.i; });
    entete = dateSources(entete, lignesSrc, cx.aujourdhui);
  }
  if (datation === 'redater') { entete = redaterEntete(entete, cx.aujourdhui); }
  lu.entete = entete;
  const sortie = territoireEnTexte(lu);
  if (sortie === String(texte)) { return { ok: false, erreur: 'Ces modifications ne changent rien à ce lieu.' }; }
  return { ok: true, texte: sortie, resume: { champs: modifies.map(function (m) { return m.cle; }).concat(sources !== null ? ['sources'] : []).concat(prose !== null ? ['prose'] : []), action: chiffre ? 'chiffre modifié' : (prose !== null ? 'texte modifié' : (datation === 'redater' ? 'redaté' : 'modifié')) } };
}

// ============================================================
// B. DIGEST TRIMESTRIEL
// ============================================================
function lireSerie(txt) {
  const p = String(txt || '').split(/\s*;\s*/).map(function (x) { const i = x.indexOf(':'); return i < 0 ? null : { p: x.slice(0, i).trim(), v: x.slice(i + 1).trim() }; });
  return p.some(function (x) { return x === null; }) ? null : p;
}
function serieEnTexte(s) { return s.map(function (x) { return x.p + ': ' + x.v; }).join(' ; '); }

// Lit une entrée (la puce et ses lignes indentées). Rend null si elle n'a pas la forme habituelle (alors elle n'est pas modifiable ici).
function lireEntree(lignes) {
  const m0 = /^- (.+?) : (.*)$/.exec(lignes[0]);
  if (!m0) { return null; }
  const reste = m0[2], mv = /\*\*(.+?)\*\*/.exec(reste);
  if (!mv) { return null; }
  const e = { label: m0[1], avant: reste.slice(0, mv.index), valeur: mv[1], serie: [], annuelle: [], histoH: '', histoB: '', repere: '', autres: [], ordre: [] };
  const apresBrut = reste.slice(mv.index + mv[0].length), ms = /\s*Source\s*:\s*(.+?)\s*\|\s*(https?:\/\/\S+)\s*$/.exec(apresBrut);
  e.sourceNom = ms ? ms[1] : ''; e.sourceUrl = ms ? ms[2] : '';
  e.apres = ms ? apresBrut.slice(0, ms.index) : apresBrut;
  if (!ms && /Source\s*:/i.test(apresBrut)) { return null; }
  const mp = /^(\s*\()([^)]*)(\))/.exec(e.apres); e.periode = mp ? mp[2] : '';
  const mpr = /(;\s*précédent\s*:\s*)([^;.)]+?)(\s*(?:;|\.|$))/.exec(e.apres); e.precedent = mpr ? mpr[2] : '';
  const man = /(;\s*il y a un an\s*:\s*)([^;.)]+?)(\s*(?:;|\.|$))/.exec(e.apres); e.anPrecedent = man ? man[2] : '';
  for (const l of lignes.slice(1)) {
    let m;
    if ((m = /^  serie: (.+)$/.exec(l))) { const s = lireSerie(m[1]); if (!s) { return null; } e.serie = s; e.ordre.push('serie'); }
    else if ((m = /^  serie_annuelle: (.+)$/.exec(l))) { const s = lireSerie(m[1]); if (!s) { return null; } e.annuelle = s; e.ordre.push('annuelle'); }
    else if ((m = /^  histo: haut: ([^;]+?) ; bas: (.+)$/.exec(l))) { e.histoH = m[1]; e.histoB = m[2]; e.ordre.push('histo'); }
    else if ((m = /^  repere: (.+)$/.exec(l))) { e.repere = m[1]; e.ordre.push('repere'); }
    else { e.autres.push(l); e.ordre.push('autre:' + (e.autres.length - 1)); }
  }
  return e;
}
function entreeEnLignes(e) {
  let ap = e.apres;
  ap = ap.replace(/^(\s*\()([^)]*)(\))/, function (m, a, b, c) { return a + e.periode + c; });
  ap = ap.replace(/(;\s*précédent\s*:\s*)([^;.)]+?)(\s*(?:;|\.|$))/, function (m, a, b, c) { return a + e.precedent + c; });
  ap = ap.replace(/(;\s*il y a un an\s*:\s*)([^;.)]+?)(\s*(?:;|\.|$))/, function (m, a, b, c) { return a + e.anPrecedent + c; });
  const sortie = ['- ' + e.label + ' : ' + e.avant + '**' + e.valeur + '**' + ap + (e.sourceNom ? ' Source : ' + e.sourceNom + ' | ' + e.sourceUrl : '')];
  e.ordre.forEach(function (o) {
    if (o === 'serie') { sortie.push('  serie: ' + serieEnTexte(e.serie)); }
    else if (o === 'annuelle') { sortie.push('  serie_annuelle: ' + serieEnTexte(e.annuelle)); }
    else if (o === 'histo') { sortie.push('  histo: haut: ' + e.histoH + ' ; bas: ' + e.histoB); }
    else if (o === 'repere') { sortie.push('  repere: ' + e.repere); }
    else { sortie.push(e.autres[parseInt(o.slice(6), 10)]); }
  });
  return sortie;
}

// Le digest : { ok, entete, sources, lignes, entrees: [{ ref, section, label, n, debut, fin, entree (ou null), brutes }] }.
function lireDigest(texte) {
  const s = separerEntete(texte);
  if (!s.ok) { return s; }
  const lignes = s.corps.split('\n'), entrees = [], vus = {};
  let section = '', i = 0;
  while (i < lignes.length) {
    const l = lignes[i], mh = /^## (.+)$/.exec(l);
    if (mh) { section = mh[1].trim(); i++; continue; }
    if (/^- /.test(l) && section) {
      let j = i + 1;
      while (j < lignes.length && /^\s+\S/.test(lignes[j])) { j++; }
      const brutes = lignes.slice(i, j), ml = /^- (.+?) : /.exec(l), label = ml ? ml[1] : l.slice(2, 40);
      const cle = section + '|' + label; vus[cle] = (vus[cle] || 0) + 1;
      entrees.push({ ref: section + ' | ' + label + (vus[cle] > 1 ? ' | ' + vus[cle] : ''), section: section, label: label, n: vus[cle], debut: i, fin: j, brutes: brutes, entree: lireEntree(brutes) });
      i = j; continue;
    }
    i++;
  }
  return { ok: true, entete: s.entete, sources: sourcesDeLEntete(s.entete), lignes: lignes, entrees: entrees };
}
function digestEnTexte(lu, options) {
  const opt = options || {};
  const lignes = lu.lignes.slice();
  // du dernier au premier, pour garder les positions
  lu.entrees.slice().reverse().forEach(function (e) {
    if ((opt.toutCanonique || e.modifie) && e.entree) { lignes.splice(e.debut, e.fin - e.debut, ...entreeEnLignes(e.entree)); }
  });
  return '---\n' + lu.entete + '\n---\n' + lignes.join('\n');
}

// Contrôles entre les chiffres d'une entrée. Rend { bloquants: [], alertes: [] } (les alertes n'empêchent pas d'enregistrer).
function controlerEntree(e) {
  const bloquants = [], alertes = [];
  const formats = [['La valeur affichée', e.valeur], ['« Précédent »', e.precedent], ['« Il y a un an »', e.anPrecedent], ['Le plus haut connu', e.histoH], ['Le plus bas connu', e.histoB]];
  formats.forEach(function (x) { if (/\d\.\d/.test(x[1])) { bloquants.push(x[0] + ' utilise un point décimal : écrivez une virgule.'); } });
  const pts = e.serie.concat(e.annuelle);
  pts.forEach(function (x) { if (nombre(x.v) === null || /\d\.\d/.test(x.v)) { bloquants.push('Le point « ' + x.p + ' » (« ' + x.v + ' ») n\'est pas un nombre à la française.'); } if (/[;:\n]/.test(x.v) || /[;:\n]/.test(x.p)) { bloquants.push('Le point « ' + x.p + ' » contient un caractère interdit (; : ou retour à la ligne).'); } });
  [e.serie, e.annuelle].forEach(function (s) { const vus = {}; s.forEach(function (x) { if (vus[x.p]) { bloquants.push('La période « ' + x.p + ' » apparaît deux fois.'); } vus[x.p] = 1; }); });
  const unites = {}; e.serie.forEach(function (x) { unites[/%/.test(x.v) ? '%' : 'nombre'] = 1; });
  if (Object.keys(unites).length > 1) { bloquants.push('La série trimestrielle mélange des pourcentages et des nombres.'); }
  const suivant = function (p) { const m = /^T([1-4]) (\d{4})$/.exec(p); if (!m) { return null; } let t = +m[1] + 1, a = +m[2]; if (t > 4) { t = 1; a++; } return 'T' + t + ' ' + a; };
  if (e.serie.length > 1 && !e.serie.every(function (x, i) { return i === 0 || suivant(e.serie[i - 1].p) === x.p || suivant(e.serie[i - 1].p) === null; })) { alertes.push('Les périodes de la série ne se suivent pas.'); }
  const v = nombre(e.valeur), p = e.serie.map(function (x) { return nombre(x.v); }), n = p.length;
  if (n && v !== null && p[n - 1] !== null && p[n - 1] !== v && !(Math.abs(p[n - 1] - v) / Math.max(Math.abs(p[n - 1]), 1e-9) < 0.01)) { alertes.push('La valeur affichée (' + e.valeur + ') n\'est pas le dernier point de la série (' + e.serie[n - 1].v + ').'); }
  const pr = nombre(e.precedent); if (n > 1 && pr !== null && p[n - 2] !== pr) { alertes.push('« Précédent » (' + e.precedent + ') n\'est pas l\'avant-dernier point (' + e.serie[n - 2].v + ').'); }
  const an = nombre(e.anPrecedent); if (n > 4 && an !== null && p[n - 5] !== an) { alertes.push('« Il y a un an » (' + e.anPrecedent + ') ne correspond pas au point d\'il y a quatre trimestres (' + e.serie[n - 5].v + ').'); }
  return { bloquants: bloquants, alertes: alertes };
}

// Une modification d'une entrée du digest. demande : { ref, changes: { valeur, periode, precedent, anPrecedent, sourceNom, sourceUrl, serie, annuelle, histoH, histoB, repere }, datation, confirmeSource }.
function modifierDigest(texte, demande, contexte) {
  const d = demande || {}, cx = contexte || {};
  if (!RE_DATE.test(String(cx.aujourdhui || '')) || cx.aujourdhui.length !== 10) { return { ok: false, erreur: 'Date du jour illisible.' }; }
  const lu = lireDigest(texte);
  if (!lu.ok) { return lu; }
  const cible = lu.entrees.filter(function (x) { return x.ref === d.ref; })[0];
  if (!cible) { return { ok: false, erreur: 'Entrée introuvable : « ' + String(d.ref || '').slice(0, 60) + ' ».' }; }
  if (!cible.entree && d.changes && d.changes.texteLibre !== undefined) {
    // Une ligne sans chiffre en gras ni source (synthèse courte, note) : seul le texte après « libellé : » se remplace.
    const m = /^(- .+? : )(.*)$/.exec(cible.brutes[0]);
    if (!m || cible.brutes.length !== 1) { return { ok: false, erreur: 'Cette ligne ne se modifie pas ici.' }; }
    const nv = String(d.changes.texteLibre).trim();
    if (!nv || /[\r\n]/.test(nv)) { return { ok: false, erreur: 'Le texte tient en une seule ligne et ne peut pas être vide.' }; }
    if (TIRETS.test(nv)) { return { ok: false, erreur: 'Le texte contient un tiret long ou demi-long (interdit).' }; }
    if (nv === m[2]) { return { ok: false, erreur: 'Ces modifications ne changent rien à cette ligne.' }; }
    lu.lignes[cible.debut] = m[1] + nv;
    if (d.datation === 'redater') { lu.entete = redaterEntete(lu.entete, cx.aujourdhui); }
    return { ok: true, texte: '---\n' + lu.entete + '\n---\n' + lu.lignes.join('\n'), resume: { champs: ['texteLibre'], action: 'texte modifié', alertes: [] } };
  }
  if (!cible.entree) { return { ok: false, erreur: 'Cette entrée n\'a pas la forme habituelle (valeur en gras, source) : elle ne se modifie pas ici.' }; }
  const e = cible.entree, avant = JSON.parse(JSON.stringify(e)), ch = d.changes && typeof d.changes === 'object' ? d.changes : {};
  const CLES = ['valeur', 'periode', 'precedent', 'anPrecedent', 'sourceNom', 'sourceUrl', 'serie', 'annuelle', 'histoH', 'histoB', 'repere'];
  for (const k of Object.keys(ch)) { if (CLES.indexOf(k) === -1) { return { ok: false, erreur: 'Champ inconnu : « ' + k + ' ».' }; } }
  const textes = ['valeur', 'periode', 'precedent', 'anPrecedent', 'sourceNom', 'histoH', 'histoB', 'repere'];
  for (const k of textes) {
    if (ch[k] === undefined) { continue; }
    const v = String(ch[k]).trim();
    if (/[\r\n]/.test(v)) { return { ok: false, erreur: 'Le champ « ' + (NOMS_CHAMPS[k] || k) + ' » tient en une seule ligne.' }; }
    if (TIRETS.test(v)) { return { ok: false, erreur: 'Le champ « ' + (NOMS_CHAMPS[k] || k) + ' » contient un tiret long ou demi-long (interdit).' }; }
    if (['valeur', 'precedent', 'anPrecedent', 'histoH', 'histoB'].indexOf(k) !== -1 && /d.d/.test(v)) { return { ok: false, erreur: 'Le champ « ' + (NOMS_CHAMPS[k] || k) + ' » utilise un point décimal : écrivez une virgule (par exemple « 7,9 % »).' }; }
    if (['valeur', 'precedent', 'anPrecedent', 'histoH', 'histoB'].indexOf(k) !== -1 && /\d\.\d/.test(v)) { return { ok: false, erreur: 'Le champ « ' + (NOMS_CHAMPS[k] || k) + ' » utilise un point décimal : écrivez une virgule (par exemple « 7,9 % »).' }; }
    if (['valeur', 'repere'].indexOf(k) !== -1 && !v) { return { ok: false, erreur: 'Le champ « ' + (NOMS_CHAMPS[k] || k) + ' » ne peut pas être vide.' }; }
    if (k === 'valeur' && /\*\*/.test(v)) { return { ok: false, erreur: 'La valeur ne peut pas contenir « ** ».' }; }
    if (['periode'].indexOf(k) !== -1 && /[()]/.test(v)) { return { ok: false, erreur: 'La période ne peut pas contenir de parenthèse.' }; }
    if (['precedent', 'anPrecedent'].indexOf(k) !== -1 && (/[;.)]/.test(v.replace(/(\d),(\d)/g, '$1$2')) )) { return { ok: false, erreur: 'Le champ « ' + (NOMS_CHAMPS[k] || k) + ' » ne peut contenir ni point ni point-virgule ni parenthèse.' }; }
    if (k === 'sourceNom' && /\|/.test(v)) { return { ok: false, erreur: 'Le nom de la source ne peut pas contenir « | ».' }; }
    if (['precedent', 'anPrecedent', 'periode'].indexOf(k) !== -1 && ((k === 'precedent' && !/(;\s*précédent\s*:)/.test(e.apres)) || (k === 'anPrecedent' && !/(;\s*il y a un an\s*:)/.test(e.apres)) || (k === 'periode' && !/^\s*\(/.test(e.apres)))) { return { ok: false, erreur: 'Cette entrée n\'a pas de champ « ' + k + ' » : il ne peut pas être ajouté ici.' }; }
    e[k] = v;
  }
  if (ch.sourceUrl !== undefined) {
    if (!/^https:\/\/\S+$/.test(String(ch.sourceUrl))) { return { ok: false, erreur: 'La source doit être une adresse https.' }; }
    e.sourceUrl = String(ch.sourceUrl).trim();
  }
  ['serie', 'annuelle'].forEach(function (k) { if (ch[k] !== undefined) { e[k] = Array.isArray(ch[k]) ? ch[k].map(function (x) { return { p: String(x.p).trim(), v: String(x.v).trim() }; }) : null; } });
  if (e.serie === null || e.annuelle === null) { return { ok: false, erreur: 'Une série est une liste de points (période, valeur).' }; }
  const sansSerie = (ch.serie !== undefined && !avant.ordre.includes('serie') && e.serie.length) || (ch.annuelle !== undefined && !avant.ordre.includes('annuelle') && e.annuelle.length);
  if (sansSerie) { return { ok: false, erreur: 'Cette entrée n\'a pas de série : elle ne peut pas être ajoutée ici.' }; }
  if (ch.histoH !== undefined || ch.histoB !== undefined) { if (!avant.ordre.includes('histo')) { return { ok: false, erreur: 'Cette entrée n\'a pas de « plus haut / plus bas » : il ne peut pas être ajouté ici.' }; } }
  if (ch.repere !== undefined && !avant.ordre.includes('repere')) { return { ok: false, erreur: 'Cette entrée n\'a pas de repère : il ne peut pas être ajouté ici.' }; }
  const c = controlerEntree(e);
  if (c.bloquants.length) { return { ok: false, erreur: c.bloquants[0], bloquants: c.bloquants, alertes: c.alertes }; }
  const champsChiffres = ['valeur', 'precedent', 'anPrecedent', 'histoH', 'histoB'], chiffre = champsChiffres.some(function (k) { return e[k] !== avant[k]; }) || JSON.stringify(e.serie) !== JSON.stringify(avant.serie) || JSON.stringify(e.annuelle) !== JSON.stringify(avant.annuelle);
  const modifies = CLES.filter(function (k) { return JSON.stringify(e[k]) !== JSON.stringify(avant[k]); });
  const datation = d.datation === 'redater' ? 'redater' : 'garder';
  if (!modifies.length && datation !== 'redater') { return { ok: false, erreur: 'Ces modifications ne changent rien à cette entrée.' }; }
  if (chiffre && !d.confirmeSource) { return { ok: false, erreur: 'Un chiffre a changé : confirmez que vous avez ouvert la source et que le chiffre y figure.' }; }
  cible.modifie = true;
  let entete = lu.entete;
  if (chiffre) {
    const l = lu.sources.filter(function (x) { return x.url === e.sourceUrl; }).map(function (x) { return x.i; });
    entete = dateSources(entete, l, cx.aujourdhui);
  }
  if (datation === 'redater') { entete = redaterEntete(entete, cx.aujourdhui); }
  lu.entete = entete;
  const sortie = digestEnTexte(lu);
  if (sortie === String(texte)) { return { ok: false, erreur: 'Ces modifications ne changent rien à cette entrée.' }; }
  return { ok: true, texte: sortie, resume: { champs: modifies, action: chiffre ? 'chiffre modifié' : (datation === 'redater' && !modifies.length ? 'redaté' : 'modifié'), alertes: c.alertes } };
}

// ============================================================
// C. DOCUMENTS ANNUELS (portrait-AAAA.md, ue-AAAA.md) : des puces de prose avec le chiffre dans la phrase et « Source : nom | adresse » en fin de ligne
// ============================================================
const SEP_SOURCE = ' Source : ';
function gras(texte) { return (String(texte).match(/\*\*(.+?)\*\*/g) || []).map(function (x) { return x.slice(2, -2); }); }

// Lit une puce (une seule ligne). Rend { avant, source: { type: 'structure'|'libre'|'aucune', nom, url, brut } }.
function lirePuce(ligne) {
  const corps = ligne.slice(2), i = corps.lastIndexOf(SEP_SOURCE);
  if (i < 0) { return { avant: corps, source: { type: 'aucune', nom: '', url: '', brut: '' } }; }
  const brut = corps.slice(i + SEP_SOURCE.length), m = /^(.+?) \| (https?:\/\/\S+)$/.exec(brut);
  return { avant: corps.slice(0, i), source: m ? { type: 'structure', nom: m[1], url: m[2], brut: brut } : { type: 'libre', nom: '', url: '', brut: brut } };
}
function puceEnLigne(p) {
  const s = p.source;
  if (s.type === 'aucune') { return '- ' + p.avant; }
  return '- ' + p.avant + SEP_SOURCE + (s.type === 'structure' ? s.nom + ' | ' + s.url : s.brut);
}

// Un document annuel : { ok, entete, sources, lignes, puces: [{ ref, section, rang, ligne (index), brute, avant, source, aVerifier, modifiable, modifie }] }.
function lireAnnuel(texte) {
  const s = separerEntete(texte);
  if (!s.ok) { return s; }
  const lignes = s.corps.split('\n'), puces = [], rangs = {};
  let section = '';
  lignes.forEach(function (l, i) {
    const mh = /^## (.+)$/.exec(l);
    if (mh) { section = mh[1].trim(); return; }
    if (!/^- /.test(l) || !section) { return; }
    rangs[section] = (rangs[section] || 0) + 1;
    const continuation = i + 1 < lignes.length && /^\s{2,}\S/.test(lignes[i + 1]);
    const p = lirePuce(l);
    puces.push({ ref: section + ' | ' + rangs[section] + ' | ' + l.slice(2, 40), section: section, rang: rangs[section], ligne: i, brute: l, avant: p.avant, source: p.source, aVerifier: /\[[^\]]*(?:à vérifier|a verifier)[^\]]*\]/i.test(l), modifiable: !continuation });
  });
  return { ok: true, entete: s.entete, sources: sourcesDeLEntete(s.entete), lignes: lignes, puces: puces, paragraphes: lireParagraphes(lignes) };
}
// Les paragraphes de texte d'un document annuel : introduction d'une rubrique (avant la 1re puce) ou note (après). Un bloc = des lignes consecutives sans retrait, sans « > », sans puce,
// separees des autres blocs par une ligne vide ; l'application les lit en joignant les lignes par une espace. { ref, section, rang, genre, debut, fin, nbLignes, avant, modifie }.
function lireParagraphes(lignes) {
  const sortie = [], rangs = {};
  let section = '', bloc = [], puceVue = false;
  function fermer(i) {
    if (!bloc.length) { return; }
    rangs[section] = (rangs[section] || 0) + 1;
    const avant = bloc.map(function (x) { return x.trim(); }).join(' ');
    sortie.push({ ref: section + ' | p' + rangs[section] + ' | ' + avant.slice(0, 38), section: section, rang: rangs[section], genre: puceVue ? 'note' : 'introduction', debut: i - bloc.length, fin: i - 1, nbLignes: bloc.length, avant: avant, modifie: false });
    bloc = [];
  }
  lignes.forEach(function (l, i) {
    const mh = /^## (.+)$/.exec(l);
    if (mh) { fermer(i); section = mh[1].trim(); puceVue = false; return; }
    if (!section) { return; }
    if (/^- /.test(l)) { fermer(i); puceVue = true; return; }
    if (!l.trim() || /^>/.test(l) || /^\s/.test(l) || /^#/.test(l)) { fermer(i); return; }
    bloc.push(l);
  });
  fermer(lignes.length);
  return sortie;
}
// Coupe un texte en lignes d'au plus 'largeur' caracteres, aux espaces (un mot plus long reste entier).
function couperEnLignes(texte, largeur) {
  const mots = String(texte).split(/\s+/).filter(Boolean), lignes = [];
  let cour = '';
  mots.forEach(function (m) {
    if (cour && (cour + ' ' + m).length > largeur) { lignes.push(cour); cour = m; } else { cour = cour ? cour + ' ' + m : m; }
  });
  if (cour) { lignes.push(cour); }
  return lignes;
}
function annuelEnTexte(lu, options) {
  const opt = options || {}, lignes = lu.lignes.slice();
  lu.puces.forEach(function (p) { if (p.modifiable && (opt.toutCanonique || p.modifie)) { lignes[p.ligne] = puceEnLigne(p); } });
  // Paragraphes modifies, du dernier au premier pour que les numeros de lignes restent valables. Un paragraphe d'une seule ligne reste sur une ligne ; sinon retours a 80 caracteres.
  (lu.paragraphes || []).filter(function (p) { return p.modifie; }).sort(function (a, b) { return b.debut - a.debut; }).forEach(function (p) {
    const nv = p.nbLignes > 1 ? couperEnLignes(p.avant, 80) : [p.avant];
    lignes.splice(p.debut, p.fin - p.debut + 1, ...nv);
  });
  return '---\n' + lu.entete + '\n---\n' + lignes.join('\n');
}

// Une modification d'un paragraphe de texte (introduction ou note d'une rubrique) : le texte seulement ; pas de source, pas de chiffre a confirmer.
function modifierParagraphe(lu, par, d, cx, texteOrigine) {
  if (d.source !== undefined && d.source !== 'garder') { return { ok: false, erreur: 'Un paragraphe d\'introduction n\'a pas de source propre : elle se règle sur les lignes chiffrées.' }; }
  let modifie = false;
  if (d.texte !== undefined) {
    const t = String(d.texte).trim();
    if (!t) { return { ok: false, erreur: 'Le texte du paragraphe ne peut pas être vide.' }; }
    if (/[\r\n]/.test(t)) { return { ok: false, erreur: 'Le texte tient en un seul paragraphe, sans retour à la ligne : l\'outil le découpe tout seul.' }; }
    if (TIRETS.test(t)) { return { ok: false, erreur: 'Le texte contient un tiret long ou demi-long (interdit).' }; }
    if ((t.match(/\*\*/g) || []).length % 2 !== 0) { return { ok: false, erreur: 'Les « ** » qui mettent un mot en gras doivent aller par paires.' }; }
    if (/^(?:[-#>]|\s)/.test(t)) { return { ok: false, erreur: 'Le texte ne peut pas commencer par « - », « # » ou « > » (ce serait lu comme une puce ou un titre).' }; }
    if (t !== par.avant) { par.avant = t; modifie = true; }
  }
  const datation = d.datation === 'redater' ? 'redater' : 'garder';
  if (!modifie && datation !== 'redater') { return { ok: false, erreur: 'Ces modifications ne changent rien à ce paragraphe.' }; }
  par.modifie = modifie;
  if (datation === 'redater') { lu.entete = redaterEntete(lu.entete, cx.aujourdhui); }
  const sortie = annuelEnTexte(lu);
  if (sortie === String(texteOrigine)) { return { ok: false, erreur: 'Ces modifications ne changent rien à ce paragraphe.' }; }
  return { ok: true, texte: sortie, resume: { champs: modifie ? ['texte'] : [], action: modifie ? 'texte modifié' : 'redaté', alertes: [] } };
}

// Une modification d'une puce. demande :{ ref, texte?, source?: { nom, url } | 'garder', datation, confirmeSource }.
function modifierAnnuel(texte, demande, contexte) {
  const d = demande || {}, cx = contexte || {};
  if (!RE_DATE.test(String(cx.aujourdhui || '')) || cx.aujourdhui.length !== 10) { return { ok: false, erreur: 'Date du jour illisible.' }; }
  const lu = lireAnnuel(texte);
  if (!lu.ok) { return lu; }
  const par = lu.paragraphes.filter(function (x) { return x.ref === d.ref; })[0];
  if (par) { return modifierParagraphe(lu, par, d, cx, texte); }
  const p = lu.puces.filter(function (x) { return x.ref === d.ref; })[0];
  if (!p) { return { ok: false, erreur: 'Ligne introuvable : « ' + String(d.ref || '').slice(0, 60) + ' ».' }; }
  if (!p.modifiable) { return { ok: false, erreur: 'Cette ligne s\'étend sur plusieurs lignes du fichier : elle ne se modifie pas ici.' }; }
  const avant = { avant: p.avant, source: Object.assign({}, p.source) };
  let chiffre = false, modifie = false;
  if (d.texte !== undefined) {
    const t = String(d.texte).trim();
    if (!t) { return { ok: false, erreur: 'Le texte de la ligne ne peut pas être vide.' }; }
    if (/[\r\n]/.test(t)) { return { ok: false, erreur: 'Le texte de la ligne tient en une seule ligne.' }; }
    if (TIRETS.test(t)) { return { ok: false, erreur: 'Le texte contient un tiret long ou demi-long (interdit).' }; }
    if ((t.match(/\*\*/g) || []).length % 2 !== 0) { return { ok: false, erreur: 'Les « ** » qui mettent un chiffre en gras doivent aller par paires.' }; }
    if (t.indexOf(SEP_SOURCE.trim()) !== -1) { return { ok: false, erreur: 'Le texte ne peut pas contenir « Source : » : la source se règle avec la liste de sources.' }; }
    if (t !== p.avant) { p.avant = t; modifie = true; if (JSON.stringify(gras(t)) !== JSON.stringify(gras(avant.avant))) { chiffre = true; } }
  }
  if (d.source !== undefined && d.source !== 'garder') {
    const s = d.source || {}, nom = String(s.nom || '').trim(), url = String(s.url || '').trim();
    if (!nom || /[|\r\n]/.test(nom)) { return { ok: false, erreur: 'Le nom de la source est vide ou contient « | ».' }; }
    if (!/^https:\/\/\S+$/.test(url)) { return { ok: false, erreur: 'La source doit être une adresse https.' }; }
    if (TIRETS.test(nom)) { return { ok: false, erreur: 'Le nom de la source contient un tiret long ou demi-long (interdit).' }; }
    if (p.source.type !== 'structure' || p.source.nom !== nom || p.source.url !== url) { p.source = { type: 'structure', nom: nom, url: url, brut: nom + ' | ' + url }; modifie = true; chiffre = true; }
  }
  const datation = d.datation === 'redater' ? 'redater' : 'garder';
  if (!modifie && datation !== 'redater') { return { ok: false, erreur: 'Ces modifications ne changent rien à cette ligne.' }; }
  if (chiffre && !d.confirmeSource) { return { ok: false, erreur: 'Un chiffre ou une source a changé : confirmez que vous avez ouvert la source et que le chiffre y figure.' }; }
  p.modifie = true;
  let entete = lu.entete;
  if (chiffre && p.source.type === 'structure') { entete = dateSources(entete, lu.sources.filter(function (x) { return x.url === p.source.url; }).map(function (x) { return x.i; }), cx.aujourdhui); }
  if (datation === 'redater') { entete = redaterEntete(entete, cx.aujourdhui); }
  lu.entete = entete;
  const sortie = annuelEnTexte(lu);
  if (sortie === String(texte)) { return { ok: false, erreur: 'Ces modifications ne changent rien à cette ligne.' }; }
  return { ok: true, texte: sortie, resume: { champs: [].concat(avant.avant !== p.avant ? ['texte'] : []).concat(JSON.stringify(avant.source) !== JSON.stringify(p.source) ? ['source'] : []), action: chiffre ? 'chiffre modifié' : (modifie ? 'texte modifié' : 'redaté'), alertes: [] } };
}

// ============================================================
// D. FICHES MÉTHODE (en-tête simple : id, type, titre, pour_qui, tags, sans guillemets) + texte
// ============================================================
const CLES_METHODE = ['id', 'type', 'titre', 'pour_qui', 'tags'];
function lireMethode(texte) {
  const s = separerEntete(texte);
  if (!s.ok) { return s; }
  const champs = {}, ordre = [];
  for (const l of s.entete.split('\n')) {
    const m = /^([a-z_]+): (.*)$/.exec(l);
    if (!m || CLES_METHODE.indexOf(m[1]) === -1 || champs[m[1]] !== undefined) { return { ok: false, erreur: 'En-tête inattendu : « ' + l.slice(0, 40) + ' ».' }; }
    champs[m[1]] = m[2]; ordre.push(m[1]);
  }
  if (champs.type !== 'methode') { return { ok: false, erreur: 'Ce fichier n\'est pas une fiche méthode.' }; }
  const corpsBrut = s.corps, corps = corpsBrut.replace(/^\n+/, '').replace(/\s+$/, '');
  return { ok: true, champs: champs, ordre: ordre, corpsBrut: corpsBrut, corps: corps, blancsAvant: corpsBrut.length - corpsBrut.replace(/^\n+/, '').length };
}
function methodeEnTexte(lu, options) {
  const opt = options || {};
  const entete = lu.ordre.map(function (k) { return k + ': ' + lu.champs[k]; }).join('\n');
  const corps = (opt.toutCanonique || lu.modifieCorps) ? '\n' + lu.corps + '\n' : lu.corpsBrut;
  return '---\n' + entete + '\n---\n' + corps;
}
function modifierMethode(texte, demande) {
  const d = demande || {};
  const lu = lireMethode(texte);
  if (!lu.ok) { return lu; }
  const ch = d.changes && typeof d.changes === 'object' ? d.changes : {};
  let modifie = false;
  const modifies = [];
  for (const k of Object.keys(ch)) {
    if (['titre', 'pour_qui', 'tags', 'corps'].indexOf(k) === -1) { return { ok: false, erreur: 'Champ inconnu ou verrouillé : « ' + k + ' ».' }; }
    if (k === 'corps') {
      const c = String(ch.corps).replace(/\r\n/g, '\n').replace(/^\n+/, '').replace(/\s+$/, '');
      if (!c) { return { ok: false, erreur: 'Le texte ne peut pas être vide.' }; }
      if (TIRETS.test(c)) { return { ok: false, erreur: 'Le texte contient un tiret long ou demi-long (interdit).' }; }
      if (c !== lu.corps) { lu.corps = c; lu.modifieCorps = true; modifie = true; modifies.push('corps'); }
      continue;
    }
    const v = String(ch[k]).trim();
    if (!v) { return { ok: false, erreur: 'Le champ « ' + k + ' » ne peut pas être vide.' }; }
    if (/[\r\n]/.test(v)) { return { ok: false, erreur: 'Le champ « ' + k + ' » tient en une seule ligne.' }; }
    if (TIRETS.test(v)) { return { ok: false, erreur: 'Le champ « ' + k + ' » contient un tiret long ou demi-long (interdit).' }; }
    if (k === 'tags' && v.split(',').some(function (x) { return !x.trim(); })) { return { ok: false, erreur: 'Les mots de recherche sont séparés par des virgules, sans mot vide.' }; }
    if (lu.champs[k] !== v) { lu.champs[k] = k === 'tags' ? v.split(',').map(function (x) { return x.trim(); }).join(', ') : v; modifie = true; modifies.push(k); }
  }
  if (!modifie) { return { ok: false, erreur: 'Ces modifications ne changent rien à cette fiche.' }; }
  const sortie = methodeEnTexte(lu);
  if (sortie === String(texte)) { return { ok: false, erreur: 'Ces modifications ne changent rien à cette fiche.' }; }
  return { ok: true, texte: sortie, resume: { champs: modifies, action: 'texte modifié', alertes: [] } };
}

// Une ligne libre d'un digest (synthèse courte...) : remplacement du texte d'une puce sans chiffre en gras ni source.

module.exports = {
  lireTerritoire: lireTerritoire, territoireEnTexte: territoireEnTexte, blocEnTexte: blocEnTexte, modifierTerritoire: modifierTerritoire,
  lireDigest: lireDigest, digestEnTexte: digestEnTexte, lireEntree: lireEntree, entreeEnLignes: entreeEnLignes, controlerEntree: controlerEntree, modifierDigest: modifierDigest,
  lireAnnuel: lireAnnuel, lireParagraphes: lireParagraphes, couperEnLignes: couperEnLignes, annuelEnTexte: annuelEnTexte, modifierAnnuel: modifierAnnuel, lirePuce: lirePuce, puceEnLigne: puceEnLigne, gras: gras,
  lireMethode: lireMethode, methodeEnTexte: methodeEnTexte, modifierMethode: modifierMethode,
  sourcesDeLEntete: sourcesDeLEntete, separerEntete: separerEntete, verifieDe: verifieDe, nombre: nombre, FORMES_CHAMP: FORMES_CHAMP, AIDE_FORME: AIDE_FORME, RE_FORME: RE_FORME
};
