/* ============================================================
   veilleLexique.js  --  retrouver et remplacer UNE entree de data/lexique.js (liste LEXIQUE_FICHES), sans rien perdre
   ------------------------------------------------------------
   Utilise par outils/veilleDepot.js. Aucune dependance. Le fichier n'est JAMAIS execute (ni eval, ni Function) : un petit lecteur de texte repere les
   objets de la liste en ignorant chaines et commentaires. Quand un mot est REMPLACE, les champs que l'outil ne produit pas (par exemple
   voirAussiChiffres, fichesEntree...) sont RECOPIES tels quels depuis l'ancienne entree ; les relations anciennes sont gardees si le nouveau texte
   n'en propose pas. Rien n'est supprime en silence.
   ============================================================ */
'use strict';

const CHAMPS_DE_L_OUTIL = ['id', 'titre', 'titreDeTri', 'type', 'gabarit', 'univers', 'registres', 'variantesRecherche', 'corps', 'relations'];
const DEBUT_LISTE = 'var LEXIQUE_FICHES = [';

// Parcourt le texte entre debut et fin et rend, pour chaque caractere de CODE (hors chaines et commentaires), [position, caractere].
function caracteresDeCode(t, debut, fin) {
  const sortie = [];
  let i = debut;
  while (i < fin) {
    const c = t[i];
    if (c === '"' || c === '\'' || c === '`') {
      i++;
      while (i < fin && t[i] !== c) { if (t[i] === '\\') { i++; } i++; }
      i++; continue;
    }
    if (c === '/' && t[i + 1] === '/') { while (i < fin && t[i] !== '\n') { i++; } continue; }
    if (c === '/' && t[i + 1] === '*') { i += 2; while (i < fin && !(t[i] === '*' && t[i + 1] === '/')) { i++; } i += 2; continue; }
    sortie.push([i, c]); i++;
  }
  return sortie;
}

// Les objets de la liste LEXIQUE_FICHES : [{ debut, fin }] (fin exclue, juste apres l'accolade fermante), et la position de la fin de la liste.
function objetsDeLaListe(contenu, debutListe) {
  const marque = debutListe || DEBUT_LISTE;
  const d = contenu.indexOf(marque);
  if (d < 0) { return null; }
  const depart = d + marque.length;
  const car = caracteresDeCode(contenu, depart, contenu.length);
  const objets = []; let prof = 0, debutObjet = -1, finListe = -1;
  for (let k = 0; k < car.length; k++) {
    const i = car[k][0], c = car[k][1];
    if (c === '{' || c === '[' || c === '(') { if (prof === 0 && c === '{') { debutObjet = i; } prof++; }
    else if (c === '}' || c === ')') { prof--; if (prof === 0 && c === '}' && debutObjet >= 0) { objets.push({ debut: debutObjet, fin: i + 1 }); debutObjet = -1; } }
    else if (c === ']') { if (prof === 0) { finListe = i; break; } prof--; }
  }
  if (finListe < 0) { return null; }
  return { objets: objets, finListe: finListe };
}

// Proprietes de premier niveau d'un objet « { ... } » : [{ cle, brut }] (brut = texte exact de la propriete, sans la virgule de separation).
function proprietes(bloc) {
  const car = caracteresDeCode(bloc, 1, bloc.length - 1);
  const morceaux = []; let prof = 0, debut = 1;
  car.forEach(function (x) {
    const i = x[0], c = x[1];
    if (c === '{' || c === '[' || c === '(') { prof++; }
    else if (c === '}' || c === ']' || c === ')') { prof--; }
    else if (c === ',' && prof === 0) { morceaux.push(bloc.slice(debut, i)); debut = i + 1; }
  });
  morceaux.push(bloc.slice(debut, bloc.length - 1));
  const props = [];
  morceaux.forEach(function (m) {
    const brut = m.replace(/^\s+|\s+$/g, ''); if (!brut) { return; }
    const k = /^([A-Za-z_$][\w$]*)\s*:/.exec(brut);
    props.push({ cle: k ? k[1] : '', brut: brut });
  });
  return props;
}

function identifiantDe(props) {
  const p = props.filter(function (x) { return x.cle === 'id'; })[0];
  const m = p && /^id:\s*'([^']+)'/.exec(p.brut);
  return m ? m[1] : '';
}

