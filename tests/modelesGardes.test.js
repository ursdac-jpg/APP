const test = require('node:test');
const assert = require('node:assert/strict');
const mg = require('../modules/cv-modeles-gardes/logique.js');

// Les réglages réels relevés dans l'application le 25/10/2026 (dossier.pdfReglages : 142 clés ; dossier.reglagesMiseEnPageCV : 74 clés, puis 80 après un choix de couleur ou de forme).
const CLES_PDF_RELEVEES = ('echelle regSobreActif regCreatifActif regFormatCV regSansAccroche regLettreJointe regRegroupementActif regOrdreExperiences regFormatExperiences regColonnes ' +
  'regFormationsMisesEnAvant regColonnesInversees regFormeColonnes regColonneBordDroit regColonneArche regColonneForme regBordBandeauSens regColonneSens regTexteHors regTexteHorsPerso ' +
  'regBandeauTeinte regColonneTeinte regBordBandeau regSeparateurColonnes regCouleurDebut regCouleurFin regFondColonnes regFondColonnesEffet regDegradeColonnes regFondColonnePleineHauteur ' +
  'regFondColonnesA5 regEnteteInverseeA5 regRemplirPageA5 regBandeauEnTete regFormeEnTete regDegradeBandeau regBandeauDisponibilite regDispositionEntete regPositionLibreEntete regAnneauPhoto ' +
  'regStyleTitres regLectureGuidee regStyleProfessionnel regStylePersonnel regStyleFormations regSeparateurMissions regSoulignerPoste regItaliquePoste regSoulignerDates regItaliqueDates ' +
  'regSoulignerEntreprise regItaliqueEntreprise regStyleBordures regStyleCompetences regCouleurFondCompetences regCouleurTextePuces regIcones regIconesCoordonnees regPolice regTexteFondColonnes ' +
  'regBandeauCompetencesCles regCoinsArrondis ordrePersonnalise creatifVariante sobreVariante echellesRubriques enteteBoost policesRubriques stylesPuceRubriques positionsEntete hauteurEntete ' +
  'stylesTexteEntete rubriquesForceesColonne textesEdites modePresentation experiencesTout experiencesChoisies missionsParExperience missionsChoisies missionsGlobal afficherLieuExp afficherDuree ' +
  'lieuDansMarge nomEmpattement traitVertical coinCouleur formesDeco composition compositionTrait croisement decor enteteMin qualitesMetierActives afficherCompPro afficherCompComp styleLieuExp ' +
  'positionDatesExp positionDatesChoisie datesAlignees positionDatesFormations positionDatesPerso afficherMissionsFormation espacementFormations competencesProMax competencesComportementalesMax ' +
  'competencesEnHaut colonnesAvantModele competencesRetirees rubriquesRetirees missionsRetirees historiqueRetraits ordreExperiencesMien ordreFormationsMien ordreFormations ordreExpPersoMien ' +
  'ordreExpPerso certifsRubrique ordreMissions reglagesRubriquesMq enteteLibreMq enteteDecaleeAuto enteteParModele cleModeleEntete avantA5 formatPrecedent textesEditesMq choixMq formationsAvantExp ' +
  'titresAgrandis organisationPerso ordrePersoRubriques experiencePersoTout experiencePersoChoisies missionsParExpPerso missionsChoisiesExpPerso texteParExpPerso expPersoModeAffichage formationsTout ' +
  'formationsChoisies missionsParFormation missionsChoisiesFormation texteParFormation').split(' ');
const CLES_MEP_RELEVEES = ('format colonnes taille densite interligne espacementParas marges alignement pages colonnesInversees largeurColonneGauche formeColonnes separateurColonnes separateurCouleur ' +
  'fondColonnesA5 enteteInverseeA5 remplirPageA5 echelleA5 accent accentClair nuance couleurEntrepriseActive fondColonnes fondColonnesEffet fondColonnePleineHauteur degradeColonnes texteFondColonnes ' +
  'couleurFondCompetences couleurTextePuces bandeauEnTete formeEnTete degradeBandeau bandeauDisponibilite dispositionEntete anneauPhoto positionLibreEntete largeurAccrocheLibre largeurMetierLibre police ' +
  'styleTitres lectureGuidee styleCompetences icones iconesCoordonnees styleBordures styleProfessionnel stylePersonnel styleFormations separateurMissions bandeauCompetencesCles coinsArrondis souligner ' +
  'italique ordreExperiences ordreDatesPoste accrocheItalique sansAccroche lettreJointe regroupement formatExperiences formationsMisesEnAvant veuves rubriques ordreRubriques blocMisEnAvant ' +
  'blocMisEnAvantGauche blocMisEnAvantDroite allure formations _baseApplique ' +
  // apparus après un choix de couleur ou de forme (relevés dans l'essai navigateur du 25/10/2026)
  'baseCouleur _couleurChoisie dernieresCouleurs bordBandeau bordBandeauSens _pillAvant').split(' ');

