'use strict';
// Génère modules/mon-territoire/contenu/magasins-generes.txt : les magasins des enseignes du registre, relevés dans le registre officiel des entreprises (Sirene).
// Consigne 303 de Denis (14/11/2026) : afficher les magasins de chaque enseigne sur chaque commune, pas seulement ceux saisis à la main.
//
// Source : API « Recherche d'entreprises » (recherche-entreprises.api.gouv.fr, Licence Ouverte 2.0). Elle ne donne aucun numéro de téléphone.
// Deux relevés complémentaires, réunis par numéro SIRET :
//   A. par commune : toutes les entreprises du commerce (section G) de chacune des communes des fichiers communes-24.txt et communes-87.txt ;
//   B. par enseigne : une recherche par nom dans chaque département (pour les enseignes dont la société principale n'est pas classée dans le commerce).
// Un établissement est retenu s'il est ouvert, dans une commune du module, avec un code d'activité accepté, et si son enseigne, son nom commercial ou sa raison sociale
// cite l'alias de l'enseigne (mot entier). Rien n'est jamais écrit à la main dans le fichier produit : relancer ce script suffit à le refaire.
//
// Usage : node scripts/genererMagasinsSirene.js [--cache dossier] [--seulement id,id] [--sans-adresses-exactes] [--essai]
//   --essai : n'écrit pas le fichier du module, affiche seulement le rapport.
const fs = require('fs');
const os = require('os');
const path = require('path');
const L = require('../modules/mon-territoire/logique.js');
const { ENSEIGNES } = require('./magasinsSireneConfig.js');

const RACINE = path.join(__dirname, '..');
const CONTENU = path.join(RACINE, 'modules', 'mon-territoire', 'contenu');
const SORTIE = path.join(CONTENU, 'magasins-generes.txt');
const API = 'https://recherche-entreprises.api.gouv.fr/search';
const UA = { 'User-Agent': 'app-releve-magasins/1.0', 'Accept': 'application/json' };
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Fonctions pures (testées dans tests/magasinsSirene.test.js) ----------
const norm = (s) => L.mtNormaliser(s);

// L'alias est-il cité en mots entiers dans ce texte ?
function citeAlias(texte, alias) { return (' ' + norm(texte) + ' ').indexOf(' ' + norm(alias) + ' ') !== -1; }

// Cet établissement relève-t-il de cette enseigne ? Retourne null, ou { alias, via } (via = enseigne, commercial ou societe).
function correspond(etab, ent, cfg) {
  if (!etab || etab.etat_administratif !== 'A' || etab.date_fermeture) { return null; }
  const naf = String(etab.activite_principale || '');
  if (!cfg.naf.some((p) => naf.indexOf(p) === 0)) { return null; }
  const nom = String(ent.nom_complet || '');
  if (/non[- ]?diffusible/i.test(nom + ' ' + String(etab.adresse || ''))) { return null; }
  const declares = (etab.liste_enseignes || []).concat(etab.nom_commercial ? [etab.nom_commercial] : []);
  let meilleur = null;
  cfg.alias.forEach((alias) => {
    let via = null;
    if (declares.some((d) => citeAlias(d, alias))) { via = 'enseigne'; }
    else if (!cfg.nomSeulement && !declares.length && norm(alias).length >= 5 && String(ent.nature_juridique || '') !== '1000' && norm(nom).indexOf(norm(alias)) === 0 && citeAlias(nom, alias)) { via = 'societe'; }
    if (via && (!meilleur || norm(alias).length > norm(meilleur.alias).length)) { meilleur = { alias: alias, via: via }; }
  });
  return meilleur;
}

// Quelle fiche retenir quand plusieurs enseignes citent le même établissement ? La plus précise (alias le plus long, en mots puis en lettres).
function choisirEnseigne(candidats) {
  return candidats.slice().sort((a, b) => {
    const ma = norm(a.alias).split(' ').length, mb = norm(b.alias).split(' ').length;
    if (ma !== mb) { return mb - ma; }
    if (a.alias.length !== b.alias.length) { return b.alias.length - a.alias.length; }
    return a.id < b.id ? -1 : 1;
  })[0];
}