// Retrouve l'entree d'un identifiant : { debut, fin, props } ou null.
function trouverEntree(contenu, id) {
  const liste = objetsDeLaListe(contenu);
  if (!liste) { return null; }
  for (const o of liste.objets) {
    const props = proprietes(contenu.slice(o.debut, o.fin));
    if (identifiantDe(props) === id) { return { debut: o.debut, fin: o.fin, props: props }; }
  }
  return null;
}

// Tous les identifiants de la liste.
function identifiantsExistants(contenu) {
  const liste = objetsDeLaListe(contenu);
  if (!liste) { return null; }
  return liste.objets.map(function (o) { return identifiantDe(proprietes(contenu.slice(o.debut, o.fin))); }).filter(Boolean);
}

// Un texte entre guillemets simples ou doubles au debut de `brut` (apres « cle: »), decode ; rend '' si ce n'est pas une chaine simple.
function chaineJs(brut) {
  const m = new RegExp('^[A-Za-z_$][' + '\\w$]*\\s*:\\s*').exec(brut);
  let i = m ? m[0].length : 0;
  const q = brut[i];
  if (q !== '"' && q !== "'") { return ''; }
  let s = ''; i++;
  while (i < brut.length && brut[i] !== q) {
    if (brut[i] === '\\') { i++; const c = brut[i]; s += (c === 'n' ? ' ' : c); } else { s += brut[i]; }
    i++;
  }
  return s;
}

// Les mots du Lexique, LUS comme du texte (jamais executes) : [{ id, titre, corps, variantes: [], relations: [ficheId] }]. Rend null si la liste est introuvable.
function lireEntrees(contenu) {
  const liste = objetsDeLaListe(contenu);
  if (!liste) { return null; }
  return liste.objets.map(function (o) {
    const props = proprietes(contenu.slice(o.debut, o.fin));
    const par = function (cle) { const p = props.filter(function (x) { return x.cle === cle; })[0]; return p ? p.brut : ''; };
    const variantes = [], relations = [];
    const bv = par('variantesRecherche');
    const re = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g;
    let m;
    while ((m = re.exec(bv.replace(/^[A-Za-z_$][\w$]*\s*:\s*/, '')))) { variantes.push(String(m[1] !== undefined ? m[1] : m[2]).replace(/\\(.)/g, '$1')); }
    const rr = /ficheId:\s*'([^']+)'/g, br = par('relations');
    while ((m = rr.exec(br))) { relations.push(m[1]); }
    return { id: chaineJs(par('id')), titre: chaineJs(par('titre')), corps: chaineJs(par('corps')), variantes: variantes, relations: relations };
  }).filter(function (e) { return e.id; });
}

// Construit le texte d'une entree a partir du bloc de l'outil (lignes « { ... }, ») ; extras = proprietes de l'ancienne entree a recopier.
// Rend les lignes SANS indentation de depart sur la 1re (elle se place apres l'indentation existante) et les suivantes indentees de 2 espaces.
function construireBloc(lignesOutil, extras) {
  const inter = lignesOutil.slice(1, lignesOutil.length - 1);   // sans « { » ni « }, »
  const lignes = inter.slice();
  if (extras.length) {
    if (!/,$/.test(lignes[lignes.length - 1])) { lignes[lignes.length - 1] += ','; }
    extras.forEach(function (e, i) { lignes.push('  ' + e.brut + (i < extras.length - 1 ? ',' : '')); });
  }
  return ['{'].concat(lignes.map(function (l) { return '  ' + l; })).concat(['  }']).join('\n');
}

