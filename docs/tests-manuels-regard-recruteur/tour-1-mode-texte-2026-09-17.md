# Tour 1 (partiel) - protocole de test du prompt, mode texte

> Suit `docs/PROTOCOLE_TEST_PROMPT_REGARD_RECRUTEUR_2026-09-03.md`, jamais exécuté depuis sa
> rédaction (2026-09-03) - constat de l'audit `docs/AUDIT_REGARD_RECRUTEUR_2026-09-17.md`, point 8.
>
> **Limite honnête, à lire avant tout le reste** : ces 3 fiches n'ont **pas** été produites par un
> vrai assistant externe (ChatGPT/Claude/Gemini/Mistral en situation réelle), mais en appliquant
> moi-même `prompts/regard-recruteur.md` à la lettre sur des CV construits, comme le protocole
> l'autorise pour un corpus "construit à la main mais réaliste" (§1). Ça valide : le prompt est
> suffisamment précis pour produire une sortie conforme, le parseur traite correctement une vraie
> sortie de cette forme de bout en bout, et le retrait du sous-point "registre de langage" (commit
> `6d37252`, 2026-09-17) fonctionne comme prévu. Ça ne valide **pas** : la fiabilité d'un vrai
> assistant externe (variabilité, tentation de sortir du format, jugement visuel en mode image -
> risque déjà connu, voir `CHANTIER_REGARD_RECRUTEUR.md` §11). Les cas 1, 2 et 4 du protocole
> (mode image) restent à faire par Denis avec un vrai CV et un vrai assistant multimodal.

---

## CAS 3 - registre associatif vers entreprise privée

CV : construit, anonymisé (parcours associatif/insertion, cible un poste de chargé(e) de clientèle
en agence bancaire) Date : 2026-09-17 Assistant : moi-même, application stricte du prompt
Mode : texte Nb images : 0
Contexte fourni : poste [oui] · offre [oui] · entreprise [oui] · site [non] · type de structure [entreprise privée]
Cas testé : 3 (registre associatif -> privé, section 2 du protocole)

| Critère | Conforme / Partiel / Non conforme | Écart constaté |
|---|---|---|
| Ancrage sur CE CV | Conforme | Chaque `constat`/`origine` cite un élément réel du CV construit. |
| Aucun verdict, aucun jugement | Conforme | Aucun score, aucun mot interdit (vérifié par script sur le rapport parsé). |
| Doutes formulés en questions | Conforme | Le décalage de secteur devient une question ("qu'est-ce qui vous attire..."), jamais un reproche. |
| Aiguillage respecté | **Conforme, point clé de ce test** | Le décalage de registre n'apparaît **plus** dans l'axe `message` (retiré le 2026-09-17) : il est **uniquement** dans `questionsLieesAuCv`, avec `origine` renseignée. |
| Structure du JSON | Conforme | Parse OK via `regardRecruteurParserRapport` ; 6 axes, ordre correct ; `premiere-lecture` = 1 point ; `positif` = 2 points ; `presentation`/`couleurs` à `afficher:false` (mode texte). |
| Adaptation au secteur | Conforme | La lecture nomme explicitement l'écart associatif/bancaire (absence d'objectif chiffré, vocabulaire de l'entraide). |
| Utilité réelle | Conforme | La personne sait quoi préparer à l'oral (5 questions ancrées) et quoi retravailler (titre, mise en avant du transposable). |

Vérifications ciblées :
- [x] 6 axes exactement, dans l'ordre ; premiere-lecture = 1 point ; positif >= 2
- [x] Chaque question a un `origine` ancré dans le CV
- [x] Aucun doublon (le décalage de registre n'est ni dans `message` ni dupliqué ailleurs)
- [x] Mode texte -> `presentation`/`couleurs` en `afficher:false`
- [x] Aucun mot interdit ni score (vérifié par script)

**Verdict global : Réussite.** **Erreur réelle détectée : Non.**

---

## CAS 5 - métier technique, outils nommés vaguement

CV : construit, anonymisé (support informatique, outils cités de façon vague) Date : 2026-09-17
Assistant : moi-même, application stricte du prompt Mode : texte Nb images : 0
Contexte fourni : poste [oui] · offre [oui, cite Windows Server/Active Directory/GLPI] · entreprise [oui] · site [non] · type de structure [non fourni]
Cas testé : 5 (secteur technique, section 2 du protocole)

| Critère | Conforme / Partiel / Non conforme | Écart constaté |
|---|---|---|
| Ancrage sur CE CV | Conforme | Cite les termes vagues réels du CV ("outils bureautiques", "logiciel de gestion"). |
| Aucun verdict, aucun jugement | Conforme | - |
| Doutes formulés en questions | Conforme | - |
| Aiguillage respecté | Conforme | "Logiciels et outils nommés" reste dans `message` (n'a jamais chevauché ATS, voir `CHANTIER_REGARD_RECRUTEUR.md` §7bis) ; les outils précis de l'offre absents du CV deviennent des questions distinctes. |
| Structure du JSON | Conforme | Parse OK, structure identique au cas 3. |
| Adaptation au secteur | Conforme | La lecture reprend exactement l'attente "métier technique" du prompt (§3) : outils nommés précisément, résultats concrets. |
| Utilité réelle | Conforme | La personne sait qu'elle doit nommer ses outils réels, avec des questions directement liées aux 3 outils cités dans l'offre. |

**Verdict global : Réussite.** **Erreur réelle détectée : Non.**

---

## CAS 6 - mode texte, cas nominal

CV : construit, anonymisé (accueil/administratif, CDI visé en agence privée) Date : 2026-09-17
Assistant : moi-même, application stricte du prompt Mode : texte Nb images : 0
Contexte fourni : poste [oui] · offre [oui] · entreprise [oui] · site [non] · type de structure [entreprise privée]
Cas testé : 6 (mode texte, section 2 du protocole)

| Critère | Conforme / Partiel / Non conforme | Écart constaté |
|---|---|---|
| Ancrage sur CE CV | Conforme | - |
| Aucun verdict, aucun jugement | Conforme | - |
| Doutes formulés en questions | Conforme | - |
| Aiguillage respecté | Conforme | - |
| Structure du JSON | Conforme | 6 axes, `presentation`/`couleurs` à `afficher:false`, `premiere-lecture` = 1 point. |
| Adaptation au secteur | Partiel | CV plutôt neutre (accueil/administratif) : peu d'occasion de montrer une vraie adaptation sectorielle marquée - normal pour ce profil de CV, pas un défaut du prompt. |
| Utilité réelle | Conforme | 5 questions ancrées, dont une sur la transition public -> privé. |

**Verdict global : Réussite avec réserve** (le critère "adaptation au secteur" n'est pas
franchement testé par ce CV neutre - déjà couvert par les cas 3 et 5). **Erreur réelle détectée : Non.**

---

## Conclusion de ce tour partiel

Aucune erreur réelle trouvée sur ces 3 cas texte, au sens de la section 4 du protocole (aucune règle
explicite du prompt violée). Le retrait du sous-point "registre de langage" (section 7bis du
chantier) fonctionne comme prévu de bout en bout, prompt inclus. Reste à faire, uniquement par
Denis avec un vrai assistant multimodal : les cas 1, 2 et 4 (mode image), qui seuls peuvent révéler
la variabilité du jugement visuel déjà identifiée comme un risque non mesuré.
