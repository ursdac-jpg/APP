/* ============================================================
   Module « Découvrir mes compétences » : écran 1, « Mes documents ».
   Dépôt EN PAGE par la brique commune htmlDepotCVEnPage (PDF, Word, photo, texte, relecture et masquage sous le bouton « Déposer », plus aucune fenêtre, consigne 28).
   La brique n'écrit rien dans dossier.cvTexte / cvAnalyse (ecrireCV: false) : le CV de la personne n'est jamais touché par un dépôt d'ici.
   Choix v1 : pas de raccourci « mon CV enregistré » (son texte n'a pas été masqué pour l'envoi) : le CV passe par le même dépôt que les autres.
   ============================================================ */

var MESCOMP_DEPOTS = {
  cv: { intro: '', titreDocument: 'CV' },
  lettreMotivation: { intro: '', titreDocument: 'Lettre de motivation' },
  recommandation: { intro: 'Déposez la lettre de recommandation : PDF, Word, texte, photo ou capture d’écran. Elle est lue directement dans votre navigateur, <strong>elle n’est envoyée nulle part</strong>. <strong>Pensez à protéger la personne qui l’a écrite</strong> : à la relecture, son nom et sa fonction sont à masquer. Ils ne partent jamais chez l’assistant.', titreDocument: 'Lettre de recommandation' }
};
var MESCOMP_NIVEAUX_CHOIX = [
  { id: 'execution', libelle: 'Ouvrier ou employé' },
  { id: 'technicien', libelle: 'Technicien ou agent de maîtrise' },
  { id: 'cadre', libelle: 'Cadre ou direction' },
  { id: 'auto', libelle: 'Je ne sais pas : l’outil propose' }
];

// Zone de dépôt ouverte sous une section (un seul type à la fois : la brique n'a qu'une instance affichée) ; null = aucune.
var _mesCompDepotOuvert = null;
function _mesCompDepotCfg(type) {
  var info = MESCOMP_DEPOTS[type];
  return {
    cle: 'mescomp-' + type,
    titreDocument: info.titreDocument,
    intro: info.intro,
    avecIdentite: type === 'cv',
    ecrireCV: false,
    nomsInitiaux: (type === 'recommandation' && typeof nomsSignatureLettreCo === 'function') ? nomsSignatureLettreCo : undefined,
    rerender: mesCompRendrePage,
    onFermer: function () { _mesCompDepotOuvert = null; mesCompRendrePage(); },
    onDocumentPrepare: function (documentPrepare) {
      if (documentPrepare && documentPrepare.type === 'texte') {
        var r = mesCompDocumentsAjouter(mesCompOuvrir().documents, type, documentPrepare.valeur);
        if (r.ajoute) { mesCompOuvrir().documents = r.liste; }
      }
      _mesCompDepotOuvert = null;
      mesCompRendrePage();
    }
  };
}
function _mesCompDeposer(type) {
  if (!MESCOMP_DEPOTS[type] || typeof htmlDepotCVEnPage !== 'function') { return; }
  var etat = mesCompOuvrir();
  if (!mesCompPlaceDisponible(etat.documents, type)) { return; }
  _mesCompDepotOuvert = type;
  mesCompRendrePage();
}

function _mesCompHtmlSectionDocuments(etat, type, icone, numero, titre) {
  var info = MESCOMP_TYPES.filter(function (t) { return t.id === type; })[0];
  var liste = etat.documents.filter(function (d) { return d.type === type; });
  var lignes = liste.map(function (d, i) {
    return '<div class="d-flex align-items-center flex-wrap gap-2 border rounded p-2 mb-2" data-mc-doc="' + d.id + '" style="text-align:left;">' +
      '<span class="flex-grow-1"><strong>' + MESCOMP_DEPOTS[type].titreDocument + ' ' + (i + 1) + '</strong><br><span class="small text-muted">Relu et masqué par vous · ' + d.texte.length + ' caractères</span></span>' +
      '<span class="accordeon-badge-valide">&#10003; Déposé</span>' +
      '<button type="button" class="btn btn-sm btn-outline-secondary" data-mc-retirer="' + d.id + '">Retirer</button></div>';
  }).join('');
  var plein = !mesCompPlaceDisponible(etat.documents, type);
  var libelle = type === 'cv' ? 'Déposer un CV' : (type === 'lettreMotivation' ? 'Déposer une lettre de motivation' : 'Déposer une lettre de recommandation');
  return '<div class="cv-section"><h4>' + icone + ' ' + numero + '. ' + titre + ' <span class="small text-muted">(' + info.max + ' au plus)</span></h4>' +
    '<div id="mcListe_' + type + '">' + lignes + '</div>' +
    (_mesCompDepotOuvert === type && !plein
      ? '<div id="mcDepot_' + type + '">' + htmlDepotCVEnPage(_mesCompDepotCfg(type)) + '</div>'
      : '<button type="button" class="btn btn-primary" id="btnMcDeposer_' + type + '"' + (plein ? ' disabled title="Vous avez atteint le maximum."' : '') + '>' + libelle + '</button>') +
    (type === 'recommandation'
      ? '<div class="small mt-2" style="background:var(--accent-bg-subtle);border-radius:8px;padding:.5rem .8rem;text-align:left;"><strong>Pour protéger la personne qui l’a écrite</strong> : son nom et sa fonction sont à masquer à la relecture. Ils ne partent jamais chez l’assistant.</div>'
      : '') +
    '</div>';
}

