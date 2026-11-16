/* Vidéo « activer la recherche web sur ChatGPT » (consigne 267, tâche R5, 12/11/2026). 25 s environ.
   Film fait d'IMAGES FIXES réelles prises dans le navigateur intégré (ChatGPT ouvert sans compte, cookies non essentiels refusés, rien envoyé),
   avec des rectangles sur les zones à cliquer, comme chatgpt-demande.js. Fabrication : `node fabriquer_images.js chatgpt-recherche-web`.
   Images : C:/Users/Denis/video_travail/chatgpt-recherche-web/img (f1-accueil, f2-menu, f3-active ; 800 x 699).
   Rectangles : [x, y, largeur, hauteur] dans l'image d'origine. L'écran de ChatGPT change de temps en temps : à reprendre si le menu « + » n'est plus le même. */
module.exports = {
  dossierImages: 'chatgpt-recherche-web/img',
  blocs: [
    { id: 'r1', voix: 'Quand l’application vous demande de chercher sur internet, ouvrez ChatGPT, sans compte, puis cliquez sur le signe plus, à gauche de la case.', sous_titre: 'Ouvrez ChatGPT (sans compte), puis cliquez sur le signe « + » à gauche de la case.',
      images: [{ f: 'f1-accueil.jpg', rect: [212, 413, 36, 33] }] },
    { id: 'r2', voix: 'Dans le petit menu, choisissez « Recherche web ».', sous_titre: 'Dans le petit menu, choisissez « Recherche web ».',
      images: [{ f: 'f2-menu.jpg', rect: [214, 492, 160, 26] }] },
    { id: 'r3', voix: 'Les mots « Recherche web » apparaissent en bleu dans la case : l’option est activée.', sous_titre: 'Les mots « Recherche web » apparaissent en bleu : l’option est activée.',
      images: [{ f: 'f3-active.jpg', rect: [243, 439, 120, 23] }] },
    { id: 'r4', voix: 'Vous pouvez maintenant coller votre demande, avec contrôle et V, et l’envoyer.', sous_titre: 'Vous pouvez maintenant coller votre demande (Ctrl + V) et l’envoyer.',
      images: [{ f: 'f3-active.jpg', rect: [208, 385, 584, 90] }] }
  ]
};