const MINUSCULES = { de: 1, du: 1, des: 1, la: 1, le: 1, les: 1, et: 1, en: 1, sur: 1, sous: 1, aux: 1, au: 1, a: 1, d: 1, l: 1 };
const SIGLES = { za: 'ZA', zi: 'ZI', zac: 'ZAC', cc: 'CC', rd: 'RD', rn: 'RN', cd: 'CD', bp: 'BP', ii: 'II', iii: 'III', iv: 'IV', vi: 'VI', vii: 'VII', viii: 'VIII', ix: 'IX', xi: 'XI' };
const ABREVIATIONS = { av: 'Avenue', ave: 'Avenue', bd: 'Boulevard', bld: 'Boulevard', rte: 'Route', che: 'Chemin', chem: 'Chemin', pl: 'Place', imp: 'Impasse', all: 'Allée', qu: 'Quai', st: 'Saint', ste: 'Sainte', ctre: 'Centre', lieudit: 'Lieu-dit', ld: 'Lieu-dit' };
const ACCENTS = { republique: 'République', general: 'Général', liberation: 'Libération', ecole: 'École', ecoles: 'Écoles', eglise: 'Église', freres: 'Frères', etang: 'Étang', foret: 'Forêt', perigord: 'Périgord', perigueux: 'Périgueux',
  pere: 'Père', mere: 'Mère', eveque: 'Évêque', hotel: 'Hôtel', hopital: 'Hôpital', cite: 'Cité', cites: 'Cités', residence: 'Résidence', metiers: 'Métiers', elysees: 'Élysées', egalite: 'Égalité', fraternite: 'Fraternité',
  deportes: 'Déportés', resistance: 'Résistance', marechal: 'Maréchal', jaures: 'Jaurès', theatre: 'Théâtre', eperon: 'Éperon', epine: 'Épine', ruisseau: 'Ruisseau', lumiere: 'Lumière', verite: 'Vérité' };

// Met en forme une adresse de Sirene (« 95 AV GEORGES POMPIDOU BRION SUD 24700 MONTPON-MENESTEROL ») : sans code postal ni commune, majuscules corrigées, abréviations développées.
function formaterAdresse(adresse, codePostal, libelleCommune) {
  let a = String(adresse || '').replace(/\s+/g, ' ').trim();
  if (codePostal) {
    const k = a.lastIndexOf(String(codePostal));
    if (k >= 0) { a = a.slice(0, k).trim(); }
  }
  a = a.replace(/\bCEDEX\s*\d*\b/i, '').replace(/\b(CS|BP)\s*\d{1,5}\b/gi, '').replace(/^ET\s+(?=\d)/i, '')
    .replace(/\b(?:(?:CENTRE|CTRE|C)\s+)(?:CCIAL|CIAL|COMMERCIAL)\b|\bCCIAL\b/gi, 'CENTRECOMMERCIAL').replace(/\bC C\b/g, 'CENTRECOMMERCIAL').replace(/\bLIEU[ -]DIT\b/gi, 'LIEUDIT')
    .replace(/\s+/g, ' ').trim();
  // « La Feuilleraie La Feuilleraie » : une suite de mots répétée immédiatement n'est écrite qu'une fois.
  a = a.replace(/\b((?:\S+ ){0,3}\S+) \1\b/gi, '$1');
  const mot = (m, premier) => {
    const bas = m.toLowerCase(), sansAccent = norm(bas);
    if (sansAccent === 'centrecommercial') { return premier ? 'Centre commercial' : 'centre commercial'; }
    if (SIGLES[sansAccent]) { return SIGLES[sansAccent]; }
    if (ABREVIATIONS[sansAccent]) { return ABREVIATIONS[sansAccent]; }
    if (/^\d/.test(m)) { return bas; }
    if (ACCENTS[sansAccent]) { return ACCENTS[sansAccent]; }
    if (!premier && MINUSCULES[sansAccent]) { return bas; }
    return bas.charAt(0).toUpperCase() + bas.slice(1);
  };
  const sortie = a.split(' ').filter(Boolean).map((m, i) => {
    // « D'AQUITAINE » : l'élision reste en minuscule, le nom prend la majuscule ; « ST-MEDARD » : chaque partie traitée.
    const ap = m.indexOf("'");
    if (ap > 0 && ap < m.length - 1) { return m.slice(0, ap).toLowerCase() + "'" + mot(m.slice(ap + 1), true); }
    return m.split('-').map((p, j) => (p === '' ? '' : mot(p, i === 0 && j === 0))).join('-');
  }).join(' ');
  return sortie.replace(/\bSaint(e?)-?\s*/g, (t, e) => (t.indexOf('-') !== -1 ? 'Saint' + e + '-' : t));
}

