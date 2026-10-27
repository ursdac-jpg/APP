module.exports = { analyseImpossible: false, cvPeuFourni: false, referenceFaible: false, texteCache: { suspect: false },
  dejaExprime: [{ terme: 'nettoyage de locaux', origine: 'fiche-metier' }],
  peutEtreFormuleAutrement: [{ terme: 'hygiène et sécurité', origine: 'fiche-metier', extraitCV: 'respect des protocoles d’hygiène', piste: 'Vous pouvez écrire « hygiène et sécurité » si c’est ce que vous faisiez.' }],
  pasRetrouve: [{ terme: 'autolaveuse', origine: 'fiche-metier', note: 'Ne l’ajoutez pas si vous ne l’avez pas utilisée.' }],
  aVerifier: [], changementsPrioritaires: [{ phraseCV: 'respect des protocoles d’hygiène', motReference: 'hygiène et sécurité', condition: 'si c’est bien ce que vous faisiez', experienceConcernee: 'Agent d’entretien' }],
  sansOffre: { motsClesPrioritaires: ['hygiène', 'sécurité', 'machines'], clarificationProjet: ['Est-ce bien ce métier que je vise ?'] }, sources: [] };
