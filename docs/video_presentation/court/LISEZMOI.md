# Vidéos courtes (30 secondes) : fabrication

Même chaîne que l'introduction (`../LISEZMOI.md`) : navigateur piloté, voix `fr_FR-tom-medium`, sous-titres. Différence voulue par Denis (08/11/2026) : **une bande noire de 96 px AJOUTÉE sous l'image** (1280 sur 816), sous-titres en blanc dessus, l'image de l'application n'est jamais coupée.

- Un scénario par vidéo : `scenarios/<nom>.js` (blocs de voix et de sous-titres, puis le parcours joué).
- Fabrication : `node fabriquer.js <nom>` (étapes séparées : `voix`, `enregistrer`, `assembler`). Dossier de travail hors dépôt : `C:/Users/Denis/video_travail` (voix, ffmpeg_path.txt, ressources). Définir `NODE_PATH` vers le `node_modules` qui contient Playwright.
- Écrans de sites tiers (ChatGPT, Perplexity, etc.) : non automatisés (vérification « humain » du site), voir leçon 9.129.
- Personnage et données : toujours fictifs (Camille Martin).
