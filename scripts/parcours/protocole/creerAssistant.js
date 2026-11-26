/* Protocole : « Créer un nouveau CV », voie 1 « Avec l'assistant en ligne ». Parcours complet (objectif offre), puis variantes des six objectifs aux deux premiers écrans.
   Réponse de l'assistant SIMULÉE (format de prompts/cv.md). */
const REPONSE_CV = {
  titresProposes: ['Agent d’accueil polyvalent', 'Agent d’accueil et de gestion', 'Chargé d’accueil', 'Assistant d’accueil', 'Agent d’accueil administratif'],
  accrochesProposees: ['Agent d’accueil attentive, à l’aise avec le public.', 'Sens du service et organisation au quotidien.', 'Accueil chaleureux et gestion rigoureuse.', 'Polyvalente, je facilite le quotidien des équipes.', 'À l’écoute et fiable, je cherche un poste stable.'],
  pointsForts: ['Sens du contact', 'Organisation'], motsCles: ['accueil', 'standard'],
  recommandations: {
    typeCV: { valeur: 'specifique', justification: 'Poste précis visé.' }, postesRecommandes: ['Agent d’accueil'],
    experiencesAMettreEnAvant: [{ poste: 'Agent d’accueil', entreprise: 'Mairie de Bergerac', justification: 'Poste identique.', dateDebut: '2019-03', dateFin: '2024-06' }],
    competencesAValoriser: [{ competence: 'Accueil du public', justification: 'Cœur du poste.' }, { competence: 'Gestion du standard', justification: 'Utile.' }],
    competencesPersonnelles: [{ competence: 'Sens de l’écoute', justification: 'Relation client.' }], secteurProche: '', rubriquesMasquables: [],
    savoirFaireParExperience: [{ poste: 'Agent d’accueil', entreprise: 'Mairie de Bergerac', missions: ['Accueillir et orienter le public', 'Tenir le standard', 'Enregistrer les demandes', 'Renseigner sur les démarches', 'Gérer le courrier'] }],
    formationRetenue: { intitule: '', justification: '', missions: [] }, certificationsAMettreEnAvant: []
  }
};

async function choisirObjectif(a, re) { return a.clic('.carte-objectif', re); }

