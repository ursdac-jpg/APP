/* Protocole : « Créer un nouveau CV », voie 3 « Commencer à la main » (sans assistant en ligne). */
async function jouer(a, j) {
  await a.aller('creer-cv');
  await a.verifier({ h1: 'Créer un nouveau CV' });
  j.info('départ direct voie 3 : ' + await a.clic('#btnCreerCvSansAssistant'));
  await a.attendre(900);
  let e = await a.verifier({ hash: '#objectif', etape: 'Votre objectif' });
  if (!/grisé/.test(e.avant || '')) { j.ko('objectif : « Continuer » devrait être grisé tant qu’aucun objectif n’est choisi (' + e.avant + ')'); } else { j.ok('objectif : « Continuer » grisé au départ, raison « ' + e.raison + ' »'); }
  j.info('objectif : ' + await a.clic('.carte-objectif', 'Répondre à une offre'));
  await a.saisir('#rechercheMetierCibleInput', 'agent d’accueil'); await a.attendre(700);
  j.info('métier saisi : ' + await a.clic('#btnValiderMetierSaisi'));
  j.info('domaine : ' + await a.clic('.carte-domaine-metier', 'Administration') + ' / ' + await a.clic('[data-domaine-metier-confirmer]'));
  e = await a.verifier({ hash: '#objectif' });
  if (/grisé/.test(e.avant || '')) { j.ko('objectif : « Continuer » reste grisé après le choix du métier et du domaine (' + e.raison + ')'); }
  await a.suiv();
  e = await a.verifier({ hash: '#projet', etape: 'Vos informations' });
  // Décision de Denis (11/11/2026, consigne 255) : « Continuer » grisé, avec la raison, tant que « Vous » n'est pas rempli et qu'aucun des deux blocs d'expériences n'a de contenu.
  if (!/grisé/.test(e.avant || '') || !/partie « Vous »/.test(e.raison || '') || !/expériences professionnelles/.test(e.raison || '')) { j.ko('Vos informations : « Continuer » devrait être grisé avec la raison « Vous » + expériences : ' + e.avant + ' / ' + e.raison); } else { j.ok('Vos informations : « Continuer » grisé au départ, raison « ' + e.raison + ' »'); }
  // « Vous » rempli seul : il manque encore une expérience (professionnelle ou autre).
  await a.ev(() => {
    dossier.identite = Object.assign({}, dossier.identite, { civilite: 'Madame', prenom: 'Camille', nom: 'Martin', telephone: '06 12 34 56 78', email: 'camille.martin@exemple.fr', ville: 'Bergerac', codePostal: '24100' });
    dossier.identiteEnregistree = true;    pageProjet();
  });
  await a.attendre(600);
  e = await a.verifier({ hash: '#projet' });
  if (!/grisé/.test(e.avant || '') || /partie « Vous »/.test(e.raison || '') || !/expériences professionnelles/.test(e.raison || '')) { j.ko('Vos informations : « Vous » rempli, il devrait rester seulement les expériences : ' + e.avant + ' / ' + e.raison); } else { j.ok('Vos informations : « Vous » rempli, raison « ' + e.raison + ' »'); }
  await a.ev(() => {
    dossier.identite = Object.assign({}, dossier.identite, { civilite: 'Madame', prenom: 'Camille', nom: 'Martin', telephone: '06 12 34 56 78', email: 'camille.martin@exemple.fr', ville: 'Bergerac', codePostal: '24100' });
    dossier.experiences = [{ poste: 'Agent d’accueil', entreprise: 'Mairie de Bergerac', dateDebut: '2019-03', dateFin: '2024-06', missions: 'Accueil du public, standard.' }];
    dossier.formations = [{ intitule: 'BTS Support à l’action managériale', etablissement: 'Lycée Jean Moulin', annee: '2018' }];
    pageProjet();
  });
  await a.attendre(600);
  e = await a.verifier({ hash: '#projet' });
  if (/grisé/.test(e.avant || '')) { j.ko('Vos informations : « Continuer » reste grisé alors que « Vous » et une expérience sont remplis : ' + e.raison); } else { j.ok('Vos informations : « Continuer » actif une fois « Vous » et une expérience remplis'); }
  await a.suiv();
  await a.verifier({ hash: '#votre-parcours', etape: 'Votre parcours' });
  if (process.env.REPRISE) { await require('./reprise.js').tester(a, j, 'reprise voie 3 (Créer)', 'creer-cv'); return; }
  e = await a.ecran();
  if (!/grisé/.test(e.avant || '')) { j.ko('Votre parcours : « Continuer » devrait être grisé tant qu’aucune case n’est cochée'); } else { j.ok('Votre parcours : « Continuer » grisé sans case cochée, raison « ' + e.raison + ' »'); }
  await a.ev(async () => {
    for (const ch of ['activites', 'actions', 'environnement', 'valeurs']) {
      const c = document.querySelector('#app .vp-carte[data-vp-champ="' + ch + '"]'); if (!c) { continue; }
      [].forEach.call(document.querySelectorAll('#app details'), (d) => { if (d.contains(c)) { d.open = true; } });
      c.click(); await window.__P.attente(400);
    }
  });
  e = await a.verifier({ hash: '#votre-parcours' });
  if (/grisé/.test(e.avant || '')) { j.ko('Votre parcours : « Continuer » reste grisé après une case cochée par question'); }
  await a.suiv();
  e = await a.verifier({ hash: '#revelation', etape: 'Votre profil' });
  // Décision de Denis (11/11/2026) : message dans la page dès l'arrivée, une seule action « Indiquer l'entreprise », bouton de droite « Continuer sans entreprise ».
  const encart = await a.ev(() => !!document.getElementById('encartEntrepriseManquante'));
  j.info('Votre profil : message « entreprise non indiquée » affiché dès l’arrivée : ' + encart + ', bouton de droite « ' + e.avant + ' »');
  if (encart) {
    if (!/Continuer sans entreprise/.test(e.avant || '')) { j.ko('Votre profil : le bouton de droite devrait s’appeler « Continuer sans entreprise » (il s’appelle « ' + e.avant + ' »)'); }
    j.info('« Continuer sans entreprise » (barre du bas) : ' + await a.suiv()); await a.attendre(900);
  }
  e = await a.ecran();
  j.info('après le profil : ' + e.hash + ' « ' + e.h1 + ' » bouton « ' + e.avant + ' »');
  await a.tracer(8, 'à la main');
  e = await a.ecran();
  j.info('arrivée : ' + e.hash + ' « ' + e.h1 + ' » barre : ' + e.barre);
  // Barre d'étapes : un clic sur une pastille déjà passée ramène à son écran.
  for (const cible of (process.env.PASTILLES ? ['Vos informations', 'Votre parcours', 'Votre profil'] : [])) {
    const r = await a.ev((c) => { const p = [].slice.call(document.querySelectorAll('.barre-etapes-bilan .pastille-etape-action, .barre-etapes-bilan .pastille-etape-action-courante')).filter((x) => x.innerText.indexOf(c) !== -1)[0]; if (!p) { return 'ABSENTE'; } p.click(); return 'ok'; }, cible);
    await a.attendre(900);
    const x = await a.ecran();
    if (r !== 'ok') { j.ko('barre d’étapes : la pastille « ' + cible + ' » est introuvable'); }
    else if (x.h1.indexOf(cible.replace('Vos ', '').replace('Votre ', '')) === -1 && x.h1.toLowerCase().indexOf(cible.toLowerCase().slice(5)) === -1) { j.ko('barre d’étapes : la pastille « ' + cible + ' » mène à « ' + x.h1 + ' »'); }
    else { j.ok('barre d’étapes : la pastille « ' + cible + ' » mène à « ' + x.h1 + ' »'); }
    if (cible !== 'Votre profil') { await a.suiv().catch(() => {}); await a.attendre(500); }
  }
  // Retour en chaîne jusqu'à la page commune.
  const chemin = [];
  for (let i = 0; i < 12; i++) {
    await a.retour(); await a.attendre(700);
    const x = await a.ecran();
    chemin.push(x.hash.replace('#', '') + ':' + String(x.h1).replace(/[^\wÀ-ÿ ’']/g, '').trim());
    if (x.hash === '#creer-cv' || x.hash === '#cv' || x.hash === '') { break; }
  }
  j.info('chaîne des « Retour » : ' + chemin.join(' < '));
  if (!/^creer-cv/.test(chemin[chemin.length - 1] || '')) { j.ko('voie 3 : la chaîne des « Retour » ne rejoint pas la page commune « Créer un nouveau CV » : ' + chemin.join(' < ')); } else { j.ok('voie 3 : les « Retour » successifs rejoignent la page commune en ' + chemin.length + ' pas'); }
}

module.exports = { nom: 'creerAlaMain', jouer };
