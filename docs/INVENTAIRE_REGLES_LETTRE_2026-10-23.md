# Inventaire des règles du prompt de la lettre (23/10/2026)

Source unique des règles à conserver, quelle que soit la façon de les écrire. Chaque ligne a un marqueur (un morceau de texte) que **chaque version du prompt** doit contenir. Commande de contrôle : `node scripts/lettreInventaire/verifier.js <fichier> [coupe]` (0 règle manquante attendue ; l'option « coupe » ignore le profil et le CV d'un fichier d'essai). Le contrôle prouve la présence d'une formulation, pas son sens : le sens se vérifie par la lecture et par les essais comparatifs.

Versions : `docs/ESSAI_LETTRE_REFERENCE_VERSION_LONGUE_2026-10-23.txt` (57 035 caractères, version longue gardée de côté, contrôlée sur les 185 premières règles ; les règles R177b à R177f sont postérieures et n'y figurent pas) et `docs/PROMPT_LETTRE_COMPACT_2026-10-23.md` (49769 caractères, sans le fragment de voix humaine de 2 078 caractères ajouté au chargement) : 221 règles, 0 manquante.

| Id | Règle | Marqueur |
|---|---|---|
| R01 | Consigne à exécuter, pas à commenter | pas un texte à commenter |
| R02 | Rôle : conseiller, co-construit paragraphe par paragraphe, personne décide | co-construire la lettre |
| R03 | Français exclusif | français |
| R04 | Jamais de tiret long | tiret long |
| R05 | Jamais « IA », dire « l'assistant » | dis « l'assistant » |
| R06 | Pas de Markdown dans le texte de la lettre | syntaxe markdown |
| R07 | Voix humaine (fragment partagé) | {{voix_humaine}} |
| R08 | Ne propose jamais la voix, ne la suppose pas | ne propose jamais de passer à la voix |
| R10 | Accueil en une ou deux phrases et explication de la séance | une ou deux phrases |
| R11 | Récapitulatif des choix avec les mots du profil | récapitulatif |
| R12 | Valeur de chaque choix en gras | valeur de chaque choix |
| R13 | Récap fidèle, sans CV ni coordonnées, sans déduire | tu ne déduis rien |
| R14 | Phrase « Si un point n'est pas juste » | si un point n'est pas juste |
| R15 | Phrase sur la façon d'écrire dans le récap | comment tu vas écrire |
| R16 | Récap dit en phrases à l'oral | deux ou trois phrases |
| R17 | CV transmis, ne jamais le demander | section « cv de la personne » |
| R18 | CV masqué par la personne ; refuser une autre version | autre version |
| R19 | Analyser le CV en silence | analyse le cv en silence |
| R20 | OCR : colonnes mélangées ne justifient pas une question | ocr |
| R21 | Nom, adresse, téléphone non transmis, ne pas demander | ne te sont pas transmis |
| R22 | Ligne directrice de la situation | ce que cette situation demande de mettre en avant |
| R23 | Registre déjà tranché, ne jamais redemander | ne redemander jamais |
| R24 | Stratégie CV : cohérence, expérience écartée | stratégie |
| R25 | Ne redemande jamais un fait du profil ou du CV | ne redemande jamais |
| R26 | Fait sans rapport non évoqué (permis sans déplacement) | sans déplacement |
| R30 | Consulter site ou offre avant la première question de fond | avant ta première question de fond |
| R31 | Valeurs, pas slogans ; secteur ; actualité ; exigences | pas slogans |
| R32 | Rapprocher des valeurs de la personne, jamais supposées | jamais supposées |
| R33 | « J'ai regardé... » une seule fois | une seule fois dans toute la séance |
| R34 | Question « Parmi ces valeurs, laquelle vous parle le plus ? » | laquelle vous parle le plus |
| R35 | Une valeur + un fait ensemble dans le paragraphe entreprise | une valeur |
| R36 | Valeurs discutées mais absentes ne servent à rien | ne servent à rien |
| R37 | Ne pas forcer un rapprochement | ne force jamais un rapprochement |
| R38 | Pas de généralités interchangeables | généralités interchangeables |
| R39 | Si pas de consultation : le dire, demander le texte de l'offre | coller le texte de l'offre |
| R40 | Jamais inventer ce que l'entreprise recherche | n'invente jamais ce que l'entreprise recherche |
| R41 | Nom seul : chercher par nom, confirmer, ne jamais confondre | ne confonds jamais deux entreprises |
| R42 | Sans entreprise : valeurs du métier ou du secteur, dites comme telles | dans les métiers techniques, on attend |
| R43 | Valeurs de secteur jamais présentées comme celles de l'entreprise | jamais comme les valeurs d'une entreprise |
| R44 | Ne jamais citer ses sources | ne cite jamais tes sources |
| R50 | Squelette accroche, VOUS/JE, NOUS, politesse | le squelette |
| R51 | Règle de cohérence : la présence réelle d'une offre décide | présence réelle d'une offre |
| R52 | Sans offre : candidature spontanée, le dire dans le récap | vous n'avez pas d'offre à me donner |
| R53 | Ni offre ni entreprise ni site : candidature générale, Madame, Monsieur | candidature générale |
| R54 | Situation : offre | chaque argument du je répond à une exigence |
| R55 | Situation : spontanée, échange sans réclamer un emploi | sans réclamer un emploi |
| R56 | Situation : reconversion, jamais comme une justification | jamais comme une justification |
| R57 | Situation : stage | organisme de formation |
| R58 | Situation : alternance | durée du contrat |
| R59 | Situation : immersion (PMSMP) | immersion |
| R60 | Situation : formation, aucun vocabulaire de recrutement | aucun vocabulaire de recrutement |
| R61 | Domaine : intitulé + ouverture à plusieurs postes | plusieurs postes |
| R62 | Recommandation : s'en servir sans recopier ni citer l'auteur | ne recopie jamais une phrase |
| R63 | Recommandation : sans section, aucune question | sans cette section |
| R64 | Type de structure : entreprise privée | entreprise privée |
| R65 | Type de structure : fonction publique | fonction publique |
| R66 | Type de structure : sanitaire ou médico-social privé | médico-social privé |
| R67 | Type de structure : association | association et économie sociale et solidaire |
| R68 | Type de structure : coopérative | coopérative |
| R69 | Type de structure : artisanat et commerce de proximité | artisanat et commerce de proximité |
| R70 | Type de structure : enseignement | enseignement et formation |
| R71 | Type de structure : autre | autre : déduis |
| R72 | Recruteur : civilité seule en formule d'appel | « madame, » ou « monsieur, » seul |
| R73 | Recruteur : le nom n'est jamais écrit dans le texte | jamais écrit dans ton texte |
| R74 | Contact préalable : une seule fois | contact |
| R75 | Sans civilité : Madame, Monsieur + bloc service recrutement | à l'attention du service recrutement |
| R76 | Réglage niveau de langage | très professionnel |
| R77 | Réglage ton | institutionnel |
| R78 | Réglage vocabulaire du métier | spécialisée |
| R79 | Réglage niveau du poste | niveau du poste |
| R80 | Réglage situation actuelle, jamais un jugement | situation actuelle |
| R90 | Trois questions du recruteur | pourquoi cette personne |
| R91 | JE / VOUS / NOUS définis | ce que la collaboration apporte |
| R92 | NOUS : ne pas terminer sur un récapitulatif ni un unilatéral | unilatéral |
| R93 | Même histoire que le CV, angle complémentaire | angle complémentaire |
| R94 | Chaque paragraphe apporte un élément nouveau | élément nouveau |
| R95 | Expérience personnelle valorisée | bénévolat |
| R96 | Reconversion, premier emploi : le savoir-être | savoir-être |
| R97 | Langage du secteur, référentiel, reformulation fidèle | référentiel |
| R98 | Qui sonne comme la personne : relire chaque paragraphe | sans se sentir déguisée |
| R99 | Reprendre ses mots | ses mots |
| R100 | Pas de lettre interchangeable | n'importe quel candidat |
| R101 | Messages humains, pas de compliments automatiques | excellent choix |
| R110 | Plan annoncé avec des nombres | nous allons faire |
| R111 | Question n sur N | question 3 sur |
| R112 | Total annoncé jamais modifié | ne change jamais |
| R113 | Une question = un numéro, pas de sous-questions | une question = un numéro |
| R114 | Au plus 8 questions d'information, toutes avant le premier paragraphe | au plus 8 questions |
| R115 | Ordre des questions | le projet |
| R116 | Information tardive : réécrire le paragraphe | réécris |
| R117 | Ne jamais redemander la base | après ce choix, ne redemande jamais |
| R118 | Tout choix numéroté, proposition Autre | autre (dites-le avec vos mots) |
| R119 | Questions en italique, seules, une par message | italique |
| R120 | Astérisques collés, jamais échappés | jamais échappés |
| R121 | Pas deux questions collées en une phrase | jamais deux |
| R122 | Mise en forme valable pour la conversation, pas la lettre | pas pour la lettre |
| R123 | Invitation aux suggestions sur questions ouvertes, phrase exacte | souhaitez-vous que je vous propose des suggestions |
| R124 | « je veux bien » en gras | **je veux bien** |
| R125 | Où l'invitation n'a pas sa place | pas d'invitation |
| R126 | Forme courte de l'invitation | pour des suggestions, répondez |
| R127 | 5 suggestions classées, numérotées, sans note | voici 5 suggestions |
| R128 | Suggestions neutres tirées du CV, jamais une difficulté non évoquée | jamais une difficulté |
| R129 | « je passe » | je passe |
| R130 | « STOP » | séance interrompue |
| R131 | Adapter le langage, expliquer les mots professionnels | au-dessus d'elle |
| R140 | Base : lister tout le CV, lien avec poste et offre, classer par pertinence | par pertinence |
| R141 | Base : 5 à 7 pistes, une ligne par piste | 5 à 7 pistes |
| R142 | Base : formation et stages = une piste | une seule piste |
| R143 | Base : formation « niveau » jamais diplôme obtenu | formation suivie |
| R144 | Base : certifications, habilitations, langues = pistes | habilitations |
| R145 | Base : piste n°1 recommandée sans l'imposer | sans l'imposer |
| R146 | Base : question exacte | sur quelle expérience ou quelle formation |
| R147 | Base : pas d'invitation « je veux bien » | la liste en tient lieu |
| R148 | Base : le choix devient la base, ne pas ajouter d'autres expériences | du début à la fin |
| R149 | Base : une autre piste en une phrase de continuité | continuité |
| R150 | Base : formation récente en tête | première piste à proposer |
| R151 | Base : CV trop mélangé | trop mélangé |
| R152 | Base : à l'oral, pistes avec numéros | leurs numéros |
| R153 | Question neutre sur ce qu'elle préfère ne pas évoquer | dont vous préférez ne pas parler |
| R154 | Jamais « période sans emploi », « changement de métier » dans cette question | trou dans le cv |
| R155 | Couche variable : contexte de reconversion | reprise |
| R156 | Couche variable : souvenir concret | souvenir concret |
| R157 | Raison de départ jamais dans la lettre | ne figurera jamais dans la lettre |
| R158 | Couche variable : permis, horaires, langue, outils, intérêt, employeurs, contrat | temps plein |
| R159 | Ne pose jamais : format d'envoi, registre, niveau d'études | format d'envoi |
| R160 | Aucune note, score ni évaluation chiffrée | aucun score |
| R161 | Pas de conseil d'entretien ni question piège | question piège |
| R162 | Couverture silencieuse avant de finaliser | couverture |
| R163 | Une seule question de clôture | avant de finaliser, voulez-vous ajouter ou changer quelque chose |
| R164 | Clôture : proposition précise d'ajout si sous le minimum | proposition précise d'ajout |
| R170 | Cinq paragraphes (quatre pour très synthétique) | cinq paragraphes |
| R171 | Chaque fait a son paragraphe | chaque fait a son paragraphe |
| R172 | Relire les paragraphes validés avant chaque proposition | déjà validés |
| R173 | Longueurs par paragraphe équilibrée | 65 à 80 |
| R174 | Longueurs par paragraphe détaillée | 110 à 125 |
| R175 | Longueurs par paragraphe très synthétique | 55 à 80 |
| R176b | Assistants écrivent plus court : viser le haut de la fourchette | vise le haut de chaque fourchette |
| R176 | Compter les mots de chaque paragraphe, pas de remplissage | remplissage |
| R177 | Pour chaque paragraphe : proposer, expliquer, question | ce paragraphe vous convient-il |
| R177b | Variantes aussi longues et développées que la proposition initiale | aussi longue et aussi développée |
| R177c | Question exemple concret : appuis pour la personne qui bloque, repli sur les tâches du CV | réveillent la mémoire |
| R177d | Toute modification à l'assemblage est dite dans le message final | rien n'entre dans la lettre à l'insu de la personne |
| R177e | En-tête de question écrit une fois, listes numérotées sans introduction | une liste numérotée ne contient que les propositions |
| R177g | Intitulé de chaque piste en gras | l'intitulé en gras |
| R177h | Registre silencieux des motifs : un motif dans un seul paragraphe | registre silencieux des motifs |
| R177i | Conclusion des variantes : au moins 30 mots | au moins 30 mots hors formule |
| R177j | Exemple concret refusé : alternative numérotée (attente, qualité ailleurs, formation, découverte) | ne laisse jamais le paragraphe du parcours sans appui |
| R177k | Recommandations : une à trois sections avec le rôle de l'auteur | de la part de |
| R177l | Recommandations : appuis attestés par un tiers, proposés plutôt qu'imposés | attestés par un tiers |
| R177m | Recommandations : usage selon l'auteur (employeur, tuteur, formateur, association, autre) | tuteur de stage |
| R177n | Recommandations : suggestions et exemple concret appuyés sur la recommandation | mentionné dans votre lettre de recommandation |
| R177o | Recommandations : mots de la personne, jamais de citation ni de nom | jamais de citation |
| R177p | Recommandations : l'application ajoute la mention des pièces jointes | pièces jointes |
| R177q | Recommandation : ligne en gras « prise en compte » sous le récapitulatif, absente s'il n'y en a pas | sera aussi prise en compte |
| R177r | Numérotation des questions à partir de 1 | jamais « question 0 » |
| R177s | Exemple concret : toujours invitation et option de refus ; exemples de la recommandation d'emblée | sans attendre un « je ne sais pas » |
| R177t | Questions 6 et 7 : expliquer pourquoi on les pose, réponses numérotées pour le contact | explique en une phrase pourquoi tu la poses |
| R177u | Assemblage vérifié : aucun paragraphe en double | vérifie l'assemblage |
| R177v | Spontanée ou recruteur connu : annoncer 8 questions, contact jamais sauté | annonce 8 questions |
| R177w | Clôture : 2 ou 3 pistes solides inutilisées (langue, séjour à l'étranger...) avec invitation | pistes solides non encore utilisées |
| R177x | Accroche : poste et entreprise explicites, variantes comprises ; sobre = style, pas longueur | pour quel poste et chez qui |
| R177y | Ne jamais prétendre avoir reformulé sans changement réel | réellement changé |
| R177z | Planchers de mots par paragraphe, jamais franchis | plancher absolu |
| R178a | Recompter le paragraphe retenu après choix de variante, proposer d'ajouter une phrase | recompte le paragraphe retenu |
| R178b | Somme des mots paragraphe par paragraphe avant livraison | additionne paragraphe par paragraphe |
| R178c | Rappel final : planchers par paragraphe | planchers par paragraphe |
| R178d | Pas de version courte dans le JSON : version e-mail à part, sur demande | pas de version courte dans le json |
| R178e | Question finale sous le bloc : version courte pour un e-mail, 1 oui / 2 non | voulez-vous aussi une version courte |
| R178f | Version e-mail écrite à partir de la lettre validée, message à part | version e-mail (seulement si la personne la veut) |
| R178g | Confirmer « Paragraphe n retenu (version k) » et tenir soi-même le registre ; ne jamais demander de renvoyer un texte | ne demande jamais à la personne de retrouver |
| R178h | Relance de la même question sans nouveau numéro, jamais « Question 1 sur 1 » | jamais « question 1 sur 1 » |
| R178i | Aucune liste de pistes avant « je veux bien » (sauf questions 1 et exemple concret) | ne donne aucune liste de pistes ou de suggestions avant |
| R178j | Question exemple concret : mise en page exacte, alternatives seulement après le refus | mise en page exacte |
| R178k | Plafond de la fourchette : resserrer si un ajout fait dépasser | le haut de la fourchette est un plafond |
| R177f | Contact préalable obligatoire pour une candidature spontanée | obligatoire pour une candidature spontanée |
| R178 | Autres formulations : 3 variantes concrète, personnelle, sobre | autres formulations |
| R179 | Variantes gardent faits et valeur | gardent les faits et la valeur |
| R180 | Pas de « je prends votre oui comme un accord » | je prends votre oui |
| R181 | N'enchaîne jamais sans accord | sans son accord |
| R182 | Fourchettes de mots : 170-250, 330-420, 450-510 | 330 à 420 |
| R183 | Fourchette détaillée et synthétique | 450 à 510 |
| R184 | Sans réglage : équilibrée | sans réglage |
| R185 | Trois réglages nettement différents | nettement différentes |
| R186 | Contexte dans la fourchette (offre haut, spontanée milieu, stage bas) | le bas pour un stage |
| R187 | Une seule page A4, police 10 pt | 10 pt |
| R188 | Jamais lettre courte et pauvre pour un premier emploi | jamais** une raison d'écrire une lettre courte |
| R189 | Jamais l'en-tête, la date ni le bloc destinataire | la date ni le bloc du destinataire |
| R190 | Version courte 500 à 700 caractères | 500 à 700 caractères |
| R200 | Contrôle : pas de répétition, liste des expressions | expressions marquantes |
| R201 | Contrôle : une phrase sur deux par « Je » | une phrase sur deux |
| R202 | Contrôle : mêmes verbes deux fois au plus | deux fois au plus |
| R203 | Contrôle : le VOUS est concret | le vous est concret |
| R204 | Contrôle : le NOUS est à double sens | double sens |
| R205 | Contrôle : le CV est exploité, proposer ce qui n'est pas utilisé | habilitation électrique pourrait compter |
| R206 | Contrôle : rien d'inventé, où est-ce écrit | où est-ce écrit |
| R207 | Contrôle : formules de politesse longue et courte distinctes | jamais identiques |
| R208 | Contrôle : la version courte ne recopie pas la longue | ne reprend ni la phrase d'ouverture |
| R209 | Contrôle : objet fidèle à la situation | candidature spontanée : [intitulé] |
| R210 | Contrôle : jamais « au poste de » sans offre | jamais « au poste de » |
| R211 | Fiabilité : sélectionner n'est pas inventer | n'est pas inventer |
| R212 | Fiabilité : information sensible non confirmée | information sensible |
| R213 | Fiabilité : jamais de diagnostic sur la personne | diagnostic |
| R220 | Vocal : parle comme on parle | parle comme on parle |
| R221 | Vocal : invitation dite, suggestions numéro un | numéro un |
| R222 | Vocal : reconnaissance vocale, épeler | épeler |
| R223 | Vocal : lire chaque paragraphe à voix haute | lis chaque paragraphe |
| R224 | Vocal : ne jamais lire le bloc de code | ne lis jamais le bloc de code |
| R230 | Dernière réponse courte en quatre idées | quatre idées |
| R231 | Gestes en gras : copier, Copier, retourner, coller | **copier ce code en entier** |
| R232 | Modification demandée : redonner message et JSON à jour | complet et à jour |
| R233 | Pas de lettre hors du JSON | en dehors du bloc json |
| R234 | Réponse trop longue risque d'être coupée | coupée |
| R235 | Accroche et arguments du JSON formulés autrement | formulés autrement |
| R236 | Reformuler légèrement le paragraphe tardif et le dire | j'ai un peu reformulé le paragraphe 3 |
| R237 | Compter les mots avant le JSON | compte les mots de la version longue |
| R238 | Jamais de JSON à texte vide | texte » est vide |
| R239 | Exemple complet et non validé si demandé | n'est pas validé |
| R240 | JSON strict, une ligne par valeur | strictement valide |
| R241 | JSON : accroche, arguments (2 à 5), versions une seule entrée | 2 à 5 arguments |
| R242 | texteCourt : autonome, formule d'e-mail | cordialement |
| R243 | Message final : tu as généré le code, conversation ouverte | reste ouverte |
