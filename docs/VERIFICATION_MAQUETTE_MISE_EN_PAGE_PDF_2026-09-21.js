/* Script de vérification de la maquette « La mise en page » (PDF), 2026-09-21.
   Usage : ouvrir docs/MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.html dans le navigateur (serveur de dev), coller ce fichier dans la console, lire le rapport.
   Principe : chaque contrôle est activé, on compare la feuille avant / après (HTML, hauteur, styles calculés) et l'affiché doit égaler le réel.
   À REJOUER après toute modification de la maquette, puis sur l'application réelle une fois codée (adapter les identifiants). */
(async function () {
  var w = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var $ = function (i) { return document.getElementById(i); };
  var q = function (s) { return document.querySelector(s); };
  var click = function (s) { (typeof s === 'string' ? q(s) : s).click(); };
  var R = [];
  var ok = function (nom, cond, detail) { R.push((cond ? 'OK          ' : 'ÉCART       ') + nom + (cond ? '' : ' -> ' + (detail || ''))); };
  var cv = function () { return $('cv'); };
  var snap = function () {
    var c = cv(), h2 = c.querySelector('h2'), pill = c.querySelector('.pill'), t = c.querySelector('.tete');
    return JSON.stringify({ html: c.outerHTML, h: c.scrollHeight,
      f: getComputedStyle(c).fontFamily + getComputedStyle(c).fontSize + getComputedStyle(c).lineHeight,
      h2: h2 && getComputedStyle(h2).fontSize + getComputedStyle(h2).color + getComputedStyle(h2).marginTop + getComputedStyle(h2, '::before').content,
      pill: pill && getComputedStyle(pill).borderRadius + getComputedStyle(pill).backgroundColor,
      tete: t && getComputedStyle(t).backgroundColor + getComputedStyle(t).paddingLeft });
  };
  async function essai(nom, action, revert) {
    var a = snap(); action(); await w(150); var b = snap();
    R.push((a !== b ? 'OK          ' : 'SANS EFFET  ') + nom); if (revert) { revert(); await w(120); }
  }

  /* 1) Allures, modèles, dé, couleurs (les modèles déjà actifs ne « changent » rien : faux négatifs attendus) */
  click('input[name="detail"][value="complet"]'); await w(150);
  await essai('Allure Sobre', function () { click('#segAllure button[data-v="sobre"]'); });
  ['sobre-bandeau', 'sobre-fond', 'sobre-epure'].forEach(function () {});
  for (var g of ['sobre-fond', 'sobre-epure']) { await essai('Modèle sobre ' + g, function () { click('.vign[data-g="' + g + '"]'); }); }
  await essai('Allure Créatif', function () { click('#segAllure button[data-v="creatif"]'); });
  ok('1 colonne : « Colonne colorée » et « Colonne et frise » ne sont jamais proposés (ils perdraient leur couleur sans le dire)', !q('.vign[data-g="colonne"]') && !q('.vign[data-g="frise"]'));
  await essai('Modèle créatif diagonale', function () { click('.vign[data-g="diagonale"]'); });
  click('#oDeux'); await w(150);
  ok('2 colonnes : la galerie complète (6 modèles) redevient visible', document.querySelectorAll('#zoneGabarits .vign').length === 6);
  for (var g2 of ['colonne', 'frise']) { await essai('Modèle créatif ' + g2, function () { click('.vign[data-g="' + g2 + '"]'); }); }
  await essai('Un autre modèle (dé)', function () { click('#btnDe'); });
  click('.vign[data-g="colonne"]'); await w(150);
  click('#oDeux'); await w(250); /* décocher pendant que « Colonne colorée » (2 colonnes obligatoires) est actif */
  ok('Décocher Deux colonnes pendant « Colonne colorée » : bascule vers un modèle compatible 1 colonne', !q('.vign[data-g="colonne"].on') && q('.vign.on') && !$('oDeux').checked);
  click('#oDeux'); await w(150); click('.vign[data-g="cadre"]'); await w(150);
  ok('Modèle « Cadre de page » : bordure + trait entre colonnes en 2 colonnes', (function () {
    var d = q('#cv .corps.deux > div:first-child');
    return getComputedStyle($('cv')).boxShadow.indexOf('inset') !== -1 && d && getComputedStyle(d).borderRightWidth !== '0px';
  })());
  click('#oDeux'); await w(150); /* retour à 1 colonne, l'état attendu par la suite du script */
  ok('Décocher Deux colonnes pendant « Cadre de page » (compatible 1 colonne) : le modèle reste', q('.vign[data-g="cadre"].on'));
  click('.vign[data-g="picto"]'); await w(150);
  ok('Modèle « Titres à pictogrammes » : filet en haut + icônes rondes', (function () {
    return getComputedStyle($('cv')).borderTopWidth !== '0px' && getComputedStyle(q('#cv h2'), '::before').borderRadius === '50%';
  })());
  await essai('Allure Standard', function () { click('#segAllure button[data-v="standard"]'); });
  await essai('Mise en page (optimise)', function () { click('#btnOptim'); });
  for (var c of ['#2e7d5b', '#b23a3a']) { await essai('Couleur ' + c, function () { click('.sw[data-c="' + c + '"]'); }); }

  /* 2) Options rapides, en 1 puis en 2 colonnes */
  var opts = [['oCompHaut', 'Compétences en haut'], ['oFormAvant', 'Formations avant expériences'], ['oCentres', "Centres d'intérêt"], ['oReduire', 'Réduire les espaces'], ['oAgrandir', 'Agrandir les titres'], ['oIcones', 'Icônes'], ['oPastilles', 'Pastilles']];
  for (var o of opts) { await essai('1 col : ' + o[1], function () { click('#' + o[0]); }, function () { click('#' + o[0]); }); }
  click('#oDeux'); await w(150);
  for (var o2 of opts) { await essai('2 col : ' + o2[1], function () { click('#' + o2[0]); }, function () { click('#' + o2[0]); }); }
  click('#oDeux'); await w(150);
  await essai("Blocs courts : l'un sous l'autre", function () { click('#segCote button[data-v="dessous"]'); }, function () { click('#segCote button[data-v="cote"]'); });

  /* 3) Expériences, dates, ordre, lieu, formations, éléments supplémentaires, texte */
  for (var m of ['C', 'B']) { await essai('Mode ' + m, function () { click('input[name="mode"][value="' + m + '"]'); }); }
  click('input[name="mode"][value="A"]'); await w(100);
  await essai('Les plus pertinentes', function () { click('input[name="tout"][value="pertinentes"]'); });
  click('input[name="tout"][value="toutes"]'); await w(100);
  for (var d of ['sous', 'avant']) { await essai('Dates : ' + d, function () { click('input[name="dates"][value="' + d + '"]'); }); }
  click('input[name="dates"][value="droite"]'); await w(100);
  await essai('Ordre : mon ordre', function () { var s = $('selOrdre'); s.value = 'mien'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  await essai('Lieu masqué', function () { click('#oLieu'); }, function () { click('#oLieu'); });
  await essai('Formations : optimisé', function () { click('input[name="formsel"][value="optimise"]'); }, function () { click('input[name="formsel"][value="complet"]'); });
  await essai('Formations : missions', function () { click('#oFormMissions'); }, function () { click('#oFormMissions'); });
  await essai('Espace entre formations', function () { var r = $('rgEspForm'); r.value = '16'; r.dispatchEvent(new Event('input', { bubbles: true })); });
  await essai('Compétences pro − ', function () { click('#pasPro button[data-d="-1"]'); });
  await essai('Rubrique Logiciels masquée', function () { click('#aLogi'); }, function () { click('#aLogi'); });
  await essai('Police Georgia', function () { var s = $('selPolice'); s.value = 'Georgia, serif'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  await essai('Taille du texte 14', function () { var r = $('rgTaille'); r.value = '14'; r.dispatchEvent(new Event('input', { bubbles: true })); });
  await essai('Taille des titres (Titres puis 18)', function () { click('#segCible button[data-v="titres"]'); var r = $('rgTaille'); r.value = '18'; r.dispatchEvent(new Event('input', { bubbles: true })); });
  click('#segCible button[data-v="texte"]'); await w(100); /* remet le curseur sur Texte, pour ne pas fausser les essais suivants */
  await essai('Marges 14 mm', function () { click('#segMarges button[data-v="14"]'); });
  await essai('Avancé : texte justifié', function () { click('#oJustif'); }, function () { click('#oJustif'); });
  await essai('Avancé : petits carrés des coordonnées', function () { click('#oIcoCoord'); }, function () { click('#oIcoCoord'); });
  click('#oDeux'); await w(150);
  await essai('Avancé : trait entre les colonnes (2 colonnes)', function () { click('#oSepcol'); }, function () { click('#oSepcol'); });
  click('#oDeux'); await w(150);
  await essai('Couleur de l’entreprise', function () { click('.sw.entreprise'); });
  R.push((document.getElementById('modes') ? 'ÉCART       ' : 'OK          ') + 'Les trois niveaux (Simple / Je débute / Je veux tout régler) sont retirés');

  /* 4) Missions : ce qui est AFFICHÉ dans le panneau doit égaler ce qui est réellement sur le CV */
  var ids = ['bd', 'th', 'bat', 'bou', 'boi', 'agr', 'del', 'pre', 'ven'];
  var dispo = { bd: 10, th: 10, bat: 3, bou: 3, boi: 3, agr: 2, del: 9, pre: 10, ven: 3 };
  var etat = function () { var o = {}; ids.forEach(function (id) { var row = q('.pas[data-pas="' + id + '"] span'), it = q('#cv [data-exp="' + id + '"]'); o[id] = { aff: row ? +row.textContent : null, reel: it ? it.querySelectorAll('li').length : null }; }); return o; };
  var verifier = function (titre, attendu) {
    var e = etat(), bad = [];
    ids.forEach(function (id) { if (e[id].reel === null) { return; } if (e[id].aff !== e[id].reel) { bad.push(id + ': affiché ' + e[id].aff + ' / réel ' + e[id].reel); } if (attendu && attendu(id) !== e[id].reel) { bad.push(id + ': attendu ' + attendu(id) + ' / réel ' + e[id].reel); } });
    R.push((bad.length ? 'ÉCART       ' : 'OK          ') + titre + (bad.length ? ' -> ' + bad.join(' ; ') : ''));
  };
  click('input[name="detail"][value="auto"]'); await w(200); verifier('Automatique : affiché = réel', null);
  click('input[name="detail"][value="complet"]'); await w(200);
  for (var n of [1, 4, 10]) {
    while (+$('nbMissions').textContent < n) { click('#pasMissions button[data-d="1"]'); await w(20); }
    while (+$('nbMissions').textContent > n) { click('#pasMissions button[data-d="-1"]'); await w(20); }
    await w(80); verifier('Complet, global ' + n, function (id) { return Math.min(dispo[id], n); });
  }
  click('.btn-miss[data-miss="th"]'); await w(100); click('.miss-liste input[data-mi="th|3"]'); await w(120); click('.miss-liste input[data-mi="th|4"]'); await w(120);
  verifier('Choix mission par mission', null);
  click('input[name="detail"][value="resume"]'); await w(200); verifier('Résumé : 1 mission partout', function () { return 1; });

  /* 5) Aperçu en plein écran : outils sans doublon, en-tête libre, ligne de fin de page identique sur les deux écrans */
  var bl = function (k, s) { return q('#pleinCvWrap .blc[data-bl="' + k + '"] ' + (s || '')); };
  var css = function (e) { return getComputedStyle(e); };
  click('input[name="detail"][value="auto"]'); await w(200);
  click('#segAllure button[data-v="standard"]'); await w(150);
  click('#btnPlein'); await w(300);
  ok('Plein écran : pas de doublon (dé, mise en page, pipette absents)', !$('tDe') && !$('tOpt') && !$('tPipette'));
  ok('Plein écran : outils utiles présents', !!$('tTexte') && !!$('tEntete') && !!$('tDeplacer') && !!$('tRetirer'));
  click('#tEntete'); await w(300);
  ok('En-tête : 4 blocs indépendants', document.querySelectorAll('#pleinCvWrap .blc').length === 4);
  ok('En-tête : aucun cadre rouge au départ', !q('#pleinCvWrap .blc.hors-cadre'), 'un bloc est rouge dès le départ');
  var h0 = q('#pleinCvWrap .tete.libre').offsetHeight, pos0 = bl('nom').style.left + bl('nom').style.top, f0 = css(bl('nom', '.nom')).fontSize;
  /* Le clic sur le CV de l'écran des réglages ouvre le plein écran sur le bloc cliqué, avec sa barre : on règle le nom (taille, gras, couleur, largeur, position). */
  click('#btnRetour'); await w(150);
  click('#cv .nom'); await w(500);
  ok('Raccourci : un clic sur le nom ouvre le plein écran, en-tête actif, barre du nom', $('plein').classList.contains('ouvert') && $('tEntete').classList.contains('on') && $('barreBloc').style.display === 'flex' && $('blNom').textContent === 'Nom');
  click('#barreBloc [data-bt="0.1"]'); await w(150);
  ok('Barre du bloc : A+ agrandit le nom', parseFloat(css(bl('nom', '.nom')).fontSize) > parseFloat(f0));
  var g0 = css(bl('nom', '.nom')).fontWeight; $('blGras').click(); await w(150);
  ok('Barre du bloc : gras', css(bl('nom', '.nom')).fontWeight !== g0);
  $('blCoul').value = '#b23a3a'; $('blCoul').dispatchEvent(new Event('input', { bubbles: true })); await w(150);
  ok('Barre du bloc : couleur', css(bl('nom', '.nom')).color === 'rgb(178, 58, 58)');
  var p1 = bl('nom').style.left + bl('nom').style.top; click('#barreBloc [data-bn="1,0"]'); await w(150);
  ok('Barre du bloc : position', bl('nom').style.left + bl('nom').style.top !== p1);
  var w1 = bl('nom').style.width; click('#barreBloc [data-bw="5"]'); await w(150);
  ok('Barre du bloc : largeur', bl('nom').style.width !== w1);
  click('#btnRetour'); await w(150);
  ok('Le petit aperçu reflète le réglage de l’en-tête', css(q('#cv .blc[data-bl="nom"] .nom')).color === 'rgb(178, 58, 58)');
  click('#btnPlein'); await w(200); click('#tEntete'); await w(250);
  for (var n of ['nom', 'coord', 'metier', 'accroche']) {
    var el = q('#pleinCvWrap [data-bl="' + n + '"]'); ok('En-tête : bloc « ' + n + ' » repérable', !!el);
  }
  click('#segDispTete button[data-v="2"]'); await w(250);
  ok('Disposition 2 colonnes : aucun cadre rouge', !q('#pleinCvWrap .blc.hors-cadre'));
  click('#segDispTete button[data-v="3"]'); await w(250);
  click('#tEnteteRaz'); await w(250);
  ok('Remettre l’en-tête : retour aux positions de départ', bl('nom').style.left + bl('nom').style.top === pos0 && q('#pleinCvWrap .tete.libre').offsetHeight === h0 && css(bl('nom', '.nom')).fontSize === f0);
  for (var g of ['sobre-bandeau', 'sobre-fond', 'sobre-epure', 'bandeau', 'diagonale', 'colonne', 'cadre', 'picto']) {
    click('#btnRetour'); await w(120);
    click('#segAllure button[data-v="' + (g.indexOf('sobre') === 0 ? 'sobre' : 'creatif') + '"]'); await w(120);
    if (g === 'colonne' && !$('oDeux').checked) { click('#oDeux'); await w(150); }
    click('.vign[data-g="' + g + '"]'); await w(150);
    click('#btnPlein'); await w(200); click('#tEntete'); await w(300);
    ok('En-tête ' + g + ' : aucun cadre rouge au départ', !q('#pleinCvWrap .blc.hors-cadre'));
  }
  click('#btnRetour'); await w(120); if (!$('oDeux').checked) { click('#oDeux'); await w(150); } click('.vign[data-g="frise"]'); await w(150); click('#btnPlein'); await w(200);
  ok('Frise : le bloc du nom est réglable (taille, gras, couleur)', !!q('#pleinCvWrap .fr-nom[data-bl="nom"]'));
  /* Frise : en-tête librement déplaçable comme partout ailleurs (Denis, 2026-09-22) */
  click('#tEntete'); await w(300);
  ok('Frise : en-tête libre disponible (4 blocs, comme les autres modèles)', document.querySelectorAll('#pleinCvWrap .blc').length === 4);
  ok('Frise : aucun cadre rouge au départ (bug réel du 2026-09-22 : classe « tete » manquante, blocs empilés sans recalcul de hauteur)', !q('#pleinCvWrap .blc.hors-cadre'));
  ok('Frise : le conteneur libre porte bien la classe « tete » (sélecteur dont dépendent le glisser et la hauteur automatique)', !!q('#pleinCvWrap .tete.libre'));
  ok('Frise : le conteneur libre couvre les 2 colonnes (Denis, 2026-09-22 : équilibrer nom/coordonnées/titre entre les colonnes)', q('#pleinCvWrap .tete.libre').offsetWidth > q('#pleinCvWrap .fr-main').offsetWidth * 1.2);
  /* Testé au clavier avec les flèches de position (fiable dans ce script), le glisser souris est vérifié à la main : la portée va bien jusqu'à la colonne de gauche */
  click('#pleinCvWrap .blc[data-bl="nom"]'); await w(250);
  for (var iG = 0; iG < 20; iG++) { click('#barreBloc [data-bn="-1,0"]'); }
  await w(200);
  ok('Frise : le nom peut vraiment atteindre la colonne de gauche (flèche de position, 20 pas)', parseFloat(q('#pleinCvWrap .blc[data-bl="nom"]').style.left) < 20, 'x = ' + q('#pleinCvWrap .blc[data-bl="nom"]').style.left);
  click('#tEnteteRaz'); await w(200);
  ok('Frise : coordonnées jamais en double (retirées de la colonne latérale quand l’en-tête est libre)', document.querySelectorAll('#pleinCvWrap .coord').length === 1);
  click('#pleinCvWrap .blc[data-bl="nom"]'); await w(250);
  var posFriseAvant = q('#pleinCvWrap .blc[data-bl="nom"]').style.left;
  click('#barreBloc [data-bn="1,0"]'); await w(200);
  ok('Frise : le nom se déplace réellement', q('#pleinCvWrap .blc[data-bl="nom"]').style.left !== posFriseAvant);
  click('#btnRetour'); await w(150);
  ok('Frise : une fois touché, l’en-tête reste libre partout (même règle que les autres modèles), toujours 1 seul bloc coordonnées', document.querySelectorAll('#cv .coord').length === 1);
  click('#tEnteteRaz'); await w(200); /* pas rouvert : le bouton n'existe que dans le plein écran ; on repart proprement via le modèle */
  if ($('oDeux').checked) { click('#oDeux'); await w(150); }
  click('#segAllure button[data-v="standard"]'); await w(150); if ($('oDeux').checked) { click('#oDeux'); await w(150); }
  /* Ligne de fin de page : mêmes lignes sur l'écran des réglages et sur le plein écran (un CV sur deux pages) */
  click('input[name="detail"][value="complet"]'); await w(150);
  for (var i = 0; i < 8; i++) { click('#pasMissions button[data-d="1"]'); await w(20); }
  await w(250); click('#btnPlein'); await w(300);
  ok('Fin de page : ligne visible sur les deux écrans', !!q('#cv .marque-page') && !!q('#pleinCvWrap .marque-page'));
  ok('Fin de page : même hauteur (1123 px = A4)', q('#cv .marque-page').style.top === q('#pleinCvWrap .marque-page').style.top);
  click('#btnRetour'); await w(100);

  /* 6) Dégradé : un vrai dégradé CSS sur les surfaces colorées, jamais en Sobre */
  var estDegrade = function (sel) { var e = q(sel); return !!e && /gradient/.test(getComputedStyle(e).backgroundImage); };
  click('#segAllure button[data-v="creatif"]'); await w(150); click('.vign[data-g="bandeau"]'); await w(200);
  ok('Dégradé activé par défaut sur le bandeau', estDegrade('#cv .tete-fond'));
  click('#oDegrade'); await w(200);
  ok('Dégradé désactivable (couleur pleine)', !estDegrade('#cv .tete-fond') && !!q('#cv .tete-fond'));
  click('#oDegrade'); await w(200);
  click('#oDeux'); await w(150); click('.vign[data-g="colonne"]'); await w(200);
  ok('Dégradé sur la colonne colorée', estDegrade('#cv .col-fond'));
  click('.vign[data-g="frise"]'); await w(200);
  ok('Dégradé sur le coin de la frise', estDegrade('#cv .fr-coin'));
  click('#oDeux'); await w(150);
  click('#segAllure button[data-v="sobre"]'); await w(200);
  ok('Dégradé masqué en Sobre (jamais de fond coloré)', getComputedStyle($('ligneDegrade')).display === 'none');
  click('#segAllure button[data-v="standard"]'); await w(150);

  /* 7) Compétences en texte : séparateur puce lisible (bug corrigé le 2026-09-22 : un octet corrompu affichait un carré puis « 2 ») */
  click('#segPill button[data-v="texte"]'); await w(150);
  var pills = document.querySelectorAll('#cv .pill.texte');
  ok('Séparateur de compétences en texte lisible (puce, pas de caractère invalide)', pills.length > 1 && getComputedStyle(pills[0], '::after').content.indexOf('•') !== -1);
  click('#segPill button[data-v="pastille"]'); await w(150);

  /* 8) Titre du CV et accroche : propositions de l'assistant choisies depuis « Mise en page et texte », jamais besoin de retourner à l'import */
  var m0 = q('#cv .metier').textContent;
  $('selMetier').value = '1'; $('selMetier').dispatchEvent(new Event('change', { bubbles: true })); await w(200);
  ok('Titre du CV : la proposition choisie s’affiche', q('#cv .metier').textContent !== m0);
  $('selMetier').value = '0'; $('selMetier').dispatchEvent(new Event('change', { bubbles: true })); await w(150);
  ok('Accroche visible par défaut', !!q('#cv .accroche'));
  click('#oSansAccroche'); await w(200);
  ok('Sans accroche : masquée sur l’écran des réglages', !q('#cv .accroche'));
  ok('Sans accroche : liste désactivée', $('selAccroche').disabled);
  click('#segAllure button[data-v="creatif"]'); await w(150); if (!$('oDeux').checked) { click('#oDeux'); await w(150); } click('.vign[data-g="frise"]'); await w(200);
  ok('Sans accroche : masquée aussi sur la frise', !q('#cv .fr-accroche'));
  click('#segAllure button[data-v="standard"]'); await w(150); if ($('oDeux').checked) { click('#oDeux'); await w(150); }
  click('#btnPlein'); await w(200); click('#tEntete'); await w(300);
  ok('Sans accroche : absente du plein écran (en-tête libre)', !q('#pleinCvWrap .blc[data-bl="accroche"]'));
  click('#btnRetour'); await w(150);
  click('#oSansAccroche'); await w(150);
  ok('Sans accroche : la case décochée fait réapparaître l’accroche', !!q('#cv .accroche'));

  /* 9) Formations : gras et italique du titre, jamais les expériences (même classe .fr-poste partagée sur la frise) */
  var titreForm = function () { var items = document.querySelectorAll('#cv .item, #cv .fr-item'); for (var i = 0; i < items.length; i++) { if (items[i].textContent.indexOf('AFTRAL') !== -1) { return items[i].querySelector('b, span, .fr-poste'); } } return null; };
  var t0 = titreForm(), w0 = t0 && getComputedStyle(t0).fontWeight;
  ok('Formations : ni gras ni italique par défaut', w0 === '400' && $('btnFormGras').classList.contains('on') === false && $('btnFormItal').classList.contains('on') === false);
  click('#btnFormGras'); await w(200);
  var t1 = titreForm();
  ok('Formations : gras activable, bouton visiblement actif', t1 && getComputedStyle(t1).fontWeight === '700' && $('btnFormGras').classList.contains('on'));
  click('#btnFormItal'); await w(200);
  var t2 = titreForm();
  ok('Formations : italique activable, bouton visiblement actif', t2 && getComputedStyle(t2).fontStyle === 'italic' && $('btnFormItal').classList.contains('on'));
  click('#segAllure button[data-v="creatif"]'); await w(150); if (!$('oDeux').checked) { click('#oDeux'); await w(150); } click('.vign[data-g="frise"]'); await w(200);
  var tf = titreForm();
  ok('Formations : gras/italique visibles aussi sur la frise', tf && getComputedStyle(tf).fontWeight === '700' && getComputedStyle(tf).fontStyle === 'italic');
  var expFrise = q('#cv .fr-frise .fr-poste');
  ok('Formations : le réglage ne touche jamais le poste des expériences', expFrise && getComputedStyle(expFrise).fontWeight === '700' && getComputedStyle(expFrise).fontStyle === 'normal');
  click('#btnFormItal'); await w(150); click('#btnFormGras'); await w(150);
  click('#segAllure button[data-v="standard"]'); await w(150); if ($('oDeux').checked) { click('#oDeux'); await w(150); }

  /* 10) Permis B avec les coordonnées, jamais une rubrique à part (demande de Denis, 2026-09-22), aux 3 endroits où les coordonnées s'affichent */
  ok('Permis avec les coordonnées (écran des réglages)', q('#cv .coord').textContent.indexOf('Permis') !== -1);
  click('#segAllure button[data-v="creatif"]'); await w(150); if (!$('oDeux').checked) { click('#oDeux'); await w(150); } click('.vign[data-g="frise"]'); await w(200);
  ok('Permis avec les coordonnées (frise)', q('#cv .coord').textContent.indexOf('Permis') !== -1);
  click('#segAllure button[data-v="standard"]'); await w(150); if ($('oDeux').checked) { click('#oDeux'); await w(150); }
  click('#btnPlein'); await w(200); click('#tEntete'); await w(250);
  ok('Permis avec les coordonnées (plein écran)', q('#pleinCvWrap .coord').textContent.indexOf('Permis') !== -1);
  click('#btnRetour'); await w(150);

  /* 11) Fond de colonne « Gauche », en plus d'Aucun / Droite */
  click('#oDeux'); await w(300);
  click('#segFond button[data-v="gauche"]'); await w(300);
  var corpsG = function () { return q('#cv .corps.deux'); };
  var cg1 = corpsG();
  ok('Fond de colonne à gauche', !!cg1 && cg1.children[0].classList.contains('col-fond') && !cg1.children[1].classList.contains('col-fond'), cg1 ? 'classes cv : ' + $('cv').className : 'aucun .corps.deux trouvé (oDeux.checked=' + $('oDeux').checked + ')');
  click('#segFond button[data-v="droite"]'); await w(300);
  var cg2 = corpsG();
  ok('Fond de colonne à droite (l’ancien réglage marche toujours)', !!cg2 && cg2.children[1].classList.contains('col-fond') && !cg2.children[0].classList.contains('col-fond'));
  click('#segFond button[data-v="aucun"]'); await w(200);
  click('#oDeux'); await w(200);

  /* 12) Missions épurées ou condensées */
  click('input[name="detail"][value="complet"]'); await w(150);
  var avantUl = document.querySelectorAll('#cv .item ul').length;
  ok('Missions épurées par défaut (à puces)', avantUl > 0);
  click('#segStyleExp button[data-v="condense"]'); await w(250);
  ok('Missions condensées (plus de liste à puces, un paragraphe)', document.querySelectorAll('#cv .item ul').length === 0 && !!q('#cv .item .meta'));
  click('#segAllure button[data-v="creatif"]'); await w(150); if (!$('oDeux').checked) { click('#oDeux'); await w(150); } click('.vign[data-g="frise"]'); await w(200);
  ok('Missions condensées visibles aussi sur la frise', !!q('#cv .fr-item .meta'));
  click('#segStyleExp button[data-v="epure"]'); await w(200);
  click('#segAllure button[data-v="standard"]'); await w(150); if ($('oDeux').checked) { click('#oDeux'); await w(150); }

  /* 13) Style des lignes d'expérience : dates et entreprise, jamais le poste */
  var ligneDoumbouya = function () { var items = document.querySelectorAll('#cv .item'); for (var i = 0; i < items.length; i++) { if (items[i].textContent.indexOf('Ouvrier service emballage') !== -1) { return items[i]; } } return null; };
  var lg0 = ligneDoumbouya();
  ok('Poste toujours en gras, jamais souligné ni italique au départ', getComputedStyle(lg0.querySelector('b.gras')).fontWeight === '700');
  click('#btnDatesSoul'); await w(150); click('#btnDatesItal'); await w(150);
  var lg1 = ligneDoumbouya(), d1 = lg1.querySelector('.dates span');
  ok('Dates : souligné + italique activables', d1 && getComputedStyle(d1).textDecorationLine === 'underline' && getComputedStyle(d1).fontStyle === 'italic');
  click('#btnEntSoul'); await w(150);
  var lg2 = ligneDoumbouya();
  ok('Entreprise : souligné activable', getComputedStyle(lg2.querySelector('.ligne span > span[style]')).textDecorationLine === 'underline');
  ok('Le poste n’est jamais touché par ces réglages', getComputedStyle(lg2.querySelector('b.gras')).fontWeight === '700' && getComputedStyle(lg2.querySelector('b.gras')).fontStyle === 'normal');
  click('#segAllure button[data-v="creatif"]'); await w(150); if (!$('oDeux').checked) { click('#oDeux'); await w(150); } click('.vign[data-g="frise"]'); await w(200);
  var itFrise = (function () { var items = document.querySelectorAll('#cv .fr-item'); for (var i = 0; i < items.length; i++) { if (items[i].textContent.indexOf('Ouvrier service emballage') !== -1) { return items[i]; } } return null; })();
  ok('Style des lignes visible aussi sur la frise, poste intact', getComputedStyle(itFrise.querySelector('.fr-ent')).textDecorationLine === 'underline' && getComputedStyle(itFrise.querySelector('.fr-poste')).fontWeight === '700');
  click('#btnDatesSoul'); await w(120); click('#btnDatesItal'); await w(120); click('#btnEntSoul'); await w(120);
  click('#segAllure button[data-v="standard"]'); await w(150); if ($('oDeux').checked) { click('#oDeux'); await w(150); }

  /* 14) Format : A4 sur 1 page (défaut) / A4 complet sur plusieurs pages, sans que « Automatique » ne reprenne le contenu en douce */
  click('input[name="detail"][value="complet"]'); await w(150);
  for (var i = 0; i < 3; i++) { click('#pasMissions button[data-d="1"]'); await w(15); }
  click('input[name="detail"][value="auto"]'); await w(300);
  var missionsAvant = document.querySelectorAll('#cv [data-exp] li').length;
  click('#segFormat button[data-v="a4-complet"]'); await w(300);
  var missionsApres = document.querySelectorAll('#cv [data-exp] li').length;
  ok('Format A4 complet : Automatique n’efface plus le contenu (plus de missions affichées)', missionsApres > missionsAvant);
  ok('Format A4 complet : message calme, jamais une incitation à réduire', $('infoAuto').textContent.indexOf('Votre CV est complet') !== -1);
  click('#segFormat button[data-v="a4-1page"]'); await w(300);
  ok('Retour à A4 1 page : le contenu recompacte', document.querySelectorAll('#cv [data-exp] li').length === missionsAvant);

  /* 15) Mise en page : boucle vraiment jusqu'à tenir (ou jusqu'à épuiser ce qu'elle peut essayer), jamais un seul petit pas ; toujours réversible
     (taille remise au maximum d'abord : ce test ne suppose rien de l'état laissé par les sections précédentes) */
  click('input[name="detail"][value="complet"]'); await w(150);
  for (var i3 = 0; i3 < 6; i3++) { click('#pasMissions button[data-d="1"]'); await w(15); }
  click('#segCible button[data-v="texte"]'); /* le curseur peut avoir été laissé sur « Titres » par un essai précédent */
  var rTaille = $('rgTaille'); rTaille.value = '14'; rTaille.dispatchEvent(new Event('input', { bubbles: true })); await w(150);
  ok('Mise en page : préalable, le CV dépasse bien une page avant de l’optimiser', q('#cv .marque-page') !== null);
  var tailleAvantOptim = $('valTaille').textContent;
  click('#btnOptim'); await w(400);
  ok('Mise en page : la taille a vraiment bougé (boucle, pas un seul petit pas)', $('valTaille').textContent !== tailleAvantOptim);
  ok('Mise en page : bouton Annuler activé après usage', !$('btnAnnulerOptim').disabled);
  click('#btnAnnulerOptim'); await w(300);
  ok('Mise en page : Annuler restaure exactement la taille d’avant', $('valTaille').textContent === tailleAvantOptim && $('btnAnnulerOptim').disabled);

  /* Mise en page : 2 leviers de plus (Denis, 2026-09-22), déclenchés seulement si taille/espacement/marges ne suffisent pas */
  for (var i4 = 0; i4 < 3; i4++) { click('#pasMissions button[data-d="1"]'); await w(15); }
  await w(150);
  click('#btnOptim'); await w(500);
  ok('Mise en page : compétences en texte si besoin (dernier recours, jamais en premier)', document.querySelector('#segPill button.on').getAttribute('data-v') === 'texte');
  ok('Mise en page : missions condensées si besoin (dernier recours, jamais en premier)', document.querySelector('#segStyleExp button.on').getAttribute('data-v') === 'condense');
  click('#btnAnnulerOptim'); await w(300);
  ok('Mise en page : Annuler restaure aussi les pastilles et le style des missions', document.querySelector('#segPill button.on').getAttribute('data-v') === 'pastille' && document.querySelector('#segStyleExp button.on').getAttribute('data-v') === 'epure');

  /* 16) Style rapide (dé) : réversible en un clic, sur la même ligne */
  var couleurAvantDe = getComputedStyle($('cv')).getPropertyValue('--cv').trim();
  click('#btnDe'); await w(300);
  ok('Dé : bouton Annuler activé après un tirage', !$('btnAnnulerTirage').disabled);
  click('#btnAnnulerTirage'); await w(300);
  ok('Dé : Annuler restaure exactement la couleur d’avant', getComputedStyle($('cv')).getPropertyValue('--cv').trim() === couleurAvantDe && $('btnAnnulerTirage').disabled);
  ok('Raccourci « Depuis le début » présent à côté du dé', !!$('btnDepuisDebut'));

  /* 17) Barre du bas : message rouge si le CV dépasse une page en format « A4 1 page », jamais en « A4 complet » ; Valider reste toujours cliquable */
  click('input[name="detail"][value="complet"]'); await w(150);
  for (var i2 = 0; i2 < 6; i2++) { click('#pasMissions button[data-d="1"]'); await w(15); }
  await w(200);
  ok('Barre du bas : message rouge visible quand le CV dépasse une page (format A4 1 page)', getComputedStyle($('avertPage')).display !== 'none' && $('avertPage').textContent.length > 0);
  ok('Valider reste cliquable même quand le CV dépasse une page', !$('btnValider').disabled);
  click('#segFormat button[data-v="a4-complet"]'); await w(250);
  ok('Barre du bas : message masqué en format A4 complet (le dépassement est voulu)', getComputedStyle($('avertPage')).display === 'none');
  click('#segFormat button[data-v="a4-1page"]'); await w(200);
  ok('Barre du bas : le message revient si on repasse en A4 1 page', getComputedStyle($('avertPage')).display !== 'none');
  click('input[name="detail"][value="auto"]'); await w(200);

  /* 18) Titres : plafond relevé de 20 à 30 px (Denis, 2026-09-22, page à remplir avec peu de contenu), jamais de débordement dans la colonne voisine
     (bug trouvé pendant ce contrôle : un h2 en display:flex ne laissait pas son texte se réduire sous son min-content, même avec overflow-wrap ;
     corrigé par un <span> interne avec min-width:0, + min-width:0 sur les colonnes de la grille 2 colonnes et de la frise) */
  click('#segAllure button[data-v="standard"]'); await w(120); if (!$('oDeux').checked) { click('#oDeux'); await w(150); }
  click('#segCible button[data-v="titres"]'); await w(100);
  ok('Titres : plafond relevé à 30 px', $('rgTaille').max === '30');
  click('#oAgrandir'); await w(120);
  var rT = $('rgTaille'); rT.value = '30'; rT.dispatchEvent(new Event('input', { bubbles: true })); await w(200);
  var debordeDeux = Array.from(document.querySelectorAll('#cv .corps.deux h2')).some(function (h) { return h.scrollWidth > h.parentElement.clientWidth + 2; });
  ok('Titres à 30 px + Agrandir + 2 colonnes (pire cas) : aucun débordement dans la colonne voisine', !debordeDeux);
  click('#oAgrandir'); await w(120);
  click('#segAllure button[data-v="creatif"]'); await w(150); click('.vign[data-g="frise"]'); await w(200);
  click('#oAgrandir'); await w(120);
  var debordeFrise = Array.from(document.querySelectorAll('#cv .fr-lat h3, #cv .fr-h')).some(function (h) { return h.scrollWidth > h.parentElement.clientWidth + 2; });
  ok('Titres à 30 px + Agrandir + frise (pire cas) : aucun débordement', !debordeFrise);
  click('#oAgrandir'); await w(120);
  rT.value = '13'; rT.dispatchEvent(new Event('input', { bubbles: true })); await w(100);
  click('#segCible button[data-v="texte"]'); await w(100);
  click('#segAllure button[data-v="standard"]'); await w(150); if ($('oDeux').checked) { click('#oDeux'); await w(150); }

  /* 19) Mise en page (remplir) : 3e levier, les titres (Denis, 2026-09-22 : « on peut agrandir les titres tant que ça ne casse rien »)
     Règle A retenue (stricte) : on s'arrête à la taille juste avant qu'un titre gagne une ligne, même si rien n'est cassé techniquement -
     une fonction automatique reste prudente, contrairement à un réglage manuel où la personne voit et choisit. */
  var lignesEl = function (el) { var r = document.createRange(); r.selectNodeContents(el); return r.getClientRects().length || 1; };
  /* Remet marge et taille du texte à leur défaut : ce test ne suppose rien de ce que les essais précédents ont laissé
     (« Revenir au modèle de départ » recharge la page, inutilisable ici - on ne remet que ce dont ce test a besoin). */
  click('#segMarges button[data-v="10"]'); await w(150);
  click('#segCible button[data-v="texte"]'); await w(100);
  var rTailleReset = $('rgTaille'); rTailleReset.value = '12.5'; rTailleReset.dispatchEvent(new Event('input', { bubbles: true })); await w(150);
  click('input[name="tout"][value="pertinentes"]'); await w(200);
  click('#pasPro button[data-d="-1"]'); await w(120); click('#pasPro button[data-d="-1"]'); await w(200);
  var lignesAvant19 = Array.from(document.querySelectorAll('#cv h2')).map(lignesEl);
  click('#segCible button[data-v="titres"]'); await w(100);
  var titresAvant19 = $('valTaille').textContent;
  click('#segCible button[data-v="texte"]'); await w(100);
  click('#btnOptim'); await w(500);
  click('#segCible button[data-v="titres"]'); await w(100);
  var titresApres19 = $('valTaille').textContent;
  var lignesApres19 = Array.from(document.querySelectorAll('#cv h2')).map(lignesEl);
  ok('Remplir : les titres grandissent quand il reste de la place', titresApres19 !== titresAvant19, 'avant ' + titresAvant19 + ' / après ' + titresApres19);
  ok('Remplir : jamais un titre qui gagne une ligne (règle A, même sans casse technique)', !lignesApres19.some(function (n, i) { return n > lignesAvant19[i]; }));
  ok('Remplir : jamais de dépassement de page à cause des titres', $('cv').scrollHeight <= 1125);
  click('#btnAnnulerOptim'); await w(300);
  click('#segCible button[data-v="titres"]'); await w(100);
  ok('Remplir : Annuler restaure aussi la taille des titres', $('valTaille').textContent === titresAvant19);
  click('#segCible button[data-v="texte"]'); await w(100);
  click('input[name="tout"][value="toutes"]'); await w(150);

  /* 20) 3 fonctions demandées par Denis le 2026-09-22, jamais derrière « Style au hasard » (uniquement activables par la personne) */
  var titreFormV20 = function () { var items = document.querySelectorAll('#cv .item, #cv .fr-item'); for (var i = 0; i < items.length; i++) { if (items[i].textContent.indexOf('AFTRAL') !== -1) { return items[i].querySelector('b, span, .fr-poste'); } } return null; };
  click('#btnFormSoul'); await w(200);
  ok('Formations : souligné du titre (nouveau bouton S, aux côtés de G et I)', getComputedStyle(titreFormV20()).textDecorationLine === 'underline');
  click('#btnFormSoul'); await w(150);
  ok('Couleur d’entreprise : simulateur coché par défaut (captée), bouton actif et cliquable', !q('.sw.entreprise[disabled]'));
  click('#oSimulCouleurEnt'); await w(200);
  ok('Couleur d’entreprise non captée : bouton désactivé, message en clair affiché (jamais une simple infobulle)', !!q('.sw.entreprise[disabled]') && !!q('.sw-entreprise-msg'));
  click('#oSimulCouleurEnt'); await w(200);
  ok('Couleur d’entreprise captée à nouveau : redevient active', !q('.sw.entreprise[disabled]'));
  click('#oIconesCoord'); await w(200);
  ok('Icônes sur les coordonnées : pictogrammes réels (mêmes tracés que le code applicatif), jamais un simple carré', document.querySelectorAll('#cv .coord svg').length >= 3);
  click('#oIconesCoord'); await w(150);
  ok('Icônes sur les coordonnées décochées : retour aux petits carrés', document.querySelectorAll('#cv .coord svg').length === 0 && !q('#cv').className.split(' ').includes('sans-icoc'));
  var sourceTirer = Array.from(document.querySelectorAll('script')).map(function (s) { return s.textContent; }).join('\n').match(/function tirer\s*\([^)]*\)\s*\{[\s\S]*?\n  \}\n/);
  ok('Aucune des 3 fonctions ci-dessus dans le tirage au hasard (grep du code source de tirer())', !!sourceTirer && !/formSoul|couleurEntreprise|iconesCoord/.test(sourceTirer[0]));

  return R.join('\n');
})();
