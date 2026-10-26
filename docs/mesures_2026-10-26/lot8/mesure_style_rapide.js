/* Lot 8 / tâche 3 (F28) : la variété réelle du bouton « Style rapide (aléatoire) ».
   N vrais clics sur #btnMepDe dans l'éditeur de CV ; après chaque tirage on relève : modèle, allure, forme de bandeau, forme de colonne, couleur d'accent
   (fond de l'en-tête / de la colonne / du nom), police, nombre de formes décoratives, composition, nombre de pages. Puis : nombre de valeurs distinctes par dimension,
   fréquence du plus fréquent, part de tirages identiques au précédent, ressemblance entre tirages voisins (part de dimensions égales).
   Lecture seule. Usage : N=100 CAPTURES=dossier node mesure_style_rapide.js */
process.env.CONTROLES = '0';
const { vers } = require('./vers_editeur.js');
const fs = require('fs');
(async () => {
  const { b, p } = await vers();
  const N = parseInt(process.env.N || '100', 10);
  const tirages = [];
  for (let i = 0; i < N; i++) {
    const avant = await p.evaluate(() => { const f = document.querySelector('#zonePdfInlineCV iframe'); try { return f.contentDocument.getElementById('conteneurPage').innerHTML.length; } catch (e) { return -1; } });
    await p.locator('#btnMepDe').first().scrollIntoViewIfNeeded().catch(() => {});
    await p.locator('#btnMepDe').first().click();
    await p.waitForTimeout(2600);
    const r = await p.evaluate(() => {
      const f = document.querySelector('#zonePdfInlineCV iframe'); let d = null, w = null; try { d = f.contentDocument; w = f.contentWindow; } catch (e) {}
      if (!d) { return null; }
      const cv = d.querySelector('#conteneurPage .cv'); if (!cv) { return null; }
      const e = (typeof _mepEtatFormesActuel === 'function') ? _mepEtatFormesActuel() : {};
      const cs = (sel, prop) => { const x = cv.querySelector(sel); return x ? w.getComputedStyle(x)[prop] : null; };
      const fondCol = (() => { const x = cv.querySelector('.col-fond'); if (x) { return w.getComputedStyle(x).backgroundColor; } const pv = w.getComputedStyle(cv, '::before'); return pv && pv.content !== 'none' ? pv.backgroundColor : null; })();
      const reg = (typeof dossier !== 'undefined' && dossier.reglagesMiseEnPageCV) || {};
      return {
        modele: _mepCleModeleActuel(), allure: _mepAllureActuelle(),
        bandeau: e && e.bandeau, bandeauSens: e && e.bandeauSens, colonne: e && e.colonne, colonneSens: e && e.colonneSens, deuxColonnes: e && e.deuxColonnes,
        fondTete: cs('.tete', 'backgroundColor'), couleurNom: cs('.nom', 'color'), fondColonne: fondCol, police: (cs('.nom', 'fontFamily') || '').split(',')[0].replace(/"/g, ''), policeCorps: (cs('.corps', 'fontFamily') || '').split(',')[0].replace(/"/g, ''),
        nbFormesDeco: (typeof _mepFormesDeco === 'function' ? _mepFormesDeco().length : null), composition: (typeof _mepComposition === 'function' ? _mepComposition() : null) || '', pages: d.querySelectorAll('.page-a4').length,
        tailleHtml: d.getElementById('conteneurPage').innerHTML.length
      };
    });
    r.change = r && (r.tailleHtml !== avant);
    tirages.push(r);
    if ((i + 1) % 10 === 0) { console.log('tirages', i + 1); }
  }
  fs.writeFileSync((process.env.CAPTURES || '/tmp') + '/style_rapide_tirages.json', JSON.stringify(tirages, null, 0));
  await b.close();
})();
