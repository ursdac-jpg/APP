# Chantier « Regard recruteur » (APP)

**Statut : CHANTIER TERMINÉ le 2026-09-08.** Module construit, câblé, vérifié navigateur (clair + sombre, bout en bout), `npm test` 780 verts. Commits `13c2de1..a7107c8`. Prompt `prompts/regard-recruteur.md` relu le 2026-09-08 (5 retouches). **Décision 4 (outil de rectangles dans le navigateur) tranchée par Denis et implémentée** : `htmlVerificationDocument({mode:'image'})`. Suivi de fin de chantier : `CLAUDE.md` (bloc « Chantier TERMINÉ le 2026-09-08 »), `docs/TACHES_VALIDEES.md` (chantier 5), `docs/BRIQUES_COMMUNES.md` (consommateur + Historique 2026-09-08), `docs/LECONS_A_NE_PAS_REPRODUIRE.md` section 2 (variante « boucle infinie » du bouton Retour). Contrats figés : schéma de sortie `docs/CHANTIER_REGARD_RECRUTEUR_SCHEMA_SORTIE_2026-09-03.md`, protocole de test `docs/PROTOCOLE_TEST_PROMPT_REGARD_RECRUTEUR_2026-09-03.md`. Cible visuelle : `docs/MAQUETTE_REGARD_RECRUTEUR_PARCOURS_2026-09-03.html`. Architecture du module : `modules/regard-recruteur/ARCHITECTURE_TECHNIQUE.md`.

**Décision de clôture (Denis) : option A — le module ne fait QUE du conseil, aucune création ni édition de CV.**

**Hors code, comme tout module** (non bloquant) : relecture finale du prompt par Denis + protocole de test tour 1 sur de vrais CV ; parcours cliqué par Denis ; vidéo ; test terrain ; `AIDE_PAGES` par écran (optionnel). **Évolutions possibles** (pas des manques) : vignette des images, fusion des deux zones « Garder comme Repère », export Word natif, renvois entre modules — voir `ARCHITECTURE_TECHNIQUE.md` du module. Chantier séparé plus tard : extraction du socle commun détachable (« Niveau 2 »).

Le reste de ce document est le dossier de conception d'origine (récolte multi-IA 2026-08-31), conservé comme référence.

---

**À ne pas confondre avec « Regard extérieur »** (module existant, sur les Repères).

Fusion actée : Simulation recruteur + Préparation aux inquiétudes du recruteur + ce qui est récupérable de Recruteur virtuel. Le « Comité de recrutement virtuel » (plusieurs personas) est écarté : **une seule lecture, structurée, bornée, jamais un chat ouvert**.

---

## 0. PRINCIPE DIRECTEUR (issu de la récolte, à valider par Denis)

> **Le module ne dit jamais « ce que pense le recruteur ». Il dit « ce qu'un recruteur pourrait se demander ».**

C'est cette nuance qui l'empêche de devenir un faux simulateur de recrutement.

### Exigences déjà actées (Denis)

1. **Jamais un verdict, une note, un score de première impression, un « ce CV serait retenu / rejeté ».**
2. Chaque doute = une **question à vérifier ou à préparer**, jamais un constat sur la personne ou sa valeur.
3. Analyse d'une **image** du CV (capture d'écran / page exportée en image) pour juger la forme, + **masquage par rectangles** de nom / photo / coordonnées avant envoi.
4. Donner aussi **« l'avis d'un recruteur » sur la reprise des couleurs / codes visuels de l'entreprise** dans le CV - jamais comme une obligation.
5. Sortie **bornée, axes fixes, un seul passage**, jamais un dialogue multi-tours.

---

## 1. Axes fixes de la sortie (converge : 5-6 axes courts, ~15-20 lignes au total)

