/* ============================================================
   prospectionStructures.js : prospection des structures pour l'outil de veille (consigne 270, 12/11/2026)
   ------------------------------------------------------------
   Ce que fait ce script, sur le poste de Denis (le petit serveur de l'outil de veille n'a volontairement pas accès à Internet pour ça) :
     1. télécharge le fichier des structures de data.inclusion (data.gouv.fr, Licence Ouverte 2.0) ou lit un fichier déjà téléchargé ;
     2. garde la Dordogne et la Haute-Vienne, les fiches mises à jour depuis moins de 12 mois, avec un téléphone ou un site en https ;
     3. écarte les écoles, collèges, comités d'entreprise et la source « formation » ;
     4. vérifie chaque SIRET auprès de la base officielle des entreprises (gratuite, sans clé) : les établissements fermés sont écartés ;
     5. retire ce que le registre « Qui fait quoi » et le sas des structures contiennent déjà ;
     6. écrit son résultat dans outils/prospection_structures/resultat.json (dossier ignoré par Git).
   Il N'ÉCRIT JAMAIS dans le registre ni dans le sas : Denis choisit, puis le « C'est bon » de l'outil de veille fait le reste.
   « Rien n'est deviné » : un type et des rayons ne sont proposés que si le réseau porteur de la fiche le dit clairement ; sinon la fiche est « à classer à la main ».
   Utilisation : node scripts/prospectionStructures.js [--fichier chemin.csv] [--fichier-finess chemin.json.gz] [--sans-finess] [--sans-officiel] [--force]
   Deuxième source (décision de Denis du 13/11/2026) : le fichier FINESS des établissements sociaux et médico-sociaux (ministère de la Santé), lu en flux, liste gardée 30 jours.
   Le même travail est lancé par le bouton « Chercher de nouvelles structures » de l outil de veille (outils/veilleProspection.js).
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const DEPARTEMENTS = { '24': 'Dordogne', '87': 'Haute-Vienne' };
const MOIS_MAX = 12;
const URL_JEU = 'https://www.data.gouv.fr/api/1/datasets/referentiel-de-loffre-dinsertion-sociale-et-professionnelle-data-inclusion/';
const DOSSIER_SORTIE_DEFAUT = path.resolve(__dirname, '..', 'outils', 'prospection_structures');

// Écartés d'office, avec la raison dite à Denis. Le fichier des formations (carif-oref) n'est PAS écarté en bloc : seuls ses écoles, collèges et universités le sont.
const NOMS_ECARTES = [
  { re: /\b(coll[eè]ge|lyc[eé]e|[eé]cole|eplefpa|universit[eé]|enseignement et de formation professionnelle)\b/i, raison: 'école, collège, lycée ou université' },
  { re: /\b(comit[eé] (d['’ ]?)?entreprise|cse)\b/i, raison: 'comité interne à une entreprise, pas un lieu ouvert au public' }
];

// Type et rayons proposés SEULEMENT quand le réseau porteur ou la source le dit clairement (ordre = priorité). Les types et rayons sont ceux du registre.
const CLASSEMENT = [
  { reseaux: ['plie'], type: 'plie', rayons: 'emploi,accompagnement' },
  { reseaux: ['ei', 'aci', 'etti', 'geiq', 'chantier-ecole', 'ai'], type: 'siae', rayons: 'emploi,accompagnement' },
  { reseaux: ['mission-locale'], type: 'mission-locale', rayons: 'jeunes,emploi' },
  { reseaux: ['cap-emploi-reseau-cheops'], type: 'cap-emploi', rayons: 'handicap,emploi' },
  { reseaux: ['esat'], type: 'handicap', rayons: 'handicap,emploi' },
  { reseaux: ['ccas-cias'], type: 'ccas', rayons: 'accompagnement' },
  { reseaux: ['france-travail'], type: 'france-travail', rayons: 'emploi' },
  { reseaux: ['france-service'], type: 'france-services', rayons: 'accompagnement' },
  { reseaux: ['aidants-connect', 'conseillers-numeriques'], type: 'inclusion-numerique', rayons: 'accompagnement' }
];
const SOURCES_CLASSEES = { 'mediation-numerique': { type: 'inclusion-numerique', rayons: 'accompagnement' } };

function normaliser(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
// Date du jour sur le poste de Denis (heure locale, pas UTC : entre minuit et 1 h elle n'est pas la même).
function dateDuJour() { const d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function dateFr(iso) { return String(iso || '').split('-').reverse().join('/'); }

// Analyseur CSV (guillemets, virgules et retours à la ligne dans les champs).
function parserCsv(texte) {
  const lignes = []; let champ = '', ligne = [], entre = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (entre) { if (c === '"') { if (texte[i + 1] === '"') { champ += '"'; i++; } else { entre = false; } } else { champ += c; } }
    else if (c === '"') { entre = true; }
    else if (c === ',') { ligne.push(champ); champ = ''; }
    else if (c === '\n') { ligne.push(champ.replace(/\r$/, '')); lignes.push(ligne); ligne = []; champ = ''; }
    else { champ += c; }
  }
  if (champ || ligne.length) { ligne.push(champ.replace(/\r$/, '')); lignes.push(ligne); }
  const entete = lignes.shift() || [];
  return lignes.filter(function (l) { return l.length === entete.length; }).map(function (l) { const o = {}; entete.forEach(function (k, i) { o[k] = l[i]; }); return o; });
}

function departementDe(r) { const c = String(r.code_insee || ''); return c.indexOf('97') === 0 ? c.slice(0, 3) : c.slice(0, 2); }
function moisEcoules(dateIso, aujourdhui) { return (new Date(aujourdhui) - new Date(dateIso)) / 86400000 / 30.4; }
function listeReseaux(r) { return String(r.reseaux_porteurs || '').replace(/[\[\]' ]/g, '').split(',').filter(Boolean); }

// Téléphone au format du registre (« 05 53 80 86 86 ») ; '' si ce n'est pas un numéro à 10 chiffres.
function telephoneFormate(t) {
  let n = String(t || '').replace(/\D/g, '');
  if (n.indexOf('33') === 0 && n.length === 11) { n = '0' + n.slice(2); }
  return n.length === 10 && n[0] === '0' ? n.replace(/(\d\d)(?=\d)/g, '$1 ').trim() : '';
}
// Adresse du registre : « numéro, rue, code postal, commune ». Le fichier FINESS écrit tout en majuscules : on met une casse lisible (les accents manquants restent à relire).
function adresseLisible(adresse, cp, commune) {
  let rue = String(adresse || '').replace(/\s+/g, ' ').trim();
  if (!rue) { return { texte: '', converti: false }; }
  let converti = false;
  if (rue === rue.toUpperCase() && /[A-Z]{3}/.test(rue)) {
    converti = true;
    rue = rue.toLowerCase().replace(/(^|[\s'’-])([a-zà-ÿ])/g, function (m, avant, lettre) { return avant + lettre.toUpperCase(); }).replace(/(\s)(De|Du|Des|La|Le|Les|Et|En|Au|Aux|Sur|Sous)(?=\s)/g, function (m, esp, mot) { return esp + mot.toLowerCase(); }).replace(/(\s)([DL])'/g, function (m, esp, l) { return esp + l.toLowerCase() + "'"; });
  }
  const fin = [String(cp || '').trim(), String(commune || '').trim()].filter(Boolean).join(' ');
  return { texte: rue + (fin ? ', ' + fin : ''), converti: converti };
}
// Met l'adresse du fichier dans la fiche (c.adresseRegistre) et dans sa ligne du sas (colonnes ... | date | mail | adresse). Sans adresse, la ligne garde ses 12 colonnes.
// Sert aussi à mettre à niveau un ancien résultat.json (écrit avant l'ajout de l'adresse) : rien n'est ajouté deux fois.
function ajouterAdresse(c) {
  if (c.adresseRegistre !== undefined) { return c; }
  const adr = adresseLisible(c.adresse, c.cp, c.commune);
  c.adresseRegistre = adr.texte;
  if (adr.converti) { c.avertissements.push('adresse écrite en majuscules dans le fichier : casse refaite, accents à relire'); }
  if (c.ligne && adr.texte) { const p = c.ligne.split(' | '); if (p.length === 12) { c.ligne = p.concat(['', adr.texte]).join(' | '); } }
  return c;
}
function siteHttps(s) { return /^https:\/\/\S+$/.test(String(s || '').trim()) ? String(s).trim() : ''; }
function estReseauSocial(s) { return /^https:\/\/([a-z0-9-]+\.)*(facebook|instagram|linkedin|x|twitter|tiktok|youtube)\./i.test(s || ''); }

function classer(r) {
  if (r.finess && FINESS_CATEGORIES[r.finess.categorie]) { return { type: FINESS_CATEGORIES[r.finess.categorie].type, rayons: FINESS_CATEGORIES[r.finess.categorie].rayons }; }
  const reseaux = listeReseaux(r);
  for (let i = 0; i < CLASSEMENT.length; i++) { if (CLASSEMENT[i].reseaux.some(function (x) { return reseaux.indexOf(x) !== -1; })) { return { type: CLASSEMENT[i].type, rayons: CLASSEMENT[i].rayons }; } }
  return SOURCES_CLASSEES[r.source] || null;
}

function slug(s) { return normaliser(s).replace(/ /g, '-').slice(0, 70).replace(/-+$/, ''); }
// Identifiant : le nom, plus la commune seulement si le nom ne la contient pas déjà.
function identifiant(nom, commune, dep) { const n = normaliser(nom), cm = normaliser(commune); return slug(cm && n.indexOf(cm) === -1 ? nom + ' ' + commune : nom) + '-' + dep; }

// Ce que le registre et le sas contiennent déjà : téléphones (9 derniers chiffres), pages de site, noms.
function empreinteExistante(texteLieux) {
  const tels = new Set(), pages = new Set(), noms = [];
  String(texteLieux || '').split(/\r?\n/).filter(function (l) { return l && l.charAt(0) !== '#'; }).forEach(function (l) {
    const p = l.split('|').map(function (x) { return x.trim(); });
    const t = (p[6] || '').replace(/\D/g, '').slice(-9); if (t.length === 9) { tels.add(t); }
    try { const u = new URL(p[7]); pages.add(u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/$/, '')); } catch (e) { /* aucune adresse */ }
    if (p[2]) { noms.push(normaliser(p[2])); }
    if (p[0]) { noms.push('id:' + p[0]); }
  });
  return { tels: tels, pages: pages, noms: noms };
}
function dejaConnue(c, emp) {
  const t = c.tel.replace(/\D/g, '').slice(-9);
  if (t.length === 9 && emp.tels.has(t)) { return 'même téléphone'; }
  if (c.site) { try { const u = new URL(c.site); if (emp.pages.has(u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/$/, ''))) { return 'même page web'; } } catch (e) { /* ignoré */ } }
  const n = normaliser(c.nom);
  if (emp.noms.some(function (x) { return x === n || (n.length > 10 && x.indexOf('id:') !== 0 && (x.indexOf(n) !== -1 || n.indexOf(x) !== -1) && x.length > 10); })) { return 'même nom'; }
  if (emp.noms.indexOf('id:' + c.id) !== -1) { return 'même identifiant'; }
  return '';
}

