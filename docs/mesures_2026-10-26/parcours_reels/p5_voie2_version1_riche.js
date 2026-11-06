// Reformuler, VERSION 1 (« La plus proche de votre CV ») : plus de deuxième passage chez l'assistant (maquette 4, 27/10/2026).
// Contrôle : après « Votre profil », « Continuer » arrive directement sur la mise en page, en mode fidèle, sans « Choisissez votre assistant ».
const R = './';
const L = require(R + 'lib.js'); const S = require(R + 'saisies4.js'); const A = require(R + 'avancer.js'); const Sa = require(R + 'saisies.js'); const REF = require(R + 'reformule.js');
Object.assign(REF.propositions[0], { loisirs: ['Football en club', 'Jardinage'], certifications: ['Sauveteur secouriste du travail, 2022'], logiciels: ['Word', 'Excel'], savoirs: ['Produits d’entretien'], informationsComplementaires: ['Disponible dès maintenant'], savoirEtre: ['Ponctualité'] });
(async () => {
  const { b, p } = await L.ouvrir();
  await S.deposerFichierEtEnregistrer(p);
  await L.clicTexte(p, 'Le reformuler et le présenter', 'carte Voie 2'); await p.waitForTimeout(1500);
  await Sa.objectifSpontanee(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (Préparer)'); await p.waitForTimeout(1500);
  await S.assistantEtColler(p, REF, 'v1');
  await p.waitForTimeout(1500);
  if (await p.locator('#fenetreERIP.visible').count()) {
    console.log('FENETRE:', (await p.locator('#fenetreERIP.visible').innerText()).replace(/\s+/g, ' ').slice(0, 500));
    console.log('boutons:', await p.locator('#fenetreERIP.visible button').allInnerTexts());
    await p.locator('#fenetreERIP.visible button').last().click(); await p.waitForTimeout(1500);
  }
  try { await A.avancer(p, 'v1', 6); } catch (err) {
    console.log('FENETRE (bloquante):', (await p.locator('#fenetreERIP').innerText()).replace(/\s+/g, ' ').slice(0, 1800));
    console.log('boutons:', await p.locator('#fenetreERIP button').allInnerTexts()); await b.close(); return;
  }
  const version = process.env.VERSION === '2' ? 1 : 0;
  await p.getByText('Choisir celle-ci', { exact: false }).nth(version).click(); await p.waitForTimeout(2000);
  await L.clic(p, '#btnSuivantNavigation', 'passer à la mise en forme'); await p.waitForTimeout(2500);
  await L.clic(p, '#btnSuivantNavigation', 'Récupérer votre CV : Continuer'); await p.waitForTimeout(2500);
  const e = await A.avancer(p, 'v1b', 8);
  await p.waitForTimeout(4000);
  const out = {};
  out.route = await p.evaluate(() => pageActuelle);
  out.drapeaux = await p.evaluate(() => JSON.stringify({ fidele: dossier.modeFidele, sansSecondePasse: dossier._reformulerSansSecondePasse, origine: dossier._origineReformuler, missionsGlobal: (dossier.pdfReglages || {}).missionsGlobal }));
  out.assistantVisible = await p.evaluate(() => !!document.querySelector('#choix-ia, [id*="choix-ia"], #btnChoixAssistant') || /Choisissez votre assistant/.test(document.body.innerText));
  out.adaptationVisible = await p.evaluate(() => /Adaptation au métier/.test(document.body.innerText));
  out.miseEnPageVisible = await p.evaluate(() => /mise en page|Mes modèles|Garder celui-ci/i.test(document.body.innerText));
  out.titres = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].filter(e => e.offsetParent !== null).map(e => e.textContent.trim()).slice(0, 12));
  out.objetCV = await p.evaluate(() => { const o = normaliserDonneesCV(dossier); const r = {}; Object.keys(o).forEach(k => { const v = o[k]; r[k] = Array.isArray(v) ? v.length + ' élément(s)' : (v && typeof v === 'object' ? Object.keys(v).filter(x => v[x] && (!Array.isArray(v[x]) || v[x].length)).join(',') : String(v === undefined || v === null ? '' : v).slice(0, 70)); }); return r; });
  out.experiences = await p.evaluate(() => (dossier.experiences || []).map(e => e.poste + ' | ' + e.entreprise + ' | ' + e.dateDebut + '-' + e.dateFin + ' | missions: ' + String(e.missions || '').split('\n').filter(Boolean).length));
  out.listes = await p.evaluate(() => JSON.stringify({ titre: dossier.titreCV, accroche: (dossier.ia && dossier.ia.cv && dossier.ia.cv.profil) || '', competencesCV: dossier.competencesCV, savoirEtreCV: dossier.savoirEtreCV, savoirsCV: dossier.savoirsCV, formations: (dossier.formations || []).length, langues: dossier.langues, loisirs: dossier.loisirs, certifications: dossier.certifications, logiciels: dossier.logiciels, permis: dossier.permis, infos: dossier.informationsNonClassees }));
  out.rendu = await p.evaluate(() => {
    const textes = [...document.querySelectorAll('iframe')].map(f => { try { return f.contentDocument.body.innerText; } catch (e) { return ''; } });
    const tout = textes.join('\n');
    const attendus = ['Agent d’entretien', 'Quatre ans d’entretien de bureaux', 'Clean Limousin', 'Nettoyer 12 locaux', 'Collège Jean Moulin', 'Agent de propreté', 'Respect des protocoles', 'Ponctualité', 'Anglais', 'Football', 'Jardinage', 'Sauveteur', 'Word', 'Excel', 'Produits d’entretien', 'Disponible dès maintenant'];
    const r = {}; attendus.forEach(a => { r[a] = tout.indexOf(a) !== -1; }); r._nbIframes = document.querySelectorAll('iframe').length; return r;
  });

  // Tous les modèles de la galerie : le CV de la personne (dossier réel de la version 1) remplit-il chaque gabarit ?
  out.modeles = await p.evaluate(async () => {
    const attendus = ['Agent d’entretien', 'Quatre ans d’entretien de bureaux', 'Clean Limousin', 'Nettoyer 12 locaux', 'Collège Jean Moulin', 'Agent de propreté', 'Respect des protocoles', 'Ponctualité', 'Anglais', 'Football', 'Jardinage', 'Sauveteur', 'Word', 'Excel', 'Produits d’entretien', 'Disponible dès maintenant'];
    const liste = [];
    _MEP_GALERIE_CREATIF.forEach(m => liste.push({ cle: 'creatif:' + m[0], id: m[0], sobre: false }));
    _MEP_GALERIE_SOBRE.forEach(m => liste.push({ cle: 'sobre:' + m[0], id: m[0], sobre: true }));
    const attente = ms => new Promise(r => setTimeout(r, ms));
    const manques = {}; let ok = 0;
    for (const m of liste) {
      const copie = JSON.parse(JSON.stringify(dossier));
      const ref = window.dossier; window.dossier = copie;
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;visibility:hidden;';
      document.body.appendChild(iframe);
      try {
        window.__cvPdfSansRemplissageInitial = true;
        iframe.contentWindow.__cvPdfDossierSource = copie; iframe.contentWindow.__cvPdfModeGrandApercu = false;
        iframe.contentDocument.open(); iframe.contentDocument.write(construirePageInteractivePdfA4('Camille Martin', copie)); iframe.contentDocument.close();
        for (let i = 0; i < 100 && !iframe.contentDocument.querySelector('#conteneurPage .cv'); i++) { await attente(100); }
        await attente(900);
        const w = iframe.contentWindow;
        if (m.sobre) { w._pdfChoisirVarianteSobre(m.id); } else { w._pdfChoisirModeleCreatif(m.id); }
        await attente(1200);
        const t = w.document.getElementById('conteneurPage').innerText;
        const manquants = attendus.filter(a => t.indexOf(a) === -1);
        if (manquants.length) { manques[m.cle] = manquants; } else { ok++; }
      } finally { iframe.remove(); window.dossier = ref; }
    }
    return { total: liste.length, complets: ok, incomplets: manques };
  });
  console.log('MODELES:', JSON.stringify(out.modeles));
  await L.photo(p, 'v1-documents');
  console.log('dernier écran:', JSON.stringify(e && e.route));
  console.log(JSON.stringify(out, null, 1)); console.log('erreurs:', p.errs);
  await b.close();
})();
