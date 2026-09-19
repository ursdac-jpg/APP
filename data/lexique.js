/* ============================================================
   data/lexique.js
   ------------------------------------------------------------
   Corpus statique du module Lexique (nom provisoire, voir
   docs/MAQUETTE_LEXIQUE.md). Donnee de reference, jamais modifiee
   a l'execution -- meme statut que data/metiers.js. Source
   editoriale : docs/CORPUS_LEXIQUE.md. Modele de champs :
   docs/MAQUETTE_LEXIQUE.md section 3.

   Relations ("relations": voir-aussi / a-ne-pas-confondre) : une
   meme paire peut apparaitre declaree des deux cotes (heritage de
   la phase editoriale, chaque fiche ecrite pour elle-meme). C'est
   volontaire, pas une erreur a corriger ici -- voir
   modules/lexique/ARCHITECTURE_TECHNIQUE.md, "Robustesse a la
   declaration redondante" : le calcul de l'index inverse
   deduplique par identifiant de fiche cible, jamais par occurrence.
   ============================================================ */

var LEXIQUE_FICHES = [

  // -- Famille : Contrats et statuts d'emploi / Bulletin de salaire --

  {
    id: 'pmsmp', titre: 'PMSMP', titreDeTri: 'PMSMP', type: 'terme',
    univers: 'dispositifs', registres: ['langage-cip', 'langage-france-travail'],
    variantesRecherche: ['immersion en entreprise', 'essayer un métier'],
    corps: "Une PMSMP (période de mise en situation en milieu professionnel) permet de passer du temps dans une entreprise pour découvrir un métier, confirmer un projet professionnel ou initier une démarche de recrutement, sans jamais constituer un contrat de travail. La personne reste suivie par la structure qui l'accompagne pendant toute l'immersion.",
    relations: [
      { ficheId: 'cdi', type: 'a-ne-pas-confondre' }, { ficheId: 'cdd', type: 'a-ne-pas-confondre' },
      { ficheId: 'france-travail', type: 'voir-aussi' }, { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'stage-ou-pmsmp', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cdi', titre: 'CDI', titreDeTri: 'CDI', type: 'terme',
    univers: 'contrats-statuts-emploi', registres: ['langage-rh', 'langage-juridique'],
    variantesRecherche: ['contrat fixe', 'poste stable'],
    corps: "Un CDI (contrat à durée indéterminée) est un contrat de travail sans date de fin prévue à l'avance. Les autres formes de contrat (CDD, intérim...) se définissent souvent par comparaison avec lui.",
    relations: [
      { ficheId: 'cdd-ou-interim', type: 'voir-aussi' }, { ficheId: 'cdi-ou-cdd', type: 'voir-aussi' },
      { ficheId: 'periode-essai', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cdd', titre: 'CDD', titreDeTri: 'CDD', type: 'terme',
    univers: 'contrats-statuts-emploi', registres: ['langage-rh', 'langage-juridique'],
    variantesRecherche: ['contrat court'],
    corps: "Un CDD (contrat à durée déterminée) est un contrat de travail dont la fin est fixée à l'avance, généralement liée à un motif précis comme un remplacement ou un surcroît d'activité. Contrairement à l'intérim, l'employeur qui recrute est aussi celui qui emploie directement.",
    relations: [
      { ficheId: 'interim', type: 'a-ne-pas-confondre' }, { ficheId: 'cdi-ou-cdd', type: 'voir-aussi' },
      { ficheId: 'periode-essai', type: 'voir-aussi' }
    ]
  },
  {
    id: 'interim', titre: 'Intérim', titreDeTri: 'Intérim', type: 'terme',
    univers: 'contrats-statuts-emploi', registres: ['langage-rh', 'langage-juridique'],
    variantesRecherche: ["boîte d'intérim", "mission d'intérim"],
    corps: "L'intérim consiste à travailler pour une entreprise cliente tout en étant employé officiellement par une agence de travail temporaire. Chaque mission a une fin fixée à l'avance.",
    relations: [
      { ficheId: 'cdd', type: 'a-ne-pas-confondre' }, { ficheId: 'cdd-ou-interim', type: 'voir-aussi' }
    ]
  },
  {
    id: 'alternance', titre: 'Alternance', titreDeTri: 'Alternance', type: 'terme',
    univers: 'contrats-statuts-emploi', registres: ['langage-rh', 'langage-administratif'],
    variantesRecherche: ['apprentissage', 'travailler et étudier en même temps'],
    corps: "L'alternance associe une formation et une activité en entreprise, encadrées par un même contrat de travail. La personne partage son temps entre un organisme de formation et l'entreprise qui l'emploie.",
    relations: [
      { ficheId: 'stage', type: 'voir-aussi' }, { ficheId: 'mission-locale', type: 'voir-aussi' }, { ficheId: 'contrat-valorisation-experience', type: 'voir-aussi' }
    ]
  },
  {
    id: 'stage', titre: 'Stage', titreDeTri: 'Stage', type: 'terme',
    univers: 'contrats-statuts-emploi', registres: ['langage-administratif'],
    variantesRecherche: ['stage obligatoire'],
    corps: "Un stage permet de passer du temps en entreprise dans le cadre d'un cursus de formation, encadré par une convention plutôt que par un contrat de travail, même quand les tâches réalisées ressemblent à celles d'un salarié.",
    relations: [
      { ficheId: 'pmsmp', type: 'a-ne-pas-confondre' }, { ficheId: 'stage-ou-pmsmp', type: 'voir-aussi' },
      { ficheId: 'alternance', type: 'voir-aussi' }
    ]
  },
  {
    id: 'periode-essai', titre: "Période d'essai", titreDeTri: "Période d'essai", type: 'terme',
    univers: 'contrats-statuts-emploi', registres: ['langage-rh', 'langage-juridique'],
    variantesRecherche: ["temps d'essai", 'essai'],
    corps: "La période d'essai est un temps, situé au début d'un contrat de travail, pendant lequel l'employeur et la personne recrutée vérifient que le poste correspond à ce qui était attendu de part et d'autre. Y mettre fin pendant cette période obéit à des règles différentes de celles d'un contrat déjà confirmé.",
    relations: [
      { ficheId: 'cdi', type: 'voir-aussi' }, { ficheId: 'cdd', type: 'voir-aussi' },
      { ficheId: 'periode-essai-cote-employeur', type: 'voir-aussi' }
    ]
  },
  {
    id: 'periode-essai-cote-employeur', titre: "Période d'essai : pourquoi l'employeur y tient",
    titreDeTri: "Periode d'essai pourquoi l'employeur y tient", type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-employeur', 'langage-juridique'],
    variantesRecherche: ["rompre la période d'essai", "l'employeur peut-il arrêter l'essai"],
    corps: "Pour l'employeur, la période d'essai est le seul moment où il peut mettre fin au contrat sans suivre la procédure de licenciement : pas d'entretien préalable obligatoire, pas d'indemnité de licenciement. Sa durée maximale dépend de la catégorie du poste (plus courte pour un poste d'employé, plus longue pour un poste de cadre), et elle peut être renouvelée une fois si un accord le prévoit. C'est souvent ce qui pousse un employeur à tenter une embauche dans le doute : la période d'essai sert de filet de sécurité pour les deux parties, pas seulement pour la personne recrutée - et ce filet compte d'autant plus que la structure est petite, où une erreur de recrutement se voit tout de suite dans l'organisation du travail. Cette liberté n'est pas totale : une rupture peut être jugée abusive par le conseil de prud'hommes si son motif n'a rien à voir avec les compétences ou la manière de travailler de la personne. Un délai de prévenance (un préavis court) s'applique aussi dès que la personne a un peu d'ancienneté, même pendant l'essai.",
    relations: [
      { ficheId: 'periode-essai', type: 'voir-aussi' },
      { ficheId: 'conseil-de-prud-hommes', type: 'voir-aussi' }
    ]
  },
  {
    id: 'contrat-valorisation-experience',
    titre: "Contrat de valorisation de l'expérience (CVE)",
    titreDeTri: "Contrat de valorisation de l'experience CVE", type: 'terme',
    univers: 'contrats-statuts-emploi', registres: ['langage-juridique', 'langage-rh', 'langage-france-travail'],
    variantesRecherche: ['CVE', 'contrat senior', "embaucher un demandeur d'emploi de plus de 60 ans"],
    corps: "Le contrat de valorisation de l'expérience (CVE) est un contrat à durée indéterminée créé à titre expérimental par la loi du 24 octobre 2025 (jusqu'en 2030) pour faciliter l'embauche des demandeurs d'emploi de 60 ans et plus, ou de 57 ans si un accord de branche le prévoit. Il aide la personne à compléter ses trimestres jusqu'à la retraite à taux plein. Pour l'employeur, il ouvre une exonération partielle de cotisations sur l'indemnité de mise à la retraite, pendant trois ans.",
    relations: [
      { ficheId: 'cdi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'temps-partiel', titre: 'Temps partiel', titreDeTri: 'Temps partiel', type: 'terme',
    univers: 'contrats-statuts-emploi', registres: ['langage-rh'],
    variantesRecherche: ['mi-temps'],
    corps: "Un contrat à temps partiel prévoit une durée de travail inférieure à celle d'un temps complet, répartie selon un rythme précisé dans le contrat. Il peut concerner aussi bien un CDI qu'un CDD.",
    relations: [
      { ficheId: 'cdi', type: 'voir-aussi' }, { ficheId: 'cdd', type: 'voir-aussi' }, { ficheId: 'temps-partiel-choisi-ou-subi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cesu', titre: 'CESU (chèque emploi service universel)', titreDeTri: 'CESU cheque emploi service universel',
    type: 'terme', univers: 'contrats-statuts-emploi', registres: ['langage-administratif'],
    variantesRecherche: ['chèque emploi service', 'emploi chez un particulier', 'garde d’enfant CESU', 'aide à domicile CESU'],
    corps: "Le CESU permet à un particulier d'employer directement une personne à son domicile (ménage, garde d'enfant, aide à une personne âgée...) de façon simplifiée : pas de bulletin de paie à établir soi-même, cotisations calculées et prélevées automatiquement par l'Urssaf. Ce n'est pas un type de contrat en soi, c'est une façon de déclarer un salarié classique, avec les mêmes droits (congés payés, protection sociale). C'est très répandu dans les services à la personne, un secteur qui recrute beaucoup.",
    relations: [
      { ficheId: 'temps-partiel', type: 'voir-aussi' },
      { ficheId: 'bulletin-salaire', type: 'voir-aussi' },
      { ficheId: 'tese', type: 'voir-aussi' },
      { ficheId: 'pajemploi', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'salaire-brut', titre: 'Salaire brut', titreDeTri: 'Salaire brut', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif', 'langage-rh'],
    variantesRecherche: ['salaire avant impôts'],
    corps: "Le salaire brut est le montant du salaire avant que les cotisations sociales et l'impôt ne soient retirés. C'est le montant qui apparaît généralement en premier sur un bulletin de salaire.",
    relations: [
      { ficheId: 'salaire-net', type: 'a-ne-pas-confondre' }, { ficheId: 'bulletin-salaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'salaire-net', titre: 'Salaire net', titreDeTri: 'Salaire net', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif', 'langage-rh'],
    variantesRecherche: ['salaire reçu'],
    corps: "Le salaire net est le montant du salaire une fois les cotisations sociales et l'impôt retirés : la plupart du temps, le montant réellement versé sur le compte bancaire.",
    relations: [
      { ficheId: 'salaire-brut', type: 'a-ne-pas-confondre' }, { ficheId: 'bulletin-salaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'bulletin-salaire', titre: 'Comment lire son bulletin de salaire', titreDeTri: 'Bulletin de salaire',
    type: 'notion', gabarit: 'grille-lecture', univers: 'bulletin-salaire', registres: ['langage-administratif'],
    variantesRecherche: ['fiche de paie'],
    corps: "Un bulletin de salaire présente toujours, dans cet ordre logique : l'identité de l'employeur et du salarié, le poste occupé, le temps de travail sur la période, puis le détail du calcul entre salaire brut et salaire net. Certaines lignes, comme des primes, n'apparaissent que si elles concernent la situation de la personne.",
    relations: [
      { ficheId: 'salaire-brut', type: 'voir-aussi' }, { ficheId: 'salaire-net', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cotisations-sociales', titre: 'Cotisations sociales', titreDeTri: 'Cotisations sociales', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif'],
    variantesRecherche: ['charges sociales', "ce qu'on me retire du salaire"],
    corps: "Les cotisations sociales sont des sommes retirées du salaire brut pour financer des droits collectifs : assurance maladie, retraite, chômage, entre autres. Une partie est retirée du salaire de la personne, une autre est payée en plus par l'employeur, sans jamais apparaître sur le montant qui lui est versé.",
    relations: [
      { ficheId: 'salaire-brut', type: 'voir-aussi' }, { ficheId: 'salaire-net', type: 'voir-aussi' }, { ficheId: 'cout-employeur', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prelevement-source', titre: 'Prélèvement à la source', titreDeTri: 'Prélèvement à la source', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif'],
    variantesRecherche: ['impôt sur salaire', 'impôt prélevé directement'],
    corps: "Le prélèvement à la source est le retrait direct de l'impôt sur le revenu depuis le salaire, avant que la personne ne reçoive son salaire net. Il s'ajoute aux cotisations sociales mais reste distinct : les cotisations financent des droits collectifs, l'impôt finance l'État.",
    relations: [
      { ficheId: 'salaire-net', type: 'voir-aussi' }, { ficheId: 'cotisations-sociales', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'heures-supplementaires', titre: 'Heures supplémentaires', titreDeTri: 'Heures supplémentaires', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-rh', 'langage-administratif'],
    variantesRecherche: ['heures sup', 'heures en plus'],
    corps: "Les heures supplémentaires sont des heures travaillées au-delà de la durée normale prévue par le contrat, généralement rémunérées à un taux plus élevé que les heures habituelles. Elles apparaissent comme une ligne distincte sur le bulletin de salaire, jamais fondues dans le salaire de base.",
    relations: [
      { ficheId: 'bulletin-salaire', type: 'voir-aussi' }, { ficheId: 'primes', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'primes', titre: 'Prime', titreDeTri: 'Prime', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-rh'],
    variantesRecherche: ["prime de fin d'année", 'argent en plus sur la paie'],
    corps: "Une prime est une somme versée en plus du salaire de base, liée à une occasion précise : une performance, un objectif atteint, une période de l'année, entre autres. Contrairement au salaire de base, son versement n'est pas systématique : elle peut varier ou disparaître d'un mois à l'autre selon ce qui la déclenche.",
    relations: [
      { ficheId: 'bulletin-salaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'indemnites', titre: 'Indemnité', titreDeTri: 'Indemnité', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif'],
    variantesRecherche: ['indemnité de fin de contrat', 'remboursement compensation'],
    corps: "Une indemnité est une somme versée pour compenser une situation précise (un trajet, un repas, une fin de contrat, entre autres) plutôt que pour rémunérer du travail effectué. Elle se distingue d'une prime, qui récompense ou valorise quelque chose, et du salaire, qui rémunère du temps de travail.",
    relations: [
      { ficheId: 'bulletin-salaire', type: 'voir-aussi' }, { ficheId: 'primes', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'conges-payes', titre: 'Congés payés', titreDeTri: 'Congés payés', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif'],
    variantesRecherche: ['vacances payées', 'compteur de congés'],
    corps: "Les congés payés sont des jours d'absence prévus par le contrat de travail pendant lesquels le salaire continue d'être versé. Ils s'accumulent au fil du temps travaillé et apparaissent sur le bulletin de salaire sous forme de compteur, distinct du montant du salaire lui-même.",
    relations: [
      { ficheId: 'absences', type: 'voir-aussi' }, { ficheId: 'bulletin-salaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'absences', titre: 'Absence', titreDeTri: 'Absence', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif'],
    variantesRecherche: ['arrêt maladie sur la paie', 'jour non travaillé'],
    corps: "Une absence désigne toute période où la personne ne travaille pas alors qu'elle était prévue au planning : maladie, congé, absence non justifiée, entre autres. Selon son motif, elle peut être rémunérée en totalité, en partie, ou pas du tout, ce qui explique pourquoi deux absences peuvent avoir un effet très différent sur le montant du salaire.",
    relations: [
      { ficheId: 'bulletin-salaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'remboursement-frais', titre: 'Remboursement de frais', titreDeTri: 'Remboursement de frais', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif'],
    variantesRecherche: ['frais professionnels', 'note de frais'],
    corps: "Un remboursement de frais compense une dépense réellement engagée par la personne pour son travail : un déplacement, un repas, du matériel, entre autres. Il ne s'agit jamais d'une rémunération : c'est de l'argent déjà dépensé qui revient à la personne, pas un gain supplémentaire.",
    relations: [
      { ficheId: 'bulletin-salaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cumuls', titre: 'Cumuls', titreDeTri: 'Cumuls', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif'],
    variantesRecherche: ["total depuis le début de l'année", 'cumul annuel'],
    corps: "Les cumuls sont des totaux qui s'additionnent mois après mois sur le bulletin de salaire, par exemple le cumul du salaire brut ou du salaire net depuis le début de l'année. Ils permettent de suivre une évolution dans le temps, là où le reste du bulletin ne montre que le mois en cours.",
    relations: [
      { ficheId: 'bulletin-salaire', type: 'voir-aussi' }, { ficheId: 'salaire-brut', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cout-employeur', titre: 'Coût employeur', titreDeTri: 'Coût employeur', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-rh', 'langage-administratif'],
    variantesRecherche: ['ce que je coûte à mon employeur', 'salaire chargé'],
    corps: "Le coût employeur est le montant total que verse l'employeur pour employer une personne : le salaire brut, auquel s'ajoutent les cotisations sociales que l'employeur paie en plus, jamais visibles sur le bulletin remis à la personne. Il est toujours supérieur au salaire brut, parfois de façon significative. Ce coût est dû dès le premier jour et pour toute la durée du contrat, que la personne recrutée soit tout de suite pleinement opérationnelle ou qu'elle ait besoin d'un temps d'adaptation : c'est un engagement financier qui commence avant que le travail produit en retour soit certain. Dans une petite structure, ce poids se répartit sur moins de monde : une embauche qui ne se passe pas comme prévu a mécaniquement plus de conséquences visibles que dans une grande entreprise, où elle se dilue davantage. Concrètement, ce n'est pas la même chose partout : dans une exploitation agricole ou un commerce de proximité qui n'emploie que deux ou trois personnes, ce poids se sent tout de suite dans le quotidien ; dans une entreprise industrielle plus grande, le même risque se répartit sur davantage de postes et de monde. C'est aussi ce qui explique pourquoi le temps passé à recruter est vécu comme un investissement à ne pas rater, plutôt qu'une simple formalité.",
    relations: [
      { ficheId: 'salaire-brut', type: 'voir-aussi' },
      { ficheId: 'obligations-employeur-embauche', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cdd-ou-interim', titre: 'CDD ou intérim ?', titreDeTri: 'CDD ou intérim',
    type: 'notion', gabarit: 'comparatif', univers: 'contrats-statuts-emploi', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : dans les deux cas, le contrat a une fin prévue à l'avance, généralement liée à un motif précis. Ce qui les distingue : en CDD, l'employeur qui recrute est aussi celui qui emploie directement. En intérim, une agence de travail temporaire est l'employeur officiel, qui met la personne à disposition d'une entreprise cliente le temps de la mission.",
    relations: [
      { ficheId: 'cdi', type: 'voir-aussi' }, { ficheId: 'cdd', type: 'voir-aussi' }, { ficheId: 'interim', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cdi-ou-cdd', titre: 'CDI ou CDD ?', titreDeTri: 'CDI ou CDD',
    type: 'notion', gabarit: 'comparatif', univers: 'contrats-statuts-emploi', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : dans les deux cas, un contrat de travail lie directement l'employeur et le salarié, avec les mêmes droits de base. Ce qui les distingue : un CDI n'a pas de date de fin prévue à l'avance, un CDD en a toujours une, liée à un motif précis.",
    relations: [
      { ficheId: 'cdd-ou-interim', type: 'voir-aussi' }
    ]
  },
  {
    id: 'stage-ou-pmsmp', titre: 'Stage ou PMSMP ?', titreDeTri: 'Stage ou PMSMP',
    type: 'notion', gabarit: 'comparatif', univers: 'contrats-statuts-emploi', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : dans les deux cas, la personne passe du temps dans une entreprise sans être liée par un contrat de travail avec elle. Ce qui les distingue : un stage s'inscrit dans un cursus de formation, encadré par une convention de stage. Une PMSMP s'inscrit dans un accompagnement vers l'emploi, encadrée par la structure qui suit la personne.",
    relations: [
      { ficheId: 'stage', type: 'voir-aussi' }, { ficheId: 'pmsmp', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Accompagnement et insertion --

  {
    id: 'diagnostic-partage', titre: 'Diagnostic partagé', titreDeTri: 'Diagnostic partagé', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['faire le point avec mon conseiller'],
    corps: "Un diagnostic partagé est le moment où une personne accompagnée et son conseiller regardent ensemble sa situation (ce qui va, ce qui bloque, ce qui pourrait aider) pour construire une compréhension commune plutôt qu'un jugement porté par un seul des deux.",
    relations: [
      { ficheId: 'frein-emploi', type: 'voir-aussi' }, { ficheId: 'plan-action', type: 'voir-aussi' }, { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'frein-emploi', titre: "Frein à l'emploi", titreDeTri: "Frein à l'emploi", type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['je suis bloqué', 'mes difficultés'],
    corps: "Un frein à l'emploi est tout ce qui rend une recherche d'emploi plus difficile pour une personne précise : un frein de mobilité ou une contrainte de santé, par exemple, parmi bien d'autres possibles. En parler avec un conseiller ne signifie jamais qu'on est en tort : c'est reconnaître un obstacle réel pour mieux chercher comment le contourner.",
    relations: [
      { ficheId: 'diagnostic-partage', type: 'voir-aussi' }, { ficheId: 'rqth', type: 'voir-aussi' }, { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'plan-action', titre: "Plan d'action", titreDeTri: "Plan d'action", type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['mes prochaines étapes', "ce qu'on a décidé ensemble"],
    corps: "Un plan d'action rassemble les étapes concrètes décidées avec un conseiller pour avancer vers un objectif professionnel, à partir de ce qui ressort d'un diagnostic partagé. Il peut évoluer au fil de l'accompagnement plutôt que rester figé.",
    relations: [
      { ficheId: 'diagnostic-partage', type: 'voir-aussi' }, { ficheId: 'prescription', type: 'voir-aussi' }, { ficheId: 'cpf', type: 'voir-aussi' }
    ]
  },
  {
    id: 'positionnement', titre: 'Positionnement', titreDeTri: 'Positionnement', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ["où j'en suis", 'ma situation par rapport au marché'],
    corps: "Le positionnement désigne la manière dont une personne se situe par rapport à un métier, un secteur ou le marché du travail, en tenant compte de ses compétences, de son expérience et de ce qu'elle recherche. C'est un repère de travail, jamais un jugement de valeur.",
    relations: [
      { ficheId: 'diagnostic-partage', type: 'voir-aussi' }, { ficheId: 'employabilite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prescription', titre: 'Prescription', titreDeTri: 'Prescription', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ["on m'a orienté vers", "on m'a proposé"],
    corps: "Une prescription est la proposition, par un conseiller, d'une action précise (une formation, un dispositif, un rendez-vous avec un partenaire) jugée utile pour le parcours de la personne. Elle reste une proposition à discuter, pas une obligation imposée sans échange.",
    relations: [
      { ficheId: 'plan-action', type: 'voir-aussi' },
      { ficheId: 'prescription-delai', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'employabilite', titre: 'Employabilité', titreDeTri: 'Employabilité', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip', 'langage-rh'],
    variantesRecherche: ["mes chances de trouver un emploi"],
    corps: "L'employabilité désigne la capacité d'une personne à trouver et à conserver un emploi, compte tenu de ses compétences, de son expérience et du contexte du marché du travail. Elle peut évoluer dans le temps : elle ne décrit jamais une qualité figée de la personne.",
    relations: [
      { ficheId: 'positionnement', type: 'voir-aussi' }, { ficheId: 'reconversion', type: 'voir-aussi' }
    ]
  },
  {
    id: 'reconversion', titre: 'Reconversion', titreDeTri: 'Reconversion', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['changer de métier', 'se reconvertir'],
    corps: "La reconversion désigne le fait de changer de métier ou de secteur d'activité, en s'appuyant sur des compétences déjà acquises, une nouvelle formation, ou les deux à la fois. Elle peut concerner un changement complet de domaine ou un rapprochement vers un métier voisin.",
    relations: [
      { ficheId: 'employabilite', type: 'voir-aussi' }, { ficheId: 'positionnement', type: 'voir-aussi' }, { ficheId: 'fondation-2eme-chance', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Emploi et recrutement --

  {
    id: 'autonomie', titre: 'Que veut dire "autonomie" dans une offre d\'emploi ?', titreDeTri: 'Autonomie',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh', 'langage-employeur'],
    variantesRecherche: ['travailler en autonomie'],
    corps: "Quand un employeur recherche une personne \"autonome\", il veut dire qu'il n'aura pas la disponibilité pour donner des consignes détaillées à chaque tâche : il attend qu'elle sache organiser son travail et prendre de petites décisions seule, dans un cadre déjà donné.",
    relations: [
      { ficheId: 'parlez-moi-de-vous', type: 'voir-aussi' }, { ficheId: 'esprit-equipe', type: 'voir-aussi' }, { ficheId: 'force-proposition', type: 'voir-aussi' }
    ]
  },
  {
    id: 'parlez-moi-de-vous', titre: 'Pourquoi on vous demande "parlez-moi de vous" ?', titreDeTri: 'Parlez-moi de vous',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh', 'langage-employeur'],
    variantesRecherche: ['présentez-vous'],
    corps: "Cette question n'attend pas un résumé complet de votre vie : le recruteur cherche à comprendre ce que vous jugez important de mettre en avant, et si vous voyez le lien entre votre parcours et le poste visé.",
    relations: [
      { ficheId: 'autonomie', type: 'voir-aussi' }
    ]
  },
  {
    id: 'savoir-etre', titre: 'Que veut dire "savoir-être" ?', titreDeTri: 'Savoir-être',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['comportement au travail'],
    corps: "Le savoir-être désigne la manière dont une personne se comporte et interagit dans un cadre professionnel : la façon de communiquer, de réagir à une consigne, de travailler avec d'autres. C'est ce qu'un employeur observe au-delà des compétences techniques précises.",
    relations: [
      { ficheId: 'savoir-faire', type: 'a-ne-pas-confondre' }, { ficheId: 'esprit-equipe', type: 'voir-aussi' }
    ]
  },
  {
    id: 'savoir-faire', titre: 'Que veut dire "savoir-faire" ?', titreDeTri: 'Savoir-faire',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['compétences techniques'],
    corps: "Le savoir-faire désigne les compétences techniques concrètes qu'une personne sait mettre en œuvre dans son métier, acquises par la formation ou l'expérience. C'est ce qu'un employeur cherche à vérifier à travers un CV ou une mise en situation.",
    relations: [
      { ficheId: 'savoir-etre', type: 'a-ne-pas-confondre' }, { ficheId: 'rigueur', type: 'voir-aussi' }
    ]
  },
  {
    id: 'esprit-equipe', titre: 'Que veut dire "esprit d\'équipe" dans une offre d\'emploi ?', titreDeTri: "Esprit d'équipe",
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh', 'langage-employeur'],
    variantesRecherche: ['travailler en équipe'],
    corps: "Quand un employeur mentionne l'esprit d'équipe, il veut dire qu'il attend une personne capable de collaborer, de partager des informations utiles et de s'ajuster aux autres membres d'un groupe de travail, plutôt que de fonctionner uniquement seule.",
    relations: [
      { ficheId: 'savoir-etre', type: 'voir-aussi' }, { ficheId: 'autonomie', type: 'voir-aussi' }
    ]
  },
  {
    id: 'force-proposition', titre: 'Que veut dire "être force de proposition" ?', titreDeTri: 'Force de proposition',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh', 'langage-employeur'],
    variantesRecherche: ['avoir des idées'],
    corps: "Être force de proposition signifie qu'un employeur attend qu'une personne suggère elle-même des idées ou des améliorations, plutôt que d'attendre uniquement des consignes avant d'agir. Ça suppose une certaine familiarité avec le poste, pas nécessairement dès le premier jour.",
    relations: [
      { ficheId: 'autonomie', type: 'voir-aussi' }, { ficheId: 'esprit-equipe', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rigueur', titre: 'Que veut dire "rigueur" dans une offre d\'emploi ?', titreDeTri: 'Rigueur',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh', 'langage-employeur'],
    variantesRecherche: ['faire attention aux détails'],
    corps: "Quand un employeur recherche de la rigueur, il attend une personne qui respecte les procédures, vérifie son travail et limite les erreurs, en particulier sur des tâches répétitives ou précises.",
    relations: [
      { ficheId: 'savoir-faire', type: 'voir-aussi' }, { ficheId: 'autonomie', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cv-lecture-recruteur', titre: 'Ce que regarde un recruteur sur un CV', titreDeTri: 'CV, lecture par un recruteur',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['ce qui compte sur un CV'],
    corps: "Un recruteur repère d'abord les informations qui lui permettent de vérifier rapidement l'adéquation avec le poste : intitulés de postes précédents, durée des expériences, compétences citées explicitement. Un CV mal structuré peut faire perdre ces informations même quand le contenu est solide.",
    relations: [
      { ficheId: 'lettre-motivation', type: 'voir-aussi' }, { ficheId: 'savoir-faire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'lettre-motivation', titre: 'Comment lire une lettre de motivation', titreDeTri: 'Lettre de motivation',
    type: 'notion', gabarit: 'grille-lecture', univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['lettre de motiv'],
    corps: "Une lettre de motivation présente en général le lien entre la personne et le poste visé, une ou deux raisons concrètes de candidater, puis une ouverture vers un échange à venir. Elle complète le CV sans jamais le répéter à l'identique.",
    relations: [
      { ficheId: 'cv-lecture-recruteur', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Structures et organismes --

  {
    id: 'france-travail', titre: 'Le rôle de France Travail', titreDeTri: 'France Travail',
    type: 'notion', gabarit: 'role', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['Pôle emploi'],
    corps: "France Travail (anciennement Pôle emploi) est l'organisme chargé d'accompagner les personnes en recherche d'emploi, notamment en les mettant en lien avec des offres et des dispositifs comme la PMSMP. C'est aussi l'un des organismes pouvant verser des allocations aux personnes qui y ont droit.",
    relations: [
      { ficheId: 'pmsmp', type: 'voir-aussi' }, { ficheId: 'diagnostic-partage', type: 'voir-aussi' }, { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'mission-locale', titre: 'Le rôle de la Mission Locale', titreDeTri: 'Mission Locale',
    type: 'notion', gabarit: 'role', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['aide pour les jeunes'],
    corps: "Une Mission Locale accompagne spécifiquement les jeunes dans leur insertion professionnelle et sociale, avec un accompagnement souvent plus large que la seule recherche d'emploi (logement, santé, mobilité...). Chaque Mission Locale couvre un territoire précis.",
    relations: [
      { ficheId: 'france-travail', type: 'a-ne-pas-confondre' }, { ficheId: 'diagnostic-partage', type: 'voir-aussi' },
      { ficheId: 'fonds-d-aide-aux-jeunes', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cap-emploi', titre: 'Le rôle de Cap Emploi', titreDeTri: 'Cap Emploi',
    type: 'notion', gabarit: 'role', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['emploi et handicap'],
    corps: "Cap Emploi accompagne spécifiquement les personnes en situation de handicap dans leur recherche d'emploi et leur maintien en poste, en lien avec les employeurs et les autres structures d'accompagnement.",
    relations: [
      { ficheId: 'france-travail', type: 'a-ne-pas-confondre' }, { ficheId: 'rqth', type: 'voir-aussi' }, { ficheId: 'mission-locale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'caf', titre: 'CAF', titreDeTri: 'CAF', type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ["Caisse d'allocations familiales"],
    corps: "La CAF (Caisse d'allocations familiales) verse des aides liées à la famille, au logement ou à certaines situations de précarité, selon la situation de chaque personne. C'est un organisme distinct de ceux qui accompagnent la recherche d'emploi.",
    relations: [
      { ficheId: 'france-travail', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Insertion par l'activité économique (IAE / SIAE) --

  {
    id: 'siae', titre: "Les structures de l'insertion par l'activité économique (SIAE)", titreDeTri: 'SIAE',
    type: 'notion', gabarit: 'role', univers: 'structures-organismes', registres: [],
    variantesRecherche: ["structure d'insertion"],
    corps: "Une SIAE (structure de l'insertion par l'activité économique) propose un emploi encadré à des personnes qui rencontrent des difficultés particulières pour accéder au marché du travail classique, le temps de retrouver des repères professionnels. Ce terme regroupe plusieurs formes concrètes de structures, chacune avec son propre fonctionnement.",
    relations: [
      { ficheId: 'aci', type: 'voir-aussi' }, { ficheId: 'ei', type: 'voir-aussi' }, { ficheId: 'geiq', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aci', titre: "Chantier d'insertion (ACI)", titreDeTri: "Chantier d'insertion", type: 'terme',
    univers: 'structures-organismes', registres: [], variantesRecherche: [],
    corps: "Un chantier d'insertion (ACI, atelier et chantier d'insertion) est une structure qui emploie des personnes en parcours d'insertion sur des activités concrètes, souvent liées à l'environnement ou au bâtiment, tout en les accompagnant vers un emploi durable. C'est l'une des formes de SIAE.",
    relations: [
      { ficheId: 'ei', type: 'a-ne-pas-confondre' }, { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ei', titre: "Entreprise d'insertion (EI)", titreDeTri: "Entreprise d'insertion", type: 'terme',
    univers: 'structures-organismes', registres: [], variantesRecherche: [],
    corps: "Une entreprise d'insertion (EI) est une entreprise à part entière, qui produit et vend des biens ou des services comme n'importe quelle autre, tout en employant en priorité des personnes en parcours d'insertion. C'est l'une des formes de SIAE.",
    relations: [
      { ficheId: 'aci', type: 'a-ne-pas-confondre' }, { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ai', titre: 'Association intermédiaire (AI)', titreDeTri: 'Association intermédiaire', type: 'terme',
    univers: 'structures-organismes', registres: [], variantesRecherche: [],
    corps: "Une association intermédiaire (AI) met à disposition de particuliers, d'associations ou d'entreprises des personnes en parcours d'insertion, pour des missions ponctuelles. C'est l'une des formes de SIAE, plus souple qu'un contrat classique.",
    relations: [
      { ficheId: 'etti', type: 'a-ne-pas-confondre' }, { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'etti', titre: 'ETTI', titreDeTri: 'ETTI', type: 'terme',
    univers: 'structures-organismes', registres: [], variantesRecherche: ["intérim d'insertion"],
    corps: "Une ETTI (entreprise de travail temporaire d'insertion) fonctionne comme une agence d'intérim classique, mais met à disposition des entreprises clientes des personnes en parcours d'insertion. C'est l'une des formes de SIAE.",
    relations: [
      { ficheId: 'ai', type: 'a-ne-pas-confondre' }, { ficheId: 'interim', type: 'a-ne-pas-confondre' }, { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'geiq', titre: "GEIQ (groupement d'employeurs pour l'insertion et la qualification)", titreDeTri: 'GEIQ',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['GIEQ', "groupement d'employeurs insertion qualification", "embauché par un groupement d'employeurs"],
    corps: "Un GEIQ regroupe plusieurs entreprises d'un même secteur qui embauchent ensemble, sous ce groupement, une personne éloignée de l'emploi en contrat d'alternance (apprentissage ou professionnalisation). La personne est mise à disposition d'une ou plusieurs entreprises du groupement à tour de rôle, tout en suivant sa formation, pour se qualifier sur un métier que ces entreprises ont du mal à pourvoir. L'objectif est un emploi durable à l'issue, en général chez l'une des entreprises adhérentes. Ce n'est pas une structure de l'insertion par l'activité économique au sens strict, mais il poursuit un objectif proche.",
    relations: [
      { ficheId: 'alternance', type: 'voir-aussi' },
      { ficheId: 'siae', type: 'voir-aussi' },
      { ficheId: 'etti', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Formation et dispositifs --

  {
    id: 'cpf', titre: 'CPF', titreDeTri: 'CPF', type: 'terme',
    univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ['compte personnel de formation', 'financer ma formation'],
    corps: "Le CPF (compte personnel de formation) permet de financer une formation à partir d'un compte associé à chaque personne active, alimenté au fil de sa vie professionnelle. Seule une formation reconnue par l'État peut être financée par ce moyen : inscrite au RNCP ou au RS (répertoire spécifique), ou un autre dispositif éligible comme la VAE, un bilan de compétences ou certains permis de conduire. Depuis 2026, un plafond différent s'applique aussi selon ce qui est financé.",
    relations: [
      { ficheId: 'rncp', type: 'voir-aussi' }, { ficheId: 'rs', type: 'voir-aussi' },
      { ficheId: 'abondement-cpf', type: 'voir-aussi' }
    ]
  },
  {
    id: 'vae', titre: 'VAE', titreDeTri: 'VAE', type: 'terme',
    univers: 'formation', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ["validation des acquis de l'expérience", 'diplôme sans formation'],
    corps: "La VAE (validation des acquis de l'expérience) permet de faire reconnaître officiellement, sous forme d'un diplôme ou d'un titre, des compétences acquises par l'expérience professionnelle ou bénévole plutôt que par une formation classique.",
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' },
      { ficheId: 'france-vae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aref-ou-rfft', titre: 'AREF ou RFFT ?', titreDeTri: 'AREF ou RFFT',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['RFPE', 'rémunération formation demandeur emploi', 'comment je suis payé pendant une formation'],
    corps: "Ce qui les rapproche : les deux permettent d'être rémunéré pendant une formation validée par France Travail. Ce qui les distingue : l'AREF (allocation de retour à l'emploi formation) prolonge l'allocation chômage, au même montant, pour une personne qui a encore des droits ouverts. La RFFT (rémunération de formation de France Travail, anciennement RFPE) prend le relais pour une personne qui n'a plus ou pas de droits à l'allocation chômage. Dans les deux cas, la formation doit être validée par le conseiller avant de commencer, jamais après coup.",
    relations: [
      { ficheId: 'are', type: 'voir-aussi' },
      { ficheId: 'cpf', type: 'voir-aussi' },
      { ficheId: 'aif', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aif', titre: 'AIF (aide individuelle à la formation)', titreDeTri: 'AIF aide individuelle a la formation',
    type: 'terme', univers: 'formation', registres: ['langage-france-travail'],
    variantesRecherche: ['aide individuelle formation', 'France Travail finance ma formation', 'reste à charge formation'],
    corps: "L'AIF est une aide de France Travail qui finance tout ou partie des frais pédagogiques d'une formation, quand aucun autre financement (CPF, Région, OPCO...) ne suffit à la couvrir seul. Elle s'adresse aux demandeurs d'emploi inscrits, indemnisés ou non, ainsi qu'aux personnes en contrat de sécurisation professionnelle. C'est un financement d'appoint décidé au cas par cas avec le conseiller, jamais un droit automatique.",
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' },
      { ficheId: 'csp', type: 'voir-aussi' },
      { ficheId: 'aref-ou-rfft', type: 'voir-aussi' },
      { ficheId: 'action-de-formation-conventionnee', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'projet-transition-professionnelle', titre: 'Projet de transition professionnelle (PTP)', titreDeTri: 'Projet de transition professionnelle',
    type: 'terme', univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ['ex-CIF', 'congé individuel de formation', 'changer de métier en gardant mon contrat'],
    corps: "Le projet de transition professionnelle (PTP) permet à un salarié de s'absenter de son poste, avec le maintien de l'essentiel de sa rémunération, pour suivre une formation certifiante en vue de changer de métier. Il a remplacé le congé individuel de formation (CIF). C'est l'association Transitions Pro (anciennement Fongecif) qui étudie le dossier, finance la formation et sécurise le congé auprès de l'employeur. Contrairement au CPF, il suppose de garder son contrat de travail pendant toute la durée de la formation.",
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' },
      { ficheId: 'vae', type: 'voir-aussi' },
      { ficheId: 'cep', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rqth', titre: 'RQTH', titreDeTri: 'RQTH', type: 'terme',
    univers: 'sante-travail', registres: ['langage-administratif'],
    variantesRecherche: ['reconnaissance handicap'],
    corps: "La RQTH (reconnaissance de la qualité de travailleur handicapé) est un statut administratif qui reconnaît une situation de handicap pouvant affecter l'accès ou le maintien dans l'emploi. Elle ouvre l'accès à des dispositifs d'accompagnement spécifiques, comme ceux proposés par Cap Emploi.",
    relations: [
      { ficheId: 'cap-emploi', type: 'voir-aussi' }, { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'medecine-travail', titre: 'Médecine du travail', titreDeTri: 'Médecine du travail', type: 'terme',
    univers: 'sante-travail', registres: ['langage-administratif'],
    variantesRecherche: ['visite médicale', 'médecin du travail'],
    corps: "La médecine du travail est un service dont la mission est de préserver la santé des personnes dans leur environnement professionnel, jamais de soigner une maladie comme le ferait un médecin traitant. Elle intervient notamment lors de visites médicales, à l'embauche ou après une absence prolongée.",
    relations: [
      { ficheId: 'rqth', type: 'voir-aussi' }, { ficheId: 'amenagement-poste', type: 'voir-aussi' },
      { ficheId: 'duerp', type: 'voir-aussi' }
    ]
  },
  {
    id: 'arret-de-travail-indemnites-journalieres', titre: 'Arrêt de travail et indemnités journalières', titreDeTri: 'Arret de travail et indemnites journalieres',
    type: 'terme', univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ['IJ', 'arrêt maladie', 'qui me paie pendant un arrêt de travail', 'carence arrêt maladie'],
    corps: "Un arrêt de travail, prescrit par un médecin, suspend le contrat pendant une maladie ou un accident. Depuis le 1er septembre 2026, un décret plafonne sa durée : 31 jours pour un arrêt initial, 62 jours pour chaque prolongation, sauf si le médecin justifie d'aller au-delà. Pendant cette période, la Sécurité sociale (CPAM ou MSA) verse des indemnités journalières (IJ), qui ne remplacent qu'une partie du salaire, après un délai de carence de quelques jours ; l'employeur peut compléter selon la convention collective ou l'ancienneté. Un arrêt qui se prolonge peut déboucher, selon la situation, sur une visite de reprise, un aménagement de poste, ou l'examen d'une pension d'invalidité si la capacité de travail reste durablement réduite.",
    relations: [
      { ficheId: 'medecine-travail', type: 'voir-aussi' },
      { ficheId: 'pension-invalidite', type: 'voir-aussi' },
      { ficheId: 'visite-de-reprise', type: 'voir-aussi' }
    ]
  },
  {
    id: 'accident-travail-maladie-professionnelle', titre: 'Accident du travail et maladie professionnelle (AT/MP)', titreDeTri: 'Accident du travail et maladie professionnelle',
    type: 'terme', univers: 'sante-travail', registres: ['langage-administratif'],
    variantesRecherche: ['AT/MP', 'accident du travail', 'maladie professionnelle', 'accident de trajet'],
    corps: "Un accident du travail (y compris sur le trajet domicile-travail) ou une maladie professionnelle reconnue suivent des règles plus protectrices qu'un arrêt de travail ordinaire : les soins sont pris en charge intégralement, les indemnités journalières sont plus élevées, et le licenciement est très encadré pendant tout l'arrêt. Pour un accident ou une maladie survenue à partir du 1er janvier 2027, ces indemnités journalières sont versées 4 ans maximum ; au-delà, l'incapacité est considérée comme permanente et un autre régime d'indemnisation prend le relais. Si des séquelles durables restent après la guérison, une rente peut être versée, dont le montant dépend du taux d'incapacité reconnu. Si l'employeur a commis une faute inexcusable (danger connu et non prévenu), une indemnisation complémentaire peut être demandée.",
    relations: [
      { ficheId: 'arret-de-travail-indemnites-journalieres', type: 'a-ne-pas-confondre' },
      { ficheId: 'medecine-travail', type: 'voir-aussi' },
      { ficheId: 'reclassement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'maintien-emploi', titre: "Maintien dans l'emploi", titreDeTri: "Maintien dans l'emploi", type: 'terme',
    univers: 'sante-travail', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['rester à mon poste malgré ma santé', 'continuer à travailler avec un problème de santé'],
    corps: "Le maintien dans l'emploi désigne l'ensemble des solutions qui permettent à une personne de continuer à occuper son poste, ou un poste adapté, malgré un problème de santé qui pourrait autrement l'en empêcher. Il concerne aussi bien une personne reconnue travailleur handicapé qu'une personne dont la situation évolue en cours de carrière.",
    relations: [
      { ficheId: 'rqth', type: 'voir-aussi' }, { ficheId: 'amenagement-poste', type: 'voir-aussi' }, { ficheId: 'medecine-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'amenagement-poste', titre: 'Aménagement de poste', titreDeTri: 'Aménagement de poste', type: 'terme',
    univers: 'sante-travail', registres: ['langage-administratif'],
    variantesRecherche: ['restriction médicale', 'adapter mon poste de travail'],
    corps: "Un aménagement de poste modifie certains aspects d'un poste de travail (horaires, matériel, tâches, entre autres) pour qu'il reste compatible avec l'état de santé d'une personne. Il peut être temporaire ou durable, et concerner un poste déjà occupé comme un poste envisagé.",
    relations: []
  },
  {
    id: 'aptitude-ou-inaptitude', titre: 'Aptitude ou inaptitude ?', titreDeTri: 'Aptitude ou inaptitude',
    type: 'notion', gabarit: 'comparatif', univers: 'sante-travail', registres: ['langage-administratif'],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des avis rendus par la médecine du travail sur la compatibilité entre l'état de santé d'une personne et son poste. Ce qui les distingue : l'aptitude confirme que le poste reste compatible, avec ou sans aménagement. L'inaptitude signifie que le poste, tel qu'il est, n'est plus compatible avec l'état de santé de la personne, ce qui ouvre alors une recherche de solution (aménagement ou autre poste), jamais une fin en soi.",
    relations: [
      { ficheId: 'medecine-travail', type: 'voir-aussi' }, { ficheId: 'amenagement-poste', type: 'voir-aussi' },
      { ficheId: 'visite-d-information-et-de-prevention', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prime-ou-indemnite', titre: 'Prime ou indemnité ?', titreDeTri: 'Prime ou indemnité',
    type: 'notion', gabarit: 'comparatif', univers: 'bulletin-salaire', registres: ['langage-rh'],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des sommes versées en plus du salaire de base. Ce qui les distingue : une prime valorise quelque chose (une performance, une fidélité, un moment particulier). Une indemnité compense une situation ou une dépense réelle (un trajet, un repas, une fin de contrat). La première récompense, la seconde compense.",
    relations: [
      { ficheId: 'primes', type: 'voir-aussi' }, { ficheId: 'indemnites', type: 'voir-aussi' }
    ]
  },
  {
    id: 'savoir-etre-ou-savoir-faire', titre: 'Savoir-être ou savoir-faire ?', titreDeTri: 'Savoir-être ou savoir-faire',
    type: 'notion', gabarit: 'comparatif', univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont recherchés par un employeur au moment du recrutement. Ce qui les distingue : le savoir-faire se démontre par des compétences techniques concrètes, souvent vérifiables par un diplôme ou une réalisation. Le savoir-être se remarque dans le comportement au quotidien (la communication, la réaction à une consigne, le travail avec les autres) et se juge davantage sur la durée.",
    relations: [
      { ficheId: 'savoir-etre', type: 'voir-aussi' }, { ficheId: 'savoir-faire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cpf-ou-vae', titre: 'CPF ou VAE ?', titreDeTri: 'CPF ou VAE',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des moyens de faire progresser son parcours professionnel en dehors d'un cursus de formation initiale. Ce qui les distingue : le CPF finance une formation à suivre. La VAE ne finance aucune formation : elle fait reconnaître officiellement des compétences déjà acquises par l'expérience, sans avoir besoin de suivre un nouveau parcours de formation.",
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' }, { ficheId: 'vae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'francetravail-missionlocale-capemploi', titre: 'France Travail, Mission Locale ou Cap Emploi ?', titreDeTri: 'France Travail, Mission Locale ou Cap Emploi',
    type: 'notion', gabarit: 'comparatif', univers: 'structures-organismes', registres: [],
    variantesRecherche: [],
    corps: "Les trois accompagnent vers l'emploi, mais chacun avec un public ou un rôle différent. France Travail accompagne toute personne en recherche d'emploi, quel que soit son âge ou sa situation. La Mission Locale se concentre sur les jeunes de 16 à 25 ans, avec un accompagnement souvent plus large que la seule recherche d'emploi. Cap Emploi accompagne spécifiquement les personnes en situation de handicap. Une personne peut être suivie par plusieurs de ces structures en même temps, qui se coordonnent entre elles.",
    relations: [
      { ficheId: 'france-travail', type: 'voir-aussi' }, { ficheId: 'mission-locale', type: 'voir-aussi' }, { ficheId: 'cap-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'franceconnect', titre: 'FranceConnect', titreDeTri: 'FranceConnect', type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['se connecter avec impots.gouv', 'identité numérique'],
    corps: "FranceConnect est un système qui permet de se connecter à plusieurs services administratifs en ligne avec un seul identifiant, plutôt que de créer un compte différent pour chacun. Il ne stocke aucune information personnelle lui-même : il sert uniquement de passerelle entre les services.",
    relations: []
  },
  {
    id: 'actualisation', titre: 'Actualisation', titreDeTri: 'Actualisation', type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ["m'actualiser", 'déclaration mensuelle France Travail'],
    corps: "L'actualisation est la démarche par laquelle une personne inscrite confirme régulièrement sa situation auprès de France Travail : toujours en recherche d'emploi, en formation, ou tout changement notable. Elle conditionne le maintien de l'inscription et, le cas échéant, le versement d'une allocation.",
    relations: [
      { ficheId: 'france-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'attestation-employeur', titre: 'Attestation employeur', titreDeTri: 'Attestation employeur', type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['attestation pôle emploi', 'document de fin de contrat'],
    corps: "L'attestation employeur est un document que l'employeur remet à la fin d'un contrat de travail, résumant la période travaillée et les rémunérations perçues. Elle sert notamment à faire valoir des droits auprès de France Travail.",
    relations: [
      { ficheId: 'france-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'are', titre: 'ARE', titreDeTri: 'ARE', type: 'terme',
    univers: 'dispositifs', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['chômage', 'allocation chômage'],
    corps: "L'ARE (allocation de retour à l'emploi) est un revenu de remplacement versé à une personne qui a perdu son emploi involontairement et qui remplit certaines conditions. Son versement est lié à l'actualisation régulière de la situation auprès de France Travail.",
    relations: [
      { ficheId: 'france-travail', type: 'voir-aussi' }, { ficheId: 'actualisation', type: 'voir-aussi' }
    ]
  },
  {
    id: 'poei', titre: 'POEI', titreDeTri: 'POEI', type: 'terme',
    univers: 'dispositifs', registres: ['langage-france-travail'],
    variantesRecherche: ['formation avant embauche', "préparation à l'emploi", 'POEC'],
    corps: "La POEI (préparation opérationnelle à l'emploi individuelle) permet à une personne déjà identifiée par un employeur de suivre une formation avant une embauche, pour acquérir les compétences qui manquent encore au moment du recrutement. Il existe aussi une version collective, la POEC : plusieurs personnes non identifiées à l'avance se forment ensemble sur un métier qui recrute dans une branche, financée par l'OPCO de cette branche plutôt que par un employeur précis.",
    relations: [
      { ficheId: 'pmsmp', type: 'voir-aussi' },
      { ficheId: 'opco', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cej', titre: 'CEJ', titreDeTri: 'CEJ', type: 'terme',
    univers: 'dispositifs', registres: ['langage-france-travail'],
    variantesRecherche: ['contrat jeune', 'accompagnement intensif jeunes'],
    corps: "Le CEJ (contrat d'engagement jeune) est un accompagnement renforcé destiné aux jeunes rencontrant des difficultés particulières d'accès à l'emploi, associant un suivi rapproché et des mises en situation régulières.",
    relations: [
      { ficheId: 'mission-locale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pacea', titre: 'PACEA', titreDeTri: 'PACEA', type: 'terme',
    univers: 'dispositifs', registres: ['langage-cip'],
    variantesRecherche: ['parcours mission locale jeunes'],
    corps: "Le PACEA (parcours contractualisé d'accompagnement vers l'emploi et l'autonomie) est le cadre général d'accompagnement proposé par les Missions Locales aux jeunes, à l'intérieur duquel des dispositifs plus spécifiques, comme le CEJ, peuvent s'inscrire.",
    relations: [
      { ficheId: 'mission-locale', type: 'voir-aussi' }, { ficheId: 'cej', type: 'voir-aussi' }
    ]
  },
  {
    id: 'bilan-competences', titre: 'Bilan de compétences', titreDeTri: 'Bilan de compétences', type: 'terme',
    univers: 'dispositifs', registres: ['langage-cip', 'langage-rh'],
    variantesRecherche: ['faire le point sur mes compétences', 'bilan pro'],
    corps: "Un bilan de compétences est un accompagnement structuré qui aide une personne à faire le point sur ses compétences, ses aptitudes et ses motivations, pour construire un projet professionnel ou une démarche de formation. Il est mené par un organisme extérieur à l'employeur.",
    relations: [
      { ficheId: 'diagnostic-partage', type: 'voir-aussi' }, { ficheId: 'positionnement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rncp', titre: 'RNCP', titreDeTri: 'RNCP', type: 'terme',
    univers: 'formation', registres: ['langage-administratif', 'langage-rh'],
    variantesRecherche: ['niveau de diplôme', 'niveau bac+2 bac+3'],
    corps: "Le RNCP (répertoire national des certifications professionnelles) recense les diplômes et titres reconnus officiellement, classés par niveau. Ce niveau sert de repère pour comparer des parcours de formation différents, même quand ils ne portent pas le même nom.",
    relations: [
      { ficheId: 'cqp', type: 'voir-aussi' }, { ficheId: 'titre-professionnel', type: 'voir-aussi' },
      { ficheId: 'rs', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cqp', titre: 'CQP', titreDeTri: 'CQP', type: 'terme',
    univers: 'formation', registres: ['langage-rh'],
    variantesRecherche: ['certificat de qualification'],
    corps: "Un CQP (certificat de qualification professionnelle) est une certification créée et reconnue par une branche professionnelle précise, pour valider des compétences propres à un métier de ce secteur. Contrairement à un diplôme national, sa reconnaissance peut être plus limitée en dehors de cette branche.",
    relations: []
  },
  {
    id: 'titre-professionnel', titre: 'Titre professionnel', titreDeTri: 'Titre professionnel', type: 'terme',
    univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ['titre pro'],
    corps: "Un titre professionnel est une certification délivrée par l'État, organisée autour de blocs de compétences (appelés CCP) correspondant chacun à une partie du métier visé. Il peut être obtenu par une formation ou par la validation des acquis de l'expérience.",
    relations: [
      { ficheId: 'vae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'certification', titre: 'Certification', titreDeTri: 'Certification', type: 'terme',
    univers: 'formation', registres: ['langage-rh', 'langage-administratif'],
    variantesRecherche: ['être certifié'],
    corps: "Une certification atteste officiellement qu'une personne maîtrise des compétences précises, à un moment donné. Elle peut prendre différentes formes (diplôme, titre professionnel, CQP, entre autres) selon qui la délivre et dans quel cadre.",
    relations: [
      { ficheId: 'qualification', type: 'voir-aussi' }
    ]
  },
  {
    id: 'qualification', titre: 'Qualification', titreDeTri: 'Qualification', type: 'terme',
    univers: 'formation', registres: ['langage-rh'],
    variantesRecherche: ['être qualifié pour un poste'],
    corps: "La qualification désigne le niveau de compétence reconnu à une personne pour occuper un poste, reposant sur une combinaison de formation, de certification et d'expérience. Elle influence notamment le classement et la rémunération prévus par une convention collective.",
    relations: []
  },
  {
    id: 'formation-qualifiante-ou-certifiante', titre: 'Formation qualifiante ou certifiante ?', titreDeTri: 'Formation qualifiante ou certifiante',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux visent à faire progresser une personne dans son parcours professionnel. Ce qui les distingue : une formation qualifiante développe des compétences reconnues sur le marché du travail, sans forcément déboucher sur un diplôme ou un titre officiel. Une formation certifiante se conclut par l'obtention d'une certification reconnue (diplôme, titre professionnel, CQP).",
    relations: [
      { ficheId: 'certification', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rncp-ou-cqp', titre: 'RNCP ou CQP ?', titreDeTri: 'RNCP ou CQP',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des repères de certification professionnelle. Ce qui les distingue : le RNCP est un répertoire national, avec un niveau reconnu dans tout le pays et par la plupart des employeurs. Le CQP est propre à une branche professionnelle précise : sa reconnaissance est forte dans ce secteur, mais plus limitée en dehors.",
    relations: [
      { ficheId: 'rncp', type: 'voir-aussi' }, { ficheId: 'cqp', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rs', titre: 'RS (répertoire spécifique)', titreDeTri: 'RS repertoire specifique', type: 'terme',
    univers: 'formation', registres: ['langage-administratif', 'langage-rh'],
    variantesRecherche: ['répertoire spécifique', 'certification RS', 'France compétences'],
    corps: "Le RS (répertoire spécifique) recense des certifications reconnues officiellement par France Compétences, plus ciblées qu'un métier complet : une compétence précise, comme une langue, une habilitation ou un logiciel. Comme le RNCP, il sert de repère pour vérifier qu'une certification est reconnue par l'État, notamment pour savoir si elle peut être financée par le CPF.",
    relations: [
      { ficheId: 'rncp', type: 'voir-aussi' }, { ficheId: 'cpf', type: 'voir-aussi' },
      { ficheId: 'cpf-plafonds-2026', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rncp-ou-rs', titre: 'RNCP ou RS ?', titreDeTri: 'RNCP ou RS',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des répertoires qui font reconnaître officiellement une certification par l'État, et conditionnent notamment son financement par le CPF. Ce qui les distingue : le RNCP recense des diplômes et titres qui couvrent un métier entier. Le RS recense des certifications plus ciblées, qui valident une compétence précise (une langue, une habilitation, un logiciel) sans couvrir tout un métier.",
    relations: [
      { ficheId: 'rncp', type: 'voir-aussi' }, { ficheId: 'rs', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cpf-plafonds-2026', titre: 'Les plafonds du CPF depuis 2026', titreDeTri: 'Plafonds du CPF depuis 2026', type: 'terme',
    univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ['plafond CPF 1500 euros', 'montant maximum CPF', 'le CPF ne couvre plus tout'],
    corps: "Depuis un décret entré en vigueur le 26 février 2026, l'utilisation du CPF est plafonnée selon ce qui est financé : 1 500 € pour une certification du RS (répertoire spécifique), sauf la certification CléA qui n'est pas concernée ; 1 600 € pour un bilan de compétences, si aucun n'a déjà été financé par le CPF au cours des 5 dernières années ; 900 € pour la préparation aux permis de conduire légers (A1, A2, B, B1, BE). Les formations inscrites au RNCP ne sont soumises à aucun de ces plafonds. Au-delà du plafond, la personne elle-même ou un autre financeur (AIF, Région...) peut compléter la différence.",
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' }, { ficheId: 'rs', type: 'voir-aussi' },
      { ficheId: 'aif', type: 'voir-aussi' }
    ]
  },
  {
    id: 'diplome-titre-certification', titre: 'Diplôme, titre professionnel ou certification ?', titreDeTri: 'Diplôme, titre professionnel ou certification',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: [],
    variantesRecherche: [],
    corps: "Les trois attestent officiellement d'un niveau de compétence, mais chacun avec une logique différente. Un diplôme est délivré par l'Éducation nationale ou l'enseignement supérieur, généralement au terme d'un cursus de formation initiale. Un titre professionnel est délivré par l'État, organisé en blocs de compétences, accessible aussi bien par la formation que par la VAE. Une certification est un terme plus large, qui regroupe ces deux formes ainsi que d'autres, comme les CQP délivrés par une branche professionnelle.",
    relations: [
      { ficheId: 'titre-professionnel', type: 'voir-aussi' }, { ficheId: 'certification', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ecoute-active', titre: 'Écoute active', titreDeTri: 'Écoute active', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['bien écouter en entretien'],
    corps: "L'écoute active est une posture d'écoute qui vise à comprendre réellement ce qu'exprime une personne, au-delà des seuls mots utilisés, plutôt que d'écouter en préparant déjà une réponse. Elle s'appuie notamment sur la reformulation, pour vérifier que ce qui a été compris correspond bien à ce que la personne voulait dire.",
    relations: [
      { ficheId: 'reformulation', type: 'voir-aussi' }
    ]
  },
  {
    id: 'reformulation', titre: 'Reformulation', titreDeTri: 'Reformulation', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['redire avec ses mots'],
    corps: "La reformulation consiste à redire, avec ses propres mots, ce qu'une personne vient d'exprimer, pour vérifier que la compréhension est la bonne avant de poursuivre l'échange. Elle n'ajoute rien et ne juge rien : elle renvoie simplement ce qui a été entendu.",
    relations: []
  },
  {
    id: 'questionnement', titre: 'Questionnement', titreDeTri: 'Questionnement', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['poser les bonnes questions'],
    corps: "Le questionnement désigne la manière de poser des questions pour aider une personne à préciser sa pensée, plutôt que pour obtenir une information déjà attendue. Une question ouverte, qui ne se répond pas par oui ou non, laisse davantage de place à ce que la personne a réellement à dire.",
    relations: [
      { ficheId: 'ecoute-active', type: 'voir-aussi' }
    ]
  },
  {
    id: 'conduite-entretien', titre: "Conduite d'un entretien d'accompagnement", titreDeTri: "Conduite d'un entretien d'accompagnement", type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['mener un entretien avec un conseiller'],
    corps: "La conduite d'un entretien d'accompagnement désigne la manière dont un professionnel structure et anime un échange avec la personne qu'il accompagne, en alternant écoute, questionnement et reformulation tout en gardant un objectif clair. Elle se distingue d'un entretien d'embauche, qui répond à une tout autre logique.",
    relations: [
      { ficheId: 'ecoute-active', type: 'voir-aussi' }, { ficheId: 'questionnement', type: 'voir-aussi' }, { ficheId: 'reformulation', type: 'voir-aussi' }
    ]
  },
  {
    id: 'advp', titre: 'ADVP', titreDeTri: 'ADVP', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['méthode ADVP'],
    corps: "L'ADVP (activation du développement vocationnel et personnel) est une approche d'accompagnement qui aide une personne à explorer et clarifier progressivement son orientation professionnelle, en s'appuyant sur ses propres expériences plutôt que sur un test ou un diagnostic extérieur.",
    relations: [
      { ficheId: 'orientation', type: 'voir-aussi' }
    ]
  },
  {
    id: 'trefle-chanceux', titre: 'Trèfle Chanceux', titreDeTri: 'Trèfle Chanceux', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['outil trèfle', 'croiser goûts compétences marché'],
    corps: "Le Trèfle Chanceux est un outil d'accompagnement qui aide une personne à croiser ce qu'elle aime faire, ce qu'elle sait faire et ce que recherche le marché du travail, pour identifier des pistes professionnelles réalistes plutôt qu'idéalisées.",
    relations: [
      { ficheId: 'projet-professionnel', type: 'voir-aussi' }
    ]
  },
  {
    id: 'objectifs-smart', titre: 'Objectifs SMART', titreDeTri: 'Objectifs SMART', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['objectif SMART', 'méthode SMART'],
    corps: "SMART est un sigle qui désigne des critères utilisés pour formuler un objectif de façon à ce qu'il reste utilisable dans un accompagnement : spécifique, mesurable, atteignable, réaliste et temporellement défini. Un objectif formulé ainsi facilite le suivi de son avancement, sans en garantir pour autant la réussite.",
    relations: [
      { ficheId: 'plan-action', type: 'voir-aussi' }
    ]
  },
  {
    id: 'co-construction', titre: 'Co-construction', titreDeTri: 'Co-construction', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['décider ensemble avec mon conseiller'],
    corps: "La co-construction désigne une manière de travailler dans laquelle une décision ou une solution se construit conjointement avec la personne accompagnée, plutôt que d'être proposée toute faite par le professionnel. Elle s'oppose à une posture où le professionnel déciderait seul de ce qui convient à la personne.",
    relations: [
      { ficheId: 'prescription', type: 'voir-aussi' }, { ficheId: 'plan-action', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pouvoir-agir', titre: "Pouvoir d'agir", titreDeTri: "Pouvoir d'agir", type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['reprendre la main sur ma situation'],
    corps: "Le pouvoir d'agir désigne la capacité d'une personne à influencer réellement sa propre situation, plutôt que de la subir. Un accompagnement qui vise à renforcer le pouvoir d'agir cherche à redonner à la personne les moyens de décider et d'agir par elle-même, plutôt que d'agir à sa place.",
    relations: [
      { ficheId: 'co-construction', type: 'voir-aussi' }
    ]
  },
  {
    id: 'convention-collective', titre: 'Convention collective', titreDeTri: 'Convention collective', type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['ma convention collective', 'accord de branche'],
    corps: "Une convention collective est un texte négocié entre organisations d'employeurs et de salariés, qui précise et complète le droit du travail pour un secteur d'activité précis (salaires minimums, primes, temps de travail, entre autres). Elle s'applique en complément du contrat de travail, jamais à sa place.",
    relations: [
      { ficheId: 'qualification', type: 'voir-aussi' }
    ]
  },
  {
    id: 'preavis', titre: 'Préavis', titreDeTri: 'Préavis', type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique'],
    variantesRecherche: ['délai avant de partir', 'durée de préavis'],
    corps: "Le préavis est la période qui s'écoule entre l'annonce de la fin d'un contrat de travail et sa date effective, pendant laquelle le contrat continue normalement de s'appliquer. Sa durée dépend du motif de fin de contrat et de l'ancienneté.",
    relations: [
      { ficheId: 'licenciement', type: 'voir-aussi' }, { ficheId: 'demission', type: 'voir-aussi' }
    ]
  },
  {
    id: 'licenciement', titre: 'Licenciement', titreDeTri: 'Licenciement', type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique'],
    variantesRecherche: ['être licencié'],
    corps: "Un licenciement est la fin d'un contrat de travail décidée par l'employeur, pour un motif qui doit être réel et justifié. C'est l'employeur, jamais le salarié, qui prend l'initiative de cette rupture.",
    relations: [
      { ficheId: 'demission', type: 'a-ne-pas-confondre' },
      { ficheId: 'licenciement-procedure-employeur', type: 'voir-aussi' },
      { ficheId: 'indemnite-legale-de-licenciement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'licenciement-procedure-employeur', titre: "Licencier : une décision encadrée pour l'employeur",
    titreDeTri: "Licencier une decision encadree pour l'employeur", type: 'terme',
    univers: 'droit-travail', registres: ['langage-employeur', 'langage-juridique'],
    variantesRecherche: ['procédure de licenciement employeur', 'motif réel et sérieux'],
    corps: "Une fois la période d'essai terminée, un employeur ne peut pas mettre fin à un CDI librement. Il doit avoir un motif réel et sérieux (un fait précis et vérifiable, pas une simple impression), et suivre une procédure obligatoire : convocation à un entretien préalable, entretien, puis notification écrite du licenciement avec son motif. Si la personne saisit le conseil de prud'hommes et que le motif est jugé insuffisant ou la procédure irrégulière, le licenciement peut être requalifié « sans cause réelle et sérieuse » : l'employeur doit alors verser des indemnités supplémentaires, en plus de celles déjà dues à la fin de tout contrat. C'est un vrai risque juridique et financier pour l'employeur, pas une formalité symbolique - une des raisons structurelles pour lesquelles une embauche est un choix pesé avec soin, ce qui ne mesure rien sur la valeur d'une personne non retenue. Pour vous, concrètement : vous devez recevoir une convocation écrite, puis une notification écrite du licenciement avec son motif - jamais un simple mot oral ou un SMS. Si l'un de ces éléments manque, ou si le motif indiqué vous semble injustifié, c'est justement ce que le conseil de prud'hommes peut examiner.",
    relations: [
      { ficheId: 'licenciement', type: 'voir-aussi' },
      { ficheId: 'conseil-de-prud-hommes', type: 'voir-aussi' },
      { ficheId: 'periode-essai-cote-employeur', type: 'voir-aussi' }
    ]
  },
  {
    id: 'demission', titre: 'Démission', titreDeTri: 'Démission', type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique'],
    variantesRecherche: ['démissionner', 'quitter mon poste'],
    corps: "Une démission est la fin d'un contrat de travail décidée par le salarié lui-même, de façon claire et non équivoque. C'est la personne salariée, jamais l'employeur, qui prend l'initiative de cette rupture.",
    relations: [
      { ficheId: 'abandon-de-poste', type: 'voir-aussi' }
    ]
  },
  {
    id: 'abandon-de-poste', titre: 'Abandon de poste', titreDeTri: 'Abandon de poste', type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique', 'langage-france-travail'],
    variantesRecherche: ['quitter son travail sans prévenir', 'ne plus se présenter au travail', 'présomption de démission'],
    corps: "Un abandon de poste, c'est ne plus se présenter au travail sans justification ni accord de l'employeur. Depuis une réforme de 2023, l'employeur peut mettre la personne en demeure de reprendre son poste ou d'expliquer son absence ; sans réponse dans le délai fixé, elle est présumée démissionnaire, ce qui ferme en principe le droit à l'allocation chômage. Cette présomption peut être contestée devant le conseil de prud'hommes, notamment si l'abandon fait suite à un manquement grave de l'employeur (harcèlement, salaire impayé...). Ce n'est jamais une façon sûre de quitter un emploi rapidement.",
    relations: [
      { ficheId: 'demission-legitime', type: 'voir-aussi' },
      { ficheId: 'are', type: 'voir-aussi' },
      { ficheId: 'radiation', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rupture-conventionnelle', titre: 'Rupture conventionnelle', titreDeTri: 'Rupture conventionnelle', type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ["partir à l'amiable"],
    corps: "Une rupture conventionnelle est une fin de contrat de travail décidée d'un commun accord entre l'employeur et le salarié, formalisée par une convention signée des deux parties. Elle se distingue à la fois du licenciement et de la démission, chacun décidé par une seule des deux parties.",
    relations: [
      { ficheId: 'licenciement', type: 'a-ne-pas-confondre' }, { ficheId: 'demission', type: 'a-ne-pas-confondre' }, { ficheId: 'solde-tout-compte', type: 'voir-aussi' },
      { ficheId: 'homologation-rupture-conventionnelle', type: 'voir-aussi' }
    ]
  },
  {
    id: 'solde-tout-compte', titre: 'Solde de tout compte', titreDeTri: 'Solde de tout compte', type: 'terme',
    univers: 'droit-travail', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['dernier bulletin de salaire', 'ce qui reste dû à la fin du contrat'],
    corps: "Le solde de tout compte est un document remis par l'employeur à la fin d'un contrat de travail, qui récapitule l'ensemble des sommes versées à cette occasion : dernier salaire, indemnités éventuelles, entre autres.",
    relations: [
      { ficheId: 'indemnites', type: 'voir-aussi' }
    ]
  },
  {
    id: 'demission-ou-rupture-conventionnelle', titre: 'Démission ou rupture conventionnelle ?', titreDeTri: 'Démission ou rupture conventionnelle',
    type: 'notion', gabarit: 'comparatif', univers: 'droit-travail', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux mettent fin à un contrat de travail avant son terme naturel. Ce qui les distingue : une démission est décidée uniquement par le salarié. Une rupture conventionnelle est décidée d'un commun accord, formalisée par les deux parties : ni l'employeur ni le salarié ne peut l'imposer seul.",
    relations: [
      { ficheId: 'demission', type: 'voir-aussi' }, { ficheId: 'rupture-conventionnelle', type: 'voir-aussi' }
    ]
  },
  {
    id: 'entretien-annuel', titre: 'Entretien annuel', titreDeTri: 'Entretien annuel', type: 'terme',
    univers: 'ressources-humaines', registres: ['langage-rh'],
    variantesRecherche: ['entretien avec mon responsable'],
    corps: "Un entretien annuel est un rendez-vous régulier entre un salarié et son responsable pour faire le point sur l'année écoulée (missions réalisées, difficultés rencontrées, objectifs à venir). Il se distingue d'un entretien d'embauche : il a lieu une fois le poste déjà occupé, jamais pour l'obtenir.",
    relations: []
  },
  {
    id: 'culture-entreprise', titre: "Culture d'entreprise", titreDeTri: "Culture d'entreprise", type: 'terme',
    univers: 'ressources-humaines', registres: ['langage-rh'],
    variantesRecherche: ['ambiance de travail', 'façon de travailler dans une entreprise'],
    corps: "La culture d'entreprise désigne l'ensemble des valeurs, habitudes et façons de travailler propres à une entreprise, au-delà de ce qui est écrit dans un contrat ou une fiche de poste. Elle influence la manière dont les décisions sont prises et dont les personnes interagissent au quotidien.",
    relations: []
  },
  {
    id: 'marque-employeur', titre: 'Marque employeur', titreDeTri: 'Marque employeur', type: 'terme',
    univers: 'ressources-humaines', registres: ['langage-rh'],
    variantesRecherche: ["image d'une entreprise comme employeur"],
    corps: "La marque employeur désigne l'image qu'une entreprise donne d'elle-même en tant qu'employeur, pour attirer et fidéliser des candidats et des salariés. Elle passe notamment par la communication de l'entreprise, mais aussi par ce qu'en disent réellement les personnes qui y travaillent.",
    relations: [
      { ficheId: 'culture-entreprise', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cooptation', titre: 'Cooptation', titreDeTri: 'Cooptation', type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['être recommandé pour un poste'],
    corps: "La cooptation est une pratique de recrutement dans laquelle une personne déjà en poste recommande une autre personne pour un emploi disponible dans son entreprise. Elle repose sur la confiance accordée à la personne qui recommande, en complément des autres canaux de recrutement.",
    relations: []
  },
  {
    id: 'bassin-emploi', titre: "Bassin d'emploi", titreDeTri: "Bassin d'emploi", type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-cip'],
    variantesRecherche: ['zone où chercher un emploi', 'emplois autour de chez moi'],
    corps: "Un bassin d'emploi désigne une zone géographique dans laquelle les habitants trouvent, en pratique, la majorité de leurs opportunités d'emploi, en tenant compte des trajets réalistes au quotidien. Il ne correspond pas toujours aux limites administratives d'une ville ou d'un département.",
    relations: [
      { ficheId: 'qpv', type: 'voir-aussi' }
    ]
  },
  {
    id: 'qpv', titre: 'QPV (quartier prioritaire de la politique de la ville)', titreDeTri: 'QPV quartier prioritaire de la politique de la ville',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-administratif'],
    variantesRecherche: ['quartier prioritaire', 'zone urbaine sensible', 'aides emploi quartier'],
    corps: "Un QPV est un quartier urbain classé par l'État parmi les plus fragiles, selon le niveau de revenu de ses habitants. Y résider ouvre droit à des dispositifs spécifiques d'aide à l'emploi, comme l'emploi franc. Le classement se vérifie à l'adresse exacte, pas à la ville entière : deux rues voisines peuvent être traitées différemment.",
    relations: [
      { ficheId: 'emploi-franc', type: 'voir-aussi' },
      { ficheId: 'frr', type: 'voir-aussi' },
      { ficheId: 'mission-locale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'frr', titre: 'FRR (zone France Ruralités Revitalisation)', titreDeTri: 'FRR zone France Ruralites Revitalisation',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-administratif'],
    variantesRecherche: ['ZRR', 'zone de revitalisation rurale', 'aides zone rurale fragile'],
    corps: "Une zone France Ruralités Revitalisation (FRR) est une commune rurale classée fragile par l'État, ce qui ouvre des allégements aux entreprises qui s'y créent ou s'y développent, avec un niveau renforcé (FRR+) pour les communes les plus isolées. Ce classement a remplacé, en 2024, les zones de revitalisation rurale (ZRR), un nom que l'on rencontre encore dans d'anciens documents ou sur d'anciens sites. Utile pour situer les difficultés propres à un territoire rural, à côté des QPV qui concernent les quartiers urbains.",
    relations: [
      { ficheId: 'qpv', type: 'voir-aussi' },
      { ficheId: 'zone-d-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'emploi-franc', titre: 'Emploi franc (dispositif arrêté)', titreDeTri: 'Emploi franc',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['aide embauche QPV', 'prime employeur quartier prioritaire'],
    corps: "L'emploi franc était une aide financière versée à une entreprise qui embauchait, en CDI ou en CDD d'au moins six mois, une personne résidant en QPV. Le dispositif a pris fin le 31 décembre 2024 et n'a pas été reconduit : aucune embauche à partir de 2025 n'y ouvre droit. Les entreprises qui avaient embauché avant cette date continuent de toucher l'aide pour la durée restante. Le terme peut encore apparaître dans un contrat plus ancien, ou revenir si le dispositif était un jour relancé.",
    relations: [
      { ficheId: 'qpv', type: 'voir-aussi' },
      { ficheId: 'clause-sociale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'polyvalence', titre: 'Polyvalence', titreDeTri: 'Polyvalence', type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['savoir faire plusieurs choses'],
    corps: "La polyvalence désigne la capacité d'une personne à exercer plusieurs types de tâches ou de fonctions différentes, plutôt qu'une seule spécialité. C'est une qualité recherchée dans des postes ou des structures où l'activité varie souvent.",
    relations: [
      { ficheId: 'savoir-faire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'sens-organisation', titre: "Sens de l'organisation", titreDeTri: "Sens de l'organisation", type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ["savoir s'organiser", 'gérer son temps'],
    corps: "Le sens de l'organisation désigne la capacité d'une personne à planifier son travail, prioriser ses tâches et gérer son temps efficacement. C'est une qualité qui se remarque souvent dans la façon de gérer plusieurs tâches en parallèle, sans qu'aucune ne soit oubliée.",
    relations: [
      { ficheId: 'rigueur', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'auto-entrepreneur', titre: 'Auto-entrepreneur', titreDeTri: 'Auto-entrepreneur', type: 'terme',
    univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: ['micro-entrepreneur', 'micro-entreprise', 'régime micro', 'travailler à mon compte'],
    corps: "Le statut d'auto-entrepreneur (ou micro-entrepreneur) permet d'exercer une activité professionnelle de façon indépendante, avec des démarches de création et une gestion administrative simplifiées par rapport à d'autres formes d'entreprise. « Micro-entreprise » désigne la même chose. Il reste distinct du statut de salarié : la personne n'a pas d'employeur.",
    relations: [
      { ficheId: 'entreprise-individuelle-ou-societe', type: 'voir-aussi' },
      { ficheId: 'acre', type: 'voir-aussi' }
    ]
  },
  {
    id: 'acre', titre: "ACRE (aide à la création ou reprise d'entreprise)", titreDeTri: 'ACRE aide a la creation ou reprise d entreprise',
    type: 'terme', univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: ["aide création d'entreprise", 'exonération cotisations première année', 'aide reprise entreprise'],
    corps: "L'ACRE réduit les cotisations sociales pendant les douze premiers mois d'une entreprise, en micro-entreprise comme en société. Depuis 2026, elle n'est plus automatique : elle est réservée à certains publics (demandeurs d'emploi, bénéficiaires du RSA ou de l'ASS, jeunes de 18 à 25 ans, personnes qui créent en quartier prioritaire de la politique de la ville, entre autres) et se demande auprès de l'Urssaf, en général dans les 45 jours qui suivent la création ou la reprise. Elle ne peut pas être redemandée avant plusieurs années si on en a déjà bénéficié.",
    relations: [
      { ficheId: 'auto-entrepreneur', type: 'voir-aussi' },
      { ficheId: 'qpv', type: 'voir-aussi' },
      { ficheId: 'arce', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'projet-professionnel', titre: 'Projet professionnel', titreDeTri: 'Projet professionnel', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['savoir ce que je veux faire'],
    corps: "Un projet professionnel désigne l'objectif vers lequel une personne oriente ses démarches (un métier visé, un secteur, ou une évolution précise), construit progressivement au fil de son parcours plutôt que fixé une fois pour toutes. Il peut évoluer sans que cela remette en cause tout le travail déjà accompli.",
    relations: [
      { ficheId: 'positionnement', type: 'voir-aussi' }, { ficheId: 'employabilite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'orientation', titre: 'Orientation', titreDeTri: 'Orientation', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['trouver ma voie', "m'orienter"],
    corps: "L'orientation désigne le processus par lequel une personne explore et précise les directions professionnelles qui lui correspondent, en tenant compte de ses compétences, de ses envies et des réalités du marché du travail. Elle ne se limite pas à un seul choix figé : elle peut se reposer à plusieurs moments d'un parcours.",
    relations: [
      { ficheId: 'projet-professionnel', type: 'voir-aussi' }
    ]
  },
  {
    id: 'reorientation-professionnelle', titre: 'Réorientation professionnelle', titreDeTri: 'Réorientation professionnelle', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['changer de voie sans tout changer'],
    corps: "La réorientation professionnelle désigne le fait de changer de direction dans son parcours, généralement au sein d'un même domaine ou d'un domaine proche, contrairement à une reconversion, qui implique un changement plus complet de métier ou de secteur.",
    relations: [
      { ficheId: 'reconversion', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'evolution-professionnelle', titre: 'Évolution professionnelle', titreDeTri: 'Évolution professionnelle', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip', 'langage-rh'],
    variantesRecherche: ['progresser dans mon métier', 'avancer dans ma carrière'],
    corps: "L'évolution professionnelle désigne une progression dans son métier ou son secteur actuel (davantage de responsabilités, un poste différent dans la même filière, entre autres), sans changer fondamentalement d'activité, contrairement à une reconversion.",
    relations: [
      { ficheId: 'reconversion', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'reorientation-ou-reconversion', titre: 'Réorientation ou reconversion ?', titreDeTri: 'Réorientation ou reconversion',
    type: 'notion', gabarit: 'comparatif', univers: 'accompagnement-insertion', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux impliquent de changer de direction dans son parcours professionnel. Ce qui les distingue : une réorientation reste généralement dans un domaine proche de celui déjà connu. Une reconversion implique un changement plus complet de métier ou de secteur, en s'appuyant sur des compétences transférables, une nouvelle formation, ou les deux.",
    relations: [
      { ficheId: 'reorientation-professionnelle', type: 'voir-aussi' }, { ficheId: 'reconversion', type: 'voir-aussi' }
    ]
  },
  {
    id: 'reconversion-ou-evolution', titre: 'Reconversion ou évolution professionnelle ?', titreDeTri: 'Reconversion ou évolution professionnelle',
    type: 'notion', gabarit: 'comparatif', univers: 'accompagnement-insertion', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux font progresser un parcours professionnel dans le temps. Ce qui les distingue : une évolution professionnelle reste dans le même métier ou le même secteur, avec davantage de responsabilités ou un poste différent dans la même filière. Une reconversion change de métier ou de secteur, en s'appuyant sur des compétences transférables, une nouvelle formation, ou les deux.",
    relations: [
      { ficheId: 'evolution-professionnelle', type: 'voir-aussi' }, { ficheId: 'reconversion', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ats', titre: 'ATS', titreDeTri: 'ATS', type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['logiciel de tri des candidatures', 'logiciel de recrutement', 'mots-clés du CV', 'robot qui trie les CV'],
    corps: "Un ATS (Applicant Tracking System, logiciel de suivi des candidatures) est un outil utilisé par de nombreux recruteurs pour trier automatiquement les CV reçus, souvent avant qu'une personne ne les lise. Il repère des mots-clés précis, ce qui explique pourquoi une mise en forme trop complexe peut nuire à sa lecture par ce type de logiciel.",
    relations: [
      { ficheId: 'cv-lecture-recruteur', type: 'voir-aussi' }
    ]
  },
  {
    id: 'soft-skills-ou-hard-skills', titre: 'Soft skills ou hard skills ?', titreDeTri: 'Soft skills ou hard skills',
    type: 'notion', gabarit: 'comparatif', univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : hard skills et soft skills sont les équivalents anglais de savoir-faire et savoir-être, de plus en plus utilisés dans les offres d'emploi et sur les réseaux professionnels. Ce qui les distingue : rien de plus que le vocabulaire employé, la distinction reste exactement la même (voir « Savoir-être ou savoir-faire ? » pour le détail).",
    relations: [
      { ficheId: 'savoir-etre-ou-savoir-faire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rqth-ou-invalidite', titre: 'RQTH ou invalidité ?', titreDeTri: 'RQTH ou invalidité',
    type: 'notion', gabarit: 'comparatif', univers: 'sante-travail', registres: ['langage-administratif'],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des reconnaissances administratives liées à un état de santé qui affecte la vie professionnelle. Ce qui les distingue : la RQTH est délivrée par la MDPH et vise à faciliter l'accès et le maintien dans l'emploi, avec des dispositifs d'accompagnement dédiés. L'invalidité est reconnue par la Sécurité sociale et ouvre droit à une pension qui compense une perte de capacité de travail. Les deux reconnaissances peuvent être cumulées.",
    relations: [
      { ficheId: 'rqth', type: 'voir-aussi' },
      { ficheId: 'pension-invalidite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cep', titre: 'CEP', titreDeTri: 'CEP', type: 'terme',
    univers: 'dispositifs', registres: ['langage-france-travail', 'langage-cip'],
    variantesRecherche: ['conseil en évolution professionnelle', 'faire le point sur mon avenir professionnel'],
    corps: "Le CEP (conseil en évolution professionnelle) est un accompagnement gratuit et confidentiel, ouvert à toute personne active, pour faire le point sur sa situation professionnelle et construire un projet d'évolution ou de reconversion. Il est proposé par plusieurs organismes habilités, dont France Travail.",
    relations: [
      { ficheId: 'bilan-competences', type: 'voir-aussi' }, { ficheId: 'projet-professionnel', type: 'voir-aussi' },
      { ficheId: 'transitions-pro', type: 'voir-aussi' }
    ]
  },
  {
    id: 'iae', titre: "L'insertion par l'activité économique (IAE)", titreDeTri: 'IAE', type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ["secteur de l'insertion"],
    corps: "L'IAE (insertion par l'activité économique) est le secteur qui regroupe l'ensemble des structures proposant un emploi encadré à des personnes rencontrant des difficultés particulières d'accès au marché du travail classique. Les SIAE sont les structures concrètes qui mettent en œuvre l'IAE sur le terrain.",
    relations: [
      { ficheId: 'siae', type: 'voir-aussi' },
      { ficheId: 'pass-iae', type: 'voir-aussi' },
      { ficheId: 'france-travail-justice', type: 'voir-aussi' }
    ]
  },
  {
    id: 'reseau-pour-emploi', titre: "Réseau Pour l'Emploi", titreDeTri: "Réseau Pour l'Emploi", type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ["coordination des acteurs de l'emploi", "ex service public de l'emploi"],
    corps: "Le Réseau Pour l'Emploi est le cadre de coopération créé par la loi pour le plein emploi pour mieux coordonner les acteurs de l'accompagnement vers l'emploi et de l'insertion. Il réunit l'État, la région, les départements, les communes, France Travail, les Missions Locales et le réseau Cap Emploi, autour d'objectifs communs et d'un partage d'informations facilité entre eux, pour limiter les ruptures de suivi d'une personne d'une structure à l'autre. Il s'ouvre aussi à d'autres structures (insertion par l'activité économique, plans locaux pour l'insertion et l'emploi, entreprises de travail temporaire, groupements d'employeurs). Il remplace l'ancienne notion de « service public de l'emploi ».",
    relations: [
      { ficheId: 'france-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cip', titre: 'Le rôle du CIP', titreDeTri: 'CIP',
    type: 'notion', gabarit: 'role', univers: 'structures-organismes', registres: ['langage-cip'],
    variantesRecherche: ['conseiller en insertion professionnelle', 'mon CIP'],
    corps: "Un CIP (conseiller en insertion professionnelle) accompagne une personne dans la construction et la mise en œuvre de son projet professionnel. Le terme désigne le métier plutôt qu'une structure précise : un CIP peut exercer au sein d'une Mission Locale, d'une SIAE ou d'un autre organisme d'accompagnement.",
    relations: [
      { ficheId: 'mission-locale', type: 'voir-aussi' }, { ficheId: 'diagnostic-partage', type: 'voir-aussi' }
    ]
  },
  {
    id: 'plie', titre: 'PLIE', titreDeTri: 'PLIE', type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ["plan local pour l'insertion et l'emploi"],
    corps: "Le PLIE (plan local pour l'insertion et l'emploi) est un dispositif territorial qui coordonne les actions de plusieurs acteurs (structures d'insertion, employeurs, collectivités, entre autres) pour accompagner vers l'emploi les personnes rencontrant des difficultés particulières, sur un bassin géographique donné.",
    relations: [
      { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'dialogue-social', titre: 'Dialogue social', titreDeTri: 'Dialogue social', type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique', 'langage-rh'],
    variantesRecherche: ['négociation collective', 'relations avec les représentants du personnel'],
    corps: "Le dialogue social désigne l'ensemble des échanges, négociations et consultations entre un employeur et les représentants des salariés, à différents niveaux (entreprise, branche professionnelle, ou niveau national). Il vise à construire des règles communes ou à résoudre des désaccords, sans passer systématiquement par un conflit ouvert.",
    relations: [
      { ficheId: 'cse', type: 'voir-aussi' }, { ficheId: 'convention-collective', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cse', titre: 'CSE', titreDeTri: 'CSE', type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique', 'langage-rh'],
    variantesRecherche: ['comité social et économique', 'représentants du personnel'],
    corps: "Le CSE (comité social et économique) est l'instance qui représente les salariés auprès de l'employeur dans une entreprise, à partir d'un certain effectif. Il est consulté sur les décisions importantes de l'entreprise et peut alerter sur des situations problématiques, par exemple liées aux conditions de travail.",
    relations: [
      { ficheId: 'delegue-syndical', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'discrimination-embauche', titre: "Discrimination à l'embauche", titreDeTri: "Discrimination a l'embauche", type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-juridique'],
    variantesRecherche: ["refus injustifié à l'embauche"],
    corps: "La discrimination à l'embauche désigne le fait d'écarter une candidature pour un motif interdit par la loi (origine, sexe, âge, situation de famille, état de santé ou handicap, entre autres), sans lien avec les compétences requises pour le poste. Elle est distincte d'une décision de recrutement fondée sur des critères professionnels, même quand celle-ci est ressentie comme injuste.",
    relations: [
      { ficheId: 'casier-judiciaire', type: 'voir-aussi' },
      { ficheId: 'conge-maternite-paternite', type: 'voir-aussi' },
      { ficheId: 'index-egalite-professionnelle', type: 'voir-aussi' }
    ]
  },
  {
    id: 'obligations-employeur-embauche', titre: "Ce que l'employeur doit faire pour embaucher",
    titreDeTri: "Ce que l'employeur doit faire pour embaucher", type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-employeur', 'langage-administratif'],
    variantesRecherche: ['déclaration préalable à embauche', 'DPAE', 'formalités embauche employeur'],
    corps: "Avant même qu'une personne commence à travailler, l'employeur doit accomplir plusieurs démarches obligatoires, quelle que soit la taille de l'entreprise : la déclaration préalable à l'embauche (DPAE) auprès de l'Urssaf, qui déclenche en une fois l'immatriculation à la Sécurité sociale et l'affiliation à un service de santé au travail ; l'inscription au registre unique du personnel ; pour une personne étrangère, la vérification de son autorisation de travail ; l'information de la personne sur les éléments essentiels du poste dès le début du contrat ; et le déclenchement d'une visite médicale dans les mois qui suivent la prise de poste. Ne pas les respecter, en particulier l'absence de DPAE, expose l'employeur à des sanctions pénales pour travail illégal : ce n'est pas une formalité facultative. Des dispositifs existent pour alléger cette charge dans les petites structures, comme le titre emploi-service entreprise. Pour vous, concrètement : ces démarches vous protègent dès le premier jour, même si vous n'en voyez pas la trace immédiatement (elles se font auprès de l'Urssaf, pas sur votre bulletin de paie). Si vous travaillez déjà sans jamais avoir reçu de contrat ni de bulletin de paie, c'est un signal à ne pas laisser filer : cela peut vouloir dire que ces démarches n'ont pas été faites.",
    relations: [
      { ficheId: 'cout-employeur', type: 'voir-aussi' },
      { ficheId: 'autorisation-de-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'portage-salarial', titre: 'Portage salarial', titreDeTri: 'Portage salarial', type: 'terme',
    univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: ["travailler en indépendant sans créer d'entreprise"],
    corps: "Le portage salarial permet à une personne d'exercer une activité en tant qu'indépendant tout en conservant un statut de salarié, grâce à une société de portage qui facture les clients à sa place et lui reverse un salaire après déduction de frais de gestion et de cotisations sociales.",
    relations: []
  },
  {
    id: 'profession-liberale', titre: 'Profession libérale', titreDeTri: 'Profession libérale', type: 'terme',
    univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: [],
    corps: "Une profession libérale est une activité indépendante, généralement de nature intellectuelle ou technique, exercée sous la responsabilité personnelle de la personne qui la pratique, dans un cadre réglementé ou non. Elle se distingue du salariat par l'absence de lien de subordination avec un employeur.",
    relations: []
  },
  {
    id: 'auto-entrepreneur-portage-liberale', titre: 'Auto-entrepreneur, portage salarial ou profession libérale ?', titreDeTri: 'Auto-entrepreneur, portage salarial ou profession libérale',
    type: 'notion', gabarit: 'comparatif', univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: [],
    corps: "Les trois permettent d'exercer une activité indépendante, mais avec des degrés de protection et de simplicité différents. L'auto-entrepreneur gère seul son activité, avec des démarches simplifiées mais peu de protection sociale au-delà de l'activité elle-même. Le portage salarial conserve un statut de salarié via une société de portage, avec une protection sociale plus proche de celle d'un salarié classique, en échange de frais de gestion. La profession libérale exerce sous sa propre responsabilité, souvent dans un cadre réglementé, avec une gestion administrative plus complète que l'auto-entrepreneuriat.",
    relations: [
      { ficheId: 'auto-entrepreneur', type: 'voir-aussi' }, { ficheId: 'portage-salarial', type: 'voir-aussi' }, { ficheId: 'profession-liberale', type: 'voir-aussi' }
    ]
  },

  // TACHE (chantier "Ressources - 2e moitie", etape 5b, 2026-08-29) :
  // fiches ecrites pour donner aux freins langue / illettrisme /
  // illectronisme / judiciaire (data/freins.js) une entree Lexique vers
  // laquelle pointer. Contenu factuel (casier judiciaire verifie sur
  // service-public.gouv.fr). Le "comment lever" et les ressources restent
  // dans data/freins.js, rendus sous la definition (voir _lexiqueRenduFiche).
  {
    id: 'illettrisme', titre: 'Illettrisme', titreDeTri: 'Illettrisme', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['ne sait pas lire', 'difficulte a lire et ecrire', 'sait pas ecrire'],
    corps: "L'illettrisme désigne la situation d'une personne qui a été scolarisée en France mais n'a pas acquis, ou a perdu, une maîtrise suffisante de la lecture, de l'écriture et du calcul pour être autonome dans les situations courantes de la vie professionnelle et quotidienne. Il se distingue de l'analphabétisme (personne jamais scolarisée) et de l'apprentissage du français par une personne d'une autre langue maternelle.",
    relations: [
      { ficheId: 'fle', type: 'a-ne-pas-confondre' },
      { ficheId: 'illectronisme', type: 'a-ne-pas-confondre' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'fle', titre: 'FLE (français langue étrangère)', titreDeTri: 'FLE francais langue etrangere', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['apprendre le francais', 'cours de francais', 'parle mal le francais', 'FLI'],
    corps: "Le FLE (français langue étrangère) désigne l'apprentissage du français par une personne dont ce n'est pas la langue maternelle. Il se distingue de l'illettrisme, qui concerne une personne scolarisée en français n'en ayant pas gardé une maîtrise suffisante. Des formations linguistiques existent, notamment via l'OFII pour les personnes signataires du contrat d'intégration républicaine (CIR).",
    relations: [
      { ficheId: 'illettrisme', type: 'a-ne-pas-confondre' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'francais-a-visee-professionnelle', type: 'voir-aussi' }
    ]
  },
  {
    id: 'illectronisme', titre: 'Illectronisme', titreDeTri: 'Illectronisme', type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-cip'],
    variantesRecherche: ['pas a l aise avec l ordinateur', 'difficulte avec le numerique', 'sait pas se servir d internet', 'fracture numerique'],
    corps: "L'illectronisme désigne la difficulté, voire l'incapacité, à utiliser les outils numériques (ordinateur, smartphone, internet) pour des usages courants : messagerie, démarches administratives en ligne, recherche d'emploi. Il ne dépend pas de l'âge et peut coexister avec une bonne maîtrise de la lecture et de l'écriture. Des aidants numériques et des lieux dédiés (France Services, espaces publics numériques) aident à le réduire.",
    relations: [
      { ficheId: 'illettrisme', type: 'a-ne-pas-confondre' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'casier-judiciaire', titre: 'Casier judiciaire', titreDeTri: 'Casier judiciaire', type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['bulletin numero 3', 'b3', 'antecedents judiciaires', 'condamnation et emploi'],
    corps: "Le casier judiciaire recense les condamnations pénales d'une personne, réparties en trois bulletins. Le bulletin n°1 n'est accessible qu'aux autorités judiciaires. Le bulletin n°2 est transmis à certaines administrations et à des employeurs pour des emplois précis (fonctions réglementées, ou en contact avec des mineurs ou des personnes vulnérables). Le bulletin n°3 ne peut être demandé que par la personne elle-même, qui décide de le présenter ou non. Pour la plupart des emplois, un employeur privé ne peut pas exiger la communication du casier.",
    relations: [
      { ficheId: 'discrimination-embauche', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'rehabilitation', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aide-alimentaire', titre: 'Aide alimentaire', titreDeTri: 'Aide alimentaire', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['colis alimentaire', 'epicerie sociale', 'restos du coeur', 'plus rien a manger'],
    corps: "L'aide alimentaire regroupe les dispositifs qui permettent de se procurer de la nourriture gratuitement ou à faible coût quand le budget ne suffit plus : distribution de colis (Banques Alimentaires, Restos du Cœur, Secours Populaire, Croix-Rouge), épiceries sociales et solidaires (où l'on paie une petite partie du prix), repas servis par certaines associations. L'accès passe souvent par une orientation du CCAS ou d'une assistante sociale, mais plusieurs structures accueillent aussi sans condition.",
    relations: [
      { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'secours-d-urgence', type: 'voir-aussi' }
    ]
  },
  {
    id: 'hebergement-urgence', titre: "Hébergement d'urgence", titreDeTri: 'Hebergement d urgence', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['115', 'dormir dehors', 'sans logement', 'mise a l abri'],
    corps: "L'hébergement d'urgence désigne les solutions de mise à l'abri immédiate pour une personne sans logement : nuitées en centre d'hébergement, en hôtel social, ou places d'urgence. La demande se fait en appelant le 115 (gratuit, 24h/24), qui oriente selon les places disponibles. Il se distingue de l'hébergement d'insertion, plus durable et avec accompagnement, et du logement autonome.",
    relations: [
      { ficheId: 'urgence-besoins-vitaux', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aide-materielle', titre: 'Aide matérielle', titreDeTri: 'Aide materielle', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['vestiaire solidaire', 'vetements', 'meubles', 'depannage materiel'],
    corps: "L'aide matérielle regroupe le dépannage en biens de première nécessité : vêtements, produits d'hygiène, mobilier, équipement pour un bébé, parfois des vêtements de travail pour reprendre un emploi. Des vestiaires solidaires et des recycleries (Secours Populaire, Croix-Rouge, Emmaüs) en proposent, souvent sans condition de ressources ou sur orientation sociale.",
    relations: [
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'violences', titre: 'Violences (et parcours professionnel)', titreDeTri: 'Violences et parcours professionnel', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['violences conjugales', '3919', 'harcelement', 'peur a la maison'],
    corps: "Des violences subies, dans le couple, la famille ou au travail, peuvent peser lourdement sur un parcours professionnel : arrêts, isolement, perte de logement, difficulté à se projeter. En parler n'oblige jamais à porter plainte. Le 3919 (gratuit, anonyme, 24h/24) écoute et oriente ; en cas de danger immédiat, le 17. Des associations spécialisées (CIDFF, France Victimes) accompagnent dans la durée, y compris sur le logement et l'emploi. Deux leviers existent déjà côté emploi : l'aide universelle d'urgence, versée par la CAF ou la MSA pour faire face aux dépenses immédiates en s'éloignant ; et, si un déménagement lié aux violences oblige à quitter un poste, une démission reconnue « légitime », qui ouvre malgré tout droit à l'allocation chômage.",
    relations: [
      { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'demission-legitime', type: 'voir-aussi' },
      { ficheId: 'caf', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aide-a-la-mobilite', titre: 'Aide à la mobilité', titreDeTri: 'Aide a la mobilite', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['aide au permis', 'permis de conduire', 'frais de deplacement', 'se deplacer pour un emploi'],
    corps: "L'aide à la mobilité de France Travail peut prendre en charge une partie des frais de déplacement, de repas ou d'hébergement liés à une recherche d'emploi, une reprise de travail ou une formation éloignée (plus de 60 km ou 2 heures aller-retour du domicile). Elle s'adresse surtout aux personnes inscrites et non indemnisées, ou faiblement indemnisées. Elle ne finance pas le permis de conduire : l'aide au permis B versée par France Travail a pris fin le 1er avril 2026. Pour le permis, d'autres pistes existent : aides du conseil régional, financement par le CPF, auto-écoles sociales et solidaires. En parler à son conseiller ou à un travailleur social permet de voir ce qui est possible.",
    relations: [
      { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'aide-carburant-grands-rouleurs', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aide-carburant-grands-rouleurs', titre: 'Aide carburant « grands rouleurs »', titreDeTri: 'Aide carburant grands rouleurs', type: 'terme',
    univers: 'mobilite-budget', registres: ['langage-administratif'],
    variantesRecherche: ['aide 100 euros carburant', 'grand rouleur', 'aide trajet domicile travail voiture'],
    corps: "Une aide de 100 € existe pour les personnes qui utilisent beaucoup leur véhicule pour se rendre au travail : au moins 15 km par trajet domicile-travail, ou au moins 8 000 km par an pour un motif professionnel. Elle est réservée aux foyers sous un plafond de ressources et suppose d'avoir résidé fiscalement en France l'année de référence. La demande, à faire en ligne, a une fenêtre limitée dans le temps, régulièrement prolongée : mieux vaut vérifier la date limite en cours plutôt que de se fier à une date déjà passée.",
    relations: [
      { ficheId: 'aide-a-la-mobilite', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'surendettement', titre: 'Surendettement', titreDeTri: 'Surendettement', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['dossier de surendettement', 'banque de france', 'trop de dettes', 'retablissement personnel'],
    corps: "Le surendettement, c'est quand une personne ne peut plus faire face à ses dettes (crédits, loyers en retard, factures) malgré ses efforts. On peut déposer un dossier de surendettement à la Banque de France, en ligne, par courrier ou en agence : c'est un service public et c'est gratuit. Une commission examine la situation, en général en cinq à six semaines, puis propose une solution : délais de paiement, réaménagement des dettes, ou effacement quand la situation est trop bloquée. Un travailleur social (CCAS, Maison des solidarités) peut aider à constituer le dossier.",
    relations: [
      { ficheId: 'assistante-sociale', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'recevabilite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'credit-conso-nouvelles-regles-2026', titre: 'De nouvelles règles pour le crédit à la consommation (2026)', titreDeTri: 'Nouvelles regles credit a la consommation 2026', type: 'terme',
    univers: 'mobilite-budget', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['crédit à la consommation nouvelles règles', 'prévention du surendettement crédit', 'mini-crédit encadré'],
    corps: "À partir du 20 novembre 2026, les règles de protection sur le crédit à la consommation s'étendent à des crédits jusque-là moins encadrés : crédits sans frais ni intérêts, crédits de moins de 200 €, crédits très courts (moins de 3 mois) et locations avec option d'achat. Les publicités devront afficher un avertissement sur le coût du crédit et ne plus mettre en avant la facilité d'y accéder. L'objectif est de prévenir le surendettement, notamment celui qui vient de petits crédits répétés qui s'accumulent sans qu'on s'en rende compte.",
    relations: [
      { ficheId: 'surendettement', type: 'voir-aussi' },
      { ficheId: 'reste-a-vivre', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aides-garde-enfants', titre: "Aides à la garde d'enfants", titreDeTri: 'Aides a la garde d enfants', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['AGEPI', 'aide a la garde d enfants', 'faire garder mon enfant', 'complement mode de garde'],
    corps: "L'AGE (Aide à la Garde d'Enfants) de France Travail aide à payer la garde d'un ou plusieurs enfants de moins de 12 ans au moment d'une reprise d'emploi ou d'une entrée en formation. Depuis 2024, elle a remplacé l'AGEPI et n'est plus réservée aux parents seuls : toutes les familles concernées peuvent la demander. C'est une somme forfaitaire, qui varie selon le nombre d'enfants et le nombre d'heures ; elle se demande depuis l'espace personnel France Travail, dans le mois qui suit la reprise ou l'entrée en formation. La CAF propose aussi un complément pour le mode de garde, et les crèches appliquent des tarifs adaptés aux revenus.",
    relations: [
      { ficheId: 'caf', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'monoparentalite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'monoparentalite', titre: "Monoparentalité et allocation de soutien familial (ASF)", titreDeTri: 'Monoparentalite et allocation de soutien familial',
    type: 'terme', univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ['parent isolé', 'ASF', 'élever seul son enfant', 'enfant privé de l’aide d’un parent'],
    corps: "Un parent est considéré isolé quand il élève seul un ou plusieurs enfants, sans aide de l'autre parent (absence, décès, non-reconnaissance...). Cette situation ouvre droit à l'allocation de soutien familial (ASF), versée par la CAF ou la MSA sans condition de ressources. Elle se cumule avec d'autres aides : le RSA est majoré pour un parent isolé, et les démarches de garde d'enfant (crèche, aide à la garde) tiennent compte de cette situation dans les priorités d'accès.",
    relations: [
      { ficheId: 'aides-garde-enfants', type: 'voir-aussi' },
      { ficheId: 'rsa', type: 'voir-aussi' },
      { ficheId: 'caf', type: 'voir-aussi' }
    ]
  },
  {
    id: 'proche-aidant', titre: 'Proche aidant : congé et allocation (AJPA)', titreDeTri: 'Proche aidant conge et allocation AJPA',
    type: 'terme', univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ['congé de proche aidant', 'AJPA', 'aider un parent malade en travaillant', 'accompagner un proche dépendant'],
    corps: "Le congé de proche aidant permet de suspendre ou réduire son activité pour accompagner un proche en perte d'autonomie ou en situation de handicap (conjoint, parent, enfant, ou une personne avec qui existent des liens étroits et stables). Pendant ce congé, l'allocation journalière du proche aidant (AJPA), versée par la CAF ou la MSA, compense en partie la perte de revenu, dans la limite de 66 jours par personne aidée ; ce plafond peut être repris pour accompagner jusqu'à quatre proches différents au cours d'une carrière. Le contrat de travail est suspendu, jamais rompu : le poste est retrouvé à la fin du congé.",
    relations: [
      { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'mdph', type: 'voir-aussi' },
      { ficheId: 'assistante-sociale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'conge-maternite-paternite', titre: 'Congés maternité et paternité : protection de l’emploi', titreDeTri: 'Conges maternite et paternite protection de l emploi',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['grossesse et licenciement', 'protection grossesse travail', 'reprendre son poste après un congé maternité', 'congé paternité droits'],
    corps: "Pendant toute la grossesse et pendant les dix semaines qui suivent le retour de congé maternité, un licenciement est en principe nul, sans que la salariée ait à prouver un lien avec sa grossesse ; elle peut demander sa réintégration. Le congé paternité bénéficie d'une protection proche : l'employeur ne peut pas licencier pendant ce congé, sauf faute grave ou motif étranger à la naissance. Dans les deux cas, la personne retrouve son emploi ou un poste équivalent, avec au moins la même rémunération, à son retour.",
    relations: [
      { ficheId: 'discrimination-embauche', type: 'voir-aussi' },
      { ficheId: 'aides-garde-enfants', type: 'voir-aussi' },
      { ficheId: 'caf', type: 'voir-aussi' }
    ]
  },
  {
    id: 'assistante-sociale', titre: 'Assistante sociale de secteur', titreDeTri: 'Assistante sociale de secteur', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['assistant social', 'travailleur social', 'maison des solidarites', 'a qui demander de l aide'],
    corps: "L'assistante sociale de secteur (on dit aussi assistant de service social) accompagne gratuitement les habitants d'un territoire sur le budget, le logement, l'accès aux droits et les démarches administratives. Elle est rattachée au Département, le plus souvent dans une Maison des solidarités (MDS), ou au CCAS de la mairie. Pour la rencontrer, on contacte la mairie, le CCAS ou la MDS de son lieu d'habitation et on demande un rendez-vous avec le service social. C'est souvent le bon point de départ quand plusieurs difficultés se cumulent et qu'on ne sait pas par où commencer.",
    relations: [
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'addictologie', titre: 'Addictologie (CSAPA)', titreDeTri: 'Addictologie CSAPA', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['CSAPA', 'addiction', 'arreter de consommer', 'consultation addiction'],
    corps: "Un CSAPA (Centre de Soins, d'Accompagnement et de Prévention en Addictologie) accueille gratuitement et de façon anonyme toute personne en difficulté avec l'alcool, le tabac, le cannabis, les médicaments, d'autres produits, ou des comportements comme les jeux ou les écrans. Les proches peuvent aussi y être reçus. L'équipe est pluridisciplinaire : accompagnement médical, psychologique et social, à son rythme. Il n'est pas nécessaire d'avoir décidé d'arrêter pour venir en parler. Drogues Info Service (0 800 23 13 13, gratuit et anonyme) informe et oriente vers le centre le plus proche.",
    relations: [
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'visite-entreprise', titre: "Visite d'entreprise", titreDeTri: 'Visite d entreprise', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['visite entreprise', 'decouverte metier', 'visite de site', 'aller voir une entreprise'],
    corps: "Une visite d'entreprise permet de découvrir sur place un métier, un secteur ou un environnement de travail : on voit les postes, on échange avec des professionnels, on repère les conditions réelles comme les horaires, les gestes ou l'ambiance. Elle est souvent organisée en groupe par une Mission Locale, France Travail, un ERIP ou une école, sur une demi-journée. Elle ne remplace pas une immersion : elle sert à confirmer ou écarter une piste avant d'aller plus loin.",
    relations: [
      { ficheId: 'pmsmp', type: 'a-ne-pas-confondre' },
      { ficheId: 'projet-professionnel', type: 'voir-aussi' }
    ]
  },
  {
    id: 'atelier-thematique', titre: 'Atelier thématique', titreDeTri: 'Atelier thematique', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['atelier collectif', 'atelier emploi', 'atelier cv', 'participer a un atelier'],
    corps: "Un atelier thématique est une séance courte, en petit groupe, animée par un professionnel, sur un sujet précis : rédiger un CV, préparer un entretien, comprendre ses droits à la formation, se repérer dans le numérique, connaître ses droits en cas de maladie ou de handicap. On y vient pour une question ciblée, sans engagement de parcours. Beaucoup de structures d'accompagnement en proposent un programme régulier, souvent gratuit.",
    relations: [
      { ficheId: 'mission-locale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'mobilite-internationale', titre: 'Mobilité internationale', titreDeTri: 'Mobilite internationale', type: 'terme',
    univers: 'dispositifs', registres: ['langage-cip'],
    variantesRecherche: ['partir a l etranger', 'travailler a l etranger', 'erasmus', 'stage etranger'],
    corps: "La mobilité internationale regroupe les dispositifs pour se former, faire un stage ou travailler dans un autre pays. Erasmus+ finance des périodes de formation ou de stage à l'étranger, y compris pour des demandeurs d'emploi et des apprentis, en prenant en charge une partie des frais. Le Corps européen de solidarité propose des missions de volontariat aux 18-30 ans. Le réseau EURES rassemble les offres d'emploi et les informations pays par pays en Europe. Une Mission Locale peut aider à monter une convention de stage à l'étranger.",
    relations: [
      { ficheId: 'stage', type: 'voir-aussi' },
      { ficheId: 'alternance', type: 'voir-aussi' }
    ]
  },
  {
    id: 'job-dating', titre: "Job dating et forums de l'emploi", titreDeTri: 'Job dating et forums de l emploi', type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-cip'],
    variantesRecherche: ['job dating', 'forum emploi', 'salon de recrutement', 'rencontrer des employeurs'],
    corps: "Un job dating est une série d'entretiens très courts, quelques minutes chacun, avec plusieurs employeurs qui recrutent, le même jour au même endroit. Un forum de l'emploi est un salon où des entreprises tiennent des stands pour présenter leurs postes et recevoir des candidatures. Dans les deux cas, on vient avec des CV, on prépare une présentation de soi d'une à deux minutes, et un premier échange peut déboucher sur un rendez-vous plus formel.",
    relations: [
      { ficheId: 'reseau-pour-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'parrainage-vers-l-emploi', titre: "Parrainage vers l'emploi", titreDeTri: 'Parrainage vers l emploi', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['parrainage emploi', 'parrain marraine', 'etre parraine', 'mentor emploi'],
    corps: "Dans le parrainage vers l'emploi, un professionnel en activité ou en retraite accompagne bénévolement une personne dans sa recherche : il partage son réseau, explique les codes du secteur, aide à préparer les entretiens et apporte un regard extérieur. La relation dure en général quelques mois, avec des échanges réguliers. Le dispositif est porté par France Travail, des Missions Locales et des associations ; il ne remplace pas l'accompagnement d'un conseiller, il s'y ajoute.",
    relations: [
      { ficheId: 'reseau-pour-emploi', type: 'voir-aussi' },
      { ficheId: 'groupe-de-pairs', type: 'voir-aussi' }
    ]
  },
  {
    id: 'groupe-de-pairs', titre: 'Groupe de pairs', titreDeTri: 'Groupe de pairs', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['groupe d entraide', 'groupe de parole', 'entraide demandeurs d emploi', 'pair aidance'],
    corps: "Un groupe de pairs réunit des personnes qui vivent une situation proche, par exemple une recherche d'emploi ou une reconversion, pour partager leurs expériences, leurs pistes et leurs difficultés. L'échange entre personnes qui se comprennent aide à garder une dynamique, à relativiser et à trouver des idées concrètes. Il peut être animé par un professionnel ou fonctionner en autonomie ; il complète un accompagnement individuel, sans le remplacer.",
    relations: [
      { ficheId: 'parrainage-vers-l-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'o2r', titre: 'O2R (Offre de Repérage et de Remobilisation)', titreDeTri: 'O2R Offre de Reperage et de Remobilisation', type: 'terme',
    univers: 'dispositifs', registres: ['langage-cip'],
    variantesRecherche: ['o2r', 'reperage et remobilisation', 'remobilisation', 'personnes invisibles emploi'],
    corps: "L'Offre de Repérage et de Remobilisation (O2R) s'adresse aux personnes éloignées de l'emploi qui ne sont plus suivies par les dispositifs habituels, parfois sans ressources ni accompagnement. Portée par des structures locales et financée par l'État en région, elle propose d'aller à la rencontre de ces personnes, de les aider à reprendre confiance et à avancer sur les démarches d'accès aux droits comme la santé, le logement ou la mobilité, avant d'envisager l'emploi ou la formation. L'entrée se fait sans condition de statut.",
    relations: [
      { ficheId: 'mission-locale', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Conditions de travail --

  {
    id: 'teletravail', titre: 'Télétravail', titreDeTri: 'Télétravail', type: 'terme',
    univers: 'conditions-travail', registres: ['langage-rh'],
    variantesRecherche: ['travailler à distance', 'travailler depuis chez soi'],
    corps: "Le télétravail consiste à exercer tout ou partie de son activité en dehors des locaux de l'employeur, le plus souvent depuis son domicile, en utilisant les technologies de l'information. Son organisation - nombre de jours, matériel fourni, horaires - est fixée par l'employeur ou par un accord, et varie beaucoup d'un poste à l'autre. Tous les métiers ne s'y prêtent pas de la même façon.",
    relations: [
      { ficheId: 'horaires-travail', type: 'voir-aussi' }, { ficheId: 'autonomie', type: 'voir-aussi' }
    ]
  },
  {
    id: 'horaires-travail', titre: 'Horaires de travail', titreDeTri: 'Horaires de travail', type: 'terme',
    univers: 'conditions-travail', registres: ['langage-rh'],
    variantesRecherche: ['horaires fixes', 'horaires variables', 'horaires flexibles'],
    corps: "Les horaires de travail peuvent être fixes (les mêmes chaque semaine, connus à l'avance) ou variables selon un planning communiqué régulièrement. Certains postes offrent une marge de choix sur l'heure d'arrivée ou de départ ; d'autres suivent des horaires imposés par l'activité (ouverture au public, travail en équipe, production continue).",
    relations: [
      { ficheId: 'travail-de-nuit', type: 'voir-aussi' }, { ficheId: 'temps-partiel', type: 'voir-aussi' }, { ficheId: 'teletravail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rythme-travail', titre: 'Rythme et variété des missions', titreDeTri: 'Rythme et variete des missions', type: 'terme',
    univers: 'conditions-travail', registres: ['langage-rh'],
    variantesRecherche: ['travail répétitif', 'tâches variées', 'monotonie au travail'],
    corps: "Un poste peut consister en des tâches répétitives, réalisées de façon identique tout au long de la journée, ou au contraire proposer des missions variées qui changent selon les besoins. Ni l'un ni l'autre n'est meilleur en soi : certaines personnes se sentent plus efficaces dans un cadre répétitif et prévisible, d'autres ont besoin de changement pour rester motivées.",
    relations: [
      { ficheId: 'polyvalence', type: 'voir-aussi' }
    ]
  },
  {
    id: 'travail-de-nuit', titre: 'Travail de nuit', titreDeTri: 'Travail de nuit', type: 'terme',
    univers: 'conditions-travail', registres: ['langage-rh', 'langage-juridique'],
    variantesRecherche: ['horaires de nuit', 'poste de nuit'],
    corps: "Le travail de nuit désigne une activité exercée sur une plage horaire nocturne définie par la loi ou un accord d'entreprise, généralement une partie de la période comprise entre 21h et 6h. Il concerne certains secteurs par nature (santé, sécurité, industrie continue) et ouvre droit à des contreparties spécifiques, comme un repos compensateur ou une majoration de salaire, dont le détail dépend de chaque entreprise ou convention collective.",
    relations: [
      { ficheId: 'astreintes', type: 'voir-aussi' }, { ficheId: 'convention-collective', type: 'voir-aussi' }
    ]
  },
  {
    id: 'astreintes', titre: 'Astreintes', titreDeTri: 'Astreintes', type: 'terme',
    univers: 'conditions-travail', registres: ['langage-rh', 'langage-juridique'],
    variantesRecherche: ['être d’astreinte', 'garde'],
    corps: "Une astreinte est une période pendant laquelle une personne, sans être sur son lieu de travail, doit rester disponible pour intervenir si besoin - par exemple par téléphone ou en se déplaçant rapidement. Ce temps n'est pas compté comme du temps de travail effectif, sauf lorsqu'une intervention a réellement lieu, mais il donne droit à une compensation, financière ou en repos, définie par l'employeur ou un accord.",
    relations: [
      { ficheId: 'travail-de-nuit', type: 'voir-aussi' }
    ]
  },
  {
    id: 'deplacements-professionnels', titre: 'Déplacements professionnels', titreDeTri: 'Deplacements professionnels', type: 'terme',
    univers: 'conditions-travail', registres: ['langage-rh'],
    variantesRecherche: ['poste itinérant', 'beaucoup de route', 'déplacements fréquents'],
    corps: "Certains postes demandent des déplacements réguliers - entre plusieurs sites, chez des clients, ou sur des chantiers - tandis que d'autres se déroulent entièrement sur un lieu fixe. La fréquence, la distance et le mode de transport (véhicule personnel, véhicule de service, transports en commun) varient beaucoup d'un métier à l'autre et méritent d'être clarifiés avant d'accepter un poste.",
    relations: [
      { ficheId: 'proximite-domicile-travail', type: 'voir-aussi' }, { ficheId: 'remboursement-frais', type: 'voir-aussi' }
    ]
  },
  {
    id: 'port-de-charges', titre: 'Port de charges et effort physique', titreDeTri: 'Port de charges et effort physique', type: 'terme',
    univers: 'conditions-travail', registres: ['langage-rh', 'langage-employeur'],
    variantesRecherche: ['travail physique', 'manutention', 'pénibilité'],
    corps: "Certains postes demandent un effort physique régulier - port de charges, station debout prolongée, gestes répétitifs - qui peut être précisé dans une offre d'emploi ou observé lors d'une immersion. Cette dimension physique du poste est propre à chaque métier et n'a pas de lien avec la valeur ou les compétences de la personne qui l'exerce.",
    relations: [
      { ficheId: 'medecine-travail', type: 'voir-aussi' }, { ficheId: 'amenagement-poste', type: 'voir-aussi' }
    ]
  },
  {
    id: 'environnement-travail', titre: 'Environnement de travail', titreDeTri: 'Environnement de travail', type: 'terme',
    univers: 'conditions-travail', registres: ['langage-rh'],
    variantesRecherche: ['travail en extérieur', 'travail au calme', 'environnement bruyant'],
    corps: "L'environnement de travail regroupe les conditions physiques dans lesquelles un poste s'exerce : en intérieur ou en extérieur, dans un lieu calme ou au contraire bruyant (atelier, chantier, espace ouvert), exposé ou non aux intempéries. Ces éléments influencent le confort au quotidien sans jamais constituer, à eux seuls, un critère de qualité du poste.",
    relations: [
      { ficheId: 'port-de-charges', type: 'voir-aussi' }, { ficheId: 'medecine-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'formation-prise-de-poste', titre: 'Formation et accompagnement à la prise de poste', titreDeTri: 'Formation, accompagnement a la prise de poste', type: 'terme',
    univers: 'conditions-travail', registres: ['langage-rh'],
    variantesRecherche: ['être formé au démarrage', 'accompagnement au démarrage', 'tutorat'],
    corps: "La façon dont une entreprise accompagne l'arrivée d'une nouvelle personne varie beaucoup : parcours d'intégration formalisé, tutorat par un collègue expérimenté, formation interne aux outils et méthodes, ou au contraire une prise de poste plus directe avec peu d'accompagnement. Ce point peut se demander directement en entretien, sans que ce soit perçu comme un manque de confiance en soi.",
    relations: [
      { ficheId: 'periode-essai', type: 'voir-aussi' }, { ficheId: 'poei', type: 'voir-aussi' }
    ]
  },
  {
    id: 'temps-partiel-choisi-ou-subi', titre: 'Temps partiel choisi ou subi ?', titreDeTri: 'Temps partiel choisi ou subi',
    type: 'notion', gabarit: 'comparatif', univers: 'conditions-travail', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : dans les deux cas, le contrat prévoit une durée de travail inférieure à un temps complet. Ce qui les distingue : un temps partiel choisi correspond à une demande de la personne elle-même (disponibilité, équilibre de vie), tandis qu'un temps partiel subi lui est imposé faute de proposition à temps complet - une distinction qui compte notamment pour l'accès à certains droits et allocations.",
    relations: [
      { ficheId: 'temps-partiel', type: 'voir-aussi' }, { ficheId: 'are', type: 'voir-aussi' }
    ]
  },
  {
    id: 'contact-public', titre: 'Contact avec le public', titreDeTri: 'Contact avec le public', type: 'terme',
    univers: 'conditions-travail', registres: ['langage-rh'],
    variantesRecherche: ['relation client', 'accueil du public', 'métier de contact'],
    corps: "Certains postes impliquent un contact régulier avec des clients, des usagers ou un public varié, tandis que d'autres se déroulent principalement en retrait, avec peu d'interactions extérieures à l'équipe. Cette dimension est distincte du travail en équipe, qui concerne les relations avec les collègues plutôt qu'avec des personnes extérieures.",
    relations: [
      { ficheId: 'esprit-equipe', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'proximite-domicile-travail', titre: 'Proximité domicile-travail', titreDeTri: 'Proximite domicile-travail', type: 'terme',
    univers: 'conditions-travail', registres: ['langage-rh'],
    variantesRecherche: ['temps de trajet', 'distance au travail'],
    corps: "La distance entre le domicile et le lieu de travail, ainsi que le temps de trajet réel qu'elle représente, varie fortement selon le moyen de transport disponible (véhicule personnel, transports en commun, vélo). Ce critère pèse souvent autant que le poste lui-même dans la décision d'accepter ou non une offre, en particulier quand la mobilité est limitée.",
    relations: [
      { ficheId: 'aide-a-la-mobilite', type: 'voir-aussi' }, { ficheId: 'bassin-emploi', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Dispositifs et structures d'insertion (ajout 2026-09-08, recherche dispositifs et fondations) --

  {
    id: 'erip', titre: 'ERIP', titreDeTri: 'ERIP', type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ["espace régional d'information de proximité", 'espace métiers', "où me renseigner sur les métiers et la formation"],
    corps: "Un ERIP (espace régional d'information de proximité) est un lieu d'accueil du réseau mis en place par la Région Nouvelle-Aquitaine. On peut y venir librement et gratuitement, à tout âge et quelle que soit sa situation, pour s'informer sur les métiers, la formation, la recherche d'emploi, la VAE ou la création d'entreprise, et être orienté vers le bon interlocuteur. Chaque ERIP est porté par une structure locale, souvent une mission locale, une maison de l'emploi ou un organisme de formation. Le réseau existe depuis 2020 : il a réuni sous un même nom des réseaux plus anciens, comme l'Espace métiers Aquitaine.",
    relations: [
      { ficheId: 'mission-locale', type: 'voir-aussi' }, { ficheId: 'cep', type: 'voir-aussi' }, { ficheId: 'vae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pait', titre: 'PAIT', titreDeTri: 'PAIT', type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['point accueil installation', "je veux m'installer en agriculture", 'devenir agriculteur'],
    corps: "Le PAIT (point accueil installation transmission) est le premier interlocuteur, gratuit et neutre, pour toute personne qui envisage de s'installer en agriculture ou de transmettre une exploitation. Il y en a un par département, à la chambre d'agriculture. On y explique les étapes, les contacts, les aides et les formations, et on oriente vers un conseiller qui suit le projet. Le PAIT tient aussi le répertoire des exploitations à reprendre.",
    relations: [
      { ficheId: 'erip', type: 'voir-aussi' }, { ficheId: 'bprea', type: 'voir-aussi' }
    ]
  },
  {
    id: 'bprea', titre: 'BPREA', titreDeTri: 'BPREA', type: 'terme',
    univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ["brevet professionnel responsable d'entreprise agricole", 'capacité professionnelle agricole', "se reconvertir dans l'agriculture"],
    corps: "Le BPREA (brevet professionnel responsable d'entreprise agricole) est un diplôme de niveau bac, en formation continue, souvent en un an, en centre ou à distance. Il forme des chefs d'exploitation : conduite des productions, gestion, commercialisation. Il s'obtient bloc par bloc. C'est la voie la plus courante pour une reconversion vers l'agriculture, car il donne la capacité professionnelle agricole, exigée pour s'installer avec les aides publiques.",
    relations: [
      { ficheId: 'pait', type: 'voir-aussi' }, { ficheId: 'dnja', type: 'voir-aussi' }, { ficheId: 'reconversion', type: 'voir-aussi' }
    ]
  },
  {
    id: 'dnja', titre: 'DNJA (ex-DJA)', titreDeTri: 'DNJA', type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['dotation nouveaux et jeunes agriculteurs', 'dotation jeune agriculteur', "aide à l'installation en agriculture"],
    corps: "La DNJA (dotation nouveaux et jeunes agriculteurs) est une aide versée en capital au moment de l'installation en agriculture, cofinancée par la Région et l'Europe. En Nouvelle-Aquitaine, depuis 2023, elle a remplacé la DJA (dotation jeune agriculteur) et l'ouvre plus largement : de 18 à 55 ans, avec un diplôme agricole ou une expérience équivalente. Son montant dépend de la zone et du projet. La demande passe par le PAIT puis un plan de professionnalisation.",
    relations: [
      { ficheId: 'pait', type: 'voir-aussi' }, { ficheId: 'bprea', type: 'voir-aussi' }
    ]
  },
  {
    id: 'fondation-2eme-chance', titre: 'La Fondation de la 2ème Chance', titreDeTri: "Fondation de la 2ème Chance", type: 'terme',
    univers: 'dispositifs', registres: [],
    variantesRecherche: ['fondation deuxième chance', 'aide de dernier recours pour se former', 'aide après une épreuve de vie'],
    corps: "La Fondation de la 2ème Chance aide des personnes de 18 à 62 ans qui ont traversé de lourdes épreuves de vie, sont aujourd'hui en situation de précarité, et portent un projet concret. Elle finance une formation qualifiante (jusqu'à 5 000 euros) ou une création ou reprise d'entreprise (jusqu'à 8 000 euros), avec un parrainage par un bénévole. C'est une aide de dernier recours : il faut avoir cherché les autres financements avant. Le dossier se monte avec une structure d'accompagnement.",
    relations: [
      { ficheId: 'reconversion', type: 'voir-aussi' }, { ficheId: 'frein-emploi', type: 'voir-aussi' }, { ficheId: 'cep', type: 'voir-aussi' }
    ]
  },
  {
    id: 'clause-sociale', titre: "La clause sociale d'insertion", titreDeTri: "Clause sociale d'insertion", type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ["clause d'insertion", "insertion dans un marché public", 'marché public insertion'],
    corps: "La clause sociale d'insertion est une obligation inscrite dans un marché public : l'entreprise qui décroche le marché doit réserver un volume d'heures de travail (les heures d'insertion) à des personnes éloignées de l'emploi. Ces heures correspondent à un vrai poste, payé normalement. L'entreprise embauche directement, passe par une structure d'insertion, ou propose une alternance. On y accède par l'intermédiaire d'un facilitateur, sur orientation de son conseiller. Depuis le 22 août 2026, la clause devient obligatoire sur les marchés publics les plus importants.",
    relations: [
      { ficheId: 'facilitateur-clause-sociale', type: 'voir-aussi' }, { ficheId: 'maitre-ouvrage-ou-maitre-oeuvre', type: 'voir-aussi' }, { ficheId: 'iae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'facilitateur-clause-sociale', titre: 'Le facilitateur de la clause sociale', titreDeTri: 'Facilitateur de la clause sociale', type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['facilitateur clause sociale', "qui gère les heures d'insertion", 'assistant à maîtrise d\'ouvrage insertion'],
    corps: "Le facilitateur de la clause sociale est la personne qui fait le lien entre l'acheteur public, les entreprises titulaires des marchés et les candidats en insertion. Il joue le rôle d'assistant de l'acheteur public, sur toute la durée du marché : on parle d'assistance à maîtrise d'ouvrage en matière d'insertion. Il aide à rédiger la clause, conseille l'acheteur sur ses choix, propose des profils, suit les heures réalisées et en fait le bilan, sans jamais décider à sa place. Il est en général rattaché à une maison de l'emploi, à un PLIE ou au service emploi d'un conseil départemental. C'est lui qu'on contacte, souvent via son conseiller, pour accéder à des heures d'insertion.",
    relations: [
      { ficheId: 'clause-sociale', type: 'voir-aussi' }, { ficheId: 'plie', type: 'voir-aussi' },
      { ficheId: 'acheteur-public', type: 'voir-aussi' }
    ]
  },
  {
    id: 'maitre-ouvrage-ou-maitre-oeuvre', titre: "Maître d'ouvrage ou maître d'œuvre ?", titreDeTri: "Maître d'ouvrage ou maître d'œuvre",
    type: 'notion', gabarit: 'comparatif', univers: 'organisation-travail-management', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux interviennent dans un projet de travaux ou d'aménagement, du côté de celui qui fait faire. Ce qui les distingue : le maître d'ouvrage est celui qui commande et paie l'ouvrage (une commune, un bailleur, une entreprise) et en définit le besoin. Le maître d'œuvre est celui qu'il mandate pour concevoir le projet et surveiller son exécution (un architecte, un bureau d'études) : il anime les réunions de chantier et en rédige les comptes rendus.",
    relations: [
      { ficheId: 'clause-sociale', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Droits sociaux (lot 1, chantier d'élargissement 2026-09-08 --
  //    docs/CHANTIER_LEXIQUE_ELARGISSEMENT_2026-09-08.md). Principe 1 de la
  //    doctrine : le concept, jamais le barème -- les montants restent dans les
  //    fiches datées de « Comprendre le cadre ». --

  {
    id: 'rsa', titre: 'RSA', titreDeTri: 'RSA', type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ['revenu de solidarité active', 'RMI', "je n'ai plus de revenus"],
    corps: "Le RSA (revenu de solidarité active) est une allocation qui assure un revenu minimum aux personnes de 25 ans et plus (ou plus jeunes sous conditions) dont les ressources sont très faibles, qu'elles travaillent un peu ou pas du tout. Il est versé par la CAF ou la MSA et complète les autres ressources du foyer jusqu'à un montant qui dépend de la composition de la famille. Depuis 2025, il s'accompagne d'une inscription à France Travail et d'un contrat d'engagement. Une assistante sociale ou un CCAS aide à faire la demande et à vérifier ce à quoi on a droit.",
    relations: [
      { ficheId: 'prime-activite', type: 'a-ne-pas-confondre' },
      { ficheId: 'rsa-ou-prime-activite', type: 'voir-aussi' },
      { ficheId: 'france-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prime-activite', titre: "Prime d'activité", titreDeTri: 'Prime d activite', type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ["prime pour l'activité", 'complément de salaire CAF', 'RSA activité'],
    corps: "La prime d'activité est un complément de revenu versé par la CAF ou la MSA aux personnes qui travaillent, salariées ou indépendantes, mais dont les revenus restent modestes. Elle vise à ce que reprendre ou garder un emploi peu rémunéré reste plus avantageux que de ne pas travailler. Son montant dépend des revenus d'activité et de la situation du foyer ; elle se demande puis se renouvelle en déclarant ses ressources tous les trois mois. On peut estimer son droit avec le simulateur de la CAF ou en parler à un travailleur social.",
    relations: [
      { ficheId: 'rsa', type: 'a-ne-pas-confondre' },
      { ficheId: 'rsa-ou-prime-activite', type: 'voir-aussi' },
      { ficheId: 'declaration-de-ressources', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rsa-ou-prime-activite', titre: "RSA ou prime d'activité ?", titreDeTri: 'RSA ou prime d activite',
    type: 'notion', gabarit: 'comparatif', univers: 'protection-sociale', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont versés par la CAF ou la MSA, sous conditions de ressources, et visent les foyers modestes. Ce qui les distingue : le RSA assure un revenu minimum quand on travaille peu ou pas ; la prime d'activité complète des revenus qui viennent d'un travail. On peut toucher les deux en même temps quand on travaille avec de très faibles revenus.",
    relations: [
      { ficheId: 'caf', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aah', titre: 'AAH', titreDeTri: 'AAH', type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ['allocation aux adultes handicapés', 'allocation handicap'],
    corps: "L'AAH (allocation aux adultes handicapés) est un revenu versé par la CAF ou la MSA aux personnes dont le handicap est reconnu par la maison départementale des personnes handicapées et qui ne peuvent pas, ou seulement en partie, tirer un revenu suffisant d'un emploi. Elle peut se cumuler, pour partie, avec un salaire. La reconnaissance passe par un dossier déposé à la maison départementale, distinct de la RQTH même si les deux se demandent souvent ensemble.",
    relations: [
      { ficheId: 'rqth', type: 'voir-aussi' },
      { ficheId: 'caf', type: 'voir-aussi' },
      { ficheId: 'pension-invalidite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aah-ou-pension-invalidite', titre: "AAH ou pension d'invalidité ?", titreDeTri: 'AAH ou pension d invalidite',
    type: 'notion', gabarit: 'comparatif', univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux versent un revenu à une personne empêchée de travailler normalement pour raison de santé, et peuvent se cumuler pour partie. Ce qui les distingue : l'AAH est versée par la CAF ou la MSA, sur un dossier déposé à la maison départementale des personnes handicapées qui reconnaît un taux de handicap. La pension d'invalidité est versée par la CPAM ou la MSA, décidée par le médecin-conseil de la caisse selon la perte de capacité de travail, et suppose d'avoir suffisamment cotisé ou travaillé au préalable. Une personne dont la pension d'invalidité reste faible peut, sous conditions de ressources, toucher l'AAH en complément.",
    relations: [
      { ficheId: 'aah', type: 'voir-aussi' },
      { ficheId: 'pension-invalidite', type: 'voir-aussi' },
      { ficheId: 'mdph', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ass', titre: 'ASS', titreDeTri: 'ASS', type: 'terme',
    univers: 'protection-sociale', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['allocation de solidarité spécifique', 'fin de droits chômage'],
    corps: "L'ASS (allocation de solidarité spécifique) est un revenu de remplacement versé par France Travail à certains demandeurs d'emploi qui ont épuisé leurs droits à l'allocation chômage et qui justifient d'une durée de travail suffisante avant leur inscription. Elle est attribuée pour une période renouvelable, sous conditions de ressources du foyer. C'est l'un des filets qui prennent le relais quand l'ARE s'arrête.",
    relations: [
      { ficheId: 'are', type: 'a-ne-pas-confondre' },
      { ficheId: 'are-ou-ass', type: 'voir-aussi' },
      { ficheId: 'france-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'are-ou-ass', titre: 'ARE ou ASS ?', titreDeTri: 'ARE ou ASS',
    type: 'notion', gabarit: 'comparatif', univers: 'protection-sociale', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des revenus de remplacement versés par France Travail à des demandeurs d'emploi, et supposent de rester inscrit et de s'actualiser. Ce qui les distingue : l'ARE dépend des droits ouverts par le dernier emploi et a une durée limitée ; l'ASS prend le relais après l'épuisement de l'ARE, sous conditions de ressources du foyer et d'une durée de travail passée suffisante.",
    relations: [
      { ficheId: 'actualisation', type: 'voir-aussi' }
    ]
  },
  {
    id: 'csp', titre: 'CSP (contrat de sécurisation professionnelle)', titreDeTri: 'CSP contrat de securisation professionnelle',
    type: 'terme', univers: 'dispositifs', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['contrat de sécurisation professionnelle', 'licenciement économique accompagnement', 'ASP allocation sécurisation professionnelle'],
    corps: "Le CSP est proposé à un salarié dont le licenciement économique est envisagé, dans les entreprises de moins de 1 000 salariés. En l'acceptant, la personne quitte l'entreprise plus tôt (pas de préavis à effectuer) et bénéficie, à la place de l'ARE classique, d'un accompagnement renforcé par France Travail pendant douze mois maximum et d'une allocation spécifique, l'ASP. Le choix se fait dans un délai limité après la proposition de l'employeur : accepter ou refuser est réversible seulement avant la signature.",
    relations: [
      { ficheId: 'are', type: 'a-ne-pas-confondre' },
      { ficheId: 'aif', type: 'voir-aussi' },
      { ficheId: 'cep', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aides-au-logement', titre: 'Les aides au logement (APL, ALS, ALF)', titreDeTri: 'Aides au logement',
    type: 'terme', univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ['APL', 'allocation logement', 'aide pour payer le loyer'],
    corps: "Les aides au logement sont versées par la CAF ou la MSA pour alléger une dépense de logement : loyer, ou mensualité de prêt dans certains cas. Il en existe trois selon la situation : l'APL (aide personnalisée au logement), l'ALF (allocation de logement familiale) et l'ALS (allocation de logement sociale) ; on ne choisit pas, la CAF applique celle qui correspond. Le montant dépend des ressources, du loyer et du lieu. La demande se fait en ligne dès l'entrée dans le logement, sans attendre.",
    relations: [
      { ficheId: 'caf', type: 'voir-aussi' },
      { ficheId: 'plafond-de-ressources', type: 'voir-aussi' }
    ]
  },
  {
    id: 'css', titre: 'Complémentaire santé solidaire (CSS)', titreDeTri: 'Complementaire sante solidaire',
    type: 'terme', univers: 'protection-sociale', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ['CMU', 'mutuelle gratuite', 'aide pour la mutuelle'],
    corps: "La complémentaire santé solidaire (CSS) est une mutuelle prise en charge par l'Assurance maladie, en totalité ou avec une participation modérée selon les revenus. Elle permet de ne pas renoncer à des soins faute de complémentaire : consultations, lunettes, soins dentaires, hospitalisation sont couverts sans avance de frais chez la plupart des professionnels. La demande se fait auprès de la caisse d'assurance maladie (CPAM ou MSA) ; le droit au RSA l'ouvre automatiquement dans la plupart des cas.",
    relations: [
      { ficheId: 'rsa', type: 'voir-aussi' },
      { ficheId: 'desert-medical', type: 'voir-aussi' }
    ]
  },
  {
    id: 'desert-medical', titre: 'Désert médical', titreDeTri: 'Desert medical',
    type: 'terme', univers: 'acces-aux-soins', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['zone sous-dotée', 'pas de médecin traitant', 'manque de médecins près de chez moi'],
    corps: "Un désert médical est un territoire où le nombre de médecins (ou d'un autre professionnel de santé) est nettement plus faible que la moyenne, avec des délais de rendez-vous qui s'allongent. Ce n'est pas qu'une question de campagne : certains quartiers de grandes villes sont aussi concernés. En pratique, une personne sans médecin traitant peut chercher un professionnel qui accepte de nouveaux patients sur l'Annuaire santé (service gratuit de l'Assurance maladie, sans compte à créer), ou contacter les « organisations coordonnées territoriales » du secteur (regroupements de professionnels, parfois joignables par téléconsultation en attendant). Certains spécialistes restent accessibles sans médecin traitant ni pénalité de remboursement : ophtalmologue, gynécologue, dentiste, psychiatre pour les 16-25 ans.",
    voirAussiChiffres: "Voir où en est l'accès aux soins ici",
    relations: [
      { ficheId: 'css', type: 'voir-aussi' },
      { ficheId: 'zonage-ars', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ccas', titre: 'CCAS (centre communal d\'action sociale)', titreDeTri: 'CCAS',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ["centre communal d'action sociale", 'aide sociale de la mairie', 'CIAS'],
    corps: "Le CCAS (centre communal d'action sociale) est le service d'aide sociale de la commune. Il informe sur les droits, aide à monter des dossiers (RSA, logement, retraite...), peut accorder des aides ponctuelles (aide alimentaire, secours d'urgence, avance sur une facture) selon un règlement voté localement, et oriente vers les bons interlocuteurs. On s'y adresse à la mairie de son domicile ; dans les petites communes, ce rôle est parfois tenu directement par la mairie ou par un CIAS intercommunal.",
    relations: [
      { ficheId: 'assistante-sociale', type: 'voir-aussi' },
      { ficheId: 'france-services', type: 'voir-aussi' }
    ]
  },
  {
    id: 'france-services', titre: 'France Services', titreDeTri: 'France Services',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['maison France Services', 'MSAP', 'aide pour les démarches administratives'],
    corps: "France Services est un guichet de proximité où l'on est aidé, gratuitement, pour ses démarches avec plusieurs administrations au même endroit : impôts, CAF, Assurance maladie, France Travail, retraite, papiers d'identité, permis de conduire... Un agent formé accompagne le pas-à-pas en ligne et fait le lien avec le bon service en cas de blocage. Il y en a dans de nombreuses communes, souvent en mairie, en maison de services ou en bus itinérant.",
    relations: [
      { ficheId: 'ccas', type: 'voir-aussi' },
      { ficheId: 'franceconnect', type: 'voir-aussi' }
    ]
  },
  {
    id: 'msa', titre: 'MSA (Mutualité sociale agricole)', titreDeTri: 'MSA',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['mutualité sociale agricole', 'sécu agricole'],
    corps: "La MSA (Mutualité sociale agricole) est l'organisme de protection sociale du monde agricole : elle tient à la fois le rôle de l'Assurance maladie, de la CAF et de la caisse de retraite pour les exploitants, les salariés agricoles et leurs familles. Une personne rattachée à la MSA fait donc ses démarches d'aides (RSA, prime d'activité, aides au logement, santé) auprès d'elle, et non de la CAF ou de la CPAM.",
    relations: [
      { ficheId: 'caf', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'non-recours', titre: 'Non-recours aux droits', titreDeTri: 'Non-recours aux droits',
    type: 'terme', univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['ne pas demander ses droits', "je pense que je n'y ai pas droit", 'droits non réclamés'],
    corps: "Le non-recours, c'est le fait de ne pas demander une aide ou un droit alors qu'on y a droit : par méconnaissance, parce que les démarches semblent trop lourdes, par crainte du regard des autres, ou parce qu'on se dit « ce n'est pas pour moi ». Il concerne une part importante des personnes qui pourraient toucher le RSA, la prime d'activité ou la complémentaire santé solidaire. En parler sans jugement, et vérifier ses droits avec un travailleur social ou France Services, fait partie de l'accompagnement.",
    relations: [
      { ficheId: 'france-services', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'quotient-familial', titre: 'Quotient familial', titreDeTri: 'Quotient familial',
    type: 'terme', univers: 'mobilite-budget', registres: ['langage-administratif'],
    variantesRecherche: ['quotient familial CAF', 'QF', 'tarifs selon les revenus'],
    corps: "Le quotient familial est une mesure du niveau de vie d'un foyer : ses ressources rapportées au nombre de personnes qu'elles font vivre. La CAF, les mairies et de nombreux services (cantine, crèche, centre de loisirs, transports, activités) s'en servent pour fixer des tarifs proportionnés aux revenus et pour ouvrir, ou non, certaines aides. Il n'y a pas de démarche à faire : il se calcule à partir des informations déjà déclarées.",
    relations: [
      { ficheId: 'plafond-de-ressources', type: 'voir-aussi' }
    ]
  },
  {
    id: 'plafond-de-ressources', titre: 'Plafond de ressources', titreDeTri: 'Plafond de ressources',
    type: 'terme', univers: 'mobilite-budget', registres: ['langage-administratif'],
    variantesRecherche: ['plafond de revenus', 'condition de ressources', 'revenu maximum pour une aide'],
    corps: "Un plafond de ressources est le niveau de revenus à ne pas dépasser pour avoir droit à une aide, à un logement social ou à un tarif réduit. Il change d'un dispositif à l'autre et selon la composition du foyer, et il porte en général sur les revenus d'une année ou d'une période précise. Être juste au-dessus d'un plafond pour une aide ne veut pas dire l'être pour les autres : il vaut la peine de vérifier chaque droit séparément.",
    relations: [
      { ficheId: 'quotient-familial', type: 'voir-aussi' },
      { ficheId: 'numero-unique-enregistrement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'reste-a-vivre', titre: 'Reste à vivre', titreDeTri: 'Reste a vivre',
    type: 'terme', univers: 'mobilite-budget', registres: ['langage-cip'],
    variantesRecherche: ['reste pour vivre', 'budget après les charges', "ce qu'il me reste à la fin du mois"],
    corps: "Le reste à vivre, c'est ce qu'il reste à un foyer pour vivre au quotidien (nourriture, transport, habillement, santé) une fois payées les charges fixes : loyer, énergie, assurances, crédits, pensions. C'est un repère utilisé en accompagnement budgétaire et par la commission de surendettement pour apprécier une situation. Le calculer poste par poste aide souvent à y voir plus clair avant de décider quoi que ce soit.",
    relations: [
      { ficheId: 'surendettement', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'declaration-de-ressources', titre: 'Déclaration de ressources', titreDeTri: 'Declaration de ressources',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['déclaration trimestrielle de ressources', 'déclarer mes revenus à la CAF', 'DTR'],
    corps: "Beaucoup d'aides (RSA, prime d'activité, aides au logement, complémentaire santé solidaire) sont recalculées à partir d'une déclaration de ressources : on indique périodiquement ce qu'a perçu le foyer. Une déclaration oubliée ou en retard peut suspendre un versement ; une erreur peut créer un trop-perçu à rembourser plus tard. Mettre à jour sa situation dès qu'elle change (emploi, séparation, déménagement) évite la plupart de ces à-coups.",
    relations: [
      { ficheId: 'prime-activite', type: 'voir-aussi' },
      { ficheId: 'actualisation', type: 'a-ne-pas-confondre' }
    ]
  },

  // -- Famille : Faire valoir ses droits (lot 4, chantier d'élargissement
  //    2026-09-08). Principe 4 : expliquer à quoi sert un recours et qui saisir,
  //    jamais dérouler une procédure ni conseiller d'agir. --

  {
    id: 'conseil-de-prud-hommes', titre: "Conseil de prud'hommes", titreDeTri: 'Conseil de prud hommes',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-juridique'],
    variantesRecherche: ["prud'hommes", 'litige avec mon employeur', 'CPH', 'contester un licenciement'],
    corps: "Le conseil de prud'hommes est le tribunal qui juge les litiges entre un salarié (ou un apprenti) et son employeur nés du contrat de travail : salaire non payé, heures non réglées, licenciement contesté, requalification d'un CDD... Il est composé de juges non professionnels, à parts égales représentants des salariés et des employeurs. On peut le saisir seul ou assisté (avocat, défenseur syndical) ; une phase de conciliation précède le jugement. La saisine est gratuite, hors frais éventuels d'avocat.",
    relations: [
      { ficheId: 'inspection-du-travail', type: 'voir-aussi' },
      { ficheId: 'licenciement', type: 'voir-aussi' },
      { ficheId: 'aide-juridictionnelle', type: 'voir-aussi' }
    ]
  },
  {
    id: 'inspection-du-travail', titre: 'Inspection du travail', titreDeTri: 'Inspection du travail',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['inspecteur du travail', 'signaler mon employeur', 'DREETS', 'conditions de travail illégales'],
    corps: "L'inspection du travail est un service de l'État qui contrôle l'application du droit du travail dans les entreprises : durée du travail, salaire minimum, santé et sécurité, égalité, respect des représentants du personnel. Un salarié peut la saisir, y compris de façon confidentielle, pour signaler une situation. Elle conseille, met en demeure, dresse des procès-verbaux, mais ne juge pas les litiges individuels : cela relève du conseil de prud'hommes.",
    relations: [
      { ficheId: 'conseil-de-prud-hommes', type: 'a-ne-pas-confondre' },
      { ficheId: 'cse', type: 'voir-aussi' },
      { ficheId: 'medecine-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'defenseur-des-droits', titre: 'Défenseur des droits', titreDeTri: 'Defenseur des droits',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['HALDE', 'victime de discrimination', 'litige avec une administration', 'médiateur de la République'],
    corps: "Le Défenseur des droits est une autorité indépendante que toute personne peut saisir gratuitement quand elle s'estime victime d'une discrimination (à l'embauche, au travail, pour un logement ou un service), ou mal traitée par une administration ou un service public. Des délégués reçoivent près de chez soi, souvent en France Services ou en point-justice. Le Défenseur peut enquêter, aider à trouver une solution amiable, ou présenter des observations devant un tribunal. Il a remplacé la HALDE et le Médiateur de la République.",
    relations: [
      { ficheId: 'discrimination', type: 'voir-aussi' },
      { ficheId: 'discrimination-embauche', type: 'voir-aussi' },
      { ficheId: 'recours-amiable', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aide-juridictionnelle', titre: 'Aide juridictionnelle', titreDeTri: 'Aide juridictionnelle',
    type: 'terme', univers: 'dispositifs', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['avocat gratuit', 'aide pour payer un avocat', "je n'ai pas les moyens d'un procès", 'AJ'],
    corps: "L'aide juridictionnelle est une prise en charge par l'État de tout ou partie des frais d'un procès (avocat, commissaire de justice, expertise) pour les personnes dont les revenus sont modestes. Elle vaut devant la plupart des juridictions, dont le conseil de prud'hommes et les tribunaux administratifs. La demande se dépose au bureau d'aide juridictionnelle du tribunal, avec un justificatif de ressources ; l'avocat peut être choisi ou désigné. Un point-justice aide à monter le dossier.",
    relations: [
      { ficheId: 'conseil-de-prud-hommes', type: 'voir-aussi' },
      { ficheId: 'point-justice', type: 'voir-aussi' }
    ]
  },
  {
    id: 'point-justice', titre: 'Point-justice', titreDeTri: 'Point-justice',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ["point d'accès au droit", 'maison de justice et du droit', 'information juridique gratuite', 'CDAD'],
    corps: "Un point-justice (ancien point d'accès au droit, maison de justice et du droit, relais d'accès au droit) est un lieu où l'on obtient gratuitement une information juridique et une aide aux démarches : comprendre un courrier, connaître ses droits et ses recours, être orienté vers le bon interlocuteur, préparer une saisine ou une demande d'aide juridictionnelle. On y rencontre selon les jours des juristes, des conciliateurs, des associations, parfois un délégué du Défenseur des droits. Les coordonnées locales sont tenues par le conseil départemental de l'accès au droit (CDAD).",
    relations: [
      { ficheId: 'aide-juridictionnelle', type: 'voir-aussi' },
      { ficheId: 'defenseur-des-droits', type: 'voir-aussi' },
      { ficheId: 'recours-amiable', type: 'voir-aussi' }
    ]
  },
  {
    id: 'recours-amiable', titre: 'Recours amiable', titreDeTri: 'Recours amiable',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['contester une décision', 'RAPO', 'recours contre la CAF', 'recours France Travail'],
    corps: "Un recours amiable, c'est demander à une administration (France Travail, CAF, préfecture, caisse de retraite...) de revoir une décision qu'on conteste, avant d'aller devant un juge. Il se fait par écrit, dans le délai indiqué sur la décision, en expliquant pourquoi on n'est pas d'accord et en joignant les pièces utiles. Selon l'organisme, il passe par une commission de recours (RAPO, recours administratif préalable obligatoire) à saisir avant tout recours devant le tribunal. Un point-justice ou un travailleur social aide à le rédiger.",
    relations: [
      { ficheId: 'point-justice', type: 'voir-aussi' },
      { ficheId: 'recours-amiable-ou-contentieux', type: 'voir-aussi' },
      { ficheId: 'defenseur-des-droits', type: 'voir-aussi' }
    ]
  },
  {
    id: 'recours-amiable-ou-contentieux', titre: 'Recours amiable ou contentieux ?', titreDeTri: 'Recours amiable ou contentieux',
    type: 'notion', gabarit: 'comparatif', univers: 'demarches-administratives', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux servent à contester une décision qu'on estime injuste. Ce qui les distingue : le recours amiable s'adresse à l'administration ou à l'organisme qui a pris la décision, pour qu'il la revoie lui-même ; le recours contentieux s'adresse à un tribunal, qui tranche. L'amiable est souvent un passage obligé avant le contentieux, et il suspend en général les délais pour aller devant le juge.",
    relations: [
      { ficheId: 'point-justice', type: 'voir-aussi' },
      { ficheId: 'conseil-de-prud-hommes', type: 'voir-aussi' }
    ]
  },
  {
    id: 'discrimination', titre: 'Discrimination', titreDeTri: 'Discrimination',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique'],
    variantesRecherche: ['discrimination au travail', 'critères de discrimination', 'traité injustement à cause de'],
    corps: "Une discrimination, au sens de la loi, c'est traiter une personne moins bien qu'une autre dans une situation comparable à cause d'un critère interdit : l'origine, le sexe, l'âge, l'état de santé, le handicap, la grossesse, les convictions, l'orientation sexuelle, l'appartenance syndicale, le lieu de résidence, et une vingtaine d'autres. Elle est interdite à l'embauche comme pendant le contrat, pour une formation, une promotion ou un licenciement. Toute différence de traitement n'est pas une discrimination : elle ne l'est que si elle repose sur l'un de ces critères sans justification légitime. Le Défenseur des droits, l'inspection du travail et le conseil de prud'hommes peuvent être saisis.",
    relations: [
      { ficheId: 'discrimination-embauche', type: 'voir-aussi' },
      { ficheId: 'discrimination-ou-difference-de-traitement', type: 'voir-aussi' },
      { ficheId: 'defenseur-des-droits', type: 'voir-aussi' }
    ]
  },
  {
    id: 'discrimination-ou-difference-de-traitement', titre: 'Discrimination ou différence de traitement ?', titreDeTri: 'Discrimination ou difference de traitement',
    type: 'notion', gabarit: 'comparatif', univers: 'droit-travail', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : dans les deux cas, deux personnes ne sont pas traitées de la même façon. Ce qui les distingue : une différence de traitement est licite quand elle repose sur un motif objectif et vérifiable (ancienneté, diplôme requis, résultats, contraintes du poste). Elle devient une discrimination quand elle est fondée, même indirectement, sur un critère interdit par la loi et sans justification légitime.",
    relations: [
      { ficheId: 'discrimination', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Se loger quand c'est difficile (lot 3, chantier d'élargissement
  //    2026-09-08). Le concept et l'interlocuteur, jamais les dates de trêve ni
  //    les montants d'aide (fiches datées de « Comprendre le cadre »). --

  {
    id: 'dalo', titre: 'Droit au logement opposable (DALO)', titreDeTri: 'Droit au logement opposable',
    type: 'terme', univers: 'dispositifs', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['DALO', 'recours logement', 'reconnu prioritaire pour un logement', 'mal logé'],
    corps: "Le droit au logement opposable (DALO) permet à une personne mal logée ou sans logement, dont les démarches sont restées sans réponse, de faire reconnaître son besoin comme prioritaire. On dépose un recours devant une commission de médiation du département ; si elle reconnaît la situation, l'État doit proposer un logement ou un hébergement adapté dans un délai fixé. À défaut, un recours devant le tribunal administratif est possible. Une association de défense des mal-logés ou un travailleur social aide à constituer le dossier.",
    relations: [
      { ficheId: 'aides-au-logement', type: 'voir-aussi' },
      { ficheId: 'hebergement-urgence', type: 'voir-aussi' },
      { ficheId: 'assistante-sociale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'siao-115', titre: 'SIAO et 115', titreDeTri: 'SIAO et 115',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['appeler le 115', 'SIAO', "demande d'hébergement", 'où appeler pour dormir'],
    corps: "Le SIAO (service intégré d'accueil et d'orientation) est l'organisme qui, dans chaque département, centralise les demandes d'hébergement et de logement accompagné et oriente vers les places disponibles. Le 115 en est le numéro d'appel, gratuit et ouvert en continu, pour une mise à l'abri immédiate. Le même SIAO gère aussi les demandes plus durables (centre d'hébergement, pension de famille, intermédiation locative), en général déposées par un travailleur social.",
    relations: [
      { ficheId: 'hebergement-urgence', type: 'voir-aussi' },
      { ficheId: 'accueil-de-jour', type: 'voir-aussi' },
      { ficheId: 'hebergement-ou-logement-accompagne', type: 'voir-aussi' }
    ]
  },
  {
    id: 'treve-hivernale', titre: 'Trêve hivernale', titreDeTri: 'Treve hivernale',
    type: 'terme', univers: 'dispositifs', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['expulsion hiver', 'coupure énergie interdite', "protégé contre l'expulsion"],
    corps: "La trêve hivernale est la période de l'année pendant laquelle il est interdit d'expulser un locataire de son logement, même après une décision de justice, et pendant laquelle les fournisseurs d'énergie ne peuvent pas couper l'électricité ni le gaz pour impayés (ils peuvent seulement réduire la puissance). Elle court chaque hiver, sur des dates fixées par la loi. Elle ne fait pas disparaître la dette ni la procédure : elle en suspend l'exécution. C'est une période à mettre à profit pour saisir un travailleur social, l'agence d'information sur le logement (ADIL) ou le fonds de solidarité pour le logement.",
    relations: [
      { ficheId: 'fsl', type: 'voir-aussi' },
      { ficheId: 'dalo', type: 'voir-aussi' },
      { ficheId: 'commandement-de-payer', type: 'voir-aussi' }
    ]
  },
  {
    id: 'fsl', titre: 'Fonds de solidarité pour le logement (FSL)', titreDeTri: 'Fonds de solidarite pour le logement',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['FSL', 'aide pour un loyer en retard', 'FSL maintien', 'aide au dépôt de garantie'],
    corps: "Le FSL (fonds de solidarité pour le logement) est une aide du conseil départemental pour accéder à un logement ou s'y maintenir : dépôt de garantie, premier loyer, dettes de loyer, factures d'énergie ou d'eau impayées, parfois assurance ou déménagement. Il peut prendre la forme d'une subvention ou d'un prêt sans intérêt, sous conditions de ressources. La demande passe le plus souvent par un travailleur social ou l'ADIL.",
    relations: [
      { ficheId: 'aides-au-logement', type: 'voir-aussi' },
      { ficheId: 'treve-hivernale', type: 'voir-aussi' },
      { ficheId: 'assistante-sociale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'visale', titre: 'Garantie Visale', titreDeTri: 'Garantie Visale',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['Visale', 'caution gratuite', 'pas de garant pour louer', 'garant Action Logement'],
    corps: "Visale est une garantie gratuite proposée par Action Logement : elle tient le rôle de caution pour un locataire qui n'a pas de garant, en remboursant le propriétaire en cas de loyers impayés, le locataire remboursant ensuite Action Logement. Elle s'adresse surtout aux jeunes, aux salariés récemment embauchés ou en mobilité, et à des ménages en logement d'insertion. La demande se fait en ligne avant de signer le bail, pour obtenir un visa à présenter au propriétaire.",
    relations: [
      { ficheId: 'foyer-jeunes-travailleurs', type: 'voir-aussi' },
      { ficheId: 'aides-au-logement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'intermediation-locative', titre: 'Intermédiation locative', titreDeTri: 'Intermediation locative',
    type: 'terme', univers: 'accompagnement-insertion', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['sous-location par une association', 'logement passerelle', 'Solibail'],
    corps: "L'intermédiation locative, c'est quand une association loue un logement au propriétaire, puis le met à disposition d'un ménage en difficulté, en assurant le lien avec le propriétaire et un accompagnement vers le logement autonome. Le ménage paie une redevance adaptée à ses ressources et n'a pas de bail direct au départ. C'est une étape intermédiaire entre l'hébergement et la location de plein droit, souvent proposée via le SIAO.",
    relations: [
      { ficheId: 'siao-115', type: 'voir-aussi' },
      { ficheId: 'hebergement-ou-logement-accompagne', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pension-de-famille', titre: 'Pension de famille', titreDeTri: 'Pension de famille',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip'],
    variantesRecherche: ['maison relais', 'logement accompagné durable', 'vivre seul est trop difficile'],
    corps: "Une pension de famille, aussi appelée maison relais, est un logement durable, à taille humaine, pour des personnes isolées, à faibles ressources et fragilisées par le parcours de vie, pour qui vivre seul dans un logement classique est difficile. Chacun a son logement privatif et paie une redevance ; des espaces communs et la présence d'hôtes accompagnants favorisent le lien social. Il n'y a pas de durée limite. L'orientation passe par le SIAO.",
    relations: [
      { ficheId: 'siao-115', type: 'voir-aussi' },
      { ficheId: 'hebergement-ou-logement-accompagne', type: 'voir-aussi' }
    ]
  },
  {
    id: 'foyer-jeunes-travailleurs', titre: 'Foyer de jeunes travailleurs (FJT)', titreDeTri: 'Foyer de jeunes travailleurs',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip'],
    variantesRecherche: ['FJT', 'résidence habitat jeunes', 'se loger quand on est jeune'],
    corps: "Un foyer de jeunes travailleurs (FJT), aussi appelé résidence habitat jeunes, propose un logement meublé temporaire, souvent de quelques mois à deux ans, aux 16-30 ans en emploi, en alternance, en formation, en stage ou en recherche : jeunes actifs, apprentis, saisonniers, personnes en mobilité. La redevance ouvre droit aux aides au logement. Un accompagnement à l'autonomie (budget, démarches, mobilité) et des espaces collectifs font partie du principe.",
    relations: [
      { ficheId: 'visale', type: 'voir-aussi' },
      { ficheId: 'aides-au-logement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'accueil-de-jour', titre: 'Accueil de jour', titreDeTri: 'Accueil de jour',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip'],
    variantesRecherche: ["où se poser quand on est à la rue", 'douche et laverie solidaires', 'me réchauffer en journée'],
    corps: "Un accueil de jour est un lieu ouvert en journée pour les personnes sans domicile ou en grande précarité : on peut s'y poser au chaud, prendre une douche, laver son linge, prendre un café ou un repas, recevoir son courrier, être orienté vers un travailleur social ou un service de santé. L'accès est libre et sans condition. C'est souvent le premier point de contact quand on est à la rue, en complément du 115 pour la nuit.",
    relations: [
      { ficheId: 'siao-115', type: 'voir-aussi' },
      { ficheId: 'aide-materielle', type: 'voir-aussi' }
    ]
  },
  {
    id: 'domiciliation', titre: 'Domiciliation', titreDeTri: 'Domiciliation',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ['adresse administrative', 'domiciliation CCAS', "pas d'adresse pour mes papiers", 'élection de domicile'],
    corps: "La domiciliation, c'est le droit d'avoir une adresse administrative quand on n'a pas de logement stable, pour recevoir son courrier et faire valoir ses droits : pièce d'identité, sécurité sociale, RSA, inscription à France Travail, compte bancaire, vote. Elle s'obtient auprès d'un CCAS ou d'un organisme agréé, après un entretien, et se renouvelle chaque année. Sans domiciliation, beaucoup de démarches sont bloquées : c'est souvent la première à faire.",
    relations: [
      { ficheId: 'ccas', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'levee-d-ecrou', type: 'voir-aussi' }
    ]
  },
  {
    id: 'hebergement-ou-logement-accompagne', titre: 'Hébergement ou logement accompagné ?', titreDeTri: 'Hebergement ou logement accompagne',
    type: 'notion', gabarit: 'comparatif', univers: 'accompagnement-insertion', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : dans les deux cas, une structure met un toit à disposition avec un accompagnement, sans que la personne soit locataire de plein droit au départ. Ce qui les distingue : l'hébergement (urgence, stabilisation, centre d'hébergement et de réinsertion sociale) est une mise à l'abri, souvent collective et de durée limitée, sans redevance ou presque ; le logement accompagné (pension de famille, intermédiation locative, résidence sociale) est un vrai logement, avec une redevance et un accompagnement vers l'autonomie, parfois sans limite de durée.",
    relations: [
      { ficheId: 'hebergement-urgence', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Budget, dettes, surendettement (lot 2, chantier d'élargissement
  //    2026-09-08). Les issues du surendettement au niveau du principe, jamais
  //    les durées ni les barèmes. --

  {
    id: 'commission-de-surendettement', titre: 'Commission de surendettement', titreDeTri: 'Commission de surendettement',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['banque de France dossier', 'qui décide pour le surendettement', 'examen de mon dossier de dettes'],
    corps: "La commission de surendettement est l'instance, présente dans chaque département et pilotée par la Banque de France, qui examine les dossiers de surendettement. Elle vérifie d'abord que la demande est recevable (bonne foi, impossibilité manifeste de faire face à ses dettes non professionnelles), puis cherche une solution : rééchelonnement, gel ou effacement partiel des dettes, voire effacement total. Elle est gratuite. Un travailleur social ou un point conseil budget aide à préparer le dossier.",
    relations: [
      { ficheId: 'surendettement', type: 'voir-aussi' },
      { ficheId: 'bonne-foi', type: 'voir-aussi' },
      { ficheId: 'plan-conventionnel-de-redressement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'plan-conventionnel-de-redressement', titre: 'Plan conventionnel de redressement', titreDeTri: 'Plan conventionnel de redressement',
    type: 'terme', univers: 'dispositifs', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['plan conventionnel', 'accord avec les créanciers', 'réaménagement des dettes'],
    corps: "Le plan conventionnel de redressement est l'une des issues d'un dossier de surendettement : la commission propose un accord amiable entre la personne et ses créanciers, qui réaménage les dettes (délais, baisse ou suppression des intérêts, effacement partiel) tout en laissant de quoi vivre. Il suppose que chacun l'accepte. Sans accord, la commission peut imposer des mesures ou orienter vers un rétablissement personnel.",
    relations: [
      { ficheId: 'mesures-imposees', type: 'a-ne-pas-confondre' },
      { ficheId: 'plan-conventionnel-ou-mesures-imposees', type: 'voir-aussi' },
      { ficheId: 'surendettement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'mesures-imposees', titre: 'Mesures imposées', titreDeTri: 'Mesures imposees',
    type: 'terme', univers: 'dispositifs', registres: ['langage-juridique'],
    variantesRecherche: ['mesures recommandées', 'la commission décide à ma place', 'réaménagement imposé des dettes'],
    corps: "Les mesures imposées, ou recommandées, sont l'issue d'un dossier de surendettement quand aucun accord amiable n'a pu être trouvé : la commission de surendettement décide elle-même du réaménagement des dettes (délais, réduction des taux, effacement partiel), et un juge les valide. La personne et les créanciers peuvent les contester devant ce juge. C'est une solution intermédiaire entre le plan amiable et le rétablissement personnel.",
    relations: [
      { ficheId: 'plan-conventionnel-de-redressement', type: 'a-ne-pas-confondre' },
      { ficheId: 'retablissement-personnel', type: 'voir-aussi' }
    ]
  },
  {
    id: 'retablissement-personnel', titre: 'Rétablissement personnel', titreDeTri: 'Retablissement personnel',
    type: 'terme', univers: 'dispositifs', registres: ['langage-juridique'],
    variantesRecherche: ['effacement des dettes', 'faillite personnelle', 'PRP', 'plus aucune dette possible'],
    corps: "Le rétablissement personnel est l'issue la plus radicale d'un dossier de surendettement : quand la situation est jugée irrémédiablement compromise et qu'il n'y a rien à saisir, les dettes non professionnelles sont effacées, en une fois. Il est décidé par la commission de surendettement ou par un juge. Certaines dettes restent dues malgré tout (pensions alimentaires, amendes, dettes issues d'une fraude). L'effacement est inscrit plusieurs années au fichier des incidents de crédit.",
    relations: [
      { ficheId: 'surendettement', type: 'voir-aussi' },
      { ficheId: 'ficp', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ficp', titre: 'FICP (fichier des incidents de crédit)', titreDeTri: 'FICP',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['FICP', 'fiché Banque de France', 'interdit de crédit', 'fichage crédit'],
    corps: "Le FICP (fichier national des incidents de remboursement des crédits aux particuliers) est tenu par la Banque de France. Une personne y est inscrite en cas d'incidents de paiement répétés sur un crédit, ou dès le dépôt d'un dossier de surendettement. Tant qu'on y figure, les banques refusent en général un nouveau crédit, mais cela n'interdit ni d'avoir un compte, ni une carte de paiement, ni de travailler. L'inscription a une durée limitée et on peut consulter gratuitement sa situation auprès de la Banque de France.",
    relations: [
      { ficheId: 'surendettement', type: 'voir-aussi' },
      { ficheId: 'droit-au-compte', type: 'voir-aussi' }
    ]
  },
  {
    id: 'droit-au-compte', titre: 'Droit au compte', titreDeTri: 'Droit au compte',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ["banque refuse de m'ouvrir un compte", 'compte bancaire refusé', 'obtenir un compte de force'],
    corps: "Le droit au compte permet à toute personne sans compte bancaire, à qui une banque en a refusé l'ouverture, d'en obtenir un. On saisit la Banque de France avec l'attestation de refus ; elle désigne une banque, qui doit alors ouvrir un compte assorti de services bancaires de base gratuits. Être inscrit au FICP ou au fichier des chèques ne fait pas perdre ce droit. Un travailleur social ou un point conseil budget peut accompagner la démarche.",
    relations: [
      { ficheId: 'services-bancaires-de-base', type: 'voir-aussi' },
      { ficheId: 'ficp', type: 'voir-aussi' }
    ]
  },
  {
    id: 'services-bancaires-de-base', titre: 'Services bancaires de base', titreDeTri: 'Services bancaires de base',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['compte bancaire gratuit', 'carte à autorisation systématique', 'services gratuits liés au compte'],
    corps: "Les services bancaires de base sont un ensemble de prestations gratuites qui accompagnent un compte ouvert au titre du droit au compte : tenue du compte, carte de paiement à autorisation systématique, virements et prélèvements, relevés mensuels, encaissement de chèques, deux chèques de banque par mois. Ils permettent de gérer son argent au quotidien sans frais et sans risque de découvert non autorisé.",
    relations: [
      { ficheId: 'droit-au-compte', type: 'voir-aussi' }
    ]
  },
  {
    id: 'saisie-sur-salaire', titre: 'Saisie sur salaire', titreDeTri: 'Saisie sur salaire',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['saisie des rémunérations', 'prélèvement sur mon salaire', 'fraction insaisissable', 'un créancier prend sur ma paie'],
    corps: "Une saisie sur salaire, ou saisie des rémunérations, permet à un créancier muni d'un titre exécutoire de se faire payer une dette en prélevant une partie du salaire directement chez l'employeur. La loi fixe un barème : seule une fraction du salaire est saisissable, et une part, la fraction insaisissable, est toujours laissée à la personne pour vivre. Depuis 2025, la procédure passe par un commissaire de justice et non plus par le tribunal. On peut demander des délais ou contester le montant.",
    relations: [
      { ficheId: 'surendettement', type: 'voir-aussi' },
      { ficheId: 'reste-a-vivre', type: 'voir-aussi' }
    ]
  },
  {
    id: 'point-conseil-budget', titre: 'Point conseil budget (PCB)', titreDeTri: 'Point conseil budget',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['point conseil budget', 'PCB', 'aide pour gérer mon budget', 'conseil budgétaire gratuit'],
    corps: "Un point conseil budget (PCB) est un lieu d'accueil gratuit et sans condition de ressources pour toute personne qui veut faire le point sur son budget, prévenir ou traiter des difficultés d'argent : comprendre ses dépenses, négocier avec des créanciers ou des fournisseurs, éviter le surendettement, préparer un dossier. Les conseillers sont portés par des associations, des CCAS ou des structures de l'économie sociale, labellisés par l'État.",
    relations: [
      { ficheId: 'surendettement', type: 'voir-aussi' },
      { ficheId: 'reste-a-vivre', type: 'voir-aussi' },
      { ficheId: 'microcredit-personnel', type: 'voir-aussi' }
    ]
  },
  {
    id: 'microcredit-personnel', titre: 'Microcrédit personnel', titreDeTri: 'Microcredit personnel',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['petit prêt quand on a peu de revenus', 'prêt pour le permis ou la voiture', 'crédit refusé par la banque'],
    corps: "Le microcrédit personnel accompagné est un petit prêt bancaire, sur une durée courte, destiné à des personnes sans accès au crédit classique (revenus modestes, emploi précaire, éventuelle inscription au FICP). Il finance un projet qui aide à l'insertion ou à la vie quotidienne : permis de conduire, voiture pour aller travailler, équipement, formation, mobilité. Il est toujours associé à un accompagnement (travailleur social, association, point conseil budget) et une partie du risque est garantie par un fonds public.",
    relations: [
      { ficheId: 'point-conseil-budget', type: 'voir-aussi' },
      { ficheId: 'aide-a-la-mobilite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'epicerie-sociale', titre: 'Épicerie sociale et solidaire', titreDeTri: 'Epicerie sociale et solidaire',
    type: 'terme', univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['épicerie sociale', 'épicerie solidaire', 'courses à petit prix'],
    corps: "Une épicerie sociale et solidaire est un magasin où des personnes orientées par un travailleur social font leurs courses en payant une petite partie du prix. L'idée est de garder le choix et la dignité d'un vrai magasin, tout en dégageant du budget pour d'autres dépenses. L'accès est en général accordé pour une période, le temps de passer un cap, et s'accompagne parfois d'ateliers (cuisine, budget).",
    relations: [
      { ficheId: 'aide-alimentaire', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'bonne-foi', titre: 'Bonne foi', titreDeTri: 'Bonne foi',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-juridique'],
    variantesRecherche: ['agir de bonne foi', 'mauvaise foi surendettement', 'accusé de mauvaise foi'],
    corps: "La bonne foi est une notion juridique qui revient dans beaucoup de démarches : surendettement, demande de remise d'un trop-perçu, litige avec une administration. Elle désigne le fait d'avoir agi honnêtement, sans chercher à tromper ni à organiser son insolvabilité. Elle est présumée : c'est à celui qui la conteste de le prouver. Perdre le bénéfice de la bonne foi (fausse déclaration, dettes contractées en sachant ne pas pouvoir rembourser) peut faire rejeter une demande.",
    relations: [
      { ficheId: 'surendettement', type: 'voir-aussi' },
      { ficheId: 'recours-amiable', type: 'voir-aussi' }
    ]
  },
  {
    id: 'radiation', titre: 'Radiation de France Travail', titreDeTri: 'Radiation de France Travail',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['radiation France Travail', 'radié de la liste', "plus d'allocation après un rendez-vous manqué"],
    corps: "Une radiation, c'est le fait d'être retiré de la liste des demandeurs d'emploi par France Travail, en général pour un manquement constaté (absence à un rendez-vous, refus répété d'une offre raisonnable d'emploi, défaut d'actualisation) ou à la demande de la personne. Elle suspend le versement des allocations pendant une durée fixée. Depuis 2025, elle intervient le plus souvent après une phase de suspension puis de remobilisation. On peut la contester par un recours amiable, puis devant le tribunal. Se réinscrire reste toujours possible ensuite.",
    relations: [
      { ficheId: 'actualisation', type: 'voir-aussi' },
      { ficheId: 'recours-amiable', type: 'voir-aussi' },
      { ficheId: 'offre-raisonnable-d-emploi', type: 'voir-aussi' },
      { ficheId: 'suspension-remobilisation', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'plan-conventionnel-ou-mesures-imposees', titre: 'Plan conventionnel ou mesures imposées ?', titreDeTri: 'Plan conventionnel ou mesures imposees',
    type: 'notion', gabarit: 'comparatif', univers: 'dispositifs', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux réaménagent les dettes d'un dossier de surendettement (délais, baisse des taux, effacement partiel) en préservant un reste à vivre. Ce qui les distingue : le plan conventionnel est un accord que la personne et tous les créanciers acceptent ; les mesures imposées sont décidées par la commission quand cet accord n'a pas été possible, puis validées par un juge. Si la situation est trop bloquée, la commission oriente plutôt vers un rétablissement personnel.",
    relations: [
      { ficheId: 'retablissement-personnel', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Comprendre le handicap et l'emploi (lot 6, chantier
  //    d'élargissement 2026-09-08). Le droit de la personne d'un côté,
  //    l'obligation de l'employeur de l'autre ; jamais un conseil de déclarer. --

  {
    id: 'mdph', titre: 'MDPH (maison départementale des personnes handicapées)', titreDeTri: 'MDPH',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ['MDPH', 'maison du handicap', 'dossier handicap', 'où demander la RQTH'],
    corps: "La MDPH (maison départementale des personnes handicapées) est le guichet unique, dans chaque département, pour les droits liés au handicap. On y dépose un dossier unique qui peut ouvrir plusieurs droits : reconnaissance de la qualité de travailleur handicapé, allocation aux adultes handicapés, orientation vers le milieu protégé, carte mobilité inclusion, aides à la compensation. Une équipe pluridisciplinaire évalue la situation, une commission décide. Un travailleur social ou un Cap emploi aide à monter le dossier.",
    relations: [
      { ficheId: 'rqth', type: 'voir-aussi' },
      { ficheId: 'aah', type: 'voir-aussi' },
      { ficheId: 'cap-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'agefiph', titre: 'Agefiph et FIPHFP', titreDeTri: 'Agefiph et FIPHFP',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['Agefiph', 'FIPHFP', 'aides pour embaucher une personne handicapée', 'financement aménagement de poste'],
    corps: "L'Agefiph (association de gestion du fonds pour l'insertion professionnelle des personnes handicapées) finance et outille l'emploi des personnes handicapées dans le secteur privé : aides à l'embauche et au maintien, aménagement de poste, adaptation d'une formation déjà engagée, appui à la création d'activité, prestations spécialisées. Le FIPHFP joue le même rôle pour les trois fonctions publiques. Les deux sont alimentés par les contributions des employeurs qui n'atteignent pas leur obligation d'emploi. On y accède le plus souvent via Cap emploi ou son conseiller, qui connaît les aides réellement disponibles au moment de la demande - elles évoluent.",
    relations: [
      { ficheId: 'oeth', type: 'voir-aussi' },
      { ficheId: 'cap-emploi', type: 'voir-aussi' },
      { ficheId: 'amenagement-poste', type: 'voir-aussi' }
    ]
  },
  {
    id: 'oeth', titre: "Obligation d'emploi des travailleurs handicapés (OETH)", titreDeTri: 'Obligation d emploi des travailleurs handicapes',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique', 'langage-rh'],
    variantesRecherche: ['OETH', 'quota de travailleurs handicapés', 'les 6 pour cent', 'obligation emploi handicap'],
    corps: "L'obligation d'emploi des travailleurs handicapés (OETH) impose à tout employeur d'au moins vingt salariés de compter dans ses effectifs une proportion de travailleurs handicapés fixée par la loi. L'employeur qui n'atteint pas ce taux verse une contribution à l'Agefiph ou au FIPHFP. Elle peut être remplie par l'embauche directe, l'accueil de stagiaires ou d'alternants, ou la sous-traitance auprès du secteur adapté et protégé. C'est ce qui donne une valeur concrète à la RQTH côté employeur.",
    relations: [
      { ficheId: 'rqth-ou-oeth', type: 'voir-aussi' },
      { ficheId: 'agefiph', type: 'voir-aussi' },
      { ficheId: 'entreprise-adaptee', type: 'voir-aussi' }
    ]
  },
  {
    id: 'esat', titre: "ESAT (établissement ou service d'aide par le travail)", titreDeTri: 'ESAT',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ['ESAT', 'travail protégé', 'CAT', 'travailler avec un handicap lourd'],
    corps: "Un ESAT (établissement ou service d'aide par le travail) propose une activité professionnelle à des personnes en situation de handicap qui ne peuvent pas, pour le moment, travailler en entreprise ordinaire ou adaptée, avec un accompagnement médico-social. Ce n'est pas un contrat de travail classique : la personne a un statut d'usager, une rémunération garantie, et des droits qui se rapprochent progressivement de ceux des salariés. L'orientation vers un ESAT est décidée par la MDPH.",
    relations: [
      { ficheId: 'entreprise-adaptee', type: 'a-ne-pas-confondre' },
      { ficheId: 'milieu-ordinaire-ou-milieu-protege', type: 'voir-aussi' },
      { ficheId: 'mdph', type: 'voir-aussi' }
    ]
  },
  {
    id: 'entreprise-adaptee', titre: 'Entreprise adaptée (EA)', titreDeTri: 'Entreprise adaptee',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['entreprise adaptée', 'EA', 'emploi en milieu adapté'],
    corps: "Une entreprise adaptée (EA) est une entreprise du milieu ordinaire qui emploie une majorité de travailleurs handicapés, avec un accompagnement renforcé et un aménagement des postes et des rythmes. Les salariés ont un contrat de travail de droit commun. Elle peut servir de tremplin vers d'autres employeurs, ou offrir un emploi durable. Elle se distingue de l'ESAT, qui relève du secteur médico-social et n'est pas un contrat de travail.",
    relations: [
      { ficheId: 'esat', type: 'a-ne-pas-confondre' },
      { ficheId: 'milieu-ordinaire-ou-milieu-protege', type: 'voir-aussi' },
      { ficheId: 'oeth', type: 'voir-aussi' }
    ]
  },
  {
    id: 'emploi-accompagne', titre: 'Emploi accompagné', titreDeTri: 'Emploi accompagne',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ['job coach', "accompagnement durable dans l'emploi", 'soutien pour garder mon emploi'],
    corps: "L'emploi accompagné est un dispositif pour les personnes en situation de handicap qui ont besoin d'un soutien durable pour trouver un emploi en milieu ordinaire et s'y maintenir. Un référent, parfois appelé job coach, intervient sans limite de durée, auprès de la personne, de l'employeur et des collègues : préparation, prise de poste, ajustements, prévention des difficultés. Il est gratuit et se demande via la MDPH, Cap emploi ou son conseiller.",
    relations: [
      { ficheId: 'cap-emploi', type: 'voir-aussi' },
      { ficheId: 'maintien-emploi', type: 'voir-aussi' },
      { ficheId: 'mdph', type: 'voir-aussi' }
    ]
  },
  {
    id: 'reclassement', titre: 'Reclassement', titreDeTri: 'Reclassement',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique', 'langage-rh'],
    variantesRecherche: ['reclassement après inaptitude', 'obligation de reclassement', "autre poste dans l'entreprise"],
    corps: "Le reclassement est l'obligation, pour un employeur, de chercher un autre poste à un salarié qu'il ne peut plus employer à son poste actuel : le plus souvent après un avis d'inaptitude de la médecine du travail, parfois dans un licenciement économique. L'employeur doit proposer un poste adapté aux capacités de la personne, au besoin après aménagement ou formation. Le licenciement n'est possible que si aucun reclassement n'est trouvé, ou si le médecin l'a expressément écarté.",
    relations: [
      { ficheId: 'aptitude-ou-inaptitude', type: 'voir-aussi' },
      { ficheId: 'medecine-travail', type: 'voir-aussi' },
      { ficheId: 'maintien-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'visite-de-reprise', titre: 'Visite de reprise', titreDeTri: 'Visite de reprise',
    type: 'terme', univers: 'sante-travail', registres: ['langage-juridique', 'langage-rh'],
    variantesRecherche: ["rendez-vous médecine du travail après un arrêt", 'visite de préreprise', 'reprise après un long arrêt'],
    corps: "La visite de reprise est le rendez-vous avec la médecine du travail organisé par l'employeur après un arrêt de travail assez long (maladie, accident du travail, maternité). Le médecin vérifie si le poste est compatible avec l'état de santé, propose des aménagements ou un aménagement du temps de travail, ou constate une inaptitude. Tant qu'elle n'a pas eu lieu, l'arrêt est considéré comme non terminé. Une visite de préreprise peut être demandée avant, pour anticiper.",
    relations: [
      { ficheId: 'medecine-travail', type: 'voir-aussi' },
      { ficheId: 'aptitude-ou-inaptitude', type: 'voir-aussi' },
      { ficheId: 'maintien-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'milieu-ordinaire-ou-milieu-protege', titre: 'Milieu ordinaire ou milieu protégé ?', titreDeTri: 'Milieu ordinaire ou milieu protege',
    type: 'notion', gabarit: 'comparatif', univers: 'structures-organismes', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux permettent de travailler avec un handicap, avec un accompagnement. Ce qui les distingue : le milieu ordinaire (entreprise classique, entreprise adaptée) repose sur un contrat de travail de droit commun ; le milieu protégé (ESAT) relève du secteur médico-social, avec un statut d'usager et non de salarié. Le passage de l'un à l'autre est possible dans les deux sens, sur décision de la MDPH.",
    relations: [
      { ficheId: 'esat', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rqth-ou-oeth', titre: 'RQTH ou OETH ?', titreDeTri: 'RQTH ou OETH',
    type: 'notion', gabarit: 'comparatif', univers: 'droit-travail', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux tournent autour de l'emploi des personnes handicapées et se répondent. Ce qui les distingue : la RQTH est un droit de la personne, qu'elle demande à la MDPH et qu'elle est libre de révéler ou non ; l'OETH est une obligation qui pèse sur l'employeur, celle de compter une proportion de travailleurs handicapés dans ses effectifs. C'est parce que l'OETH existe que déclarer sa RQTH peut peser dans un recrutement.",
    relations: [
      { ficheId: 'rqth', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pension-invalidite', titre: "Pension d'invalidité", titreDeTri: 'Pension d invalidite', type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ['invalidité', 'pension invalidité CPAM', 'catégories 1 2 3 invalidité'],
    corps: "La pension d'invalidité est un revenu de remplacement versé par la Sécurité sociale (la CPAM, ou la MSA pour le régime agricole) à une personne dont la capacité de travail est fortement réduite par une maladie ou un accident d'origine non professionnelle. Ce n'est pas la MDPH qui l'attribue : c'est le médecin-conseil de la caisse qui détermine la catégorie, selon que la personne reste capable d'exercer une activité (catégorie 1), en est incapable (catégorie 2), ou en est incapable et a en plus besoin d'une tierce personne au quotidien (catégorie 3). Elle reste compatible avec une reprise ou une poursuite d'activité, en particulier en catégorie 1.",
    relations: [
      { ficheId: 'rqth-ou-invalidite', type: 'voir-aussi' },
      { ficheId: 'aah', type: 'voir-aussi' },
      { ficheId: 'arret-de-travail-indemnites-journalieres', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pch', titre: 'PCH (prestation de compensation du handicap)', titreDeTri: 'PCH', type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['prestation de compensation du handicap', 'aide financière handicap quotidien', 'financer un fauteuil roulant ou un aménagement'],
    corps: "La PCH (prestation de compensation du handicap) est une aide financière du département, décidée par la MDPH, qui prend en charge des frais liés au handicap dans la vie quotidienne : aide humaine, matériel adapté, aménagement du logement ou du véhicule. Ce n'est pas un revenu de remplacement comme l'allocation aux adultes handicapés ou la pension d'invalidité : c'est le remboursement de dépenses précises, sur présentation de justificatifs. Ce n'est pas une aide à l'emploi en tant que telle, mais elle peut lever un frein concret pour se rendre au travail ou s'y maintenir.",
    relations: [
      { ficheId: 'mdph', type: 'voir-aussi' },
      { ficheId: 'carte-mobilite-inclusion', type: 'voir-aussi' }
    ]
  },
  {
    id: 'carte-mobilite-inclusion', titre: 'CMI (carte mobilité inclusion)', titreDeTri: 'CMI', type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['CMI', 'carte mobilité inclusion', 'carte stationnement handicap', 'carte priorité handicap'],
    corps: "La CMI (carte mobilité inclusion) facilite le quotidien d'une personne en situation de handicap : ce n'est pas une aide financière, c'est une carte, délivrée après une demande à la MDPH. Elle porte une mention selon le besoin : « stationnement » pour une mobilité à pied durablement réduite, « priorité » pour un accès prioritaire (transports, files d'attente), ou « invalidité » pour un handicap plus lourd, qui cumule les avantages de la carte « priorité » avec des réductions dans les transports. Le lien avec l'emploi est indirect : elle peut faciliter le trajet vers le travail ou un entretien.",
    relations: [
      { ficheId: 'mdph', type: 'voir-aussi' },
      { ficheId: 'pch', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rlh', titre: 'RLH (reconnaissance de la lourdeur du handicap)', titreDeTri: 'RLH', type: 'terme',
    univers: 'dispositifs', registres: ['langage-rh', 'langage-employeur'],
    variantesRecherche: ['reconnaissance de la lourdeur du handicap', 'aide employeur poste aménagé handicap'],
    corps: "La RLH (reconnaissance de la lourdeur du handicap) n'est pas une aide que demande la personne handicapée elle-même : c'est l'employeur, ou la personne elle-même si elle est travailleuse indépendante, qui la demande auprès de l'Agefiph. Elle compense financièrement les surcoûts réels qui restent à la charge de l'employeur une fois le poste déjà aménagé au maximum du possible. Utile à connaître surtout comme argument concret à apporter à un employeur qui hésiterait à l'embauche en raison de coûts d'aménagement perçus comme élevés.",
    relations: [
      { ficheId: 'oeth', type: 'voir-aussi' },
      { ficheId: 'agefiph', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Lire les chiffres de l'emploi (lot 12, chantier d'élargissement
  //    2026-09-08). Ce que mesure un indicateur et ce qu'il ne dit pas ; jamais
  //    un chiffre daté (il vit dans « Comprendre les chiffres »). --

  {
    id: 'demandeur-emploi-categories', titre: "Les catégories A, B, C de demandeurs d'emploi", titreDeTri: 'Categories A B C de demandeurs d emploi',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['catégorie A B C', "demandeur d'emploi catégorie A", 'activité réduite', 'différence catégorie A et C'],
    corps: "France Travail classe les personnes inscrites en catégories statistiques. La catégorie A regroupe celles qui sont sans emploi et tenues de rechercher activement. Les catégories B et C regroupent celles qui ont travaillé un peu dans le mois (activité réduite courte pour B, plus longue pour C) tout en cherchant. On parle souvent des « A, B, C » réunis pour avoir une vue large. Être inscrit ne veut pas dire être au chômage au sens des statistiques internationales : ce sont deux mesures différentes.",
    voirAussiChiffres: "Voir le nombre de demandeurs d'emploi ici",
    relations: [
      { ficheId: 'chomage-au-sens-du-bit', type: 'a-ne-pas-confondre' },
      { ficheId: 'inscrit-a-france-travail-ou-chomeur-bit', type: 'voir-aussi' },
      { ficheId: 'actualisation', type: 'voir-aussi' }
    ]
  },
  {
    id: 'inscription-automatique-france-travail-2025', titre: "L'inscription automatique à France Travail depuis 2025", titreDeTri: 'Inscription automatique a France Travail depuis 2025',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['pourquoi le nombre de chômeurs a changé', 'rupture de série chômage', 'inscription automatique RSA France Travail', 'loi pour le plein emploi inscription'],
    corps: "Depuis le 1er janvier 2025, la loi pour le plein emploi rend l'inscription à France Travail automatique pour les personnes qui touchent le RSA, ainsi que pour leur conjoint, concubin ou partenaire de PACS. Avant cette date, l'inscription restait volontaire. Ces personnes signent un contrat d'engagement et sont classées dans les mêmes catégories statistiques que les autres inscrits (A, B, C...). Conséquence pour la lecture des chiffres : le nombre total de personnes inscrites peut bouger fortement d'un trimestre à l'autre sans que le marché du travail ait changé, simplement parce que la façon de compter a changé. Les statisticiens parlent alors d'une rupture de série.",
    relations: [
      { ficheId: 'rsa', type: 'voir-aussi' },
      { ficheId: 'contrat-d-engagement', type: 'voir-aussi' },
      { ficheId: 'demandeur-emploi-categories', type: 'voir-aussi' }
    ]
  },
  {
    id: 'chomage-au-sens-du-bit', titre: 'Chômage au sens du Bureau international du travail', titreDeTri: 'Chomage au sens du Bureau international du travail',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-administratif'],
    variantesRecherche: ['taux de chômage BIT', 'comment on calcule le chômage', 'chômeur au sens international'],
    corps: "Le taux de chômage le plus souvent cité dans les médias est celui « au sens du Bureau international du travail » (BIT). Il compte comme chômeuse une personne qui, sur une semaine donnée, n'a pas travaillé une seule heure, est disponible pour prendre un emploi rapidement, et a fait des démarches de recherche récemment. Il se mesure par une enquête auprès des ménages, pas à partir des inscriptions à France Travail. C'est pourquoi il diffère du nombre d'inscrits.",
    voirAussiChiffres: "Voir le taux de chômage de votre territoire",
    relations: [
      { ficheId: 'demandeur-emploi-categories', type: 'a-ne-pas-confondre' },
      { ficheId: 'inscrit-a-france-travail-ou-chomeur-bit', type: 'voir-aussi' },
      { ficheId: 'chomage-recensement', type: 'a-ne-pas-confondre' },
      { ficheId: 'taux-d-emploi', type: 'voir-aussi' },
      { ficheId: 'population-active', type: 'voir-aussi' }
    ]
  },
  {
    id: 'demandeur-emploi-longue-duree', titre: "Demandeur d'emploi de longue durée", titreDeTri: 'Demandeur d emploi de longue duree',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-cip', 'langage-france-travail'],
    variantesRecherche: ['chômeur longue durée', "inscrit depuis plus d'un an", 'DELD', "éloigné de l'emploi depuis longtemps"],
    corps: "On parle de demandeur d'emploi de longue durée quand une personne est inscrite à France Travail depuis un an ou plus sans interruption significative. C'est un repère très utilisé dans l'accompagnement, parce que plus l'éloignement de l'emploi dure, plus les freins ont tendance à se cumuler (confiance, réseau, santé, mobilité). Certains dispositifs et certaines clauses sociales visent en priorité ce public. Ce n'est jamais un jugement sur la personne, seulement une donnée de contexte.",
    voirAussiChiffres: "Voir le chômage de longue durée ici",
    relations: [
      { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'clause-sociale', type: 'voir-aussi' },
      { ficheId: 'demandeur-emploi-categories', type: 'voir-aussi' }
    ]
  },
  {
    id: 'besoins-en-main-d-oeuvre', titre: "Besoins en main-d'œuvre (BMO)", titreDeTri: 'Besoins en main d oeuvre',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-france-travail'],
    variantesRecherche: ['BMO', "enquête besoins en main d'oeuvre", 'projets de recrutement', 'métiers qui recrutent selon les employeurs'],
    corps: "L'enquête Besoins en main-d'œuvre (BMO) est réalisée chaque année par France Travail auprès des employeurs. Elle mesure leurs intentions d'embauche pour l'année à venir : nombre de projets de recrutement, part jugée difficile à pourvoir, part liée à une activité saisonnière, par métier et par territoire. Ce sont des intentions déclarées, pas des embauches réalisées : à lire comme une tendance, jamais comme une promesse.",
    relations: [
      { ficheId: 'metier-en-tension', type: 'voir-aussi' },
      { ficheId: 'metier-en-tension-ou-metier-qui-recrute', type: 'voir-aussi' },
      { ficheId: 'bassin-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'metier-en-tension', titre: 'Métier en tension', titreDeTri: 'Metier en tension',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-administratif', 'langage-france-travail'],
    variantesRecherche: ['métier qui manque de bras', 'liste des métiers en tension', 'pénurie de candidats', 'ce métier manque de candidats'],
    corps: "Un métier est dit « en tension » quand les employeurs ont durablement du mal à recruter : plus d'offres que de candidats disponibles, délais longs, projets non pourvus. La tension peut venir d'un manque de personnes formées, de conditions de travail peu attractives, d'un problème de mobilité, ou d'une méconnaissance du métier. Les listes de métiers en tension servent à cibler des formations, et pour certains titres de séjour. Un métier en tension n'est pas forcément un métier « qui recrute » partout : cela dépend du territoire.",
    relations: [
      { ficheId: 'besoins-en-main-d-oeuvre', type: 'voir-aussi' },
      { ficheId: 'metier-en-tension-ou-metier-qui-recrute', type: 'voir-aussi' },
      { ficheId: 'projet-professionnel', type: 'voir-aussi' }
    ]
  },
  {
    id: 'neet', titre: 'NEET (ni en emploi, ni en études, ni en formation)', titreDeTri: 'NEET',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-administratif'],
    variantesRecherche: ['NEET', 'jeune ni en emploi ni en formation', 'jeune sans rien', 'jeune décrocheur'],
    corps: "NEET est un sigle anglais qui désigne les jeunes, en général de 15 à 29 ans, qui ne sont ni en emploi, ni en études, ni en formation à un moment donné. C'est un indicateur suivi au niveau européen pour repérer les jeunes les plus exposés au décrochage. Être NEET est une situation, pas une caractéristique durable : beaucoup le sont pour quelques mois, entre deux étapes. Les missions locales et les plateformes de repérage s'adressent en priorité à ce public.",
    relations: [
      { ficheId: 'mission-locale', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'zone-d-emploi', titre: "Zone d'emploi", titreDeTri: 'Zone d emploi',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-administratif'],
    variantesRecherche: ['découpage emploi INSEE', 'périmètre du marché du travail local', "à quelle échelle on mesure l'emploi"],
    corps: "Une zone d'emploi est un découpage du territoire construit par l'INSEE à partir des déplacements domicile-travail : à l'intérieur d'une zone, la plupart des habitants travaillent, et la plupart des emplois sont occupés par des habitants. Il y en a environ trois cents en France. C'est l'échelle à laquelle beaucoup de statistiques d'emploi sont publiées. Elle ne coïncide pas toujours avec le « bassin d'emploi » dont on parle localement, ni avec les limites administratives.",
    relations: [
      { ficheId: 'bassin-emploi', type: 'a-ne-pas-confondre' },
      { ficheId: 'frr', type: 'voir-aussi' }
    ]
  },
  {
    id: 'economie-presentielle', titre: 'Économie présentielle', titreDeTri: 'Economie presentielle',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-administratif'],
    variantesRecherche: ['emplois liés à la population', 'économie résidentielle', 'pourquoi certains emplois ne partent pas'],
    corps: "L'économie présentielle regroupe les activités qui servent la population présente sur un territoire, résidents comme touristes : commerce de proximité, santé, aide à domicile, éducation, bâtiment, restauration, services publics. On l'oppose à l'économie « productive », tournée vers des marchés extérieurs (industrie, agriculture d'exportation). Un territoire à forte économie présentielle a des emplois plus stables face aux crises sectorielles, mais souvent moins bien rémunérés et plus saisonniers.",
    relations: [
      { ficheId: 'bassin-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'inscrit-a-france-travail-ou-chomeur-bit', titre: "Inscrit à France Travail ou chômeur au sens du BIT ?", titreDeTri: 'Inscrit a France Travail ou chomeur au sens du BIT',
    type: 'notion', gabarit: 'comparatif', univers: 'emploi-recrutement', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux décrivent des personnes qui cherchent du travail, et les chiffres évoluent souvent dans le même sens. Ce qui les distingue : le nombre d'inscrits à France Travail vient des fichiers de gestion (toute personne inscrite, y compris en activité réduite ou momentanément indisponible) ; le taux de chômage au sens du BIT vient d'une enquête et applique des critères stricts (aucune heure travaillée, disponible tout de suite, recherche active). On peut être inscrit sans être chômeur au sens du BIT, et l'inverse.",
    voirAussiChiffres: "Comparer les deux chiffres pour votre territoire",
    relations: [
      { ficheId: 'demandeur-emploi-categories', type: 'voir-aussi' },
      { ficheId: 'correction-variations-saisonnieres', type: 'voir-aussi' }
    ]
  },
  {
    id: 'metier-en-tension-ou-metier-qui-recrute', titre: 'Métier en tension ou métier qui recrute ?', titreDeTri: 'Metier en tension ou metier qui recrute',
    type: 'notion', gabarit: 'comparatif', univers: 'emploi-recrutement', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : dans les deux cas, il y a des postes à prendre. Ce qui les distingue : un métier « qui recrute » a beaucoup d'offres, plutôt une bonne nouvelle pour un candidat. Un métier « en tension » a des offres que les employeurs peinent à pourvoir : cela peut venir d'un manque de personnes formées, mais aussi de conditions de travail, d'horaires ou de salaires qui rebutent. Regarder pourquoi un métier est en tension aide à savoir s'il convient.",
    relations: [
      { ficheId: 'metier-en-tension', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Créer son activité (lot 5, chantier d'élargissement 2026-09-08).
  //    Le principe de chaque statut et de chaque appui, jamais les seuils fiscaux
  //    ni les taux (fiches datées de « Comprendre le cadre »). --

  {
    id: 'cae', titre: "Coopérative d'activité et d'emploi (CAE)", titreDeTri: 'Cooperative d activite et d emploi',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ['CAE', 'entrepreneur salarié', 'tester mon activité en étant salarié', "coopérative d'activité"],
    corps: "Une coopérative d'activité et d'emploi (CAE) permet de développer son activité en étant « entrepreneur salarié » : on garde la sécurité d'un contrat de travail et d'une fiche de paie, tout en construisant sa clientèle, la coopérative s'occupant de la comptabilité, des factures et des cotisations. On peut y tester un projet avant de se lancer seul, puis rester associé de la coopérative. C'est une alternative à la création d'une entreprise individuelle.",
    relations: [
      { ficheId: 'auto-entrepreneur', type: 'a-ne-pas-confondre' },
      { ficheId: 'reconversion', type: 'voir-aussi' },
      { ficheId: 'cep', type: 'voir-aussi' },
      { ficheId: 'cape', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pret-d-honneur', titre: "Prêt d'honneur", titreDeTri: 'Pret d honneur',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['prêt à taux zéro pour créer', 'prêt sans garantie', 'Initiative France', 'Réseau Entreprendre'],
    corps: "Un prêt d'honneur est un prêt à taux zéro, sans garantie ni caution personnelle, accordé à la personne et non à l'entreprise, pour l'aider à créer ou reprendre une activité. Il est accordé par des réseaux d'accompagnement (Initiative France, Réseau Entreprendre, Adie) après examen du projet par un comité, et il sert d'apport qui aide ensuite à obtenir un prêt bancaire. Il s'accompagne d'un suivi et parfois d'un parrainage.",
    relations: [
      { ficheId: 'microcredit-professionnel', type: 'a-ne-pas-confondre' },
      { ficheId: 'guichet-unique-entreprises', type: 'voir-aussi' },
      { ficheId: 'garantie-de-pret', type: 'voir-aussi' }
    ]
  },
  {
    id: 'microcredit-professionnel', titre: 'Microcrédit professionnel', titreDeTri: 'Microcredit professionnel',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['petit prêt pour créer son activité', 'Adie prêt', 'crédit création refusé par la banque'],
    corps: "Le microcrédit professionnel est un petit prêt destiné à financer la création, la reprise ou le développement d'une activité, pour des personnes qui n'ont pas accès au crédit bancaire classique (demandeurs d'emploi, bénéficiaires de minima sociaux, revenus modestes). Il est porté par des acteurs comme l'Adie, sur une durée courte, et il est toujours associé à un accompagnement du porteur de projet.",
    relations: [
      { ficheId: 'pret-d-honneur', type: 'a-ne-pas-confondre' },
      { ficheId: 'microcredit-personnel-ou-professionnel', type: 'voir-aussi' },
      { ficheId: 'microcredit-personnel', type: 'voir-aussi' }
    ]
  },
  {
    id: 'guichet-unique-entreprises', titre: 'Guichet unique des formalités des entreprises', titreDeTri: 'Guichet unique des formalites des entreprises',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['où créer son entreprise', 'INPI guichet unique', 'immatriculer mon entreprise', 'formalités de création'],
    corps: "Depuis 2023, toutes les formalités des entreprises (création, modification, cessation) passent par un site internet unique géré par l'INPI, quel que soit le statut ou l'activité. On y dépose une seule fois son dossier, qui est ensuite transmis aux organismes concernés (Insee pour le numéro SIREN, impôts, sécurité sociale, greffe). Il a remplacé les anciens centres de formalités des entreprises.",
    relations: [
      { ficheId: 'siren-ou-siret', type: 'voir-aussi' },
      { ficheId: 'auto-entrepreneur', type: 'voir-aussi' }
    ]
  },
  {
    id: 'travailleur-non-salarie', titre: 'Travailleur non salarié (TNS)', titreDeTri: 'Travailleur non salarie',
    type: 'terme', univers: 'entrepreneuriat-independance', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['TNS', 'statut indépendant', 'je ne suis pas salarié de ma société', "cotisations d'indépendant"],
    corps: "Un travailleur non salarié (TNS) est une personne qui exerce une activité professionnelle sans contrat de travail ni lien de subordination : chef d'entreprise individuelle, gérant majoritaire de société, profession libérale, exploitant agricole. Sa protection sociale (maladie, retraite) relève d'un régime propre, géré par l'Assurance maladie pour les indépendants ou la MSA pour l'agricole, et il ne cotise pas à l'assurance chômage classique. C'est le pendant du statut de salarié.",
    relations: [
      { ficheId: 'salarie-ou-travailleur-non-salarie', type: 'voir-aussi' },
      { ficheId: 'msa', type: 'voir-aussi' },
      { ficheId: 'profession-liberale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'siren-ou-siret', titre: 'SIREN ou SIRET ?', titreDeTri: 'SIREN ou SIRET',
    type: 'notion', gabarit: 'comparatif', univers: 'entrepreneuriat-independance', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des numéros attribués par l'Insee à la création d'une entreprise, qui servent à l'identifier dans toutes les démarches. Ce qui les distingue : le SIREN, à neuf chiffres, identifie l'entreprise elle-même et ne change jamais ; le SIRET, à quatorze chiffres (le SIREN plus cinq chiffres), identifie un établissement précis, une adresse d'activité. Une entreprise a un SIREN et un ou plusieurs SIRET.",
    relations: [
      { ficheId: 'guichet-unique-entreprises', type: 'voir-aussi' }
    ]
  },
  {
    id: 'entreprise-individuelle-ou-societe', titre: 'Entreprise individuelle ou société ?', titreDeTri: 'Entreprise individuelle ou societe',
    type: 'notion', gabarit: 'comparatif', univers: 'entrepreneuriat-independance', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux permettent d'exercer une activité indépendante et d'employer des personnes. Ce qui les distingue : en entreprise individuelle, dont la micro-entreprise, il n'y a pas de personne juridique séparée de l'entrepreneur et la gestion est légère ; une société (SARL, SAS, EURL...) crée une entité distincte, avec des statuts, un capital et un fonctionnement plus lourds, mais qui protège mieux le patrimoine personnel et facilite l'association à plusieurs.",
    relations: [
      { ficheId: 'auto-entrepreneur', type: 'voir-aussi' }
    ]
  },
  {
    id: 'salarie-ou-travailleur-non-salarie', titre: 'Salarié ou travailleur non salarié ?', titreDeTri: 'Salarie ou travailleur non salarie',
    type: 'notion', gabarit: 'comparatif', univers: 'entrepreneuriat-independance', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux désignent des façons de travailler et de cotiser. Ce qui les distingue : le salarié a un contrat de travail, un lien de subordination, une fiche de paie, et cotise notamment à l'assurance chômage ; le travailleur non salarié organise lui-même son activité, relève d'un régime social propre, et n'ouvre pas de droits au chômage classique. Un même métier peut s'exercer sous l'un ou l'autre statut, avec des conséquences différentes en cas d'arrêt d'activité.",
    relations: [
      { ficheId: 'travailleur-non-salarie', type: 'voir-aussi' }
    ]
  },
  {
    id: 'microcredit-personnel-ou-professionnel', titre: 'Microcrédit personnel ou professionnel ?', titreDeTri: 'Microcredit personnel ou professionnel',
    type: 'notion', gabarit: 'comparatif', univers: 'dispositifs', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont de petits prêts accompagnés, pour des personnes sans accès au crédit bancaire classique. Ce qui les distingue : le microcrédit personnel finance un besoin de la vie courante qui aide à l'insertion (permis, voiture, équipement, formation) ; le microcrédit professionnel finance la création ou le développement d'une activité. Ce n'est ni le même interlocuteur ni le même montage.",
    relations: [
      { ficheId: 'microcredit-personnel', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Les repères des 16-25 ans (lot 7, chantier d'élargissement
  //    2026-09-08). Des portes, jamais un contrôle : chaque fiche dit qu'y
  //    répondre n'engage à rien. --

  {
    id: 'cfa', titre: "Centre de formation d'apprentis (CFA)", titreDeTri: 'Centre de formation d apprentis',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['CFA', "où se passe la partie cours de l'apprentissage", "centre d'apprentissage"],
    corps: "Un centre de formation d'apprentis (CFA) assure la partie théorique d'un contrat d'apprentissage : l'apprenti partage son temps entre le CFA et l'entreprise. Il prépare à un diplôme ou un titre professionnel, du CAP à des niveaux supérieurs. La formation est gratuite pour l'apprenti, financée par l'opérateur de compétences de l'entreprise. Certains CFA proposent aussi une année de préparation à l'apprentissage.",
    relations: [
      { ficheId: 'alternance', type: 'voir-aussi' },
      { ficheId: 'apprentissage-ou-professionnalisation', type: 'voir-aussi' },
      { ficheId: 'opco', type: 'voir-aussi' }
    ]
  },
  {
    id: 'opco', titre: 'OPCO (opérateur de compétences)', titreDeTri: 'OPCO',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif', 'langage-rh'],
    variantesRecherche: ['operateur de competences', 'qui finance mon apprentissage', 'qui finance mon contrat de professionnalisation'],
    corps: "Un OPCO (opérateur de compétences) est un organisme agréé, un par grande branche professionnelle, qui aide les entreprises à financer et organiser la formation de leurs salariés. Pour une personne en recherche d'emploi, ce qui compte à retenir : c'est lui qui finance le coût de la formation d'un contrat d'apprentissage ou de professionnalisation auprès du centre de formation, à la place de l'entreprise qui embauche. Il ne verse rien directement à la personne et n'intervient pas dans le recrutement : c'est un acteur du côté de l'employeur, utile à connaître pour comprendre qui paie quoi dans une alternance.",
    relations: [
      { ficheId: 'alternance', type: 'voir-aussi' },
      { ficheId: 'cfa', type: 'voir-aussi' },
      { ficheId: 'apprentissage-ou-professionnalisation', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ecole-2e-chance', titre: "École de la deuxième chance (E2C)", titreDeTri: 'Ecole de la deuxieme chance',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ['E2C', 'deuxième chance', 'école pour les jeunes sans diplôme', 'reprendre après avoir tout arrêté'],
    corps: "Une école de la deuxième chance (E2C) accueille des jeunes de 16 à 25 ans sortis du système scolaire sans diplôme ni qualification et sans emploi. Le parcours, individualisé et rémunéré au titre de la formation professionnelle, alterne remise à niveau des savoirs de base, travail sur le projet, stages en entreprise et suivi personnalisé. L'entrée se fait toute l'année, sans condition de diplôme, souvent via la mission locale.",
    relations: [
      { ficheId: 'ecole-2e-chance-ou-epide', type: 'voir-aussi' },
      { ficheId: 'mission-locale', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'epide', titre: "EPIDE (établissement pour l'insertion dans l'emploi)", titreDeTri: 'EPIDE',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['EPIDE', 'internat pour jeunes sans emploi', 'cadre militaire insertion jeunes'],
    corps: "L'EPIDE (établissement pour l'insertion dans l'emploi) propose aux 17 à 25 ans sans diplôme ni emploi, volontaires, un parcours en internat de plusieurs mois, avec un cadre proche du milieu militaire (uniforme, horaires, discipline) mais civil. Le programme mêle remise à niveau, savoir-être, sport, préparation au permis et construction du projet professionnel. Il est rémunéré. L'orientation passe par la mission locale.",
    relations: [
      { ficheId: 'ecole-2e-chance-ou-epide', type: 'voir-aussi' },
      { ficheId: 'mission-locale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ecole-de-production', titre: 'École de production', titreDeTri: 'Ecole de production',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['apprendre un métier en produisant', 'faire pour apprendre', 'atelier plutôt que lycée'],
    corps: "Une école de production forme des jeunes, dès 15 ans, à un métier manuel (mécanique, chaudronnerie, menuiserie, cuisine, horticulture...) en les faisant travailler sur de vraies commandes de clients : « faire pour apprendre ». Environ deux tiers du temps se passe en atelier, le reste en cours. Elle prépare à un diplôme (CAP, bac professionnel) et vise une insertion rapide. C'est une alternative au lycée professionnel ou à l'apprentissage pour un jeune qui apprend mieux en produisant.",
    relations: [
      { ficheId: 'alternance', type: 'a-ne-pas-confondre' },
      { ficheId: 'orientation', type: 'voir-aussi' },
      { ficheId: 'prepa-apprentissage', type: 'voir-aussi' }
    ]
  },
  {
    id: 'service-civique', titre: 'Service civique', titreDeTri: 'Service civique',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['mission de service civique', 'engagement volontaire jeune', "s'engager quelques mois", 'volontariat associatif'],
    corps: "Le service civique est un engagement volontaire de plusieurs mois dans une mission d'intérêt général, au sein d'une association, d'une collectivité ou d'un établissement public : solidarité, environnement, éducation, sport, culture, santé. Il est ouvert aux 16-25 ans (30 ans en situation de handicap), sans condition de diplôme, et donne lieu à une indemnité. Ce n'est ni un emploi, ni un stage : c'est une expérience qui peut aider à mûrir un projet, reprendre confiance et étoffer un parcours.",
    relations: [
      { ficheId: 'stage', type: 'a-ne-pas-confondre' },
      { ficheId: 'mission-locale', type: 'voir-aussi' },
      { ficheId: 'projet-professionnel', type: 'voir-aussi' }
    ]
  },
  {
    id: 'obligation-de-formation', titre: 'Obligation de formation des 16-18 ans', titreDeTri: 'Obligation de formation des 16-18 ans',
    type: 'terme', univers: 'droit-travail', registres: ['langage-administratif'],
    variantesRecherche: ['obligation de formation 16 18 ans', 'un jeune mineur sans rien', "jusqu'à quel âge on doit étudier ou travailler"],
    corps: "Depuis 2020, tout jeune de 16 à 18 ans doit être en formation, en emploi, en apprentissage ou dans un dispositif d'accompagnement : c'est l'obligation de formation, prolongement de l'instruction obligatoire. Elle ne crée pas de sanction contre le jeune, mais oblige les pouvoirs publics à repérer et recontacter ceux qui ne sont nulle part, via la mission locale et les plateformes de repérage. Le but est qu'aucun jeune ne décroche sans solution.",
    relations: [
      { ficheId: 'psad', type: 'voir-aussi' },
      { ficheId: 'mission-locale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'psad', titre: "Plateforme de suivi et d'appui aux décrocheurs (PSAD)", titreDeTri: 'Plateforme de suivi et d appui aux decrocheurs',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['PSAD', 'plateforme décrochage', "être recontacté après avoir quitté l'école"],
    corps: "Une plateforme de suivi et d'appui aux décrocheurs (PSAD) réunit sur un territoire les acteurs qui peuvent aider un jeune de 16 à 25 ans sorti de formation sans diplôme : mission locale, éducation nationale, autres partenaires. Elle repère ces jeunes à partir de fichiers croisés, les recontacte, fait le point avec eux sans jugement, et leur propose un retour en formation, un accompagnement ou un dispositif adapté. Y répondre n'engage à rien : c'est une porte, pas un contrôle.",
    relations: [
      { ficheId: 'obligation-de-formation', type: 'voir-aussi' },
      { ficheId: 'mission-locale', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'apprentissage-ou-professionnalisation', titre: 'Apprentissage ou professionnalisation ?', titreDeTri: 'Apprentissage ou professionnalisation',
    type: 'notion', gabarit: 'comparatif', univers: 'contrats-statuts-emploi', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des contrats d'alternance, qui associent un emploi et une formation diplômante ou qualifiante. Ce qui les distingue : le contrat d'apprentissage vise d'abord un diplôme ou un titre, s'adresse surtout aux jeunes et passe par un CFA ; le contrat de professionnalisation vise une qualification reconnue par une branche, s'ouvre plus largement aux adultes en reconversion et aux demandeurs d'emploi, et laisse plus de souplesse à l'organisme de formation.",
    relations: [
      { ficheId: 'alternance', type: 'voir-aussi' },
      { ficheId: 'contrat-d-apprentissage', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ecole-2e-chance-ou-epide', titre: "École de la deuxième chance ou EPIDE ?", titreDeTri: 'Ecole de la deuxieme chance ou EPIDE',
    type: 'notion', gabarit: 'comparatif', univers: 'structures-organismes', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux accueillent des jeunes sans diplôme ni emploi, sur la base du volontariat, avec une formation rémunérée qui travaille les savoirs de base et le projet. Ce qui les distingue : l'école de la deuxième chance se suit en journée, près de chez soi, avec beaucoup de stages en entreprise ; l'EPIDE se vit en internat, avec un cadre inspiré du milieu militaire et un travail fort sur le rythme et le collectif.",
    relations: [
      { ficheId: 'ecole-2e-chance', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Travailler en venant de l'étranger (lot 8, chantier
  //    d'élargissement 2026-09-08). Ce que porte un titre, qui fait quoi ;
  //    jamais dérouler une procédure de préfecture. --

  {
    id: 'ofii', titre: "OFII (Office français de l'immigration et de l'intégration)", titreDeTri: 'OFII',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['OFII', "office de l'immigration", 'visite médicale étranger', 'rendez-vous OFII'],
    corps: "L'OFII (Office français de l'immigration et de l'intégration) est l'établissement public chargé de l'accueil des personnes étrangères qui s'installent durablement en France : il fait passer la visite médicale d'arrivée, signe le contrat d'intégration républicaine, oriente vers les formations civique et de français, et gère certaines aides. C'est un interlocuteur différent de la préfecture, qui délivre les titres de séjour.",
    relations: [
      { ficheId: 'contrat-integration-republicaine', type: 'voir-aussi' },
      { ficheId: 'fle', type: 'voir-aussi' },
      { ficheId: 'ofpra', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'ofpra', titre: "OFPRA (Office français de protection des réfugiés et apatrides)", titreDeTri: 'OFPRA',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['OFPRA', "demande d'asile qui décide", 'entretien asile', 'reconnaissance du statut de réfugié'],
    corps: "L'OFPRA (Office français de protection des réfugiés et apatrides) est l'organisme qui examine les demandes d'asile et décide d'accorder ou non une protection : le statut de réfugié ou la protection subsidiaire. Il convoque le demandeur à un entretien. Un refus peut être contesté devant la Cour nationale du droit d'asile. L'OFPRA délivre ensuite les documents d'état civil des personnes protégées.",
    relations: [
      { ficheId: 'protection-subsidiaire', type: 'voir-aussi' },
      { ficheId: 'refugie-ou-protection-subsidiaire', type: 'voir-aussi' },
      { ficheId: 'attestation-de-demande-d-asile', type: 'voir-aussi' },
      { ficheId: 'ofii', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'protection-subsidiaire', titre: 'Protection subsidiaire', titreDeTri: 'Protection subsidiaire',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['protégé sans être réfugié', 'menace grave dans mon pays', 'autre protection que le statut de réfugié'],
    corps: "La protection subsidiaire est accordée par l'OFPRA à une personne qui ne remplit pas les conditions du statut de réfugié, mais qui serait exposée dans son pays à une menace grave (peine de mort, torture, violence dans un conflit armé). Elle ouvre un titre de séjour, le droit de travailler sans autorisation spécifique, et l'accès aux droits sociaux. Elle est réexaminée périodiquement mais se renouvelle tant que le risque demeure.",
    relations: [
      { ficheId: 'refugie-ou-protection-subsidiaire', type: 'voir-aussi' },
      { ficheId: 'autorisation-de-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'contrat-integration-republicaine', titre: "Contrat d'intégration républicaine (CIR)", titreDeTri: 'Contrat d integration republicaine',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['CIR', "contrat d'intégration", 'formation civique OFII', "parcours d'intégration"],
    corps: "Le contrat d'intégration républicaine (CIR) est signé avec l'OFII par la plupart des personnes étrangères qui obtiennent un premier titre de séjour et souhaitent s'installer durablement. Il engage à suivre une formation civique (valeurs et fonctionnement de la République, accès à l'emploi et au logement) et, si le niveau de français le nécessite, une formation linguistique, toutes deux gratuites. Le suivi de ce parcours compte pour l'obtention des titres de séjour suivants.",
    relations: [
      { ficheId: 'ofii', type: 'voir-aussi' },
      { ficheId: 'fle', type: 'voir-aussi' },
      { ficheId: 'primo-arrivant', type: 'voir-aussi' }
    ]
  },
  {
    id: 'autorisation-de-travail', titre: 'Autorisation de travail', titreDeTri: 'Autorisation de travail',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['droit de travailler avec un titre de séjour', 'autorisation de travail salarié étranger', 'mon titre autorise-t-il le travail'],
    corps: "L'autorisation de travail est le droit, pour une personne étrangère non européenne, d'occuper un emploi salarié en France. Selon le titre de séjour, elle est incluse (le titre « autorise le travail ») ou doit être demandée par l'employeur avant l'embauche. Certains titres l'ouvrent sans démarche (vie privée et familiale, réfugié, protection subsidiaire, étudiant dans une limite d'heures). Vérifier ce que porte le titre de séjour est la première chose à faire avant une candidature.",
    relations: [
      { ficheId: 'titre-de-sejour-ou-autorisation-de-travail', type: 'voir-aussi' },
      { ficheId: 'metier-en-tension', type: 'voir-aussi' },
      { ficheId: 'france-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'primo-arrivant', titre: 'Primo-arrivant', titreDeTri: 'Primo-arrivant',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ['primo arrivant', 'arrivé récemment en France', 'moins de cinq ans en France'],
    corps: "« Primo-arrivant » désigne une personne étrangère non européenne, admise à séjourner durablement en France depuis moins de cinq ans, qui s'engage dans un parcours d'intégration. Cette qualité ouvre l'accès à des dispositifs dédiés : formation linguistique renforcée, actions d'accompagnement vers l'emploi, points d'information spécialisés. Elle sert de repère pour orienter, jamais d'étiquette.",
    relations: [
      { ficheId: 'contrat-integration-republicaine', type: 'voir-aussi' },
      { ficheId: 'fle', type: 'voir-aussi' },
      { ficheId: 'accord-de-reciprocite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'attestation-de-comparabilite', titre: 'Attestation de comparabilité', titreDeTri: 'Attestation de comparabilite',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['ENIC-NARIC', 'reconnaissance de mon diplôme étranger', 'équivalence de diplôme', "diplôme obtenu à l'étranger"],
    corps: "L'attestation de comparabilité, délivrée par le centre ENIC-NARIC France, situe un diplôme obtenu à l'étranger par rapport aux niveaux français, sans l'équivaler automatiquement. Elle aide un employeur, un organisme de formation ou France Travail à comprendre ce que vaut le diplôme. Elle ne remplace pas un diplôme français exigé pour une profession réglementée (santé, droit, enseignement...), qui suit une procédure propre.",
    relations: [
      { ficheId: 'qualification', type: 'voir-aussi' },
      { ficheId: 'profession-reglementee', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'titre-de-sejour', titre: 'Titre de séjour', titreDeTri: 'Titre de sejour',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['carte de séjour', 'papiers pour rester en France', 'renouvellement de mon titre'],
    corps: "Un titre de séjour est le document qui autorise une personne étrangère non européenne à résider en France pour une durée donnée. Il en existe de nombreuses catégories selon le motif (travail, famille, études, protection, soins...), avec des droits différents attachés, notamment pour travailler. Il est délivré et renouvelé par la préfecture. Beaucoup de démarches (emploi, aides, banque, logement) dépendent d'un titre en cours de validité : anticiper le renouvellement évite des ruptures de droits.",
    relations: [
      { ficheId: 'titre-de-sejour-ou-autorisation-de-travail', type: 'voir-aussi' },
      { ficheId: 'autorisation-de-travail', type: 'voir-aussi' },
      { ficheId: 'admission-exceptionnelle-au-sejour', type: 'voir-aussi' }
    ]
  },
  {
    id: 'refugie-ou-protection-subsidiaire', titre: 'Statut de réfugié ou protection subsidiaire ?', titreDeTri: 'Statut de refugie ou protection subsidiaire',
    type: 'notion', gabarit: 'comparatif', univers: 'demarches-administratives', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont accordés par l'OFPRA à des personnes qui ne peuvent pas rentrer dans leur pays sans danger, et ouvrent un titre de séjour, le droit de travailler et les droits sociaux. Ce qui les distingue : le statut de réfugié vise une persécution personnelle liée à des motifs précis (opinions, religion, appartenance à un groupe...) et donne une carte de longue durée ; la protection subsidiaire vise une menace grave d'une autre nature et se renouvelle par périodes plus courtes.",
    relations: [
      { ficheId: 'ofpra', type: 'voir-aussi' }
    ]
  },
  {
    id: 'titre-de-sejour-ou-autorisation-de-travail', titre: "Titre de séjour ou autorisation de travail ?", titreDeTri: 'Titre de sejour ou autorisation de travail',
    type: 'notion', gabarit: 'comparatif', univers: 'droit-travail', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux conditionnent la possibilité de travailler en France pour une personne étrangère non européenne. Ce qui les distingue : le titre de séjour donne le droit de résider ; l'autorisation de travail donne le droit d'occuper un emploi salarié. Certains titres incluent l'autorisation de travail, d'autres non : dans ce cas, c'est l'employeur qui doit la demander avant l'embauche.",
    relations: [
      { ficheId: 'titre-de-sejour', type: 'voir-aussi' },
      { ficheId: 'recepisse', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Emploi et sortie de détention (lot 9, chantier d'élargissement
  //    2026-09-08). Le rôle des acteurs et ce que la personne maîtrise
  //    (le bulletin n° 3), jamais un jugement. --

  {
    id: 'spip', titre: "SPIP (service pénitentiaire d'insertion et de probation)", titreDeTri: 'SPIP',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['SPIP', 'conseiller pénitentiaire', 'CPIP', 'accompagnement sortie de prison'],
    corps: "Le SPIP (service pénitentiaire d'insertion et de probation) accompagne les personnes placées sous main de justice, en détention comme à l'extérieur (sursis probatoire, travail d'intérêt général, libération sous contrainte...). Un conseiller pénitentiaire d'insertion et de probation (CPIP) fait le point sur la situation, prépare la sortie (logement, emploi, droits, santé), et s'assure du respect des obligations. Il fait le lien avec France Travail, les missions locales et les structures d'insertion.",
    relations: [
      { ficheId: 'amenagement-de-peine', type: 'voir-aussi' },
      { ficheId: 'iae', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'amenagement-de-peine', titre: 'Aménagement de peine', titreDeTri: 'Amenagement de peine',
    type: 'terme', univers: 'dispositifs', registres: ['langage-juridique'],
    variantesRecherche: ['bracelet électronique', 'semi-liberté', 'détention à domicile', 'exécuter sa peine autrement'],
    corps: "Un aménagement de peine permet d'exécuter une peine de prison autrement qu'en détention continue : détention à domicile sous surveillance électronique (le « bracelet »), semi-liberté, placement à l'extérieur, libération sous contrainte. Il est décidé par le juge de l'application des peines, souvent sous condition d'avoir un projet (emploi, formation, soins, hébergement). Le but est de préparer une sortie progressive et de réduire le risque de récidive.",
    relations: [
      { ficheId: 'spip', type: 'voir-aussi' },
      { ficheId: 'milieu-ouvert-ou-milieu-ferme', type: 'voir-aussi' },
      { ficheId: 'liberation-sous-contrainte', type: 'voir-aussi' }
    ]
  },
  {
    id: 'bulletin-n-3', titre: "Bulletin n° 3 du casier judiciaire", titreDeTri: 'Bulletin n 3 du casier judiciaire',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['bulletin numéro 3', 'extrait de casier pour un emploi', 'casier vierge', "l'employeur peut-il voir mon casier"],
    corps: "Le bulletin n° 3 est l'extrait du casier judiciaire qui ne mentionne que les condamnations les plus lourdes. Il ne peut être demandé que par la personne elle-même, qui décide ensuite de le montrer ou non. Un employeur ne peut l'exiger que pour certains emplois précis (contact avec des mineurs, sécurité, fonctions réglementées). Pour la grande majorité des postes, il n'a pas à être fourni. Il se demande en ligne, gratuitement.",
    relations: [
      { ficheId: 'casier-judiciaire', type: 'voir-aussi' },
      { ficheId: 'bulletin-2-ou-bulletin-3', type: 'voir-aussi' },
      { ficheId: 'discrimination-embauche', type: 'voir-aussi' }
    ]
  },
  {
    id: 'bulletin-2-ou-bulletin-3', titre: 'Bulletin n° 2 ou bulletin n° 3 ?', titreDeTri: 'Bulletin n 2 ou bulletin n 3',
    type: 'notion', gabarit: 'comparatif', univers: 'droit-travail', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des extraits du casier judiciaire, avec moins de mentions que le bulletin n° 1. Ce qui les distingue : le bulletin n° 2 est transmis directement à certaines administrations et à des employeurs publics, sans passer par la personne, et contient plus de condamnations ; le bulletin n° 3 ne peut être obtenu que par la personne concernée, ne contient que les peines les plus lourdes, et c'est elle qui choisit de le présenter.",
    relations: [
      { ficheId: 'casier-judiciaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'milieu-ouvert-ou-milieu-ferme', titre: 'Milieu ouvert ou milieu fermé ?', titreDeTri: 'Milieu ouvert ou milieu ferme',
    type: 'notion', gabarit: 'comparatif', univers: 'structures-organismes', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : dans les deux cas, la personne est suivie par le service pénitentiaire d'insertion et de probation. Ce qui les distingue : le milieu fermé, c'est l'exécution de la peine en établissement pénitentiaire ; le milieu ouvert, c'est le suivi hors les murs (sursis probatoire, travail d'intérêt général, libération sous contrainte, aménagement de peine), avec des obligations à respecter. La réinsertion, notamment l'emploi, se prépare dans les deux.",
    relations: [
      { ficheId: 'spip', type: 'voir-aussi' },
      { ficheId: 'juge-de-l-application-des-peines', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Travailler après 50 ans, préparer sa retraite (lot 10, chantier
  //    d'élargissement 2026-09-08). Les choix de fin de carrière au niveau du
  //    principe ; jamais un âge chiffré ni un montant. --

  {
    id: 'cumul-emploi-retraite', titre: 'Cumul emploi-retraite', titreDeTri: 'Cumul emploi-retraite',
    type: 'terme', univers: 'droit-travail', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['travailler en touchant sa retraite', 'reprendre un emploi à la retraite', 'cumul retraite et salaire'],
    corps: "Le cumul emploi-retraite permet de reprendre ou de continuer une activité professionnelle tout en touchant sa pension de retraite. Il peut être « intégral » : la pension est versée en entier, sans limite de revenu, quand on a l'âge du taux plein et toutes ses conditions ; sinon il est « plafonné » : la somme du salaire et de la pension ne doit pas dépasser un certain niveau, faute de quoi la pension est réduite. Depuis 2023, reprendre une activité peut, sous conditions, générer de nouveaux droits.",
    relations: [
      { ficheId: 'cumul-integral-ou-cumul-plafonne', type: 'voir-aussi' },
      { ficheId: 'contrat-valorisation-experience', type: 'voir-aussi' },
      { ficheId: 'retraite-progressive', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'suspension-reforme-retraites-2026', titre: 'La suspension de la réforme des retraites (2026-2028)', titreDeTri: 'Suspension de la reforme des retraites 2026-2028', type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['réforme des retraites suspendue', 'départ retraite carrière longue 2026', 'bonification retraite enfants'],
    corps: "Depuis le 1er septembre 2026, la réforme des retraites de 2023 est suspendue jusqu'en 2028 : le relèvement de l'âge légal de départ et l'allongement de la durée d'assurance sont gelés pour les générations concernées par cette période. Les conditions de départ anticipé pour carrière longue sont assouplies pendant la suspension. Les règles de calcul liées aux enfants évoluent aussi, pour réduire les écarts entre parents dans l'accès à un départ anticipé. Ce que cela change concrètement dépend de l'année de naissance et de la carrière de chacun, et peut encore bouger d'ici 2028 : un entretien information retraite permet de le vérifier avec précision, plutôt qu'une règle générale à retenir par cœur.",
    relations: [
      { ficheId: 'entretien-information-retraite', type: 'voir-aussi' },
      { ficheId: 'releve-de-carriere', type: 'voir-aussi' },
      { ficheId: 'cumul-emploi-retraite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'retraite-progressive', titre: 'Retraite progressive', titreDeTri: 'Retraite progressive',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['réduire son temps de travail en fin de carrière', 'temps partiel avant la retraite', 'partir en douceur'],
    corps: "La retraite progressive permet, à partir d'un certain âge et avec une durée d'assurance suffisante, de réduire son temps de travail tout en touchant une partie de sa pension pour compenser la baisse de salaire. On continue à cotiser, ce qui augmente la pension définitive au moment du départ complet. C'est un moyen d'aménager une fin de carrière plutôt que de s'arrêter d'un coup. La demande se fait auprès de l'employeur puis de la caisse de retraite.",
    relations: [
      { ficheId: 'cumul-emploi-retraite', type: 'a-ne-pas-confondre' },
      { ficheId: 'temps-partiel', type: 'voir-aussi' }
    ]
  },
  {
    id: 'releve-de-carriere', titre: 'Relevé de carrière', titreDeTri: 'Releve de carriere',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['mes trimestres pour la retraite', 'vérifier ma carrière', 'relevé individuel de situation', 'périodes manquantes retraite'],
    corps: "Le relevé de carrière récapitule tout ce qui a été enregistré pour la retraite d'une personne, régime par régime : trimestres validés, salaires reportés, périodes de chômage ou de maladie. Il est consultable à tout âge sur le site officiel de l'assurance retraite. Le vérifier tôt permet de repérer et de faire corriger une période manquante, avec les justificatifs, bien avant le départ.",
    relations: [
      { ficheId: 'entretien-information-retraite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'entretien-information-retraite', titre: 'Entretien information retraite', titreDeTri: 'Entretien information retraite',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['entretien retraite à 45 ans', 'rendez-vous conseiller retraite', 'estimation de ma retraite'],
    corps: "L'entretien information retraite est un rendez-vous gratuit, proposé à partir de 45 ans, avec un conseiller de sa caisse de retraite. Il fait le point sur la carrière enregistrée, estime les droits futurs selon différents âges de départ, et répond aux questions (rachat de trimestres, périodes à l'étranger, effet d'un temps partiel...). Il n'engage à rien et peut être demandé plusieurs fois au fil de la carrière.",
    relations: [
      { ficheId: 'releve-de-carriere', type: 'voir-aussi' },
      { ficheId: 'evolution-professionnelle', type: 'voir-aussi' }
    ]
  },
  {
    id: 'mise-a-la-retraite', titre: 'Mise à la retraite', titreDeTri: 'Mise a la retraite',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique', 'langage-rh'],
    variantesRecherche: ["l'employeur me met à la retraite", 'départ à la retraite forcé', "âge de mise à la retraite d'office"],
    corps: "La mise à la retraite, c'est la rupture du contrat de travail à l'initiative de l'employeur parce que le salarié a atteint un certain âge. Avant un âge élevé fixé par la loi, l'employeur ne peut que proposer ce départ, que le salarié est libre de refuser sans conséquence ; au-delà, il peut l'imposer, en respectant un préavis et en versant une indemnité. Elle se distingue du départ volontaire, décidé par le salarié lui-même.",
    relations: [
      { ficheId: 'depart-volontaire-ou-mise-a-la-retraite', type: 'voir-aussi' },
      { ficheId: 'preavis', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cumul-integral-ou-cumul-plafonne', titre: 'Cumul intégral ou cumul plafonné ?', titreDeTri: 'Cumul integral ou cumul plafonne',
    type: 'notion', gabarit: 'comparatif', univers: 'droit-travail', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : dans les deux cas, on travaille tout en percevant sa retraite. Ce qui les distingue : le cumul intégral verse la pension en entier, sans limite de revenu, mais suppose d'avoir liquidé toutes ses retraites au taux plein ; le cumul plafonné s'applique quand ces conditions ne sont pas réunies : le total salaire plus pension ne doit pas dépasser un seuil, sinon la pension est réduite. L'entretien information retraite aide à savoir dans quel cas on se trouve.",
    relations: [
      { ficheId: 'cumul-emploi-retraite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'depart-volontaire-ou-mise-a-la-retraite', titre: 'Départ volontaire ou mise à la retraite ?', titreDeTri: 'Depart volontaire ou mise a la retraite',
    type: 'notion', gabarit: 'comparatif', univers: 'droit-travail', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux mettent fin au contrat de travail au moment de partir à la retraite, avec une indemnité. Ce qui les distingue : le départ volontaire est décidé par le salarié, qui pose sa demande ; la mise à la retraite est décidée par l'employeur en raison de l'âge, et il ne peut l'imposer qu'au-delà d'un âge élevé fixé par la loi. L'indemnité n'est pas calculée de la même façon dans les deux cas.",
    relations: [
      { ficheId: 'mise-a-la-retraite', type: 'voir-aussi' },
      { ficheId: 'indemnite-depart-volontaire-retraite', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Se déplacer pour travailler (lot 11, chantier d'élargissement
  //    2026-09-08). Le principe de chaque solution locale et le réflexe d'en
  //    parler tôt ; jamais un tarif ni un délai chiffré. --

  {
    id: 'garage-solidaire', titre: 'Garage solidaire', titreDeTri: 'Garage solidaire',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip'],
    variantesRecherche: ['garage associatif', 'réparer sa voiture pas cher', 'voiture pour aller travailler'],
    corps: "Un garage solidaire est un atelier associatif qui répare les véhicules à un tarif très réduit, et parfois loue ou vend des voitures à petit prix, pour les personnes à faibles ressources qui ont besoin de se déplacer pour travailler. L'accès se fait en général sur orientation d'un travailleur social ou de son conseiller. Beaucoup sont aussi des chantiers d'insertion : les mécaniciens sont en parcours.",
    relations: [
      { ficheId: 'aide-a-la-mobilite', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'auto-ecole-sociale', titre: 'Auto-école sociale et solidaire', titreDeTri: 'Auto-ecole sociale et solidaire',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip'],
    variantesRecherche: ['auto-école associative', "passer le permis quand on a peu de moyens", 'permis accompagné insertion'],
    corps: "Une auto-école sociale et solidaire prépare au permis de conduire des personnes éloignées de l'emploi, avec un accompagnement pédagogique renforcé (rythme adapté, travail du code à l'oral, soutien sur la lecture) et un coût réduit, souvent pris en charge en partie par un financeur. L'inscription passe par une structure d'accompagnement (mission locale, France Travail, service social). C'est une réponse quand une auto-école classique a échoué ou coûte trop cher.",
    relations: [
      { ficheId: 'aide-a-la-mobilite', type: 'voir-aussi' },
      { ficheId: 'microcredit-personnel', type: 'voir-aussi' },
      { ficheId: 'permis-a-1-euro-par-jour', type: 'voir-aussi' }
    ]
  },
  {
    id: 'plateforme-mobilite', titre: 'Plateforme de mobilité', titreDeTri: 'Plateforme de mobilite',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['plateforme mobilité insertion', 'aide pour me déplacer', 'diagnostic mobilité'],
    corps: "Une plateforme de mobilité est un guichet local qui coordonne, sur un territoire, les solutions de déplacement pour les personnes en insertion : diagnostic mobilité, location de voiture ou de scooter à tarif social, transport à la demande, aide au permis, conseil sur les transports en commun, prêt de vélo. On y est orienté par son conseiller ou un travailleur social. Elle sert à lever le frein « je ne peux pas m'y rendre ».",
    relations: [
      { ficheId: 'aide-a-la-mobilite', type: 'voir-aussi' },
      { ficheId: 'transport-a-la-demande', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'transport-a-la-demande', titre: 'Transport à la demande (TAD)', titreDeTri: 'Transport a la demande',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['TAD', 'transport sur réservation', 'bus qui vient me chercher', 'se déplacer sans voiture à la campagne'],
    corps: "Le transport à la demande (TAD) est un service de transport public qui ne circule pas selon un horaire fixe : on réserve à l'avance (téléphone, application) un trajet entre des points définis, souvent en zone peu dense où il n'y a pas de ligne régulière. Il est organisé par les collectivités, au tarif d'un ticket de bus ou un peu plus. C'est une solution utile pour un rendez-vous, une formation ou un emploi sans voiture, en milieu rural.",
    relations: [
      { ficheId: 'plateforme-mobilite', type: 'voir-aussi' },
      { ficheId: 'aide-a-la-mobilite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'permis-points', titre: 'Permis à points : perte et récupération', titreDeTri: 'Permis a points perte et recuperation',
    type: 'terme', univers: 'mobilite-budget', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['perte de points', 'stage de récupération de points', 'plus de points sur le permis', 'invalidation du permis'],
    corps: "Le permis de conduire est doté d'un capital de points, réduit à chaque infraction. À zéro point, le permis est invalidé : il faut attendre un délai, repasser les examens et fournir un avis médical et psychotechnique. Les points se récupèrent avec le temps sans nouvelle infraction, ou plus vite grâce à un stage de sensibilisation (payant, une fois par an). Perdre son permis est un frein majeur à l'emploi : en parler tôt à son conseiller permet d'anticiper une alternative.",
    relations: [
      { ficheId: 'permis-suspendu-ou-annule', type: 'voir-aussi' },
      { ficheId: 'aide-a-la-mobilite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'permis-suspendu-ou-annule', titre: 'Permis suspendu ou annulé ?', titreDeTri: 'Permis suspendu ou annule',
    type: 'notion', gabarit: 'comparatif', univers: 'mobilite-budget', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : dans les deux cas, on n'a plus le droit de conduire pendant un temps. Ce qui les distingue : la suspension est temporaire (décidée par le préfet ou un juge, pour quelques mois), à la fin on récupère son permis sans le repasser ; l'annulation, ou invalidation à zéro point, fait perdre le permis : il faut attendre un délai puis repasser le code, souvent la conduite, avec une visite médicale. Les démarches et les délais ne sont pas les mêmes.",
    relations: [
      { ficheId: 'permis-points', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Faire garder son enfant pour travailler (lot 13, chantier
  //    d'élargissement 2026-09-08). Repères stables uniquement ; les barèmes
  //    (CMG, AGE...) restent dans « Comprendre le cadre ». --

  {
    id: 'mam', titre: "Maison d'assistants maternels (MAM)", titreDeTri: 'Maison d assistants maternels',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip'],
    variantesRecherche: ['MAM', 'maison assistantes maternelles', 'garde à plusieurs assistantes maternelles'],
    corps: "Une maison d'assistants maternels (MAM) est un local où deux à quatre assistants maternels agréés accueillent ensemble des jeunes enfants, hors de leur domicile. Pour les parents, c'est un mode de garde souple, souvent moins cher qu'une crèche, avec un accueil individualisé et des horaires parfois élargis. Le contrat se signe directement avec l'assistant maternel, comme pour une garde à domicile.",
    relations: [
      { ficheId: 'aides-garde-enfants', type: 'voir-aussi' },
      { ficheId: 'relais-petite-enfance', type: 'voir-aussi' }
    ]
  },
  {
    id: 'relais-petite-enfance', titre: 'Relais petite enfance (RPE)', titreDeTri: 'Relais petite enfance',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['RPE', 'RAM', 'où trouver une assistante maternelle', 'information mode de garde'],
    corps: "Un relais petite enfance (RPE), anciennement relais d'assistants maternels, est un service gratuit d'information sur les modes de garde d'un territoire : liste des assistants maternels et des places disponibles, aide à comprendre le contrat et les aides, ateliers d'éveil. Il s'adresse aux parents comme aux professionnels. C'est le bon premier contact quand on cherche une solution de garde pour reprendre un emploi ou une formation.",
    relations: [
      { ficheId: 'aides-garde-enfants', type: 'voir-aussi' },
      { ficheId: 'mam', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'creche-avip', titre: "Crèche à vocation d'insertion professionnelle (AVIP)", titreDeTri: 'Creche a vocation d insertion professionnelle',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip'],
    variantesRecherche: ['crèche AVIP', "crèche pour parent en recherche d'emploi", 'place en crèche pour chercher du travail'],
    corps: "Une crèche à vocation d'insertion professionnelle (AVIP) réserve une partie de ses places à des enfants dont le parent est sans emploi et engagé dans une recherche ou une formation. Elle accueille l'enfant même quelques jours par semaine ou en horaires décalés, le temps des démarches, et travaille avec France Travail ou la mission locale. L'idée est de lever le frein de la garde pour pouvoir chercher du travail sereinement.",
    relations: [
      { ficheId: 'aides-garde-enfants', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aripa', titre: "Aripa (recouvrement des pensions alimentaires)", titreDeTri: 'Aripa',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['Aripa', 'pension alimentaire pas payée', 'récupérer une pension alimentaire', 'GIPA'],
    corps: "L'Aripa (agence de recouvrement et d'intermédiation des pensions alimentaires), rattachée à la CAF et à la MSA, aide un parent qui ne reçoit pas la pension alimentaire fixée pour ses enfants : elle peut la récupérer auprès de l'autre parent, la verser en avance, et servir d'intermédiaire pour que les versements passent par elle. Une pension impayée pèse lourd sur un budget et sur la reprise d'un emploi ; c'est un droit à activer sans attendre.",
    relations: [
      { ficheId: 'caf', type: 'voir-aussi' },
      { ficheId: 'assistante-sociale', type: 'voir-aussi' }
    ]
  },

  // -- Famille : CDD, intérim et fin de contrat (lot 14, chantier d'élargissement
  //    2026-09-08). Compléments IAE et notions de délais ; le principe, jamais
  //    le taux ni la durée maximale. --

  {
    id: 'cddi', titre: "CDD d'insertion (CDDI)", titreDeTri: 'CDD d insertion',
    type: 'terme', univers: 'contrats-statuts-emploi', registres: ['langage-administratif'],
    variantesRecherche: ['CDDI', "contrat en chantier d'insertion", "contrat d'insertion par l'activité économique"],
    corps: "Le CDD d'insertion (CDDI) est le contrat de travail signé avec une structure de l'insertion par l'activité économique (chantier d'insertion, association intermédiaire, entreprise de travail temporaire d'insertion). Il associe un vrai emploi, rémunéré au moins au SMIC, à un accompagnement socio-professionnel et à des périodes de formation ou d'immersion en entreprise. Sa durée est encadrée : c'est un temps limité pour retrouver des repères et préparer la suite.",
    relations: [
      { ficheId: 'cdd-classique-ou-cdd-d-insertion', type: 'voir-aussi' },
      { ficheId: 'iae', type: 'voir-aussi' },
      { ficheId: 'aci', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cdd-tremplin', titre: 'CDD Tremplin', titreDeTri: 'CDD Tremplin',
    type: 'terme', univers: 'contrats-statuts-emploi', registres: ['langage-administratif'],
    variantesRecherche: ['contrat tremplin entreprise adaptée', 'rebondir vers le milieu ordinaire', 'emploi transitoire handicap'],
    corps: "Le CDD Tremplin est un contrat proposé par certaines entreprises adaptées à des personnes en situation de handicap : il associe un emploi, une formation et un accompagnement, avec l'objectif explicite de rebondir vers un autre employeur, en milieu ordinaire, à la fin. Il fonctionne comme un tremplin, d'où son nom, et non comme un emploi durable.",
    relations: [
      { ficheId: 'entreprise-adaptee', type: 'voir-aussi' },
      { ficheId: 'cddi', type: 'a-ne-pas-confondre' },
      { ficheId: 'pec', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prime-de-precarite', titre: 'Prime de précarité', titreDeTri: 'Prime de precarite',
    type: 'terme', univers: 'bulletin-salaire', registres: ['langage-rh', 'langage-juridique'],
    variantesRecherche: ['prime de fin de CDD', 'les 10 pour cent de fin de contrat', 'compensation contrat court', 'indemnité de précarité'],
    corps: "La prime de précarité, ou indemnité de fin de contrat, est une somme versée à la fin d'un CDD ou d'une mission d'intérim, pour compenser la situation moins stable qu'un CDI. Elle représente un pourcentage de la rémunération totale perçue pendant le contrat. Elle n'est pas due dans certains cas : refus d'un CDI sur le même poste, contrat saisonnier, rupture à l'initiative du salarié, faute grave, contrat d'insertion ou d'apprentissage.",
    relations: [
      { ficheId: 'prime-de-precarite-ou-indemnite-de-licenciement', type: 'voir-aussi' },
      { ficheId: 'cdd', type: 'voir-aussi' },
      { ficheId: 'solde-tout-compte', type: 'voir-aussi' }
    ]
  },
  {
    id: 'contrat-saisonnier', titre: 'Contrat saisonnier', titreDeTri: 'Contrat saisonnier',
    type: 'terme', univers: 'contrats-statuts-emploi', registres: ['langage-rh', 'langage-juridique'],
    variantesRecherche: ['travail saisonnier', 'emploi de saison', "contrat pour les vendanges ou l'été", 'saisonnier droits'],
    corps: "Un contrat saisonnier est un CDD conclu pour des travaux qui reviennent chaque année à la même période, liés au rythme des saisons ou de l'activité touristique : récoltes, stations, campings, restauration l'été. Il peut comporter une clause de reconduction d'une année sur l'autre. Il ne donne pas droit à la prime de précarité, mais l'ancienneté acquise saison après saison chez le même employeur compte pour certains droits.",
    relations: [
      { ficheId: 'cdd', type: 'a-ne-pas-confondre' },
      { ficheId: 'prime-de-precarite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'entretien-prealable', titre: 'Entretien préalable', titreDeTri: 'Entretien prealable',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique', 'langage-rh'],
    variantesRecherche: ['convocation entretien préalable', 'entretien avant licenciement', "l'employeur me convoque"],
    corps: "L'entretien préalable est le rendez-vous auquel un employeur doit convoquer un salarié avant d'envisager un licenciement ou une sanction lourde. La convocation, écrite, indique l'objet, la date et la possibilité de se faire assister. Pendant l'entretien, l'employeur expose les motifs et écoute les explications ; aucune décision n'est prise sur le moment. Ce n'est pas encore un licenciement : c'est une étape qui doit permettre de s'expliquer.",
    relations: [
      { ficheId: 'licenciement', type: 'voir-aussi' },
      { ficheId: 'rupture-conventionnelle', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'delais-qui-protegent', titre: 'Les délais qui protègent (rétractation, réflexion, prévenance)', titreDeTri: 'Delais qui protegent',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique'],
    variantesRecherche: ['délai de rétractation', 'délai de réflexion', 'délai de prévenance', 'revenir sur ma décision'],
    corps: "Plusieurs situations d'emploi ouvrent un délai obligatoire avant qu'une décision devienne définitive : délai de rétractation après la signature d'une rupture conventionnelle (chacun peut revenir en arrière), délai de réflexion avant de l'homologuer, délai de prévenance à respecter pendant ou à la fin d'une période d'essai, délai avant qu'une démission ou un licenciement prenne effet (le préavis). Ces délais existent pour éviter les décisions prises trop vite : les connaître, c'est garder la main.",
    relations: [
      { ficheId: 'rupture-conventionnelle', type: 'voir-aussi' },
      { ficheId: 'periode-essai', type: 'voir-aussi' },
      { ficheId: 'preavis', type: 'voir-aussi' }
    ]
  },
  {
    id: 'portabilite-mutuelle', titre: 'Portabilité de la mutuelle', titreDeTri: 'Portabilite de la mutuelle',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique', 'langage-rh'],
    variantesRecherche: ['garder sa mutuelle après un licenciement', 'complémentaire santé après le contrat', 'portabilité prévoyance'],
    corps: "La portabilité de la mutuelle permet de garder la complémentaire santé de son ancien employeur, gratuitement, pendant un certain temps après la fin du contrat, à condition d'avoir droit au chômage. Elle couvre aussi la prévoyance (arrêts longs, invalidité). Elle n'est pas automatique dans les faits : il faut souvent la réclamer et transmettre son attestation France Travail. C'est une protection à ne pas laisser passer entre deux emplois.",
    relations: [
      { ficheId: 'are', type: 'voir-aussi' },
      { ficheId: 'solde-tout-compte', type: 'voir-aussi' }
    ]
  },
  {
    id: 'demission-legitime', titre: 'Démission légitime', titreDeTri: 'Demission legitime',
    type: 'terme', univers: 'droit-travail', registres: ['langage-france-travail', 'langage-juridique'],
    variantesRecherche: ['démission qui donne droit au chômage', 'démissionner et toucher le chômage', 'motif légitime de démission'],
    corps: "Une démission est dite « légitime » quand elle ouvre malgré tout droit à l'allocation chômage, parce qu'elle est justifiée par un motif reconnu (suivre un conjoint qui déménage, violences, non-paiement des salaires, reprise d'emploi qui échoue rapidement, projet de reconversion validé...). Hors de ces cas, une démission ne donne pas droit à l'ARE, mais un réexamen de la situation est possible après quelques mois. Vérifier avant de démissionner évite les mauvaises surprises.",
    relations: [
      { ficheId: 'demission', type: 'voir-aussi' },
      { ficheId: 'are', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cdd-classique-ou-cdd-d-insertion', titre: "CDD classique ou CDD d'insertion ?", titreDeTri: 'CDD classique ou CDD d insertion',
    type: 'notion', gabarit: 'comparatif', univers: 'contrats-statuts-emploi', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des contrats à durée déterminée, avec un salaire et les droits de base d'un salarié. Ce qui les distingue : le CDD classique répond à un besoin ponctuel de l'employeur (remplacement, surcroît) ; le CDD d'insertion est signé avec une structure de l'insertion par l'activité économique, il inclut un accompagnement et de la formation, et son but est le retour vers l'emploi ordinaire, pas la production seule. Le CDD d'insertion ne donne pas de prime de précarité.",
    relations: [
      { ficheId: 'cddi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prime-de-precarite-ou-indemnite-de-licenciement', titre: 'Prime de précarité ou indemnité de licenciement ?', titreDeTri: 'Prime de precarite ou indemnite de licenciement',
    type: 'notion', gabarit: 'comparatif', univers: 'bulletin-salaire', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des sommes versées à la fin d'une relation de travail, en plus du dernier salaire. Ce qui les distingue : la prime de précarité s'ajoute à la fin d'un CDD ou d'une mission d'intérim arrivés à leur terme, pour compenser l'instabilité ; l'indemnité de licenciement est due quand l'employeur rompt un CDI (hors faute grave), et dépend de l'ancienneté et du salaire. On ne peut pas toucher les deux pour le même contrat.",
    relations: [
      { ficheId: 'prime-de-precarite', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Le français et les savoirs de base (lot 15, chantier
  //    d'élargissement 2026-09-08). Aucun jugement : une difficulté avec un
  //    savoir devenu indispensable, sans lien avec l'intelligence. --

  {
    id: 'competences-de-base', titre: 'Compétences de base', titreDeTri: 'Competences de base',
    type: 'terme', univers: 'formation', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['savoirs de base', 'remise à niveau', 'apprendre à lire écrire compter adulte', 'socle de connaissances'],
    corps: "Les compétences de base, ou savoirs de base, regroupent ce qui permet d'agir dans la vie courante et professionnelle : lire, écrire, compter, s'exprimer, se repérer dans l'espace et le temps, utiliser un ordinateur ou un téléphone pour les démarches simples. On peut être très compétent dans son métier et en difficulté sur l'un de ces points. Des formations existent pour les consolider, sans repartir de l'école : elles s'adressent à des adultes, souvent en lien avec un projet d'emploi.",
    relations: [
      { ficheId: 'illettrisme', type: 'voir-aussi' },
      { ficheId: 'clea', type: 'voir-aussi' },
      { ficheId: 'qualification', type: 'voir-aussi' }
    ]
  },
  {
    id: 'clea', titre: 'CléA', titreDeTri: 'CleA',
    type: 'terme', univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ['certification CléA', 'attester ses compétences de base', 'diplôme des savoirs de base'],
    corps: "CléA est une certification qui atteste la maîtrise des compétences de base attendues dans le monde du travail : communiquer, calculer, utiliser un ordinateur, travailler en équipe, respecter des règles, apprendre. Elle se prépare et se passe par étapes, à partir d'une évaluation qui montre les points déjà acquis. Elle est utile pour valoriser un parcours sans diplôme, ou comme première marche avant une formation qualifiante.",
    relations: [
      { ficheId: 'competences-de-base', type: 'voir-aussi' },
      { ficheId: 'qualification', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cecrl', titre: 'Échelle européenne des langues (CECRL)', titreDeTri: 'Echelle europeenne des langues',
    type: 'terme', univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ['CECRL', 'niveau A1 A2 B1', 'niveau de langue', 'échelle A2 B1'],
    corps: "Le CECRL (cadre européen commun de référence pour les langues) classe la maîtrise d'une langue en six niveaux, de A1 (débutant) à C2 (maîtrise complète), en passant par A2, B1, B2 et C1. Le niveau A2 correspond à comprendre et se faire comprendre dans les situations simples de la vie quotidienne ; le B1 permet de se débrouiller seul dans la plupart des situations, y compris au travail. Ces niveaux servent de repère pour les formations de français, certains titres de séjour et l'accès à la nationalité.",
    relations: [
      { ficheId: 'diplomes-de-francais', type: 'voir-aussi' },
      { ficheId: 'fle', type: 'voir-aussi' }
    ]
  },
  {
    id: 'diplomes-de-francais', titre: 'Les diplômes et tests de français (DELF, DILF, TCF)', titreDeTri: 'Diplomes et tests de francais',
    type: 'terme', univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ['DELF', 'DILF', 'TCF', 'diplôme de français pour étranger'],
    corps: "Plusieurs certifications attestent le niveau de français d'une personne non francophone. Le DILF valide un premier niveau (A1). Le DELF, en plusieurs versions dont une « pro », couvre les niveaux A1 à B2 et se passe une fois pour toutes. Le TCF est un test dont le résultat, valable deux ans, situe le niveau sur toute l'échelle : il est souvent demandé pour un titre de séjour ou la naturalisation. On choisit selon l'objectif : garder un diplôme, ou fournir un résultat récent.",
    relations: [
      { ficheId: 'cecrl', type: 'voir-aussi' },
      { ficheId: 'fle', type: 'voir-aussi' }
    ]
  },
  {
    id: 'atelier-sociolinguistique', titre: 'Atelier sociolinguistique (ASL)', titreDeTri: 'Atelier sociolinguistique',
    type: 'terme', univers: 'dispositifs', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['ASL', 'cours de français dans une association', 'apprendre le français pour la vie de tous les jours'],
    corps: "Un atelier sociolinguistique (ASL) est un temps d'apprentissage du français ancré dans des situations concrètes de la vie quotidienne : prendre un rendez-vous, comprendre un courrier, se déplacer, échanger à l'école de ses enfants, se présenter à un employeur. Il est animé par des associations, souvent en petit groupe et gratuitement, et s'adresse à des personnes qui ne relèvent pas ou plus d'une formation linguistique formelle. C'est une porte d'entrée accessible et rassurante.",
    relations: [
      { ficheId: 'fle', type: 'voir-aussi' },
      { ficheId: 'competences-de-base', type: 'voir-aussi' },
      { ficheId: 'oepre', type: 'voir-aussi' }
    ]
  },
  {
    id: 'illettrisme-ou-illectronisme', titre: 'Illettrisme ou illectronisme ?', titreDeTri: 'Illettrisme ou illectronisme',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux désignent une difficulté avec des savoirs devenus indispensables au quotidien, sans lien avec l'intelligence. Ce qui les distingue : l'illettrisme concerne une personne scolarisée en France qui n'a pas gardé une maîtrise suffisante de la lecture, de l'écriture ou du calcul ; l'illectronisme concerne l'usage du numérique (internet, démarches en ligne, outils de base). Une même personne peut être à l'aise sur l'un et en difficulté sur l'autre.",
    relations: [
      { ficheId: 'illettrisme', type: 'voir-aussi' }
    ]
  },
  {
    id: 'alphabetisation-ou-fle', titre: 'Alphabétisation ou français langue étrangère ?', titreDeTri: 'Alphabetisation ou francais langue etrangere',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux aident une personne à mieux maîtriser le français. Ce qui les distingue : l'alphabétisation s'adresse à une personne qui n'a jamais ou peu été scolarisée, dans aucune langue, et qui apprend à lire et à écrire pour la première fois ; le français langue étrangère (FLE) s'adresse à une personne déjà scolarisée dans sa langue, qui apprend le français comme langue nouvelle. Le point de départ et la progression ne sont pas les mêmes.",
    relations: [
      { ficheId: 'fle', type: 'voir-aussi' }
    ]
  },

  // -- Famille : L'accompagnement depuis la loi pour le plein emploi (lot 16,
  //    chantier d'élargissement 2026-09-08). Compléments loi plein emploi ; le
  //    principe, jamais un rythme ni un seuil chiffrés. --

  {
    id: 'contrat-d-engagement', titre: "Contrat d'engagement", titreDeTri: 'Contrat d engagement',
    type: 'terme', univers: 'dispositifs', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['contrat d engagement France Travail', 'PPAE', 'ce que je signe avec mon conseiller', 'engagements réciproques'],
    corps: "Le contrat d'engagement est le document signé avec France Travail, la mission locale ou Cap emploi au début d'un accompagnement. Il précise le projet, les actions prévues de part et d'autre, un rythme de contacts et des engagements réciproques : la structure accompagne et propose, la personne s'implique dans les démarches convenues. Depuis 2025, il remplace l'ancien projet personnalisé d'accès à l'emploi et concerne aussi les bénéficiaires du RSA. Il se révise quand la situation change.",
    relations: [
      { ficheId: 'actualisation', type: 'voir-aussi' },
      { ficheId: 'diagnostic-partage', type: 'voir-aussi' },
      { ficheId: 'referent-unique', type: 'voir-aussi' }
    ]
  },
  {
    id: 'referent-unique', titre: 'Référent unique', titreDeTri: 'Referent unique',
    type: 'terme', univers: 'accompagnement-insertion', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['un seul interlocuteur', 'qui suit mon dossier', 'référent de parcours', "à qui je m'adresse pour mon accompagnement"],
    corps: "Le référent unique est le professionnel désigné pour piloter l'accompagnement d'une personne quand plusieurs organismes interviennent (France Travail, mission locale, Cap emploi, conseil départemental, structure sociale). Il est l'interlocuteur principal, coordonne les actions, évite que la personne ait à tout réexpliquer à chacun, et fait le lien. La loi pour le plein emploi a généralisé ce principe pour rendre le parcours plus lisible.",
    relations: [
      { ficheId: 'contrat-d-engagement', type: 'voir-aussi' },
      { ficheId: 'cip', type: 'voir-aussi' },
      { ficheId: 'reseau-pour-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'accompagnement-global', titre: 'Accompagnement global', titreDeTri: 'Accompagnement global',
    type: 'terme', univers: 'accompagnement-insertion', registres: ['langage-cip', 'langage-france-travail'],
    variantesRecherche: ['suivi France Travail et travailleur social', 'quand plusieurs difficultés se cumulent', 'accompagnement social et emploi ensemble'],
    corps: "L'accompagnement global associe un conseiller France Travail et un travailleur social du conseil départemental pour suivre ensemble une personne dont les difficultés dépassent la seule recherche d'emploi : logement, santé, budget, mobilité, garde d'enfant. L'idée est de traiter en parallèle ce qui bloque et le projet professionnel, plutôt que d'attendre que « tout soit réglé » avant de chercher du travail. L'entrée se décide avec le conseiller.",
    relations: [
      { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'assistante-sociale', type: 'voir-aussi' },
      { ficheId: 'contrat-d-engagement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'personnes-invisibles', titre: 'Les personnes invisibles', titreDeTri: 'Personnes invisibles',
    type: 'terme', univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['ni emploi ni formation ni inscrit', 'sortis des radars', 'aller vers', 'ceux qui ne demandent plus rien'],
    corps: "On parle de « personnes invisibles » pour désigner celles qui ne sont ni en emploi, ni en formation, ni inscrites nulle part, et qui n'apparaissent donc dans aucun fichier : jeunes sortis des radars, adultes découragés qui ne demandent plus rien. Les repérer suppose d'aller à leur rencontre autrement (permanences dans des lieux du quotidien, bouche-à-oreille, associations de proximité). Ce n'est pas une catégorie administrative, c'est un constat qui justifie le « aller vers ».",
    relations: [
      { ficheId: 'neet', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'offre-raisonnable-d-emploi', titre: "Offre raisonnable d'emploi", titreDeTri: 'Offre raisonnable d emploi',
    type: 'terme', univers: 'droit-travail', registres: ['langage-france-travail', 'langage-juridique'],
    variantesRecherche: ["suis-je obligé d'accepter cette offre", 'refuser une offre France Travail', 'ORE', 'offre qui correspond à mon profil'],
    corps: "L'offre raisonnable d'emploi est la notion qui sert à apprécier si une offre proposée à un demandeur d'emploi correspond à sa situation : elle tient compte du projet défini avec le conseiller, de l'expérience, des qualifications, de la zone géographique accessible et du salaire pratiqué pour le métier. Refuser sans motif plusieurs offres jugées raisonnables peut entraîner une sanction. Ce qui est « raisonnable » se discute avec le conseiller au moment de bâtir le projet, pas au moment du refus.",
    relations: [
      { ficheId: 'contrat-d-engagement', type: 'voir-aussi' },
      { ficheId: 'radiation', type: 'voir-aussi' },
      { ficheId: 'projet-professionnel', type: 'voir-aussi' }
    ]
  },

  // -- Famille : La relation d'accompagnement (lot 17, chantier d'élargissement
  //    2026-09-08 -- section D du tri, suggestions transverses). --

  {
    id: 'pair-aidance', titre: 'Pair-aidance', titreDeTri: 'Pair-aidance',
    type: 'terme', univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['pair-aidant', "aide par quelqu'un qui a vécu la même chose", 'entraide entre pairs', 'savoir expérientiel'],
    corps: "La pair-aidance, c'est le soutien apporté par une personne qui a traversé une situation proche : chômage de longue durée, handicap, addiction, exil, précarité. Parce qu'elle est passée par là, elle inspire confiance, partage des repères concrets et montre qu'un chemin est possible, sans se substituer aux professionnels. Elle prend des formes variées : groupes d'entraide, binômes, pairs-aidants intégrés à une équipe. Le savoir de l'expérience y est reconnu comme une compétence.",
    relations: [
      { ficheId: 'groupe-de-pairs', type: 'voir-aussi' },
      { ficheId: 'co-construction', type: 'voir-aussi' }
    ]
  },
  {
    id: 'secret-professionnel', titre: "Secret professionnel et partage d'informations", titreDeTri: 'Secret professionnel et partage d informations',
    type: 'terme', univers: 'accompagnement-insertion', registres: ['langage-cip', 'langage-juridique'],
    variantesRecherche: ['secret professionnel', 'ce que je dis reste-t-il confidentiel', "partage d'informations entre intervenants", 'confidentialité accompagnement'],
    corps: "Les professionnels de l'accompagnement social et de l'insertion sont tenus à la discrétion, et pour certains au secret professionnel : ce que la personne confie ne se raconte pas librement. Quand plusieurs intervenants suivent la même personne, ils ne peuvent partager que les informations strictement utiles à l'accompagnement, en principe avec l'accord de la personne, qui a le droit de savoir ce qui est transmis et à qui. Le dire clairement fait partie d'une relation de confiance.",
    relations: [
      { ficheId: 'assistante-sociale', type: 'voir-aussi' },
      { ficheId: 'cip', type: 'voir-aussi' }
    ]
  },
  {
    id: 'personne-de-confiance', titre: 'Personne de confiance', titreDeTri: 'Personne de confiance',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ["quelqu'un pour m'accompagner dans mes démarches", 'être représenté à un rendez-vous', 'désigner un proche pour la santé', 'accompagné par un tiers'],
    corps: "La personne de confiance est quelqu'un qu'on désigne librement (proche, ami, professionnel) pour être accompagné et représenté dans certaines démarches importantes : elle peut assister aux rendez-vous, aider à comprendre, et porter la parole si l'on n'est plus en état de le faire soi-même, notamment pour les questions de santé. C'est un rôle prévu par la loi, formalisé par écrit et révocable à tout moment. À distinguer d'un mandataire ou d'un tuteur, aux pouvoirs bien plus larges.",
    relations: [
      { ficheId: 'secret-professionnel', type: 'voir-aussi' },
      { ficheId: 'tiers-de-confiance-numerique', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'tiers-de-confiance-numerique', titre: 'Aidant numérique et mandat', titreDeTri: 'Aidant numerique et mandat',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['aidant numérique', 'se faire aider pour une démarche en ligne', 'mandat aidants Connect', 'ne pas donner son mot de passe'],
    corps: "Quand on ne peut pas faire seul une démarche en ligne, on peut se faire aider par un aidant numérique, en France Services, en médiathèque ou dans une association. Pour éviter de communiquer ses identifiants, un mandat encadre ce que l'aidant a le droit de faire à sa place, sur les sites de l'État : la personne garde le contrôle et peut retirer le mandat. Confier son mot de passe, même à un proche, reste déconseillé.",
    relations: [
      { ficheId: 'franceconnect', type: 'voir-aussi' },
      { ficheId: 'personne-de-confiance', type: 'a-ne-pas-confondre' }
    ]
  },

  // -- Famille : Comprendre l'insertion par la commande publique (lot 18,
  //    chantier d'élargissement 2026-09-08 -- demande Denis, utile aux CIP).
  //    Prolonge le trio clause sociale déjà en place. --

  {
    id: 'marche-public', titre: 'Marché public', titreDeTri: 'Marche public',
    type: 'terme', univers: 'organisation-travail-management', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['commande publique', "appel d'offres public", 'contrat avec une collectivité', 'répondre à un marché public'],
    corps: "Un marché public est un contrat par lequel une personne publique (commune, département, région, État, hôpital, bailleur social...) achète des travaux, des fournitures ou des services à une entreprise, en respectant des règles de publicité et de mise en concurrence. L'ensemble de ces achats forme la « commande publique », qui pèse lourd dans l'économie. C'est un levier utilisé pour l'insertion : un marché peut réserver des heures de travail à des personnes qui en sont éloignées.",
    relations: [
      { ficheId: 'acheteur-public', type: 'voir-aussi' },
      { ficheId: 'clause-sociale', type: 'voir-aussi' },
      { ficheId: 'allotissement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'acheteur-public', titre: 'Acheteur public', titreDeTri: 'Acheteur public',
    type: 'terme', univers: 'organisation-travail-management', registres: ['langage-administratif'],
    variantesRecherche: ['qui passe les marchés dans une collectivité', 'service marchés publics', 'responsable des achats publics'],
    corps: "L'acheteur public est la personne, au sein d'une collectivité ou d'un établissement public, qui prépare et passe les marchés : définition du besoin, rédaction du cahier des charges, choix des critères, sélection de l'entreprise, suivi de l'exécution. C'est lui qui décide d'inscrire ou non une clause sociale dans un marché, et à quel niveau. Pour un facilitateur ou une structure d'insertion, c'est l'interlocuteur qui ouvre la porte des heures d'insertion.",
    relations: [
      { ficheId: 'marche-public', type: 'voir-aussi' },
      { ficheId: 'facilitateur-clause-sociale', type: 'voir-aussi' },
      { ficheId: 'maitre-ouvrage-ou-maitre-oeuvre', type: 'voir-aussi' }
    ]
  },
  {
    id: 'heures-d-insertion', titre: "Heures d'insertion", titreDeTri: 'Heures d insertion',
    type: 'terme', univers: 'accompagnement-insertion', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ['volume d\'heures clause sociale', 'travail réservé aux personnes en insertion', "combien d'heures pour l'insertion"],
    corps: "Les heures d'insertion sont un volume de travail qu'une entreprise titulaire d'un marché public s'engage à confier, dans le cadre d'une clause sociale, à des personnes éloignées de l'emploi. Ce sont de vraies heures payées, sur un vrai poste du chantier ou du service. L'entreprise peut recruter directement, passer par une structure d'insertion ou de l'intérim d'insertion, ou proposer une alternance. Un facilitateur suit la réalisation de ces heures.",
    relations: [
      { ficheId: 'clause-sociale', type: 'voir-aussi' },
      { ficheId: 'facilitateur-clause-sociale', type: 'voir-aussi' },
      { ficheId: 'iae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'marche-reserve', titre: 'Marché réservé', titreDeTri: 'Marche reserve',
    type: 'terme', univers: 'organisation-travail-management', registres: ['langage-administratif'],
    variantesRecherche: ["marché pour les structures d'insertion", 'marché réservé au secteur du handicap', 'marché ouvert seulement aux SIAE'],
    corps: "Un marché réservé est un marché public qu'un acheteur choisit de n'ouvrir qu'à certains types de structures : d'un côté le secteur du travail protégé et adapté (entreprises adaptées, ESAT), de l'autre les structures de l'insertion par l'activité économique et de l'économie sociale et solidaire. Seules ces structures peuvent y répondre. C'est un outil plus fort que la clause sociale, qui, elle, s'applique à un marché ouvert à tous.",
    relations: [
      { ficheId: 'clause-sociale', type: 'a-ne-pas-confondre' },
      { ficheId: 'entreprise-adaptee', type: 'voir-aussi' },
      { ficheId: 'iae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'allotissement', titre: 'Allotissement', titreDeTri: 'Allotissement',
    type: 'terme', univers: 'organisation-travail-management', registres: ['langage-administratif'],
    variantesRecherche: ['découper un marché en lots', 'lots séparés marché public', "répondre à une partie d'un marché"],
    corps: "L'allotissement, c'est le découpage d'un marché public en lots séparés (par métier, par zone, par prestation), attribués indépendamment. Il est la règle : il permet aux petites entreprises et aux structures d'insertion de répondre à une partie d'un marché qu'elles ne pourraient pas assurer en entier. Pour l'insertion, un lot bien taillé peut être plus accessible qu'une clause sociale sur un gros marché global.",
    relations: [
      { ficheId: 'marche-public', type: 'voir-aussi' }
    ]
  },
  {
    id: 'sous-traitance', titre: 'Sous-traitance', titreDeTri: 'Sous-traitance',
    type: 'terme', univers: 'organisation-travail-management', registres: ['langage-juridique', 'langage-rh'],
    variantesRecherche: ['sous-traitant', 'travailler pour une autre entreprise sur un chantier', "donneur d'ordre"],
    corps: "La sous-traitance, c'est quand une entreprise titulaire d'un contrat confie une partie de l'exécution à une autre entreprise, qui travaille pour elle et sous sa responsabilité vis-à-vis du client. Le sous-traitant n'a pas de lien contractuel direct avec le client final. En marché public, elle est encadrée (déclaration, paiement direct possible). C'est un moyen pour une structure d'insertion d'accéder à un marché via l'entreprise principale.",
    relations: [
      { ficheId: 'sous-traitance-ou-co-traitance', type: 'voir-aussi' },
      { ficheId: 'clause-sociale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'co-traitance', titre: 'Co-traitance (groupement)', titreDeTri: 'Co-traitance',
    type: 'terme', univers: 'organisation-travail-management', registres: ['langage-juridique', 'langage-rh'],
    variantesRecherche: ['co-traitance', "groupement d'entreprises", 'répondre à plusieurs à un marché', 'groupement momentané'],
    corps: "La co-traitance, c'est quand plusieurs entreprises se regroupent pour répondre ensemble à un marché : elles sont toutes titulaires, chacune pour sa part, avec un lien contractuel direct avec le client. Un mandataire représente le groupement. Contrairement à la sous-traitance, les co-traitants sont sur un pied d'égalité. C'est une façon pour une structure d'insertion de porter une partie d'un marché à part entière, aux côtés d'une entreprise classique.",
    relations: [
      { ficheId: 'sous-traitance-ou-co-traitance', type: 'voir-aussi' },
      { ficheId: 'clause-sociale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'sous-traitance-ou-co-traitance', titre: 'Sous-traitance ou co-traitance ?', titreDeTri: 'Sous-traitance ou co-traitance',
    type: 'notion', gabarit: 'comparatif', univers: 'organisation-travail-management', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : dans les deux cas, plusieurs entreprises interviennent sur un même marché. Ce qui les distingue : en sous-traitance, une seule entreprise est titulaire et confie une part du travail à une autre, qui dépend d'elle ; en co-traitance, les entreprises sont toutes titulaires, à égalité, et signent ensemble avec le client. Pour une structure d'insertion, la co-traitance donne une place plus visible et plus autonome.",
    relations: [
      { ficheId: 'sous-traitance', type: 'voir-aussi' }
    ]
  },
  {
    id: 'moins-disant-ou-mieux-disant', titre: 'Moins-disant ou mieux-disant ?', titreDeTri: 'Moins-disant ou mieux-disant',
    type: 'notion', gabarit: 'comparatif', univers: 'organisation-travail-management', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux décrivent la façon dont un acheteur public choisit une entreprise parmi les offres reçues. Ce qui les distingue : le « moins-disant » retient l'offre la moins chère ; le « mieux-disant » retient l'offre la plus intéressante au regard de plusieurs critères : prix, mais aussi qualité, délais, environnement, insertion sociale. La commande publique encourage le mieux-disant, ce qui rend possibles les clauses sociales.",
    relations: [
      { ficheId: 'clause-sociale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'clause-d-execution-ou-critere-d-attribution', titre: "Clause d'exécution ou critère d'attribution ?", titreDeTri: 'Clause d execution ou critere d attribution',
    type: 'notion', gabarit: 'comparatif', univers: 'organisation-travail-management', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux sont des façons d'inscrire l'insertion sociale dans un marché public. Ce qui les distingue : la clause d'exécution oblige l'entreprise retenue à réaliser un volume d'heures d'insertion pendant le marché, quelle qu'elle soit ; le critère d'attribution note l'engagement social des offres au moment du choix, ce qui peut faire gagner une entreprise plus engagée. Les deux peuvent être combinés.",
    relations: [
      { ficheId: 'clause-sociale', type: 'voir-aussi' }
    ]
  },

  // TACHE (audit "nouveaux mots", 2026-09-13) : 49 termes des mini-glossaires
  // locaux de Comprendre le cadre juges assez autonomes pour meriter leur
  // propre fiche Lexique (voir docs/AUDIT_NOUVEAUX_MOTS_LEXIQUE_2026-09-13.md).
  // Groupe 1/6 : creation d'activite + un terme jeunes.
  {
    id: 'arce', titre: "ARCE (aide à la reprise ou à la création d'entreprise)", titreDeTri: 'ARCE aide a la reprise ou a la creation d entreprise',
    type: 'terme', univers: 'dispositifs', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['aide reprise ou creation entreprise', 'capital chomage entreprise', 'droits chomage verses en capital'],
    corps: "L'ARCE permet à une personne qui crée ou reprend une entreprise de recevoir une partie de ses droits restants à l'allocation chômage sous forme de capital, versé en deux fois, plutôt que mois par mois. C'est une alternative au maintien de l'ARE : il faut choisir entre les deux, on ne peut pas cumuler les deux options sur les mêmes droits.",
    relations: [
      { ficheId: 'acre', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'pass-iae', titre: 'Pass IAE', titreDeTri: 'Pass IAE',
    type: 'terme', univers: 'dispositifs', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ["agrement insertion par l'activite economique", 'agrement IAE'],
    corps: "Le Pass IAE est l'agrément qui ouvre l'entrée dans une structure de l'insertion par l'activité économique (chantier d'insertion, entreprise d'insertion, ETTI...). Délivré par France Travail ou un prescripteur habilité, il atteste que la personne relève bien du dispositif et suit son parcours d'une structure à l'autre si elle en change.",
    relations: [
      { ficheId: 'iae', type: 'voir-aussi' },
      { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cape', titre: "Contrat d'appui au projet d'entreprise (CAPE)", titreDeTri: "Contrat d appui au projet d entreprise CAPE",
    type: 'terme', univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: ['CAPE cooperative', 'tester une activite avant de creer', 'phase de test entreprise'],
    corps: "Le CAPE est une phase de test, dans une coopérative d'activité et d'emploi, pour développer une activité sans créer d'entreprise et sans perdre ses allocations : jusqu'à 36 mois, la personne facture ses clients sous le numéro de la coopérative, avant de décider si elle poursuit avec un contrat d'entrepreneur salarié associé.",
    relations: [
      { ficheId: 'cae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'garantie-de-pret', titre: 'Garantie de prêt', titreDeTri: 'Garantie de pret',
    type: 'terme', univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: ['garantir un pret de creation', 'caution creation entreprise'],
    corps: "La garantie de prêt est l'engagement d'un organisme à rembourser une partie du prêt bancaire d'un créateur d'entreprise en cas de défaillance. Elle permet d'obtenir un crédit sans apporter une caution personnelle lourde, en rassurant la banque.",
    relations: [
      { ficheId: 'pret-d-honneur', type: 'voir-aussi' },
      { ficheId: 'microcredit-professionnel', type: 'voir-aussi' }
    ]
  },
  {
    id: 'franchise-de-tva', titre: 'Franchise de TVA', titreDeTri: 'Franchise de TVA',
    type: 'terme', univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: ['ne pas facturer la TVA micro-entreprise', 'seuil de TVA auto-entrepreneur'],
    corps: "La franchise de TVA dispense un micro-entrepreneur de facturer la TVA à ses clients, tant que son chiffre d'affaires reste sous certains seuils annuels. Au-delà, il doit facturer la TVA et la reverser à l'État, ce qui change la présentation de ses factures et sa comptabilité.",
    relations: [
      { ficheId: 'auto-entrepreneur', type: 'voir-aussi' },
      { ficheId: 'versement-liberatoire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'versement-liberatoire', titre: 'Versement libératoire', titreDeTri: 'Versement liberatoire',
    type: 'terme', univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: ["payer l'impot en meme temps que les cotisations", 'taux fixe impot micro-entreprise'],
    corps: "Le versement libératoire est une option, sous conditions de revenus, qui permet à un micro-entrepreneur de payer son impôt sur le revenu en même temps que ses cotisations sociales, à un taux fixe appliqué directement sur le chiffre d'affaires, plutôt que selon le barème habituel de l'impôt.",
    relations: [
      { ficheId: 'auto-entrepreneur', type: 'voir-aussi' },
      { ficheId: 'franchise-de-tva', type: 'voir-aussi' }
    ]
  },
  {
    id: 'suspension-remobilisation', titre: 'Suspension-remobilisation', titreDeTri: 'Suspension remobilisation',
    type: 'terme', univers: 'dispositifs', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['sanction allocation France Travail', 'suspension allocation reprise des demarches'],
    corps: "La suspension-remobilisation est le mécanisme de sanction appliqué quand une personne ne respecte pas ses engagements (contrat d'engagement, offre raisonnable d'emploi...) : son allocation est d'abord suspendue. Si elle reprend ses démarches, une partie lui est reversée après coup ; si elle ne les reprend pas, l'allocation peut être supprimée.",
    relations: [
      { ficheId: 'contrat-d-engagement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'fonds-d-aide-aux-jeunes', titre: "Fonds d'aide aux jeunes (FAJ)", titreDeTri: 'Fonds d aide aux jeunes FAJ',
    type: 'terme', univers: 'dispositifs', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['FAJ', 'aide urgente jeune 18-25 ans', 'aide ponctuelle jeune insertion'],
    corps: "Le fonds d'aide aux jeunes est une aide financière ponctuelle du conseil départemental, versée via la Mission locale, pour répondre à un besoin urgent d'un jeune de 18 à 25 ans en difficulté d'insertion (transport, alimentation, logement...). Le montant et les conditions varient d'un département à l'autre.",
    relations: [
      { ficheId: 'mission-locale', type: 'voir-aussi' }
    ]
  },

  // Groupe 2/6 : emploi, contrats, droit du travail.
  {
    id: 'contrat-d-apprentissage', titre: "Contrat d'apprentissage", titreDeTri: "Contrat d apprentissage",
    type: 'terme', univers: 'contrats-statuts-emploi', registres: ['langage-administratif'],
    variantesRecherche: ['alternance apprenti', 'devenir apprenti'],
    corps: "Le contrat d'apprentissage alterne des périodes de travail en entreprise et des périodes de cours dans un centre de formation d'apprentis (CFA), pour préparer un diplôme ou un titre professionnel reconnu. C'est un vrai contrat de travail, avec une rémunération qui varie selon l'âge et l'année de formation.",
    relations: [
      { ficheId: 'cfa', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pec', titre: 'Parcours emploi compétences (PEC)', titreDeTri: 'Parcours emploi competences PEC',
    type: 'terme', univers: 'contrats-statuts-emploi', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['PEC', 'contrat aide secteur non marchand'],
    corps: "Le parcours emploi compétences (PEC) est un contrat aidé, à durée déterminée ou indéterminée, dans le secteur non marchand (association, collectivité, établissement public). L'employeur reçoit une aide financière de l'État, en échange d'un engagement à accompagner et à former la personne recrutée, pour préparer un retour durable vers l'emploi.",
    relations: [
      { ficheId: 'cddi', type: 'voir-aussi' },
      { ficheId: 'cdd-tremplin', type: 'voir-aussi' }
    ]
  },
  {
    id: 'indemnite-legale-de-licenciement', titre: 'Indemnité légale de licenciement', titreDeTri: 'Indemnite legale de licenciement',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique'],
    variantesRecherche: ['montant indemnite licenciement', 'combien indemnite de licenciement'],
    corps: "L'indemnité légale de licenciement est due par l'employeur à tout salarié licencié ayant au moins huit mois d'ancienneté, sauf faute grave ou lourde. Elle vaut un quart de mois de salaire par année d'ancienneté jusqu'à dix ans, puis un tiers de mois par année au-delà. Une convention collective ou le contrat de travail peuvent prévoir un montant plus favorable.",
    relations: [
      { ficheId: 'licenciement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'homologation-rupture-conventionnelle', titre: 'Homologation (rupture conventionnelle)', titreDeTri: 'Homologation rupture conventionnelle',
    type: 'terme', univers: 'droit-travail', registres: ['langage-administratif'],
    variantesRecherche: ['homologation rupture conventionnelle', 'validation rupture conventionnelle par administration'],
    corps: "L'homologation est la validation de la rupture conventionnelle par l'administration du travail (la DDETS), après le délai de rétractation. Elle vérifie que le consentement du salarié est libre et que l'indemnité prévue respecte au moins le minimum légal. Sans réponse dans les 15 jours ouvrables, l'homologation est considérée comme acquise.",
    relations: [
      { ficheId: 'rupture-conventionnelle', type: 'voir-aussi' }
    ]
  },
  {
    id: 'index-egalite-professionnelle', titre: "L'index de l'égalité professionnelle", titreDeTri: "Index de l egalite professionnelle",
    type: 'terme', univers: 'ressources-humaines', registres: ['langage-rh', 'langage-administratif'],
    variantesRecherche: ['index egapro', 'note egalite femmes hommes entreprise'],
    corps: "L'index de l'égalité professionnelle est une note sur 100 points que toute entreprise d'au moins 50 salariés doit calculer et publier chaque année, à partir de plusieurs indicateurs sur les écarts entre femmes et hommes (rémunération, augmentations, promotions, retour de congé maternité, présence parmi les plus hauts salaires). Une note trop basse pendant plusieurs années peut entraîner une pénalité financière pour l'entreprise.",
    relations: [
      { ficheId: 'discrimination', type: 'voir-aussi' }
    ]
  },
  {
    id: 'tese', titre: 'Titre emploi-service entreprise (Tese)', titreDeTri: 'Titre emploi service entreprise Tese',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['Tese', 'urssaf simplifier bulletin de paie'],
    corps: "Le Tese (titre emploi-service entreprise) est un service gratuit de l'Urssaf qui prend en charge, pour un employeur, l'ensemble des démarches liées à l'emploi d'un salarié : déclarations, bulletin de paie, calcul des cotisations, prélèvement à la source. L'employeur qui l'utilise doit s'en servir pour tous ses salariés, pas seulement certains d'entre eux.",
    relations: [
      { ficheId: 'cesu', type: 'voir-aussi' }
    ]
  },
  {
    id: 'complementaire-sante-collective', titre: 'Complémentaire santé collective', titreDeTri: 'Complementaire sante collective',
    type: 'terme', univers: 'protection-sociale', registres: ['langage-rh', 'langage-administratif'],
    variantesRecherche: ['mutuelle obligatoire entreprise', 'mutuelle collective employeur'],
    corps: "La complémentaire santé collective est la mutuelle d'entreprise que tout employeur du secteur privé doit proposer à ses salariés depuis 2016, avec un panier de soins minimal fixé par la loi et une participation financière de l'employeur d'au moins la moitié de la cotisation.",
    relations: [
      { ficheId: 'css', type: 'a-ne-pas-confondre' },
      { ficheId: 'prevoyance-complementaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prevoyance-complementaire', titre: 'Prévoyance complémentaire', titreDeTri: 'Prevoyance complementaire',
    type: 'terme', univers: 'protection-sociale', registres: ['langage-rh'],
    variantesRecherche: ['prevoyance entreprise', 'couverture incapacite invalidite deces'],
    corps: "La prévoyance complémentaire couvre une perte de revenu en cas d'incapacité de travail, d'invalidité ou de décès, en complément des prestations de la Sécurité sociale. Elle est obligatoire pour les cadres, financée en partie par l'employeur ; pour les autres salariés, son existence et ses conditions dépendent de la convention collective de l'entreprise.",
    relations: [
      { ficheId: 'complementaire-sante-collective', type: 'voir-aussi' }
    ]
  },
  {
    id: 'duerp', titre: "Document unique d'évaluation des risques professionnels (DUERP)", titreDeTri: "Document unique d evaluation des risques professionnels DUERP",
    type: 'terme', univers: 'sante-travail', registres: ['langage-administratif'],
    variantesRecherche: ['DUERP', 'document unique risques professionnels'],
    corps: "Le document unique d'évaluation des risques professionnels (DUERP) est obligatoire dès l'embauche du premier salarié. L'employeur y recense les risques identifiés pour la santé et la sécurité dans l'entreprise, poste par poste, et les actions de prévention prévues. Il doit être mis à jour régulièrement et transmis au service de prévention et de santé au travail.",
    relations: [
      { ficheId: 'medecine-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'delegue-syndical', titre: 'Délégué syndical', titreDeTri: 'Delegue syndical',
    type: 'terme', univers: 'droit-travail', registres: ['langage-rh', 'langage-juridique'],
    variantesRecherche: ['delegue syndical entreprise', 'representant syndicat entreprise'],
    corps: "Le délégué syndical est un salarié désigné par un syndicat représentatif pour négocier avec l'employeur (accords d'entreprise, salaires...). Sa désignation n'est en principe possible qu'à partir de 50 salariés, une dérogation permettant, dans les entreprises plus petites, de désigner un élu du CSE pour ce rôle. C'est un mandat distinct de celui d'élu du CSE, même si la même personne peut cumuler les deux.",
    relations: [
      { ficheId: 'cse', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'visite-d-information-et-de-prevention', titre: "Visite d'information et de prévention (VIP)", titreDeTri: "Visite d information et de prevention VIP",
    type: 'terme', univers: 'sante-travail', registres: ['langage-administratif'],
    variantesRecherche: ['VIP visite medicale embauche', 'visite medicale a l embauche'],
    corps: "La visite d'information et de prévention (VIP) est la visite médicale que l'employeur doit organiser pour chaque salarié dans les trois mois suivant sa prise de poste, puis la renouveler périodiquement (tous les quatre ans en général, avec une visite intermédiaire à deux ans). Contrairement à l'ancienne visite médicale d'embauche, elle peut être réalisée par un professionnel de santé autre qu'un médecin.",
    relations: [
      { ficheId: 'visite-de-reprise', type: 'voir-aussi' }
    ]
  },
  {
    id: 'indemnite-depart-volontaire-retraite', titre: 'Indemnité de départ volontaire à la retraite', titreDeTri: 'Indemnite de depart volontaire a la retraite',
    type: 'terme', univers: 'droit-travail', registres: ['langage-administratif'],
    variantesRecherche: ['indemnite depart volontaire retraite', 'prime depart retraite salarie'],
    corps: "L'indemnité de départ volontaire à la retraite est versée par l'employeur au salarié qui décide lui-même de partir en retraite, à partir d'une certaine ancienneté. Son montant minimal est fixé par le code du travail ; une convention collective peut prévoir un montant plus favorable.",
    relations: [
      { ficheId: 'depart-volontaire-ou-mise-a-la-retraite', type: 'voir-aussi' }
    ]
  },

  // Groupe 3/6 : formation.
  {
    id: 'prepa-apprentissage', titre: 'Prépa-apprentissage', titreDeTri: 'Prepa apprentissage',
    type: 'terme', univers: 'formation', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['preparer un apprentissage', 'pas pret pour apprentissage'],
    corps: "Le prépa-apprentissage est un accompagnement de quelques jours à quelques mois pour préparer une entrée en apprentissage : découvrir des métiers, consolider les savoirs de base, trouver un employeur. C'est une étape gratuite, avant la signature d'un contrat d'apprentissage, pour une personne qui n'est pas encore prête à se lancer directement.",
    relations: [
      { ficheId: 'ecole-de-production', type: 'voir-aussi' }
    ]
  },
  {
    id: 'france-vae', titre: 'France VAE', titreDeTri: 'France VAE',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['portail VAE', 'ou faire ma VAE'],
    corps: "France VAE est le portail officiel unique par lequel passent désormais toutes les démarches de validation des acquis de l'expérience (VAE) : dépôt du dossier, recherche d'un accompagnateur, suivi de la procédure. Il remplace les démarches auparavant dispersées selon le diplôme visé ou l'organisme certificateur.",
    relations: [
      { ficheId: 'vae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'action-de-formation-conventionnee', titre: 'Action de formation conventionnée (AFC)', titreDeTri: 'Action de formation conventionnee AFC',
    type: 'terme', univers: 'formation', registres: ['langage-france-travail'],
    variantesRecherche: ['AFC', 'formation achetee par France Travail'],
    corps: "Une action de formation conventionnée (AFC) est une formation achetée directement par France Travail auprès d'un organisme, sur un métier qui recrute sur le territoire. Le demandeur d'emploi qui y entre n'a rien à payer : contrairement à l'AIF, ce n'est pas une aide individuelle décidée au cas par cas, mais une place réservée sur une session déjà financée.",
    relations: [
      { ficheId: 'aif', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'reste-a-charge-formation', titre: 'Reste à charge (formation)', titreDeTri: 'Reste a charge formation',
    type: 'terme', univers: 'formation', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['part non financee formation', 'ce qui reste a payer formation'],
    corps: "Le reste à charge est la part du coût d'une formation qu'aucun financeur (CPF, France Travail, Région, employeur...) ne prend en charge, et qui resterait due par la personne si aucune aide complémentaire n'intervenait. Plusieurs aides existent spécifiquement pour le couvrir, comme une bourse sur critères sociaux.",
    relations: [
      { ficheId: 'bourse-sur-criteres-sociaux', type: 'voir-aussi' }
    ]
  },
  {
    id: 'bourse-sur-criteres-sociaux', titre: 'Bourse sur critères sociaux', titreDeTri: 'Bourse sur criteres sociaux',
    type: 'terme', univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ['bourse etudes revenus foyer', 'aide financiere pendant formation'],
    corps: "Une bourse sur critères sociaux est une aide versée pendant des études ou une formation, sans avoir à la rembourser, dont le montant dépend des revenus du foyer. Elle peut compléter d'autres financements pour couvrir les frais de la vie courante pendant la période de formation.",
    relations: [
      { ficheId: 'reste-a-charge-formation', type: 'voir-aussi' }
    ]
  },
  {
    id: 'abondement-cpf', titre: 'Abondement (CPF)', titreDeTri: 'Abondement CPF',
    type: 'terme', univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ['abondement compte personnel formation', 'completer mon CPF'],
    corps: "Un abondement est une somme ajoutée au compte personnel de formation (CPF) quand les droits déjà acquis ne suffisent pas à financer une formation. Il peut venir de l'employeur, de France Travail, de la région ou d'autres organismes, selon des accords ou des dispositifs spécifiques.",
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' }
    ]
  },
  {
    id: 'transitions-pro', titre: 'Transitions Pro', titreDeTri: 'Transitions Pro',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['Fongecif', 'association qui finance transition professionnelle'],
    corps: "Transitions Pro (anciennement Fongecif) est une association régionale, paritaire, qui examine et finance deux dispositifs distincts : le projet de transition professionnelle (PTP) pour un salarié qui veut changer de métier, et la démission-reconversion, en validant à chaque fois le caractère réel et sérieux du projet.",
    relations: [
      { ficheId: 'projet-transition-professionnelle', type: 'voir-aussi' }
    ]
  },
  {
    id: 'oepre', titre: "OEPRE (Ouvrir l'école aux parents pour la réussite des enfants)", titreDeTri: "OEPRE Ouvrir l ecole aux parents pour la reussite des enfants",
    type: 'terme', univers: 'formation', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['OEPRE', 'atelier parents etrangers ecole'],
    corps: "OEPRE propose des ateliers gratuits, dans les établissements scolaires, pour les parents étrangers ou d'origine étrangère : apprentissage du français, connaissance du fonctionnement de l'école et des valeurs de la République. Le cadre est rassurant, car ancré dans l'école des enfants.",
    relations: [
      { ficheId: 'atelier-sociolinguistique', type: 'voir-aussi' }
    ]
  },
  {
    id: 'francais-a-visee-professionnelle', titre: 'Français à visée professionnelle', titreDeTri: 'Francais a visee professionnelle',
    type: 'terme', univers: 'formation', registres: ['langage-cip'],
    variantesRecherche: ['francais pour le travail', 'vocabulaire metier francais'],
    corps: "Le français à visée professionnelle est une formation de français centrée sur le vocabulaire, les documents et les situations d'un métier ou d'un secteur précis (sécurité, restauration, bâtiment...). Elle s'adresse à toute personne qui a besoin de mieux maîtriser le français pour tenir un poste, pas seulement à un public étranger.",
    relations: [
      { ficheId: 'fle', type: 'voir-aussi' }
    ]
  },

  // Groupe 4/6 : etranger, droit au sejour.
  {
    id: 'profession-reglementee', titre: 'Profession réglementée', titreDeTri: 'Profession reglementee',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['metier reglemente', 'diplome etranger metier reglemente', 'acces encadre par la loi'],
    corps: "Une profession réglementée est un métier dont l'exercice est encadré par la loi : médecin, infirmier, avocat, professeur des écoles, architecte, expert-comptable... Pour l'exercer avec un diplôme obtenu à l'étranger, il faut suivre une procédure propre à la profession (autorisation, inscription à un ordre, équivalence spécifique), différente de l'attestation de comparabilité délivrée pour les autres diplômes.",
    relations: [
      { ficheId: 'attestation-de-comparabilite', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'attestation-de-demande-d-asile', titre: "Attestation de demande d'asile", titreDeTri: 'Attestation de demande d asile',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['ADA demande asile', 'papier pendant ma demande d asile', 'preuve demande asile en cours'],
    corps: "L'attestation de demande d'asile (ADA) atteste qu'une demande d'asile est en cours d'examen par l'OFPRA ou en recours devant la Cour nationale du droit d'asile. Elle autorise à rester en France pendant l'instruction. Après six mois sans décision, sa durée de validité conditionne la possibilité, pour un employeur, de demander une autorisation de travail.",
    relations: [
      { ficheId: 'ofpra', type: 'voir-aussi' }
    ]
  },
  {
    id: 'naturalisation-par-decret', titre: 'Naturalisation par décret', titreDeTri: 'Naturalisation par decret',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['devenir francais', 'demande de nationalite francaise', 'decret de naturalisation'],
    corps: "La naturalisation par décret est la voie principale pour devenir français quand on ne l'est pas de naissance ni par mariage. C'est une demande, pas un droit : après un dossier, un entretien d'assimilation en préfecture et une enquête, l'État décide seul. En cas d'accord, le nom de la personne paraît dans un décret publié au Journal officiel.",
    relations: [
      { ficheId: 'examen-civique', type: 'voir-aussi' }
    ]
  },
  {
    id: 'examen-civique', titre: 'Examen civique', titreDeTri: 'Examen civique',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['examen civique naturalisation', 'questionnaire valeurs de la republique', 'test civique quarante questions'],
    corps: "L'examen civique est un questionnaire en français, obligatoire depuis le 1er janvier 2026, sur les valeurs, les institutions, l'histoire et le fonctionnement de la société françaises. Il est exigé pour la naturalisation par décret et pour certaines cartes de séjour de longue durée, avec des dispenses (personnes réfugiées, personnes âgées installées depuis longtemps, handicap empêchant l'évaluation).",
    relations: [
      { ficheId: 'naturalisation-par-decret', type: 'voir-aussi' }
    ]
  },
  {
    id: 'accord-de-reciprocite', titre: 'Accord de réciprocité (permis de conduire)', titreDeTri: 'Accord de reciprocite permis de conduire',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['echanger permis etranger', 'accord reciprocite permis', 'pays accord permis conduire'],
    corps: "Un accord de réciprocité est un accord entre la France et un autre pays qui permet d'échanger le permis de conduire de l'un contre celui de l'autre, sans repasser l'examen. Il ne concerne que certains pays hors Union européenne : sans un tel accord, il faut repasser le code et la conduite en France.",
    relations: [
      { ficheId: 'primo-arrivant', type: 'voir-aussi' }
    ]
  },
  {
    id: 'admission-exceptionnelle-au-sejour', titre: 'Admission exceptionnelle au séjour', titreDeTri: 'Admission exceptionnelle au sejour',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['regularisation par le prefet', 'titre de sejour a titre exceptionnel', 'admission exceptionnelle sejour'],
    corps: "L'admission exceptionnelle au séjour est une possibilité, laissée à l'appréciation du préfet, de délivrer un titre de séjour à une personne qui ne remplit pas les conditions habituelles, au vu de son ancienneté en France, de son travail et de sa vie familiale. Ce n'est jamais un droit : les pratiques varient d'une préfecture à l'autre, ce qui justifie de se faire accompagner pour monter le dossier.",
    relations: [
      { ficheId: 'titre-de-sejour', type: 'voir-aussi' }
    ]
  },
  {
    id: 'recepisse', titre: 'Récépissé', titreDeTri: 'Recepisse',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['recepisse titre de sejour', 'papier pendant instruction titre sejour', 'mon recepisse autorise t il le travail'],
    corps: "Un récépissé est le document remis pendant l'instruction d'une demande de titre de séjour. Il prolonge certains droits attachés au titre demandé, mais pas toujours le droit de travailler : la mention est écrite dessus. S'il prolonge un titre qui autorisait déjà le travail, ce droit continue ; s'il accompagne une première demande, il faut vérifier ce qui est indiqué.",
    relations: [
      { ficheId: 'titre-de-sejour-ou-autorisation-de-travail', type: 'voir-aussi' }
    ]
  },

  // Groupe 5/6 : justice, sortie de detention.
  {
    id: 'liberation-sous-contrainte', titre: 'Libération sous contrainte', titreDeTri: 'Liberation sous contrainte',
    type: 'terme', univers: 'dispositifs', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['liberation sous contrainte', 'sortie automatique fin de peine', 'trois mois de prison restants'],
    corps: "La libération sous contrainte est un aménagement de peine dont bénéficie, en principe automatiquement, une personne condamnée à moins de deux ans à qui il reste trois mois de prison à exécuter, sauf décision contraire motivée du juge de l'application des peines. Pour une peine de deux à cinq ans, elle est possible aux deux tiers de la peine, mais elle est alors examinée au cas par cas.",
    relations: [
      { ficheId: 'amenagement-de-peine', type: 'voir-aussi' }
    ]
  },
  {
    id: 'juge-de-l-application-des-peines', titre: "Juge de l'application des peines", titreDeTri: 'Juge de l application des peines',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-juridique'],
    variantesRecherche: ['JAP', 'juge application des peines', 'qui decide un amenagement de peine'],
    corps: "Le juge de l'application des peines (JAP) est le magistrat qui décide des aménagements de peine (détention à domicile, semi-liberté, placement à l'extérieur, libération conditionnelle, libération sous contrainte) et en fixe les conditions, en s'appuyant sur le dossier préparé par le service pénitentiaire d'insertion et de probation et sur le projet de la personne.",
    relations: [
      { ficheId: 'milieu-ouvert-ou-milieu-ferme', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rehabilitation', titre: 'Réhabilitation', titreDeTri: 'Rehabilitation',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique'],
    variantesRecherche: ['effacement casier judiciaire', 'rehabilitation legale', 'rehabilitation judiciaire'],
    corps: "La réhabilitation efface la mention d'une condamnation sur le casier judiciaire. Elle est automatique après un délai sans nouvelle condamnation (réhabilitation légale), ou accordée par le tribunal sur demande (réhabilitation judiciaire), qui peut aller plus vite. Une fois obtenue, la condamnation n'a plus à être signalée.",
    relations: [
      { ficheId: 'casier-judiciaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'levee-d-ecrou', titre: "Levée d'écrou", titreDeTri: 'Levee d ecrou',
    type: 'terme', univers: 'dispositifs', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['levee ecrou', 'moment de la sortie de detention', 'fin de detention officielle'],
    corps: "La levée d'écrou est le moment officiel de la sortie de détention. Plusieurs droits mis en pause ou attachés à la détention doivent alors être réactivés ou ouverts : couverture santé, domiciliation, minima sociaux, hébergement. Ces démarches se préparent avant, avec le conseiller pénitentiaire d'insertion et de probation, pour éviter une rupture de droits le jour même.",
    relations: [
      { ficheId: 'domiciliation', type: 'voir-aussi' }
    ]
  },
  {
    id: 'contrat-emploi-penitentiaire', titre: "Contrat d'emploi pénitentiaire", titreDeTri: 'Contrat d emploi penitentiaire',
    type: 'terme', univers: 'contrats-statuts-emploi', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['contrat emploi penitentiaire', 'travailler en detention', 'remplace acte engagement detenu'],
    corps: "Le contrat d'emploi pénitentiaire est le contrat signé, depuis mai 2022, par une personne détenue qui travaille. Il remplace l'ancien acte d'engagement et fixe une rémunération minimale, une durée de travail et un emploi du temps. Des droits sociaux s'ouvrent progressivement à ces travailleurs (retraite, assurance chômage, accidents du travail, congé maternité), à un rythme distinct de celui des salariés classiques.",
    relations: [
      { ficheId: 'france-travail-justice', type: 'voir-aussi' }
    ]
  },
  {
    id: 'france-travail-justice', titre: 'France Travail justice', titreDeTri: 'France Travail justice',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['conseiller France Travail en detention', 'inscription France Travail prison', 'accompagnement emploi detenu'],
    corps: "France Travail justice désigne des conseillers France Travail spécialisés qui interviennent directement sur le lieu de détention, pour inscrire les personnes détenues et commencer à travailler leur projet professionnel. La demande passe par le conseiller pénitentiaire d'insertion et de probation. À la sortie, l'accompagnement continue avec un conseiller de droit commun ou un conseiller justice.",
    relations: [
      { ficheId: 'iae', type: 'voir-aussi' },
      { ficheId: 'contrat-emploi-penitentiaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prescription-delai', titre: 'Prescription (délai)', titreDeTri: 'Prescription delai',
    type: 'terme', univers: 'droit-travail', registres: ['langage-juridique'],
    variantesRecherche: ['delai de prescription prud hommes', 'delai pour saisir le juge', 'jusqu a quand agir contre mon employeur'],
    corps: "La prescription est le délai au-delà duquel il n'est plus possible de saisir le conseil de prud'hommes. Il varie selon le litige : douze mois après un licenciement, deux ans pour un désaccord sur l'exécution du contrat, trois ans pour des salaires non payés. Passé ce délai, la demande n'est plus recevable, quel que soit le fond du dossier.",
    relations: [
      { ficheId: 'conseil-de-prud-hommes', type: 'voir-aussi' },
      { ficheId: 'prescription', type: 'a-ne-pas-confondre' }
    ]
  },

  // Groupe 6/6 : logement, mobilite, budget, garde.
  {
    id: 'numero-unique-enregistrement', titre: "Numéro unique d'enregistrement", titreDeTri: 'Numero unique d enregistrement',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['numero unique logement social', 'numero demande HLM', 'suivre ma demande de logement social'],
    corps: "Le numéro unique d'enregistrement est attribué dès le dépôt d'une demande de logement social. Il permet de suivre la demande, de la renouveler chaque année, et il garde l'ancienneté acquise : sans renouvellement, la demande est annulée et cette ancienneté est perdue.",
    relations: [
      { ficheId: 'plafond-de-ressources', type: 'voir-aussi' }
    ]
  },
  {
    id: 'commandement-de-payer', titre: 'Commandement de payer', titreDeTri: 'Commandement de payer',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['commandement de payer loyer', 'premiere etape expulsion', 'document commissaire de justice loyer impaye'],
    corps: "Le commandement de payer est le document remis par un commissaire de justice qui réclame les loyers en retard : c'est la première étape d'une procédure d'expulsion. Il ouvre un délai de six semaines pour régler la dette ou trouver un accord avant que le propriétaire ne saisisse le juge.",
    relations: [
      { ficheId: 'treve-hivernale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'permis-a-1-euro-par-jour', titre: 'Permis à 1 euro par jour', titreDeTri: 'Permis a 1 euro par jour',
    type: 'terme', univers: 'mobilite-budget', registres: ['langage-administratif'],
    variantesRecherche: ['permis un euro par jour', 'pret permis sans interet jeune', 'financer permis 15 25 ans'],
    corps: "Le permis à 1 euro par jour est un prêt sans intérêt pour financer le permis de conduire, réservé aux 15-25 ans à leur première inscription : l'État prend en charge les intérêts, la personne rembourse par petites mensualités. Il faut passer par une auto-école ayant signé la convention avec l'État.",
    relations: [
      { ficheId: 'auto-ecole-sociale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pajemploi', titre: 'Pajemploi', titreDeTri: 'Pajemploi',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['pajemploi urssaf', 'declarer salaire assistante maternelle', 'qui verse le CMG'],
    corps: "Pajemploi est le service de l'Urssaf par lequel un parent déclare chaque mois le salaire versé à son assistante maternelle ou à sa garde à domicile. C'est à partir de cette déclaration que le complément de libre choix du mode de garde est calculé et versé. Ce n'est pas un chèque emploi service universel (CESU), qui sert à d'autres emplois à domicile.",
    relations: [
      { ficheId: 'cesu', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'secours-d-urgence', titre: "Secours d'urgence", titreDeTri: 'Secours d urgence',
    type: 'terme', univers: 'accompagnement-insertion', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['aide financiere urgence CCAS', 'secours ponctuel departement', 'aide urgence facture impayee'],
    corps: "Un secours d'urgence est une aide financière ponctuelle et facultative, versée par le centre communal d'action sociale ou le département : en espèces, en bons, ou par la prise en charge directe d'une facture. Elle ne règle pas une situation dans la durée, mais permet de passer un cap en attendant qu'une solution plus stable se mette en place.",
    relations: [
      { ficheId: 'aide-alimentaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'recevabilite', titre: 'Recevabilité (surendettement)', titreDeTri: 'Recevabilite surendettement',
    type: 'terme', univers: 'mobilite-budget', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ['dossier surendettement recevable', 'suspension des saisies surendettement', 'recevabilite banque de france'],
    corps: "La recevabilité est la décision par laquelle la commission de surendettement accepte d'instruire un dossier. Elle déclenche aussitôt la suspension des saisies et des poursuites des créanciers, sauf pour les pensions alimentaires et les amendes pénales, le temps que la commission choisisse une solution : plan conventionnel de redressement, mesures imposées, ou rétablissement personnel.",
    relations: [
      { ficheId: 'surendettement', type: 'voir-aussi' }
    ]
  },

  // -- 5 candidats "vocabulaire des chiffres" trouves depuis Comprendre les
  //    chiffres lui-meme, valides par Denis le 2026-09-13 (audit "nouveaux
  //    mots", complement a l'item 13). --
  {
    id: 'chomage-recensement', titre: 'Chômage au sens du recensement', titreDeTri: 'Chomage au sens du recensement',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-administratif'],
    variantesRecherche: ['chomage recensement insee', 'taux de chomage commune', 'chomage zone d emploi'],
    corps: "Le chômage « au sens du recensement » est une mesure de l'INSEE construite à partir des déclarations des habitants, pas d'une enquête trimestrielle ni des inscriptions à France Travail. C'est la seule mesure du chômage fiable à une échelle très fine (commune, zone d'emploi), là où l'enquête trimestrielle n'a pas assez de réponses. Elle porte sur plusieurs années de collecte et évolue plus lentement : un territoire peut afficher un chômage trimestriel bas et un chômage au sens du recensement plus élevé, signe que le bon chiffre du moment cache une fragilité de fond.",
    voirAussiChiffres: "Voir le chômage par zone d'emploi ici",
    relations: [
      { ficheId: 'chomage-au-sens-du-bit', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'taux-d-emploi', titre: "Taux d'emploi", titreDeTri: 'Taux d emploi',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-administratif'],
    variantesRecherche: ['taux emploi france', 'part de la population qui travaille', 'taux emploi seniors'],
    corps: "Le taux d'emploi mesure la part d'une population qui a un travail, à la différence du taux de chômage qui mesure la part des personnes sans emploi parmi celles qui en cherchent un. Il se calcule le plus souvent sur les 20-64 ans, et se décline par tranche d'âge (par exemple le taux d'emploi des seniors, 55-64 ans). Les deux taux ne bougent pas forcément ensemble : un chômage bas peut coexister avec un taux d'emploi faible, si beaucoup de personnes sont sorties du marché du travail (retraite anticipée, découragement, études longues) sans être comptées comme chômeuses.",
    voirAussiChiffres: "Comparer le taux d'emploi de la France à l'Union européenne ici",
    relations: [
      { ficheId: 'chomage-au-sens-du-bit', type: 'voir-aussi' }
    ]
  },
  {
    id: 'population-active', titre: 'Population active', titreDeTri: 'Population active',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-administratif'],
    variantesRecherche: ['population active insee', 'qui compte comme actif', 'actifs occupes et chomeurs'],
    corps: "La population active regroupe toutes les personnes en âge de travailler qui ont un emploi ou qui en cherchent un : les actifs occupés (qui travaillent) et les chômeurs (qui n'ont pas d'emploi mais en cherchent un). Elle exclut les personnes qui n'ont ni emploi ni recherche d'emploi (études, retraite, foyer), dites « inactives ». C'est le dénominateur de référence pour calculer un taux de chômage : un même nombre de chômeurs donne un taux différent selon la taille de la population active du territoire.",
    relations: [
      { ficheId: 'chomage-au-sens-du-bit', type: 'voir-aussi' }
    ]
  },
  {
    id: 'correction-variations-saisonnieres', titre: 'Correction des variations saisonnières (CVS)', titreDeTri: 'Correction des variations saisonnieres CVS',
    type: 'terme', univers: 'emploi-recrutement', registres: ['langage-administratif'],
    variantesRecherche: ['CVS statistique', 'chiffre corrige des variations saisonnieres', 'CVS-CJO chomage'],
    corps: "Un chiffre « corrigé des variations saisonnières » (CVS) a été retraité pour effacer les à-coups qui reviennent chaque année au même moment : l'emploi baisse chaque hiver et remonte au printemps pour des raisons de calendrier, pas parce que la situation change vraiment. La correction permet de comparer un trimestre au précédent sans se laisser tromper par cet effet, et de repérer la vraie tendance de fond. On la voit souvent associée à « CJO » (corrigé des jours ouvrables), qui neutralise en plus le nombre de jours travaillés dans le mois.",
    voirAussiChiffres: "Voir des chiffres corrigés des variations saisonnières ici",
    relations: [
      { ficheId: 'inscrit-a-france-travail-ou-chomeur-bit', type: 'voir-aussi' }
    ]
  },
  {
    id: 'zonage-ars', titre: 'Zonage ARS (ZIP, ZAC)', titreDeTri: 'Zonage ARS ZIP ZAC',
    type: 'terme', univers: 'acces-aux-soins', registres: ['langage-administratif'],
    variantesRecherche: ['zip zone intervention prioritaire', 'zac zone action complementaire', 'zone sous dotee medecin'],
    corps: "Le zonage ARS classe les territoires selon leur accès aux soins, à partir d'un indicateur (l'accessibilité potentielle localisée). Une zone d'intervention prioritaire (ZIP) est la catégorie la plus en difficulté, avec les aides à l'installation les plus élevées pour les professionnels de santé ; une zone d'action complémentaire (ZAC) est une catégorie de territoires fragiles, avec des aides existantes mais moindres. Ce classement ne change rien pour le patient dans l'immédiat : il sert à orienter les aides destinées aux professionnels qui s'installent.",
    voirAussiChiffres: "Voir la densité de médecins de votre territoire ici",
    relations: [
      { ficheId: 'desert-medical', type: 'voir-aussi' }
    ]
  }
];

var LEXIQUE_COLLECTIONS = [
  {
    id: 'collection-iae',
    titre: "Comprendre l'insertion par l'activité économique",
    icone: '📚',
    mode: 'collection',
    fichesOrdonnees: ['iae', 'siae', 'aci', 'ei', 'ai', 'etti', 'geiq']
  },
  {
    id: 'collection-zonage-territoire',
    titre: 'Comprendre les zonages du territoire',
    icone: '🗺️',
    mode: 'collection',
    fichesOrdonnees: ['bassin-emploi', 'zone-d-emploi', 'qpv', 'frr', 'emploi-franc']
  },
  {
    id: 'parcours-entretien',
    titre: 'Je prépare un entretien',
    icone: '🧭',
    mode: 'parcours',
    accroche: "Comprendre ce qui se joue pendant un entretien, pas préparer des réponses toutes faites.",
    fichesOrdonnees: [
      'cv-lecture-recruteur', 'ats', 'lettre-motivation', 'parlez-moi-de-vous',
      'autonomie', 'savoir-etre', 'savoir-faire', 'savoir-etre-ou-savoir-faire', 'soft-skills-ou-hard-skills', 'esprit-equipe', 'force-proposition', 'rigueur'
    ]
  },
  {
    id: 'parcours-bulletin-salaire',
    titre: 'Comprendre sa fiche de paie',
    icone: '🧭',
    mode: 'parcours',
    accroche: "Comprendre ce qui compose mon salaire et pourquoi le montant reçu diffère du montant annoncé.",
    fichesOrdonnees: [
      'bulletin-salaire', 'salaire-brut', 'cotisations-sociales', 'prelevement-source', 'salaire-net',
      'heures-supplementaires', 'primes', 'indemnites', 'prime-ou-indemnite', 'conges-payes', 'absences',
      'cumuls', 'remboursement-frais', 'cout-employeur'
    ]
  },
  {
    id: 'collection-acteurs-insertion',
    titre: "Les acteurs de l'insertion professionnelle",
    icone: '📚',
    mode: 'collection',
    fichesOrdonnees: ['france-travail', 'mission-locale', 'cap-emploi', 'caf', 'francetravail-missionlocale-capemploi', 'cip', 'reseau-pour-emploi']
  },
  {
    id: 'parcours-contrat-travail',
    titre: 'Comprendre un contrat de travail',
    icone: '🧭',
    mode: 'parcours',
    accroche: "Comprendre les différentes formes de contrat de travail et ce qui les distingue vraiment.",
    fichesOrdonnees: [
      'cdi', 'cdd', 'cdi-ou-cdd', 'interim', 'cdd-ou-interim',
      'alternance', 'stage', 'stage-ou-pmsmp', 'temps-partiel', 'periode-essai', 'cesu'
    ]
  },
  {
    id: 'parcours-accompagnement',
    titre: 'Comprendre les mots de mon accompagnement',
    icone: '🧭',
    mode: 'parcours',
    accroche: "Comprendre le vocabulaire que mon conseiller utilise pendant mon accompagnement.",
    fichesOrdonnees: [
      'diagnostic-partage', 'positionnement', 'frein-emploi', 'plan-action', 'prescription', 'reconversion', 'employabilite'
    ]
  },
  {
    id: 'parcours-sante-travail',
    titre: 'Comprendre sa santé au travail',
    icone: '🧭',
    mode: 'parcours',
    accroche: "Comprendre comment la santé et le travail s'articulent, sans jargon médical ou juridique.",
    fichesOrdonnees: [
      'rqth', 'rqth-ou-invalidite', 'medecine-travail', 'arret-de-travail-indemnites-journalieres',
      'accident-travail-maladie-professionnelle', 'aptitude-ou-inaptitude', 'amenagement-poste', 'maintien-emploi'
    ]
  },
  {
    id: 'parcours-demarches-france-travail',
    titre: 'Mes démarches avec France Travail',
    icone: '🧭',
    mode: 'parcours',
    accroche: "Comprendre mes démarches et mes droits pendant que je suis suivi par France Travail.",
    fichesOrdonnees: ['franceconnect', 'actualisation', 'are', 'attestation-employeur']
  },
  {
    id: 'collection-dispositifs-accompagnement',
    titre: "Comprendre les dispositifs d'accompagnement",
    icone: '📚',
    mode: 'collection',
    fichesOrdonnees: ['pmsmp', 'bilan-competences', 'cep', 'pacea', 'cej', 'poei', 'plie', 'csp']
  },
  {
    id: 'parcours-formation-professionnelle',
    titre: 'Comprendre la formation professionnelle',
    icone: '🧭',
    mode: 'parcours',
    accroche: "Comprendre comment financer et valider une formation, au-delà du seul intitulé d'un diplôme.",
    fichesOrdonnees: [
      'cpf', 'cpf-plafonds-2026', 'vae', 'cpf-ou-vae', 'rncp', 'rs', 'rncp-ou-rs', 'cqp', 'rncp-ou-cqp',
      'titre-professionnel', 'certification', 'diplome-titre-certification',
      'formation-qualifiante-ou-certifiante', 'qualification',
      'aref-ou-rfft', 'aif', 'projet-transition-professionnelle'
    ]
  },
  {
    id: 'collection-methodes-accompagnement',
    titre: "Comprendre les méthodes d'accompagnement",
    icone: '📚',
    mode: 'collection',
    fichesOrdonnees: [
      'ecoute-active', 'reformulation', 'questionnement', 'conduite-entretien',
      'advp', 'trefle-chanceux', 'objectifs-smart', 'co-construction', 'pouvoir-agir'
    ]
  },
  {
    id: 'parcours-fin-contrat',
    titre: "Comprendre la fin d'un contrat de travail",
    icone: '🧭',
    mode: 'parcours',
    accroche: "Comprendre ce qui se passe quand un contrat de travail se termine, quel qu'en soit le motif.",
    fichesOrdonnees: [
      'preavis', 'demission', 'licenciement', 'demission-ou-rupture-conventionnelle',
      'rupture-conventionnelle', 'abandon-de-poste', 'solde-tout-compte'
    ]
  },
  {
    id: 'collection-monde-entreprise',
    titre: "Comprendre le monde de l'entreprise",
    icone: '📚',
    mode: 'collection',
    fichesOrdonnees: ['culture-entreprise', 'marque-employeur', 'entretien-annuel', 'cooptation', 'bassin-emploi', 'polyvalence', 'sens-organisation', 'dialogue-social', 'cse', 'discrimination-embauche', 'obligations-employeur-embauche', 'periode-essai-cote-employeur', 'licenciement-procedure-employeur']
  },
  {
    id: 'collection-travail-independant',
    titre: 'Comprendre le travail indépendant',
    icone: '📚',
    mode: 'collection',
    fichesOrdonnees: ['auto-entrepreneur', 'acre', 'portage-salarial', 'profession-liberale', 'auto-entrepreneur-portage-liberale']
  },
  {
    id: 'parcours-projet-professionnel',
    titre: 'Construire mon projet professionnel',
    icone: '🧭',
    mode: 'parcours',
    accroche: "Comprendre comment mon parcours professionnel peut évoluer, se réorienter ou se transformer.",
    fichesOrdonnees: [
      'orientation', 'projet-professionnel', 'positionnement', 'reorientation-professionnelle',
      'evolution-professionnelle', 'reorientation-ou-reconversion', 'reconversion', 'reconversion-ou-evolution'
    ]
  },
  {
    id: 'collection-vie-parcours',
    titre: 'Quand la vie pèse sur le parcours',
    icone: '🧭',
    mode: 'collection',
    fichesOrdonnees: [
      'surendettement', 'assistante-sociale', 'aides-garde-enfants', 'aide-a-la-mobilite',
      'aide-carburant-grands-rouleurs', 'aide-alimentaire', 'hebergement-urgence', 'aide-materielle',
      'addictologie', 'violences'
    ]
  },
  {
    id: 'collection-se-faire-aider',
    titre: 'Se faire aider : accompagnements et mises en relation',
    icone: '🤝',
    mode: 'collection',
    fichesOrdonnees: [
      'parrainage-vers-l-emploi', 'groupe-de-pairs', 'o2r', 'atelier-thematique',
      'visite-entreprise', 'job-dating', 'mobilite-internationale'
    ]
  },
  {
    id: 'parcours-conditions-travail',
    titre: 'Comprendre les conditions de travail',
    icone: '🧭',
    mode: 'parcours',
    accroche: "Ce qui fait qu'un poste convient ou non, au-delà du seul salaire.",
    fichesOrdonnees: [
      'horaires-travail', 'temps-partiel-choisi-ou-subi', 'travail-de-nuit', 'astreintes',
      'rythme-travail', 'teletravail', 'deplacements-professionnels', 'proximite-domicile-travail',
      'port-de-charges', 'environnement-travail', 'contact-public', 'formation-prise-de-poste'
    ]
  },
  {
    id: 'collection-droits-sociaux',
    titre: 'Comprendre ses droits sociaux',
    icone: '📄',
    mode: 'collection',
    fichesOrdonnees: [
      'rsa', 'prime-activite', 'rsa-ou-prime-activite', 'are', 'ass', 'are-ou-ass',
      'aah', 'aides-au-logement', 'css', 'caf', 'msa', 'ccas', 'france-services',
      'declaration-de-ressources', 'plafond-de-ressources', 'quotient-familial',
      'reste-a-vivre', 'non-recours', 'monoparentalite', 'proche-aidant'
    ]
  },
  {
    id: 'collection-faire-valoir-droits',
    titre: 'Faire valoir ses droits',
    icone: '⚖️',
    mode: 'collection',
    fichesOrdonnees: [
      'conseil-de-prud-hommes', 'inspection-du-travail', 'defenseur-des-droits',
      'discrimination', 'discrimination-embauche', 'discrimination-ou-difference-de-traitement',
      'aide-juridictionnelle', 'point-justice', 'recours-amiable',
      'recours-amiable-ou-contentieux', 'prescription', 'cse'
    ]
  },
  {
    id: 'collection-se-loger',
    titre: "Se loger quand c'est difficile",
    icone: '🏠',
    mode: 'collection',
    fichesOrdonnees: [
      'dalo', 'siao-115', 'hebergement-urgence', 'accueil-de-jour', 'treve-hivernale',
      'fsl', 'aides-au-logement', 'visale', 'foyer-jeunes-travailleurs',
      'intermediation-locative', 'pension-de-famille', 'hebergement-ou-logement-accompagne',
      'domiciliation', 'assistante-sociale'
    ]
  },
  {
    id: 'collection-budget-dettes',
    titre: 'Budget, dettes et surendettement',
    icone: '🧮',
    mode: 'collection',
    fichesOrdonnees: [
      'surendettement', 'credit-conso-nouvelles-regles-2026', 'commission-de-surendettement', 'bonne-foi',
      'plan-conventionnel-de-redressement', 'mesures-imposees', 'plan-conventionnel-ou-mesures-imposees',
      'retablissement-personnel', 'ficp', 'saisie-sur-salaire', 'droit-au-compte',
      'services-bancaires-de-base', 'point-conseil-budget', 'microcredit-personnel',
      'epicerie-sociale', 'radiation', 'reste-a-vivre', 'assistante-sociale'
    ]
  },
  {
    id: 'collection-handicap-emploi',
    titre: "Comprendre le handicap et l'emploi",
    icone: '♿',
    mode: 'collection',
    fichesOrdonnees: [
      'rqth', 'rqth-ou-oeth', 'oeth', 'rlh', 'mdph', 'aah', 'pension-invalidite', 'aah-ou-pension-invalidite', 'pch',
      'carte-mobilite-inclusion', 'agefiph', 'cap-emploi',
      'emploi-accompagne', 'amenagement-poste', 'reclassement', 'visite-de-reprise',
      'aptitude-ou-inaptitude', 'entreprise-adaptee', 'esat', 'milieu-ordinaire-ou-milieu-protege'
    ]
  },
  {
    id: 'collection-lire-les-chiffres',
    titre: "Lire les chiffres de l'emploi",
    icone: '📊',
    mode: 'collection',
    fichesOrdonnees: [
      'demandeur-emploi-categories', 'chomage-au-sens-du-bit', 'inscrit-a-france-travail-ou-chomeur-bit',
      'inscription-automatique-france-travail-2025',
      'demandeur-emploi-longue-duree', 'besoins-en-main-d-oeuvre', 'metier-en-tension',
      'metier-en-tension-ou-metier-qui-recrute', 'neet', 'zone-d-emploi', 'bassin-emploi',
      'economie-presentielle'
    ]
  },
  {
    id: 'parcours-creer-activite',
    titre: 'Créer son activité',
    icone: '🧭',
    mode: 'parcours',
    accroche: "Comprendre les statuts et les appuis pour lancer une activité, sans se noyer dans les démarches.",
    fichesOrdonnees: [
      'auto-entrepreneur', 'entreprise-individuelle-ou-societe', 'cae', 'travailleur-non-salarie',
      'salarie-ou-travailleur-non-salarie', 'guichet-unique-entreprises', 'siren-ou-siret',
      'pret-d-honneur', 'microcredit-professionnel', 'microcredit-personnel-ou-professionnel',
      'pait', 'bprea', 'dnja'
    ]
  },
  {
    id: 'collection-jeunes-16-25',
    titre: 'Les repères des 16-25 ans',
    icone: '🧭',
    mode: 'collection',
    fichesOrdonnees: [
      'mission-locale', 'cej', 'obligation-de-formation', 'psad', 'ecole-2e-chance',
      'epide', 'ecole-2e-chance-ou-epide', 'ecole-de-production', 'cfa', 'alternance',
      'apprentissage-ou-professionnalisation', 'service-civique'
    ]
  },
  {
    id: 'collection-venir-de-l-etranger',
    titre: "Travailler en venant de l'étranger",
    icone: '🌍',
    mode: 'collection',
    fichesOrdonnees: [
      'ofii', 'contrat-integration-republicaine', 'primo-arrivant', 'fle', 'ofpra',
      'protection-subsidiaire', 'refugie-ou-protection-subsidiaire', 'titre-de-sejour',
      'autorisation-de-travail', 'titre-de-sejour-ou-autorisation-de-travail',
      'attestation-de-comparabilite', 'metier-en-tension'
    ]
  },
  {
    id: 'collection-sortie-detention',
    titre: 'Emploi et sortie de détention',
    icone: '🔑',
    mode: 'collection',
    fichesOrdonnees: [
      'spip', 'milieu-ouvert-ou-milieu-ferme', 'amenagement-de-peine', 'casier-judiciaire',
      'bulletin-n-3', 'bulletin-2-ou-bulletin-3', 'domiciliation', 'iae'
    ]
  },
  {
    id: 'parcours-preparer-retraite',
    titre: 'Travailler après 50 ans, préparer sa retraite',
    icone: '🧭',
    mode: 'parcours',
    accroche: "Voir venir la fin de carrière et ses choix, sans attendre le dernier moment.",
    fichesOrdonnees: [
      'releve-de-carriere', 'entretien-information-retraite', 'suspension-reforme-retraites-2026', 'retraite-progressive',
      'cumul-emploi-retraite', 'cumul-integral-ou-cumul-plafonne', 'mise-a-la-retraite',
      'depart-volontaire-ou-mise-a-la-retraite', 'contrat-valorisation-experience', 'amenagement-poste'
    ]
  },
  {
    id: 'collection-mobilite-quotidien',
    titre: 'Se déplacer pour travailler',
    icone: '🚗',
    mode: 'collection',
    fichesOrdonnees: [
      'aide-a-la-mobilite', 'plateforme-mobilite', 'transport-a-la-demande', 'garage-solidaire',
      'auto-ecole-sociale', 'permis-points', 'permis-suspendu-ou-annule'
    ]
  },
  {
    id: 'collection-garde-enfant',
    titre: "Faire garder son enfant pour travailler",
    icone: '🧸',
    mode: 'collection',
    fichesOrdonnees: [
      'aides-garde-enfants', 'relais-petite-enfance', 'mam', 'creche-avip', 'aripa'
    ]
  },
  {
    id: 'collection-cdd-fin-de-contrat',
    titre: 'CDD, intérim et fin de contrat',
    icone: '📄',
    mode: 'collection',
    fichesOrdonnees: [
      'cdd', 'cddi', 'cdd-classique-ou-cdd-d-insertion', 'cdd-tremplin', 'contrat-saisonnier',
      'prime-de-precarite', 'prime-de-precarite-ou-indemnite-de-licenciement', 'entretien-prealable',
      'delais-qui-protegent', 'portabilite-mutuelle', 'demission-legitime', 'solde-tout-compte'
    ]
  },
  {
    id: 'collection-savoirs-de-base',
    titre: 'Le français et les savoirs de base',
    icone: '📖',
    mode: 'collection',
    fichesOrdonnees: [
      'fle', 'alphabetisation-ou-fle', 'atelier-sociolinguistique', 'competences-de-base',
      'clea', 'illettrisme', 'illectronisme', 'illettrisme-ou-illectronisme', 'cecrl',
      'diplomes-de-francais'
    ]
  },
  {
    id: 'collection-accompagnement-plein-emploi',
    titre: "L'accompagnement depuis la loi pour le plein emploi",
    icone: '🤝',
    mode: 'collection',
    fichesOrdonnees: [
      'reseau-pour-emploi', 'contrat-d-engagement', 'referent-unique', 'diagnostic-partage',
      'actualisation', 'accompagnement-global', 'offre-raisonnable-d-emploi', 'radiation',
      'personnes-invisibles', 'cip'
    ]
  },
  {
    id: 'collection-relation-accompagnement',
    titre: "La relation d'accompagnement",
    icone: '🤝',
    mode: 'collection',
    fichesOrdonnees: [
      'co-construction', 'pouvoir-agir', 'pair-aidance', 'groupe-de-pairs',
      'secret-professionnel', 'personne-de-confiance', 'tiers-de-confiance-numerique',
      'non-recours', 'franceconnect'
    ]
  },
  {
    id: 'collection-commande-publique-insertion',
    titre: "Comprendre l'insertion par la commande publique",
    icone: '📚',
    mode: 'collection',
    fichesOrdonnees: [
      'marche-public', 'acheteur-public', 'allotissement', 'clause-sociale',
      'clause-d-execution-ou-critere-d-attribution', 'moins-disant-ou-mieux-disant',
      'heures-d-insertion', 'facilitateur-clause-sociale', 'marche-reserve',
      'sous-traitance', 'co-traitance', 'sous-traitance-ou-co-traitance',
      'maitre-ouvrage-ou-maitre-oeuvre'
    ]
  }
];

// Second niveau de lecture (etape 10, infrastructure technique uniquement
// -- aucun contenu redige, voir docs/CHANTIER_LEXIQUE.md section 11 et
// modules/lexique/ARCHITECTURE_TECHNIQUE.md). Le mecanisme est unique,
// seul le contenu varie selon la nature de la fiche : exemples concrets
// et mises en situation pour une notion, precisions et cas d'usage pour
// un dispositif, situations d'orientation pour une structure, scenarios
// pour un comparatif -- l'approfondissement classique (guide, dossier)
// n'est qu'une des formes possibles, jamais la seule. Chaque entree :
// { id, titre, fichesEntree (identifiants de fiches qui y donnent acces),
// corps }. Volontairement vide tant que les 3 conditions d'ouverture
// editoriales ne sont pas reunies -- le bouton "En savoir plus" d'une
// fiche n'apparait que si cette fiche est citee dans fichesEntree d'un
// element ci-dessous.
var LEXIQUE_SECOND_NIVEAU = [
  {
    id: 'second-niveau-cv-lecture-recruteur',
    titre: 'Exemples concrets',
    fichesEntree: ['cv-lecture-recruteur'],
    corps: "Un recruteur qui passe quelques secondes sur un CV remarque plus facilement un intitulé de poste clair placé en début de ligne qu'une compétence citée seulement au milieu d'un paragraphe. Deux CV au contenu équivalent peuvent donc être lus très différemment selon que les informations clés sont immédiatement visibles ou noyées dans le texte."
  },
  {
    id: 'second-niveau-lettre-motivation',
    titre: 'Exemples concrets',
    fichesEntree: ['lettre-motivation'],
    corps: "Une phrase comme « je suis motivé et sérieux » n'apporte pas d'information vérifiable : elle pourrait accompagner n'importe quelle candidature. Un élément concret du parcours qui explique l'intérêt pour ce poste précis, ou une observation sur l'entreprise elle-même, montre au contraire une recherche réelle plutôt qu'un envoi générique."
  },
  {
    id: 'second-niveau-parlez-moi-de-vous',
    titre: 'Exemples concrets',
    fichesEntree: ['parlez-moi-de-vous'],
    corps: "Concrètement, ça peut ressembler à relier en quelques phrases un ou deux éléments du parcours au poste visé, plutôt qu'à dérouler l'ensemble d'un CV dans l'ordre chronologique : le recruteur cherche justement à voir ce lien, pas à recevoir un résumé complet."
  },
  {
    id: 'second-niveau-autonomie',
    titre: 'Exemples concrets',
    fichesEntree: ['autonomie'],
    corps: "Concrètement, l'autonomie recherchée par un employeur peut se traduire par plusieurs situations : réagir seul face à un imprévu mineur sans attendre l'accord d'un responsable, organiser l'ordre de ses tâches dans une journée de travail, ou reconnaître qu'une question dépasse son niveau de décision et savoir alors solliciter l'aide nécessaire. L'autonomie ne signifie donc pas travailler sans aucun encadrement : elle s'exerce toujours à l'intérieur d'un cadre déjà donné."
  },
  {
    id: 'second-niveau-savoir-etre',
    titre: 'Exemples concrets',
    fichesEntree: ['savoir-etre'],
    corps: "Le savoir-être se remarque surtout dans des situations concrètes : la façon de signaler un retard ou une erreur, la manière de recevoir une remarque sur son travail, ou le ton employé pour poser une question à un collègue. Deux personnes aux compétences techniques équivalentes peuvent donc être perçues très différemment selon leur savoir-être."
  },
  {
    id: 'second-niveau-savoir-faire',
    titre: 'Exemples concrets',
    fichesEntree: ['savoir-faire'],
    corps: "Le savoir-faire se vérifie en général à travers des éléments concrets et démontrables : utiliser un logiciel métier précis, manier un outil spécifique, appliquer une méthode de travail propre à un secteur. Contrairement au savoir-être, il peut le plus souvent se prouver par une réalisation, un diplôme ou une mise en situation."
  },
  {
    id: 'second-niveau-esprit-equipe',
    titre: 'Exemples concrets',
    fichesEntree: ['esprit-equipe'],
    corps: "L'esprit d'équipe se traduit par des gestes simples : prévenir un collègue d'un retard qui l'affecte, transmettre une information utile sans attendre qu'on la demande, ou adapter son rythme lorsqu'une tâche dépend du travail d'un autre. Il ne s'oppose pas à l'autonomie : une personne autonome peut très bien avoir l'esprit d'équipe, les deux qualités portent sur des situations différentes."
  },
  {
    id: 'second-niveau-force-proposition',
    titre: 'Exemples concrets',
    fichesEntree: ['force-proposition'],
    corps: "Être force de proposition peut par exemple vouloir dire signaler qu'une tâche répétitive pourrait être simplifiée, ou suggérer une meilleure organisation après avoir observé le fonctionnement d'un poste pendant quelque temps. Cette qualité s'exprime rarement dès les premiers jours : elle suppose d'abord de connaître suffisamment le poste pour qu'une proposition soit pertinente."
  },
  {
    id: 'second-niveau-rigueur',
    titre: 'Exemples concrets',
    fichesEntree: ['rigueur'],
    corps: "La rigueur se remarque dans des détails concrets : relire un document avant de l'envoyer, vérifier une mesure ou un calcul avant de le transmettre, suivre une procédure dans l'ordre même quand elle semble répétitive. Elle est particulièrement recherchée sur des tâches où une erreur non détectée peut avoir des conséquences importantes."
  },
  {
    id: 'second-niveau-cdi',
    titre: 'Nuance utile',
    fichesEntree: ['cdi'],
    corps: "Un CDI ne garantit pas un emploi à vie : il peut prendre fin par une démission, un licenciement ou une rupture conventionnelle, comme n'importe quel contrat. Ce qui le distingue des autres contrats, c'est uniquement l'absence de date de fin fixée à l'avance, pas une promesse de stabilité absolue."
  },
  {
    id: 'second-niveau-cdd',
    titre: 'Nuance utile',
    fichesEntree: ['cdd'],
    corps: "Un CDD ne se transforme jamais automatiquement en CDI à sa date de fin : sauf proposition explicite d'un nouveau contrat, la relation de travail s'arrête simplement là où elle avait été prévue dès le départ."
  },
  {
    id: 'second-niveau-interim',
    titre: 'Exemples concrets',
    fichesEntree: ['interim'],
    corps: "Au quotidien, les consignes de travail viennent de l'entreprise cliente, tandis que les aspects contractuels (contrat, paie) restent gérés par l'agence d'intérim. Une même personne peut ainsi enchaîner plusieurs missions dans des entreprises différentes tout en gardant un seul employeur officiel."
  },
  {
    id: 'second-niveau-alternance',
    titre: 'Exemples concrets',
    fichesEntree: ['alternance'],
    corps: "Le rythme peut varier fortement d'une formation à l'autre : certaines alternent semaine en entreprise et semaine en centre de formation, d'autres répartissent différemment sur le mois ou l'année. Dans tous les cas, la personne reste salariée pendant toute la durée du contrat, y compris pendant les périodes passées en formation."
  },
  {
    id: 'second-niveau-stage',
    titre: 'Nuance utile',
    fichesEntree: ['stage'],
    corps: "Un stage peut, dans les tâches réalisées au quotidien, ressembler beaucoup à un emploi, ce qui entretient parfois la confusion. La différence de statut a des conséquences concrètes : les règles de protection sociale, de rémunération et de fin de période ne sont pas les mêmes que pour un contrat de travail, même quand le travail fourni est comparable."
  },
  {
    id: 'second-niveau-periode-essai',
    titre: 'Nuance utile',
    fichesEntree: ['periode-essai'],
    corps: "Ces règles plus souples s'appliquent dans les deux sens : la personne recrutée peut, elle aussi, mettre fin à la période d'essai plus simplement qu'elle ne le pourrait une fois le contrat confirmé, si elle réalise que le poste ne correspond finalement pas à ce qu'elle attendait."
  },
  {
    id: 'second-niveau-temps-partiel',
    titre: 'Nuance utile',
    fichesEntree: ['temps-partiel'],
    corps: "Un temps partiel peut correspondre à un choix de la personne (disponibilité, reprise progressive d'activité...) ou à l'organisation du poste proposée par l'employeur. Ce n'est pas nécessairement un signe de précarité : certains postes sont structurellement à temps partiel, quel que soit le profil de la personne qui les occupe."
  },
  {
    id: 'second-niveau-cdd-ou-interim',
    titre: 'Dans quels cas ?',
    fichesEntree: ['cdd-ou-interim'],
    corps: "Une entreprise qui doit remplacer une personne absente pour une durée déjà connue recrute plus souvent en CDD. Une entreprise confrontée à un besoin ponctuel et fluctuant, difficile à anticiper précisément, se tourne plus souvent vers l'intérim, qui permet d'ajuster plus rapidement la durée et le nombre de missions."
  },
  {
    id: 'second-niveau-cdi-ou-cdd',
    titre: 'Dans quels cas ?',
    fichesEntree: ['cdi-ou-cdd'],
    corps: "Un poste destiné à durer dans le temps, sans échéance particulière prévue, est généralement proposé en CDI. Un poste lié à un besoin ponctuel (un remplacement, un pic d'activité saisonnier, un projet à durée limitée) est généralement proposé en CDD, avec une date de fin déjà connue au moment de la signature."
  },
  {
    id: 'second-niveau-stage-ou-pmsmp',
    titre: 'Dans quels cas ?',
    fichesEntree: ['stage-ou-pmsmp'],
    corps: "Une personne encore inscrite dans un cursus de formation qui souhaite découvrir un métier passe généralement par un stage, encadré par son établissement. Une personne accompagnée dans son insertion professionnelle, en dehors d'un cursus de formation, qui souhaite tester un métier ou confirmer un projet, passe plutôt par une PMSMP, encadrée par la structure qui la suit."
  },
  {
    id: 'second-niveau-pmsmp',
    titre: 'Exemples concrets',
    fichesEntree: ['pmsmp'],
    corps: "Une PMSMP est particulièrement utile dans plusieurs situations : hésiter entre plusieurs métiers et vouloir les tester avant de s'engager dans une formation, vérifier qu'un métier envisagé correspond vraiment à ce qu'on imaginait, ou convaincre un employeur de recruter après une période d'observation réciproque. Elle s'insère dans un parcours d'insertion comme une étape parmi d'autres, jamais comme une fin en soi : elle prépare une suite (formation, recrutement, autre orientation) qui reste à construire avec la structure qui accompagne la personne."
  },
  {
    id: 'second-niveau-france-travail',
    titre: 'Nuance utile',
    fichesEntree: ['france-travail'],
    corps: "France Travail n'est pas la seule porte d'entrée vers l'accompagnement : selon sa situation, une personne peut être suivie par France Travail, par une Mission Locale (jeunes), par Cap Emploi (situation de handicap), ou par plusieurs de ces structures en parallèle, qui se coordonnent entre elles. Le passage par France Travail reste néanmoins le point de contact le plus courant pour l'inscription initiale et le versement de certaines allocations."
  },
  {
    id: 'second-niveau-mission-locale',
    titre: 'Exemples concrets',
    fichesEntree: ['mission-locale'],
    corps: "Un jeune peut être orienté vers une Mission Locale dans des situations très différentes : à la sortie d'un cursus scolaire sans solution immédiate, en cas de rupture d'un contrat d'apprentissage, ou simplement pour être accompagné sur des sujets qui dépassent la seule recherche d'emploi, comme l'accès à un logement ou à une solution de mobilité."
  },
  {
    id: 'second-niveau-cap-emploi',
    titre: 'Exemples concrets',
    fichesEntree: ['cap-emploi'],
    corps: "Cap Emploi intervient dans des situations variées : une personne reconnue travailleur handicapé qui recherche un emploi, une personne déjà en poste dont l'état de santé nécessite un aménagement pour continuer à travailler, ou un employeur qui souhaite être accompagné dans le recrutement ou le maintien d'une personne en situation de handicap."
  },
  {
    id: 'second-niveau-caf',
    titre: 'Nuance utile',
    fichesEntree: ['caf'],
    corps: "La CAF n'intervient pas dans la recherche d'emploi elle-même : une personne peut par exemple s'adresser à elle pour une aide au logement en parallèle d'un accompagnement vers l'emploi mené par une tout autre structure. Les deux démarches sont indépendantes, même si elles concernent parfois la même période de la vie d'une personne."
  },
  {
    id: 'second-niveau-siae',
    titre: 'Comprendre les 4 formes',
    fichesEntree: ['siae'],
    corps: "Les 4 formes de SIAE partagent le même objectif (accompagner vers l'emploi durable en s'appuyant sur une mise en situation de travail réelle) mais se distinguent par le type d'activité et le cadre proposé : un chantier d'insertion sur des activités concrètes encadrées collectivement, une entreprise d'insertion qui fonctionne comme une entreprise classique, une association intermédiaire pour des missions ponctuelles chez des particuliers ou des structures, une ETTI qui fonctionne comme une agence d'intérim dédiée. Le choix entre ces formes dépend moins de la volonté de la personne que de l'offre disponible sur son territoire et de son évaluation par la structure qui l'oriente."
  },
  {
    id: 'second-niveau-aci',
    titre: 'Nuance utile',
    fichesEntree: ['aci'],
    corps: "Un chantier d'insertion se distingue d'une entreprise d'insertion par son mode d'organisation : l'activité y est souvent encadrée collectivement par un encadrant technique, sur des tâches concrètes et visibles (espaces verts, second œuvre du bâtiment, recyclage...), plutôt qu'organisée comme une entreprise classique tournée vers un marché."
  },
  {
    id: 'second-niveau-ei',
    titre: 'Nuance utile',
    fichesEntree: ['ei'],
    corps: "Contrairement à un chantier d'insertion, une entreprise d'insertion vend réellement ses produits ou services sur un marché, en concurrence avec d'autres entreprises. Une personne y travaille donc dans des conditions très proches d'un emploi classique, tout en bénéficiant d'un accompagnement vers la suite de son parcours."
  },
  {
    id: 'second-niveau-ai',
    titre: 'Exemples concrets',
    fichesEntree: ['ai'],
    corps: "Une association intermédiaire convient bien à des missions courtes et variées, par exemple quelques heures de ménage chez un particulier ou un renfort ponctuel pour une association. C'est souvent une première étape, plus souple qu'un contrat classique, avant d'envisager une mission plus longue ou un autre type de structure."
  },
  {
    id: 'second-niveau-etti',
    titre: 'Nuance utile',
    fichesEntree: ['etti'],
    corps: "La différence avec une agence d'intérim classique tient à l'accompagnement proposé en plus des missions elles-mêmes : une ETTI suit la personne dans son parcours d'insertion pendant la durée des missions, ce qu'une agence d'intérim classique ne fait pas."
  },
  {
    id: 'second-niveau-diagnostic-partage',
    titre: 'Nuance utile',
    fichesEntree: ['diagnostic-partage'],
    corps: "Un diagnostic partagé ne se limite pas à une liste de difficultés : il fait aussi apparaître ce qui fonctionne déjà (des compétences, une expérience, un réseau). Il n'est pas figé non plus : une situation peut évoluer, et le diagnostic se réajuste alors avec la personne, plutôt que d'être établi une fois pour toutes en début d'accompagnement."
  },
  {
    id: 'second-niveau-frein-emploi',
    titre: 'Nuance utile',
    fichesEntree: ['frein-emploi'],
    corps: "Un frein peut être direct (un frein de mobilité qui empêche d'accéder à certains postes) ou plus indirect, en pesant sur la disponibilité ou la confiance sans concerner l'emploi lui-même. Un même frein peut aussi ne pas avoir le même poids selon le métier visé : une contrainte de mobilité compte différemment pour un poste très localisé que pour un métier exercé à distance."
  },
  {
    id: 'second-niveau-plan-action',
    titre: 'Exemples concrets',
    fichesEntree: ['plan-action'],
    corps: "Un plan d'action peut mêler des étapes très différentes selon la situation : une formation courte, une immersion en entreprise, une démarche à finaliser, ou simplement un temps pour clarifier un projet encore incertain. Ce n'est jamais une liste figée : une étape peut être ajoutée, retirée ou réordonnée si la situation de la personne change."
  },
  {
    id: 'second-niveau-positionnement',
    titre: 'Nuance utile',
    fichesEntree: ['positionnement'],
    corps: "Le positionnement peut évoluer sans que la personne ait changé : le marché du travail local, une nouvelle compétence acquise, ou une expérience récente peuvent modifier la façon dont une personne se situe par rapport à un métier ou un secteur, sans remettre en cause ce qu'elle est."
  },
  {
    id: 'second-niveau-prescription',
    titre: 'Exemples concrets',
    fichesEntree: ['prescription'],
    corps: "Une prescription peut être acceptée, refusée ou discutée : une personne peut par exemple estimer qu'une formation proposée ne correspond pas au bon moment de son parcours, et en reparler avec son conseiller plutôt que de la suivre par défaut."
  },
  {
    id: 'second-niveau-employabilite',
    titre: 'Nuance utile',
    fichesEntree: ['employabilite'],
    corps: "Ce qui influence l'employabilité peut évoluer indépendamment de la personne elle-même : une nouvelle compétence recherchée sur le marché, une évolution du secteur visé, ou simplement le moment où une candidature est déposée. Deux personnes aux parcours similaires peuvent donc avoir une employabilité différente selon le contexte, sans que l'une soit meilleure que l'autre."
  },
  {
    id: 'second-niveau-reconversion',
    titre: 'Exemples concrets',
    fichesEntree: ['reconversion'],
    corps: "Une reconversion peut être choisie (découvrir un nouveau centre d'intérêt, viser un métier plus stable) ou rendue nécessaire (un métier qui évolue, un problème de santé qui empêche de continuer dans le même secteur). Dans les deux cas, elle s'appuie rarement sur un départ de zéro : des compétences transférables existent souvent d'un métier à l'autre, même quand le changement semble important."
  },
  {
    id: 'second-niveau-salaire-brut',
    titre: 'Nuance utile',
    fichesEntree: ['salaire-brut'],
    corps: "Un montant annoncé pour un poste correspond presque toujours au salaire brut, pas au montant réellement perçu. Comparer deux offres uniquement sur ce montant peut donc être trompeur si les cotisations ou le statut du contrat diffèrent d'un poste à l'autre."
  },
  {
    id: 'second-niveau-salaire-net',
    titre: 'Exemples concrets',
    fichesEntree: ['salaire-net'],
    corps: "Le montant réellement versé peut légèrement varier d'un mois à l'autre, même à salaire de base identique, selon des éléments comme le nombre de jours travaillés ou une prime ponctuelle. Le bulletin de salaire détaille ces variations mois par mois."
  },
  {
    id: 'second-niveau-bulletin-salaire',
    titre: 'Exemples concrets',
    fichesEntree: ['bulletin-salaire'],
    corps: "Repérer d'abord le poste et le temps de travail permet de vérifier que le bulletin correspond bien à la situation attendue, avant même de regarder le détail des montants. Une ligne inhabituelle ou absente d'un mois à l'autre (une prime, une absence) mérite d'être comprise plutôt qu'ignorée, sans que cela signifie forcément une erreur."
  },
  {
    id: 'second-niveau-cpf',
    titre: 'Exemples concrets',
    fichesEntree: ['cpf'],
    corps: "Le CPF peut financer des formations très différentes selon le projet : une formation qualifiante liée à un nouveau métier, un accompagnement à la création d'entreprise, ou encore un permis de conduire lorsqu'il est nécessaire à l'emploi visé. Le montant disponible dépend du parcours professionnel de chacun, ce qui explique pourquoi deux personnes n'ont jamais exactement les mêmes possibilités."
  },
  {
    id: 'second-niveau-vae',
    titre: 'Exemples concrets',
    fichesEntree: ['vae'],
    corps: "La VAE s'appuie sur une expérience réelle, quelle que soit sa forme : un emploi salarié, une activité bénévole régulière ou une mission en tant qu'indépendant peuvent chacun compter, du moment que la personne peut démontrer avoir exercé les activités correspondant au diplôme visé. Le diplôme obtenu par ce chemin a la même valeur que celui obtenu par une formation classique."
  },
  {
    id: 'second-niveau-rqth',
    titre: 'Nuance utile',
    fichesEntree: ['rqth'],
    corps: "La RQTH ne concerne pas uniquement les handicaps visibles : elle peut concerner des situations de santé très diverses, y compris invisibles au quotidien (troubles chroniques, certaines maladies...). C'est un statut administratif distinct du taux d'incapacité, qui ouvre des droits sans obliger à en parler systématiquement à chaque employeur."
  },
  {
    id: 'second-niveau-rqth-formation',
    titre: 'Formation et reconversion',
    fichesEntree: ['rqth'],
    corps: "La RQTH est la porte d'entrée vers l'accompagnement Cap emploi et les aides Agefiph, qu'on soit déjà salarié ou en recherche d'emploi. Le financement du coût d'une formation par l'Agefiph a beaucoup évolué ces dernières années : ce qui est réellement disponible se vérifie auprès de son conseiller Cap emploi au moment de la démarche, plutôt que sur une liste qui peut être dépassée. Le CPF, lui, reste un levier de financement à part entière, non lié à ces évolutions."
  },
  {
    id: 'second-niveau-mdph-delai',
    titre: 'Le délai',
    fichesEntree: ['mdph'],
    corps: "Le délai légal de réponse est de 4 mois à compter d'un dossier complet, mais il est fréquent que ce délai soit dépassé selon la charge de travail de la MDPH. Utile à savoir pour ne pas s'inquiéter d'une attente qui se prolonge, et pour anticiper un renouvellement : mieux vaut déposer la nouvelle demande plusieurs mois avant l'échéance inscrite sur la notification, pour ne pas se retrouver sans droits ouverts pendant l'instruction."
  },
  {
    id: 'second-niveau-aah-reprise-emploi',
    titre: 'Reprendre un emploi',
    fichesEntree: ['aah'],
    corps: "Reprendre un emploi ne fait pas perdre l'AAH du jour au lendemain : le cumul se recalcule à partir d'une déclaration transmise chaque trimestre à la CAF ou à la MSA, jamais d'une remise en cause immédiate. La durée d'attribution varie aussi selon la situation : plus longue, parfois à vie, quand le taux de handicap reconnu est élevé ; plus courte et réexaminée plus souvent quand le taux est plus bas et que la situation peut évoluer."
  },
  {
    id: 'second-niveau-pension-invalidite',
    titre: 'Par où commencer',
    fichesEntree: ['pension-invalidite'],
    corps: "Il faut être affilié à la Sécurité sociale depuis un certain temps et avoir suffisamment cotisé ou travaillé sur la période récente : ce n'est pas ouvert à n'importe quel moment d'un parcours. Deux façons d'y arriver : la personne fait elle-même la demande (formulaire ou compte ameli/MSA) si elle n'est pas en arrêt de travail ; si elle l'est, c'est souvent le service médical de la caisse qui prend l'initiative de la contacter en fin d'arrêt. En cas de désaccord sur la catégorie retenue ou de refus, un recours amiable est possible auprès de la caisse, puis un recours devant le tribunal."
  },
  {
    id: 'second-niveau-cotisations-sociales',
    titre: 'Pourquoi ça compte',
    fichesEntree: ['cotisations-sociales'],
    corps: "Les cotisations retirées du salaire ne disparaissent pas : elles ouvrent des droits concrets, par exemple des trimestres validés pour la retraite ou une éligibilité à une indemnisation en cas de perte d'emploi. Comprendre ce qu'elles financent aide à voir la différence entre salaire brut et salaire net autrement que comme une simple perte."
  },
  {
    id: 'second-niveau-heures-supplementaires',
    titre: 'Nuance utile',
    fichesEntree: ['heures-supplementaires'],
    corps: "Le taux appliqué aux heures supplémentaires n'est pas toujours le même : il peut varier selon le nombre d'heures déjà effectuées dans la semaine, l'accord en vigueur dans l'entreprise, ou d'autres règles propres au secteur. C'est pour cette raison qu'un même nombre d'heures supplémentaires peut apparaître différemment sur deux bulletins de salaire."
  },
  {
    id: 'second-niveau-primes',
    titre: 'Exemples concrets',
    fichesEntree: ['primes'],
    corps: "Quelques exemples concrets : une prime de fin d'année, une prime liée à un objectif atteint, une prime d'ancienneté. Toutes ont un point commun : elles valorisent quelque chose (une performance, une fidélité, un moment particulier), jamais une dépense déjà engagée par la personne."
  },
  {
    id: 'second-niveau-indemnites',
    titre: 'Exemples concrets',
    fichesEntree: ['indemnites'],
    corps: "Quelques exemples concrets : une indemnité de transport, une indemnité de repas, une indemnité de fin de contrat. Toutes ont un point commun : elles compensent une situation ou une dépense, jamais un mérite ou une performance, ce qui les distingue d'une prime."
  },
  {
    id: 'second-niveau-cumuls',
    titre: 'Pourquoi ça compte',
    fichesEntree: ['cumuls'],
    corps: "Les cumuls sont souvent demandés en dehors du bulletin de salaire lui-même : pour une demande de prêt, une déclaration à un organisme social, ou simplement pour vérifier que le salaire perçu sur l'année correspond à ce qui était attendu. Un seul bulletin ne suffit jamais à répondre à ces questions, seul le cumul le permet."
  },
  {
    id: 'second-niveau-cout-employeur',
    titre: 'Exemples concrets',
    fichesEntree: ['cout-employeur'],
    corps: "Cette différence explique pourquoi un employeur peut parler d'un budget bien supérieur au salaire brut annoncé dans une offre d'emploi : le coût employeur inclut des sommes que la personne recrutée ne voit jamais, ni sur son bulletin, ni sur son compte en banque."
  },
  {
    id: 'second-niveau-medecine-travail',
    titre: 'Pourquoi ça compte',
    fichesEntree: ['medecine-travail'],
    corps: "Une visite chez la médecine du travail n'est pas réservée aux situations de santé compliquées : elle a lieu par exemple systématiquement à l'embauche, ou après une absence prolongée, quel que soit le motif. C'est un passage habituel du monde du travail, pas un signe que quelque chose ne va pas."
  },
  {
    id: 'second-niveau-maintien-emploi',
    titre: 'Nuance utile',
    fichesEntree: ['maintien-emploi'],
    corps: "Le maintien dans l'emploi ne concerne pas uniquement les personnes reconnues travailleur handicapé : une contrainte de santé ponctuelle, même sans RQTH, peut donner lieu aux mêmes solutions d'adaptation."
  },
  {
    id: 'second-niveau-amenagement-poste',
    titre: 'Exemples concrets',
    fichesEntree: ['amenagement-poste'],
    corps: "Quelques exemples concrets : des horaires décalés pour éviter les heures de forte affluence, un poste de travail réorganisé pour limiter les efforts physiques, ou un temps partiel thérapeutique après un arrêt. La forme exacte dépend toujours de la situation et du poste concerné."
  },
  {
    id: 'second-niveau-rupture-conventionnelle',
    titre: 'Nuance utile',
    fichesEntree: ['rupture-conventionnelle'],
    corps: "Une rupture conventionnelle ne peut jamais être imposée par une seule des deux parties : si l'employeur ou le salarié refuse, elle n'a pas lieu, et le contrat se poursuit normalement, ou se termine par un autre moyen (démission, licenciement)."
  },
  {
    id: 'second-niveau-objectifs-smart',
    titre: 'Exemples concrets',
    fichesEntree: ['objectifs-smart'],
    corps: "« Retrouver un emploi » n'est pas un objectif SMART : trop vague, sans échéance, difficile à mesurer. « Envoyer trois candidatures ciblées par semaine pendant un mois » l'est davantage : c'est précis, mesurable, et limité dans le temps."
  },
  {
    id: 'second-niveau-trefle-chanceux',
    titre: 'Exemples concrets',
    fichesEntree: ['trefle-chanceux'],
    corps: "Une personne qui aime le contact avec le public, qui sait déjà utiliser un logiciel de caisse, et qui vit dans un bassin d'emploi où le commerce recrute, voit ces trois éléments se recouper vers une piste concrète, sans que ça signifie que c'est la seule option possible."
  },
  {
    id: 'second-niveau-qualification',
    titre: 'Nuance utile',
    fichesEntree: ['qualification'],
    corps: "La qualification reconnue à une personne peut évoluer sans changement de poste : une nouvelle certification obtenue, ou une expérience suffisante accumulée, peut faire progresser cette reconnaissance au fil du temps, avec un effet possible sur le classement et la rémunération prévus par la convention collective."
  },
  {
    id: 'second-niveau-prelevement-source',
    titre: 'Nuance utile',
    fichesEntree: ['prelevement-source'],
    corps: "Le taux appliqué est propre à la situation de chaque foyer et peut être révisé en cours d'année, notamment après un changement de revenus ou de situation familiale. Un taux qui change d'un bulletin à l'autre traduit donc un ajustement, pas une erreur."
  },
  {
    id: 'second-niveau-conges-payes',
    titre: 'Nuance utile',
    fichesEntree: ['conges-payes'],
    corps: "Le compteur affiché ne reflète pas l'ancienneté ressentie dans le poste : il progresse au fil du temps réellement travaillé, ce qui explique qu'une personne récemment embauchée puisse avoir peu de jours acquis, même bien installée dans son poste."
  },
  {
    id: 'second-niveau-absences',
    titre: 'Exemples concrets',
    fichesEntree: ['absences'],
    corps: "Une absence pour maladie, une absence pour congé et une absence non justifiée n'ont pas le même traitement : la première peut être partiellement compensée selon le régime de prévoyance, la deuxième reste rémunérée normalement puisqu'elle est prévue par le contrat, la troisième ne l'est en général pas."
  },
  {
    id: 'second-niveau-remboursement-frais',
    titre: 'Nuance utile',
    fichesEntree: ['remboursement-frais'],
    corps: "Un remboursement de frais n'étant pas un revenu supplémentaire, il n'est pas soumis aux mêmes cotisations qu'un salaire ou qu'une prime, ce qui explique qu'il apparaisse séparément sur le bulletin, même s'il se trouve parfois sur des lignes voisines."
  },
  {
    id: 'second-niveau-aptitude-ou-inaptitude',
    titre: 'Dans quels cas ?',
    fichesEntree: ['aptitude-ou-inaptitude'],
    corps: "Un avis d'aptitude, avec ou sans aménagement, concerne la majorité des visites de la médecine du travail. Un avis d'inaptitude reste plus rare, réservé aux situations où le poste actuel, même aménagé, n'est plus tenable pour la personne : jamais une sanction, mais le point de départ d'une recherche de solution."
  },
  {
    id: 'second-niveau-prime-ou-indemnite',
    titre: 'Dans quels cas ?',
    fichesEntree: ['prime-ou-indemnite'],
    corps: "Une prime de fin d'année, une prime d'ancienneté ou une prime sur objectif valorisent quelque chose accompli ou constaté. Une indemnité de transport, de repas ou de fin de contrat compense une dépense ou une situation réelle. Le mot « prime » est pourtant souvent employé à tort pour l'une comme pour l'autre dans le langage courant."
  },
  {
    id: 'second-niveau-savoir-etre-ou-savoir-faire',
    titre: 'Dans quels cas ?',
    fichesEntree: ['savoir-etre-ou-savoir-faire'],
    corps: "Un recruteur évalue plutôt le savoir-faire à travers un diplôme, une réalisation ou une mise en situation technique. Il évalue plutôt le savoir-être au fil de l'échange lui-même, la façon de répondre, d'écouter, de réagir à une question inattendue, ou par les retours d'anciens employeurs."
  },
  {
    id: 'second-niveau-cpf-ou-vae',
    titre: 'Dans quels cas ?',
    fichesEntree: ['cpf-ou-vae'],
    corps: "Une personne qui souhaite acquérir une compétence qu'elle n'a pas encore se tourne vers le CPF pour financer une formation. Une personne qui exerce déjà une activité depuis un certain temps, mais sans le diplôme correspondant, se tourne vers la VAE pour faire reconnaître ce qu'elle sait déjà faire."
  },
  {
    id: 'second-niveau-francetravail-missionlocale-capemploi',
    titre: 'Dans quels cas ?',
    fichesEntree: ['francetravail-missionlocale-capemploi'],
    corps: "Une personne qui recherche un emploi, quel que soit son âge, s'adresse à France Travail. Un jeune de 16 à 25 ans peut s'adresser à la Mission Locale, pour un accompagnement qui dépasse souvent la seule recherche d'emploi. Une personne en situation de handicap peut s'adresser à Cap Emploi. Ces trois portes d'entrée peuvent se cumuler pour une même personne, suivie en parallèle par plusieurs d'entre elles."
  },
  {
    id: 'second-niveau-franceconnect',
    titre: 'Exemples concrets',
    fichesEntree: ['franceconnect'],
    corps: "FranceConnect permet par exemple d'accéder au site des impôts, à l'Assurance Maladie ou à un espace France Travail avec un seul identifiant, sans avoir à retenir un mot de passe différent pour chaque service."
  },
  {
    id: 'second-niveau-actualisation',
    titre: 'Nuance utile',
    fichesEntree: ['actualisation'],
    corps: "Ne pas s'actualiser, même sans réel changement de situation, peut interrompre l'inscription et le versement d'une éventuelle allocation. C'est une démarche à répéter régulièrement, pas une formalité à faire une seule fois lors de l'inscription."
  },
  {
    id: 'second-niveau-attestation-employeur',
    titre: 'Pourquoi ça compte',
    fichesEntree: ['attestation-employeur'],
    corps: "Sans ce document, une personne peut difficilement faire valoir ses droits auprès de France Travail à la fin d'un contrat : c'est lui qui atteste officiellement de la période travaillée et des rémunérations perçues, une information que France Travail ne peut pas déduire seul."
  },
  {
    id: 'second-niveau-are',
    titre: 'Nuance utile',
    fichesEntree: ['are'],
    corps: "L'ARE n'est pas automatique dès la perte d'un emploi : elle suppose de remplir certaines conditions et de rester inscrit et actualisé auprès de France Travail pendant toute la durée du versement."
  },
  {
    id: 'second-niveau-poei',
    titre: 'Exemples concrets',
    fichesEntree: ['poei'],
    corps: "Une entreprise qui a repéré un candidat prometteur mais qui ne maîtrise pas encore un logiciel précis ou une norme du métier peut recourir à une POEI pour combler cet écart avant la prise de poste, plutôt que d'écarter la candidature."
  },
  {
    id: 'second-niveau-cej',
    titre: 'Nuance utile',
    fichesEntree: ['cej'],
    corps: "Le CEJ ne se limite pas à des rendez-vous réguliers : il associe un suivi rapproché à des mises en situation concrètes, comme des immersions ou des ateliers, pour donner à la personne des expériences à valoriser, pas seulement des conseils."
  },
  {
    id: 'second-niveau-pacea',
    titre: 'Nuance utile',
    fichesEntree: ['pacea'],
    corps: "Le PACEA n'est pas un dispositif que l'on demande directement : c'est le cadre dans lequel s'inscrit l'accompagnement d'un jeune par la Mission Locale, à l'intérieur duquel des dispositifs plus ciblés, comme le CEJ, peuvent être proposés selon la situation."
  },
  {
    id: 'second-niveau-bilan-competences',
    titre: 'Nuance utile',
    fichesEntree: ['bilan-competences'],
    corps: "Un bilan de compétences ne débouche pas nécessairement sur un changement de métier : il peut tout aussi bien confirmer qu'un projet déjà en tête est le bon, ou aider à choisir entre plusieurs pistes déjà envisagées."
  },
  {
    id: 'second-niveau-cep',
    titre: 'Nuance utile',
    fichesEntree: ['cep'],
    corps: "Le CEP n'est pas réservé aux personnes sans emploi : toute personne active, y compris en poste, peut y avoir recours pour réfléchir à une évolution ou une reconversion, en toute confidentialité vis-à-vis de son employeur."
  },
  {
    id: 'second-niveau-rncp',
    titre: 'Pourquoi ça compte',
    fichesEntree: ['rncp'],
    corps: "Le niveau RNCP permet de comparer deux parcours de formation qui ne portent pas le même nom mais couvrent un niveau proche, ce qui aide à situer une certification par rapport à une autre, ou par rapport à un diplôme plus classique."
  },
  {
    id: 'second-niveau-cqp',
    titre: 'Nuance utile',
    fichesEntree: ['cqp'],
    corps: "Un CQP obtenu dans une branche professionnelle donnée n'est pas automatiquement reconnu de la même façon dans une autre branche, contrairement à un titre professionnel ou un diplôme national, reconnus plus largement."
  },
  {
    id: 'second-niveau-titre-professionnel',
    titre: 'Exemples concrets',
    fichesEntree: ['titre-professionnel'],
    corps: "Un titre professionnel se prépare bloc par bloc (CCP) : une personne peut valider un premier bloc, exercer un temps, puis reprendre la préparation du bloc suivant, sans repartir de zéro à chaque étape."
  },
  {
    id: 'second-niveau-certification',
    titre: 'Nuance utile',
    fichesEntree: ['certification'],
    corps: "Toutes les certifications n'ont pas le même poids ni la même reconnaissance : un diplôme national, un titre professionnel et un CQP de branche répondent chacun à une logique différente, même s'ils attestent tous d'un niveau de compétence."
  },
  {
    id: 'second-niveau-formation-qualifiante-ou-certifiante',
    titre: 'Dans quels cas ?',
    fichesEntree: ['formation-qualifiante-ou-certifiante'],
    corps: "Une personne qui cherche avant tout à progresser dans ses compétences, sans viser un papier officiel, peut se tourner vers une formation qualifiante. Une personne qui a besoin d'un diplôme, d'un titre ou d'un CQP reconnu, par exemple pour répondre à une exigence d'un employeur ou d'une convention collective, se tourne vers une formation certifiante."
  },
  {
    id: 'second-niveau-rncp-ou-cqp',
    titre: 'Dans quels cas ?',
    fichesEntree: ['rncp-ou-cqp'],
    corps: "Une personne qui vise une reconnaissance large, valable au-delà d'un seul secteur, privilégie une certification inscrite au RNCP. Une personne qui vise un métier très spécifique à une branche professionnelle précise peut se satisfaire d'un CQP, reconnu fortement dans ce secteur mais peu au-delà."
  },
  {
    id: 'second-niveau-diplome-titre-certification',
    titre: 'Dans quels cas ?',
    fichesEntree: ['diplome-titre-certification'],
    corps: "Un parcours de formation initiale mène le plus souvent à un diplôme. Un parcours de formation professionnelle ou une VAE mène plus souvent à un titre professionnel. Une branche professionnelle précise délivre plutôt une certification propre, comme un CQP, les trois pouvant coexister pour un même métier."
  },
  {
    id: 'second-niveau-ecoute-active',
    titre: 'Exemples concrets',
    fichesEntree: ['ecoute-active'],
    corps: "Concrètement, l'écoute active peut se traduire par un silence qui laisse la personne terminer sa phrase, une reformulation avant de répondre, ou une question qui invite à préciser plutôt qu'une réponse toute prête donnée trop vite."
  },
  {
    id: 'second-niveau-reformulation',
    titre: 'Exemples concrets',
    fichesEntree: ['reformulation'],
    corps: "Une reformulation peut commencer par « si je comprends bien... » ou « vous voulez dire que... », suivie de ce qui a été compris, avant de laisser la personne confirmer, préciser ou corriger."
  },
  {
    id: 'second-niveau-questionnement',
    titre: 'Exemples concrets',
    fichesEntree: ['questionnement'],
    corps: "« Qu'est-ce qui vous plaît dans ce métier ? » laisse davantage de place à la personne que « est-ce que ce métier vous plaît ? », qui appelle une réponse fermée en un mot."
  },
  {
    id: 'second-niveau-conduite-entretien',
    titre: 'Nuance utile',
    fichesEntree: ['conduite-entretien'],
    corps: "La conduite d'un entretien d'accompagnement ne suit pas un script figé : le professionnel adapte l'équilibre entre écoute, questionnement et reformulation selon ce que la personne apporte, tout en gardant un fil conducteur vers l'objectif de l'échange."
  },
  {
    id: 'second-niveau-advp',
    titre: 'Nuance utile',
    fichesEntree: ['advp'],
    corps: "L'ADVP ne propose pas un test ou un résultat à la fin : elle accompagne un cheminement, où l'orientation se précise progressivement à partir de l'expérience de la personne, plutôt que d'être révélée d'un coup."
  },
  {
    id: 'second-niveau-co-construction',
    titre: 'Exemples concrets',
    fichesEntree: ['co-construction'],
    corps: "Construire ensemble un plan d'action plutôt que le remettre déjà rédigé, ou discuter plusieurs options avant de choisir une piste plutôt que d'en imposer une seule, sont deux façons concrètes de pratiquer la co-construction."
  },
  {
    id: 'second-niveau-pouvoir-agir',
    titre: 'Nuance utile',
    fichesEntree: ['pouvoir-agir'],
    corps: "Renforcer le pouvoir d'agir d'une personne ne signifie pas la laisser seule face à ses difficultés : c'est au contraire lui donner les moyens (information, compétences, confiance) de décider et d'agir par elle-même, avec un accompagnement qui reste présent."
  },
  {
    id: 'second-niveau-convention-collective',
    titre: 'Exemples concrets',
    fichesEntree: ['convention-collective'],
    corps: "Une convention collective peut par exemple fixer un salaire minimum supérieur au minimum légal, prévoir une prime propre au secteur, ou encadrer différemment les horaires, toujours en complément du contrat de travail, jamais en le remplaçant."
  },
  {
    id: 'second-niveau-preavis',
    titre: 'Nuance utile',
    fichesEntree: ['preavis'],
    corps: "La durée du préavis dépend du motif de fin de contrat et de l'ancienneté, ce qui fait qu'elle n'est jamais la même d'une situation à l'autre : elle se retrouve dans le contrat de travail ou la convention collective applicable."
  },
  {
    id: 'second-niveau-licenciement',
    titre: 'Nuance utile',
    fichesEntree: ['licenciement'],
    corps: "Un licenciement, même quand il est vécu difficilement, reste soumis à des règles précises que l'employeur doit respecter, un motif réel et sérieux et une procédure à suivre, ce qui le distingue d'une décision arbitraire."
  },
  {
    id: 'second-niveau-demission',
    titre: 'Nuance utile',
    fichesEntree: ['demission'],
    corps: "Une démission doit être exprimée de façon claire, sans ambiguïté : un simple abandon de poste ou un mouvement d'humeur ne suffit pas à constituer une démission au sens juridique du terme."
  },
  {
    id: 'second-niveau-solde-tout-compte',
    titre: 'Pourquoi ça compte',
    fichesEntree: ['solde-tout-compte'],
    corps: "Ce document permet à la personne de vérifier que tout ce qui lui était dû à la fin du contrat a bien été versé, un point de repère utile en cas de doute ou de désaccord avec l'employeur."
  },
  {
    id: 'second-niveau-abandon-poste',
    titre: 'Nuance utile',
    fichesEntree: ['abandon-de-poste'],
    corps: "Un abandon de poste se distingue d'une démission par l'intention : il n'exprime aucune volonté claire de quitter l'emploi, contrairement à une démission qui est un choix assumé. Depuis 2023, la loi rapproche pourtant les deux pour les droits au chômage, via la présomption de démission : cette nuance d'intention reste utile pour évaluer une contestation, mais elle ne change plus l'issue immédiate."
  },
  {
    id: 'second-niveau-demission-ou-rupture-conventionnelle',
    titre: 'Dans quels cas ?',
    fichesEntree: ['demission-ou-rupture-conventionnelle'],
    corps: "Une personne qui souhaite partir de sa seule initiative, sans négociation avec l'employeur, démissionne. Une personne qui souhaite partir mais espère un accord avec son employeur, par exemple pour organiser la transition ou sécuriser la suite de son parcours, se tourne vers une rupture conventionnelle, qui suppose l'accord des deux parties."
  },
  {
    id: 'second-niveau-entretien-annuel',
    titre: 'Nuance utile',
    fichesEntree: ['entretien-annuel'],
    corps: "Un entretien annuel ne sert pas à décider du maintien dans le poste : c'est un temps d'échange sur l'année écoulée et les objectifs à venir, distinct d'une évaluation qui menacerait l'emploi."
  },
  {
    id: 'second-niveau-culture-entreprise',
    titre: 'Exemples concrets',
    fichesEntree: ['culture-entreprise'],
    corps: "La façon dont les décisions se prennent, collectivement ou par un seul responsable, le degré de formalité dans les échanges, ou l'importance donnée à l'équilibre entre vie professionnelle et personnelle sont des éléments qui composent la culture d'une entreprise."
  },
  {
    id: 'second-niveau-marque-employeur',
    titre: 'Nuance utile',
    fichesEntree: ['marque-employeur'],
    corps: "La marque employeur ne se limite pas à ce qu'une entreprise communique sur elle-même : les avis laissés par d'anciens salariés ou les échanges informels autour d'un métier y contribuent tout autant, parfois davantage."
  },
  {
    id: 'second-niveau-cooptation',
    titre: 'Nuance utile',
    fichesEntree: ['cooptation'],
    corps: "La cooptation ne dispense jamais d'un processus de recrutement classique : la personne recommandée passe généralement par les mêmes étapes que les autres candidatures, la recommandation jouant surtout un rôle de mise en avant initiale."
  },
  {
    id: 'second-niveau-bassin-emploi',
    titre: 'Nuance utile',
    fichesEntree: ['bassin-emploi'],
    corps: "Un bassin d'emploi peut s'étendre au-delà d'une seule ville ou se limiter à une partie d'un département, selon les trajets que les habitants sont réellement prêts à faire au quotidien pour se rendre au travail."
  },
  {
    id: 'second-niveau-polyvalence',
    titre: 'Nuance utile',
    fichesEntree: ['polyvalence'],
    corps: "La polyvalence ne signifie pas l'absence de spécialité : une personne peut avoir un domaine de compétence principal tout en étant capable d'assurer plusieurs types de tâches autour de celui-ci."
  },
  {
    id: 'second-niveau-sens-organisation',
    titre: 'Exemples concrets',
    fichesEntree: ['sens-organisation'],
    corps: "Préparer sa journée avant de commencer, savoir dans quel ordre traiter plusieurs tâches urgentes, ou remarquer qu'une échéance approche avant qu'elle ne devienne un problème sont des manifestations concrètes du sens de l'organisation."
  },
  {
    id: 'second-niveau-auto-entrepreneur',
    titre: 'Nuance utile',
    fichesEntree: ['auto-entrepreneur'],
    corps: "Le statut d'auto-entrepreneur convient bien à une activité qui démarre ou reste modeste, grâce à sa simplicité de gestion, mais devient parfois moins adapté si l'activité se développe fortement, notamment à cause de plafonds propres à ce statut."
  },
  {
    id: 'second-niveau-projet-professionnel',
    titre: 'Nuance utile',
    fichesEntree: ['projet-professionnel'],
    corps: "Un projet professionnel n'a pas besoin d'être totalement défini pour être réel : il peut rester une direction encore approximative, qui se précise progressivement au fil des expériences et des démarches menées."
  },
  {
    id: 'second-niveau-orientation',
    titre: 'Nuance utile',
    fichesEntree: ['orientation'],
    corps: "L'orientation ne se limite pas aux périodes de transition scolaire : elle peut se reposer à tout âge, par exemple après un licenciement, un problème de santé, ou simplement une envie de changement."
  },
  {
    id: 'second-niveau-reorientation-professionnelle',
    titre: 'Exemples concrets',
    fichesEntree: ['reorientation-professionnelle'],
    corps: "Un vendeur en boutique qui devient vendeur en ligne dans le même secteur, ou un aide-soignant qui évolue vers un poste administratif dans le secteur de la santé, illustrent une réorientation : le domaine reste proche, la fonction change."
  },
  {
    id: 'second-niveau-evolution-professionnelle',
    titre: 'Exemples concrets',
    fichesEntree: ['evolution-professionnelle'],
    corps: "Un vendeur qui devient responsable de rayon, ou un technicien qui devient chef d'équipe dans le même secteur, illustrent une évolution professionnelle : la filière reste la même, le niveau de responsabilité change."
  },
  {
    id: 'second-niveau-reorientation-ou-reconversion',
    titre: 'Exemples concrets',
    fichesEntree: ['reorientation-ou-reconversion'],
    corps: "Un cuisinier qui devient pâtissier reste dans le secteur de la restauration : c'est une réorientation. Un cuisinier qui devient plombier change complètement de secteur : c'est une reconversion, qui s'appuie souvent sur une nouvelle formation."
  },
  {
    id: 'second-niveau-reconversion-ou-evolution',
    titre: 'Exemples concrets',
    fichesEntree: ['reconversion-ou-evolution'],
    corps: "Un vendeur qui devient responsable de magasin reste dans le même métier avec plus de responsabilités : c'est une évolution. Un vendeur qui devient soignant change complètement de secteur : c'est une reconversion, qui s'appuie sur une nouvelle formation et des compétences transférables à identifier."
  },
  {
    id: 'second-niveau-ats',
    titre: 'Nuance utile',
    fichesEntree: ['ats'],
    corps: "Un ATS ne rejette pas un CV lui-même : il le classe ou le met en avant selon les mots-clés détectés, ce qui explique pourquoi une candidature peut être moins visible sans être écartée définitivement."
  },
  {
    id: 'second-niveau-soft-skills-ou-hard-skills',
    titre: 'Dans quels cas ?',
    fichesEntree: ['soft-skills-ou-hard-skills'],
    corps: "Une offre d'emploi rédigée dans un style international ou par une grande entreprise emploie plus souvent « hard skills » et « soft skills ». Une offre plus classique, en français, emploie plutôt « savoir-faire » et « savoir-être ». Le contenu recherché reste identique derrière ces deux vocabulaires."
  },
  {
    id: 'second-niveau-rqth-ou-invalidite',
    titre: 'Dans quels cas ?',
    fichesEntree: ['rqth-ou-invalidite'],
    corps: "Une personne dont l'état de santé affecte sa capacité à travailler, mais qui reste en mesure d'exercer un emploi avec un accompagnement adapté, se tourne vers la RQTH. Une personne dont la perte de capacité de travail est plus importante peut être reconnue en invalidité par la Sécurité sociale, ce qui ouvre droit à une pension, les deux reconnaissances pouvant être cumulées."
  },
  {
    id: 'second-niveau-iae',
    titre: 'Nuance utile',
    fichesEntree: ['iae'],
    corps: "L'IAE ne désigne pas une structure précise mais tout un secteur : les SIAE (chantiers d'insertion, entreprises d'insertion, associations intermédiaires, ETTI) en sont les formes concrètes, chacune avec son propre fonctionnement."
  },
  {
    id: 'second-niveau-reseau-pour-emploi',
    titre: 'Pourquoi ça compte',
    fichesEntree: ['reseau-pour-emploi'],
    corps: "Ce partage d'informations entre structures évite à une personne de devoir tout réexpliquer depuis le début si elle change d'interlocuteur, par exemple en passant d'un accompagnement à un autre au fil de son parcours."
  },
  {
    id: 'second-niveau-cip',
    titre: 'Exemples concrets',
    fichesEntree: ['cip'],
    corps: "Un CIP peut exercer en Mission Locale auprès de jeunes, dans une SIAE auprès de personnes en parcours d'insertion, ou dans d'autres structures d'accompagnement : le métier reste le même, seul le public et le cadre changent."
  },
  {
    id: 'second-niveau-plie',
    titre: 'Nuance utile',
    fichesEntree: ['plie'],
    corps: "Un PLIE ne remplace pas les structures existantes (France Travail, Mission Locale, SIAE) : il coordonne leur intervention autour d'une même personne, sur un territoire donné, plutôt que d'ajouter un accompagnement séparé."
  },
  {
    id: 'second-niveau-dialogue-social',
    titre: 'Exemples concrets',
    fichesEntree: ['dialogue-social'],
    corps: "Une négociation annuelle sur les salaires dans une entreprise, une consultation du CSE avant une réorganisation, ou un accord de branche sur les conditions de travail sont des formes concrètes de dialogue social, à des niveaux différents."
  },
  {
    id: 'second-niveau-cse',
    titre: 'Nuance utile',
    fichesEntree: ['cse'],
    corps: "Le CSE n'intervient pas uniquement en cas de conflit : il est consulté régulièrement sur la marche de l'entreprise, même en l'absence de désaccord particulier avec la direction."
  },
  {
    id: 'second-niveau-discrimination-embauche',
    titre: 'Nuance utile',
    fichesEntree: ['discrimination-embauche'],
    corps: "Un employeur reste libre d'écarter une candidature pour des raisons liées aux compétences ou au profil recherché, même si la décision déçoit : la discrimination désigne spécifiquement un motif interdit par la loi, sans lien avec les exigences du poste."
  },
  {
    id: 'second-niveau-portage-salarial',
    titre: 'Exemples concrets',
    fichesEntree: ['portage-salarial'],
    corps: "Une personne qui exerce du conseil, de la formation ou une expertise ponctuelle pour plusieurs clients, sans vouloir gérer elle-même la facturation ou les cotisations, illustre bien l'usage typique du portage salarial."
  },
  {
    id: 'second-niveau-profession-liberale',
    titre: 'Nuance utile',
    fichesEntree: ['profession-liberale'],
    corps: "Une profession libérale peut être réglementée, avec des conditions d'accès précises comme certaines professions de santé ou du droit, ou non réglementée : dans les deux cas, la personne reste seule responsable de son activité, sans lien de subordination."
  },
  {
    id: 'second-niveau-mobilite-internationale',
    titre: 'Par où commencer',
    fichesEntree: ['mobilite-internationale'],
    corps: "Pour être orienté selon votre projet : une structure Info Jeunes (ex-CRIJ), qui porte en France le réseau européen Eurodesk et renseigne sur les programmes, les bourses et les démarches ; un conseiller France Travail (réseau EURES) pour une recherche d'emploi en Europe ; votre Mission Locale si vous avez moins de 26 ans."
  },
  {
    id: 'second-niveau-auto-entrepreneur-portage-liberale',
    titre: 'Dans quels cas ?',
    fichesEntree: ['auto-entrepreneur-portage-liberale'],
    corps: "Une activité modeste ou qui démarre s'oriente souvent vers l'auto-entrepreneuriat, pour sa simplicité. Une activité de conseil ou de mission ponctuelle, quand la personne préfère déléguer la gestion administrative, s'oriente vers le portage salarial. Une activité réglementée ou plus installée, avec une gestion complète assumée par la personne elle-même, correspond davantage à une profession libérale."
  },
  {
    id: 'second-niveau-surendettement',
    titre: 'Nuance utile',
    fichesEntree: ['surendettement'],
    corps: "Déposer un dossier ne fait pas disparaître les dettes du jour au lendemain : la commission met d'abord en place un plan de remboursement adapté aux revenus, et l'effacement total n'intervient que si la situation est jugée irrémédiablement compromise. Pendant toute la procédure, la personne est inscrite au FICP, le fichier des incidents de crédit de la Banque de France, ce qui limite l'accès à de nouveaux crédits mais ne bloque ni les comptes courants ni les revenus. Un montant minimum, le « reste à vivre », est toujours préservé pour les dépenses courantes."
  },
  {
    id: 'second-niveau-assistante-sociale',
    titre: 'Nuance utile',
    fichesEntree: ['assistante-sociale'],
    corps: "L'assistante sociale « de secteur » est généraliste et dépend du lieu d'habitation. Il existe aussi des assistantes sociales spécialisées, rattachées à une institution précise : à l'hôpital, à la CAF, à l'Assurance retraite, à l'Éducation nationale, ou dans certaines entreprises. Pour une difficulté liée à une hospitalisation, à la retraite ou à la scolarité d'un enfant, c'est souvent ce service spécialisé qui est le bon interlocuteur, pas celui du secteur."
  },
  {
    id: 'second-niveau-aides-garde-enfants',
    titre: 'Nuance utile',
    fichesEntree: ['aides-garde-enfants'],
    corps: "L'AGE de France Travail et le complément de mode de garde de la CAF sont deux aides différentes, cumulables. L'AGE est une aide ponctuelle, versée une fois, au moment d'une reprise d'emploi ou d'une entrée en formation. Le complément de mode de garde est une aide mensuelle et durable, liée à l'emploi d'une assistante maternelle ou d'une garde à domicile, versée tant que la situation dure."
  },
  {
    id: 'second-niveau-addictologie',
    titre: 'Nuance utile',
    fichesEntree: ['addictologie'],
    corps: "Venir en parler n'oblige pas à viser l'arrêt total : accompagner une consommation, en réduire les risques ou les dommages est un objectif de soin reconnu, au même titre que le sevrage. Pour les moins de 25 ans et leur entourage, il existe des Consultations Jeunes Consommateurs (CJC), gratuites et confidentielles, souvent hébergées dans les mêmes lieux que les CSAPA mais avec un accueil adapté aux jeunes."
  },
  {
    id: 'second-niveau-illettrisme',
    titre: 'Nuance utile',
    fichesEntree: ['illettrisme'],
    corps: "Trois situations souvent mélangées : l'illettrisme concerne une personne qui a été scolarisée en France mais n'a pas acquis, ou a perdu, une maîtrise suffisante de la lecture et de l'écriture pour le quotidien. L'analphabétisme concerne une personne qui n'a jamais appris à lire et à écrire, dans aucune langue. Le FLE, français langue étrangère, concerne une personne dont la langue maternelle n'est pas le français et qui apprend cette langue. Les réponses proposées ne sont pas les mêmes."
  },
  {
    id: 'second-niveau-casier-judiciaire',
    titre: 'Exemples concrets',
    fichesEntree: ['casier-judiciaire'],
    corps: "Le bulletin n°2 peut être demandé pour certains emplois précis : travail auprès de mineurs ou de personnes vulnérables, métiers de la sécurité, certaines fonctions publiques, professions réglementées. Le bulletin n°3, lui, ne peut être demandé qu'à la personne elle-même. Pour la très grande majorité des emplois, un employeur privé n'a aucun droit d'exiger la communication d'un bulletin."
  },
  {
    id: 'second-niveau-fle',
    titre: 'Exemples concrets',
    fichesEntree: ['fle'],
    corps: "Les niveaux de langue vont de A1, quelques mots et phrases simples, à C2, une maîtrise proche d'un locuteur natif. Pour beaucoup d'emplois, un niveau A2 ou B1 à l'oral suffit à se faire comprendre et à comprendre des consignes ; l'écrit devient déterminant surtout pour les postes qui demandent des comptes rendus, des courriers ou des échanges par messagerie."
  },
  {
    id: 'second-niveau-aide-alimentaire',
    titre: 'Nuance utile',
    fichesEntree: ['aide-alimentaire'],
    corps: "Le colis alimentaire est un dépannage ponctuel, souvent sans condition. L'épicerie sociale et solidaire fonctionne autrement : on y fait ses courses en payant une petite partie du prix, sur une période donnée, ce qui laisse le choix des produits et garde une place à la vie normale. Les deux ne s'adressent pas exactement aux mêmes moments d'un parcours."
  },
  {
    id: 'second-niveau-hebergement-urgence',
    titre: 'Nuance utile',
    fichesEntree: ['hebergement-urgence'],
    corps: "L'hébergement d'urgence est une mise à l'abri immédiate et de courte durée, obtenue en appelant le 115. Il se distingue de l'hébergement d'insertion, plus durable et assorti d'un accompagnement social, et du logement adapté comme une résidence sociale ou une pension de famille. Passer de l'un à l'autre suppose en général une évaluation par un travailleur social et une demande via le SIAO, le service qui coordonne les places sur le département."
  },

  // -- Famille : Conditions de travail --

  {
    id: 'second-niveau-teletravail',
    titre: 'Exemples concrets',
    fichesEntree: ['teletravail'],
    corps: "Le télétravail peut prendre des formes très différentes : un jour fixe par semaine négocié avec un responsable, un rythme alterné (deux jours au bureau, trois à domicile), ou un poste presque entièrement à distance avec des passages ponctuels en entreprise. Un logement peu adapté (espace calme, connexion internet) peut aussi rendre le télétravail plus difficile à mettre en œuvre que prévu."
  },
  {
    id: 'second-niveau-horaires-travail',
    titre: 'Exemples concrets',
    fichesEntree: ['horaires-travail'],
    corps: "Un planning fixe facilite l'organisation personnelle (garde d'enfants, rendez-vous) mais laisse peu de marge en cas d'imprévu. Un planning variable, parfois connu seulement quelques jours à l'avance, peut compliquer cette organisation - c'est un point à clarifier avant d'accepter un poste, par exemple en demandant un exemple concret de planning sur un mois."
  },
  {
    id: 'second-niveau-rythme-travail',
    titre: 'Exemples concrets',
    fichesEntree: ['rythme-travail'],
    corps: "Un poste en ligne de production suit en général un rythme répétitif et cadencé. Un poste polyvalent dans une petite structure peut au contraire mêler accueil, gestion et tâches administratives dans une même journée. Le rythme dépend aussi de la taille de la structure : un grand service a souvent des postes plus spécialisés, une petite équipe demande plus de polyvalence."
  },
  {
    id: 'second-niveau-travail-de-nuit',
    titre: 'Exemples concrets',
    fichesEntree: ['travail-de-nuit'],
    corps: "Les contreparties du travail de nuit (majoration de salaire, jours de repos supplémentaires) ne sont pas les mêmes partout : elles dépendent de la convention collective ou de l'accord d'entreprise applicable. Il est possible de les demander précisément avant de signer un contrat, par exemple en interrogeant le recruteur sur le pourcentage de majoration ou le nombre de jours de repos compensateur."
  },
  {
    id: 'second-niveau-astreintes',
    titre: 'Exemples concrets',
    fichesEntree: ['astreintes'],
    corps: "Concrètement, une astreinte peut ressembler à un week-end où la personne doit rester joignable et à moins de 30 minutes de son lieu de travail, sans être payée comme si elle travaillait, mais en touchant une prime d'astreinte même si aucune intervention n'a lieu. Si une intervention est nécessaire, ce temps-là est alors compté et rémunéré comme du travail effectif."
  },
  {
    id: 'second-niveau-deplacements-professionnels',
    titre: 'Exemples concrets',
    fichesEntree: ['deplacements-professionnels'],
    corps: "Un poste itinérant peut par exemple demander de visiter plusieurs clients dans une journée avec un véhicule de service, ou au contraire un seul grand déplacement par semaine. Les frais de déplacement (carburant, péage, repas) sont en général remboursés selon des règles propres à chaque entreprise - un point à vérifier dès l'entretien plutôt qu'après avoir commencé."
  },
  {
    id: 'second-niveau-port-de-charges',
    titre: 'Exemples concrets',
    fichesEntree: ['port-de-charges'],
    corps: "Une PMSMP (immersion) permet souvent de mesurer concrètement l'effort physique réel d'un poste avant de s'engager, au-delà de ce qu'une offre d'emploi peut en dire. Quand une charge physique pose une difficulté de santé, un aménagement de poste ou un avis de la médecine du travail peuvent être envisagés - ce n'est jamais une question à taire face à un employeur ou un conseiller."
  },
  {
    id: 'second-niveau-environnement-travail',
    titre: 'Exemples concrets',
    fichesEntree: ['environnement-travail'],
    corps: "Un poste en extérieur (jardinage, chantier) expose aux conditions météo mais peut convenir à une personne qui a besoin de grand air ; un poste en open space bruyant peut demander une capacité de concentration différente d'un bureau individuel calme. Une immersion ou une visite du lieu de travail avant d'accepter un poste permet souvent de mieux se projeter que la seule lecture d'une offre."
  },
  {
    id: 'second-niveau-formation-prise-de-poste',
    titre: 'Exemples concrets',
    fichesEntree: ['formation-prise-de-poste'],
    corps: "Demander en entretien « comment se passent les premières semaines pour une nouvelle personne ? » ou « y a-t-il un tuteur ou une formation prévue au démarrage ? » donne des informations concrètes sur ce point, souvent absent d'une offre d'emploi. Un dispositif comme la POEI peut aussi organiser une formation avant même la prise de poste effective."
  },
  {
    id: 'second-niveau-temps-partiel-choisi-ou-subi',
    titre: 'Exemples concrets',
    fichesEntree: ['temps-partiel-choisi-ou-subi'],
    corps: "Un temps partiel choisi peut par exemple correspondre à un parent qui préfère travailler 24h par semaine pour s'organiser autour de la garde d'enfants. Un temps partiel subi correspond plutôt à une personne qui a cherché un temps complet sans en trouver, et qui accepte un contrat de 20h faute de mieux - une situation qu'un conseiller peut prendre en compte dans un accompagnement vers plus d'heures."
  },
  {
    id: 'second-niveau-contact-public',
    titre: 'Exemples concrets',
    fichesEntree: ['contact-public'],
    corps: "Un poste d'accueil ou de vente suppose un contact public quasi permanent, parfois avec des personnes mécontentes à gérer. Un poste en atelier ou en back-office peut au contraire n'avoir aucun contact direct avec le public, tout en impliquant un travail d'équipe important avec des collègues."
  },
  {
    id: 'second-niveau-proximite-domicile-travail',
    titre: 'Exemples concrets',
    fichesEntree: ['proximite-domicile-travail'],
    corps: "Un trajet de 20 minutes en voiture peut représenter plus d'une heure en transports en commun selon la zone - un point à vérifier concrètement avant de refuser ou d'accepter une offre pour ce seul motif. Des aides à la mobilité (financement du permis, réparation de véhicule, solutions de covoiturage) existent pour lever certains freins liés à la distance."
  },
  {
    id: 'second-niveau-erip',
    titre: 'Nuance utile',
    fichesEntree: ['erip'],
    corps: "Un ERIP ne remplace pas France Travail ni la mission locale : c'est un point d'information et d'orientation, ouvert à tous, qui renvoie ensuite vers la structure adaptée. On peut le consulter sans être inscrit nulle part."
  },
  {
    id: 'second-niveau-pait',
    titre: 'Par où commencer',
    fichesEntree: ['pait'],
    corps: "Avant tout engagement, prendre rendez-vous au PAIT de son département : l'entretien est sans condition et ne juge pas le projet. C'est lui qui déclenche l'accès au parcours d'aides, dont la dotation à l'installation."
  },
  {
    id: 'second-niveau-bprea',
    titre: 'Nuance utile',
    fichesEntree: ['bprea'],
    corps: "La capacité professionnelle agricole ne passe pas forcément par le BPREA : un autre diplôme agricole de niveau bac la donne aussi, et un diplôme non agricole de niveau bac peut suffire s'il est complété par une expérience agricole."
  },
  {
    id: 'second-niveau-dnja',
    titre: 'Nuance utile',
    fichesEntree: ['dnja'],
    corps: "Le nom et les règles varient selon la région : DNJA est le nom en Nouvelle-Aquitaine. Ailleurs, l'aide à l'installation peut s'appeler autrement et avoir d'autres montants ou d'autres conditions d'âge."
  },
  {
    id: 'second-niveau-fondation-2eme-chance',
    titre: 'Nuance utile',
    fichesEntree: ['fondation-2eme-chance'],
    corps: "L'aide n'est pas automatique : chaque dossier passe devant un comité, qui peut refuser. Elle vient compléter un plan de financement, pas le remplacer, et suppose un projet déjà construit avec un accompagnement."
  },
  {
    id: 'second-niveau-clause-sociale',
    titre: 'Dans quels cas ?',
    fichesEntree: ['clause-sociale'],
    corps: "Les publics visés varient selon les marchés : demandeurs d'emploi de longue durée, bénéficiaires du RSA, jeunes peu qualifiés, travailleurs handicapés, habitants des quartiers prioritaires. C'est le facilitateur qui vérifie l'éligibilité."
  },
  {
    id: 'second-niveau-facilitateur-clause-sociale',
    titre: 'Exemples concrets',
    fichesEntree: ['facilitateur-clause-sociale'],
    corps: "Sur un chantier de rénovation d'un bailleur social, le facilitateur repère les postes ouvrables aux heures d'insertion, contacte les entreprises, et propose des candidats suivis par France Travail, une mission locale ou une structure d'insertion."
  },
  {
    id: 'second-niveau-maitre-ouvrage-ou-maitre-oeuvre',
    titre: 'Nuance utile',
    fichesEntree: ['maitre-ouvrage-ou-maitre-oeuvre'],
    corps: "Dans une clause sociale, c'est le maître d'ouvrage qui décide de l'inscrire au marché, et le maître d'œuvre qui vérifie, en réunion de chantier, que l'entreprise tient ses engagements, dont les heures d'insertion."
  },
  {
    id: 'second-niveau-clause-sociale-apres-le-marche',
    titre: 'Après la fin du marché',
    fichesEntree: ['clause-sociale', 'facilitateur-clause-sociale'],
    corps: "La bonne exécution de la clause peut encore être vérifiée après la fin du marché : l'acheteur public doit pouvoir en justifier. Les pièces qui le prouvent (bilans du facilitateur, contrats de travail, bulletins de paie des heures d'insertion) sont conservées plusieurs années, en général cinq ans, et jusqu'à dix ans pour un marché de travaux. Si les heures n'ont pas été faites, l'acheteur peut appliquer des pénalités à l'entreprise ; le facilitateur l'alerte quand il constate un manquement."
  }
];
