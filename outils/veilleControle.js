/* ============================================================
   veilleControle.js  --  contrôle AUTOMATIQUE des adresses des pages d'offres (outil de veille, sur le poste de Denis)
   ------------------------------------------------------------
   Ce que le contrôle montre : l'adresse répond encore, mène ailleurs, est refusée aux robots, ou n'existe plus.
   Ce qu'il NE montre PAS : qu'une liste d'offres y est publiée aujourd'hui. Il n'écrit rien dans les registres et ne remplace jamais la vérification
   à la main (une page refusée aux robots, comme beaucoup de sites d'employeurs, reste « à ouvrir à la main »). Aucune dépendance (Node seul : fetch).
   Les adresses viennent TOUJOURS du registre (jamais de la fenêtre) : on n'ouvre que des adresses https écrites dans offres.txt.
   ============================================================ */
'use strict';

const AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const DELAI_MS = 15000;
const PARALLELE = 4;
const MAX_ADRESSES = 150;
const HOTE_INTERDIT = /^(localhost|.*\.local|.*\.internal|\d{1,3}(\.\d{1,3}){3}|\[.*\])$/i;

function hote(u) { try { return new URL(u).hostname.replace(/^www\./i, '').toLowerCase(); } catch (e) { return ''; } }

// Range une réponse (ou une erreur réseau) dans l'une des cinq catégories.
//   repond | ailleurs | refuse | absente | sans-reponse
function classer(urlDemandee, reponse, erreur) {
  if (erreur) {
    const code = String(erreur.code || (erreur.cause && erreur.cause.code) || '');
    if (/ENOTFOUND|EAI_AGAIN|ERR_NAME_NOT_RESOLVED/.test(code)) { return { etat: 'absente', detail: 'Le site n’existe plus ou l’adresse est fausse.' }; }
    return { etat: 'sans-reponse', detail: 'Le site n’a pas répondu à temps : réessayez, ou ouvrez la page à la main.' };
  }
  const s = reponse.statut;
  if (s >= 200 && s < 300) {
    const h = hote(reponse.finale || urlDemandee);
    if (h && h !== hote(urlDemandee)) { return { etat: 'ailleurs', detail: 'L’adresse mène vers un autre site (' + h + ') : ouvrez la page à la main pour vérifier.', finale: reponse.finale }; }
    return { etat: 'repond', detail: 'La page répond. Ouvrez-la à la main pour vérifier que des offres y figurent.' };
  }
  if (s === 404 || s === 410) { return { etat: 'absente', detail: 'La page n’existe plus (erreur ' + s + ') : cherchez la nouvelle adresse.' }; }
  if (s === 401 || s === 403 || s === 429) { return { etat: 'refuse', detail: 'Le site refuse les contrôles automatiques (erreur ' + s + ') : ouvrez la page à la main.' }; }
  return { etat: 'sans-reponse', detail: 'Le site renvoie une erreur (' + s + ') : réessayez plus tard, ou ouvrez la page à la main.' };
}

async function tester(url, appeler) {
  try {
    const r = await appeler(url, { redirect: 'follow', signal: AbortSignal.timeout(DELAI_MS), headers: { 'user-agent': AGENT, 'accept-language': 'fr-FR,fr;q=0.9', accept: 'text/html,application/xhtml+xml' } });
    try { if (r.body && r.body.cancel) { await r.body.cancel(); } } catch (e) { /* le corps n'est jamais lu */ }
    return classer(url, { statut: r.status, finale: r.url }, null);
  } catch (e) { return classer(url, null, e); }
}