// Les établissements d'une réponse de l'API : on garde ceux qui correspondent à une enseigne configurée et qui sont dans une commune du module.
function extraire(reponse, communes, config, ids) {
  const trouves = [];
  (reponse.results || []).forEach((ent) => {
    const lots = (ent.matching_etablissements || []).slice();
    if (ent.siege) { lots.push(ent.siege); }
    const vus = {};
    lots.forEach((etab) => {
      if (!etab || vus[etab.siret] || !communes[etab.commune]) { return; }
      vus[etab.siret] = true;
      const candidats = [];
      ids.forEach((id) => { const m = correspond(etab, ent, config[id]); if (m) { candidats.push({ id: id, alias: m.alias, via: m.via }); } });
      if (!candidats.length) { return; }
      const c = choisirEnseigne(candidats);
      trouves.push({ id: c.id, via: c.via, siret: etab.siret, lat: Number(etab.latitude), lon: Number(etab.longitude), codeCommune: etab.commune, adresseBrute: etab.adresse, codePostal: etab.code_postal, societe: ent.nom_complet, enseigne: (etab.liste_enseignes || []).join(' / ') });
    });
  });
  return trouves;
}

// ---------- Accès au réseau et cache ----------
function ouvrirCache(dossier) {
  fs.mkdirSync(dossier, { recursive: true });
  const fichier = path.join(dossier, 'cache.json');
  let donnees = {};
  try { donnees = JSON.parse(fs.readFileSync(fichier, 'utf8')); } catch (e) { donnees = {}; }
  let modifs = 0;
  return {
    lire: (k) => donnees[k],
    ecrire: (k, v) => { donnees[k] = v; if (++modifs % 200 === 0) { fs.writeFileSync(fichier, JSON.stringify(donnees)); } },
    fermer: () => fs.writeFileSync(fichier, JSON.stringify(donnees))
  };
}
async function appeler(url, essais) {
  for (let i = 1; i <= (essais || 5); i++) {
    try {
      const r = await fetch(url, { headers: UA });
      const t = await r.text();
      if (r.ok) { return JSON.parse(t); }
      if (r.status === 400 || r.status === 404) { return { results: [], total_pages: 0 }; }
    } catch (e) { /* nouvel essai */ }
    await dormir(2000 * i);
  }
  throw new Error('abandon : ' + url.slice(0, 120));
}
async function pagesDe(cache, urlSansPage, maxPages) {
  const sortie = [];
  for (let p = 1; p <= maxPages; p++) {
    const cle = urlSansPage + '&page=' + p;
    let rep = cache.lire(cle);
    if (!rep) { await dormir(420); rep = await appeler(API + '?' + cle); cache.ecrire(cle, rep); }
    sortie.push(rep);
    if (p >= (rep.total_pages || 1)) { break; }
  }
  return sortie;
}
async function enParallele(taches, nb, fn) {
  let i = 0, fait = 0;
  await Promise.all(Array.from({ length: nb }, async () => {
    while (i < taches.length) { const t = taches[i++]; await fn(t); if (++fait % 100 === 0) { process.stdout.write('  ' + fait + ' / ' + taches.length + '\n'); } }
  }));
}

// Orthographe de la rue avec ses accents : la base nationale des adresses est interrogée ; on ne retient son libellé que s'il désigne la même rue (mêmes mots, accents mis à part).
async function adresseAccentuee(cache, adresse, codePostal) {
  const cle = 'ban|' + codePostal + '|' + adresse;
  let rep = cache.lire(cle);
  if (rep === undefined) {
    try {
      await dormir(60);
      const j = await appeler('https://data.geopf.fr/geocodage/search?limit=1&autocomplete=0&q=' + encodeURIComponent(adresse) + '&postcode=' + encodeURIComponent(codePostal), 3);
      const f = j.features && j.features[0];
      rep = f && f.properties && f.properties.score >= 0.7 ? (f.properties.name || '') : '';
    } catch (e) { rep = ''; }
    cache.ecrire(cle, rep);
  }
  if (rep && norm(rep).replace(/ /g, '') === norm(adresse).replace(/ /g, '')) { return rep; }
  return adresse;
}