test('chaque réglage relevé est classé, une seule fois : style ou contenu (jamais les deux)', () => {
  const pdf = {}, mep = {};
  CLES_PDF_RELEVEES.forEach(k => { pdf[k] = 1; });
  CLES_MEP_RELEVEES.forEach(k => { mep[k] = 1; });
  assert.deepEqual(mg.mgClesNonClassees(pdf, mep), { pdf: [], mep: [] });
  mg.MG_CLES_PDF_STYLE.forEach(k => assert.equal(mg.MG_CLES_PDF_CONTENU.indexOf(k), -1, 'pdf : ' + k + ' est classé deux fois'));
  mg.MG_CLES_MEP_STYLE.forEach(k => assert.equal(mg.MG_CLES_MEP_CONTENU.indexOf(k), -1, 'mep : ' + k + ' est classé deux fois'));
  assert.equal(new Set(mg.MG_CLES_PDF_STYLE).size, mg.MG_CLES_PDF_STYLE.length);
  assert.equal(new Set(mg.MG_CLES_MEP_STYLE).size, mg.MG_CLES_MEP_STYLE.length);
});

test('une clé nouvelle : style par défaut pour le modèle canonique, signalée et non rapportée pour le moteur PDF', () => {
  const inconnues = mg.mgClesNonClassees({ regPolice: 'arial', regNouveau: 1, nouvelleCle: 1 }, { accent: '#fff', colonneForme: 'arche', _etatInterne: 2 });
  assert.deepEqual(inconnues, { pdf: ['nouvelleCle'], mep: ['_etatInterne'] });
  const style = mg.mgExtraireStyle({ regPolice: 'arial', regNouveau: 1, nouvelleCle: 1 }, { accent: '#fff', colonneForme: 'arche', _etatInterne: 2, _couleurChoisie: true, rubriques: { x: 1 } });
  assert.deepEqual(style, { pdf: { regPolice: 'arial', regNouveau: 1 }, mep: { accent: '#fff', colonneForme: 'arche', _couleurChoisie: true } });
});

test('le style rapporté ne contient jamais le contenu de la personne', () => {
  const pdf = {
    regPolice: 'georgia', regCouleurDebut: '#7d2e43', composition: 'x', experiencesChoisies: [0, 2], missionsRetirees: ['a'], competencesRetirees: ['b'],
    textesEdites: { exp0: 'texte corrigé' }, ordrePersonnalise: ['formations'], regSansAccroche: true, regFormatCV: 'A5', choixMq: { margePage: 14, intitulesPerso: { exp: 'Mon parcours' } }
  };
  const mep = { accent: '#7d2e43', police: 'georgia', sansAccroche: true, rubriques: { loisirs: false }, formations: 'optimise', format: 'A5', _baseApplique: true };
  const s = mg.mgExtraireStyle(pdf, mep);
  assert.deepEqual(Object.keys(s.pdf).sort(), ['choixMq', 'composition', 'regCouleurDebut', 'regPolice']);
  assert.deepEqual(s.pdf.choixMq, { margePage: 14 });
  assert.deepEqual(Object.keys(s.mep).sort(), ['accent', 'police']);
  assert.deepEqual(pdf.choixMq.intitulesPerso, { exp: 'Mon parcours' }, 'l\'original n\'est pas modifié');
});

test('poser un style sur un vrai CV : le contenu reste, le style change, rien n\'est modifié sur place', () => {
  const pdfReel = { regPolice: 'arial', experiencesChoisies: [1], missionsRetirees: ['m'], textesEdites: { a: 'x' }, regSansAccroche: true };
  const mepReel = { accent: '#2f6690', rubriques: { loisirs: false }, sansAccroche: true, formations: 'optimise', _baseApplique: true };
  const avant = JSON.stringify([pdfReel, mepReel]);
  const r = mg.mgAppliquerStyle(pdfReel, mepReel, { pdf: { regPolice: 'georgia', composition: 'ruban' }, mep: { accent: '#7d2e43' } });
  assert.equal(r.pdf.regPolice, 'georgia');
  assert.equal(r.pdf.composition, 'ruban');
  assert.deepEqual(r.pdf.experiencesChoisies, [1]);
  assert.deepEqual(r.pdf.missionsRetirees, ['m']);
  assert.equal(r.pdf.regSansAccroche, true);
  assert.equal(r.mep.accent, '#7d2e43');
  assert.deepEqual(r.mep.rubriques, { loisirs: false });
  assert.equal(r.mep.formations, 'optimise');
  assert.equal(r.mep._baseApplique, false);
  assert.equal(JSON.stringify([pdfReel, mepReel]), avant);
});

