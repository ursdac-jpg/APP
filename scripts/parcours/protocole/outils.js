/* ============================================================
   scripts/parcours/protocole/outils.js
   Outils communs du PROTOCOLE DE TEST des parcours (docs/PROTOCOLE_TEST_PARCOURS_MES_DOCUMENTS_2026-11-11.md, consigne 249).
   Principe : on pilote l'application comme une personne (clics réels sur les boutons, la barre du bas, la barre d'étapes), on SIMULE seulement ce qui vient de l'assistant
   en ligne (réponses collées) et les données de départ. Chaque écran traversé est contrôlé (voir `controleEcran`), chaque « Retour » est joué puis rejoué en avant.
   Jamais chargé par l'application. Lancement : `node scripts/parcours/protocole/lancer.js [identifiant]` (NODE_PATH vers le node_modules de Playwright).
   ============================================================ */
const { chromium } = require('playwright');
const { ouvrir } = require('../lancerEssais.js');

// Script injecté dans la page : petites fonctions de pilotage et de contrôle, toutes préfixées __P.
const SCRIPT_PAGE = `
window.__P = (function () {
  var attente = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var visible = function (e) { if (!e) { return false; } var r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  var lib = function (e) { return ((e && (e.innerText || e.getAttribute('aria-label'))) || '').replace(/\\s+/g, ' ').trim(); };
  var P = { attente: attente, visible: visible, lib: lib };
  P.boutonsBas = function () { return [].slice.call(document.querySelectorAll('.barre-navigation-fixe button')).filter(visible); };
  P.boutonAvant = function () { return P.boutonsBas().filter(function (b) { return !/Retour|Accueil/.test(b.innerText); }).pop() || null; };
  P.boutonRetour = function () { return P.boutonsBas().filter(function (b) { return /Retour/.test(b.innerText); })[0] || null; };
  P.boutonAccueil = function () { return P.boutonsBas().filter(function (b) { return /Accueil/.test(b.innerText); })[0] || null; };
  P.barre = function () {
    var l = [].slice.call(document.querySelectorAll('.barre-etapes-bilan .pastille-etape-action'));
    return l.map(function (e) { return { nom: lib(e.querySelector('.pastille-etape-action-label')), courante: e.classList.contains('pastille-etape-action-courante'), cliquable: e.style.cursor === 'pointer' || !!e.getAttribute('onclick') || e.tagName === 'BUTTON' }; });
  };
  P.ecran = function () {
    var h = document.querySelector('#app h1');
    var b = P.boutonAvant(), r = P.boutonRetour();
    var raison = document.querySelector('.barre-raison-suivant');
    return {
      hash: location.hash, page: (typeof pageActuelle !== 'undefined' ? pageActuelle : ''), h1: h ? lib(h) : '',
      barre: P.barre().map(function (x) { return (x.courante ? '[' : '') + x.nom + (x.courante ? ']' : ''); }).join(' > '),
      avant: b ? lib(b) + (b.disabled ? ' (grisé)' : '') : null, retour: !!r, accueil: !!P.boutonAccueil(),
      raison: raison ? lib(raison) : '', fenetre: !!document.querySelector('#fenetreERIP.visible, .fenetre-erip-overlay.visible, .modal.show')
    };
  };
  // Contrôles de fond sur l'écran affiché : renvoie la liste des anomalies.
  P.controle = function () {
    var out = [], app = document.getElementById('app'), t = app ? app.innerText : '';
    if (!app || !t.trim()) { out.push('écran vide'); }
    if (/undefined|NaN|\\[object|null\\b/.test(t)) { out.push('texte cassé : ' + (t.match(/.{0,25}(undefined|NaN|\\[object|null\\b).{0,25}/) || [''])[0].replace(/\\s+/g, ' ')); }
    if (/[\\u2014\\u2013]/.test(t)) { out.push('tiret long visible'); }
    if (/(^|[^A-Za-zÀ-ÿ])IA([^A-Za-zÀ-ÿ]|$)/.test(t)) { out.push('mot « IA » visible'); }
    if (document.documentElement.scrollWidth > window.innerWidth + 1) { out.push('débordement horizontal (' + document.documentElement.scrollWidth + ' > ' + window.innerWidth + ')'); }
    if (!document.querySelector('#app h1') && !document.querySelector('#app h2')) { out.push('aucun titre'); }
    if (!P.boutonRetour() && !/^#(cv|)$/.test(location.hash)) { out.push('pas de bouton Retour dans la barre du bas'); }
    if (!P.boutonAccueil() && !/^#(cv|)$/.test(location.hash)) { out.push('pas de bouton Accueil dans la barre du bas'); } var lignesBas = P.boutonsBas().map(function (b) { var q = b.getBoundingClientRect(); return q.top + q.height / 2; }); if (lignesBas.length && Math.max.apply(null, lignesBas) - Math.min.apply(null, lignesBas) > 6) { out.push('les boutons de la barre du bas ne sont pas sur la même ligne (' + P.boutonsBas().map(function (b) { return lib(b).slice(0, 14) + '@' + Math.round(b.getBoundingClientRect().top); }).join(', ') + ')'); }
    var btnVides = [].slice.call(document.querySelectorAll('#app button')).filter(function (b) { return visible(b) && !lib(b) && !(b.textContent || '').trim() && !b.querySelector('i, svg, img') && !b.getAttribute('aria-label'); });
    if (btnVides.length) { out.push(btnVides.length + ' bouton(s) visible(s) sans texte ni icône'); }
    var enFr = t.match(/\\b(Loading|Submit|Cancel|Continue|Back|Next|Save)\\b/);
    if (enFr) { out.push('mot anglais : ' + enFr[0]); }
    return out;
  };
  P.suiv = async function () {
    var b = P.boutonAvant(); if (!b) { return 'PAS DE BOUTON'; } var l = lib(b); if (b.disabled) { return 'GRISE ' + l; }
    b.click(); await attente(1300); return 'ok:' + l;
  };
  P.retour = async function () { var b = P.boutonRetour(); if (!b) { return 'PAS DE RETOUR'; } b.click(); await attente(1000); return 'ok'; };
  P.clic = async function (sel, re) {
    var e = null;
    if (typeof sel === 'string' && sel) { e = [].slice.call(document.querySelectorAll(sel)).filter(visible).filter(function (x) { return !re || new RegExp(re).test(x.innerText); })[0] || null; }
    else if (re) { e = [].slice.call(document.querySelectorAll('#app button, #app a, #app [role=button], #app summary')).filter(visible).filter(function (x) { return new RegExp(re).test(x.innerText); })[0] || null; }
    if (!e) { return 'ABSENT ' + (sel || '') + ' ' + (re || ''); }
    e.click(); await attente(800); return 'ok';
  };
  P.saisir = function (sel, v) {
    var e = document.querySelector(sel); if (!e) { return false; }
    var p = e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : e.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(p, 'value').set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return true;
  };
  P.coller = async function (texte) {
    window.open = function () { return {}; };
    var trouver = function () { return [].slice.call(document.querySelectorAll('#app [id^=fcRacine]')).filter(function (x) { return x.__collage; })[0] || document.getElementById('fcRacineActionIA') || [].slice.call(document.querySelectorAll('#app [id^=fcRacine]'))[0]; };
    var r = trouver();
    if (!r || !r.__collage) { var t = [].slice.call(document.querySelectorAll('#app button, #app summary')).filter(function (b) { return /Importer la réponse|Coller le complément|Coller la réponse/.test(b.innerText); })[0]; if (t) { t.click(); await attente(800); } r = trouver(); }
    if (!r || !r.__collage) { var m = [].slice.call(document.querySelectorAll('#app button, #app summary')).filter(function (b) { return /Coller à la main/.test(b.innerText); })[0]; if (m) { m.click(); await attente(800); } r = trouver(); }
    if (!r || !r.__collage) { return 'PAS DE ZONE DE COLLAGE'; }
    var ret = r.querySelector('[data-fc=retour]'); if (ret) { ret.click(); }
    r.__collage.coller(texte); await attente(1300); return 'etat:' + r.__collage.etat();
  };
  return P;
})();
`;

