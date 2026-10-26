// ============================================================
// exportBlocsTexteLettreEntretien.js
// ------------------------------------------------------------
// TACHE (simplification : DOCX seul + filet de secours, etendu a la
// lettre et l'entretien) : meme principe que exportBlocsTexteCV.js --
// texte simple, pret a copier-coller, memes donnees que les generateurs
// Word natifs correspondants.
// ============================================================

function genererBlocsTexteLettre(objetLettre) {
  var identite = objetLettre.identite || {};
  var lignes = [];
  lignes.push((identite.prenom || '') + ' ' + (identite.nom || ''));
  // Comme le Word : la rue seulement si la personne l'a choisie, code postal et ville toujours (destinataireLettreCo.js).
  var rueTexte = (typeof ligneRueLettreCo === 'function') ? ligneRueLettreCo(identite, objetLettre.inclureRue) : '';
  var villeTexte = (typeof ligneCodePostalVilleLettreCo === 'function') ? ligneCodePostalVilleLettreCo(identite) : (identite.ville || '');
  if (rueTexte) { lignes.push(rueTexte); }
  if (villeTexte) { lignes.push(villeTexte); }
  if (identite.telephone) { lignes.push(identite.telephone); }
  if (identite.email) { lignes.push(identite.email); }
  if (objetLettre.destinataire && objetLettre.destinataire.lignes && objetLettre.destinataire.lignes.length) {
    lignes.push('');
    objetLettre.destinataire.lignes.forEach(function (l) { lignes.push(l); });
  }
  lignes.push('');
  lignes.push(objetLettre.date || '');
  lignes.push('');
  if (objetLettre.objet) { lignes.push('Objet : ' + objetLettre.objet); lignes.push(''); }
  if (objetLettre.texte) { lignes.push(objetLettre.texte); }
  return lignes.join('\n');
}

function genererBlocsTexteEntretien(objetEntretien) {
  var identite = objetEntretien.identite || {};
  var lignes = [];
  function titre(texte) { lignes.push(''); lignes.push(texte.toUpperCase()); lignes.push('-'.repeat(texte.length)); }
  function puce(texte) { lignes.push('• ' + texte); }

  lignes.push("Préparation à l'entretien");
  lignes.push(((identite.civilite || '') + ' ' + (identite.prenom || '') + ' ' + (identite.nom || '')).trim());
  if (objetEntretien.metierVise) {
    lignes.push('Poste visé : ' + objetEntretien.metierVise + (objetEntretien.entreprise ? ' - ' + objetEntretien.entreprise : ''));
  }

  if (objetEntretien.presentation) { titre('Pour me présenter'); lignes.push(objetEntretien.presentation); }

  var points = (objetEntretien.pointsAPreparer || []).filter(Boolean);
  if (points.length) { titre('Points à préparer'); points.forEach(puce); }

  // q est un objet {question, pistes, amorce}, plus une simple chaine.
  var questions = (objetEntretien.questionsAnticipees || []).filter(function (q) { return q && q.question; });
  if (questions.length) {
    titre('Questions anticipées');
    questions.forEach(function (q) {
      puce(q.question);
      if (q.amorce) { lignes.push('  Amorce : ' + q.amorce); }
      (q.pistes || []).filter(Boolean).forEach(function (piste) { lignes.push('  - ' + piste); });
    });
  }

  var questionsCandidat = (objetEntretien.questionsDuCandidat || []).filter(Boolean);
  if (questionsCandidat.length) { titre('Questions à poser au recruteur'); questionsCandidat.forEach(puce); }

  return lignes.join('\n');
}
