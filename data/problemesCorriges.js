/* ============================================================
   Les problèmes corrigés, affichés dans la page « Nouveautés » (entrée « Problèmes corrigés »). UNE LIGNE PAR PROBLÈME corrigé, tenue à jour à chaque correction notable.
   Règles : date en AAAA-MM-JJ (elle s'affiche en français), titre court qui nomme le module, puis deux phrases en mots simples :
   - `signale` : ce que la personne a vécu (jamais de jargon, jamais de détail technique) ;
   - `corrige` : ce qui se passe maintenant ;
   - `origine` : 'personne' (la page affiche « Signalé par un utilisateur ») ou 'nous' (défaut repéré par nous : la page n'affiche rien). Dans le doute, 'nous'.
   Jamais le mot « IA » (dire « l'assistant »), jamais de tiret long. Une correction d'un module encore fermé au public n'est pas listée.
   Le nombre affiché sur l'entrée compte les corrections des 7 derniers jours (modules/nouveautes/logique.js).
   ============================================================ */
var PROBLEMES_CORRIGES = [
  { date: '2026-11-10', origine: 'personne', titre: 'À partir de mon récit : l’écran qui bougeait',
    signale: 'À chaque clic sur une réponse, toute la page montait puis redescendait un instant.',
    corrige: 'La page reste maintenant fixe quand vous répondez.' },
  { date: '2026-11-10', origine: 'personne', titre: 'À partir de mon récit : les compétences',
    signale: 'Il n’était pas clair qu’il y avait une carte par expérience, et on passait à la suite sans avoir vu les autres expériences.',
    corrige: 'Une phrase explique l’étape, chaque expérience a son titre bien lisible et son bouton, et la page descend toute seule à l’expérience suivante.' },
  { date: '2026-11-10', origine: 'nous', titre: 'À partir de mon récit : le choix de l’assistant',
    signale: 'Après la question sur la lettre de recommandation, le choix de l’assistant était sauté et on arrivait directement à l’écran où coller la réponse.',
    corrige: 'Le choix de l’assistant s’affiche de nouveau avant chaque échange.' },
  { date: '2026-11-10', origine: 'nous', titre: 'Le bouton « Changer d’assistant »',
    signale: 'Sur l’écran « Collez la réponse », le bouton « Changer d’assistant » ne faisait que rafraîchir la page : on restait bloqué.',
    corrige: 'Il ramène maintenant au choix de l’assistant, et vous pouvez recopier le message pour le même assistant ou un autre.' },
  { date: '2026-11-10', origine: 'nous', titre: 'À partir de mon récit : le complément de CV',
    signale: 'Le complément de CV n’était pas toujours proposé, et un écran en trop s’affichait après avoir collé le CV.',
    corrige: 'Le complément est maintenant toujours proposé, l’écran en trop a disparu, et un texte explique comment le récupérer auprès de l’assistant.' },
  { date: '2026-11-10', origine: 'nous', titre: 'Les années de début et de fin',
    signale: 'On pouvait choisir une année de fin avant l’année de début, par exemple « 2022 à 2018 ».',
    corrige: 'Les années impossibles ne sont plus proposées, dans tous les endroits où l’on choisit deux années.' },
  { date: '2026-11-10', origine: 'nous', titre: 'Le bouton « Continuer »',
    signale: 'Dans « À partir de mon récit », le bouton « Continuer » était parfois dans la page, parfois dans la barre du bas.',
    corrige: 'Il est maintenant toujours dans la barre du bas, avec « Retour » et « Accueil ».' }
];
