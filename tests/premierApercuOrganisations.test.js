const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

// Le panneau et le gabarit du CV sont des scripts de navigateur : on vérifie ici les règles écrites dans leur source
// (l'exécution réelle est vérifiée en navigateur, voir docs/CONSIGNES_DE_DENIS_A_SUIVRE.md, consigne 412).
const panneau = fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfPanneauReglages.js', 'utf8');
const gabarit = fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfTemplateMaquette.js', 'utf8');
const cartes = fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfCartesMaquette.js', 'utf8');

test('Par compétences : le premier aperçu écrit « Compétences en action » en lignes, plus de pastilles automatiques', () => {
  assert.ok(!gabarit.includes('themesEnHaut'));
  assert.ok(!gabarit.includes('blocProMissionsEnPastilles'));
  assert.ok(gabarit.includes('var actionCoteC = !!(modeParCompC && opts.actionCote === true && !deux);'));
  // La carte du panneau annonce la même disposition par défaut : pleine largeur sans choix.
  assert.ok(cartes.includes("var coteActuel = (choix.actionCote === true) ? 'cote' : 'large';"));
});

test('Par compétences et Mixte : l’expérience entre parenthèses est écrite dans les lignes (la case agit)', () => {
  assert.ok(gabarit.includes('opts.sourceExperience && it.illustrePar && it.illustrePar.length'));
});

test('Mixte : la page tient sur une seule page, les dernières missions de « Compétences en action » sont retirées comme en Par compétences', () => {
  assert.ok(gabarit.includes('if ((modeParCompC || modeMixteB) && opts.niveauDetail !== \'complet\' && opts.compCoupe > 0) {'));
  assert.ok(panneau.includes('(_cvPdfModePresentation !== "C" && _cvPdfModePresentation !== "B")'));
  assert.ok(panneau.includes('if (_cvPdfModePresentation === "B") { resultat = _pdfRaccourcirCompetencesAuto(format, resultat); }'));
});

test('Mesure de la page : l’en-tête a sa hauteur finale avant chaque mesure des boucles automatiques', () => {
  const debut = panneau.indexOf("'function _pdfInjecterResultat(resultat) {'");
  const fin = panneau.indexOf("'function _pdfPoserPoigneesCv() {'");
  assert.ok(debut > -1 && fin > debut);
  assert.ok(panneau.slice(debut, fin).includes('window.parent._pdfMqApresRendu(cvMesure)'));
});

test('Changement d’organisation : le resserrement léger est rejoué, jamais sur une taille réglée à la main', () => {
  assert.ok(panneau.includes('function _pdfResserrerApresChangementOrganisation() {'));
  assert.ok(panneau.includes('if (mode !== modeAvant) { _pdfResserrerApresChangementOrganisation(); }'));
  assert.ok(panneau.includes('if (_cvPdfEchelleManuelle || _cvPdfMiseEnPageEnCours) { return; }'));
  assert.ok(panneau.includes('_pdfPlancherEchelleAuto = _PDF_ECHELLE_PLANCHER_INITIAL;'));
  assert.ok(panneau.includes('var _cvPdfEchelleManuelle = false;'));
});

test('Mixte : une compétence déjà écrite dans « Compétences en action » n’est pas répétée en pastilles', () => {
  assert.ok(gabarit.includes('function competencesProSansDoublonAction() {'));
  assert.ok(gabarit.includes('var liste = competencesProSansDoublonAction();'));
});

test('Changement d’organisation : un resserrement automatique léger de l’organisation précédente est levé avant le nouveau rendu', () => {
  assert.ok(panneau.includes('if (mode !== modeAvant && !_cvPdfEchelleManuelle && _cvPdfEchelle < 1 && _cvPdfEchelle >= _PDF_ECHELLE_PLANCHER_INITIAL - 0.001) { _cvPdfEchelle = 1; }'));
});

test('Par compétences : la page se remplit avec des missions de réserve (2 par expérience au plus, jusqu’à environ 92 %), sans jamais écrire un choix de la personne', () => {
  assert.ok(panneau.includes('function _pdfRemplirMissionsReserveAuto(format, resultat) {'));
  assert.ok(panneau.includes('var cible = HAUTEUR_CIBLE_PX * 0.92;'));
  assert.ok(panneau.includes('if ((parExp[c.nom] || 0) >= 2) { continue; }'));
  assert.ok(panneau.includes('if ((_cvPdfChoixMq.reservesChoisies || []).length) { return resultat; }'));
  assert.ok(panneau.includes('return _pdfRemplirMissionsReserveAuto(format, resultat);'));
  assert.ok(panneau.includes('reservesAuto: _cvPdfReservesAuto,'));
  assert.ok(gabarit.includes('(opts.reservesAuto || []).indexOf(it.texte) === -1'));
  // Le message dit le fait mesuré (nombre de missions ajoutées) et où les retirer.
  assert.ok(cartes.includes('window._mepReservesAuto'));
});

test('Missions de certification : jamais affichées d’office, un message sous l’aperçu propose de les afficher quand elles existent', () => {
  assert.ok(gabarit.includes('window._mepMissionsFormationDispo = {'));
  assert.ok(gabarit.includes('affichees: !!opts.afficherMissionsFormation'));
  assert.ok(cartes.includes('function _mepMajAvisMissionsFormation() {'));
  assert.ok(cartes.includes("if (dispo.affichees || (!dispo.certifs && !dispo.formations))"));
  assert.ok(cartes.includes("_mepAppelerIframePdf('_pdfBasculerAfficherMissionsFormation');"));
  // Rien dans le panneau ne coche l'option automatiquement.
  assert.ok(panneau.includes("var _cvPdfAfficherMissionsFormation = null;"));
});

test('Afficher les missions des formations et des certifications : la page se resserre légèrement si elle déborde', () => {
  const debut = panneau.indexOf("'function _pdfBasculerAfficherMissionsFormation() {'");
  assert.ok(debut > -1);
  assert.ok(panneau.slice(debut, debut + 600).includes('if (_cvPdfAfficherMissionsFormation) { _pdfResserrerApresChangementOrganisation(); }'));
});

