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
    variantesRecherche: ['contrat court', 'contrat à durée déterminée', 'contrat temporaire', 'contrat avec une date de fin'],
    corps: "Un CDD (contrat à durée déterminée) est un contrat de travail dont la fin est fixée à l'avance, généralement liée à un motif précis comme un remplacement ou un surcroît d'activité. Contrairement à l'intérim, l'employeur qui recrute est aussi celui qui emploie directement.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: "Service-Public.fr, « Conclusion d'un contrat de travail à durée déterminée (CDD) » (page vérifiée le 21 août 2026) et « Fin d'un CDD » (page vérifiée le 22 janvier 2024)", url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F36' },
      lignes: [
        { libelle: "Durée maximale, cas général", valeur: "18 mois, renouvellement compris", categorie: 'duree', peutChanger: true },
        { libelle: "Durée maximale, cas particuliers", valeur: "9 mois (attente d'un salarié recruté en CDI, travaux urgents de sécurité), 24 mois (départ définitif d'un salarié, commande exceptionnelle à l'exportation, travail à l'étranger), 36 mois (contrat de reconversion professionnelle)", categorie: 'duree', peutChanger: true },
        { libelle: "Indemnité de fin de contrat (prime de précarité)", valeur: "au moins 10 % de la rémunération brute totale, 6 % au minimum si une convention collective le prévoit avec des contreparties", categorie: 'pourcent', peutChanger: true }
      ],
      phraseGenerale: "Un CDD a une durée maximale et se termine, en général, par une indemnité de fin de contrat. Les durées et les pourcentages changent selon le motif et la convention collective : vérifiez-les sur la page officielle."
    },
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
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Contrat de travail temporaire (intérim) » (fiche vérifiée le 19 juin 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F11215" },
      lignes: [
        { libelle: "Durée maximale d'une mission, cas courants", valeur: "18 mois, renouvellement compris", categorie: 'duree', peutChanger: true },
        { libelle: "Indemnité de fin de mission", valeur: "au moins 10 % de la rémunération brute totale, sauf règle conventionnelle contraire", categorie: 'pourcent', peutChanger: true },
        { libelle: "Délai de carence entre deux missions sur le même poste", valeur: "un tiers de la durée du contrat précédent s'il a duré 14 jours ou plus, la moitié sinon", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "Une mission d'intérim a une durée maximale et se termine par une indemnité de fin de mission. Les durées et les pourcentages dépendent du motif et de la convention collective : vérifiez-les sur la page officielle."
    },
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
    variantesRecherche: ['stage obligatoire', 'stage en entreprise', 'convention de stage', 'stagiaire'],
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
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Période d'essai » (fiche vérifiée le 12 août 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1643" },
      lignes: [
        { libelle: "CDI, employé ou ouvrier", valeur: "2 mois, 4 mois avec un renouvellement", categorie: 'duree', peutChanger: true },
        { libelle: "CDI, technicien ou agent de maîtrise", valeur: "3 mois, 6 mois avec un renouvellement", categorie: 'duree', peutChanger: true },
        { libelle: "CDI, cadre", valeur: "4 mois, 8 mois avec un renouvellement", categorie: 'duree', peutChanger: true },
        { libelle: "CDD de 6 mois ou moins", valeur: "1 jour par semaine, au maximum 2 semaines", categorie: 'duree', peutChanger: true },
        { libelle: "Prévenance si le salarié rompt", valeur: "24 heures (moins de 8 jours de présence) ou 48 heures (8 jours et plus)", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "La période d'essai n'est pas obligatoire : elle existe seulement si le contrat la prévoit. Sa durée maximale dépend du type de contrat et de la catégorie, et la convention collective peut la raccourcir : vérifiez-la sur la page officielle."
    },
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
    corps: "Pour l'employeur, la période d'essai est le moment où il peut mettre fin au contrat sans suivre la procédure de licenciement, en respectant un délai de prévenance. Sa durée maximale dépend de la catégorie du poste (plus courte pour un poste d'employé, plus longue pour un poste de cadre), et elle peut être renouvelée une fois, à trois conditions : un accord de branche étendu le prévoit, le contrat l'indique clairement et le salarié accepte par écrit. C'est souvent ce qui pousse un employeur à tenter une embauche dans le doute : la période d'essai sert de filet de sécurité pour les deux parties, pas seulement pour la personne recrutée - et ce filet compte d'autant plus que la structure est petite, où une erreur de recrutement se voit tout de suite dans l'organisation du travail. Cette liberté n'est pas totale : une rupture peut être jugée abusive par le conseil de prud'hommes si son motif n'a rien à voir avec les compétences ou la manière de travailler de la personne. Le délai de prévenance s'applique dès que la période d'essai dure au moins une semaine.",
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
    corps: "Le contrat de valorisation de l'expérience (CVE) est un contrat à durée indéterminée créé à titre expérimental, pour une durée limitée, afin d'encourager l'embauche de certains seniors et d'assouplir les conditions de leur départ à la retraite. Il peut être conclu avec un demandeur d'emploi senior, inscrit à France Travail, qui ne peut pas encore bénéficier d'une retraite à taux plein. L'employeur ne peut y mettre fin que par une mise à la retraite, possible seulement quand la personne peut obtenir une retraite à taux plein ; il est alors exonéré d'une contribution patronale spécifique sur l'indemnité de mise à la retraite.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-Public Entreprendre : CDI « valorisation de l\'expérience »', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F39356' },
      lignes: [
        { libelle: 'Texte de création', valeur: 'loi du 24 octobre 2025', categorie: 'ref', peutChanger: true },
        { libelle: "Durée de l'expérimentation", valeur: "jusqu'au 24 octobre 2030", categorie: 'date', peutChanger: true },
        { libelle: 'Âge des personnes concernées', valeur: '60 ans et plus, ou 57 ans si un accord de branche le prévoit', categorie: 'seuil', peutChanger: true },
        { libelle: "Exonération pour l'employeur", valeur: 'contribution patronale spécifique de 40 % sur l’indemnité de mise à la retraite, pour les ruptures qui interviennent jusqu’au 31 décembre 2028', categorie: 'pourcent', peutChanger: true }
      ]
    },
    relations: [
      { ficheId: 'cdi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'temps-partiel', titre: 'Temps partiel', titreDeTri: 'Temps partiel', type: 'terme',
    univers: 'contrats-statuts-emploi', registres: ['langage-rh'],
    variantesRecherche: ['mi-temps', 'moins de 35 heures', 'quelques heures par semaine'],
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
    variantesRecherche: ['salaire avant impôts', 'salaire avant cotisations', 'montant brut', 'salaire brut mensuel'],
    corps: "Le salaire brut est le montant du salaire avant que les cotisations sociales et l'impôt ne soient retirés. C'est le montant qui apparaît généralement en premier sur un bulletin de salaire.",
    relations: [
      { ficheId: 'salaire-net', type: 'a-ne-pas-confondre' }, { ficheId: 'bulletin-salaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'salaire-net', titre: 'Salaire net', titreDeTri: 'Salaire net', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif', 'langage-rh'],
    variantesRecherche: ['salaire reçu', 'salaire après impôts', 'ce que je touche', 'salaire versé'],
    corps: "Le salaire net est le montant du salaire une fois les cotisations sociales et l'impôt retirés : la plupart du temps, le montant réellement versé sur le compte bancaire.",
    relations: [
      { ficheId: 'salaire-brut', type: 'a-ne-pas-confondre' }, { ficheId: 'bulletin-salaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'smic', titre: 'Smic (salaire minimum)', titreDeTri: 'Smic', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif', 'langage-rh'],
    variantesRecherche: ['salaire minimum', 'salaire minimum de croissance', 'hausse du Smic', 'revalorisation du Smic'],
    corps: "Le Smic (salaire minimum interprofessionnel de croissance) est le salaire horaire le plus bas qu'un employeur a le droit de verser à une personne salariée en France : en dessous, ce n'est pas légal. Il est revalorisé chaque année au début de janvier, et aussi en cours d'année quand les prix montent trop vite. Le montant le plus souvent cité est le Smic brut, avant le retrait des cotisations : le montant net, reçu sur le compte, est plus bas. Certaines règles, comme le cumul emploi-retraite ou la réduction des cotisations patronales (RGDU), gardent la valeur du Smic de janvier même après une hausse en cours d'année : la source officielle de chaque règle dit laquelle est retenue.",
    detailsAJour: {
      verifieLe: '2026-11-05',
      source: { nom: 'Service-public.gouv.fr, fiche « Salaire minimum interprofessionnel de croissance (Smic) » (vérifiée par la page le 1er juin 2026)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2300' },
      lignes: [
        { libelle: 'Smic horaire brut', valeur: '12,31 € depuis le 1er juin 2026', categorie: 'montant', peutChanger: true },
        { libelle: 'Smic mensuel brut (35 heures par semaine)', valeur: '1 867,02 €', categorie: 'montant', peutChanger: true },
        { libelle: 'Smic mensuel net, à titre indicatif', valeur: '1 477,93 €', categorie: 'montant', peutChanger: true },
        { libelle: 'Dernière revalorisation', valeur: '+ 2,41 % le 1er juin 2026 (arrêté du 22 mai 2026), automatique car les prix ont monté d\'au moins 2 %', categorie: 'pourcent', peutChanger: true },
        { libelle: 'Avant cette hausse (1er janvier 2026)', valeur: '12,02 € de l\'heure, 1 823,03 € par mois brut', categorie: 'montant', peutChanger: true },
        { libelle: 'Règles qui gardent le Smic de janvier', valeur: 'cumul emploi-retraite, RGDU', categorie: 'seuil', peutChanger: true }
      ],
      phraseGenerale: "Le Smic est le salaire horaire minimum légal en France. Il est revalorisé au moins une fois par an, et en cours d'année quand les prix montent trop vite. Son montant change régulièrement : consultez la source officielle."
    },
    relations: [
      { ficheId: 'salaire-brut', type: 'voir-aussi' }, { ficheId: 'inflation', type: 'voir-aussi' }, { ficheId: 'rgdu', type: 'voir-aussi' }
    ]
  },
  {
    id: 'inflation', titre: 'Inflation', titreDeTri: 'Inflation', type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif'],
    variantesRecherche: ['hausse des prix', 'vie chère', 'pouvoir d\'achat', 'coût de la vie'],
    corps: "L'inflation est la hausse générale des prix des biens et des services : avec la même somme d'argent, on peut acheter un peu moins de choses qu'avant. En France, l'Insee la mesure chaque mois avec l'indice des prix à la consommation : il suit un grand panier de produits et de services, relevés mois après mois, chacun compté selon son poids dans les dépenses des ménages, et compare avec un an plus tôt. Elle monte, par exemple, quand le prix du pétrole ou celui de produits alimentaires frais augmente (à cause du climat ou de tensions dans le monde), ou quand une taxe est relevée. Elle ralentit quand les cours internationaux des matières premières baissent. Elle sert de repère pour revaloriser certains montants, comme le Smic, certaines pensions ou les loyers.",
    detailsAJour: {
      verifieLe: '2026-11-05',
      source: { nom: 'Insee, Informations rapides n° 266 : prix à la consommation, octobre 2026 (estimation provisoire publiée le 30 octobre 2026)', url: 'https://www.insee.fr/fr/statistiques/9107965' },
      lignes: [
        { libelle: 'Inflation sur un an, octobre 2026 (estimation provisoire)', valeur: '+ 3,4 % (septembre 2026 : + 3,1 %)', categorie: 'pourcent', peutChanger: true },
        { libelle: 'Énergie sur un an', valeur: '+ 24,1 %', categorie: 'pourcent', peutChanger: true },
        { libelle: 'Alimentation sur un an', valeur: '+ 1,2 %', categorie: 'pourcent', peutChanger: true },
        { libelle: 'Services sur un an', valeur: '+ 2,7 %', categorie: 'pourcent', peutChanger: true },
        { libelle: 'Prochaine publication de l\'Insee', valeur: '27 novembre 2026 (résultats définitifs d\'octobre : 13 novembre 2026)', categorie: 'date', peutChanger: true }
      ],
      phraseGenerale: "L'inflation est la hausse générale des prix. L'Insee publie son chiffre chaque mois : consultez la source officielle pour le taux le plus récent."
    },
    relations: [
      { ficheId: 'smic', type: 'voir-aussi' }, { ficheId: 'salaire-net', type: 'voir-aussi' }
    ]
  },
  {
    id: 'bulletin-salaire', titre: 'Comment lire son bulletin de salaire', titreDeTri: 'Bulletin de salaire',
    type: 'notion', gabarit: 'grille-lecture', univers: 'bulletin-salaire', registres: ['langage-administratif'],
    variantesRecherche: ['fiche de paie', 'bulletin de paie', 'feuille de paie', 'fiche de salaire'],
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
    corps: "Une prime est une somme versée en plus du salaire de base, liée à une occasion précise : une performance, un objectif atteint, une période de l'année, entre autres. Contrairement au salaire de base, son versement n'est pas systématique : elle peut varier ou disparaître d' à l'autre selon ce qui la déclenche.",
    detailsAJour: {
      verifieLe: '2026-10-29',
      source: { nom: 'www.service-public.gouv.fr', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2301?lang=fr' },
      lignes: [
        { libelle: 'Prime de fin d’année', valeur: 'un mois', categorie: 'duree', peutChanger: true }
      ]
    },
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
    variantesRecherche: ['différence entre CDD et intérim', 'comparer CDD et intérim'],
    corps: "Ce qui les rapproche : dans les deux cas, le contrat a une fin prévue à l'avance, généralement liée à un motif précis. Ce qui les distingue : en CDD, l'employeur qui recrute est aussi celui qui emploie directement. En intérim, une agence de travail temporaire est l'employeur officiel, qui met la personne à disposition d'une entreprise cliente le temps de la mission.",
    relations: [
      { ficheId: 'cdi', type: 'voir-aussi' }, { ficheId: 'cdd', type: 'voir-aussi' }, { ficheId: 'interim', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cdi-ou-cdd', titre: 'CDI ou CDD ?', titreDeTri: 'CDI ou CDD',
    type: 'notion', gabarit: 'comparatif', univers: 'contrats-statuts-emploi', registres: [],
    variantesRecherche: ['différence entre CDI et CDD', 'comparer CDI et CDD'],
    corps: "Ce qui les rapproche : dans les deux cas, un contrat de travail lie directement l'employeur et le salarié, avec les mêmes droits de base. Ce qui les distingue : un CDI n'a pas de date de fin prévue à l'avance, un CDD en a toujours une, liée à un motif précis.",
    relations: [
      { ficheId: 'cdd-ou-interim', type: 'voir-aussi' }
    ]
  },
  {
    id: 'stage-ou-pmsmp', titre: 'Stage ou PMSMP ?', titreDeTri: 'Stage ou PMSMP',
    type: 'notion', gabarit: 'comparatif', univers: 'contrats-statuts-emploi', registres: [],
    variantesRecherche: ['différence entre Stage et PMSMP', 'comparer Stage et PMSMP'],
    corps: "Ce qui les rapproche : dans les deux cas, la personne passe du temps dans une entreprise sans être liée par un contrat de travail avec elle. Ce qui les distingue : un stage s'inscrit dans un cursus de formation, encadré par une convention de stage. Une PMSMP s'inscrit dans un accompagnement vers l'emploi, encadrée par la structure qui suit la personne.",
    relations: [
      { ficheId: 'stage', type: 'voir-aussi' }, { ficheId: 'pmsmp', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Accompagnement et insertion --

  {
    id: 'diagnostic-partage', titre: 'Diagnostic partagé', titreDeTri: 'Diagnostic partagé', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['faire le point avec mon conseiller', 'faire un bilan de situation', 'point sur ma situation'],
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
    variantesRecherche: ['mes chances de trouver un emploi', 'être employable', 'trouver du travail facilement'],
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
    variantesRecherche: ['travailler en autonomie', 'être autonome', 'autonome en poste'],
    corps: "Quand un employeur recherche une personne \"autonome\", il veut dire qu'il n'aura pas la disponibilité pour donner des consignes détaillées à chaque tâche : il attend qu'elle sache organiser son travail et prendre de petites décisions seule, dans un cadre déjà donné.",
    relations: [
      { ficheId: 'parlez-moi-de-vous', type: 'voir-aussi' }, { ficheId: 'esprit-equipe', type: 'voir-aussi' }, { ficheId: 'force-proposition', type: 'voir-aussi' }
    ]
  },
  {
    id: 'parlez-moi-de-vous', titre: 'Pourquoi on vous demande "parlez-moi de vous" ?', titreDeTri: 'Parlez-moi de vous',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh', 'langage-employeur'],
    variantesRecherche: ['présentez-vous', 'se présenter en entretien', 'question de présentation'],
    corps: "Cette question n'attend pas un résumé complet de votre vie : le recruteur cherche à comprendre ce que vous jugez important de mettre en avant, et si vous voyez le lien entre votre parcours et le poste visé.",
    relations: [
      { ficheId: 'autonomie', type: 'voir-aussi' }
    ]
  },
  {
    id: 'savoir-etre', titre: 'Que veut dire "savoir-être" ?', titreDeTri: 'Savoir-être',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['comportement au travail', 'qualités humaines', 'qualités personnelles', 'attitude professionnelle'],
    corps: "Le savoir-être désigne la manière dont une personne se comporte et interagit dans un cadre professionnel : la façon de communiquer, de réagir à une consigne, de travailler avec d'autres. C'est ce qu'un employeur observe au-delà des compétences techniques précises.",
    relations: [
      { ficheId: 'savoir-faire', type: 'a-ne-pas-confondre' }, { ficheId: 'esprit-equipe', type: 'voir-aussi' }, { ficheId: 'prouver-une-competence', type: 'voir-aussi' }
    ]
  },
  {
    id: 'savoir-faire', titre: 'Que veut dire "savoir-faire" ?', titreDeTri: 'Savoir-faire',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['compétences techniques', 'compétences pratiques', 'savoir faire un métier'],
    corps: "Le savoir-faire désigne les compétences techniques concrètes qu'une personne sait mettre en œuvre dans son métier, acquises par la formation ou l'expérience. C'est ce qu'un employeur cherche à vérifier à travers un CV ou une mise en situation.",
    relations: [
      { ficheId: 'savoir-etre', type: 'a-ne-pas-confondre' }, { ficheId: 'rigueur', type: 'voir-aussi' }, { ficheId: 'savoirs-connaissances', type: 'voir-aussi' }
    ]
  },
  {
    id: 'savoirs-connaissances', titre: 'Que veut dire "savoirs" (ce que l\'on connaît) ?', titreDeTri: 'Savoirs',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['connaissances', 'ce que je connais'],
    corps: "Les savoirs, ce sont les connaissances qu'une personne possède : des règles, des produits, des procédures, un logiciel, une langue. On les distingue du savoir-faire (ce que l'on sait faire avec ses mains ou son outil) et du savoir-être (la façon de travailler). Un savoir se montre par ce que l'on en dit ou par l'usage qu'on en fait : par exemple, lire des notices en anglais ou connaître les consignes de sécurité d'un entrepôt.",
    relations: [
      { ficheId: 'savoir-faire', type: 'a-ne-pas-confondre' }, { ficheId: 'savoir-etre', type: 'a-ne-pas-confondre' }, { ficheId: 'prouver-une-competence', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prouver-une-competence', titre: 'Comment prouver une compétence ?', titreDeTri: 'Prouver une compétence',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh', 'langage-employeur'],
    variantesRecherche: ['défendre une compétence', 'expliquer ce que je sais faire', 'se présenter à l\'oral'],
    corps: "Dire qu'on sait faire quelque chose ne suffit pas toujours : un recruteur aime entendre un fait. Pour prouver une compétence, on dit où on l'a exercée, ce qu'on faisait concrètement et, si on le peut, pendant combien de temps. Une phrase courte et vraie vaut mieux qu'un mot brillant : « pendant plusieurs années, j'ai préparé les colis de la journée dans les délais » en dit plus que « je suis rigoureux ». Une lettre de recommandation ou le récit d'une situation précise renforcent aussi la preuve.",
    relations: [
      { ficheId: 'savoir-faire', type: 'voir-aussi' }, { ficheId: 'savoirs-connaissances', type: 'voir-aussi' }, { ficheId: 'savoir-etre', type: 'voir-aussi' }
    ]
  },
  {
    id: 'esprit-equipe', titre: 'Que veut dire "esprit d\'équipe" dans une offre d\'emploi ?', titreDeTri: "Esprit d'équipe",
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh', 'langage-employeur'],
    variantesRecherche: ['travailler en équipe', "bien s'entendre avec ses collègues", 'collaborer avec les collègues'],
    corps: "Quand un employeur mentionne l'esprit d'équipe, il veut dire qu'il attend une personne capable de collaborer, de partager des informations utiles et de s'ajuster aux autres membres d'un groupe de travail, plutôt que de fonctionner uniquement seule.",
    relations: [
      { ficheId: 'savoir-etre', type: 'voir-aussi' }, { ficheId: 'autonomie', type: 'voir-aussi' }
    ]
  },
  {
    id: 'force-proposition', titre: 'Que veut dire "être force de proposition" ?', titreDeTri: 'Force de proposition',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh', 'langage-employeur'],
    variantesRecherche: ['avoir des idées', 'proposer des améliorations', 'prendre des initiatives'],
    corps: "Être force de proposition signifie qu'un employeur attend qu'une personne suggère elle-même des idées ou des améliorations, plutôt que d'attendre uniquement des consignes avant d'agir. Ça suppose une certaine familiarité avec le poste, pas nécessairement dès le premier jour.",
    relations: [
      { ficheId: 'autonomie', type: 'voir-aussi' }, { ficheId: 'esprit-equipe', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rigueur', titre: 'Que veut dire "rigueur" dans une offre d\'emploi ?', titreDeTri: 'Rigueur',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh', 'langage-employeur'],
    variantesRecherche: ['faire attention aux détails', 'être rigoureux', 'être minutieux'],
    corps: "Quand un employeur recherche de la rigueur, il attend une personne qui respecte les procédures, vérifie son travail et limite les erreurs, en particulier sur des tâches répétitives ou précises.",
    relations: [
      { ficheId: 'savoir-faire', type: 'voir-aussi' }, { ficheId: 'autonomie', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cv-lecture-recruteur', titre: 'Ce que regarde un recruteur sur un CV', titreDeTri: 'CV, lecture par un recruteur',
    type: 'notion', gabarit: 'decryptage', univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['ce qui compte sur un CV', 'comment un recruteur lit mon CV', "ce qu'un recruteur regarde en premier"],
    corps: "Un recruteur repère d'abord les informations qui lui permettent de vérifier rapidement l'adéquation avec le poste : intitulés de postes précédents, durée des expériences, compétences citées explicitement. Un CV mal structuré peut faire perdre ces informations même quand le contenu est solide.",
    relations: [
      { ficheId: 'lettre-motivation', type: 'voir-aussi' }, { ficheId: 'savoir-faire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'lettre-motivation', titre: 'Comment lire une lettre de motivation', titreDeTri: 'Lettre de motivation',
    type: 'notion', gabarit: 'grille-lecture', univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['lettre de motiv', 'lettre de candidature', 'écrire à un employeur'],
    corps: "Une lettre de motivation présente en général le lien entre la personne et le poste visé, une ou deux raisons concrètes de candidater, puis une ouverture vers un échange à venir. Elle complète le CV sans jamais le répéter à l'identique.",
    relations: [
      { ficheId: 'cv-lecture-recruteur', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Structures et organismes --

  {
    id: 'france-travail', titre: 'Le rôle de France Travail', titreDeTri: 'France Travail',
    type: 'notion', gabarit: 'role', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['Pôle emploi', "s'inscrire au chômage", 'ANPE', "demandeur d'emploi"],
    corps: "France Travail (anciennement Pôle emploi) est l'organisme chargé d'accompagner les personnes en recherche d'emploi, notamment en les mettant en lien avec des offres et des dispositifs comme la PMSMP. C'est aussi l'un des organismes pouvant verser des allocations aux personnes qui y ont droit.",
    relations: [
      { ficheId: 'pmsmp', type: 'voir-aussi' }, { ficheId: 'diagnostic-partage', type: 'voir-aussi' }, { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'mission-locale', titre: 'Le rôle de la Mission Locale', titreDeTri: 'Mission Locale',
    type: 'notion', gabarit: 'role', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['aide pour les jeunes', 'jeunes de 16 à 25 ans', 'conseiller jeunesse'],
    corps: "Une Mission Locale accompagne spécifiquement les jeunes dans leur insertion professionnelle et sociale, avec un accompagnement souvent plus large que la seule recherche d'emploi (logement, santé, mobilité...). Chaque Mission Locale couvre un territoire précis.",
    relations: [
      { ficheId: 'france-travail', type: 'a-ne-pas-confondre' }, { ficheId: 'diagnostic-partage', type: 'voir-aussi' },
      { ficheId: 'fonds-d-aide-aux-jeunes', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cap-emploi', titre: 'Le rôle de Cap Emploi', titreDeTri: 'Cap Emploi',
    type: 'notion', gabarit: 'role', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['emploi et handicap', 'accompagnement handicap et emploi', 'travailleur handicapé et emploi'],
    corps: "Cap Emploi accompagne spécifiquement les personnes en situation de handicap dans leur recherche d'emploi et leur maintien en poste, en lien avec les employeurs et les autres structures d'accompagnement.",
    relations: [
      { ficheId: 'france-travail', type: 'a-ne-pas-confondre' }, { ficheId: 'rqth', type: 'voir-aussi' }, { ficheId: 'mission-locale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'caf', titre: 'CAF', titreDeTri: 'CAF', type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ["Caisse d'allocations familiales", 'allocations familiales', 'aides au logement'],
    corps: "La CAF (Caisse d'allocations familiales) verse des aides liées à la famille, au logement ou à certaines situations de précarité, selon la situation de chaque personne. C'est un organisme distinct de ceux qui accompagnent la recherche d'emploi.",
    relations: [
      { ficheId: 'france-travail', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Insertion par l'activité économique (IAE / SIAE) --

  {
    id: 'siae', titre: "Les structures de l'insertion par l'activité économique (SIAE)", titreDeTri: 'SIAE',
    type: 'notion', gabarit: 'role', univers: 'structures-organismes', registres: [],
    variantesRecherche: ["structure d'insertion", "parcours d'insertion", "contrat d'insertion en structure"],
    corps: "Une SIAE (structure de l'insertion par l'activité économique) propose un emploi encadré à des personnes qui rencontrent des difficultés particulières pour accéder au marché du travail classique, le temps de retrouver des repères professionnels. Ce terme regroupe plusieurs formes concrètes de structures, chacune avec son propre fonctionnement.",
    relations: [
      { ficheId: 'aci', type: 'voir-aussi' }, { ficheId: 'ei', type: 'voir-aussi' }, { ficheId: 'geiq', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aci', titre: "Chantier d'insertion (ACI)", titreDeTri: "Chantier d'insertion", type: 'terme',
    univers: 'structures-organismes', registres: [], variantesRecherche: ["atelier et chantier d'insertion", 'chantier insertion'],
    corps: "Un chantier d'insertion (ACI, atelier et chantier d'insertion) est une structure qui emploie des personnes en parcours d'insertion sur des activités concrètes, souvent liées à l'environnement ou au bâtiment, tout en les accompagnant vers un emploi durable. C'est l'une des formes de SIAE.",
    relations: [
      { ficheId: 'ei', type: 'a-ne-pas-confondre' }, { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ei', titre: "Entreprise d'insertion (EI)", titreDeTri: "Entreprise d'insertion", type: 'terme',
    univers: 'structures-organismes', registres: [], variantesRecherche: ["entreprise qui fait de l'insertion", "emploi en entreprise d'insertion"],
    corps: "Une entreprise d'insertion (EI) est une entreprise à part entière, qui produit et vend des biens ou des services comme n'importe quelle autre, tout en employant en priorité des personnes en parcours d'insertion. C'est l'une des formes de SIAE.",
    relations: [
      { ficheId: 'aci', type: 'a-ne-pas-confondre' }, { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ai', titre: 'Association intermédiaire (AI)', titreDeTri: 'Association intermédiaire', type: 'terme',
    univers: 'structures-organismes', registres: [], variantesRecherche: ['petits travaux chez les particuliers', 'mise à disposition en insertion'],
    corps: "Une association intermédiaire (AI) met à disposition de particuliers, d'associations ou d'entreprises des personnes en parcours d'insertion, pour des missions ponctuelles. C'est l'une des formes de SIAE, plus souple qu'un contrat classique.",
    relations: [
      { ficheId: 'etti', type: 'a-ne-pas-confondre' }, { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'etti', titre: 'ETTI', titreDeTri: 'ETTI', type: 'terme',
    univers: 'structures-organismes', registres: [], variantesRecherche: ["intérim d'insertion", "entreprise de travail temporaire d'insertion", 'intérim insertion'],
    corps: "Une ETTI (entreprise de travail temporaire d'insertion) fonctionne comme une agence d'intérim classique, mais met à disposition des entreprises clientes des personnes en parcours d'insertion. C'est l'une des formes de SIAE.",
    relations: [
      { ficheId: 'ai', type: 'a-ne-pas-confondre' }, { ficheId: 'interim', type: 'a-ne-pas-confondre' }, { ficheId: 'siae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'geiq', titre: "GEIQ (groupement d'employeurs pour l'insertion et la qualification)", titreDeTri: 'GEIQ',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['GIEQ', "groupement d'employeurs insertion qualification", "embauché par un groupement d'employeurs"],
    corps: "Un GEIQ (groupement d'employeurs pour l'insertion et la qualification) est une association indépendante, pilotée et gérée par des entreprises mobilisées pour favoriser l'insertion des personnes et le recrutement. Le GEIQ embauche une personne éloignée de l'emploi en contrat d'alternance (apprentissage ou professionnalisation), l'accompagne, et la met à disposition d'une ou plusieurs entreprises adhérentes à tour de rôle. Chaque GEIQ construit avec ses entreprises des parcours de formation en alternance qui visent une qualification.",
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
      { ficheId: 'france-vae', type: 'voir-aussi' },
      { ficheId: 'qualiopi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aref-ou-rfft', titre: 'AREF ou RFFT ?', titreDeTri: 'AREF ou RFFT',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: ['langage-france-travail', 'langage-administratif'],
    variantesRecherche: ['RFPE', 'rémunération formation demandeur emploi', 'comment je suis payé pendant une formation'],
    corps: "Ce qui les rapproche : les deux permettent d'être rémunéré pendant une formation validée par France Travail. Ce qui les distingue : l'AREF (allocation de retour à l'emploi formation) prolonge l'allocation chômage, au même montant brut, pour une personne qui a encore des droits ouverts. La RFPE (rémunération de formation de France Travail) prend le relais pour une personne qui n'a plus ou pas de droits à l'allocation chômage. Dans les deux cas, la formation doit être validée par le conseiller avant de commencer, jamais après coup.",
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
    variantesRecherche: ['reconnaissance handicap', 'travailleur handicapé', 'reconnaissance de la qualité de travailleur handicapé'],
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
    corps: "Un arrêt de travail, prescrit par un médecin, suspend le contrat pendant une maladie ou un accident. Depuis le 1er septembre 2026, un décret plafonne sa durée : 31 jours pour un arrêt initial, 62 jours pour chaque prolongation, sauf si le médecin justifie d'aller au-delà. Pour les arrêts prescrits à partir du 15 octobre 2026, la durée maximale d'indemnisation passe de trois ans à un an pour certains arrêts de plus de six mois dont les soins ne sont pas pris en charge à 100 % ; les affections de longue durée prises en charge à 100 % gardent trois ans. Pendant cette période, la Sécurité sociale (CPAM ou MSA) verse des indemnités journalières (IJ), qui ne remplacent qu'une partie du salaire, après un délai de carence de quelques jours ; l'employeur peut compléter selon la convention collective ou l'ancienneté. Un arrêt qui se prolonge peut déboucher, selon la situation, sur une visite de reprise, un aménagement de poste, ou l'examen d'une pension d'invalidité si la capacité de travail reste durablement réduite.",
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
    relations: [
      { ficheId: 'rqth', type: 'voir-aussi' },
      { ficheId: 'agefiph', type: 'voir-aussi' },
      { ficheId: 'cap-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aptitude-ou-inaptitude', titre: 'Aptitude ou inaptitude ?', titreDeTri: 'Aptitude ou inaptitude',
    type: 'notion', gabarit: 'comparatif', univers: 'sante-travail', registres: ['langage-administratif'],
    variantesRecherche: ['différence entre Aptitude et inaptitude', 'comparer Aptitude et inaptitude'],
    corps: "Ce qui les rapproche : les deux sont des avis rendus par la médecine du travail sur la compatibilité entre l'état de santé d'une personne et son poste. Ce qui les distingue : l'aptitude confirme que le poste reste compatible, avec ou sans aménagement. L'inaptitude signifie que le poste, tel qu'il est, n'est plus compatible avec l'état de santé de la personne, ce qui ouvre alors une recherche de solution (aménagement ou autre poste), jamais une fin en soi.",
    relations: [
      { ficheId: 'medecine-travail', type: 'voir-aussi' }, { ficheId: 'amenagement-poste', type: 'voir-aussi' },
      { ficheId: 'visite-d-information-et-de-prevention', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prime-ou-indemnite', titre: 'Prime ou indemnité ?', titreDeTri: 'Prime ou indemnité',
    type: 'notion', gabarit: 'comparatif', univers: 'bulletin-salaire', registres: ['langage-rh'],
    variantesRecherche: ['différence entre Prime et indemnité', 'comparer Prime et indemnité'],
    corps: "Ce qui les rapproche : les deux sont des sommes versées en plus du salaire de base. Ce qui les distingue : une prime valorise quelque chose (une performance, une fidélité, un moment particulier). Une indemnité compense une situation ou une dépense réelle (un trajet, un repas, une fin de contrat). La première récompense, la seconde compense.",
    relations: [
      { ficheId: 'primes', type: 'voir-aussi' }, { ficheId: 'indemnites', type: 'voir-aussi' }
    ]
  },
  {
    id: 'savoir-etre-ou-savoir-faire', titre: 'Savoir-être ou savoir-faire ?', titreDeTri: 'Savoir-être ou savoir-faire',
    type: 'notion', gabarit: 'comparatif', univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['différence entre Savoir-être et savoir-faire', 'comparer Savoir-être et savoir-faire'],
    corps: "Ce qui les rapproche : les deux sont recherchés par un employeur au moment du recrutement. Ce qui les distingue : le savoir-faire se démontre par des compétences techniques concrètes, souvent vérifiables par un diplôme ou une réalisation. Le savoir-être se remarque dans le comportement au quotidien (la communication, la réaction à une consigne, le travail avec les autres) et se juge davantage sur la durée.",
    relations: [
      { ficheId: 'savoir-etre', type: 'voir-aussi' }, { ficheId: 'savoir-faire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cpf-ou-vae', titre: 'CPF ou VAE ?', titreDeTri: 'CPF ou VAE',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ['différence entre CPF et VAE', 'comparer CPF et VAE'],
    corps: "Ce qui les rapproche : les deux sont des moyens de faire progresser son parcours professionnel en dehors d'un cursus de formation initiale. Ce qui les distingue : le CPF finance une formation à suivre. La VAE ne finance aucune formation : elle fait reconnaître officiellement des compétences déjà acquises par l'expérience, sans avoir besoin de suivre un nouveau parcours de formation.",
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' }, { ficheId: 'vae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'francetravail-missionlocale-capemploi', titre: 'France Travail, Mission Locale ou Cap Emploi ?', titreDeTri: 'France Travail, Mission Locale ou Cap Emploi',
    type: 'notion', gabarit: 'comparatif', univers: 'structures-organismes', registres: [],
    variantesRecherche: ['différence entre France Travail, Mission Locale et Cap Emploi', "quelle structure choisir pour l'emploi"],
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
    relations: [
      { ficheId: 'france-services', type: 'voir-aussi' },
      { ficheId: 'tiers-de-confiance-numerique', type: 'voir-aussi' },
      { ficheId: 'illectronisme', type: 'voir-aussi' }
    ]
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
    variantesRecherche: ['parcours mission locale jeunes', "parcours contractualisé d'accompagnement", "accompagnement vers l'emploi et l'autonomie"],
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
    variantesRecherche: ['certificat de qualification', 'certificat de qualification professionnelle', 'qualification de branche'],
    corps: "Un CQP (certificat de qualification professionnelle) est une certification créée et reconnue par une branche professionnelle précise, pour valider des compétences propres à un métier de ce secteur. Contrairement à un diplôme national, sa reconnaissance peut être plus limitée en dehors de cette branche.",
    relations: [
      { ficheId: 'titre-professionnel', type: 'voir-aussi' },
      { ficheId: 'rncp-ou-cqp', type: 'voir-aussi' },
      { ficheId: 'certification', type: 'voir-aussi' }
    ]
  },
  {
    id: 'titre-professionnel', titre: 'Titre professionnel', titreDeTri: 'Titre professionnel', type: 'terme',
    univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ['titre pro', "diplôme de l'État pour l'emploi", 'bloc de compétences'],
    corps: "Un titre professionnel est une certification délivrée par l'État, organisée autour de blocs de compétences (appelés CCP) correspondant chacun à une partie du métier visé. Il peut être obtenu par une formation ou par la validation des acquis de l'expérience.",
    relations: [
      { ficheId: 'vae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'certification', titre: 'Certification', titreDeTri: 'Certification', type: 'terme',
    univers: 'formation', registres: ['langage-rh', 'langage-administratif'],
    variantesRecherche: ['être certifié', 'certificat professionnel', 'attestation de compétences', 'faire reconnaître ses compétences'],
    corps: "Une certification atteste officiellement qu'une personne maîtrise des compétences précises, à un moment donné. Elle peut prendre différentes formes (diplôme, titre professionnel, CQP, entre autres) selon qui la délivre et dans quel cadre.",
    relations: [
      { ficheId: 'qualification', type: 'voir-aussi' }, { ficheId: 'caces', type: 'voir-aussi' }
    ]
  },
  {
    id: 'qualification', titre: 'Qualification', titreDeTri: 'Qualification', type: 'terme',
    univers: 'formation', registres: ['langage-rh'],
    variantesRecherche: ['être qualifié pour un poste', 'niveau de qualification', 'avoir une qualification', 'personne qualifiée'],
    corps: "La qualification désigne le niveau de compétence reconnu à une personne pour occuper un poste, reposant sur une combinaison de formation, de certification et d'expérience. Elle influence notamment le classement et la rémunération prévus par une convention collective.",
    relations: [
      { ficheId: 'certification', type: 'voir-aussi' },
      { ficheId: 'diplome-titre-certification', type: 'voir-aussi' },
      { ficheId: 'vae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'formation-qualifiante-ou-certifiante', titre: 'Formation qualifiante ou certifiante ?', titreDeTri: 'Formation qualifiante ou certifiante',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: [],
    variantesRecherche: ['différence entre Formation qualifiante et certifiante', 'comparer Formation qualifiante et certifiante'],
    corps: "Ce qui les rapproche : les deux visent à faire progresser une personne dans son parcours professionnel. Ce qui les distingue : une formation qualifiante développe des compétences reconnues sur le marché du travail, sans forcément déboucher sur un diplôme ou un titre officiel. Une formation certifiante se conclut par l'obtention d'une certification reconnue (diplôme, titre professionnel, CQP).",
    relations: [
      { ficheId: 'certification', type: 'voir-aussi' }, { ficheId: 'medecine-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rncp-ou-cqp', titre: 'RNCP ou CQP ?', titreDeTri: 'RNCP ou CQP',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: [],
    variantesRecherche: ['différence entre RNCP et CQP', 'comparer RNCP et CQP'],
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
    variantesRecherche: ['différence entre RNCP et RS', 'comparer RNCP et RS'],
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
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: "Service-Public.fr, « Compte personnel de formation (CPF) » (page vérifiée le 27 juin 2026)", url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F10705' },
      lignes: [
        { libelle: "Certification du répertoire spécifique (hors CléA)", valeur: "1 500 € au maximum", categorie: 'montant', peutChanger: true },
        { libelle: "Bilan de compétences", valeur: "1 600 € au maximum", categorie: 'montant', peutChanger: true },
        { libelle: "Permis de conduire du groupe léger (A1, A2, B, B1, BE)", valeur: "900 € au maximum", categorie: 'montant', peutChanger: true },
        { libelle: "Participation forfaitaire à la charge du titulaire", valeur: "150 €, revalorisée chaque 1er janvier", categorie: 'montant', peutChanger: true }
      ],
      phraseGenerale: "Le CPF est plafonné pour certaines formations, et une participation reste à la charge de la personne. Les montants sont revus régulièrement : vérifiez-les sur la page officielle."
    },
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' }, { ficheId: 'rs', type: 'voir-aussi' },
      { ficheId: 'aif', type: 'voir-aussi' }
    ]
  },
  {
    id: 'diplome-titre-certification', titre: 'Diplôme, titre professionnel ou certification ?', titreDeTri: 'Diplôme, titre professionnel ou certification',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: [],
    variantesRecherche: ['différence entre diplôme, titre professionnel et certification', 'comparer diplôme titre et certification'],
    corps: "Les trois attestent officiellement d'un niveau de compétence, mais chacun avec une logique différente. Un diplôme est délivré par l'Éducation nationale ou l'enseignement supérieur, généralement au terme d'un cursus de formation initiale. Un titre professionnel est délivré par l'État, organisé en blocs de compétences, accessible aussi bien par la formation que par la VAE. Une certification est un terme plus large, qui regroupe ces deux formes ainsi que d'autres, comme les CQP délivrés par une branche professionnelle.",
    relations: [
      { ficheId: 'titre-professionnel', type: 'voir-aussi' }, { ficheId: 'certification', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ecoute-active', titre: 'Écoute active', titreDeTri: 'Écoute active', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['bien écouter en entretien', 'savoir écouter', 'écouter sans interrompre', 'écoute bienveillante'],
    corps: "L'écoute active est une posture d'écoute qui vise à comprendre réellement ce qu'exprime une personne, au-delà des seuls mots utilisés, plutôt que d'écouter en préparant déjà une réponse. Elle s'appuie notamment sur la reformulation, pour vérifier que ce qui a été compris correspond bien à ce que la personne voulait dire.",
    relations: [
      { ficheId: 'reformulation', type: 'voir-aussi' }, { ficheId: 'affirmation-de-soi', type: 'voir-aussi' },
      { ficheId: 'message-en-je', type: 'voir-aussi' }
    ]
  },
  {
    id: 'reformulation', titre: 'Reformulation', titreDeTri: 'Reformulation', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['redire avec ses mots', 'reformuler', "répéter avec d'autres mots"],
    corps: "La reformulation consiste à redire, avec ses propres mots, ce qu'une personne vient d'exprimer, pour vérifier que la compréhension est la bonne avant de poursuivre l'échange. Elle n'ajoute rien et ne juge rien : elle renvoie simplement ce qui a été entendu.",
    relations: [
      { ficheId: 'ecoute-active', type: 'voir-aussi' },
      { ficheId: 'questionnement', type: 'voir-aussi' },
      { ficheId: 'conduite-entretien', type: 'voir-aussi' }
    ]
  },
  // -- Famille : Confiance en soi et communication (26/10/2026, d'après des supports de formation, idées reprises et reformulées) --
  {
    id: 'estime-de-soi', titre: 'Estime de soi', titreDeTri: 'Estime de soi', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ["valeur que je m'accorde", 'image de soi', 'regard sur soi'],
    corps: "L'estime de soi désigne la valeur qu'une personne s'accorde à elle-même. Elle n'est pas fixe : elle évolue au fil des expériences, des réussites, des difficultés et des relations avec les autres. Une estime de soi dite juste ne consiste pas à se croire meilleur ou moins bon que les autres, mais à connaître ses points forts comme ses points faibles.",
    relations: [
      { ficheId: 'confiance-en-soi', type: 'voir-aussi' }, { ficheId: 'estime-confiance-ou-affirmation', type: 'voir-aussi' },
      { ficheId: 'croyance-limitante', type: 'voir-aussi' }
    ]
  },
  {
    id: 'confiance-en-soi', titre: 'Confiance en soi', titreDeTri: 'Confiance en soi', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['se sentir capable', 'croire en mes capacités'],
    corps: "La confiance en soi désigne le sentiment d'être capable d'agir, de réussir une tâche ou de faire face à une situation. Elle se construit surtout à partir d'expériences vécues, y compris de petites réussites, et elle peut varier d'un domaine à l'autre : on peut se sentir très sûr de soi dans son métier et beaucoup moins pour prendre la parole en réunion. Elle se distingue de l'estime de soi, qui porte sur la valeur qu'on s'accorde plutôt que sur ce qu'on se sent capable de faire.",
    relations: [
      { ficheId: 'estime-de-soi', type: 'voir-aussi' }, { ficheId: 'affirmation-de-soi', type: 'voir-aussi' },
      { ficheId: 'plan-action', type: 'voir-aussi' }
    ]
  },
  {
    id: 'affirmation-de-soi', titre: 'Affirmation de soi', titreDeTri: 'Affirmation de soi', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['assertivité', 'savoir dire non', "s'exprimer sans se braquer"],
    corps: "L'affirmation de soi, aussi appelée assertivité, consiste à exprimer clairement ce qu'on pense, ce qu'on ressent et ce dont on a besoin, tout en respectant l'autre. Elle se distingue de la soumission, qui consiste à se taire ou à céder, et de l'agressivité, qui consiste à imposer son point de vue.",
    relations: [
      { ficheId: 'ecoute-active', type: 'voir-aussi' }, { ficheId: 'message-en-je', type: 'voir-aussi' },
      { ficheId: 'styles-de-communication', type: 'voir-aussi' }
    ]
  },
  {
    id: 'estime-confiance-ou-affirmation', titre: 'Estime de soi, confiance en soi ou affirmation de soi ?', titreDeTri: 'Estime de soi confiance en soi ou affirmation de soi',
    type: 'notion', gabarit: 'comparatif', univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['différence entre estime de soi, confiance en soi et affirmation de soi', 'comparer estime confiance affirmation'],
    corps: "Ce qui les rapproche : les trois parlent du rapport qu'une personne entretient avec elle-même et avec les autres, et elles s'influencent mutuellement. Ce qui les distingue : l'estime de soi porte sur la valeur qu'on s'accorde, la confiance en soi sur ce qu'on se sent capable de faire, et l'affirmation de soi sur la façon de s'exprimer face aux autres. Certains auteurs les décrivent comme trois étages qui se soutiennent, sans qu'aucun doive nécessairement précéder les autres.",
    relations: [
      { ficheId: 'estime-de-soi', type: 'voir-aussi' }, { ficheId: 'confiance-en-soi', type: 'voir-aussi' }, { ficheId: 'affirmation-de-soi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'croyance-limitante', titre: 'Croyance limitante', titreDeTri: 'Croyance limitante', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['phrase qui me bloque', "je n'y arriverai pas", 'pensée qui me freine'],
    corps: "Une croyance limitante est une phrase qu'une personne se répète, souvent depuis longtemps, et qui limite ce qu'elle ose entreprendre, par exemple « je ne suis pas fait pour ça » ou « mon avis ne compte pas ». Ces phrases viennent souvent de l'éducation, de remarques entendues ou d'expériences passées. Elles décrivent une façon de voir les choses, pas une vérité sur la personne.",
    relations: [
      { ficheId: 'estime-de-soi', type: 'voir-aussi' }, { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'message-en-je', titre: 'Message en « je »', titreDeTri: 'Message en je', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['message en je', 'parler avec je', 'dire ce que je ressens'],
    corps: "Le message en « je » est une façon de s'exprimer qui consiste à dire ce qu'on observe, ce qu'on ressent et l'effet que cela a sur soi, plutôt que de reprocher quelque chose à l'autre en commençant par « tu ». Par exemple, « je m'inquiète quand les retards se répètent » décrit le ressenti de celui qui parle, alors que « tu es toujours en retard » porte un jugement sur l'autre. Cette forme existe parce qu'un reproche direct conduit souvent l'autre à se défendre plutôt qu'à écouter.",
    relations: [
      { ficheId: 'affirmation-de-soi', type: 'voir-aussi' }, { ficheId: 'methode-desc', type: 'voir-aussi' },
      { ficheId: 'critique-ou-reproche', type: 'voir-aussi' }
    ]
  },
  {
    id: 'methode-desc', titre: 'Méthode DESC', titreDeTri: 'Méthode DESC', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip', 'langage-rh'],
    variantesRecherche: ['décrire exprimer suggérer conclure', 'aborder un désaccord'],
    corps: "La méthode DESC est une méthode de communication en quatre étapes : décrire les faits, exprimer ce qu'on ressent, suggérer une solution, puis dire les conséquences positives attendues si chacun tient ses engagements. Elle a été proposée par les psychologues américains Sharon et Gordon Bower, dans un ouvrage sur l'affirmation de soi. Elle est souvent utilisée en entreprise pour aborder un désaccord sans accuser. Son intérêt est de séparer les faits, les ressentis et les propositions, qui se mélangent facilement dans une discussion tendue.",
    relations: [
      { ficheId: 'message-en-je', type: 'voir-aussi' }, { ficheId: 'affirmation-de-soi', type: 'voir-aussi' },
      { ficheId: 'critique-ou-reproche', type: 'voir-aussi' }
    ]
  },
  {
    id: 'critique-ou-reproche', titre: 'Critique ou reproche ?', titreDeTri: 'Critique ou reproche',
    type: 'notion', gabarit: 'comparatif', univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['critique constructive', 'recevoir une critique'],
    corps: "Ce qui les rapproche : dans les deux cas, une personne dit qu'un comportement ne lui convient pas. Ce qui les distingue : la critique décrit des faits précis et porte sur un comportement, dans le but de permettre à l'autre d'évoluer ; le reproche vise à faire reconnaître un tort, s'adresse à la personne elle-même et joue souvent sur la culpabilité.",
    relations: [
      { ficheId: 'message-en-je', type: 'voir-aussi' }, { ficheId: 'methode-desc', type: 'voir-aussi' },
      { ficheId: 'ecoute-active', type: 'voir-aussi' }
    ]
  },
  {
    id: 'styles-de-communication', titre: 'Styles de communication : passif, agressif ou assertif ?', titreDeTri: 'Styles de communication passif agressif ou assertif',
    type: 'notion', gabarit: 'comparatif', univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['passif agressif assertif', 'ma façon de réagir'],
    corps: "Ce qui les rapproche : ce sont trois manières de réagir quand on exprime un besoin, une opinion ou un désaccord, et une même personne peut passer de l'une à l'autre selon les situations. Ce qui les distingue : le style passif consiste à se taire ou à céder, le style agressif à imposer son point de vue sans tenir compte de l'autre, le style assertif à exprimer son point de vue tout en respectant celui de l'autre. Ces styles décrivent des comportements dans des situations données, jamais des types de personnes.",
    relations: [
      { ficheId: 'affirmation-de-soi', type: 'voir-aussi' }, { ficheId: 'ecoute-active', type: 'voir-aussi' },
      { ficheId: 'message-en-je', type: 'voir-aussi' }
    ]
  },
  {
    id: 'coach', titre: 'Coach', titreDeTri: 'Coach', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['coaching', 'accompagnement individuel'],
    corps: "Le mot « coach » vient du nom de Kocs, un village hongrois où l'on fabriquait un type de voiture à chevaux : il a d'abord désigné cette voiture, puis son conducteur, avant de désigner au XIXe siècle un répétiteur d'étudiants, puis un entraîneur sportif. Aujourd'hui, le coaching désigne un accompagnement individuel qui aide une personne à atteindre un objectif qu'elle a elle-même choisi. En France, la profession de coach n'est pas réglementée : aucun diplôme n'est exigé pour s'en réclamer, et il existe des certifications que les coachs passent ou non.",
    relations: [
      { ficheId: 'cip', type: 'voir-aussi' }, { ficheId: 'cep', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cesf', titre: 'Le rôle du CESF', titreDeTri: 'CESF',
    type: 'notion', gabarit: 'role', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['conseiller en économie sociale et familiale', 'aide pour mon budget et mon logement'],
    corps: "Un CESF (conseiller en économie sociale et familiale) est un travailleur social, titulaire d'un diplôme d'État, dont le métier porte sur la vie quotidienne : budget, consommation, logement, alimentation et santé, numérique. Il accompagne les personnes pour faire valoir leurs droits et peut aussi animer des ateliers collectifs. On en rencontre notamment dans les centres communaux d'action sociale, les services sociaux des départements, les caisses d'allocations familiales et les associations.",
    relations: [
      { ficheId: 'assistante-sociale', type: 'voir-aussi' }, { ficheId: 'ccas', type: 'voir-aussi' }, { ficheId: 'surendettement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'caces', titre: 'CACES', titreDeTri: 'CACES', type: 'terme',
    univers: 'conditions-travail', registres: ['langage-administratif'],
    variantesRecherche: ['permis cariste', 'conduite de chariot', 'certificat de conduite en sécurité'],
    corps: "Le CACES (certificat d'aptitude à la conduite en sécurité) atteste qu'une personne a les connaissances et le savoir-faire pour conduire en sécurité certains engins, comme les chariots élévateurs, les grues ou les nacelles. Il est délivré par catégorie d'engin et doit être renouvelé à intervalles réguliers. Il ne suffit pas à lui seul pour conduire : c'est l'employeur qui délivre une autorisation de conduite, après avoir vérifié l'aptitude médicale et informé la personne des risques du site.",
    relations: [
      { ficheId: 'certification', type: 'voir-aussi' }
    ]
  },
  {
    id: 'questionnement', titre: 'Questionnement', titreDeTri: 'Questionnement', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['poser les bonnes questions', 'poser des questions ouvertes', 'questions pour aider à réfléchir'],
    corps: "Le questionnement désigne la manière de poser des questions pour aider une personne à préciser sa pensée, plutôt que pour obtenir une information déjà attendue. Une question ouverte, qui ne se répond pas par oui ou non, laisse davantage de place à ce que la personne a réellement à dire.",
    relations: [
      { ficheId: 'ecoute-active', type: 'voir-aussi' }
    ]
  },
  {
    id: 'conduite-entretien', titre: "Conduite d'un entretien d'accompagnement", titreDeTri: "Conduite d'un entretien d'accompagnement", type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['mener un entretien avec un conseiller', 'mener un entretien', 'animer un entretien', 'structurer un entretien'],
    corps: "La conduite d'un entretien d'accompagnement désigne la manière dont un professionnel structure et anime un échange avec la personne qu'il accompagne, en alternant écoute, questionnement et reformulation tout en gardant un objectif clair. Elle se distingue d'un entretien d'embauche, qui répond à une tout autre logique.",
    relations: [
      { ficheId: 'ecoute-active', type: 'voir-aussi' }, { ficheId: 'questionnement', type: 'voir-aussi' }, { ficheId: 'reformulation', type: 'voir-aussi' }
    ]
  },
  {
    id: 'advp', titre: 'ADVP', titreDeTri: 'ADVP', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['méthode ADVP', 'activation du développement vocationnel et personnel', 'exploration vocationnelle'],
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
    variantesRecherche: ['décider ensemble avec mon conseiller', 'construire ensemble', 'coconstruction', 'travailler ensemble sur un projet'],
    corps: "La co-construction désigne une manière de travailler dans laquelle une décision ou une solution se construit conjointement avec la personne accompagnée, plutôt que d'être proposée toute faite par le professionnel. Elle s'oppose à une posture où le professionnel déciderait seul de ce qui convient à la personne.",
    relations: [
      { ficheId: 'prescription', type: 'voir-aussi' }, { ficheId: 'plan-action', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pouvoir-agir', titre: "Pouvoir d'agir", titreDeTri: "Pouvoir d'agir", type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['reprendre la main sur ma situation', 'empowerment', 'reprendre le contrôle', 'agir sur sa situation'],
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
    variantesRecherche: ['être licencié', 'perdre son emploi', 'lettre de licenciement', "renvoi par l'employeur"],
    corps: "Un licenciement est la fin d'un contrat de travail décidée par l'employeur, pour un motif qui doit être réel et justifié. C'est l'employeur, jamais le salarié, qui prend l'initiative de cette rupture.",
    relations: [
      { ficheId: 'demission', type: 'a-ne-pas-confondre' },
      { ficheId: 'activite-partielle', type: 'a-ne-pas-confondre' },
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
    variantesRecherche: ["partir à l'amiable", "rupture à l'amiable", 'départ négocié', "quitter son emploi d'un commun accord"],
    corps: "Une rupture conventionnelle est une fin de contrat de travail décidée d'un commun accord entre l'employeur et le salarié, formalisée par une convention signée des deux parties. Elle se distingue à la fois du licenciement et de la démission, chacun décidé par une seule des deux parties.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Rupture conventionnelle d'un CDI » (fiche vérifiée le 26 juin 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F19030" },
      lignes: [
        { libelle: "Délai de rétractation", valeur: "15 jours calendaires après la signature de la convention", categorie: 'duree', peutChanger: true },
        { libelle: "Délai d'instruction de la demande d'homologation", valeur: "15 jours ouvrables, sans réponse la convention est homologuée", categorie: 'duree', peutChanger: true },
        { libelle: "Indemnité spécifique", valeur: "au moins égale à l'indemnité légale de licenciement", categorie: 'montant', peutChanger: true }
      ],
      phraseGenerale: "La rupture conventionnelle se signe à deux, puis laisse un délai pour se rétracter et un délai pour l'homologation. Les délais et le montant de l'indemnité dépendent de la situation : vérifiez-les sur la page officielle."
    },
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
    variantesRecherche: ['différence entre Démission et rupture conventionnelle', 'comparer Démission et rupture conventionnelle'],
    corps: "Ce qui les rapproche : les deux mettent fin à un contrat de travail avant son terme naturel. Ce qui les distingue : une démission est décidée uniquement par le salarié. Une rupture conventionnelle est décidée d'un commun accord, formalisée par les deux parties : ni l'employeur ni le salarié ne peut l'imposer seul.",
    relations: [
      { ficheId: 'demission', type: 'voir-aussi' }, { ficheId: 'rupture-conventionnelle', type: 'voir-aussi' }
    ]
  },
  {
    id: 'entretien-annuel', titre: 'Entretien annuel', titreDeTri: 'Entretien annuel', type: 'terme',
    univers: 'ressources-humaines', registres: ['langage-rh'],
    variantesRecherche: ['entretien avec mon responsable', "entretien d'évaluation", "bilan de l'année avec mon responsable"],
    corps: "Un entretien annuel est un rendez-vous régulier entre un salarié et son responsable pour faire le point sur l'année écoulée (missions réalisées, difficultés rencontrées, objectifs à venir). Il se distingue d'un entretien d'embauche : il a lieu une fois le poste déjà occupé, jamais pour l'obtenir.",
    relations: [
      { ficheId: 'conduite-entretien', type: 'voir-aussi' },
      { ficheId: 'bilan-competences', type: 'voir-aussi' }
    ]
  },
  {
    id: 'culture-entreprise', titre: "Culture d'entreprise", titreDeTri: "Culture d'entreprise", type: 'terme',
    univers: 'ressources-humaines', registres: ['langage-rh'],
    variantesRecherche: ['ambiance de travail', 'façon de travailler dans une entreprise'],
    corps: "La culture d'entreprise désigne l'ensemble des valeurs, habitudes et façons de travailler propres à une entreprise, au-delà de ce qui est écrit dans un contrat ou une fiche de poste. Elle influence la manière dont les décisions sont prises et dont les personnes interagissent au quotidien.",
    relations: [
      { ficheId: 'marque-employeur', type: 'voir-aussi' },
      { ficheId: 'cv-lecture-recruteur', type: 'voir-aussi' }
    ]
  },
  {
    id: 'marque-employeur', titre: 'Marque employeur', titreDeTri: 'Marque employeur', type: 'terme',
    univers: 'ressources-humaines', registres: ['langage-rh'],
    variantesRecherche: ["image d'une entreprise comme employeur", "attractivité de l'entreprise", "réputation d'un employeur", "image de l'employeur"],
    corps: "La marque employeur désigne l'image qu'une entreprise donne d'elle-même en tant qu'employeur, pour attirer et fidéliser des candidats et des salariés. Elle passe notamment par la communication de l'entreprise, mais aussi par ce qu'en disent réellement les personnes qui y travaillent.",
    relations: [
      { ficheId: 'culture-entreprise', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cooptation', titre: 'Cooptation', titreDeTri: 'Cooptation', type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-rh'],
    variantesRecherche: ['être recommandé pour un poste', 'recommandation par un salarié', 'coopter', "parrainage d'un candidat"],
    corps: "La cooptation est une pratique de recrutement dans laquelle une personne déjà en poste recommande une autre personne pour un emploi disponible dans son entreprise. Elle repose sur la confiance accordée à la personne qui recommande, en complément des autres canaux de recrutement.",
    relations: [
      { ficheId: 'reseau-pour-emploi', type: 'voir-aussi' },
      { ficheId: 'marque-employeur', type: 'voir-aussi' }
    ]
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
    variantesRecherche: ['ZRR', 'zone de revitalisation rurale', 'ZFRR', 'aides zone rurale fragile'],
    corps: "Une zone France Ruralités Revitalisation (FRR, ou ZFRR) est une commune rurale classée fragile par l'État, ce qui ouvre des avantages fiscaux et sociaux (exonération de cotisations patronales, d'impôt sur les bénéfices, de cotisation foncière des entreprises) aux entreprises installées sur place, avec un niveau renforcé (FRR+) pour les communes les plus isolées. Ce zonage coexiste avec l'ancien zonage des zones de revitalisation rurale (ZRR) : les communes classées en ZRR au 30 juin 2024 bénéficient des effets du classement en FRR, et la loi de finances pour 2026 prolonge cette mesure jusqu'au 31 décembre 2029, au lieu du 31 décembre 2027. Cette loi élargit aussi les exonérations aux activités sédentaires. Pour un employeur, la question est de savoir si sa commune figure sur la liste officielle, fixée par arrêté. Utile aussi pour situer les difficultés propres à un territoire rural, à côté des QPV qui concernent les quartiers urbains.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Territoires ruraux (ZFRR, ZRR) et activités sédentaires : les nouveautés 2026 » (24 février 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18076" },
      lignes: [
        { libelle: 'Maintien des communes classées en ZRR', valeur: 'jusqu\'au 31 décembre 2029', categorie: 'date', peutChanger: true },
        { libelle: 'Chiffre d\'affaires réalisable hors zone', valeur: 'au plus 25 %', categorie: 'pourcent', peutChanger: true }
      ],
      phraseGenerale: "Une zone France Ruralités Revitalisation est une commune rurale classée fragile par l'État, ce qui ouvre des avantages fiscaux et sociaux aux entreprises installées sur place. Ce zonage coexiste avec l'ancien zonage des zones de revitalisation rurale, dont les communes gardent un temps les effets de leur classement. Les listes de communes et les dates de maintien peuvent changer : consultez la source officielle pour les informations à jour."
    },
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
    variantesRecherche: ['savoir faire plusieurs choses', 'polyvalent', 'être polyvalent', 'savoir tout faire'],
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
    variantesRecherche: ['savoir ce que je veux faire', 'objectif professionnel', 'métier visé', 'projet de carrière'],
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
    variantesRecherche: ['changer de voie sans tout changer', 'réorientation', "changer d'orientation"],
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
    variantesRecherche: ['différence entre Réorientation et reconversion', 'comparer Réorientation et reconversion'],
    corps: "Ce qui les rapproche : les deux impliquent de changer de direction dans son parcours professionnel. Ce qui les distingue : une réorientation reste généralement dans un domaine proche de celui déjà connu. Une reconversion implique un changement plus complet de métier ou de secteur, en s'appuyant sur des compétences transférables, une nouvelle formation, ou les deux.",
    relations: [
      { ficheId: 'reorientation-professionnelle', type: 'voir-aussi' }, { ficheId: 'reconversion', type: 'voir-aussi' }
    ]
  },
  {
    id: 'reconversion-ou-evolution', titre: 'Reconversion ou évolution professionnelle ?', titreDeTri: 'Reconversion ou évolution professionnelle',
    type: 'notion', gabarit: 'comparatif', univers: 'accompagnement-insertion', registres: [],
    variantesRecherche: ['différence entre Reconversion et évolution professionnelle', 'comparer Reconversion et évolution professionnelle'],
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
    variantesRecherche: ['différence entre Soft skills et hard skills', 'comparer Soft skills et hard skills'],
    corps: "Ce qui les rapproche : hard skills et soft skills sont les équivalents anglais de savoir-faire et savoir-être, de plus en plus utilisés dans les offres d'emploi et sur les réseaux professionnels. Ce qui les distingue : rien de plus que le vocabulaire employé, la distinction reste exactement la même (voir « Savoir-être ou savoir-faire ? » pour le détail).",
    relations: [
      { ficheId: 'savoir-etre-ou-savoir-faire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rqth-ou-invalidite', titre: 'RQTH ou invalidité ?', titreDeTri: 'RQTH ou invalidité',
    type: 'notion', gabarit: 'comparatif', univers: 'sante-travail', registres: ['langage-administratif'],
    variantesRecherche: ['différence entre RQTH et invalidité', 'comparer RQTH et invalidité'],
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
    variantesRecherche: ["secteur de l'insertion", "insertion par l'activité économique", "emplois d'insertion"],
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
      { ficheId: 'mission-locale', type: 'voir-aussi' }, { ficheId: 'diagnostic-partage', type: 'voir-aussi' }, { ficheId: 'coach', type: 'voir-aussi' }
    ]
  },
  {
    id: 'plie', titre: 'PLIE', titreDeTri: 'PLIE', type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ["plan local pour l'insertion et l'emploi", 'plan local insertion emploi', "accompagnement renforcé vers l'emploi", 'coordination des acteurs de l\'insertion'],
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
      { ficheId: 'droit-de-retrait', type: 'voir-aussi' },
      { ficheId: 'delegue-syndical', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'discrimination-embauche', titre: "Discrimination à l'embauche", titreDeTri: "Discrimination a l'embauche", type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-juridique'],
    variantesRecherche: ["refus injustifié à l'embauche", "refus d'embauche injuste", "discriminé à l'embauche", 'recrutement discriminatoire'],
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
    variantesRecherche: ["travailler en indépendant sans créer d'entreprise", 'société de portage', 'portage', 'salarié porté'],
    corps: "Le portage salarial permet à une personne d'exercer une activité en tant qu'indépendant tout en conservant un statut de salarié, grâce à une société de portage qui facture les clients à sa place et lui reverse un salaire après déduction de frais de gestion et de cotisations sociales.",
    relations: [
      { ficheId: 'auto-entrepreneur', type: 'voir-aussi' },
      { ficheId: 'profession-liberale', type: 'voir-aussi' },
      { ficheId: 'entreprise-individuelle-ou-societe', type: 'voir-aussi' }
    ]
  },
  {
    id: 'profession-liberale', titre: 'Profession libérale', titreDeTri: 'Profession libérale', type: 'terme',
    univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: ['exercer en libéral', 'travailler en libéral', 'indépendant libéral'],
    corps: "Une profession libérale est une activité indépendante, généralement de nature intellectuelle ou technique, exercée sous la responsabilité personnelle de la personne qui la pratique, dans un cadre réglementé ou non. Elle se distingue du salariat par l'absence de lien de subordination avec un employeur.",
    relations: [
      { ficheId: 'auto-entrepreneur', type: 'voir-aussi' },
      { ficheId: 'portage-salarial', type: 'voir-aussi' },
      { ficheId: 'entreprise-individuelle-ou-societe', type: 'voir-aussi' }
    ]
  },
  {
    id: 'auto-entrepreneur-portage-liberale', titre: 'Auto-entrepreneur, portage salarial ou profession libérale ?', titreDeTri: 'Auto-entrepreneur, portage salarial ou profession libérale',
    type: 'notion', gabarit: 'comparatif', univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: ['différence entre auto-entrepreneur, portage salarial et profession libérale', 'quel statut indépendant choisir'],
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
    corps: "Le casier judiciaire recense les condamnations pénales d'une personne, réparties en trois bulletins. Le bulletin n°1 n'est accessible qu'aux autorités judiciaires. Le bulletin n°2 est transmis à certaines autorités, comme les préfets ou les autorités militaires ; un employeur ne peut le demander que pour un poste en contact avec des mineurs. Le bulletin n°3 ne peut être demandé que par la personne elle-même, qui décide de le présenter ou non. Pour la plupart des emplois, un employeur privé ne peut pas exiger la communication du casier.",
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
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: "impots.gouv.fr, « Extension de l'aide de 100 € pour les travailleurs grands rouleurs » (page du 1er octobre 2026, modifiée le 27 octobre 2026)", url: 'https://www.impots.gouv.fr/actualite/extension-de-laide-de-100-eu-pour-les-travailleurs-grands-rouleurs' },
      lignes: [
        { libelle: "Montant", valeur: "100 € par période", categorie: 'montant', peutChanger: true },
        { libelle: "Périodes concernées", valeur: "du 1er avril au 30 septembre 2026, puis du 1er octobre au 31 décembre 2026 (une seule fois par véhicule pour la seconde période)", categorie: 'date', peutChanger: true },
        { libelle: "Plafond de ressources", valeur: "22 770 € de revenu fiscal de référence par part, d'après les revenus de 2024", categorie: 'seuil', peutChanger: true },
        { libelle: "Distance", valeur: "au moins 15 km par trajet domicile-travail, ou plus de 8 000 km par an pour l'activité professionnelle", categorie: 'seuil', peutChanger: true }
      ],
      phraseGenerale: "Cette aide dépend d'un plafond de ressources et d'une distance parcourue. Les dates et le plafond changent d'une période à l'autre : vérifiez-les sur le site des impôts."
    },
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
      { ficheId: 'frein-emploi', type: 'voir-aussi' }, { ficheId: 'cesf', type: 'voir-aussi' }
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
    corps: "L'Offre de Repérage et de Remobilisation (O2R) s'adresse aux personnes éloignées de l'emploi qui ont décroché des solutions proposées ou qui cumulent des difficultés (santé, handicap, logement, mobilité, accès aux droits). Elle propose d'aller vers ces personnes. En lien avec le réseau pour l'emploi et les collectivités, elle doit leur permettre un raccrochage aux dispositifs de droit commun. Pour savoir si elle existe près de chez vous, demandez à un travailleur social ou à votre conseiller.",
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
      { ficheId: 'astreintes', type: 'voir-aussi' }, { ficheId: 'convention-collective', type: 'voir-aussi' }, { ficheId: 'compte-professionnel-de-prevention', type: 'voir-aussi' }
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
    variantesRecherche: ['différence entre Temps partiel choisi et subi', 'comparer Temps partiel choisi et subi'],
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
    corps: "La clause sociale d'insertion est une obligation inscrite dans un marché public : l'entreprise qui décroche le marché doit réserver un volume d'heures de travail (les heures d'insertion) à des personnes éloignées de l'emploi. Ces heures correspondent à un vrai poste, payé normalement. L'entreprise embauche directement, passe par une structure d'insertion, ou propose une alternance. On y accède par l'intermédiaire d'un facilitateur, sur orientation de son conseiller. La loi prévoit que les marchés publics les plus importants comportent des conditions d'exécution sociales, avec quelques exceptions.",
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
    variantesRecherche: ["différence entre Maître d'ouvrage et maître d'œuvre", "comparer Maître d'ouvrage et maître d'œuvre"],
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
    variantesRecherche: ["différence entre RSA et prime d'activité", "comparer RSA et prime d'activité"],
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
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Allocation aux adultes handicapés (AAH) » (fiche vérifiée le 14 septembre 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F12242" },
      lignes: [
        { libelle: "Montant maximal par mois", valeur: "1 041,59 €", categorie: 'montant', peutChanger: true },
        { libelle: "Plafond annuel de ressources, personne seule sans enfant", valeur: "12 499 €", categorie: 'montant', peutChanger: true },
        { libelle: "Taux d'incapacité", valeur: "au moins 80 %, ou 50 à 79 % avec une restriction durable d'accès à l'emploi", categorie: 'seuil', peutChanger: true },
        { libelle: "Durée d'attribution (taux d'au moins 80 %)", valeur: "de 1 à 10 ans, ou à vie si le handicap ne peut pas évoluer favorablement", categorie: 'duree', peutChanger: true },
        { libelle: "Délai de réponse de la commission", valeur: "4 mois, sans réponse la demande est réputée rejetée", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "L'AAH dépend du taux d'incapacité, des ressources et du lieu de résidence. Le montant et les plafonds changent : vérifiez-les sur la page officielle ou auprès de la Caf ou de la MSA."
    },
    relations: [
      { ficheId: 'rqth', type: 'voir-aussi' },
      { ficheId: 'caf', type: 'voir-aussi' },
      { ficheId: 'pension-invalidite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aah-ou-pension-invalidite', titre: "AAH ou pension d'invalidité ?", titreDeTri: 'AAH ou pension d invalidite',
    type: 'notion', gabarit: 'comparatif', univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ["différence entre AAH et pension d'invalidité", "comparer AAH et pension d'invalidité"],
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
    corps: "L'ASS (allocation de solidarité spécifique) est un revenu de remplacement versé par France Travail à certains demandeurs d'emploi qui ont épuisé leurs droits à l'allocation chômage et qui justifient d'une durée de travail suffisante avant leur inscription, réduite pour une personne qui a élevé des enfants. Elle est attribuée par périodes renouvelables, sous conditions de ressources du foyer. C'est l'un des filets qui prennent le relais quand l'ARE s'arrête.",
    relations: [
      { ficheId: 'are', type: 'a-ne-pas-confondre' },
      { ficheId: 'are-ou-ass', type: 'voir-aussi' },
      { ficheId: 'france-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'are-ou-ass', titre: 'ARE ou ASS ?', titreDeTri: 'ARE ou ASS',
    type: 'notion', gabarit: 'comparatif', univers: 'protection-sociale', registres: [],
    variantesRecherche: ['différence entre ARE et ASS', 'comparer ARE et ASS'],
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
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Contrat de sécurisation professionnelle (CSP) » (fiche consultée le 03/11/2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F31688" },
      lignes: [
        { libelle: "Délai de réflexion pour accepter ou refuser", valeur: "21 jours", categorie: 'duree', peutChanger: true },
        { libelle: "Durée de versement de l'allocation", valeur: "12 mois à compter de la prise d'effet du contrat (salarié avec au moins 1 an d'ancienneté)", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "Le contrat de sécurisation professionnelle laisse un délai de réflexion pour accepter ou refuser. Les durées et le montant de l'allocation changent selon l'ancienneté : vérifiez-les sur la page officielle ou sur un simulateur de France Travail."
    },
    relations: [
      { ficheId: 'are', type: 'a-ne-pas-confondre' },
      { ficheId: 'aif', type: 'voir-aussi' },
      { ficheId: 'cep', type: 'voir-aussi' },
      { ficheId: 'fem', type: 'voir-aussi' }
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
    corps: "Le quotient familial de la Caf repose sur votre déclaration en tant qu'allocataire : la Caf prend en compte les ressources annuelles imposables, desquelles sont déduits les abattements sociaux, puis établit un calcul pour déterminer les prestations auxquelles vous pouvez prétendre. Le quotient familial de l'administration fiscale est différent : il permet d'atténuer la progressivité de l'impôt sur le revenu en faisant bénéficier d'avantages fiscaux les contribuables qui ont des enfants à charge.",
    relations: [
      { ficheId: 'plafond-de-ressources', type: 'voir-aussi' }
    ]
  },
  {
    id: 'plafond-de-ressources', titre: 'Plafond de ressources', titreDeTri: 'Plafond de ressources',
    type: 'terme', univers: 'mobilite-budget', registres: ['langage-administratif'],
    variantesRecherche: ['plafond de revenus', 'condition de ressources', 'revenu maximum pour une aide'],
    corps: "Un plafond de ressources est le montant total de vos ressources à ne pas dépasser pour bénéficier d'une prestation. Pour le RSA, par exemple, il faut avoir des ressources mensuelles qui ne dépassent pas les plafonds en vigueur. Chaque prestation a ses propres plafonds : il vaut la peine de vérifier chaque droit séparément.",
    relations: [
      { ficheId: 'quotient-familial', type: 'voir-aussi' },
      { ficheId: 'numero-unique-enregistrement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'reste-a-vivre', titre: 'Reste à vivre', titreDeTri: 'Reste a vivre',
    type: 'terme', univers: 'mobilite-budget', registres: ['langage-cip'],
    variantesRecherche: ['reste pour vivre', 'budget après les charges', "ce qu'il me reste à la fin du mois"],
    corps: "Le reste à vivre est le revenu qui reste à un foyer après paiement de l'échéance, par exemple celle d'un crédit. Les banques exigent un reste à vivre suffisant, fixé en fonction de la taille du ménage.",
    relations: [
      { ficheId: 'surendettement', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'declaration-de-ressources', titre: 'Déclaration de ressources', titreDeTri: 'Declaration de ressources',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['déclaration trimestrielle de ressources', 'déclarer mes revenus à la CAF', 'DTR'],
    corps: "Les bénéficiaires de la prime d'activité, du RSA ou de l'allocation aux adultes handicapés trimestrielle doivent faire régulièrement une déclaration de ressources, à chaque trimestre. Elle se fait sur l'appli mobile de la Caf ou sur caf.fr, dans la rubrique « Mes ressources ».",
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
    corps: "Le conseil de prud'hommes est le tribunal qui juge les litiges entre un salarié (ou un apprenti) et son employeur nés du contrat de travail : salaire non payé, heures non réglées, licenciement contesté, requalification d'un CDD... Il est composé de juges non professionnels, à parts égales représentants des salariés et des employeurs. On peut le saisir seul ou assisté (avocat, défenseur syndical) ; une phase de conciliation précède le jugement. Depuis le 1er mars 2026, la saisine demande un timbre fiscal (sauf pour les personnes qui ont l'aide juridictionnelle), en plus des frais éventuels d'avocat. Depuis le 1er octobre 2026, il suffit de joindre à la demande la liste des pièces et le dernier bulletin de salaire : les pièces sont transmises ensuite à l'employeur, avant l'audience.",
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
      { ficheId: 'ordonnance-de-protection', type: 'voir-aussi' },
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
    variantesRecherche: ['différence entre Recours amiable et contentieux', 'comparer Recours amiable et contentieux'],
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
    variantesRecherche: ['différence entre Discrimination et différence de traitement', 'comparer Discrimination et différence de traitement'],
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
    corps: "Dans chaque département, le SIAO (service intégré d'accueil et d'orientation) gère le 115, un service téléphonique gratuit, ouvert jour et nuit, tous les jours de la semaine, pour les personnes sans-abri : il offre assistance, écoute, conseils et orientation, et organise l'accès à l'hébergement d'urgence. Le SIAO coordonne aussi l'action des autres acteurs de la veille sociale (équipes mobiles, accueils de jour). Il est informé des places vacantes et formule des propositions d'orientation après une évaluation sociale, notamment vers les pensions de famille.",
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
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Ministères de la Transition écologique et du Logement : trêve hivernale 2026', url: 'https://www.ecologie.gouv.fr/actualites/treve-hivernale-2026-quand-commence-t-elle-que-prevoit-loi' },
      lignes: [
        { libelle: 'Trêve hivernale 2026-2027', valeur: 'du 1er novembre 2026 au 31 mars 2027 inclus', categorie: 'date', peutChanger: true },
        { libelle: 'Reprise des procédures', valeur: 'dès le 1er avril, si la situation n\'a pas été régularisée', categorie: 'date', peutChanger: true }
      ]
    },
    corps: "La trêve hivernale est la période de l'année pendant laquelle il est interdit d'expulser un locataire de son logement, même après une décision de justice, et pendant laquelle les fournisseurs d'énergie ne peuvent pas couper le gaz ni l'électricité pour impayés (pour l'électricité, ils peuvent seulement réduire la puissance ; chez EDF, elle est maintenue toute l'année). Elle court chaque hiver, sur des dates fixées par la loi. Elle ne fait pas disparaître la dette ni la procédure : elle en suspend l'exécution. C'est une période à mettre à profit pour saisir un travailleur social, l'agence d'information sur le logement (ADIL) ou le fonds de solidarité pour le logement.",
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
    id: 'mobili-jeune', titre: 'Mobili-Jeune : une aide pour payer son loyer en alternance', titreDeTri: 'Mobili-Jeune',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['Mobili Jeune', 'aide au loyer alternance', 'aide logement apprenti', 'loyer alternant'],
    corps: "Mobili-Jeune est une aide d'Action Logement qui prend en charge une partie du loyer d'un jeune en alternance, c'est-à-dire en contrat d'apprentissage ou de professionnalisation dans une entreprise du secteur privé. Elle sert à celui ou celle qui doit se loger près de son lieu de formation ou de travail. Pour y avoir droit, plusieurs conditions se cumulent : un salaire en dessous d'un plafond, un logement éloigné de l'ancienne adresse ou un trajet long, ou bien deux loyers à payer à la fois. Le logement doit être loué : location, colocation, foyer, résidence sociale ou internat. L'aide se calcule sur le loyer, une fois déduite l'aide au logement de la CAF. La demande se fait en ligne sur la plateforme d'Action Logement, avec la quittance de loyer et les bulletins de salaire. Elle peut se cumuler avec l'avance Loca-Pass et la garantie Visale.",
    detailsAJour: {
      verifieLe: '2026-10-27',
      source: { nom: "Action Logement, page « Aide Mobili-Jeune »", url: 'https://www.actionlogement.fr/aide-mobili-jeune' },
      lignes: [
        { libelle: 'Âge', valeur: 'moins de 30 ans (au-delà, possible avec une reconnaissance de handicap)', categorie: 'seuil', peutChanger: true },
        { libelle: 'Plafond de salaire', valeur: '120 % du SMIC brut mensuel', categorie: 'pourcent', peutChanger: true },
        { libelle: 'Moment de la demande', valeur: 'dans les 3 mois avant ou les 5 mois après le début du contrat', categorie: 'duree', peutChanger: true },
        { libelle: "Distance avec l'ancien logement", valeur: 'plus de 70 km, ou trajet de plus de 40 minutes, ou double loyer', categorie: 'seuil', peutChanger: true },
        { libelle: "Montant de l'aide", valeur: 'de 10 à 100 € par mois, plafond de 1 100 € par année de formation, en 11 mensualités', categorie: 'montant', peutChanger: true },
        { libelle: 'Durée maximale', valeur: '2 années de formation', categorie: 'duree', peutChanger: true },
        { libelle: "Délai d'étude d'un dossier complet", valeur: '7 jours ouvrés', categorie: 'duree', peutChanger: true }
      ]
    },
    relations: [
      { ficheId: 'visale', type: 'voir-aussi' },
      { ficheId: 'aides-au-logement', type: 'voir-aussi' },
      { ficheId: 'alternance', type: 'voir-aussi' }
    ]
  },
  {
    id: 'maprimerenov', titre: "MaPrimeRénov'", titreDeTri: 'MaPrimeRenov',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['Ma Prime Renov', 'aide travaux Anah', 'aide rénovation énergétique', 'prime rénovation logement'],
    corps: "MaPrimeRénov' est une aide de l'Anah (Agence nationale de l'habitat) pour financer des travaux de rénovation énergétique dans un logement. Elle s'adresse aux propriétaires qui occupent leur logement ou le louent, selon leurs ressources. Elle existe sous deux formes : la rénovation d'ampleur, pour un ensemble de travaux qui améliore nettement la performance du logement, et le parcours par geste, pour un type de travaux à la fois. Pour la rénovation d'ampleur, un rendez-vous avec France Rénov' est obligatoire et un accompagnateur est proposé pour suivre le projet. La demande se fait en ligne, avant la signature des devis : les travaux ne doivent pas commencer avant l'accord de l'Anah.",
    detailsAJour: {
      verifieLe: '2026-10-27',
      source: { nom: "Service-public.gouv.fr, fiche « MaPrimeRénov' (propriétaires occupants) »", url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F35083' },
      lignes: [
        { libelle: 'Ancienneté du logement', valeur: 'construit depuis au moins 15 ans (en métropole)', categorie: 'seuil', peutChanger: true },
        { libelle: "Rénovation d'ampleur : occupation", valeur: 'résidence principale pendant au moins 3 ans', categorie: 'duree', peutChanger: true },
        { libelle: "Rénovation d'ampleur : état du logement", valeur: "classé E, F ou G avant les travaux, gain d'au moins 2 classes", categorie: 'seuil', peutChanger: true },
        { libelle: 'Part prise en charge selon les ressources (gain de 2 classes)', valeur: 'ménages très modestes 80 %, modestes 60 %, intermédiaires 45 %, supérieurs 10 %', categorie: 'pourcent', peutChanger: true },
        { libelle: 'Dépenses prises en compte (hors taxes)', valeur: "jusqu'à 30 000 € (gain de 2 classes) ou 40 000 € (gain de 3 classes ou plus)", categorie: 'montant', peutChanger: true },
        { libelle: 'Plafonds de ressources pour une personne, hors Île-de-France', valeur: 'très modestes 17 363 €, modestes 22 259 €, intermédiaires 31 185 € (revenu fiscal de référence 2025, demande en 2026)', categorie: 'montant', peutChanger: true },
        { libelle: 'Délai pour terminer les travaux', valeur: '3 ans (1 an si une avance a été versée)', categorie: 'duree', peutChanger: true }
      ]
    },
    relations: [
      { ficheId: 'maprimeadapt', type: 'voir-aussi' },
      { ficheId: 'prets-action-logement-salaries', type: 'voir-aussi' },
      { ficheId: 'aides-au-logement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'maprimeadapt', titre: "MaPrimeAdapt'", titreDeTri: 'MaPrimeAdapt',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['Ma Prime Adapt', 'aide adaptation logement', 'adapter son logement', 'aide Anah handicap'],
    corps: "MaPrimeAdapt' est une aide de l'Anah (Agence nationale de l'habitat) pour financer des travaux qui adaptent le logement à l'âge ou au handicap de la personne qui y vit : par exemple un monte-escalier, une douche à la place d'une baignoire, des WC surélevés, une rampe d'accès ou l'élargissement d'une porte. Elle s'adresse aux propriétaires qui occupent leur logement et aux locataires du parc privé, dont le bailleur a donné son accord écrit, selon leur âge ou leur situation de handicap et leurs ressources. La demande se fait en ligne après un premier contact avec France Rénov', et les travaux ne doivent pas commencer avant l'accord de l'Anah.",
    detailsAJour: {
      verifieLe: '2026-10-27',
      source: { nom: "Service-public.gouv.fr, fiche « MaPrimeAdapt' : travaux d'adaptation du logement »", url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F37501' },
      lignes: [
        { libelle: 'Âge', valeur: "70 ans ou plus, ou 60 à 69 ans avec un classement en GIR (perte d'autonomie)", categorie: 'seuil', peutChanger: true },
        { libelle: 'Handicap', valeur: "taux d'incapacité d'au moins 50 %, ou éligibilité à la PCH, à l'AEEH ou à l'AAH", categorie: 'pourcent', peutChanger: true },
        { libelle: 'Plafonds de ressources pour une personne, hors Île-de-France', valeur: 'très modestes 17 363 €, modestes 22 259 € (revenu fiscal de référence)', categorie: 'montant', peutChanger: true },
        { libelle: 'Part des travaux prise en charge', valeur: 'ménages très modestes 70 %, modestes 50 %', categorie: 'pourcent', peutChanger: true },
        { libelle: 'Plafond de travaux pris en compte (hors taxes)', valeur: '22 000 €', categorie: 'montant', peutChanger: true }
      ]
    },
    relations: [
      { ficheId: 'maprimerenov', type: 'voir-aussi' },
      { ficheId: 'aides-au-logement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prets-action-logement-salaries', titre: "Prêts d'Action Logement pour les salariés propriétaires", titreDeTri: 'Prets Action Logement salaries proprietaires',
    type: 'terme', univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['prêt travaux Action Logement', 'prêt accession Action Logement', 'prêt salarié propriétaire', 'prêt 1 % logement'],
    corps: "Action Logement propose aux salariés de certaines entreprises du secteur privé deux prêts à conditions avantageuses. Le prêt travaux finance des travaux dans la résidence principale d'un salarié propriétaire : mise aux normes, amélioration, adaptation au handicap, sécurité. Les travaux d'agrandissement en sont exclus. Le prêt accession complète un prêt principal pour acheter sa résidence principale. Dans les deux cas, la demande se fait en ligne et il faut attendre l'accord avant de commencer les travaux ou de signer chez le notaire.",
    detailsAJour: {
      verifieLe: '2026-10-27',
      source: { nom: "Action Logement, pages « Prêt travaux » et « Prêt accession »", url: 'https://www.actionlogement.fr/le-pret-travaux-amelioration' },
      lignes: [
        { libelle: 'Entreprise du salarié', valeur: 'secteur privé non agricole, au moins 10 salariés', categorie: 'seuil', peutChanger: true },
        { libelle: 'Prêt travaux : montant', valeur: "jusqu'à 10 000 €, jusqu'à 100 % du prix des travaux", categorie: 'montant', peutChanger: true },
        { libelle: 'Prêt travaux : taux', valeur: '1,5 % fixe, hors assurance facultative', categorie: 'pourcent', peutChanger: true },
        { libelle: 'Prêt travaux : durée', valeur: '10 ans au plus', categorie: 'duree', peutChanger: true },
        { libelle: 'Prêt accession : montant', valeur: "jusqu'à 30 000 €", categorie: 'montant', peutChanger: true },
        { libelle: 'Prêt accession : taux', valeur: '1 % fixe, hors assurance obligatoire', categorie: 'pourcent', peutChanger: true },
        { libelle: 'Prêt accession : durée', valeur: '25 ans au plus', categorie: 'duree', peutChanger: true },
        { libelle: 'Prêt accession : dépôt du dossier', valeur: 'au moins 30 jours ouvrés avant la signature chez le notaire', categorie: 'duree', peutChanger: true }
      ]
    },
    relations: [
      { ficheId: 'maprimerenov', type: 'voir-aussi' },
      { ficheId: 'visale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'intermediation-locative', titre: 'Intermédiation locative', titreDeTri: 'Intermediation locative',
    type: 'terme', univers: 'accompagnement-insertion', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['sous-location par une association', 'logement passerelle', 'Solibail'],
    corps: "L'intermédiation locative consiste, pour un propriétaire, à confier la gestion de son logement à une agence immobilière sociale, ou à le louer à un organisme agréé par l'État qui le sous-loue. Elle s'adresse aux ménages en grande précarité ou qui ont des difficultés d'accès à un logement ordinaire avec un bail classique.",
    relations: [
      { ficheId: 'siao-115', type: 'voir-aussi' },
      { ficheId: 'hebergement-ou-logement-accompagne', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pension-de-famille', titre: 'Pension de famille', titreDeTri: 'Pension de famille',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip'],
    variantesRecherche: ['maison relais', 'logement accompagné durable', 'vivre seul est trop difficile'],
    corps: "Une pension de famille est une forme de résidence sociale. C'est une offre alternative au logement pour des personnes à faible niveau de ressources, en situation d'isolement ou d'exclusion sociale, qui ont souvent fréquenté de façon répétée des structures d'hébergement provisoire. La personne accueillie signe un contrat de résidence ou une convention d'occupation, sans limite de durée, et le loyer dépend de la superficie du logement. L'orientation passe par le SIAO, qui propose une orientation après une évaluation sociale ; le gestionnaire de la pension de famille examine ensuite cette proposition.",
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
    corps: "Un accueil de jour fait partie de la veille sociale, avec le 115, les équipes mobiles (samu sociaux, maraudes) et les services d'accueil et d'orientation. Le SIAO coordonne l'action de ces acteurs.",
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
    variantesRecherche: ['différence entre Hébergement et logement accompagné', 'comparer Hébergement et logement accompagné'],
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
    corps: "Les points conseil budget (PCB) sont des structures d'accueil inconditionnel destinées à accompagner toute personne qui rencontre des difficultés budgétaires et qui a besoin d'un accompagnement.",
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
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Microcrédit personnel » (fiche vérifiée le 10 avril 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F21375" },
      lignes: [
        { libelle: "Montant maximal", valeur: "8 000 €", categorie: 'montant', peutChanger: true },
        { libelle: "Durée de remboursement", valeur: "de 6 mois à 7 ans", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "Le microcrédit personnel est un petit prêt qui passe par un organisme d'accompagnement. Le montant maximal et les durées peuvent changer : vérifiez-les sur la page officielle."
    },
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
    variantesRecherche: ['différence entre Plan conventionnel et mesures imposées', 'comparer Plan conventionnel et mesures imposées'],
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
    corps: "L'obligation d'emploi des travailleurs handicapés (OETH) impose à tout employeur d'au moins vingt salariés de compter dans ses effectifs une proportion de travailleurs handicapés fixée par la loi. L'employeur qui n'atteint pas ce taux verse une contribution : il la déclare avec sa déclaration sociale nominative d'avril et la paie à l'Urssaf ou à la MSA, qui la reversent à l'Agefiph (ou au FIPHFP pour la fonction publique). Elle peut être remplie par l'embauche directe, l'accueil de stagiaires ou d'alternants, ou la sous-traitance auprès du secteur adapté et protégé. C'est ce qui donne une valeur concrète à la RQTH côté employeur. Attention : des démarcheurs se font passer pour l'Agefiph, l'Urssaf, la MSA ou une entreprise adaptée et promettent de faire baisser cette contribution, souvent en pressant d'acheter avant la fin de l'année. Seuls l'Agefiph, l'Urssaf et la MSA sont vos interlocuteurs pour la déclaration (alerte publiée par l'Agefiph).",
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
    corps: "Une entreprise adaptée (EA) est une entreprise du milieu ordinaire qui emploie une majorité de travailleurs handicapés, avec un accompagnement renforcé et un aménagement des postes et des rythmes. Les salariés ont un contrat de travail ; selon Service Public, il s'agit d'un contrat à durée déterminée. Elle peut servir de tremplin vers d'autres employeurs, ou offrir un emploi durable. Elle se distingue de l'ESAT, qui relève du secteur médico-social et n'est pas un contrat de travail.",
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
    corps: "La visite de reprise est le rendez-vous avec la médecine du travail organisé par l'employeur après un arrêt de travail assez long (maladie, accident du travail, maternité). Le médecin vérifie si le poste est compatible avec l'état de santé, propose des aménagements ou un aménagement du temps de travail, ou constate une inaptitude. Tant qu'elle n'a pas eu lieu, l'arrêt est considéré comme non terminé. Une visite de préreprise peut être demandée avant, pour anticiper. Depuis le 15 juin 2026, pour les arrêts de travail délivrés à partir de cette date, la visite de reprise n'est plus obligatoire si une visite de préreprise a eu lieu dans les trente jours avant le retour et que le médecin a conclu qu'aucun aménagement n'était nécessaire ; l'employeur, le médecin du travail ou le salarié peuvent la demander quand même.",
    relations: [
      { ficheId: 'medecine-travail', type: 'voir-aussi' },
      { ficheId: 'aptitude-ou-inaptitude', type: 'voir-aussi' },
      { ficheId: 'maintien-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'milieu-ordinaire-ou-milieu-protege', titre: 'Milieu ordinaire ou milieu protégé ?', titreDeTri: 'Milieu ordinaire ou milieu protege',
    type: 'notion', gabarit: 'comparatif', univers: 'structures-organismes', registres: [],
    variantesRecherche: ['différence entre Milieu ordinaire et milieu protégé', 'comparer Milieu ordinaire et milieu protégé'],
    corps: "Ce qui les rapproche : les deux permettent de travailler avec un handicap, avec un accompagnement. Ce qui les distingue : le milieu ordinaire (entreprise classique, entreprise adaptée) repose sur un contrat de travail de droit commun ; le milieu protégé (ESAT) relève du secteur médico-social, avec un statut d'usager et non de salarié. Le passage de l'un à l'autre est possible dans les deux sens, sur décision de la MDPH.",
    relations: [
      { ficheId: 'esat', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rqth-ou-oeth', titre: 'RQTH ou OETH ?', titreDeTri: 'RQTH ou OETH',
    type: 'notion', gabarit: 'comparatif', univers: 'droit-travail', registres: [],
    variantesRecherche: ['différence entre RQTH et OETH', 'comparer RQTH et OETH'],
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
    corps: "On parle de demandeur d'emploi de longue durée quand une personne a été inscrite à France Travail en catégorie A pendant au moins douze mois au cours des quinze derniers mois. C'est un repère très utilisé dans l'accompagnement, parce que plus l'éloignement de l'emploi dure, plus les freins ont tendance à se cumuler (confiance, réseau, santé, mobilité). Certains dispositifs et certaines clauses sociales visent en priorité ce public. Ce n'est jamais un jugement sur la personne, seulement une donnée de contexte.",
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
    corps: "Selon la Dares, la tension sur le marché du travail se définit comme un excès de demande de travail : des employeurs qui cherchent plus de personnes qu'il n'y en a de disponibles. Un métier est dit « en tension » quand c'est le cas pour ce métier.",
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
    corps: "L'économie présentielle regroupe les activités tournées vers la satisfaction des besoins des personnes présentes sur un territoire, qu'elles soient résidentes ou touristes : commerce de détail, santé et action sociale, services aux particuliers, éducation, construction, administration. On l'oppose à l'économie « productive », composée d'activités potentiellement exportatrices et ouvertes à la concurrence internationale : agriculture, industrie, commerce de gros, services aux entreprises.",
    relations: [
      { ficheId: 'bassin-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'inscrit-a-france-travail-ou-chomeur-bit', titre: "Inscrit à France Travail ou chômeur au sens du BIT ?", titreDeTri: 'Inscrit a France Travail ou chomeur au sens du BIT',
    type: 'notion', gabarit: 'comparatif', univers: 'emploi-recrutement', registres: [],
    variantesRecherche: ['différence entre Inscrit à France Travail et chômeur au sens du BIT', 'comparer Inscrit à France Travail et chômeur au sens du BIT'],
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
    variantesRecherche: ['différence entre Métier en tension et métier qui recrute', 'comparer Métier en tension et métier qui recrute'],
    corps: "Ce qui les rapproche : dans les deux cas, il y a des postes à prendre. Ce qui les distingue : un métier « qui recrute » a beaucoup d'offres, plutôt une bonne nouvelle pour un candidat. Un métier « en tension » a des offres que les employeurs peinent à pourvoir : cela peut venir d'un manque de personnes formées, mais aussi de conditions de travail, d'horaires ou de salaires qui rebutent. Regarder pourquoi un métier est en tension aide à savoir s'il convient.",
    relations: [
      { ficheId: 'metier-en-tension', type: 'voir-aussi' }
    ]
  },

  // -- Famille : Comment lire les chiffres de créations, de radiations et de
  //    défaillances d'entreprises (chantier docs/CHANTIER_REPERES_ENTREPRISES_TERRITOIRE_2026-10-18.md,
  //    2026-10-19). Des mots qui reviennent dans l'actualité économique, expliqués
  //    sans aucun chiffre daté (les chiffres vivent dans « Comprendre les chiffres »).
  //    Textes proposés par Claude, à relire par Denis et à vérifier sur les sources
  //    officielles (Insee, Banque de France, BODACC, service-public.gouv.fr). --

  {
    id: 'creations-entreprises-micro-entrepreneurs', titre: "Créations d'entreprises et micro-entrepreneurs", titreDeTri: 'Creations d entreprises et micro entrepreneurs',
    type: 'notion', gabarit: 'decryptage', univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: ['nombre de créations d\'entreprises', 'beaucoup de créations d\'entreprises', 'micro-entrepreneurs et statistiques', 'créations d\'emplois ou d\'entreprises'],
    corps: "Quand on annonce un nombre de créations d'entreprises, ce nombre compte aussi les micro-entrepreneurs : des personnes qui se mettent à leur compte, souvent seules, parfois en complément d'un autre travail. Beaucoup de créations ne veut donc pas dire beaucoup d'emplois nouveaux : une création peut être une personne qui s'est créé son propre emploi, ou une activité d'appoint. L'Insee publie ces chiffres et les compare à la même période un an plus tôt, ce qui permet de voir si le mouvement s'accélère ou ralentit.",
    relations: [
      { ficheId: 'auto-entrepreneur', type: 'voir-aussi' },
      { ficheId: 'entreprise-individuelle-ou-societe', type: 'voir-aussi' },
      { ficheId: 'siren-ou-siret', type: 'voir-aussi' }
    ]
  },
  {
    id: 'radiation-d-office-entreprise', titre: "Radiation d'office d'une entreprise", titreDeTri: 'Radiation d office d une entreprise',
    type: 'terme', univers: 'entrepreneuriat-independance', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['entreprise radiée', 'radiée du registre du commerce', 'radiation greffe', 'entreprise radiée d\'office'],
    corps: "Une entreprise peut être retirée du registre du commerce sur décision du greffe, sans que son dirigeant l'ait demandé : c'est une radiation d'office. Elle peut notamment intervenir après la clôture d'une liquidation. Dans les annonces légales, la mention peut figurer, mais tous les greffes ne la publient pas de la même façon. Une radiation d'office ne dit pas à quel moment l'activité s'est arrêtée, et ce n'est pas forcément une fermeture récente. Ces annonces peuvent être publiées par lots, ce qui fait monter fortement le total d'un mois sans que davantage d'entreprises aient fermé ce mois-là.",
    relations: [
      { ficheId: 'radiation', type: 'a-ne-pas-confondre' },
      { ficheId: 'defaillance-entreprise', type: 'voir-aussi' },
      { ficheId: 'siren-ou-siret', type: 'voir-aussi' }
    ]
  },
  {
    id: 'defaillance-entreprise', titre: "Défaillance d'entreprise", titreDeTri: 'Defaillance d entreprise',
    type: 'terme', univers: 'entrepreneuriat-independance', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['faillite', 'entreprise en difficulté', 'liquidation judiciaire', 'redressement judiciaire'],
    corps: "En statistique, une entreprise est dite défaillante quand elle ne peut plus payer ses dettes avec ce qu'elle possède. Elle est comptée le jour où un tribunal ouvre un redressement judiciaire (pour tenter de continuer l'activité) ou une liquidation judiciaire (pour y mettre fin). Le total sur douze mois est la référence : un niveau très bas ou très haut sur une année peut avoir des causes générales, comme des tribunaux fermés ou des aides exceptionnelles. Dans les annonces légales, une même procédure produit plusieurs annonces : compter les annonces n'est pas compter les entreprises.",
    voirAussiChiffres: "Voir les ouvertures de procédures de votre département",
    relations: [
      { ficheId: 'radiation-d-office-entreprise', type: 'voir-aussi' },
      { ficheId: 'vente-fonds-de-commerce', type: 'voir-aussi' },
      { ficheId: 'siren-ou-siret', type: 'voir-aussi' }
    ]
  },
  {
    id: 'vente-fonds-de-commerce', titre: "Vente d'un fonds de commerce", titreDeTri: 'Vente d un fonds de commerce',
    type: 'terme', univers: 'entrepreneuriat-independance', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ['vendre un commerce', 'reprise d\'un commerce', 'cession de commerce', 'changement de propriétaire d\'un commerce'],
    corps: "Quand un commerçant ou un artisan vend son activité (des éléments comme la clientèle, l'enseigne, le matériel et le droit au bail), on parle de vente de fonds de commerce. La vente est annoncée publiquement. Une annonce de vente montre que l'activité change de propriétaire. Elle ne dit pas pourquoi la personne vend, ni ce que deviennent les salariés : ce n'est ni une bonne ni une mauvaise nouvelle en soi.",
    voirAussiChiffres: "Voir les annonces d'achat de fonds de commerce de votre département",
    relations: [
      { ficheId: 'defaillance-entreprise', type: 'voir-aussi' },
      { ficheId: 'auto-entrepreneur', type: 'voir-aussi' },
      { ficheId: 'guichet-unique-entreprises', type: 'voir-aussi' }
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
    variantesRecherche: ['différence entre SIREN et SIRET', 'comparer SIREN et SIRET'],
    corps: "Ce qui les rapproche : les deux sont des numéros attribués par l'Insee à la création d'une entreprise, qui servent à l'identifier dans toutes les démarches. Ce qui les distingue : le SIREN, à neuf chiffres, identifie l'entreprise elle-même et ne change jamais ; le SIRET, à quatorze chiffres (le SIREN plus cinq chiffres), identifie un établissement précis, une adresse d'activité. Une entreprise a un SIREN et un ou plusieurs SIRET.",
    relations: [
      { ficheId: 'guichet-unique-entreprises', type: 'voir-aussi' }
    ]
  },
  {
    id: 'entreprise-individuelle-ou-societe', titre: 'Entreprise individuelle ou société ?', titreDeTri: 'Entreprise individuelle ou societe',
    type: 'notion', gabarit: 'comparatif', univers: 'entrepreneuriat-independance', registres: [],
    variantesRecherche: ['différence entre Entreprise individuelle et société', 'comparer Entreprise individuelle et société'],
    corps: "Ce qui les rapproche : les deux permettent d'exercer une activité indépendante et d'employer des personnes. Ce qui les distingue : en entreprise individuelle, dont la micro-entreprise, il n'y a pas de personne juridique séparée de l'entrepreneur et la gestion est légère ; une société (SARL, SAS, EURL...) crée une entité distincte, avec des statuts, un capital et un fonctionnement plus lourds, mais qui protège mieux le patrimoine personnel et facilite l'association à plusieurs.",
    relations: [
      { ficheId: 'auto-entrepreneur', type: 'voir-aussi' }
    ]
  },
  {
    id: 'salarie-ou-travailleur-non-salarie', titre: 'Salarié ou travailleur non salarié ?', titreDeTri: 'Salarie ou travailleur non salarie',
    type: 'notion', gabarit: 'comparatif', univers: 'entrepreneuriat-independance', registres: [],
    variantesRecherche: ['différence entre Salarié et travailleur non salarié', 'comparer Salarié et travailleur non salarié'],
    corps: "Ce qui les rapproche : les deux désignent des façons de travailler et de cotiser. Ce qui les distingue : le salarié a un contrat de travail, un lien de subordination, une fiche de paie, et cotise notamment à l'assurance chômage ; le travailleur non salarié organise lui-même son activité, relève d'un régime social propre, et n'ouvre pas de droits au chômage classique. Un même métier peut s'exercer sous l'un ou l'autre statut, avec des conséquences différentes en cas d'arrêt d'activité.",
    relations: [
      { ficheId: 'travailleur-non-salarie', type: 'voir-aussi' }
    ]
  },
  {
    id: 'microcredit-personnel-ou-professionnel', titre: 'Microcrédit personnel ou professionnel ?', titreDeTri: 'Microcredit personnel ou professionnel',
    type: 'notion', gabarit: 'comparatif', univers: 'dispositifs', registres: [],
    variantesRecherche: ['différence entre Microcrédit personnel et professionnel', 'comparer Microcrédit personnel et professionnel'],
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
    corps: "Une école de production forme des jeunes de 15 à 18 ans en rupture scolaire, sans qualification et en difficulté sociale. Sous statut scolaire, ils préparent un diplôme professionnel (CAP, bac professionnel ou certification professionnelle) dans des secteurs d'activité en tension : l'automobile, le bâtiment, l'industrie, les métiers du bois, les métiers paysagers, la restauration.",
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
    corps: "L'instruction obligatoire jusqu'à l'âge de 16 ans est prolongée par l'obligation de formation jusqu'à 18 ans. Elle permet à tous les jeunes mineurs sans école, formation ou emploi d'accéder à une solution proposée par l'Éducation nationale, les missions locales ou leurs partenaires : poursuite d'études, retour en formation initiale ou dispositif d'insertion professionnelle. Les missions locales, les centres d'information et d'orientation et les réseaux de partenaires repèrent les jeunes concernés.",
    relations: [
      { ficheId: 'psad', type: 'voir-aussi' },
      { ficheId: 'mission-locale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'psad', titre: "Plateforme de suivi et d'appui aux décrocheurs (PSAD)", titreDeTri: 'Plateforme de suivi et d appui aux decrocheurs',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['PSAD', 'plateforme décrochage', "être recontacté après avoir quitté l'école"],
    corps: "Les plateformes de suivi et d'appui aux décrocheurs (PSAD) interviennent après le repérage, par les missions locales, les centres d'information et d'orientation et les réseaux de partenaires, des jeunes de 16 à 18 ans qui ne sont ni en études, ni en formation, ni en emploi. Elles prennent contact avec ces jeunes pour leur proposer un entretien personnalisé.",
    relations: [
      { ficheId: 'obligation-de-formation', type: 'voir-aussi' },
      { ficheId: 'mission-locale', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'apprentissage-ou-professionnalisation', titre: 'Apprentissage ou professionnalisation ?', titreDeTri: 'Apprentissage ou professionnalisation',
    type: 'notion', gabarit: 'comparatif', univers: 'contrats-statuts-emploi', registres: [],
    variantesRecherche: ['différence entre Apprentissage et professionnalisation', 'comparer Apprentissage et professionnalisation'],
    corps: "Ce qui les rapproche : les deux sont des contrats d'alternance, qui associent un emploi et une formation diplômante ou qualifiante. Ce qui les distingue : le contrat d'apprentissage vise d'abord un diplôme ou un titre, s'adresse surtout aux jeunes et passe par un CFA ; le contrat de professionnalisation vise une qualification reconnue par une branche, s'ouvre plus largement aux adultes en reconversion et aux demandeurs d'emploi, et laisse plus de souplesse à l'organisme de formation.",
    relations: [
      { ficheId: 'alternance', type: 'voir-aussi' },
      { ficheId: 'contrat-d-apprentissage', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ecole-2e-chance-ou-epide', titre: "École de la deuxième chance ou EPIDE ?", titreDeTri: 'Ecole de la deuxieme chance ou EPIDE',
    type: 'notion', gabarit: 'comparatif', univers: 'structures-organismes', registres: [],
    variantesRecherche: ['différence entre École de la deuxième chance et EPIDE', 'comparer École de la deuxième chance et EPIDE'],
    corps: "Ce qui les rapproche : les deux accueillent des jeunes sans diplôme ni emploi, sur la base du volontariat, avec une formation qui travaille les savoirs de base et le projet. À l'Épide, le jeune perçoit une allocation dans le cadre d'un contrat de volontariat pour l'insertion, qui n'est pas un contrat de travail. Ce qui les distingue : l'école de la deuxième chance se suit en journée, près de chez soi, avec beaucoup de stages en entreprise ; l'EPIDE se vit en internat, avec un cadre inspiré du milieu militaire et un travail fort sur le rythme et le collectif.",
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
    variantesRecherche: ['différence entre Statut de réfugié et protection subsidiaire', 'comparer Statut de réfugié et protection subsidiaire'],
    corps: "Ce qui les rapproche : les deux sont accordés par l'OFPRA à des personnes qui ne peuvent pas rentrer dans leur pays sans danger, et ouvrent un titre de séjour, le droit de travailler et les droits sociaux. Ce qui les distingue : le statut de réfugié vise une persécution personnelle liée à des motifs précis (opinions, religion, appartenance à un groupe...) et donne une carte de longue durée ; la protection subsidiaire vise une menace grave d'une autre nature et se renouvelle par périodes plus courtes.",
    relations: [
      { ficheId: 'ofpra', type: 'voir-aussi' }
    ]
  },
  {
    id: 'titre-de-sejour-ou-autorisation-de-travail', titre: "Titre de séjour ou autorisation de travail ?", titreDeTri: 'Titre de sejour ou autorisation de travail',
    type: 'notion', gabarit: 'comparatif', univers: 'droit-travail', registres: [],
    variantesRecherche: ['différence entre Titre de séjour et autorisation de travail', 'comparer Titre de séjour et autorisation de travail'],
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
    corps: "Le bulletin n° 3 est l'extrait du casier judiciaire qui ne mentionne que les condamnations les plus lourdes. Il ne peut être demandé que par la personne concernée, ou son représentant légal si elle est mineure ou sous tutelle. Il ne peut jamais être délivré à un tiers, employeur compris : la personne décide de le montrer ou non. Il se demande en ligne, gratuitement.",
    relations: [
      { ficheId: 'casier-judiciaire', type: 'voir-aussi' },
      { ficheId: 'bulletin-2-ou-bulletin-3', type: 'voir-aussi' },
      { ficheId: 'discrimination-embauche', type: 'voir-aussi' }
    ]
  },
  {
    id: 'bulletin-2-ou-bulletin-3', titre: 'Bulletin n° 2 ou bulletin n° 3 ?', titreDeTri: 'Bulletin n 2 ou bulletin n 3',
    type: 'notion', gabarit: 'comparatif', univers: 'droit-travail', registres: [],
    variantesRecherche: ['différence entre Bulletin n° 2 et bulletin n° 3', 'comparer Bulletin n° 2 et bulletin n° 3'],
    corps: "Ce qui les rapproche : les deux sont des extraits du casier judiciaire, avec moins de mentions que le bulletin n° 1. Ce qui les distingue : le bulletin n° 2 est transmis à certaines autorités, sans passer par la personne, et contient plus de condamnations ; le bulletin n° 3 ne peut être obtenu que par la personne concernée, ne contient que les peines les plus lourdes, et c'est elle qui choisit de le présenter.",
    relations: [
      { ficheId: 'casier-judiciaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'milieu-ouvert-ou-milieu-ferme', titre: 'Milieu ouvert ou milieu fermé ?', titreDeTri: 'Milieu ouvert ou milieu ferme',
    type: 'notion', gabarit: 'comparatif', univers: 'structures-organismes', registres: [],
    variantesRecherche: ['différence entre Milieu ouvert et milieu fermé', 'comparer Milieu ouvert et milieu fermé'],
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
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Cumul emploi-retraite du salarié » (fiche vérifiée le 1er janvier 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F13243" },
      lignes: [
        { libelle: "Plafond du cumul plafonné", valeur: "160 % du Smic, soit 2 916,85 € brut par mois, ou le dernier salaire mensuel brut si c'est plus avantageux", categorie: 'montant', peutChanger: true },
        { libelle: "Activité de faible importance (cumul intégral sans taux plein)", valeur: "moins du tiers du Smic annuel : 7 292,13 € brut pour une retraite en 2026", categorie: 'montant', peutChanger: true },
        { libelle: "Cumul intégral", valeur: "retraite à taux plein et toutes les pensions liquidées, entre 62 et 67 ans avec le nombre de trimestres exigé, ou à 67 ans et plus", categorie: 'seuil', peutChanger: true },
        { libelle: "Changement des règles", valeur: "à compter du 1er janvier 2027 (loi de financement de la sécurité sociale pour 2026)", categorie: 'date', peutChanger: true }
      ],
      phraseGenerale: "Reprendre un travail en étant retraité est possible, avec ou sans plafond selon la situation. Les plafonds changent chaque année et les règles vont changer : vérifiez-les sur la page officielle ou auprès de l'Assurance retraite."
    },
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
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Retraite progressive du salarié » (fiche vérifiée le 17 novembre 2025)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F12842" },
      lignes: [
        { libelle: "Âge minimum", valeur: "60 ans", categorie: 'seuil', peutChanger: true },
        { libelle: "Durée d'assurance", valeur: "150 trimestres", categorie: 'seuil', peutChanger: true },
        { libelle: "Temps partiel", valeur: "entre 40 % et 80 % d'un temps complet", categorie: 'pourcent', peutChanger: true },
        { libelle: "Demande à l'employeur", valeur: "au moins 2 mois avant la date souhaitée, par lettre recommandée", categorie: 'duree', peutChanger: true },
        { libelle: "Demande aux caisses de retraite", valeur: "au plus tôt 5 mois avant la date souhaitée", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "La retraite progressive permet de réduire son temps de travail en touchant une partie de sa retraite. L'âge, le nombre de trimestres et les délais changent : vérifiez-les sur la page officielle."
    },
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
    variantesRecherche: ['différence entre Cumul intégral et cumul plafonné', 'comparer Cumul intégral et cumul plafonné'],
    corps: "Ce qui les rapproche : dans les deux cas, on travaille tout en percevant sa retraite. Ce qui les distingue : le cumul intégral verse la pension en entier, sans limite de revenu, mais suppose d'avoir liquidé toutes ses retraites au taux plein ; le cumul plafonné s'applique quand ces conditions ne sont pas réunies : le total salaire plus pension ne doit pas dépasser un seuil, sinon la pension est réduite. L'entretien information retraite aide à savoir dans quel cas on se trouve.",
    relations: [
      { ficheId: 'cumul-emploi-retraite', type: 'voir-aussi' }
    ]
  },
  {
    id: 'depart-volontaire-ou-mise-a-la-retraite', titre: 'Départ volontaire ou mise à la retraite ?', titreDeTri: 'Depart volontaire ou mise a la retraite',
    type: 'notion', gabarit: 'comparatif', univers: 'droit-travail', registres: [],
    variantesRecherche: ['différence entre Départ volontaire et mise à la retraite', 'comparer Départ volontaire et mise à la retraite'],
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
    corps: "Les garages solidaires, le plus souvent constitués sous forme associative, offrent des services d'entretien et de réparation de véhicules à tarif solidaire, soit directement auprès de publics en difficulté, soit en soutien d'activités de vente, de location ou d'autres services de mobilité qui leur sont destinés.",
    relations: [
      { ficheId: 'aide-a-la-mobilite', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'auto-ecole-sociale', titre: 'Auto-école sociale et solidaire', titreDeTri: 'Auto-ecole sociale et solidaire',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip'],
    variantesRecherche: ['auto-école associative', "passer le permis quand on a peu de moyens", 'permis accompagné insertion'],
    corps: "Une auto-école sociale et solidaire, ou associative, forme à la conduite et à la sécurité routière des personnes en difficulté d'insertion ou en situation de handicap, avec un accompagnement individualisé et un suivi social et professionnel. Le public est généralement orienté par les travailleurs sociaux, la Mission locale ou France Travail.",
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
    corps: "Une plateforme de mobilité est un dispositif d'animation et de coopération au service de tous les acteurs locaux concernés (collectivités, acteurs de l'emploi, de l'insertion et de la mobilité, associations, employeurs). Elle est accessible à toute personne recensée par un prescripteur : bénéficiaire du RSA, demandeur d'emploi, salarié en insertion, jeune éloigné de l'emploi. Elle sert à lever le frein « je ne peux pas m'y rendre ».",
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
    variantesRecherche: ['différence entre Permis suspendu et annulé', 'comparer Permis suspendu et annulé'],
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
    corps: "Dans une maison d'assistants maternels (MAM), plusieurs assistants maternels agréés se regroupent pour accueillir les enfants dans un lieu dédié, spécialement aménagé pour leur sécurité, leur éveil et leur bien-être.",
    relations: [
      { ficheId: 'aides-garde-enfants', type: 'voir-aussi' },
      { ficheId: 'relais-petite-enfance', type: 'voir-aussi' }
    ]
  },
  {
    id: 'relais-petite-enfance', titre: 'Relais petite enfance (RPE)', titreDeTri: 'Relais petite enfance',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-cip', 'langage-administratif'],
    variantesRecherche: ['RPE', 'RAM', 'où trouver une assistante maternelle', 'information mode de garde'],
    corps: "Un relais petite enfance (RPE) est un lieu gratuit d'information et d'accompagnement pour les parents et les professionnels de l'accueil du jeune enfant. Il informe sur les différents modes d'accueil existants et accompagne les parents dans leurs recherches pour trouver une solution de garde adaptée. Il accompagne aussi les assistants maternels et les professionnels de la garde à domicile dans l'exercice de leur métier. C'est un bon premier contact quand on cherche une solution de garde pour reprendre un emploi ou une formation.",
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
    corps: "Une crèche à vocation d'insertion professionnelle (AVIP) a pour objectif de faciliter l'accès à l'emploi des parents de jeunes enfants. Ce dispositif, créé par le Gouvernement, Pôle emploi (aujourd'hui France Travail) et la Cnaf, propose aux parents demandeurs d'emploi un service pour faire garder leurs enfants pendant leurs démarches de recherche d'emploi.",
    relations: [
      { ficheId: 'aides-garde-enfants', type: 'voir-aussi' },
      { ficheId: 'frein-emploi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aripa', titre: "Aripa (recouvrement des pensions alimentaires)", titreDeTri: 'Aripa',
    type: 'terme', univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['Aripa', 'pension alimentaire pas payée', 'récupérer une pension alimentaire', 'GIPA'],
    corps: "L'Aripa (agence de recouvrement et d'intermédiation des pensions alimentaires) est un service public qui accompagne les parents isolés dans le recouvrement des pensions alimentaires non versées. Elle se charge de sécuriser le versement des pensions, de recouvrer les impayés et, si nécessaire, de verser une allocation de soutien familial pour compenser les retards ou les défauts de paiement. Ses démarches sont gratuites.",
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
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Indemnité de fin de contrat (prime de précarité) » (fiche vérifiée le 6 octobre 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F803" },
      lignes: [
        { libelle: "Montant minimal", valeur: "10 % de la rémunération brute totale versée pendant le contrat", categorie: 'pourcent', peutChanger: true }
      ],
      phraseGenerale: "La prime de précarité est due à la fin d'un CDD ou d'une mission d'intérim, sauf cas particuliers. Le pourcentage peut être plus élevé selon la convention collective : vérifiez-le sur la page officielle."
    },
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
    variantesRecherche: ["différence entre CDD classique et CDD d'insertion", "comparer CDD classique et CDD d'insertion"],
    corps: "Ce qui les rapproche : les deux sont des contrats à durée déterminée, avec un salaire et les droits de base d'un salarié. Ce qui les distingue : le CDD classique répond à un besoin ponctuel de l'employeur (remplacement, surcroît) ; le CDD d'insertion est signé avec une structure de l'insertion par l'activité économique, il inclut un accompagnement et de la formation, et son but est le retour vers l'emploi ordinaire, pas la production seule. Le CDD d'insertion ne donne pas de prime de précarité.",
    relations: [
      { ficheId: 'cddi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prime-de-precarite-ou-indemnite-de-licenciement', titre: 'Prime de précarité ou indemnité de licenciement ?', titreDeTri: 'Prime de precarite ou indemnite de licenciement',
    type: 'notion', gabarit: 'comparatif', univers: 'bulletin-salaire', registres: [],
    variantesRecherche: ['différence entre Prime de précarité et indemnité de licenciement', 'comparer Prime de précarité et indemnité de licenciement'],
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
    corps: "Un atelier sociolinguistique (ASL) fait partie de l'offre pour apprendre le français, à côté de celles des mairies, des associations, de l'OFII et des directions académiques. Dans l'exemple de centres sociaux de Poitiers, il s'adresse aux adultes migrants non étudiants et vise à communiquer plus facilement en français et à connaître le fonctionnement des institutions (école, poste, mairie). Pour savoir ce qui existe près de chez vous, renseignez-vous à la mairie ou auprès d'un travailleur social.",
    relations: [
      { ficheId: 'fle', type: 'voir-aussi' },
      { ficheId: 'competences-de-base', type: 'voir-aussi' },
      { ficheId: 'oepre', type: 'voir-aussi' }
    ]
  },
  {
    id: 'illettrisme-ou-illectronisme', titre: 'Illettrisme ou illectronisme ?', titreDeTri: 'Illettrisme ou illectronisme',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: [],
    variantesRecherche: ['différence entre Illettrisme et illectronisme', 'comparer Illettrisme et illectronisme'],
    corps: "Ce qui les rapproche : les deux désignent une difficulté avec des savoirs devenus indispensables au quotidien, sans lien avec l'intelligence. Ce qui les distingue : l'illettrisme concerne une personne scolarisée en France qui n'a pas gardé une maîtrise suffisante de la lecture, de l'écriture ou du calcul ; l'illectronisme concerne l'usage du numérique (internet, démarches en ligne, outils de base). Une même personne peut être à l'aise sur l'un et en difficulté sur l'autre.",
    relations: [
      { ficheId: 'illettrisme', type: 'voir-aussi' }
    ]
  },
  {
    id: 'alphabetisation-ou-fle', titre: 'Alphabétisation ou français langue étrangère ?', titreDeTri: 'Alphabetisation ou francais langue etrangere',
    type: 'notion', gabarit: 'comparatif', univers: 'formation', registres: [],
    variantesRecherche: ['différence entre Alphabétisation et français langue étrangère', 'comparer Alphabétisation et français langue étrangère'],
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
      { ficheId: 'pix', type: 'voir-aussi' },
      { ficheId: 'franceconnect', type: 'voir-aussi' },
      { ficheId: 'personne-de-confiance', type: 'a-ne-pas-confondre' }
    ]
  },

  {
    id: 'conseiller-numerique', titre: 'Conseiller numérique', titreDeTri: 'Conseiller numerique', type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['conseiller numérique France Services', 'atelier informatique gratuit', "apprendre à se servir d'un ordinateur", 'aide pour le téléphone et internet'],
    corps: "Un conseiller numérique est un professionnel qui aide les personnes à devenir autonomes avec le numérique au quotidien : prendre en main un ordinateur, un téléphone ou une tablette, écrire à ses proches, se protéger sur internet, faire ses démarches, chercher un emploi. Il propose des ateliers collectifs ou des rendez-vous individuels. On le rencontre dans des lieux accueillants : mairie, association, médiathèque, France Services. Le site officiel conseiller-numerique.gouv.fr permet de trouver celui qui est près de chez soi. Se renseigner auprès du lieu qui l'accueille pour savoir comment prendre rendez-vous.",
    relations: [
      { ficheId: 'france-services', type: 'voir-aussi' },
      { ficheId: 'illectronisme', type: 'voir-aussi' },
      { ficheId: 'tiers-de-confiance-numerique', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'identite-numerique', titre: 'Identité numérique (France Identité)', titreDeTri: 'Identite numerique France Identite', type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['France Identité', "carte d'identité sur le téléphone", 'prouver son identité en ligne', "application carte d'identité"],
    corps: "L'identité numérique permet de prouver qui l'on est sur internet, sans avoir à retenir un identifiant et un mot de passe de plus. En France, l'application officielle France Identité s'appuie sur la nouvelle carte d'identité (au format carte bancaire) : elle permet de se connecter aux démarches en ligne par FranceConnect, de produire un justificatif sans photocopier sa carte et de présenter son identité en face-à-face. Il faut être majeur, avoir cette nouvelle carte et un téléphone compatible NFC. Ceux qui n'ont pas ce téléphone ou cette carte gardent les autres moyens de connexion, et un lieu France Services ou un conseiller numérique peut aider.",
    relations: [
      { ficheId: 'franceconnect', type: 'voir-aussi' },
      { ficheId: 'france-services', type: 'voir-aussi' },
      { ficheId: 'tiers-de-confiance-numerique', type: 'voir-aussi' }
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
    variantesRecherche: ['différence entre Sous-traitance et co-traitance', 'comparer Sous-traitance et co-traitance'],
    corps: "Ce qui les rapproche : dans les deux cas, plusieurs entreprises interviennent sur un même marché. Ce qui les distingue : en sous-traitance, une seule entreprise est titulaire et confie une part du travail à une autre, qui dépend d'elle ; en co-traitance, les entreprises sont toutes titulaires, à égalité, et signent ensemble avec le client. Pour une structure d'insertion, la co-traitance donne une place plus visible et plus autonome.",
    relations: [
      { ficheId: 'sous-traitance', type: 'voir-aussi' }
    ]
  },
  {
    id: 'moins-disant-ou-mieux-disant', titre: 'Moins-disant ou mieux-disant ?', titreDeTri: 'Moins-disant ou mieux-disant',
    type: 'notion', gabarit: 'comparatif', univers: 'organisation-travail-management', registres: [],
    variantesRecherche: ['différence entre Moins-disant et mieux-disant', 'comparer Moins-disant et mieux-disant'],
    corps: "Ce qui les rapproche : les deux décrivent la façon dont un acheteur public choisit une entreprise parmi les offres reçues. Ce qui les distingue : le « moins-disant » retient l'offre la moins chère ; le « mieux-disant » retient l'offre la plus intéressante au regard de plusieurs critères : prix, mais aussi qualité, délais, environnement, insertion sociale. La commande publique encourage le mieux-disant, ce qui rend possibles les clauses sociales.",
    relations: [
      { ficheId: 'clause-sociale', type: 'voir-aussi' }
    ]
  },
  {
    id: 'clause-d-execution-ou-critere-d-attribution', titre: "Clause d'exécution ou critère d'attribution ?", titreDeTri: 'Clause d execution ou critere d attribution',
    type: 'notion', gabarit: 'comparatif', univers: 'organisation-travail-management', registres: [],
    variantesRecherche: ["différence entre Clause d'exécution et critère d'attribution", "comparer Clause d'exécution et critère d'attribution"],
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
    corps: "Le CAPE (contrat d'appui au projet d'entreprise) permet de préparer la création d'une activité avec l'appui d'une structure accompagnatrice (une entreprise ou une association, par exemple une coopérative d'activité et d'emploi), en conservant sous conditions ses aides sociales, comme l'allocation chômage ou le RSA. Il dure un an au plus, renouvelable deux fois, soit jusqu'à 36 mois.",
    relations: [
      { ficheId: 'cae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'garantie-de-pret', titre: 'Garantie de prêt', titreDeTri: 'Garantie de pret',
    type: 'terme', univers: 'entrepreneuriat-independance', registres: ['langage-administratif'],
    variantesRecherche: ['garantir un pret de creation', 'caution creation entreprise'],
    corps: "La garantie de prêt est l'engagement d'un organisme qui couvre une partie du risque de défaut de paiement de l'emprunteur, ce qui sécurise la banque et facilite l'obtention du prêt. France Active, par exemple, peut garantir le prêt d'un créateur en excluant ou en limitant les cautions personnelles. Bpifrance garantit aussi des prêts accordés par les banques.",
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
    corps: "La prévoyance complémentaire couvre une perte de revenu en cas d'incapacité de travail, d'invalidité ou de décès, en complément des prestations de la Sécurité sociale. Pour les cadres, un accord national interprofessionnel prévoit une cotisation à la charge exclusive de l'employeur, affectée par priorité à la couverture en cas de décès ; pour les autres salariés, les règles dépendent de la convention collective.",
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
    corps: "Le délégué syndical est désigné par un syndicat représentatif pour négocier avec l'employeur. Chaque syndicat représentatif dans une entreprise ou un établissement d'au moins 50 salariés peut en désigner un. Dans un établissement plus petit, les syndicats représentatifs peuvent désigner, pour la durée de son mandat, un membre de la délégation du personnel au CSE comme délégué syndical. C'est un mandat distinct de celui d'élu du CSE, même si la même personne peut cumuler les deux.",
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
    corps: "La prépa-apprentissage était un accompagnement de quelques jours à quelques mois pour préparer une entrée en apprentissage, en acquérant les compétences de base et transversales. Selon le ministère du Travail, ces accompagnements sont terminés : renseignez-vous auprès de la Mission locale sur ce qui existe aujourd'hui.",
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
    corps: "Transitions Pro (anciennement Fongecif) est une association régionale, paritaire, qui examine les demandes de financement du projet de transition professionnelle (PTP) pour un salarié qui veut changer de métier, en vérifiant la pertinence du projet. Elle présente aussi d'autres dispositifs de reconversion, comme la démission-reconversion.",
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
    corps: "Le français à visée professionnelle est un parcours de formation qui vise à développer son autonomie linguistique dans les situations de la vie quotidienne et professionnelle, à acquérir les compétences en français attendues dans le monde du travail, à construire ou consolider un projet professionnel réaliste, à maîtriser les codes de l'entreprise française, à favoriser un accès rapide à l'emploi ou à la formation qualifiante, et à préparer une certification officielle.",
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
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Naturalisation par décret » (fiche vérifiée le 16 juillet 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2213" },
      lignes: [
        { libelle: "Résidence en France exigée", valeur: "5 ans, ou 2 ans dans certains cas (diplômés de l'enseignement supérieur français, services rendus à la France, intégration exceptionnelle)", categorie: 'duree', peutChanger: true },
        { libelle: "Timbre fiscal", valeur: "255 € (127,50 € en Guyane)", categorie: 'montant', peutChanger: true },
        { libelle: "Délai de réponse de l'administration", valeur: "18 mois à partir du récépissé, 12 mois si l'on vit en France depuis au moins 10 ans", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "La naturalisation par décret demande une durée de résidence, une connaissance suffisante du français et un timbre fiscal. Les durées et les montants changent : vérifiez-les sur la page officielle."
    },
    relations: [
      { ficheId: 'examen-civique', type: 'voir-aussi' }
    ]
  },
  {
    id: 'examen-civique', titre: 'Examen civique', titreDeTri: 'Examen civique',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['examen civique naturalisation', 'questionnaire valeurs de la republique', 'test civique quarante questions'],
    corps: "L'examen civique est un questionnaire en français, obligatoire depuis le 1er janvier 2026, sur les valeurs, les institutions, l'histoire et le fonctionnement de la société françaises. Il est exigé pour la naturalisation par décret et pour certaines cartes de séjour de longue durée, avec des dispenses (personnes réfugiées, personnes âgées installées depuis longtemps, handicap empêchant l'évaluation).",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Examen civique » (fiche vérifiée le 16 juillet 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F39426" },
      lignes: [
        { libelle: "Nombre de questions", valeur: "40, à choix multiples", categorie: 'seuil', peutChanger: true },
        { libelle: "Bonnes réponses nécessaires", valeur: "32", categorie: 'seuil', peutChanger: true },
        { libelle: "Durée maximale", valeur: "45 minutes", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "L'examen civique est un questionnaire passé sur support numérique dans un centre agréé. Le nombre de questions et le seuil de réussite peuvent changer : vérifiez-les sur la page officielle."
    },
    relations: [
      { ficheId: 'naturalisation-par-decret', type: 'voir-aussi' }
    ]
  },
  {
    id: 'accord-de-reciprocite', titre: 'Accord de réciprocité (permis de conduire)', titreDeTri: 'Accord de reciprocite permis de conduire',
    type: 'terme', univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ['echanger permis etranger', 'accord reciprocite permis', 'pays accord permis conduire'],
    corps: "Un accord de réciprocité est un accord entre la France et un autre pays qui permet d'échanger le permis de conduire de l'un contre celui de l'autre, sans repasser l'examen. Il ne concerne que certains pays hors Union européenne : sans un tel accord, il faut repasser le code et la conduite en France.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Échange d'un permis de conduire étranger » (fiche vérifiée le 1er juin 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1460" },
      lignes: [
        { libelle: "Timbre fiscal électronique", valeur: "40 € (20 € en Guyane), payé à la fin de la démarche en ligne", categorie: 'montant', peutChanger: true },
        { libelle: "Validité d'un permis hors UE et EEE après installation", valeur: "1 an à partir de la résidence normale en France", categorie: 'duree', peutChanger: true },
        { libelle: "Délai pour demander l'échange, étranger arrivé en France", valeur: "1 an à compter de la résidence normale", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "Un permis étranger peut s'échanger contre un permis français, dans un délai limité après l'installation en France. Le prix et les délais changent selon le pays d'origine : vérifiez-les sur la page officielle."
    },
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
    corps: "La levée d'écrou est la formalité par laquelle l'administration pénitentiaire met fin à l'écrou d'une personne, c'est-à-dire à sa détention. La date de sortie, ainsi que la décision ou le texte de loi qui motive la libération, sont notés sur l'acte d'écrou. Les démarches liées à la sortie se préparent avec le conseiller pénitentiaire d'insertion et de probation.",
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
  },
  {
    id: 'cmg',
    titre: "CMG (complément de libre choix du mode de garde)",
    titreDeTri: "CMG", type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ["complément mode de garde", "aide de la CAF pour la garde", "aide assistante maternelle", "aide garde à domicile"],
    corps: "Le CMG « emploi direct » est une aide versée par la Caf, ou par la MSA, à un parent qui emploie lui-même une assistante maternelle agréée ou une garde à domicile pour garder son enfant. Il prend en charge une partie du coût de la garde. En général, l'enfant doit avoir moins de 6 ans ; un parent isolé peut le toucher jusqu'aux 12 ans de l'enfant. Il fait partie de la Paje, l'ensemble des aides pour l'accueil du jeune enfant, et une autre version existe pour l'accueil dans une structure, décrite sur une page à part. Le montant dépend des ressources du foyer, du nombre d'enfants, du coût horaire de la garde et du nombre d'heures de garde par mois. Les cotisations sociales sont prises en charge à 100 % pour une assistante maternelle agréée et à 50 % pour une garde à domicile, dans la limite d'un plafond mensuel. Chaque mois, le parent déclare la rémunération versée sur le service Pajemploi, qui calcule et verse le CMG. Un simulateur permet d'estimer le montant.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « Complément de libre choix de mode de garde (CMG) : emploi direct » (vérifiée le 26 juin 2026)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F39152' },
      lignes: [
        { libelle: "Âge de l'enfant (cas général)", valeur: 'moins de 6 ans', categorie: 'seuil', peutChanger: true },
        { libelle: "Âge de l'enfant (parent isolé)", valeur: "jusqu'aux 12 ans de l'enfant", categorie: 'seuil', peutChanger: true },
        { libelle: 'Cotisations sociales prises en charge', valeur: "100 % pour une assistante maternelle agréée ; 50 % pour une garde à domicile, dans la limite d'un plafond mensuel", categorie: 'pourcent', peutChanger: true },
        { libelle: 'Résidence alternée', valeur: 'depuis le 1er décembre 2025, le CMG peut être versé à chacun des 2 parents, avec un montant propre à chacun', categorie: 'date', peutChanger: false },
        { libelle: 'Diminution possible du CMG', valeur: 'à compter du 1er septembre 2025 (la page officielle renvoie à un détail)', categorie: 'date', peutChanger: false }
      ],
      phraseGenerale: "Le CMG « emploi direct » est une aide versée par la Caf, ou par la MSA, à un parent qui emploie lui-même une assistante maternelle agréée ou une garde à domicile pour garder son enfant. Elle prend en charge une partie du coût de la garde. L'âge de l'enfant, les montants et les plafonds changent régulièrement : le service Pajemploi calcule et verse l'aide, un simulateur permet de l'estimer, et la source officielle donne les règles en vigueur."
    },
    relations: [
      { ficheId: 'aides-garde-enfants', type: 'voir-aussi' },
      { ficheId: 'pajemploi', type: 'voir-aussi' },
      { ficheId: 'relais-petite-enfance', type: 'voir-aussi' }
    ]
  },
  {
    id: 'avance-loca-pass',
    titre: "Avance Loca-Pass (aide au dépôt de garantie)",
    titreDeTri: "Avance Loca-Pass", type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ["Loca-Pass", "LocaPass", "avance dépôt de garantie", "aide caution logement"],
    corps: "L'avance Loca-Pass est un prêt, sans intérêts et sans frais de dossier, accordé par Action Logement à un locataire qui n'a pas les moyens d'avancer le dépôt de garantie. C'est donc une avance à rembourser, pas une aide gratuite : les conditions de remboursement dépendent de la durée du bail. Elle peut financer le dépôt de garantie en totalité ou en partie, jusqu'à 1 200 €. Elle s'adresse notamment aux personnes de moins de 30 ans, aux étudiants et aux salariés ou préretraités du secteur privé hors agricole, selon des conditions précises. La demande se fait entièrement en ligne, après un test d'éligibilité, au plus tard 2 mois après l'entrée dans le logement. À ne pas confondre avec la garantie Visale, qui remplace le garant et non le dépôt de garantie.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « Avance Loca-Pass : aide au locataire pour le dépôt de garantie » (vérifiée le 11 septembre 2026)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F18490' },
      lignes: [
        { libelle: "Montant maximum de l'avance", valeur: '1 200 €', categorie: 'montant', peutChanger: true },
        { libelle: 'Délai pour faire la demande', valeur: "au plus tard 2 mois après l'entrée dans le logement", categorie: 'duree', peutChanger: true },
        { libelle: 'Public (jeunes)', valeur: "moins de 30 ans, en formation en alternance, en recherche d'emploi ou en emploi non permanent", categorie: 'seuil', peutChanger: true },
        { libelle: 'Logement', valeur: 'résidence principale, en métropole, dans les Drom ou à Saint-Martin', categorie: 'seuil', peutChanger: true },
        { libelle: 'Remboursement', valeur: 'les conditions dépendent de la durée du bail : 25 mois ou plus, ou moins de 25 mois', categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "L'avance Loca-Pass est un prêt, sans intérêts, accordé par Action Logement à un locataire qui n'a pas les moyens d'avancer le dépôt de garantie. C'est une avance à rembourser, pas une aide gratuite. Le montant, les personnes concernées et le délai pour faire la demande changent : consultez la source officielle avant de la faire."
    },
    relations: [
      { ficheId: 'visale', type: 'a-ne-pas-confondre' },
      { ficheId: 'aides-au-logement', type: 'voir-aussi' },
      { ficheId: 'mobili-jeune', type: 'voir-aussi' }
    ]
  },
  {
    id: 'rgdu',
    titre: "RGDU (réduction générale dégressive unique des cotisations patronales)",
    titreDeTri: "RGDU", type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif', 'langage-rh'],
    variantesRecherche: ["réduction générale", "réduction Fillon", "allègement de cotisations patronales", "exonération bas salaires"],
    corps: "La RGDU est une réduction des cotisations sociales que paie l'employeur. Elle est la plus forte au niveau du Smic et diminue à mesure que le salaire augmente. Depuis le 1er janvier 2026, elle s'applique aux rémunérations inférieures à 3 fois le Smic, et elle porte le nom de « réduction générale dégressive unique ». Pour la salariée ou le salarié, rien ne change sur la fiche de paie : la réduction concerne seulement ce que l'employeur verse en plus du salaire. Les particuliers employeurs ne sont pas concernés.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr (entreprises), fiche « Réduction générale dégressive unique (RGDU) de cotisations patronales » (vérifiée le 15 juin 2026)', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F24542' },
      lignes: [
        { libelle: 'Plafond de rémunération', valeur: '3 fois le Smic au 1er janvier 2026 (ou 2,9293 Smic au 1er juin 2026, selon le calcul)', categorie: 'seuil', peutChanger: true },
        { libelle: 'Smic mensuel brut retenu', valeur: '1 823,03 €', categorie: 'montant', peutChanger: true },
        { libelle: 'Mayotte', valeur: '1,6 Smic en 2026', categorie: 'seuil', peutChanger: true },
        { libelle: 'Particuliers employeurs', valeur: 'non concernés', categorie: 'seuil', peutChanger: false }
      ],
      phraseGenerale: "La RGDU est une réduction des cotisations sociales que paie l'employeur. Elle est la plus forte pour les salaires les plus bas et diminue à mesure que le salaire augmente. Pour la salariée ou le salarié, rien ne change sur la fiche de paie. Les seuils et les taux changent régulièrement : consultez la source officielle."
    },
    relations: [
      { ficheId: 'cotisations-sociales', type: 'voir-aussi' },
      { ficheId: 'cout-employeur', type: 'voir-aussi' }
    ]
  },
  {
    id: 'leasing-social',
    titre: "Leasing social (location sociale de voitures électriques)",
    titreDeTri: "Leasing social", type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ["location voiture électrique pas chère", "voiture électrique 200 euros par mois", "location sociale voiture électrique", "leasing social 2026"],
    corps: "Le leasing social est une aide de l'État pour louer une voiture électrique neuve avec un loyer mensuel plafonné à 200 € TTC, sur au moins 3 ans. Il s'adresse aux personnes majeures dont le revenu fiscal de référence par part est de 16 880 € au plus et qui font beaucoup de route pour leur travail : plus de 10 kilomètres entre le domicile et le lieu de travail avec leur véhicule personnel, ou plus de 8 000 kilomètres par an pour leur activité. On fait la demande auprès d'un professionnel de l'automobile, qui vérifie les conditions, avance l'aide et la déduit du premier loyer, qui est alors de 0 €. L'édition 2026 s'applique aux contrats signés à partir du 16 juillet 2026. On ne peut en bénéficier qu'une seule fois, et les conditions peuvent changer à chaque édition.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « Location sociale de voitures électriques (Leasing social 2026) » (vérifiée le 31 juillet 2026)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F39280' },
      lignes: [
        { libelle: 'Revenu fiscal de référence par part', valeur: '16 880 € au plus', categorie: 'seuil', peutChanger: true },
        { libelle: 'Distance domicile-travail (ou kilométrage professionnel)', valeur: 'plus de 10 km avec son véhicule personnel, ou plus de 8 000 km par an dans le cadre de son activité', categorie: 'seuil', peutChanger: true },
        { libelle: 'Loyer mensuel', valeur: '200 € TTC au plus, hors assurances obligatoires et options ; au moins un modèle proposé à 140 € ou moins (hors Outre-mer)', categorie: 'montant', peutChanger: true },
        { libelle: 'Durée du contrat', valeur: "3 ans ou plus ; pour l'édition 2026, contrat signé à partir du 16 juillet 2026, jusqu'au 31 décembre 2031", categorie: 'duree', peutChanger: true },
        { libelle: "Montant de l'aide", valeur: "29 % du coût d'achat hors options, plafonnée à 6 500 € (9 000 € si le véhicule est produit en Europe)", categorie: 'montant', peutChanger: true },
        { libelle: 'Cumul', valeur: 'pas de cumul avec la prime « coup de pouce » pour les véhicules électriques', categorie: 'ref', peutChanger: true }
      ],
      phraseGenerale: "Le leasing social est une aide de l'État pour louer une voiture électrique neuve avec un loyer mensuel réduit, pour des personnes à revenus modestes qui font beaucoup de route pour leur travail. La demande se fait auprès d'un professionnel de l'automobile. Le loyer, les conditions de revenu et de distance et les dates de chaque édition changent : consultez la source officielle."
    },
    relations: [
      { ficheId: 'aide-a-la-mobilite', type: 'voir-aussi' },
      { ficheId: 'aide-carburant-grands-rouleurs', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pacte-europeen-asile',
    titre: "Pacte européen sur la migration et l'asile",
    titreDeTri: "Pacte européen asile", type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ["pacte asile", "pacte migration asile", "règlement Dublin", "procédure Dublin"],
    corps: "Le Pacte européen sur la migration et l'asile est entré en application le 12 juin 2026. Pour l'emploi, deux points comptent. Pour une demande d'asile déposée depuis cette date, le délai de 6 mois avant de pouvoir demander une autorisation de travail court à partir de l'enregistrement de la demande au guichet unique des demandeurs d'asile ; avant le 12 juin 2026, il courait à partir de son introduction devant l'Ofpra. Et une personne qui fait l'objet d'une décision de transfert vers l'État européen responsable de sa demande (procédure dite « Dublin ») n'a plus le droit d'accéder au marché du travail depuis le 12 juin 2026. Pour une situation précise, voyez une association d'aide aux demandeurs d'asile ou la préfecture.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: "Service-public.gouv.fr, fiche « Accès au travail du demandeur d'asile » (vérifiée le 16 septembre 2026)", url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2741' },
      lignes: [
        { libelle: 'Entrée en application du Pacte', valeur: '12 juin 2026', categorie: 'date', peutChanger: false },
        { libelle: 'Délai avant une autorisation de travail', valeur: "6 mois après le dépôt de la demande d'asile", categorie: 'duree', peutChanger: true },
        { libelle: 'Point de départ du délai (demande déposée avant le 12 juin 2026)', valeur: "date d'introduction de la demande devant l'Ofpra", categorie: 'date', peutChanger: false },
        { libelle: 'Point de départ du délai (demande déposée depuis le 12 juin 2026)', valeur: "date d'enregistrement de la demande auprès du guichet unique des demandeurs d'asile (GUDA)", categorie: 'date', peutChanger: true },
        { libelle: 'Procédure « Dublin »', valeur: "plus de droit d'accéder au marché du travail depuis le 12 juin 2026", categorie: 'date', peutChanger: true }
      ],
      phraseGenerale: "Le Pacte européen sur la migration et l'asile est une réforme européenne qui change certaines règles de la demande d'asile, notamment le moment à partir duquel une personne peut demander une autorisation de travail, et l'accès au marché du travail dans certains cas de transfert vers un autre État européen. Pour une situation précise, voyez une association d'aide aux demandeurs d'asile ou la préfecture, et consultez la source officielle."
    },
    relations: [
      { ficheId: 'ofpra', type: 'voir-aussi' },
      { ficheId: 'attestation-de-demande-d-asile', type: 'voir-aussi' },
      { ficheId: 'autorisation-de-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'taxe-d-apprentissage-habilitation',
    titre: "Taxe d'apprentissage : l'habilitation des établissements",
    titreDeTri: "Taxe d'apprentissage", type: 'terme',
    univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ["taxe apprentissage", "solde taxe apprentissage", "SOLTéA", "habilitation CFA"],
    corps: "La taxe d'apprentissage est une contribution versée par des employeurs. Une partie, appelée le solde, peut être attribuée à des établissements de formation, à condition qu'ils soient habilités. La campagne d'habilitation 2027 est ouverte depuis le 26 octobre 2026 : les établissements et les centres de formation d'apprentis qui veulent percevoir le solde déposent leur demande sur la plateforme SOLTéA jusqu'au 11 décembre 2026 inclus, pour une première demande comme pour un renouvellement, qui n'est pas automatique. Seule la publication des listes officielles, avant la fin du deuxième trimestre 2027, permet de savoir quels établissements sont habilités. Pour une personne qui cherche une formation, cela ne change rien à ses démarches : c'est l'affaire de l'établissement.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: "Cap Métiers Nouvelle-Aquitaine, « Campagne d'habilitation 2027 pour la taxe d'apprentissage » (30 octobre 2026)", url: 'https://pro.cap-metiers.fr/organismes-de-formation/campagne-dhabilitation-2027-pour-la-taxe-apprentissage/' },
      lignes: [
        { libelle: 'Campagne 2027', valeur: 'ouverte depuis le 26 octobre 2026', categorie: 'date', peutChanger: true },
        { libelle: 'Date limite de dépôt des demandes', valeur: '11 décembre 2026', categorie: 'date', peutChanger: true },
        { libelle: "Fin de l'instruction des dossiers", valeur: '22 février 2027', categorie: 'date', peutChanger: true },
        { libelle: 'Publication des listes officielles', valeur: 'avant la fin du deuxième trimestre 2027, par arrêtés préfectoraux ou interministériel', categorie: 'date', peutChanger: true }
      ],
      phraseGenerale: "La taxe d'apprentissage est une contribution versée par des employeurs. Une partie peut être attribuée à des établissements de formation, à condition qu'ils soient habilités, après une demande faite chaque année sur la plateforme prévue. Pour une personne qui cherche une formation, cela ne change rien à ses démarches : c'est l'affaire de l'établissement. Les dates de la campagne changent chaque année : consultez la source officielle."
    },
    relations: [
      { ficheId: 'cfa', type: 'voir-aussi' },
      { ficheId: 'opco', type: 'voir-aussi' },
      { ficheId: 'contrat-d-apprentissage', type: 'voir-aussi' }
    ]
  },
  {
    id: 'indemnite-solidarite-nationale',
    titre: "ISN (indemnité de solidarité nationale, pertes de récoltes)",
    titreDeTri: "ISN", type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ["indemnité de solidarité nationale", "calamité agricole", "AléaNAT", "pertes de récoltes non assurées"],
    corps: "L'indemnité de solidarité nationale est une indemnisation gérée par l'État pour des exploitants agricoles qui n'étaient pas assurés et qui ont subi des pertes de récoltes à cause d'un aléa climatique. En Dordogne, la commission compétente a reconnu les pertes liées à la sécheresse de 2026 sur tout le département pour plusieurs productions : grandes cultures, légumes frais et industriels, petits fruits. La demande se fait par une téléprocédure en ligne, AléaNAT, ouverte du 1er novembre au 31 décembre 2026. La direction départementale des territoires renseigne sur la démarche.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: "Préfecture de la Dordogne, communiqué « Indemnité de solidarité nationale : ouverture du dispositif d'indemnisation » (28 octobre 2026)", url: 'https://www.dordogne.gouv.fr/Publications/Espace-Presse/Communiques-de-presse-2026/Indemnite-de-solidarite-nationale-Ouverture-du-dispositif-d-indemnisation' },
      lignes: [
        { libelle: 'Territoire concerné par le communiqué', valeur: 'la Dordogne seulement', categorie: 'seuil', peutChanger: true },
        { libelle: 'Téléprocédure AléaNAT', valeur: 'ouverte du 1er novembre au 31 décembre 2026', categorie: 'date', peutChanger: true }
      ],
      phraseGenerale: "L'indemnité de solidarité nationale est une indemnisation gérée par l'État pour des exploitants agricoles qui n'étaient pas assurés et qui ont subi des pertes de récoltes à cause d'un aléa climatique. La demande se fait en ligne pendant une période fixée à chaque épisode, et la direction départementale des territoires renseigne sur la démarche. Les départements et les productions concernés changent : consultez la source officielle."
    },
    relations: [
      { ficheId: 'msa', type: 'voir-aussi' },
      { ficheId: 'dnja', type: 'voir-aussi' }
    ]
  },
  {
    id: 'france-services-agriculture',
    titre: "France Services Agriculture (guichet unique de l'installation agricole)",
    titreDeTri: "France Services Agriculture", type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ["guichet unique installation agricole", "installation agriculteur", "cédant agricole", "loi d'orientation agricole"],
    corps: "France Services Agriculture est un réseau en cours de création : un guichet unique dans chaque département à partir du 1er janvier 2027, pour informer, orienter et accompagner les personnes qui ont un projet agricole et les futurs cédants. Il sera tenu par les chambres d'agriculture et par des structures agréées par le préfet de région. Il est issu de la loi d'orientation agricole. Deux niveaux d'accompagnement sont prévus : l'un pour l'accompagnement, l'autre pour des expertises spécifiques. En attendant, le point d'accueil installation-transmission de la chambre d'agriculture reste la porte d'entrée.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: "Cap Métiers Nouvelle-Aquitaine, « Agriculture : bientôt un accompagnement personnalisé à l'installation » (29 octobre 2026)", url: 'https://pro.cap-metiers.fr/formation-vae/agriculture-bientot-un-accompagnement-personnalise-a-linstallation/' },
      lignes: [
        { libelle: 'Entrée en service du guichet unique', valeur: 'à partir du 1er janvier 2027', categorie: 'date', peutChanger: true },
        { libelle: 'Structures agréées', valeur: 'appel à candidatures de la DRAAF pour agréer les structures (décret n° 2026-323 du 28 avril 2026)', categorie: 'ref', peutChanger: true }
      ],
      phraseGenerale: "France Services Agriculture est un réseau de guichets uniques, un par département, pour informer, orienter et accompagner les personnes qui ont un projet agricole et les futurs cédants. Il est tenu par les chambres d'agriculture et par des structures agréées. Son calendrier de mise en place peut évoluer : le point d'accueil installation-transmission de la chambre d'agriculture reste la porte d'entrée."
    },
    relations: [
      { ficheId: 'pait', type: 'voir-aussi' },
      { ficheId: 'bprea', type: 'voir-aussi' },
      { ficheId: 'dnja', type: 'voir-aussi' }
    ]
  },
  {
    id: 'asf',
    titre: "ASF (allocation de soutien familial)",
    titreDeTri: "ASF", type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ["allocation de soutien familial", "pension alimentaire non versée", "parent isolé aide CAF", "ASF différentielle"],
    corps: "L'ASF est versée par la Caf, ou par la MSA, à la personne qui élève seule son enfant privé de l'aide de l'un de ses parents. Il faut vivre seul, résider en France et avoir au moins un enfant à charge pour lequel l'autre parent ne participe plus à l'entretien depuis au moins 1 mois, ou verse une pension alimentaire inférieure à 200,78 €. Le montant est de 200,78 € par mois et par enfant. Si une pension est fixée mais impayée, l'ASF est versée à titre d'avance et la Caf peut agir à la place du parent pour la récupérer. Si aucune pension n'est fixée, l'ASF est versée pendant 4 mois : il faut saisir le juge aux affaires familiales dans ce délai pour la garder. L'ASF est supprimée si l'on vit en couple.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « Allocation de soutien familial (ASF) : parents séparés » (vérifiée le 1er avril 2026)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F815' },
      lignes: [
        { libelle: "Montant de l'ASF", valeur: '200,78 € par mois et par enfant', categorie: 'montant', peutChanger: true },
        { libelle: "Autre parent qui ne participe plus à l'entretien", valeur: 'depuis au moins 1 mois', categorie: 'duree', peutChanger: true },
        { libelle: 'Pension versée', valeur: 'inférieure à 200,78 € (un intertitre de la page écrit 201,78 €)', categorie: 'montant', peutChanger: true },
        { libelle: 'Durée sans pension fixée', valeur: '4 mois, à prolonger en saisissant le juge aux affaires familiales', categorie: 'duree', peutChanger: true },
        { libelle: 'ASF différentielle', valeur: 'versée en une fois tous les 3 mois ; non versée si la différence est inférieure à 15 €', categorie: 'montant', peutChanger: true }
      ],
      phraseGenerale: "L'ASF est une aide versée par la Caf, ou par la MSA, à la personne qui élève seule son enfant privé de l'aide de l'un de ses parents. Elle est versée sous conditions, lorsque l'autre parent ne participe plus à l'entretien de l'enfant ou verse une pension alimentaire très faible, et elle est supprimée si l'on vit en couple. Le montant et les délais changent : consultez la source officielle."
    },
    relations: [
      { ficheId: 'monoparentalite', type: 'voir-aussi' },
      { ficheId: 'aripa', type: 'voir-aussi' },
      { ficheId: 'caf', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aide-permis-b-france-travail',
    titre: "Aide au permis B de France Travail (dispositif arrêté)",
    titreDeTri: "Aide au permis B France Travail", type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif', 'langage-france-travail'],
    variantesRecherche: ["aide permis demandeur emploi", "aide financement permis France Travail", "permis B pôle emploi"],
    corps: "L'aide au permis B de France Travail permettait à un demandeur d'emploi de financer en partie son permis de conduire. Elle est supprimée depuis le 1er avril 2026 : la page officielle de Service Public répond qu'on ne peut plus en bénéficier. D'autres solutions existent : le permis à 1 euro par jour, un prêt à taux zéro pour les 15 à 25 ans, le fonds d'aide aux jeunes de 18 à 25 ans, une éventuelle bourse au permis proposée par la commune, le compte personnel de formation selon la catégorie du permis, ou le microcrédit personnel. Le terme peut encore apparaître sur d'anciens sites ou dans un document plus ancien.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: "Service-public.gouv.fr, fiches « Peut-on encore bénéficier de l'aide au permis de conduire B attribuée par France Travail ? » et « Quelles aides pour financer le permis de conduire ? » (vérifiées le 1er avril 2026)", url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F13609' },
      lignes: [
        { libelle: 'Aide de France Travail', valeur: 'supprimée depuis le 1er avril 2026', categorie: 'date', peutChanger: false },
        { libelle: 'Permis à 1 euro par jour : âge', valeur: 'de 15 à 25 ans à la date de signature du contrat de formation', categorie: 'seuil', peutChanger: true },
        { libelle: 'Permis à 1 euro par jour : montant du prêt', valeur: "600 €, 800 €, 1 000 € ou 1 200 € pour une première formation ; 300 € en cas d'échec à l'épreuve pratique", categorie: 'montant', peutChanger: true },
        { libelle: "Fonds d'aide aux jeunes", valeur: "jeunes de 18 à 25 ans en difficulté d'insertion sociale ou professionnelle", categorie: 'seuil', peutChanger: true }
      ],
      phraseGenerale: "L'aide au permis B de France Travail permettait à un demandeur d'emploi de financer en partie son permis de conduire. Elle est supprimée : la page officielle indique qu'on ne peut plus en bénéficier. D'autres solutions existent, comme le permis à un euro par jour, le fonds d'aide aux jeunes, le compte personnel de formation ou le microcrédit personnel : consultez la source officielle."
    },
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' },
      { ficheId: 'permis-a-1-euro-par-jour', type: 'voir-aussi' },
      { ficheId: 'fonds-d-aide-aux-jeunes', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aide-exceptionnelle-embauche-apprenti',
    titre: "Aide exceptionnelle à l'embauche d'un apprenti",
    titreDeTri: "Aide embauche apprenti", type: 'terme',
    univers: 'formation', registres: ['langage-administratif', 'langage-employeur'],
    variantesRecherche: ["aide embauche apprenti", "aide employeur apprentissage", "aide unique apprentissage", "prime embauche alternant"],
    corps: "L'aide exceptionnelle à l'embauche d'un apprenti est versée à l'employeur, au titre de la première année du contrat d'apprentissage, pour les contrats conclus à partir du 8 mars 2026 et débutant avant le 1er janvier 2027. Son montant dépend du niveau du diplôme préparé et de la taille de l'entreprise : par exemple 4 500 € au plus pour un diplôme de niveau 5 dans une entreprise de moins de 250 salariés, 1 500 € ou 750 € au plus dans une entreprise de 250 salariés et plus selon le niveau, et jusqu'à 6 000 € si l'apprenti est reconnu travailleur handicapé. Elle ne se cumule pas avec l'aide unique de 5 000 €, réservée aux entreprises de moins de 250 salariés qui recrutent un apprenti préparant un titre ou un diplôme jusqu'au niveau baccalauréat. Ces aides changent souvent : l'employeur doit vérifier les montants au moment de la demande.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: "Service-public.gouv.fr (entreprises), actualité « Quelle évolution pour l'aide à l'embauche des apprentis depuis le 8 mars 2026 ? » (publiée le 10 mars 2026)", url: 'https://entreprendre.service-public.gouv.fr/actualites/A18837' },
      lignes: [
        { libelle: 'Contrats concernés', valeur: 'conclus à partir du 8 mars 2026 et débutant avant le 1er janvier 2027', categorie: 'date', peutChanger: true },
        { libelle: 'Durée de versement', valeur: 'première année du contrat seulement', categorie: 'duree', peutChanger: true },
        { libelle: 'Moins de 250 salariés, diplôme de niveau 5 (bac+2)', valeur: '4 500 € au plus', categorie: 'montant', peutChanger: true },
        { libelle: 'Moins de 250 salariés, diplôme de niveau 6 ou 7 (bac+3 à master)', valeur: '2 000 € au plus', categorie: 'montant', peutChanger: true },
        { libelle: '250 salariés et plus, diplôme de niveau 5, puis de niveau 6 ou 7', valeur: '1 500 € au plus, puis 750 € au plus', categorie: 'montant', peutChanger: true },
        { libelle: 'Apprenti reconnu travailleur handicapé (toutes entreprises, niveaux 3 à 7)', valeur: '6 000 € au plus', categorie: 'montant', peutChanger: true },
        { libelle: 'Aide unique', valeur: "pas de cumul avec l'aide unique de 5 000 € (entreprises de moins de 250 salariés, jusqu'au niveau bac)", categorie: 'montant', peutChanger: true },
        { libelle: 'Autres cas', valeur: 'voir le tableau complet de la page officielle', categorie: 'ref', peutChanger: true }
      ],
      phraseGenerale: "L'aide exceptionnelle à l'embauche d'un apprenti est versée à l'employeur pour la première année du contrat d'apprentissage. Son montant dépend du niveau du diplôme préparé, de la taille de l'entreprise et de la situation de l'apprenti, et elle ne se cumule pas avec l'aide unique. Ces aides changent souvent : l'employeur doit vérifier les montants et les dates au moment de la demande."
    },
    relations: [
      { ficheId: 'contrat-d-apprentissage', type: 'voir-aussi' },
      { ficheId: 'cfa', type: 'voir-aussi' },
      { ficheId: 'opco', type: 'voir-aussi' }
    ]
  },
  {
    id: 'declaration-trimestrielle-aah-esat',
    titre: "Déclaration trimestrielle de ressources AAH (travailleurs en ESAT)",
    titreDeTri: "Déclaration trimestrielle AAH ESAT", type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ["AAH ESAT déclaration", "déclarer ses revenus ESAT", "déclaration trimestrielle AAH", "AAH travailleur ESAT"],
    corps: "Depuis le 1er octobre 2026, les personnes en situation de handicap qui travaillent en ESAT (établissement et service d'accompagnement par le travail), ou leurs tuteurs, déclarent leurs ressources tous les 3 mois, sur caf.fr ou dans l'application « Caf, Mon Compte », ou, pour les personnes affiliées à la MSA, sur leur espace privé. Avant, les revenus d'ESAT étaient récupérés chaque année directement auprès de l'administration fiscale : il n'y avait en général aucune démarche. Cette déclaration sert à calculer l'AAH des 3 mois suivants. La mise en place est progressive, entre octobre et décembre 2026 : la Caf ou la MSA indique par courrier ou par courriel le mois de la première déclaration, puis envoie un rappel avant chaque déclaration. Une personne qui touche aussi la prime d'activité fait une déclaration distincte pour chacune des deux prestations.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, actualité « Allocation aux adultes handicapés : la façon de déclarer vos revenus évolue dans certains cas » (publiée le 14 octobre 2026)', url: 'https://www.service-public.gouv.fr/particuliers/actualites/A19094' },
      lignes: [
        { libelle: 'Début de la déclaration trimestrielle', valeur: 'depuis le 1er octobre 2026', categorie: 'date', peutChanger: true },
        { libelle: 'Mise en place progressive', valeur: 'entre octobre et décembre 2026 : la Caf ou la MSA indique le mois de la première déclaration', categorie: 'date', peutChanger: true },
        { libelle: 'Rythme', valeur: 'tous les 3 mois, pour déclarer les revenus des 3 mois précédents', categorie: 'duree', peutChanger: true },
        { libelle: 'Montants à déclarer', valeur: 'en « net imposable » (écrit en bas de la fiche de paie)', categorie: 'ref', peutChanger: true }
      ],
      phraseGenerale: "Les personnes en situation de handicap qui travaillent en ESAT (établissement et service d'accompagnement par le travail), ou leurs tuteurs, doivent déclarer leurs ressources à la Caf ou à la MSA à intervalles réguliers, pour que leur AAH soit calculée. La Caf ou la MSA indique à chaque personne le moment de sa première déclaration, puis envoie un rappel. La mise en place est progressive et les règles peuvent évoluer : consultez la source officielle."
    },
    relations: [
      { ficheId: 'aah', type: 'voir-aussi' },
      { ficheId: 'esat', type: 'voir-aussi' },
      { ficheId: 'declaration-de-ressources', type: 'voir-aussi' }
    ]
  },
  {
    id: 'volontariat-armees',
    titre: "Volontariat dans les armées",
    titreDeTri: "Volontariat armées", type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ["volontaire armée", "engagement volontaire armée", "découvrir l'armée", "volontaire de l'armée de terre"],
    corps: "Le volontariat dans les armées permet de s'initier aux métiers des armes et de la défense, pour une durée minimale de 3 mois, dans l'armée de Terre, la Marine, l'armée de l'Air, la Gendarmerie ou le Service de santé des armées. Le volontaire perçoit une solde mensuelle. Il faut être français, avoir entre 17 et 26 ans à la date de la candidature, être reconnu apte, avoir fait la journée de mobilisation et n'avoir aucune condamnation sur le bulletin 2 du casier judiciaire. L'accès est sélectif. Seul un contrat d'engagement fait de la personne un soldat professionnel. La démarche d'inscription dépend de l'armée : un centre d'information et de recrutement des forces armées, ou le bureau local des ressources humaines du Service de santé des armées.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « Volontariat dans les armées » (vérifiée le 18 août 2026)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1292' },
      lignes: [
        { libelle: 'Durée minimale', valeur: '3 mois', categorie: 'duree', peutChanger: true },
        { libelle: 'Âge à la date de la candidature', valeur: 'entre 17 et 26 ans', categorie: 'seuil', peutChanger: true },
        { libelle: 'Casier judiciaire', valeur: 'aucune condamnation sur le bulletin 2', categorie: 'seuil', peutChanger: true }
      ],
      phraseGenerale: "Le volontariat dans les armées permet de s'initier aux métiers des armes et de la défense, pour une période courte, dans l'armée de Terre, la Marine, l'armée de l'Air, la Gendarmerie ou le Service de santé des armées. Le volontaire perçoit une solde mensuelle. L'accès est sélectif, avec des conditions de nationalité, d'âge, d'aptitude et de casier judiciaire, et seul un contrat d'engagement fait de la personne un soldat professionnel. Un centre d'information et de recrutement des forces armées renseigne, et la source officielle donne les règles en vigueur."
    },
    relations: [
      { ficheId: 'jdc', type: 'voir-aussi' },
      { ficheId: 'bulletin-2-ou-bulletin-3', type: 'voir-aussi' },
      { ficheId: 'service-civique', type: 'a-ne-pas-confondre' },
      { ficheId: 'reserve-operationnelle', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'reserve-operationnelle',
    titre: "Réserve opérationnelle des armées",
    titreDeTri: "Réserve opérationnelle", type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ["réserviste", "réserve militaire", "réserve gendarmerie", "engagement réserve"],
    corps: "La réserve opérationnelle permet de servir dans les armées en renfort temporaire, tout en gardant un autre emploi. L'engagement se fait par un contrat de 1 à 5 ans, renouvelable, avec une rémunération. Il faut être français (la Légion étrangère accueille certains étrangers anciens militaires), avoir au moins 17 ans, la limite d'âge étant de 72 ans, avoir fait la journée de mobilisation, ne pas avoir été condamné à une peine qui retire les droits civiques ou l'accès à un emploi public, et être apte médicalement. Chaque armée peut fixer un âge cible plus précis. La plupart des armées demandent de candidater en ligne.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « Réserve opérationnelle dans les armées » (vérifiée le 18 août 2026)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1188' },
      lignes: [
        { libelle: 'Durée du contrat', valeur: 'de 1 à 5 ans, renouvelable', categorie: 'duree', peutChanger: true },
        { libelle: 'Âge', valeur: "au moins 17 ans ; limite d'âge de 72 ans", categorie: 'seuil', peutChanger: true },
        { libelle: "Exemple d'âge cible", valeur: 'moins de 45 ans pour le premier niveau de la réserve de la gendarmerie', categorie: 'seuil', peutChanger: true }
      ],
      phraseGenerale: "La réserve opérationnelle permet de servir dans les armées en renfort temporaire, tout en gardant un autre emploi. L'engagement se fait par un contrat, renouvelable, avec une rémunération. Il faut remplir des conditions de nationalité, d'âge, d'aptitude médicale et de casier judiciaire, qui varient selon l'armée. La durée du contrat et les limites d'âge peuvent changer : consultez la source officielle."
    },
    relations: [
      { ficheId: 'volontariat-armees', type: 'a-ne-pas-confondre' },
      { ficheId: 'casier-judiciaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'prime-carburant-exoneration',
    titre: "Prime carburant versée par l'employeur (plafond d'exonération)",
    titreDeTri: "Prime carburant employeur", type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif', 'langage-rh'],
    variantesRecherche: ["prime de transport", "prime carburant salarié", "frais de carburant employeur", "plafond exonération prime transport"],
    corps: "Un employeur peut verser à un salarié une prime pour les frais de carburant qu'il engage sur ses trajets entre le domicile et le lieu de travail. Quand toutes les conditions sont remplies, elle peut être exonérée de cotisations et de contributions sociales, jusqu'à un plafond par an et par salarié. Ce plafond, déjà relevé de 300 à 600 €, est fixé à 1 000 € pour les primes versées jusqu'au 31 décembre 2026. Jusqu'à cette date, selon l'Urssaf, la prime peut aussi être versée si le domicile ou le lieu de travail est desservi par un transport collectif, et même si l'employeur participe déjà à l'abonnement de transport en commun. Ces mesures temporaires s'appliquent aussi aux frais d'alimentation des véhicules électriques, hybrides rechargeables ou à hydrogène. À ne pas confondre avec l'aide « grands rouleurs » : celle-ci n'est pas versée par l'employeur.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Urssaf, « Frais de transport domicile - lieu de travail : mesures 2026 » (mis à jour le 30 octobre 2026)', url: 'https://www.urssaf.fr/accueil/actualites/prime-carburant-2026.html' },
      lignes: [
        { libelle: "Plafond d'exonération habituel", valeur: '300 €, déjà relevé à 600 € par an et par salarié', categorie: 'montant', peutChanger: true },
        { libelle: 'Plafond temporaire', valeur: "1 000 € par an et par salarié, pour les primes versées jusqu'au 31 décembre 2026", categorie: 'montant', peutChanger: true },
        { libelle: 'Textes', valeur: 'décrets n° 2026-973 et n° 2026-974 du 20 octobre 2026', categorie: 'ref', peutChanger: true }
      ],
      phraseGenerale: "Un employeur peut verser à un salarié une prime pour les frais de carburant qu'il engage sur ses trajets entre le domicile et le lieu de travail. Quand toutes les conditions sont remplies, elle peut être exonérée de cotisations et de contributions sociales, jusqu'à un plafond par an et par salarié. Ce plafond et les conditions ont été relevés ou assouplis de façon temporaire et changent selon les périodes : consultez la source officielle pour les règles en vigueur. À ne pas confondre avec l'aide « grands rouleurs » : celle-ci n'est pas versée par l'employeur."
    },
    relations: [
      { ficheId: 'aide-carburant-grands-rouleurs', type: 'a-ne-pas-confondre' },
      { ficheId: 'cotisations-sociales', type: 'voir-aussi' },
      { ficheId: 'cout-employeur', type: 'voir-aussi' }
    ]
  },
  {
    id: 'puma',
    titre: "Puma (protection universelle maladie)",
    titreDeTri: "Puma", type: 'terme',
    univers: 'acces-aux-soins', registres: ['langage-administratif'],
    variantesRecherche: ["protection universelle maladie", "CMU de base", "droit à l'assurance maladie", "couverture maladie"],
    corps: "La Puma est le droit, pour toute personne qui travaille ou réside en France de manière stable et régulière (c'est-à-dire sans interruption depuis plus de 3 mois), à la prise en charge de ses frais de santé. Elle existe depuis le 1er janvier 2016 et a remplacé la CMU de base. Elle ne dépend plus du fait d'avoir un emploi. Pour les dépenses que l'Assurance maladie ne rembourse pas, la complémentaire santé solidaire a remplacé la CMU complémentaire.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « La couverture maladie universelle (CMU) existe-t-elle toujours ? » (vérifiée le 31 août 2026)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F34306' },
      lignes: [
        { libelle: 'Mise en place', valeur: 'depuis le 1er janvier 2016', categorie: 'date', peutChanger: false },
        { libelle: 'Résidence stable et régulière', valeur: 'sans interruption depuis plus de 3 mois', categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "La Puma est le droit, pour toute personne qui travaille ou réside en France de manière stable et régulière, à la prise en charge de ses frais de santé. Elle a remplacé la CMU de base et ne dépend plus du fait d'avoir un emploi. Pour les dépenses que l'Assurance maladie ne rembourse pas, la complémentaire santé solidaire a remplacé la CMU complémentaire. Les conditions précises peuvent évoluer : consultez la source officielle."
    },
    relations: [
      { ficheId: 'ame', type: 'voir-aussi' },
      { ficheId: 'css', type: 'voir-aussi' },
      { ficheId: 'medecin-traitant', type: 'voir-aussi' }
    ]
  },
  {
    id: 'medecin-traitant',
    titre: "Médecin traitant et parcours de soins",
    titreDeTri: "Médecin traitant", type: 'terme',
    univers: 'acces-aux-soins', registres: ['langage-administratif'],
    variantesRecherche: ["déclarer un médecin traitant", "parcours de soins coordonnés", "hors parcours de soins", "choisir son médecin traitant"],
    corps: "Le médecin traitant est votre premier interlocuteur pour votre santé. On le déclare à sa caisse d'assurance maladie. Pour un enfant de moins de 16 ans, l'un des parents choisit le médecin traitant. Quand on consulte en dehors du parcours de soins, le remboursement est moins élevé. On est remboursé normalement, même sans passer par son médecin traitant, pour certaines consultations : le psychiatre (pour les moins de 26 ans), le gynécologue, l'ophtalmologue, le stomatologue (à condition d'avoir déclaré un médecin traitant), les chirurgiens-dentistes et les sages-femmes.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « Médecin traitant et parcours de soins coordonnés » (vérifiée le 21 août 2026)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F163' },
      lignes: [
        { libelle: 'Enfant', valeur: 'moins de 16 ans : un des parents choisit le médecin traitant', categorie: 'seuil', peutChanger: true },
        { libelle: 'Psychiatre sans passer par le médecin traitant', valeur: 'pour les moins de 26 ans', categorie: 'seuil', peutChanger: true }
      ],
      phraseGenerale: "Le médecin traitant est votre premier interlocuteur pour votre santé. On le déclare à sa caisse d'assurance maladie. Pour un enfant, l'un des parents choisit le médecin traitant. Quand on consulte en dehors du parcours de soins, le remboursement est moins élevé, sauf pour certaines consultations, comme chez le gynécologue, l'ophtalmologue, le chirurgien-dentiste ou la sage-femme. Les règles peuvent évoluer : consultez la source officielle."
    },
    relations: [
      { ficheId: 'desert-medical', type: 'voir-aussi' },
      { ficheId: 'puma', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cheque-energie',
    titre: "Chèque énergie",
    titreDeTri: "Chèque énergie", type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ["aide facture électricité", "aide facture gaz", "aide chauffage", "chèque énergie papier"],
    corps: "Le chèque énergie est une aide financière pour les personnes à revenus modestes. Il sert à régler une facture d'électricité ou de gaz, l'achat de combustibles de chauffage, ou les charges d'énergie incluses dans le loyer d'un logement social ou d'un logement-foyer. Il faut que le revenu fiscal de référence du foyer soit inférieur à 11 000 € par unité de consommation, d'après l'avis d'imposition d'il y a deux ans. Depuis le 15 février 2025, il ne finance plus les travaux de rénovation énergétique. Les droits sont ouverts du 1er avril de l'année du chèque jusqu'au 30 avril de l'année suivante. Un centre d'assistance gratuit répond aux questions. La page officielle qui décrit ces règles date d'octobre 2025 : à relire pour l'année en cours.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « Chèque énergie » (vérifiée le 17 octobre 2025, page ancienne)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F33667' },
      lignes: [
        { libelle: 'Revenu fiscal de référence', valeur: "moins de 11 000 € par unité de consommation (avis d'imposition d'il y a deux ans)", categorie: 'seuil', peutChanger: true },
        { libelle: 'Unités de consommation', valeur: '1 pour le premier déclarant, 0,5 pour le second, 0,3 pour chaque autre personne à charge', categorie: 'seuil', peutChanger: true },
        { libelle: 'Travaux de rénovation énergétique', valeur: 'plus financés depuis le 15 février 2025', categorie: 'date', peutChanger: false },
        { libelle: 'Droits ouverts', valeur: "du 1er avril de l'année du chèque jusqu'au 30 avril de l'année suivante", categorie: 'date', peutChanger: true }
      ],
      phraseGenerale: "Le chèque énergie est une aide financière pour les personnes à revenus modestes. Il sert à régler une facture d'électricité ou de gaz, l'achat de combustibles de chauffage, ou les charges d'énergie incluses dans le loyer d'un logement social ou d'un logement-foyer. L'aide dépend des revenus du foyer, d'après l'avis d'imposition, et les plafonds, les dates et les usages permis changent régulièrement. Un centre d'assistance gratuit répond aux questions : consultez la source officielle pour les règles de l'année en cours."
    },
    relations: [
      { ficheId: 'treve-hivernale', type: 'voir-aussi' },
      { ficheId: 'fsl', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aspa',
    titre: "ASPA (allocation de solidarité aux personnes âgées)",
    titreDeTri: "ASPA", type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ["minimum vieillesse", "allocation personnes âgées", "complément retraite faible", "retraite trop faible"],
    corps: "L'ASPA, souvent appelée minimum vieillesse, est une prestation mensuelle versée aux retraités qui ont de faibles ressources, revenus et patrimoine, et qui vivent en France. Elle est versée par la caisse de retraite (Carsat, MSA...). Son montant varie selon que l'on vit seul ou en couple. Dans le cas général, on peut l'obtenir dès 65 ans ; dès 62 ans pour une retraite anticipée pour carrière longue ou pour handicap. Pour un couple, depuis le 1er janvier 2026, le total des revenus ne doit pas dépasser 1 620,18 € brut par mois ; pour une personne seule, le plafond est plus bas. Les revenus pris en compte sont ceux des 3 mois qui précèdent le début du droit, recalculés sur 12 mois si ce total est dépassé. Si l'on n'a aucune retraite, la demande se fait auprès de la caisse qui verserait la pension.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « Allocation de solidarité aux personnes âgées (Aspa) » (vérifiée le 23 juin 2026)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F16871' },
      lignes: [
        { libelle: 'Âge (cas général)', valeur: 'dès 65 ans', categorie: 'seuil', peutChanger: true },
        { libelle: 'Âge (carrière longue ou handicap)', valeur: 'dès 62 ans', categorie: 'seuil', peutChanger: true },
        { libelle: 'Âge (ancien combattant, déporté, mère de famille ouvrière...)', valeur: "avant 65 ans, selon l'année de naissance", categorie: 'seuil', peutChanger: true },
        { libelle: 'Séjour en France', valeur: "plus de 9 mois dans l'année de versement", categorie: 'duree', peutChanger: true },
        { libelle: 'Plafond de ressources du couple', valeur: '1 620,18 € brut par mois depuis le 1er janvier 2026', categorie: 'montant', peutChanger: true },
        { libelle: 'Revenus pris en compte', valeur: '3 mois avant le début du droit, recalculés sur 12 mois si le plafond est dépassé', categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "L'ASPA, souvent appelée minimum vieillesse, est une prestation mensuelle versée aux retraités qui ont de faibles ressources, revenus et patrimoine, et qui vivent en France. Elle est versée par la caisse de retraite. Son montant varie selon que l'on vit seul ou en couple, et les plafonds de ressources et les âges d'accès changent selon la situation et selon les années. Si l'on n'a aucune retraite, la demande se fait auprès de la caisse qui verserait la pension. Consultez la source officielle pour les règles en vigueur."
    },
    relations: [
      { ficheId: 'css', type: 'voir-aussi' },
      { ficheId: 'carriere-longue', type: 'voir-aussi' }
    ]
  },
  {
    id: 'mva',
    titre: "MVA (majoration pour la vie autonome)",
    titreDeTri: "MVA", type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ["majoration vie autonome", "complément AAH", "aide AAH logement indépendant"],
    corps: "La majoration pour la vie autonome est un complément versé aux personnes qui touchent l'AAH à taux plein (ou en complément d'une retraite, d'une pension d'invalidité ou d'une rente d'accident du travail), ou l'allocation supplémentaire d'invalidité, et qui vivent dans un logement indépendant. Il faut notamment un taux d'incapacité permanente d'au moins 80 %, percevoir une aide personnelle au logement et ne pas avoir de revenu d'activité professionnelle. Son montant est de 104,77 € par mois. Elle est versée jusqu'au 60e jour d'hospitalisation, d'hébergement en établissement ou d'incarcération. Avec l'AAH, aucune démarche n'est à faire ; avec l'allocation supplémentaire d'invalidité, il faut la demander à la MDPH, qui répond dans un délai de 4 mois.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « Majoration pour la vie autonome (MVA) » (vérifiée le 22 avril 2026)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F12903' },
      lignes: [
        { libelle: "Taux d'incapacité permanente", valeur: 'au moins 80 %', categorie: 'seuil', peutChanger: true },
        { libelle: 'Montant', valeur: '104,77 € par mois', categorie: 'montant', peutChanger: true },
        { libelle: 'Maintien du versement', valeur: "jusqu'au 60e jour d'hospitalisation, d'hébergement ou d'incarcération", categorie: 'duree', peutChanger: true },
        { libelle: "Réponse de la MDPH (allocation supplémentaire d'invalidité)", valeur: '4 mois ; sans réponse, rejet implicite', categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "La majoration pour la vie autonome est un complément versé aux personnes qui touchent l'AAH à taux plein, ou l'allocation supplémentaire d'invalidité, et qui vivent dans un logement indépendant. Il faut notamment un taux d'incapacité permanente élevé, percevoir une aide personnelle au logement et ne pas avoir de revenu d'activité professionnelle. Avec l'AAH, aucune démarche n'est à faire ; avec l'allocation supplémentaire d'invalidité, il faut la demander à la MDPH. Le montant et les délais changent : consultez la source officielle."
    },
    relations: [
      { ficheId: 'aah', type: 'voir-aussi' },
      { ficheId: 'mdph', type: 'voir-aussi' },
      { ficheId: 'aides-au-logement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'aeeh',
    titre: "AEEH (allocation d'éducation de l'enfant handicapé)",
    titreDeTri: "AEEH", type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ["allocation enfant handicapé", "aide parents enfant handicapé", "complément AEEH"],
    corps: "L'AEEH est une aide financière destinée à compenser les dépenses liées au handicap d'un enfant de moins de 20 ans. Elle est versée aux parents tous les mois et peut être complétée, dans certains cas, par un complément, dont le niveau dépend d'un classement du handicap par la commission de la MDPH, et par une majoration pour parent isolé. Elle peut couvrir les dépenses liées aux soins et à l'éducation, la nécessité d'embaucher une personne pour s'occuper de l'enfant, ou la réduction ou l'arrêt de l'activité professionnelle d'un parent. Il faut un taux d'incapacité d'au moins 80 %, ou compris entre 50 % et moins de 80 % si l'enfant est accompagné par un établissement ou un service médico-social, un dispositif de scolarisation adapté ou des soins en lien avec son handicap. La demande se fait auprès de la MDPH, qui répond dans un délai de 4 mois.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: "Service-public.gouv.fr, fiche « Allocation d'éducation de l'enfant handicapé (AEEH) » (vérifiée le 1er juin 2026)", url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F14809' },
      lignes: [
        { libelle: "Âge de l'enfant", valeur: 'moins de 20 ans', categorie: 'seuil', peutChanger: true },
        { libelle: "Taux d'incapacité", valeur: 'au moins 80 %, ou entre 50 % et moins de 80 % avec accompagnement', categorie: 'seuil', peutChanger: true },
        { libelle: "Revenus professionnels de l'enfant", valeur: 'au plus 55 % du Smic mensuel brut, soit 1 026,86 €', categorie: 'montant', peutChanger: true },
        { libelle: 'Montant de base', valeur: '153,01 €', categorie: 'montant', peutChanger: true },
        { libelle: 'Réponse de la MDPH', valeur: '4 mois ; sans réponse, rejet implicite', categorie: 'duree', peutChanger: true },
        { libelle: 'Réexamen', valeur: 'au maximum tous les 2 ans, sauf attribution sans limitation de durée', categorie: 'duree', peutChanger: true },
        { libelle: 'Loi du 12 juin 2026', valeur: "expérimentation d'une avance automatique si la MDPH ne répond pas : textes d'application attendus", categorie: 'ref', peutChanger: true }
      ],
      phraseGenerale: "L'AEEH est une aide financière destinée à compenser les dépenses liées au handicap d'un enfant. Elle est versée aux parents tous les mois et peut être complétée, dans certains cas, par un complément et par une majoration pour parent isolé. Elle dépend du taux d'incapacité de l'enfant et de son accompagnement. La demande se fait auprès de la MDPH. Les règles évoluent, avec une loi récente dont les textes d'application sont attendus : consultez la source officielle."
    },
    relations: [
      { ficheId: 'rqth', type: 'voir-aussi' },
      { ficheId: 'pch', type: 'voir-aussi' },
      { ficheId: 'mdph', type: 'voir-aussi' }
    ]
  },
  {
    id: 'apa',
    titre: "APA (allocation personnalisée d'autonomie)",
    titreDeTri: "APA", type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ["aide perte d'autonomie", "aide maintien à domicile", "allocation dépendance", "Ehpad aide"],
    corps: "L'APA est une aide, sous conditions d'âge (au moins 60 ans), de résidence et de perte d'autonomie, qui sert à payer en totalité ou en partie soit les dépenses nécessaires pour rester à domicile (APA à domicile), soit le tarif dépendance de l'établissement médico-social où l'on vit (APA en établissement), par exemple un Ehpad. Elle est versée par les services du département. La perte d'autonomie est mesurée avec la grille Aggir par un professionnel de l'équipe médico-sociale du département, qui se déplace au domicile : seules les personnes classées en Gir 1 à 4 peuvent l'obtenir. Elle ne se cumule pas avec certaines autres prestations, comme la prestation de compensation du handicap ou les aides des caisses de retraite.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: "Service-public.gouv.fr, fiche « Allocation personnalisée d'autonomie (Apa) » (vérifiée le 1er juin 2026)", url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F10009' },
      lignes: [
        { libelle: 'Âge', valeur: 'au moins 60 ans', categorie: 'seuil', peutChanger: true },
        { libelle: "Perte d'autonomie", valeur: 'Gir 1, 2, 3 ou 4 (sur une échelle de 1, la plus forte, à 6)', categorie: 'seuil', peutChanger: true },
        { libelle: 'Apa forfaitaire en urgence (provisoire)', valeur: '1 040,16 €', categorie: 'montant', peutChanger: true },
        { libelle: 'Accusé de réception du dossier par le département', valeur: '10 jours', categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "L'APA est une aide, sous conditions d'âge, de résidence et de perte d'autonomie, qui sert à payer en totalité ou en partie soit les dépenses nécessaires pour rester à domicile, soit le tarif dépendance de l'établissement médico-social où l'on vit, par exemple un Ehpad. Elle est versée par les services du département, après une évaluation de la perte d'autonomie. Elle ne se cumule pas avec certaines autres prestations. Les conditions et les montants changent : consultez la source officielle."
    },
    relations: [
      { ficheId: 'proche-aidant', type: 'voir-aussi' },
      { ficheId: 'aspa', type: 'voir-aussi' }
    ]
  },
  {
    id: 'agirc-arrco',
    titre: "Agirc-Arrco (retraite complémentaire du privé)",
    titreDeTri: "Agirc-Arrco", type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ["retraite complémentaire", "points de retraite", "valeur du point", "pension complémentaire"],
    corps: "L'Agirc-Arrco est le régime de retraite complémentaire obligatoire des salariés du secteur privé. C'est un régime par points : les cotisations sont converties en points de retraite, et à l'âge de la retraite ces points sont reconvertis en pension, qui s'ajoute à la retraite de base de l'Assurance retraite. La pension est versée le premier jour ouvré de chaque mois ; elle est majorée si l'on a eu ou élevé au moins 3 enfants. On peut racheter des points pour certaines périodes, comme des années d'études supérieures. La valeur de service du point est de 1,4587 € (page vérifiée le 1er novembre 2026) et une revalorisation de 1,4 % des pensions complémentaires a été décidée au 1er novembre 2026.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « Retraite complémentaire dans le privé : Agirc-Arrco » (vérifiée le 1er novembre 2026) et actualité sur la revalorisation du 15 octobre 2026', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F15396' },
      lignes: [
        { libelle: 'Valeur de service du point', valeur: '1,4587 €', categorie: 'montant', peutChanger: true },
        { libelle: 'Revalorisation des pensions', valeur: '1,4 % au 1er novembre 2026 (décidée le 14 octobre 2026)', categorie: 'pourcent', peutChanger: true },
        { libelle: "Valeur d'achat du point pour 2027", valeur: 'pas encore fixée : négociation des partenaires sociaux pour 2027-2030', categorie: 'date', peutChanger: true },
        { libelle: 'Demande de retraite complémentaire', valeur: '6 mois avant la date de départ souhaitée', categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "L'Agirc-Arrco est le régime de retraite complémentaire obligatoire des salariés du secteur privé. C'est un régime par points : les cotisations sont converties en points de retraite, et à l'âge de la retraite ces points sont reconvertis en pension, qui s'ajoute à la retraite de base de l'Assurance retraite. La pension est versée chaque mois et peut être majorée pour les parents de plusieurs enfants. La valeur du point et la revalorisation des pensions changent chaque année : consultez la source officielle."
    },
    relations: [
      { ficheId: 'releve-de-carriere', type: 'voir-aussi' },
      { ficheId: 'retraite-progressive', type: 'voir-aussi' },
      { ficheId: 'carriere-longue', type: 'voir-aussi' }
    ]
  },
  {
    id: 'carriere-longue',
    titre: "Carrière longue (retraite anticipée)",
    titreDeTri: "Carrière longue", type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ["retraite anticipée", "départ anticipé", "commencé à travailler jeune", "partir avant 62 ans"],
    corps: "La retraite anticipée pour carrière longue permet à celles et ceux qui ont commencé à travailler jeune de partir avant l'âge minimum de départ, fixé entre 62 et 64 ans selon l'année de naissance. Il faut avoir commencé à travailler avant 16, 18, 20 ou 21 ans, et justifier d'un nombre de trimestres cotisés, tous régimes confondus, dont une part en tout début d'activité. Certaines périodes peuvent être retenues comme cotisées : les périodes de maternité, les trimestres du compte professionnel de prévention et les périodes de pension d'invalidité (2 trimestres au plus). D'autres comptent dans la limite de 4 trimestres chacune : l'assurance vieillesse des parents au foyer et des aidants, le service national, le chômage indemnisé, et la maladie ou l'accident du travail indemnisés. Les seuils dépendent de l'année de naissance et la réforme de 2023 est suspendue jusqu'en 2028.",
    detailsAJour: {
      verifieLe: '2026-11-03',
      source: { nom: 'Service-public.gouv.fr, fiche « Retraite anticipée pour carrière longue du salarié » (vérifiée le 1er septembre 2026) et actualité du 15 juillet 2026', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F13845' },
      lignes: [
        { libelle: 'Âge minimum de départ', valeur: "entre 62 et 64 ans selon l'année de naissance", categorie: 'seuil', peutChanger: true },
        { libelle: "Début d'activité", valeur: 'avant 16, 18, 20 ou 21 ans', categorie: 'seuil', peutChanger: true },
        { libelle: "Trimestres en tout début d'activité", valeur: "5 trimestres, ou 4 si l'on est né entre le 1er octobre et le 31 décembre", categorie: 'duree', peutChanger: true },
        { libelle: "Pension d'invalidité retenue", valeur: '2 trimestres au plus', categorie: 'duree', peutChanger: true },
        { libelle: 'Autres périodes retenues', valeur: '4 trimestres au plus pour chaque type de période', categorie: 'duree', peutChanger: true },
        { libelle: 'Suspension de la réforme', valeur: "jusqu'en 2028 (loi de financement de la Sécurité sociale pour 2026)", categorie: 'date', peutChanger: true },
        { libelle: 'Décret du 7 mai 2026', valeur: "personnes nées entre 1964 et 1970 dont la retraite prend effet à partir du 1er septembre 2026 : l'âge de départ peut être avancé de quelques mois", categorie: 'ref', peutChanger: true }
      ],
      phraseGenerale: "La retraite anticipée pour carrière longue permet à celles et ceux qui ont commencé à travailler jeune de partir avant l'âge minimum de départ. Il faut avoir commencé à travailler tôt et justifier d'un nombre de trimestres cotisés, dont une part en tout début d'activité. Certaines périodes, comme la maternité, le service national ou le chômage indemnisé, peuvent compter, dans des limites précises. Les seuils dépendent de l'année de naissance et la réforme des retraites a modifié ces règles : consultez la source officielle."
    },
    relations: [
      { ficheId: 'suspension-reforme-retraites-2026', type: 'voir-aussi' },
      { ficheId: 'releve-de-carriere', type: 'voir-aussi' },
      { ficheId: 'aspa', type: 'voir-aussi' }
    ]
  },
  {
    id: 'plafond-securite-sociale',
    titre: "Plafond annuel de la Sécurité sociale (PASS)",
    titreDeTri: "Plafond Sécurité sociale", type: 'terme',
    univers: 'bulletin-salaire', registres: ['langage-administratif', 'langage-rh'],
    variantesRecherche: ["PASS", "plafond de la sécu", "plafond de la sécurité sociale", "tranche 1 tranche 2"],
    corps: "Le plafond annuel de la Sécurité sociale, ou PASS, est un montant fixé chaque année, qui sert de référence pour calculer le montant maximal de certaines prestations (indemnités journalières, pensions d'invalidité, retraites du régime général) et certaines cotisations. Il est de 48 060 € en 2026, soit 4 005 € par mois. Le Bulletin officiel de la Sécurité sociale annonce 48 900 € pour 2027, soit 4 075 € par mois (+1,74 %). L'arrêté qui le fixe doit être publié avant la fin de 2026 : ce chiffre est annoncé, pas encore confirmé par un texte du Journal officiel.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.gouv.fr, actualité « Sécurité sociale : quel sera le plafond annuel en 2027 ? » (19 octobre 2026)", url: "https://www.service-public.gouv.fr/particuliers/actualites/A15386" },
      lignes: [
        { libelle: "Plafond annuel en 2026", valeur: "48 060 €", categorie: 'montant', peutChanger: true },
        { libelle: "Plafond mensuel en 2026", valeur: "4 005 €", categorie: 'montant', peutChanger: true },
        { libelle: "Plafond annuel en 2027 (annoncé)", valeur: "48 900 €", categorie: 'montant', peutChanger: true },
        { libelle: "Plafond mensuel en 2027 (annoncé)", valeur: "4 075 €", categorie: 'montant', peutChanger: true },
        { libelle: "Hausse annoncée pour 2027", valeur: "1,74 %", categorie: 'pourcent', peutChanger: true }
      ],
      phraseGenerale: "Le plafond annuel de la Sécurité sociale, ou PASS, est un montant fixé chaque année, qui sert de référence pour calculer le montant maximal de certaines prestations, comme les indemnités journalières, les pensions d'invalidité et les retraites du régime général, ainsi que certaines cotisations. Il est réévalué chaque année au début de l'année, par un arrêté : consultez la source officielle pour le montant en vigueur."
    },
    relations: [
      { ficheId: 'cotisations-sociales', type: 'voir-aussi' },
      { ficheId: 'bulletin-salaire', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pension-de-reversion',
    titre: "Retraite de réversion",
    titreDeTri: "Retraite de réversion", type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ["pension de réversion", "réversion veuve", "réversion veuf", "pension du conjoint décédé"],
    corps: "La retraite de réversion est une part de la retraite d'un conjoint décédé, versée au conjoint survivant par l'Assurance retraite, sous conditions. Il faut avoir au moins 55 ans, avoir été marié avec la personne décédée (le Pacs et le concubinage ne suffisent pas, mais un divorce n'empêche pas de la demander) et avoir des ressources annuelles brutes sous un plafond, actuellement de 25 001,60 € si l'on vit seul et de 40 002,56 € si l'on vit en couple. Elle peut aller jusqu'à 54 % de la retraite dont bénéficiait ou aurait pu bénéficier la personne décédée. Elle n'est pas attribuée automatiquement : il faut la demander, et le formulaire est en partie prérempli depuis quelques mois. Pour un ex-conjoint fonctionnaire, les conditions sont différentes.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.gouv.fr, actualité « Retraite de réversion : la procédure pour bénéficier du dispositif a été simplifiée » (23 octobre 2026)", url: "https://www.service-public.gouv.fr/particuliers/actualites/A19103" },
      lignes: [
        { libelle: "Âge minimum", valeur: "55 ans", categorie: 'seuil', peutChanger: true },
        { libelle: "Plafond de ressources annuelles brutes, personne seule", valeur: "25 001,60 €", categorie: 'montant', peutChanger: true },
        { libelle: "Plafond de ressources annuelles brutes, en couple", valeur: "40 002,56 €", categorie: 'montant', peutChanger: true },
        { libelle: "Part maximale de la retraite du conjoint", valeur: "54 %", categorie: 'pourcent', peutChanger: true }
      ],
      phraseGenerale: "La retraite de réversion est une part de la retraite d'un conjoint décédé, versée au conjoint survivant par l'Assurance retraite, sous conditions d'âge, de mariage avec la personne décédée et de ressources. Elle n'est pas attribuée automatiquement : il faut la demander, et le formulaire est en partie prérempli. Pour un ex-conjoint fonctionnaire, les conditions sont différentes. L'âge, les plafonds de ressources et la part versée changent : consultez la source officielle."
    },
    relations: [
      { ficheId: 'releve-de-carriere', type: 'voir-aussi' },
      { ficheId: 'agirc-arrco', type: 'voir-aussi' }
    ]
  },
  {
    id: 'paiement-direct-pension',
    titre: "Paiement direct de la pension alimentaire",
    titreDeTri: "Paiement direct", type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ["pension alimentaire impayée", "récupérer pension alimentaire", "saisie pension", "procédure paiement direct"],
    corps: "Le paiement direct est une procédure pour récupérer une pension alimentaire impayée. Le parent qui doit la recevoir peut la lancer dès le premier impayé, un seul jour de retard suffit, à condition d'avoir une décision de justice ou une convention qui fixe la pension. Un commissaire de justice la notifie, dans les 8 jours, à un tiers qui verse de l'argent au parent débiteur, par exemple son employeur ou sa banque ; ce tiers paie alors la pension directement au parent créancier. Elle couvre les impayés des 6 mois qui précèdent la notification et tous les impayés à venir, et les frais sont à la charge du parent débiteur. Le tiers qui ne verse pas la pension risque une amende de 1 500 € au plus (3 000 € en cas de récidive) ; un créancier de mauvaise foi, jusqu'à 10 000 €.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.gouv.fr, fiche « Pension alimentaire impayée : qu'est-ce que la procédure de paiement direct ? » (page vérifiée le 18 novembre 2024)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F998" },
      lignes: [
        { libelle: "Délai pour notifier la procédure au tiers", valeur: "8 jours", categorie: 'duree', peutChanger: true },
        { libelle: "Impayés couverts avant la notification", valeur: "6 mois", categorie: 'duree', peutChanger: true },
        { libelle: "Amende du tiers qui ne verse pas la pension", valeur: "1 500 € au plus (3 000 € en cas de récidive)", categorie: 'montant', peutChanger: true },
        { libelle: "Amende du créancier de mauvaise foi", valeur: "jusqu'à 10 000 €", categorie: 'montant', peutChanger: true }
      ],
      phraseGenerale: "Le paiement direct est une procédure pour récupérer une pension alimentaire impayée. Le parent qui doit la recevoir peut la lancer dès le premier impayé, à condition d'avoir une décision de justice ou une convention qui fixe la pension. Un commissaire de justice la notifie à un tiers qui verse de l'argent au parent débiteur, par exemple son employeur ou sa banque, et ce tiers paie alors la pension directement au parent créancier. Les délais, les périodes couvertes et les amendes sont fixés par la loi : consultez la source officielle."
    },
    relations: [
      { ficheId: 'asf', type: 'voir-aussi' },
      { ficheId: 'aripa', type: 'voir-aussi' },
      { ficheId: 'commissaire-de-justice', type: 'voir-aussi' }
    ]
  },
  {
    id: 'commissaire-de-justice',
    titre: "Commissaire de justice (ex-huissier de justice)",
    titreDeTri: "Commissaire de justice", type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique'],
    variantesRecherche: ["huissier", "huissier de justice", "acte d'huissier", "saisie"],
    corps: "Le commissaire de justice est le nouveau nom de l'huissier de justice. C'est lui qui remet un commandement de payer, notifie certaines procédures comme le paiement direct d'une pension alimentaire et, pour les procédures engagées depuis le 1er juillet 2025, met en œuvre la saisie sur salaire, qui ne passe plus par le tribunal. Une personne qui reçoit un acte d'un commissaire de justice peut demander conseil à un point-justice ou à un travailleur social avant de réagir.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.gouv.fr, fiche « Saisie sur salaire (ou saisie des rémunérations) » (page vérifiée le 1er avril 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F115" },
      lignes: [
        { libelle: "Saisie sur salaire menée par un commissaire de justice, pour les procédures engagées depuis le", valeur: "1er juillet 2025", categorie: 'date', peutChanger: false }
      ],
      phraseGenerale: "Le commissaire de justice est le nouveau nom de l'huissier de justice. C'est lui qui remet un commandement de payer, notifie certaines procédures comme le paiement direct d'une pension alimentaire et met en œuvre la saisie sur salaire, qui ne passe plus par le tribunal. Une personne qui reçoit un acte d'un commissaire de justice peut demander conseil à un point-justice ou à un travailleur social avant de réagir."
    },
    relations: [
      { ficheId: 'saisie-sur-salaire', type: 'voir-aussi' },
      { ficheId: 'commandement-de-payer', type: 'voir-aussi' },
      { ficheId: 'point-justice', type: 'voir-aussi' }
    ]
  },
  {
    id: 'juge-de-l-execution',
    titre: "Juge de l'exécution (JEX)",
    titreDeTri: "Juge de l'exécution", type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique'],
    variantesRecherche: ["JEX", "contester une saisie", "contester une saisie sur salaire", "tribunal saisie"],
    corps: "Le juge de l'exécution est le juge qui tranche les difficultés liées à l'exécution forcée d'une décision : par exemple, contester une saisie sur un compte bancaire ou sur un salaire. Les contestations d'exécution forcée mobilière introduites après le 1er décembre 2024 ont d'abord relevé du tribunal judiciaire, mais, selon un avis de la Cour de cassation du 13 mars 2025, le juge de l'exécution reste compétent pour contester une mesure d'exécution forcée mobilière, même portant sur des biens incorporels, et pour la saisie des rémunérations. Un avocat est obligatoire quand la créance dépasse 10 000 €. Les règles de compétence ont changé plusieurs fois et une loi est en cours d'adoption : en cas de doute, un point-justice ou un avocat dit quel tribunal saisir.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.gouv.fr, fiche « Saisir le juge de l'exécution (JEX) » (page vérifiée le 1er mars 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F35820" },
      lignes: [
        { libelle: "Transfert de compétence au tribunal judiciaire pour les contestations introduites après le", valeur: "1er décembre 2024", categorie: 'date', peutChanger: false },
        { libelle: "Avis de la Cour de cassation sur la compétence du juge de l'exécution", valeur: "13 mars 2025", categorie: 'date', peutChanger: false },
        { libelle: "Avocat obligatoire quand la créance dépasse", valeur: "10 000 €", categorie: 'montant', peutChanger: true }
      ],
      phraseGenerale: "Le juge de l'exécution est le juge qui tranche les difficultés liées à l'exécution forcée d'une décision : par exemple, contester une saisie sur un compte bancaire ou sur un salaire. Les règles de compétence entre ce juge et le tribunal judiciaire ont changé plusieurs fois, et un avocat est obligatoire au-dessus d'un certain montant de créance. En cas de doute, un point-justice ou un avocat dit quel tribunal saisir : consultez la source officielle."
    },
    relations: [
      { ficheId: 'saisie-sur-salaire', type: 'voir-aussi' },
      { ficheId: 'commissaire-de-justice', type: 'voir-aussi' }
    ]
  },
  {
    id: 'timbre-fiscal-justice',
    titre: "Timbre fiscal pour engager une procédure civile",
    titreDeTri: "Timbre fiscal justice", type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique', 'langage-administratif'],
    variantesRecherche: ["timbre fiscal prud'hommes", "timbre fiscal électronique", "acheter un timbre fiscal", "droit de timbre"],
    corps: "Pour engager certaines procédures civiles, il faut acheter un timbre fiscal de 50 €, et de 225 € pour faire appel d'une décision civile quand l'avocat est obligatoire. Il se vend uniquement sous forme électronique, en ligne, par carte bancaire, et il est acheté avant de saisir le tribunal, par la partie qui engage la procédure ou par son avocat. Il est demandé aussi pour saisir le conseil de prud'hommes, sauf si l'on bénéficie de l'aide juridictionnelle. Plusieurs procédures en sont dispensées, comme le surendettement, le juge des tutelles ou l'ordonnance de protection en cas de violences conjugales. Le timbre est valable 12 mois, et il est remboursable pendant 18 mois s'il n'a pas servi.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.gouv.fr, fiche « Comment acheter un timbre fiscal pour engager une procédure civile ou faire appel d'une décision civile ? » (page vérifiée le 10 avril 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F33227" },
      lignes: [
        { libelle: "Timbre pour engager une procédure civile", valeur: "50 €", categorie: 'montant', peutChanger: true },
        { libelle: "Timbre pour faire appel d'une décision civile", valeur: "225 €", categorie: 'montant', peutChanger: true },
        { libelle: "Durée de validité du timbre", valeur: "12 mois", categorie: 'duree', peutChanger: true },
        { libelle: "Remboursement possible pendant", valeur: "18 mois", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "Pour engager certaines procédures civiles, ou faire appel d'une décision civile, il faut acheter un timbre fiscal. Il se vend uniquement sous forme électronique, en ligne, par carte bancaire, et il est acheté avant de saisir le tribunal, par la partie qui engage la procédure ou par son avocat. Il est demandé aussi pour saisir le conseil de prud'hommes. Plusieurs procédures en sont dispensées, notamment pour les personnes qui bénéficient de l'aide juridictionnelle. Les montants et les durées de validité changent : consultez la source officielle."
    },
    relations: [
      { ficheId: 'aide-juridictionnelle', type: 'voir-aussi' },
      { ficheId: 'conseil-de-prud-hommes', type: 'voir-aussi' }
    ]
  },
  {
    id: 'harcelement-travail',
    titre: "Harcèlement moral et harcèlement sexuel au travail",
    titreDeTri: "Harcèlement", type: 'notion', gabarit: 'explication',
    univers: 'droit-travail', registres: ['langage-juridique'],
    variantesRecherche: ["harcèlement moral", "harcèlement sexuel", "harcèlement sexiste", "souffrance au travail"],
    corps: "Le harcèlement moral et le harcèlement sexuel ou sexiste sont des délits. Quel que soit le lien que l'on a avec l'auteur des faits, la victime est protégée par la loi. L'employeur a l'obligation de prendre toutes les mesures nécessaires pour prévenir le harcèlement moral. Une personne qui se sent victime peut en parler à un référent harcèlement s'il existe, aux représentants du personnel, au médecin du travail ou à l'inspection du travail, et saisir le conseil de prud'hommes ou déposer plainte. Il est utile de réunir des preuves datées : messages, courriels, attestations de témoins, certificat médical.",
    relations: [
      { ficheId: 'inspection-du-travail', type: 'voir-aussi' },
      { ficheId: 'defenseur-des-droits', type: 'voir-aussi' },
      { ficheId: 'medecine-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'conge-sans-solde',
    titre: "Congé sans solde",
    titreDeTri: "Congé sans solde", type: 'terme',
    univers: 'droit-travail', registres: ['langage-administratif', 'langage-rh'],
    variantesRecherche: ["congé pour convenances personnelles", "congé non payé", "prendre un congé sans solde", "congé sabbatique différence"],
    corps: "Un salarié peut prendre un congé sans solde pour des besoins personnels, comme s'occuper de ses enfants ou voyager, ou professionnels, comme créer une entreprise. Ce congé n'est pas prévu par la loi : il faut le demander à l'employeur, qui peut accepter ou refuser sans justifier son refus, sauf si la convention collective ou un accord d'entreprise le prévoit. Il n'existe pas de formalisme obligatoire, mais une demande écrite sert de preuve en cas de litige. Pendant ce congé, le salaire n'est pas versé, le contrat de travail est suspendu sans être rompu, et la personne ne doit pas exercer une activité qui ferait concurrence à son employeur. Il ne faut pas le confondre avec le congé sabbatique.",
    relations: [
      { ficheId: 'conges-payes', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'cpf-agents-publics',
    titre: "CPF des agents publics (compte en heures)",
    titreDeTri: "CPF agents publics", type: 'terme',
    univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ["CPF fonctionnaire", "CPF agent public", "formation fonctionnaire", "heures de formation fonction publique"],
    corps: "Dans la fonction publique d'État, le compte personnel de formation est alimenté en heures : un agent reçoit 25 heures à la fin de chaque année, jusqu'à 150 heures au maximum. Un agent qui veut prévenir une inaptitude à ses fonctions peut bénéficier de 150 heures supplémentaires, sur avis du médecin du travail. Les droits en euros acquis dans le secteur privé sont convertis en heures à raison d'une heure pour 15 € (une heure pour 12 € pour les droits du compte d'engagement citoyen), dans la limite de 150 heures. Si une demande de formation est refusée deux années de suite, la troisième ne peut l'être qu'après avis de la commission administrative paritaire.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.gouv.fr, fiche « Compte personnel de formation (CPF) dans la fonction publique d'État (FPE) » (page vérifiée le 1er août 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F18090" },
      lignes: [
        { libelle: "Heures ajoutées à la fin de chaque année", valeur: "25 heures", categorie: 'duree', peutChanger: true },
        { libelle: "Plafond du compte", valeur: "150 heures", categorie: 'seuil', peutChanger: true },
        { libelle: "Heures supplémentaires pour prévenir une inaptitude", valeur: "150 heures", categorie: 'duree', peutChanger: true },
        { libelle: "Conversion des droits en euros acquis dans le privé", valeur: "1 heure pour 15 €", categorie: 'montant', peutChanger: true },
        { libelle: "Conversion des droits du compte d'engagement citoyen", valeur: "1 heure pour 12 €", categorie: 'montant', peutChanger: true }
      ],
      phraseGenerale: "Dans la fonction publique d'État, le compte personnel de formation est alimenté en heures, à la fin de chaque année, jusqu'à un plafond. Un agent qui veut prévenir une inaptitude à ses fonctions peut bénéficier d'heures supplémentaires, sur avis du médecin du travail. Les droits en euros acquis dans le secteur privé sont convertis en heures, dans une limite fixée. Le nombre d'heures et les taux de conversion changent : consultez la source officielle."
    },
    relations: [
      { ficheId: 'concours-fonction-publique', type: 'voir-aussi' },
      { ficheId: 'cpf', type: 'voir-aussi' },
      { ficheId: 'bilan-competences', type: 'voir-aussi' }
    ]
  },
  {
    id: 'carte-talent',
    titre: "Carte de séjour « passeport talent »",
    titreDeTri: "Passeport talent", type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-administratif', 'langage-juridique'],
    variantesRecherche: ["carte talent", "carte bleue européenne", "titre de séjour qualifié", "passeport talent"],
    corps: "La carte talent est une carte de séjour pluriannuelle pour un étranger non européen qui veut travailler en France plus de 3 mois. Elle se demande si le séjour prévu dure au moins 1 an ; en dessous, un visa de long séjour valant titre de séjour suffit. Pour la carte « salarié qualifié », il faut notamment un contrat de travail de plus de 3 mois avec une rémunération brute annuelle d'au moins 39 582 €, et la carte est valable 4 ans au plus. La page de référence est en cours de mise à jour : le décret n° 2026-1001 du 26 octobre 2026 modifie, à compter du 30 octobre 2026, certains délais et règles du code de l'entrée et du séjour (refus implicite, carte bleue européenne, rémunération de certaines cartes de salariés détachés). Une personne concernée vérifie sa situation auprès de la préfecture.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.gouv.fr, fiche « Carte talent : carte de séjour pluriannuelle d'un étranger en France » (page vérifiée le 1er juin 2026, en cours de mise à jour)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F16922" },
      lignes: [
        { libelle: "Séjour prévu à partir duquel la carte est demandée", valeur: "1 an", categorie: 'duree', peutChanger: true },
        { libelle: "Validité maximale, salarié qualifié", valeur: "4 ans", categorie: 'duree', peutChanger: true },
        { libelle: "Rémunération brute annuelle minimale, salarié qualifié", valeur: "39 582 €", categorie: 'montant', peutChanger: true },
        { libelle: "Décret n° 2026-1001 du 26 octobre 2026, applicable à compter du", valeur: "30 octobre 2026", categorie: 'date', peutChanger: false }
      ],
      phraseGenerale: "La carte talent est une carte de séjour pluriannuelle pour un étranger non européen qui souhaite travailler en France. Il existe plusieurs motifs de délivrance, avec des conditions de durée de séjour, de diplôme et de rémunération fixées par la loi, qui ont été modifiées récemment. Une personne concernée vérifie sa situation auprès de la préfecture et consulte la source officielle."
    },
    relations: [
      { ficheId: 'titre-de-sejour', type: 'voir-aussi' },
      { ficheId: 'autorisation-de-travail', type: 'voir-aussi' }
    ]
  },
  {
    id: 'carte-de-resident-refugie',
    titre: "Titre de séjour du réfugié (carte de résident)",
    titreDeTri: "Carte de résident réfugié", type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ["réfugié titre de séjour", "carte de résident réfugié", "statut de réfugié", "document de voyage réfugié"],
    corps: "Quand l'Ofpra accorde le statut de réfugié, la personne reçoit un titre de séjour valable 10 ans : la carte de résident. Elle autorise à séjourner en France et à y travailler, sans que l'employeur ait à demander une autorisation de travail. Si la personne veut quitter la France pour un voyage, un document de voyage peut lui être délivré. Elle bénéficie aussi d'une aide pour l'accès aux droits. Les informations sur la démarche de demande de titre de séjour existent en plusieurs langues sur le site Refugies.info.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.gouv.fr, fiche « Réfugié : titre de séjour, document de voyage et accompagnement » (page vérifiée le 1er juillet 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F15401" },
      lignes: [
        { libelle: "Durée de validité de la carte de résident", valeur: "10 ans", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "Quand l'Ofpra accorde le statut de réfugié, la personne reçoit un titre de séjour, la carte de résident. Elle autorise à séjourner en France et à y travailler, sans que l'employeur ait à demander une autorisation de travail. Un document de voyage peut être délivré à la personne qui veut quitter la France pour un voyage. La durée de validité peut changer : consultez la source officielle."
    },
    relations: [
      { ficheId: 'ofpra', type: 'voir-aussi' },
      { ficheId: 'refugie-ou-protection-subsidiaire', type: 'voir-aussi' },
      { ficheId: 'contrat-integration-republicaine', type: 'voir-aussi' }
    ]
  },
  {
    id: 'compte-professionnel-de-prevention',
    titre: "Compte professionnel de prévention (points de pénibilité)",
    titreDeTri: "Compte professionnel de prevention", type: 'terme',
    univers: 'conditions-travail', registres: ['langage-administratif'],
    variantesRecherche: ["C2P", "points de pénibilité", "compte pénibilité", "compte personnel de prévention de la pénibilité"],
    corps: "Le compte professionnel de prévention, ou C2P, est un compte de points que gagne un salarié du secteur privé quand son employeur déclare qu'il a été exposé à certaines conditions de travail difficiles, comme le travail de nuit. On l'appelle encore « compte pénibilité » ou « points de pénibilité ». Six facteurs sont pris en compte : le travail de nuit, le travail en équipes successives alternantes, le travail répétitif, le bruit, les températures extrêmes et les activités en milieu hyperbare (hautes pressions), et seulement au-delà d'un seuil d'exposition. Un salarié présent toute l'année et exposé à un facteur gagne 4 points par an, 8 s'il est exposé à deux facteurs. Il n'a aucune démarche à faire pour les gagner : c'est l'employeur qui déclare l'exposition dans la déclaration sociale nominative. Les points restent acquis jusqu'à leur utilisation ou jusqu'au départ en retraite, même si la personne change d'employeur ou connaît des périodes sans emploi. Ils servent à financer une formation pour accéder à un emploi non exposé ou moins exposé (les 20 premiers points sont réservés à cet usage, sauf exceptions selon l'année de naissance), à travailler à temps partiel sans perte de salaire, ou à partir plus tôt à la retraite (10 points donnent un trimestre, jusqu'à 8 trimestres). Les salariés d'un régime spécial de retraite (SNCF, RATP, industries électriques et gazières) n'acquièrent pas de points.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, fiche « Compte professionnel de prévention (C2P) » (page vérifiée le 10 avril 2026) et Ameli", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F15504" },
      lignes: [
        { libelle: "Facteurs pris en compte", valeur: "6 facteurs de risques professionnels", categorie: 'seuil', peutChanger: true },
        { libelle: "Points gagnés par an et par facteur", valeur: "4 points (salarié présent toute l'année)", categorie: 'seuil', peutChanger: true },
        { libelle: "Seuil du travail de nuit", valeur: "1 heure de travail entre minuit et 5 heures, pendant 100 nuits par an", categorie: 'seuil', peutChanger: true },
        { libelle: "Valeur d'un point pour une formation", valeur: "500 €", categorie: 'montant', peutChanger: true },
        { libelle: "Points réservés à la formation", valeur: "les 20 premiers points", categorie: 'seuil', peutChanger: true },
        { libelle: "Valeur de 10 points pour la retraite", valeur: "1 trimestre de durée d'assurance, jusqu'à 8 trimestres, dès 55 ans", categorie: 'seuil', peutChanger: true },
        { libelle: "Temps partiel sans perte de salaire", valeur: "points utilisés par groupe de 10, plafond de 80 points avant 60 ans", categorie: 'seuil', peutChanger: true }
      ],
      phraseGenerale: "Le compte professionnel de prévention est un compte de points que gagne un salarié du secteur privé dont l'employeur déclare l'exposition à certaines conditions de travail difficiles, comme le travail de nuit. Ces points servent à se former pour un emploi moins exposé, à réduire son temps de travail sans perte de salaire ou à partir plus tôt à la retraite. Le nombre de points, leur valeur et les seuils d'exposition peuvent changer : consultez la source officielle pour les valeurs à jour."
    },
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' },
      { ficheId: 'travail-de-nuit', type: 'voir-aussi' },
      { ficheId: 'cep', type: 'voir-aussi' },
      { ficheId: 'carriere-longue', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'periode-de-reconversion',
    titre: "Période de reconversion",
    titreDeTri: "Periode de reconversion", type: 'terme',
    univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ["reconversion en alternance", "Transco", "changer de métier dans l'entreprise", "formation de reconversion salarié"],
    corps: "La période de reconversion est le dispositif qui permet à un salarié de changer de métier, dans son entreprise ou en dehors, en suivant une formation. Elle remplace depuis le 1er février 2026 la reconversion ou promotion par alternance (Pro-A) et les transitions collectives (Transco). Elle est ouverte à tous les salariés, alors que la Pro-A était réservée aux salariés en CDI, et aucun critère d'âge, d'expérience ou de niveau de qualification n'est demandé. Elle permet de préparer une qualification enregistrée au RNCP, un certificat de qualification professionnelle (CQP) de branche ou interbranche, ou un ou plusieurs blocs de compétences. La formation est financée par l'opérateur de compétences (Opco), sur demande de l'employeur, et le CPF du salarié peut aussi être mobilisé avec son accord. Les contrats Pro-A signés avant 2026 restent valables.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Un nouveau dispositif pour faciliter la reconversion des salariés » (13 février 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18798" },
      lignes: [
        { libelle: "Entrée en vigueur", valeur: "1er février 2026", categorie: 'date', peutChanger: false },
        { libelle: "Qui est concerné", valeur: "tout salarié, sans critère d'âge, d'expérience ni de qualification", categorie: 'seuil', peutChanger: true },
        { libelle: "Prise en charge par l'Opco", valeur: "9,15 € de l'heure à défaut de montant fixé par la branche ; montant moyen de 5 000 €", categorie: 'montant', peutChanger: true },
        { libelle: "Dossier de l'employeur à l'Opco", valeur: "dans les 30 jours calendaires qui précèdent le début de la période", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "La période de reconversion permet à un salarié de changer de métier, dans son entreprise ou en dehors, en suivant une formation financée par l'opérateur de compétences. Elle remplace la reconversion ou promotion par alternance et les transitions collectives, et elle est ouverte à tous les salariés. Les montants pris en charge et les délais de démarche peuvent changer : consultez la source officielle pour les valeurs à jour."
    },
    relations: [
      { ficheId: 'opco', type: 'voir-aussi' },
      { ficheId: 'reconversion', type: 'voir-aussi' },
      { ficheId: 'cpf', type: 'voir-aussi' }
    ]
  },
  {
    id: 'passeport-de-competences',
    titre: "Passeport de compétences",
    titreDeTri: "Passeport de competences", type: 'terme',
    univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ["CV numérique officiel", "portfolio de compétences", "valoriser son bénévolat", "Mon Compte Formation passeport"],
    corps: "Le Passeport de compétences est un service public numérique, gratuit et sécurisé, qui rassemble au même endroit les diplômes, les expériences professionnelles, les formations et les engagements citoyens d'une personne (bénévolat, service civique...). Il est intégré à Mon Compte Formation, accessible dès 15 ans, et géré par la Caisse des Dépôts. Il propose quatre fonctions : Mon parcours (les données), Mes compétences (leur cartographie), Mes CV (des CV structurés à partir de ces données) et Mon avenir (des pistes pour évoluer, se former ou se reconvertir). Il est ouvert aux salariés, aux demandeurs d'emploi, aux travailleurs indépendants, aux jeunes en formation ou en insertion et aux professionnels de l'accompagnement.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Le Passeport de compétences, un nouvel outil pour suivre et valoriser votre parcours professionnel » (30 juin 2026)", url: "https://www.service-public.gouv.fr/particuliers/actualites/A18976" },
      lignes: [
        { libelle: "Âge d'accès", valeur: "dès 15 ans", categorie: 'seuil', peutChanger: false },
        { libelle: "Coût", valeur: "gratuit", categorie: 'montant', peutChanger: false },
        { libelle: "Diplômes et certifications repris", valeur: "ceux délivrés depuis juillet 2021", categorie: 'date', peutChanger: true },
        { libelle: "Expériences professionnelles reprises", valeur: "salariées et non salariées, à partir de 2017", categorie: 'date', peutChanger: true }
      ],
      phraseGenerale: "Le Passeport de compétences est un service public numérique, gratuit et sécurisé, intégré à Mon Compte Formation. Il rassemble les diplômes, les expériences, les formations et les engagements citoyens d'une personne, et aide à construire des CV à partir de ces informations. Les conditions d'accès et les données reprises peuvent évoluer : consultez la source officielle pour les informations à jour."
    },
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' },
      { ficheId: 'vae', type: 'voir-aussi' },
      { ficheId: 'reconversion', type: 'voir-aussi' }
    ]
  },
  {
    id: 'qualiopi',
    titre: "Qualiopi",
    titreDeTri: "Qualiopi", type: 'terme',
    univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ["organisme de formation certifié", "label qualité formation", "formation financée par le CPF", "certification qualité des organismes de formation"],
    corps: "Qualiopi est la marque qui montre qu'un organisme de formation a été contrôlé selon un référentiel national de qualité. Elle concerne aussi les centres de bilan de compétences, les organismes qui accompagnent une VAE et les centres de formation d'apprentis. Cette certification est obligatoire pour qu'un organisme reçoive de l'argent d'un financeur public ou collectif : un opérateur de compétences, l'État, la région, France Travail, l'Agefiph, Transitions Pro ou la Caisse des dépôts. Pour vous, cela veut dire qu'une formation payée par l'un d'eux doit être donnée par un organisme certifié. Si vous avez un doute, demandez à l'organisme s'il est certifié Qualiopi avant de vous inscrire.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Ministère du Travail, « Référentiel national qualité : guide de lecture Qualiopi » (mis à jour le 30/10/2026)", url: "https://travail-emploi.gouv.fr/referentiel-national-qualite-guide-de-lecture-qualiopi" },
      lignes: [
        { libelle: "Obligation de certification", valeur: "pour recevoir des fonds des financeurs publics ou collectifs", categorie: 'ref', peutChanger: true },
        { libelle: "Actions concernées", valeur: "formation, VAE, bilan de compétences, formation par apprentissage", categorie: 'ref', peutChanger: true }
      ],
      phraseGenerale: "Qualiopi est la certification qualité des organismes de formation. Elle est obligatoire pour qu'un organisme reçoive des fonds des financeurs publics ou collectifs, comme les opérateurs de compétences, l'État, les régions ou France Travail."
    },
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' },
      { ficheId: 'vae', type: 'voir-aussi' },
      { ficheId: 'opco', type: 'voir-aussi' }
    ]
  },
  {
    id: 'fem',
    titre: "FEM (Fonds européen d'ajustement à la mondialisation)",
    titreDeTri: "FEM", type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ["FEM", "aide européenne licenciement collectif", "fonds européen pour les salariés licenciés", "aide européenne reconversion après licenciement"],
    corps: "Le FEM est un fonds européen qui aide à financer l'accompagnement de salariés touchés par un licenciement économique de grande ampleur : recherche d'emploi, orientation, formation, aide à la création d'entreprise. Il n'est pas versé directement à la personne : c'est l'entreprise qui monte la demande et qui assure le suivi, en finançant au moins 15 % des mesures. Il ne remplace pas les aides habituelles : il finance des mesures qui vont au-delà des obligations de l'employeur. Il ne finance ni les retraites ni les allocations chômage. Si votre entreprise licencie beaucoup de personnes à la fois, demandez à votre employeur ou à votre conseiller si ce fonds peut être mobilisé.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Ministère du Travail, « Le Fonds européen d'ajustement à la mondialisation en faveur des travailleurs licenciés (FEM) » (mis à jour le 17/09/2026)", url: "https://travail-emploi.gouv.fr/le-fonds-europeen-dajustement-la-mondialisation-en-faveur-des-travailleurs-licencies-fem" },
      lignes: [
        { libelle: "Nombre de personnes concernées", valeur: "au moins 200 salariés ou indépendants (selon les cas, sur 4 ou 6 mois, ou en cas de licenciement imminent)", categorie: 'seuil', peutChanger: true },
        { libelle: "Part financée par le FEM", valeur: "entre 60 % et 85 % des mesures", categorie: 'pourcent', peutChanger: true },
        { libelle: "Part de l'entreprise", valeur: "au moins 15 % du financement des mesures", categorie: 'pourcent', peutChanger: true }
      ],
      phraseGenerale: "Le FEM est un fonds européen qui cofinance l'accompagnement de salariés touchés par des licenciements économiques de grande ampleur. C'est l'entreprise qui fait la demande ; l'aide ne va pas directement à la personne."
    },
    relations: [
      { ficheId: 'licenciement', type: 'voir-aussi' },
      { ficheId: 'csp', type: 'voir-aussi' },
      { ficheId: 'reconversion', type: 'voir-aussi' }
    ]
  },
  {
    id: 'activite-partielle',
    titre: "Activité partielle (chômage partiel)",
    titreDeTri: "Activite partielle chomage partiel", type: 'terme',
    univers: 'droit-travail', registres: ['langage-administratif'],
    variantesRecherche: ["chômage partiel", "chômage technique", "heures chômées", "mon employeur réduit mon temps de travail"],
    corps: "L'activité partielle, souvent appelée chômage partiel, permet à une entreprise qui ralentit ou arrête son travail pour un temps de garder ses salariés. Le contrat de travail continue, mais il est suspendu pendant les heures non travaillées : on est alors indemnisé pour ces heures. L'entreprise doit d'abord obtenir l'accord de l'administration. Cela peut arriver à cause d'une baisse d'activité, de difficultés d'approvisionnement, d'un sinistre, d'intempéries ou de travaux de modernisation. C'est l'employeur qui verse l'indemnité à la date habituelle de paie, avec la mention sur le bulletin de salaire, puis il est remboursé par l'État. L'activité partielle ne s'applique pas quand l'activité est réduite à cause d'une grève. Ce n'est pas un licenciement : si votre employeur vous annonce une activité partielle, demandez-lui l'accord obtenu et regardez votre bulletin de salaire. En cas de doute, un conseiller ou la DDETS peut vous répondre.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr (Entreprendre), « Chômage partiel (activité partielle) » (fiche vérifiée le 13/08/2026)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23503" },
      lignes: [
        { libelle: "Indemnité versée au salarié", valeur: "60 % du salaire brut par heure chômée, soit environ 72 % du salaire net horaire", categorie: 'pourcent', peutChanger: true },
        { libelle: "Minimum par heure chômée", valeur: "9,74 €", categorie: 'montant', peutChanger: true },
        { libelle: "Plafond par heure chômée", valeur: "33,24 €", categorie: 'montant', peutChanger: true },
        { libelle: "Durée d'une autorisation", valeur: "3 mois, renouvelable dans la limite de 6 mois sur 12 mois consécutifs", categorie: 'duree', peutChanger: true },
        { libelle: "Minimum de remboursement à l'employeur", valeur: "8,57 € par heure (revalorisé au 1er janvier 2026)", categorie: 'montant', peutChanger: true }
      ],
      phraseGenerale: "En activité partielle, le contrat de travail continue et les heures non travaillées sont indemnisées par l'employeur, qui est ensuite remboursé par l'État. Le montant exact et la durée possible changent : vérifiez-les sur la page officielle."
    },
    relations: [
      { ficheId: 'csp', type: 'voir-aussi' },
      { ficheId: 'cse', type: 'voir-aussi' }
    ]
  },
  {
    id: 'droit-de-retrait',
    titre: "Droit de retrait",
    titreDeTri: "Droit de retrait", type: 'terme',
    univers: 'sante-travail', registres: ['langage-juridique'],
    variantesRecherche: ["danger grave et imminent", "refuser de travailler dangereux", "droit d'alerte"],
    corps: "Le droit de retrait permet à un salarié qui a un motif raisonnable de penser que son travail présente un danger grave et imminent pour sa vie ou sa santé de quitter son poste, ou de refuser de s'y installer, sans l'accord de l'employeur. Il faut prévenir tout de suite l'employeur ou son responsable : à l'oral en cas d'urgence, mais un écrit est préférable. Si le retrait est justifié, l'employeur ne peut ni sanctionner ni licencier, et le salaire est maintenu. S'il ne l'est pas, il peut retenir le salaire. En cas de litige, on peut saisir le conseil de prud'hommes. Le retrait ne doit pas mettre en danger d'autres personnes.",
    relations: [
      { ficheId: 'cse', type: 'voir-aussi' },
      { ficheId: 'harcelement-travail', type: 'voir-aussi' },
      { ficheId: 'droit-de-greve', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'droit-de-greve',
    titre: "Droit de grève (salariés du privé)",
    titreDeTri: "Droit de greve salaries du prive", type: 'terme',
    univers: 'droit-travail', registres: ['langage-juridique'],
    variantesRecherche: ["faire grève", "grève", "arrêt collectif du travail"],
    corps: "La grève est un arrêt collectif et concerté du travail pour défendre des revendications professionnelles que l'employeur connaît. Tout salarié du privé peut y participer, syndiqué ou non. Il n'a pas à prévenir l'employeur ni à respecter un préavis, sauf règles particulières dans les transports de voyageurs et les services publics. Il ne peut pas être sanctionné pour avoir fait grève, sauf faute lourde. Le contrat de travail est suspendu : le salaire est retenu en proportion de la durée de l'arrêt, et la grève ne figure pas sur le bulletin de paie.",
    relations: [
      { ficheId: 'cse', type: 'voir-aussi' },
      { ficheId: 'licenciement', type: 'voir-aussi' }
    ]
  },
  {
    id: 'ame',
    titre: "Aide médicale de l'État (AME)",
    titreDeTri: "Aide medicale de l'Etat AME", type: 'terme',
    univers: 'acces-aux-soins', registres: ['langage-administratif'],
    variantesRecherche: ["AME", "soins sans papiers", "santé étranger en situation irrégulière"],
    corps: "L'aide médicale de l'État permet à une personne étrangère en situation irrégulière de se soigner sans avancer les frais. Il faut vivre en France depuis plus de 3 mois, ne pas avoir de titre de séjour depuis plus de 3 mois et avoir des ressources sous un plafond. Les enfants mineurs y ont droit sans délai de résidence. Les demandeurs d'asile n'en relèvent pas : ils dépendent de la protection universelle maladie. Le dossier se dépose à la caisse d'assurance maladie du lieu de résidence ; l'aide est valable un an.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Aide médicale de l'État (AME) » (fiche vérifiée le 1er avril 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F3079" },
      lignes: [
        { libelle: "Plafond de ressources, personne seule en métropole", valeur: "10 421 € par an (12 derniers mois)", categorie: 'montant', peutChanger: true },
        { libelle: "Durée de l'aide", valeur: "1 an à partir du dépôt de la demande", categorie: 'duree', peutChanger: true },
        { libelle: "Réponse de la caisse", valeur: "2 mois au plus, sans réponse la demande est refusée", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "L'aide médicale de l'État dépend de la durée de résidence et des ressources du foyer. Le plafond et les règles changent : vérifiez-les sur la page officielle ou auprès de la caisse d'assurance maladie."
    },
    relations: [
      { ficheId: 'puma', type: 'voir-aussi' },
      { ficheId: 'css', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'ordonnance-de-protection',
    titre: "Ordonnance de protection (violences conjugales)",
    titreDeTri: "Ordonnance de protection violences conjugales", type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-juridique'],
    variantesRecherche: ["protection victime de violences", "interdiction de contact", "juge aux affaires familiales violences"],
    corps: "L'ordonnance de protection est une décision du juge aux affaires familiales qui protège une personne victime de violences de la part de son conjoint, de son ex-conjoint, de son partenaire de Pacs ou de son concubin. On peut la demander même sans avoir déposé plainte. Le juge peut interdire à l'auteur de contacter la victime ou de s'approcher de son domicile et de son travail, et peut régler le logement, l'autorité parentale et les obligations financières. Un avocat est conseillé, mais pas obligatoire. En danger grave et immédiat, une ordonnance provisoire peut être rendue en 24 heures. Ne pas respecter l'ordonnance est puni par la loi.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Violences conjugales » (fiche vérifiée le 1er avril 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F12544" },
      lignes: [
        { libelle: "Durée de l'ordonnance", valeur: "12 mois", categorie: 'duree', peutChanger: true },
        { libelle: "Délai de l'audience", valeur: "6 jours après la date fixée", categorie: 'duree', peutChanger: true },
        { libelle: "Ordonnance provisoire en danger grave et immédiat", valeur: "décision sous 24 heures", categorie: 'duree', peutChanger: true },
        { libelle: "Écoute des femmes victimes (3919)", valeur: "gratuit, 24 h sur 24, 7 jours sur 7", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "L'ordonnance de protection est une décision du juge qui peut être demandée sans plainte. Sa durée et ses délais peuvent changer : vérifiez-les sur la page officielle. En cas d'urgence, appelez le 17, le 112, ou envoyez un SMS au 114."
    },
    relations: [
      { ficheId: 'violences', type: 'voir-aussi' },
      { ficheId: 'aide-juridictionnelle', type: 'voir-aussi' },
      { ficheId: 'siao-115', type: 'voir-aussi' }
    ]
  },
  {
    id: 'jdc',
    titre: "Journée défense et citoyenneté (JDC)",
    titreDeTri: "Journee defense et citoyennete JDC", type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ["JDC", "JAPD", "recensement citoyen", "certificat de participation"],
    corps: "La journée défense et citoyenneté est une étape obligatoire pour les jeunes Français, filles et garçons, après le recensement citoyen fait dès 16 ans à la mairie ou en ligne. On est convoqué automatiquement, et la journée dure 7 heures. À la fin, on reçoit un certificat individuel de participation : il est demandé pour passer le permis de conduire et certains examens ou concours jusqu'à 24 ans. Un salarié ou un apprenti a droit à une journée d'absence sans perte de salaire. Si on ne l'a pas faite avant 18 ans, on peut régulariser sa situation jusqu'à 25 ans en contactant le centre du service national et de la jeunesse.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Journée défense et citoyenneté (JDC) » (fiche vérifiée le 14 avril 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F871" },
      lignes: [
        { libelle: "Recensement citoyen", valeur: "dès 16 ans", categorie: 'duree', peutChanger: true },
        { libelle: "Durée de la journée", valeur: "7 heures", categorie: 'duree', peutChanger: true },
        { libelle: "Régulariser une JDC non faite", valeur: "jusqu'à 25 ans", categorie: 'duree', peutChanger: true },
        { libelle: "Changer la date ou le lieu", valeur: "dans les 15 jours après la convocation", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "La journée défense et citoyenneté est obligatoire pour les jeunes Français après le recensement citoyen, et le certificat de participation est demandé pour le permis et certains examens. Les âges et les délais peuvent changer : vérifiez-les sur la page officielle."
    },
    relations: [
      { ficheId: 'volontariat-armees', type: 'voir-aussi' },
      { ficheId: 'service-civique', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pix',
    titre: "Pix (compétences numériques)",
    titreDeTri: "Pix competences numeriques", type: 'terme',
    univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ["certification Pix", "test compétences numériques", "niveau informatique"],
    corps: "Pix est un service public en ligne qui permet de mesurer, de développer et de certifier ses compétences numériques. On s'entraîne d'abord sur la plateforme. La certification se passe sur place, dans un centre agréé ou dans un établissement scolaire : c'est un test adapté à vos réponses, de 32 questions et d'1 h 45. Le résultat et le certificat sont ensuite sur votre compte Pix, et le score peut figurer sur un CV. Les formations qui préparent à cette certification peuvent être financées avec le compte personnel de formation. La page officielle ne donne pas le prix : renseignez-vous auprès du centre de certification.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Pix, page « Se certifier »", url: "https://pix.fr/se-certifier/" },
      lignes: [
        { libelle: "Durée du test de certification", valeur: "1 h 45", categorie: 'duree', peutChanger: true },
        { libelle: "Nombre de questions", valeur: "32", categorie: 'seuil', peutChanger: true },
        { libelle: "Condition pour se présenter", valeur: "niveau 1 au minimum dans 5 compétences", categorie: 'seuil', peutChanger: true }
      ],
      phraseGenerale: "Pix permet de mesurer et de certifier ses compétences numériques. La durée du test et les conditions pour s'y présenter peuvent changer : vérifiez-les sur le site de Pix."
    },
    relations: [
      { ficheId: 'cpf', type: 'voir-aussi' },
      { ficheId: 'tiers-de-confiance-numerique', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pacte-fonction-publique',
    titre: "PACTE (entrer dans la fonction publique sans concours)",
    titreDeTri: "PACTE entrer dans la fonction publique sans concours", type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-administratif'],
    variantesRecherche: ["PACTE", "recrutement sans concours", "contrat PACTE", "fonction publique sans diplôme"],
    corps: "Le PACTE est un contrat qui permet d'entrer sans concours dans un emploi de catégorie C de la fonction publique d'État, territoriale ou hospitalière. Il s'adresse aux jeunes de 16 à 28 ans sans diplôme ou sans qualification professionnelle, et aux personnes d'au moins 45 ans, chômeuses de longue durée, qui touchent le RSA, l'ASS ou l'AAH. C'est un contrat de 12 mois à 2 ans avec une formation en alternance, au moins 20 % de la durée. La sélection se fait sur dossier et entretien, à partir d'un avis de recrutement. À la fin, une commission juge si l'on peut être titularisé.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Recrutement dans la fonction publique dans le cadre du Pacte » (fiche vérifiée le 1er juin 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F12686" },
      lignes: [
        { libelle: "Âge pour les jeunes", valeur: "16 à 28 ans, sans diplôme ni qualification ou niveau inférieur au bac", categorie: 'duree', peutChanger: true },
        { libelle: "Âge pour les chômeurs de longue durée", valeur: "45 ans et plus, avec RSA, ASS ou AAH", categorie: 'duree', peutChanger: true },
        { libelle: "Durée du contrat", valeur: "12 mois à 2 ans", categorie: 'duree', peutChanger: true },
        { libelle: "Salaire brut mensuel minimum, moins de 21 ans", valeur: "990,96 €", categorie: 'montant', peutChanger: true },
        { libelle: "Salaire brut mensuel minimum, 21 ans et plus", valeur: "1 261,22 €", categorie: 'montant', peutChanger: true }
      ],
      phraseGenerale: "Le PACTE permet d'entrer dans la fonction publique en catégorie C sans concours, avec une formation en alternance. Les conditions d'âge, la durée et le salaire minimum peuvent changer : vérifiez-les sur la page officielle."
    },
    relations: [
      { ficheId: 'demandeur-emploi-longue-duree', type: 'voir-aussi' },
      { ficheId: 'alternance', type: 'voir-aussi' },
      { ficheId: 'concours-fonction-publique', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'concours-fonction-publique',
    titre: "Concours de la fonction publique (externe, interne, 3e concours)",
    titreDeTri: "Concours de la fonction publique externe interne troisieme concours", type: 'terme',
    univers: 'emploi-recrutement', registres: ['langage-administratif'],
    variantesRecherche: ["concours externe", "concours interne", "troisième concours", "devenir fonctionnaire"],
    corps: "Pour devenir fonctionnaire, on passe en général un concours, dans la fonction publique d'État, territoriale ou hospitalière. Il y a trois voies. Le concours externe est ouvert selon le diplôme demandé : niveau CAP, BEP ou brevet pour la catégorie C, du bac à bac+2 pour la B, bac+2 ou bac+3 et plus pour la A. Le concours interne est réservé notamment aux agents publics. Le troisième concours est ouvert à des personnes qui ont une expérience professionnelle, un mandat d'élu local ou des responsabilités associatives. Sans le diplôme, une équivalence est possible avec au moins 3 ans d'expérience. On s'inscrit en ligne à partir de l'avis de concours, puis on passe les épreuves.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-Public.fr, « Concours de la fonction publique » (fiche vérifiée le 11 septembre 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F434" },
      lignes: [
        { libelle: "Diplôme pour le concours externe, catégorie C", valeur: "niveau 3 (CAP, BEP, brevet des collèges)", categorie: 'seuil', peutChanger: true },
        { libelle: "Expérience pour une équivalence de diplôme", valeur: "au moins 3 ans à temps plein", categorie: 'duree', peutChanger: true },
        { libelle: "Note éliminatoire (fonction publique territoriale)", valeur: "moins de 5 sur 20 à une épreuve obligatoire", categorie: 'seuil', peutChanger: true }
      ],
      phraseGenerale: "Le concours externe demande un diplôme selon la catégorie visée, et une équivalence est possible avec de l'expérience. Les diplômes exigés et les règles de notation changent selon le concours : vérifiez-les sur l'avis de concours."
    },
    relations: [
      { ficheId: 'pacte-fonction-publique', type: 'a-ne-pas-confondre' },
      { ficheId: 'cpf-agents-publics', type: 'voir-aussi' }
    ]
  },
  {
    id: 'conge-supplementaire-de-naissance',
    titre: "Congé supplémentaire de naissance",
    titreDeTri: "Conge supplementaire de naissance", type: 'terme',
    univers: 'protection-sociale', registres: ['langage-administratif'],
    variantesRecherche: ["CSN", "congé parental court", "congé après paternité", "congé de naissance supplémentaire"],
    corps: "Le congé supplémentaire de naissance donne à chaque parent 1 à 2 mois de congé indemnisé, en plus des congés de maternité, de paternité et d'accueil de l'enfant, ou d'adoption. Il est en vigueur depuis le 1er juillet 2026 pour les enfants nés ou adoptés à partir du 1er janvier 2026. C'est un droit individuel, qui ne se transfère pas à l'autre parent : les parents peuvent le prendre en même temps ou l'un après l'autre. Il doit commencer dans les 9 mois suivant la naissance ou l'arrivée de l'enfant, après les autres congés. Le salarié prévient son employeur au moins 1 mois avant, par lettre recommandée avec accusé de réception ou remise en main propre.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualités « Entrée en vigueur du congé supplémentaire de naissance » (3 juin 2026, mise à jour le 23 juin 2026) et « De nouvelles modalités pour déclarer un congé supplémentaire de naissance » (7 octobre 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18939" },
      lignes: [
        { libelle: "Durée", valeur: "1 à 2 mois par parent, fractionnable en 2 périodes d'un mois", categorie: 'duree', peutChanger: true },
        { libelle: "Délai pour commencer", valeur: "dans les 9 mois suivant la naissance ou l'arrivée de l'enfant, après les autres congés", categorie: 'duree', peutChanger: true },
        { libelle: "Indemnisation dans le secteur privé", valeur: "70 % du salaire plafonné le 1er mois, 60 % le 2e mois", categorie: 'pourcent', peutChanger: true },
        { libelle: "Prévenir l'employeur", valeur: "au moins 1 mois avant (15 jours si le congé suit un congé de paternité ou d'adoption)", categorie: 'duree', peutChanger: true },
        { libelle: "Déclaration par l'employeur", valeur: "formulaire et signalement DSN, depuis le 1er octobre 2026", categorie: 'date', peutChanger: true }
      ],
      phraseGenerale: "Le congé supplémentaire de naissance donne à chaque parent un congé indemnisé en plus des congés de maternité, de paternité et d'accueil de l'enfant, ou d'adoption. C'est un droit individuel, qui ne se transfère pas à l'autre parent. Les dates, les délais, la durée et le taux d'indemnisation peuvent changer : consultez la source officielle pour les valeurs à jour."
    },
    relations: [
      { ficheId: 'conge-maternite-paternite', type: 'voir-aussi' },
      { ficheId: 'conge-sans-solde', type: 'a-ne-pas-confondre' }
    ]
  },
  {
    id: 'transparence-salariale',
    titre: "Transparence salariale",
    titreDeTri: "Transparence salariale", type: 'notion', gabarit: 'explication',
    univers: 'droit-travail', registres: ['langage-administratif'],
    variantesRecherche: ["fourchette de salaire", "salaire dans l'annonce", "écart de rémunération femmes hommes", "directive européenne salaires"],
    corps: "La transparence salariale désigne l'obligation, issue d'une directive européenne adoptée le 10 mai 2023, de rendre les rémunérations plus lisibles pour les candidats et les salariés, afin de repérer et de corriger les écarts de salaire entre les femmes et les hommes. En France, un projet de loi de transposition a été présenté en Conseil des ministres le 10 septembre 2026. Il n'est pas encore adopté : il doit être examiné par le Sénat et l'Assemblée nationale, donc les règles décrites ici sont celles annoncées. Elles concernent le recrutement (la rémunération ou une fourchette serait indiquée au candidat, et il serait interdit de lui demander sa rémunération actuelle ou passée), le droit des salariés à connaître les niveaux de rémunération moyens de leur catégorie d'emploi, sans accès aux rémunérations individuelles, et l'interdiction des clauses qui empêchent de parler de sa propre rémunération. Les entreprises d'au moins 50 salariés devraient mesurer et déclarer des indicateurs d'écarts de rémunération.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Le projet de loi pour la transparence salariale a été présenté en Conseil des ministres » (10 septembre 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A19060" },
      lignes: [
        { libelle: "Statut du texte", valeur: "projet de loi présenté le 10 septembre 2026, pas encore adopté", categorie: 'date', peutChanger: true },
        { libelle: "Entreprises concernées par les indicateurs", valeur: "50 salariés et plus", categorie: 'seuil', peutChanger: true },
        { libelle: "Pour le candidat", valeur: "rémunération ou fourchette communiquée, question sur la rémunération passée interdite", categorie: 'ref', peutChanger: true }
      ],
      phraseGenerale: "La transparence salariale vise à rendre les rémunérations plus lisibles pour les candidats et les salariés, afin de repérer et de corriger les écarts entre les femmes et les hommes. Elle repose sur une directive européenne dont la transposition en droit français est en cours : les règles décrites sont celles annoncées, pas encore en vigueur. Consultez la source officielle pour connaître l'état à jour du texte."
    },
    relations: [
      { ficheId: 'index-egalite-professionnelle', type: 'voir-aussi' },
      { ficheId: 'discrimination-embauche', type: 'voir-aussi' }
    ]
  },
  {
    id: 'flagrance-sociale',
    titre: "Flagrance sociale",
    titreDeTri: "Flagrance sociale", type: 'notion', gabarit: 'explication',
    univers: 'droit-travail', registres: ['langage-administratif'],
    variantesRecherche: ["travail dissimulé", "procès-verbal Urssaf", "mesures conservatoires", "fraude sociale"],
    corps: "La flagrance sociale est une procédure créée par la loi du 25 juin 2026 relative à la lutte contre les fraudes sociales et fiscales, pour lutter contre le travail dissimulé. Quand les agents chargés du contrôle constatent des faits qui pourraient menacer le recouvrement des cotisations dues, ils peuvent dresser un procès-verbal de flagrance sociale, qui permet à l'Urssaf de prendre des mesures conservatoires, c'est-à-dire de bloquer un bien ou de sauvegarder un droit sans passer par le juge, pour garantir le paiement. Elle remplace la disposition actuelle sur les mesures conservatoires en cas de travail dissimulé et entrera en vigueur au plus tard le 1er janvier 2027. Le procès-verbal comporte notamment une évaluation des cotisations et contributions non payées et la mention des majorations et pénalités. La personne contrôlée peut demander la mainlevée des mesures en apportant des garanties suffisantes de paiement.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Mise en place d'une procédure de flagrance sociale pour lutter contre le travail dissimulé » (29 juin 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18912" },
      lignes: [
        { libelle: "Entrée en vigueur", valeur: "au plus tard le 1er janvier 2027", categorie: 'date', peutChanger: true },
        { libelle: "Texte", valeur: "loi du 25 juin 2026, article 93", categorie: 'ref', peutChanger: false }
      ],
      phraseGenerale: "La flagrance sociale est une procédure contre le travail dissimulé : les agents de contrôle peuvent dresser un procès-verbal qui permet à l'Urssaf de prendre des mesures conservatoires pour garantir le paiement des cotisations dues. Elle remplace une disposition existante et son entrée en vigueur est encadrée par la loi : consultez la source officielle pour connaître l'état à jour."
    },
    relations: [
      { ficheId: 'cotisations-sociales', type: 'voir-aussi' }
    ]
  },
  {
    id: 'demarchage-telephonique',
    titre: "Démarchage téléphonique",
    titreDeTri: "Demarchage telephonique", type: 'terme',
    univers: 'demarches-administratives', registres: ['langage-administratif'],
    variantesRecherche: ["Bloctel", "appels commerciaux", "consentement démarchage", "arnaque par téléphone"],
    corps: "Depuis le 11 août 2026, le démarchage téléphonique à des fins commerciales est interdit par principe, pour les entreprises de tous les secteurs d'activité. Avant cette date, seuls quelques secteurs étaient concernés (rénovation énergétique, adaptation des logements au handicap et à la vieillesse) et on pouvait s'inscrire sur Bloctel. Une entreprise ne peut appeler que dans deux cas : l'appel concerne un contrat en cours et a un rapport avec son objet, ou la personne a donné son accord préalable. Le consentement doit être libre, éclairé et exprimé par un acte positif clair. L'entreprise doit préciser la nature des biens ou services et la durée du consentement, qui ne peut pas dépasser 1 an et ne se renouvelle pas tacitement. La personne peut retirer son accord à tout moment, simplement, même oralement. Le démarchage reste permis uniquement du lundi au vendredi, de 10 h à 13 h et de 14 h à 20 h.",
    detailsAJour: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Démarchage téléphonique interdit : quelles sont les nouvelles règles ? » (publiée le 21 juillet 2026, mise à jour le 11 août 2026)", url: "https://www.service-public.gouv.fr/particuliers/actualites/A19003" },
      lignes: [
        { libelle: "Date de la règle", valeur: "11 août 2026", categorie: 'date', peutChanger: false },
        { libelle: "Durée maximale du consentement", valeur: "1 an, sans renouvellement tacite", categorie: 'duree', peutChanger: true },
        { libelle: "Jours et horaires permis", valeur: "du lundi au vendredi, de 10 h à 13 h et de 14 h à 20 h", categorie: 'duree', peutChanger: true }
      ],
      phraseGenerale: "Le démarchage téléphonique à des fins commerciales est désormais interdit par principe : une entreprise ne peut appeler que pour un contrat en cours ou avec l'accord préalable de la personne, qui peut le retirer à tout moment. Les règles précises (durée du consentement, jours et horaires d'appel) peuvent changer : consultez la source officielle pour les informations à jour."
    },
    relations: [
      { ficheId: 'microcredit-personnel', type: 'voir-aussi' }
    ]
  }
];

var LEXIQUE_COLLECTIONS = [
  {
    id: 'collection-iae',
    titre: "Comprendre l'insertion par l'activité économique",
    icone: '📚',
    mode: 'collection',
    fichesOrdonnees: ['iae', 'siae', 'aci', 'ei', 'ai', 'etti', 'geiq',
      'pass-iae'
    ]
  },
  {
    id: 'collection-zonage-territoire',
    titre: 'Comprendre les zonages du territoire',
    icone: '🗺️',
    mode: 'collection',
    fichesOrdonnees: ['bassin-emploi', 'zone-d-emploi', 'qpv', 'frr', 'emploi-franc',
      'zonage-ars'
    ]
  },
  {
    id: 'parcours-entretien',
    titre: 'Je prépare un entretien',
    icone: '💼',
    mode: 'parcours',
    accroche: "Comprendre ce qui se joue pendant un entretien, pas préparer des réponses toutes faites.",
    fichesOrdonnees: [
      'cv-lecture-recruteur', 'ats', 'lettre-motivation', 'parlez-moi-de-vous',
      'autonomie', 'savoir-etre', 'savoir-faire', 'savoir-etre-ou-savoir-faire', 'soft-skills-ou-hard-skills', 'esprit-equipe', 'force-proposition', 'rigueur', 'transparence-salariale'
    ]
  },
  {
    id: 'parcours-bulletin-salaire',
    titre: 'Comprendre sa fiche de paie',
    icone: '🧾',
    mode: 'parcours',
    accroche: "Comprendre ce qui compose mon salaire et pourquoi le montant reçu diffère du montant annoncé.",
    fichesOrdonnees: [
      'bulletin-salaire', 'salaire-brut', 'cotisations-sociales', 'prelevement-source', 'salaire-net', 'smic', 'inflation',
      'heures-supplementaires', 'primes', 'indemnites', 'prime-ou-indemnite', 'conges-payes', 'absences',
      'cumuls', 'remboursement-frais', 'cout-employeur', 'rgdu', 'plafond-securite-sociale', 'transparence-salariale'
    ]
  },
  {
    id: 'collection-acteurs-insertion',
    titre: "Les acteurs de l'insertion professionnelle",
    icone: '📚',
    mode: 'collection',
    fichesOrdonnees: ['france-travail', 'mission-locale', 'cap-emploi', 'caf', 'francetravail-missionlocale-capemploi', 'cip', 'reseau-pour-emploi',
      'coach', 'cesf'
    ]
  },
  {
    id: 'parcours-contrat-travail',
    titre: 'Comprendre un contrat de travail',
    icone: '🖊️',
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
    icone: '🧩',
    mode: 'parcours',
    accroche: "Comprendre le vocabulaire que mon conseiller utilise pendant mon accompagnement.",
    fichesOrdonnees: [
      'diagnostic-partage', 'positionnement', 'frein-emploi', 'plan-action', 'prescription', 'reconversion', 'employabilite'
    ]
  },
  {
    id: 'parcours-sante-travail',
    titre: 'Comprendre sa santé au travail',
    icone: '🩺',
    mode: 'parcours',
    accroche: "Comprendre comment la santé et le travail s'articulent, sans jargon médical ou juridique.",
    fichesOrdonnees: [
      'rqth', 'rqth-ou-invalidite', 'medecine-travail', 'arret-de-travail-indemnites-journalieres',
      'accident-travail-maladie-professionnelle', 'aptitude-ou-inaptitude', 'amenagement-poste', 'maintien-emploi',
      'visite-d-information-et-de-prevention'
    ]
  },
  {
    id: 'parcours-demarches-france-travail',
    titre: 'Mes démarches avec France Travail',
    icone: '🗂️',
    mode: 'parcours',
    accroche: "Comprendre mes démarches et mes droits pendant que je suis suivi par France Travail.",
    fichesOrdonnees: ['franceconnect', 'actualisation', 'are', 'attestation-employeur']
  },
  {
    id: 'collection-dispositifs-accompagnement',
    titre: "Comprendre les dispositifs d'accompagnement",
    icone: '📚',
    mode: 'collection',
    fichesOrdonnees: ['pmsmp', 'bilan-competences', 'cep', 'pacea', 'cej', 'poei', 'plie', 'csp',
      'pec'
    ]
  },
  {
    id: 'parcours-formation-professionnelle',
    titre: 'Comprendre la formation professionnelle',
    icone: '🎓',
    mode: 'parcours',
    accroche: "Comprendre comment financer et valider une formation, au-delà du seul intitulé d'un diplôme.",
    fichesOrdonnees: [
      'cpf', 'cpf-plafonds-2026', 'vae', 'cpf-ou-vae', 'rncp', 'rs', 'rncp-ou-rs', 'cqp', 'rncp-ou-cqp',
      'titre-professionnel', 'certification', 'diplome-titre-certification',
      'formation-qualifiante-ou-certifiante', 'qualification',
      'aref-ou-rfft', 'aif', 'projet-transition-professionnelle', 'taxe-d-apprentissage-habilitation', 'aide-exceptionnelle-embauche-apprenti', 'cpf-agents-publics', 'compte-professionnel-de-prevention', 'periode-de-reconversion', 'passeport-de-competences',
      'caces', 'opco', 'france-vae', 'action-de-formation-conventionnee', 'reste-a-charge-formation', 'abondement-cpf', 'transitions-pro',
      'qualiopi'
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
    icone: '🚪',
    mode: 'parcours',
    accroche: "Comprendre ce qui se passe quand un contrat de travail se termine, quel qu'en soit le motif.",
    fichesOrdonnees: [
      'preavis', 'demission', 'licenciement', 'demission-ou-rupture-conventionnelle',
      'rupture-conventionnelle', 'abandon-de-poste', 'solde-tout-compte',
      'indemnite-legale-de-licenciement', 'homologation-rupture-conventionnelle',
      'fem'
    ]
  },
  {
    id: 'collection-monde-entreprise',
    titre: "Comprendre le monde de l'entreprise",
    icone: '📚',
    mode: 'collection',
    fichesOrdonnees: ['culture-entreprise', 'marque-employeur', 'entretien-annuel', 'cooptation', 'bassin-emploi', 'polyvalence', 'sens-organisation', 'dialogue-social', 'cse', 'discrimination-embauche', 'obligations-employeur-embauche', 'periode-essai-cote-employeur', 'licenciement-procedure-employeur',
      'convention-collective', 'tese'
    ]
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
    icone: '🎯',
    mode: 'parcours',
    accroche: "Comprendre comment mon parcours professionnel peut évoluer, se réorienter ou se transformer.",
    fichesOrdonnees: [
      'orientation', 'projet-professionnel', 'positionnement', 'reorientation-professionnelle',
      'evolution-professionnelle', 'reorientation-ou-reconversion', 'reconversion', 'reconversion-ou-evolution', 'reserve-operationnelle', 'passeport-de-competences', 'flagrance-sociale',
      'savoirs-connaissances', 'prouver-une-competence'
    ]
  },
  {
    id: 'collection-vie-parcours',
    titre: 'Quand la vie pèse sur le parcours',
    icone: '⛰️',
    mode: 'collection',
    fichesOrdonnees: [
      'surendettement', 'assistante-sociale', 'aides-garde-enfants', 'aide-a-la-mobilite',
      'aide-carburant-grands-rouleurs', 'aide-alimentaire', 'hebergement-urgence', 'aide-materielle',
      'addictologie', 'violences',
      'conge-maternite-paternite'
    ]
  },
  {
    id: 'collection-se-faire-aider',
    titre: 'Se faire aider : accompagnements et mises en relation',
    icone: '🤝',
    mode: 'collection',
    fichesOrdonnees: [
      'parrainage-vers-l-emploi', 'groupe-de-pairs', 'o2r', 'atelier-thematique',
      'visite-entreprise', 'job-dating', 'mobilite-internationale',
      'erip', 'fondation-2eme-chance'
    ]
  },
  {
    id: 'parcours-conditions-travail',
    titre: 'Comprendre les conditions de travail',
    icone: '🦺',
    mode: 'parcours',
    accroche: "Ce qui fait qu'un poste convient ou non, au-delà du seul salaire.",
    fichesOrdonnees: [
      'horaires-travail', 'temps-partiel-choisi-ou-subi', 'travail-de-nuit', 'astreintes',
      'rythme-travail', 'teletravail', 'deplacements-professionnels', 'proximite-domicile-travail',
      'port-de-charges', 'environnement-travail', 'contact-public', 'formation-prise-de-poste', 'harcelement-travail', 'conge-sans-solde', 'compte-professionnel-de-prevention',
      'duerp',
      'activite-partielle', 'droit-de-retrait'
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
      'reste-a-vivre', 'non-recours', 'monoparentalite', 'proche-aidant', 'asf', 'puma', 'medecin-traitant', 'conge-supplementaire-de-naissance'
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
      'recours-amiable-ou-contentieux', 'prescription', 'cse', 'paiement-direct-pension', 'commissaire-de-justice', 'juge-de-l-execution', 'timbre-fiscal-justice',
      'prescription-delai'
    ]
  },
  {
    id: 'collection-se-loger',
    titre: "Se loger quand c'est difficile",
    icone: '🏠',
    mode: 'collection',
    fichesOrdonnees: [
      'dalo', 'siao-115', 'hebergement-urgence', 'accueil-de-jour', 'treve-hivernale',
      'fsl', 'aides-au-logement', 'visale', 'mobili-jeune', 'maprimerenov', 'maprimeadapt', 'prets-action-logement-salaries', 'foyer-jeunes-travailleurs',
      'intermediation-locative', 'pension-de-famille', 'hebergement-ou-logement-accompagne',
      'domiciliation', 'assistante-sociale', 'avance-loca-pass', 'cheque-energie',
      'numero-unique-enregistrement', 'commandement-de-payer'
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
      'epicerie-sociale', 'radiation', 'reste-a-vivre', 'assistante-sociale', 'demarchage-telephonique',
      'secours-d-urgence', 'recevabilite'
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
      'aptitude-ou-inaptitude', 'entreprise-adaptee', 'esat', 'milieu-ordinaire-ou-milieu-protege', 'declaration-trimestrielle-aah-esat', 'mva', 'aeeh'
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
      'economie-presentielle',
      'chomage-recensement', 'taux-d-emploi', 'population-active', 'correction-variations-saisonnieres'
    ]
  },
  {
    id: 'collection-lire-les-chiffres-entreprises',
    titre: "Comment lire les chiffres de créations, de radiations et de défaillances d'entreprises",
    icone: '🏪',
    mode: 'collection',
    fichesOrdonnees: [
      'creations-entreprises-micro-entrepreneurs', 'radiation-d-office-entreprise', 'defaillance-entreprise',
      'vente-fonds-de-commerce', 'auto-entrepreneur'
    ]
  },
  {
    id: 'parcours-creer-activite',
    titre: 'Créer son activité',
    icone: '🌱',
    mode: 'parcours',
    accroche: "Comprendre les statuts et les appuis pour lancer une activité, sans se noyer dans les démarches.",
    fichesOrdonnees: [
      'auto-entrepreneur', 'entreprise-individuelle-ou-societe', 'cae', 'travailleur-non-salarie',
      'salarie-ou-travailleur-non-salarie', 'guichet-unique-entreprises', 'siren-ou-siret',
      'pret-d-honneur', 'microcredit-professionnel', 'microcredit-personnel-ou-professionnel',
      'pait', 'bprea', 'dnja', 'indemnite-solidarite-nationale', 'france-services-agriculture',
      'arce', 'cape', 'garantie-de-pret', 'franchise-de-tva', 'versement-liberatoire'
    ]
  },
  {
    id: 'collection-jeunes-16-25',
    titre: 'Les repères des 16-25 ans',
    icone: '🎒',
    mode: 'collection',
    fichesOrdonnees: [
      'mission-locale', 'cej', 'obligation-de-formation', 'psad', 'ecole-2e-chance',
      'epide', 'ecole-2e-chance-ou-epide', 'ecole-de-production', 'cfa', 'alternance',
      'apprentissage-ou-professionnalisation', 'service-civique', 'volontariat-armees',
      'fonds-d-aide-aux-jeunes', 'contrat-d-apprentissage', 'prepa-apprentissage', 'bourse-sur-criteres-sociaux',
      'jdc'
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
      'attestation-de-comparabilite', 'metier-en-tension', 'pacte-europeen-asile', 'carte-talent', 'carte-de-resident-refugie',
      'profession-reglementee', 'attestation-de-demande-d-asile', 'naturalisation-par-decret', 'examen-civique', 'accord-de-reciprocite', 'admission-exceptionnelle-au-sejour', 'recepisse'
    ]
  },
  {
    id: 'collection-sortie-detention',
    titre: 'Emploi et sortie de détention',
    icone: '🔑',
    mode: 'collection',
    fichesOrdonnees: [
      'spip', 'milieu-ouvert-ou-milieu-ferme', 'amenagement-de-peine', 'casier-judiciaire',
      'bulletin-n-3', 'bulletin-2-ou-bulletin-3', 'domiciliation', 'iae',
      'liberation-sous-contrainte', 'juge-de-l-application-des-peines', 'rehabilitation', 'levee-d-ecrou', 'contrat-emploi-penitentiaire', 'france-travail-justice'
    ]
  },
  {
    id: 'parcours-preparer-retraite',
    titre: 'Travailler après 50 ans, préparer sa retraite',
    icone: '⏳',
    mode: 'parcours',
    accroche: "Voir venir la fin de carrière et ses choix, sans attendre le dernier moment.",
    fichesOrdonnees: [
      'releve-de-carriere', 'entretien-information-retraite', 'suspension-reforme-retraites-2026', 'retraite-progressive',
      'cumul-emploi-retraite', 'cumul-integral-ou-cumul-plafonne', 'mise-a-la-retraite',
      'depart-volontaire-ou-mise-a-la-retraite', 'contrat-valorisation-experience', 'amenagement-poste', 'aspa', 'apa', 'agirc-arrco', 'carriere-longue', 'pension-de-reversion', 'compte-professionnel-de-prevention',
      'indemnite-depart-volontaire-retraite'
    ]
  },
  {
    id: 'collection-mobilite-quotidien',
    titre: 'Se déplacer pour travailler',
    icone: '🚗',
    mode: 'collection',
    fichesOrdonnees: [
      'aide-a-la-mobilite', 'plateforme-mobilite', 'transport-a-la-demande', 'garage-solidaire',
      'auto-ecole-sociale', 'permis-points', 'permis-suspendu-ou-annule', 'leasing-social', 'aide-permis-b-france-travail', 'prime-carburant-exoneration',
      'permis-a-1-euro-par-jour'
    ]
  },
  {
    id: 'collection-garde-enfant',
    titre: "Faire garder son enfant pour travailler",
    icone: '🧸',
    mode: 'collection',
    fichesOrdonnees: [
      'aides-garde-enfants', 'relais-petite-enfance', 'mam', 'creche-avip', 'aripa', 'cmg', 'conge-supplementaire-de-naissance',
      'pajemploi'
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
      'diplomes-de-francais',
      'oepre', 'francais-a-visee-professionnelle',
      'pix'
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
      'personnes-invisibles', 'cip',
      'suspension-remobilisation'
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
      'non-recours', 'franceconnect',
      'estime-de-soi', 'confiance-en-soi', 'affirmation-de-soi', 'estime-confiance-ou-affirmation', 'croyance-limitante', 'message-en-je', 'methode-desc', 'critique-ou-reproche', 'styles-de-communication'
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
  },
  {
    id: 'collection-sante-couverture',
    titre: "Être couvert pour ses frais de santé",
    icone: '🩺',
    mode: 'collection',
    fichesOrdonnees: [
      'css', 'desert-medical', 'complementaire-sante-collective', 'prevoyance-complementaire', 'portabilite-mutuelle',
      'pch', 'mdph', 'addictologie', 'arret-de-travail-indemnites-journalieres', 'puma',
      'medecin-traitant', 'aeeh',
      'ame'
    ]
  },
  {
    id: 'collection-famille-parentalite',
    titre: "Élever un enfant et travailler : aides et droits des parents",
    icone: '🍼',
    mode: 'collection',
    fichesOrdonnees: [
      'aripa', 'monoparentalite', 'pajemploi', 'relais-petite-enfance', 'mam',
      'creche-avip', 'aides-garde-enfants', 'conge-maternite-paternite', 'proche-aidant', 'asf',
      'paiement-direct-pension', 'cmg', 'aeeh'
    ]
  },
  {
    id: 'collection-retraite-prestations-age',
    titre: "Retraite complémentaire, minimum vieillesse et autonomie",
    icone: '🏡',
    mode: 'collection',
    fichesOrdonnees: [
      'releve-de-carriere', 'retraite-progressive', 'cumul-emploi-retraite', 'suspension-reforme-retraites-2026', 'agirc-arrco',
      'aspa', 'apa', 'pension-de-reversion', 'plafond-securite-sociale', 'carriere-longue'
    ]
  },
  {
    id: 'collection-fonction-publique-armees',
    titre: "Travailler dans la fonction publique ou les armées",
    icone: '🏛️',
    mode: 'collection',
    fichesOrdonnees: [
      'service-civique', 'cpf-agents-publics', 'volontariat-armees', 'reserve-operationnelle', 'concours-fonction-publique',
      'pacte-fonction-publique'
    ]
  },
  {
    id: 'collection-agriculture-monde-rural',
    titre: "S'installer et travailler dans l'agriculture",
    icone: '🌾',
    mode: 'collection',
    fichesOrdonnees: [
      'dnja', 'pait', 'bprea', 'msa', 'frr',
      'tese', 'france-services-agriculture', 'indemnite-solidarite-nationale'
    ]
  },
  {
    id: 'collection-energie-factures',
    titre: "Payer ses factures d'énergie, d'eau, de téléphone",
    icone: '💡',
    mode: 'collection',
    fichesOrdonnees: [
      'treve-hivernale', 'fsl', 'secours-d-urgence', 'aides-au-logement', 'cheque-energie'
    ]
  },
  {
    id: 'collection-procedures-justice',
    titre: "Comprendre une procédure de justice",
    icone: '⚖️',
    mode: 'collection',
    fichesOrdonnees: [
      'aide-juridictionnelle', 'conseil-de-prud-hommes', 'recours-amiable', 'prescription-delai', 'commandement-de-payer',
      'point-justice', 'defenseur-des-droits', 'commissaire-de-justice', 'juge-de-l-execution', 'timbre-fiscal-justice',
      'ordonnance-de-protection'
    ]
  },
  {
    id: 'collection-droits-collectifs-entreprise',
    titre: "Dans l'entreprise : représentants du personnel et égalité",
    icone: '🤝',
    mode: 'collection',
    fichesOrdonnees: [
      'cse', 'delegue-syndical', 'dialogue-social', 'index-egalite-professionnelle', 'inspection-du-travail',
      'harcelement-travail',
      'droit-de-greve'
    ]
  },
  {
    id: 'collection-demarches-en-ligne',
    titre: "Faire ses démarches en ligne",
    icone: '🖥️',
    mode: 'collection',
    fichesOrdonnees: [
      'franceconnect', 'identite-numerique', 'france-services', 'conseiller-numerique', 'illectronisme', 'tiers-de-confiance-numerique'
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
    id: 'second-niveau-domiciliation',
    titre: "Précisions",
    fichesEntree: ['domiciliation'],
    corps: "Il faut un lien avec la commune où l'on demande la domiciliation : y vivre, y travailler, y être suivi par un service social, y avoir de la famille proche ou un enfant scolarisé. Selon la taille de la commune, on s'adresse au CCAS, à un centre intercommunal d'action sociale, à un organisme agréé par la préfecture ou à la mairie. Après l'entretien, la décision est donnée par écrit ; si elle est accordée, on reçoit une attestation d'élection de domicile. Pour la garder, il faut donner de ses nouvelles à l'organisme régulièrement, en personne ou par téléphone : sans aucun contact pendant plusieurs mois, la domiciliation peut prendre fin, sauf en cas d'hospitalisation ou d'incarcération."
  },
  {
    id: 'second-niveau-aide-juridictionnelle',
    titre: "Précisions",
    fichesEntree: ['aide-juridictionnelle'],
    corps: "L'aide peut être totale ou partielle selon les ressources et le patrimoine : avec l'aide partielle, une part des honoraires reste à payer, fixée avec l'avocat dans une convention. Certaines situations ne demandent pas d'examen des ressources, par exemple pour une victime d'un crime portant atteinte à sa vie ou à son intégrité physique, ou pour une demande devant la Cour nationale du droit d'asile. On peut proposer l'avocat de son choix dès la demande, mais il reste libre d'accepter ou non ; s'il refuse, ou si l'on n'en connaît pas, on peut demander au bâtonnier de l'ordre des avocats d'en désigner un. Les frais engagés avant la décision du bureau ne sont pas couverts : mieux vaut déposer la demande avant d'agir."
  },
  {
    id: 'second-niveau-dalo',
    titre: "Précisions",
    fichesEntree: ['dalo'],
    corps: "Avant le recours, il faut avoir déjà fait au moins une démarche pour se loger, par exemple une demande de logement social, un signalement d'insalubrité ou une mise en demeure du propriétaire. Les situations reconnues sont variées : absence de logement, expulsion sans relogement, logement insalubre, dangereux ou inadapté à un handicap, long séjour en hébergement ou en logement de transition, demande de logement social restée sans réponse après un délai anormalement long. On ne dépose qu'un seul recours, auprès d'une seule commission. Si une proposition adaptée est refusée, le bénéfice de la décision de priorité est perdu, et le recours ne dispense pas de renouveler sa demande de logement social."
  },
  {
    id: 'second-niveau-ficp',
    titre: "Précisions",
    fichesEntree: ['ficp'],
    corps: "L'inscription peut s'effacer avant son terme : quand les sommes dues sont réglées, la banque ou l'organisme à l'origine de l'incident doit demander à la Banque de France d'effacer la mention. Pour un dossier de surendettement, la durée dépend de la décision prise (plan de remboursement, mesures de la commission, rétablissement personnel). Pour savoir si l'on est fiché, on peut faire la demande depuis son espace personnel sur le site de la Banque de France, par courrier avec une copie de sa pièce d'identité, ou en prenant rendez-vous dans une antenne locale. En cas d'erreur, on s'adresse d'abord à l'établissement qui a déclaré l'incident, puis, s'il ne met pas le fichier à jour, au médiateur bancaire et enfin à la Cnil."
  },
  {
    id: 'second-niveau-cddi',
    titre: "Précisions",
    fichesEntree: ['cddi'],
    corps: "Peuvent y accéder les personnes sans emploi qui rencontrent des difficultés sociales et professionnelles particulières : jeunes en grande difficulté, bénéficiaires de minima sociaux comme le RSA, demandeurs d'emploi de longue durée, travailleurs reconnus handicapés. Le contrat peut être renouvelé dans une limite de durée totale fixée par la loi, avec des prolongations possibles pour une formation en cours, ou avec l'accord de France Travail pour les seniors ou les personnes reconnues handicapées. Le temps de travail hebdomadaire a un minimum fixé par la loi. Le contrat peut être suspendu pour une évaluation en milieu de travail, une action d'insertion ou une période d'essai chez un autre employeur ; si la personne est embauchée à l'issue, le CDDI s'arrête sans préavis."
  },
  {
    id: 'second-niveau-emploi-accompagne',
    titre: "Précisions",
    fichesEntree: ['emploi-accompagne'],
    corps: "Il faut avoir la reconnaissance de la qualité de travailleur handicapé (RQTH), avoir au moins seize ans, et chercher un emploi en milieu ordinaire ou avoir un emploi que l'on a du mal à garder. Une personne qui travaille en ESAT peut aussi en bénéficier si elle a un projet de passer en milieu ordinaire. On fait la demande à la MDPH ; un conseiller de Cap emploi ou de France Travail, un employeur ou une mission locale peut aussi le proposer, et la MDPH demande alors l'accord de la personne. Si la commission accepte, la personne est orientée vers une plateforme départementale, qui lui attribue un référent et construit avec elle un plan d'action revu régulièrement. L'aide change selon le moment : préparation du projet, des candidatures et des entretiens pendant la recherche ; adaptation et aménagements à l'arrivée dans le poste ; suivi, règlement des difficultés et évolution de carrière une fois en poste."
  },
  {
    id: 'second-niveau-arce',
    titre: "Précisions",
    fichesEntree: ['arce'],
    corps: "Pour y prétendre, il faut être inscrit à France Travail et percevoir l'ARE au moment de créer ou de reprendre l'entreprise (ou être salarié privé d'emploi après un congé de reclassement ou de mobilité), et bénéficier de l'ACRE. Le capital correspond à une part des droits restants à l'ARE et se verse en deux fois : une moitié au démarrage, le reste après un délai de quelques mois, à condition de prouver que l'activité existe toujours et de ne pas travailler à temps plein en CDI. Choisir le capital ne permet pas de valider de trimestres de retraite de base. Si l'activité s'arrête, on peut réclamer à France Travail le reliquat de ses droits en se réinscrivant, avec un différé avant la reprise des versements. La page officielle ne donne pas de délai pour déposer la demande : à vérifier auprès de son conseiller."
  },
  {
    id: 'second-niveau-contrat-d-engagement',
    titre: "Précisions",
    fichesEntree: ['contrat-d-engagement'],
    corps: "Il doit être élaboré avec son conseiller peu après l'inscription (le délai exact est indiqué sur la page officielle). Il précise notamment le type d'emploi recherché, la zone géographique privilégiée, le salaire souhaité, les droits pour accepter ou refuser des offres et les voies de recours en cas de sanction ; il liste aussi les actions de France Travail (formation, reconversion, aide à la mobilité). On peut le retrouver dans son espace personnel, à la rubrique « Mon projet ». En retour, la personne participe à son élaboration et à sa mise à jour, fait des recherches d'emploi régulières qu'elle peut justifier, répond aux convocations, actualise sa situation chaque mois et accepte les offres raisonnables. Refuser d'élaborer ou d'actualiser le contrat peut conduire à une radiation."
  },
  {
    id: 'second-niveau-cesu',
    titre: "Précisions",
    fichesEntree: ['cesu'],
    corps: "Le CESU déclaratif concerne un particulier qui emploie quelqu'un et déclare sa rémunération. Il vise les services à la personne rendus en principe au domicile, et parfois hors du domicile quand ils prolongent une activité à domicile. L'employeur n'a pas à calculer ni à prélever les cotisations : Urssaf service Cesu s'en charge et envoie au salarié un document qui vaut bulletin de paie. Il existe aussi un CESU préfinancé, qui est un titre de paiement et non une façon de déclarer un salarié. Employer à domicile peut ouvrir à l'employeur des avantages fiscaux et sociaux."
  },
  {
    id: 'second-niveau-france-vae',
    titre: "Précisions",
    fichesEntree: ['france-vae'],
    corps: "Tout le monde peut déposer une demande, quels que soient son statut, son âge, sa nationalité ou son niveau d'études, et une durée minimale d'expérience n'est plus exigée. L'expérience peut être professionnelle ou non (bénévolat, mandat syndical ou d'élu) mais doit avoir un lien direct avec le diplôme, le titre ou le certificat visé ; certains diplômes, comme les diplômes médicaux, ne s'obtiennent pas par la VAE. Les étapes : demande sur la plateforme, accompagnement possible, dossier de faisabilité puis décision de recevabilité du certificateur, dossier de validation décrivant son expérience, enfin passage devant un jury. Le jury peut valider un diplôme en partie. Les agents publics, et les certifications absentes de la plateforme, s'adressent directement au certificateur."
  },
  {
    id: 'second-niveau-contrat-integration-republicaine',
    titre: "Précisions",
    fichesEntree: ['contrat-integration-republicaine'],
    corps: "Il s'adresse aux personnes étrangères hors Union européenne admises au séjour pour la première fois et qui souhaitent s'installer durablement ; les ressortissants de l'Union européenne ne sont pas concernés. Certaines personnes en sont dispensées, par exemple après des années de collège ou de lycée en France, ou après une année d'études supérieures en France. Le contrat est préparé par l'OFII, signé lors d'un entretien avec un agent de l'OFII, puis contresigné par le préfet. Si le test de français montre un niveau insuffisant, une formation linguistique est proposée ; une fois acceptée, elle devient obligatoire. La formation civique est obligatoire et se termine par l'examen civique. Un entretien de suivi a lieu quelques mois après le début de la formation. Si les engagements ne sont pas tenus, le préfet peut mettre fin au contrat, ce qui peut compliquer le renouvellement du titre de séjour."
  },
  {
    id: 'second-niveau-droit-au-compte',
    titre: "Précisions",
    fichesEntree: ['droit-au-compte'],
    corps: "Peut en bénéficier toute personne domiciliée en France, quelle que soit sa nationalité, qui n'a pas déjà de compte de dépôt en France. Être interdit bancaire, inscrit au FICP ou surendetté n'empêche pas de faire la demande. Première étape : obtenir le refus de la banque. Une banque qui ne répond pas dans le délai prévu est considérée comme ayant refusé, et elle doit motiver son refus par écrit en indiquant la possibilité de saisir la Banque de France. Le dossier comprend une pièce d'identité, un justificatif de domicile récent, la lettre de refus (ou la preuve de la demande) et des déclarations sur l'honneur. On le dépose à la Banque de France en ligne, au guichet ou par courrier, ou on demande à la banque qui a refusé de le transmettre. La Banque de France désigne ensuite une banque dans un délai très court ; il faut alors la contacter rapidement avec ses documents. L'ouverture du compte et les services de base sont gratuits, et les frais liés à un incident sont plafonnés. La banque désignée ne peut clôturer le compte que pour des motifs précis, par une décision écrite et motivée."
  },
  {
    id: 'second-niveau-services-bancaires-de-base',
    titre: "Précisions",
    fichesEntree: ['services-bancaires-de-base'],
    corps: "Ils comprennent l'ouverture, la tenue et la clôture du compte, un changement d'adresse par an, la remise d'un relevé d'identité bancaire, les prélèvements et les virements, les relevés mensuels, le dépôt de chèques et de virements, la consultation du solde à distance, les dépôts et retraits d'espèces au guichet, ainsi qu'une carte bancaire ou un moyen de paiement équivalent. Ouvrir le compte et utiliser ces services est gratuit ; seuls les frais liés à un découvert ou à un incident peuvent être demandés, dans des limites fixées."
  },
  {
    id: 'second-niveau-protection-subsidiaire',
    titre: "Précisions",
    fichesEntree: ['protection-subsidiaire'],
    corps: "C'est l'Ofpra qui l'accorde, et la Cour nationale du droit d'asile peut statuer en cas de recours. La personne reçoit une carte de séjour pluriannuelle portant la mention « bénéficiaire de la protection subsidiaire », délivrée sans droit de timbre pour elle-même ; cette carte permet de travailler comme salarié ou comme indépendant, sans que l'employeur ait à demander d'autorisation de travail. Des membres de la famille peuvent recevoir une carte portant la mention « membre de la famille », avec un droit de timbre à leur charge. Il est possible de demander un titre de voyage pour étranger, qui exclut en général le pays d'origine. Plus tard, on peut demander une carte de résident, en déposant la demande avant la fin de validité de la carte actuelle. Après la signature du contrat d'intégration républicaine, l'OFII peut proposer un accompagnement vers l'emploi et le logement."
  },
  {
    id: 'second-niveau-attestation-de-demande-d-asile',
    titre: "Précisions",
    fichesEntree: ['attestation-de-demande-d-asile'],
    corps: "Un demandeur d'asile ne peut en général pas travailler pendant les premiers mois qui suivent le dépôt de sa demande. Passé ce délai, c'est l'employeur qui demande l'autorisation de travail, en présentant l'attestation de demande d'asile et une promesse d'embauche ou un contrat de travail. Sans réponse de l'administration dans le délai prévu, l'autorisation est considérée comme accordée ; elle est limitée dans le temps et se renouvelle jusqu'à la décision de l'Ofpra. En cas de recours devant la Cour nationale du droit d'asile, le droit de travailler peut être conservé sous conditions. Ces règles ont changé récemment avec le pacte européen sur la migration et l'asile, notamment pour le point de départ du délai : à vérifier sur la page officielle avant de conseiller quelqu'un."
  },
  {
    id: 'second-niveau-attestation-de-comparabilite',
    titre: "Précisions",
    fichesEntree: ['attestation-de-comparabilite'],
    corps: "La démarche se fait en ligne auprès de France Éducation international (centre Enic-Naric), quelle que soit la nationalité, et seulement en français. Les étapes : pré-inscription, réception d'un numéro de dossier par courriel, finalisation du dossier, puis paiement d'un premier examen de recevabilité et, si le dossier est recevable, d'un examen d'expert. L'attestation compare le diplôme à un niveau de la nomenclature française des niveaux de formation. En cas de refus de recevabilité, on peut le contester par une demande écrite et motivée, avec des pièces justificatives, dans un délai court après la notification."
  },
  {
    id: 'second-niveau-commandement-de-payer',
    titre: "Exemples concrets",
    fichesEntree: ['commandement-de-payer'],
    corps: "Dès les premières difficultés, avant même le commandement, on peut contacter SOS loyers impayés (service gratuit), un conciliateur de justice, une assistante sociale, la Caf ou la MSA, ou Action logement ; le fonds de solidarité pour le logement peut accorder une aide, et un dossier de surendettement est possible s'il y a d'autres dettes. Pendant le délai du commandement, reprendre le loyer et rembourser en partie montre sa bonne foi. Le commissaire de justice qui délivre le commandement doit le signaler à la CCAPEX, la commission de coordination des actions de prévention des expulsions locatives. Si le propriétaire saisit ensuite le juge, on peut se faire assister d'un avocat (aide juridictionnelle possible) et demander un délai de remboursement si le loyer courant est repris. Même après un jugement, seul un commissaire de justice peut procéder à l'expulsion, à des horaires encadrés, et la trêve hivernale la suspend si le locataire n'a pas de solution de relogement."
  },
  {
    id: 'second-niveau-carriere-longue',
    titre: "Précisions",
    fichesEntree: ['carriere-longue'],
    corps: "Avant de demander, on peut vérifier son relevé de carrière sur le site de l'Assurance retraite ; à partir d'un certain âge, il est possible de demander la correction d'une erreur ou d'un oubli. Le service « Obtenir mon âge de départ à la retraite » de l'espace personnel indique si l'on remplit les conditions et délivre une attestation provisoire ou définitive. La demande de retraite est unique, faite en ligne avec « Demander ma retraite », valable pour tous les régimes, et se dépose plusieurs mois avant la date de départ. Il ne faut pas cesser de travailler avant d'avoir la confirmation de tous ses régimes de base et complémentaires. Sans accès à internet, on peut s'adresser à sa caisse de retraite. Le montant se calcule comme pour toute retraite de salarié ; une simulation est possible avec « Mon estimation retraite »."
  },
  {
    id: 'second-niveau-mva',
    titre: "Précisions",
    fichesEntree: ['mva'],
    corps: "Pour les personnes qui perçoivent l'AAH, la majoration est versée avec l'allocation quand les conditions sont réunies, sans démarche. Le logement doit être indépendant : une personne hébergée ne remplit la condition que si elle vit chez son conjoint ou partenaire, en couple. En cas de refus, un recours administratif préalable obligatoire se fait auprès de la MDPH, dans le délai indiqué sur la notification, puis on peut saisir le tribunal judiciaire du lieu de résidence. Quand le versement s'interrompt (hospitalisation, hébergement en établissement ou incarcération prolongés), il reprend le premier jour du mois qui suit la sortie. Une évolution prévue par la loi de finances permettrait de garder l'AAH au-delà de l'âge de la retraite en continuant de travailler, mais seulement après la publication d'un décret : à surveiller sur la page officielle."
  },
  {
    id: 'second-niveau-harcelement-travail',
    titre: "Précisions",
    fichesEntree: ['harcelement-travail'],
    corps: "Le harcèlement moral n'exige pas l'intention de nuire : il suffit que le comportement, répété, ait pour effet de dégrader les conditions de travail ou la santé. Les preuves utiles sont datées : captures d'écran, courriels, enregistrements, attestations de témoins, certificats médicaux. Pour le harcèlement sexuel ou sexiste au travail, c'est à l'employeur de prouver qu'il n'y a pas eu de faits. On peut signaler la situation par écrit à l'employeur, à un supérieur, aux ressources humaines, au médecin du travail ou aux représentants du personnel (le CSE dans les entreprises concernées), ou contacter l'inspection du travail. Une victime, ou un témoin de bonne foi, ne peut pas être sanctionné pour avoir signalé des faits. Dans le secteur privé, le recours est le conseil de prud'hommes (dommages et intérêts, contestation d'un licenciement ou d'une démission liés au harcèlement) ; dans le secteur public, c'est le tribunal administratif, avec des délais courts. Une plainte pénale est aussi possible auprès de la police ou de la gendarmerie, et un numéro national d'écoute gratuit existe pour les victimes."
  },
  {
    id: 'second-niveau-aeeh',
    titre: "Précisions",
    fichesEntree: ['aeeh'],
    corps: "La demande se fait auprès de la MDPH du lieu de résidence, en ligne si un téléservice existe, ou par courrier avec un formulaire et des justificatifs. La commission de la MDPH fixe la catégorie du complément selon le coût du handicap, l'embauche d'une personne ou la réduction de l'activité d'un parent. Elle fixe aussi la durée d'attribution, qui peut aller jusqu'à l'âge limite de l'allocation, ou jusqu'au passage à l'AAH si l'état ne peut pas s'améliorer ; un réexamen est possible plus souvent quand des mesures particulières d'éducation et de soins sont prévues. L'AEEH de base se cumule avec les aides de la prestation de compensation du handicap (PCH) ; avec un complément, la PCH ne couvre que l'aménagement du logement ou du véhicule et les surcoûts de transport. L'enfant ne doit pas être en internat avec prise en charge intégrale de ses frais de séjour. Une loi récente prévoit de nouvelles mesures pour l'AEEH, qui attendent encore des textes d'application."
  },
  {
    id: 'second-niveau-cheque-energie',
    titre: "Précisions",
    fichesEntree: ['cheque-energie'],
    corps: "Beaucoup de bénéficiaires sont repérés automatiquement à partir des données fiscales et de celles des fournisseurs d'électricité, sans démarche. Le chèque arrive par courrier ou dans un compte bénéficiaire en ligne. Pour l'utiliser : une facture d'électricité ou de gaz (envoi par courrier avec une facture récente, ou paiement en ligne si le fournisseur l'accepte), un combustible de chauffage (remise au vendeur, le solde non utilisé n'est pas remboursé), ou les charges d'énergie d'un logement collectif, d'un foyer ou d'une résidence. Il doit être remis à un professionnel participant, dont l'annuaire figure sur la page officielle. La date limite d'utilisation est imprimée sur le chèque ou affichée dans le compte en ligne. Les bénéficiaires ont aussi des protections en cas de facture impayée et des frais de mise en service supprimés. Si l'on n'a rien reçu alors qu'on pense y avoir droit, on peut faire la demande en ligne ou par courrier, avec une pièce d'identité, une attestation récente du contrat d'électricité et son avis d'imposition. En cas de perte ou de vol, on le déclare en ligne ou par téléphone et un chèque de remplacement est envoyé. Le chèque peut se combiner avec MaPrimeRénov' et les certificats d'économies d'énergie."
  },
  {
    id: 'second-niveau-medecin-traitant',
    titre: "Précisions",
    fichesEntree: ['medecin-traitant'],
    corps: "On peut choisir n'importe quel médecin, généraliste ou spécialiste, à condition qu'il accepte. Le médecin peut faire la déclaration en ligne avec la carte Vitale ; sinon on signe avec lui un formulaire papier, envoyé à sa caisse d'assurance maladie. On peut en changer à tout moment sans justification : la nouvelle déclaration remplace la précédente, sans qu'il soit nécessaire de prévenir l'ancien médecin. Consulter un autre médecin sans orientation donne un remboursement plus faible, sauf en cas d'urgence, d'absence du médecin traitant ou d'éloignement du domicile. Les bénéficiaires de l'aide médicale de l'État ne sont pas tenus de déclarer un médecin traitant. Pour en trouver un, on peut s'adresser à une organisation de coordination de santé de son territoire, ou à défaut à sa caisse d'assurance maladie."
  },
  {
    id: 'second-niveau-cmg',
    titre: "Précisions",
    fichesEntree: ['cmg'],
    corps: "Le CMG « emploi direct » concerne la garde par une assistante maternelle agréée à son domicile ou par une garde à domicile. Pour le toucher, il faut en général travailler, avec des situations assimilées (congés payés, maladie, maternité, chômage indemnisé, formation rémunérée) et des dispenses de condition d'activité, par exemple pour un étudiant ou une personne qui touche l'AAH. Un travailleur indépendant doit être à jour de ses cotisations vieillesse. Le parent employeur s'inscrit à Pajemploi et y déclare chaque mois la rémunération versée ; d'après la page officielle, c'est le centre Pajemploi qui calcule et verse l'aide et indique ce qui reste à payer, tandis que la Caf ou la MSA gère le dossier et l'éligibilité. L'option Pajemploi+ permet de déduire l'aide automatiquement du paiement, avec l'accord du salarié. Il faut prévenir vite la Caf ou la MSA en cas de changement de situation familiale ou d'adresse. En résidence alternée, l'aide peut être versée à chaque parent séparément."
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
    id: 'second-niveau-smic',
    titre: 'Nuance utile',
    fichesEntree: ['smic'],
    corps: "Le montant du Smic mensuel cité partout vaut pour un temps plein. À temps partiel, le salaire minimum est calculé au prorata des heures travaillées. Certaines rémunérations, par exemple en apprentissage, sont fixées en pourcentage du Smic selon l'âge et l'année de contrat. En cas de doute sur sa fiche de paie, le plus sûr est de demander des explications à l'employeur ou de se faire aider par un conseiller."
  },
  {
    id: 'second-niveau-inflation',
    titre: 'Nuance utile',
    fichesEntree: ['inflation'],
    corps: "Le chiffre de l'inflation est une moyenne : chaque foyer a son propre panier, donc sa propre inflation. Le carburant, par exemple, pèse davantage dans le budget d'un ménage modeste. Le prix ressenti peut aussi dépasser le prix mesuré, car on remarque davantage les hausses des achats de tous les jours. Une inflation qui ralentit ne veut pas dire que les prix baissent : ils montent simplement moins vite."
  },
  {
    id: 'second-niveau-quotient-familial',
    titre: 'Nuance utile',
    fichesEntree: ['quotient-familial'],
    corps: "Le quotient familial de la Caf n'est pas celui des impôts : les deux ne se calculent pas de la même façon, il ne faut pas les confondre. Celui de la Caf suit votre situation : il est mis à jour quand la situation familiale ou professionnelle change, donc une attestation ancienne peut ne plus être la bonne. Une mairie ou une crèche le demande souvent pour fixer ses tarifs, par exemple ceux de la cantine ou de la crèche. Allocataire, on télécharge l'attestation sur son compte en ligne. Sinon, la Caf guide le calcul, et l'organisme qui le demande peut le vérifier sur l'avis d'imposition."
  },
  {
    id: 'second-niveau-point-conseil-budget',
    titre: 'Exemples concrets',
    fichesEntree: ['point-conseil-budget'],
    corps: "Un point conseil budget est ouvert à tous et gratuit : on n'a pas besoin d'être déjà endetté pour s'y présenter. On peut y aller pour faire le point sur sa situation, comprendre d'où vient un endettement, chercher des solutions, ou anticiper un changement dans sa vie familiale ou professionnelle. L'équipe informe aussi sur les aides auxquelles on a droit. Un rendez-vous n'est pas une procédure de surendettement : celle-ci est une démarche à part, que le point conseil budget peut aider à comprendre."
  },
  {
    id: 'second-niveau-plafond-de-ressources',
    titre: 'Nuance utile',
    fichesEntree: ['plafond-de-ressources'],
    corps: "Pour savoir si l'on est sous le plafond, la Caf regarde les revenus de l'allocataire et de son conjoint, perçus en France comme à l'étranger : salaires, allocations chômage, indemnités journalières, pensions, revenus du patrimoine, moins certaines charges. Elle récupère chaque année les revenus déclarés auprès des impôts, et étudie les droits d'une année à partir d'une déclaration plus ancienne : par exemple, la déclaration de revenus de 2024 sert à examiner les droits de 2026. En cas de séparation, de divorce ou de veuvage, les revenus de l'ancien conjoint ne comptent plus à partir du mois suivant : cela peut changer le droit à une prestation.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Caf, page « Conditions générales d'attribution des prestations »", url: "https://www.caf.fr/allocataires/aides-et-demarches/thematique-libre/conditions-generales" },
      phraseGenerale: "Les droits d'une année civile sont étudiés à partir d'une déclaration de revenus plus ancienne, récupérée chaque année auprès des impôts. Les années de référence changent chaque année : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-ame',
    titre: 'Démarche concrète',
    fichesEntree: ['ame'],
    corps: "Pour une première demande, le dossier se dépose en personne à la caisse d'assurance maladie du lieu de résidence ; dans certains départements, seulement dans des agences prévues pour cela. On peut aussi le déposer dans une France Services, un établissement de santé ou une permanence d'accès aux soins (PASS). La caisse répond au plus tard 2 mois après le dépôt, et sans réponse à la fin de ce délai la demande est considérée comme refusée : un recours reste possible, dans les 2 mois. L'AME prend en charge à 100 % les soins médicaux et hospitaliers, dans la limite des tarifs de la Sécurité sociale et sans avance de frais, et elle est accordée pour un an à partir du dépôt de la demande. Certains soins non urgents ne sont pris en charge qu'au bout de 9 mois après l'admission, pour un nouveau bénéficiaire majeur. En attendant l'accord, les soins urgents à l'hôpital peuvent être pris en charge : il faut se renseigner auprès de la caisse.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Aide médicale de l'État (AME) »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F3079" },
      phraseGenerale: "L'aide médicale de l'État prend en charge les soins sans avance de frais, pour une durée limitée, avec un délai de réponse de la caisse. Certains soins non urgents ne sont pris en charge qu'après un délai d'attente. Ces délais et durées peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-asf',
    titre: 'Nuance utile',
    fichesEntree: ['asf'],
    corps: "L'ASF peut être versée même quand l'autre parent ne peut pas payer, par exemple parce qu'il est sans emploi ou incarcéré : la Caf ou la MSA examine sa situation et indique si une pension doit être demandée. Quand une pension a été fixée mais n'est pas payée, la caisse peut agir à la place du parent pour la récupérer, jusqu'à 2 ans d'impayés. Si aucune pension n'a été fixée, l'ASF n'est versée que pendant 4 mois : pour la maintenir au-delà, il faut saisir le juge aux affaires familiales, ou demander la révision de la décision existante, dans ce délai. L'allocation est due à partir du mois suivant la séparation. Tout changement de situation familiale doit être déclaré rapidement, car vivre en couple met fin à l'ASF. Quand la pension reçue est inférieure au montant de référence, un complément est versé en une fois tous les 3 mois.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Allocation de soutien familial (ASF) »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F815" },
      phraseGenerale: "L'allocation de soutien familial peut être versée même si l'autre parent ne paie pas la pension, et la caisse peut agir pour la récupérer sur une période limitée. Sans pension fixée, elle n'est versée que pendant une courte durée, sauf démarche auprès du juge. Ces durées peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-aspa',
    titre: 'Nuance utile',
    fichesEntree: ['aspa'],
    corps: "La demande se fait auprès de l'organisme qui verse la retraite ; si l'on a plusieurs pensions, un ordre de priorité s'applique. Sans retraite, le formulaire se remet à la mairie. Le versement débute au plus tôt le 1er jour du mois suivant la réception du dossier, et les ressources sont examinées sur les 3 mois précédents, puis sur les 12 mois précédents si le total dépasse le plafond. Tous les revenus ne comptent pas : la valeur de la résidence principale et plusieurs prestations, comme les aides au logement ou l'allocation personnalisée d'autonomie, ne sont pas prises en compte. Après le décès, la caisse peut récupérer les sommes versées sur la succession, mais seulement si ce qui est laissé dépasse un seuil. Tout changement de revenus, de situation familiale ou de lieu de résidence doit être signalé à la caisse. Une décision peut être contestée, d'abord auprès de la commission de recours de la caisse, dans un délai de 2 mois après la notification, puis devant le tribunal judiciaire, dans un nouveau délai de 2 mois. La caisse doit demander la récupération sur succession dans les 5 ans.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Allocation de solidarité aux personnes âgées (Aspa) »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F16871" },
      phraseGenerale: "La demande d'Aspa se fait auprès de la caisse de retraite, et le versement débute le mois suivant la réception du dossier. Les décisions peuvent être contestées dans des délais courts, et la récupération sur succession est encadrée dans le temps. Ces délais peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-activite-partielle',
    titre: 'Nuance utile',
    fichesEntree: ['activite-partielle'],
    corps: "Pendant l'activité partielle, le bulletin de salaire doit indiquer les heures indemnisées, les taux appliqués et les sommes versées. Une convention collective, un accord d'entreprise ou une décision de l'employeur peut prévoir une indemnisation plus favorable. L'employeur s'engage à maintenir les salariés dans l'emploi pendant la période. Les salariés en CDI comme en CDD sont concernés, et aussi les apprentis et les personnes en contrat de professionnalisation. L'autorisation de l'administration est accordée pour 3 mois et peut être renouvelée dans la limite de 6 mois, consécutifs ou non, sur une période de 12 mois consécutifs. Pour une nouvelle demande dans les 3 ans qui suivent une période précédente, l'employeur peut s'engager à des actions de formation spécifiques, et l'engagement de maintien dans l'emploi peut durer jusqu'au double de la période autorisée.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr (Entreprendre), fiche « Activité partielle »", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23503" },
      phraseGenerale: "L'autorisation d'activité partielle est accordée pour une durée limitée et peut être renouvelée dans des limites fixées sur une période donnée. Ces durées peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-apa',
    titre: 'Exemples concrets',
    fichesEntree: ['apa'],
    corps: "L'APA s'adresse aux personnes d'au moins 60 ans, en perte d'autonomie et classées en GIR 1 à 4. À domicile, un professionnel du département se rend chez la personne, évalue son niveau d'autonomie et propose un plan d'aide, qu'elle peut accepter ou demander à modifier dans les 10 jours, avant la décision du département, prise dans un délai de 2 mois après réception d'un dossier complet. Ce plan peut financer une aide à domicile, un transport, des repas livrés, des aides techniques, l'aménagement du logement ou un accueil temporaire. En établissement, l'APA couvre une partie du tarif dépendance, pas le tarif d'hébergement. Une participation reste à la charge de la personne selon ses ressources. En cas d'urgence, une APA provisoire peut être accordée. L'APA n'est pas à rembourser après le décès et n'est pas récupérée sur la succession.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Allocation personnalisée d'autonomie (Apa) »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F10009" },
      phraseGenerale: "L'APA s'adresse aux personnes âgées en perte d'autonomie, à partir d'un âge minimum et selon leur niveau de dépendance. La personne dispose d'un délai court pour accepter le plan d'aide, et le département décide dans un délai fixé. Ces conditions peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-paiement-direct-pension',
    titre: 'Démarche concrète',
    fichesEntree: ['paiement-direct-pension'],
    corps: "Dès le premier impayé, un seul jour de retard suffisant, le parent qui doit recevoir la pension s'adresse à un commissaire de justice de son lieu de résidence. Il apporte l'original du jugement ou de la convention, le décompte des sommes dues et ce qu'il sait du parent débiteur : identité, domicile, employeur, numéro de Sécurité sociale. Les frais sont à la charge du parent débiteur, et aucune avance ne peut être demandée au bénéficiaire. Dans les 8 jours, le commissaire de justice notifie la procédure au tiers (l'employeur ou la banque) ; dans les 8 jours qui suivent, le tiers confirme par écrit s'il peut agir, puis les sommes dues sont versées en 12 mensualités égales. La procédure couvre les impayés des 6 mois précédant la notification et ceux à venir. Le parent débiteur peut contester devant le juge de l'exécution ; en attendant sa décision, le tiers continue de payer.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Paiement direct de la pension alimentaire »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F998" },
      phraseGenerale: "La procédure peut être engagée dès le premier impayé. Le commissaire de justice notifie la procédure à l'employeur ou à la banque dans un délai court, qui confirme à son tour dans un délai court. Les sommes dues sont versées en mensualités égales, et la procédure couvre une période d'impayés limitée. Ces délais peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-jdc',
    titre: 'Nuance utile',
    fichesEntree: ['jdc'],
    corps: "Le recensement donne une attestation, utile pour s'inscrire à un examen ou à un concours avant d'avoir fait la journée. Le recensement se fait dès 16 ans. La convocation arrive par courrier environ 45 jours avant la journée, qui dure 7 heures, et peut aussi se consulter sur le compte « Défense + » ; pour changer de date ou de lieu, il faut écrire au centre du service national et de la jeunesse dans les 15 jours suivant sa réception. En cas de handicap, une exemption peut être demandée avec un certificat médical, et une inaptitude temporaire donne une attestation de report. Le certificat de participation est exigé pour s'inscrire au permis de conduire entre 17 et 24 ans, et à un examen ou concours entre 18 et 24 ans. En cas de perte du certificat, une attestation de situation administrative peut être demandée avant 25 ans ; ensuite, plus aucun justificatif n'est demandé pour le permis ou les examens.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Journée défense et citoyenneté (JDC) »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F871" },
      phraseGenerale: "Le recensement se fait dès l'âge de seize ans et la convocation arrive par courrier. Le certificat de participation est exigé pour s'inscrire au permis de conduire et aux examens dans une tranche d'âge fixée. Ces âges et délais peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-ordonnance-de-protection',
    titre: 'Démarche concrète',
    fichesEntree: ['ordonnance-de-protection'],
    corps: "La demande se fait par requête auprès du juge aux affaires familiales, au tribunal judiciaire ou au tribunal de proximité, sans besoin d'avoir vécu avec l'auteur des violences. Selon la situation, le juge peut aussi attribuer le logement à la victime, cacher sa nouvelle adresse, régler les droits de visite et la protection des enfants, et en urgence faire retirer les armes. En cas de danger grave et immédiat, une ordonnance provisoire peut être demandée : le juge statue dans un délai de 24 heures ; pour l'ordonnance classique, l'audience a lieu dans les 6 jours suivant sa fixation. Les mesures durent 12 mois à compter de la notification à l'auteur présumé et peuvent être prolongées si une procédure de divorce, de séparation ou sur l'autorité parentale est engagée. Quand les revenus sont faibles, l'aide juridictionnelle peut prendre en charge les frais. En urgence, le 17 (ou le 112) ; pour être écoutée et orientée, le 3919, gratuit, anonyme et ouvert jour et nuit, qui ne traite pas les urgences.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Ordonnance de protection »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F12544" },
      phraseGenerale: "Les mesures de l'ordonnance de protection durent un temps limité et peuvent être prolongées. En cas de danger grave et immédiat, le juge statue très rapidement. Ces durées peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-agirc-arrco',
    titre: 'Nuance utile',
    fichesEntree: ['agirc-arrco'],
    corps: "Le régime fonctionne par points : les cotisations, payées par le salarié et par l'employeur, sont converties en points inscrits sur un compte individuel, consultable dans l'espace personnel Agirc-Arrco. Certaines périodes donnent des points même sans cotisation, sous conditions : un arrêt de travail longue durée indemnisé, une période de chômage indemnisé, un chômage partiel de plus de 60 heures sur l'année. La demande de retraite complémentaire se fait en ligne dans cet espace et vaut pour toutes les caisses de retraite, qui la reçoivent automatiquement ; mieux vaut la faire environ 6 mois avant la date souhaitée. Une pension prise sans avoir droit à une retraite de base à taux plein est minorée ; à partir de 57 ans, on peut demander la retraite complémentaire sans demander la retraite de base. Une majoration définitive est accordée pour au moins 3 enfants eus ou élevés, et une majoration temporaire s'il reste un enfant à charge au départ ; elles ne se cumulent pas : la plus élevée s'applique.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Retraite complémentaire des salariés du privé (Agirc-Arrco) »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F15396" },
      phraseGenerale: "Le régime fonctionne par points, y compris pour certaines périodes sans cotisation, et la demande se fait en ligne quelque temps avant la date souhaitée. Les majorations pour enfants dépendent du nombre d'enfants, et une pension prise sans taux plein est minorée. Ces seuils peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-carte-talent',
    titre: 'Nuance utile',
    fichesEntree: ['carte-talent'],
    corps: "La carte talent n'est pas un titre unique : elle regroupe plusieurs situations, comme salarié qualifié, carte bleue européenne, chercheur, profession médicale ou pharmaceutique, porteur de projet, artiste. Elle s'adresse aux personnes non européennes qui veulent travailler en France plus de 3 mois. Les conditions et les droits dépendent du titre. Une carte talent est demandée si le séjour dure au moins 1 an ; en dessous, un visa de long séjour valant titre de séjour suffit. Pour le salarié qualifié et la carte bleue européenne, la carte est valable pour la durée du contrat, dans la limite de 4 ans. Depuis l'étranger, il faut d'abord demander un visa au consulat, puis, selon la durée du séjour, la carte en ligne sur le site de l'administration des étrangers en France (ANEF). Le conjoint et les enfants mineurs peuvent obtenir une carte « talent-famille » par une procédure simplifiée, sans regroupement familial. Pour un salarié, l'employeur n'a pas à demander d'autorisation de travail. La demande de renouvellement se dépose au plus tôt 4 mois et au plus tard 2 mois avant la fin de validité du titre : en cas de doute, la préfecture ou un conseiller répond.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Carte talent : carte de séjour pluriannuelle »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F16922" },
      phraseGenerale: "La carte talent s'adresse à des personnes étrangères qui veulent travailler en France au-delà d'une certaine durée, et sa validité dépend du titre et du contrat. Le renouvellement se demande dans une période précise avant la fin de validité du titre. Ces durées peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-carte-de-resident-refugie',
    titre: 'Démarche concrète',
    fichesEntree: ['carte-de-resident-refugie'],
    corps: "Dès que l'on reçoit le courrier qui reconnaît le statut de réfugié, la demande de carte se fait en ligne sur le site de l'administration des étrangers en France (ANEF). Un récépissé est remis tout de suite, la préfecture dispose de 3 mois à compter de la décision pour délivrer la carte, et la carte se retire ensuite à la préfecture ou à la sous-préfecture du lieu de résidence, après un message. Pour le réfugié, la délivrance est gratuite, et la carte est valable 10 ans. Certains membres de la famille peuvent aussi la demander, selon leur situation, et un droit de timbre est alors demandé pour la première délivrance. Le réfugié peut travailler avec son attestation « reconnu réfugié » puis avec sa carte : l'employeur n'a pas à demander d'autorisation de travail. En cas de difficulté, une association d'aide aux réfugiés ou un conseiller peut accompagner la démarche.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Carte de résident du réfugié »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F15401" },
      phraseGenerale: "La préfecture dispose d'un délai fixé pour délivrer la carte après la décision de statut, et la carte est valable de nombreuses années. Ces durées peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-pacte-fonction-publique',
    titre: 'Exemples concrets',
    fichesEntree: ['pacte-fonction-publique'],
    corps: "Le PACTE permet d'accéder à un emploi de catégorie C sans concours, pour les jeunes de 16 à 28 ans sans diplôme ou de niveau inférieur au baccalauréat, et pour les personnes d'au moins 45 ans, chômeuses de longue durée et percevant le RSA, l'ASS ou l'AAH. Les offres du PACTE sont publiées sur le site du ministère chargé de la fonction publique, sur celui de l'administration qui recrute et sur celui de France Travail. On y répond en ligne ou par courrier. Une commission retient d'abord des candidatures, puis reçoit les personnes en entretien, éventuellement par visioconférence. Le recrutement se fait par un contrat à durée déterminée de 12 mois à 2 ans, avec une période d'essai de 2 mois : on est salarié de l'administration, accompagné par un tuteur, et on suit une formation en alternance, d'une durée au moins égale à 20 % de celle du contrat. Au moins 1 mois avant la fin du contrat, une commission examine l'aptitude professionnelle : si elle est jugée suffisante, et si le diplôme éventuellement exigé est obtenu, la personne est titularisée fonctionnaire. Sinon, le contrat peut être renouvelé ou ne pas l'être.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « PACTE : parcours d'accès aux carrières de la fonction publique »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F12686" },
      phraseGenerale: "Le PACTE ouvre un emploi de catégorie C sans concours à des jeunes sans diplôme ou de faible niveau, et à des chômeurs de longue durée bénéficiaires de certains minima sociaux, selon des âges fixés. Le contrat comporte une formation en alternance, puis la personne peut être titularisée. Ces conditions peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-concours-fonction-publique',
    titre: 'Nuance utile',
    fichesEntree: ['concours-fonction-publique'],
    corps: "Il y a trois voies. L'externe est ouverte selon le diplôme requis pour la catégorie visée, et un diplôme équivalent ou une expérience peuvent parfois en tenir lieu. L'interne est réservée à des agents publics, des militaires, des magistrats ou des contractuels, selon une durée de services. Le troisième concours s'adresse aux personnes qui ont une expérience professionnelle, un mandat d'élu local ou une responsabilité associative, sans avoir été agent public pendant cette période. Les épreuves peuvent être écrites, orales, ou une sélection sur dossier, et certaines se font par visioconférence. Pour la fonction publique territoriale, chaque épreuve est notée sur 20 : une note inférieure à 5 à une épreuve obligatoire, ou une moyenne inférieure à 10, élimine. Dans la fonction publique territoriale, la réussite donne une inscription sur une liste d'aptitude, valable 2 ans (4 ans au maximum avec les renouvellements), qui ne vaut pas recrutement : il faut ensuite postuler auprès des collectivités. Pour un concours précis, l'avis de concours fait foi.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Concours de la fonction publique »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F434" },
      phraseGenerale: "Dans la fonction publique territoriale, les épreuves sont notées avec des seuils d'élimination, et la liste d'aptitude est valable pendant une durée limitée, renouvelable dans une limite maximale. Ces règles peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-cpf-agents-publics',
    titre: 'Nuance utile',
    fichesEntree: ['cpf-agents-publics'],
    corps: "Le compte est utilisé à l'initiative de l'agent, avec l'accord de son administration, qui peut accepter ou refuser. Un refus doit être motivé et peut être contesté. La démarche commence par un projet d'évolution professionnelle (mobilité, promotion, reconversion), puis une demande écrite qui précise le projet, la formation, le calendrier et le financement. Les formations en lien direct avec ses fonctions actuelles ne sont pas visées. Le compte peut aussi compléter la préparation d'un concours, une validation des acquis de l'expérience ou un bilan de compétences. L'administration prend en charge les frais pédagogiques, éventuellement dans une limite, et en cas d'abandon de la formation les frais engagés peuvent devoir être remboursés. Dans la fonction publique d'État, un agent de catégorie A, B ou C diplômé reçoit 25 heures par an, dans la limite de 150 heures ; un agent de catégorie C sans CAP ni BEP reçoit 50 heures par an, dans la limite de 400 heures. Les heures se consultent sur « Mon compte formation ».",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Compte personnel de formation dans la fonction publique d'État »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F18090" },
      phraseGenerale: "Le compte est alimenté chaque année d'un nombre d'heures qui dépend de la catégorie de l'agent et de son diplôme, dans la limite d'un plafond. Ces nombres peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-volontariat-armees',
    titre: 'Nuance utile',
    fichesEntree: ['volontariat-armees'],
    corps: "Le volontariat permet de découvrir les métiers de la défense, sans devenir militaire de carrière : seul un contrat d'engagement le fait. Il faut être de nationalité française et avoir entre 17 et 26 ans à la date de candidature. Il existe dans plusieurs armées, dans la gendarmerie et dans le service de santé des armées. L'accès est sélectif : tests physiques, aptitude médicale et, pour certains postes, compétences scolaires. Le volontaire signe un contrat d'une durée minimale de 3 mois, avec une période d'essai pendant laquelle chacun peut y mettre fin sans préavis, et il perçoit une solde selon son grade. Il peut faire valider son expérience et, à la fin du contrat, rejoindre la réserve opérationnelle. L'inscription se fait auprès d'un centre d'information et de recrutement des forces armées (Cirfa), ou auprès de la gendarmerie ou du service de santé pour ces corps.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Volontariat dans les armées »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1292" },
      phraseGenerale: "Le volontariat dans les armées est ouvert à des jeunes de nationalité française, dans une tranche d'âge fixée, par un contrat de durée minimale. Ces conditions peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-reserve-operationnelle',
    titre: 'Nuance utile',
    fichesEntree: ['reserve-operationnelle'],
    corps: "Le réserviste, qui doit avoir au moins 17 ans (la limite maximale est fixée à 72 ans), signe un contrat d'engagement à servir de 1 à 5 ans, renouvelable, qui prévoit de 5 à 120 jours d'activité par année civile selon les contrats, avec un programme prévisionnel de périodes d'activité. Pour un salarié du privé, le contrat de travail est suspendu pendant ces périodes, qui comptent comme du travail effectif, et l'employeur ne peut ni le sanctionner ni le licencier à cause de cet engagement. Il doit être prévenu au moins 1 mois à l'avance (15 jours avec une clause de réactivité), et son accord est nécessaire au-delà d'un seuil annuel d'activité pendant le temps de travail. Pour un agent public, le traitement est maintenu jusqu'à 30 jours par an. La solde est comparable à celle des militaires de carrière et exonérée d'impôt sur le revenu. Les candidatures se font en ligne ou par courrier électronique selon l'armée, avec l'aide possible d'un Cirfa.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Réserve opérationnelle dans les armées »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1188" },
      phraseGenerale: "Le réserviste signe un contrat d'engagement d'une durée limitée, avec un nombre de jours d'activité par an, et l'employeur doit être prévenu à l'avance. Pour un agent public, le traitement est maintenu dans une limite de jours. Ces seuils peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-pension-de-reversion',
    titre: 'Nuance utile',
    fichesEntree: ['pension-de-reversion'],
    corps: "La retraite de réversion n'est pas attribuée automatiquement : il faut la demander. Une seule demande en ligne, sur le site Info retraite avec FranceConnect, vaut pour tous les régimes de base et complémentaires concernés ; un dossier papier est possible, et les fonctionnaires de l'État, magistrats et militaires ont un formulaire particulier. Il faut avoir au moins 55 ans, ne pas dépasser un plafond de ressources annuelles, et avoir été marié avec la personne décédée : un divorce n'exclut pas le droit, même en cas de remariage, mais le Pacs et le concubinage ne donnent pas droit à la réversion. S'il y a eu plusieurs mariages, la pension est partagée selon la durée de chacun. Un simulateur en ligne permet de savoir si l'on y a droit, et l'Assurance retraite répond au 3960.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, actualité « La retraite de réversion »", url: "https://www.service-public.gouv.fr/particuliers/actualites/A19103" },
      phraseGenerale: "La retraite de réversion demande un âge minimum et un plafond de ressources, et il faut avoir été marié avec la personne décédée. Ces conditions peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-commissaire-de-justice',
    titre: 'Exemples concrets',
    fichesEntree: ['commissaire-de-justice'],
    corps: "Le commissaire de justice est le nom actuel des anciens huissiers de justice et commissaires-priseurs judiciaires. Dans une saisie sur salaire, par exemple, il signifie le commandement de payer au débiteur, peut proposer un accord sur le montant et les modalités de paiement si le débiteur le demande, signifie la saisie à l'employeur et en informe le débiteur dans un délai de 8 jours. Un commissaire de justice répartiteur reçoit ensuite les retenues de l'employeur et les reverse au créancier. Pour en trouver un, le site de l'Ordre national des commissaires de justice, rubrique « Où s'adresser ? », donne les coordonnées. Les tarifs de certaines prestations sont fixés par arrêté.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Saisie des rémunérations »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F115" },
      phraseGenerale: "Dans une saisie sur salaire, le commissaire de justice signifie la saisie à l'employeur et en informe le débiteur dans un délai court fixé par les textes. Ce délai peut changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-juge-de-l-execution',
    titre: 'Exemples concrets',
    fichesEntree: ['juge-de-l-execution'],
    corps: "Le juge de l'exécution est un juge du tribunal judiciaire. Une personne dont le compte bancaire, le salaire ou le véhicule est saisi peut le saisir pour contester la saisie, qu'il peut annuler si elle est irrégulière, inutile ou abusive, ou pour demander un délai ou un échelonnement de paiement. Après une décision d'expulsion, il peut aussi accorder un délai pour quitter le logement lorsque le relogement ne peut pas se faire dans des conditions normales. En règle générale, on le saisit par une assignation délivrée par un commissaire de justice. L'avocat est obligatoire au-delà d'un certain montant de créance et toujours pour faire appel, possible dans un délai de 15 jours à compter de la notification de la décision (l'appel ne suspend pas la décision). Saisir le juge ne suspend pas en principe la saisie. Si les revenus sont faibles, l'aide juridictionnelle peut être demandée.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Saisir le juge de l'exécution (JEX) »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F35820" },
      phraseGenerale: "L'appel d'une décision du juge de l'exécution est possible dans un délai court après la notification, et il ne suspend pas la décision. Ce délai peut changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-timbre-fiscal-justice',
    titre: 'Nuance utile',
    fichesEntree: ['timbre-fiscal-justice'],
    corps: "Le timbre fiscal se paie avant de saisir le tribunal, par la personne qui engage la procédure ou par son avocat. Il ne se vend que sous forme électronique et s'achète en ligne par carte bancaire. Il est valable 12 mois à compter de l'achat. Il n'est pas demandé aux personnes qui bénéficient de l'aide juridictionnelle, ni dans plusieurs situations comme le surendettement, le redressement ou la liquidation judiciaire, certaines ordonnances de protection ou les procédures d'injonction de payer. Un timbre acheté mais non utilisé peut être remboursé sur demande en ligne, pendant 18 mois. En cas de doute sur l'obligation de l'acheter, le greffe du tribunal peut répondre.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Timbre fiscal pour engager une procédure civile »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F33227" },
      phraseGenerale: "Le timbre fiscal est valable pendant une durée limitée à compter de l'achat, et un timbre non utilisé peut être remboursé dans un délai fixé. Ces durées peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-avance-loca-pass',
    titre: 'Démarche concrète',
    fichesEntree: ['avance-loca-pass'],
    corps: "L'Avance Loca-Pass est un prêt sans intérêts et sans frais de dossier, accordé par Action Logement pour payer tout ou partie du dépôt de garantie. Elle s'adresse notamment à des salariés du secteur privé, à des étudiants boursiers ou salariés, et à des personnes de moins de 30 ans en alternance, en recherche d'emploi ou en emploi non permanent. Le logement doit être la résidence principale et faire l'objet d'un bail. En colocation, seule la part de la personne qui fait la demande est couverte. Tout se fait en ligne : test d'éligibilité, compte Action Logement, formulaire et justificatifs. Il faut demander l'avance au plus tard 2 mois après l'entrée dans le logement. Le versement intervient dans les 10 jours suivant la signature de l'offre de prêt. Le remboursement commence 3 mois après le versement, sur 25 mois au maximum ; en cas de départ anticipé, la somme restante est à rembourser dans les 3 mois.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Avance Loca-Pass »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F18490" },
      phraseGenerale: "L'Avance Loca-Pass doit être demandée dans un délai court après l'entrée dans le logement, et son remboursement commence quelques mois après le versement, sur une durée limitée. Ces délais et âges peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-leasing-social',
    titre: 'Nuance utile',
    fichesEntree: ['leasing-social'],
    corps: "Le leasing social n'est pas une aide pour tous les trajets : il est destiné à des déplacements professionnels, avec des conditions de revenus et de kilométrage réalisé avec son véhicule personnel. Le dispositif concerne des voitures particulières neuves, uniquement électriques, qui répondent à des critères officiels, et la liste des modèles éligibles est publiée par le ministère chargé de l'environnement. On y accède en passant par un professionnel de l'automobile, qui vérifie l'éligibilité, constitue le dossier et déduit l'aide du premier loyer. L'aide ne peut être obtenue qu'une seule fois, ne se cumule pas avec certaines aides précédentes, et le véhicule ne peut pas être sous-loué. Le contrat est une location longue durée ou avec option d'achat, d'une durée de 3 ans ou plus, avec un délai de rétractation de 14 jours calendaires. Un simulateur officiel permet de tester son éligibilité avant de s'engager, et le 0 800 74 74 00 (appel gratuit) répond du lundi au vendredi.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Leasing social »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F39280" },
      phraseGenerale: "Le leasing social est une location d'une durée minimale, avec un délai de rétractation après la signature, et il s'appuie sur un simulateur officiel pour tester son éligibilité. Ces conditions peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-aide-permis-b-france-travail',
    titre: 'Nuance utile',
    fichesEntree: ['aide-permis-b-france-travail'],
    corps: "La page officielle consultée ne décrit pas cette aide : elle la cite seulement dans ses références juridiques. Pour savoir si l'on y est éligible et comment la demander, il faut s'adresser à France Travail. D'autres aides au permis existent : le prêt à taux zéro, de 15 à 25 ans, avec une école de conduite partenaire de l'État, le fonds d'aide aux jeunes, de 18 à 25 ans, via la mission locale, la bourse au permis de certaines communes en échange d'une activité d'intérêt collectif, le compte personnel de formation pour un demandeur d'emploi dont le projet professionnel le justifie, le microcrédit personnel, des aides locales et, pour les personnes en situation de handicap, la MDPH ou l'Agefiph. Un conseiller peut indiquer lesquelles correspondent à la situation.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Aides au financement du permis de conduire »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F13609" },
      phraseGenerale: "Le prêt à taux zéro pour le permis et le fonds d'aide aux jeunes s'adressent à des tranches d'âge fixées. Ces âges peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-contrat-valorisation-experience',
    titre: 'Nuance utile',
    fichesEntree: ['contrat-valorisation-experience'],
    corps: "Le contrat de valorisation de l'expérience, ou CDI senior, est un contrat à durée indéterminée réservé, à l'embauche, à des demandeurs d'emploi inscrits à France Travail, âgés d'au moins 60 ans (57 ans si une convention ou un accord de branche le prévoit), qui approchent de la retraite sans pouvoir encore bénéficier d'une retraite à taux plein, et qui n'ont pas travaillé dans l'entreprise ou son groupe au cours des 6 mois précédents. Il peut être rompu selon les règles habituelles : démission, rupture conventionnelle, licenciement. Sa particularité est que l'employeur peut mettre le salarié à la retraite sans son accord, seulement à partir du moment où celui-ci peut partir avec une retraite à taux plein. Le salarié remet à l'embauche un document de l'Assurance retraite qui indique la date prévisionnelle de sa retraite à taux plein. En cas de mise à la retraite, il a droit à un préavis et à une indemnité. Le dispositif est temporaire : le contrat peut être conclu du 26 octobre 2025 au 24 octobre 2030.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr (Entreprendre), fiche « Contrat de valorisation de l'expérience (CDI senior) »", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F39356" },
      phraseGenerale: "Le contrat est réservé à des demandeurs d'emploi qui approchent de la retraite, à partir d'un âge minimum, et qui n'ont pas travaillé récemment dans l'entreprise. Le dispositif est temporaire et sa période de signature est limitée. Ces conditions peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-pix',
    titre: 'Nuance utile',
    fichesEntree: ['pix'],
    corps: "La certification Pix atteste officiellement un niveau de compétences numériques et peut se mettre en valeur sur un CV. On commence par un compte sur la plateforme, où l'on s'entraîne avec des défis comme chercher des informations en ligne ou manipuler des fichiers. Pour se présenter à la certification, il faut avoir atteint un niveau minimal dans plusieurs compétences. L'examen se passe dans un centre agréé ou dans un établissement scolaire : c'est un test adaptatif, dont la difficulté évolue selon les réponses, et une question difficile ne veut donc pas dire un échec. Aucun score minimal n'est exigé pour obtenir la certification. Les résultats et le certificat se retrouvent sur le compte Pix. La certification est inscrite au répertoire spécifique de France Compétences : les formations qui y préparent peuvent être financées avec le compte personnel de formation."
  },
  {
    id: 'second-niveau-pacte-europeen-asile',
    titre: 'Nuance utile',
    fichesEntree: ['pacte-europeen-asile'],
    corps: "Pour les demandes déposées depuis l'application du pacte, le 12 juin 2026, le délai d'attente avant de pouvoir travailler se compte à partir de la date d'enregistrement de la demande d'asile au guichet unique des demandeurs d'asile, et non plus à partir de l'introduction auprès de l'Ofpra. Les demandes plus anciennes gardent l'ancien point de départ. Pendant les 6 premiers mois, on ne peut pas demander d'autorisation de travail, mais l'allocation pour demandeur d'asile peut être versée sous conditions. Après 6 mois, si l'Ofpra n'a pas encore statué, c'est l'employeur qui demande l'autorisation, avec une promesse d'embauche ou un contrat de travail ; l'administration dispose de 2 mois pour répondre, et une absence de réponse vaut acceptation. Pour les personnes visées par une décision de transfert vers un autre État responsable de leur demande, le droit de travailler a été supprimé à compter du 12 juin 2026. Une association ou un conseiller peut aider à comprendre sa situation.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr, fiche « Pacte européen sur la migration et l'asile et demande d'asile en France »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2741" },
      phraseGenerale: "Pour les demandes d'asile déposées depuis l'entrée en application du pacte, le délai d'attente avant de pouvoir travailler court à partir de l'enregistrement de la demande. Pendant les premiers mois, on ne peut pas obtenir d'autorisation de travail. Ces dates et délais peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-conge-supplementaire-de-naissance',
    titre: 'Démarche concrète',
    fichesEntree: ['conge-supplementaire-de-naissance'],
    corps: "Le congé accorde de 1 à 2 mois de congé indemnisé à chaque parent, pour un enfant né ou adopté à partir du 1er janvier 2026, et il est entré en vigueur le 1er juillet 2026. Le droit est individuel : chaque parent a le sien, et il ne se transfère pas à l'autre. Le congé commence après les congés de maternité, de paternité et d'accueil ou d'adoption. Il doit commencer dans les 9 mois suivant la naissance ou l'arrivée de l'enfant. Il peut être pris en une fois ou fractionné en 2 périodes d'un mois, par l'un des parents ou par les deux en même temps ou en alternance. Un salarié prévient son employeur au moins 1 mois à l'avance (15 jours si le congé suit directement un congé de paternité ou d'adoption) par lettre recommandée avec accusé de réception ou remise en main propre, en indiquant la date de début, la durée et, s'il y en a, les périodes de fractionnement ; le ministère du Travail propose un modèle de courrier. Les indépendants, les artistes-auteurs, les demandeurs d'emploi et d'autres publics ont des démarches particulières, par un service en ligne ou auprès de France Travail. Dans le privé, il est indemnisé par la Sécurité sociale, et les allocations chômage sont suspendues pendant le congé.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr (Entreprendre), actualité « Congé supplémentaire de naissance »", url: "https://entreprendre.service-public.gouv.fr/actualites/A18939" },
      phraseGenerale: "Le congé supplémentaire de naissance accorde à chaque parent un congé indemnisé de quelques semaines, à prendre dans un délai limité après la naissance ou l'arrivée de l'enfant, en prévenant l'employeur à l'avance. Ces durées et dates peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-flagrance-sociale',
    titre: 'Nuance utile',
    fichesEntree: ['flagrance-sociale'],
    corps: "La flagrance sociale est une procédure contre le travail dissimulé. Les agents de contrôle peuvent dresser un procès-verbal qui permet à l'Urssaf de prendre, sans passer par un juge, des mesures conservatoires pour garantir le paiement de cotisations dues. Le procès-verbal évalue les cotisations non payées, les majorations et pénalités, et l'annulation des réductions ou exonérations dont l'employeur a pu bénéficier. Il doit indiquer comment le contester. La personne contrôlée peut demander la fin des mesures en apportant des garanties suffisantes de paiement. La page d'actualité consultée ne détaille pas de conséquence propre aux salariés : en cas de doute sur sa situation, un conseiller ou l'Urssaf peut répondre."
  },
  {
    id: 'second-niveau-mam',
    titre: 'Nuance utile',
    fichesEntree: ['mam'],
    corps: "Une maison d'assistants maternels est un mode de garde intermédiaire entre l'accueil chez une assistante maternelle et la crèche : plusieurs assistantes agréées se regroupent dans un lieu dédié, aménagé pour la sécurité et l'éveil des enfants, qui y vivent en petit groupe. Chaque assistante a son propre agrément, délivré par le conseil départemental. Le nombre d'enfants accueillis est encadré, avec un plafond plus bas pour les moins de 3 ans. Le parent reste l'employeur de l'assistante à qui il confie son enfant : il signe un contrat de travail, déclare le salaire par Pajemploi et applique la convention collective. La délégation d'accueil, propre aux maisons d'assistants maternels, permet de confier ponctuellement l'enfant à une collègue de la même maison, si le contrat la prévoit et avec l'accord des parents. Le complément de libre choix du mode de garde et un crédit d'impôt peuvent aider. Le site monenfant.fr permet de chercher une maison près de chez soi.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Monenfant.fr, page « L'accueil en maison d'assistantes maternelles »", url: "https://monenfant.fr/l-accueil-en-maison-d-assistantes-maternelles" },
      phraseGenerale: "Le nombre d'enfants accueillis dans une maison d'assistants maternels est encadré, avec un plafond plus bas pour les plus jeunes. Ces plafonds peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-relais-petite-enfance',
    titre: 'Nuance utile',
    fichesEntree: ['relais-petite-enfance'],
    corps: "Les relais petite enfance, anciennement relais assistants maternels, sont gratuits, neutres et ouverts à tous. Ils sont gérés par des collectivités, des associations ou des mutuelles, et animés par des professionnels de la petite enfance. Les parents peuvent y prendre un rendez-vous pour s'informer sur les modes d'accueil et les aides financières, obtenir les coordonnées de professionnels agréés et comprendre leurs droits et devoirs d'employeur d'un assistant maternel. Les assistants maternels et les gardes d'enfants à domicile y trouvent des temps collectifs, des ateliers d'éveil pour les enfants, des informations sur le droit du travail, l'agrément et les aides, et un accompagnement. Le relais ne dispense pas lui-même les formations. Pour en trouver un, la recherche géolocalisée de monenfant.fr, rubrique des modes d'accueil, permet de le contacter."
  },
  {
    id: 'second-niveau-qualiopi',
    titre: 'Nuance utile',
    fichesEntree: ['qualiopi'],
    corps: "La certification Qualiopi est obligatoire pour les organismes de formation qui veulent des fonds des financeurs publics ou mutualisés, comme les opérateurs de compétences, les régions, l'État, France Travail ou l'Agefiph. Elle est délivrée pour une ou plusieurs catégories d'actions : actions de formation, validation des acquis de l'expérience, bilans de compétences, formation par apprentissage. Elle repose sur un référentiel national unique, qui compte sept critères reliés à 22 indicateurs communs à tous les prestataires, auxquels s'ajoutent 11 indicateurs spécifiques à l'apprentissage ou aux formations certifiantes, et sur des organismes certificateurs indépendants, accrédités. Le cycle comprend un audit de surveillance entre le 14e et le 22e mois suivant l'obtention de la certification, puis un audit de renouvellement avant l'échéance du certificat. Le référentiel a été révisé par un décret du 1er août 2026 : jusqu'au 31 décembre 2026, un audit peut se fonder sur le nouveau ou l'ancien référentiel. Les organismes certifiés sont identifiés par la marque Qualiopi. Pour vérifier qu'un organisme l'est, la liste publique des organismes de formation est consultable sur le site data.gouv.fr ; l'organisme n'a aucune démarche à faire pour y figurer. Certains établissements d'enseignement supérieur, évalués par d'autres instances, sont réputés avoir satisfait à l'obligation. En cas de doute sur une formation, le financeur ou un conseiller peut vérifier.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Ministère du Travail, guide de lecture du référentiel national qualité (Qualiopi)", url: "https://travail-emploi.gouv.fr/referentiel-national-qualite-guide-de-lecture-qualiopi" },
      phraseGenerale: "Le référentiel Qualiopi repose sur un nombre fixé de critères et d'indicateurs, et la certification est contrôlée par un audit de surveillance, puis un audit de renouvellement. Le référentiel vient d'être révisé, avec une période de transition. Ces éléments peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-fem',
    titre: 'Nuance utile',
    fichesEntree: ['fem'],
    corps: "Le FEM, créé en 2007, est un fonds européen qui cofinance des mesures pour aider au reclassement de salariés licenciés lors de restructurations de grande ampleur, causées par exemple par la mondialisation, une crise économique, la transition écologique ou la transition numérique. Une personne licenciée ne le demande pas elle-même : la demande est portée par l'État auprès de la Commission européenne, et, quand le licenciement est imminent, par l'entreprise en restructuration. Ce sont les entreprises qui portent financièrement les mesures et suivent les bénéficiaires, en complément de leurs obligations habituelles. Le fonds peut financer l'aide à la recherche d'emploi, l'orientation, la formation, des aides au reclassement externe ou à la création d'entreprise, et, pour une durée limitée, certaines allocations. Il faut que 200 salariés ou travailleurs indépendants soient concernés par un licenciement pour motif économique. Le taux de prise en charge est de 85 %, sans pouvoir être inférieur à 60 %, les entreprises contribuant à hauteur d'au moins 15 % au financement des mesures, avec un budget annuel de 35 millions d'euros à l'échelle de l'Union. Les aides au reclassement externe ou à la création d'entreprise sont limitées à 22 000 € par bénéficiaire, et les allocations à 35 % du coût total des actions. Les actions sont mises en œuvre pendant 24 mois à compter de la décision d'octroi. Le fonds ne finance pas les allocations de chômage ni les retraites. Pour savoir si l'on est concerné, il faut interroger son employeur, les représentants du personnel ou un conseiller.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Ministère du Travail, page « Le Fonds européen d'ajustement à la mondialisation (FEM) »", url: "https://travail-emploi.gouv.fr/le-fonds-europeen-dajustement-la-mondialisation-en-faveur-des-travailleurs-licencies-fem" },
      phraseGenerale: "Le fonds intervient à partir d'un nombre minimal de salariés concernés par un licenciement économique, et il cofinance une part des mesures, dans la limite de plafonds et pendant une durée fixée. Ces seuils, taux et plafonds peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-ecole-de-production',
    titre: 'Nuance utile',
    fichesEntree: ['ecole-de-production'],
    corps: "Les écoles de production s'adressent à des jeunes en rupture scolaire, sans qualification et en difficulté sociale. On y apprend un métier d'une façon différente, par une pédagogie du faire pour apprendre : les élèves fabriquent des produits ou proposent des services pour répondre à de vraies commandes de clients. Elles font partie des solutions de reprise d'études présentées par l'Onisep, avec les micro-lycées, les écoles de la deuxième chance ou l'EPIDE, en lien avec la mission de lutte contre le décrochage scolaire (MLDS) de chaque académie. Les critères d'admission varient d'un établissement à l'autre : il faut se renseigner auprès de l'école, de la mission locale ou d'un centre d'information et d'orientation."
  },
  {
    id: 'second-niveau-pension-de-famille',
    titre: 'Nuance utile',
    fichesEntree: ['pension-de-famille'],
    corps: "La pension de famille est une forme de résidence sociale : un logement collectif à titre de résidence principale, avec des logements privatifs et des espaces communs pour la vie collective. Elle propose une alternative au logement ordinaire pour des personnes à faibles ressources, isolées ou en situation d'exclusion, qui ont souvent fréquenté de façon répétée des structures d'hébergement provisoire, et qui ne peuvent pas accéder à un logement autonome à cause de leur isolement, social ou psychologique. De taille réduite (capacité recommandée de 25 logements), elle propose un accompagnement à la vie quotidienne assuré par un hôte ou un couple d'hôtes. L'accueil se fait sans limitation de durée, avec un contrat renouvelé tacitement chaque mois. Il existe aussi la résidence accueil, qui est une pension de famille. Les gestionnaires doivent être agréés au titre de l'intermédiation locative et de la gestion locative sociale, et le logement ouvre droit à l'aide personnalisée au logement. Un travailleur social ou un service d'accueil peut orienter vers une pension de famille.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Ministère du Logement, fiche pratique « Les pensions de famille »", url: "https://www.financement-logement-social.logement.gouv.fr/IMG/pdf/05_fiche_pratique_les-pensions-de-famille___pf_-mai_2021_cle191dab.pdf" },
      phraseGenerale: "La pension de famille est une structure de taille réduite, avec une capacité recommandée limitée. Cette capacité peut changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-siao-115',
    titre: 'Démarche concrète',
    fichesEntree: ['siao-115'],
    corps: "Le 115 est le numéro d'urgence et d'accueil des personnes sans abri : il est gratuit depuis un fixe comme depuis un mobile, ouvert tous les jours, jour et nuit. L'appel est géolocalisé, identifié et priorisé. C'est un écoutant du 115 qui enregistre la demande d'hébergement pendant l'appel, dans l'outil du SIAO : pour un hébergement d'urgence, un diagnostic social complet n'est pas demandé. Il faut signaler la présence d'un animal, car certaines structures n'en acceptent pas, et les priorités, de 1 (la plus urgente) à 5, sont définies localement. On peut aussi s'adresser à la mairie pour connaître les structures de la commune, ou directement aux associations qui proposent un hébergement d'urgence. Si aucune solution adaptée n'est proposée après une demande, le droit à un hébergement opposable peut être exercé, sous conditions : un travailleur social ou une association peut accompagner cette démarche.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Base de connaissances du SI SIAO, page « Réaliser une demande d'hébergement d'urgence via le 115 »", url: "https://basedeconnaissances.sisiao.dihal.gouv.fr/support/r%C3%A9aliser-une-demande-dh%C3%A9bergement-durgence-via-le-115" },
      phraseGenerale: "Les priorités des demandes d'hébergement d'urgence sont notées sur une échelle, définie localement. Cette échelle peut changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-conge-sans-solde',
    titre: 'Nuance utile',
    fichesEntree: ['conge-sans-solde'],
    corps: "Aucun délai de prévenance n'est imposé et le salarié n'a pas à donner son motif, mais une demande écrite, par lettre recommandée ou par courriel, sert de preuve. Elle peut préciser les dates de début et de fin, une possibilité de renouvellement et les conditions de retour. La durée n'est pas encadrée : elle se convient avec l'employeur. Une absence prise sans accord peut être sanctionnée, jusqu'au licenciement pour faute grave. Pendant le congé, le contrat est suspendu et non rompu ; le salarié peut faire ce qu'il veut de son temps, sauf une activité concurrente de celle de son employeur. En cas de maladie pendant le congé, la Sécurité sociale ne verse pas d'indemnités journalières. À son retour, le salarié retrouve son poste ou un emploi similaire, avec une rémunération au moins équivalente."
  },
  {
    id: 'second-niveau-droit-de-retrait',
    titre: 'Exemples concrets',
    fichesEntree: ['droit-de-retrait'],
    corps: "Il suffit d'avoir un motif raisonnable de croire à un danger : la menace doit être sérieuse et appeler une réaction urgente. Il peut s'agir, par exemple, d'un équipement défectueux, de l'absence de protections, d'un procédé dangereux ou d'un risque d'agression, pour une personne seule comme pour un groupe. L'information peut être orale si l'urgence l'exige, mais un écrit est préférable : un courriel, une remise en main propre contre signature ou une lettre recommandée. Le retrait n'a pas de durée fixée à l'avance : il dure tant que le danger existe, et l'employeur ne peut pas exiger la reprise du travail tant que le danger persiste. Si le retrait est justifié, le salaire est maintenu ; sinon l'employeur peut retenir la somme correspondant à l'absence, que le salarié peut contester devant le conseil de prud'hommes."
  },
  {
    id: 'second-niveau-droit-de-greve',
    titre: 'Nuance utile',
    fichesEntree: ['droit-de-greve'],
    corps: "Pour être protégée, la grève doit être une cessation collective et concertée du travail, qui appuie des revendications professionnelles connues de l'employeur. Tout salarié peut faire grève, syndiqué ou non, et la grève peut être lancée par un syndicat comme par des salariés. Dans le privé, aucun préavis n'est exigé et le salarié n'a pas à prévenir l'employeur qu'il fera grève. Elle suspend le contrat de travail : l'employeur peut retenir une part du salaire proportionnelle à la durée de l'arrêt, pas davantage, et la grève ne doit pas figurer sur le bulletin de paie. Aucune sanction, aucun licenciement ni discrimination n'est permis pour avoir fait grève, sauf faute lourde, par exemple une participation active à des actes illégaux. Les grévistes doivent respecter le travail des non-grévistes. Des règles particulières s'appliquent aux transports de voyageurs."
  },
  {
    id: 'second-niveau-conseiller-numerique',
    titre: 'Nuance utile',
    fichesEntree: ['conseiller-numerique'],
    corps: "Plus de 4,5 millions d'accompagnements ont déjà été réalisés dans le cadre de ce dispositif. Les conseillers numériques accompagnent les personnes pour gagner en autonomie dans leurs usages du numérique, en rendez-vous individuel ou en atelier collectif : prendre en main un ordinateur, un téléphone ou une tablette, utiliser la messagerie et la visio, gérer ses contenus, trouver un emploi ou une formation, se protéger en ligne, faire ses achats ou sa banque en ligne. Il ne faut pas les confondre avec les conseillers France services : le conseiller numérique aide à devenir autonome et à faire seul, alors que le conseiller France services aide à réaliser sur place une démarche administrative précise, par exemple avec les impôts, la Caf, France Travail ou l'Assurance maladie. Pour trouver un conseiller numérique, une carte nationale des lieux d'inclusion numérique est accessible sur le site officiel conseiller-numerique.gouv.fr.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Conseiller-numerique.gouv.fr, site officiel du dispositif", url: "https://www.conseiller-numerique.gouv.fr/" },
      phraseGenerale: "Le dispositif des conseillers numériques a déjà réalisé un très grand nombre d'accompagnements. Ce nombre évolue sans cesse : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-identite-numerique',
    titre: 'Nuance utile',
    fichesEntree: ['identite-numerique'],
    corps: "L'application France Identité, portée par France Titres, permet d'avoir ses papiers d'identité dans son téléphone, de se connecter à plus de 1800 services sans identifiant ni mot de passe grâce à FranceConnect, et de générer un justificatif d'identité à usage unique, ce qui évite de photocopier sa carte d'identité, par exemple pour une location d'appartement. Elle est réservée aux personnes de 18 ans et plus qui possèdent la nouvelle carte d'identité française au format carte bancaire, et à un téléphone dont le système est au moins iOS 16.6 ou Android 11. Le site officiel est france-identite.gouv.fr, et une rubrique de questions fréquentes y répond en cas de difficulté.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "France-identite.gouv.fr, site officiel de l'application France Identité", url: "https://france-identite.gouv.fr/" },
      phraseGenerale: "L'application France Identité donne accès à un grand nombre de services via FranceConnect. Elle est réservée aux personnes majeures qui possèdent la nouvelle carte d'identité, et à un téléphone dont le système est assez récent. Ces conditions et ces nombres peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-geiq',
    titre: 'Nuance utile',
    fichesEntree: ['geiq'],
    corps: "Un GEIQ est un collectif d'entreprises, dirigé par ses adhérents, qui mise sur le potentiel de personnes éloignées de l'emploi pour répondre à ses besoins de recrutement durables. Il organise pour elles des parcours d'insertion et de qualification, en alternance. D'après le site de la fédération, l'alternance est ouverte à tous les âges, sans diplôme exigé. Le site propose une rubrique « Trouver un GEIQ » pour repérer celui de son territoire, et une page explique comment un candidat peut y être orienté, par exemple par un acteur local de l'emploi. Un conseiller peut aider à identifier le GEIQ le plus proche."
  },
  {
    id: 'second-niveau-pajemploi',
    titre: 'Démarche concrète',
    fichesEntree: ['pajemploi'],
    corps: "Le service Pajemploi s'adresse aux parents employeurs, aux assistants maternels agréés et aux gardes d'enfants à domicile. Il permet au parent de déclarer facilement la rémunération de son salarié ; le salarié bénéficie ainsi d'une couverture sociale (assurance maladie, allocations familiales, chômage, retraite), et le parent peut, s'il remplit les conditions, recevoir le complément de libre choix du mode de garde. Pour l'utiliser, on active son espace en ligne à la réception du courrier qui contient ses identifiants temporaires. Cet espace permet de déclarer ses salariés, de gérer son adhésion à Pajemploi +, de contacter l'Urssaf et de retrouver ses documents. Une application, Mon Pajemploi au quotidien, existe aussi. L'Urssaf met à disposition des modèles de contrat de travail et d'engagement réciproque entre parents employeurs et assistants maternels."
  },
  {
    id: 'second-niveau-numero-unique-enregistrement',
    titre: 'Démarche concrète',
    fichesEntree: ['numero-unique-enregistrement'],
    corps: "Ce numéro national figure sur l'attestation d'enregistrement que l'on reçoit quand la demande est acceptée. Il atteste la prise en compte de la demande et son ancienneté. On doit l'indiquer pour renouveler la demande, la modifier en cas de changement de situation (adresse, composition de la famille, revenus), ou former un recours au titre du droit au logement opposable. Le renouvellement se fait chaque année, entre le dixième et le douzième mois après la création de la demande ou de son dernier renouvellement, en ligne ou auprès d'un guichet enregistreur. Un rappel est envoyé avant l'échéance. Une demande non renouvelée à temps est annulée : il faut alors tout recommencer, avec un nouveau numéro. Une demande peut aussi être radiée si l'on ne répond pas aux courriers envoyés à la dernière adresse déclarée, d'où l'importance de signaler un déménagement. Après un renouvellement en ligne, l'attestation se télécharge depuis son compte personnel. Si l'on était dans l'incapacité de renouveler, on peut contester la radiation auprès d'un guichet enregistreur du département. Dans certains départements, un système local d'enregistrement remplace le portail national : il faut alors passer par lui."
  },
  {
    id: 'second-niveau-fonds-d-aide-aux-jeunes',
    titre: 'Nuance utile',
    fichesEntree: ['fonds-d-aide-aux-jeunes'],
    corps: "Le ministère des Solidarités présente le fonds d'aide aux jeunes comme une aide de dernier recours, qui favorise l'insertion sociale et professionnelle des jeunes adultes par des aides ponctuelles et de faible montant, répondant à un besoin précis. Il concerne surtout des jeunes qui n'ont jamais travaillé ou très peu, alors que le RSA s'adresse plutôt à des personnes qui ont déjà travaillé. L'aide prend le plus souvent la forme d'une subvention, plus rarement d'un prêt à rembourser, et certains départements proposent aussi un accompagnement collectif (recherche d'emploi, de logement). Le fonds est géré par chaque département : l'âge, les ressources, les conditions de séjour, les aides financées et la procédure varient donc d'un territoire à l'autre, et certains départements acceptent à titre exceptionnel des lycéens ou des étudiants. Le jeune ne dépose souvent pas sa demande seul : elle se construit avec un référent, par exemple un conseiller de mission locale, une maison départementale des solidarités ou une association habilitée, puis elle est examinée par une commission. Les montants et la liste des aides se vérifient auprès du département de résidence."
  },
  {
    id: 'second-niveau-epicerie-sociale',
    titre: 'Nuance utile',
    fichesEntree: ['epicerie-sociale'],
    corps: "Une épicerie sociale et solidaire fonctionne comme un commerce de proximité, avec des produits en libre choix, si possible en libre-service, contre une participation financière minime. Elle diffère d'une distribution gratuite, comme celle des Restos du Cœur, qui propose une aide alimentaire gratuite. Elle s'adresse à des personnes en précarité qui gardent un reste à vivre suffisant pour payer une partie de leur alimentation. Les conditions d'accès sont fixées par chaque épicerie, écrites et fondées sur des critères objectifs. Les demandes sont étudiées selon une procédure formalisée, et toute personne a le droit de voir sa demande étudiée. L'accès est accordé pour une durée déterminée, parfois renouvelable, avec un accompagnement personnalisé. Il se fait souvent sur prescription d'un travailleur social, et le centre communal d'action sociale peut orienter ou délivrer un bon d'accès. Il n'existe pas d'annuaire national unique : on s'adresse au centre communal d'action sociale de sa commune. D'autres formes d'aide existent : paniers, repas chauds, restaurants sociaux, maraudes."
  },
  {
    id: 'second-niveau-garage-solidaire',
    titre: 'Nuance utile',
    fichesEntree: ['garage-solidaire'],
    corps: "Le garage solidaire propose les mêmes services d'entretien et de réparation qu'un garage classique, mais à des tarifs adaptés, pour permettre aux personnes en difficulté de garder plus longtemps leur véhicule et de rouler en sécurité. Certains louent ou vendent aussi des véhicules, parfois à tarif préférentiel et avec option d'achat, ou proposent d'apprendre les bases de la mécanique pour devenir autonome. Les services sont accessibles sur prescription : on peut demander à son conseiller de l'organisme prescripteur, ou se rendre directement au garage pour obtenir ses conseils. Les conditions varient selon chaque garage. À titre d'exemple, l'un d'eux demande une prescription d'un travailleur social, le permis de conduire, une carte grise au nom de la personne, un véhicule assuré, avec contrôle technique à jour, et qui roule. Le portail Mes aides de France Travail permet de trouver le garage solidaire le plus proche, avec le nom de sa commune ou son code postal."
  },
  {
    id: 'second-niveau-auto-ecole-sociale',
    titre: 'Nuance utile',
    fichesEntree: ['auto-ecole-sociale'],
    corps: "Une auto-école sociale possède un agrément spécifique délivré par le préfet. Elle s'adresse exclusivement aux personnes en difficulté sociale, en insertion professionnelle ou qui ont des difficultés d'apprentissage de la conduite, par exemple la peur de conduire ou la dyslexie. Elle propose un accompagnement économique et pédagogique adapté et personnalisé pour faciliter l'obtention du permis. Les conditions précises sont fixées par chaque structure : l'une d'elles, par exemple, est destinée aux personnes en fragilité économique, engagées dans une démarche d'insertion professionnelle et confrontées à des problèmes de mobilité. Le plus simple est de contacter son conseiller à l'emploi, qui oriente vers un conseiller en mobilité. Il n'existe pas de recherche nationale unique par commune, mais le portail Mes aides de France Travail référence des offres d'auto-écoles sociales."
  },
  {
    id: 'second-niveau-plateforme-mobilite',
    titre: 'Nuance utile',
    fichesEntree: ['plateforme-mobilite'],
    corps: "Une plateforme de mobilité fonctionne comme un guichet unique d'accueil et d'accompagnement : elle propose une offre de mobilité adaptée aux besoins des publics les plus fragiles. Il s'agit en général d'un parcours qui active des services pédagogiques (conseil, formation, information, orientation, médiation), financiers (accès aux droits et aux aides à la mobilité) et matériels (véhicules à tarif solidaire, réparation solidaire), coordonnés par des conseillers en mobilité. Ceux-ci s'appuient sur les offres existantes du territoire. Pour les personnes sans moyen de transport, la plateforme peut proposer la location d'une voiture, d'un scooter, d'une voiture sans permis, d'un vélo ou d'un vélo électrique. Des formations pratiques existent aussi, comme la vélo-école. Elle accueille jeunes, personnes en insertion ou en formation, salariés ou personnes en situation de handicap. France Travail dispose d'un annuaire national des plateformes, accessible depuis le portail Mes aides, pour trouver la plus proche : les coordonnées de la plateforme qui vous intéresse s'obtiennent en cliquant sur la pastille rouge de la cartographie. Il est nécessaire de prendre rendez-vous à l'avance."
  },
  {
    id: 'second-niveau-parrainage-vers-l-emploi',
    titre: 'Nuance utile',
    fichesEntree: ['parrainage-vers-l-emploi'],
    corps: "Selon le ministère du Travail, le parrainage vise à faciliter l'accès et le maintien dans l'emploi de personnes en difficulté d'insertion professionnelle, quel que soit leur niveau de diplôme, en les faisant accompagner par des bénévoles, professionnels en activité ou retraités, qui partagent leur expérience et leurs réseaux. Le parrain apporte une aide personnalisée dans la recherche d'emploi. Il s'adresse à des personnes volontaires et motivées, engagées dans une démarche active de recherche d'emploi, dont le projet professionnel est défini ou en cours de l'être. Le ministère présente notamment l'offre aux jeunes de 16 à 30 ans, en recherche d'emploi ou déjà en emploi, qui ont besoin d'être accompagnés dans leur projet, d'un soutien technique, d'une meilleure connaissance de l'entreprise, d'un réseau professionnel ou de conseils pour se maintenir en emploi. La mise en relation entre le filleul et son parrain passe par une structure locale, qui anime le réseau : le ministère en recense plus de 400. Le parrainage définit les objectifs, les engagements et les modalités de l'accompagnement. Pour trouver une structure, un conseiller en insertion peut aider.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Travail-emploi.gouv.fr, pages « Je souhaite bénéficier du parrainage » et « Quinzaine du parrainage vers l'emploi »", url: "https://travail-emploi.gouv.fr/je-souhaite-beneficier-du-parrainage" },
      phraseGenerale: "Le parrainage s'adresse à des jeunes, en recherche d'emploi ou déjà en emploi, et passe par des structures locales nombreuses, qui animent le réseau de parrains. Les conditions d'âge peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-heures-d-insertion',
    titre: 'Nuance utile',
    fichesEntree: ['heures-d-insertion'],
    corps: "Les heures d'insertion sont des heures de travail réalisées dans le cadre d'une clause sociale d'insertion, un levier de la commande publique : un marché public peut prévoir qu'une partie du travail soit confiée à des personnes éloignées de l'emploi. Les structures de l'insertion par l'activité économique sont, d'après le guide officiel, les principaux employeurs des bénéficiaires de la clause sociale : en 2021, elles représentaient plus de 36 % des heures d'insertion réalisées. Le ministère du Travail rappelle que la commande publique est ouverte aux structures de l'inclusion, par réponse directe, en sous-traitance ou en cotraitance, ou par des marchés réservés. Pour s'informer, il renvoie à la plateforme du Marché de l'inclusion. Pour une personne, le plus simple est de demander à un conseiller en insertion ou à une structure d'insertion si des marchés de la région comportent une clause sociale.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Ministère du Travail, guide de l'insertion par l'activité économique", url: "https://travail-emploi.gouv.fr/sites/travail-emploi/files/files-spip/pdf/guide_iae.pdf" },
      phraseGenerale: "Les structures de l'insertion par l'activité économique sont parmi les principaux employeurs des bénéficiaires de la clause sociale, et réalisent une part importante des heures d'insertion. Cette part évolue : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-metier-en-tension',
    titre: 'Nuance utile',
    fichesEntree: ['metier-en-tension'],
    corps: "France Travail décrit la tension à l'échelle d'un bassin d'emploi : y a-t-il, près de chez soi, assez de candidats disponibles, qualifiés ou expérimentés, pour ce type de poste, ou au contraire une pénurie ? Un métier est considéré en tension lorsque, dans l'enquête Besoins en main-d'œuvre, la part de projets de recrutement jugés difficiles dans le bassin d'emploi dépasse celle de l'ensemble des métiers. La tension se mesure donc par métier et par territoire, et un même métier peut être en tension dans un bassin et pas dans un autre. Pour un employeur, c'est un signal pour élargir son vivier : France Travail propose par exemple la méthode de recrutement par simulation, qui ne regarde pas les CV et s'adresse particulièrement aux métiers en tension où les compétences comportementales comptent autant que l'expérience. Pour un candidat, un conseiller peut dire quels métiers recrutent dans sa région."
  },
  {
    id: 'second-niveau-obligations-employeur-embauche',
    titre: 'Démarche concrète',
    fichesEntree: ['obligations-employeur-embauche'],
    corps: "Avant l'embauche d'un salarié, quelles que soient la nature et la durée du contrat, l'employeur doit respecter plusieurs formalités. La principale est la déclaration préalable à l'embauche, adressée à l'Urssaf avant la mise au travail effective, au plus tôt 8 jours avant l'embauche, par Net-Entreprises ou sur le site de l'Urssaf pour une première embauche. Elle permet en une seule démarche l'immatriculation de l'employeur à la Sécurité sociale s'il s'agit d'une première embauche, l'affiliation à l'assurance chômage, l'adhésion à un service de santé au travail et la demande de visite d'information et de prévention. Une copie de la déclaration ou de l'accusé de réception doit être remise au salarié, ce qui est considéré comme fait si son contrat écrit mentionne l'organisme destinataire. L'employeur inscrit aussi le salarié sur le registre unique du personnel, obligatoire dès le premier salarié, et lui remet un contrat de travail écrit, à durée indéterminée ou déterminée. Aucune déclaration préalable n'est nécessaire pour une convention de stage.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr (Entreprendre), fiches « Embauche d'un salarié » et « DPAE »", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23107" },
      phraseGenerale: "La déclaration préalable à l'embauche se fait avant la mise au travail effective du salarié, dans un délai fixé par la règle. Ce délai peut changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-non-recours',
    titre: 'Nuance utile',
    fichesEntree: ['non-recours'],
    corps: "Le ministère des Solidarités explique que le non-recours est la conséquence de la complexité du système de prestations sociales ou d'un manque d'information : c'est un phénomène massif, aux conséquences sociales importantes. Il touche des prestations très diverses, comme le RSA, la prime d'activité ou le minimum vieillesse, où, selon la Drees, le non-recours atteint 34 % pour le RSA (un tiers des foyers éligibles), 48 % pour la prime d'activité et jusqu'à 50 % pour le minimum vieillesse. Les pouvoirs publics agissent par plusieurs leviers : la réforme de la solidarité à la source, qui simplifie les démarches pour le RSA et la prime d'activité, et l'expérimentation Territoires zéro non-recours, où des acteurs locaux repèrent, informent et accompagnent les personnes dans leurs droits : RSA, prime d'activité, chèque énergie, aides au logement, accès aux services publics. Ne pas demander un droit n'est donc pas un manque de la personne : le système lui-même est difficile à lire. Un travailleur social, une mission locale ou un point d'accueil France services peut aider à vérifier ses droits.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Ministère des Solidarités, page « Accès aux droits »", url: "https://solidarites.gouv.fr/solidarites/lutter-contre-la-pauvrete/acces-aux-droits" },
      phraseGenerale: "Le non-recours est massif : selon la Drees, une part importante des foyers éligibles au RSA, à la prime d'activité et au minimum vieillesse ne demande pas la prestation. Ces proportions évoluent : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-o2r',
    titre: 'Nuance utile',
    fichesEntree: ['o2r'],
    corps: "L'offre de repérage et de remobilisation est instituée par la loi pour le plein emploi pour aller à la rencontre des publics dits invisibles, avec une logique d'aller vers et d'adaptation aux besoins de chacun. Les freins peuvent être multiples : logement, santé, mobilité, maîtrise du français. Elle s'adresse aux personnes sans emploi qui ne sont pas accompagnées par le réseau pour l'emploi, par exemple celles sans contact depuis au moins 5 mois avec France Travail, une mission locale ou un Cap emploi. Elle est mise en œuvre par des opérateurs sélectionnés, qui travaillent avec le réseau pour l'emploi et les collectivités pour renforcer l'accès aux dispositifs d'accompagnement ou aux formations qualifiantes. Dans la phase de remobilisation, les bénéficiaires qui ne le sont pas déjà sont invités à s'inscrire à France Travail, pour être orientés vers un parcours. Les pages nationales ne disent pas comment trouver l'opérateur de son territoire : un conseiller de mission locale, de France Travail ou de la mairie peut renseigner.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Ministère du Travail, présentation de l'offre de repérage et de remobilisation", url: "https://travail-emploi.gouv.fr/loffre-de-reperage-et-de-remobilisation-o2r" },
      phraseGenerale: "L'offre s'adresse aux personnes sans emploi qui ne sont pas accompagnées par le réseau pour l'emploi, par exemple celles sans contact depuis un certain temps avec France Travail, une mission locale ou un Cap emploi. La durée retenue peut changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-atelier-sociolinguistique',
    titre: 'Nuance utile',
    fichesEntree: ['atelier-sociolinguistique'],
    corps: "Les ateliers sociolinguistiques sont des formations linguistiques à vocation d'intégration, financées par le ministère. Les documents officiels les associent à l'accès aux droits, au logement et à la santé, y compris pour des personnes en situation d'analphabétisme ou d'illettrisme, et à des publics comme les personnes réfugiées ou demandeuses d'asile. Ils apprennent le français à partir de situations de la vie quotidienne plutôt que par un cours classique. Il n'existe pas de procédure nationale unique d'inscription : l'offre dépend du territoire et des associations qui les animent. Le réseau des Carif-Oref prévoit de recenser l'offre de formation linguistique dans une cartographie nationale, qui doit intégrer à terme les ateliers sociolinguistiques. Une mairie, une association d'accompagnement des personnes migrantes, une mission locale ou un travailleur social peut orienter vers l'atelier le plus proche."
  },
  {
    id: 'second-niveau-levee-d-ecrou',
    titre: 'Nuance utile',
    fichesEntree: ['levee-d-ecrou'],
    corps: "La levée d'écrou est la formalité par laquelle l'administration pénitentiaire met fin à l'écrou d'une personne détenue. La date de sortie, ainsi que la décision ou le texte de loi qui motive la libération, sont notés sur l'acte d'écrou. Elle résulte d'une décision de libération ou de fin de peine : selon les cas, c'est le procureur de la République ou la juridiction de l'application des peines, par exemple pour une libération conditionnelle, qui décide. La sortie est ensuite organisée par le greffe pénitentiaire, qui remet à la personne son pécule libérable et, le cas échéant, un kit de sortie. Quand un suivi en milieu ouvert doit prendre le relais, le greffe lui remet une convocation indiquant la suite de la prise en charge. La personne n'a pas de démarche propre à faire pour obtenir sa levée d'écrou : c'est l'administration qui s'en charge. Le service pénitentiaire d'insertion et de probation peut accompagner la préparation de la sortie."
  },
  {
    id: 'second-niveau-indemnite-solidarite-nationale',
    titre: 'Nuance utile',
    fichesEntree: ['indemnite-solidarite-nationale'],
    corps: "L'indemnisation de solidarité nationale est le principal dispositif de l'État pour indemniser les pertes de récolte liées à des aléas climatiques exceptionnels. Elle intervient lorsque des seuils réglementaires de pertes sont atteints, ces seuils variant selon les cultures : à partir de 50 % de pertes de récolte pour les grandes cultures, les cultures industrielles, les légumes et la viticulture, et à partir de 30 % pour l'arboriculture, les petits fruits, les prairies et les cultures spécialisées. Elle concerne aussi bien les exploitants assurés que non assurés. Pour les surfaces non assurées, la demande se dépose auprès de la direction départementale des territoires. Pour les exploitants assurés, l'assureur verse l'indemnité pour le compte de l'État, en complément de l'indemnisation du contrat d'assurance multirisque climatique. Elle complète l'aide à l'assurance récolte, qui reste le principal outil de gestion du risque climatique.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Ministère de l'Agriculture, page « La gestion des risques en agriculture »", url: "https://agriculture.gouv.fr/la-gestion-des-risques-en-agriculture" },
      phraseGenerale: "L'indemnité n'est versée que lorsque des seuils de pertes de récolte sont atteints, ces seuils variant selon les cultures. Les seuils peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-france-services-agriculture',
    titre: 'Nuance utile',
    fichesEntree: ['france-services-agriculture'],
    corps: "France Services Agriculture est un guichet unique qui accompagne les porteurs de projet à l'installation et à la transmission d'exploitations agricoles. Il est ouvert à toute personne, issue ou non du milieu agricole, qui souhaite s'engager en agriculture ou transmettre son exploitation. Le parcours comporte deux niveaux. Au premier niveau, le point d'accueil départemental unique, tenu par la chambre d'agriculture, reçoit les personnes, les informe et les oriente vers les structures agréées en leur présentant la liste complète. Au second niveau, des structures agréées par l'État, selon un cahier des charges, assurent le conseil et l'accompagnement. Pour trouver le point d'accueil de son département, les pages nationales ne donnent pas d'annuaire : il faut s'adresser à la chambre d'agriculture."
  },
  {
    id: 'second-niveau-accueil-de-jour',
    titre: 'Nuance utile',
    fichesEntree: ['accueil-de-jour'],
    corps: "L'accueil de jour est un lieu ouvert en journée, sans hébergement, qui relève de la veille sociale, avec les maraudes et le 115. Selon le ministère des Solidarités, il offre un accueil inconditionnel et un espace pour se reposer et créer du lien social, en échangeant entre usagers ou avec des professionnels et des bénévoles. Il propose souvent des services pratiques indispensables aux personnes en grande précarité, comme l'accès aux droits et l'accompagnement dans les démarches. Il s'adresse en priorité aux personnes en très grande exclusion ou en situation d'urgence, notamment sans abri. Il n'existe pas de procédure nationale unique d'accès : on peut s'y rendre directement, et le SIAO, opérateur de service public pour l'orientation des personnes sans domicile, peut aussi intervenir. Un travailleur social, le 115 ou le centre communal d'action sociale indique les lieux ouverts près de chez soi."
  },
  {
    id: 'second-niveau-psad',
    titre: 'Nuance utile',
    fichesEntree: ['psad'],
    corps: "La plateforme de suivi et d'appui aux décrocheurs est, selon l'Éducation nationale, davantage un concept d'organisation qu'une structure juridique : c'est un mode de coordination des acteurs locaux de la formation, de l'orientation et de l'insertion des jeunes, adapté à chaque territoire. Sa mission est double : mettre en commun les informations pour repérer les jeunes sortis sans diplôme, et chercher les meilleures conditions pour les accompagner de façon personnalisée vers une formation ou une qualification. Elle est copilotée par le réseau des centres d'information et d'orientation et les missions locales, et accompagne les jeunes de 16 ans et plus repérés en rupture de parcours scolaire ou sans solution de formation ou d'insertion. Elle prend contact individuellement avec les jeunes repérés et envisage avec eux un retour en formation, un accompagnement vers l'emploi ou un dispositif du réseau de partenaires. Les pages nationales ne donnent pas de contact direct : on peut s'adresser à un centre d'information et d'orientation ou à la mission locale.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Ministère de l'Éducation nationale, page « La lutte contre le décrochage scolaire »", url: "https://www.education.gouv.fr/la-lutte-contre-le-decrochage-scolaire-455100" },
      phraseGenerale: "La plateforme accompagne les jeunes sortis du système scolaire sans diplôme ou sans solution, à partir d'un âge minimum fixé par les textes. Cet âge peut changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-creche-avip',
    titre: 'Nuance utile',
    fichesEntree: ['creche-avip'],
    corps: "Une crèche à vocation d'insertion professionnelle offre une solution d'accueil aux enfants de moins de 3 ans dont les parents sont demandeurs d'emploi et volontaires pour s'engager dans une recherche d'emploi intensive. Elle favorise la reprise d'emploi ou l'entrée en formation des parents, l'accès aux modes d'accueil et la socialisation de l'enfant. Le public éligible est tout parent de jeunes enfants inscrit à France Travail et engagé dans un parcours d'insertion. Une Caf cite ces situations : être demandeur d'emploi, percevoir le RSA, être demandeur d'emploi et parent isolé, ou résider dans un quartier prioritaire de la politique de la ville, ou être demandeur d'emploi de moins de 25 ans et sans diplôme. Le parent en recherche active est orienté vers une crèche, et un contrat de 6 mois, renouvelable une fois, est signé entre la crèche, les parents et le professionnel de l'insertion. L'accueil est assuré au minimum 10 heures par semaine. Quand le parent retrouve un emploi ou entre en formation, la place devient pérenne jusqu'à l'entrée en maternelle. Il n'existe pas d'annuaire national : un conseiller France Travail ou la Caf renseigne.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Caf, page « Le label crèche à vocation d'insertion professionnelle (AVIP) »", url: "https://www.caf.fr/professionnels/offres-et-services/caf-du-val-d-oise/partenaires-locaux/le-label-creche-vocation-d-insertion-professionnelle-avip" },
      phraseGenerale: "Les crèches à vocation d'insertion professionnelle accueillent les jeunes enfants de parents demandeurs d'emploi engagés dans une recherche intensive, dans le cadre d'un contrat de durée limitée avec un nombre minimal d'heures d'accueil par semaine. Ces conditions peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-declaration-de-ressources',
    titre: 'Démarche concrète',
    fichesEntree: ['declaration-de-ressources'],
    corps: "Les bénéficiaires du RSA, de la prime d'activité ou de l'allocation aux adultes handicapés doivent déclarer leurs ressources à la Caf tous les trois mois, depuis l'espace Mon compte du site caf.fr ou l'application mobile. La déclaration est pré-remplie pour tous les membres du foyer, et cette démarche permet d'éviter toute interruption des paiements. Pour la faire : se munir de ses bulletins de paie ou de ses relevés de prestations pour les 3 mois à déclarer ; se connecter à son espace et cliquer sur la notification de déclaration trimestrielle ; vérifier, pour chaque mois, que le montant pré-rempli est identique au montant net social indiqué sur ses documents ; compléter si besoin avec les ressources inconnues de la Caf (pension alimentaire, revenus perçus à l'étranger, revenus des travailleurs indépendants) ; valider. Les mois à déclarer sont indiqués dans la déclaration elle-même.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Caf, page « Déclaration de ressources RSA, AAH, prime d'activité : comment faire »", url: "https://www.caf.fr/allocataires/caf-de-loire-atlantique/offre-de-service/thematique-libre/declaration-de-ressources-rsa-aah-prime-d-activite-comment-faire" },
      phraseGenerale: "Les bénéficiaires du RSA, de la prime d'activité ou de l'allocation aux adultes handicapés déclarent leurs ressources à la Caf à intervalles réguliers, en ligne, pour éviter toute interruption de leurs paiements. Le rythme et la procédure peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-reste-a-vivre',
    titre: 'Nuance utile',
    fichesEntree: ['reste-a-vivre'],
    corps: "Le ministère des Solidarités définit le reste à vivre comme la différence arithmétique, pour un ménage, entre l'ensemble de ses ressources et l'ensemble de ses dépenses contraintes ou pré-engagées. C'est une vision soustractive : la part des ressources qui reste une fois payées les charges contraintes ou indispensables. Le Conseil national des politiques de lutte contre la pauvreté et l'exclusion sociale précise que, même si beaucoup d'acteurs sociaux publics ou privés l'utilisent, la notion n'a pas de définition officielle unique en France. Dans les textes sur le logement et sur le surendettement, il désigne la part des ressources qui doit rester à une personne ou un ménage pour assumer ses dépenses essentielles, quelle que soit sa situation débitrice. Il n'existe pas de procédure nationale pour le calculer ou le faire prendre en compte : le calcul dépend du contexte et des règles applicables (surendettement, logement, aides sociales). Une aide sociale ou un point conseil budget peut aider à le faire."
  },
  {
    id: 'second-niveau-obligation-de-formation',
    titre: 'Nuance utile',
    fichesEntree: ['obligation-de-formation'],
    corps: "L'obligation de formation concerne les jeunes de 16 à 18 ans, qu'ils soient « décrocheurs » sans qualification ou titulaires d'un diplôme mais sans emploi ni formation. Elle est entrée en vigueur à la rentrée de septembre 2020. Selon le ministère de l'Éducation nationale, elle est remplie quand le jeune poursuit sa scolarité dans un établissement public ou privé, est apprenti ou stagiaire de la formation professionnelle, occupe un emploi, effectue un service civique, ou bénéficie d'un dispositif d'accompagnement ou d'insertion sociale et professionnelle. Le contrôle du respect de l'obligation est confié aux missions locales. Le ministère indique un numéro gratuit dédié aux jeunes de 16 à 18 ans qui ne sont ni en études, ni en formation, ni en emploi : 0 800 122 500.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Ministère de l'Éducation nationale, page « L'obligation de formation »", url: "https://eduscol.education.gouv.fr/5301/l-obligation-de-formation" },
      phraseGenerale: "L'obligation de formation concerne les jeunes mineurs qui ne sont ni en études, ni en formation, ni en emploi : elle est remplie par une scolarité, un apprentissage, un emploi, un service civique ou un parcours d'accompagnement. Les missions locales en contrôlent le respect, et le ministère indique un numéro gratuit. Ce numéro et l'âge concerné peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-francais-a-visee-professionnelle',
    titre: 'Nuance utile',
    fichesEntree: ['francais-a-visee-professionnelle'],
    corps: "Le français à visée professionnelle est une formation linguistique tournée vers les besoins de la vie au travail. Une offre du catalogue de France Travail se donne pour but de renforcer les compétences en français oral et écrit dans un contexte professionnel, et de s'approprier le vocabulaire lié à l'emploi, aux métiers et aux démarches administratives. Ces formations peuvent travailler le vocabulaire des métiers, la compréhension des consignes, la lecture des offres d'emploi, la rédaction d'un CV et d'une lettre de motivation, la préparation aux entretiens et les codes de communication dans l'entreprise. L'offre citée vise notamment les bénéficiaires de la protection internationale et les primo-arrivants. Il n'existe pas de définition nationale unique ni de conditions d'accès communes : elles varient selon la formation. Pour la financer, on demande un devis à l'organisme de formation et on se renseigne sur les aides de la région ou de France Travail, auprès de son conseiller."
  },
  {
    id: 'second-niveau-taxe-d-apprentissage-habilitation',
    titre: 'Nuance utile',
    fichesEntree: ['taxe-d-apprentissage-habilitation'],
    corps: "La taxe d'apprentissage comporte une part principale, qui finance l'apprentissage, et un solde, destiné aux formations technologiques et professionnelles initiales hors apprentissage et à l'insertion professionnelle. Seuls les organismes inscrits sur les listes officielles d'établissements habilités peuvent recevoir ce solde. Ces listes sont fixées chaque année par arrêté interministériel pour la liste nationale et par arrêtés préfectoraux pour les listes régionales. Selon le ministère de l'Éducation nationale, les établissements concernés comprennent notamment les établissements publics d'enseignement secondaire, certains établissements privés à but non lucratif, les établissements d'enseignement supérieur, certains organismes de formation professionnelle, les écoles de la deuxième chance et certains organismes d'insertion des jeunes. La demande se fait sur la plateforme SOLTéA, qui permet de déposer le dossier à destination des services de l'État et des conseils régionaux. Chaque année, les établissements, déjà habilités ou non, doivent redéposer une demande pour figurer sur une liste régionale."
  },
  {
    id: 'second-niveau-aide-exceptionnelle-embauche-apprenti',
    titre: 'Nuance utile',
    fichesEntree: ['aide-exceptionnelle-embauche-apprenti'],
    corps: "Il faut distinguer l'aide unique à l'apprentissage et l'aide exceptionnelle : leur montant dépend de la date de conclusion du contrat, de l'effectif de l'entreprise et du niveau de diplôme préparé. Pour les contrats conclus depuis le 8 mars 2026, l'État verse, dans une entreprise de moins de 250 salariés, 5 000 € pour un diplôme jusqu'au niveau 4 (aide unique), 4 500 € pour le niveau 5, et 2 000 € jusqu'au niveau 7. Dans une entreprise de 250 salariés et plus, ces montants sont de 2 000 €, 1 500 € et 750 €. Pour un apprenti en situation de handicap, l'aide peut atteindre 6 000 €. Elle n'est versée que pour la première année du contrat, chaque mois, dans la limite de 12 mois, et elle est proratisée si le contrat dure moins longtemps ou s'il est rompu. L'employeur n'a aucune demande particulière à faire : il déclare l'embauche dans la déclaration sociale nominative et transmet le contrat à son opérateur de compétences, qui le fait suivre à l'Agence de services et de paiement. Les règles changent souvent : il faut vérifier la version qui correspond à la date exacte du contrat.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Service-public.fr (Entreprendre), fiche « Aides à l'embauche en contrat d'apprentissage »", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23556" },
      phraseGenerale: "L'État aide les employeurs qui embauchent un apprenti, avec un montant qui dépend de la date du contrat, de la taille de l'entreprise et du niveau de diplôme préparé. L'aide est versée automatiquement, sans demande, pendant la première année du contrat. Ces montants changent souvent : consultez la source officielle pour la date exacte du contrat."
    }
  },
  {
    id: 'second-niveau-garantie-de-pret',
    titre: 'Nuance utile',
    fichesEntree: ['garantie-de-pret'],
    corps: "Selon le ministère de l'Économie, une garantie bancaire sert à couvrir une partie de la perte finale du prêteur, banque ou organisme de financement, en cas de défaillance de l'emprunteur, moyennant une commission. Elle facilite l'obtention d'un prêt et limite les garanties personnelles demandées à l'entrepreneur. Bpifrance propose deux dispositifs. La garantie création couvre les prêts des nouveaux entrepreneurs, à hauteur de 50 à 60 % de leur montant : 60 % pour une création ou une intervention conjointe avec la Région, 50 % pour les autres projets. La garantie transmission couvre les prêts des porteurs d'un projet de reprise d'entreprise, à hauteur de 50 à 70 %, la quotité haute correspondant à une intervention conjointe de la Région. Ce n'est pas une subvention versée à l'entrepreneur : elle protège la banque, et la demande passe par la banque, qui évoque cette possibilité lors de l'étude du prêt.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Ministère de l'Économie, page « Création ou reprise d'entreprise : quelles sont les garanties à votre disposition ? »", url: "https://www.economie.gouv.fr/entreprises/creer-une-entreprise/creation-ou-reprise-dentreprise-quelles-sont-les-garanties-votre" },
      phraseGenerale: "Bpifrance garantit une partie des prêts bancaires accordés aux personnes qui créent ou reprennent une entreprise, ce qui protège la banque en cas de défaillance. Ce n'est pas une subvention. La part garantie varie selon le dispositif et l'intervention éventuelle de la Région, et peut changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-index-egalite-professionnelle',
    titre: 'Nuance utile',
    fichesEntree: ['index-egalite-professionnelle'],
    corps: "L'index de l'égalité professionnelle mesure les écarts entre les femmes et les hommes dans les entreprises et sert à faire progresser l'égalité salariale. Il est noté sur 100 points. Toutes les entreprises, y compris les associations et les syndicats, et les unités économiques et sociales reconnues d'au moins 50 salariés doivent le calculer et le publier chaque année au plus tard le 1er mars, au titre de l'année précédente. Parmi les employeurs publics, seuls certains établissements publics employant au moins 50 salariés en droit privé sont concernés, pas les collectivités territoriales. L'entreprise calcule l'index, déclare les résultats sur le site Egapro, les publie sur son site internet et les communique au comité social et économique. Un index inférieur à 75 points oblige à définir des mesures de correction ; un index inférieur à 85 points oblige à fixer des objectifs de progression.",
    suivi: {
      verifieLe: "2026-11-05",
      source: { nom: "Ministère du Travail, site Egapro, aide au calcul et à la publication de l'index", url: "https://egapro.travail.gouv.fr/aide-index" },
      phraseGenerale: "L'index de l'égalité professionnelle doit être calculé, publié et déclaré chaque année par les entreprises au-dessus d'une certaine taille, avant une date limite. Un résultat insuffisant oblige à des mesures de correction ou à des objectifs de progression. La taille, la date et les seuils peuvent changer : consultez la source officielle."
    }
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
  },
  {
    id: 'second-niveau-compte-professionnel-de-prevention-seuils',
    titre: "Les six facteurs et leurs seuils",
    fichesEntree: ['compte-professionnel-de-prevention', 'travail-de-nuit'],
    corps: "Pour compter, l'exposition doit dépasser un seuil, mesuré après les protections collectives et individuelles mises en place par l'employeur. Travail de nuit : au moins 1 heure de travail entre minuit et 5 heures, pendant 100 nuits par an. Travail en équipes successives alternantes (5x8, 3x8) : au moins 1 heure de travail entre minuit et 5 heures, pendant 30 nuits par an. Travail répétitif, à une fréquence élevée et sous cadence contrainte : 15 actions techniques ou plus pour un temps de cycle de 30 secondes au plus, ou 30 actions techniques ou plus par minute pour un temps de cycle plus long ou variable, pendant 900 heures par an. Températures extrêmes : 5 °C ou moins, ou 30 °C ou plus, pendant 900 heures par an. Bruit : au moins 81 décibels sur une journée de 8 heures pendant 600 heures par an, ou des bruits brefs et répétés d'au moins 135 décibels, 120 fois par an. Milieu hyperbare : une pression d'au moins 1 200 hectopascals, pour 60 interventions ou travaux par an.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, fiche « Compte professionnel de prévention (C2P) »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F15504" },
      phraseGenerale: "Chacun des facteurs pris en compte (travail de nuit, équipes successives alternantes, travail répétitif, températures extrêmes, bruit, milieu hyperbare) n'ouvre de droits que si l'exposition dépasse un seuil d'intensité et de durée, mesuré après les protections mises en place par l'employeur. Les seuils peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-compte-professionnel-de-prevention-se-former',
    titre: "Se former avec ses points",
    fichesEntree: ['compte-professionnel-de-prevention', 'cpf'],
    corps: "Pour une formation, 1 point vaut 500 € de prise en charge. Pour savoir combien de points mobiliser, on divise le reste à payer (le coût de la formation moins les autres droits déjà utilisés, comme le CPF) par 500, en arrondissant au nombre entier supérieur : un reste à payer de 1 500 € demande 3 points. Les points complètent le CPF, ou financent seuls la formation si la personne n'a plus de droits. La formation doit permettre d'accéder à un emploi non exposé ou moins exposé aux facteurs de risques. Les 20 premiers points sont réservés à la formation ou à la reconversion (aucun point réservé pour une personne née avant le 1er janvier 1960, 10 points pour une personne née entre le 1er janvier 1960 et le 31 décembre 1962). Démarche : se faire accompagner par un conseiller en évolution professionnelle, qui remet une attestation ; choisir la formation sur Mon Compte Formation et laisser le dossier à l'état « Devis à valider » ; réserver les points sur l'espace personnel du compte professionnel de prévention et télécharger le récépissé ; envoyer la demande avec le numéro de dossier et les justificatifs, au moins 25 jours ouvrés avant la date limite de validation du dossier de formation. La conversion des points en euros n'est pas automatique.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Mon Compte Formation, page « Le Compte Professionnel de Prévention (C2P) »", url: "https://www.moncompteformation.gouv.fr/espace-public/le-compte-professionnel-de-prevention-c2p-1" },
      phraseGenerale: "Les points du compte professionnel de prévention peuvent financer une formation qui mène à un emploi non exposé ou moins exposé, en complément du compte personnel de formation ou seuls. La démarche passe par un conseiller en évolution professionnelle, la réservation des points sur l'espace personnel du compte, puis une demande avant la validation du dossier de formation. La valeur d'un point, la part réservée à la formation et les délais peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-compte-professionnel-de-prevention-temps-partiel-retraite',
    titre: "Temps partiel et retraite anticipée",
    fichesEntree: ['compte-professionnel-de-prevention'],
    corps: "Temps partiel sans perte de salaire : les points s'utilisent par groupe de 10, dans la limite de 80 points avant 60 ans. La personne définit avec son employeur un temps de travail compris entre 20 % et 80 % de la durée applicable dans l'établissement ; l'employeur maintient la rémunération et l'organisme gestionnaire le rembourse. Dix points compensent 4 mois d'un mi-temps. Il faut une attestation de points disponibles, l'accord de l'employeur, une demande en ligne sur l'espace personnel, puis un avenant au contrat de travail dont une copie parvient à l'Assurance Maladie au moins 1 mois avant le début du temps partiel. Retraite anticipée : à partir de 55 ans, 10 points donnent 1 trimestre de majoration de durée d'assurance vieillesse, jusqu'à 8 trimestres, ce qui peut avancer le départ de 2 ans au plus par rapport à l'âge légal, même en cumulant avec d'autres dispositifs comme la retraite anticipée pour carrière longue. Le compte est clos au départ en retraite.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Ameli, dossier « Compte professionnel de prévention »", url: "https://www.ameli.fr/assure/droits-demarches/vie-professionnelle-retraite/emploi-salarie/compte-professionnel-de-prevention" },
      phraseGenerale: "Les points du compte professionnel de prévention peuvent financer un temps partiel sans perte de salaire, avec l'accord de l'employeur, ou des trimestres de majoration de durée d'assurance pour partir plus tôt à la retraite, à partir d'un certain âge et dans la limite d'un nombre de trimestres. Les barèmes, les plafonds et les âges peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-compte-professionnel-de-prevention-employeur',
    titre: "Ce que doit faire l'employeur",
    fichesEntree: ['compte-professionnel-de-prevention', 'travail-de-nuit'],
    corps: "L'employeur doit évaluer chaque année l'exposition de chaque salarié dont le contrat dure au moins 1 mois, quel que soit le type de contrat : dans les conditions habituelles de travail, en moyenne sur l'année et après prise en compte des protections collectives et individuelles. Il déclare ensuite les salariés exposés au-delà d'un seuil dans la déclaration sociale nominative (DSN), à partir de laquelle le compte est ouvert et alimenté automatiquement. La période déclarée est celle du contrat, et non celle de l'exposition réelle. Un salarié peut contester la déclaration, ou son absence : il écrit d'abord à son employeur par un moyen qui prouve la date ; l'employeur a 2 mois pour répondre, et sans réponse la demande est refusée. Le salarié peut alors, dans un délai de 2 mois, saisir la caisse de retraite (Carsat, Cramif ou MSA), puis le tribunal.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, fiche « Compte professionnel de prévention (C2P) »", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F15504" },
      phraseGenerale: "L'employeur évalue chaque année l'exposition de ses salariés aux facteurs de risques, au-delà d'un seuil, et la déclare dans la déclaration sociale nominative ; le compte du salarié est alors ouvert et alimenté sans démarche de sa part. Un salarié qui conteste la déclaration, ou son absence, écrit d'abord à son employeur, puis peut saisir la caisse de retraite, dans des délais fixés. Ces règles et ces délais peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-periode-de-reconversion',
    titre: "Exemples concrets",
    fichesEntree: ['periode-de-reconversion'],
    corps: "Exemple : un salarié en CDD n'avait pas accès à la Pro-A (réservée aux salariés en CDI) ; la période de reconversion, ouverte à tous les salariés, lui est accessible. Elle peut se faire en interne (autre poste dans la même entreprise) ou en externe. Le financement vient de l'Opco, à hauteur de 9,15 € de l'heure si la branche n'a rien fixé (décret du 28 janvier 2026).",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Un nouveau dispositif pour faciliter la reconversion des salariés »", url: "https://entreprendre.service-public.gouv.fr/actualites/A18798" },
      phraseGenerale: "Un salarié en contrat à durée déterminée n'avait pas accès à l'ancien dispositif, réservé aux contrats à durée indéterminée ; la période de reconversion, ouverte à tous les salariés, lui est accessible. Elle peut se faire en interne ou en externe, avec un financement de l'opérateur de compétences dont le montant peut changer."
    }
  },
  {
    id: 'second-niveau-passeport-de-competences',
    titre: "Exemples concrets",
    fichesEntree: ['passeport-de-competences'],
    corps: "Le dispositif a été ouvert en version bêta au printemps 2023 ; la loi pour le plein emploi de 2023 l'a élargi aux compétences acquises hors du cadre professionnel : une personne qui a été bénévole dans une association pendant plusieurs années peut le faire apparaître et en tirer des compétences à valoriser sur un CV.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Le Passeport de compétences, un nouvel outil pour suivre et valoriser votre parcours professionnel »", url: "https://www.service-public.gouv.fr/particuliers/actualites/A18976" },
      phraseGenerale: "Le Passeport de compétences reconnaît aussi les compétences acquises hors du cadre professionnel : une personne qui a été bénévole dans une association pendant plusieurs années peut le faire apparaître et en tirer des compétences à valoriser sur un CV."
    }
  },
  {
    id: 'second-niveau-demarchage-telephonique',
    titre: "Cas pratique",
    fichesEntree: ['demarchage-telephonique'],
    corps: "Une personne en recherche d'emploi reçoit un appel d'un organisme qui promet de financer une formation avec son CPF en échange de ses données. Depuis le 11 août 2026, un appel commercial non sollicité est interdit, sauf pour un contrat en cours ou avec l'accord préalable de la personne. Dans le doute, mieux vaut raccrocher et vérifier l'organisme sur son site officiel avant de donner la moindre information personnelle.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Démarchage téléphonique interdit : quelles sont les nouvelles règles ? »", url: "https://www.service-public.gouv.fr/particuliers/actualites/A19003" },
      phraseGenerale: "Une personne en recherche d'emploi reçoit un appel d'un organisme qui promet de financer une formation avec son CPF en échange de ses données. Un appel commercial non sollicité est désormais encadré par la loi ; dans le doute, mieux vaut raccrocher et vérifier l'organisme sur son site officiel avant de donner la moindre information personnelle."
    }
  },
  {
    id: 'second-niveau-rupture-conventionnelle-chomage',
    titre: "Ce qui change pour le chômage après une rupture conventionnelle",
    fichesEntree: ['rupture-conventionnelle'],
    corps: "Depuis le 1er septembre 2026, la durée maximale d'indemnisation chômage après une rupture conventionnelle individuelle est plus courte : 15 mois pour les moins de 55 ans (18 mois auparavant), 20,5 mois pour les 55 ans et plus (auparavant 22,5 mois pour les 55 et 56 ans, et 27 mois à partir de 57 ans). Pour les résidents d'outre-mer, hors Mayotte, la durée est de 20 mois pour les moins de 55 ans (24 mois auparavant) et de 30 mois pour les 55 ans et plus (36 mois auparavant à partir de 57 ans). Ces durées s'appliquent aux salariés dont le contrat est effectivement rompu à compter du 1er septembre 2026. Elles viennent d'une loi qui transpose l'avenant n° 3 du 25 février 2026 à l'accord sur l'assurance chômage ; des textes d'application sont encore en attente. Mayotte n'est pas concernée.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Rupture conventionnelle : ce qui change au 1er septembre 2026 » (publiée le 12 juin 2026, mise à jour le 2 septembre 2026)", url: "https://www.service-public.gouv.fr/particuliers/actualites/A18945" },
      phraseGenerale: "La durée maximale d'indemnisation chômage après une rupture conventionnelle individuelle a été raccourcie par une loi récente, avec des durées différentes selon l'âge et selon le lieu de résidence. Ces durées et les textes d'application peuvent évoluer : consultez la source officielle pour les valeurs à jour."
    }
  },
  {
    id: 'second-niveau-arret-travail-plafonds',
    titre: "Qui peut prolonger un arrêt, et jusqu'à quand",
    fichesEntree: ['arret-de-travail-indemnites-journalieres'],
    corps: "Pour les arrêts prescrits ou prolongés à partir du 1er septembre 2026, le premier arrêt ne peut pas dépasser 31 jours et chaque prolongation 62 jours (décret n° 2026-498 du 12 juin 2026 ; règle non applicable à Mayotte). Les prescripteurs concernés sont les médecins, les sages-femmes et les chirurgiens-dentistes. Une prolongation au-delà de ces durées reste possible si l'état de santé de la personne le nécessite, en tenant compte des recommandations de la Haute Autorité de santé quand elles existent. Elle peut être faite par le médecin qui a prescrit l'arrêt initial, le médecin traitant, la sage-femme ou le chirurgien-dentiste. Une prolongation par téléconsultation est possible, mais seulement dans les conditions strictes de l'article L6316-1 du code de la santé publique.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « La durée des arrêts de travail plafonnée depuis le 1er septembre » (publiée le 16 juin 2026, mise à jour le 1er septembre 2026)", url: "https://www.service-public.gouv.fr/particuliers/actualites/A18962" },
      phraseGenerale: "La durée d'un arrêt de travail et celle de chaque prolongation sont désormais plafonnées, avec la possibilité de prolonger au-delà si l'état de santé le nécessite. Les plafonds et les professionnels qui peuvent prolonger peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-visite-de-reprise-precisions',
    titre: "Préreprise et reprise : qui peut demander quoi",
    fichesEntree: ['visite-de-reprise'],
    corps: "La visite de préreprise n'est pas obligatoire : elle prépare le retour pendant l'arrêt. Elle peut être demandée par le médecin du travail, le médecin traitant, le médecin conseil des organismes de sécurité sociale ou le salarié lui-même, et tout salarié en arrêt de plus de 30 jours a le droit de la demander. À son issue, le médecin peut demander des adaptations ou des aménagements du poste, des préconisations de reclassement ou la mise en place de formations. Depuis un décret du 12 juin 2026 (pour les arrêts délivrés à partir du 15 juin 2026), le service de prévention et de santé au travail informe l'employeur de l'organisation d'une visite de préreprise, même sans recommandation du médecin du travail ; le salarié peut s'y opposer. La visite de reprise est faite par le médecin du travail le jour de la reprise ou dans les 8 jours qui suivent ; c'est à l'employeur d'en demander la date. Elle n'est plus requise, sauf demande du médecin du travail, de l'employeur ou du salarié, si le salarié a eu une visite de préreprise dans les 30 jours précédant sa reprise et que le médecin y a indiqué qu'aucune mesure d'aménagement n'était nécessaire.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « De nouvelles modalités pour les visites de préreprise et de reprise » (18 juin 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18964" },
      phraseGenerale: "La visite de préreprise prépare le retour d'un salarié en arrêt et n'est pas obligatoire. La visite de reprise est faite par le médecin du travail à la reprise, sauf cas de dispense prévus par un décret récent. Les conditions et les délais peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-reclassement-avis-medecin',
    titre: "Cas pratique : le poste proposé ne convient pas aux recommandations du médecin",
    fichesEntree: ['reclassement'],
    corps: "Un salarié déclaré inapte refuse le poste de reclassement proposé, parce qu'il le juge incompatible avec les recommandations du médecin du travail. L'employeur le licencie pour inaptitude et impossibilité de reclassement. Par un arrêt du 22 octobre 2025, la Cour de cassation a confirmé que l'employeur avait manqué à son obligation de reclassement : quand le salarié conteste la compatibilité du poste, l'employeur doit solliciter à nouveau l'avis du médecin du travail avant de le licencier.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Inaptitude : un nouvel avis médical est exigé si le salarié refuse le reclassement proposé » (8 décembre 2025)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18681" },
      phraseGenerale: "Quand un salarié déclaré inapte conteste que le poste de reclassement proposé soit compatible avec les recommandations du médecin du travail, l'employeur doit demander à nouveau l'avis de ce médecin avant de le licencier, selon la Cour de cassation. Cette jurisprudence peut évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-cpf-changements-recents',
    titre: "Les changements récents du CPF",
    fichesEntree: ['cpf'],
    corps: "Quatre changements à connaître. 1. La participation obligatoire du titulaire passe à 150 € (décret du 30 mars 2026), contre 103,20 € au 1er janvier 2026. Elle s'applique aux demandes à partir d'avril 2026 : une page de Service Public indique le 2 avril, une autre le 6 avril. Elle ne s'applique pas aux demandeurs d'emploi, ni quand l'employeur abonde la formation, ni quand la personne mobilise des points de son compte professionnel de prévention, ni en cas d'abondement pour accident du travail ou maladie professionnelle ; l'employeur peut la rembourser sans y être obligé. 2. Des plafonds de prise en charge s'appliquent depuis le 26 février 2026 (voir la fiche « Les plafonds du CPF depuis 2026 »). 3. La loi du 25 juin 2026 contre les fraudes sociales et fiscales renforce l'encadrement : en cas d'absence non justifiée à l'examen de certification, un remboursement individuel est demandé au titulaire, et les organismes de formation doivent publier leurs taux de réussite. 4. La loi de finances pour 2026 supprime l'aide au permis de conduire pour les alternants et les salariés ; l'employeur peut financer le permis via le plan de développement des compétences si la conduite est nécessaire au poste.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « CPF : la participation forfaitaire obligatoire augmente » (9 janvier 2026, mise à jour le 2 avril 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A17364" },
      phraseGenerale: "Le compte personnel de formation a connu plusieurs changements récents : une participation obligatoire à la charge du titulaire, avec des cas d'exemption, des plafonds de prise en charge pour certaines formations et un encadrement renforcé contre la fraude. Les montants et les dates peuvent évoluer : consultez la source officielle pour les valeurs à jour."
    }
  },
  {
    id: 'second-niveau-abondement-cpf-conditions',
    titre: "Deux conditions qui se cumulent",
    fichesEntree: ['abondement-cpf'],
    corps: "Dans une entreprise de plus de 50 salariés, l'abondement du CPF en cas de défaut d'entretien professionnel suppose deux conditions réunies : ne pas avoir eu l'entretien obligatoire pendant la durée de référence (8 ans, et 6 ans au moment de l'affaire jugée) ET ne pas avoir suivi au moins une formation non obligatoire. Par un arrêt du 21 janvier 2026, la Cour de cassation a rappelé que ces conditions sont cumulatives : l'absence d'entretien ne suffit pas, et un salarié qui a suivi une formation non obligatoire n'a pas droit à l'abondement. L'entretien prévu tous les 2 ans s'appelle désormais « entretien de parcours professionnel ».",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « L'absence d'entretien obligatoire conduit-elle à un abondement sur le CPF ? » (2 février 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18781" },
      phraseGenerale: "L'abondement du compte personnel de formation en cas de défaut d'entretien professionnel suppose que deux conditions soient réunies en même temps : l'absence d'entretien obligatoire et l'absence de toute formation non obligatoire suivie. Les durées et les seuils d'effectif peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-contrat-apprentissage-aides-formalites',
    titre: "Aides et formalités de l'employeur",
    fichesEntree: ['contrat-d-apprentissage'],
    corps: "Côté employeur, trois repères. Pour les contrats conclus du 1er janvier au 7 mars 2026, l'aide est de 5 000 € pour une entreprise de moins de 250 salariés (6 000 € pour un apprenti en situation de handicap), versée la première année et pour un diplôme de niveau 4 (bac) ou moins. Pour les contrats conclus à partir du 8 mars 2026 et commençant avant le 1er janvier 2027, de nouveaux montants fixés par le décret du 6 mars 2026 s'appliquent : voir la page officielle. Depuis le décret du 31 octobre 2025, l'aide du premier et du dernier mois est calculée au prorata des jours pour les contrats de moins d'un an ou rompus avant leur terme. Enfin, la loi du 26 mai 2026 de simplification de la vie économique supprime la déclaration préalable de l'employeur « prendre les mesures nécessaires à l'organisation de l'apprentissage » et l'obligation de garantir que l'équipement et les conditions de travail permettent une formation satisfaisante : la conclusion du contrat suffit.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Recrutement d'un apprenti : ce qui change » (31 décembre 2025, mise à jour le 1er juin 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A17983" },
      phraseGenerale: "L'aide à l'embauche d'un apprenti a changé plusieurs fois récemment : son montant dépend de la date de conclusion du contrat, et l'aide du premier et du dernier mois est calculée au prorata des jours dans certains cas. Les formalités de l'employeur ont aussi été allégées par une loi de simplification. Les montants et les dates peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-periode-essai-grossesse',
    titre: "Rupture de la période d'essai et grossesse : à qui revient la preuve",
    fichesEntree: ['periode-essai'],
    corps: "Une salariée annonce sa grossesse après le renouvellement de sa période d'essai, et l'employeur rompt l'essai deux mois plus tard. La cour d'appel exigeait que la salariée prouve la discrimination. Par un arrêt du 25 mars 2026, la Cour de cassation a jugé que, puisque la rupture est intervenue après que l'employeur a connu la grossesse, c'est à l'employeur de montrer au juge que sa décision repose sur des éléments objectifs, sans lien avec la grossesse. Précision officielle : en dehors de ce cas, une rupture de période d'essai suit le régime ordinaire de preuve, où c'est au salarié de démontrer l'existence d'une discrimination.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Rupture de la période d'essai et grossesse : une jurisprudence change la donne » (14 avril 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18876" },
      phraseGenerale: "Quand l'employeur rompt la période d'essai d'une salariée après avoir su qu'elle était enceinte, c'est à lui de montrer au juge que sa décision repose sur des éléments objectifs, sans lien avec la grossesse, selon la Cour de cassation. Dans les autres cas de rupture de période d'essai, c'est au salarié de démontrer la discrimination. Cette jurisprudence peut évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-licenciement-grossesse-tardive',
    titre: "Annoncer sa grossesse tardivement",
    fichesEntree: ['licenciement'],
    corps: "Une salariée du secteur de la chimie, exposée à des produits dangereux, annonce sa grossesse près de 5 mois après l'avoir apprise et est licenciée pour faute grave. Par un arrêt du 3 juin 2026, la Cour de cassation rappelle qu'une femme n'a pas à révéler son état de grossesse à son employeur : informer tardivement n'est pas une faute grave, même quand la salariée est exposée à un risque pour sa santé, et un licenciement prononcé pour cette raison est nul.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Un employeur peut-il licencier une salariée qui ne lui a pas indiqué qu'elle était enceinte ? » (9 juin 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18951" },
      phraseGenerale: "Selon la Cour de cassation, une femme n'a pas à révéler sa grossesse à son employeur : informer tardivement n'est pas une faute grave, même en cas d'exposition à un risque, et un licenciement prononcé pour cette raison est nul. Cette jurisprudence peut évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-cdd-rupture-sans-motif',
    titre: "Rupture anticipée sans motif : ce que dit la Cour de cassation",
    fichesEntree: ['cdd'],
    corps: "Un salarié en CDD est congédié quelques mois après la fin de sa période d'essai, par une lettre qui ne contient aucun motif ; l'employeur soutient que la rupture est intervenue pendant une période d'essai prolongée. Par un arrêt du 9 avril 2026, la Cour de cassation rappelle qu'une rupture anticipée en dehors des cas prévus par la loi est abusive : l'employeur est condamné à verser des dommages et intérêts au moins égaux aux rémunérations que le salarié aurait perçues jusqu'au terme du contrat.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Dans quels cas une rupture de CDD peut-elle être considérée comme abusive ? » (4 mai 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18894" },
      phraseGenerale: "Selon la Cour de cassation, une rupture anticipée de contrat à durée déterminée en dehors des cas prévus par la loi est abusive et ouvre droit à des dommages et intérêts au moins égaux aux rémunérations restant à courir jusqu'au terme du contrat. Cette jurisprudence peut évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-conge-supplementaire-naissance-repere',
    titre: "Le congé supplémentaire de naissance",
    fichesEntree: ['conge-maternite-paternite'],
    corps: "Depuis le 1er juillet 2026, chaque parent d'un enfant né ou adopté à partir du 1er janvier 2026 peut prendre 1 à 2 mois de congé supplémentaire de naissance, en plus de la maternité, de la paternité et accueil de l'enfant ou de l'adoption. C'est un droit individuel, qui ne se transfère pas à l'autre parent ; il peut être pris en même temps ou en alternance, fractionné en 2 périodes d'un mois, et doit commencer dans les 9 mois suivant la naissance ou l'arrivée de l'enfant, après les autres congés. Dans le secteur privé, il est indemnisé par la Sécurité sociale : 70 % du salaire plafonné le 1er mois, 60 % le 2e. Voir la fiche « Congé supplémentaire de naissance » pour le détail des démarches.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Entrée en vigueur du congé supplémentaire de naissance : quelles sont les modalités pratiques ? » (3 juin 2026, mise à jour le 23 juin 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18939" },
      phraseGenerale: "Un congé supplémentaire de naissance, indemnisé, s'ajoute pour chaque parent aux congés de maternité, de paternité et d'accueil de l'enfant, ou d'adoption. C'est un droit individuel qui ne se transfère pas. La durée, les délais et le taux d'indemnisation peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-discrimination-embauche-entretien',
    titre: "L'âge et l'entretien : ce que dit la loi",
    fichesEntree: ['discrimination-embauche'],
    corps: "Le code du travail (article L1132-1) interdit d'écarter une personne d'une procédure de recrutement à cause de son âge. Une différence de traitement fondée sur l'âge n'est cependant pas une discrimination quand elle est objectivement et raisonnablement justifiée par un but légitime, comme la préservation de la santé ou de la sécurité du travailleur ou le soutien à son insertion professionnelle (article L1133-2). Autre repère : une évaluation de salarié peut porter sur des éléments de personnalité, mais seulement pour apprécier ses facultés d'adaptation, son aptitude à s'intégrer à une équipe et à l'animer et son potentiel d'évolution. La justice a jugé illicite un dispositif qui évaluait notamment l'« honnêteté » ou le « bon sens », et la Cour de cassation a approuvé cette décision : un entretien individuel doit reposer sur des critères précis, objectifs et pertinents.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Peut-on demander l'âge du candidat lors d'un entretien d'embauche ? » (9 juin 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18949" },
      phraseGenerale: "La loi interdit d'écarter une personne d'une procédure de recrutement à cause de son âge, avec des exceptions justifiées par un but légitime. Une évaluation de salarié ne peut porter sur la personnalité que pour apprécier l'adaptation, l'aptitude à s'intégrer à une équipe et le potentiel d'évolution, avec des critères précis, objectifs et pertinents. Ces règles peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-tese-saisonniers',
    titre: "Ce que le dispositif change pour un contrat saisonnier",
    fichesEntree: ['tese'],
    corps: "Avec le Tese, l'employeur fait en une seule démarche en ligne la déclaration préalable à l'embauche et le contrat de travail, puis une seule déclaration pour le prélèvement à la source de l'impôt et pour les organismes de protection sociale (Sécurité sociale, assurance chômage, retraite complémentaire). À partir de ces déclarations, le compte Tese produit les bulletins de paie, le calcul des cotisations et contributions obligatoires, le calcul de l'impôt sur le revenu et la déclaration sociale nominative. L'Urssaf rappelle ce service aux employeurs de saisonniers et d'extras en période estivale."
  },
  {
    id: 'second-niveau-duerp-sanctions',
    titre: "Les sanctions renforcées par la loi du 25 juin 2026",
    fichesEntree: ['duerp'],
    corps: "La loi du 25 juin 2026 contre les fraudes sociales et fiscales (article 48) renforce les sanctions quand l'employeur n'établit pas son document unique : amende pénale de 7 500 € (jusqu'à 15 000 € en cas de récidive), et possibilité pour l'inspection du travail de prononcer un avertissement ou une amende administrative d'au plus 4 000 €, applicable plusieurs fois selon le nombre de travailleurs concernés et doublée en cas de récidive. Le document est obligatoire dès l'embauche du premier salarié et doit être mis à jour chaque année dans les entreprises d'au moins 11 salariés.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Les manquements au DUERP sont désormais sanctionnés » (26 juin 2026, mise à jour le 3 août 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18908" },
      phraseGenerale: "Ne pas établir son document unique d'évaluation des risques professionnels expose l'employeur à une amende pénale et à des sanctions administratives de l'inspection du travail, renforcées par une loi récente. Le document est obligatoire dès l'embauche du premier salarié et mis à jour chaque année à partir d'un certain effectif. Les montants peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-qpv-zfu-zfrr',
    titre: "Ce qui a changé pour les entreprises des quartiers prioritaires",
    fichesEntree: ['qpv'],
    corps: "La loi de finances pour 2026 a supprimé les zones franches urbaines-territoires entrepreneurs (ZFU-TE) au 1er janvier 2026 : les quartiers prioritaires de la politique de la ville (QPV) deviennent le seul zonage de la géographie prioritaire. Les entreprises qui créent ou reprennent une activité commerciale, artisanale ou de profession de santé dans un QPV entre le 1er janvier 2026 et le 31 décembre 2030 bénéficient d'une exonération dégressive d'impôt sur les bénéfices : totale les 5 premières années, puis 60 % la 6e année, 40 % la 7e et 20 % la 8e. Il faut employer moins de 50 salariés et réaliser un chiffre d'affaires annuel hors taxes ou avoir un total de bilan inférieur à 10 millions d'euros. Pour les territoires ruraux, voir la fiche sur les zones France Ruralités Revitalisation. À vérifier pour une commune précise : la liste officielle des communes concernées (arrêté du 14 avril 2025 pour les anciennes zones de revitalisation rurale maintenues).",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Quartiers prioritaires de la politique de la ville : quels changements pour les entreprises ? » (23 février 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18806" },
      phraseGenerale: "Une loi de finances récente a supprimé les zones franches urbaines et prévu, pour les quartiers prioritaires de la politique de la ville, une exonération dégressive des bénéfices pour certaines activités créées ou reprises sur place, sous conditions d'effectif et de chiffre d'affaires. Les conditions, les dates et les durées peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-acre-changements',
    titre: "Ce qui change pour les créations d'entreprise",
    fichesEntree: ['acre'],
    corps: "Un décret du 6 février 2026 change l'ACRE. Pour les micro-entreprises créées ou reprises à partir du 1er juillet 2026, l'exonération de cotisations sociales passe de 50 % à 25 %. Pour les entrepreneurs individuels et les sociétés (SASU, SA...), la nouvelle règle s'applique aux créations ou reprises à partir du 1er janvier 2026. La demande d'ACRE doit désormais être faite au plus tard le 60e jour suivant la date d'ouverture de l'activité : un délai à ne pas laisser passer.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Acre : du changement pour le dispositif d'aide » (11 février 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18795" },
      phraseGenerale: "Le taux de l'exonération de cotisations sociales de l'aide à la création ou à la reprise d'une entreprise a été modifié par décret, avec des dates d'application différentes selon le statut, et la demande doit être faite dans un délai court après le début de l'activité. Les taux et les délais peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-micro-entrepreneur-seuils',
    titre: "Seuils et cotisations",
    fichesEntree: ['creations-entreprises-micro-entrepreneurs'],
    corps: "Pour 2026, 2027 et 2028, les seuils de chiffre d'affaires annuel hors taxes de la micro-entreprise sont de 203 100 € pour la vente de marchandises et la fourniture de logement (188 700 € avant) et de 83 600 € pour les prestations de services et les professions libérales (77 700 € avant) ; en activité mixte, le chiffre d'affaires global ne doit pas dépasser 203 100 €. Ces seuils sont proratisés l'année de création. Autre changement : depuis avril 2026, la réforme de l'assiette sociale des travailleurs indépendants donne une base de calcul unique pour les cotisations et la CSG-CRDS, correspondant au revenu sans déduction des cotisations sociales, avec un abattement forfaitaire automatique de 26 % ; la part de CSG-CRDS diminue et celle des cotisations qui ouvrent des droits individuels augmente.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Quels sont les nouveaux seuils de la micro-entreprise ? » (26 février 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18813" },
      phraseGenerale: "Les seuils de chiffre d'affaires de la micro-entreprise sont revalorisés régulièrement, avec des seuils différents pour la vente de marchandises et pour les prestations de services, et proratisés l'année de création. Le mode de calcul des cotisations des travailleurs indépendants a aussi été réformé. Les seuils peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-stage-gratification',
    titre: "La gratification minimale d'un stagiaire",
    fichesEntree: ['stage'],
    corps: "Une gratification est due pour un stage de plus de 2 mois (consécutifs ou non) au cours d'une même année scolaire ou universitaire, c'est-à-dire quand la présence dépasse 308 heures. Son montant minimal est de 15 % du plafond horaire de la Sécurité sociale : avec un plafond horaire de 30 € depuis le 1er janvier 2026, cela fait 4,50 € de l'heure (4,35 € en 2025). Certaines conventions collectives prévoient plus. Si le plafond change en cours de stage, la convention de stage doit prévoir la revalorisation de la gratification à compter du changement.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Le montant de l'indemnité minimale de stage va augmenter » (17 décembre 2025)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18709" },
      phraseGenerale: "Un stage de longue durée donne droit à une gratification minimale, calculée en pourcentage du plafond horaire de la Sécurité sociale, qui est révisé chaque année ; certaines conventions collectives prévoient plus. Le montant et les seuils peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-grands-rouleurs-fin-annee',
    titre: "La reconduction de l'aide en fin d'année",
    fichesEntree: ['aide-carburant-grands-rouleurs'],
    corps: "L'aide aux « grands rouleurs », créée en mai 2026 pour amortir la hausse du prix du carburant, est renouvelée pour octobre, novembre et décembre 2026 par un décret du 15 octobre 2026, alors que le guichet devait fermer le 30 septembre. Son montant passe de 50 € (pour 3 mois) à 100 € (environ 40 centimes par litre au lieu de 20) et le plafond de revenus exigé est relevé. Si la personne a déjà reçu l'aide d'avril à septembre, elle n'a rien à faire : la nouvelle aide est versée automatiquement à partir du 16 octobre. Sinon, la demande se fait en ligne, dans l'espace Finances publiques du site impots.gouv.fr, à partir du 27 octobre et jusqu'au 31 décembre 2026, le versement intervenant 10 jours après ; un simulateur permet de vérifier l'éligibilité. L'aide n'est accordée qu'une seule fois pour un même véhicule. Il faut être domicilié fiscalement en France, avoir au moins 16 ans au 31 décembre 2024, avoir déclaré un revenu d'activité (hors chômage et préretraite) et utiliser son véhicule à des fins professionnelles, en parcourant au moins 15 km par trajet domicile-travail (30 km aller-retour) ou au moins 8 000 km par an dans le cadre de son activité.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Une nouvelle aide de 100 euros pour les travailleurs « grands rouleurs » » (6 mai 2026, mise à jour le 27 octobre 2026)", url: "https://www.service-public.gouv.fr/particuliers/actualites/A18903" },
      phraseGenerale: "L'aide aux grands rouleurs, créée pour amortir la hausse du prix du carburant, a été renouvelée pour la fin de l'année avec un montant plus élevé. Les personnes qui l'avaient déjà reçue la reçoivent automatiquement ; les autres la demandent en ligne sur le site des impôts, avec des conditions de distance parcourue. Les montants, les conditions et les dates peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-prime-carburant-plafond-releve',
    titre: "Le plafond relevé jusqu'à la fin de l'année",
    fichesEntree: ['prime-carburant-exoneration'],
    corps: "Les sommes versées par l'employeur entre le 1er octobre et le 31 décembre 2026 au titre de la prise en charge des frais de transport personnels sont exonérées de cotisations et de contributions sociales dans la limite unique de 1 000 € (décret n° 2026-974 du 20 octobre 2026). En temps normal, les limites sont de 600 € par an pour le carburant ou la recharge, 600 € pour le forfait mobilités durables dont 300 € au plus pour le carburant, 900 € en cumul avec des abonnements de transport, et 310 € quand une collectivité ou France Travail prend en charge les frais d'un salarié domicilié à 30 km ou plus. Jusqu'au 31 décembre 2026, les conditions d'éligibilité sont aussi assouplies pour les seuls frais de carburant (cumul avec la prise en charge des abonnements de transport, obligation d'utiliser son véhicule). La prime est facultative : elle dépend d'un accord d'entreprise, d'un accord de branche ou d'une décision de l'employeur. Dans la fonction publique d'État, le barème des indemnités kilométriques est majoré de 3,2 % pour les déplacements du 1er juin au 31 décembre 2026 (arrêté du 29 mai 2026), y compris pour les accompagnants d'élèves en situation de handicap, les enseignants remplaçants et les agents hospitaliers.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Prime de transport versée au salarié : le plafond d'exonération est revalorisé temporairement » (24 octobre 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A18926" },
      phraseGenerale: "Un plafond d'exonération de cotisations plus élevé et des conditions assouplies s'appliquent temporairement à la prime de transport versée par l'employeur pour les frais de carburant ; la prime reste facultative. Une majoration temporaire des indemnités kilométriques existe aussi pour certains agents publics. Les plafonds et les dates peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-teletravail-hors-domicile',
    titre: "Télétravailler ailleurs que chez soi",
    fichesEntree: ['teletravail'],
    corps: "Sauf règle spécifique dans la convention collective ou la charte de l'entreprise, le télétravail depuis un autre lieu que le domicile (un lieu de villégiature, par exemple) est en principe possible sous conditions, mais l'employeur peut s'y opposer. Le salarié doit l'informer du lieu, car cela touche aux accidents du travail, à l'assurance et à la cybersécurité. Il doit disposer d'une connexion internet stable et sécurisée et d'un matériel adapté, et être en mesure de garantir la confidentialité des échanges. Le télétravail reste interdit pendant les congés payés."
  },
  {
    id: 'second-niveau-csp-qui-doit-le-proposer',
    titre: "Qui doit le proposer",
    fichesEntree: ['csp'],
    corps: "Un arrêté du 24 décembre 2025 (agrément de l'avenant n° 11 du 25 novembre 2025) a prolongé le contrat de sécurisation professionnelle pour l'année 2026, jusqu'au 31 décembre 2026. Les entreprises de moins de 1 000 salariés, ainsi que celles en liquidation ou en redressement judiciaire, ont l'obligation de le proposer au salarié dont le licenciement économique est envisagé ; les conditions varient selon que le salarié a plus ou moins d'un an d'ancienneté. Les entreprises de 1 000 salariés ou plus doivent proposer le congé de reclassement à la place.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Prolongation du contrat de sécurisation professionnelle (CSP) jusqu'au 31 décembre 2026 » (7 janvier 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A16643" },
      phraseGenerale: "Le contrat de sécurisation professionnelle est prolongé par arrêté d'une année à l'autre. Les entreprises sous un certain effectif, et celles en liquidation ou en redressement judiciaire, doivent le proposer au salarié dont le licenciement économique est envisagé ; les plus grandes entreprises proposent le congé de reclassement. Les seuils et les dates peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-bonus-malus-employeur',
    titre: "Ce que l'employeur paie, et pourquoi il regarde la durée des contrats",
    fichesEntree: ['prime-de-precarite'],
    corps: "Le bonus-malus d'assurance chômage module la contribution patronale : elle est fixée à 4,00 % depuis le 1er mai 2025, sans pouvoir descendre sous 2,95 % ni dépasser 5,00 %. Depuis le 1er mars 2026, le taux de séparation de l'entreprise, comparé à la médiane de son secteur, se calcule à partir des fins de contrats d'une durée inférieure à 3 mois rapportées à l'effectif moyen annuel ; ne comptent plus les fins de contrats de plus de 3 mois, les contrats saisonniers, les licenciements pour inaptitude non professionnelle ou pour faute grave ou lourde, ni les démissions et fins de contrats d'apprentissage, de professionnalisation ou d'insertion. Le dispositif s'applique aux entreprises d'au moins 11 salariés de certains secteurs à fort taux de séparation. L'objectif officiel est de lutter contre la précarité de l'emploi.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Bonus-malus d'assurance chômage : nouveaux taux de séparation médians et évolution du dispositif » (2 mars 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A15776" },
      phraseGenerale: "Le bonus-malus d'assurance chômage module la contribution patronale selon la fréquence des fins de contrats courts dans l'entreprise, comparée à son secteur, et s'applique à certains secteurs à partir d'un certain effectif. L'objectif officiel est de lutter contre la précarité de l'emploi. Le taux, ses limites et le mode de calcul peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-credit-consommation-nouvelles-regles',
    titre: "Les nouvelles règles du crédit à la consommation",
    fichesEntree: ['microcredit-personnel'],
    corps: "À partir du 20 novembre 2026, de nouvelles règles encadrent le crédit à la consommation et s'étendent à des crédits jusque-là partiellement ou totalement exclus : crédits sans frais ni intérêts, crédits de moins de 200 €, crédits courts de moins de 3 mois avec frais négligeables, crédits de 75 000 € à 100 000 € et locations avec option d'achat ; les cartes à débit différé restent exemptées. Elles viennent d'une ordonnance du 3 septembre 2025 (directive européenne 2023/2225), d'un décret du 19 février 2026 (information avant signature : coût total, conséquences d'un défaut de paiement, voies de recours) et d'un décret du 1er août 2026 (traçabilité de l'analyse de solvabilité, orientation des emprunteurs en difficulté vers des services d'accompagnement indépendants). Toute publicité doit être claire, loyale et non trompeuse, comporter la mention « Attention ! Un crédit coûte de l'argent et doit être remboursé ! » et ne pas mettre en avant la facilité d'obtention. L'objectif officiel est de prévenir le surendettement.",
    suivi: {
      verifieLe: "2026-11-03",
      source: { nom: "Service-public.fr, actualité « Crédits à la consommation : les règles évoluent pour prévenir le surendettement » (17 septembre 2025, mise à jour le 27 octobre 2026)", url: "https://www.service-public.gouv.fr/particuliers/actualites/A18451" },
      phraseGenerale: "De nouvelles règles encadrent davantage le crédit à la consommation, y compris certains crédits de faible montant, de courte durée ou souscrits en ligne : information avant signature, publicité encadrée, analyse de solvabilité mieux tracée et accompagnement des emprunteurs en difficulté. L'objectif officiel est de prévenir le surendettement. Les règles et les seuils peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-desert-medical',
    titre: "Précisions",
    fichesEntree: ['desert-medical'],
    corps: "Dans chaque région, l'agence régionale de santé classe les territoires selon l'importance de leurs difficultés d'accès aux soins. Dans les zones où le manque de médecins est le plus marqué, les aides à l'installation sont les plus élevées. Ce classement est revu régulièrement, donc la situation d'un secteur peut changer. Rien ne se règle du jour au lendemain, mais ces aides expliquent les efforts faits pour attirer de nouveaux médecins."
  },
  {
    id: 'second-niveau-zonage-ars',
    titre: "Précisions",
    fichesEntree: ['zonage-ars'],
    corps: "Le classement est revu régulièrement : une commune peut donc changer de catégorie d'une période à l'autre. Il tient aussi compte des quartiers prioritaires de la politique de la ville. Côté médecins, une partie des anciennes aides passe désormais par l'Assurance maladie, sous la forme d'une majoration de rémunération. Pour savoir comment son secteur est classé, on consulte le site de l'agence régionale de santé de sa région."
  },
  {
    id: 'second-niveau-accompagnement-global',
    titre: "Exemples concrets",
    fichesEntree: ['accompagnement-global'],
    corps: "Cet accompagnement s'adresse à une personne inscrite à France Travail qui rencontre aussi des difficultés sociales, par exemple de logement ou d'argent. Le conseiller aide à construire le projet de retour à l'emploi. Le travailleur social aide pour les démarches financières, administratives ou juridiques, ou autour de la santé et de la mobilité. La personne décide avec eux de la nature et du rythme des rendez-vous, et les actions menées restent confidentielles."
  },
  {
    id: 'second-niveau-aide-a-la-mobilite',
    titre: "Dans quels cas ?",
    fichesEntree: ['aide-a-la-mobilite'],
    corps: "La demande se fait en priorité depuis l'espace personnel France Travail ; si ce n'est pas possible en ligne, on s'adresse à son conseiller. En principe, elle est déposée avant l'entretien d'embauche, et elle peut l'être peu de temps après. Les frais ne sont remboursés qu'en partie, dans la limite d'un plafond fixé pour chaque type de dépense. Exemple : pour un entretien loin de chez soi, on prévient son conseiller avant de partir."
  },
  {
    id: 'second-niveau-atelier-thematique',
    titre: "Exemples concrets",
    fichesEntree: ['atelier-thematique'],
    corps: "France Travail range ses ateliers-conseil par thèmes : choisir un métier, se former, créer une entreprise ou la reprendre, entre autres. On s'inscrit soi-même depuis son espace personnel, dans la rubrique des services à la carte. Un autre atelier, appelé « Atout jeunes », est proposé aux jeunes pour trouver un emploi. Exemple : une personne qui hésite sur un métier peut choisir l'atelier consacré au choix d'un métier."
  },
  {
    id: 'second-niveau-hebergement-ou-logement-accompagne',
    titre: "Dans quels cas ?",
    fichesEntree: ['hebergement-ou-logement-accompagne'],
    corps: "Une personne sans solution pour la nuit relève d'abord de l'hébergement d'urgence, ouvert à tous, pour une ou plusieurs nuits. Une personne en grande difficulté sociale peut être orientée vers un centre d'hébergement et de réinsertion sociale, pour un séjour de quelques mois à plusieurs années. Une personne qui peut vivre de façon autonome mais a besoin d'un hébergement stable et accompagné relève plutôt d'une résidence sociale, comme une pension de famille. Les coordonnées de ces structures s'obtiennent notamment auprès de la mairie ou du Samu social."
  },
  {
    id: 'second-niveau-intermediation-locative',
    titre: "Précisions",
    fichesEntree: ['intermediation-locative'],
    corps: "Il existe plusieurs formules. Dans la location ou sous-location, comme Solibail, une association agréée par la préfecture est locataire auprès du propriétaire et paie le loyer et les charges ; pour le propriétaire, le loyer est garanti même si le logement reste vide. Dans le mandat de gestion, une agence immobilière à vocation sociale met le propriétaire en relation avec le locataire, établit le bail et perçoit les loyers et les charges pour le compte du propriétaire."
  },
  {
    id: 'second-niveau-pair-aidance',
    titre: "Précisions",
    fichesEntree: ['pair-aidance'],
    corps: "La Haute Autorité de santé estime que faire appel à des pairs-aidants est particulièrement utile pour entrer en lien avec des personnes en grande précarité qui ont aussi des troubles psychiques, souvent très éloignées des soins et des dispositifs d'accompagnement. Le pair-aidant est intégré dans une équipe ou un établissement sanitaire, social ou médico-social, et son action complète celle des professionnels sans s'y substituer. Les personnes concernées sont impliquées dans leur propre accompagnement."
  },
  {
    id: 'second-niveau-referent-unique',
    titre: "Précisions",
    fichesEntree: ['referent-unique'],
    corps: "Quand l'accompagnement est tourné vers l'emploi, le référent unique est un conseiller France Travail ou un conseiller en insertion professionnelle. Quand il est tourné vers le social, c'est un travailleur social. Dans l'accompagnement vers l'emploi, c'est avec lui que la personne élabore, puis met à jour de temps en temps, son contrat d'engagement. Dans l'accompagnement social, le contrat d'insertion conclu avec le département peut être révisé."
  },
  {
    id: 'second-niveau-secours-d-urgence',
    titre: "Précisions",
    fichesEntree: ['secours-d-urgence'],
    corps: "Les caisses d'allocations familiales peuvent aussi accorder des aides ponctuelles à des familles confrontées à une difficulté financière exceptionnelle et passagère. Pour la demande, la personne rencontre d'abord un travailleur social, du Département, de la Carsat ou du CCAS selon le cas, qui transmet ensuite le dossier à la Caf. Une commission sociale examine alors chaque situation. Certaines aides mêlent un prêt et une part non remboursable, et le prêt ne peut pas être refusé séparément. Les conditions varient d'une Caf à l'autre : on se renseigne auprès de la sienne."
  },
  {
    id: 'second-niveau-secret-professionnel',
    titre: "Nuance utile",
    fichesEntree: ['secret-professionnel'],
    corps: "La loi permet à des professionnels de l'action sociale qui suivent la même personne ou la même famille de partager certaines informations. Cela leur sert à mieux évaluer la situation et à décider des mesures utiles. Ce partage reste limité à ce qui est strictement nécessaire à leur mission d'aide ou d'accompagnement. Par exemple, une assistante sociale peut transmettre à sa hiérarchie des données statistiques anonymes pour évaluer son activité."
  },
  {
    id: 'second-niveau-violences',
    titre: "Précisions",
    fichesEntree: ['violences'],
    corps: "Une personne victime ou témoin de violences conjugales peut faire un signalement en ligne aux forces de l'ordre. Elle peut y dialoguer avec un agent de police ou un militaire de gendarmerie, et l'historique de la discussion peut être effacé à tout moment de l'ordinateur, du téléphone ou de la tablette. Ce signalement ne remplace pas une plainte. Les violences ne sont pas seulement physiques : elles peuvent aussi être sexuelles, psychologiques ou économiques."
  },
  {
    id: 'second-niveau-visite-entreprise',
    titre: "Exemples concrets",
    fichesEntree: ['visite-entreprise'],
    corps: "Une visite peut donner envie d'aller plus loin avec une période de mise en situation en milieu professionnel, qui sert à tester un choix d'orientation en passant du temps dans une entreprise. On peut la demander qu'on soit ou non en activité, quel que soit l'âge. Une convention est signée avec la structure d'accueil ; elle précise les objectifs, les tâches confiées et les horaires de présence. Exemple : après une visite d'atelier qui a plu, on en parle à son conseiller."
  },
  {
    id: 'second-niveau-prime-de-precarite-ou-indemnite-de-licenciement',
    titre: "Dans quels cas ?",
    fichesEntree: ['prime-de-precarite-ou-indemnite-de-licenciement'],
    corps: "Premier cas : un contrat à durée déterminée arrive à son terme. La prime de précarité est en principe versée, sauf par exemple en cas de faute grave, de rupture à l'initiative du salarié, de force majeure ou de refus d'un contrat durable proposé par l'employeur. Deuxième cas : l'employeur licencie une personne en contrat durable. L'indemnité de licenciement est alors due, sauf faute grave ou lourde. Quand la convention collective prévoit une somme plus avantageuse, c'est celle-là qui est versée, sans s'ajouter à l'indemnité prévue par la loi."
  },
  {
    id: 'second-niveau-caces',
    titre: "Précisions",
    fichesEntree: ['caces'],
    corps: "Chaque famille d'engins a sa propre recommandation de l'Assurance maladie, qui fixe le contenu des épreuves théoriques et pratiques. Le CACES a été créé par le réseau Assurance maladie, branche risques professionnels, pour vérifier les compétences des conducteurs. Un salarié formé et titulaire du CACES qui correspond à l'équipement peut être autorisé à le conduire dans son entreprise."
  },
  {
    id: 'second-niveau-apprentissage-ou-professionnalisation',
    titre: "Dans quels cas ?",
    fichesEntree: ['apprentissage-ou-professionnalisation'],
    corps: "Service-public résume la différence par l'objectif : le contrat d'apprentissage relève de la formation initiale et mène à un diplôme ou à un titre professionnel, tandis que le contrat de professionnalisation relève de la formation continue et mène à une qualification professionnelle. Les deux contrats diffèrent aussi par leur durée, l'âge de la personne et sa rémunération. Un simulateur permet de comparer le coût d'un alternant et les aides correspondantes."
  },
  {
    id: 'second-niveau-cdd-classique-ou-cdd-d-insertion',
    titre: "Dans quels cas ?",
    fichesEntree: ['cdd-classique-ou-cdd-d-insertion'],
    corps: "Le CDD d'insertion fixe une durée minimale de contrat et une durée minimale de travail par semaine. Une exception existe pour les personnes condamnées qui bénéficient d'un aménagement de peine. Il peut être renouvelé dans une limite totale, et même au-delà pour achever une formation professionnelle en cours à la fin du contrat. Cela permet de finir une formation commencée."
  },
  {
    id: 'second-niveau-cdd-tremplin',
    titre: "Précisions",
    fichesEntree: ['cdd-tremplin'],
    corps: "Pour y entrer, il faut avoir la reconnaissance de la qualité de travailleur handicapé et être sans emploi, ou à risque dans son emploi à cause de son handicap. Le parcours comprend une formation à un métier, donnée par l'entreprise adaptée ou par un organisme extérieur, puis l'exercice de ce métier dans l'entreprise adaptée qui embauche. Les conseillers France Travail, Cap emploi et la maison départementale des personnes handicapées peuvent aider à faire la démarche."
  },
  {
    id: 'second-niveau-contrat-emploi-penitentiaire',
    titre: "Exemples concrets",
    fichesEntree: ['contrat-emploi-penitentiaire'],
    corps: "Avant de signer, la personne obtient une autorisation de travailler, appelée classement, décidée par le chef d'établissement, qui ne peut la refuser que pour des raisons de sécurité. Elle passe ensuite un entretien professionnel avec l'entreprise ou le service qui offre le poste, appelé donneur d'ordre. Le contrat est signé avec ce donneur d'ordre et précise s'il est à durée déterminée ou indéterminée. La gestion des paies et des déclarations aux organismes sociaux est assurée par l'administration."
  },
  {
    id: 'second-niveau-contrat-saisonnier',
    titre: "Précisions",
    fichesEntree: ['contrat-saisonnier'],
    corps: "Les secteurs qui y recourent sont par exemple l'agriculture (les vendanges), l'industrie agro-alimentaire et le tourisme de vacances (comme les moniteurs de ski). En principe, la prime de précarité n'est pas versée à la fin d'un contrat saisonnier, mais la convention collective peut la prévoir. La convention applicable est celle de l'activité principale de l'entreprise. Un simulateur permet de la retrouver avec le nom de l'entreprise ou son numéro Siret."
  },
  {
    id: 'second-niveau-pec',
    titre: "Précisions",
    fichesEntree: ['pec'],
    corps: "Le parcours comprend un entretien à trois entre le prescripteur (par exemple Cap emploi ou France Travail), l'employeur et le futur salarié, au moment de la demande d'aide. Cet entretien fixe les engagements et les compétences que le poste doit permettre d'acquérir. Pendant le contrat, un suivi à distance, parfois sous forme de livret, est prévu, puis un entretien de sortie selon les besoins de la personne. L'aide versée à l'employeur peut varier selon la région et le public concerné."
  },
  {
    id: 'second-niveau-accord-de-reciprocite',
    titre: "Précisions",
    fichesEntree: ['accord-de-reciprocite'],
    corps: "Un permis délivré par un pays hors Europe permet de conduire en France pendant une durée limitée, à partir de l'installation dans le pays. Au-delà, l'échange contre un permis français est obligatoire pour continuer à conduire, à condition que le pays d'origine pratique l'échange réciproque avec la France. Les règles ne sont pas les mêmes pour un étudiant étranger et pour une personne dans une autre situation. Pendant l'instruction de la demande, on peut continuer à conduire avec son permis étranger."
  },
  {
    id: 'second-niveau-admission-exceptionnelle-au-sejour',
    titre: "Dans quels cas ?",
    fichesEntree: ['admission-exceptionnelle-au-sejour'],
    corps: "Le préfet apprécie chaque situation au cas par cas, et la carte n'est pas délivrée automatiquement. Les situations regardées sont la vie privée et familiale, le travail, ou un talent exceptionnel et des services rendus à la collectivité. Selon le cas, une carte de séjour temporaire « vie privée et familiale » ou « travailleur temporaire » peut être délivrée. La demande se dépose à la préfecture ou à la sous-préfecture du domicile, et la carte autorise à travailler."
  },
  {
    id: 'second-niveau-bonne-foi',
    titre: "Nuance utile",
    fichesEntree: ['bonne-foi'],
    corps: "En matière de surendettement, être de bonne foi veut dire notamment ne pas avoir fait volontairement en sorte de ne plus pouvoir payer ses dettes. Les dettes concernées peuvent être personnelles ou professionnelles, passées, présentes ou à venir : prêts, découverts, arriérés de loyer ou d'impôts, factures impayées d'eau, de gaz, d'électricité ou de téléphone."
  },
  {
    id: 'second-niveau-examen-civique',
    titre: "Précisions",
    fichesEntree: ['examen-civique'],
    corps: "Il se passe dans un centre agréé, après une inscription auprès de la chambre de commerce et d'industrie de Paris Île-de-France ou de France Éducation international. Il évalue des connaissances sur les grands repères de l'histoire de France et sur les principes, les symboles et les institutions de la République. En cas de handicap ou de problème de santé, un aménagement ou une dispense est possible, avec un certificat médical à fournir. Il concerne la naturalisation et la réintégration par décret, pas l'acquisition de la nationalité par déclaration, par exemple après un mariage."
  },
  {
    id: 'second-niveau-illectronisme',
    titre: "Exemples concrets",
    fichesEntree: ['illectronisme'],
    corps: "Pour se faire aider sans donner ses identifiants, l'outil Aidants Connect permet à un aidant professionnel de faire des démarches en ligne à la place d'une personne, de façon sécurisée. Un mandat dématérialisé encadre ce que l'aidant peut faire. L'outil se connecte aux comptes de la personne sur les sites administratifs qui proposent le bouton FranceConnect. Toute structure publique ou privée qui accompagne les démarches dans une mission de service public peut l'utiliser."
  },
  {
    id: 'second-niveau-naturalisation-par-decret',
    titre: "Précisions",
    fichesEntree: ['naturalisation-par-decret'],
    corps: "L'assimilation à la communauté française est vérifiée par la réussite à l'examen civique et par un entretien en préfecture. Il faut aussi justifier d'une connaissance suffisante du français et d'une insertion professionnelle, c'est-à-dire de revenus stables et suffisants pour le foyer. Une enquête porte sur le comportement civique, par exemple le paiement des impôts, et l'administration vérifie le passé judiciaire en France et à l'étranger."
  },
  {
    id: 'second-niveau-personne-de-confiance',
    titre: "Précisions",
    fichesEntree: ['personne-de-confiance'],
    corps: "La désignation se fait par écrit et est cosignée par la personne désignée ; un modèle est disponible, et des formulaires sont souvent remis lors d'une admission à l'hôpital. Cette personne peut accompagner dans les démarches médicales et assister aux entretiens médicaux. La désignation peut être modifiée ou retirée à tout moment, en le signalant par écrit. Pour une personne sous tutelle, l'autorisation du juge ou du conseil de famille est nécessaire."
  },
  {
    id: 'second-niveau-primo-arrivant',
    titre: "Exemples concrets",
    fichesEntree: ['primo-arrivant'],
    corps: "Au moment de la signature du contrat d'intégration républicaine, la personne est convoquée par l'Office français de l'immigration et de l'intégration à la formation civique, si elle y est éligible. Cette formation porte sur les principes et les valeurs de la République (la devise, les symboles, la laïcité), sur le système institutionnel et politique de la France, et sur les droits et devoirs liés à la vie en France."
  },
  {
    id: 'second-niveau-profession-reglementee',
    titre: "Précisions",
    fichesEntree: ['profession-reglementee'],
    corps: "Pour exercer une profession réglementée, il faut en principe demander la reconnaissance de ses qualifications professionnelles ou une autorisation d'exercice en France, ce qui revient à faire reconnaître officiellement sa formation ou son expérience. Un ressortissant européen qui souhaite s'installer durablement parle de libre établissement. Certaines professions peuvent aussi être exercées de façon temporaire ou occasionnelle."
  },
  {
    id: 'second-niveau-radiation',
    titre: "Précisions",
    fichesEntree: ['radiation'],
    corps: "France Travail envoie d'abord un courrier qui indique la durée envisagée de la radiation et les voies et délais de recours. La personne peut présenter des observations, par écrit ou à l'oral, dans un délai court, puis France Travail notifie sa décision. Si les allocations n'ont été supprimées qu'en partie, le versement complet reprend à la réinscription, à la fin de la période de radiation, jusqu'à la fin des droits. Si la suppression est totale, le versement ne reprend pas."
  },
  {
    id: 'second-niveau-recepisse',
    titre: "Précisions",
    fichesEntree: ['recepisse'],
    corps: "Le récépissé n'est remis que si le dossier est complet. Il concerne une première demande, un renouvellement ou un duplicata de titre de séjour. Sa durée de validité diffère selon qu'il s'agit d'une première demande ou d'un renouvellement, et il peut être renouvelé dans certains cas. Il couvre le temps nécessaire à la préfecture pour instruire le dossier et fabriquer le titre. Si la demande passe par un téléservice, on reçoit une attestation à la place."
  },
  {
    id: 'second-niveau-recours-amiable',
    titre: "Précisions",
    fichesEntree: ['recours-amiable'],
    corps: "Il existe plusieurs formes de recours auprès de l'administration. Le recours gracieux est une réclamation adressée à l'auteur de la décision, par exemple le maire ou le préfet. Le recours hiérarchique est adressé à son supérieur, et on peut le faire sans attendre la réponse au recours gracieux. Dans certains domaines, un recours préalable est obligatoire avant de saisir le juge."
  },
  {
    id: 'second-niveau-recours-amiable-ou-contentieux',
    titre: "Dans quels cas ?",
    fichesEntree: ['recours-amiable-ou-contentieux'],
    corps: "Premier cas : le domaine impose un recours préalable avant d'aller devant le juge, comme pour les impôts, une décision de la maison départementale des personnes handicapées ou un refus de visa. Dans cette situation, on commence obligatoirement par la réclamation à l'administration. Deuxième cas : le recours préalable n'est pas obligatoire, et on peut choisir un recours gracieux auprès de l'auteur de la décision ou un recours hiérarchique auprès de son supérieur. Dans tous les cas, les délais diffèrent selon le recours, et on les lit sur la décision."
  },
  {
    id: 'second-niveau-refugie-ou-protection-subsidiaire',
    titre: "Dans quels cas ?",
    fichesEntree: ['refugie-ou-protection-subsidiaire'],
    corps: "Le statut de réfugié est accordé à une personne persécutée dans son pays pour sa race, sa religion, sa nationalité, son appartenance à un groupe social ou ses opinions politiques, ou en raison de son action en faveur de la liberté. La protection subsidiaire est attribuée à une personne qui ne remplit pas les conditions du statut de réfugié mais qui est exposée à un risque grave, comme la peine de mort, la torture ou une violence liée à un conflit armé. Il existe aussi une protection temporaire, décidée au niveau européen, pour des personnes qui fuient massivement leur pays."
  },
  {
    id: 'second-niveau-releve-de-carriere',
    titre: "Exemples concrets",
    fichesEntree: ['releve-de-carriere'],
    corps: "Le relevé de carrière est un récapitulatif de la carrière qui donne une vision globale des droits acquis pour la future retraite. Il permet de vérifier que l'ensemble de la carrière a bien été pris en compte. On le retrouve à tout moment dans son espace personnel sur le site de l'Assurance retraite. Exemple : en repérant tôt un oubli, on garde le temps d'agir avant le départ."
  },
  {
    id: 'second-niveau-tiers-de-confiance-numerique',
    titre: "Précisions",
    fichesEntree: ['tiers-de-confiance-numerique'],
    corps: "Un mandat dématérialisé encadre ce que l'aidant a le droit de faire à la place de la personne, et sécurise la gestion des identifiants et des mots de passe. Pour la personne, c'est rassurant : l'outil cadre l'accès à ses données personnelles. Pour l'aidant, il apporte une protection. Il fait aussi gagner du temps, car il permet de se connecter directement aux comptes sur les sites administratifs qui disposent du bouton FranceConnect."
  },
  {
    id: 'second-niveau-titre-de-sejour',
    titre: "Précisions",
    fichesEntree: ['titre-de-sejour'],
    corps: "Pour une première carte de séjour pluriannuelle ou une première carte de résident, un niveau de français doit être prouvé, et il est plus élevé pour la carte de résident. Le niveau se prouve par un diplôme, une certification ou un test reconnu. Les seuls tests reconnus par le ministère de l'Intérieur sont le TCF et le TEF. Les attestations de certification doivent comporter des mentions d'identité vérifiées avant le début des épreuves. La réussite à l'examen civique est aussi obligatoire."
  },
  {
    id: 'second-niveau-amenagement-de-peine',
    titre: "Dans quels cas ?",
    fichesEntree: ['amenagement-de-peine'],
    corps: "La libération conditionnelle est un aménagement de peine décidé par les juridictions de l'application des peines : la personne termine sa peine hors de prison, en respectant des obligations. Elle reste suivie par le juge de l'application des peines et par un conseiller pénitentiaire d'insertion et de probation. La libération sous contrainte est en principe à l'initiative du juge ; si le juge ne s'est pas prononcé à l'échéance prévue, la personne incarcérée peut en faire la demande."
  },
  {
    id: 'second-niveau-carte-mobilite-inclusion',
    titre: "Précisions",
    fichesEntree: ['carte-mobilite-inclusion'],
    corps: "La CMI peut comporter plusieurs mentions à la fois. La mention invalidité s'adresse aux personnes en perte d'autonomie importante. Elle offre les mêmes avantages que la mention priorité, avec en plus des réductions dans les transports et des avantages fiscaux."
  },
  {
    id: 'second-niveau-entretien-information-retraite',
    titre: "Précisions",
    fichesEntree: ['entretien-information-retraite'],
    corps: "Le droit à l'information retraite est mis en œuvre par un groupement qui réunit les organismes de retraite obligatoire, de base et complémentaire. L'entretien se fait à la demande de la personne, à partir d'un certain âge, avec un expert, pour faire le point sur sa future retraite. Plus tard, la personne reçoit aussi une estimation indicative globale, qui récapitule sa carrière et estime le montant de sa future retraite."
  },
  {
    id: 'second-niveau-fsl',
    titre: "Dans quels cas ?",
    fichesEntree: ['fsl'],
    corps: "Première situation : on s'installe. Le FSL peut aider à payer le dépôt de garantie, le premier loyer, les frais d'agence, le déménagement, l'assurance habitation ou l'achat d'équipements de première nécessité. Seconde situation : on a pris du retard et il faut se maintenir dans le logement. Il peut alors aider à régler des dettes de loyer, des factures d'électricité, de gaz, d'eau ou de téléphone, ou des frais de commissaire de justice. L'aide n'est pas automatique et les critères varient selon le département."
  },
  {
    id: 'second-niveau-liberation-sous-contrainte',
    titre: "Précisions",
    fichesEntree: ['liberation-sous-contrainte'],
    corps: "Elle est en principe décidée à l'initiative du juge de l'application des peines. Pour décider, le juge peut demander à entendre la personne ou son avocat. Si le juge ne s'est pas prononcé à l'échéance prévue, la personne incarcérée peut elle-même en faire la demande."
  },
  {
    id: 'second-niveau-maprimeadapt',
    titre: "Précisions",
    fichesEntree: ['maprimeadapt'],
    corps: "Avant de s'engager dans des travaux et de demander l'aide, il est vivement recommandé de contacter gratuitement un conseiller France Rénov'. Pour un propriétaire occupant, l'aide est ouverte selon l'âge ou selon la perte d'autonomie d'une personne du foyer. Les travaux qui rendent accessibles les parties communes d'un immeuble peuvent aussi être aidés. La demande d'aide financière se fait en ligne, auprès de l'Anah."
  },
  {
    id: 'second-niveau-maprimerenov',
    titre: "Précisions",
    fichesEntree: ['maprimerenov'],
    corps: "Pour une rénovation d'ampleur, le premier rendez-vous avec un conseiller France Rénov' est une étape obligatoire du parcours. Il donne une attestation, indispensable pour constituer le dossier de demande. Ensuite, la personne est accompagnée par « Mon Accompagnateur Rénov' » pour poursuivre son projet de travaux. Pour des travaux ciblés, il est seulement recommandé de contacter un conseiller. L'aide est versée par l'Anah dans les deux cas."
  },
  {
    id: 'second-niveau-mesures-imposees',
    titre: "Précisions",
    fichesEntree: ['mesures-imposees'],
    corps: "La commission notifie les mesures par courrier recommandé à la personne endettée et à ses créanciers. Parmi les mesures possibles figure la réduction du montant du prêt immobilier qui reste à rembourser, en cas de vente du logement principal et avec l'accord de la personne. Pour un propriétaire qui loue un logement, l'absence de contestation de sa part fait que les mesures remplacent automatiquement les délais de paiement de la dette de loyer fixés auparavant par le juge."
  },
  {
    id: 'second-niveau-microcredit-personnel-ou-professionnel',
    titre: "Dans quels cas ?",
    fichesEntree: ['microcredit-personnel-ou-professionnel'],
    corps: "Premier cas : une personne veut financer un projet de la vie courante qui aide son insertion. Le microcrédit personnel est un crédit à la consommation affecté, donc il doit financer un projet précis, et la personne est accompagnée par un organisme social. Deuxième cas : une personne veut créer ou reprendre une entreprise. Le microcrédit professionnel peut compléter ou remplacer un prêt bancaire, pour financer du matériel, un véhicule, un local ou une trésorerie."
  },
  {
    id: 'second-niveau-microcredit-professionnel',
    titre: "Précisions",
    fichesEntree: ['microcredit-professionnel'],
    corps: "Il peut être accordé à la place d'un prêt bancaire ou en complément, pour financer du matériel, un véhicule, un local ou constituer une trésorerie. Parmi les acteurs qui le distribuent, l'Adie accueille toute personne qui a des difficultés à faire financer son projet par les banques, sans condition de situation, de forme juridique ou de secteur. En revanche, une personne de l'entourage doit se porter garante pour une part du montant emprunté. Certaines associations ne délivrent que des microcrédits personnels."
  },
  {
    id: 'second-niveau-mobili-jeune',
    titre: "Précisions",
    fichesEntree: ['mobili-jeune'],
    corps: "L'aide prend en charge une partie du loyer, ou de la redevance pour un logement-foyer, pendant la durée de la formation en alternance. Elle est versée par Action Logement. Une aide similaire existe pour les participants au volontariat territorial en entreprise, qu'ils soient en contrat à durée déterminée, en contrat à durée indéterminée ou en alternance."
  },
  {
    id: 'second-niveau-pass-iae',
    titre: "Précisions",
    fichesEntree: ['pass-iae'],
    corps: "Pour obtenir un Pass IAE, une candidature peut être envoyée par un prescripteur habilité, un orienteur, la personne elle-même ou un employeur qui s'auto-prescrit. Seuls les prescripteurs habilités et les structures d'insertion peuvent valider l'éligibilité à l'insertion par l'activité économique. Le prescripteur s'appuie sur des critères d'éligibilité et sur un diagnostic socio-professionnel réalisé lors d'un entretien."
  },
  {
    id: 'second-niveau-pch',
    titre: "Précisions",
    fichesEntree: ['pch'],
    corps: "La demande se fait en ligne par un téléservice si la MDPH du lieu de résidence le propose, sinon par courrier avec un formulaire. Il faut joindre les justificatifs demandés. Parmi les éléments de la PCH figurent les charges spécifiques, régulières, comme l'entretien d'un fauteuil roulant, et les charges exceptionnelles, ponctuelles, comme la réparation d'un lit médicalisé."
  },
  {
    id: 'second-niveau-plan-conventionnel-de-redressement',
    titre: "Précisions",
    fichesEntree: ['plan-conventionnel-de-redressement'],
    corps: "La priorité est toujours donnée aux dettes de logement. Pour les dettes alimentaires, les dommages et intérêts et les dettes frauduleuses envers un organisme de protection sociale, aucun rééchelonnement, remise ou effacement n'est possible sans l'accord du créancier. La commission notifie le plan aux créanciers par lettre recommandée, et ils ont un délai pour le refuser."
  },
  {
    id: 'second-niveau-plan-conventionnel-ou-mesures-imposees',
    titre: "Dans quels cas ?",
    fichesEntree: ['plan-conventionnel-ou-mesures-imposees'],
    corps: "Premier cas : la commission élabore un plan et le notifie aux créanciers par lettre recommandée. Ils ont un délai pour le refuser, car ce plan repose sur leur accord. Deuxième cas : le dossier est orienté vers des mesures imposées, que la commission notifie par courrier recommandé à la personne et aux créanciers. Les mesures peuvent alors être contestées, et la priorité reste donnée aux dettes de logement."
  },
  {
    id: 'second-niveau-pret-d-honneur',
    titre: "Précisions",
    fichesEntree: ['pret-d-honneur'],
    corps: "Il existe aussi un prêt d'honneur Création-Reprise de Bpifrance, cofinancé avec le prêt d'honneur du réseau d'accompagnement. Pour y prétendre, il faut déjà bénéficier d'un prêt d'honneur de son opérateur d'accompagnement, être actionnaire de l'entreprise et ne pas être inscrit au fichier des incidents de remboursement des crédits aux particuliers. Ce prêt est à taux zéro, avec une assurance décès exigée, sans pénalité en cas de remboursement anticipé."
  },
  {
    id: 'second-niveau-prets-action-logement-salaries',
    titre: "Précisions",
    fichesEntree: ['prets-action-logement-salaries'],
    corps: "La page de service-public présente les prêts immobiliers complémentaires d'Action Logement : le prêt accession pour les salariés et des aides pour les salariés du secteur agricole. Un prêt complémentaire finance en partie l'achat ou la construction de la résidence principale. Pour être renseigné, on appelle Action Logement en semaine en ayant sous la main le numéro Siret de son entreprise, indiqué sur la fiche de paie. Des agences accueillent aussi sur place."
  },
  {
    id: 'second-niveau-retablissement-personnel',
    titre: "Dans quels cas ?",
    fichesEntree: ['retablissement-personnel'],
    corps: "La procédure est proposée par la commission de surendettement. Dans le cas sans liquidation judiciaire, elle n'implique pas la vente des biens de la personne. Dans le cas avec liquidation judiciaire, elle implique la vente de certains biens. Dans les deux cas, le but est d'effacer les dettes de la personne surendettée, même si certaines dettes, comme les dettes alimentaires, restent dues."
  },
  {
    id: 'second-niveau-retraite-progressive',
    titre: "Précisions",
    fichesEntree: ['retraite-progressive'],
    corps: "Pour passer à temps partiel, il faut l'accord de l'employeur, et un refus doit être motivé. La part de pension versée vient compenser la différence entre le revenu à temps plein et le revenu à temps partiel : on perçoit une partie de sa pension tout en continuant de cotiser pour sa retraite définitive. Pour les travailleurs non salariés, c'est la baisse du revenu d'activité qui compte."
  },
  {
    id: 'second-niveau-rlh',
    titre: "Précisions",
    fichesEntree: ['rlh'],
    corps: "Pour un salarié, l'aide est attribuée à l'employeur. Pour un travailleur non salarié, comme un artisan ou une profession libérale, elle suppose d'avoir aménagé son poste ou son environnement de travail et d'en supporter les frais. La demande se fait en ligne par un téléservice auprès de l'Agefiph, avec un justificatif de la qualité de bénéficiaire de l'obligation d'emploi, par exemple la reconnaissance de la qualité de travailleur handicapé ou l'allocation aux adultes handicapés."
  },
  {
    id: 'second-niveau-service-civique',
    titre: "Précisions",
    fichesEntree: ['service-civique'],
    corps: "La mission se fait dans un organisme public ou privé à but non lucratif, et la personne touche une indemnité, pas un salaire. Les informations à connaître ne sont pas les mêmes selon qu'elle est majeure ou mineure : un mineur a besoin d'une autorisation parentale et bénéficie de protections supplémentaires. Pour candidater, on crée d'abord son compte sur le site dédié, puis on postule auprès des organismes qui proposent des missions. On peut aussi passer par une mission locale ou le Réseau information jeunesse."
  },
  {
    id: 'second-niveau-suspension-reforme-retraites-2026',
    titre: "Précisions",
    fichesEntree: ['suspension-reforme-retraites-2026'],
    corps: "Le relèvement de l'âge légal et l'allongement de la durée d'assurance sont suspendus. Pour les générations concernées, l'âge de départ et la durée d'assurance requise dépendent de l'année de naissance, et un tableau sur la page officielle les indique. La suspension concerne aussi les carrières longues, c'est-à-dire les personnes qui ont commencé à travailler très jeunes : le départ anticipé est assoupli selon l'âge de début d'activité."
  },
  {
    id: 'second-niveau-suspension-remobilisation',
    titre: "Précisions",
    fichesEntree: ['suspension-remobilisation'],
    corps: "Le type de sanction, sa durée et son taux dépendent du manquement constaté, de sa fréquence et de la nature de l'allocation perçue. Pendant une suspension, la personne peut y mettre fin avant son terme en respectant de nouveau ses engagements auprès de son organisme référent, par exemple en reprenant sa recherche active d'emploi. Les barèmes diffèrent selon qu'elle perçoit une allocation de France Travail, le RSA, ou aucune des deux."
  },
  {
    id: 'second-niveau-transport-a-la-demande',
    titre: "Précisions",
    fichesEntree: ['transport-a-la-demande'],
    corps: "C'est un service à mi-chemin entre le taxi et le bus. Il fonctionne en complément des lignes régulières de cars et de trains régionaux. Selon les secteurs, il est ouvert à tous ou réservé à un public défini. Dans tous les cas, il faut réserver."
  },
  {
    id: 'second-niveau-treve-hivernale',
    titre: "Précisions",
    fichesEntree: ['treve-hivernale'],
    corps: "Elle ne s'applique pas dans tous les cas. Elle ne protège pas un squatteur qui occupe un logement, ni une personne dont l'expulsion du domicile conjugal a été ordonnée par le juge aux affaires familiales, dans le cadre d'un divorce ou de violences. Elle ne s'applique pas non plus quand une solution de relogement adaptée existe. Pour un locataire qui habite son logement, l'expulsion est reportée et non annulée : elle devient possible dès la fin de la trêve."
  },
  {
    id: 'second-niveau-visale',
    titre: "Précisions",
    fichesEntree: ['visale'],
    corps: "Action Logement prend aussi en charge la procédure de recouvrement, qui peut aller jusqu'à la résiliation du bail et l'expulsion si nécessaire. Au-delà des premières années du bail, il faut refaire une demande pour continuer à bénéficier de la garantie. Le montant des impayés couverts dépend du type de locataire et du secteur, avec un tableau distinct pour le logement social."
  },
  {
    id: 'second-niveau-autorisation-de-travail',
    titre: "Précisions",
    fichesEntree: ['autorisation-de-travail'],
    corps: "Pour une carte de séjour « salarié », « travailleur temporaire » ou « travailleur saisonnier », une autorisation de travail est demandée pour chaque nouveau contrat. Avec d'autres titres, comme la carte « vie privée et familiale » ou la carte « talent », l'employeur en est dispensé mais vérifie auprès de la préfecture que le titre est authentique. Cette vérification n'est pas à faire si la personne est inscrite sur la liste des demandeurs d'emploi de France Travail. Sans réponse de la préfecture dans le délai prévu, l'employeur est réputé avoir rempli son obligation."
  },
  {
    id: 'second-niveau-bulletin-2-ou-bulletin-3',
    titre: "Dans quels cas ?",
    fichesEntree: ['bulletin-2-ou-bulletin-3'],
    corps: "Pour connaître le contenu de son casier, on peut demander la consultation du relevé intégral, qui donne accès à tous les bulletins. Le bulletin réservé aux administrations n'est délivré qu'à certaines autorités publiques et, pour les employeurs, seulement quand le poste est en contact avec des mineurs ; la personne ne peut pas le demander elle-même. Celui qu'elle peut demander elle-même se demande en ligne, par le téléservice du ministère de la Justice."
  },
  {
    id: 'second-niveau-bulletin-n-3',
    titre: "Précisions",
    fichesEntree: ['bulletin-n-3'],
    corps: "La demande se fait en principe sur internet, avec le téléservice du ministère de la Justice. Si la démarche en ligne est impossible, on peut demander l'extrait par courrier postal. Une fois la demande envoyée, un courriel arrive : la demande n'est prise en compte qu'après un clic sur le lien de confirmation qu'il contient."
  },
  {
    id: 'second-niveau-cumul-emploi-retraite',
    titre: "Nuance utile",
    fichesEntree: ['cumul-emploi-retraite'],
    corps: "La loi de financement de la sécurité sociale change ce dispositif pour les personnes qui partent à la retraite à partir du début de l'année qui vient. Il n'y aura plus de distinction entre cumul intégral et cumul plafonné : seul l'âge comptera. Avant l'âge légal minimum, les revenus d'activité sont déduits en totalité de la pension."
  },
  {
    id: 'second-niveau-cumul-integral-ou-cumul-plafonne',
    titre: "Dans quels cas ?",
    fichesEntree: ['cumul-integral-ou-cumul-plafonne'],
    corps: "Ces trois situations décrivent les règles prévues pour les départs à partir du début de l'année qui vient ; avant, la distinction actuelle s'applique. Premier cas : la personne part avant l'âge légal minimum, et ses revenus d'activité sont déduits en totalité de sa pension. Deuxième cas : la personne part entre l'âge légal et un âge plus avancé, et elle cumule tant que ses revenus restent sous un plafond, la pension étant réduite au-delà. Troisième cas : la personne part à cet âge plus avancé ou après, et elle cumule sans plafond, avec de nouveaux droits à retraite."
  },
  {
    id: 'second-niveau-delais-qui-protegent',
    titre: "Pourquoi ça compte",
    fichesEntree: ['delais-qui-protegent'],
    corps: "Après la signature d'une rupture conventionnelle, chaque partie dispose d'un délai de rétractation, puis l'administration dispose d'un délai pour vérifier la validité de la convention. En période d'essai, le délai de prévenance dépend de la durée de présence du salarié dans l'entreprise : plus cette durée est longue, plus le délai est long. Ces délais fixent des repères connus à l'avance pour chacun."
  },
  {
    id: 'second-niveau-delegue-syndical',
    titre: "Précisions",
    fichesEntree: ['delegue-syndical'],
    corps: "Quand un syndicat est représentatif dans l'entreprise, il désigne un délégué syndical. Le rôle et les moyens d'action du délégué diffèrent selon l'effectif de l'entreprise. Pour être représentatif, un syndicat doit réunir plusieurs critères : respect des valeurs républicaines, indépendance, transparence financière, ancienneté, influence, effectifs d'adhérents et cotisations, audience aux élections professionnelles."
  },
  {
    id: 'second-niveau-demission-legitime',
    titre: "Précisions",
    fichesEntree: ['demission-legitime'],
    corps: "C'est France Travail qui peut considérer la démission comme légitime. Dans ce cas, le salarié peut prétendre à l'allocation chômage dans les conditions habituelles. Hors cas légitime, la démission ne permet pas de garder la complémentaire santé à la fin du contrat de travail. À la fin du préavis, l'employeur remet un certificat de travail, un reçu pour solde de tout compte et l'attestation destinée à France Travail."
  },
  {
    id: 'second-niveau-depart-volontaire-ou-mise-a-la-retraite',
    titre: "Dans quels cas ?",
    fichesEntree: ['depart-volontaire-ou-mise-a-la-retraite'],
    corps: "Dans les deux cas, un préavis est dû, de la même durée que pour un licenciement. Quand c'est la personne qui demande à partir, on parle de départ volontaire : l'indemnité ne peut être accordée qu'une seule fois, au moment où elle demande sa pension de retraite de base. Quand c'est l'employeur qui décide, la personne a droit à une indemnité de mise à la retraite. Sur un courrier, regarder qui a pris l'initiative aide à savoir de quelle situation il s'agit."
  },
  {
    id: 'second-niveau-discrimination',
    titre: "Exemples concrets",
    fichesEntree: ['discrimination'],
    corps: "Un employeur qui refuse d'embaucher quelqu'un à cause de son origine commet une discrimination. La loi protège aussi les stagiaires, les apprentis et les candidats à un emploi, à un stage ou à une formation. Une personne qui pense en être victime peut saisir gratuitement le Défenseur des droits, par téléphone ou en ligne, et ces échanges sont confidentiels. Il est préférable de garder des éléments, si possible datés, pour pouvoir montrer les faits."
  },
  {
    id: 'second-niveau-discrimination-ou-difference-de-traitement',
    titre: "Dans quels cas ?",
    fichesEntree: ['discrimination-ou-difference-de-traitement'],
    corps: "Premier cas : un employeur écarte un candidat à cause de son nom ou de son lieu de résidence, qui sont des critères interdits. C'est une discrimination. Deuxième cas : certains rôles d'artiste ou de mannequin peuvent être réservés à une femme ou à un homme, et l'accès à certains emplois peut être refusé à un travailleur trop jeune pour des raisons de sécurité. La loi admet ces différences, car elles sont justifiées. Troisième cas : une différence liée à la santé ou au handicap n'est admise que si un médecin l'a constatée et si elle est nécessaire et appropriée."
  },
  {
    id: 'second-niveau-entretien-prealable',
    titre: "Précisions",
    fichesEntree: ['entretien-prealable'],
    corps: "La convocation est envoyée par lettre recommandée avec accusé de réception, ou remise en main propre contre décharge. Elle indique l'objet de l'entretien, le jour, l'heure et le lieu. Le salarié peut venir avec un autre salarié de l'entreprise. Quand l'entreprise n'a pas de représentants du personnel, il peut aussi se faire assister par un conseiller extérieur : la lettre doit alors donner les coordonnées de la mairie et de l'inspection du travail, où l'on trouve la liste de ces conseillers."
  },
  {
    id: 'second-niveau-homologation-rupture-conventionnelle',
    titre: "Précisions",
    fichesEntree: ['homologation-rupture-conventionnelle'],
    corps: "La demande d'homologation se fait en ligne, par un téléservice dédié. Si la personne ne peut pas l'utiliser, elle prévient la DDETSPP, et un formulaire papier peut alors être déposé, à titre exceptionnel. La date de fin du contrat ne peut pas être fixée avant le lendemain du jour de l'homologation. Si l'employeur ou le salarié conteste ensuite la convention, l'homologation ou son refus, il saisit le conseil de prud'hommes dans un délai limité. Les salariés protégés suivent une autre procédure."
  },
  {
    id: 'second-niveau-indemnite-depart-volontaire-retraite',
    titre: "Précisions",
    fichesEntree: ['indemnite-depart-volontaire-retraite'],
    corps: "Elle ne peut être accordée qu'une seule fois. Elle est due quand la personne demande sa pension de retraite de base, dans le cadre d'un départ volontaire. Pour le calcul, on retient le salaire le plus avantageux entre deux modes de calcul. Un simulateur permet de connaître le montant selon la convention collective de l'entreprise."
  },
  {
    id: 'second-niveau-indemnite-legale-de-licenciement',
    titre: "Précisions",
    fichesEntree: ['indemnite-legale-de-licenciement'],
    corps: "Elle est due en cas de licenciement pour motif personnel, pour motif économique ou pour inaptitude, et aussi en cas de cessation ou de dissolution de l'entreprise, sauf force majeure. Pour une faute grave ou lourde, elle n'est pas versée, sauf si une convention collective, le contrat de travail ou un usage le prévoit. Si le salarié décède après la notification du licenciement, elle est versée à ses ayants droit. Un simulateur permet de retrouver sa convention collective avec le nom de l'entreprise ou son numéro Siret."
  },
  {
    id: 'second-niveau-licenciement-procedure-employeur',
    titre: "Précisions",
    fichesEntree: ['licenciement-procedure-employeur'],
    corps: "Les étapes se suivent dans cet ordre : convocation à un entretien préalable, entretien, puis lettre de licenciement. La convocation est envoyée par lettre recommandée avec accusé de réception, ou remise en main propre contre décharge. Des délais doivent être respectés entre les étapes, et la procédure varie selon que le motif est disciplinaire ou non. Le salarié peut se faire assister pendant l'entretien."
  },
  {
    id: 'second-niveau-mise-a-la-retraite',
    titre: "Précisions",
    fichesEntree: ['mise-a-la-retraite'],
    corps: "Quand l'employeur décide de mettre d'office un salarié à la retraite, celui-ci a droit à une indemnité de mise à la retraite et à un préavis de même durée que pour un licenciement. Quand c'est le salarié qui demande à partir, on parle de départ volontaire, avec une autre indemnité. Savoir qui a pris l'initiative aide à comprendre à quelle indemnité on peut prétendre."
  },
  {
    id: 'second-niveau-oeth',
    titre: "Précisions",
    fichesEntree: ['oeth'],
    corps: "Une personne peut être comptée parmi les bénéficiaires de l'obligation d'emploi sans avoir la RQTH, par exemple si elle perçoit l'allocation aux adultes handicapés ou si elle a la carte mobilité inclusion avec mention invalidité. Une attestation est délivrée en même temps que la notification de la décision, et elle permet de faire valoir ses droits auprès des employeurs. Pour une personne reconnue RQTH, la notification de la MDPH tient lieu d'attestation."
  },
  {
    id: 'second-niveau-offre-raisonnable-d-emploi',
    titre: "Précisions",
    fichesEntree: ['offre-raisonnable-d-emploi'],
    corps: "Les éléments précis de l'offre raisonnable sont définis avec le conseiller France Travail, dans un délai fixé après la signature du contrat d'engagement. Ce contrat précise aussi les droits de la personne quand elle accepte ou refuse une offre. Il indique les voies et délais de recours en cas de sanction, donc la personne sait à l'avance comment contester."
  },
  {
    id: 'second-niveau-portabilite-mutuelle',
    titre: "Précisions",
    fichesEntree: ['portabilite-mutuelle'],
    corps: "Pour en bénéficier, la personne justifie auprès de la mutuelle qu'elle est prise en charge par l'assurance chômage. L'attestation nécessaire se trouve dans son espace personnel France Travail, au format numérique. L'employeur signale le maintien des garanties dans le certificat de travail et informe la mutuelle. À la fin de la portabilité, l'organisme assureur adresse une proposition de maintien à titre individuel, et il faut le prévenir quand les allocations chômage s'arrêtent."
  },
  {
    id: 'second-niveau-prescription-delai',
    titre: "Précisions",
    fichesEntree: ['prescription-delai'],
    corps: "Le délai se calcule à partir d'un point de départ précis. Pour une rupture du contrat de travail, c'est la date de notification de la rupture. Passé le délai, les faits sont dits « prescrits » : pour que l'action soit recevable, il faut saisir le conseil de prud'hommes dans le délai prévu. Ce conseil est le seul tribunal compétent pour un litige individuel avec son employeur, y compris pour un apprenti ou une personne en contrat aidé."
  },
  {
    id: 'second-niveau-rehabilitation',
    titre: "Précisions",
    fichesEntree: ['rehabilitation'],
    corps: "La réhabilitation légale concerne une peine déjà exécutée et ne demande aucune démarche à la personne condamnée. Avant l'effacement automatique, il est possible de demander la non-inscription ou l'effacement d'une mention sur certains bulletins du casier judiciaire. La réhabilitation judiciaire se demande après avoir attendu un délai qui varie selon la peine, et elle efface les condamnations des bulletins concernés."
  },
  {
    id: 'second-niveau-rqth-ou-oeth',
    titre: "Dans quels cas ?",
    fichesEntree: ['rqth-ou-oeth'],
    corps: "Premier cas : une personne en emploi avec une RQTH peut demander des horaires aménagés ou un poste adapté, par exemple avec du matériel spécifique. Deuxième cas : une personne qui cherche un emploi peut accéder à plusieurs aides et dispositifs, comme l'emploi accompagné ou certains stages de réadaptation. Troisième cas : la RQTH n'est pas obligatoire pour travailler, et la déclarer à l'employeur ne l'est pas non plus. Si la personne choisit de le faire, l'employeur peut mettre en place les aménagements nécessaires."
  },
  {
    id: 'second-niveau-saisie-sur-salaire',
    titre: "Précisions",
    fichesEntree: ['saisie-sur-salaire'],
    corps: "Le salarié ne reçoit plus qu'une partie de son salaire, mais la somme versée ne peut jamais être inférieure à un minimum appelé solde bancaire insaisissable. Tout commence par un commandement de payer, délivré par un commissaire de justice. La personne dispose d'un délai court pour payer la dette, et elle peut contester le commandement devant le juge de l'exécution. À l'audience, le juge tente de mettre d'accord le créancier et la personne, par exemple en accordant des délais de paiement ou en prévoyant des paiements partiels."
  },
  {
    id: 'second-niveau-titre-de-sejour-ou-autorisation-de-travail',
    titre: "Exemples concrets",
    fichesEntree: ['titre-de-sejour-ou-autorisation-de-travail'],
    corps: "Premier exemple : avec un visa long séjour valant titre de séjour ou une carte de séjour « vie privée et familiale », la personne peut travailler comme salariée, et l'employeur est dispensé de demander une autorisation de travail. Deuxième exemple : avec une carte « talent », la personne peut exercer l'activité qui lui a permis de l'obtenir, et l'employeur est aussi dispensé de la demande. Avant l'embauche, l'employeur vérifie auprès de la préfecture que le titre est authentique, sauf si la personne est inscrite comme demandeur d'emploi à France Travail. La page précise qu'elle ne concerne pas les ressortissants algériens."
  },
  {
    id: 'second-niveau-besoins-en-main-d-oeuvre',
    titre: "Précisions",
    fichesEntree: ['besoins-en-main-d-oeuvre'],
    corps: "La page de France Travail présente les métiers qui recrutent le plus, d'après les intentions d'embauche des employeurs. Elle cite par exemple les aides de cuisine, les serveurs, les agents d'entretien, les aides à domicile et les aides-soignants. Elle précise aussi que, pour les viticulteurs et les arboriculteurs, la très grande majorité des recrutements sont saisonniers."
  },
  {
    id: 'second-niveau-chomage-au-sens-du-bit',
    titre: "Précisions",
    fichesEntree: ['chomage-au-sens-du-bit'],
    corps: "L'Insee précise que les démarches de recherche prises en compte sont variées : étudier des annonces, se rendre à un salon professionnel, mobiliser son réseau ou prendre conseil auprès de France Travail. Une personne qui a déjà trouvé un emploi qui commence bientôt peut aussi être comptée, si elle remplit les autres conditions. Prendre conseil auprès de France Travail n'est donc qu'une démarche parmi d'autres."
  },
  {
    id: 'second-niveau-chomage-recensement',
    titre: "Précisions",
    fichesEntree: ['chomage-recensement'],
    corps: "L'Insee retient deux groupes. Le premier réunit les personnes qui se sont déclarées chômeuses, inscrites ou non auprès du service public de l'emploi, sauf si elles ont dit ne pas chercher de travail. Le second réunit celles qui ne se sont déclarées spontanément ni en emploi ni au chômage, mais qui ont dit chercher un emploi. L'Insee précise qu'une personne comptée ici n'est pas forcément chômeuse au sens du Bureau international du travail, et inversement."
  },
  {
    id: 'second-niveau-correction-variations-saisonnieres',
    titre: "Exemples concrets",
    fichesEntree: ['correction-variations-saisonnieres'],
    corps: "L'Insee donne l'exemple des ventes de jouets, qui augmentent toujours fortement entre novembre et décembre, à cause de Noël. Sur les données brutes, cet effet masque l'évolution réelle de l'année. Une fois l'effet de Noël retiré, les ventes peuvent s'avérer en baisse, signe d'une moins bonne année. On comprend ainsi pourquoi un même chiffre peut être présenté « brut » ou « corrigé »."
  },
  {
    id: 'second-niveau-demandeur-emploi-categories',
    titre: "Précisions",
    fichesEntree: ['demandeur-emploi-categories'],
    corps: "Deux autres catégories existent. En catégorie D, la personne n'est pas tenue de faire des actes positifs de recherche d'emploi, par exemple parce qu'elle est en stage, en formation ou malade, et elle n'a pas d'emploi. En catégorie E, elle n'est pas tenue d'en faire non plus et elle a un emploi, par exemple en contrat aidé. Une personne inscrite qui suit une formation peut donc relever de la catégorie D plutôt que de A, B ou C."
  },
  {
    id: 'second-niveau-demandeur-emploi-longue-duree',
    titre: "Nuance utile",
    fichesEntree: ['demandeur-emploi-longue-duree'],
    corps: "Le glossaire de France Travail en donne une définition statistique qui s'appuie sur la catégorie A et sur une période récente qui se déplace, plutôt que sur la seule date d'inscription. À lire comme un repère de statistiques, jamais comme un jugement sur la personne."
  },
  {
    id: 'second-niveau-economie-presentielle',
    titre: "Précisions",
    fichesEntree: ['economie-presentielle'],
    corps: "L'Insee explique que la sphère présentielle est tournée vers les besoins des personnes présentes sur le territoire, qu'elles y résident ou qu'elles y passent, et qu'elle répond à une demande locale. L'économie productive, elle, est ouverte à la concurrence internationale et sert des besoins qui dépassent la zone. Dans l'étude de l'Insee sur les zones d'emploi, les effectifs de la sphère présentielle ont augmenté dans toutes les zones, mais à des rythmes très différents."
  },
  {
    id: 'second-niveau-emploi-franc',
    titre: "Nuance utile",
    fichesEntree: ['emploi-franc'],
    corps: "Si un employeur ou un conseiller en parle, la réponse officielle de service-public est que ce dispositif a pris fin : il ne s'appliquait qu'aux contrats signés jusqu'à une date limite, aujourd'hui passée. La page renvoie vers celle des contrats de travail spécifiques pour connaître d'autres dispositifs d'insertion professionnelle."
  },
  {
    id: 'second-niveau-frr',
    titre: "Exemples concrets",
    fichesEntree: ['frr'],
    corps: "Un employeur situé dans une commune classée peut être exonéré de cotisations patronales quand il embauche en contrat à durée indéterminée, ou en contrat à durée déterminée d'une durée minimale. Il faut qu'il emploie un nombre limité de salariés et qu'il n'ait pas fait de licenciement économique récent. Cette exonération ne se cumule pas avec une aide de l'État à l'emploi pour le même salarié. Un simulateur officiel permet de vérifier si une commune est classée, ou si elle bénéficie encore des effets du zonage."
  },
  {
    id: 'second-niveau-inscription-automatique-france-travail-2025',
    titre: "Précisions",
    fichesEntree: ['inscription-automatique-france-travail-2025'],
    corps: "La personne n'a aucune démarche à faire. Elle reçoit un courrier ou un courriel de France Travail qui confirme l'inscription et donne son numéro, le mot de passe arrivant séparément. Les conditions du RSA ne changent pas, et la déclaration de ressources se fait comme avant. Si elle est déjà suivie par un organisme, son accompagnement continue sans changement. Les jeunes suivis en parcours contractualisé d'accompagnement ou en contrat d'engagement jeune gardent aussi les mêmes conditions et les mêmes contacts."
  },
  {
    id: 'second-niveau-inscrit-a-france-travail-ou-chomeur-bit',
    titre: "Dans quels cas ?",
    fichesEntree: ['inscrit-a-france-travail-ou-chomeur-bit'],
    corps: "Premier cas : une personne qui lit des annonces et se rend à un salon professionnel, sans être inscrite à France Travail, peut être chômeuse au sens du BIT, car ces démarches comptent. Deuxième cas : une personne inscrite qui n'est pas disponible rapidement pour prendre un emploi ne remplit pas les conditions du BIT, même si elle reste inscrite. Ce sont deux outils de mesure différents, pas deux jugements sur la personne."
  },
  {
    id: 'second-niveau-job-dating',
    titre: "Précisions",
    fichesEntree: ['job-dating'],
    corps: "Sur le site « Mes événements emploi », on choisit un événement selon son projet, on lit son détail, puis on s'inscrit en ligne avec son identifiant France Travail. L'invitation arrive par courriel, avec un rappel automatique la veille de la rencontre. Le site est accessible à toutes et à tous, inscrits ou non à France Travail. Les événements peuvent avoir lieu sur place ou à distance, et on y trouve aussi des réunions d'information, des ateliers, des conférences et des visites d'entreprise."
  },
  {
    id: 'second-niveau-metier-en-tension-ou-metier-qui-recrute',
    titre: "Dans quels cas ?",
    fichesEntree: ['metier-en-tension-ou-metier-qui-recrute'],
    corps: "Premier cas : sur la page de France Travail, les aides de cuisine, les serveurs et les agents d'entretien sont cités parmi les métiers où les employeurs prévoient le plus de recrutements. C'est un métier qui recrute beaucoup. Deuxième cas : pour les soudeurs, les bouchers ou les ouvriers en chaudronnerie, la même page indique une part élevée de projets jugés difficiles, signe que les employeurs peinent à trouver des candidats. France Travail ajoute que, dans ce cas, les entreprises ont besoin de candidats et sont prêtes à former."
  },
  {
    id: 'second-niveau-neet',
    titre: "Nuance utile",
    fichesEntree: ['neet'],
    corps: "L'Insee reprend la définition européenne : la formation compte qu'elle soit formelle ou non formelle. Une personne qui suit une formation non formelle n'est donc pas comptée comme NEET. C'est une catégorie de statistiques, pas un jugement sur la personne."
  },
  {
    id: 'second-niveau-periode-essai-cote-employeur',
    titre: "Précisions",
    fichesEntree: ['periode-essai-cote-employeur'],
    corps: "La période d'essai n'est pas imposée par la loi : elle s'applique seulement si le contrat de travail ou la lettre d'engagement la prévoit. Elle sert aussi au salarié, qui peut apprécier le poste, et il peut rompre librement son contrat pendant ce temps. Du côté de l'employeur, la rupture suppose un délai de prévenance. Le renouvellement demande plusieurs conditions réunies : l'accord de branche étendu le prévoit, le contrat indique clairement cette possibilité, et le salarié donne son accord. Si l'employeur y met fin pour un motif sans lien avec les compétences du salarié, le conseil de prud'hommes peut considérer la rupture comme abusive."
  },
  {
    id: 'second-niveau-population-active',
    titre: "Précisions",
    fichesEntree: ['population-active'],
    corps: "L'Insee appelle population inactive les personnes qui ne travaillent pas et ne cherchent pas activement un emploi, ou qui ne sont pas disponibles rapidement pour en occuper un. Une personne qui cherche un emploi mais ne pourrait pas le commencer rapidement est donc comptée parmi les inactifs. Le taux d'activité rapporte la population active à la population correspondante, ce qui permet de comparer des territoires."
  },
  {
    id: 'second-niveau-prouver-une-competence',
    titre: "Exemples concrets",
    fichesEntree: ['prouver-une-competence'],
    corps: "France Travail conseille d'exprimer un savoir-faire avec un verbe d'action, par exemple « sélectionner et doser les ingrédients » pour un boulanger ou « utiliser un logiciel de retouche photo » pour un graphiste. Ces compétences se valorisent dans le CV et lors d'un entretien. La page renvoie vers MétierScope, un service de France Travail, pour consulter la liste détaillée des compétences à maîtriser dans un métier."
  },
  {
    id: 'second-niveau-savoirs-connaissances',
    titre: "Exemples concrets",
    fichesEntree: ['savoirs-connaissances'],
    corps: "France Travail les décrit comme des connaissances théoriques acquises à l'école et lors des expériences professionnelles. Elle cite par exemple des connaissances techniques en coiffure ou en plomberie, la législation d'un secteur, les langues étrangères ou les langages informatiques. Ces savoirs se mettent en avant dans le CV, à côté des savoir-faire et des savoir-être."
  },
  {
    id: 'second-niveau-taux-d-emploi',
    titre: "Précisions",
    fichesEntree: ['taux-d-emploi'],
    corps: "L'Insee précise que le taux d'emploi rapporte les personnes en emploi à la population totale, et pas seulement aux personnes qui cherchent un travail. Il peut être calculé pour une sous-catégorie de la population : une tranche d'âge, les habitants d'une région ou les titulaires d'un diplôme, par exemple. Cela permet de comparer le taux d'emploi d'un territoire ou d'un groupe avec un autre."
  },
  {
    id: 'second-niveau-zone-d-emploi',
    titre: "Précisions",
    fichesEntree: ['zone-d-emploi'],
    corps: "L'Insee la définit comme un ensemble de communes dans lequel la plupart des actifs résident et travaillent, et où les établissements peuvent trouver l'essentiel de leur main-d'œuvre. Les zones sont de tailles très différentes : les plus petites se trouvent toutes dans les Antilles ou en Corse, et la zone de Paris est de loin la plus grande. Une même commune ne se lit donc pas de la même façon selon la zone dans laquelle elle est classée."
  },
  {
    id: 'second-niveau-cape',
    titre: "Précisions",
    fichesEntree: ['cape'],
    corps: "Le Cape est un contrat écrit entre un porteur de projet de création ou de reprise d'entreprise et une structure accompagnatrice, entreprise ou association, qui s'engage à l'aider. Ce n'est pas un contrat de travail, mais il offre une protection sociale proche de celle des salariés. Il s'adresse notamment aux demandeurs d'emploi, aux bénéficiaires de minima sociaux, aux salariés à temps partiel et aux dirigeants associés uniques d'une EURL ou d'une SASU. Un salarié à temps plein ne peut pas en bénéficier."
  },
  {
    id: 'second-niveau-defaillance-entreprise',
    titre: "Nuance utile",
    fichesEntree: ['defaillance-entreprise'],
    corps: "L'Insee précise qu'il ne faut pas confondre défaillance et cessation. La défaillance renvoie à une procédure judiciaire, alors que la cessation est l'arrêt total de l'activité, et toutes les défaillances n'y aboutissent pas. À l'inverse, toutes les cessations ne passent pas par une défaillance : un entrepreneur individuel peut par exemple s'arrêter parce qu'il part à la retraite. Une annonce de défaillance ne dit donc pas à elle seule que l'entreprise a fermé."
  },
  {
    id: 'second-niveau-entreprise-individuelle-ou-societe',
    titre: "Dans quels cas ?",
    fichesEntree: ['entreprise-individuelle-ou-societe'],
    corps: "Premier cas : une petite activité qui demande peu d'investissement peut s'exercer en entreprise individuelle ou en micro-entreprise, sans notion de capital social ni d'apports, et sans statuts à rédiger. Deuxième cas : pour tout type de projet, une société unipersonnelle comme l'EURL ou la SASU est possible, à condition d'accepter un certain formalisme de constitution et de fonctionnement, avec la rédaction des statuts. Dans ces sociétés, le capital est fixé librement par l'associé dans les statuts."
  },
  {
    id: 'second-niveau-franchise-de-tva',
    titre: "Précisions",
    fichesEntree: ['franchise-de-tva'],
    corps: "Dans la franchise, les factures sont émises sans TVA et portent la mention « TVA non applicable ». En contrepartie, le micro-entrepreneur ne peut pas déduire la TVA payée sur ses achats. Il peut aussi choisir de devenir redevable de la TVA en optant pour le régime réel, ce qui lui permet de la déduire. La franchise se perd lorsque le chiffre d'affaires dépasse les seuils, soit au début de l'année suivante, soit dès le jour où le seuil majoré est dépassé en cours d'année."
  },
  {
    id: 'second-niveau-radiation-d-office-entreprise',
    titre: "Exemples concrets",
    fichesEntree: ['radiation-d-office-entreprise'],
    corps: "Un cas précis est décrit par service-public : une société qui n'a pas déclaré, ou pas mis à jour, ses bénéficiaires effectifs peut être radiée d'office du registre du commerce par le greffier. Cela n'arrive qu'après une mise en demeure envoyée par lettre recommandée, à l'issue d'un délai. Le greffier doit alors prévenir le ministère public et l'Inpi. Une radiation d'office peut donc venir d'une démarche administrative non faite, sans lien avec la fermeture de l'activité."
  },
  {
    id: 'second-niveau-salarie-ou-travailleur-non-salarie',
    titre: "Dans quels cas ?",
    fichesEntree: ['salarie-ou-travailleur-non-salarie'],
    corps: "Premier cas : une personne qui travaille sous les directives d'un employeur, qui peut en contrôler l'exécution et sanctionner les manquements, est salariée. Elle a droit à une rémunération au moins égale au Smic, aux congés payés, à l'indemnité légale de licenciement et à l'assurance chômage. Deuxième cas : une personne qui définit elle-même ses tarifs, sa clientèle et ses horaires est indépendante et ne bénéficie pas de la protection du droit du travail. Le critère principal qui les distingue est le lien de subordination."
  },
  {
    id: 'second-niveau-siren-ou-siret',
    titre: "Exemples concrets",
    fichesEntree: ['siren-ou-siret'],
    corps: "Le Siret donne une indication géographique que le Siren ne donne pas. Une entreprise avec un siège et deux magasins a un seul Siren, mais trois Siret : un pour le siège et un pour chaque magasin. Pour un entrepreneur individuel qui exerce deux activités dans des établissements différents, il y a aussi un seul Siren et autant de Siret que d'établissements. C'est pourquoi on demande souvent le Siret du siège dans les démarches."
  },
  {
    id: 'second-niveau-travailleur-non-salarie',
    titre: "Nuance utile",
    fichesEntree: ['travailleur-non-salarie'],
    corps: "France Travail indique qu'un travailleur non salarié dont l'activité a cessé de manière définitive et involontaire, pour l'un des motifs prévus par la loi, peut avoir droit à l'allocation des travailleurs indépendants. Elle est versée pour une durée limitée et non renouvelable, si toutes les conditions sont remplies. Cela nuance l'idée qu'un indépendant n'aurait aucune protection en cas d'arrêt d'activité."
  },
  {
    id: 'second-niveau-vente-fonds-de-commerce',
    titre: "Précisions",
    fichesEntree: ['vente-fonds-de-commerce'],
    corps: "Selon service-public, la vente emporte aussi les contrats de travail, d'assurance et d'édition, et les droits de propriété industrielle comme les marques ou le nom de domaine. Le stock de marchandises n'entre pas dans la valeur du fonds : il est évalué séparément. L'acte de cession doit être publié dans un support d'annonces légales du département, puis le greffier fait paraître un avis au Bodacc. Les créanciers ont ensuite la possibilité de faire opposition au versement du prix."
  },
  {
    id: 'second-niveau-versement-liberatoire',
    titre: "Précisions",
    fichesEntree: ['versement-liberatoire'],
    corps: "Le versement libératoire s'applique sur option expresse du micro-entrepreneur et dépend de conditions : le revenu fiscal de référence du foyer et le chiffre d'affaires hors taxe doivent rester sous des seuils. Même avec cette option, le chiffre d'affaires doit figurer sur la déclaration annuelle de revenus. Les déclarations de chiffre d'affaires se font chaque mois ou chaque trimestre, en ligne, auprès de l'Urssaf."
  },
  {
    id: 'second-niveau-action-de-formation-conventionnee',
    titre: "Précisions",
    fichesEntree: ['action-de-formation-conventionnee'],
    corps: "Sur la page de France Travail « Comment financer ma formation ? », l'AFC est rangée parmi les financements collectifs proposés par France Travail, à côté de la préparation opérationnelle à l'emploi collective portée par les OPCO. Ces formations sont sans reste à charge pour la personne. Les financements individuels, comme l'AIF ou le CPF, fonctionnent au contraire sur devis. Une fois la formation repérée, la page invite à contacter l'organisme de formation pour un rendez-vous d'information."
  },
  {
    id: 'second-niveau-aif',
    titre: "Dans quels cas ?",
    fichesEntree: ['aif'],
    corps: "Pour faire la demande, on réclame d'abord un devis à l'organisme de formation. Si la personne le valide, elle transmet la demande de prise en charge à France Travail, et le conseiller l'étudie en cohérence avec son projet de retour à l'emploi. Deux situations sont prévues : un ou plusieurs financements existent mais ne couvrent pas tous les frais pédagogiques, et l'AIF paie le reste à charge ; ou aucun financement n'est possible, et l'AIF peut prendre en charge la totalité des frais pédagogiques."
  },
  {
    id: 'second-niveau-alphabetisation-ou-fle',
    titre: "Dans quels cas ?",
    fichesEntree: ['alphabetisation-ou-fle'],
    corps: "Premier cas : une personne qui n'a pas appris à lire et à écrire, parce qu'elle n'est jamais allée à l'école, relève de l'analphabétisme. Deuxième cas : une personne scolarisée en français qui, adulte, reste en grande difficulté avec la lecture, l'écriture, le calcul ou le numérique, relève de l'illettrisme. Troisième cas : une personne étrangère qui doit apprendre le français relève du français langue étrangère. L'agence nationale de lutte contre l'illettrisme précise qu'il s'agit de trois notions distinctes."
  },
  {
    id: 'second-niveau-aref-ou-rfft',
    titre: "Dans quels cas ?",
    fichesEntree: ['aref-ou-rfft'],
    corps: "Premier cas : une personne qui touche l'allocation chômage et suit une formation validée par France Travail reçoit l'Aref, dont le montant brut est le même que celui de son allocation. Elle est exonérée de CSG et de CRDS, et seule la participation au financement de la retraite complémentaire est prélevée. Deuxième cas : une personne qui ne touche pas ou plus l'allocation le jour de son inscription en formation peut, sous conditions, bénéficier de la rémunération des formations de France Travail, que la page nomme RFPE."
  },
  {
    id: 'second-niveau-bourse-sur-criteres-sociaux',
    titre: "Précisions",
    fichesEntree: ['bourse-sur-criteres-sociaux'],
    corps: "Service-public précise que la bourse complète l'aide de la famille et ne remplace pas l'obligation alimentaire des parents. Les conditions portent sur les études, l'âge, les diplômes, la nationalité et les ressources. Si la personne ne peut pas avoir la bourse, elle peut, sous conditions, demander l'aide annuelle d'urgence."
  },
  {
    id: 'second-niveau-cecrl',
    titre: "Exemples concrets",
    fichesEntree: ['cecrl'],
    corps: "Le premier niveau, dit introductif ou de découverte, correspond à savoir se présenter, poser des questions simples et communiquer si l'interlocuteur parle lentement et distinctement et se montre coopératif. Le niveau intermédiaire ou usuel permet de décrire avec des moyens simples sa formation et son environnement immédiat. Le niveau seuil relève de l'utilisateur dit indépendant. Le classement comprend six niveaux, regroupés en trois grandes catégories d'utilisateurs."
  },
  {
    id: 'second-niveau-clea',
    titre: "Précisions",
    fichesEntree: ['clea'],
    corps: "Le certificat est unique et identique pour tous les secteurs professionnels. Il s'adresse principalement aux salariés et aux demandeurs d'emploi sans diplôme. Il couvre plusieurs domaines, dont la communication en français, le calcul et le raisonnement mathématique, le numérique, le travail en équipe et les règles d'hygiène, de sécurité et d'environnement. Les formations liées à chaque domaine peuvent être suivies séparément. Un conseiller en évolution professionnelle peut accompagner gratuitement la démarche."
  },
  {
    id: 'second-niveau-competences-de-base',
    titre: "Précisions",
    fichesEntree: ['competences-de-base'],
    corps: "L'agence nationale de lutte contre l'illettrisme les décrit à partir des situations simples de la vie de tous les jours : lire, écrire, calculer, utiliser le numérique. Son site propose des rubriques « Je m'informe », « Je me forme » et « Je veux aider un proche », et indique un numéro d'appel gratuit."
  },
  {
    id: 'second-niveau-cpf-plafonds-2026',
    titre: "Exemples concrets",
    fichesEntree: ['cpf-plafonds-2026'],
    corps: "Exemple avec le permis de conduire. Un salarié qui n'a aucun financement externe ne peut mobiliser son CPF que pour un permis poids lourds ou transport de personnes, sans plafond. Un salarié qui bénéficie d'un financement ou un demandeur d'emploi peut aussi l'utiliser pour un permis de conduire léger, avec un plafond."
  },
  {
    id: 'second-niveau-diplomes-de-francais',
    titre: "Exemples concrets",
    fichesEntree: ['diplomes-de-francais'],
    corps: "Pour une première carte de séjour pluriannuelle ou une première carte de résident, la personne doit justifier d'une maîtrise de la langue française. Le niveau requis peut être prouvé par un diplôme, une certification professionnelle ou une certification linguistique, selon les conditions de la page officielle. La réussite à un examen civique est aussi obligatoire. Une personne handicapée ou malade peut obtenir des aménagements, voire une dispense, sur certificat médical."
  },
  {
    id: 'second-niveau-illettrisme-ou-illectronisme',
    titre: "Exemples concrets",
    fichesEntree: ['illettrisme-ou-illectronisme'],
    corps: "L'agence nationale donne un exemple d'illectronisme : une personne qui n'a jamais eu à utiliser le numérique et qui doit apprendre à se servir d'une souris ou d'un système d'exploitation. La notion se rapporte à la maîtrise des compétences numériques, pas seulement au fait d'avoir du matériel ou une connexion. L'illettrisme, lui, concerne la lecture, l'écriture et le calcul chez une personne scolarisée en français."
  },
  {
    id: 'second-niveau-oepre',
    titre: "Précisions",
    fichesEntree: ['oepre'],
    corps: "La fiche du ministère de l'Intérieur présente le dispositif comme commun avec le ministère de l'Éducation nationale, pour les parents étrangers. C'est une démarche volontaire, pour les parents qui souhaitent s'inscrire aux ateliers. Il leur donne des outils pour la réussite scolaire de leurs enfants et facilite aussi leur intégration. Les ateliers ont lieu dans les écoles, collèges et lycées, partout en France, en semaine."
  },
  {
    id: 'second-niveau-prepa-apprentissage',
    titre: "Exemples concrets",
    fichesEntree: ['prepa-apprentissage'],
    corps: "La prépa-apprentissage peut prendre plusieurs formes : quelques jours d'immersion dans un métier, une remise à niveau, des cours sur le savoir-être en entreprise. On y fait aussi des rencontres avec des professionnels, des visites de lieux de travail comme des ateliers ou des usines, et des ateliers pour rédiger un CV et une lettre de motivation. Pour un jeune qui ne maîtrise pas encore bien le français, des cours de langue sont prévus. La page de France Travail qui le décrit est ancienne : le contenu actuel peut avoir évolué."
  },
  {
    id: 'second-niveau-projet-transition-professionnelle',
    titre: "Précisions",
    fichesEntree: ['projet-transition-professionnelle'],
    corps: "La formation demandée n'a pas besoin d'être en rapport avec l'activité actuelle du salarié, et tout salarié peut en faire la demande. La demande se fait par écrit à l'employeur, de préférence par lettre recommandée avec accusé de réception, avec le nom de la formation, sa date, sa durée et l'organisme. Si l'employeur ne répond pas dans le délai prévu, l'autorisation est considérée comme accordée. Il peut reporter le départ pour une durée limitée, mais seulement en expliquant les conséquences préjudiciables à la production."
  },
  {
    id: 'second-niveau-reste-a-charge-formation',
    titre: "Précisions",
    fichesEntree: ['reste-a-charge-formation'],
    corps: "Pour un demandeur d'emploi, Mon compte formation indique que France Travail peut accorder, sous certaines conditions, un financement complémentaire pour payer le reste à charge. Si la prise en charge est acceptée, l'inscription en formation est automatiquement validée. Avant de déposer sa demande, il faut aussi s'assurer que sa rémunération est garantie pendant toute la durée de la formation."
  },
  {
    id: 'second-niveau-rncp-ou-rs',
    titre: "Dans quels cas ?",
    fichesEntree: ['rncp-ou-rs'],
    corps: "France compétences, qui tient les deux répertoires, les distingue ainsi : le RNCP regroupe les certifications qui attestent les connaissances et compétences nécessaires à l'exercice d'un métier, le RS celles qui correspondent à une compétence professionnelle complémentaire. Pour que la formation soit éligible au CPF, elle doit mener à une certification inscrite dans l'un des deux. Les certifications du RS se préparent en général par des formations plus courtes que celles du RNCP."
  },
  {
    id: 'second-niveau-rs',
    titre: "Précisions",
    fichesEntree: ['rs'],
    corps: "France compétences précise qu'une certification ne se confond pas avec une action de formation : la formation est une façon de se préparer à la certification. D'autres actions sont aussi éligibles au CPF en dehors des deux répertoires, par exemple la validation des acquis de l'expérience, les bilans de compétences et la préparation aux épreuves du permis de conduire. Avant de s'inscrire, on peut donc vérifier si la certification visée figure bien au répertoire."
  },
  {
    id: 'second-niveau-credit-conso-nouvelles-regles-2026',
    titre: "Précisions",
    fichesEntree: ['credit-conso-nouvelles-regles-2026'],
    corps: "Service-public explique que le but est de mieux protéger l'emprunteur pendant toute la durée du crédit. Les offres donnent une information plus claire avant la signature : coût total du crédit, conséquences d'un défaut de paiement, voies de recours possibles. La banque doit aussi pouvoir démontrer comment elle a évalué la situation de l'emprunteur, et orienter gratuitement les personnes en difficulté vers des services de conseil indépendants. Ces règles s'appliquent à partir d'une date précisée sur la page d'actualité."
  },
  {
    id: 'second-niveau-permis-a-1-euro-par-jour',
    titre: "Précisions",
    fichesEntree: ['permis-a-1-euro-par-jour'],
    corps: "La démarche commence dans une école de conduite labellisée, qui a signé la convention avec l'État. Après la signature du contrat de formation, la personne demande le prêt à un établissement financier partenaire ; si elle est mineure, ses représentants légaux font la démarche. L'établissement peut exiger une caution ou un co-emprunteur. En cas d'échec à l'épreuve pratique, le prêt peut aussi financer une formation complémentaire avant de repasser l'épreuve."
  },
  {
    id: 'second-niveau-permis-points',
    titre: "Précisions",
    fichesEntree: ['permis-points'],
    corps: "Les points sont retirés quand l'infraction est établie, par exemple après le paiement de l'amende forfaitaire ou une condamnation définitive. C'est à partir de cette date que court le délai de récupération. Plus l'infraction est grave, plus ce délai est long, et une nouvelle infraction pendant ce temps en change le cours. Pour un permis probatoire, une infraction commise pendant la période probatoire interrompt aussi l'augmentation annuelle des points."
  },
  {
    id: 'second-niveau-permis-suspendu-ou-annule',
    titre: "Dans quels cas ?",
    fichesEntree: ['permis-suspendu-ou-annule'],
    corps: "Service-public présente quatre procédures différentes : l'invalidation, la suspension administrative décidée par le préfet, la suspension judiciaire décidée par le juge, et l'annulation judiciaire. En cas de suspension judiciaire, le permis doit être restitué aux forces de l'ordre. Selon la durée de la suspension, un contrôle médical ou un examen psychotechnique est exigé, et il faut s'y soumettre sans attendre la fin de la période d'interdiction de conduire."
  },
  {
    id: 'second-niveau-recevabilite',
    titre: "Précisions",
    fichesEntree: ['recevabilite'],
    corps: "La commission examine l'état des dettes, leur nature et la bonne foi de la personne, et elle peut demander des renseignements par téléphone ou par courrier. Le fait d'être propriétaire de son logement ne suffit pas à rendre le dossier irrecevable. Si le dossier est recevable, la décision est notifiée par courrier recommandé à la personne, à ses créanciers et aux établissements qui gèrent ses comptes ; s'il est irrecevable, seule la personne qui a déposé le dossier est informée, avec les motifs. Dans les deux cas, la décision peut être contestée."
  },
  {
    id: 'second-niveau-acheteur-public',
    titre: "Précisions",
    fichesEntree: ['acheteur-public'],
    corps: "Service-public distingue deux grandes catégories d'acheteurs : les pouvoirs adjudicateurs, comme l'État, les collectivités et les établissements publics, et les entités adjudicatrices, qui exercent une activité de réseau comme l'eau, le gaz, l'électricité, les transports ou les services postaux. Les sociétés d'économie mixte et les sociétés publiques locales doivent aussi respecter les principes de la commande publique."
  },
  {
    id: 'second-niveau-allotissement',
    titre: "Précisions",
    fichesEntree: ['allotissement'],
    corps: "En principe, l'acheteur divise le marché en lots séparés et autonomes, pour favoriser la concurrence. Il existe des dérogations, ainsi que des marchés globaux en lot unique. Par ailleurs, certains marchés ou certains lots peuvent être réservés à des structures d'insertion : un lot peut donc être réservé alors que le reste du marché reste ouvert à tous."
  },
  {
    id: 'second-niveau-co-traitance',
    titre: "Précisions",
    fichesEntree: ['co-traitance'],
    corps: "Un groupement d'entreprises est un accord momentané pour présenter une offre commune à un marché auquel les entreprises ne pourraient pas candidater seules. Chaque membre est cotraitant et en relation contractuelle directe avec l'acheteur. Le groupement n'a pas la personnalité morale, et il désigne un mandataire, interlocuteur de l'acheteur pendant l'exécution. Il peut être solidaire, où chaque membre répond de l'ensemble du marché, conjoint, où chacun répond de sa part, ou conjoint avec mandataire solidaire."
  },
  {
    id: 'second-niveau-marche-public',
    titre: "Précisions",
    fichesEntree: ['marche-public'],
    corps: "Il existe trois types de marchés : de travaux, de fournitures et de services, par exemple le nettoyage de locaux. En principe, toute entreprise peut se porter candidate, quelle que soit sa forme juridique ou sa taille, et plusieurs entreprises peuvent s'associer. Elle doit toutefois être à jour de ses obligations fiscales et sociales et ne pas être en liquidation judiciaire. Les règles sont fixées par le Code de la commande publique."
  },
  {
    id: 'second-niveau-marche-reserve',
    titre: "Précisions",
    fichesEntree: ['marche-reserve'],
    corps: "Les structures concernées sont les entreprises adaptées, les ESAT, les structures d'insertion par l'activité économique, les entreprises implantées en établissement pénitentiaire et les entreprises de l'économie sociale et solidaire. Ces structures doivent employer une proportion minimale de personnes handicapées, défavorisées ou détenues, fixée par les textes. Service-public précise qu'un marché ou un lot peut être réservé."
  },
  {
    id: 'second-niveau-moins-disant-ou-mieux-disant',
    titre: "Précisions",
    fichesEntree: ['moins-disant-ou-mieux-disant'],
    corps: "Service-public emploie l'expression « offre économiquement la plus avantageuse » pour désigner le choix de l'acheteur. Les candidats sont informés dès la publicité des critères qui serviront à choisir. Tout candidat dont l'offre est rejetée doit recevoir les motifs du rejet. Cela permet à une entreprise de comprendre pourquoi elle n'a pas été retenue."
  },
  {
    id: 'second-niveau-sous-traitance',
    titre: "Précisions",
    fichesEntree: ['sous-traitance'],
    corps: "La sous-traitance totale est interdite : le titulaire peut seulement confier une partie de l'exécution. Elle est possible pour des travaux et des services, pas pour un marché de fournitures, sauf pour la pose ou l'installation. Le candidat remplit une déclaration de sous-traitance et le sous-traitant doit être accepté par l'acheteur. Ce sous-traitant peut être une entreprise adaptée, un ESAT, une structure d'insertion par l'activité économique ou une entreprise de l'économie sociale et solidaire."
  },
  {
    id: 'second-niveau-sous-traitance-ou-co-traitance',
    titre: "Dans quels cas ?",
    fichesEntree: ['sous-traitance-ou-co-traitance'],
    corps: "Premier cas : une petite entreprise sait qu'elle ne peut pas répondre seule à un gros marché. Elle peut s'associer à d'autres en groupement, et tous les membres sont alors en relation contractuelle avec l'acheteur. Deuxième cas : une entreprise titulaire du marché confie une partie de l'exécution à une autre ; il y a alors deux contrats distincts, et le sous-traitant n'est lié qu'au titulaire. Dans un groupement, un mandataire est l'interlocuteur de l'acheteur."
  },
  {
    id: 'second-niveau-aah-ou-pension-invalidite',
    titre: "Précisions",
    fichesEntree: ['aah-ou-pension-invalidite'],
    corps: "Pour l'AAH, service-public indique que l'on regarde quatre éléments : le taux d'incapacité fixé par la commission des droits et de l'autonomie des personnes handicapées, l'âge, la résidence et les ressources. Le taux d'incapacité peut être moins élevé si la personne a une restriction substantielle et durable d'accès à un emploi. La page prévoit aussi des règles pour les personnes qui touchent déjà une pension ou une rente, ou qui travaillent, et propose un simulateur pour estimer son droit."
  },
  {
    id: 'second-niveau-aides-au-logement',
    titre: "Précisions",
    fichesEntree: ['aides-au-logement'],
    corps: "Une aide peut être versée, sous conditions, à toute personne qui loue un logement ou qui est résidente en foyer. L'APL est versée en raison du type de logement, c'est-à-dire s'il est conventionné. L'ALF est versée en raison de la situation familiale. L'ALS est versée dans tous les autres cas."
  },
  {
    id: 'second-niveau-are-ou-ass',
    titre: "Dans quels cas ?",
    fichesEntree: ['are-ou-ass'],
    corps: "Premier cas : une personne a épuisé ses droits à l'allocation chômage ou à la rémunération de fin de formation. Pour l'ASS, elle doit aussi être apte au travail et faire des démarches répétées pour retrouver un emploi ou créer ou reprendre une entreprise. Deuxième cas : elle a travaillé assez longtemps avant la fin de son dernier contrat ; cette durée est réduite si elle a cessé son activité pour élever un enfant. Dans les deux cas, l'ASS est accordée si les ressources mensuelles ne dépassent pas un plafond."
  },
  {
    id: 'second-niveau-ass',
    titre: "Précisions",
    fichesEntree: ['ass'],
    corps: "Les périodes de travail prises en compte sont variées : contrat à durée indéterminée ou déterminée, intérim, alternance, en France ou en Europe. L'allocation est intégralement cumulable avec les revenus d'une reprise d'activité pendant une durée limitée, dans la limite des droits restants ; si l'activité se poursuit, le versement est interrompu et la prime d'activité peut être demandée. Une personne qui a assez de trimestres pour une retraite à taux plein ne peut pas la toucher. Il n'y a pas d'âge minimum."
  },
  {
    id: 'second-niveau-complementaire-sante-collective',
    titre: "Précisions",
    fichesEntree: ['complementaire-sante-collective'],
    corps: "L'employeur doit en faire bénéficier tous ses salariés, quelle que soit leur ancienneté dans l'entreprise. Un salarié peut toutefois être dispensé d'y adhérer dans certaines situations. Si l'employeur n'a pas souscrit de complémentaire santé, le salarié peut saisir le conseil de prud'hommes. Un particulier qui emploie un salarié à domicile n'est pas concerné."
  },
  {
    id: 'second-niveau-css',
    titre: "Précisions",
    fichesEntree: ['css'],
    corps: "La complémentaire santé solidaire est gratuite ou payante selon le niveau des revenus. Elle prend en charge intégralement les dépenses de santé, dans la limite des tarifs de la Sécurité sociale. La page indique aussi qu'il n'y a pas de dépassements d'honoraires et que le forfait journalier est remboursé en cas d'hospitalisation. Ces informations concernent le cas général : les règles diffèrent en Alsace-Moselle, dans les départements d'outre-mer et à Mayotte."
  },
  {
    id: 'second-niveau-monoparentalite',
    titre: "Précisions",
    fichesEntree: ['monoparentalite'],
    corps: "Pour avoir droit à l'ASF, il faut vivre seul, résider en France et avoir au moins un enfant à charge dont l'autre parent ne participe plus à l'entretien, ou verse une pension alimentaire inférieure à un seuil. L'allocation est supprimée si la personne vit en couple. Si une pension alimentaire a été fixée mais n'est pas payée, la Caf ou la MSA peut agir à la place du parent, pour son compte, afin de la récupérer."
  },
  {
    id: 'second-niveau-prevoyance-complementaire',
    titre: "Précisions",
    fichesEntree: ['prevoyance-complementaire'],
    corps: "Un salarié ne peut refuser la prévoyance de son entreprise que dans certains cas, comme pour la mutuelle. Par exemple, il peut demander une dispense s'il est déjà couvert par un autre dispositif collectif de frais de santé, y compris comme ayant droit ; cette dispense ne vaut que pour le remboursement des frais de santé. La demande de dispense peut se faire à l'embauche ou à la date de mise en place des garanties."
  },
  {
    id: 'second-niveau-prime-activite',
    titre: "Précisions",
    fichesEntree: ['prime-activite'],
    corps: "Elle complète les revenus professionnels d'un salarié ou d'un fonctionnaire majeur dont les ressources sont modestes. La demande se fait par un téléservice de la Caf, ou de la MSA pour le régime agricole. Il faut résider en France de manière stable et effective. Un travailleur détaché temporairement en France n'y a pas droit."
  },
  {
    id: 'second-niveau-proche-aidant',
    titre: "Précisions",
    fichesEntree: ['proche-aidant'],
    corps: "Le congé est ouvert à tout salarié. La personne aidée peut être le conjoint ou la personne avec qui le salarié vit en couple, un proche parent, ou une personne âgée ou handicapée avec laquelle le salarié réside ou a des liens étroits et stables. Le salarié intervient à titre non professionnel, de manière régulière et fréquente, pour les actes de la vie quotidienne. La personne aidée doit résider en France de façon stable et régulière."
  },
  {
    id: 'second-niveau-rsa',
    titre: "Précisions",
    fichesEntree: ['rsa'],
    corps: "La demande se fait auprès de la Caf, ou de la MSA pour le régime agricole, avec les justificatifs de ressources des derniers mois. Un élève, un étudiant ou un stagiaire d'entreprise non rémunéré ne peut pas le percevoir, avec une exception pour les parents isolés, sous conditions. L'inscription à France Travail n'a pas d'impact sur le versement du RSA, et la déclaration trimestrielle de ressources continue comme avant. Un contrat d'engagement comportant un plan d'actions est aussi à signer."
  },
  {
    id: 'second-niveau-rsa-ou-prime-activite',
    titre: "Précisions",
    fichesEntree: ['rsa-ou-prime-activite'],
    corps: "La prime d'activité complète les revenus professionnels d'un salarié ou d'un fonctionnaire majeur dont les ressources sont modestes. En cas de changement de résidence, de situation familiale ou professionnelle, il faut prévenir rapidement la Caf. Si les conditions ne sont plus remplies, le versement s'arrête à partir du premier jour du mois concerné."
  },
  {
    id: 'second-niveau-accident-travail-maladie-professionnelle',
    titre: "Exemples concrets",
    fichesEntree: ['accident-travail-maladie-professionnelle'],
    corps: "Le médecin traitant constate que la dégradation de la santé est liée au travail, ce qui permet de lancer la demande de reconnaissance. La maladie peut être reconnue d'origine professionnelle qu'elle figure ou non au tableau des maladies professionnelles. Quand elle y figure, elle est présumée avoir été contractée dans le cadre du travail. Si une condition du tableau n'est pas remplie, ou si la maladie n'y figure pas, la caisse peut quand même la reconnaître, mais il faut suivre la procédure de reconnaissance prévue."
  },
  {
    id: 'second-niveau-visite-d-information-et-de-prevention',
    titre: "Précisions",
    fichesEntree: ['visite-d-information-et-de-prevention'],
    corps: "Elle interroge le salarié sur son état de santé et l'informe sur les risques de son poste et sur les moyens de prévention. Elle sert aussi à repérer si une orientation vers le médecin du travail est nécessaire. Un dossier médical en santé au travail est ouvert. Le médecin du travail n'a pas le droit de transmettre à l'employeur des informations médicales concernant le salarié."
  },
  {
    id: 'second-niveau-agefiph',
    titre: "Exemples concrets",
    fichesEntree: ['agefiph'],
    corps: "L'aide à l'emploi des travailleurs handicapés compense les surcoûts importants liés à l'adaptation d'un poste de travail. Elle est accordée à tout employeur qui embauche un salarié handicapé, et à un travailleur handicapé indépendant. Sauf pour un apprenti, l'employeur doit demander à l'Agefiph la reconnaissance de la lourdeur du handicap. La demande se fait en ligne ou par courrier auprès de l'Agefiph de sa région."
  },
  {
    id: 'second-niveau-aripa',
    titre: "Précisions",
    fichesEntree: ['aripa'],
    corps: "Le service est gratuit. Avec l'intermédiation financière, l'Aripa devient l'interlocuteur pour le versement de la pension : elle la collecte chaque mois auprès du parent qui doit la verser, puis la reverse à l'autre parent. Cela évite des tensions directes entre les parents. Il faut une pension fixée ou homologuée par une décision de justice, et la mise en place est automatique pour les décisions de justice récentes."
  },
  {
    id: 'second-niveau-cae',
    titre: "Précisions",
    fichesEntree: ['cae'],
    corps: "Une CAE est une entreprise à statut coopératif : Scop, Scic ou simple coopérative. Elle prend en charge les obligations fiscales, sociales et comptables de l'activité, ce qui laisse du temps pour développer sa clientèle. Le premier contrat, le Cape, sert à tester l'activité ; si le projet continue, la personne signe un contrat d'entrepreneur salarié et devient salariée associée. La CAE vérifie l'expérience ou les diplômes, que le projet est réfléchi et que la personne est motivée."
  },
  {
    id: 'second-niveau-ccas',
    titre: "Précisions",
    fichesEntree: ['ccas'],
    corps: "Service-public précise que le CCAS accompagne les demandes d'aides sociales pour les personnes âgées, les personnes en grande précarité ou en situation de handicap. Il est obligatoire dans les communes au-dessus d'une certaine taille. Les communautés de communes ou d'agglomération peuvent créer un équivalent intercommunal, le CIAS. Les coordonnées du CCAS de sa commune figurent dans l'annuaire de Service Public ; à défaut, on peut s'adresser à sa mairie."
  },
  {
    id: 'second-niveau-cesf',
    titre: "Précisions",
    fichesEntree: ['cesf'],
    corps: "France Travail décrit un professionnel du social qui évalue la situation sociale et financière d'une personne ou d'une famille et propose des solutions adaptées pour améliorer ses conditions de vie. Il accompagne la mise en œuvre des projets de vie et organise des ateliers sur l'éducation, la santé, la parentalité ou la gestion du budget. Il oriente aussi vers le service approprié en cas de besoin spécifique."
  },
  {
    id: 'second-niveau-cfa',
    titre: "Précisions",
    fichesEntree: ['cfa'],
    corps: "Le contrat d'apprentissage est un contrat de travail écrit qui alterne des périodes de formation en entreprise et en centre de formation d'apprentis. Il est accompagné d'une convention de formation qui indique l'intitulé, les objectifs, la durée, le lieu et le coût de la formation. L'opérateur de compétences statue ensuite sur la prise en charge financière du contrat. Il peut la refuser si le contrat n'est pas conforme, par exemple si l'organisme de formation n'a pas la certification Qualiopi."
  },
  {
    id: 'second-niveau-commission-de-surendettement',
    titre: "Précisions",
    fichesEntree: ['commission-de-surendettement'],
    corps: "Pour déposer un dossier, la personne doit être une personne physique, française ou étrangère vivant en France, ne plus pouvoir payer ses dettes et être de bonne foi. Les dettes peuvent être bancaires, ou courantes comme le loyer, les impôts ou les factures d'énergie. Pour un couple marié, la suspension des saisies empêche de saisir les biens communs. Seule la personne qui a déposé le dossier bénéficie des mesures, donc les créanciers peuvent réclamer les dettes communes à l'autre membre du couple."
  },
  {
    id: 'second-niveau-conseil-de-prud-hommes',
    titre: "Précisions",
    fichesEntree: ['conseil-de-prud-hommes'],
    corps: "Quand une requête est déposée, les parties sont convoquées. Il peut y avoir une séance de conciliation avant le jugement. Le conseil peut aussi ordonner des mesures en urgence, dans une procédure de référé, ou requalifier un contrat, par exemple un contrat à durée déterminée en contrat à durée indéterminée : l'affaire est alors portée directement devant le bureau de jugement. La procédure varie selon l'affaire."
  },
  {
    id: 'second-niveau-defenseur-des-droits',
    titre: "Précisions",
    fichesEntree: ['defenseur-des-droits'],
    corps: "Il peut être saisi en cas de litige avec une administration, une collectivité, un hôpital ou un organisme chargé d'un service public comme la Caf, la CPAM ou France Travail. Avant de le saisir, il faut d'abord essayer de régler le problème à l'amiable, par une réclamation ou un recours administratif. On peut le saisir en ligne, par courrier, ou prendre rendez-vous avec un délégué dans une permanence, par exemple en préfecture ou en maison de justice et du droit. Ses services sont gratuits, mais le saisir ne suspend pas les délais de recours. Il ne peut pas intervenir dans un contrat commercial."
  },
  {
    id: 'second-niveau-ecole-2e-chance',
    titre: "Précisions",
    fichesEntree: ['ecole-2e-chance'],
    corps: "L'inscription se fait tout au long de l'année. Il faut choisir une école du réseau labellisé, puis participer à une réunion d'information collective et à un entretien individuel. La personne participe à l'élaboration de son projet de formation et d'insertion sociale et professionnelle. Elle peut entrer quelle que soit sa nationalité. La limite d'âge est repoussée pour les personnes qui ont la reconnaissance de la qualité de travailleur handicapé."
  },
  {
    id: 'second-niveau-ecole-2e-chance-ou-epide',
    titre: "Dans quels cas ?",
    fichesEntree: ['ecole-2e-chance-ou-epide'],
    corps: "Pour l'Épide, la personne signe un contrat de volontariat pour l'insertion, qui n'est pas un contrat de travail. La vie en centre se fait en internat, avec une discipline et un règlement intérieur stricts. L'hébergement et la restauration sont gratuits, mais les frais de transport restent à la charge de la personne. La sélection passe par une journée de préadmission, un entretien, puis une journée d'admission."
  },
  {
    id: 'second-niveau-entreprise-adaptee',
    titre: "Précisions",
    fichesEntree: ['entreprise-adaptee'],
    corps: "Elle emploie des personnes ayant la RQTH, sans emploi ou menacées de perdre leur emploi à cause de leur handicap. On peut candidater directement auprès d'une entreprise adaptée proche de chez soi, ou être orienté par son conseiller référent emploi. Service-public précise que l'entreprise adaptée n'est pas une structure médico-sociale, à la différence de l'ESAT. Selon la page, elle propose un contrat de travail à durée déterminée."
  },
  {
    id: 'second-niveau-epide',
    titre: "Précisions",
    fichesEntree: ['epide'],
    corps: "Peuvent candidater les jeunes sans diplôme ni qualification qui ont un niveau maximum de CAP ou de BEP, ou qui ont quitté le lycée avant le bac. Ils doivent avoir fait leur journée défense et citoyenneté ou la faire prochainement. Le parcours peut comprendre un projet professionnel, des formations liées à un métier, la préparation au permis de conduire, des activités sportives et des actions de solidarité. La candidature se fait en ligne ou directement auprès d'un centre."
  },
  {
    id: 'second-niveau-esat',
    titre: "Précisions",
    fichesEntree: ['esat'],
    corps: "Un ESAT est une structure médico-sociale. La personne accueillie signe un contrat d'accompagnement par le travail, pas un contrat de travail. L'accompagnement est global : activités à caractère professionnel, soutien éducatif, social et médical. Il peut aussi aider à développer ses compétences, par la formation professionnelle."
  },
  {
    id: 'second-niveau-foyer-jeunes-travailleurs',
    titre: "Précisions",
    fichesEntree: ['foyer-jeunes-travailleurs'],
    corps: "Les logements sont meublés ou non, avec des espaces communs comme un restaurant ou une laverie. Le foyer accueille principalement des jeunes qui exercent une activité professionnelle ou qui sont en voie d'insertion. Il met en œuvre un projet socio-éducatif qui vise l'accès à l'autonomie et au logement indépendant. Il mène aussi des actions dans les domaines de l'emploi, de l'accès aux droits, de la citoyenneté et de la mobilité."
  },
  {
    id: 'second-niveau-france-services',
    titre: "Exemples concrets",
    fichesEntree: ['france-services'],
    corps: "Les conseillers accompagnent gratuitement et sans rendez-vous. Le site cite par exemple la déclaration de revenus, la demande d'aide au logement, le remboursement de soins, le dossier retraite, les papiers d'identité, l'inscription à France Travail, le changement d'adresse, la carte grise et l'aide juridique. Les démarches y sont aussi sécurisées contre les arnaques."
  },
  {
    id: 'second-niveau-france-travail-justice',
    titre: "Précisions",
    fichesEntree: ['france-travail-justice'],
    corps: "À l'entrée en prison, la personne déjà inscrite doit le déclarer à France Travail dans les meilleurs délais. Elle peut demander à être inscrite ou à rester inscrite si sa condamnation est définitive, si sa libération ou son aménagement de peine est proche et si elle a une pièce d'identité valide. La demande se fait au service pénitentiaire d'insertion et de probation. À la sortie, il ne faut pas tarder à s'inscrire ou à se réinscrire, en présentant le bulletin de sortie."
  },
  {
    id: 'second-niveau-guichet-unique-entreprises',
    titre: "Précisions",
    fichesEntree: ['guichet-unique-entreprises'],
    corps: "L'Institut national de la propriété industrielle explique que le guichet unique centralise les demandes d'immatriculation, les cessations, les modifications et le dépôt des comptes annuels. Le guichet remplace les réseaux de centres de formalités des entreprises qui relevaient des chambres consulaires, des greffes, des impôts et de l'Urssaf. Tout est dématérialisé, donc sans déplacement. Les démarches alimentent directement le Registre national des entreprises."
  },
  {
    id: 'second-niveau-inspection-du-travail',
    titre: "Précisions",
    fichesEntree: ['inspection-du-travail'],
    corps: "Ses missions sont de contrôler, conseiller les employeurs et les salariés sur leurs droits et obligations, concilier en cas de conflit collectif et informer. Un salarié peut la contacter pour une information, pour un non-respect de la réglementation du travail par l'employeur, ou en cas de harcèlement ou de discrimination. Il n'a pas à prévenir son employeur et il ne peut pas être sanctionné pour l'avoir contactée. Dans certains cas, comme la rupture conventionnelle d'un salarié protégé, l'employeur doit obtenir son autorisation."
  },
  {
    id: 'second-niveau-juge-de-l-application-des-peines',
    titre: "Précisions",
    fichesEntree: ['juge-de-l-application-des-peines'],
    corps: "La juridiction de jugement peut elle-même prononcer un aménagement de peine : semi-liberté, placement à l'extérieur ou détention à domicile sous surveillance électronique. Même dans ce cas, c'est le juge de l'application des peines qui fixe les conditions dans lesquelles l'aménagement sera exécuté. Pour l'aménagement, la juridiction vérifie que la situation de la personne s'y prête, par exemple si elle a un emploi qui l'attend, ou si elle souhaite suivre un stage, une formation professionnelle ou un enseignement."
  },
  {
    id: 'second-niveau-milieu-ordinaire-ou-milieu-protege',
    titre: "Dans quels cas ?",
    fichesEntree: ['milieu-ordinaire-ou-milieu-protege'],
    corps: "Premier cas : une personne avec la RQTH, sans emploi, peut candidater en entreprise adaptée, qui n'est pas une structure médico-sociale. Deuxième cas : si ses capacités ne lui permettent pas de travailler en milieu ordinaire ni en entreprise adaptée, la personne peut être accueillie en ESAT, qui est une structure médico-sociale. L'ESAT apporte un soutien éducatif, social et médical, et la personne y signe un contrat d'accompagnement par le travail, pas un contrat de travail."
  },
  {
    id: 'second-niveau-milieu-ouvert-ou-milieu-ferme',
    titre: "Précisions",
    fichesEntree: ['milieu-ouvert-ou-milieu-ferme'],
    corps: "Le ministère de la Justice décrit le milieu ouvert comme le suivi assuré par les services pénitentiaires d'insertion et de probation hors des établissements. Il peut être ordonné à différents moments : avant le jugement, par exemple dans un contrôle judiciaire ; au moment du jugement, avec un sursis probatoire, un travail d'intérêt général ou une détention à domicile sous surveillance électronique ; après le jugement, par le juge de l'application des peines, avec un aménagement de peine ou une libération sous contrainte. Une personne peut donc être suivie en milieu ouvert sans avoir été incarcérée."
  },
  {
    id: 'second-niveau-msa',
    titre: "Exemples concrets",
    fichesEntree: ['msa'],
    corps: "Le site de la MSA regroupe, pour les salariés, les exploitants et les retraités du régime agricole, les rubriques santé, famille et logement, retraite, prime d'activité et RSA, solidarité, handicap et dépendance. On y accède à un espace privé en ligne pour ses démarches. Par exemple, un salarié agricole qui demande le RSA ou la prime d'activité s'adresse à la MSA."
  },
  {
    id: 'second-niveau-ofii',
    titre: "Précisions",
    fichesEntree: ['ofii'],
    corps: "Service-public explique que la personne rencontre un auditeur de l'Ofii dans un entretien, à la fin duquel elle signe le contrat d'intégration républicaine. Elle s'engage alors à suivre la formation civique obligatoire et, si besoin, une formation linguistique. Le préfet signe aussi le contrat au nom de l'État. Si le contrat n'a pas été signé à l'entrée sur le territoire, on peut demander à le signer volontairement auprès de la direction territoriale de l'Ofii de son lieu de résidence."
  },
  {
    id: 'second-niveau-ofpra',
    titre: "Précisions",
    fichesEntree: ['ofpra'],
    corps: "L'entretien est individuel et confidentiel : l'Ofpra ne transmet aucune information à la famille, aux proches ou aux autorités du pays d'origine. La personne est reçue par un officier de protection, avec un interprète dans la langue indiquée. Elle peut être accompagnée d'un avocat ou d'un représentant d'association, mais pas d'un proche pendant l'entretien. L'entretien est enregistré, et en cas de réponse négative ou de protection subsidiaire, on peut demander à accéder à l'enregistrement pour préparer son recours."
  },
  {
    id: 'second-niveau-opco',
    titre: "Précisions",
    fichesEntree: ['opco'],
    corps: "Service-public rappelle que les OPCO assurent le financement des contrats d'apprentissage et de professionnalisation. L'employeur leur adresse le contrat, ils en contrôlent la conformité et s'occupent de la prise en charge financière. En cas de non-conformité, l'OPCO refuse cette prise en charge. Des vérifications portent aussi sur l'organisme de formation, qui doit en principe avoir la certification Qualiopi. L'article de la page est ancien : il est prudent de vérifier les règles en vigueur."
  },
  {
    id: 'second-niveau-point-justice',
    titre: "Précisions",
    fichesEntree: ['point-justice'],
    corps: "Le réseau réunit l'ensemble des lieux d'accès au droit : les maisons de justice et du droit et les anciens points d'accès au droit. L'accueil y est gratuit et confidentiel. Des permanences y sont assurées par des professionnels du droit comme des avocats, des huissiers et des notaires, ainsi que par des médiateurs, des conciliateurs de justice, des écrivains publics et des associations. On peut aussi y trouver la conciliation, la médiation et un délégué du Défenseur des droits."
  },
  {
    id: 'second-niveau-spip',
    titre: "Précisions",
    fichesEntree: ['spip'],
    corps: "Chaque SPIP est un service de l'administration pénitentiaire présent sur tout le territoire, qui travaille sous mandat judiciaire. Son équipe est composée principalement de conseillers pénitentiaires d'insertion et de probation. Elle compte aussi des surveillants pénitentiaires chargés de la surveillance électronique, des psychologues, des assistants de service social et des coordonnateurs d'activités."
  },
  {
    id: 'second-niveau-transitions-pro',
    titre: "Précisions",
    fichesEntree: ['transitions-pro'],
    corps: "Le site de l'association présente le projet de transition professionnelle comme un congé qui permet de se former à un nouveau métier tout en conservant sa rémunération. Il donne comme raisons de changer de métier une question de santé, la disparition de l'emploi, ou l'envie de retrouver du sens dans son travail. La rubrique des dispositifs liste aussi la prévention de l'usure et reconversion, la démission-reconversion, le certificat CléA et la validation des acquis de l'expérience."
  },
  {
    id: 'second-niveau-rgdu',
    titre: "Précisions",
    fichesEntree: ['rgdu'],
    corps: "Service-public explique que la réduction concerne tous les employeurs, sauf les particuliers employeurs, pour les salariés dont l'employeur cotise à l'assurance chômage, quel que soit le type de contrat : temps plein, temps partiel ou alternance. Elle est la plus forte au niveau du Smic, puis elle diminue jusqu'à 3 fois le Smic ; au-delà, elle ne s'applique plus, et pour un temps partiel le plafond est réduit en proportion. Elle se calcule sur la rémunération brute, qui comprend le salaire, les primes, les heures supplémentaires et les pourboires, mais pas les remboursements de frais professionnels. Pour un même salarié, elle ne se cumule pas avec d'autres exonérations de cotisations patronales, et son calcul est contrôlé à la réception de la déclaration sociale nominative.",
    suivi: {
      verifieLe: "2026-11-06",
      source: { nom: "Service-public Entreprendre, page « Réduction générale dégressive unique (RGDU) de cotisations patronales » (vérifiée le 15 juin 2026)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F24542" },
      phraseGenerale: "La réduction concerne la plupart des employeurs et des contrats. Elle est la plus forte pour les bas salaires et disparaît au-delà d'un certain niveau de rémunération, avec un plafond réduit pour un temps partiel. Les seuils et les règles de calcul changent régulièrement : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-puma',
    titre: "Précisions",
    fichesEntree: ['puma'],
    corps: "Service-public précise qu'une personne majeure est assurée à titre individuel dès sa majorité, sans être rattachée à un autre assuré, alors qu'un mineur reste ayant droit d'un parent et peut demander la Puma à titre personnel dès 16 ans. La régularité du séjour se justifie avec une pièce d'identité ou un passeport pour les ressortissants de l'Espace économique européen et de la Suisse, et avec un titre ou un document de séjour pour les autres. Une personne qui travaille est affiliée tout de suite si sa demande est acceptée ; sans activité, les droits s'ouvrent après un délai de résidence de 3 mois, sans délai pour certaines personnes, comme les réfugiés ou les bénéficiaires de l'AAH. En cas de perte d'emploi ou de séparation, la personne garde le même régime d'assurance maladie, ce qui évite les périodes sans droits. On s'adresse à la CPAM pour le régime général, et à la MSA pour le régime agricole.",
    suivi: {
      verifieLe: "2026-11-06",
      source: { nom: "Service-public.gouv.fr, fiche « Protection universelle maladie (Puma) » (vérifiée le 13 mai 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F34308" },
      phraseGenerale: "Toute personne qui travaille ou réside en France de manière stable et régulière a droit à la prise en charge de ses frais de santé, sans rupture de droits quand sa situation change. Les conditions d'âge, de délai et de justificatifs peuvent évoluer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-plafond-securite-sociale',
    titre: "Précisions",
    fichesEntree: ['plafond-securite-sociale'],
    corps: "Service-public explique que le plafond est réévalué chaque année au 1er janvier, en fonction de l'évolution du salaire moyen par tête de l'année précédente. Pour les prestations, il fixe le plafond des indemnités journalières (maladie, accident du travail, maternité, paternité), des pensions d'invalidité et des pensions de vieillesse du régime général. Pour les employeurs, il sert à calculer certaines cotisations (salaire, vieillesse, chômage, retraites complémentaires), les seuils d'exonération fiscale et sociale des indemnités de rupture, et les indemnités de stage des étudiants. Il existe en plusieurs valeurs, selon la période : annuelle, trimestrielle, mensuelle, hebdomadaire, journalière et horaire.",
    suivi: {
      verifieLe: "2026-11-06",
      source: { nom: "Service-public.gouv.fr, actualité sur le plafond de la Sécurité sociale pour 2027 (publiée le 19 octobre 2026)", url: "https://www.service-public.gouv.fr/particuliers/actualites/A15386" },
      phraseGenerale: "Le plafond de la Sécurité sociale est réévalué chaque année. Il sert de référence au calcul de certaines prestations et de certaines cotisations, et existe en plusieurs valeurs selon la période (annuelle, mensuelle, journalière, horaire). Les montants et les usages changent chaque année : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-transparence-salariale',
    titre: "Précisions",
    fichesEntree: ['transparence-salariale'],
    corps: "Service-public présente ce que le projet de loi annonce, sans que rien soit encore adopté. Pour les salariés en poste, le droit à l'information sur leur rémunération et sur les rémunérations moyennes de leur catégorie d'emploi serait renforcé : ils n'auraient pas accès aux salaires individuels de leurs collègues, mais pourraient situer le leur par rapport à la moyenne de leur catégorie. Une clause qui interdirait de dévoiler sa propre rémunération serait interdite. Pour les entreprises d'au moins 50 salariés, il faudrait mesurer et déclarer des indicateurs sur les écarts de rémunération entre femmes et hommes, et l'Index de l'égalité professionnelle serait renforcé d'un indicateur sur les écarts entre salariés qui font un travail égal ou de valeur égale. Les obligations et leurs échéances varieraient selon l'effectif de l'entreprise.",
    suivi: {
      verifieLe: "2026-11-06",
      source: { nom: "Service-public Entreprendre, actualité sur la transparence salariale (publiée le 10 septembre 2026)", url: "https://entreprendre.service-public.gouv.fr/actualites/A19060" },
      phraseGenerale: "Le projet de loi de transposition d'une directive européenne prévoit plus d'information sur les rémunérations, pour les candidats, les salariés et les entreprises. Il n'est pas encore adopté et ses règles peuvent changer : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-declaration-trimestrielle-aah-esat',
    titre: "Comment déclarer",
    fichesEntree: ['declaration-trimestrielle-aah-esat'],
    corps: "Service-public explique la marche à suivre. À la Caf, on se connecte à son espace « Mon Compte » ou à l'application « Caf - Mon Compte », on clique sur le message concernant l'AAH dans « mes alertes », puis on déclare les revenus des trois mois précédents : salaire de l'Ésat, indemnités de Sécurité sociale, pension alimentaire et autres revenus. Les montants s'indiquent en « net imposable », qui figure en bas de la fiche de paie. À la MSA, on ouvre l'onglet « services et démarches » de son espace privé et on clique sur « déclarer mes ressources trimestrielles » dans l'espace « handicap ». Un formulaire papier de déclaration existe aussi. Les personnes qui perçoivent aussi la prime d'activité font une déclaration distincte pour chacune des deux prestations.",
    suivi: {
      verifieLe: "2026-11-06",
      source: { nom: "Service-public.gouv.fr, actualité sur la déclaration trimestrielle de ressources AAH des travailleurs en Ésat (publiée le 14 octobre 2026)", url: "https://www.service-public.gouv.fr/particuliers/actualites/A19094" },
      phraseGenerale: "Les personnes qui travaillent en Ésat et perçoivent l'AAH déclarent désormais leurs ressources à intervalles réguliers, à la Caf ou à la MSA, en ligne ou sur papier. Les dates et les modalités de mise en place changent : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-coach',
    titre: "Précisions",
    fichesEntree: ['coach'],
    corps: "France compétences, qui tient le répertoire national des certifications professionnelles, indique que l'exercice du métier de coach ne fait l'objet d'aucune réglementation nationale ou internationale spécifique : la profession s'organise autour de bonnes pratiques et d'une autorégulation, avec des codes de déontologie établis par des fédérations professionnelles. Il existe pourtant un titre « Coach professionnel », de niveau 6, inscrit à ce répertoire. Il vise l'accueil et l'analyse de la demande d'une personne, la rédaction d'un contrat de coaching, la conduite et la clôture des séances, ainsi que la création de son activité. Comme la profession n'est pas réglementée, aucun titre n'est exigé pour s'installer comme coach.",
    suivi: {
      verifieLe: "2026-11-06",
      source: { nom: "France compétences, fiche RNCP41347 « Coach professionnel » (consultée le 6 novembre 2026)", url: "https://www.francecompetences.fr/recherche/rncp/41347/" },
      phraseGenerale: "France compétences indique que le métier de coach n'est pas réglementé et qu'il existe un titre de coach professionnel inscrit au répertoire national des certifications. Les certifications enregistrées et leurs dates de validité changent régulièrement : consultez la source officielle."
    }
  },
  {
    id: 'second-niveau-personnes-invisibles',
    titre: "Précisions",
    fichesEntree: ['personnes-invisibles'],
    corps: "Une page d'un service de l'État consacrée à l'appel à projets « Repérer et mobiliser les publics invisibles » présente ce repérage comme un enjeu du Plan d'investissement dans les compétences. L'appel vise prioritairement les jeunes de 16 à 29 ans révolus en situation de « NEET » dits « invisibles », qui ne sont ni en emploi, ni en études, ni en formation, et qui habitent les quartiers de la politique de la ville ou les territoires ruraux en difficulté. Il cible aussi les personnes en situation de handicap. La démarche « aller vers » consiste à développer des actions à la rencontre des personnes non accompagnées, pour leur permettre d'accéder à un accompagnement socio-professionnel, à une formation ou à un droit.",
    suivi: {
      verifieLe: "2026-11-06",
      source: { nom: "Direction de l'économie, de l'emploi, du travail et des solidarités de Mayotte, page « Repérer et mobiliser les publics invisibles » (mise à jour le 8 avril 2025)", url: "https://mayotte.deets.gouv.fr/Lancement-d-une-nouvelle-vague-de-l-appel-a-projets-Reperer-et-mobiliser-les" },
      phraseGenerale: "Des appels à projets de l'État financent des actions pour repérer les personnes éloignées de l'emploi qui ne sont suivies par aucun service, notamment des jeunes, en allant à leur rencontre. Les publics visés et les financements changent : consultez la source officielle."
    }
  }
];
