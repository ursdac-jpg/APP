/* ============================================================
   banc.js : BANC DE RENDU des modeles de CV (outil de developpement, plan docs/PLAN_BANC_ET_MINIATURES_2026-10-11.md)
   ------------------------------------------------------------
   Pour chaque modele de la galerie (Creatif et Sobre) : le CV est rendu dans une page cachee NEUVE (copie du dossier, meme methode que
   ucpmRendreCv), avec un jeu d'essai FIXE (photo ecrite en dur : plus de dependance a la version du navigateur). Un modele ne depend donc
   ni de l'ordre, ni de l'etat du panneau. On releve l'empreinte du HTML, celle du style et celle du XML de l'export Word.

   Utilisation (navigateur de test, fenetre 738 de large, page rechargee, onglet sur le serveur de developpement) :
     (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text());
     window.__rendu.lancer('verifier');    // compare a scripts/rendu/registre.json
     window.__rendu.lancer('regenerer');   // ecrit scripts/rendu/sortie/registre.json (a copier ensuite dans scripts/rendu/)
     window.__rendu.etat                   // { fait, total, termine, ecarts, sansReference }
   Option : lancer('regenerer', { rendus: true }) ecrit aussi sortie/<famille>_<id>.json ({ cle, nom, hash, html, css }) : les miniatures de la galerie (a copier dans data/miniatures/).
   ============================================================ */
