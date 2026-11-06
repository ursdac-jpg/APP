/* Fin de parcours (28/10/2026) : « Merci bien, j'ai fini » depuis un CV ne doit plus ouvrir de fenêtre ; l'entretien garde sa fenêtre avec le texte rassurant. Usage : node verif_fin_parcours_2026-10-28.js */
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1000, height: 800 } })).newPage();
  const err = []; p.on('pageerror', e => err.push(String(e)));
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  const essai = async (nom, a) => {
    await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2000);
    await p.evaluate((a) => { Object.assign(dossier, a.extra || {}); dossier.modeCreation = a.mc; dossier.documentsEnregistres = {}; dossier.documentsEnregistres[a.doc] = true; dossier.dernierDocumentPrepare = a.doc; }, a);
    console.log(nom, '(document actif lu :', await p.evaluate(() => docActifActuel()) + ')');
    await p.evaluate(() => terminerParcours()); await p.waitForTimeout(1500);
    console.log('   ', JSON.stringify(await p.evaluate(() => { const m = (document.body.innerText.match(/Merci, tout est en ordre[\s\S]{0,330}/) || [''])[0].replace(/\s+/g, ' '); return { fenetre: !!m, etMaintenant: /Voulez-vous préparer votre lettre/.test(document.body.innerText), texte: m, route: location.hash }; })));
  };
  await essai('CV mettre à jour', { mc: 'maj', doc: 'cv' });
  await essai('CV récit', { mc: undefined, doc: 'cv', extra: { decouverteTerminee: true } });
  await essai('CV direct', { mc: undefined, doc: 'cv' });
  await essai('CV créé à la main (déjà sans fenêtre)', { mc: 'nouveau', doc: 'cv' });
  await essai('Lettre (déjà sans fenêtre)', { mc: 'maj', doc: 'lettre' });
  await essai('Entretien (fenêtre gardée)', { mc: 'maj', doc: 'entretien' });
  console.log('erreurs JS :', err.join(' / ') || 'aucune');
  await b.close(); })();