async function parcoursComplet(a, j) {
  await a.aller('creer-cv');
  await a.verifier({ h1: 'Créer un nouveau CV' });
  j.info('Départ : bouton de la voie 1 : ' + await a.clic('#btnCreerCvAvecAssistant'));
  await a.attendre(900);
  await require('./reprendreCv.js').passerChoixMissions(a, j, 'assistant');
  let e = await a.verifier({ hash: '#objectif', etape: 'Votre objectif' });
  if (!/grisé/.test(e.avant || '')) { j.ko('objectif : « Continuer » devrait être grisé tant qu\'aucun objectif n\'est choisi (état : ' + e.avant + ')'); } else { j.ok('objectif : « Continuer » grisé au départ'); }
  if (!e.raison) { j.ko('objectif : aucune raison affichée à côté du « Continuer » grisé'); }
  await choisirObjectif(a, 'Répondre à une offre');
  await a.saisir('#rechercheMetierCibleInput', 'agent d’accueil'); await a.attendre(700);
  { let ch = await a.clic('[data-metier-cible-direct]'); if (ch !== 'ok') { ch = await a.clic('#btnValiderMetierSaisi'); } j.info('métier choisi dans les propositions : ' + ch); await a.attendre(700); }
  e = await a.verifier({ hash: '#objectif' });
  if (/grisé/.test(e.avant || '')) { j.ko('objectif : « Continuer » reste grisé après le choix du métier et du domaine (' + e.raison + ')'); }
  await a.suiv();
  e = await a.verifier({ hash: '#projet', etape: 'Vos informations' });
  // Décision de Denis (11/11/2026, consigne 255, étendue à l'assistant) : « Continuer » grisé, avec la raison, tant que « Vous » n'est pas rempli et qu'aucun bloc d'expériences n'a de contenu.
  if (!/grisé/.test(e.avant || '') || !/partie « Vous »/.test(e.raison || '') || !/expériences professionnelles/.test(e.raison || '')) { j.ko('Vos informations : « Continuer » devrait être grisé avec la raison « Vous » + expériences : ' + e.avant + ' / ' + e.raison); } else { j.ok('Vos informations : « Continuer » grisé au départ, raison « ' + e.raison + ' »'); }
  // Données de départ : identité, une expérience, une formation (injectées, comme saisies à la main).
  await a.ev(() => {
    dossier.identite = Object.assign({}, dossier.identite, { civilite: 'Madame', prenom: 'Camille', nom: 'Martin', telephone: '06 12 34 56 78', email: 'camille.martin@exemple.fr', ville: 'Bergerac', codePostal: '24100' });
    dossier.experiences = [{ poste: 'Agent d’accueil', entreprise: 'Mairie de Bergerac', dateDebut: '2019-03', dateFin: '2024-06', missions: 'Accueil du public, standard.' }];
    dossier.formations = [{ intitule: 'BTS Support à l’action managériale', etablissement: 'Lycée Jean Moulin', annee: '2018' }];
    dossier.identiteEnregistree = true;    pageProjet();
  });
  await a.attendre(600);
  e = await a.verifier({ hash: '#projet' });
  if (/grisé/.test(e.avant || '')) { j.ko('Vos informations : « Continuer » reste grisé alors que « Vous » et une expérience sont remplis : ' + e.raison); } else { j.ok('Vos informations : « Continuer » actif une fois « Vous » et une expérience remplis'); }
  await a.allerRetour('Vos informations');
  await a.suiv();
  await a.verifier({ hash: '#votre-parcours', etape: 'Votre parcours' });
  {
    const rep = await a.accueilPuisPageCommune('reprise voie 1', 'creer-cv');
    j.info('page commune après être sorti en cours de voie 1 (depuis ' + rep.avant.hash + ') : ' + JSON.stringify(rep.boutons));
    const cont = rep.boutons.find((x) => /Continuer|Reprendre/.test(x) && /^btn/.test(x));
    if (!cont) { j.ko('reprise voie 1 : aucun bouton « Reprendre » sur la page commune alors que la voie 1 est commencée'); }
    else { await a.ev(() => { const b = [].slice.call(document.querySelectorAll('#app button')).filter((x) => /Continuer|Reprendre/.test(x.innerText) && window.__P.visible(x))[0]; b.click(); }); await a.attendre(1000); const ec = await a.ecran(); if (ec.hash !== rep.avant.hash) { j.ko('reprise voie 1 : « Continuer » ramène à ' + ec.hash + ' « ' + ec.h1 + ' » au lieu de ' + rep.avant.hash); } else { j.ok('reprise voie 1 : « Continuer » ramène à ' + ec.hash); } }
  }
  e = await a.ecran();
  if (!/grisé/.test(e.avant || '')) { j.ko('Votre parcours : « Continuer » devrait être grisé tant qu\'aucune case n\'est cochée'); } else { j.ok('Votre parcours : « Continuer » grisé sans case cochée, raison : « ' + e.raison + ' »'); }
  await a.ev(async () => {
    for (const ch of ['activites', 'actions', 'environnement', 'valeurs']) {
      const c = document.querySelector('#app .vp-carte[data-vp-champ="' + ch + '"]'); if (!c) { continue; }
      [].forEach.call(document.querySelectorAll('#app details'), (d) => { if (d.contains(c)) { d.open = true; } });
      c.click(); await window.__P.attente(400);
    }
  });
  e = await a.verifier({ hash: '#votre-parcours' });
  if (/grisé/.test(e.avant || '')) { j.ko('Votre parcours : « Continuer » reste grisé après une case cochée par question'); }
  await a.allerRetour('Votre parcours');
  await a.suiv();
  e = await a.verifier({ hash: '#revelation', etape: 'Votre profil' });
  // Offre sans entreprise : le message est affiché d'emblée, une seule action « Indiquer l'entreprise », bouton de droite « Continuer sans entreprise ».
  await a.allerRetour('Votre profil');
  e = await a.ecran();
  if (e.hash === '#revelation') {
    const encart = await a.ev(() => !!document.getElementById('encartEntrepriseManquante'));
    j.info('Votre profil : le message « entreprise non indiquée » est affiché dès l’arrivée : ' + encart);
    if (!encart) { j.ko('Votre profil : aucun message n’explique que le nom de l’entreprise manque'); }
    else {
      if (!/Continuer sans entreprise/.test(e.avant || '')) { j.ko('Votre profil : le bouton de droite devrait s’appeler « Continuer sans entreprise » (il s’appelle « ' + e.avant + ' »)'); }
      j.info('« Continuer sans entreprise » (barre du bas) : ' + await a.suiv()); await a.attendre(900);
    }
  }
  e = await a.verifier({ hash: '#assistant', etape: 'Assistant' });
  // Importer une réponse incomplète puis complète.
  let r = await a.coller('```json\n' + JSON.stringify(REPONSE_CV).slice(0, 400));
  e = await a.ecran();
  if (!/coupe|echec/.test(r)) { j.ko('assistant : une réponse coupée n\'est pas signalée (' + r + ')'); } else { j.ok('assistant : une réponse coupée est signalée (' + r + ')'); }
  if (!/grisé/.test(e.avant || '') && !/Voir mes propositions/.test(e.avant || '')) { /* l'état peut varier */ }
  const apresCoupe = await a.ev(() => { const x = document.getElementById('fcRacineActionIA'); return x ? { fc: [].slice.call(x.querySelectorAll('[data-fc]')).map((y) => y.getAttribute('data-fc') + ':' + y.innerText.trim().slice(0, 30)), texte: x.innerText.replace(/\s+/g, ' ').slice(0, 260) } : null; });
  j.info('après une réponse coupée : ' + JSON.stringify(apresCoupe));
  r = await a.coller('```json\n' + JSON.stringify(REPONSE_CV) + '\n```');
  if (r !== 'etat:recu') {
    const apres = await a.ev(() => { const x = document.getElementById('fcRacineActionIA'); return x ? { t: x.innerText.replace(/\s+/g, ' ').slice(0, 900), fc: [].slice.call(x.querySelectorAll('[data-fc]')).map((y) => y.getAttribute('data-fc') + ':' + y.innerText.trim().slice(0, 40)) } : null; });
    j.info('texte affiché après collage d’une réponse complète sur une réponse coupée : ' + JSON.stringify(apres));
    j.ko('assistant : coller une réponse COMPLÈTE après une réponse coupée échoue (la suite « n’a pas pu être jointe ») ; amélioration possible : utiliser le texte collé tel quel s’il est complet à lui seul');
    // Reprise propre : le bouton de reprise s'il existe, sinon on rouvre la zone.
    const rep = await a.ev(() => { const x = document.getElementById('fcRacineActionIA'); const b = x && x.querySelector('[data-fc=retour], [data-fc=recommencer], [data-fc=reprendre]'); if (b) { b.click(); return b.getAttribute('data-fc'); } return 'AUCUN BOUTON DE REPRISE'; });
    j.info('reprise après échec : ' + rep);
    if (/AUCUN/.test(rep)) { j.ko('assistant : après un échec de collage, aucun bouton ne permet de reprendre à zéro dans la zone de collage'); }
    await a.attendre(600);
    r = await a.coller('```json\n' + JSON.stringify(REPONSE_CV) + '\n```');
    j.info('nouveau collage de la réponse complète : ' + r);
  }
  e = await a.verifier({ hash: '#assistant' });
  if (r !== 'etat:recu') { j.ko('assistant : une réponse complète n\'est pas reçue (' + r + ')'); }
  if (!/Voir mes propositions/.test(e.avant || '')) { j.ko('assistant : après réception le bouton du bas devrait être « Voir mes propositions » (état : ' + e.avant + ')'); }
  // De la réponse reçue jusqu'à « Vos documents » : on trace chaque écran traversé.
  const trace = [];
  for (let k = 0; k < 4; k++) {
    const s = await a.suiv(); e = await a.verifier(k === 0 ? { hash: '#assistant' } : null);
    trace.push(s + ' → ' + e.hash + ' « ' + e.h1 + ' » [barre : ' + (e.barre || 'aucune') + ']');
    if (/Vos documents/.test(e.h1)) { break; }
    if (e.hash === '#resultats' && /complément/i.test(e.h1)) {
      if (!e.barre) { j.ko('« ' + e.h1 + ' » : la barre d’étapes du parcours est absente à cet écran (tous les autres écrans du parcours en ont une)'); }
      await a.allerRetour('Complément');
    }
  }
  trace.forEach((t) => j.info('écran suivant : ' + t));
  e = await a.verifier({ hash: '#resultats', etape: 'Vos documents' });
  const doc = await a.ev(() => ({ exp: (document.body.innerText.match(/(\d+) expériences? affichées? sur (\d+)/) || [])[0], titre: !!document.querySelector('#app [id*=Apercu], #app .apercu-cv, #app iframe') }));
  j.info('Vos documents : ' + JSON.stringify(doc));
  const sansNom = await a.ev(() => { const l = [].slice.call(document.querySelectorAll('#app button')).filter((b) => window.__P.visible(b) && !window.__P.lib(b) && !b.querySelector('i, svg, img') && !b.getAttribute('aria-label')); const par = {}; l.forEach((b) => { const k = (b.className || '(sans classe)').split(' ').slice(0, 2).join('.') + ' | title=' + (b.title ? 'oui' : 'non'); par[k] = (par[k] || 0) + 1; }); return par; });
  j.info('boutons sans texte ni icône sur « Vos documents », par type : ' + JSON.stringify(sansNom));
  // Au-delà de « Vos documents » : on avance avec le bouton du bas pour voir où il mène.
  const avantValider = await a.ecran();
  j.info('Vos documents (CV non validé) : bouton « ' + avantValider.avant + ' »');
  await a.suiv();
  const valide = await a.ecran();
  const contenuValide = await a.ev(() => ({ boutons: [].slice.call(document.querySelectorAll('#app button, #app a.btn')).filter((b) => window.__P.visible(b)).map((b) => window.__P.lib(b)).filter(Boolean).slice(0, 40), texte: document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, 700) }));
  j.info('CV validé : bouton « ' + valide.avant + ' », boutons visibles : ' + JSON.stringify(contenuValide.boutons));
  j.info('CV validé : texte : ' + contenuValide.texte);
  if (!valide.retour) { j.ko('CV validé : pas de bouton « Retour » dans la barre du bas (le bouton de gauche s’appelle toujours « Retour »)'); } else { j.ok('CV validé : « Retour » présent dans la barre du bas'); }
  j.info('CV validé : « Retour » : ' + await a.retour()); await a.attendre(900);
  const modif = await a.ecran();
  if (modif.avant !== 'Valider le CV →') { j.ko('CV validé : « Retour » ne ramène pas à l’écran avec « Valider le CV » (bouton : ' + modif.avant + ')'); } else { j.ok('CV validé : « Retour » ramène à l’écran avant validation'); }

  e = await a.ecran();
  j.info('arrivée : ' + e.hash + ' « ' + e.h1 + ' »');
  // Retour en chaîne jusqu'à la page commune.
  const chemin = [];
  for (let i = 0; i < 9; i++) { await a.retour(); const x = await a.ecran(); chemin.push(x.hash.replace('#', '') + ':' + x.h1.replace(/[^\wÀ-ÿ ’']/g, '').trim()); if (x.hash === '#creer-cv') { break; } }
  j.info('chaîne des « Retour » depuis Vos documents : ' + chemin.join(' < '));
  if (chemin[chemin.length - 1] && !/^creer-cv/.test(chemin[chemin.length - 1])) { j.ko('la chaîne des Retour ne rejoint pas la page commune « Créer un nouveau CV » : ' + chemin.join(' < ')); }
}

// Variantes : les six objectifs, deux premiers écrans.
async function variantesObjectifs(a, j) {
  const objectifs = ['Répondre à une offre', 'Candidature spontanée', 'Changer de métier', 'Stage', 'Alternance', 'Formation'];
  for (const re of objectifs) {
    await a.ev(() => { try { _creerCvToutEffacer(); } catch (e) { /* rien */ } });
    await a.aller('creer-cv');
    await a.clic('#btnCreerCvAvecAssistant'); await a.attendre(700);
    await require('./reprendreCv.js').passerChoixMissions(a, j, 'assistant');
    await choisirObjectif(a, re);
    let e = await a.verifier({ hash: '#objectif' });
    j.info('objectif « ' + re + ' » : bouton « ' + e.avant + ' », raison « ' + e.raison + ' »');
    // Décision du 11/11/2026 (consigne 253) : stage et alternance exigent le métier ou le domaine visé, saisi sur cet écran (« Continuer » grisé, avec la raison) ; la formation n'exige rien de plus.
    if (re === 'Formation' && /grisé/.test(e.avant || '')) { j.ko('objectif « Formation » : « Continuer » grisé alors que rien d\'autre n\'est obligatoire'); }
    if (re === 'Alternance') {
      if (!/grisé/.test(e.avant || '') || !/métier ou le domaine visé/.test(e.raison || '')) { j.ko('objectif « Alternance » : « Continuer » devrait être grisé avec la raison « métier ou domaine visé » : ' + e.avant + ' / ' + e.raison); }
      await a.ev(() => { const c = document.getElementById('immPoste'); if (c) { c.value = 'Aide-soignant'; c.dispatchEvent(new Event('input', { bubbles: true })); } });
      await a.attendre(300);
      const apres = await a.verifier({ hash: '#objectif' });
      if (/grisé/.test(apres.avant || '')) { j.ko('objectif « Alternance » : « Continuer » reste grisé alors que le métier est saisi : ' + apres.raison); } else { j.info('objectif « Alternance » : métier saisi, « Continuer » devient actif : ok'); }
    }
    // Changer d'objectif ne doit pas laisser de reste de l'objectif précédent.
    const suivant = objectifs[(objectifs.indexOf(re) + 1) % objectifs.length];
    await choisirObjectif(a, suivant);
    e = await a.verifier({ hash: '#objectif' });
    const actifs = await a.ev(() => [].slice.call(document.querySelectorAll('.carte-objectif--actif')).map((x) => x.innerText.split('\n')[0]));
    if (actifs.length !== 1 || !new RegExp(suivant.slice(0, 8)).test(actifs[0])) { j.ko('changer d\'objectif de « ' + re + ' » à « ' + suivant + ' » : cartes actives = ' + JSON.stringify(actifs)); }
  }
}

module.exports = { REPONSE_CV, nom: 'creerAssistant', jouer: async (a, j) => { await parcoursComplet(a, j); await variantesObjectifs(a, j); } };
