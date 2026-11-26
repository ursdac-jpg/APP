/* ============================================================
   data/cqcpmCartes.js : espace « Ce qui compte pour moi » : les quatre thèmes de l'accueil et les huit cartes.
   Textes validés sur maquette le 22/11/2026 (consignes 554, 556 et 558) : docs/MAQUETTE_CE_QUI_COMPTE_POUR_MOI_*.html.
   Chaque carte est une DESCRIPTION : un seul moteur d'écran (modules/ce-qui-compte/) la lit pour dessiner les écrans, contrôler les réponses
   et construire le résultat. Ajouter ou changer une carte ne demande donc que ce fichier.

   Types de champ :
   - texte   : { id, lib, aide?, court? }            une zone de texte (600 signes, 120 si `court`).
   - liste   : { id, lib, min, max, amorces? }       de `min` à `max` phrases courtes (200 signes chacune), avec des débuts de phrase proposés.
   - choix   : { id, lib, aide?, max, options, libResultat?, dansTitre? }      un ou plusieurs choix. `options` : tableau de { id, lib }, ou 'valeurs' (les dix-neuf repères),
                                                     ou { depuis: 'id d'un champ liste ou choix de la même carte' }, ou { depuisCarte: 'petitesActions' }.
   - lignes  : { id, lib?, groupes, options, accordeon?, champsDuGroupe? }  une réponse parmi `options` pour chaque ligne, ou aucune (= sans avis). Les lignes sont rangées en groupes.
               `groupes` et `options` nomment un catalogue : groupes 'valeurs' | 'conditions' | 'energie', options 'piles' | 'reponsesConditions' | 'energieChoix'
               (data/cqcpmValeurs.js et data/cqcpmConditions.js, sources uniques). `champsDuGroupe` : champs texte rangés dans un groupe (ex. le salaire).
   - entrees : { id, lib, min, max, source?, titreChamp, champs } de `min` à `max` entrées, chacune avec ses champs. Avec `source`, une entrée par élément retenu.
   Sections de résultat (`resultat`) : mode 'texte' | 'liste' | 'choix' | 'option' (les lignes qui ont la réponse `option`) | 'colonnes' (une colonne par option)
   | 'phrases' (« ligne : réponse ») | 'entrees' | 'textes' (plusieurs champs texte ou choix de la carte, chacun avec son intitulé).
   Règles de la carte : jamais un score, jamais un type de personne, jamais un classement de métiers ; « à compléter », jamais « facultatif » ; jamais une durée en minutes.
   ============================================================ */

function _cqcpmOpts(paires) { return paires.map(function (p) { return { id: p[0], lib: p[1] }; }); }