// ---------- Numéros de téléphone (OpenStreetMap) ----------
// Sirene ne donne aucun numéro. Les contributeurs d'OpenStreetMap (données ouvertes, licence ODbL : « © contributeurs d'OpenStreetMap ») en renseignent pour une partie des magasins.
// Un numéro n'est retenu que si le point OpenStreetMap porte la même enseigne (alias, mot entier) et se trouve à moins de RAYON_TEL_M mètres du magasin.
const RAYON_TEL_M = 150;
// « +33 5 53 05 65 00 », « 05.53.05.65.00 », « 0553056500 » deviennent « 05 53 05 65 00 » ; plusieurs numéros : le premier ; hors numéro français à 10 chiffres : vide.
function telephoneFrancais(brut) {
  const premier = String(brut || '').split(/[;,/]/)[0];
  let c = premier.replace(/\(0\)/g, '').replace(/[^\d+]/g, '');
  if (c.indexOf('+33') === 0) { c = '0' + c.slice(3); } else if (c.indexOf('0033') === 0) { c = '0' + c.slice(4); }
  if (!/^0[1-9]\d{8}$/.test(c)) { return ''; }
  return c.replace(/(\d{2})(?=\d)/g, '$1 ');
}
function distanceM(a, b) {
  const r = Math.PI / 180, dl = (b.lat - a.lat) * r, dn = (b.lon - a.lon) * r;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}
// Le numéro du point OpenStreetMap le plus proche qui porte la même enseigne, à moins de RAYON_TEL_M mètres ; sinon ''.
function telephoneProche(magasin, points, cfg) {
  if (!isFinite(magasin.lat) || !isFinite(magasin.lon)) { return ''; }
  let meilleur = null, md = Infinity;
  points.forEach((p) => {
    const texte = ' ' + norm((p.nom || '') + ' ' + (p.marque || '')) + ' ';
    if (!cfg.alias.some((a) => texte.indexOf(' ' + norm(a) + ' ') !== -1)) { return; }
    const tel = telephoneFrancais(p.tel);
    if (!tel) { return; }
    const d = distanceM(magasin, p);
    if (d < md) { md = d; meilleur = tel; }
  });
  return md <= RAYON_TEL_M ? meilleur : '';
}
async function pointsOsm(cache) {
  const sortie = [];
  for (const dep of ['24', '87']) {
    const cle = 'osm|' + dep;
    let liste = cache.lire(cle);
    if (!liste) {
      const q = '[out:json][timeout:120];area["ref:INSEE"="' + dep + '"]["admin_level"="6"]->.d;(nwr[~"^(shop|amenity|tourism|craft)$"~"."]["phone"](area.d);nwr[~"^(shop|amenity|tourism|craft)$"~"."]["contact:phone"](area.d););out tags center qt;';
      let j = null;
      for (let i = 1; i <= 4 && !j; i++) {
        try {
          const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'User-Agent': UA['User-Agent'], 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(q) });
          if (r.ok) { j = await r.json(); }
        } catch (e) { /* nouvel essai */ }
        if (!j) { await dormir(8000 * i); }
      }
      if (!j) { console.log('  OpenStreetMap indisponible pour le département ' + dep + ' : numéros non relevés'); continue; }
      liste = j.elements.map((e) => { const t = e.tags || {}, c = e.center || e; return { nom: t.name || '', marque: t.brand || '', tel: t.phone || t['contact:phone'] || '', lat: c.lat, lon: c.lon }; });
      cache.ecrire(cle, liste);
      await dormir(5000);
    }
    liste.forEach((p) => sortie.push(p));
  }
  return sortie;
}

// ---------- Programme principal ----------
function lireCommunes() {
  const parCode = {};
  ['communes-24.txt', 'communes-87.txt'].forEach((f) => {
    L.mtParserCommunes(fs.readFileSync(path.join(CONTENU, f), 'utf8')).lignes.forEach((c) => { parCode[c.code] = c.nom; });
  });
  return parCode;
}
function lireRegistre() {
  const fiches = L.mtParserEmployeurs(fs.readFileSync(path.join(CONTENU, 'employeurs.txt'), 'utf8')).lignes;
  const parId = {};
  fiches.forEach((e) => { parId[e.id] = e; });
  return parId;
}