function _mesCompHtmlDocuments(etat) {
  var aucun = etat.documents.length === 0;
  var cvConnu = (typeof cvDisponible === 'function') && cvDisponible();
  var vide = (aucun && !cvConnu)
    ? '<div class="cv-section" id="mcSansDocument"><h4>&#128237; Vous n’avez pas encore de document</h4>' +
      '<p>Pour repérer vos compétences, l’outil a besoin d’au moins un CV ou une lettre. Deux façons d’en avoir un :</p>' +
      '<div class="d-flex flex-wrap gap-2"><button type="button" class="btn btn-primary" id="btnMcVersCreerCv">Aller à « Créer un nouveau CV »</button>' +
      '<button type="button" class="btn btn-outline-primary" id="btnMcVersRecit">Aller à « À partir de mon récit »</button></div>' +
      '<p class="small text-muted mt-2 mb-0">Vous pouvez aussi déposer un document ici, même ancien.</p></div>'
    : '';
  var niveaux = MESCOMP_NIVEAUX_CHOIX.map(function (n) {
    var actif = etat.niveau === n.id;
    return '<button type="button" class="btn btn-sm ' + (actif ? 'btn-primary active' : 'btn-outline-primary') + '" data-mc-niveau="' + n.id + '" aria-pressed="' + actif + '">' + n.libelle + '</button>';
  }).join('');
  return '<p class="text-center text-muted">Déposez ce que vous avez. Un seul document suffit : plus il y en a, plus les lignes sont sûres.</p>' +
    vide +
    _mesCompHtmlSectionDocuments(etat, 'cv', '&#128196;', 1, 'Mes CV') +
    _mesCompHtmlSectionDocuments(etat, 'lettreMotivation', '&#9993;&#65039;', 2, 'Mes lettres de motivation') +
    _mesCompHtmlSectionDocuments(etat, 'recommandation', '&#128232;', 3, 'Mes lettres de recommandation') +
    '<div class="cv-section"><h4>&#127898;&#65039; 4. Le niveau du poste</h4>' +
    '<p class="small text-muted">Il règle les mots proposés : simples et concrets, ou plus techniques. Jamais plus haut que ce que vos documents montrent.</p>' +
    '<div class="d-flex flex-wrap gap-2" id="mcNiveaux">' + niveaux + '</div></div>' +
    '<div class="choix-ia-rappel-conf"><span>&#128274;</span><span><strong>Ce qui part chez l’assistant</strong> : vos documents relus et masqués, la consigne de l’outil et le niveau choisi. Rien d’autre.</span></div>';
}

mesCompEnregistrerPage('documents', {
  rendre: _mesCompHtmlDocuments,
  peutContinuer: function (etat) { return mesCompRaisonBlocageDocuments(etat.documents) === ''; },
  raisonBlocage: function (etat) { return mesCompRaisonBlocageDocuments(etat.documents); },
  cabler: function (etat) {
    if (_mesCompDepotOuvert && typeof cablerDepotCVEnPage === 'function') { cablerDepotCVEnPage(_mesCompDepotCfg(_mesCompDepotOuvert)); }
    ['cv', 'lettreMotivation', 'recommandation'].forEach(function (type) {
      var b = document.getElementById('btnMcDeposer_' + type);
      if (b) { b.addEventListener('click', function () { _mesCompDeposer(type); }); }
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-mc-retirer]'), function (b) {
      b.addEventListener('click', function () {
        var e = mesCompOuvrir();
        e.documents = mesCompDocumentsRetirer(e.documents, parseInt(b.getAttribute('data-mc-retirer'), 10));
        mesCompRendrePage();
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-mc-niveau]'), function (b) {
      b.addEventListener('click', function () { mesCompOuvrir().niveau = b.getAttribute('data-mc-niveau'); mesCompRendrePage(); });
    });
    var c = document.getElementById('btnMcVersCreerCv');
    if (c) { c.addEventListener('click', function () { naviguerVers('creer-cv'); }); }
    var r = document.getElementById('btnMcVersRecit');
    if (r) { r.addEventListener('click', function () { naviguerVers('decouverte-intro'); }); }
  }
});
