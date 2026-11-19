/* ============================================================
   Module « Explorer les métiers » : « Ma synthèse », ÉCRANS et GESTES.
   Créé le 18/11/2026 (étape A de docs/CHANTIER_MA_SYNTHESE_EXPLORER_LES_METIERS_2026-11-18.md). Maquette validée : docs/MAQUETTE_MA_SYNTHESE_EXPLORER_LES_METIERS_V10_2026-11-18.html.
   Charge après index.js (cmvEnregistrerAction) ; la logique pure est dans syntheseLogique.js (testée sous Node), les calculs de métiers dans logique.js.

   Règles tenues ici :
   - un métier retenu par passage, facultatif ; en retenir un autre remplace le premier ; jamais un « métier visé » (consigne 472) ;
   - le métier retenu est gardé sous la forme { nom, rome } : jamais une réponse du questionnaire ;
   - un seul bouton « Retenir » pour les trois passages : cette brique (synBoutonRetenir) est la source unique.
   ============================================================ */

var SYN_PASSAGES = [1, 2, 3];

function synEtat() {
  var e = cmvEtat();
  if (!e.synthese) { e.synthese = cmvEtatInitial().synthese; }
  if (!e.synthese.voirMasques) { e.synthese.voirMasques = {}; }   // A4b : métiers cachés par le filtre de formation, ouverts ou non, par passage
  if (!Array.isArray(e.synthese.parcours)) { e.synthese.parcours = []; }   // étape B : métiers exercés et compétences cochées (syntheseParcoursLogique.js)
  if (!e.synthese.aff) { e.synthese.aff = { reponses: {}, secteurs: [] }; }   // état relu d'un fichier de session : les réponses de départage ne s'y trouvent pas
  return e.synthese;
}

// « Ce que les tests ne disent pas » (A6) : niveau d'études (un seul, retoucher l'efface), accompagnement (un seul), compléments (plusieurs). Rien n'est obligatoire.
cmvEnregistrerAction('synNiveau', function (el) {
  var n = parseInt(el.getAttribute('data-val'), 10), s = synEtat();
  if (!SYN_NIVEAUX.some(function (x) { return x[0] === n; })) { return false; }
  s.niveau = (s.niveau === n) ? null : n;
  return true;
});
cmvEnregistrerAction('synSuivi', function (el) { var s = synEtat(); s.suivi = synChoisirUnique(s.suivi, el.getAttribute('data-val'), SYN_ACCOMPAGNEMENTS); return true; });
cmvEnregistrerAction('synComp', function (el) { var s = synEtat(); s.complements = synBasculerDansListe(s.complements, el.getAttribute('data-val'), SYN_COMPLEMENTS, SYN_PLAFONDS.complements); return true; });

// « Affiner mes métiers » (passage 3, A1b/A1d) : une réponse par question (la même touchée une seconde fois, ou « Peu importe », l'efface) ; trois secteurs au plus.
cmvEnregistrerAction('synAff', function (el) {
  var cle = el.getAttribute('data-cle'), val = el.getAttribute('data-val'), rep = synEtat().aff.reponses;
  if (!SYN_QUESTIONS_DEPARTAGE.some(function (q) { return q.cle === cle; })) { return false; }
  if (!val || val === 'peu' || rep[cle] === val) { delete rep[cle]; } else if (synOptionDe(SYN_QUESTIONS_DEPARTAGE.filter(function (q) { return q.cle === cle; })[0], val)) { rep[cle] = val; } else { return false; }
  return true;
});
cmvEnregistrerAction('synAffSect', function (el) {
  var nom = el.getAttribute('data-nom') || '', a = synEtat().aff, i = a.secteurs.indexOf(nom);
  if (!nom) { a.secteurs = []; return true; }
  if (i !== -1) { a.secteurs.splice(i, 1); return true; }
  if (a.secteurs.length >= SYN_MAX_SECTEURS_DEPARTAGE) { if (typeof afficherToast === 'function') { afficherToast('Trois secteurs au plus. Retirez-en un pour en choisir un autre.'); } return false; }
  a.secteurs.push(nom);
  return true;
});
// Filtre « formation que je suis prêt ou prête à faire » (A4b) : cache, ne classe jamais ; jamais gardé dans la disquette (se refait en un clic).
cmvEnregistrerAction('synFormation', function (el) { synEtat().formation = synFormationValide(el.getAttribute('data-val')); return true; });
cmvEnregistrerAction('synVoirMasques', function (el) { var s = synEtat(), p = el.getAttribute('data-passage'); s.voirMasques[p] = !s.voirMasques[p]; return true; });
cmvEnregistrerAction('synAffRaz', function () { synEtat().aff = { reponses: {}, secteurs: [] }; return true; });
function _synCle(passage) { return 'retenu' + passage; }
function synRetenu(passage) { return SYN_PASSAGES.indexOf(passage) === -1 ? null : (synEtat()[_synCle(passage)] || null); }

// Retient le métier à ce passage ; le retenir une seconde fois (même nom) le retire. Un autre métier remplace le premier.
function synBasculerRetenu(passage, nom, rome) {
  if (SYN_PASSAGES.indexOf(passage) === -1) { return false; }
  var texte = String(nom || '').replace(/\s+/g, ' ').trim().slice(0, 140);
  if (!texte) { return false; }
  var s = synEtat(), actuel = s[_synCle(passage)];
  if (actuel && synNormaliser(actuel.nom) === synNormaliser(texte)) { s[_synCle(passage)] = null; return true; }
  s[_synCle(passage)] = { nom: texte, rome: String(rome || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 10) };
  return true;
}

// Le bouton « Retenir pour ma synthèse » d'une carte de métier (passages 2 et 3 : geste du module ; passage 1 : geste de « Par un métier », attributs fournis par l'appelant).
function synBoutonRetenir(passage, nom, rome, attributs) {
  var r = synRetenu(passage), on = !!(r && synNormaliser(r.nom) === synNormaliser(nom));
  var a = attributs || ('data-cml="retenir" data-passage="' + passage + '" data-nom="' + cmvE(nom) + '" data-rome="' + cmvE(rome || '') + '"');
  return '<div class="cml-retenir"><button type="button" class="btn ' + (on ? 'btn-primary' : 'btn-outline-primary') + '" ' + a + ' aria-pressed="' + on + '">' +
    '<i class="bi ' + (on ? 'bi-bookmark-check-fill' : 'bi-bookmark-plus') + '" aria-hidden="true"></i> ' + (on ? 'Retenu pour ma synthèse' : 'Retenir pour ma synthèse') + '</button></div>';
}

// Garder la synthèse dans la disquette (tâche A8). En la gardant, les résultats déjà obtenus aux passages 2 et 3 sont gardés aussi
// (ce sont les gestes « Garder mon résultat » de ces passages) ; la retirer ne touche que la synthèse, chaque passage garde son propre bouton.
function synBasculerGardee() {
  var s = synEtat(), e = cmvEtat();
  s.gardee = !s.gardee;
  if (s.gardee) {
    if (e.q && e.q.resultat) { e.q.garde = true; }
    if (typeof _cmaNombreChoix === 'function' && _cmaNombreChoix(e) > 0 && typeof cmvGarderChoix === 'function') {
      e.gardeChoix = null;
      cmvGarderChoix();
    }
  }
  return true;
}
cmvEnregistrerAction('synGarder', function () { return synBasculerGardee(); });

cmvEnregistrerAction('retenir', function (el) {
  return synBasculerRetenu(parseInt(el.getAttribute('data-passage'), 10), el.getAttribute('data-nom'), el.getAttribute('data-rome'));
});
