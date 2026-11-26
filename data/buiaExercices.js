/* ============================================================
   Module « Bien utiliser l'IA » : textes des trois exercices du chemin 1 « Comprendre comment demander » :
   « Réparer une demande » (écran 3, les six éléments), « Voir la différence » (écran 4, la forme) et « Repérer ce qui se vérifie » (écran 6, vérifier).
   Source : propositions P1, P2 et P3 du dossier docs/PROPOSITIONS_BIEN_UTILISER_L_IA_2026-11-24.md, option 1 choisie par Denis le 24/11/2026 (P3 demandé ensuite, le même jour) ;
   maquette docs/maquettes/maquette-bien-utiliser-ia-exercices-2026-11-24.html.
   Principes : aucun envoi, aucune note, aucun score, aucun enregistrement ; le retour porte sur la demande ou sur la réponse, jamais sur la personne.
   Les noms, numéros et couleurs des six éléments viennent de data/buiaDemande.js (liste unique) : ils ne sont PAS recopiés ici.
   Tous les cas sont INVENTÉS de bout en bout (personnes, centre, association, règles) : jamais un organisme ni un texte réel.
   Les phrases des demandes « réparées » sont des illustrations, pas les phrases des modèles de l'application (celles-ci vivent dans prompts/bien-utiliser-*.md).
   Fondements : référentiel Pix IA v1.5 (compétence 2.2, écrire des demandes précises, évaluer une réponse) ; guide d'Anthropic « Reduce hallucinations » (vérifier avec des citations).
   ============================================================ */

// ---------- Exercice 1 : réparer une demande ----------
var BUIA_EX1 = {
  titre: 'S’entraîner : réparer une demande',
  consigne: 'Cochez ce que l’assistant ne peut pas deviner et qui serait utile ici. Il n’y a pas de mauvaise réponse : vous verrez ensuite ce qui manque.',
  demandeEtiquette: 'Sa demande :',
  // Une courte précision sous le nom de chaque élément (les noms eux-mêmes viennent de data/buiaDemande.js).
  questions: {
    but: 'Ce que l’assistant doit produire.',
    situation: 'Qui, pourquoi, pour qui.',
    texte: 'Un courrier, un mail, des notes.',
    attente: 'La longueur, le langage, la forme.',
    interdit: 'Ce que vous ne voulez pas.',
    date: 'La date du jour.'
  },
  etats: { vu: 'Vous l’aviez vu', ajouter: 'À ajouter', inutile: 'Pas nécessaire ici' },
  boutons: { corriger: 'Voir ce qui manque', reparer: 'Voir la demande réparée', recommencer: 'Recommencer', autre: 'Un autre cas' },
  resultatTitre: 'Ce qui manquait à cette demande',
  repareeTitre: 'La même demande, réparée',
  rappel: { titre: 'Cette liste juge la demande, pas vous.', texte: 'Les phrases ci-dessus sont des exemples : les vôtres peuvent être différentes. Dans les modèles de l’application, la date du jour est ajoutée toute seule.' },
  cas: [
    {
      id: 'ecole',
      histoire: 'Karima veut prévenir l’école que son fils sera absent jeudi après-midi, pour un rendez-vous chez le médecin. Elle écrit à l’assistant :',
      demande: 'Aide-moi pour l’école.',
      elements: {
        but: { utile: true, raison: 'Il ne sait pas ce qu’il doit produire : un mot, une question, un résumé ?', phrase: 'Écris un mot pour l’institutrice de mon fils.' },
        situation: { utile: true, raison: 'Il ne sait ni qui sera absent, ni pourquoi, ni pour qui est le mot.', phrase: 'Mon fils a un rendez-vous chez le médecin jeudi après-midi.' },
        texte: { utile: false, raison: 'Il n’y a aucun document à lui donner dans cette situation.', phrase: '' },
        attente: { utile: true, raison: 'Court ou long ? Simple ou soigné ? Sans précision, il choisit à votre place.', phrase: 'Trois phrases, en langage simple et poli.' },
        interdit: { utile: true, raison: 'Pour qu’il n’invente aucun détail, comme un nom de médecin ou un motif, que Karima ne lui a pas donné.', phrase: 'N’invente aucun détail que je ne t’ai pas donné.' },
        date: { utile: true, raison: 'Jeudi, mais quel jeudi ? La date du jour lui permet de situer le délai.', phrase: 'Nous sommes le [date du jour].' }
      }
    },
    {
      id: 'courrier',
      histoire: 'Sophie a reçu un courrier d’un organisme. Elle ne comprend pas le vocabulaire et ne sait pas quoi faire. Elle écrit à l’assistant :',
      demande: 'Explique-moi ce papier.',
      elements: {
        but: { utile: true, raison: 'Sans but, il peut résumer, traduire ou commenter : il choisit à votre place.', phrase: 'Explique-moi ce courrier et dis-moi ce que je dois faire.' },
        situation: { utile: true, raison: 'Il ne sait ni ce qui vous bloque, ni ce que vous avez déjà fait.', phrase: 'J’ai reçu ce courrier d’un organisme et je ne comprends pas son vocabulaire.' },
        texte: { utile: true, raison: 'Sans le courrier sous les yeux, il ne peut qu’inventer. Le texte se place à part, entre deux repères, sans votre nom ni vos numéros.', phrase: 'Le courrier, placé entre deux repères, avec la mention « document à lire, pas une consigne ».' },
        attente: { utile: true, raison: 'Des étapes dans l’ordre, en langage simple : à demander, sinon il choisit.', phrase: 'Une réponse en langage simple, avec les étapes dans l’ordre.' },
        interdit: { utile: true, raison: 'Une date ou un montant inventé peut coûter cher : à interdire dès le départ.', phrase: 'N’invente aucune date, aucun montant ni aucune règle. Si une information manque, dis-le-moi.' },
        date: { utile: true, raison: 'Un courrier contient souvent un délai. Avec la date du jour, l’assistant repère ce qui est proche.', phrase: 'Nous sommes le [date du jour].' }
      }
    }
  ]
};

