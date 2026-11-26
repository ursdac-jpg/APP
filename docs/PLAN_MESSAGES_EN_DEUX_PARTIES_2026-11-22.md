# Plan : messages très longs, réponse en deux parties (2026-11-22)

Demande de Denis : ne rien perdre, ni dans ce qui est envoyé, ni dans ce qui est reçu ; demander la réponse en deux parties (première partie = l'essentiel, deuxième = le complément) ; le code reçoit les deux ; la personne a ainsi la réponse complète.

## Ce que l'audit du code a trouvé

| Parcours | Taille du message | D'où vient le poids | Ce qui existe déjà |
|---|---|---|---|
| Créer un CV avec l'assistant | 48 000 à 55 000 car. | `prompts/cv.md` (43 000 car.) + profil | Un « complément de CV » facultatif (fenêtre mode `complement`) ; coupure d'une réponse gérée par `[SUITE]` et `assemblerMorceaux` |
| Lettre avec l'assistant (co-construction) | environ 60 000 car. | `prompts/lettre-co.md` (57 000 car.), prompt de séance | Conversation en plusieurs échanges : pas une réponse unique à découper |
| Bilan | moyen | `bilan-v1.md` (26 000) | Déjà deux passages (1/2 et 2/2) |

Faits qui comptent :
- Le poids vient du **prompt**, pas des données de la personne : envoyer le message en deux morceaux ne perd rien, mais le prompt doit être découpé en deux missions (cela respecte la règle « jamais deux missions dans un prompt »).
- Aucun échec réel n'est mesuré à ce jour sur ces tailles (seulement « à surveiller »). Le risque est une limite de collage ou une consigne oubliée par l'assistant : à tester avec de vrais assistants, ce que le code seul ne peut pas prouver.
- La fenêtre de collage sait déjà recevoir deux passages (`passage: '1/2'` et `'2/2'`) et assembler des morceaux.

## CORRECTION (2026-11-22, après question de Denis) : le CV est DÉJÀ en deux parties

Le plan initial (découper le CV en deux passages) faisait doublon. Vérifié dans `prompts/cv.md` (section « Complément de CV », lignes 103 à 150) et `js/app.js` (zone de fusion du complément, bouton « Importer le complément de CV », bannière « complément proposé ») :
- 1re réponse : l'essentiel, puis une ligne finale « répondez : oui » ;
- si oui : 2e bloc JSON (regroupement, thèmes, compétences en action, qualités attendues, missions des formations / certifications / engagements, couleurs d'entreprise), fusionné par le code ;
- Denis a testé le CV : fiable. **Décision : le CV ne change pas.**

Seule piste restante, NON retenue pour l'instant : les règles du complément (environ 16 000 car. sur 41 650) sont dans le premier message d'envoi ; les envoyer seulement au « oui » le ferait passer d'environ 48 000 à 32 000 car., au risque que l'assistant oublie une consigne reçue au 2e échange (assistants sans compte). À reprendre seulement si un échec réel de longueur est constaté.

Reste à regarder (chantiers séparés, sans panne mesurée) : lettre en co-construction (`lettre-co.md`, 57 000 car., conversation donc non découpable en deux réponses : allègement du prompt), `regard-exterieur.md` (40 000) et `decouverte-redaction.md` (38 000).