// `fin` : le texte qui clôt chaque rubrique de l'accueil (consigne 601, 25/11/2026). `cherche` : deux phrases toujours visibles ; `aide` : le complément
// qui se déplie sous « Plus d'informations », avant le détail de chaque carte (lu dans `invitation`, jamais recopié).
var CQCPM_THEMES_ACCUEIL = [
  { id: 'aimerais', titre: 'Ce que j’aimerais', icone: 'bi-stars', sous: 'Vos envies, vos modèles, votre journée rêvée.',
    fin: { cherche: 'Cette partie cherche ce qui vous attire, sans que vous ayez à le justifier ni à le rendre réaliste. Vos envies, les personnes ou les œuvres qui vous marquent et votre journée de travail idéale disent déjà beaucoup de ce qui compte pour vous.',
      aide: 'Avant de parler de métiers ou de contraintes, il est utile de savoir ce qui vous donne envie. Ces cartes partent de l’imagination, pas de ce qui est possible aujourd’hui. Ce que vous écrivez ici vous aide ensuite à repérer ce qui revient d’une carte à l’autre, et à parler de vous avec un conseiller. Les cartes sont indépendantes : vous les faites dans l’ordre que vous voulez, et vous ne gardez que ce qui vous convient.' } },
  { id: 'compte', titre: 'Ce qui compte', icone: 'bi-layers', sous: 'Ce que vous attendez du travail, et dans quelles conditions.',
    fin: { cherche: 'Cette partie cherche ce qui est essentiel pour vous dans un travail, et dans quelles conditions vous vous sentez bien pour le faire. Il n’y a pas de bonne réponse : ce sont vos repères à vous.',
      aide: 'Deux emplois qui se ressemblent sur le papier peuvent se vivre très différemment, selon les horaires, le rythme ou l’ambiance. Mettre des mots sur ce qui compte pour vous aide à reconnaître plus vite une situation qui vous convient, et à expliquer ce que vous recherchez à un conseiller ou à un employeur. Rien n’est noté ni classé : ces cartes décrivent ce que vous voulez, pas ce que vous valez.' } },
  { id: 'vecu', titre: 'Ce que j’ai vécu', icone: 'bi-journal-text', sous: 'Vos expériences et ce qui vous a aidé.',
    fin: { cherche: 'Cette partie cherche ce que vos expériences vous ont fait vivre, et ce qui vous a aidé dans les moments difficiles. Il s’agit de votre ressenti, pas d’un jugement sur ce que vous avez fait.',
      aide: 'Ce que vous avez aimé ou ce qui a pesé dans un emploi, un stage ou une activité renseigne sur ce qui vous convient pour la suite, souvent mieux qu’un intitulé de poste. Repérer ce qui vous a soutenu rappelle aussi que vous avez déjà des appuis. Ces cartes ne remplacent ni la fiche de vos compétences, ni une aide si vous en avez besoin.' } },
  { id: 'suite', titre: 'La suite', icone: 'bi-signpost-2', sous: 'Une fois que vous y voyez plus clair.',
    fin: { cherche: 'Cette partie cherche une première action, toute petite, que vous pourriez faire cette semaine. Elle vient après les autres parties, mais rien ne vous oblige à les avoir toutes remplies.',
      aide: 'Y voir plus clair ne suffit pas toujours pour se lancer. Une petite action, les personnes qui peuvent vous aider et ce dont vous aimeriez parler avec la personne qui vous accompagne rendent la suite plus facile à aborder. Ce n’est pas un projet : c’est un premier pas, à votre mesure.' } }
];

var _CQCPM_VALEURS_CHAMP = { type: 'choix', id: 'valeurs', lib: 'Jusqu’à trois valeurs qui se retrouvent ici', aide: 'dans la liste des dix-neuf, à compléter si vous le souhaitez', libResultat: 'Valeurs', max: 3, options: 'valeurs' };

