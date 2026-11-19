/* ============================================================
   Module « Explorer les métiers » : la FEUILLE IMPRIMÉE de « Ma synthèse » (tâche A14 de docs/CHANTIER_MA_SYNTHESE_EXPLORER_LES_METIERS_2026-11-18.md ; maquette V10, écran « Feuille imprimée »).
   Plus riche que la page : neuf rubriques, noir sur blanc, sans bouton. Rien n'est envoyé nulle part : la feuille est produite sur l'appareil de la personne.
   Impression : le composant commun ucpmImprimerDocument (modules/un-cv-plusieurs-metiers/page7Fin.js : cadre invisible, titre de la page posé le temps de l'impression
   = nom proposé pour le PDF, fonts et images attendues). AUCUN second composant d'impression. Les données viennent de synDonneesPourLecture (une seule collecte).
   Charge après syntheseLecture.js. Étape B : la rubrique « Mon parcours » se remplira avec le parcours professionnel.
   ============================================================ */

var SYN_CSS_FEUILLE = '@page{size:A4;margin:16mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#000}' +
  'body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.45}' +
  'h1{font-size:19pt;margin:0 0 .2rem}h2{font-size:13pt;margin:1.1rem 0 .3rem;padding-bottom:.15rem;border-bottom:1.5px solid #000;break-after:avoid}h3{font-size:11pt;margin:.6rem 0 .15rem;break-after:avoid}' +
  'p{margin:.25rem 0}ul,ol{margin:.25rem 0 .25rem 1.2rem;padding:0}li{margin:.12rem 0}.note{font-size:9.5pt;color:#333}' +
  '.piste{border:1px solid #000;padding:.4rem .6rem;margin:.4rem 0;break-inside:avoid}.piste b{font-size:11.5pt}' +
  '.pied{margin-top:1.2rem;border-top:1px solid #000;padding-top:.3rem;font-size:9pt;color:#333}';

function _synF(t) { return cmvE(t); }
function _synFListe(liste) { return liste.length ? '<ul>' + liste.map(function (x) { return '<li>' + _synF(x) + '</li>'; }).join('') + '</ul>' : ''; }

