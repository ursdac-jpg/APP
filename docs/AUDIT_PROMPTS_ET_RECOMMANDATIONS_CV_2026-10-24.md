# Audit des prompts (lot E2, E3, E5) : ce que la lettre « Écrire ma lettre avec l'assistant » peut apporter aux autres parcours (24/10/2026)

Demande de Denis : voir si ce qui a été mis au point en 5 à 6 heures sur le prompt de la lettre (qualité rédactionnelle, cohérence) peut profiter (E2) aux parcours de lettre générée (« Préparer ma lettre et mon entretien », « Un CV, plusieurs métiers »), (E3) aux prompts de création de CV, et (E5) s'il est possible d'appuyer le CV sur des lettres de recommandation. Audit du code et des prompts réels, rien de modifié.

## 1. Inventaire

| Prompt | Taille | Rôle | Assemblage |
|---|---|---|---|
| `lettre-co.md` | 56 600 car. | Lettre construite avec la personne (séance) | `promptCache('lettre-co', profil)` + CV masqué + recommandation (`construireMessageLettreCo`) |
| `lettre.md` | 21 300 | Lettre générée d'un coup (parcours « Préparer ma lettre et mon entretien ») | `promptCache(clé, texteProfilEffectif(type))`, `js/app.js:13294` |
| `ucpm-lettres.md` | 9 100 | « Un CV, plusieurs métiers » : toutes les lettres en une fois | module `un-cv-plusieurs-metiers` |
| `ucpm-lettres-retravail.md` | 8 200 | Retravailler des lettres du module | idem |
| `cv.md` | 40 000 | Rédaction du CV (2e passage) | `promptCache('cv', profil)` |
| `extraction-cv.md` | 23 600 | 1er passage : lire le CV déposé | `promptCache('extraction-cv', texteCv)` |
| `reformuler-cv.md` | 22 300 | Reformuler un CV | `promptCache('reformuler-cv', …)` |

Les prompts partagent déjà le jeton `{{VOIX_HUMAINE}}` (`_voix-humaine.md`).

## 2. Constats (faits relevés dans le code)

1. **Défaut réel à corriger tout de suite (E2.0).** Depuis la mise en page de la lettre, l'application imprime elle-même « À l'attention de Madame Machin » dans le bloc du destinataire, et le prompt de la séance dit d'écrire la civilité seule (« Madame, »). Mais le profil envoyé à `lettre.md` et à `ucpm-lettres*.md` dit encore d'écrire la civilité **et le nom** dans la formule d'appel (`js/app.js`, `texteProfil`, interrupteur `_profilCiviliteSeule` réservé à `lettre-co`), et `ucpm-lettres.md` (ligne 30) impose de les utiliser. Résultat possible : « Madame Machin, » dans le texte ET dans le bloc. **Simple** : étendre l'interrupteur aux autres lettres et corriger ces deux phrases de prompt, avec test.
2. **Aucun autre prompt ne connaît les nouvelles lignes du profil** (« Domaine visé », « Type de contrat recherché », « Temps de travail », « Disponibilité », horaires, intitulé unique) : `grep` donne 0 occurrence dans `cv.md`, `lettre.md`, `ucpm-*`. Elles sont pourtant déjà envoyées. L'assistant les reçoit donc sans consigne : risque d'intitulé ignoré, ou d'un domaine pris pour un métier.
3. **Longueurs** : `lettre.md` parle d'une page A4 sans fourchette de mots, `ucpm-lettres.md` de 150 à 200 mots. La lettre construite a des fourchettes mesurées (décisions 21 et 22 : 170 à 250, 330 à 420, 450 à 510 mots selon le réglage) liées à la capacité réelle de la page avec le bloc destinataire.
4. **Règles de qualité propres à `lettre-co.md`, absentes des autres** : une idée n'est dite qu'une fois (anti-doublons entre paragraphes et avec la version courte), « chaque fait a son paragraphe », comptage des mots avant de livrer, ne jamais écrire l'en-tête, la date ni le bloc du destinataire (l'application les écrit), questions de la valeur de l'entreprise.
5. **Le CV** (`cv.md`) n'a aucune règle sur l'intitulé unique d'un domaine ni sur les nouvelles lignes du profil ; il a ses propres sections solides (méthode, fiabilité, contrôle final) à ne pas toucher sans essai.

## 3. Ce qui est transférable (E2 et E3), classé

