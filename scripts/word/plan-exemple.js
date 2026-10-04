// Plan de page ecrit a la main (essai de l'ecrivain Word). Usage : node scripts/word/plan-exemple.js sortie.docx
const P = require('../../modules/cv-word/wordPaquet.js');
const fs = require('fs');
const run = (texte, o) => Object.assign({ texte, police: 'Arial', tailleDemiPts: 19, couleur: '1C2430' }, o || {});
const par = (runs, o) => Object.assign({ genre: 'paragraphe', runs, interligneExactPx: 17, apresPx: 2 }, o || {});
const plan = {
  version: 1, titre: 'CV essai', auteur: 'Camille Martin', langue: 'fr-FR',
  page: { largeurPx: 793.7, hauteurPx: 1122.5, margesPx: { haut: 38, bas: 30, gauche: 38, droite: 38 } },
  policeParDefaut: 'Arial', tailleParDefautDemiPts: 19,
  decorsPage: [{ genre: 'rect', xPx: 0, yPx: 0, lPx: 300, hPx: 1122.5, remplissage: { genre: 'uni', couleur: 'E0E8EE' }, ordreZ: 0 }],
  decorsPremierePage: [{ genre: 'polygone', xPx: 0, yPx: 0, lPx: 793.7, hPx: 150, points: [[0,0],[793.7,0],[793.7,110],[0,150]], remplissage: { genre: 'degrade', couleurs: ['2F6690', '93AAC6'], angleDeg: 0 }, ordreZ: 1 },
                       { genre: 'rectArrondi', xPx: 560, yPx: 40, lPx: 200, hPx: 60, rayonPx: 12, remplissage: { genre: 'uni', couleur: 'FFFFFF' }, contour: { couleur: '2F6690', epaisseurPx: 1.5 }, ordreZ: 2 }],
  flux: [
    par([run('Camille MARTIN', { tailleDemiPts: 40, gras: true, couleur: 'FFFFFF' })], { interligneExactPx: 34, niveauPlan: undefined }),
    par([run('Chargée de formation', { tailleDemiPts: 28, couleur: 'FFFFFF' })], { interligneExactPx: 26, apresPx: 60 }),
    { genre: 'tableau', largeursPx: [260, 30, 424], lignes: [{ cellules: [
      { largeurPx: 260, blocs: [par([run('COMPÉTENCES', { gras: true, capitales: true, couleur: '2F6690' })], { style: 'Titre1', bordures: { bas: { couleur: 'B9C4D2', epaisseurPx: 1 } }, avantPx: 8 }),
        par([run('• Animation de groupes')], { retraitGauchePx: 12, retraitPremierPx: -12 }), par([run('• Accompagnement individuel')], { retraitGauchePx: 12, retraitPremierPx: -12 })] },
      { largeurPx: 30, blocs: [] },
      { largeurPx: 424, blocs: [par([run('EXPÉRIENCE PROFESSIONNELLE', { gras: true, capitales: true, couleur: '2F6690' })], { style: 'Titre1', bordures: { bas: { couleur: 'B9C4D2', epaisseurPx: 1 } } }),
        par([run('Conseillère en insertion', { gras: true }), run('\t2021 - 2024')], { tabulations: [{ posPx: 424, genre: 'droite' }] }),
        par([run('Association Tremplin, Limoges', { italique: true })]),
        par([run('Accompagnement individuel de demandeurs d’emploi en situation de fragilité : diagnostic des freins, construction du projet professionnel et mise en relation avec les entreprises.')], { alignement: 'justifie' })] }
    ] }] }
  ]
};
P.ecrireDocx(plan).then(b => { fs.writeFileSync(process.argv[2], b); console.log('ecrit', b.length, 'octets'); }).catch(e => { console.error(e); process.exit(1); });