// Recoupement du registre (consigne 270, suite) : pour chaque fiche DÉJÀ publiée (24 et 87), on cherche la même structure dans le fichier
// (même téléphone, même page web, ou même nom dans la même commune) et on relève les écarts. Ne modifie rien : rend une liste « à regarder ».
function hoteDe(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
function pageDe(u) { try { const x = new URL(u); return x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/$/, ''); } catch (e) { return ''; } }
function recouper(lignesCsv, texteLieux, options) {
  const o = options || {};
  const officiel = o.officiel || {};
  const parTel = {}, parPage = {}, parNom = {};
  const poser = function (index, cle, r) { if (cle) { (index[cle] = index[cle] || []).push(r); } };
  lignesCsv.forEach(function (r) {
    if (!DEPARTEMENTS[departementDe(r)]) { return; }
    const t = telephoneFormate(r.telephone).replace(/\D/g, '').slice(-9);
    poser(parTel, t.length === 9 ? t : '', r);
    poser(parPage, pageDe(siteHttps(r.site_web)), r);
    poser(parNom, normaliser(r.nom) + '|' + normaliser(r.commune), r);
  });
  const recent = function (liste) { return liste.slice().sort(function (a, b) { return String(b.date_maj).localeCompare(String(a.date_maj)); })[0]; };
  let recoupees = 0, sansEcart = 0, total = 0;
  const aRevoir = [], sirets = new Set(), siretsRegistre = {};
  const lignesRegistre = String(texteLieux || '').split(/\r?\n/).filter(function (l) { return l && l.charAt(0) !== '#'; }).map(function (l) { return l.split('|').map(function (x) { return x.trim(); }); }).filter(function (p) { return DEPARTEMENTS[p[8]]; });
  // Un même téléphone ou un même site partagé par plusieurs fiches du registre (antennes d'un même organisme) : on ne compare pas l'autre information, ce serait de fausses alertes.
  const nbTel = {}, nbPage = {};
  lignesRegistre.forEach(function (p) { const t = (p[6] || '').replace(/\D/g, '').slice(-9), g = pageDe(p[7]); if (t.length === 9) { nbTel[t] = (nbTel[t] || 0) + 1; } if (g) { nbPage[g] = (nbPage[g] || 0) + 1; } });
  lignesRegistre.forEach(function (p) {
    total++;
    const tel = (p[6] || '').replace(/\D/g, '').slice(-9), page = pageDe(p[7]), nom = normaliser(p[2]) + '|' + normaliser(p[4]);
    let lien = '', r = null;
    if (tel.length === 9 && parTel[tel]) { lien = 'tel'; r = recent(parTel[tel]); }
    else if (page && parPage[page]) { lien = 'page'; r = recent(parPage[page]); }
    else if (parNom[nom]) { lien = 'nom'; r = recent(parNom[nom]); }
    if (!r) { return; }
    recoupees++;
    if (/^\d{14}$/.test(r.siret || '')) { sirets.add(r.siret); siretsRegistre[r.siret] = { id: p[0], nom: p[2] }; }
    const raisons = [];
    const off = r.siret ? officiel[r.siret] : null;
    if (off && off.etat === 'F') { raisons.push('établissement fermé selon la base officielle (peut-être un simple déménagement)'); }
    const telSource = telephoneFormate(r.telephone), telSrc9 = telSource.replace(/\D/g, '').slice(-9);
    if (lien !== 'tel' && !(lien === 'page' && nbPage[page] > 1) && tel.length === 9 && telSrc9.length === 9 && telSrc9 !== tel) { raisons.push('la source donne un autre téléphone : ' + telSource); }
    const siteSource = siteHttps(r.site_web);
    if (lien !== 'page' && !(lien === 'tel' && nbTel[tel] > 1) && p[7] && siteSource && !estReseauSocial(siteSource) && hoteDe(siteSource) !== hoteDe(p[7])) { raisons.push('la source donne un autre site : ' + siteSource); }
    if (!raisons.length) { sansEcart++; return; }
    aRevoir.push({ id: p[0], type: p[1], nom: p[2], commune: p[4], dep: p[8], telRegistre: p[6] || '', siteRegistre: p[7] || '', raisons: raisons, retrouveParLe: lien === 'tel' ? 'téléphone' : (lien === 'page' ? 'site' : 'nom et commune'), sourceNom: r.nom, sourceTel: telSource, sourceSite: siteSource, sourceMaj: r.date_maj, siret: r.siret || '' });
  });
  // D'abord les fermées, puis les téléphones différents, puis les sites différents (souvent une page d'annuaire dans le registre : moins grave).
  const rang = function (x) { return x.raisons.some(function (z) { return /fermé/.test(z); }) ? 0 : (x.raisons.some(function (z) { return /téléphone/.test(z); }) ? 1 : 2); };
  aRevoir.sort(function (a, b) { return rang(a) - rang(b) || a.nom.localeCompare(b.nom); });
  return { total: total, recoupees: recoupees, sansEcart: sansEcart, aRevoir: aRevoir, sirets: Array.from(sirets), siretsRegistre: siretsRegistre };
}

