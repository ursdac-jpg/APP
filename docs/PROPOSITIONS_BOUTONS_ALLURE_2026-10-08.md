# Question de Denis (2026-10-08) : habiller les trois boutons Sobre / Standard / Créatif selon ce qu'ils proposent (propositions, rien de codé)

**Constat** : trois boutons de même forme (« Sobre », « Standard », « Créatif ») ne disent pas ce que la personne trouvera derrière. But : donner envie de cliquer et faire comprendre qu'il y a plusieurs façons de faire le CV, sans diagnostic, ton simple.

**Ce que chaque bouton propose réellement** (vérifié dans le code) : **Sobre** = 12 modèles discrets, sans couleurs vives ni icônes ; **Standard** = un CV de base libre, avec « Style rapide » (ambiance au hasard) et tous les réglages ; **Créatif** = 24 modèles colorés, avec icônes, classés par familles.

**Propositions** (une recommandation en premier) :
1. **Recommandée : une mini-vignette de CV dans chaque bouton + une phrase de trois mots.** Sobre : petit CV gris, « Discret et classique ». Standard : petit CV bleu à une couleur, « Libre, à votre main ». Créatif : petit CV à bandeau coloré et icônes, « Coloré, avec des modèles ». Bénéfice : on comprend sans lire ; réutilise les vignettes de la galerie (`_mepVignetteMini`), peu de code. Risque : place sur téléphone (vignettes petites, texte sous le nom).
2. **Un trait de couleur propre par bouton** (gris, couleur du thème, multicolore) : bénéfice, repérage immédiat ; risque, trois couleurs de plus à tenir en mode sombre.
3. **Un exemple vivant au survol ou au premier clic** (aperçu agrandi d'un modèle au hasard de l'allure) : bénéfice, donne envie d'explorer ; risque, rien au toucher (téléphone), à doubler d'un bouton.
**À valider avec une maquette** (effort haut) : les trois boutons côte à côte, vignette + mot, version téléphone, mode sombre, bouton actif bien marqué ; puis code (effort moyen).
