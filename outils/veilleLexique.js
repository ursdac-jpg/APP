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
function objetsDeLaListe(contenu) {
  const d = contenu.indexOf(DEBUT_LISTE);
  if (d < 0) { return null; }
  const depart = d + DEBUT_LISTE.length;
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

module.exports = { objetsDeLaListe: objetsDeLaListe, proprietes: proprietes, trouverEntree: trouverEntree, identifiantsExistants: identifiantsExistants, remplacerEntree: remplacerEntree, construireBloc: construireBloc, CHAMPS_DE_L_OUTIL: CHAMPS_DE_L_OUTIL };
