/* Demande de Denis (26/10/2026) : « regarder au niveau des modèles préexistants si les options à la disposition de la personne ne mettent pas en difficulté,
   ne créent pas de bugs ni d'incohérences » et « l'en-tête peut prendre un peu plus de place à condition que le texte soit un peu agrandi, mais pas 1/3 ou 2/3
   du CV (cas déjà vu : le titre en colonne, un mot derrière l'autre) ».
   Méthode : pour chaque modèle de la galerie, avec UN contenu (court / moyen / long), on part du rendu de base, puis CHAQUE option du panneau (liste déroulante :
   chaque valeur ; case : l'état contraire ; curseur : minimum et maximum) est réglée seule, le CV est mesuré, puis l'option est remise. Mesures (géométrie seule,
   sans capture) : nombre de pages, hauteur de l'en-tête en part de la page, texte qui sort de la page, textes qui se chevauchent, textes du CV qui ont disparu,
   erreurs JavaScript, et les deux garde-fous déjà dans l'application (_pdfEnteteTropHaut, _pdfAccrocheTropEtroite).
   Lecture seule. Usage : URL_APP=... FIXTURE=court|moyen|long TRANCHE=i/n MODELES=filtre SORTIE=fichier.jsonl node balayage_options.js */
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path');
const URL_APP = process.env.URL_APP || 'http://localhost:8123';
const [tIdx, tN] = (process.env.TRANCHE || '0/1').split('/').map(Number);
const SORTIE = process.env.SORTIE || path.join(os.tmpdir(), 'balayage_options_' + tIdx + '.jsonl');
const FILTRE = process.env.MODELES || '';
const FIXTURE = process.env.FIXTURE || 'moyen';

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 900, height: 1180 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  let erreursPage = [];
  p.on('pageerror', e => { erreursPage.push(String(e).slice(0, 140)); });
  await p.goto(URL_APP + '/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  const modeles = await p.evaluate(() => [{ cle: 'standard', id: 'standard', standard: true, sobre: false }].concat(window.__rendu.liste().map(m => ({ cle: m.cle, id: m.id, sobre: m.sobre }))));
  const aFaire = modeles.filter((m, i) => i % tN === tIdx && (!FILTRE || m.cle.includes(FILTRE)));
  fs.writeFileSync(SORTIE, '');

  async function ouvrirModele(m) {
    await p.evaluate(async ({ m, FIXTURE }) => {
      window.__cvPdfSansRemplissageInitial = true;
      const copie = window.__rendu.dossierFixe();
      // trois contenus : court (jeu d'essai), moyen (accroche et titre de longueur ordinaire), long (accroche de 5 phrases, titre long, nom composé, 6 expériences)
      const accMoyenne = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme et à bien accueillir le public. Je cherche un poste stable en équipe.';
      const accLongue = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme dans des situations parfois tendues et à bien accueillir le public. J’ai travaillé en équipe, de jour comme de nuit, avec le sens des responsabilités. Je sais rédiger un rapport clair, contrôler des accès et alerter à temps. Je souhaite aujourd’hui un poste stable où mon sérieux et ma ponctualité sont reconnus, dans une entreprise qui forme ses équipes. Je suis disponible rapidement.';
      if (FIXTURE === 'moyen' || FIXTURE === 'long') {
        copie.ia = copie.ia || {}; copie.ia.cv = copie.ia.cv || {};
        copie.ia.cv.accrochesProposees = [FIXTURE === 'long' ? accLongue : accMoyenne]; copie.ia.cv.accrocheIdx = 0; copie.ia.cv.profil = FIXTURE === 'long' ? accLongue : accMoyenne;
      }
      if (FIXTURE === 'long') {
        copie.titreCV = 'Agent de sécurité et de prévention, surveillance et accueil du public'; copie.metierCible = copie.titreCV;
        copie.identite.prenom = 'Marie-Hélène'; copie.identite.nom = 'Dubois-Vandenbroucke'; copie.identite.email = 'marie-helene.dubois-vandenbroucke@exemple.fr';
        const ex = copie.experiences[0]; for (let i = 0; i < 3; i++) { copie.experiences.push(JSON.parse(JSON.stringify(ex))); }
      }
      window.__refDossier = window.dossier; window.dossier = copie;
      const old = document.getElementById('__bo'); if (old) { old.remove(); }
      const f = document.createElement('iframe'); f.id = '__bo';
      f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;';
      document.body.appendChild(f);
      const nom = [copie.identite.prenom, copie.identite.nom].join(' ');
      f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
      f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4(nom, copie)); f.contentDocument.close();
      for (let i = 0; i < 100 && !f.contentDocument.querySelector('#conteneurPage .cv'); i++) { await new Promise(r => setTimeout(r, 100)); }
      await new Promise(r => setTimeout(r, 1200));
      const w = f.contentWindow;
      if (!m.standard) { if (m.sobre) { w._pdfChoisirVarianteSobre(m.id); } else { w._pdfChoisirModeleCreatif(m.id); } }
      await new Promise(r => setTimeout(r, 1800));
    }, { m, FIXTURE });
  }
  // Mesure géométrique du CV affiché
  const MESURE = (FIXTURE_NOM) => {
    const w = document.getElementById('__bo').contentWindow, d = w.document, cv = d.querySelector('#conteneurPage .cv');
    if (!cv) { return { erreur: 'pas de CV' }; }
    const pages = d.querySelectorAll('.page-a4'), pg = pages[0] || cv, pgr = pg.getBoundingClientRect();
    const tete = cv.querySelector('.tete'); const tr = tete ? tete.getBoundingClientRect() : null;
    const textes = []; const tw = d.createTreeWalker(cv, 4, null, false); let n;
    while ((n = tw.nextNode())) {
      if (!/\S/.test(n.nodeValue)) { continue; }
      const e = n.parentElement; if (!e || e.closest('.tete-hors, .tete-hors-colonne, .compo-z, .formes-deco, .forme-deco-edition, .marque-page, .poignees-cv, script, style')) { continue; }
      const st = w.getComputedStyle(e); if (st.display === 'none' || st.visibility === 'hidden') { continue; }
      const rg = d.createRange(); rg.selectNodeContents(n); [...rg.getClientRects()].forEach(q => { if (q.width > 2 && q.height > 2) { textes.push({ e, t: n.nodeValue.trim().slice(0, 24), l: q.left - pgr.left, tp: q.top - pgr.top, r: q.right - pgr.left, b: q.bottom - pgr.top }); } });
    }
    const L = pgr.width, H = pgr.height;
    // texte qui sort de la page (sur les côtés) : sur la première page seulement
    const sort = textes.filter(q => q.tp < H && (q.r > L + 1 || q.l < -1)).map(q => q.t);
    // chevauchements : deux textes d'éléments différents, non imbriqués, dont l'intersection dépasse 35 % du plus petit
    const chev = []; const T = textes.filter(q => q.tp < H * 1.2);
    for (let i = 0; i < T.length && chev.length < 6; i++) for (let j = i + 1; j < T.length; j++) {
      const a = T[i], c = T[j]; if (a.e === c.e || a.e.contains(c.e) || c.e.contains(a.e)) { continue; }
      const ix = Math.min(a.r, c.r) - Math.max(a.l, c.l), iy = Math.min(a.b, c.b) - Math.max(a.tp, c.tp); if (ix <= 1 || iy <= 1) { continue; }
      const sm = Math.min((a.r - a.l) * (a.b - a.tp), (c.r - c.l) * (c.b - c.tp)); if (ix * iy > 0.35 * sm) { chev.push(a.t + ' / ' + c.t); if (chev.length >= 6) { break; } }
    }
    const tout = cv.textContent;
    const attendus = [FIXTURE_NOM, 'Sécuritas', 'Boulangerie', 'Café du centre', 'AFPA', 'Anglais', 'Rigueur', 'Course à pied'].filter(x => tout.indexOf(x) === -1);
    let tropHaut = null, accEtroite = null; try { tropHaut = w._pdfEnteteTropHaut(); accEtroite = w._pdfAccrocheTropEtroite(); } catch (e) {}
    return { pages: pages.length, teteRatio: tr ? Math.round(tr.height / H * 1000) / 1000 : null, sortDePage: sort.slice(0, 4), chevauchements: chev, manquants: attendus, tropHaut, accEtroite };
  };
  async function instantane() {
    return p.evaluate(() => {
      const d = document.getElementById('__bo').contentDocument, o = {};
      d.querySelectorAll('select[id^=reg], input[type=checkbox][id^=reg], input[type=range][id^=reg]').forEach(e => { o[e.id] = e.type === 'checkbox' ? e.checked : e.value; });
      return o;
    });
  }
  async function lister() {
    return p.evaluate(() => {
      const d = document.getElementById('__bo').contentDocument, l = [];
      d.querySelectorAll('select[id^=reg], input[type=checkbox][id^=reg], input[type=range][id^=reg]').forEach(e => {
        if (/^regCouleur|^regPhoto|Fichier|^regSobreActif$|^regCreatifActif$/.test(e.id)) { return; }
        if (e.tagName === 'SELECT') { [...e.options].filter(o => !o.hidden).forEach(o => l.push({ id: e.id, v: o.value, lib: o.textContent.trim().slice(0, 30) })); }
        else if (e.type === 'checkbox') { l.push({ id: e.id, v: !e.checked, lib: e.checked ? 'décoché' : 'coché' }); }
        else { l.push({ id: e.id, v: e.min, lib: 'min' }); l.push({ id: e.id, v: e.max, lib: 'max' }); }
      });
      return l;
    });
  }
  async function poser(id, v) {
    await p.evaluate(async ({ id, v }) => {
      const d = document.getElementById('__bo').contentDocument, e = d.getElementById(id); if (!e) { return; }
      if (e.type === 'checkbox') { e.checked = !!v; } else { e.value = v; }
      e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 650));
    }, { id, v });
  }
  async function restaurer(base) {
    await p.evaluate(async (base) => {
      const d = document.getElementById('__bo').contentDocument;
      for (const id of Object.keys(base)) {
        const e = d.getElementById(id); if (!e) { continue; }
        const actuel = e.type === 'checkbox' ? e.checked : e.value; if (actuel === base[id]) { continue; }
        if (e.type === 'checkbox') { e.checked = base[id]; } else { e.value = base[id]; }
        e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, 120));
      }
      await new Promise(r => setTimeout(r, 500));
    }, base);
  }

  for (const m of aFaire) {
    const t0 = Date.now(); let nb = 0, nbAnom = 0;
    try {
      await ouvrirModele(m);
      const base = await instantane(), opts = await lister();
      const mb = await p.evaluate(MESURE, FIXTURE === 'long' ? 'Marie-Hélène' : 'Camille'); erreursPage = [];
      fs.appendFileSync(SORTIE, JSON.stringify({ modele: m.cle, fixture: FIXTURE, option: 'BASE', mesure: mb }) + '\n');
      for (const o of opts) {
        if (String(base[o.id]) === String(o.v)) { continue; }
        try {
          await poser(o.id, o.v);
          const mes = await p.evaluate(MESURE, FIXTURE === 'long' ? 'Marie-Hélène' : 'Camille');
          const anom = (mes.pages > mb.pages) || (mes.teteRatio > 0.30) || (mes.teteRatio - (mb.teteRatio || 0) > 0.08) || (mes.sortDePage && mes.sortDePage.length) || (mes.chevauchements && mes.chevauchements.length > (mb.chevauchements || []).length) || (mes.manquants && mes.manquants.length > (mb.manquants || []).length) || mes.tropHaut || mes.accEtroite || erreursPage.length || mes.erreur;
          nb++; if (anom) { nbAnom++; }
          fs.appendFileSync(SORTIE, JSON.stringify({ modele: m.cle, fixture: FIXTURE, option: o.id, valeur: String(o.v), lib: o.lib, anomalie: !!anom, mesure: mes, erreursJs: erreursPage.slice(0, 2) }) + '\n');
          erreursPage = [];
          await restaurer(base);
        } catch (e) { fs.appendFileSync(SORTIE, JSON.stringify({ modele: m.cle, option: o.id, valeur: String(o.v), erreurScript: String(e).slice(0, 120) }) + '\n'); }
      }
    } catch (e) { fs.appendFileSync(SORTIE, JSON.stringify({ modele: m.cle, erreurModele: String(e).slice(0, 160) }) + '\n'); }
    console.log(m.cle + ' [' + FIXTURE + '] : ' + nb + ' réglages, ' + nbAnom + ' anomalies, ' + Math.round((Date.now() - t0) / 1000) + ' s');
  }
  await b.close();
})();