var CQCPM_CARTES = [
  // ---------------------------------------------------------------- Si rien ne m'arrêtait
  { id: 'envies', theme: 'aimerais', nom: 'Si rien ne m’arrêtait', icone: 'bi-rocket-takeoff',
    pour: 'Si tout était possible, que voudriez-vous vivre, apprendre ou créer ?',
    dit: 'Quelques envies d’une phrase, dites avec vos mots, puis trois que vous retenez.',
    invitation: {
      faites: 'Vous écrivez de trois à dix envies d’une phrase, vous en retenez trois, puis vous remplissez une petite fiche pour chacune.',
      obtenez: 'Vos trois envies, avec ce qui vous attire, les valeurs qui s’y retrouvent et une petite chose que vous pourriez faire déjà.',
      savoir: 'Les envies peuvent être modestes. « Je ne sais pas » est une réponse possible.' },
    ecrans: [
      { id: 'envies', titre: 'Mes envies', champs: [
        { type: 'liste', id: 'envies', lib: 'Si rien ne m’arrêtait…', aide: 'Imaginez que le temps, l’argent, la distance et les contraintes ne soient plus un obstacle. Écrivez de trois à dix envies, une phrase chacune. Elles peuvent être modestes : voir la mer en hiver, apprendre à cuisiner, aider un voisin.', min: 3, max: 10, libPasser: 'Je ne sais pas pour l’instant',
          amorces: ['J’aimerais apprendre…', 'J’aimerais créer…', 'J’aimerais aider…', 'J’aimerais voir…', 'J’aimerais vivre…', 'J’aimerais transmettre…'] } ] },
      { id: 'retenir', titre: 'Retenir trois envies', champs: [
        { type: 'choix', id: 'retenues', lib: 'Quelles trois envies vous parlent le plus ?', aide: 'Choisissez-en trois, sans les classer : elles ont la même importance.', max: 3, options: { depuis: 'envies' } } ] },
      { id: 'fiches', titre: 'Une fiche par envie', champs: [
        { type: 'entrees', id: 'fiches', lib: 'Une fiche par envie', aide: 'Pour chacune de vos trois envies, quelques mots seulement.', min: 0, max: 3, source: 'retenues', titreChamp: 'cle', champs: [
          { type: 'texte', id: 'attire', lib: 'Ce qui m’attire' },
          _CQCPM_VALEURS_CHAMP,
          { type: 'texte', id: 'petite', lib: 'Une petite chose que je pourrais faire déjà' } ] } ] }
    ],
    resultat: [
      { titre: 'Mes trois envies', icone: 'bi-rocket-takeoff', champ: 'fiches', mode: 'entrees' },
      { titre: 'Toutes mes envies', icone: 'bi-list-ul', champ: 'envies', mode: 'liste' } ] },

  // ---------------------------------------------------------------- Ceux qui m'inspirent
  { id: 'inspirent', theme: 'aimerais', nom: 'Ceux qui m’inspirent', icone: 'bi-chat-quote',
    pour: 'Une personne, un personnage ou une œuvre vous marque ?',
    dit: 'Ce que vous admirez, et ce que vous aimeriez en apprendre.',
    invitation: {
      faites: 'Vous choisissez de une à trois personnes ou œuvres, et vous répondez à trois questions pour chacune.',
      obtenez: 'Pour chaque entrée : ce que vous admirez, ce que vous aimeriez en apprendre, et jusqu’à trois valeurs qui s’y retrouvent.',
      savoir: 'Il ne s’agit pas de lui ressembler, mais de voir ce qu’elle vous apprend sur vous. « Rien à ajouter pour l’instant » est possible.' },
    ecrans: [
      { id: 'inspirations', titre: 'Mes inspirations', champs: [
        { type: 'entrees', id: 'inspirations', lib: 'Qui ou quoi vous inspire ?', nomEntree: 'entrée', libPasser: 'Rien à ajouter pour l’instant', min: 0, max: 3, titreChamp: 'nom', champs: [
          { type: 'choix', id: 'sorte', dansTitre: true, lib: 'Qui ou quoi vous inspire ?', max: 1, options: _cqcpmOpts([['connue', 'Une personne que je connais'], ['celebre', 'Une personne connue ou disparue'], ['oeuvre', 'Un personnage ou une œuvre']]) },
          { type: 'texte', id: 'nom', lib: 'Son nom ou son titre', court: true },
          { type: 'texte', id: 'admire', lib: 'Ce que j’admire' },
          { type: 'texte', id: 'apprendre', lib: 'Ce que j’aimerais apprendre d’elle', aide: 'jamais « être comme elle »' },
          _CQCPM_VALEURS_CHAMP ] } ] }
    ],
    resultat: [ { titre: 'Ce qui m’inspire', icone: 'bi-chat-quote', champ: 'inspirations', mode: 'entrees' } ] },

  // ---------------------------------------------------------------- Ma journée idéale de travail
  { id: 'journee', theme: 'aimerais', nom: 'Ma journée idéale de travail', icone: 'bi-sun',
    pour: 'À quoi ressemblerait une journée de travail qui vous ferait du bien ?',
    dit: 'Du réveil jusqu’au soir, en quelques lignes.',
    invitation: {
      faites: 'Vous racontez cette journée en cinq moments, du réveil jusqu’au soir, en quelques lignes chacun.',
      obtenez: 'Un petit récit de votre journée idéale, qui dit où vous êtes, avec qui, ce que vous faites et comment vous finissez la journée.',
      savoir: 'Ce n’est pas un souhait irréaliste : c’est une direction. Vous pouvez laisser des moments vides.' },
    ecrans: [
      { id: 'journee', titre: 'Ma journée', titreBloc: 'Une journée de travail qui me ferait du bien', intro: 'Racontez-la au présent, comme si c’était aujourd’hui.', champs: [
        { type: 'texte', id: 'matin', lib: 'Le matin, avant de partir' },
        { type: 'texte', id: 'trajet', lib: 'Le lieu et le trajet' },
        { type: 'texte', id: 'faire', lib: 'Ce que je fais pendant la journée' },
        { type: 'texte', id: 'avec', lib: 'Avec qui' },
        { type: 'texte', id: 'soir', lib: 'La fin de journée' } ] }
    ],
    resultat: [
      { titre: 'Ma journée idéale de travail', icone: 'bi-sun', mode: 'textes', champs: ['matin', 'trajet', 'faire', 'avec', 'soir'] } ] },

  // ---------------------------------------------------------------- Ce qui compte au travail
  { id: 'valeurs', theme: 'compte', nom: 'Ce qui compte au travail', icone: 'bi-collection',
    pour: 'Qu’est-ce qui est essentiel pour vous dans un travail ?',
    dit: 'Dix-neuf repères à ranger en trois piles : essentiel, important, moins important pour l’instant.',
    invitation: {
      faites: 'Dix-neuf repères, en cinq groupes : vous les rangez en trois piles (essentiel, important, moins important pour l’instant), puis vous répondez à trois questions.',
      obtenez: 'Vos trois piles, ce qui vous parle le moins aujourd’hui, une situation vécue et ce que vous pouvez accepter si un repère n’est pas respecté.',
      savoir: 'Ce n’est pas une liste de qualités : tous ces repères sont bons. Vous ne choisissez que ce qui compte pour vous.' },
    ecrans: [
      { id: 'piles', titre: 'Trois piles', champs: [
        { type: 'lignes', id: 'piles', lib: 'Dans un travail, qu’est-ce qui compte pour moi ?', aide: 'Pour chaque repère, choisissez une pile ou ne choisissez rien. Un repère sans pile veut dire « sans avis ».',
          groupes: 'valeurs', options: 'piles', compact: true } ] },
      { id: 'questions', titre: 'Trois questions', titreBloc: 'Trois questions pour finir', champs: [
        { type: 'choix', id: 'moins_parle', lib: 'Parmi les repères, lequel vous parle le moins aujourd’hui ?', libResultat: 'Ce qui me parle le moins aujourd’hui', aide: 'un seul, à compléter', max: 1, options: 'valeurs' },
        { type: 'texte', id: 'situation', lib: 'Une situation vécue où l’un de vos repères essentiels a été respecté, ou pas', libResultat: 'Une situation vécue' },
        { type: 'texte', id: 'accepter', lib: 'Si l’un de ces repères n’est pas respecté, que puis-je accepter ?', libResultat: 'Ce que je peux accepter' } ] }
    ],
    resultat: [
      { titre: 'Mes repères au travail', icone: 'bi-collection', champ: 'piles', mode: 'colonnes' },
      { titre: 'Mes réponses', icone: 'bi-chat-left-text', mode: 'textes', champs: ['moins_parle', 'situation', 'accepter'] } ] },

  // ---------------------------------------------------------------- Comment je veux travailler
  { id: 'conditions', theme: 'compte', nom: 'Comment je veux travailler', icone: 'bi-sliders',
    pour: 'Dans quelles conditions vous sentez-vous bien pour travailler ?',
    dit: 'Lieu, rythme, horaires, contact, cadre, déplacements, cadre de vie : ce que vous voulez, ce à quoi vous pouvez vous adapter, ce que vous préférez éviter.',
    invitation: {
      faites: 'Sept thèmes, qui s’ouvrent un par un : où je travaille, mon rythme, mes horaires, le contact avec les autres, le cadre de travail, les déplacements, mon cadre de vie. Pour chaque situation, vous choisissez parmi trois réponses : Je le veux, Je peux m’adapter, Je préfère l’éviter.',
      obtenez: 'Une page qui résume, avec vos mots, ce que vous voulez, ce à quoi vous pouvez vous adapter et ce que vous préférez éviter, utile pour parler de vous à un conseiller.',
      savoir: 'Ne cochez que ce qui compte pour vous : une situation sans réponse veut dire « sans avis ». Vous pouvez changer d’avis à tout moment.' },
    ecrans: [
      { id: 'conditions', titre: 'Mes conditions de travail', intro: 'Ouvrez un thème, répondez seulement à ce qui compte pour vous, puis passez au suivant.', champs: [
        { type: 'lignes', id: 'conditions', groupes: 'conditions', options: 'reponsesConditions', accordeon: true,
          champsDuGroupe: { vie: [ { type: 'texte', id: 'salaire', lib: 'Le salaire minimum dont j’ai besoin', aide: 'à compléter si vous le souhaitez', court: true } ] } } ] },
      { id: 'energie', titre: 'Mon énergie', intro: 'Quatre situations. Il n’y a pas de bonne réponse, et cette question ne mesure rien : elle sert seulement à mieux dire comment vous vous sentez bien.', champs: [
        { type: 'lignes', id: 'energie', groupes: 'energie', options: 'energieChoix' } ] }
    ],
    resultat: [
      { titre: 'Ce que je veux', icone: 'bi-check-lg', champ: 'conditions', mode: 'option', option: 'veux' },
      { titre: 'Ce à quoi je peux m’adapter', icone: 'bi-arrow-left-right', champ: 'conditions', mode: 'option', option: 'adapte' },
      { titre: 'Ce que je préfère éviter', icone: 'bi-slash-circle', champ: 'conditions', mode: 'option', option: 'evite' },
      { titre: 'Mon énergie', icone: 'bi-battery-charging', champ: 'energie', mode: 'phrases' },
      { titre: 'Mon salaire minimum', icone: 'bi-cash-coin', champ: 'salaire', mode: 'texte', masquerSiVide: true } ],
    pontMetiers: true },

  // ---------------------------------------------------------------- Mes expériences, côté ressenti
  { id: 'experiences', theme: 'vecu', nom: 'Mes expériences, côté ressenti', icone: 'bi-journal-text',
    pour: 'Un emploi, un stage, un bénévolat, une activité : comment l’avez-vous vécu ?',
    dit: 'Ce que vous avez aimé, ce qui a pesé, et comment vous en sortiez.',
    invitation: {
      faites: 'Vous choisissez de une à trois expériences et vous répondez à quatre questions pour chacune, plus deux questions sur les raisons de son début et de sa fin.',
      obtenez: 'Pour chaque expérience : ce que vous avez aimé, ce qui a pesé, l’énergie qu’il vous restait ensuite, et jusqu’à trois valeurs qui s’y retrouvent.',
      savoir: 'Il s’agit de votre ressenti, pas de vos compétences : cette carte ne remplace pas la fiche de vos compétences. Il n’y a pas de bonne ou de mauvaise expérience.' },
    ecrans: [
      { id: 'experiences', titre: 'Mon expérience', champs: [
        { type: 'entrees', id: 'experiences', lib: 'Une expérience', nomEntree: 'expérience', min: 0, max: 3, titreChamp: 'nom', champs: [
          { type: 'choix', id: 'sorte', dansTitre: true, lib: 'Quelle sorte d’expérience ?', max: 1, options: _cqcpmOpts([['emploi', 'Un emploi'], ['stage', 'Un stage ou une formation'], ['benevolat', 'Du bénévolat'], ['projet', 'Un projet personnel'], ['loisir', 'Une activité de loisir'], ['autre', 'Autre']]) },
          { type: 'texte', id: 'nom', lib: 'Son nom, en quelques mots', court: true },
          { type: 'texte', id: 'aime', lib: 'Ce que j’ai aimé' },
          { type: 'texte', id: 'pese', lib: 'Ce qui a pesé' },
          { type: 'choix', id: 'energie', lib: 'Après une journée là-bas, j’étais…', libResultat: 'Après une journée là-bas', max: 1, options: _cqcpmOpts([['recharge', 'rechargé(e)'], ['fatigue', 'fatigué(e)'], ['entre', 'entre les deux']]) },
          { type: 'choix', id: 'recuperer', lib: 'Ce qui me redonnait de l’énergie, c’était plutôt…', libResultat: 'Ce qui me redonnait de l’énergie', max: 1, options: _cqcpmOpts([['seul', 'être seul(e)'], ['autres', 'être avec d’autres'], ['depend', 'ça dépendait']]) },
          _CQCPM_VALEURS_CHAMP,
          { type: 'texte', id: 'debut', lib: 'Pourquoi je l’ai commencée', aide: 'à compléter si vous le souhaitez' },
          { type: 'texte', id: 'fin', lib: 'Pourquoi je l’ai arrêtée', aide: 'à compléter si vous le souhaitez' } ] } ] }
    ],
    resultat: [ { titre: 'Mes expériences, côté ressenti', icone: 'bi-journal-text', champ: 'experiences', mode: 'entrees' } ] },

  // ---------------------------------------------------------------- Ce qui m'a aidé quand c'était difficile
  { id: 'aide', theme: 'vecu', nom: 'Ce qui m’a aidé quand c’était difficile', icone: 'bi-life-preserver',
    pour: 'Qu’est-ce qui vous a aidé à tenir ou à repartir ?',
    dit: 'Des appuis, des habitudes, des personnes. Cette carte ne cherche pas à expliquer vos difficultés.',
    invitation: {
      faites: 'Vous repérez ce qui vous a soutenu dans un moment difficile : des personnes, des habitudes, des lieux, des activités.',
      obtenez: 'La liste de vos appuis, avec vos mots, et ce que vous referiez si c’était à vivre de nouveau.',
      savoir: 'Cette carte ne cherche pas à expliquer vos difficultés et ne les classe pas. Elle ne remplace pas une aide, si vous en avez besoin.' },
    ecrans: [
      { id: 'appuis', titre: 'Mes appuis', titreBloc: 'Un moment difficile que vous avez traversé', intro: 'Pensez à un moment difficile de votre parcours, grand ou petit, sans avoir besoin de le raconter. Seulement ce qui vous a aidé.', champs: [
        { type: 'choix', id: 'appuis', lib: 'Qu’est-ce qui vous a aidé ?', libResultat: 'Mes appuis', aide: 'autant de choix que vous voulez', max: 7, options: _cqcpmOpts([['personne', 'Une personne'], ['habitude', 'Une habitude'], ['lieu', 'Un lieu'], ['activite', 'Une activité'], ['moment', 'Un moment de la journée'], ['phrase', 'Quelque chose que je me suis dit'], ['autre', 'Autre']]) },
        { type: 'texte', id: 'aide', lib: 'Ce qui m’a aidé, avec mes mots', libResultat: 'Ce qui m’a aidé' },
        { type: 'texte', id: 'referais', lib: 'Ce que je referais si c’était à vivre de nouveau', libResultat: 'Ce que je referais' } ] }
    ],
    resultat: [ { titre: 'Ce qui m’a aidé', icone: 'bi-life-preserver', mode: 'textes', champs: ['appuis', 'aide', 'referais'] } ],
    renvoiUrgences: true,
    envoiParDefaut: false },   // lien avec Ma synthèse : carte très personnelle, la case « envoyer à l'assistant » n'est pas cochée d'avance

  // ---------------------------------------------------------------- Mon prochain petit pas
  { id: 'pas', theme: 'suite', nom: 'Mon prochain petit pas', icone: 'bi-flag',
    pour: 'Quelle petite action pourriez-vous faire dès maintenant ?',
    dit: 'Choisir une action parmi vos envies, repérer qui peut vous aider, noter ce dont vous aimeriez parler avec la personne qui vous accompagne.',
    invitation: {
      faites: 'Vous choisissez une petite action parmi vos envies ou vous en écrivez une, vous repérez qui peut vous aider, puis vous notez ce dont vous aimeriez parler avec la personne qui vous accompagne.',
      obtenez: 'Une petite action, les personnes qui peuvent vous aider et ce dont vous aimeriez parler à votre prochain rendez-vous.',
      savoir: 'Un petit pas, ce n’est pas un projet : c’est quelque chose que vous pouvez faire cette semaine.' },
    ecrans: [
      { id: 'pas', titre: 'Mon petit pas', titreBloc: 'Un petit pas, cette semaine', champs: [
        { type: 'choix', id: 'action', lib: 'Quelle petite action voudriez-vous essayer ?', libResultat: 'Mon petit pas', max: 1, options: { depuisCarte: 'petitesActions' } },
        { type: 'texte', id: 'autre_action', lib: 'Ou une autre petite action, avec mes mots', libResultat: 'Mon petit pas, avec mes mots' },
        { type: 'choix', id: 'qui', lib: 'Qui peut m’aider ?', libResultat: 'Qui peut m’aider', aide: 'autant de choix que vous voulez', max: 7, options: _cqcpmOpts([['conseiller', 'Mon conseiller'], ['proche', 'Un proche'], ['ami', 'Un ami'], ['voisin', 'Un voisin'], ['association', 'Une association'], ['collegue', 'Un ancien collègue'], ['personne', 'Personne pour l’instant']]) },
        { type: 'texte', id: 'question', lib: 'Ce dont j’aimerais parler avec la personne qui m’accompagne', libResultat: 'Ce dont j’aimerais parler avec la personne qui m’accompagne' } ] }
    ],
    resultat: [ { titre: 'Mon prochain petit pas', icone: 'bi-flag', mode: 'textes', champs: ['action', 'autre_action', 'qui', 'question'] } ] }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CQCPM_THEMES_ACCUEIL: CQCPM_THEMES_ACCUEIL, CQCPM_CARTES: CQCPM_CARTES };
}