// adresses : [{ id, url }] -> [{ id, url, etat, detail }]. Quatre adresses à la fois ; une seule nouvelle tentative en cas d'absence de réponse.
async function controler(adresses, opt) {
  const appeler = (opt && opt.fetch) || fetch;
  const liste = (Array.isArray(adresses) ? adresses : []).slice(0, MAX_ADRESSES);
  const sortie = new Array(liste.length);
  let suivant = 0;
  async function travailleur() {
    while (suivant < liste.length) {
      const i = suivant++;
      const a = liste[i], url = String((a && a.url) || '');
      let r;
      if (!/^https:\/\/\S+$/.test(url) || HOTE_INTERDIT.test(hote(url)) || !hote(url)) { r = { etat: 'sans-reponse', detail: 'Adresse non contrôlée (seules les adresses https de sites publics le sont).' }; }
      else {
        r = await tester(url, appeler);
        if (r.etat === 'sans-reponse') { r = await tester(url, appeler); }
      }
      sortie[i] = Object.assign({ id: a && a.id, url: url }, r);
    }
  }
  await Promise.all(Array.from({ length: Math.min(PARALLELE, liste.length) }, travailleur));
  return sortie;
}

// ============================================================
// LECTURE DU CONTENU D'UNE PAGE (contrôle du sas des employeurs, 2026-10-18)
// Ce qui change par rapport au contrôle ci-dessus : ici on LIT le texte de la page (au plus 500 Ko) pour retrouver le nom de l'employeur, sa commune et ses
// numéros de téléphone. Garde-fous : seules des adresses https écrites dans les fichiers du sas sont ouvertes (jamais une adresse venue de la page ou de la fenêtre) ;
// chaque redirection est suivie à la main et son adresse est revérifiée (jamais de site privé, local ou interne, ni de http) ; la taille lue est plafonnée.
// ============================================================
const dns = require('dns').promises;
const TAILLE_MAX_LECTURE = 500 * 1024;
const MAX_REDIRECTIONS = 5;
const MOTS_BANALS = ['les', 'des', 'the', 'sas', 'sarl', 'eurl', 'group', 'groupe', 'centre', 'agence', 'societe', 'magasin', 'ets', 'etablissements', 'france', 'association', 'maison'];

// Vrai pour une adresse IP privée, locale, de liaison locale ou réservée (IPv4 ou IPv6).
function ipPrivee(ip) {
  const s = String(ip || '').toLowerCase();
  const m4 = /^(?:::ffff:)?(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s);
  if (m4) {
    const a = +m4[1], b = +m4[2];
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  if (s.indexOf(':') !== -1) { return s === '::' || s === '::1' || /^f[cd]/.test(s) || /^fe[89ab]/.test(s) || /^::ffff:/.test(s); }
  return true;
}

function decoderEntites(t) {
  const nommees = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ', eacute: 'é', egrave: 'è', ecirc: 'ê', agrave: 'à', acirc: 'â', ccedil: 'ç', ocirc: 'ô', ucirc: 'û', icirc: 'î', euml: 'ë', rsquo: '’', laquo: '«', raquo: '»', oelig: 'œ' };
  return String(t).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, function (m, e) {
    if (e.charAt(0) === '#') { const n = e.charAt(1).toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : ' '; }
    return Object.prototype.hasOwnProperty.call(nommees, e.toLowerCase()) ? nommees[e.toLowerCase()] : ' ';
  });
}
function normaliser(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }

// Page HTML -> { titre, normTitre, normTexte, chiffres } (rien d'autre n'est gardé : ni le HTML, ni les scripts).
function analyserHtml(html) {
  const brut = String(html || '');
  const titre = decoderEntites(((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(brut) || [])[1] || '').replace(/\s+/g, ' ')).trim().slice(0, 200);
  const telLiens = (brut.match(/href\s*=\s*["']tel:([^"']+)["']/gi) || []).map(function (x) { return x.replace(/^[^:]*:/, ''); }).join(' ');
  const jsonLd = (brut.match(/<script[^>]*ld\+json[^>]*>[\s\S]*?<\/script>/gi) || []).map(function (x) { return ((/"telephone"\s*:\s*"([^"]+)"/i.exec(x) || [])[1]) || ''; }).join(' ');
  const visible = decoderEntites(brut.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<[^>]+>/g, ' '));
  return { titre: titre, normTitre: normaliser(titre), normTexte: normaliser(visible).slice(0, 250000), chiffres: (visible + ' ' + telLiens + ' ' + jsonLd).replace(/\D/g, '').slice(0, 250000) };
}

// Les adresses de pages « contact » citées par une page (au plus 2) : même site seulement (même nom d'hôte, https), jamais un fichier, jamais une adresse tel: ou mailto:.
function liensContact(html, base) {
  const sortie = [], re = /<a\b[^>]*?href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let hoteBase = '';
  try { hoteBase = new URL(base).hostname.replace(/^www\./i, '').toLowerCase(); } catch (e) { return []; }
  let m;
  while ((m = re.exec(String(html || ''))) && sortie.length < 2) {
    const href = m[1].trim(), texte = normaliser(decoderEntites(m[2].replace(/<[^>]+>/g, ' ')));
    if (!/contact|nous contacter|nous joindre|nous trouver/.test(normaliser(href.replace(/[\/_-]/g, ' ')) + ' ' + texte)) { continue; }
    if (/^(mailto|tel|javascript):/i.test(href)) { continue; }
    try {
      const u = new URL(href, base);
      if (u.protocol !== 'https:' || u.hostname.replace(/^www\./i, '').toLowerCase() !== hoteBase) { continue; }
      if (/\.(pdf|jpe?g|png|gif|zip|docx?|xlsx?|mp4)$/i.test(u.pathname)) { continue; }
      u.hash = '';
      if (u.href !== base && sortie.indexOf(u.href) === -1) { sortie.push(u.href); }
    } catch (e) { /* adresse illisible : ignorée */ }
  }
  return sortie;
}

// Les pages de recrutement citées par une page d'accueil (au plus 4 candidats, les plus probables d'abord) : même site, ou un sous-domaine du même domaine (careers.exemple.com), https seulement.
function liensRecrutement(html, base) {
  const re = /<a\b[^>]*?href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi, candidats = [];
  let racineBase = '';
  try { racineBase = new URL(base).hostname.replace(/^www\./i, '').toLowerCase().split('.').slice(-2).join('.'); } catch (e) { return []; }
  let m;
  while ((m = re.exec(String(html || '')))) {
    const href = m[1].trim(), texte = decoderEntites(m[2].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    const nh = normaliser(href.replace(/[\/_.-]/g, ' ')), nt = normaliser(texte);
    const motif = /recrut|carriere|(^| )emplois?( |$)|offres? d emploi|nous rejoindre|rejoignez|(^| )jobs?( |$)|candidat|travailler chez|postuler/;
    if (!motif.test(nh) && !motif.test(nt)) { continue; }
    if (/^(mailto|tel|javascript):/i.test(href)) { continue; }
    try {
      const u = new URL(href, base);
      if (u.protocol !== 'https:' || u.hostname.replace(/^www\./i, '').toLowerCase().split('.').slice(-2).join('.') !== racineBase) { continue; }
      if (/\.(pdf|jpe?g|png|gif|zip|docx?|xlsx?|mp4)$/i.test(u.pathname)) { continue; }
      u.hash = '';
      if (u.href === base || candidats.some(function (x) { return x.url === u.href; })) { continue; }
      candidats.push({ url: u.href, texte: texte.slice(0, 60), score: (/recrut|carriere/.test(nh) ? 2 : 0) + (/recrut|carriere|nous rejoindre|rejoignez/.test(nt) ? 1 : 0) });
    } catch (e) { /* adresse illisible : ignorée */ }
  }
  return candidats.sort(function (a, b) { return b.score - a.score; }).slice(0, 4);
}

// Les neuf derniers chiffres d'un numéro français (05 53 00 00 00, +33 5 53 00 00 00, 0033 5 53...) : la partie nationale, sans le zéro.
function numeroNational(numero) {
  const d = String(numero || '').replace(/\D/g, '');
  return d.length >= 9 ? d.slice(-9) : '';
}

// Lit UNE page (redirections suivies à la main). Rend { statut, finale, html } ou { etat, detail, finale } quand l'adresse ne peut pas être lue, ou lève une erreur réseau.
async function lirePage(url, opt) {
  const o = opt || {}, appeler = o.fetch || fetch, resoudre = o.resoudre || function (h) { return dns.lookup(h, { all: true }); };
  let courante = url;
  for (let i = 0; i <= MAX_REDIRECTIONS; i++) {
    const u = new URL(courante);
    if (u.protocol !== 'https:') { return { etat: 'ailleurs', detail: 'L’adresse mène vers une page non sécurisée (http) : ouvrez la page à la main.', finale: courante }; }
    if (HOTE_INTERDIT.test(u.hostname)) { return { etat: 'sans-reponse', detail: 'Adresse non contrôlée (seules les adresses https de sites publics le sont).', finale: courante }; }
    const adresses = await resoudre(u.hostname);
    if (!adresses || !adresses.length || adresses.some(function (a) { return ipPrivee(a.address); })) { return { etat: 'sans-reponse', detail: 'Adresse non contrôlée (site privé ou interne).', finale: courante }; }
    const r = await appeler(courante, { redirect: 'manual', signal: AbortSignal.timeout(DELAI_MS), headers: { 'user-agent': AGENT, 'accept-language': 'fr-FR,fr;q=0.9', accept: 'text/html,application/xhtml+xml' } });
    if ([301, 302, 303, 307, 308].indexOf(r.status) !== -1) {
      try { if (r.body && r.body.cancel) { await r.body.cancel(); } } catch (e) { /* corps jamais lu */ }
      const loc = r.headers && r.headers.get ? r.headers.get('location') : '';
      if (!loc) { return { statut: r.status, finale: courante, html: '' }; }
      courante = new URL(loc, courante).href; continue;
    }
    let html = '';
    const type = String((r.headers && r.headers.get && r.headers.get('content-type')) || '');
    if (r.status >= 200 && r.status < 300 && r.body && (!type || /html|text|xml/i.test(type))) {
      const jeu = /charset=\s*(iso-8859-1|windows-1252|latin1)/i.test(type) ? 'windows-1252' : 'utf-8';
      const lecteur = r.body.getReader(), morceaux = []; let total = 0;
      while (total < TAILLE_MAX_LECTURE) {
        const x = await lecteur.read();
        if (x.done) { break; }
        morceaux.push(Buffer.from(x.value)); total += x.value.length;
      }
      try { await lecteur.cancel(); } catch (e) { /* fin de lecture */ }
      html = new TextDecoder(jeu).decode(Buffer.concat(morceaux).subarray(0, TAILLE_MAX_LECTURE));
    } else { try { if (r.body && r.body.cancel) { await r.body.cancel(); } } catch (e) { /* corps jamais lu */ } }
    return { statut: r.status, finale: courante, html: html };
  }
  return { etat: 'sans-reponse', detail: 'Trop de redirections : ouvrez la page à la main.', finale: courante };
}

// Une adresse -> { etat, detail, finale, page } où page = analyserHtml(...) quand la page répond. États : repond | ailleurs | refuse | absente | sans-reponse.
async function lireEtClasser(url, opt) {
  let lue;
  try {
    lue = await lirePage(url, opt);
  } catch (e) {
    const code = String((e && (e.code || (e.cause && e.cause.code))) || '');
    if (/ENOTFOUND|EAI_AGAIN|ERR_NAME_NOT_RESOLVED/.test(code)) { return { etat: 'absente', detail: 'Le site n’existe pas (nom de domaine introuvable) : cherchez le vrai site avec « Chercher le site sur le web ».' }; }
    return { etat: 'sans-reponse', detail: 'Le site n’a pas répondu à temps : réessayez, ou ouvrez la page à la main.' };
  }
  if (lue.etat) { return { etat: lue.etat, detail: lue.detail, finale: lue.finale }; }
  const c = classer(url, { statut: lue.statut, finale: lue.finale }, null);
  const sortie = { etat: c.etat, detail: c.etat === 'repond' ? 'Le site répond sur sa propre adresse.' : c.detail, finale: c.finale || lue.finale };
  if (c.etat === 'repond' && lue.html) {
    sortie.page = analyserHtml(lue.html);
    // Beaucoup de sites mettent leur numéro sur une page « Contact » : on la lit aussi (même site, 2 pages au plus, mêmes garde-fous), sans changer l'état de l'adresse.
    if (!(opt && opt.sansContact)) {
      sortie.pagesContact = [];
      for (const u of liensContact(lue.html, lue.finale || url)) {
        try {
          const cp = await lirePage(u, opt);
          if (cp && cp.statut >= 200 && cp.statut < 300 && cp.html) {
            const pc = analyserHtml(cp.html);
            sortie.page.chiffres = (sortie.page.chiffres + ' ' + pc.chiffres).slice(0, 400000);
            sortie.page.normTexte = (sortie.page.normTexte + ' ' + pc.normTexte).slice(0, 400000);
            sortie.pagesContact.push(u);
          }
        } catch (e) { /* page contact illisible : sans importance */ }
      }
    }
    // Pages de recrutement TROUVÉES sur le site (jamais écrites dans une carte : proposées, Denis décide) : seules celles qui répondent sont gardées.
    sortie.recrutementTrouve = [];
    for (const c of liensRecrutement(lue.html, lue.finale || url)) {
      if (sortie.recrutementTrouve.length >= 2) { break; }
      try {
        const rp = await lirePage(c.url, opt);
        if (rp && rp.statut >= 200 && rp.statut < 300) { sortie.recrutementTrouve.push({ url: rp.finale || c.url, texte: c.texte }); }
      } catch (e) { /* candidat illisible : ignoré */ }
    }
  }
  return sortie;
}

// Les preuves d'une carte à partir de la page lue : le nom de l'employeur, sa commune, des numéros.
// carte : { nom, commune, numeros: [numéro, ...] }. Rend { titre, nomTitre, nomPage, communeTrouvee|null, numeros: [{ numero, trouve }] }, ou null sans page.
function preuvesDePage(page, carte) {
  if (!page) { return null; }
  const c = carte || {};
  const mots = normaliser(c.nom).split(' ').filter(function (m) { return m.length > 2 && MOTS_BANALS.indexOf(m) === -1; });
  const commune = normaliser(c.commune);
  return {
    titre: page.titre,
    nomTitre: mots.length > 0 && mots.some(function (m) { return (' ' + page.normTitre + ' ').indexOf(' ' + m + ' ') !== -1; }),
    nomPage: mots.length > 0 && mots.some(function (m) { return (' ' + page.normTexte + ' ').indexOf(' ' + m + ' ') !== -1; }),
    communeTrouvee: commune ? (' ' + page.normTexte + ' ').indexOf(' ' + commune + ' ') !== -1 : null,
    numeros: (c.numeros || []).map(function (n) { const nat = numeroNational(n); return { numero: n, trouve: nat ? page.chiffres.indexOf(nat) !== -1 : false }; })
  };
}

module.exports = { controler: controler, classer: classer, hote: hote, MAX_ADRESSES: MAX_ADRESSES, lirePage: lirePage, lireEtClasser: lireEtClasser, liensContact: liensContact, liensRecrutement: liensRecrutement, analyserHtml: analyserHtml, preuvesDePage: preuvesDePage, numeroNational: numeroNational, ipPrivee: ipPrivee, normaliser: normaliser, TAILLE_MAX_LECTURE: TAILLE_MAX_LECTURE };

