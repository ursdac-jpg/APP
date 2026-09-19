/* ============================================================
   modules/coherence-transversale/collecte/hostDataAdapter.js
   ------------------------------------------------------------
   Seul fichier du module autorise a lire les donnees de l'application
   hote. Fonctions PROPRES a ce module (jamais un import de
   modules/bilan-candidature/collecte/hostDataAdapter.js -- objectif de
   portabilite, voir CONTRATS.md en-tete) meme si certaines lisent les
   memes globales que le Bilan (texteProfilEffectif, siteCibleActuel...).

   Design : lecteurs injectables (parametre optionnel), pour rester
   testable sans dependre de app.js -- meme principe deja eprouve par
   modules/bilan-candidature/collecte/hostDataAdapter.js.
   ============================================================ */

function ctLecteursParDefaut() {
  return {
    lireCv: function () {
      return typeof texteProfilEffectif === 'function' ? (texteProfilEffectif('cv') || '') : '';
    },
    lireEntrepriseCiblee: function () {
      return typeof entrepriseCibleActuelle === 'function' ? (entrepriseCibleActuelle() || '') : '';
    },
    // Phrase d'accroche du CV (dossier.ia.cv.profil), a l'usage EXCLUSIF
    // de la detection de duplication (analyse/verificationsDeterministes.js) --
    // texteProfilEffectif('cv') ne l'inclut jamais pour type === 'cv' (choix
    // deja documente ailleurs dans l'app), donc une lecture separee est
    // necessaire pour pouvoir la comparer au texte de la lettre.
    lireAccrocheCv: function () {
      return (typeof dossier !== 'undefined' && dossier.ia && dossier.ia.cv && dossier.ia.cv.profil) || '';
    },
    lireSiteEntreprise: function () {
      return typeof siteCibleActuel === 'function' ? (siteCibleActuel() || '') : '';
    },
    // TACHE (chantier "offre memorisee comme entreprise/site", 2026-08-25,
    // DECISION DE DENIS) : texte complet de l'offre, memorise dans
    // dossier.rechercheCandidature.texteOffre au meme titre que entreprise/
    // site (nouveau champ additif -- voir ui.js pour l'ecriture). Distinct
    // de lienOffreCibleActuel() (js/app.js), qui ne garde qu'un lien.
    lireTexteOffre: function () {
      return (typeof dossier !== 'undefined' && dossier.rechercheCandidature && dossier.rechercheCandidature.texteOffre) || '';
    },
    // Texte integral deja redige de la lettre de motivation (pas
    // seulement sa strategie -- accroche/arguments). La Cohérence
    // transversale compare des FORMULATIONS EXACTES (ex. duplication mot
    // pour mot entre CV et lettre) : il faut le texte reellement ecrit.
    lireLettreTexte: function () {
      return (typeof dossier !== 'undefined' && dossier.ia && dossier.ia.lettre && dossier.ia.lettre.lettre && dossier.ia.lettre.lettre.texte) || '';
    },
    // dossier.ia.entretien n'a jamais de champ "texte" unique -- c'est un
    // objet structure (presentation/pointsAPreparer/questionsAnticipees/
    // questionsDuCandidat, meme forme que le JSON de sortie de
    // prompts/entretien.md). Recompose ici un texte lisible, a l'usage
    // EXCLUSIF de ce module.
    lireEntretienTexte: function () {
      if (typeof dossier === 'undefined' || !dossier.ia || !dossier.ia.entretien) { return ''; }
      var e = dossier.ia.entretien;
      var texte = '';
      if (e.presentation) { texte += 'Présentation de début d’entretien :\n' + e.presentation + '\n\n'; }
      if (e.pointsAPreparer && e.pointsAPreparer.length) {
        texte += 'Points à préparer :\n' + e.pointsAPreparer.map(function (p) { return '- ' + p; }).join('\n') + '\n\n';
      }
      if (e.questionsAnticipees && e.questionsAnticipees.length) {
        texte += 'Questions anticipées et pistes de réponse :\n' + e.questionsAnticipees.map(function (q) {
          var ligne = '- ' + q.question;
          if (q.pistes && q.pistes.length) { ligne += ' (pistes : ' + q.pistes.join(', ') + ')'; }
          return ligne;
        }).join('\n') + '\n\n';
      }
      if (e.questionsDuCandidat && e.questionsDuCandidat.length) {
        texte += 'Questions prévues pour le recruteur :\n' + e.questionsDuCandidat.map(function (q) { return '- ' + q; }).join('\n');
      }
      return texte.trim();
    }
  };
}

// Retourne toujours la meme forme, champs a null si absents -- jamais
// undefined, jamais une cle manquante.
function ctLireDonneesBrutes(lecteurs) {
  lecteurs = lecteurs || ctLecteursParDefaut();
  return {
    cv: lecteurs.lireCv() || '',
    entrepriseCiblee: lecteurs.lireEntrepriseCiblee() || null,
    siteEntreprise: lecteurs.lireSiteEntreprise() || null,
    lettre: (lecteurs.lireLettreTexte && lecteurs.lireLettreTexte()) || null,
    preparationEntretien: (lecteurs.lireEntretienTexte && lecteurs.lireEntretienTexte()) || null,
    accrocheCv: (lecteurs.lireAccrocheCv && lecteurs.lireAccrocheCv()) || null,
    texteOffre: (lecteurs.lireTexteOffre && lecteurs.lireTexteOffre()) || null
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    ctLecteursParDefaut: ctLecteursParDefaut,
    ctLireDonneesBrutes: ctLireDonneesBrutes
  };
}
