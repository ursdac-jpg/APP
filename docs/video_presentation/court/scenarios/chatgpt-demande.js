/* Lot D, vidéo D1 : coller la demande chez ChatGPT, envoyer, copier la réponse. 30 s environ.
   Écran d'un site tiers : le navigateur automatique est arrêté par ce site (leçon 9.129), mais le navigateur intégré à l'application s'ouvre sans test.
   Ce film est donc fait d'IMAGES FIXES prises dans ce navigateur (site ouvert sans compte, vraie demande de l'application, vraie réponse),
   avec des rectangles sur les zones à cliquer. Fabrication : `node fabriquer_images.js chatgpt-demande` (images dans video_travail/chatgpt/img).
   Rectangles : [x, y, largeur, hauteur] dans l'image d'origine (800 x 701). */
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Votre demande est copiée. Ouvrez le site de l’assistant en ligne, ici ChatGPT : il s’utilise sans compte.', sous_titre: 'Votre demande est copiée. Ouvrez le site de l’assistant, ici ChatGPT (sans compte).',
      images: [{ f: 'f1-accueil.jpg', rect: [208, 338, 582, 40] }] },
    { id: 'c2', voix: 'Cliquez dans la case, puis collez avec contrôle et V. Toute la demande apparaît.', sous_titre: 'Cliquez dans la case, puis collez avec Ctrl + V. Toute la demande apparaît.',
      images: [{ f: 'f2-colle.jpg', rect: [208, 262, 582, 192] }] },
    { id: 'c3', voix: 'Envoyez avec la flèche, puis attendez que la réponse soit terminée.', sous_titre: 'Envoyez avec la flèche, puis attendez la fin de la réponse.',
      images: [{ f: 'f2-colle.jpg', rect: [752, 419, 36, 30], part: 0.5 }, { f: 'f3b-reponse.jpg', part: 0.5 }] },
    { id: 'c4', voix: 'Descendez tout en bas de la réponse, puis cliquez sur l’icône « Copier ».', sous_titre: 'Descendez en bas de la réponse, puis cliquez sur l’icône « Copier ».',
      images: [{ f: 'f4-copier.jpg', rect: [207, 493, 28, 26] }] },
    { id: 'c5', voix: 'Une coche apparaît : la réponse est copiée. Il ne reste qu’à revenir sur l’application.', sous_titre: 'Une coche apparaît : la réponse est copiée. Revenez sur l’application.',
      images: [{ f: 'f5-coche.jpg', rect: [207, 493, 28, 26] }] }
  ]
};