(function () {
  var PHOTO_FIXE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAIAAADYYG7QAAACJUlEQVR42s3Wd04bQRTH8d+NcqucJycgIZ1iesd0ts72Bth0TDGYjkmPstL8g7I22ZktGel7gI80evMeeqTfPdKv19LPN9KPXun7W+nbO/nre/nLB/nxo9z+JLc/Kw99yn2/cjeg3A4qNxX1uqJeDamXw2prRG2Nqhdj2vm41pzQzia10yntZFo/ntEbs3pjTj+a1w+r5KBK9hfI3iLZXSI7y2R7xaivGvU1o7ZubEnGpmxuKGakmqFmBrrpQygNsXwIpSGWB6E0huVCKI1pORBKY1k2hNLYlgWhNI5tQiiNaxsQSuPZBHlpXrx8lV3j2zoyamJHMm5NEIO4NR0pT+PQhI6GgjQ0Vk3kqMjxpZKxajYcBcVpaEyaTUcGx0wxgZg0W44EvglnATFoau46CtXQ0mtq7ho4/uLiNHV3FRybgQnEpNl2V8Cxp5hATJqdGMS3NQvS7LrL4NvhKUGsmj1vCdwXRRGafW8RGe+bvF6Kag68BeR1bXFMeFJz6FVR3O3HoTny5iGUpuHPQSjNsT8LoTQnMUgozak/A6E0Z/40hNI0gylk1/z1K2bRNINJ8GlS7jJWzXkwAVYNx8WYXnMRjCO9hoPytDSaVjCGcjS0f2oug1GUpqE9r7kKR1CmhvaM5joGlayhddPchMPIfabSgTprbsMhlK+hddTchRVk//346qi5jwbxXzS0pOYhGkC3PVUCKKlpR/3otjVLACU1j1HfH4AyAhyTwZg7AAAAAElFTkSuQmCC';
  // Le dossier par defaut de l'application, pris AU CHARGEMENT de ce script : le moteur lit beaucoup de champs (activites, actions...) que le jeu d'essai ne fixe pas.
  // Le script doit donc etre charge sur une page fraichement rechargee, stockage vide (sinon le dossier de la personne s'y melerait).
  var DOSSIER_DEFAUT = JSON.parse(JSON.stringify(window.dossier));
  var attente = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var fnv = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; } return h.toString(16) + ':' + s.length; };

  // Le jeu d'essai : identique a celui de l'ancien banc (scripts/word/banc_b7.js), sauf la photo, fixe.
  function dossierFixe() {
    var fixe = {
      identite: { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', adresse: '3 rue des Lilas', codePostal: '87000', telephone: '0600000000', email: 'camille@ex.fr', ville: 'Limoges' },
      titreCV: 'Agent de sécurité', metierCible: 'Agent de sécurité',
      experiences: [
        { poste: 'Agent de sécurité', entreprise: 'Sécuritas', lieu: 'Limoges', dateDebut: '2022-01', dateFin: '2024-06', missions: 'Surveiller les accès\nContrôler les badges\nRédiger des rapports\nAccueillir les visiteurs' },
        { poste: 'Vendeuse', entreprise: 'Boulangerie Dupont', lieu: 'Limoges', dateDebut: '2019-01', dateFin: '2021-12', missions: 'Accueillir les clients\nTenir la caisse\nPréparer les commandes' },
        { poste: 'Employée polyvalente', entreprise: 'Café du centre', lieu: 'Limoges', dateDebut: '2017-05', dateFin: '2018-12', missions: 'Servir en salle\nEncaisser\nNettoyer' }],
      formations: [{ niveau: 'CAP', intitule: 'Agent de prévention', etablissement: 'AFPA', annee: '2021', missions: 'Réglementation\nSecourisme\nGestion des conflits' }, { niveau: 'BEP', intitule: 'Vente', etablissement: 'Lycée Turgot', annee: '2018', missions: 'Relation client\nMerchandising' }],
      engagements: [{ intitule: 'Bénévole aux Restos du Coeur', missions: 'Distribuer les repas\nAccueillir les bénéficiaires' }],
      experiencesPerso: [{ intitule: 'Bricolage', missions: 'Réparer des meubles\nPeindre' }],
      competencesCV: ['Sens du contact', 'Rigueur', 'Gestion du stress', 'Travail en équipe', 'Ponctualité'],
      langues: [{ langue: 'Anglais', niveau: 'B1' }], loisirs: ['Course à pied', 'Cuisine'],
      certifications: ['Sensibilisation amiante (2026)', 'Habilitation échafaudage fixe & roulant (2026)', 'Module travail en hauteur (2026)', 'Habilitation électrique BS/BEM (2026)'],
      photo: { url: PHOTO_FIXE, inclure: true, souhaitee: 'oui' },
      formatCV: 'pdf', dernierDocumentPrepare: 'cv', modeCreation: 'nouveau', pdfReglages: null, reglagesMiseEnPageCV: {}
    };
    return Object.assign(JSON.parse(JSON.stringify(DOSSIER_DEFAUT)), fixe);
  }

  // Les modeles a mesurer : tous ceux de la galerie, dans l'ordre de la galerie.
  function liste() {
    var l = [];
    _MEP_GALERIE_CREATIF.forEach(function (m) { l.push({ cle: 'creatif:' + m[0], id: m[0], sobre: false, nom: m[1] }); });
    _MEP_GALERIE_SOBRE.forEach(function (m) { l.push({ cle: 'sobre:' + m[0], id: m[0], sobre: true, nom: m[2] }); });
    return l;
  }

  // Part de la feuille couverte par des zones COLOREES (en % de la page) : bandeaux, colonnes, cartes, fonds. Regle de Denis (2026-10-11) : jamais toute la feuille coloree, une colonne ou un bandeau oui
  // (lisibilite en impression noir et blanc, encre) ; plafond PLAFOND_COUVERTURE. Mesure approchee : une grille de 60 x 85 cases ; les fonds pales (clair a plus de 235 sur les trois canaux) ne comptent pas.
  var PLAFOND_COUVERTURE = 60;
  var FORMES_COLONNE_PLUS = ['diagonale', 'pointeBas', 'coin', 'demiovale', 'vague2', 'creneaux', 'carte', 'pilule', 'contour', 'contourRond', 'filets'];
  var BORDS_BANDEAU = ['droit', 'arrondi', 'vallonne', 'pointe', 'diagonale', 'coin', 'demiovale', 'vague2', 'creneaux', 'carte', 'pilule', 'ruban', 'rubanCourt', 'contour', 'contourRond', 'filets'];
  function mesurerCouverture(w, d) {
    var cv = d.querySelector('#conteneurPage .cv'), pr = cv.getBoundingClientRect();
    var W = 60, H = 85, g = new Uint8Array(W * H);
    var teinte = function (c) { var m = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?/.exec(c || ''); if (!m) { return false; } if (m[4] !== undefined && +m[4] < 0.3) { return false; } return Math.min(+m[1], +m[2], +m[3]) < 235; };
    var marquer = function (x0, y0, x1, y1) {
      for (var y = Math.max(0, Math.floor(y0 / pr.height * H)); y < Math.min(H, Math.ceil(y1 / pr.height * H)); y++) {
        for (var x = Math.max(0, Math.floor(x0 / pr.width * W)); x < Math.min(W, Math.ceil(x1 / pr.width * W)); x++) { g[y * W + x] = 1; }
      }
    };
    cv.querySelectorAll('*').forEach(function (e) {
      var r = e.getBoundingClientRect(), s = w.getComputedStyle(e);
      if (r.width < 40 || r.height < 12 || e.tagName === 'SPAN' || /pill|badge/.test(e.className)) { return; }
      if (teinte(s.backgroundColor) || /gradient/.test(s.backgroundImage)) { marquer(r.left - pr.left, r.top - pr.top, r.right - pr.left, r.bottom - pr.top); }
    });
    var sc = w.getComputedStyle(cv, '::before');
    if (sc.content !== 'none' && (teinte(sc.backgroundColor) || /gradient/.test(sc.backgroundImage))) {
      var pw = parseFloat(sc.width) || 0, ph = parseFloat(sc.height) || 0, pt = parseFloat(sc.top) || 0, pl = parseFloat(sc.left);
      var x0 = isNaN(pl) ? pr.width - pw : pl;
      marquer(x0, pt, x0 + pw, pt + ph);
    }
    var n = 0; for (var k = 0; k < g.length; k++) { n += g[k]; }
    return Math.round(n / g.length * 100);
  }

  // Signature VISUELLE d'un modele : les styles reellement appliques (couleurs, filets, arrondis, ombres, espacement des lettres, graisse...) des elements structurants (page, en-tete, nom, titres de rubrique,
  // rubriques, pastilles, lignes...) et du fond de colonne (::before). Sert a la mesure de ressemblance (scripts/rendu/ressemblance.js) : elle voit les differences faites seulement en style, que la
  // simple liste des classes ne voyait pas. Une liste de chaines 'role|propriete=valeur'.
  function mesurerSignature(w, d) {
    var cv = d.querySelector('#conteneurPage .cv'); var sig = [];
    var roles = { page: '.cv', tete: '.tete', nom: '.nom', metier: '.metier', titre: 'h2', rubrique: '.rub-sec', pastille: '.pill', ligne: 'li', colonne: '.col-fond', corps: '.corps', date: '.dates, .date' };
    var props = ['backgroundColor', 'color', 'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth', 'borderBottomColor', 'borderTopColor', 'borderRadius', 'boxShadow', 'letterSpacing', 'fontWeight', 'fontSize', 'textTransform', 'textAlign', 'display'];
    var norm = function (v) { return String(v).replace(/(\d+\.\d+)/g, function (x) { return String(Math.round(parseFloat(x) * 2) / 2); }); };
    Object.keys(roles).forEach(function (r) {
      var e = r === 'page' ? cv : cv.querySelector(roles[r]);
      if (!e) { sig.push(r + '|absent'); return; }
      var st = w.getComputedStyle(e);
      props.forEach(function (p) { sig.push(r + '|' + p + '=' + norm(st[p])); });
    });
    var pv = w.getComputedStyle(cv, '::before');
    if (pv.content !== 'none') { ['backgroundColor', 'borderRadius', 'boxShadow', 'borderRightWidth', 'borderLeftWidth'].forEach(function (p) { sig.push('fond|' + p + '=' + norm(pv[p])); }); sig.push('fond|largeur=' + Math.round(parseFloat(pv.width) / 20)); sig.push('fond|haut=' + Math.round(parseFloat(pv.top) / 10)); }
    sig.push('colonnes|' + (cv.className.match(/col-vague-[gd]/) || ['aucune'])[0]);
    return sig;
  }

  // Rend UN modele dans une page cachee neuve. Renvoie { html, css, xml }.
  // `reglages` (facultatif) : { idDuControle: valeur } ecrit sur les controles de l'iframe apres le choix du modele, pour voir un modele avec un reglage change (ex. { regColonneBordDroit: false } = bord vallonne).
  async function rendre(modele, avecWord, reglages) {
    window.__cvPdfSansRemplissageInitial = true;   // pas de remplissage d'office : on compare des rendus a reglages par defaut
    var copie = dossierFixe();
    var ref = window.dossier; window.dossier = copie;
    var iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true'); iframe.setAttribute('tabindex', '-1');
    iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;visibility:hidden;pointer-events:none;';
    document.body.appendChild(iframe);
    try {
      var nom = [copie.identite.prenom, copie.identite.nom].filter(Boolean).join(' ');
      iframe.contentWindow.__cvPdfDossierSource = copie; iframe.contentWindow.__cvPdfModeGrandApercu = false;
      iframe.contentDocument.open(); iframe.contentDocument.write(construirePageInteractivePdfA4(nom, copie)); iframe.contentDocument.close();
      for (var i = 0; i < 100 && !iframe.contentDocument.querySelector('#conteneurPage .cv'); i++) { await attente(100); }
      await attente(1200);
      var w = iframe.contentWindow;
      if (modele.standard) { /* Standard : la base libre, aucun modele a choisir */ } else if (modele.sobre) { w._pdfChoisirVarianteSobre(modele.id); } else { w._pdfChoisirModeleCreatif(modele.id); }
      await attente(1800);
      if (reglages) {
        // `choixMq` : choix de la carte d'ambiance gardes par l'apercu (_pdfMqChoix), ex. { couleurColonne: '#e6e1d6', couleurSecondaire: '#d4974f' }
        if (reglages.choixMq) { Object.keys(reglages.choixMq).forEach(function (k) { w._pdfMqChoix(k, reglages.choixMq[k]); }); }
        Object.keys(reglages).forEach(function (id) {
          if (id === 'choixMq') { return; }
          var el = w.document.getElementById(id); if (!el) { return; }
          if (el.type === 'checkbox') { el.checked = !!reglages[id]; } else { el.value = reglages[id]; }
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await attente(1800);
      }
      var d = w.document;
      var conteneur = d.getElementById('conteneurPage');
      var html = conteneur.innerHTML;
      var css = ['styleCv', 'stylePage'].map(function (s) { var e = d.getElementById(s); return e ? e.textContent : ''; }).join('\n');
      var res = { html: html, css: css, nbPages: d.querySelectorAll('.page-a4').length, couverture: mesurerCouverture(w, d), signature: mesurerSignature(w, d) };
      // Bord de la colonne (modeles Creatif a colonne coloree, classe `bord-choix`) : 'droit' ou 'vallonne' = le bord du modele tel qu'il arrive ; null = pas de choix pour ce modele.
      var cvBord = d.querySelector('#conteneurPage .cv'), caseBord = d.getElementById('regColonneBordDroit');
      res.bord = (cvBord && caseBord && cvBord.classList.contains('bord-choix')) ? (caseBord.checked ? 'droit' : 'vallonne') : null;
      // Bord du bandeau (classe `bord-bandeau-choix`) : 'droit', 'arrondi' ou 'vallonne' ; null = pas de choix pour ce modele.
      var selBandeau = d.getElementById('regBordBandeau');
      res.bandeau = (cvBord && selBandeau && cvBord.classList.contains('bord-bandeau-choix')) ? selBandeau.value : null;
      if (avecWord) {
        var r = await exporterCvWord(copie); var zip = await JSZip.loadAsync(r.blob); var t = '';
        for (var f of ['word/document.xml', 'word/header1.xml', 'word/header2.xml']) { var fic = zip.file(f); t += fic ? await fic.async('string') : ''; }
        res.xml = fnv(t);
        res.blob = r.blob;   // le .docx lui-meme (pour l'ouvrir dans un vrai Word : voir docs/PLAN_BANC_ET_MINIATURES_2026-10-11.md)
      }
      return res;
    } finally { window.dossier = ref; try { iframe.remove(); } catch (e) { /* deja retiree */ } }
  }

  async function envoyer(nom, contenu) {
    var r = await fetch('/__ecrire/' + encodeURIComponent(nom), { method: 'POST', body: contenu });
    if (!r.ok) { throw new Error('ecriture refusee (' + r.status + ') : ' + nom); }
  }

  async function lancer(mode, options) {
    var opts = options || {};
    if (window.innerWidth !== 738) { throw new Error('la fenetre doit faire 738 de large (les empreintes Word en dependent), elle fait ' + window.innerWidth + ' : redimensionner puis recharger la page'); }
    var etat = window.__rendu.etat = { mode: mode, fait: 0, total: 0, termine: false, ecarts: [], sansReference: [], erreurs: [], tropColores: [], plafondCouverture: PLAFOND_COUVERTURE, res: {}, capacites: {}, avertissement: '' };
    if ((DOSSIER_DEFAUT.identite && DOSSIER_DEFAUT.identite.nom) || (DOSSIER_DEFAUT.experiences || []).length) { etat.avertissement = 'le dossier n etait pas vide au chargement du script : recharger la page, vider le stockage, puis recharger le script'; }
    var ref = null;
    if (mode === 'verifier') { ref = await (await fetch('/scripts/rendu/registre.json?' + Date.now())).json(); }
    var modeles = liste(); etat.total = modeles.length;
    for (var k = 0; k < modeles.length; k++) {
      var m = modeles[k];
      try {
        var r = await rendre(m, true);
        etat.res[m.cle] = { html: fnv(r.html), css: fnv(r.css), xml: r.xml, pages: r.nbPages, couverture: r.couverture };
        if (r.bord) { etat.res[m.cle].bord = r.bord; }
        if (r.bandeau) { etat.res[m.cle].bandeau = r.bandeau; }
        // CAPACITES du modele (bandeau, colonne, formes de bord, arche) : mesurees ici sur le rendu de base, ecrites dans capacites.json (brique B.39).
        var cap = await mesurerCapacites(m, r);
        etat.capacites[m.cle] = cap;
        if (r.couverture > PLAFOND_COUVERTURE) { etat.tropColores.push(m.cle + ' (' + r.couverture + ' %)'); }
        if (opts.rendus) {
          // Miniature de la galerie : prete a etre montree dans un compartiment etanche (css converti par la fonction deja utilisee par le module Un CV, plusieurs metiers),
          // avec l'empreinte du HTML (le test des miniatures verifie qu'elle correspond au registre).
          var htmlMini = r.html.replace(/ contenteditable="[^"]*"/g, '');
          await envoyer(m.cle.replace(':', '_') + '.json', JSON.stringify({ cle: m.cle, nom: m.nom, hash: etat.res[m.cle].html, html: htmlMini, css: ucpmCssPourCompartiment(r.css), signature: r.signature, bord: r.bord || undefined, bandeau: r.bandeau || undefined }));
        }
      } catch (e) { etat.erreurs.push(m.cle + ' : ' + e.message); }
      etat.fait++;
    }
    if (mode === 'verifier') {
      Object.keys(etat.res).forEach(function (c) {
        if (!(c in ref)) { etat.sansReference.push(c); return; }
        var d = ['html', 'css', 'xml', 'pages', 'couverture', 'bord', 'bandeau'].filter(function (f) { return etat.res[c][f] !== ref[c][f]; });
        if (d.length) { etat.ecarts.push(c + ' [' + d.join(', ') + ']'); }
      });
      Object.keys(ref).forEach(function (c) { if (!(c in etat.res)) { etat.ecarts.push(c + ' [absent du rendu]'); } });
      var refCap = await (await fetch('/scripts/rendu/capacites.json?' + Date.now())).json();
      Object.keys(etat.capacites).forEach(function (c) { if (JSON.stringify(etat.capacites[c]) !== JSON.stringify(refCap[c])) { etat.ecarts.push(c + ' [capacites]'); } });
    } else if (mode === 'regenerer') {
      var tri = {}; Object.keys(etat.res).sort().forEach(function (c) { tri[c] = etat.res[c]; });
      await envoyer('registre.json', JSON.stringify(tri, null, 1));
      // Le Standard n'est pas dans la galerie : ses capacites sont mesurees a part et rejoignent la table.
      try { etat.capacites.standard = await mesurerCapacites({ cle: 'standard', id: 'standard', standard: true, sobre: false, nom: 'Standard' }); } catch (e) { etat.erreurs.push('standard : ' + e.message); }
      var triCap = {}; Object.keys(etat.capacites).sort().forEach(function (c) { triCap[c] = etat.capacites[c]; });
      await envoyer('capacites.json', JSON.stringify(triCap, null, 1));
    }
    etat.termine = true;
    return etat;
  }

  // ------------------------------------------------------------------------------------------------------------------------------
  // TABLE DES CAPACITES PAR MODELE (chantier docs/CHANTIER_NOUVEAUX_MODELES_ET_OPTIONS_CV_2026-10-20.md, tache A0, demande de Denis 2026-10-20 :
  // « un modele ne propose que les options qu'il permet, jamais une option impossible a cliquer »).
  // La source est le RENDU REEL, jamais une liste ecrite a la main : pour chaque modele on mesure
  //   - le BANDEAU : 'natif' (present d'office), 'ajoutable' (la case « Bandeau en en-tete » le fait apparaitre), 'non' ;
  //   - la COLONNE colorée : 'natif' (colonne pleine hauteur) , 'ajoutable' (le fond de colonne la fait apparaitre), 'non' ;
  //   - les formes de bord proposees par le modele (droit / arrondi / vallonne pour le bandeau ; droit / vallonne pour la colonne).
  // Utilisation : window.__rendu.capacites('regenerer') ecrit sortie/capacites.json ; 'verifier' compare a scripts/rendu/capacites.json.
  // Puis : node scripts/rendu/capacites_ecrire.js  (ecrit modules/cv-pdf-html/cvPdfCapacitesModeles.js).
  // ------------------------------------------------------------------------------------------------------------------------------
  function dom(html) { return new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html'); }
  function aClasse(r, classe) { var c = dom(r.html).querySelector('.cv'); return !!c && c.classList.contains(classe); }
  // `base` (facultatif) : le rendu de base du modele, deja fait par l'appelant.
  async function mesurerCapacites(m, base) {
    base = base || await rendre(m, false);
    var d0 = dom(base.html), cv0 = d0.querySelector('.cv');
    var natifBandeau = !!d0.querySelector('.tete-fond, .tete-pale');   // `.tete-pale` : le bandeau pale du modele Sobre « Bandeau pale »
    // Colonne colorée native : pleine hauteur (`col-vague`), en bloc (`.col-fond`), ou propre au gabarit (`.fr-lat` Colonne et frise, `.ph-lat` Photo et frise ; `.rc-col` des Rectangles n'est PAS une colonne colorée mais une colonne de grille de l'en-tête : retiré le 2026-10-21, audit de l'étape 4.4).
    var natifColonne = /(^| )col-vague-(g|d)( |$)/.test(cv0 ? cv0.className : '') || !!d0.querySelector('.col-fond, .fr-lat, .ph-lat');
    var bandeau = natifBandeau ? 'natif' : 'non', colonne = natifColonne ? 'natif' : 'non';
    var formesBandeau = [], formesColonne = [];
    // Sobre rectangles (etape 4.4, famille 3) et Frise sobre (etape 7, nom blanc sur bandeau sombre) : les trois formes VIDES (contour, contour arrondi, deux filets) se superposeraient a ces contours, elles ne sont pas proposees.
    var sansVides = function (r) { return (aClasse(r, 'cv-rect') || aClasse(r, 'bandeau-sans-vide')) ? BORDS_BANDEAU.filter(function (f) { return ['contour', 'contourRond', 'filets'].indexOf(f) === -1; }) : BORDS_BANDEAU.slice(); };
    if (natifBandeau) {
      if (aClasse(base, 'bord-bandeau-choix')) { formesBandeau = sansVides(base); }
    } else {
      var b = await rendre(m, false, { regBandeauEnTete: true });
      if (dom(b.html).querySelector('.tete-fond, .tete-pale') && b.nbPages === base.nbPages) {
        bandeau = 'ajoutable';
        if (aClasse(b, 'bord-bandeau-choix')) { formesBandeau = sansVides(b); }
      }
    }
    // Colonne AJOUTABLE (etape 4.2) : passer le modele a DEUX colonnes avec un fond de colonne a gauche donne la colonne dessinee pleine hauteur (classe `col-vague-g`) ; la table dit alors ce que le modele PEUT faire, l'apercu dit s'il a reellement deux colonnes.
    var regsColonne = {};
    var refColonne = base;
    if (!natifColonne) {
      regsColonne = { regColonnes: '2', regFondColonnes: 'gauche' };
      var c = await rendre(m, false, regsColonne);
      if (/(^| )col-vague-(g|d)( |$)/.test(dom(c.html).querySelector('.cv').className) && c.nbPages === base.nbPages) { colonne = 'ajoutable'; refColonne = c; }
    }
    if (aClasse(refColonne, 'bord-choix')) {
      formesColonne = ['droit', 'vallonne'];
      // Arche : seulement si le gabarit la rend, et jamais avec un bandeau d'en-tete d'office, colore ou pale (le bandeau gagne ; le panneau ne la propose pas).
      if (!natifBandeau) {
        var ar = await rendre(m, false, Object.assign({ regColonneArche: true }, regsColonne));
        if (aClasse(ar, 'col-arche')) { formesColonne.push('arche'); }
      }
      formesColonne = formesColonne.concat(FORMES_COLONNE_PLUS);   // onze formes de plus (2026-10-20), sur toute colonne a bord au choix
    }
    return { bandeau: bandeau, colonne: colonne, formesBandeau: formesBandeau, formesColonne: formesColonne };
  }
  // Plus de miniatures de variantes (decision 2026-10-20) : les vignettes montrent l'allure de base ; les formes de bandeau et de colonne se voient sur l'apercu.
  async function capacites(mode) {
    var etat = window.__rendu.etatCapacites = { mode: mode, fait: 0, total: 0, termine: false, res: {}, ecarts: [], erreurs: [] };
    var modeles = [{ cle: 'standard', id: 'standard', standard: true, sobre: false, nom: 'Standard' }].concat(liste()); etat.total = modeles.length;
    for (var k = 0; k < modeles.length; k++) {
      try { etat.res[modeles[k].cle] = await mesurerCapacites(modeles[k]); } catch (e) { etat.erreurs.push(modeles[k].cle + ' : ' + e.message); }
      etat.fait++;
    }
    if (mode === 'verifier') {
      var ref = await (await fetch('/scripts/rendu/capacites.json?' + Date.now())).json();
      Object.keys(etat.res).forEach(function (c) { if (JSON.stringify(etat.res[c]) !== JSON.stringify(ref[c])) { etat.ecarts.push(c); } });
      Object.keys(ref).forEach(function (c) { if (!(c in etat.res)) { etat.ecarts.push(c + ' [absent du rendu]'); } });
    } else if (mode === 'regenerer') {
      var tri = {}; Object.keys(etat.res).sort().forEach(function (c) { tri[c] = etat.res[c]; });
      await envoyer('capacites.json', JSON.stringify(tri, null, 1));
    }
    etat.termine = true;
    return etat;
  }

  window.__rendu = { dossierFixe: dossierFixe, liste: liste, rendre: rendre, lancer: lancer, capacites: capacites, mesurerCapacites: mesurerCapacites, fnv: fnv, etat: null, etatCapacites: null };
})();