// Remplace l'entree d'un identifiant. entree = { id, lignes } (bloc de l'outil). Rend { ok, texte, conserves } ou { ok:false, erreur }.
function remplacerEntree(contenu, entree) {
  const ancienne = trouverEntree(contenu, entree.id);
  if (!ancienne) { return { ok: false, erreur: 'Mot introuvable dans le Lexique : ' + entree.id + '.' }; }
  const nouveauALesRelations = entree.lignes.some(function (l) { return /^  relations: \[$/.test(l); });
  const extras = ancienne.props.filter(function (p) {
    if (CHAMPS_DE_L_OUTIL.indexOf(p.cle) === -1) { return true; }          // champ que l'outil ne produit pas : recopie
    return p.cle === 'relations' && !nouveauALesRelations;                  // relations anciennes gardees si le nouveau texte n'en propose pas
  });
  const bloc = construireBloc(entree.lignes, extras);
  return { ok: true, texte: contenu.slice(0, ancienne.debut) + bloc + contenu.slice(ancienne.fin), conserves: extras.map(function (e) { return e.cle; }) };
}

// ---------- Le bloc « Les chiffres a jour » (champ detailsAJour) : un petit lecteur d'objet, JAMAIS eval ----------
// Accepte seulement : objets { cle: valeur }, tableaux, chaines entre ' ou ", true, false, null, nombres, commentaires. Tout le reste est refuse.
function lireLitteral(src) {
  const t = String(src); let i = 0;
  const ko = function (m) { throw new Error(m + ' (position ' + i + ')'); };
  const blanc = function () {
    for (;;) {
      while (i < t.length && /\s/.test(t[i])) { i++; }
      if (t[i] === '/' && t[i + 1] === '/') { while (i < t.length && t[i] !== '\n') { i++; } continue; }
      if (t[i] === '/' && t[i + 1] === '*') { i += 2; while (i < t.length && !(t[i] === '*' && t[i + 1] === '/')) { i++; } i += 2; continue; }
      return;
    }
  };
  const chaine = function () {
    const q = t[i]; i++; let s = '';
    while (i < t.length && t[i] !== q) {
      if (t[i] === '\\') { i++; const c = t[i]; s += (c === 'n' ? '\n' : c === 't' ? '\t' : c); } else { s += t[i]; }
      i++;
    }
    if (t[i] !== q) { ko('chaine non fermee'); }
    i++; return s;
  };
  const valeur = function () {
    blanc(); const c = t[i];
    if (c === '{') {
      i++; const o = {};
      for (;;) {
        blanc(); if (t[i] === '}') { i++; return o; }
        let cle;
        if (t[i] === '\'' || t[i] === '"') { cle = chaine(); } else { const m = /^[A-Za-z_$][\w$]*/.exec(t.slice(i)); if (!m) { ko('cle attendue'); } cle = m[0]; i += m[0].length; }
        if (cle === '__proto__' || cle === 'constructor' || cle === 'prototype') { ko('cle interdite'); }
        blanc(); if (t[i] !== ':') { ko('« : » attendu'); } i++;
        o[cle] = valeur(); blanc();
        if (t[i] === ',') { i++; } else if (t[i] !== '}') { ko('« , » ou « } » attendu'); }
      }
    }
    if (c === '[') {
      i++; const a = [];
      for (;;) {
        blanc(); if (t[i] === ']') { i++; return a; }
        a.push(valeur()); blanc();
        if (t[i] === ',') { i++; } else if (t[i] !== ']') { ko('« , » ou « ] » attendu'); }
      }
    }
    if (c === '\'' || c === '"') { return chaine(); }
    const m = /^(?:true|false|null|-?\d+(?:\.\d+)?)(?![\w$])/.exec(t.slice(i));
    if (!m) { ko('valeur non reconnue'); }
    i += m[0].length; return m[0] === 'true' ? true : m[0] === 'false' ? false : m[0] === 'null' ? null : Number(m[0]);
  };
  const v = valeur(); blanc();
  if (i < t.length) { ko('texte en trop apres la valeur'); }
  return v;
}
// Le bloc d'une propriete « detailsAJour: { ... } » : l'objet, null si la propriete est absente, ou { illisible: 'message' } si elle ne se lit pas.
function lireDetails(brutPropriete) {
  if (!brutPropriete) { return null; }
  try { return lireLitteral(brutPropriete.replace(/^[A-Za-z_$][\w$]*\s*:\s*/, '')); } catch (e) { return { illisible: e.message }; }
}
// Le bloc ecrit dans la forme du fichier. indent = indentation de la propriete.
function ecrireDetails(d, indent) {
  const s = function (v) { return chaineEcrite(v, '\''); };
  const i1 = indent + '  ', i2 = i1 + '  ';
  const l = [indent + 'detailsAJour: {'];
  l.push(i1 + 'verifieLe: ' + s(d.verifieLe || '') + ',');
  l.push(i1 + 'source: { nom: ' + s(d.source.nom) + ', url: ' + s(d.source.url) + ' },');
  l.push(i1 + 'lignes: [');
  l.push(d.lignes.map(function (x) { return i2 + '{ libelle: ' + s(x.libelle) + ', valeur: ' + s(x.valeur) + ', categorie: ' + s(x.categorie) + ', peutChanger: ' + (x.peutChanger ? 'true' : 'false') + ' }'; }).join(',\n'));
  l.push(i1 + ']');
  l.push(indent + '}');
  return l.join('\n');
}

// ---------- Lire les mots avec TOUS leurs champs (ecran « Le Lexique » de l'outil de veille) ----------
// [{ id, titre, titreDeTri, type, gabarit, univers, registres: [], variantes: [], corps, relations: [[id, 'voir-aussi' | 'a-ne-pas-confondre']], chiffres }], lus comme du texte.
function lireMots(contenu) {
  const liste = objetsDeLaListe(contenu);
  if (!liste) { return null; }
  return liste.objets.map(function (o) {
    const props = proprietes(contenu.slice(o.debut, o.fin));
    const par = function (cle) { const p = props.filter(function (x) { return x.cle === cle; })[0]; return p ? p.brut : ''; };
    const textes = function (cle) {
      const b = par(cle).replace(/^[A-Za-z_$][\w$]*\s*:\s*/, ''), re = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g, sortie = []; let m;
      while ((m = re.exec(b))) { sortie.push(String(m[1] !== undefined ? m[1] : m[2]).replace(/\\(.)/g, '$1')); }
      return sortie;
    };
    const relations = [], rr = /ficheId:\s*'([^']+)'\s*,\s*type:\s*'([^']+)'/g, br = par('relations'); let m;
    while ((m = rr.exec(br))) { relations.push([m[1], m[2]]); }
    return { id: chaineJs(par('id')), titre: chaineJs(par('titre')), titreDeTri: chaineJs(par('titreDeTri')), type: chaineJs(par('type')), gabarit: chaineJs(par('gabarit')), univers: chaineJs(par('univers')),
      registres: textes('registres'), variantes: textes('variantesRecherche'), corps: chaineJs(par('corps')), relations: relations, chiffres: chaineJs(par('voirAussiChiffres')), details: lireDetails(par('detailsAJour')) };
  }).filter(function (e) { return e.id; });
}
// Les collections et parcours : [{ id, titre, mode, fiches: [ids] }].
function lireCollections(contenu) {
  const liste = objetsDeLaListe(contenu, 'var LEXIQUE_COLLECTIONS = [');
  if (!liste) { return []; }
  return liste.objets.map(function (o) {
    const props = proprietes(contenu.slice(o.debut, o.fin));
    const par = function (cle) { const p = props.filter(function (x) { return x.cle === cle; })[0]; return p ? p.brut : ''; };
    const fiches = [], re = /'([^']+)'/g, b = par('fichesOrdonnees').replace(/^[A-Za-z_$][\w$]*\s*:\s*/, ''); let m;
    while ((m = re.exec(b))) { fiches.push(m[1]); }
    return { id: chaineJs(par('id')), titre: chaineJs(par('titre')), mode: chaineJs(par('mode')), fiches: fiches };
  }).filter(function (c) { return c.id; });
}