1. **Ce qui saute aux yeux (5 à 10 secondes)** - observations visuelles, **pas une évaluation** : « le titre ressort », « la page paraît dense », « la lecture semble progressive »… *(un assistant déconseille « première impression » qui peut sonner comme un jugement ; à trancher)*
2. **Ce qui attire positivement l'attention** - descriptif : hiérarchie claire, titres visibles, expériences faciles à suivre, informations regroupées. *(à équilibrer avec l'axe 3 pour ne pas décourager)*
3. **Points qui peuvent susciter des questions** - **le cœur du module**. Jamais « problème » ; toujours une question ouverte.
4. **Questions possibles en entretien** - 3 maximum, formulées comme des pistes de préparation (« Pourriez-vous m'expliquer cette période ? », « Comment avez-vous utilisé cet outil ? », « Quel était exactement votre rôle ? »). En-tête : *« Exemples de sujets à aborder sereinement si l'employeur souhaite en savoir plus »* (jamais « les questions qu'on va vous poser »).
5. **Présentation visuelle** - uniquement des critères observables : densité, marges, police, hiérarchie, équilibre, longueur, lisibilité, contraste. Jamais « beau », « moche », « élégant », « moderne ».
6. **Couleurs et identité visuelle** - sous forme de réflexion (voir §5).

Règles : borner (5 points max à l'axe 3, 3 questions à l'axe 4), tout formuler en questions ouvertes, aucun score.

---

## 2. Transformer chaque objection en question (converge fortement)

Le prompt **interdit** au modèle d'écrire : manque, faible, insuffisant, mauvais, trop, illisible, incohérent, convaincant, bon, retenu, rejeté. Reformulation automatique obligatoire :

| Avant (interdit) | Après (question) |
|---|---|
| Les missions ne sont pas assez détaillées. | Un recruteur pourrait-il souhaiter davantage de détails sur certaines missions ? |
| Les dates sont confuses. | Les dates permettent-elles de comprendre facilement votre parcours ? |
| Le CV est trop chargé. | La quantité d'informations laisse-t-elle une lecture confortable dès le premier regard ? |
| Cette période pose problème. | Cette période pourrait-elle susciter une question en entretien ? |
| Trou de 2 ans. | Si un recruteur pose une question sur cette étape, quelle expérience, démarche ou compétence souhaiteriez-vous mettre en avant ? |

**Champ « niveau de certitude » : NON (unanime).** Même « faible / moyen / fort » ressemble à une probabilité de rejet, un score déguisé, une fausse caution scientifique, et augmente l'anxiété. À la place : plafonner le nombre de points (5 max), formuler en « pourrait » / « certains recruteurs pourraient », rappeler systématiquement que **tous les recruteurs ne réagissent pas de la même façon**.

---

## 3. Prompt image : séparer observation / effet possible / vérification (converge)

Pour chaque élément visuel, imposer trois temps, sans jamais sauter à une conclusion :
- **Ce qu'il voit** (observation factuelle) : « deux colonnes ».
- **Ce que cela peut produire** (effet possible) : « la lecture peut demander davantage de mouvements du regard ».
- **Ce qui mérite vérification** (question) : « les deux colonnes restent-elles faciles à lire une fois le document imprimé ? »

Critères de forme **explicites et observables** à examiner : mise en page (colonnes, alignements, blocs) · densité (texte vs blancs) · hiérarchie (titres distincts du corps) · longueur (1 ou 2 pages) · couleurs (présence, nombre, contraste, lisibilité) · police (type, taille, uniformité). **Interdire** les jugements esthétiques (« beau », « élégant », « moderne »). Exiger une **justification visuelle** pour chaque affirmation. Structure de sortie **imposée** (les axes du §1). Rappeler que c'est une possibilité, pas une vérité. Répéter le même prompt mot pour mot pour limiter la variabilité (qui reste réelle d'un assistant multimodal à l'autre - à assumer).

---

## 4. Masquage sur l'image + repli (converge)

**Ne jamais imposer un outil.** Guide pas à pas :
1. Faire une capture d'écran nette (Windows : Impr. écran ou Win + Maj + S · Mac : Cmd + Maj + 4 · téléphone : capture native).
2. Ouvrir dans un outil simple (Paint / Aperçu / Photos).
3. Dessiner des **rectangles pleins** (couleur unie) sur : nom, photo, adresse, téléphone, e-mail.
4. Enregistrer.

Phrase importante : *« Il n'est pas nécessaire que le rectangle soit esthétique. L'objectif est seulement de cacher ces informations avant de partager l'image. »*

**Repli si la personne ne sait pas faire** : demander à un conseiller · **OU basculer en « Mode texte seul »** (analyse du contenu uniquement, la forme n'est pas analysée - alternative d'égale valeur, sans dépréciation) · OU (repli manuel) imprimer, masquer au feutre noir, photographier.

**Option** (proposée par un assistant, compatible statique, non obligatoire) : un petit outil Canvas HTML/JS local pour tracer les rectangles dans le navigateur (aucun envoi serveur) + bouton « Copier l'image anonymisée ».

Message technique à afficher : *« Ce module nécessite un assistant en ligne capable de lire les images (ChatGPT, Copilot, Gemini, Claude…). Si votre assistant ne gère que le texte, basculez en Mode texte. »*

---

## 5. Couleurs de l'entreprise : jamais une injonction (converge)

Consigne prompt : *« Observez si le CV reprend des éléments visuels proches de ceux de l'entreprise (couleurs, style général). Décrivez simplement cette proximité éventuelle et expliquez comment elle pourrait être perçue. Rappelez systématiquement que cette pratique est facultative et que la lisibilité reste prioritaire. »*

- Jamais « trop de bleu ». À la place : *« Les choix graphiques rappellent fortement l'identité visuelle de l'entreprise. Certaines personnes peuvent y voir un signe d'attention ; d'autres peuvent préférer une présentation plus neutre. Vérifiez que ces choix ne réduisent pas la lisibilité. »*
- Cas d'imitation trop forte (effet gadget) : *« Un recruteur pourrait se demander : est-ce que je repère facilement les informations importantes, ou est-ce que les couleurs attirent trop l'attention ? »* + rappel : sobriété et contraste restent prioritaires.

---

## 6. Sans image : le module garde un sens, mais change (converge)

Devient **« Regard sur le contenu uniquement »** (Mode texte). Afficher clairement : *« Sans image, cette lecture ne peut pas porter sur la présentation du CV. Elle se limite au contenu fourni. »* Analyse alors la **structure textuelle** : longueur des paragraphes, présence de listes à puces, clarté des intitulés, structure des sections. Variante : la personne décrit elle-même la mise en forme envisagée. Le mode texte est présenté comme une alternative d'égale valeur.

---

## 7. Frontière avec les autres modules (converge, très nette)

| Module | Question à laquelle il répond |
|---|---|
| **Analyser ma candidature** | Est-ce que mon parcours répond à cette offre ? *(fond, alignement compétences / offre)* |
| **Atelier CV** | Comment améliorer / retoucher mon CV ? *(fabrication, édition, modèles, polices, couleurs)* |
| **Un regard sur mon CV** | Quelles interrogations ou quelles impressions mon CV peut-il susciter lors d'une première lecture ? *(perception à froid + préparation aux questions)* |

**Ce module ne corrige presque rien. Il prépare, il décrit.** À la fin : renvoi **optionnel** (« Vous souhaitez retravailler ce point ? » → lien vers Analyser ma candidature ou Atelier CV), présenté comme des pistes. **Il propose, il n'exécute pas.** Dès qu'il produit des réécritures détaillées ou une refonte graphique, il empiète et perd sa fonction.

### 7bis. Recoupements avec Analyser ma candidature (Bilan), Les mots de votre CV (ATS) et Cohérence de mon dossier - vérifiés le 2026-09-17

Audit fait à la demande de Denis (`docs/AUDIT_REGARD_RECRUTEUR_2026-09-17.md`), en comparant axe par axe `prompts/bilan-v1.md`, `prompts/ats.md`, `prompts/coherence-transversale.md` et `prompts/regard-recruteur.md`. Quatre recoupements trouvés, tous **assumés** sauf le premier (déjà corrigé) :

1. **Registre de langage adapté au secteur** - présent indépendamment dans **4 prompts** (Bilan, axe `posture` ; ATS, comparaison de vocabulaire ; Cohérence de mon dossier, analyse transversale ; Un regard sur mon CV, ex-sous-point de l'axe `message`). **Corrigé le 2026-09-17** : retiré de l'axe `message` de ce module, replié dans `questionsLieesAuCv` (un décalage de registre devient une question à préparer à l'oral, plutôt qu'une 4ᵉ observation redondante). Reste dupliqué entre les 3 autres modules - noté dans `docs/IDEES_A_RECLASSER.md` pour un futur chantier de cohérence inter-modules, pas retouché ailleurs pour l'instant.
2. **Dates et chevauchements** - le Bilan (axes `risques`/`coherence`) et ce module (axe `coherence`) touchent la même matière. **Assumé** : le Bilan rend un verdict de sévérité avant l'envoi (« corrigez ce point »), ce module transforme le même fait en question à préparer à l'oral (« comment l'expliquer si on vous le demande »). Deux services différents sur le même fait, pas une redite.
3. **Première impression** - le Bilan produit `premiereImpression` / `ceQuiDonneEnvie` / `ceQuiPeutFreiner` à partir du texte seul ; ce module produit `syntheseOuverture` + l'axe `premiere-lecture`, qui peut s'appuyer sur une vraie lecture visuelle de l'image (mise en page, couleurs) que le Bilan ne voit jamais (son prompt l'interdit explicitement). **Assumé**, différence de capacité réelle en mode image ; recoupement plus fort en mode texte seul, jugé acceptable (confirmation convergente, pas nécessairement redondante).
4. **Questions d'entretien** - Cohérence de mon dossier (`questionsEntretien`) comble les manques **entre documents** (CV/lettre/entretien) ; `questionsLieesAuCv` de ce module part du **CV seul**, tel qu'un recruteur qui ne voit que lui le lirait. Portée différente, **assumé**.

« Préparer un entretien » n'a pas été vérifié de la même façon (jugé par Denis comme répondant à un besoin distinct - l'entraînement à répondre à l'oral, pas la détection de points à préparer) : pas de recoupement de prompt attendu, mais pas audité ligne à ligne.

---

## 8. Nom : pas de consensus, tendance à GARDER « Regard recruteur » + sous-titre

Plusieurs assistants : « Regard recruteur » est bon (concret, cohérent, évoque le point de vue sans promettre de verdict). Pour éviter la confusion avec « Regard extérieur », jouer sur le **sous-titre** :
- « Regard recruteur - Une première lecture de votre CV »
- « Regard recruteur - Première impression et questions possibles »
- « Regard recruteur - Une simulation du regard qu'un recruteur peut porter sur votre CV, pour vous aider à vous préparer »

Autres noms proposés (si on veut vraiment couper court à la confusion) : **« Première lecture du CV »** · **« Votre CV vu par un recruteur »** · « Le premier regard sur votre CV » · « L'œil du recruteur ». **À trancher par Denis.** Répercussions d'un changement : carte d'accueil, route `regard-recruteur-intro`, `pageIntroRegardRecruteur`, titre de `MAQUETTE_INTRO_REGARD_RECRUTEUR.html`.

---

## 9. Réutilisable : uniquement des éléments préparatoires (converge)

- Les questions possibles en entretien.
- Les points à vérifier sur le CV.
- Les remarques sur la lisibilité à traiter dans l'Atelier CV.
- Les éléments que la personne souhaite retravailler.
- Une **« fiche de préparation à l'entretien »** copiable / imprimable : 3 questions probables + 2 éléments du parcours à expliciter sereinement à l'oral.

**Jamais enregistrer** : « première impression », « CV convaincant », « CV prêt », « CV validé par le recruteur », un score, une synthèse interprétable comme une validation.

---

## 10. Risques et dérives (converge)

- « Première impression » interprétée comme une probabilité de réussite → interdire tout vocabulaire de validation, limiter à observations + questions.
- **Précision illusoire de l'analyse visuelle** : deux assistants multimodaux divergent sur la même mise en page → critères observables uniquement, pas de jugement esthétique, justification visuelle exigée.
- **Glissement vers un atelier de correction** : dès qu'il propose des réécritures ou une refonte graphique, il empiète sur les modules existants.
- **Illusion d'entretien réel** : « exemples de sujets à aborder », jamais « la liste des questions qu'on va vous poser ».
- **Effet anxiogène des doutes** pour une personne en confiance fragile → équilibrer avec les points forts, rappeler que tous les CV ont des zones d'ombre et que l'objectif est de préparer.
- **Difficulté du masquage / de la capture d'écran** (surtout sur mobile) → le Mode texte comme alternative d'égale valeur, sans dépréciation.
- **Dépendance à l'assistant multimodal** : capacités qui changent, précision variable d'un service à l'autre.
- **Confusion avec « Regard extérieur »** → nom clair + sous-titre + distinction dans les textes d'introduction.

---

## 11. Notes d'autocritique rendues : 16 à 19,5 / 20

Points faibles récurrents : la stabilité de l'analyse visuelle dépend de l'assistant multimodal choisi (réduite par des critères observables, pas éliminée) ; la manipulation d'image reste plus lourde qu'un copier / coller de texte pour le public le plus fragile ; aucun test utilisateur ; pas d'interaction multi-tours pour lever une ambiguïté après la première lecture.

---

## 12. Décisions à prendre par Denis avant maquette

1. Nom : garder « Regard recruteur » + sous-titre distinctif, ou passer à « Première lecture du CV » / « Votre CV vu par un recruteur » ?
2. Axe 1 : « Ce qui saute aux yeux » ou « Première impression » (risque de lecture comme un jugement) ?
3. Nombre d'axes : 5 ou 6 (avec ou sans un axe « Actions suggérées avant envoi ») ?
4. Outil de masquage : guide pas à pas seul, ou aussi le petit outil Canvas local dans le navigateur ?
5. Mode texte : toujours proposé en repli, ou seulement si la personne le demande ?
6. Ce module a besoin du même niveau de rigueur que le Bilan (diagnostic → schéma de sortie borné → parser strict → maquette → code). Confirmer la séquence avant de commencer.

---

## 13. Annexe : brief envoyé aux assistants (2026-08-31)

Contexte : APP, application web statique d'accompagnement de parcours professionnel, public en fragilité numérique + conseillers, un seul mainteneur, sans budget, tout par copier / coller (l'assistant peut recevoir une image jointe par la personne). Philosophie : aide à comprendre et préparer, ne décide jamais, aucun diagnostic sur la personne, aucun score. Ton simple, jamais dramatisant.

Module : « Regard recruteur » (aussi « Regard employeur »). Fusion de Simulation recruteur + Préparation aux inquiétudes du recruteur + récupérable de Recruteur virtuel ; le « comité » de personas est écarté. Rôle : simuler le regard d'un recruteur sur une candidature (première impression, points forts perçus, inquiétudes possibles, questions probables). Mécanique distinctive : analyse d'une **image** du CV (capture d'écran) pour juger la **forme** ; masquage par rectangles avant envoi ; poste + entreprise + offre si disponible. Suppose un assistant en ligne qui accepte les images (prévoir un repli). Exigence actée : donner « l'avis d'un recruteur » sur la reprise des couleurs / codes visuels de l'entreprise, jamais comme une obligation. Garde-fou posé : chaque doute formulé comme question ou point à vérifier, jamais un constat. Sortie bornée, axes fixes, jamais un chat ouvert. Tension : « Regard recruteur formulé comme un verdict ».

9 questions : axes fixes de la sortie · objection → question (+ faut-il un niveau de certitude ?) · cadrage du prompt image (forme, stabilité) · masquage sur l'image + repli si la personne ne sait pas faire · couleurs de l'entreprise sans injonction · sans image, quel repli · frontière avec « Analyser ma candidature » et l'Atelier CV · nom accessible (sans confusion avec « Regard extérieur ») · production réutilisable.

Garde-fous : jamais un verdict / une note / un score ; chaque doute est une question ; l'avis « couleurs » n'est jamais une obligation ; jamais un dialogue multi-tours ; ne pas dramatiser ; signaler toute proposition qui suppose analyse de fichier / d'image côté serveur, comité de personas, échange interactif, base maintenue ; prévoir un repli si la personne n'a pas d'assistant qui lit les images.

Format : (a) textes pour la personne · (b) fonctions avec « ce que ça améliore » · (c) risques et dérives, y compris dans ses propres propositions · (d) autocritique notée sur 20.
