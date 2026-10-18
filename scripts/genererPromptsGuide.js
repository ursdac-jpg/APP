/* Genere docs/PROMPTS_CHATGPT_QUI_FAIT_QUOI_GUIDE_2026-10-13.md (prompts G1 a G6 du guide). Usage : node scripts/genererPromptsGuide.js
   Les listes « deja connues » sont recalculees depuis le repertoire et le sas : relancer avant d'utiliser les prompts. */
const fs = require('fs');
const R = require('path').resolve(__dirname, '..');
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function noms(fichier) {
  return fs.readFileSync(R + '/' + fichier, 'utf8').split('\n').filter((l) => l.trim() && l[0] !== '#').map((l) => l.split(/\s*\|\s*/)[2]).filter(Boolean);
}
const tous = noms('modules/mon-territoire/contenu/lieux.txt').concat(noms('outils/sas/lieux.sas.txt'));
const connues = (re) => Array.from(new Set(tous.filter((n) => new RegExp(re).test(norm(n))))).sort((a, b) => a.localeCompare(b, 'fr'));

const RAYONS = 'accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors';
const FORMAT = [
  'Une ligne par structure, au format exact :',
  'id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date',
  '',
  '- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).',
  '- type : UN de la liste ci-dessus, sans en inventer.',
  '- nom : nom officiel de l\'organisme (jamais le nom d\'une personne).',
  '- description : UNE phrase simple sur ce que la structure fait pour la personne.',
  '- commune : commune de l\'accueil principal. zone : vide.',
  '- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s\'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l\'adresse de la page où tu l\'as lu ; sans cette page, laisse aussi le numéro vide.',
  '- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.',
  '- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.',
  '- rayons : ' + 'UNIQUEMENT des rayons de cette liste, séparés par des virgules SANS espace : ' + RAYONS + '. Jamais un type à la place d\'un rayon.',
  '- source : adresse https d\'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.',
  '- date : vide.'
].join('\n');

const PROMPTS = [
  { id: 'G1', titre: 'Orientation, bilan de compétences et emploi agricole', rayon: 'Orientation et aide à l\'emploi locale', cherche: 'centres d\'information et d\'orientation (CIO) ou leurs successeurs, centres interinstitutionnels de bilans de compétences (CIBC), Nouvelle-Aquitaine Cap Métiers, associations d\'aide à la reconversion (par exemple Retravailler), association pour l\'emploi et la formation en agriculture (ADEFA ou équivalent), maisons de l\'emploi et espaces économie emploi s\'ils existent encore, bureaux et points information jeunesse', types: 'formation-orientation, formation-jeunes, france-travail, mission-locale, collectivite-etat, appui-aux-employeurs', rayons: 'former, emploi, jeunes, accompagnement', re: 'orientation|bilan|cibc|cio |cap metiers|information jeunesse|info jeunes|bij|retravailler|adefa|maison de l emploi' },
  { id: 'G2', titre: 'Insertion par l\'activité économique et groupements d\'employeurs', rayon: 'Insertion par l\'activité économique', cherche: 'toutes les structures de l\'insertion par l\'activité économique (associations intermédiaires, ateliers et chantiers d\'insertion, entreprises d\'insertion, entreprises de travail temporaire d\'insertion, régies de quartier), les groupements d\'employeurs pour l\'insertion et la qualification (GEIQ) et les groupements d\'employeurs (GE)', types: 'siae, appui-aux-employeurs, plie', rayons: 'emploi, accompagnement, employeurs', re: 'insertion|geiq|siae|chantier|association intermediaire|regie|groupement d employeurs|plie|clause sociale' },
  { id: 'G3', titre: 'Création et reprise d\'activité, réseaux d\'entrepreneurs', rayon: 'Créer son activité', cherche: 'clubs et associations de créateurs et de repreneurs d\'entreprise (par exemple Club Dordogne Entrepreneurs), réseau Entreprendre, Initiative, BGE, Adie, France Active, couveuses et coopératives d\'activité et d\'emploi, associations de dirigeants bénévoles qui accompagnent les créateurs, Jeune Chambre Économique', types: 'creation-activite, appui-aux-employeurs', rayons: 'creer, emploi', re: 'creat|entrepren|initiative|bge|adie|france active|couveuse|coopalpha|iriscop|cae ' },
  { id: 'G4', titre: 'Famille, aide aux aidants, planification, bailleurs sociaux', rayon: 'Famille et social de proximité', cherche: 'points info famille, centres sociaux et centres socioculturels (les fédérations départementales et les principaux centres), maisons des aidants, centres de planification et d\'éducation familiale, bailleurs sociaux (offices publics de l\'habitat), structures d\'accueil temporaire, aides au logement des jeunes, Restos du Cœur, Alcooliques Anonymes, associations d\'aide alimentaire', types: 'soutien-aux-familles, petite-enfance, logement-hebergement, aide-alimentaire-materielle, service-social-secteur, sante-soins-addictions, ccas', rayons: 'garde, logement, budget, sante, accompagnement', re: 'famille|centre social|aidants|planification|habitat|logement|restos|alcooliques|alimentaire|accueil temporaire' },
  { id: 'G5', titre: 'Fonction publique et armées', rayon: 'Fonction publique et armées', cherche: 'les centres de gestion de la fonction publique territoriale, les services de la préfecture et du rectorat qui informent sur les concours, les centres d\'information et de recrutement des forces armées (CIRFA) et leurs permanences dans le département, les points d\'information sur les métiers de la fonction publique', types: 'collectivite-etat, france-travail', rayons: 'emploi, former', re: 'centre de gestion|cdg|prefecture|concours|cirfa|armee|fonction publique|rectorat' },
  { id: 'G6', titre: 'Chambres consulaires et appui aux employeurs agricoles', rayon: 'Chambres et appui aux employeurs', cherche: 'chambres d\'agriculture, chambres économiques ou interconsulaires, organisations qui aident les employeurs agricoles à recruter (services de remplacement, groupements d\'employeurs agricoles), santé au travail agricole', types: 'appui-aux-employeurs, creation-activite, collectivite-etat', rayons: 'employeurs, emploi, creer', re: 'chambre|agricul|remplacement|msa|economique' }
];