**Simple, à faire (reprise de texte, sans risque d'architecture)**
- **E2.0** : formule d'appel (constat 1). `[effort : bas]`
- **E2.1** : un court bloc commun « Lignes du profil à connaître » (domaine visé, intitulé, contrat, temps de travail, disponibilité, horaires, forme de la candidature) dans `lettre.md`, `ucpm-lettres*.md` et `cv.md`, par un jeton partagé comme `{{VOIX_HUMAINE}}` : une seule source. `[effort : moyen]`
- **E2.2** : « l'application écrit l'en-tête, la date et le bloc du destinataire » dans `lettre.md` et `ucpm-lettres*.md`. `[effort : bas]`

**Utile mais à essayer sur un vrai assistant avant de figer (Denis fait les essais, aucun coût Claude)**
- **E2.3** : anti-doublons et fourchettes de mots dans `lettre.md` (accroche, arguments, version courte). Risque : rallonger un prompt de 21 000 caractères, alors que la règle de la maison est « jamais deux missions dans un prompt ».
- **E3.1** : anti-doublons entre accroche, profil et missions dans `cv.md`.

**Non transférable** : la séance en questions, le plan validé paragraphe par paragraphe, les « autres formulations » (propres au fait de construire ensemble).

## 4. E5 : lettres de recommandation pour le CV (avis : oui, faisable)

**Réutilisable tel quel** : le dépôt relu et masqué (`ouvrirAssistantDepotCV`), le surlignage du nom du signataire, la section « LETTRE DE RECOMMANDATION (relue et masquée par la personne), de la part de : [rôle] » (`sectionRecommandationLettreCo`), la liste de rôles, le choix de la lettre de référence.

**À construire**
1. **Un seul stock de lettres de recommandation pour toute la session** (aujourd'hui des variables de la page de la lettre) : la même lettre déposée sert au CV et à la lettre de motivation, sans la redéposer. `[effort : moyen]`
2. **Le panneau « Vos appuis » sur la page « Choisir mon assistant » du CV** (page `pageAssistant`, partagée par CV, lettre, entretien) : mêmes questions, deux lettres au plus pour le CV. `[effort : moyen]`
3. **L'assemblage du message du CV** (`js/app.js:13294`) : ajouter la section après le profil, comme `construireMessageLettreCo`. `[effort : moyen]`
4. **Une règle courte dans `cv.md`** : la recommandation est une source fiable pour **proposer** compétences, tâches réelles et vocabulaire du métier ; jamais recopiée, jamais le nom de l'auteur, **jamais ajoutée d'office** (proposée dans les recommandations de compétences déjà prévues par le format JSON). `[effort : moyen, essai de Denis]`
5. **Poids** : `cv.md` fait déjà 40 000 caractères ; deux lettres ajoutent environ 3 000 à 6 000 caractères au message (jamais au prompt). Acceptable, à vérifier par un essai.

**Risques et limites franches** : une lettre de recommandation parle souvent des qualités, pas des tâches ; elle peut contredire le CV (le prompt doit dire que le CV et la personne priment) ; pour le CV, rien n'est joint au document final (contrairement à la lettre).

## 5. Plan proposé

| Pas | Contenu | Effort |
|---|---|---|
| **E2.0** | Formule d'appel (civilité seule) pour toutes les lettres + test | bas |
| **E2.1 et E2.2** | Bloc commun « lignes du profil » et consigne « l'application écrit l'en-tête » | moyen |
| **E5.1** | Stock commun des lettres de recommandation (module + tests) | moyen |
| **E5.2** | Panneau et assemblage pour le CV, règle dans `cv.md` | moyen à haut |
| **Essais de Denis** | `cv.md` avec recommandation, `lettre.md` allégé ou enrichi (E2.3, E3.1) | hors Claude |

## 6. Questions pour Denis

1. **Faire E2.0 maintenant** (le défaut de la formule d'appel) : oui ? Recommandé : oui, c'est un bug visible.
2. **Un seul stock de lettres de recommandation pour le CV et la lettre** (la même lettre déposée sert aux deux) : oui ? Recommandé : oui.
3. **Les deux lettres pour le CV partent toutes les deux** (le CV a un message plus court que la lettre), ou une seule comme pour la lettre ? Recommandé : deux au plus, les deux envoyées.

## 7. Suite du 24/10/2026

- **E2.0 FAIT** : pour toute lettre générée (`texteProfil('lettre')`, `js/app.js`), la formule d'appel est la civilité seule, jamais le nom ; `prompts/lettre.md` dit que l'application écrit l'en-tête, la date et le bloc du destinataire. Les prompts de « Un CV, plusieurs métiers » ne sont pas concernés : ce module n'utilise pas `normaliserDonneesLettre` (pas de bloc destinataire).
- **Réponses de Denis** : un seul stock de lettres de recommandation pour le CV et la lettre ; deux lettres pour le CV.
- **E6 (demande de Denis) : disponibilité et horaires sur le CV** (disponibilité immédiate, « prêt à accepter tout type d'horaire », contraintes d'horaires) dans « Autres informations » / compléments, pour remplir les espaces vides et en faire une force. **Piste recommandée : côté code, pas côté prompt** (le prompt du CV est déjà saturé) : une ligne ajoutée par l'application à partir des données déjà saisies (`dossier.contrat`, `tempsTravail`, `horaires`, disponibilité), comme le permis ou les langues, sur le principe « l'assistant classe, le code garantit ». À auditer : où le CV construit « Autres informations » (`extraireDonneesCV`, `normaliserDonneesCV`) et dans quels modèles la ligne tient.
