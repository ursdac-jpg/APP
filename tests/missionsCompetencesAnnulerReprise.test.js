const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const etape = require('../modules/missions-competences/etape.js');

// Dette B.70 n° 2 (consigne 340) : « Annuler » dans le formulaire d'une expérience de « Corriger mon CV » remet le dossier comme avant les clics du panneau « fiche du métier ».
const racine = path.join(__dirname, '..');
const ui = fs.readFileSync(path.join(racine, 'modules', 'missions-competences', 'ui.js'), 'utf8');
const app = fs.readFileSync(path.join(racine, 'js', 'app.js'), 'utf8');

function dossierDeDepart() {
  return {
    modeCreation: 'maj',
    experiences: [{ poste: 'Serveur', missions: 'Servir les clients\nEncaisser', idEtape: 'e1' }, { poste: 'Caissier', missions: 'Tenir la caisse', idEtape: 'e2' }],
    competencesCV: ['Rigueur'], savoirEtreCV: ['Rigueur'],
    etapeMC: etape.mcEtatVide(),
    ia: { cv: { recommandations: { savoirFaireParExperience: [{ poste: 'Serveur', missions: ['Servir les clients'] }] } } }
  };
}

test('la photo puis la restauration remettent missions, compétences, état de l\'étape et réponse de l\'assistant', () => {
  const d = dossierDeDepart();
  const avant = JSON.stringify(d);
  const photo = etape.mcPhotographierReprise(d, 0);
  // ce que font les clics du panneau
  d.experiences[0].missions = 'Servir les clients\nEncaisser\nConseiller les clients';
  d.experiences[0].idEtape = 'zz';
  d.experiences[1].missions = 'autre';
  d.competencesCV.push('Service en salle'); d.savoirsCV = ['Hygiène'];
  d.etapeMC.fiches = { e1: 'G1801' };
  d.ia.cv.recommandations.savoirFaireParExperience[0].missions = ['Conseiller les clients'];
  assert.ok(etape.mcRestaurerReprise(d, photo));
  assert.equal(JSON.stringify(d), avant, 'tout est revenu comme avant');
});

test('une liste absente au départ redevient absente (jamais une liste vide qui change le dossier)', () => {
  const d = dossierDeDepart();
  const photo = etape.mcPhotographierReprise(d, 0);
  d.savoirsCV = ['Hygiène'];
  etape.mcRestaurerReprise(d, photo);
  assert.ok(!('savoirsCV' in d));
});

test('une expérience supprimée ou ajoutée depuis la photo ne fait rien planter', () => {
  const d = dossierDeDepart();
  const photo = etape.mcPhotographierReprise(d, 0);
  d.experiences.push({ poste: 'Nouveau', missions: 'x' });
  assert.ok(etape.mcRestaurerReprise(d, photo));
  assert.equal(d.experiences[2].missions, 'x', 'l\'expérience ajoutée après la photo reste intacte');
  d.experiences.splice(0, 2);
  assert.doesNotThrow(() => etape.mcRestaurerReprise(d, photo));
  assert.equal(etape.mcRestaurerReprise(null, photo), false);
  assert.equal(etape.mcRestaurerReprise(d, null), false);
});

test('la photo est indépendante du dossier (copie, pas une référence)', () => {
  const d = dossierDeDepart();
  const photo = etape.mcPhotographierReprise(d, 0);
  d.competencesCV.push('X'); d.etapeMC.fiches = { a: 'b' };
  assert.deepEqual(photo.competencesCV, ['Rigueur']);
  assert.ok(!photo.etapeMC.fiches || !photo.etapeMC.fiches.a);
});

test('branchements : la photo est prise avant le premier clic ; Annuler la rend ; Valider la jette', () => {
  const verser = ui.slice(ui.indexOf('function _mcRepVerser'), ui.indexOf('function _mcRepFinir'));
  assert.ok(verser.indexOf('mcPhotographierReprise') > -1 && verser.indexOf('mcPhotographierReprise') < verser.indexOf('exp.missions ='), 'photo AVANT l\'écriture du texte du formulaire');
  assert.ok(ui.includes('function mcAnnulerReprise') && ui.includes('function mcValiderReprise'));
  const annuler = app.slice(app.indexOf("var btnAnnuler = document.getElementById('btnExpProAnnuler')"));
  assert.ok(annuler.slice(0, 600).includes('mcAnnulerReprise()'), '« Annuler » rend la photo avant de refermer');
  assert.ok(app.includes('mcValiderReprise(); }   // les changements du panneau'), '« Valider » garde les changements');
  assert.ok(app.includes('changer d\'expérience abandonne'), 'changer d\'expérience annule la précédente');
});
