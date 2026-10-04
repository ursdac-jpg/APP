# Chantier : un seul écran de mise en page, le format choisi à la fin (2026-09-27)

> Demande explicite de Denis (2026-09-27, en direct) : l'écran « Le format » (Word ou PDF, choisi en
> tout début de parcours CV) disparaît. « La mise en page » devient le point d'entrée unique, avec
> toutes les options, quel que soit le format de page (A4 ou Mini CV A5). Le format du **fichier**
> (Word ou PDF) se choisit uniquement à la fin, à l'étape Exporter, avec les deux boutons toujours
> proposés ensemble. Décisions validées par Denis : verrou « Valider le CV » commun aux deux boutons ;
> fenêtre « Atelier CV » alignée dans un second temps, une fois ce commit validé.

Suite de `docs/PLAN_PANNEAU_UNIQUE_WORD_PDF_2026-09-27.md` (qui avait déjà unifié le panneau lui-même
ce matin, mais gardait le format Word/PDF comme un choix fait *avant* d'arriver dessus).

## Ce qui change

- `_cvEcranUniqueMiseEnPage()` renvoie désormais **toujours `true`** (avant : `true` seulement en
  PDF, ou en Word hors Mini CV A5) — fonction gardée telle quelle (pas supprimée : ~25 appels dans
  tout le fichier) pour ne jamais dupliquer la règle.
- L'écran « Le format » (2 grandes cartes Word/PDF, `contenuRectangleFormatCV`) n'est plus affiché
  pour le CV. Les fonctions restent définies (code mort, retrait à part plus tard).
- « Exporter » propose désormais **toujours les deux boutons** (Télécharger le Word / Enregistrer en
  PDF), plus de bouton unique dont le libellé dépendait d'un format choisi en amont. Le bouton
  « Faire aussi une version [autre format] » disparaît (les deux sont déjà là).
- Le clic « Télécharger » a deux valeurs désormais : `data-format-export="docx"` télécharge TOUJOURS
  le Word, `data-format-export="pdf-imprimer"` (nouveau) ouvre TOUJOURS la boîte d'impression PDF —
  avant, un seul bouton `"docx"` bifurquait selon l'onglet choisi en amont.
- **Verrou « Valider le CV »** : s'applique désormais aux deux boutons (avant : PDF seulement),
  décision validée par Denis.
- **Parité Word/PDF dans « Réglages supplémentaires »** : les 5 cartes qui distinguaient encore
  Word/PDF (`_htmlSecPageMiseEnPage`, `_htmlSecCouleursMiseEnPage`, `_htmlSecHautMiseEnPage`,
  `_htmlSecTexteMiseEnPage`, `_htmlSecAfficheMiseEnPage`) lisent maintenant `_cvEcranUniqueMiseEnPage()`
  au lieu de `dossier.formatCV === 'pdf'` : les réglages annoncés « disponibles en PDF » (dégradé,
  anneau photo, couleur des pastilles, liste de polices complète...) sont désormais proposés à
  Word aussi. Même chose pour les 3 gestionnaires de `_wireCarteSimpleMiseEnPage` qui poussaient
  ces valeurs uniquement côté PDF.
- Les suggestions « Et maintenant ? » (lettre de motivation / entretien) et le message d'accueil
  affiché après un export réussi (`_afficherEtMaintenantApresExportPdf`) sont désormais **agnostiques
  au format** (avant : réservés au PDF).
- Message d'accueil du bloc Exporter reformulé : mentionne que le CV est imprimable en A4 ou en Mini
  CV (A5), et que le choix se fait maintenant entre les deux boutons.

## Ce qui ne change pas (vérifié)

- Le PDF garde exactement le même comportement qu'avant (panneau, réglages, export) : la fonction
  `_cvEcranUniqueMiseEnPage()` renvoyait déjà `true` en PDF avant ce commit.
- Une session déjà enregistrée avec `dossier.formatCV === 'pdf'` (ancien format persistant) continue
  de fonctionner à l'identique (vérifié en navigateur).
- Le Mini CV A5 (Word) utilise désormais lui aussi le panneau unique (plus d'ancien panneau
  Composeur à afficher) — cohérent avec l'export déjà branché sur le nouveau moteur cet après-midi.

## Vérifié en navigateur

- Un dossier tout neuf, sans jamais définir `dossier.formatCV` : arrive directement sur « La mise en
  page » (9 cartes, aperçu identique au PDF), aucune carte « Le format ».
- Verrou : `dossier.cvTermine = false` ferme le bloc Exporter (message « s'ouvrira après « Valider le
  CV » ») ; remis à `true`, les deux boutons apparaissent.
- Export réel des deux formats depuis le même écran (Word : blob `.docx` produit ; PDF : bouton
  dédié, déclenche bien la boîte d'impression réelle du navigateur — vérifié que le code est une
  reprise à l'identique de l'ancien chemin, jamais retesté par clic automatisé au-delà de la
  première fois, une vraie boîte d'impression bloque l'automatisation).
- Mini CV A5 (Portrait) : export Word toujours fonctionnel, panneau unique affiché (9 cartes).
- `npm test` : 1018 verts après chaque étape.

## Reste (pas dans ce commit)

- La fenêtre « Atelier CV » (`htmlAtelierCV()`) garde encore son propre écran de choix Word/PDF,
  volontairement non touchée — prochaine étape, une fois celle-ci validée par Denis.
- « Remplir la page » en sortie Word (2 Mini CV A5 par feuille) — chantier séparé, pas encore
  commencé.
- Nettoyage du code mort (`contenuRectangleFormatCV`, ancien niveau 3 de « La mise en page ») :
  jamais à chaud, après validation.
