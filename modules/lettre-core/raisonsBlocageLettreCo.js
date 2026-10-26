/* ============================================================
   modules/lettre-core/raisonsBlocageLettreCo.js
   ------------------------------------------------------------
   raisonsBlocageLettreCo(etat) : ce qu'il reste a faire pour que le bouton
   « Choisir mon assistant » de la page « Preparer » de la lettre s'active.
   Renvoie une liste de groupes nominaux (« déposer votre CV »), vide quand
   tout est pret ; l'ecran les assemble en « Il reste à ... et à ... ».

   Regles validees par Denis le 23/10/2026 (cahier de la lettre, decision 10 et
   chantier objectif) : bloquent le CV (depose et relu), l'objectif, le metier
   ou le domaine vise, la situation actuelle, et pour la spontanee le choix
   « de façon generale » ou « entreprise precise » avec le nom de l'entreprise.
   Ne bloquent JAMAIS : site, offre, type de structure, personne qui recrute,
   lettre de recommandation, et pour une offre l'entreprise elle-meme
   (une offre sans offre devient une candidature spontanee).

   Fonction pure, testee en Node (tests/lettreCoreRaisonsBlocage.test.js) : aucune
   lecture de « dossier » ici, l'appelant (data/metiers.js) passe un etat simple.
   etat = { cvPresent, cvRelu, objectif, modeRecherche, metierCible, secteurCible,
            typeRecherche, forme, intituleDomaine, entreprise, situationActuelle }   (forme : voir formeCandidatureLettreCo, utile pour « changer de metier »)
   ============================================================ */

function raisonsBlocageLettreCo(etat) {
  var e = etat || {};
  var vide = function (v) { return !(v && String(v).trim()); };
  var raisons = [];
  if (!e.cvPresent) { raisons.push('déposer votre CV'); }
  else if (!e.cvRelu) { raisons.push('relire votre CV'); }
  else {
    if (!e.objectif) { raisons.push('choisir le type de candidature'); }
    else if (['offre', 'spontanee', 'reconversion'].indexOf(e.objectif) !== -1) {
      if (!e.modeRecherche) { raisons.push('dire si vous visez un métier précis ou plusieurs métiers d’un domaine'); }
      else if (e.modeRecherche === 'metier' && vide(e.metierCible)) { raisons.push('indiquer le métier visé'); }
      else if (e.modeRecherche === 'domaine' && vide(e.secteurCible)) { raisons.push('indiquer le domaine visé'); }
      // Etape c5 : avec « plusieurs metiers d'un domaine », la lettre porte UN intitule de poste (choisi ou ecrit) : il est exige.
      else if (e.modeRecherche === 'domaine' && vide(e.intituleDomaine)) { raisons.push('choisir l’intitulé de poste à mettre en avant'); }
      if (e.modeRecherche && e.objectif === 'spontanee') {
        if (!e.typeRecherche) { raisons.push('dire si vous vous adressez à une entreprise précise ou non'); }
        else if (e.typeRecherche === 'offre' && vide(e.entreprise)) { raisons.push('indiquer le nom de l’entreprise'); }
      }
      // Changer de metier (trois choix) : une offre ne bloque jamais, une entreprise precise sans offre exige son nom.
      if (e.modeRecherche && e.objectif === 'reconversion') {
        if (!e.typeRecherche) { raisons.push('dire si vous répondez à une offre, visez une entreprise précise ou cherchez de façon générale'); }
        else if (e.forme === 'entreprise' && vide(e.entreprise)) { raisons.push('indiquer le nom de l’entreprise'); }
      }
    }
  }
  if (!e.situationActuelle) { raisons.push('indiquer votre situation actuelle dans « Adaptation au métier »'); }
  return raisons;
}

// Phrase affichee sous le bouton et en info-bulle (« Il reste à A et à B. »).
function phraseBlocageLettreCo(raisons) {
  if (!raisons || !raisons.length) { return ''; }
  var morceaux = raisons.map(function (r) { return 'à ' + r; });
  var dernier = morceaux.pop();
  return 'Il reste ' + (morceaux.length ? morceaux.join(', ') + ' et ' : '') + dernier + '.';
}

if (typeof module !== 'undefined') {
  module.exports = { raisonsBlocageLettreCo: raisonsBlocageLettreCo, phraseBlocageLettreCo: phraseBlocageLettreCo };
}