test('un style qui porterait du contenu n\'en pose pas sur le vrai CV', () => {
  const r = mg.mgAppliquerStyle({ experiencesChoisies: [3] }, {}, { pdf: { experiencesChoisies: [0, 1, 2], regPolice: 'georgia' }, mep: { rubriques: { loisirs: true } } });
  assert.deepEqual(r.pdf.experiencesChoisies, [3]);
  assert.equal(r.pdf.regPolice, 'georgia');
  assert.equal(r.mep.rubriques, undefined);
});

test('la signature d\'un style ne dépend pas de l\'ordre des clés', () => {
  const a = { pdf: { regPolice: 'arial', composition: 'x' }, mep: { accent: '#fff', police: 'arial' } };
  const b = { mep: { police: 'arial', accent: '#fff' }, pdf: { composition: 'x', regPolice: 'arial' } };
  assert.equal(mg.mgSignature(a), mg.mgSignature(b));
  assert.equal(mg.mgMemeStyle(a, b), true);
  assert.equal(mg.mgMemeStyle(a, { pdf: { regPolice: 'georgia' }, mep: {} }), false);
});

test('la liste : cinq modèles au plus, pas de doublon, retrait', () => {
  let liste = [];
  for (let i = 0; i < 5; i++) {
    const r = mg.mgAjouter(liste, 'Modèle ' + i, { pdf: { regPolice: 'p' + i }, mep: {} });
    assert.equal(r.ok, true);
    liste = r.liste;
  }
  assert.equal(liste.length, 5);
  assert.equal(mg.mgListePleine(liste), true);
  const plein = mg.mgAjouter(liste, 'Sixième', { pdf: { regPolice: 'autre' }, mep: {} });
  assert.deepEqual([plein.ok, plein.raison, plein.liste.length], [false, 'plein', 5]);
  const doublon = mg.mgAjouter(liste, 'Encore', { pdf: { regPolice: 'p2' }, mep: {} });
  assert.deepEqual([doublon.ok, doublon.raison, doublon.modele.nom], [false, 'deja', 'Modèle 2']);
  const apres = mg.mgRetirer(liste, liste[0].id);
  assert.equal(apres.length, 4);
  const reajoute = mg.mgAjouter(apres, 'Neuf', { pdf: { regPolice: 'neuf' }, mep: {} });
  assert.equal(reajoute.ok, true);
  assert.equal(new Set(reajoute.liste.map(m => m.id)).size, 5, 'les identifiants restent uniques');
});

test('une liste enregistrée est relue avec prudence', () => {
  assert.deepEqual(mg.mgNormaliserListe(null), []);
  assert.deepEqual(mg.mgNormaliserListe('x'), []);
  const l = mg.mgNormaliserListe([{ id: 'a', nom: 'A', style: { pdf: { regPolice: 'x' }, mep: {} } }, { id: 'a', style: {} }, { nom: 'sans id', style: {} }, null, { id: 'b' }]);
  assert.equal(l.length, 1);
  assert.equal(l[0].id, 'a');
  const six = []; for (let i = 0; i < 8; i++) { six.push({ id: 'i' + i, nom: 'N', style: { pdf: {}, mep: {} } }); }
  assert.equal(mg.mgNormaliserListe(six).length, 5);
});

test('le CV d\'exemple est fictif, complet et indépendant à chaque appel', () => {
  const a = mg.mgContenuExemple(), b = mg.mgContenuExemple();
  a.experiences[0].poste = 'modifié';
  assert.notEqual(b.experiences[0].poste, 'modifié');
  assert.ok(a.experiences.length >= 3 && a.formations.length >= 1 && a.competencesCV.length >= 3);
  assert.match(a.identite.email, /exemple\.fr$/);
  assert.match(a.photo.url, /^data:image\/svg\+xml/);
  const d = mg.mgRemplirDossierExemple({ ia: {} });
  assert.equal(d.modeCreation, 'nouveau');
  assert.equal(d.formatCV, 'pdf');
  assert.ok(d.ia.cv.profil.length > 10);
  assert.equal(d.identite.nom, 'Martin');
});

test('la photo d\'exemple est une silhouette sans visage', () => {
  const svg = decodeURIComponent(mg.MG_PHOTO_EXEMPLE.split(',')[1]);
  assert.match(svg, /circle/);
  assert.doesNotMatch(svg, /eye|mouth|smile/i);
});