// Ressemblance avec une fiche déjà publiée (consigne 270, suite 3) : la même structure peut porter un autre nom, un autre téléphone ou un autre site.
// Règles : même département ET (a) au moins 2 mots significatifs communs, couvrant au moins les deux tiers du plus petit des deux noms, OU (b) même commune, au moins 3 mots
// significatifs et un sigle du registre (3 à 7 lettres) qui est contenu dans les initiales du nom. Ne tranche rien : sert à avertir, la décision reste à Denis.
const MOTS_VIDES = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'au', 'aux', 'd', 'l', 'a', 'un', 'une', 'pour', 'sur']);
const MOTS_NEUTRES = new Set(['communaute', 'communes', 'commune', 'centre', 'service', 'services', 'association', 'asso', 'nat', 'cc', 'cias', 'ccas']);
function motsSignificatifs(nom) { return normaliser(nom).split(' ').filter(function (t) { return t.length > 2 && !MOTS_VIDES.has(t) && !MOTS_NEUTRES.has(t); }); }
function initiales(nom) { return normaliser(nom).split(' ').filter(function (t) { return t && !MOTS_VIDES.has(t); }).map(function (t) { return t.charAt(0); }).join(''); }
function registreParse(texteLieux) {
  return String(texteLieux || '').split(/\r?\n/).filter(function (l) { return l && l.charAt(0) !== '#'; }).map(function (l) { const p = l.split('|').map(function (x) { return x.trim(); }); return { id: p[0], nom: p[2], commune: p[4], dep: p[8], type: p[1], tel: p[6], site: p[7], adresse: p[13] || '', mots: motsSignificatifs(p[2] || '') }; });
}
function ressemble(c, registre) {
  const mc = motsSignificatifs(c.nom), cm = normaliser(c.commune), ini = initiales(c.nom), trouves = [];
  registre.forEach(function (r) {
    if (r.dep !== c.dep) { return; }
    const communs = mc.filter(function (t) { return r.mots.indexOf(t) !== -1; }).length, petit = Math.min(mc.length, r.mots.length);
    const nomProche = communs >= 2 && petit > 0 && communs / petit >= 0.66;
    const sigle = cm && normaliser(r.commune) === cm && mc.length >= 3 && r.mots.some(function (t) { return t.length >= 3 && t.length <= 7 && ini.indexOf(t) !== -1; });
    if (nomProche || sigle) { trouves.push({ r: r, score: (petit ? communs / petit : 0) + communs * 0.01 + (normaliser(r.commune) === cm ? 0.05 : 0) }); }
  });
  // Les plus proches d'abord (c'est la première qui compte pour Denis).
  return trouves.sort(function (a, b) { return b.score - a.score; }).slice(0, 2).map(function (x) { return x.r; });
}

// Cœur du travail, sans réseau ni fichier : reçoit les lignes du CSV, les fiches officielles déjà lues (cache par SIRET) et ce qui existe déjà.
function preparer(lignesCsv, options) {
  const o = options || {};
  const aujourdhui = o.aujourdhui;
  const officiel = o.officiel || {};
  const emp = empreinteExistante(o.lieuxExistants || '');
  const registre = registreParse(o.lieuxExistants || '');
  const compte = { departements: 0, recentes: 0, sansContact: 0, ecartees: 0, fermees: 0, dejaConnues: 0, doublonsSources: 0, candidates: 0 };
  const ecartees = [], candidates = [];
  lignesCsv.forEach(function (r) {
    const dep = departementDe(r);
    if (!DEPARTEMENTS[dep]) { return; }
    compte.departements++;
    if (!r.date_maj || isNaN(new Date(r.date_maj)) || moisEcoules(r.date_maj, aujourdhui) > MOIS_MAX || moisEcoules(r.date_maj, aujourdhui) < 0) { return; }
    compte.recentes++;
    const tel = telephoneFormate(r.telephone), site = siteHttps(r.site_web);
    if (!tel && !site) { compte.sansContact++; return; }
    const nom = String(r.nom || '').trim();
    const cleDeLaFiche = cleNom(nom, r.commune, dep), remise = !!(o.remises && o.remises[cleDeLaFiche]);   // remise en jeu par Denis : les règles d'écart d'office ne s'appliquent plus
    const sur = function (raison) { compte.ecartees++; ecartees.push({ cle: cleDeLaFiche, nom: nom, commune: r.commune, dep: dep, source: r.source, raison: raison }); };
    const nomEcarte = remise ? null : NOMS_ECARTES.find(function (x) { return x.re.test(nom); });
    if (nomEcarte) { return sur(nomEcarte.raison); }
    const off = r.siret ? officiel[r.siret] : null;
    if (off && off.etat === 'F' && !remise) { compte.fermees++; ecartees.push({ cle: cleDeLaFiche, nom: nom, commune: r.commune, dep: dep, source: r.source, raison: 'établissement fermé selon la base officielle (peut-être un simple déménagement)' }); return; }
    const c = {
      id: identifiant(nom, r.commune, dep), nom: nom, commune: r.commune, cp: r.code_postal, dep: dep, adresse: r.adresse, tel: tel, site: site, source: r.source,
      majFiche: r.date_maj, reseaux: listeReseaux(r), siret: r.siret || '', etatOfficiel: !r.siret ? 'aucun SIRET' : (off ? (off.etat === 'A' ? 'actif' : 'inconnu') : 'non vérifié'),
      texteSource: r.finess ? ('Fichier FINESS (établissements sanitaires, sociaux et médico-sociaux) : ' + r.finess.label + (r.finess.gestionnaire ? ', géré par ' + r.finess.gestionnaire : '') + '. Aucune description ni aucun site dans ce fichier.') : String(r.description || '').replace(/\s+/g, ' ').trim().slice(0, 300),
      avertissements: [], origine: r.finess ? 'finess' : 'inclusion', categorie: r.finess ? r.finess.label : ''
    };
    const connue = dejaConnue(c, emp);
    if (connue) { compte.dejaConnues++; return; }
    const cl = classer(r);
    c.type = cl ? cl.type : ''; c.rayons = cl ? cl.rayons : ''; c.aClasser = !cl;
    if (!r.siret) { c.avertissements.push('existence à confirmer : aucun SIRET, la base officielle ne peut pas la confirmer'); }
    if (off && off.etat === 'A' && off.commune && normaliser(off.commune) !== normaliser(r.commune)) { c.avertissements.push('commune différente de la base officielle (' + off.commune + ')'); }
    ressemble(c, registre).forEach(function (x) { c.avertissements.push('ressemble à une fiche déjà publiée : ' + x.nom + (x.commune ? ' (' + x.commune + ')' : '')); });
    if (r.finess) { c.avertissements.push('nom repris du fichier FINESS : abréviations et accents à relire, et phrase d\'explication à écrire (le fichier ne donne ni site ni description)'); }
    if (r.source === 'carif-oref') { c.avertissements.push('vient du fichier des formations : à regarder de près'); }
    if (r.site_web && !site) { c.avertissements.push('site en http : non repris (une adresse https est exigée)'); }
    if (site && estReseauSocial(site)) { c.avertissements.push('le site est une page de réseau social'); }
    if (nom === nom.toUpperCase() && /[A-Z]{4}/.test(nom)) { c.avertissements.push('nom tout en majuscules : à réécrire'); }
    candidates.push(c);
  });
  // Une structure présente dans les deux sources (même téléphone) : on garde la fiche de data.inclusion, plus complète.
  const telsInclusion = new Set(); candidates.forEach(function (c) { if (c.origine === 'inclusion' && c.tel) { telsInclusion.add(c.tel.replace(/\D/g, '').slice(-9)); } });
  for (let i = candidates.length - 1; i >= 0; i--) { const c = candidates[i]; if (c.origine === 'finess' && c.tel && telsInclusion.has(c.tel.replace(/\D/g, '').slice(-9))) { candidates.splice(i, 1); compte.doublonsSources = (compte.doublonsSources || 0) + 1; } }
  // Même téléphone donné à plusieurs fiches : souvent une même association avec plusieurs sites.
  const parTel = {}; candidates.forEach(function (c) { const t = c.tel ? c.tel.replace(/\D/g, '').slice(-9) : ''; if (t) { parTel[t] = (parTel[t] || 0) + 1; } });
  candidates.forEach(function (c) { const t = c.tel ? c.tel.replace(/\D/g, '').slice(-9) : ''; if (t && parTel[t] > 1) { c.avertissements.push('le même téléphone est donné à ' + parTel[t] + ' fiches : même association ? à regrouper ou à garder séparées'); } });
  // Même site donné à plusieurs fiches : suspect (ex. un site d'association pour des mairies).
  const parSite = {}; candidates.forEach(function (c) { if (c.site) { parSite[c.site] = (parSite[c.site] || 0) + 1; } });
  candidates.forEach(function (c) { if (c.site && parSite[c.site] > 1) { c.avertissements.push('le même site est donné à ' + parSite[c.site] + ' fiches : à contrôler'); } });
  // Identifiants uniques.
  const vus = {}; candidates.forEach(function (c) { if (vus[c.id]) { vus[c.id]++; c.id = c.id.replace(/-(24|87)$/, '-' + vus[c.id] + '-$1'); } else { vus[c.id] = 1; } });
  // Classement : fiches utiles d'abord (classées, SIRET actif, deux moyens de contact), puis les plus récentes.
  const points = function (c) { return (c.aClasser ? 0 : 4) + (c.etatOfficiel === 'actif' ? 2 : 0) + (c.tel && c.site ? 1 : 0); };
  candidates.sort(function (a, b) { return points(b) - points(a) || b.majFiche.localeCompare(a.majFiche); });
  candidates.forEach(function (c) {
    const source = (c.origine === 'finess' ? 'FINESS, ' + c.categorie + ', fichier du ' : 'data.inclusion (' + c.source + '), fiche du ') + dateFr(c.majFiche) + (c.etatOfficiel === 'actif' ? ' ; base officielle : active' : '') + ' ; à vérifier';
    // Colonnes du registre : ... | source | date | mail | adresse. La date reste vide (elle se met au « C'est bon »), le mail aussi ; sans adresse, la ligne garde ses 12 colonnes d'origine.
    c.ligne = c.aClasser ? '' : [c.id, c.type, c.nom, '', c.commune, '', c.tel, c.site, c.dep, c.rayons, source, ''].join(' | ');
    ajouterAdresse(c);
  });
  compte.candidates = candidates.length;
  return { compte: compte, candidates: candidates, ecartees: ecartees };
}