// Numéros relevés à la main sur les sites officiels (scripts/magasinsTelephonesOfficiels.txt) : { id, commune, adresse, telephone }.
function lireTelephonesOfficiels(fichier) {
  let texte = '';
  try { texte = fs.readFileSync(fichier || path.join(__dirname, 'magasinsTelephonesOfficiels.txt'), 'utf8'); } catch (e) { return []; }
  const sortie = [];
  texte.split(/\r?\n/).forEach((l) => {
    if (!l.trim() || l.trim()[0] === '#') { return; }
    const c = l.split(' | ');
    const tel = c.length >= 4 ? telephoneFrancais(c[3]) : '';
    if (tel) { sortie.push({ id: c[0].trim(), commune: c[1].trim(), adresse: c[2].trim(), telephone: tel }); }
  });
  return sortie;
}
function telephoneOfficiel(officiels, magasin) {
  const t = officiels.filter((o) => o.id === magasin.id && norm(o.commune) === norm(magasin.commune) &&
    (norm(o.adresse) === norm(magasin.adresse) || L.mtMemeAdresse(o.adresse, magasin.adresse, magasin.commune)))[0];
  return t ? t.telephone : '';
}

async function main() {
  const args = process.argv.slice(2);
  const val = (nom) => { const k = args.indexOf(nom); return k >= 0 ? args[k + 1] : null; };
  const dossierCache = val('--cache') || path.join(os.tmpdir(), 'magasins-sirene');
  const seulement = val('--seulement') ? val('--seulement').split(',') : null;
  const essai = args.indexOf('--essai') !== -1, sansBan = args.indexOf('--sans-adresses-exactes') !== -1;
  const communes = lireCommunes();
  const registre = lireRegistre();
  const ids = Object.keys(ENSEIGNES).filter((id) => registre[id] && registre[id].nature === 'enseigne' && (!seulement || seulement.indexOf(id) !== -1));
  const ignores = Object.keys(ENSEIGNES).filter((id) => !registre[id]);
  const config = {};
  ids.forEach((id) => { config[id] = ENSEIGNES[id]; });
  console.log('Communes :', Object.keys(communes).length, '| enseignes traitées :', ids.length, '| enseignes de la config absentes du registre (ignorées) :', ignores.join(', ') || 'aucune');
  const cache = ouvrirCache(dossierCache);
  const parSiret = {};
  const ajouter = (liste) => liste.forEach((x) => { if (!parSiret[x.siret]) { parSiret[x.siret] = x; } });

  // A. Par commune : le commerce (section G) de chaque commune.
  // Les mêmes filtres que scripts/decouvrirEnseignesSirene.js (G : commerce et automobile ; I : hébergement et restauration ; S : coiffure et beauté), donc les mêmes pages en cache.
  const FILTRES = { G: 'section_activite_principale=G', I: 'section_activite_principale=I', S: 'activite_principale=96.02A,96.02B' };
  const sections = {};
  ids.forEach((id) => config[id].naf.forEach((p) => { if (/^(45|46|47)/.test(p)) { sections.G = true; } else if (/^(55|56)/.test(p)) { sections.I = true; } else if (/^96/.test(p)) { sections.S = true; } }));
  for (const s of Object.keys(sections)) {
    console.log('Relevé A : section ' + s + ' de chaque commune');
    await enParallele(Object.keys(communes), 3, async (code) => {
      const reps = await pagesDe(cache, 'code_commune=' + code + '&' + FILTRES[s] + '&etat_administratif=A&per_page=25', 300);
      reps.forEach((r) => ajouter(extraire(r, communes, config, ids)));
    });
  }
  // B. Par enseigne : une recherche par nom dans chaque département.
  console.log('Relevé B : recherche par nom, par département');
  const taches = [];
  ids.forEach((id) => { if (config[id].parDepartement !== false) { config[id].alias.forEach((alias) => ['24', '87'].forEach((dep) => taches.push({ id: id, alias: alias, dep: dep }))); } });
  await enParallele(taches, 3, async (t) => {
    const reps = await pagesDe(cache, 'q=' + encodeURIComponent(t.alias) + '&departement=' + t.dep + '&etat_administratif=A&per_page=25', 12);
    reps.forEach((r) => ajouter(extraire(r, communes, config, ids)));
  });

  // Mise en forme : adresse lisible (avec accents quand la base nationale les confirme), une ligne par enseigne.
  const parEnseigne = {};
  const lignes = Object.values(parSiret);
  const avecTel = args.indexOf('--sans-telephones') === -1;
  const points = avecTel ? await pointsOsm(cache) : [];
  const officiels = lireTelephonesOfficiels();
  if (avecTel) { console.log('Points OpenStreetMap avec numéro :', points.length); }
  console.log('Établissements retenus (avant mise en forme) :', lignes.length);
  for (const x of lignes) {
    const nomCommune = communes[x.codeCommune];
    let adresse = formaterAdresse(x.adresseBrute, x.codePostal, nomCommune);
    if (!sansBan && adresse) { adresse = await adresseAccentuee(cache, adresse, x.codePostal); }
    x.adresse = adresse; x.commune = nomCommune;
    x.telephone = avecTel ? telephoneProche(x, points, config[x.id]) : '';
    if (!x.telephone) { x.telephone = telephoneOfficiel(officiels, x); }
    (parEnseigne[x.id] = parEnseigne[x.id] || []).push(x);
  }
  cache.fermer();

  const aujourdhui = new Date().toISOString().slice(0, 10);
  const sortie = [];
  const rapport = [];
  Object.keys(parEnseigne).sort().forEach((id) => {
    const gardes = [];
    const liste = parEnseigne[id].filter((x) => {
      if (gardes.some((g) => norm(g.commune) === norm(x.commune) && (norm(g.adresse) === norm(x.adresse) || L.mtMemeAdresse(g.adresse, x.adresse, x.commune)))) { return false; }
      gardes.push(x); return true;
    }).sort((a, b) => (norm(a.commune) < norm(b.commune) ? -1 : norm(a.commune) > norm(b.commune) ? 1 : norm(a.adresse) < norm(b.adresse) ? -1 : 1));
    sortie.push(id + ' | ' + liste.map((x) => x.commune + ':' + x.adresse + (x.telephone ? ':' + x.telephone : '')).join(' ; '));
    const nbCommunes = new Set(liste.map((x) => x.commune)).size, viaSociete = liste.filter((x) => x.via === 'societe').length;
    rapport.push(id + ' : ' + liste.length + ' magasin(s) dans ' + nbCommunes + ' commune(s), ' + liste.filter((x) => x.telephone).length + ' avec numéro' + (viaSociete ? ' (dont ' + viaSociete + ' reconnu(s) par la raison sociale seulement)' : ''));
  });
  const sansMagasin = ids.filter((id) => !parEnseigne[id]);
  rapport.push('Aucun magasin trouvé pour : ' + (sansMagasin.join(', ') || 'aucune enseigne'));
  console.log('\n' + rapport.join('\n'));
  fs.writeFileSync(path.join(dossierCache, 'rapport.txt'), rapport.join('\n') + '\n');
  fs.writeFileSync(path.join(dossierCache, 'details.json'), JSON.stringify(parEnseigne, null, 1));
  if (essai) { console.log('\nEssai : le fichier du module n\'est pas écrit.'); return; }
  const entete = [
    '# Magasins des enseignes du registre, relevés dans le registre officiel des entreprises (Sirene).',
    '# FICHIER PRODUIT PAR scripts/genererMagasinsSirene.js : ne jamais le modifier à la main (relancer le script). Relevé du ' + aujourdhui + '.',
    '# Source : API « Recherche d\'entreprises » (recherche-entreprises.api.gouv.fr), données ouvertes sous Licence Ouverte 2.0 ; adresses d\'après la base nationale des adresses quand elle confirme la rue ; numéros de téléphone d\'après © les contributeurs d\'OpenStreetMap (licence ODbL), retenus à moins de 150 m du magasin et pour la même enseigne, ou relevés sur le site officiel de l\'enseigne (scripts/magasinsTelephonesOfficiels.txt).',
    '# Format : identifiant de la fiche « enseigne » de employeurs.txt | Commune:adresse ; Commune:adresse. Les adresses saisies à la main dans employeurs.txt l\'emportent, sans doublon.',
    '# Le registre des entreprises est incomplet : un magasin absent d\'ici peut être ajouté à la main dans employeurs.txt.',
    ''
  ].join('\n');
  fs.writeFileSync(SORTIE, entete + sortie.join('\n') + '\n', 'utf8');
  console.log('\nÉcrit :', path.relative(RACINE, SORTIE), '(' + sortie.length + ' enseignes)');
}

module.exports = { lireTelephonesOfficiels, telephoneOfficiel, telephoneFrancais, telephoneProche, distanceM, citeAlias, correspond, choisirEnseigne, formaterAdresse, extraire, ouvrirCache, pagesDe, enParallele, lireCommunes, lireRegistre };
if (require.main === module) { main().catch((e) => { console.error('ERREUR', e.message); process.exit(1); }); }
