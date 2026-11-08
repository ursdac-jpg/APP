# Inventaire des vidéos explicatives (consigne 165, 07/11/2026)

> Document de décision. **Rien n'a été produit.** Il répond à quatre questions de Denis : où des vidéos aideraient, ce que je recommande, ce que je peux faire seul, ce que je ne peux pas faire seul.

---

## 1. Ce qui existe aujourd'hui

| Fichier | Durée | Sujet | État |
|---|---|---|---|
| `video/presentation.mp4` | 3 min 17 | Introduction, voix + sous-titres, écrans de l'application | **À jour**, c'est le modèle à suivre (16,8 Mo) |
| `videos/Anonym_txt.mp4` | 5 s | Masquer des informations dans un texte | Ancienne interface, sans son |
| `videos/Anonym_vid_importer.mp4` | 32 s | Masquer sur une image ou un PDF (rectangles) | Ancienne interface, sans son |
| `videos/Exp_imp_ai.mp4` | 15 s | Envoyer le texte préparé à l'assistant | Ancienne interface, sans son |
| `videos/importer_IA.mp4` | 22 s | Récupérer la réponse et l'importer | Ancienne interface, sans son |
| `videos/Astuce_img.mp4` | 33 s | Astuce sur les images | Ancienne interface, sans son |
| `videos/Page_Projet.mp4`, `cv_pdf.mp4`, `cv_word.mp4` | 46 s | **Trois fichiers strictement identiques** (même contenu) | Faux : la démo « CV en PDF » et « CV en Word » montre la page Projet |
| `choix_cv.mp4` | n'existe pas | Déclarée dans le code | Jamais faite |
| Démo « recherche web » de Comparer mes pistes | n'existe pas | Jamais tournée | Jamais faite |

Aucune des vidéos du dossier `videos/` n'a de voix ni de sous-titres. Les 9 démos déclarées dans l'application (`DEMOS_VIDEO_ERIP`, `js/app.js`) s'affichent par un bouton qui **disparaît tout seul** quand le fichier manque : on peut donc ajouter les vidéos une par une, sans rien casser.

---

## 2. Ce que je peux faire seul, et ce que je ne peux pas

### A. Les écrans de NOTRE application : oui, de bout en bout
La chaîne de la vidéo d'introduction est réutilisable telle quelle : scénario écrit, navigateur piloté (curseur dessiné, vrais clics), voix synthétique `fr_FR-tom-medium`, sous-titres `.vtt`, assemblage. Les écrans sont **réellement ceux de l'application**, avec des données fictives. Avantage décisif : le scénario reste dans le dépôt. Quand l'interface change, **je rejoue le scénario** et la vidéo est refaite sans repartir de zéro. C'est ce qui manquait aux vidéos d'avant.

### B. Les sites des autres (ChatGPT, Perplexity, Gemini, etc.) : pas seul, pas sans ton accord
Vérifié aujourd'hui en lecture seule : **ChatGPT et Perplexity s'ouvrent sans compte** dans mon navigateur. Mais :
- **Envoyer du texte** (même fictif) à ces sites, c'est envoyer à un service extérieur : il me faut ton accord explicite, vidéo par vidéo.
- Je ne peux **ni créer de compte, ni me connecter, ni passer un test anti-robot**. Si le site en demande un, la prise de vue s'arrête. Cela peut arriver sans prévenir.
- Les pages de ces sites **changent souvent** (boutons déplacés, renommés). Une vidéo les montrant vieillit vite, et mon scénario peut casser du jour au lendemain.
- Avec un compte (versions payantes, historique, etc.), je ne peux **pas** montrer l'écran de la personne : seul toi peux l'enregistrer.
- Je ne dois pas fabriquer une **fausse copie** de l'écran de ChatGPT ou de Perplexity pour faire croire que c'est le vrai : ce serait trompeur pour la personne et pour ces sociétés.

### C. Verdict
| Besoin | Je le fais seul ? |
|---|---|
| Écrans de l'application (masquer, importer, regard, carnet, repères, Lexique, etc.) | **Oui** |
| Voix, sous-titres, coupe à 30 secondes, assemblage | **Oui**, y compris sur tes enregistrements |
| ChatGPT et Perplexity sans compte | **Oui, en essai**, avec ton accord et un texte fictif ; risque de blocage |
| Autres assistants sans compte (Gemini coupe sans compte, mesuré le 29/09) | **Non fiable** |
| Un assistant AVEC compte | **Non** : seul toi peux enregistrer |
| Navigation privée | **Oui** pour montrer le principe (contexte isolé sans mémoire) ; voir la question en fin de document |

### D. La voie que je recommande : **mixte**
Je fais seul toutes les parties « application ». Pour la partie « chez l'assistant », **tu enregistres ton écran** (ton enregistreur Radeon ReLive suffit, 15 à 20 secondes par assistant) et je fais la voix, les sous-titres, la coupe et l'assemblage. Si tu es d'accord, je peux **aussi tenter ChatGPT et Perplexity sans compte** moi-même, en essai, pour t'éviter ce travail ; si le site m'arrête, tu prends le relais.

---

## 3. Inventaire proposé

### 3.1 Présentation de chaque module (environ 1 minute)
Chaque module a déjà une page d'introduction ; la vidéo s'y ajoute en haut, avec le bouton de démo existant.

