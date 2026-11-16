# Plan de mise à jour des présentations, des vidéos et du diaporama (12/11/2026)

> Demande de Denis (12/11/2026) : les changements de fond faits ces derniers jours (consignes 255 à 262) ont un effet visible sur ce que montrent les vidéos de présentation et le diaporama de l'introduction. Il faut les repérer, puis décider quoi refaire. **Rien n'a été modifié ici : c'est un audit en lecture seule et un plan, à valider par Denis.**

## 1. Ce qui est constaté (image par image)

### Touchés, certain
| Support | Ce qu'on y voit | Pourquoi c'est périmé |
|---|---|---|
| Vidéo d'introduction `video/presentation.mp4` (3 min 17), vers 1 min 15 à 1 min 20 | L'écran « Votre parcours » avec **la quatrième question « Ce qui compte pour vous aujourd'hui »** (Équilibre de vie, Ambiance, Sens et évolution), l'encadré « Une seule case suffit... » et la bulle « Chaque question a besoin d'au moins une case cochée » | Consigne 261 : la quatrième question est retirée, le maximum de choix s'affiche, les textes des encadrés ont changé. La voix dit « Elle coche ce qui compte pour elle », phrase à revoir. |
| Sous-titres `video/presentation.vtt` | « Elle coche ce qui compte pour elle : les propositions sont déjà là, elle choisit. » | Même raison : à reformuler (trois questions sur l'expérience, pas des préférences). |
| Diaporama / introduction écrite `docs/MAQUETTE_INTRODUCTION_APPLICATION_2026-11-01.html` et `docs/MAQUETTE_DIAPORAMA_INTRODUCTION_2026-11-02.html` | Étape 3 « Elle choisit ce qui compte pour elle », capture `docs/maquette_introduction/i_cv_3_parcours.png`, légende « Bon équilibre vie professionnelle et personnelle » | Capture et légende montrent l'ancienne question. La capture est fabriquée par `docs/maquette_introduction/captures_parcours.js` (qui remplit **quatre** questions via `parcoursQuatreQuestions`). |

### Pas touchés, vérifié
- Les vidéos `videos/modules/creer-assistant.mp4`, `creer-main.mp4`, `reprendre-sans.mp4` : les images ne montrent pas l'écran « Votre parcours ». Elles s'arrêtent à « Vos informations » (première section « Vous »), qui n'a pas changé d'aspect. Leur voix ne cite pas la question.
- Les vidéos des modules d'analyse (ATS, Bilan, Cohérence, Regard, Comparer, Un CV plusieurs métiers) : première visite et bouton « Revoir la présentation », inchangés par la consigne 258. Leurs scénarios utilisent des identifiants qui existent toujours.
- « Reprendre mon CV » et le quatrième point : la voie « sans CV » filmée passe par « Le refaire moi-même dans un modèle », pas par « Votre parcours ». La page « Votre parcours » n'y apparaît donc pas dans la vidéo. **Reste à vérifier par un essai réel** : qu'aucune voie de « Reprendre mon CV » ne mène à cette page avec l'ancienne question.

### À vérifier (pas encore regardé image par image)
- Consigne 259 (plus aucune tuile qui pulse) : les vidéos qui filment l'accueil (introduction, début de chaque scénario de module) montrent peut-être un halo sur une tuile.
- Consigne 260 (« Fiche mise à jour » en violet) : vidéo du module « Comprendre le cadre » (`cadre.mp4`).
- Consigne 261, deuxième effet : sur « Vos informations », langue et permis ne bloquent plus « Continuer » ; les vidéos de création qui montrent un « Continuer » grisé ou l'étiquette « à compléter » sont à comparer avec l'écran actuel.
- Pages d'introduction écrites des modules (textes `htmlBilanIntro`, `ctHtmlExplication`, etc.) : mention de « Reprendre / Recommencer » ou de la fenêtre de confirmation, à relire.

## 1bis. FAIT le 12/11/2026 (étapes 1 à 3, texte validé par Denis : « Oui, commence »)
- Les captures `i_cv_3_parcours.png` et `i_cv_4_profil.png` sont refaites à trois questions (dans `images/introduction/`, utilisées par l'application, et `docs/maquette_introduction/`).
- Textes corrigés : page d'introduction de l'application (`modules/introduction/index.js`), diaporama (`modules/introduction/diaporama.js`), les deux maquettes HTML, le scénario de la vidéo. Nouvelle phrase : « Elle coche ce qu'elle a déjà fait : les propositions sont déjà là, elle choisit. »
- Vidéo d'introduction refaite en entier (chaîne `docs/video_presentation`, dossier de travail `C:UsersDenisideo_travail_intro`), 3 min 11, `video/presentation.mp4` et `.vtt` remplacés. Images vérifiées : trois questions, plus de quatrième.
- Étape 4 (audit des autres vidéos) FAITE le 12/11/2026, images regardées : aucune vidéo de module ni de geste ne montre la question retirée. Les vidéos des modules d'analyse, de « Créer » et de « Reprendre » filment des écrans qui n'ont pas changé d'aspect (présentation à froid, « Vos informations », barre du bas). Deux écarts possibles, très petits et non décidés : (a) un éventuel halo de tuile (consigne 259) pendant la première seconde ou deux des vidéos qui ouvrent une carte de l'accueil (Mon Carnet, Un regard sur mon CV, Cohérence, Employeurs, Qui fait quoi), impossible à confirmer sur une image fixe ; (b) rien pour le violet de « Fiche mise à jour » (consigne 260) : la page où il apparaît n'est pas filmée. Recommandation : ne rien rejouer pour cela, le corriger au prochain rejeu d'une de ces vidéos.
- Rejeu des vidéos à halo FAIT le 12/11/2026 : les huit vidéos qui ouvrent une carte de l'accueil (Mon Carnet, Mes Repères, Lexique, Découvrir mes compétences, Employeurs, Qui fait quoi, Comprendre le cadre, Comprendre les chiffres) ont été rejouées, images des premières secondes vérifiées (plus aucune tuile qui pulse, seul le cadre de survol de la souris reste), fichiers remplacés dans `videos/modules/`. Le violet de « Fiche mise à jour » (consigne 260) n'est dans aucune vidéo.
- Étape 6 (essai réel de « Reprendre mon CV ») FAITE : les trois voies et la page de départ rejouées à 1280 px, aucune n'affiche « Votre parcours », donc jamais l'ancienne question. Le code ne contient plus cette question nulle part.
- Étape 7 FAITE le 12/11/2026, avec l'accord de Denis : règle inscrite dans `docs/TRAVAILLER_AVEC_DENIS.md` (section « Vérifications systématiques »). Plan terminé.

## 2. Plan proposé (à valider par Denis)

1. **Décider du texte** (Denis, 5 minutes) : nouvelle phrase pour la vidéo d'introduction et le diaporama à la place de « ce qui compte pour elle ». Proposition : « Elle choisit parmi des propositions ce qu'elle a déjà fait : les personnes qu'elle a aidées, ses gestes, les lieux où elle a travaillé. » (trois questions, rien sur les préférences).
2. **Refaire les captures de l'introduction** `[effort : bas]` : changer `parcoursQuatreQuestions` en trois questions dans `docs/maquette_introduction/captures_parcours.js`, relancer la capture, remplacer `i_cv_3_parcours.png`, corriger la légende dans les deux maquettes.
3. **Refaire la vidéo d'introduction** `[effort : moyen]` : seul le passage « Votre parcours » change. Vérifier d'abord si la chaîne de fabrication permet de rejouer ce seul passage (`docs/video_presentation/LISEZMOI.md`), sinon rejouer la vidéo entière. Voix et sous-titres refaits pour la phrase modifiée.
4. **Audit des « à vérifier »** `[effort : bas]` : extraire une planche d'images de chaque vidéo concernée (avec ffmpeg, comme fait ici) et comparer avec l'application actuelle. Résultat : liste des vidéos à rejouer, une par entrée.
5. **Rejouer les vidéos touchées** `[effort : moyen]` : une par une, scénario dans `docs/video_presentation/court/scenarios/`, validation de Denis avant de remplacer le fichier de `videos/modules/`.
6. **Vérifier « Reprendre mon CV »** `[effort : bas]` : essai réel de chacune des trois voies, pour confirmer qu'aucune n'affiche l'ancienne question.
7. **Règle pour la suite** : ajouter à la liste de fin de chantier « une capture, une vidéo ou une phrase d'introduction montre-t-elle l'écran modifié ? ». À inscrire dans `docs/TRAVAILLER_AVEC_DENIS.md` si Denis est d'accord.

## 3. Ce qu'il me faut de Denis
- Le texte de remplacement de l'étape 1 (ou son accord sur ma proposition).
- Son accord pour refaire la vidéo d'introduction entière si le passage ne peut pas être rejoué seul.
- Un ordre de priorité entre la vidéo d'introduction (visible par tout le monde dès l'arrivée) et les vidéos de modules.