// Journal d'un parcours : une ligne par constat, rangées par gravité.
class Journal {
  constructor(nom) { this.nom = nom; this.lignes = []; this.ecrans = []; }
  info(t) { this.lignes.push({ n: 'info', t }); }
  ok(t) { this.lignes.push({ n: 'ok', t }); }
  ko(t) { this.lignes.push({ n: 'ECART', t }); console.log('  ECART : ' + t); }
  ecran(e, anomalies) { this.ecrans.push({ e, anomalies }); (anomalies || []).forEach((a) => this.ko(e.hash + ' « ' + e.h1 + ' » : ' + a)); }
}

async function ouvrirPage(largeur) {
  const b = await chromium.launch();
  const p = await ouvrir(b, largeur || 1280);
  const erreurs = [];
  p.on('pageerror', (e) => erreurs.push('PAGEERR ' + e.message.slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) { erreurs.push('CONSOLE ' + m.text().slice(0, 200)); } });
  await p.goto('http://app.local/index.html');
  await p.waitForTimeout(3500);
  await p.mouse.click(3, 600);   // vrai clic : sans lui Chrome ignore l'historique créé par script (leçon 9.45)
  await p.addScriptTag({ content: SCRIPT_PAGE });
  await p.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) { /* rien */ } });
  return { b, p, erreurs };
}