| # | Module | Route d'introduction |
|---|---|---|
| P1 | Introduction générale (existe, 3 min 17 : à garder) | `introduction` |
| P2 | Découvrir mes compétences / Découverte | `decouverte-intro`, `mes-competences-intro` |
| P3 | Analyser ma candidature (Bilan, lecture automatique des offres) | `ats-intro` |
| P4 | Le regard d'un recruteur | `regard-recruteur-intro` |
| P5 | Se tenir informé / Comprendre le cadre | `se-tenir-informe-intro` |
| P6 | Aide à la décision (Comparer mes pistes) | `aide-decision-intro` |
| P7 | Un CV, plusieurs métiers | `un-cv-plusieurs-metiers-intro` |
| P8 | Comprendre les chiffres | `comprendre-les-chiffres-intro` |
| P9 | Mon territoire | `mon-territoire-intro` |
| P10 | Employeurs (qui fait quoi) | `employeurs-intro` |
| P11 | Le Lexique, le Carnet, Mes repères, le deuxième regard | à confirmer : pas de page `-intro` pour certains (à créer avec la vidéo ?) |

### 3.2 Passages clés (30 secondes au plus)

**Priorité 1, transversaux (tout le monde y passe, c'est là que les gens se perdent)**
| # | Passage | Où le montrer | Qui l'enregistre |
|---|---|---|---|
| K1 | Copier la demande, ouvrir ChatGPT, la coller | écran « Collez la réponse » et envoi | mixte |
| K2 | Même chose avec Perplexity | idem | mixte |
| K3 | Même chose pour un assistant avec compte (un seul film générique, ordre des gestes identique) | idem | **Denis** |
| K4 | Copier toute la réponse, revenir et la coller dans l'application | écran « Collez la réponse » | **moi** |
| K5 | En navigation privée : ce qu'il faut autoriser, pourquoi le collage peut être bloqué | fenêtre d'avertissement navigation privée | mixte |
| K6 | Masquer des informations dans un texte | masquage texte | **moi** |
| K7 | Dessiner des rectangles sur une image ou un PDF scanné | masquage image | **moi** |
| K8 | Anonymiser un CV de bout en bout (choisir quoi masquer, vérifier, envoyer) | CV | **moi** |
| K9 | Importer son CV (fichier, texte, photo) | import CV | **moi** |

**Priorité 2, modules et gestes qui reviennent**
| # | Passage | Remarque |
|---|---|---|
| K10 | Obtenir « un regard sur le CV » (regard recruteur) | module P4 |
| K11 | Le deuxième regard | à confirmer où il se trouve dans l'application |
| K12 | Le Carnet : ajouter et retrouver une note | |
| K13 | Mes repères : choisir et utiliser un repère | |
| K14 | Le Lexique : chercher un mot, « Mots de cette page » | nouveau, 07/11 |
| K15 | La disquette : sauvegarder et rouvrir son travail | remplace `Exp_imp_ai` si lié |
| K16 | Choisir un modèle de CV (couleurs, bords) | remplace le fichier manquant `choix_cv` |
| K17 | CV en PDF : télécharger | remplace le doublon `cv_pdf` |
| K18 | CV en Word : télécharger et ouvrir | remplace le doublon `cv_word` |
| K19 | La page Projet | remplace `Page_Projet` |
| K20 | Comprendre les chiffres : lire une fiche, comparer, imprimer | |
| K21 | Comparer mes pistes : activer la recherche web | jamais fait |

**Priorité 3, plus tard**
Astuce images (à regarder pour savoir si elle sert encore), Mon territoire, Employeurs (qui fait quoi), Aide à la décision pas à pas.

---

## 4. Recommandations

1. **Pilote de 3 vidéos avant tout**, pour mesurer le travail réel et te faire juger la voix, le rythme et les sous-titres : **K4** (coller la réponse, tout chez nous), **K7** (rectangles) et **P4** (présentation d'un module, 1 minute).
2. **Faire d'abord les écrans de l'application** (K4 à K9, K15 à K21) : c'est stable et entièrement à ma main.
3. **Les sites tiers en dernier**, une fois le pilote validé : K1 et K2 en essai de ma part (avec ton accord), K3 par toi.
4. **Remplacer les trois doublons et le fichier manquant** dans la foulée (K16 à K19), c'est un défaut existant à corriger.
5. **Sous-titres toujours visibles** et mention « sans son » possible : le public est fragile, et beaucoup consultent sans casque.
6. **Poids des fichiers** : l'introduction pèse 16,8 Mo pour 3 min 17 ; viser environ 3 Mo par vidéo de 30 s et 6 Mo par minute, vérifier avec Inkéo / PCGI 87 que l'hébergement les accepte.
7. **Aucun mot « IA » dans les voix et sous-titres** : dire « l'assistant en ligne » comme partout.
8. **Données fictives uniquement** à l'écran ; jamais de vraie coordonnée.
9. **Même voix que l'introduction** (cohérence).

### Ordre et ampleur (indicatif)
| Lot | Contenu | Remarque |
|---|---|---|
| 0. Pilote | K4, K7, P4 | à montrer à Denis avant de continuer |
| 1. Gestes de base | K6, K8, K9, K10, K15 à K19 | tout chez nous |
| 2. Assistants | K1, K2, K3, K5 | mixte ou Denis |
| 3. Présentations | P2 à P10 | 9 vidéos d'une minute |
| 4. Modules | K11 à K14, K20, K21 | |

---

## 5. Questions pour Denis
1. **Navigation privée** : par « autoriser l'accès », parles-tu de la **permission de copier-coller** que le navigateur demande, ou de **laisser l'application garder la disquette / le Carnet** malgré la fenêtre privée ? À confirmer avant de scénariser K5.
2. **Où est exactement « le deuxième regard »** dans l'application ? (pour ne pas inventer un parcours)
3. **Ton accord** pour que j'essaie ChatGPT et Perplexity sans compte avec un texte fictif (sinon : tu enregistres).
4. **Hébergement** : taille maximale acceptable pour Inkéo / PCGI 87 ?
5. Les vieilles vidéos : **les retirer** des démos dès que les neuves existent ?
