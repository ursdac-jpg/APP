# Plan des vidéos explicatives (consignes 165 à 168, 08/11/2026)

> **CLÔTURE DE LA PARTIE VIDÉO (décision de Denis, 08/11/2026) : tout ce qui concerne les vidéos est considéré comme terminé.** Lots A, B, C, E faits et branchés ; D1 (ChatGPT) et D2 (Perplexity) faites et branchées. Laissés tels quels à sa demande : la phrase « sans compte » de la vidéo Perplexity (fausse pour les longues demandes, voir leçon 9.134) ; D3 et D4 (assistants avec compte, autorisation de collage : captures de Denis nécessaires) non faites ; quelques vignettes faibles non refaites.

> Mode A (Claude exécute, Denis valide), effort moyen par lot. Les trois pilotes sont faits et validés par Denis (`videos/pilotes/`). Ce plan donne l'ordre, ce qui est fait par qui, et les points à trancher. **Aucune vidéo n'est branchée dans l'application tant que Denis n'a pas validé le lot.**

## 1. Règles communes (déjà décidées)
- Image réelle de l'application en haut, **bande noire sous l'image** avec sous-titres blancs, voix de l'introduction (Tom).
- **Passage délicat : 30 secondes au plus.** **Présentation d'un module : environ 1 minute, dans la page de présentation du module (`-intro`), jamais dans le module.** « Créer un CV » et « Reprendre un CV » : 40 s à 1 min chacun.
- **Ton (consigne 172)** : jamais de mot sur la difficulté, le niveau informatique ou l’autonomie ; ni néophyte ni expert supposé ; du soutien, un niveau homogène. **Une vidéo par entrée, jamais une vidéo partagée entre deux modules.**
- Personnage et données fictifs (Camille Martin). Aucun mot « IA » (« l'assistant en ligne »). Pas de félicitations.
- Une vidéo = un scénario dans `docs/video_presentation/court/scenarios/`. Quand un écran change, on rejoue le scénario : la vidéo est refaite sans repartir de zéro.
- **Anciennes vidéos : supprimées à mesure que les neuves les remplacent** (`videos/*.mp4` d'avant, plus les trois doublons et le fichier manquant).

## 2. Les lots, dans l'ordre recommandé

### Lot 0 : FAIT
Rectangles sur une image, la disquette, Mon Carnet (30 s chacun).

### Lot A : FAIT le 08/11/2026, sept vidéos de gestes validées (la huitième est fondue dans le lot C) de 20 à 27 s dans `videos/gestes/` (pas encore branchées, en attente de la validation de Denis) (Mes Repères retiré : il aura sa vidéo de module) : gestes qui reviennent partout (écrans de l'application seuls, 100 % automatique) `[effort : moyen]`
| # | Vidéo (30 s) | Remplace |
|---|---|---|
| A1 | Importer son CV (fichier, photo, texte) | `importer_IA.mp4` |
| A2 | Masquer des informations dans un texte | `Anonym_txt.mp4` |
| A3 | Coller la réponse de l'assistant dans l'application (écran « Collez la réponse », réponse fictive) | `importer_IA.mp4` |
| A4 | Préférences d'affichage (taille du texte, mode sombre) | nouveau |
| A5 | Besoin d'aide (explication rapide, visite guidée) | nouveau |
| A6 | Le deuxième regard (dans Mes Repères) | nouveau |
| A7 | Le Lexique : chercher un mot et « Mots de cette page » | nouveau |
| A8 | Un regard sur mon CV : lire le résultat | **RETIRÉ DES GESTES (consigne 174, décidé le 08/11/2026)** : le résultat est la dernière partie (environ 30 s) de la vidéo d’une minute de chacun des quatre modules d’analyse ; scénario `regard-resultat.js` gardé comme matière |

### Lot B : FAIT le 08/11/2026, six vidéos de 25 à 29 s dans `videos/gestes/` (pas encore branchées, en attente de la validation de Denis) : création de CV (écrans seuls) `[effort : moyen]`
| # | Vidéo (30 s) | Remplace | Fichier |
|---|---|---|---|
| B1 | Choisir un modèle de CV | `choix_cv.mp4` (n'existe pas) | `modele.mp4` |
| B2 | Bandeau, composition, formes : régler la mise en page | nouveau | `mise-en-page.mp4` |
| B3 | Choisir ses rubriques (par exemple les compétences) : bandeau « Compétences clés », « Autres rubriques » | nouveau | `rubriques.mp4` |
| B4 | CV en PDF : Valider le CV, bloc Exporter, « Enregistrer en PDF » (la fenêtre d'impression du navigateur n'est pas filmable : la voix l'explique) | `cv_pdf.mp4` (doublon faux) | `cv-pdf.mp4` |
| B5 | CV en Word : Valider le CV, « Télécharger en Word » (Word lui-même n'est pas filmé : la voix l'explique) | `cv_word.mp4` (doublon faux) | `cv-word.mp4` |
| B6 | La page « Vos informations » (route `projet`) | `Page_Projet.mp4` | `projet.mp4` |

### Lot C : une vidéo d'environ 1 minute PAR MODULE et PAR PARCOURS, dans la page de présentation (règle de Denis du 08/11/2026) `[effort : moyen à haut]`
Contenu de chaque vidéo (consigne 173) : l'objectif du module, **sa spécificité (ce qu'il fait que les autres ne font pas)**, **sa complémentarité avec les autres modules (ce qu'il reçoit, ce qu'il donne)**, sa finalité, **ses boutons propres à l'écran (consigne 175 : l'icône du Carnet, « Garder comme Repère » pour Mes Repères, le panier de Comparer mes pistes, etc.)**, comment ça fonctionne, ce qu'on y montre à l'écran (par exemple, pour « Comprendre le cadre » : les fiches juridiques et « Affiner ma recherche », avec ses demandes de recherche supplémentaires). Les modules à plusieurs parcours ont **une vidéo par parcours** (ces parcours étaient autrefois des modules séparés).

| Carte de l'accueil | Vidéos d'une minute |
|---|---|
| Mes documents | **Créer un nouveau CV : 3** (à la main sans assistant, avec l'assistant en ligne, à partir de mon récit) ; **Reprendre mon CV : 3** (le garder et le compléter, le reformuler et le présenter, le refaire moi-même sans assistant) ; **Lettre et entretien en version rapide : 2** (la lettre, la fiche d'entretien) |
| Me préparer à candidater | Écrire ma lettre avec l'assistant ; M'entraîner à un entretien ; Employeurs près de chez moi |
| Boîte à outils | Mes Repères (avec le deuxième regard) ; Mon Carnet ; Le Lexique ; Découvrir mes compétences (**module à part entière**, distinct de la 3e porte de « Créer un nouveau CV » : sa vidéo parle de la fiche de compétences, voir consigne 171) |
| Outils d'analyse | Analyser ma candidature ; Un regard sur mon CV ; Les mots de votre CV (ATS) ; Cohérence de mon dossier |
| Se tenir informé | Comprendre le cadre ; Comprendre les chiffres (avec Mon territoire) ; Qui fait quoi |
| Vous hésitez encore ? | Comparer mes pistes ; Un CV, plusieurs métiers |

**Avancement du lot C (08/11/2026)** : faites et envoyées à Denis, dans `videos/modules/` : Mon Carnet (`carnet.mp4`, pilote validé sur sa structure), Lexique (`lexique.mp4`), Mes Repères avec Regard Extérieur et Deuxième Regard (`reperes.mp4`), Découvrir mes compétences (`competences.mp4`), puis les quatre outils d'analyse (08/11/2026) : Un regard sur mon CV (`regard.mp4`), Les mots de votre CV (`ats.mp4`), Analyser ma candidature (`bilan.mp4`), Cohérence de mon dossier (`coherence.mp4`). Pour ces quatre, la dernière partie montre le résultat (consigne 174), le départ se fait sur le résultat puis « Revoir la présentation » (le vrai bouton). Scénarios `module-*.js`. Puis la carte « Me préparer à candidater » (08/11/2026) : Écrire ma lettre (`lettre.mp4`), M'entraîner à un entretien (`entretien.mp4`), Employeurs près de chez moi (`employeurs.mp4`) ; la lettre et l'entretien jouent tout le parcours réel à l'écran (CV et réponse de l'assistant fictifs), d'où environ 75 à 80 secondes. Se tenir informé (08/11/2026) : Comprendre le cadre (`cadre.mp4`), Comprendre les chiffres (`chiffres.mp4`), Qui fait quoi (`quifaitquoi.mp4`, environ 50 secondes chacune). Mes documents (08/11/2026), 8 vidéos de 50 à 66 secondes : Créer à la main (`creer-main.mp4`), avec l'assistant (`creer-assistant.mp4`), à partir de mon récit (`creer-recit.mp4`), Reprendre : garder (`reprendre-garder.mp4`), reformuler (`reprendre-reformuler.mp4`), refaire soi-même (`reprendre-sans.mp4`), Lettre rapide (`pret-lettre.mp4`), Fiche d'entretien rapide (`pret-entretien.mp4`). Elles jouent le début réel de chaque parcours (CV fictif déposé, premiers écrans) sans la réponse de l'assistant. Vous hésitez encore (08/11/2026) : Comparer mes pistes (`pistes.mp4`) et Un CV, plusieurs métiers (`ucpm.mp4`). **Le lot C est entièrement fait (24 vidéos de module et de parcours), il attend l'avis de Denis ; restent les lots D (sites des assistants, dépend de ses enregistrements) et E (branchement).**

**Total : 24 vidéos d'une minute** (19 modules, dont 3 qui se déploient en 8 parcours) en plus de l'introduction générale qui existe déjà.
**Préalable : la page de présentation de « Créer un nouveau CV »** (elle n'a plus de vraie page de présentation, seulement un court « Comment ça se passe ») est à créer AVANT, avec le même patron que « Reprendre mon CV ». Les pages de présentation des trois parcours de « Créer » existent déjà.

### Lot D : sites des assistants en ligne `[effort : haut, dépend de Denis]`
| # | Vidéo | Comment |
|---|---|---|
| D1 | Copier la demande, la coller chez ChatGPT, copier la réponse | **Denis enregistre son écran** (15 à 20 s), Claude fait voix, sous-titres, coupe et raccord avec l'écran de l'application |
| D2 | Même chose avec Perplexity | idem |
| D3 | Un assistant avec compte (un film général) | idem, par Denis |
| D4 | Navigation privée : accepter l'autorisation de collage | partie application par Claude, fenêtre du navigateur par Denis |
- **D1 faite le 08/11/2026 en images fixes** (`chatgpt-demande.mp4`, 32 s, scénario `scenarios/chatgpt-demande.js`, outil `fabriquer_images.js`) : le navigateur intégré à l'application ouvre ChatGPT sans test. **Validée par Denis et branchée le 08/11/2026** (`videos/gestes/chatgpt-demande.mp4`, geste `chatgpt-demande`, fenêtre de collage `modules/collage-reponse`, état « assistant ouvert », ChatGPT seulement). **D2 (Perplexity) faite le 08/11/2026 en images fixes** (`perplexity-demande.mp4`, 31 s, scénario `scenarios/perplexity-demande.js`) : Perplexity s'utilise sans compte, la fenêtre « Connectez-vous » qui apparaît se ferme avec sa croix (indication de Denis, que la voix reprend). **Validée par Denis et branchée le 08/11/2026** (`videos/gestes/perplexity-demande.mp4`, même emplacement que ChatGPT, seulement quand l'assistant choisi est Perplexity).
- Raison : le site de ChatGPT arrête mon navigateur automatique par un test « humain » que je n'ai pas le droit de passer (leçon 9.129). Piste de secours à tenter, sans garantie : images fixes prises dans le navigateur intégré à l'application, qui s'est ouvert sans test.

### Lot E : branchement dans l'application `[effort : moyen]` (après validation de chaque lot)
- **FAIT le 08/11/2026 pour les 24 vidéos de module et de parcours (lot C)** : composant unique `modules/video-presentation/` (habillage C choisi par Denis : bouton-ligne avec vignette, lecteur qui se déplie au clic, deux états, rien de retenu), branché sur les pages de présentation ; testé dans le navigateur (clair, sombre, téléphone). **Aussi fait le 08/11/2026** : la ligne à filet pour les petits passages (`htmlVideoGeste`), branchée sur masquer un texte, masquer sur une image, coller la réponse, PDF et Word ; ancien mécanisme supprimé. **Les neuf autres gestes des lots A et B sont placés le 08/11/2026.** **Les huit anciens fichiers `videos/*.mp4` sont supprimés le 08/11/2026, sur accord de Denis.** **Reste** : brancher le lot D quand il existe. Recherche d'accueil et Lexique : non faite, une vidéo n'est pas un module (les modules sont déjà trouvables).
- **Composant unique** « vidéo de présentation » (une seule source, dans `js/app.js` ou module dédié), posé en haut de chaque page `-intro` : lecteur dans la page, jamais dans une fenêtre, avec sous-titres déjà incrustés.
- Composant « petite vidéo de passage » : on étend `DEMOS_VIDEO_ERIP` / `htmlDeclencheurDemoVideo` (le bouton disparaît tout seul si le fichier manque, donc ajout progressif sans risque).
- Mise à jour de `docs/JOURNAL_DES_CHANGEMENTS.md`, recherche d'accueil et Lexique (« vidéo », « montrer comment »), ligne `data/nouveautes.js` à la fin d'un lot validé.
- Suppression des anciennes vidéos remplacées.

## 3. Points à trancher par Denis (recommandation en premier)
1. **Lecteur dans la page pour les passages de 30 s** : (Recommandé) un petit bouton « Voir en 30 secondes » qui déplie le lecteur **à la place même**, sans fenêtre. *Bénéfice* : cohérent avec ta règle « pas de fenêtre ». *Risque* : la page s'allonge un peu. Autre option : lecteur toujours visible ; plus direct mais alourdit chaque page.
2. **Ordre des lots** : (Recommandé) A, puis B, puis C, puis D, puis branchement du tout. *Bénéfice* : les lots A et B sont sans risque et couvrent les gestes les plus utilisés. *Risque* : D (ChatGPT, Perplexity) arrive en dernier alors que tu l'attends beaucoup ; autre option : demander tes enregistrements dès maintenant, en parallèle.
3. **Branchement** : (Recommandé) brancher au fil des lots, un lot à la fois, après ton avis. Autre option : tout brancher à la fin ; moins de changements dans l'application, mais tu verrais le résultat tard.
4. ~~Reprendre mon CV~~ : réglé le 08/11/2026, ses trois voies sont « le garder et le compléter », « le reformuler et le présenter », « le refaire moi-même sans assistant ».
5. **Réglé par Denis le 08/11/2026** : ordre A, B, C, D, E validé ; une vidéo par parcours ; page de présentation de « Créer un nouveau CV » d'abord.

## 4. Rythme et coût (honnêtes)
- Environ **4 à 5 vidéos de 30 s par séance**, relues par images extraites avant de te les montrer. Une présentation de 1 minute compte pour deux.
- Total prévu : 8 gestes (lot A) + 7 création de CV (lot B) + 24 présentations d'une minute (lot C) + 4 assistants (lot D), soit environ 43 vidéos.
- Poids : environ 1,4 Mo par vidéo de 30 s (mesuré sur les pilotes), donc moins de 50 Mo pour l'ensemble des passages ; sans souci pour GitHub.
- Maintenance : quand un écran change, on rejoue le scénario concerné. Une liste « quelle vidéo montre quel écran » sera tenue dans `BRIQUES_COMMUNES.md` quand le composant sera branché.
