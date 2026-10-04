/* ============================================================
   banc_b7.js  --  BANC DE NON-REGRESSION du CV (PDF + Word), outil de developpement
   ------------------------------------------------------------
   Chantier "nettoyage de la dette B.7" (docs/BRIQUES_COMMUNES.md). Sert a PROUVER qu'une suppression de
   code n'a rien change au rendu : on le lance AVANT (empreintes de reference) puis APRES, et on compare.

   Utilisation (navigateur, serveur de dev lance, page fraichement rechargee) :
     eval(await (await fetch('/scripts/word/banc_b7.js')).text());
     window.__banc();          // ~50 s, ne rend pas la main : attendre window.__fini === true
     JSON.stringify(window.__res)   // { 'creatif:mqBandeau': { pdf: 'empreinte:taille', word: 'empreinte:nbBlocs' }, ... }

   IMPORTANT : recharger la page entre deux passes (l'etat du panneau persiste sinon et fausse la comparaison).
   Mesure, pour chaque modele de la galerie (19 creatifs + 5 variantes Sobre) : l'empreinte du HTML du CV en PDF
   et l'empreinte du plan du Word (exporterCvWord). Jeu de donnees fixe (fictif).
   ============================================================ */
window.__preparer = async function () {
  var p = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 600); }); };
  dossier.identite = { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', adresse: '3 rue des Lilas', codePostal: '87000', telephone: '0600000000', email: 'camille@ex.fr', ville: 'Limoges' };
  dossier.titreCV = 'Agent de sécurité'; dossier.metierCible = 'Agent de sécurité';
  dossier.experiences = [
    { poste: 'Agent de sécurité', entreprise: 'Sécuritas', lieu: 'Limoges', dateDebut: '2022-01', dateFin: '2024-06', missions: 'Surveiller les accès\nContrôler les badges\nRédiger des rapports\nAccueillir les visiteurs' },
    { poste: 'Vendeuse', entreprise: 'Boulangerie Dupont', lieu: 'Limoges', dateDebut: '2019-01', dateFin: '2021-12', missions: 'Accueillir les clients\nTenir la caisse\nPréparer les commandes' },
    { poste: 'Employée polyvalente', entreprise: 'Café du centre', lieu: 'Limoges', dateDebut: '2017-05', dateFin: '2018-12', missions: 'Servir en salle\nEncaisser\nNettoyer' }];
  dossier.formations = [{ niveau: 'CAP', intitule: 'Agent de prévention', etablissement: 'AFPA', annee: '2021', missions: 'Réglementation\nSecourisme\nGestion des conflits' }, { niveau: 'BEP', intitule: 'Vente', etablissement: 'Lycée Turgot', annee: '2018', missions: 'Relation client\nMerchandising' }];
  dossier.engagements = [{ intitule: 'Bénévole aux Restos du Coeur', missions: 'Distribuer les repas\nAccueillir les bénéficiaires' }];
  dossier.experiencesPerso = [{ intitule: 'Bricolage', missions: 'Réparer des meubles\nPeindre' }];
  dossier.competencesCV = ['Sens du contact', 'Rigueur', 'Gestion du stress', 'Travail en équipe', 'Ponctualité'];
  dossier.langues = [{ langue: 'Anglais', niveau: 'B1' }]; dossier.loisirs = ['Course à pied', 'Cuisine'];
  // 2026-09-30 : quatre certifications (le regroupement « rubrique Certifications » se declenche des trois) ; dossier.certifications = liste de textes.
  dossier.certifications = ['Sensibilisation amiante (2026)', 'Habilitation échafaudage fixe & roulant (2026)', 'Module travail en hauteur (2026)', 'Habilitation électrique BS/BEM (2026)'];
  var c = document.createElement('canvas'); c.width = 400; c.height = 400; var x = c.getContext('2d');
  var g = x.createLinearGradient(0, 0, 400, 400); g.addColorStop(0, '#9ec5fe'); g.addColorStop(1, '#f8d7a8'); x.fillStyle = g; x.fillRect(0, 0, 400, 400);
  x.fillStyle = '#2f6690'; x.fillRect(120, 120, 160, 160);
  dossier.photo = { url: c.toDataURL('image/jpeg', 0.85), inclure: true, souhaitee: 'oui' };
  dossier.formatCV = 'pdf'; dossier.dernierDocumentPrepare = 'cv'; dossier.modeCreation = 'nouveau';
  dossier.pdfReglages = null; dossier.reglagesMiseEnPageCV = null;
  naviguerVers('resultats'); await p(4500);
};
window.__fnv = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; } return h.toString(16); };
window.__mesurer = async function (etiquette) {
  var p = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 500); }); };
  var w = document.querySelector('#zonePdfInlineCV iframe').contentWindow;
  w._pdfRafraichir(); await p(800);
  var html = w.document.getElementById('conteneurPage').innerHTML;
  var word;
  var xml = '';
  try {
    var r = await exporterCvWord(dossier); word = __fnv(JSON.stringify(r.plan)) + ':' + r.plan.flux.length;
    // empreinte du XML REELLEMENT ecrit dans le .docx (corps + en-tetes) : c'est ce que Word lit
    var zip = await (await (typeof JSZip !== 'undefined' ? Promise.resolve(JSZip) : Promise.reject(new Error('JSZip absent')))).loadAsync(r.blob);
    var t = ''; for (var nom of ['word/document.xml', 'word/header1.xml', 'word/header2.xml']) { var f = zip.file(nom); t += f ? await f.async('string') : ''; }
    xml = __fnv(t) + ':' + t.length;
  }
  catch (e) { word = 'ERR ' + e.message; }
  window.__res[etiquette] = { pdf: __fnv(html) + ':' + html.length, word: word, xml: xml };
};
window.__banc = async function () {
  window.__res = {}; window.__fini = false;
  await __preparer();
  var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
  var ids = w()._pdfIdsModelesCreatif();
  for (var i = 0; i < ids.length; i++) { w()._pdfChoisirModeleCreatif(ids[i]); await __mesurer('creatif:' + ids[i]); }
  var vs = ['mq-bandeau', 'mq-fond', 'mq-epure', 'mq-photo', 'mq-rectangles'];
  for (var j = 0; j < vs.length; j++) {
    try { w()._pdfChoisirVarianteSobre(vs[j]); await __mesurer('sobre:' + vs[j]); }
    catch (e) { window.__res['sobre:' + vs[j]] = 'ERR ' + e.message; }
  }
  window.__fini = true;
};