// ---------- Modifier des CHAMPS d'un mot, sans toucher au reste (chantier « le Lexique de l'outil de veille », case H3) ----------
// Les proprietes d'un mot avec leur POSITION dans le texte du fichier : [{ cle, debut, fin }] (fin exclue, sans la virgule de separation). Plusieurs proprietes
// peuvent partager la meme ligne (id, titre, titreDeTri, type) : on remplace chacune par sa position, jamais par sa ligne.
function proprietesPositions(contenu, entree) {
  const bloc = contenu.slice(entree.debut, entree.fin);
  const car = caracteresDeCode(bloc, 1, bloc.length - 1);
  const bornes = []; let prof = 0, debut = 1;
  car.forEach(function (x) {
    const i = x[0], c = x[1];
    if (c === '{' || c === '[' || c === '(') { prof++; }
    else if (c === '}' || c === ']' || c === ')') { prof--; }
    else if (c === ',' && prof === 0) { bornes.push([debut, i]); debut = i + 1; }
  });
  bornes.push([debut, bloc.length - 1]);
  const sortie = [];
  bornes.forEach(function (b) {
    let d = b[0], f = b[1];
    while (d < f && /\s/.test(bloc[d])) { d++; }
    while (f > d && /\s/.test(bloc[f - 1])) { f--; }
    if (f <= d) { return; }
    const k = /^([A-Za-z_$][\w$]*)\s*:/.exec(bloc.slice(d, f));
    sortie.push({ cle: k ? k[1] : '', debut: entree.debut + d, fin: entree.debut + f });
  });
  return sortie;
}

