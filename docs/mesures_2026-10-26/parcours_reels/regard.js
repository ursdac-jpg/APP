const pt = (s) => Object.assign({ titre: 'Titre', constat: 'Un constat.', lecture: 'Une lecture.', piste: 'Une piste.' }, s);
module.exports = { modeAnalyse: 'image', analyseImpossible: false, cvCourt: false, syntheseOuverture: 'Votre CV se lit sans effort.',
  axes: [{ id: 'positif', afficher: true, points: [pt({ piste: '' }), pt({ titre: 'B', piste: '' })] }, { id: 'coherence', afficher: true, points: [pt({ piste: 'Rapprocher le titre du poste visé.' })] },
    { id: 'message', afficher: true, points: [pt({ piste: 'Mettre une phrase d’accroche en haut.' })] }, { id: 'premiere-lecture', afficher: true, points: [pt({ piste: '' })] },
    { id: 'presentation', afficher: true, points: [pt({ piste: 'Aérer les marges.' })] }, { id: 'couleurs', afficher: true, points: [pt({ titre: 'Nombre de couleurs', piste: 'Se limiter à deux couleurs.' })] }],
  questionsLieesAuCv: [{ question: 'Pourquoi ce poste ?', origine: 'Parcours', ceQueLeRecruteurCherche: 'La cohérence du projet', commentYRepondre: 'Relier le parcours au poste.' }] };