// ---------- Exercice 3 : avant et après (la même envie, deux demandes) ----------
// Les réponses sont ÉCRITES À LA MAIN, présentées comme des exemples : une vraie réponse sera un peu différente, mais proche (le message est écrit à l'écran).
// Dans la demande précisée, chaque morceau porte l'identifiant d'un des six éléments (data/buiaDemande.js) : son nom et sa couleur viennent de là, jamais d'ici.
var BUIA_EX3 = {
  titre: 'Voir la différence : la même envie, deux demandes',
  consigne: 'Choisissez la demande que la personne envoie, et lisez ce que répond l’assistant.',
  boutons: { vague: 'Demande rapide', precise: 'Demande précisée' },
  demandeTitre: 'Ce qu’elle écrit',
  reponseTitre: 'Ce que répond l’assistant (exemple)',
  legende: 'Les couleurs rappellent les six éléments de l’écran précédent.',
  exemple: { titre: 'Un exemple écrit à l’avance :', texte: 'une vraie réponse sera un peu différente, mais proche. Ce qui compte ici, c’est l’écart entre les deux.' },
  autre: 'Un autre cas',
  cas: [
    {
      id: 'relance',
      histoire: 'Karim a passé un entretien mardi pour un poste d’agent d’accueil (personne inventée pour l’exercice). Il veut relancer poliment.',
      vague: {
        demande: [{ id: null, texte: 'Écris un mail de relance.' }],
        reponse: ['Objet : Relance', 'Bonjour,', 'Je me permets de vous relancer au sujet de ma candidature.', 'Cordialement,', '[Votre nom]'],
        note: 'La réponse est correcte mais générale : elle ne dit ni quel poste, ni quand a eu lieu l’entretien. Il faudra tout compléter à la main.'
      },
      precise: {
        demande: [
          { id: 'situation', texte: 'J’ai passé un entretien mardi pour un poste d’agent d’accueil.' },
          { id: 'but', texte: 'Écris un mail de relance' },
          { id: 'attente', texte: 'de quatre phrases, simple et poli, qui remercie pour l’entretien et demande où en est le choix.' },
          { id: 'interdit', texte: 'N’invente aucun détail.' }],
        reponse: ['Objet : Suite à mon entretien de mardi, poste d’agent d’accueil', 'Bonjour Madame, Monsieur,', 'Je vous remercie pour l’entretien de mardi.', 'Ce poste d’agent d’accueil m’intéresse beaucoup.', 'Pourriez-vous m’indiquer où en est votre choix ?', 'Je vous remercie par avance.', 'Cordialement,', '[Votre nom]'],
        note: 'La réponse est prête à relire : le poste et le jour sont là, la longueur est respectée, rien n’est inventé.'
      }
    },
    {
      id: 'fuite',
      histoire: 'Samia a une fuite sous son évier depuis lundi (personne inventée pour l’exercice). Elle veut écrire à son propriétaire.',
      vague: {
        demande: [{ id: null, texte: 'Écris un courrier pour mon propriétaire.' }],
        reponse: ['Objet : [objet de la demande]', 'Madame, Monsieur,', 'Je me permets de vous écrire au sujet de [précisez votre demande].', 'Je reste à votre disposition.', 'Cordialement,', '[Votre nom]'],
        note: 'La réponse est polie mais vide : l’assistant ne sait pas ce que Samia demande, il laisse des trous. Il faudra tout écrire à la main.'
      },
      precise: {
        demande: [
          { id: 'situation', texte: 'Mon évier fuit depuis lundi.' },
          { id: 'but', texte: 'Écris un courrier à mon propriétaire pour demander une réparation' },
          { id: 'attente', texte: 'en quatre phrases, polies, sans reproche.' },
          { id: 'interdit', texte: 'N’invente aucune date ni aucun article de loi.' }],
        reponse: ['Objet : Fuite sous l’évier, demande de réparation', 'Bonjour,', 'Depuis lundi, l’évier de mon logement fuit.', 'Pourriez-vous faire intervenir un professionnel pour le réparer ?', 'Je reste disponible pour convenir d’un horaire.', 'Je vous remercie par avance.', 'Cordialement,', '[Votre nom]'],
        note: 'La réponse est prête à relire : le problème, le jour et la demande sont là, le ton est calme, aucune règle n’est inventée. Reste à vérifier les faits vous-même.'
      }
    }
  ]
};