// Un texte ecrit comme une chaine JavaScript : on garde le guillemet que la propriete utilisait deja si le texte le permet (moins de differences dans Git),
// sinon l'autre, sinon on echappe. Jamais de retour a la ligne dans une chaine.
function chaineEcrite(valeur, guillemetActuel) {
  const v = String(valeur).replace(/\r?\n/g, ' ');
  const echapper = function (g) { return g + v.replace(/\\/g, '\\\\').split(g).join('\\' + g) + g; };
  const prefere = guillemetActuel === '"' ? '"' : '\'';
  const autre = prefere === '"' ? '\'' : '"';
  if (v.indexOf(prefere) === -1) { return prefere + v.replace(/\\/g, '\\\\') + prefere; }
  if (v.indexOf(autre) === -1) { return autre + v.replace(/\\/g, '\\\\') + autre; }
  return echapper(prefere);
}
function guillemetDe(brut) { const m = /^[A-Za-z_$][\w$]*\s*:\s*(["'])/.exec(brut); return m ? m[1] : ''; }
function guillemetDuPremierElement(brut) { const m = /^[A-Za-z_$][\w$]*\s*:\s*\[\s*(["'])/.exec(brut); return m ? m[1] : ''; }

// Les nouvelles proprietes, ecrites dans la forme du fichier. relations : [[ficheId, 'voir-aussi' | 'a-ne-pas-confondre']]. indent = indentation de la propriete.
function ecrireListeTextes(cle, valeurs, brutActuel) {
  if (!valeurs.length) { return cle + ': []'; }
  const g = guillemetDuPremierElement(brutActuel);
  return cle + ': [' + valeurs.map(function (v) { return chaineEcrite(v, g); }).join(', ') + ']';
}
function ecrireRelations(relations, indent) {
  if (!relations.length) { return 'relations: []'; }
  const lignes = relations.map(function (r) { return indent + '  { ficheId: \'' + r[0] + '\', type: \'' + r[1] + '\' }'; });
  return 'relations: [\n' + lignes.join(',\n') + '\n' + indent + ']';
}
function indentationDe(contenu, position) { const d = contenu.lastIndexOf('\n', position - 1) + 1; const m = /^[ \t]*/.exec(contenu.slice(d, position)); return m ? m[0] : ''; }

const CHAMPS_MODIFIABLES = ['titre', 'titreDeTri', 'type', 'gabarit', 'univers', 'registres', 'variantes', 'corps', 'relations', 'details'];

// Remplace seulement les champs demandes d'UN mot ; tout le reste du fichier (les autres mots, les autres champs du mot, les commentaires) reste octet pour octet.
// champs : { titre?, titreDeTri?, univers?, registres?: [], variantes?: [], corps?, relations?: [[id, type]] }. Rend { ok, texte, modifies } ou { ok:false, erreur }.
function remplacerChamps(contenu, id, champs) {
  const e = trouverEntree(contenu, id);
  if (!e) { return { ok: false, erreur: 'Mot introuvable dans le Lexique : ' + id + '.' }; }
  const demandes = Object.keys(champs || {});
  const inconnu = demandes.filter(function (k) { return CHAMPS_MODIFIABLES.indexOf(k) === -1; })[0];
  if (inconnu) { return { ok: false, erreur: 'Champ non modifiable ici : ' + inconnu + '.' }; }
  if (!demandes.length) { return { ok: true, texte: contenu, modifies: [] }; }
  const pos = proprietesPositions(contenu, e);
  const trouve = function (cle) { return pos.filter(function (p) { return p.cle === cle; })[0]; };
  const cleFichier = { titre: 'titre', titreDeTri: 'titreDeTri', univers: 'univers', registres: 'registres', variantes: 'variantesRecherche', corps: 'corps', relations: 'relations' };
  const remplacements = [];
  // Le type et la presentation (gabarit) d'une fiche : une notion porte « type: 'notion', gabarit: '...' », un mot simple n'a pas de gabarit.
  if (demandes.indexOf('type') !== -1 || demandes.indexOf('gabarit') !== -1) {
    const actuel = lireMots(contenu).filter(function (x) { return x.id === id; })[0] || {};
    const type = champs.type !== undefined ? champs.type : actuel.type, gabarit = champs.gabarit !== undefined ? champs.gabarit : actuel.gabarit;
    const pType = trouve('type'), pGab = trouve('gabarit');
    if (!pType) { return { ok: false, erreur: 'Le champ « type » est introuvable dans le mot ' + id + ' : il n\'est pas modifie.' }; }
    if (type === 'notion') {
      if (!/^[a-z0-9-]+$/.test(String(gabarit || ''))) { return { ok: false, erreur: 'Une notion demande une presentation (gabarit) valide.' }; }
      if (pGab) { remplacements.push({ debut: pType.debut, fin: pType.fin, neuf: 'type: \'notion\'' }, { debut: pGab.debut, fin: pGab.fin, neuf: 'gabarit: \'' + gabarit + '\'' }); }
      else { remplacements.push({ debut: pType.debut, fin: pType.fin, neuf: 'type: \'notion\', gabarit: \'' + gabarit + '\'' }); }
    } else if (type === 'terme') {
      remplacements.push({ debut: pType.debut, fin: pType.fin, neuf: 'type: \'terme\'' });
      if (pGab) {
        const apres = function (x) { return pos.filter(function (p) { return p.debut > x.debut; }).sort(function (a, b) { return a.debut - b.debut; })[0]; };
        if (apres(pType) === pGab) { remplacements.push({ debut: pType.fin, fin: pGab.fin, neuf: '' }); }   // « type: 'notion', gabarit: 'x' » : on retire « , gabarit: 'x' » et la mise en forme d'origine reste
        else {
          const suivante = apres(pGab);
          if (!suivante) { return { ok: false, erreur: 'Forme inattendue du mot ' + id + ' : le gabarit n\'est pas retire.' }; }
          remplacements.push({ debut: pGab.debut, fin: suivante.debut, neuf: '' });
        }
      }
    } else { return { ok: false, erreur: 'Type inconnu : ' + type + '.' }; }
  }
  // Le bloc « Les chiffres a jour » : ajoute (apres le texte), remplace ou retire (null) la propriete detailsAJour, sans toucher au reste.
  if (demandes.indexOf('details') !== -1) {
    const d = champs.details, pDet = trouve('detailsAJour'), pCorps = trouve('corps');
    if (d === null || d === undefined) {
      if (pDet) {
        const avant = pos.filter(function (p) { return p.fin <= pDet.debut; }).sort(function (a, b) { return b.fin - a.fin; })[0];
        if (!avant) { return { ok: false, erreur: 'Forme inattendue du mot ' + id + ' : le bloc des chiffres n\'est pas retire.' }; }
        remplacements.push({ debut: avant.fin, fin: pDet.fin, neuf: '' });
      }
    } else {
      if (!d.source || !Array.isArray(d.lignes) || !d.lignes.length) { return { ok: false, erreur: 'Le bloc des chiffres est incomplet : il n\'est pas ecrit.' }; }
      if (pDet) { remplacements.push({ debut: pDet.debut, fin: pDet.fin, neuf: ecrireDetails(d, '').replace(/^/, '').replace(/\n/g, '\n' + indentationDe(contenu, pDet.debut)) }); }
      else {
        if (!pCorps) { return { ok: false, erreur: 'Le texte du mot ' + id + ' est introuvable : le bloc des chiffres n\'est pas ajoute.' }; }
        const ind = indentationDe(contenu, pCorps.debut);
        remplacements.push({ debut: pCorps.fin, fin: pCorps.fin, neuf: ',\n' + ecrireDetails(d, ind) });
      }
    }
  }
  for (const k of demandes) {
    if (k === 'type' || k === 'gabarit' || k === 'details') { continue; }
    const p = trouve(cleFichier[k]);
    if (!p) { return { ok: false, erreur: 'Le champ « ' + k + ' » est introuvable dans le mot ' + id + ' : il n\'est pas modifie.' }; }
    const brut = contenu.slice(p.debut, p.fin), v = champs[k];
    let neuf;
    if (k === 'titre' || k === 'titreDeTri' || k === 'corps') { neuf = cleFichier[k] + ': ' + chaineEcrite(v, guillemetDe(brut)); }
    else if (k === 'univers') { neuf = 'univers: ' + chaineEcrite(v, '\''); }
    else if (k === 'registres' || k === 'variantes') { neuf = ecrireListeTextes(cleFichier[k], v, brut); }
    else { neuf = ecrireRelations(v, indentationDe(contenu, p.debut)); }
    remplacements.push({ debut: p.debut, fin: p.fin, neuf: neuf });
  }
  let texte = contenu;
  remplacements.sort(function (a, b) { return b.debut - a.debut; }).forEach(function (r) { texte = texte.slice(0, r.debut) + r.neuf + texte.slice(r.fin); });
  // Controle : le mot relu apres coup doit contenir EXACTEMENT ce qui etait demande, et rien d'autre ne doit avoir bouge dans le fichier.
  const relu = lireEntrees(texte).filter(function (x) { return x.id === id; })[0], reluMot = lireMots(texte).filter(function (x) { return x.id === id; })[0];
  const attendu = { type: champs.type, gabarit: champs.type === 'terme' ? '' : champs.gabarit, titre: champs.titre, corps: champs.corps, variantes: champs.variantes, relations: champs.relations && champs.relations.map(function (r) { return r[0]; }) };
  for (const k of Object.keys(attendu)) {
    if (attendu[k] === undefined) { continue; }
    const a = JSON.stringify(k === 'corps' || k === 'titre' ? String(attendu[k]).replace(/\r?\n/g, ' ') : attendu[k]);
    if (!relu || JSON.stringify(((k === 'type' || k === 'gabarit') ? reluMot : relu)[k] || (k === 'gabarit' ? '' : undefined)) !== a) { return { ok: false, erreur: 'Controle apres ecriture : le champ « ' + k + ' » du mot ' + id + ' ne se relit pas comme demande. Rien n\'est ecrit.' }; }
  }
  if (demandes.indexOf('details') !== -1) {
    const attenduD = champs.details === null || champs.details === undefined ? null : detailsCanonique(champs.details);
    if (!reluMot || JSON.stringify(reluMot.details) !== JSON.stringify(attenduD)) { return { ok: false, erreur: 'Controle apres ecriture : le bloc des chiffres du mot ' + id + ' ne se relit pas comme demande. Rien n\'est ecrit.' }; }
  }
  return { ok: true, texte: texte, modifies: demandes };
}
// Le bloc dans l'ordre exact des cles du fichier (pour comparer deux blocs sans dependre de l'ordre des cles de l'appelant).
function detailsCanonique(d) {
  return { verifieLe: d.verifieLe || '', source: { nom: d.source.nom, url: d.source.url }, lignes: d.lignes.map(function (x) { return { libelle: x.libelle, valeur: x.valeur, categorie: x.categorie, peutChanger: !!x.peutChanger }; }) };
}

module.exports = { lireLitteral: lireLitteral, lireDetails: lireDetails, ecrireDetails: ecrireDetails, detailsCanonique: detailsCanonique, lireMots: lireMots, lireCollections: lireCollections, proprietesPositions: proprietesPositions, remplacerChamps: remplacerChamps, CHAMPS_MODIFIABLES: CHAMPS_MODIFIABLES, objetsDeLaListe: objetsDeLaListe, proprietes: proprietes, trouverEntree: trouverEntree, identifiantsExistants: identifiantsExistants, lireEntrees: lireEntrees, remplacerEntree: remplacerEntree, construireBloc: construireBloc, CHAMPS_DE_L_OUTIL: CHAMPS_DE_L_OUTIL };