// Pilotage côté Node (courts raccourcis).
function pilote(p, j) {
  const o = {
    ev: (f, a) => p.evaluate(f, a),
    ecran: () => p.evaluate(() => window.__P.ecran()),
    controle: () => p.evaluate(() => window.__P.controle()),
    suiv: () => p.evaluate(() => window.__P.suiv()),
    retour: () => p.evaluate(() => window.__P.retour()),
    clic: (sel, re) => p.evaluate((x) => window.__P.clic(x[0], x[1]), [sel || '', re || '']),
    saisir: (sel, v) => p.evaluate((x) => window.__P.saisir(x[0], x[1]), [sel, v]),
    coller: (t) => p.evaluate((x) => window.__P.coller(x), t),
    aller: async (route) => { await p.evaluate((r) => naviguerVers(r), route); await p.waitForTimeout(900); },
    attendre: (ms) => p.waitForTimeout(ms),
    // Contrôle l'écran courant et le range dans le journal.
    verifier: async (attendu) => {
      const e = await o.ecran(); const an = await o.controle();
      if (attendu && attendu.h1 && !new RegExp(attendu.h1).test(e.h1)) { an.push('titre attendu /' + attendu.h1 + '/ mais « ' + e.h1 + ' »'); }
      if (attendu && attendu.hash && e.hash !== attendu.hash) { an.push('page attendue ' + attendu.hash + ' mais ' + e.hash); }
      if (attendu && attendu.etape && !new RegExp('\\[' + attendu.etape + '\\]').test(e.barre)) { an.push('étape courante attendue « ' + attendu.etape + ' » mais barre : ' + e.barre); }
      if (process.env.DEBUG) {
        const det = await p.evaluate(() => ({ b: [].slice.call(document.querySelectorAll('#app button, #app summary')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 34)).filter(Boolean).slice(0, 30), c: [].slice.call(document.querySelectorAll('#app input, #app select, #app textarea')).filter((x) => window.__P.visible(x)).map((x) => (x.id || x.name || x.type)).slice(0, 15), t: document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, 450) }));
        console.log('--- ' + e.hash + ' « ' + e.h1 + ' » | bas : ' + e.avant + (e.raison ? ' (' + e.raison + ')' : ''));
        console.log('  boutons : ' + det.b.join(' ; '));
        console.log('  champs : ' + det.c.join(' ; '));
        console.log('  texte : ' + det.t);
      }
      j.ecran(e, an); return e;
    },
    // Reprise : « Accueil » puis retour dans le module par sa page commune ; rend les boutons visibles de la page commune pour que le parcours les contrôle.
    accueilPuisPageCommune: async (nom, routeCommune) => {
      const avant = await o.ecran();
      await p.evaluate(() => { const b = window.__P.boutonAccueil(); if (b) { b.click(); } });
      await p.waitForTimeout(900);
      const acc = await o.ecran();
      if (acc.hash !== '#cv' && acc.hash !== '') { j.ko(nom + ' : « Accueil » mène à ' + acc.hash + ' « ' + acc.h1 + ' » au lieu de l’accueil'); } else { j.ok(nom + ' : « Accueil » ramène à l’accueil'); }
      await o.aller(routeCommune);
      const boutons = await p.evaluate(() => [].slice.call(document.querySelectorAll('#app button')).filter((b) => window.__P.visible(b)).map((b) => (b.id ? b.id + ':' : '') + window.__P.lib(b).slice(0, 40)).filter(Boolean));
      return { avant, boutons };
    },
    // Avance avec le bouton du bas jusqu'à `max` fois, en contrôlant chaque écran ; renvoie la trace (une ligne par écran).
    tracer: async (max, nom) => {
      const trace = [];
      for (let k = 0; k < max; k++) {
        const s = await o.suiv();
        const e = await o.verifier(null);
        trace.push(s + ' → ' + e.hash + ' « ' + e.h1 + ' » [bouton : ' + e.avant + '] [barre : ' + (e.barre || 'aucune') + ']');
        if (!s.startsWith('ok')) { break; }
      }
      trace.forEach((t) => j.info((nom || 'suite') + ' : ' + t));
      return trace;
    },
    // « Retour » puis « Continuer » : on doit retrouver le même écran (même page, même titre) ; renvoie l'écran d'arrivée du Retour.
    allerRetour: async (nom) => {
      const avant = await o.ecran();
      const r = await o.retour();
      const milieu = await o.ecran();
      if (r !== 'ok') { j.ko(nom + ' : ' + r); return milieu; }
      const s = await o.suiv();
      const apres = await o.ecran();
      if (!s.startsWith('ok')) { j.ko(nom + ' : au retour, « Continuer » ' + s + ' (écran ' + milieu.hash + ')'); }
      else if (apres.hash !== avant.hash || apres.h1 !== avant.h1) { j.ko(nom + ' : Retour (vers ' + milieu.hash + ' « ' + milieu.h1 + ' ») puis Continuer ne ramène pas à ' + avant.hash + ' mais à ' + apres.hash + ' « ' + apres.h1 + ' »'); }
      else { j.ok(nom + ' : Retour vers ' + milieu.hash + ' « ' + milieu.h1 + ' », puis Continuer revient bien ici'); }
      return milieu;
    }
  };
  return o;
}

module.exports = { Journal, ouvrirPage, pilote, SCRIPT_PAGE };
