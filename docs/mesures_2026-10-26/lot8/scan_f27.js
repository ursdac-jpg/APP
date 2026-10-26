/* Lot 8 / F27 (hypothèse) : texte clair posé sur un fond clair (ou texte sombre sur fond sombre) dans l'aperçu du CV.
   Méthode : pour chaque modèle de la galerie x chaque forme de colonne / de bandeau (table des capacités), le CV est rendu dans un cadre visible,
   puis 4 captures : (B) tout texte transparent = le fond réel ; (R) seuls les textes clairs recolorés en rouge ; (V) seuls les textes sombres en vert ;
   (M) les textes intermédiaires en bleu. Les pixels de texte réellement VISIBLES (après les découpes de la bascule à deux tons) sont comparés au fond (B) :
   contraste < 2 = texte illisible. Aucune modification de l'application : lecture seule.
   Usage : URL_APP=http://localhost:8123 TRANCHE=0/4 node scan_f27.js   (TRANCHE=i/n : i-ème modèle sur n, pour lancer n travailleurs)
   Variables : SORTIE (fichier .jsonl), MODELES (filtre par sous-chaîne), RAPIDE=1 (moins de scénarios : un seul sens, pas de croisement bandeau + colonne),
   COTES=gauche (ou gauche,droite : côté du fond de colonne ajouté), PHOTOS=dossier (capture de chaque cas fautif). */
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path');
const URL_APP = process.env.URL_APP || 'http://localhost:8123';
const [tIdx, tN] = (process.env.TRANCHE || '0/1').split('/').map(Number);
const SORTIE = process.env.SORTIE || path.join(os.tmpdir(), 'scan_f27_' + tIdx + '.jsonl');
const FILTRE = process.env.MODELES || '';

function scenarios(cap) {
  if (process.env.COMBOS) { return combos(cap); }
  const S = [{ nom: 'base', regs: {} }];
  const bandeauOK = cap.bandeau !== 'non', colOK = cap.colonne !== 'non';
  const surBandeau = cap.bandeau === 'ajoutable' ? { regBandeauEnTete: true } : {};
  if (bandeauOK) {
    S.push({ nom: 'bandeau', regs: Object.assign({}, surBandeau) });
    cap.formesBandeau.forEach(f => [0, 1].forEach(s => {
      if (process.env.RAPIDE && s > 0) { return; }
      S.push({ nom: 'bandeau:' + f + ':' + s, regs: Object.assign({ regBordBandeau: f, regBordBandeauSens: String(s) }, surBandeau) });
    }));
  }
  if (colOK) {
    const prep = cap.colonne === 'ajoutable' ? { regColonnes: '2', regFondColonnes: 'gauche' } : {};
    const cotes = cap.colonne === 'ajoutable' ? (process.env.COTES ? process.env.COTES.split(',') : ['gauche', 'droite']) : ['natif'];
    cotes.forEach(cote => {
      const base = cap.colonne === 'ajoutable' ? { regColonnes: '2', regFondColonnes: cote } : {};
      const formes = [['droit', { regColonneBordDroit: true }], ['vallonne', { regColonneBordDroit: false }], ['arche', { regColonneArche: true }]];
      cap.formesColonne.filter(f => !['droit', 'vallonne', 'arche'].includes(f)).forEach(f => formes.push([f, { regColonneBordDroit: false, regColonneForme: f }]));
      formes.forEach(([f, r]) => [0, 1].forEach(s => {
        if (s > 0 && (cote === 'droite' || process.env.RAPIDE)) { return; }
        S.push({ nom: 'colonne:' + cote + ':' + f + ':' + s, regs: Object.assign({}, base, r, { regColonneSens: String(s) }) });
        if (s === 0 && cote === 'gauche' && bandeauOK && !process.env.RAPIDE) {
          S.push({ nom: 'colonne+bandeau:' + f, regs: Object.assign({}, base, r, surBandeau, { regColonneSens: '0' }) });
        }
      }));
    });
  }
  return S;
}

