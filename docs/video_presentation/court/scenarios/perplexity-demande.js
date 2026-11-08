/* Lot D, vidéo D2 : coller la demande chez Perplexity, envoyer, copier la réponse. Même méthode que chatgpt-demande.js (images fixes du navigateur intégré).
   Perplexity s'utilise sans compte : une fenêtre « Connectez-vous » peut apparaître, elle se ferme avec sa croix (la voix le dit).
   Fabrication : `node fabriquer_images.js perplexity-demande`. Rectangles : [x, y, largeur, hauteur] dans l'image d'origine (800 x 701). */
module.exports = {
  dossierImages: 'perplexity/img',
  blocs: [
    { id: 'p1', voix: 'Votre demande est copiée. Ouvrez Perplexity : il s’utilise sans compte.', sous_titre: 'Votre demande est copiée. Ouvrez Perplexity (sans compte).',
      images: [{ f: 'p1-accueil.jpg', rect: [243, 281, 490, 92] }] },
    { id: 'p2', voix: 'Cliquez dans la case, puis collez avec contrôle et V. Si une fenêtre de connexion apparaît, fermez-la avec sa croix.', sous_titre: 'Cliquez dans la case, collez avec Ctrl + V. Une fenêtre de connexion ? Fermez-la avec sa croix.',
      images: [{ f: 'p2-colle.jpg', rect: [243, 281, 490, 238] }] },
    { id: 'p3', voix: 'Envoyez avec la flèche, puis attendez que la réponse soit terminée.', sous_titre: 'Envoyez avec la flèche, puis attendez la fin de la réponse.',
      images: [{ f: 'p2-colle.jpg', rect: [694, 480, 32, 32], part: 0.5 }, { f: 'p3-reponse.jpg', part: 0.5 }] },
    { id: 'p4', voix: 'Descendez en bas de la réponse, puis cliquez sur l’icône « Copier ».', sous_titre: 'Descendez en bas de la réponse, puis cliquez sur l’icône « Copier ».',
      images: [{ f: 'p4-copier.jpg', rect: [207, 264, 26, 26] }] },
    { id: 'p5', voix: 'Une coche apparaît : la réponse est copiée. Revenez sur l’application.', sous_titre: 'Une coche apparaît : la réponse est copiée. Revenez sur l’application.',
      images: [{ f: 'p5-coche.jpg', rect: [207, 264, 26, 26] }] }
  ]
};