let h = '# Qui fait quoi : prompts ChatGPT pour compléter le répertoire à partir du guide\n\n';
h += '> Généré le 2026-10-13 (`gen_prompts_guide.js`, dans le dossier de travail de la session) depuis les données réelles : les listes « déjà connues » sont celles du répertoire public ET du sas des structures. **Sujets issus du tri du guide** (`docs/TRI_GUIDE_QUI_FAIT_QUOI_2026-10-13.md`, verdict B) ; **aucun texte du guide n\'est repris**, ChatGPT cherche les organismes ACTUELS dans les deux départements.\n\n';
h += '**Mode d\'emploi** : même méthode que `docs/PROMPTS_CHATGPT_PRETS_A_COPIER_2026-10-12.md` (réglage « instructions personnalisées » de l\'étape 1, une conversation par encadré, répondre « oui » à chaque partie). Copiez la réponse entière dans la conversation avec Claude : il la range dans le sas (jamais public), puis le prompt de vérification pour un autre assistant est régénéré.\n\n';
PROMPTS.forEach((p) => {
  const dej = connues(p.re);
  h += '---\n\n### ' + p.id + ' : ' + p.titre + '\n\n```\n';
  h += 'Rayon : ' + p.rayon + '. Ce que je cherche : ' + p.cherche + '. Types autorisés (colonne « type ») : ' + p.types + '.\n\n';
  h += 'Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon et qui EXISTENT ACTUELLEMENT (vérifie qu\'elles n\'ont pas fermé, changé de nom ou fusionné), pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c\'est trop long, découpe en parties et attends mon « oui ». Si une structure que je cite n\'existe plus, ne l\'invente pas : ne la donne pas.\n\n';
  h += FORMAT + '\n\n';
  h += 'Structures DÉJÀ CONNUES, à ne pas redonner : ' + (dej.length ? dej.join(' ; ') : 'aucune') + '.\n```\n\n';
});
fs.writeFileSync(R + '/docs/PROMPTS_CHATGPT_QUI_FAIT_QUOI_GUIDE_2026-10-13.md', h, 'utf8');
console.log('ok', h.length, PROMPTS.map((p) => p.id + ':' + connues(p.re).length).join(' '));