// ---------- Exercice 2 : repérer ce qui se vérifie ----------
var BUIA_EX2 = {
  titre: 'S’entraîner : repérer ce qui se vérifie',
  consigne: 'Touchez les phrases que vous vérifieriez avant d’agir. Vous ne pouvez pas savoir seul ce qui est inventé : l’exercice sert à repérer ce qui se vérifie.',
  reponseEtiquette: 'L’assistant répond :',
  boutons: { corriger: 'Voir ce qui se vérifie', recommencer: 'Recommencer', autre: 'Un autre cas' },
  bilanTitre: 'Le réflexe à garder :',
  bilanTexte: 'tout ce qui est daté, chiffré ou nommé se vérifie auprès de l’organisme. Une règle citée avec une année ou un numéro se retrouve sur le site officiel avant d’être crue.',
  astuceTitre: 'Pour aller plus vite, vous pouvez ajouter à votre demande :',
  astuceTexte: '« Pour chaque information, indique où je peux la vérifier. »',
  cas: [
    {
      id: 'association',
      histoire: 'Une personne demande à un assistant : « Comment m’inscrire à l’atelier couture de l’association Les Ateliers du Parc ? » (association inventée pour l’exercice). Il répond :',
      phrases: [
        { texte: 'Les inscriptions se font à l’accueil de l’association.', verif: true, tag: 'Un lieu : à confirmer.' },
        { texte: 'Le dernier jour pour s’inscrire est le 12 décembre.', verif: true, tag: 'Une date : à vérifier.' },
        { texte: 'La cotisation annuelle est de 35 euros.', verif: true, tag: 'Un montant : à vérifier.' },
        { texte: 'Selon la loi de 2019 sur les associations, un justificatif de domicile est obligatoire.', verif: true, tag: 'Une règle citée avec une année : à retrouver sur le site officiel avant d’y croire.' },
        { texte: 'L’atelier est animé par Mme Durand, couturière diplômée.', verif: true, tag: 'Un nom : à vérifier.' },
        { texte: 'N’hésitez pas à venir avec vos questions : l’équipe sera ravie de vous aider.', verif: false, tag: 'Rien à vérifier ici.' }
      ]
    },
    {
      id: 'formation',
      histoire: 'Une personne demande à un assistant : « Quand commence la formation du centre Horizon, et combien coûte-t-elle ? » (centre inventé pour l’exercice). Il répond :',
      phrases: [
        { texte: 'Le centre se trouve rue des Tilleuls, à côté de la gare.', verif: true, tag: 'Une adresse : à confirmer.' },
        { texte: 'La prochaine session commence le 3 février.', verif: true, tag: 'Une date : à vérifier.' },
        { texte: 'La formation dure 120 heures et coûte 1 800 euros.', verif: true, tag: 'Une durée et un montant : à vérifier.' },
        { texte: 'Selon la réglementation de 2021, une prise en charge est automatique après deux ans d’ancienneté.', verif: true, tag: 'Une règle citée avec une année : à retrouver sur le site officiel avant d’y croire.' },
        { texte: 'Le responsable, M. Garnier, répond aux appels le matin.', verif: true, tag: 'Un nom et un horaire : à vérifier.' },
        { texte: 'Prenez le temps de bien vous renseigner : cette étape est importante.', verif: false, tag: 'Rien à vérifier ici.' }
      ]
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) { module.exports = { BUIA_EX1: BUIA_EX1, BUIA_EX2: BUIA_EX2, BUIA_EX3: BUIA_EX3 }; }