// ------------------------------------------------------------ deuxième source : FINESS (consigne 270, suite 5, décision de Denis du 13/11/2026)
// Fichier des établissements sanitaires, sociaux et médico-sociaux (ministère de la Santé, ANS ; data.gouv.fr, Licence Ouverte 2.0).
// On ne garde que les établissements OUVERTS de la Dordogne et de la Haute-Vienne dans les catégories utiles. Ils sont ensuite traités comme ceux de data.inclusion :
// mêmes contrôles (base officielle par le SIRET, registre, sas, doublons, écartées). FINESS ne donne ni site web ni description : la phrase est à écrire.
const URL_JEU_FINESS = 'https://www.data.gouv.fr/api/1/datasets/finess-structures-1/';
const FINESS_REUTILISATION_JOURS = 30;
const FINESS_CATEGORIES = {
  214: { label: 'hébergement et réinsertion sociale (CHRS)', type: 'logement-hebergement', rayons: 'accompagnement,logement' },
  219: { label: 'hébergement d’insertion et d’urgence', type: 'logement-hebergement', rayons: 'accompagnement,logement' },
  257: { label: 'foyer de jeunes travailleurs ou résidence sociale', type: 'logement-hebergement', rayons: 'jeunes,logement' },
  258: { label: 'maison relais', type: 'logement-hebergement', rayons: 'accompagnement,logement' },
  259: { label: 'résidence sociale', type: 'logement-hebergement', rayons: 'logement' },
  216: { label: 'résidence hôtelière à vocation sociale', type: 'logement-hebergement', rayons: 'logement' },
  451: { label: 'accueil de jour', type: 'logement-hebergement', rayons: 'accompagnement' },
  213: { label: 'lits d’accueil médicalisés', type: 'logement-hebergement', rayons: 'logement,sante' },
  180: { label: 'lits halte soins santé', type: 'logement-hebergement', rayons: 'logement,sante' },
  165: { label: 'appartements de coordination thérapeutique', type: 'logement-hebergement', rayons: 'logement,sante' },
  442: { label: 'centre provisoire d’hébergement (réfugiés)', type: 'accueil-etrangers', rayons: 'etranger,logement' },
  443: { label: 'accueil de demandeurs d’asile (CADA)', type: 'accueil-etrangers', rayons: 'etranger' },
  246: { label: 'ESAT', type: 'handicap', rayons: 'handicap,emploi' },
  247: { label: 'atelier protégé ou entreprise adaptée', type: 'handicap', rayons: 'handicap,emploi' },
  249: { label: 'réadaptation professionnelle (ESRP)', type: 'handicap', rayons: 'handicap,emploi,former' },
  198: { label: 'pré-orientation (ESPO)', type: 'handicap', rayons: 'handicap,emploi,former' },
  464: { label: 'réentraînement et orientation sociale et professionnelle', type: 'handicap', rayons: 'handicap,emploi,former' },
  197: { label: 'addictologie (CSAPA)', type: 'sante-soins-addictions', rayons: 'sante' },
  178: { label: 'réduction des risques (CAARUD)', type: 'sante-soins-addictions', rayons: 'sante' },
  609: { label: 'maison départementale des personnes handicapées', type: 'handicap', rayons: 'handicap' },
  228: { label: 'centre de planification', type: 'sante-soins-addictions', rayons: 'sante' },
  638: { label: 'dépistage (CeGIDD)', type: 'sante-soins-addictions', rayons: 'sante' },
  347: { label: 'centre d’examens de santé', type: 'sante-soins-addictions', rayons: 'sante' },
  616: { label: 'santé au travail', type: 'sante-soins-addictions', rayons: 'sante,emploi' }
};
// Le fichier écrit les noms en majuscules, sans accents, avec des abréviations : on met une casse lisible et les accents des mots les plus fréquents (à relire quand même : avertissement sur la fiche).
const FINESS_MOTS = { hebergement: 'hébergement', etablissement: 'établissement', 'etab.': 'établissement', readaptation: 'réadaptation', therapeutique: 'thérapeutique', sante: 'santé', residence: 'résidence', protege: 'protégé', adaptee: 'adaptée', hoteliere: 'hôtelière', difficulte: 'difficulté', pre: 'pré', evaluation: 'évaluation', reentrainement: 'réentraînement', 'prof.': 'professionnelle', delegue: 'délégué', metiers: 'métiers', batiment: 'bâtiment', federation: 'fédération', ste: 'Sainte', st: 'Saint', perigueux: 'Périgueux', perigord: 'Périgord', riberac: 'Ribérac', caneda: 'Canéda', menesterol: 'Ménestérol', brantome: 'Brantôme', trelissac: 'Trélissac', eglises: 'Églises', leonard: 'Léonard', deficients: 'déficients', mr: 'Maison relais', ctre: 'Centre', mais: 'Maison', cedex: '', '&': 'et' };
const FINESS_ACRONYMES = new Set(['chrs', 'esat', 'esrp', 'espo', 'cada', 'cph', 'act', 'asd', 'lam', 'caarud', 'csapa', 'cegidd', 'fjt', 'btp', 'udaf', 'arsl', 'safed', 'apare', 'ccas', 'apei', 'osea', 'cdtpi', 'alsea', 'prism', 'apsah', 'arai', 'sts', 'epnak', 'amjp', 'acsc', 'hudi', 'hu', 'aepape', 'amco', 'apajh', 'idea', 'ifmk', 'espr', 'msa', 'rhj', 'mdph', 'sarl', 'eurl', 'sas', 'sa', 'ipsea', 'ueros', 'ehpad', 'cmpp', 'camsp', 'ime', 'itep']);
const FINESS_PETITS = new Set(['avec', 'de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'pour', 'par', 'au', 'aux', 'sur', 'a', 'à', 'un', 'une']);
function nomFiness(s) {
  const mots = String(s || '').replace(/\s+/g, ' ').trim().replace(/([a-zà-ÿ])-([A-Za-zÀ-ÿ])/g, '$1 - $2').split(' ');
  const sortie = mots.map(function (m, i) {
    const b = m.toLowerCase(), debut = /^(d|l)'/.test(b) ? b.slice(0, 2) : '', reste = b.slice(debut.length);
    if (FINESS_MOTS[reste] !== undefined) { return FINESS_MOTS[reste] === '' ? '' : debut + FINESS_MOTS[reste]; }
    if (FINESS_ACRONYMES.has(reste)) { return debut + reste.toUpperCase(); }
    if (i > 0 && FINESS_PETITS.has(reste) && !debut) { return reste; }
    if (debut) { return debut + reste; }   // « d'urgence », « l'association » : en minuscules (un nom propre est à relire : avertissement sur la fiche)
    return reste.split('-').map(function (x) { return FINESS_ACRONYMES.has(x) ? x.toUpperCase() : x.charAt(0).toUpperCase() + x.slice(1); }).join('-');
  }).filter(function (x) { return x !== ''; }).join(' ').replace(/ - /g, ' : ').replace(/\s+/g, ' ');
  return sortie.charAt(0).toUpperCase() + sortie.slice(1);
}
function communeFiness(s) { return nomFiness(String(s || '').replace(/\bcedex\b.*$/i, '')).replace(/^Sarlat La Canéda/i, 'Sarlat-la-Canéda').replace(/^Montpon Ménestérol/i, 'Montpon-Ménestérol'); }

// Lit le fichier FINESS (JSON compressé, mis en forme sur 2 espaces, plusieurs centaines de Mo une fois décompressé) EN FLUX : jamais en entier en mémoire.
// Rend { lignes, jour, nbEtablissements } ; les lignes ont la forme des lignes du CSV de data.inclusion (source « finess »).
function extraireFiness(chemin, o) {
  const zlib = require('zlib');
  const opt = o || {};
  return new Promise(function (ok, ko) {
    const taille = Math.max(1, fs.statSync(chemin).size);
    const lecture = fs.createReadStream(chemin);
    const flux = /\.gz$/i.test(chemin) ? lecture.pipe(zlib.createGunzip()) : lecture;
    let reste = '', dansPmej = false, tampon = [], jour = '', nbPm = 0, nbEge = 0, dernierPct = -1;
    const lignes = [];
    const traiter = function (texte) {
      let e; try { e = JSON.parse(texte); } catch (err) { return; }
      nbPm++;
      const pm = e.informationsGeneralesPMEJ || {};
      (e.ege || []).forEach(function (x) {
        nbEge++;
        const g = x.informationsGeneralesEGE || {}, a = (x.adresse && x.adresse[0]) || {};
        const cat = FINESS_CATEGORIES[x.categorieentiteGeographiqueExercice];
        const cog = String(a.cogCommune || '');
        if (!cat || !DEPARTEMENTS[cog.slice(0, 2)] || g.dateFermeture || x.etatObjet !== 'A') { return; }
        const tel = (x.contact || []).map(function (c) { return c.telecom && c.telecom.telephone; }).filter(Boolean)[0] || '';
        lignes.push({
          source: 'finess', id: 'finess-' + g.numFinessEge, siret: /^\d{14}$/.test(g.siret || '') ? g.siret : '', nom: nomFiness(g.nomEgeLong || g.nomEgeCourt),
          commune: communeFiness(a.ligneAcheminement), code_postal: a.codePostal || '', code_insee: cog, adresse: String(a.ligneQuatre || '').trim(),
          telephone: tel, site_web: '', date_maj: '', description: '', reseaux_porteurs: '',
          finess: { numero: g.numFinessEge, categorie: x.categorieentiteGeographiqueExercice, label: cat.label, gestionnaire: nomFiness(pm.denominationPm) }
        });
      });
    };
    flux.on('data', function (morceau) {
      const bloc = (reste + morceau.toString('utf8')).split('\n'); reste = bloc.pop();
      for (let i = 0; i < bloc.length; i++) {
        const l = bloc[i];
        if (!dansPmej) {
          if (!jour) { const m = /^\s*"generatedAt"\s*:\s*"(\d{4}-\d{2}-\d{2})/.exec(l); if (m) { jour = m[1]; } }
          if (l.indexOf('  "pmej" : [ {') === 0) { dansPmej = true; tampon = ['{']; }
          continue;
        }
        if (l === '  }, {') { traiter(tampon.join('\n') + '\n}'); tampon = ['{']; }
        else if (l === '  } ]') { traiter(tampon.join('\n') + '\n}'); dansPmej = false; tampon = []; }
        else { tampon.push(l); }
      }
      if (opt.surProgres) { const p = Math.min(99, Math.floor(100 * lecture.bytesRead / taille)); if (p !== dernierPct) { dernierPct = p; opt.surProgres(p); } }
    });
    flux.on('error', function (e) { ko(new Error('Le fichier FINESS est illisible (' + e.message + ').')); });
    flux.on('end', function () {
      if (!nbPm) { return ko(new Error('Le fichier FINESS n\'a pas le format attendu.')); }
      ok({ lignes: lignes, jour: jour, nbEtablissements: nbEge });
    });
  });
}

// Charge la liste FINESS : réutilise celle de moins de 30 jours (le fichier bouge lentement, il pèse plus de 50 Mo), sinon le télécharge et le lit.
// Ne bloque jamais la recherche : en cas d'échec, reprend l'ancienne liste si elle existe et dit pourquoi.
function finessRecent(dossier, aujourdhui) {
  let a = null; try { a = JSON.parse(fs.readFileSync(path.join(dossier, 'finess_extrait.json'), 'utf8')); } catch (e) { a = null; }
  if (!a || !Array.isArray(a.lignes) || !a.lu) { return { ancien: null, recent: false }; }
  return { ancien: a, recent: (new Date(aujourdhui) - new Date(a.lu)) / 86400000 <= FINESS_REUTILISATION_JOURS };
}
async function chargerFiness(o, progres) {
  const etat = finessRecent(o.dossier, o.aujourdhui), ancien = etat.ancien;
  const repli = function (message) {
    return ancien ? { lignes: ancien.lignes, origine: ancien.origine, jour: ancien.jour, avertissement: message + ' La liste précédente (du ' + dateFr(ancien.lu) + ') est reprise.' } : { lignes: [], origine: '', jour: '', avertissement: message };
  };
  if (etat.recent && !o.force && !o.fichierFiness) { return { lignes: ancien.lignes, origine: ancien.origine, jour: ancien.jour, reutilise: true }; }
  let chemin = o.fichierFiness || '', origine = chemin, telecharge = false;
  try {
    if (!chemin) {
      progres('Recherche du fichier FINESS sur data.gouv.fr...', 12);
      let jeu;
      try { const rj = await o.fetch(URL_JEU_FINESS); if (!rj.ok) { throw new Error('code ' + rj.status); } jeu = await rj.json(); } catch (e) { return repli('FINESS : data.gouv.fr ne répond pas (' + e.message + ').'); }
      const fichiers = (jeu.resources || []).filter(function (x) { return /^https:\/\/static\.data\.gouv\.fr\/.*finess-structures-(journalier|mensuel)-\d+\.json\.gz$/.test(x.url); });
      fichiers.sort(function (a, b) { const j = function (x) { return /journalier-(\d+)/.test(x.url) ? RegExp.$1 : /mensuel-(\d+)/.exec(x.url)[1] + '31'; }; return j(b).localeCompare(j(a)); });
      if (!fichiers.length) { return repli('FINESS : le fichier des structures est introuvable sur data.gouv.fr.'); }
      progres('Téléchargement du fichier FINESS (' + Math.round((fichiers[0].filesize || 0) / 1048576) + ' Mo)...', 14);
      const rep = await o.fetch(fichiers[0].url);
      if (!rep.ok) { return repli('FINESS : téléchargement impossible (code ' + rep.status + ').'); }
      chemin = path.join(o.dossier, 'finess_telecharge.json.gz');
      fs.writeFileSync(chemin, Buffer.from(await rep.arrayBuffer()));
      origine = fichiers[0].url; telecharge = true;
    }
    progres('Lecture du fichier FINESS : Dordogne et Haute-Vienne...', 20);
    let ext;
    try { ext = await extraireFiness(chemin, { surProgres: function (p) { progres('Lecture du fichier FINESS : Dordogne et Haute-Vienne (' + p + ' %)...', 20 + Math.round(p * 0.2)); } }); }
    catch (e) { return repli('FINESS : ' + e.message); }
    finally { if (telecharge) { try { fs.unlinkSync(chemin); } catch (e) { /* le fichier restera : sans importance */ } } }
    const jour = ext.jour || o.aujourdhui;
    ext.lignes.forEach(function (l) { l.date_maj = jour; });   // l'établissement est « ouvert » à la date de génération du fichier
    fs.writeFileSync(path.join(o.dossier, 'finess_extrait.json'), JSON.stringify({ lu: o.aujourdhui, origine: origine, jour: jour, nbEtablissements: ext.nbEtablissements, lignes: ext.lignes }));
    return { lignes: ext.lignes, origine: origine, jour: jour };
  } catch (e) { return repli('FINESS : ' + e.message); }
}

// ------------------------------------------------------------ partie réseau et fichiers (testée avec un faux réseau : tests/prospectionStructures.test.js)
const attendre = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };

async function lireOfficiel(sirets, cache, o) {
  let n = 0;
  const url = function (s) { return 'https://recherche-entreprises.api.gouv.fr/search?q=' + s + '&per_page=1'; };
  for (let i = 0; i < sirets.length; i++) {
    const s = sirets[i];
    const dejaLu = cache[s];
    if (dejaLu && dejaLu.lu && (Date.now() - dejaLu.lu) < 30 * 86400000 && !dejaLu.erreur) { if (o.surProgres) { o.surProgres('Vérification des établissements auprès de la base officielle (' + (i + 1) + ' sur ' + sirets.length + ')...', 45 + Math.round(45 * (i + 1) / sirets.length)); } continue; }
    try {
      let r = await o.fetch(url(s));
      if (r.status === 429) { await attendre(o.pauseLimite); r = await o.fetch(url(s)); }
      if (!r.ok) { cache[s] = { erreur: r.status, lu: Date.now() }; }
      else {
        const j = await r.json(); const e = (j.results || [])[0];
        const et = e && ((e.matching_etablissements || []).find(function (z) { return z.siret === s; }) || (e.siege && e.siege.siret === s ? e.siege : null));
        cache[s] = e && et ? { etat: et.etat_administratif, commune: et.libelle_commune, lu: Date.now() } : { introuvable: true, lu: Date.now() };
      }
    } catch (err) { cache[s] = { erreur: String(err.message).slice(0, 60), lu: Date.now() }; }
    n++;
    if (o.surProgres) { o.surProgres('Vérification des établissements auprès de la base officielle (' + (i + 1) + ' sur ' + sirets.length + ')...', 45 + Math.round(45 * (i + 1) / sirets.length)); }
    await attendre(o.pause);
  }
  return n;
}

function lireTexte(f) { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return ''; } }
function lieuxExistantsDe(racine) { return lireTexte(path.join(racine, 'modules', 'mon-territoire', 'contenu', 'lieux.txt')) + '\n' + lireTexte(path.join(racine, 'outils', 'sas', 'lieux.sas.txt')); }

// Fait toute la recherche. Options : racine, dossier, fichier (CSV déjà là), finess (true : ajoute la deuxième source FINESS), fichierFiness (fichier FINESS déjà là), sansOfficiel, force, fetch, pause, pauseLimite, aujourdhui, surProgres(texte, pourcent).
// Rend { ok:true, pasDeNouveau:true, ... } si le fichier n'a pas changé depuis la dernière recherche, { ok:true, compte, ... } sinon ; lance une erreur claire si le réseau échoue.
async function lancer(options) {
  const o = Object.assign({ racine: path.resolve(__dirname, '..'), dossier: DOSSIER_SORTIE_DEFAUT, fetch: fetch, pause: 300, pauseLimite: 3000, aujourdhui: dateDuJour(), finess: false }, options || {});
  const progres = function (t, p) { if (o.surProgres) { o.surProgres(t, p); } };
  fs.mkdirSync(o.dossier, { recursive: true });
  let chemin = o.fichier || '', origine = chemin, telecharge = false;
  if (!chemin) {
    progres('Recherche du fichier le plus récent sur data.gouv.fr...', 3);
    let jeu;
    try { const rj = await o.fetch(URL_JEU); if (!rj.ok) { throw new Error('code ' + rj.status); } jeu = await rj.json(); } catch (e) { throw new Error('data.gouv.fr ne répond pas (' + e.message + '). Réessayez dans quelques minutes.'); }
    const ressource = (jeu.resources || []).find(function (x) { return /^https:\/\/static\.data\.gouv\.fr\/.*structures-inclusion-[\d-]+\.csv$/.test(x.url); });
    if (!ressource) { throw new Error('Le fichier des structures est introuvable sur data.gouv.fr : le jeu de données a peut-être changé.'); }
    if (!o.force) {
      let derniere = null; try { derniere = JSON.parse(fs.readFileSync(path.join(o.dossier, 'resultat.json'), 'utf8')); } catch (e) { derniere = null; }
      const finessAJour = !o.finess || finessRecent(o.dossier, o.aujourdhui).recent;   // la liste FINESS (réutilisée 30 jours) ne doit pas manquer
      if (derniere && derniere.origine === ressource.url && finessAJour) { return { ok: true, pasDeNouveau: true, jour: derniere.jour, fichierDu: dateDeLUrl(ressource.url) }; }
    }
    progres('Téléchargement du fichier (' + Math.round((ressource.filesize || 0) / 1048576) + ' Mo)...', 8);
    const rep = await o.fetch(ressource.url);
    if (!rep.ok) { throw new Error('Téléchargement impossible (code ' + rep.status + ').'); }
    chemin = path.join(o.dossier, 'structures_telechargees.csv');
    fs.writeFileSync(chemin, Buffer.from(await rep.arrayBuffer()));
    origine = ressource.url; telecharge = true;
  }
  progres('Lecture du fichier : Dordogne et Haute-Vienne...', 40);
  const lignesInclusion = parserCsv(fs.readFileSync(chemin, 'utf8'));
  const lignes = lignesInclusion.slice();   // + les lignes FINESS plus bas ; lignesInclusion reste celle de data.inclusion seule
  if (telecharge) { try { fs.unlinkSync(chemin); } catch (e) { /* le fichier restera : sans importance */ } }
  if (!lignesInclusion.length || lignesInclusion[0].siret === undefined || lignesInclusion[0].date_maj === undefined) { throw new Error('Le fichier téléchargé n\'a pas le format attendu : rien n\'a été changé.'); }
  let finess = null;
  if (o.finess || o.fichierFiness) { finess = await chargerFiness(o, progres); lignes.push.apply(lignes, finess.lignes); }
  const cacheFichier = path.join(o.dossier, 'officiel_cache.json');
  let cache = {}; try { cache = JSON.parse(fs.readFileSync(cacheFichier, 'utf8')); } catch (e) { cache = {}; }
  if (!o.sansOfficiel) {
    // Les fermées doivent aussi sortir de la liste : on vérifie toutes les récentes joignables.
    const sirets = Array.from(new Set(lignes.filter(function (r) { return /^\d{14}$/.test(r.siret || '') && DEPARTEMENTS[departementDe(r)] && r.date_maj && moisEcoules(r.date_maj, o.aujourdhui) <= MOIS_MAX && (telephoneFormate(r.telephone) || siteHttps(r.site_web)); }).map(function (r) { return r.siret; })));
    // Les fiches déjà publiées retrouvées dans le fichier sont vérifiées aussi (même celles mises à jour il y a plus de 12 mois).
    const registre = lireTexte(path.join(o.racine, 'modules', 'mon-territoire', 'contenu', 'lieux.txt'));
    recouper(lignesInclusion, registre, {}).sirets.forEach(function (s) { if (sirets.indexOf(s) === -1) { sirets.push(s); } });
    await lireOfficiel(sirets, cache, o);
    fs.writeFileSync(cacheFichier, JSON.stringify(cache));
  }
  progres('Comparaison avec votre registre et votre sas...', 95);
  const final = preparer(lignes, { aujourdhui: o.aujourdhui, lieuxExistants: lieuxExistantsDe(o.racine), officiel: cache, remises: lireDecisions(o.dossier).remises });
  const recoupement = recouper(lignesInclusion, lireTexte(path.join(o.racine, 'modules', 'mon-territoire', 'contenu', 'lieux.txt')), { officiel: cache });
  delete recoupement.sirets;
  const siretsRegistre = recoupement.siretsRegistre; delete recoupement.siretsRegistre;
  const sortie = {
    creeLe: new Date().toISOString(), jour: o.aujourdhui, origine: origine, licence: 'Licence Ouverte 2.0 (data.inclusion, data.gouv.fr)',
    verifieesOfficiel: Object.keys(cache).length, compte: final.compte, candidates: final.candidates, ecartees: final.ecartees, recoupement: recoupement, siretsRegistre: siretsRegistre,
    finess: finess ? { origine: finess.origine, jour: finess.jour, nbLignes: finess.lignes.length, reutilise: !!finess.reutilise, avertissement: finess.avertissement || '' } : null
  };
  fs.writeFileSync(path.join(o.dossier, 'resultat.json'), JSON.stringify(sortie, null, 1));
  progres('Terminé.', 100);
  return { ok: true, compte: final.compte, jour: o.aujourdhui, fichierDu: dateDeLUrl(origine), finess: sortie.finess };
}

// « .../structures-inclusion-2026-11-09.csv » devient « 09/11/2026 » ('' si l'adresse ne contient pas de date).
function dateDeLUrl(u) { const m = /(\d{4}-\d{2}-\d{2})\.\w+$/.exec(String(u || '')); return m ? dateFr(m[1]) : ''; }

// ------------------------------------------------------------ décisions de Denis (consigne 270, suite 4) : fiches écartées, fiches tranchées, remises en jeu
// Tout est gardé dans outils/prospection_structures/decisions.json (privé, ignoré par Git). Une fiche est reconnue par son SIRET quand il existe, sinon par son nom et sa commune :
// l'identifiant seul peut changer d'un mois à l'autre.
const RAISONS_ECART = ['Hors de mon public', 'Structure fermée', 'Trop loin du territoire', 'Déjà chez moi sous un autre nom', 'Contact ou site introuvable', 'Pas un lieu d’aide (école, entreprise...)', 'Pas assez sûr pour la publier', 'Autre'];
const CHOIX_TRANCHE = ['meme', 'demenage', 'antenne', 'autre'];
function cleSiret(c) { return /^\d{14}$/.test(String(c.siret || '')) ? 'siret:' + c.siret : ''; }
function cleNom(nom, commune, dep) { return 'nom:' + slug(nom) + '|' + slug(commune) + '|' + dep; }
function clesDe(c) { return [cleSiret(c), cleNom(c.nom, c.commune, c.dep)].filter(Boolean); }
function decisionsVides() { return { ecartees: {}, tranchees: {}, remises: {} }; }
function lireDecisions(dossier) {
  try { const d = JSON.parse(fs.readFileSync(path.join(dossier, 'decisions.json'), 'utf8')); return { ecartees: d.ecartees || {}, tranchees: d.tranchees || {}, remises: d.remises || {} }; } catch (e) { return decisionsVides(); }
}
function ecrireDecisions(dossier, d) {
  fs.mkdirSync(dossier, { recursive: true });
  const f = path.join(dossier, 'decisions.json'), t = f + '.tmp';
  fs.writeFileSync(t, JSON.stringify(d, null, 1)); fs.renameSync(t, f);
}
function chercherDecision(table, c) { const cles = clesDe(c); return Object.keys(table).find(function (k) { return (table[k].cles || []).some(function (x) { return cles.indexOf(x) !== -1; }); }) || ''; }
function nettoyer(t) { return String(t || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200); }

// Les fiches du registre (ou du sas) auxquelles une nouvelle fiche ressemble, avec ce qui les rapproche.
function rapprochementsDe(c, regs, regParId, siretsReg) {
  const liste = ressemble(c, regs).map(function (x) { return { id: x.id, nom: x.nom, commune: x.commune, dep: x.dep, type: x.type, tel: x.tel, site: x.site, adresse: x.adresse || '', motifs: ['nom ou sigle proche'] }; });
  const s = cleSiret(c) ? (siretsReg || {})[c.siret] : null;
  if (s && regParId[s.id]) {
    let x = liste.find(function (y) { return y.id === s.id; });
    if (!x) { const g = regParId[s.id]; x = { id: g.id, nom: g.nom, commune: g.commune, dep: g.dep, type: g.type, tel: g.tel, site: g.site, adresse: g.adresse || '', motifs: [] }; liste.unshift(x); }
    x.motifs.unshift('même établissement (SIRET)');
  }
  liste.forEach(function (x) {
    if (normaliser(x.commune) && normaliser(x.commune) === normaliser(c.commune)) { x.motifs.push('même commune'); }
    if (hoteDe(x.site) && hoteDe(x.site) === hoteDe(c.site)) { x.motifs.push('même site'); }
  });
  return liste;
}
function ligneAvecDescription(ligne, texte) { const p = String(ligne).split(' | '); if (p.length === 12 || p.length === 14) { p[3] = texte; } return p.join(' | '); }

// Lit le résultat de la dernière recherche tel quel (sans les décisions de Denis).
function lireBrut(o) {
  const chemin = path.join(o.dossier, 'resultat.json');
  let stat; try { stat = fs.statSync(chemin); } catch (e) { return { ok: true, absent: true }; }
  if (!stat.isFile() || stat.size > 5 * 1024 * 1024) { return { ok: false, erreur: 'Le résultat de la prospection est illisible : relancez la recherche.' }; }
  let r; try { r = JSON.parse(fs.readFileSync(chemin, 'utf8')); } catch (e) { return { ok: false, erreur: 'Le résultat de la prospection est abîmé : relancez la recherche.' }; }
  if (!r || !Array.isArray(r.candidates) || !r.compte) { return { ok: false, erreur: 'Le résultat de la prospection n\'a pas le bon format : relancez la recherche.' }; }
  r.candidates.forEach(ajouterAdresse);
  return { ok: true, absent: false, r: r };
}

// Lit le dernier résultat et le met à jour avec ce que le registre, le sas et les décisions de Denis contiennent MAINTENANT :
// une fiche déjà mise au sas, écartée ou tranchée « même structure » disparaît de la liste ; une fiche qui ressemble à une fiche publiée est « orange » (à trancher), sinon « verte ».
function lireResultat(options) {
  const o = Object.assign({ racine: path.resolve(__dirname, '..'), dossier: DOSSIER_SORTIE_DEFAUT }, options || {});
  const b = lireBrut(o); if (!b.ok || b.absent) { return b; }
  const r = b.r;
  const texteRegistre = lireTexte(path.join(o.racine, 'modules', 'mon-territoire', 'contenu', 'lieux.txt'));
  const texteTout = lieuxExistantsDe(o.racine);
  const emp = empreinteExistante(texteTout);
  const regs = registreParse(texteTout), regParId = {}; regs.forEach(function (x) { if (x.id) { regParId[x.id] = x; } });
  const registreSeul = registreParse(texteRegistre), registreParId = {}; registreSeul.forEach(function (x) { if (x.id) { registreParId[x.id] = x; } });
  const dec = lireDecisions(o.dossier);
  let dejaMaintenant = 0;
  const candidates = [];
  r.candidates.forEach(function (c) {
    if (dejaConnue(c, emp)) { dejaMaintenant++; return; }
    if (chercherDecision(dec.ecartees, c)) { return; }
    const rap = rapprochementsDe(c, regs, regParId, r.siretsRegistre);
    const copie = Object.assign({}, c, { rapprochements: rap, controle: 'vert' });
    const kT = chercherDecision(dec.tranchees, c), t = kT ? dec.tranchees[kT] : null;
    if (t && regParId[t.regId]) {
      if (t.choix === 'meme' || t.choix === 'demenage') { return; }   // déjà chez vous : rapportée plus bas, sur la fiche existante
      copie.decision = { cle: kT, choix: t.choix, regId: t.regId, regNom: t.regNom, date: t.date };
      if (t.choix === 'antenne' && copie.ligne) { copie.ligne = ligneAvecDescription(copie.ligne, 'Antenne de ' + t.regNom + ', à ' + c.commune + '.'); }
    } else if (rap.length) { copie.controle = 'orange'; }
    candidates.push(copie);
  });
  // Recoupement : on ne garde que les fiches encore au registre, et on y ajoute ce que Denis a confirmé (même structure, déménagée) quand le téléphone ou le site de la source diffère encore.
  let recoupement = null;
  if (r.recoupement && Array.isArray(r.recoupement.aRevoir)) {
    const aRevoir = r.recoupement.aRevoir.filter(function (x) { return registreParId[x.id]; });
    Object.keys(dec.tranchees).forEach(function (k) {
      const t = dec.tranchees[k], g = registreParId[t.regId];
      if (!g || (t.choix !== 'meme' && t.choix !== 'demenage')) { return; }
      const raisons = [t.choix === 'demenage' ? 'vous avez indiqué qu\'elle a déménagé' : 'vous avez confirmé que c\'est la même structure'];
      const c = t.cand || {};
      let diff = false;
      if (chiffres9(c.tel) && chiffres9(c.tel) !== chiffres9(g.tel)) { raisons.push('la source donne un autre téléphone : ' + c.tel); diff = true; }
      if (c.site && hoteDe(c.site) !== hoteDe(g.site)) { raisons.push('la source donne un autre site : ' + c.site); diff = true; }
      if (!diff) { return; }
      const deja = aRevoir.find(function (x) { return x.id === g.id; });
      if (deja) { raisons.forEach(function (z) { if (deja.raisons.indexOf(z) === -1) { deja.raisons.push(z); } }); return; }
      aRevoir.push({ id: g.id, type: g.type, nom: g.nom, commune: g.commune, dep: g.dep, telRegistre: g.tel || '', siteRegistre: g.site || '', raisons: raisons, retrouveParLe: 'votre décision', sourceNom: c.nom, sourceTel: c.tel || '', sourceSite: c.site || '', sourceMaj: t.date, siret: '' });
    });
    recoupement = Object.assign({}, r.recoupement, { aRevoir: aRevoir });
  }
  const ecarteesParVous = Object.keys(dec.ecartees).map(function (k) { const e = dec.ecartees[k]; return { cle: k, nom: e.nom, commune: e.commune, dep: e.dep, raison: e.raison, texte: e.texte || '', date: e.date }; }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  const ecarteesOffice = (r.ecartees || []).map(function (e) { const cle = e.cle || cleNom(e.nom, e.commune, e.dep); return Object.assign({}, e, { cle: cle, remise: !!dec.remises[cle] }); });
  const decisionsRetenues = Object.keys(dec.tranchees).map(function (k) { const t = dec.tranchees[k]; return { cle: k, nom: (t.cand && t.cand.nom) || '', commune: (t.cand && t.cand.commune) || '', choix: t.choix, regNom: t.regNom, date: t.date }; });
  return {
    ok: true, absent: false, jour: r.jour, creeLe: r.creeLe, fichierDu: dateDeLUrl(r.origine), licence: r.licence, finess: r.finess ? Object.assign({}, r.finess, { fichierDu: r.finess.jour ? dateFr(r.finess.jour) : '' }) : null, compte: r.compte,
    dejaMaintenant: dejaMaintenant, candidates: candidates, ecartees: ecarteesOffice, ecarteesParVous: ecarteesParVous, decisionsRetenues: decisionsRetenues, recoupement: recoupement
  };
}
function chiffres9(t) { return String(t || '').replace(/\D/g, '').slice(-9); }

// Le verrou du sas : rend les lignes des fiches demandées, ou les raisons du refus. Refuse tout tant qu'une fiche est « orange » (à trancher).
function verifier(options, ids) {
  const o = Object.assign({ racine: path.resolve(__dirname, '..'), dossier: DOSSIER_SORTIE_DEFAUT }, options || {});
  const rr = lireResultat(o); if (!rr.ok || rr.absent) { return rr.ok ? { ok: false, erreur: 'Aucune recherche faite pour l\'instant.' } : rr; }
  const aTrancher = rr.candidates.filter(function (c) { return c.controle === 'orange'; });
  const lignes = [], refuses = [];
  (Array.isArray(ids) ? ids : []).slice(0, 200).forEach(function (id) {
    const c = rr.candidates.find(function (x) { return x.id === id; });
    if (!c) { refuses.push({ id: id, nom: '', raison: 'cette fiche n\'est plus dans la liste (déjà au registre ou au sas, écartée ou tranchée)' }); }
    else if (c.controle === 'orange') { refuses.push({ id: id, nom: c.nom, raison: 'elle ressemble à une fiche déjà publiée : à trancher' }); }
    else if (!c.ligne) { refuses.push({ id: id, nom: c.nom, raison: 'son type est à choisir à la main' }); }
    else { lignes.push(c.ligne); }
  });
  return { ok: true, bloque: aTrancher.length > 0, aTrancher: aTrancher.map(function (c) { return c.nom; }), lignes: aTrancher.length ? [] : lignes, refuses: refuses };
}

// Les décisions de Denis. donnees : { op: 'ecarter', id, raison, texte } | { op: 'remettre', cle } | { op: 'trancher', id, choix, regId } | { op: 'detrancher', cle } | { op: 'remettre-office', cle } | { op: 'reprendre-office', cle }.
function decider(options, donnees) {
  const o = Object.assign({ racine: path.resolve(__dirname, '..'), dossier: DOSSIER_SORTIE_DEFAUT }, options || {});
  const d = donnees || {};
  const rr = lireResultat(o); if (!rr.ok) { return rr; } if (rr.absent) { return { ok: false, erreur: 'Aucune recherche faite pour l\'instant.' }; }
  const dec = lireDecisions(o.dossier), date = dateDuJour();
  const cand = function () { return rr.candidates.find(function (x) { return x.id === d.id; }); };
  if (d.op === 'ecarter') {
    const c = cand(); if (!c) { return { ok: false, erreur: 'Cette fiche n\'est plus dans la liste.' }; }
    if (RAISONS_ECART.indexOf(d.raison) === -1) { return { ok: false, erreur: 'Cette raison n\'existe pas.' }; }
    const texte = nettoyer(d.texte);
    if (d.raison === 'Autre' && !texte) { return { ok: false, erreur: 'Écrivez la raison.' }; }
    const k = cleNom(c.nom, c.commune, c.dep);
    dec.ecartees[k] = { cles: clesDe(c), nom: c.nom, commune: c.commune, dep: c.dep, raison: d.raison, texte: texte, date: date };
  } else if (d.op === 'remettre') {
    if (!dec.ecartees[d.cle]) { return { ok: false, erreur: 'Cette fiche n\'est pas dans les écartées.' }; }
    delete dec.ecartees[d.cle];
  } else if (d.op === 'trancher') {
    const c = cand(); if (!c) { return { ok: false, erreur: 'Cette fiche n\'est plus dans la liste.' }; }
    if (CHOIX_TRANCHE.indexOf(d.choix) === -1) { return { ok: false, erreur: 'Cette réponse n\'existe pas.' }; }
    const reg = (c.rapprochements || []).find(function (x) { return x.id === d.regId; });
    if (!reg) { return { ok: false, erreur: 'Cette fiche ne ressemble pas à celle indiquée.' }; }
    const ancien = chercherDecision(dec.tranchees, c); if (ancien) { delete dec.tranchees[ancien]; }
    dec.tranchees[cleNom(c.nom, c.commune, c.dep)] = { cles: clesDe(c), choix: d.choix, regId: reg.id, regNom: reg.nom, date: date, cand: { nom: c.nom, commune: c.commune, dep: c.dep, tel: c.tel, site: c.site, adresse: c.adresse } };
  } else if (d.op === 'detrancher') {
    if (!dec.tranchees[d.cle]) { return { ok: false, erreur: 'Cette décision n\'existe pas.' }; }
    delete dec.tranchees[d.cle];
  } else if (d.op === 'remettre-office') {
    if (!rr.ecartees.some(function (e) { return e.cle === d.cle; })) { return { ok: false, erreur: 'Cette fiche n\'est pas dans les écartées d\'office.' }; }
    dec.remises[d.cle] = date;
  } else if (d.op === 'reprendre-office') {
    delete dec.remises[d.cle];
  } else { return { ok: false, erreur: 'Action inconnue.' }; }
  ecrireDecisions(o.dossier, dec);
  return { ok: true };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const iF = args.indexOf('--fichier');
  console.log('Recherche de nouvelles structures...');
  let dernier = '';
  lancer({
    fichier: iF !== -1 ? args[iF + 1] : '', sansOfficiel: args.indexOf('--sans-officiel') !== -1, force: args.indexOf('--force') !== -1,
    finess: args.indexOf('--sans-finess') === -1, fichierFiness: args.indexOf('--fichier-finess') !== -1 ? args[args.indexOf('--fichier-finess') + 1] : '',
    surProgres: function (t) { if (t !== dernier) { dernier = t; if (!/Vérification des établissements/.test(t) || /\(1 sur /.test(t)) { console.log(t); } } }
  }).then(function (r) {
    if (r.pasDeNouveau) { console.log('\nRien de nouveau : le fichier de data.inclusion n\'a pas changé depuis la dernière recherche (' + dateFr(r.jour) + '). Ajoutez --force pour chercher quand même.'); return; }
    const c = r.compte;
    console.log('\nTerminé le ' + dateFr(r.jour) + '.');
    console.log('Dordogne et Haute-Vienne : ' + c.departements + ' structures, dont ' + c.recentes + ' mises à jour depuis moins de ' + MOIS_MAX + ' mois.');
    console.log('Sans téléphone ni site : ' + c.sansContact + '. Écartées d\'office : ' + c.ecartees + ' (dont ' + c.fermees + ' fermée(s)). Déjà connues : ' + c.dejaConnues + '.');
    console.log('À regarder : ' + c.candidates + '.');
    try { const rc = JSON.parse(fs.readFileSync(path.join(DOSSIER_SORTIE_DEFAUT, 'resultat.json'), 'utf8')).recoupement; if (rc) { console.log('Fiches déjà publiées : ' + rc.recoupees + ' sur ' + rc.total + ' retrouvées dans le fichier, ' + rc.aRevoir.length + ' à revoir.'); } } catch (e) { /* sans importance */ }
    console.log('Résultat : outils/prospection_structures/resultat.json');
  }).catch(function (e) { console.log('\nErreur : ' + e.message); process.exit(1); });
}

module.exports = { adresseLisible, ajouterAdresse, nomFiness, extraireFiness, chargerFiness, FINESS_CATEGORIES, parserCsv, preparer, telephoneFormate, siteHttps, classer, empreinteExistante, dejaConnue, recouper, ressemble, registreParse, lireDecisions, decider, verifier, cleNom, cleSiret, RAISONS_ECART, CHOIX_TRANCHE, slug, lancer, lireResultat, dateDeLUrl, DEPARTEMENTS, MOIS_MAX, DOSSIER_SORTIE_DEFAUT };