// COMBOS=1 : seulement le croisement d'un bandeau (cinq formes) et d'une colonne (toutes ses formes), pour chercher les trous et les textes illisibles du croisement.
function combos(cap) {
  const S = [];
  if (cap.bandeau === 'non' || cap.colonne === 'non') { return S; }
  const surBandeau = cap.bandeau === 'ajoutable' ? { regBandeauEnTete: true } : {};
  const prep = cap.colonne === 'ajoutable' ? { regColonnes: '2', regFondColonnes: 'gauche' } : {};
  const colonnes = [['droit', { regColonneBordDroit: true }], ['vallonne', { regColonneBordDroit: false }], ['arche', { regColonneArche: true }]];
  cap.formesColonne.filter(f => !['droit', 'vallonne', 'arche'].includes(f)).forEach(f => colonnes.push([f, { regColonneBordDroit: false, regColonneForme: f }]));
  ['droit', 'vallonne', 'pointe', 'diagonale', 'vague2'].filter(f => cap.formesBandeau.includes(f)).forEach(fb => {
    colonnes.forEach(([fc, rc]) => {
      if (fc === 'arche') { return; }   // l'arche est exclue avec un bandeau coloré (règle du panneau)
      S.push({ nom: 'combo:bandeau=' + fb + ':colonne=' + fc, regs: Object.assign({}, prep, surBandeau, rc, { regBordBandeau: fb, regColonneSens: '0', regBordBandeauSens: '0' }) });
    });
  });
  return S;
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 900, height: 1180 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on('pageerror', e => {});
  await p.goto(URL_APP + '/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  const caps = await p.evaluate(async () => (await fetch('/scripts/rendu/capacites.json')).json());
  const modeles = await p.evaluate(() => window.__rendu.liste().map(m => ({ cle: m.cle, id: m.id, sobre: m.sobre, nom: m.nom })));
  const aFaire = modeles.filter((m, i) => i % tN === tIdx && (!FILTRE || m.cle.includes(FILTRE)));
  fs.writeFileSync(SORTIE, '');

  // Ouvre un cadre visible (794 x 1123, en haut à gauche) avec le CV du modèle.
  async function ouvrirModele(m) {
    await p.evaluate(async (m) => {
      window.__cvPdfSansRemplissageInitial = true;
      const copie = window.__rendu.dossierFixe(); window.__refDossier = window.dossier; window.dossier = copie;
      const old = document.getElementById('__f27'); if (old) { old.remove(); }
      const f = document.createElement('iframe'); f.id = '__f27';
      f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;';
      document.body.appendChild(f);
      const nom = [copie.identite.prenom, copie.identite.nom].join(' ');
      f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
      f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4(nom, copie)); f.contentDocument.close();
      for (let i = 0; i < 100 && !f.contentDocument.querySelector('#conteneurPage .cv'); i++) { await new Promise(r => setTimeout(r, 100)); }
      await new Promise(r => setTimeout(r, 1200));
      const w = f.contentWindow;
      if (m.sobre) { w._pdfChoisirVarianteSobre(m.id); } else { w._pdfChoisirModeleCreatif(m.id); }
      await new Promise(r => setTimeout(r, 1800));
      // état initial des contrôles de forme, pour revenir à zéro entre deux scénarios
      const ids = ['regBandeauEnTete', 'regBordBandeau', 'regBordBandeauSens', 'regColonnes', 'regFondColonnes', 'regColonneBordDroit', 'regColonneArche', 'regColonneForme', 'regColonneSens'];
      window.__f27base = {};
      ids.forEach(id => { const e = w.document.getElementById(id); if (e) { window.__f27base[id] = e.type === 'checkbox' ? e.checked : e.value; } });
    }, m);
  }
  async function appliquer(regs) {
    await p.evaluate(async (regs) => {
      const w = document.getElementById('__f27').contentWindow, d = w.document;
      const tout = Object.assign({}, window.__f27base, regs);
      // ordre : colonnes / bandeau d'abord, puis les formes
      const ordre = ['regColonnes', 'regFondColonnes', 'regBandeauEnTete', 'regColonneBordDroit', 'regColonneArche', 'regColonneForme', 'regColonneSens', 'regBordBandeau', 'regBordBandeauSens'];
      for (const id of ordre) {
        if (!(id in tout)) { continue; }
        const e = d.getElementById(id); if (!e) { continue; }
        const v = tout[id];
        if (e.type === 'checkbox') { if (e.checked === !!v) { continue; } e.checked = !!v; } else { if (e.value === String(v)) { continue; } e.value = v; }
        e.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, 120));
      }
      await new Promise(r => setTimeout(r, 650));
    }, regs);
  }
  // Étiquette les éléments porteurs de texte : groupe w (clair), d (sombre), m (intermédiaire) + rectangles de texte.
  async function etiqueter() {
    return p.evaluate(() => {
      const w = document.getElementById('__f27').contentWindow, d = w.document, cv = d.querySelector('#conteneurPage .cv');
      if (!cv) { return null; }
      const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
      const analyser = s => { const m = /rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[,/ ]+([\d.]+))?/.exec(s || ''); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
      d.querySelectorAll('[data-f27]').forEach(e => e.removeAttribute('data-f27'));
      const liste = []; let n = 0;
      cv.querySelectorAll('*').forEach(e => {
        const tn = [...e.childNodes].filter(x => x.nodeType === 3 && x.textContent.trim());
        if (!tn.length) { return; }
        if (e.closest('.tete-hors')) { return; }   // copie à deux tons : elle double le vrai texte, on ne compte que le vrai
        const st = w.getComputedStyle(e);
        if (st.display === 'none' || st.visibility === 'hidden') { return; }
        let c = analyser(st.webkitTextFillColor) || analyser(st.color); if (!c || c[3] < 0.4) { return; }
        const l = lum(c), g = (Math.min(c[0], c[1], c[2]) >= 200) ? 'w' : (l < 0.1 ? 'd' : 'm');
        const rects = [];
        tn.forEach(t => { const r = d.createRange(); r.selectNodeContents(t); [...r.getClientRects()].forEach(q => { if (q.width > 1 && q.height > 1 && q.bottom > 0 && q.top < 1123 && q.right > 0 && q.left < 794) { rects.push([q.left, q.top, q.right, q.bottom]); } }); });
        if (!rects.length) { return; }
        const id = 'e' + (n++); e.setAttribute('data-f27', g); e.setAttribute('data-f27id', String(n - 1));
        liste.push({ id: n - 1, g, c, txt: tn.map(x => x.textContent.trim()).join(' ').slice(0, 40), cls: (e.className && e.className.baseVal === undefined ? e.className : '') + '', tag: e.tagName.toLowerCase(), rects });
      });
      // Géométrie : hauteur de l'en-tête, trou entre le bandeau et la colonne colorée
      const pg = d.querySelector('.page-a4') || cv, pgr = pg.getBoundingClientRect(), tete = cv.querySelector('.tete');
      let geom = { teteRatio: null, trou: null };
      if (tete) {
        const tr = tete.getBoundingClientRect(); geom.teteRatio = Math.round(tr.height / pgr.height * 1000) / 1000;
        const fondTete = /tete-fond/.test(tete.className) || (analyser(w.getComputedStyle(tete).backgroundColor) || [0, 0, 0, 0])[3] > 0.5;
        let colTop = null;
        if (/(^| )col-vague-(g|d)( |$)/.test(cv.className)) { const pv = w.getComputedStyle(cv, '::before'); if (pv.content !== 'none') { const t = parseFloat(pv.top); colTop = isNaN(t) ? 0 : t; } }
        else { const cf = cv.querySelector('.col-fond'); if (cf) { colTop = cf.getBoundingClientRect().top - pgr.top; } }
        if (fondTete && colTop !== null) { geom.trou = Math.round((colTop - (tr.bottom - pgr.top)) * 10) / 10; }
      }
      return { nbPages: d.querySelectorAll('.page-a4').length, elements: liste, geom };
    });
  }
  async function fixerStyle(css) {
    await p.evaluate((css) => {
      const d = document.getElementById('__f27').contentDocument; let s = d.getElementById('__f27s');
      if (!s) { s = d.createElement('style'); s.id = '__f27s'; d.head.appendChild(s); }
      s.textContent = css;
    }, css);
    await p.waitForTimeout(60);
  }
  const clip = { x: 0, y: 0, width: 794, height: 1123 };
  async function photo() { return (await p.screenshot({ clip, animations: 'disabled' })).toString('base64'); }
  const TRANSP = '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;}';
  const MARQ = (g, col) => '*{text-shadow:none!important;}[data-f27="' + g + '"]{color:' + col + '!important;-webkit-text-fill-color:' + col + '!important;}';
  async function analyserPixels(imgs, elements) {
    return p.evaluate(async ({ imgs, elements }) => {
      const charger = async b64 => { const bl = await (await fetch('data:image/png;base64,' + b64)).blob(); const bm = await createImageBitmap(bl); const c = new OffscreenCanvas(bm.width, bm.height); const x = c.getContext('2d'); x.drawImage(bm, 0, 0); return x.getImageData(0, 0, bm.width, bm.height); };
      const B = await charger(imgs.B), M = { w: await charger(imgs.R), d: await charger(imgs.V), m: await charger(imgs.M) };
      const W = B.width, H = B.height;
      const lum = (r, g, b) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const marq = { w: [255, 0, 0], d: [0, 255, 0], m: [0, 0, 255] };
      const hits = [];
      elements.forEach(el => {
        const I = M[el.g], mk = marq[el.g], lc = lum(el.c[0], el.c[1], el.c[2]);
        let tot = 0, bas = 0, fonds = [];
        el.rects.forEach(r => {
          for (let y = Math.max(0, Math.floor(r[1])); y < Math.min(H, Math.ceil(r[3])); y++) for (let x = Math.max(0, Math.floor(r[0])); x < Math.min(W, Math.ceil(r[2])); x++) {
            const i = (y * W + x) * 4;
            // pixel de texte visible = proche de la couleur du marqueur et différent du fond transparent
            const dm = Math.abs(I.data[i] - mk[0]) + Math.abs(I.data[i + 1] - mk[1]) + Math.abs(I.data[i + 2] - mk[2]);
            const db = Math.abs(I.data[i] - B.data[i]) + Math.abs(I.data[i + 1] - B.data[i + 1]) + Math.abs(I.data[i + 2] - B.data[i + 2]);
            if (dm < 90 && db > 200) {
              tot++;
              const lb = lum(B.data[i], B.data[i + 1], B.data[i + 2]);
              const ratio = (Math.max(lb, lc) + 0.05) / (Math.min(lb, lc) + 0.05);
              if (ratio < 2) { bas++; if (fonds.length < 3) { fonds.push([B.data[i], B.data[i + 1], B.data[i + 2]]); } }
            }
          }
        });
        if (tot >= 6 && bas >= 6 && bas / tot > 0.15) { hits.push({ id: el.id, fondMoyen: (function () { let r = 0, g2 = 0, b2 = 0, k = 0; el.rects.forEach(rc => { for (let y = Math.max(0, Math.floor(rc[1])); y < Math.min(H, Math.ceil(rc[3])); y += 2) for (let x = Math.max(0, Math.floor(rc[0])); x < Math.min(W, Math.ceil(rc[2])); x += 2) { const i = (y * W + x) * 4; r += B.data[i]; g2 += B.data[i + 1]; b2 += B.data[i + 2]; k++; } }); return k ? [Math.round(r / k), Math.round(g2 / k), Math.round(b2 / k)] : null; })(), txt: el.txt, g: el.g, tag: el.tag, cls: el.cls.slice(0, 40), couleur: el.c.slice(0, 3), pixels: tot, illisibles: bas, fond: fonds[0] || null }); }
      });
      return hits;
    }, { imgs, elements });
  }

  for (const m of aFaire) {
    const cap = caps[m.cle]; if (!cap) { continue; }
    const t0 = Date.now(); let nbS = 0, nbH = 0;
    try {
      await ouvrirModele(m);
      for (const sc of scenarios(cap)) {
        if (process.env.SEULS && !new RegExp(process.env.SEULS).test(sc.nom)) { continue; }
        try {
          await appliquer(sc.regs);
          await fixerStyle('');
          const tag = await etiqueter(); if (!tag) { continue; }
          await fixerStyle(TRANSP); const B = await photo();
          await fixerStyle(MARQ('w', '#ff0000')); const R = await photo();
          await fixerStyle(MARQ('d', '#00ff00')); const V = await photo();
          await fixerStyle(MARQ('m', '#0000ff')); const M = await photo();
          await fixerStyle('');
          const hits = await analyserPixels({ B, R, V, M }, tag.elements);
          nbS++; if (hits.length) { nbH++; }
          fs.appendFileSync(SORTIE, JSON.stringify({ modele: m.cle, scenario: sc.nom, pages: tag.nbPages, nbTextes: tag.elements.length, geom: tag.geom, hits }) + '\n');
          if (process.env.APRES && hits.length && process.env.PHOTOS && new RegExp(process.env.APRES).test(m.cle + '__' + sc.nom)) {
            fs.mkdirSync(process.env.PHOTOS, { recursive: true });
            const nomF = (m.cle + '__' + sc.nom).replace(/[^a-zA-Z0-9_+=-]/g, '_');
            await fixerStyle(''); await p.screenshot({ clip, path: path.join(process.env.PHOTOS, nomF + '__avant.png') });
            const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
            const regles = hits.filter(h => h.fondMoyen).map(h => '[data-f27id="' + h.id + '"]{color:' + (lum(h.fondMoyen) < 0.35 ? '#ffffff' : '#1b1b1b') + '!important;-webkit-text-fill-color:' + (lum(h.fondMoyen) < 0.35 ? '#ffffff' : '#1b1b1b') + '!important;}').join('');
            await fixerStyle(regles); await p.screenshot({ clip, path: path.join(process.env.PHOTOS, nomF + '__apres.png') }); await fixerStyle('');
          }
          if ((hits.length || (tag.geom && (tag.geom.teteRatio > 0.3 || (tag.geom.trou || 0) > 2))) && process.env.PHOTOS) {
            fs.mkdirSync(process.env.PHOTOS, { recursive: true });
            await p.screenshot({ clip, path: path.join(process.env.PHOTOS, (m.cle + '__' + sc.nom).replace(/[^a-zA-Z0-9_+-]/g, '_') + '.png') });
          }
        } catch (e) { fs.appendFileSync(SORTIE, JSON.stringify({ modele: m.cle, scenario: sc.nom, erreur: String(e).slice(0, 160) }) + '\n'); }
      }
    } catch (e) { fs.appendFileSync(SORTIE, JSON.stringify({ modele: m.cle, erreur: String(e).slice(0, 160) }) + '\n'); }
    console.log(`${m.cle} : ${nbS} scénarios, ${nbH} avec texte illisible, ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  await b.close();
})();