function synHtmlFeuille(etat) {
  var s = synEtat(), d = synDonneesPourLecture(etat), l = s.lecture, D = (typeof _pmfD === 'function') ? _pmfD() : null, S = (typeof pmEtat === 'function') ? pmEtat() : null;
  var h = '<h1>Ma synthèse : Explorer les métiers</h1><p class="note">Établie le ' + _synF(_synDateFr()) + '. Document personnel : des pistes de réflexion, ni une note, ni un diagnostic, ni une solution.</p>';

  h += '<h2>1. Le métier que j’ai retenu</h2>';
  if (d.p1) {
    h += '<p><b>' + _synF(d.p1.retenu.nom) + '</b>' + (d.p1.retenu.secteur ? ' (' + _synF(d.p1.retenu.secteur) + ')' : '') + '. ' + (d.p1.retenu.niveau ? 'Niveau d’accès : ' + _synF(d.p1.retenu.niveau) + '.' : '') + '</p>' +
      (d.p1.principales.length ? '<p>Principales compétences demandées : ' + d.p1.principales.map(_synF).join(', ') + '.</p>' : '') +
      (d.p1.choisies.length ? '<p>Compétences que j’ai choisies : ' + d.p1.choisies.map(_synF).join(', ') + '.' + (d.p1.pct !== null ? ' Part de ces compétences retrouvée dans ce métier : ' + d.p1.pct + ' % (ce n’est pas une note).' : '') + '</p>' : '') +
      (d.p1.proches.length ? '<p>Métiers proches : ' + d.p1.proches.map(_synF).join(', ') + '.</p>' : '');
  } else { h += '<p>Pas encore fait.</p>'; }

  h += '<h2>2. Ce que j’aime faire</h2>';
  if (d.p2) {
    h += '<ul>' + d.p2.choix.filter(function (c) { return c.valeurs.length; }).map(function (c) { return '<li><b>' + _synF(c.titre) + ' :</b> ' + c.valeurs.map(_synF).join(', ') + '</li>'; }).join('') +
      (d.p2.faciles.length ? '<li><b>Je ferais facilement :</b> ' + d.p2.faciles.map(_synF).join(', ') + '</li>' : '') +
      (d.p2.difficiles.length ? '<li><b>Ce qui serait difficile :</b> ' + d.p2.difficiles.map(_synF).join(', ') + '</li>' : '') + '</ul>' +
      (d.p2.metiers.length ? '<p>Métiers qui retrouvent le plus de mes choix : ' + d.p2.metiers.map(function (m) { return _synF(m.nom) + (m.pct !== null && m.pct !== undefined ? ' (' + Math.round(m.pct) + ' %)' : ''); }).join(' ; ') + '.</p>' : '') +
      (d.p2.retenu ? '<p>Métier retenu : <b>' + _synF(d.p2.retenu.nom) + '</b>.</p>' : '');
  } else { h += '<p>Pas encore fait.</p>'; }

  h += '<h2>3. Mes six lettres</h2>';
  if (d.p3) {
    var ordre = CML_LETTRES.slice().sort(function (a, b) { return (d.p3.pourcentages[b] || 0) - (d.p3.pourcentages[a] || 0); });
    h += '<p>' + ordre.map(function (x) { return _synF(SYN_NOMS_LETTRES[x]) + ' ' + Math.round(d.p3.pourcentages[x] || 0) + ' %'; }).join(' ; ') + '.</p>' +
      '<p class="note">Un pourcentage dit la place d’un type dans mes réponses : ce n’est pas une note.</p>' +
      (d.p3.metiers.length ? '<p>Métiers proches de mes lettres : ' + d.p3.metiers.map(function (m) { return _synF(m.nom) + (m.lettres ? ' (' + _synF(m.lettres) + ')' : ''); }).join(' ; ') + '.</p>' : '') +
      (d.p3.retenu ? '<p>Métier retenu : <b>' + _synF(d.p3.retenu.nom) + '</b>.</p>' : '');
  } else { h += '<p>Pas encore fait.</p>'; }

  h += '<h2>4. Ce que mes passages ont en commun</h2>';
  h += (d.recoupe.reviennent.length ? '<p>Métiers qui reviennent dans plusieurs passages : ' + d.recoupe.reviennent.map(_synF).join(', ') + '.</p>' : '<p>Aucun métier ne revient dans plusieurs passages parmi ceux qui ressortent le plus.</p>') +
    (d.recoupe.communes.length ? '<p>Compétences qui ressortent : ' + d.recoupe.communes.map(_synF).join(', ') + '.</p>' : '');

  h += '<h2>5. Mon parcours et mes compétences</h2>';
  var parcours = synEtat().parcours.filter(function (e) { return synpNbCoches(e) > 0; });
  if (parcours.length) {
    h += parcours.map(function (e) {
      var morceaux = ['sf', 'se', 'sv'].filter(function (t) { return e[t].length; }).map(function (t) { return '<b>' + _synF({ sf: 'Savoir-faire', se: 'Savoir-être', sv: 'Savoirs' }[t]) + ' :</b> ' + e[t].map(_synF).join(', '); });
      return '<p><b>' + _synF(D ? synpNomAffiche(D, e) : e.nom) + '</b>, ce que j’y ai pratiqué : ' + morceaux.join(' ; ') + '.</p>';
    }).join('') + '<p class="note">Compétences que j’ai cochées moi-même ; la fiche d’un métier décrit le métier en général, pas forcément mon poste.</p>';
  } else { h += '<p>Parcours pas encore ajouté.</p>'; }
  if (D && S && S.comp.length) { h += '<p>Compétences choisies dans « Par un métier » : ' + S.comp.map(function (c) { return _synF(D[c.t][c.i].lib); }).join(', ') + '.</p>'; }

  h += '<h2>6. Ma situation</h2>' + (d.situation ? '<p>' + _synF(d.situation.charAt(0).toUpperCase() + d.situation.slice(1)) + '.</p>' : '<p>Non indiquée.</p>') +
    (d.libre && d.libre.trim() ? '<p><b>Dans mes mots :</b> « ' + _synF(d.libre) + ' »</p>' : '');

  if (l) {
    h += '<h2>7. La lecture de l’assistant en ligne</h2><p class="note">Reçue le ' + _synF(l.date || '') + '. Une lecture à relire avec un conseiller : des pistes de réflexion, à confirmer ou à changer.</p>';
    if (l.passages.length) { h += '<h3>Ce que disent mes résultats</h3>' + _synFListe(l.passages); }
    if (l.converge) { h += '<h3>Ce qui converge</h3><p>' + _synF(l.converge) + '</p>'; }
    if (l.diverge.length) { h += '<h3>Ce qui diverge</h3>' + _synFListe(l.diverge.map(function (x) { return (x.constat || '') + (x.hypothese ? ' ' + x.hypothese : ''); })); }
    if (l.ombre.length) { h += '<h3>Ce que mes résultats n’ont pas pu relever</h3>' + _synFListe(l.ombre); }
    if (l.premiere || l.approfondie) { h += '<h3>Première lecture, puis lecture plus approfondie</h3>' + (l.premiere ? '<p>' + _synF(l.premiere) + '</p>' : '') + (l.approfondie ? '<p>' + _synF(l.approfondie) + '</p>' : ''); }
    if (l.direction) { h += '<h3>Une direction</h3><p>' + _synF(l.direction) + '</p>'; }
    if (l.pistes.length) {
      var tests = _synNomsTests(etat), voisins = D ? _synVoisinsDesRetenus(D) : [];
      h += '<h3>Des pistes à regarder</h3>' + l.pistes.map(function (p, i) {
        var info = D ? synInfosPiste(p, D, S, tests, voisins) : { origine: synOrigineDePiste(p.metier, tests, voisins), idx: -1 };
        var c = info.comparaison;
        return '<div class="piste"><b>' + (i + 1) + '. ' + _synF(p.metier) + '</b><p class="note">' + _synF(SYN_LIB_ORIGINE[info.origine]) + (info.niveau ? ' · Niveau d’accès : ' + _synF(info.niveau) : '') + '</p>' +
          (p.fort ? '<p>Va dans le sens de mes résultats : ' + _synF(p.fort) + '</p>' : '') + (p.verifier ? '<p>À vérifier : ' + _synF(p.verifier) + '</p>' : '') +
          (c ? '<p class="note">Compétences déjà pratiquées : ' + c.deja + ' sur ' + c.total + ' (calculé par l’application, ce n’est pas une note).</p>' +
            (c.transferables.length ? '<p>Transférables : ' + _synF(_synLibsTexte(D, c.transferables, 6)) + '.</p>' : '') + (c.transversales.length ? '<p>Transversales : ' + _synF(_synLibsTexte(D, c.transversales, 6)) + '.</p>' : '') +
            (c.aAcquerir.length ? '<p>À acquérir : ' + _synF(_synLibsTexte(D, c.aAcquerir, 6)) + '.</p>' : '') : '') +
          (info.idx < 0 && D ? '<p class="note">Pas de fiche de ce métier dans l’application : à regarder avec un conseiller.</p>' : '') + '</div>';
      }).join('');
    }
    if (l.experience.transferables.length || l.experience.transversales.length) {
      h += '<h3>Ce que mon expérience apporte</h3>' + (l.experience.transferables.length ? '<p><b>Transférables :</b> ' + l.experience.transferables.map(_synF).join(', ') + '.</p>' : '') +
        (l.experience.transversales.length ? '<p><b>Transversales :</b> ' + l.experience.transversales.map(_synF).join(', ') + '.</p>' : '');
    }
    if (l.essayer.length) { h += '<h3>Rencontrer, essayer</h3>' + _synFListe(l.essayer); }
    if (l.accompagnement) { h += '<p>' + _synF(l.accompagnement) + '</p>'; }
  } else {
    h += '<h2>7. La lecture de l’assistant en ligne</h2><p>Pas encore faite.</p>';
  }

  h += '<h2>8. Valider mon projet</h2><ul><li>☐ Je compare mes compétences à celles attendues pour ce métier</li><li>☐ Je regarde les offres près de chez moi' + (d.territoire ? ' (' + _synF(d.territoire) + ')' : '') + ' et mes contraintes (horaires, déplacements)</li>' +
    '<li>☐ Je rencontre un professionnel du métier</li><li>☐ Je fais une ou deux immersions courtes (Immersion facilitée : immersion-facile.beta.gouv.fr)</li><li>☐ Je me demande : est-ce que je me vois exercer ce métier ?</li></ul>';

  var questions = (l && l.questions.length) ? l.questions : ['Quelle formation, et de quel niveau, près de chez moi ?', 'Comment tester ce métier avant de m’engager ?', 'Quelles aides pour une remise à niveau ?'];
  h += '<h2>9. Questions pour mon conseiller</h2>' + _synFListe(questions);
  h += '<div class="pied">Rien n’a été envoyé : cette feuille est produite sur l’appareil de la personne. Les lettres et les conditions de travail des métiers sont approximatives. Sources : base des métiers (ROME de France Travail)' + (d.recrutement && d.recrutement.length ? ', enquête Besoins en main-d’œuvre de France Travail' : '') + '.</div>';
  return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Ma synthèse : Explorer les métiers</title><style>' + SYN_CSS_FEUILLE + '</style></head><body>' + h + '</body></html>';
}

// Le bouton « Imprimer ou enregistrer en PDF » (page de synthèse et page de lecture).
function synBoutonImprimer() {
  return '<button type="button" class="btn btn-outline-primary" style="min-height:46px" data-cml="synImprimer"><i class="bi bi-printer" aria-hidden="true"></i> Imprimer ou enregistrer en PDF</button>';
}
cmvEnregistrerAction('synImprimer', function () {
  if (typeof ucpmImprimerDocument !== 'function') { if (typeof afficherToast === 'function') { afficherToast('L’impression n’est pas disponible pour le moment.', 5000); } return false; }
  ucpmImprimerDocument('ma-synthese-explorer-les-metiers', synHtmlFeuille(cmvEtat()));
  return false;
});
