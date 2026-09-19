/* ============================================================
   data/freins.js
   ------------------------------------------------------------
   Bloc de donnees "freins -> ressources". SOURCE UNIQUE DE VERITE
   cote donnees pour les 17 codes de frein de la liste fermee du
   prompt (prompts/regard-exterieur.md, section "Freins identifies
   a partir des Reperes"). Donnee de reference, jamais modifiee a
   l'execution -- meme statut que data/metiers.js / data/lexique.js.

   Principe (docs/CHANTIER_RESSOURCES.md) : l'assistant CLASSE le
   frein (fiable), le CODE garantit les ressources (deterministe,
   jamais une URL generee par l'assistant). Le prompt renvoie deja
   `freinsIdentifies: [{code, justification}]` -- ce fichier fournit
   ce qu'on affiche pour chaque code.

   Perimetre : Regard exterieur (decision Denis 2026-08-28) + "Comparer mes
   pistes" (decision Denis 2026-08-31 : une etiquette "frein_ou_etape" sur une
   piste devient une condition reliee a ce repertoire, meme principe
   "l'assistant classe, le code garantit les ressources"). Pas le Bilan
   candidature. Les 17 codes et le test de synchro restent la source unique.

   Champs d'une entree :
   - code        : la cle, identique au code du prompt (17 exacts).
   - niveau      : 'vital' | 'stabilite' | 'emploi' -- hierarchie inspiree
                   de Maslow (deja dans prompts/regard-exterieur.md section
                   "Exception imperative, freins vitaux ou de stabilite").
                   Determine deterministe : un frein 'vital' (faim, logement,
                   violences, sante, addiction) s'affiche AVANT tout le reste
                   du rapport, jamais traite comme peripherique a l'emploi.
                   L'assistant classe le code, ce fichier fixe le niveau.
   - titre       : libelle court, adresse a la personne, mots simples.
   - definition  : ce que recouvre le frein, au present, jamais une
                   etiquette sur la personne (registre "Ton", voir
                   prompts/regard-exterieur.md section "Ton").
   - commentLever: les grandes pistes concretes, jamais une promesse.
   - pistesDeReflexion : questions a se poser, jamais des solutions.
   - quiVoir     : 1 a 3 types d'interlocuteurs / structures.
   - ressources  : [{ libelle, url, motsCles, verifieLe }] -- MEME
                   forme que `pistesRessources` du prompt (libelle /
                   motsCles / url), + `verifieLe`. `url` provient
                   EXCLUSIVEMENT de la liste fermee du prompt (deja
                   verifiee lors d'un chantier anterieur) ou vaut null.
                   verifieLe = 'liste-fermee-prompt' tant qu'une passe
                   de re-verification WebFetch dediee n'a pas eu lieu
                   (voir docs/LECONS_A_NE_PAS_REPRODUIRE.md 9.16).
   - synonymes   : les mots qu'une personne tape vraiment (pour la
                   future barre de recherche : "pas de voiture" -> mobilite).
   - sensible    : true UNIQUEMENT pour violences et addiction -- hors
                   vue-liste en acces libre, formulation prudente ;
                   l'assistant ne les code que si la personne l'exprime
                   elle-meme (regle deja dans le prompt).
   - urgence     : { numero, libelle } quand un numero national existe.

   Discipline a tenir : les 17 codes du prompt et les cles de ce
   fichier doivent rester synchrones (test : tests/freinsRepertoire.test.js).
   ============================================================ */

var FREINS_REPERTOIRE = {

  alimentaire: {
    code: 'alimentaire',
    niveau: 'vital',
    titre: 'Se nourrir',
    definition: 'Il vous arrive de sauter des repas, ou les fins de mois sont trop justes pour manger correctement. C\'est un besoin de base : il se regarde avant le reste, jamais en dernier.',
    commentLever: 'Plusieurs reseaux d\'aide alimentaire existent partout en France, avec ou sans conditions selon les endroits. Une assistante sociale peut aussi ouvrir une aide d\'urgence rapide.',
    pistesDeReflexion: [
      'Est-ce une periode difficile ponctuelle, ou une situation qui dure depuis plusieurs mois ?',
      'Avez-vous deja fait le point sur vos droits (RSA, prime d\'activite...) avec quelqu\'un ?'
    ],
    quiVoir: [
      'Le CCAS de votre commune (accueil, aide d\'urgence)',
      'L\'assistante sociale de votre secteur, rendez-vous via la mairie'
    ],
    ressources: [
      { libelle: 'Fédération française des Banques Alimentaires', url: 'https://www.banquealimentaire.org', motsCles: ['aide alimentaire', 'banque de son secteur'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'Les Restos du Cœur', url: 'https://www.restosducoeur.org', motsCles: ['aide alimentaire', 'association départementale'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'Secours Populaire Français', url: 'https://www.secourspopulaire.fr', motsCles: ['aide alimentaire', 'aide matérielle', 'antenne locale'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'Croix-Rouge française', url: 'https://www.croix-rouge.fr', motsCles: ['épicerie sociale', 'aide alimentaire', 'unité locale'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['manger', 'me nourrir', 'nourriture', 'repas', 'fin de mois', 'faim', 'plus rien à manger', 'aide alimentaire', 'colis alimentaire', 'épicerie sociale'],
    urgence: { numero: '115', libelle: 'SAMU social - urgence alimentaire et hébergement, gratuit, 24h/24' }
  },

  hebergement: {
    code: 'hebergement',
    niveau: 'vital',
    titre: 'Un logement stable',
    definition: 'Vous n\'avez pas de logement à vous, ou vous risquez de le perdre, ou vous êtes hébergé de façon précaire. Se poser sur ce point est un préalable, pas un sujet à part.',
    commentLever: 'Le 115 oriente vers un hébergement d\'urgence. Pour un maintien dans le logement ou une menace d\'expulsion, l\'ADIL et le CCAS peuvent aider tôt, avant que la situation ne se bloque.',
    pistesDeReflexion: [
      'La situation est-elle une urgence pour ce soir, ou une échéance dans quelques semaines ?',
      'Y a-t-il une démarche déjà engagée (dossier logement social, aide au maintien) que personne ne suit ?'
    ],
    quiVoir: [
      'Le 115 pour un hébergement d\'urgence (appeler chaque matin, insister si vous êtes en famille)',
      'Le CCAS de votre commune et l\'assistante sociale de secteur'
    ],
    ressources: [
      { libelle: 'service-public.fr', url: 'https://www.service-public.fr', motsCles: ['droits logement', 'aide au logement', 'expulsion'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['logement', 'pas de logement', 'sans logement', 'hébergé', 'hébergement', 'à la rue', 'sans domicile', 'expulsion', 'expulsé', 'squat', 'dormir', 'où dormir'],
    urgence: { numero: '115', libelle: 'SAMU social - hébergement d\'urgence, gratuit, 24h/24' }
  },

  mobilite: {
    code: 'mobilite',
    niveau: 'stabilite',
    titre: 'Se déplacer',
    definition: 'Aller sur un lieu de travail, de formation ou de rendez-vous est difficile aujourd\'hui : pas de permis, pas de véhicule, coût des transports, ou vous habitez loin de tout.',
    commentLever: 'Il existe des aides au financement du permis, des locations ou prêts de véhicule à petit prix, des garages solidaires, et des aides aux frais de transport le temps d\'une formation ou d\'une reprise d\'emploi. Ces aides dépendent souvent du territoire.',
    pistesDeReflexion: [
      'Le trajet bloque-t-il tous les emplois visés, ou seulement certains ?',
      'Une solution provisoire (covoiturage, aide au carburant) suffirait-elle pour démarrer ?'
    ],
    quiVoir: [
      'Votre conseiller France Travail ou Mission Locale (aides à la mobilité de votre territoire)',
      'L\'assistante sociale de secteur, rendez-vous via la mairie'
    ],
    ressources: [
      { libelle: 'Solidarauto', url: 'https://solidarauto.org', motsCles: ['garage solidaire', 'réparation à prix réduit'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'service-public.fr', url: 'https://www.service-public.fr', motsCles: ['aide à la mobilité', 'microcrédit personnel'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['mobilité', 'voiture', 'pas de voiture', 'permis', 'pas de permis', 'conduire', 'se déplacer', 'déplacement', 'transport', 'bus', 'trajet', 'loin de tout', 'isolé', 'rural', 'panne'],
    urgence: null
  },

  materiel: {
    code: 'materiel',
    niveau: 'stabilite',
    titre: 'Des vêtements, du matériel de première nécessité',
    definition: 'Vous manquez de vêtements adaptés (pour un entretien, pour l\'hiver, pour un poste précis) ou de matériel de base du quotidien.',
    commentLever: 'Des associations de terrain proposent des vestiaires solidaires et de l\'aide matérielle, souvent sans dossier lourd.',
    pistesDeReflexion: [
      'S\'agit-il d\'un besoin ponctuel (un entretien qui approche) ou d\'un manque durable ?',
      'Parmi ce qui vous manque, qu\'est-ce qui vous gênerait le plus lors d\'un premier contact avec un employeur ?'
    ],
    quiVoir: [
      'Le CCAS de votre commune',
      'Une antenne locale du Secours Populaire ou de la Croix-Rouge'
    ],
    ressources: [
      { libelle: 'Secours Populaire Français', url: 'https://www.secourspopulaire.fr', motsCles: ['aide matérielle', 'vestiaire solidaire', 'antenne locale'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'Croix-Rouge française', url: 'https://www.croix-rouge.fr', motsCles: ['aide matérielle', 'vestiaire', 'unité locale'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['vêtements', 'habits', 'de quoi m\'habiller', 'chaussures', 'matériel', 'vestiaire', 'première nécessité', 'hygiène'],
    urgence: null
  },

  sante: {
    code: 'sante',
    niveau: 'vital',
    titre: 'La santé',
    definition: 'Une situation de santé, physique ou morale, pèse aujourd\'hui sur votre parcours. Ce n\'est pas un défaut : c\'est un point à prendre en compte, qui peut évoluer.',
    commentLever: 'Un médecin traitant fait le point et oriente. Pour la santé psychique, un CMP propose des consultations gratuites, et le dispositif Mon Soutien Psy rembourse des séances avec un psychologue.',
    pistesDeReflexion: [
      'Ce point limite-t-il certains types de postes en particulier, ou toute démarche pour l\'instant ?',
      'Un suivi est-il déjà en place, ou reste-t-il à mettre en route ?'
    ],
    quiVoir: [
      'Votre médecin traitant',
      'Un CMP (Centre Médico-Psychologique) de votre secteur pour la santé psychique'
    ],
    ressources: [
      { libelle: 'Mon Soutien Psy', url: 'https://www.monsoutienpsy.sante.gouv.fr', motsCles: ['séances psychologue remboursées'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'Ameli', url: 'https://www.ameli.fr', motsCles: ['assurance maladie', 'droits santé', 'CPAM'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['santé', 'maladie', 'fatigue', 'douleurs', 'moral', 'déprime', 'psy', 'psychologue', 'arrêt maladie', 'soins'],
    urgence: null
  },

  handicap: {
    code: 'handicap',
    niveau: 'stabilite',
    titre: 'Une situation de handicap',
    definition: 'Une situation de handicap, déjà reconnue ou en cours de reconnaissance, pèse aujourd\'hui sur votre parcours professionnel.',
    commentLever: 'Si aucune reconnaissance n\'est faite, la MDPH instruit une demande de RQTH. Si une RQTH existe déjà, l\'AGEFIPH et les Cap emploi accompagnent l\'emploi et la formation adaptés.',
    pistesDeReflexion: [
      'Une reconnaissance (RQTH) est-elle déjà demandée, en cours, ou pas encore envisagée ?',
      'Le besoin d\'aménagement porte-t-il sur le poste, sur les horaires, sur les trajets ?'
    ],
    quiVoir: [
      'La MDPH de votre département (demande ou renouvellement de reconnaissance)',
      'Un Cap emploi (réseau Cheops) pour l\'accompagnement vers l\'emploi'
    ],
    ressources: [
      { libelle: 'Mon Parcours Handicap', url: 'https://www.monparcourshandicap.gouv.fr', motsCles: ['information handicap', 'trouver sa MDPH'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'AGEFIPH', url: 'https://www.agefiph.fr', motsCles: ['financement formation', 'RQTH reconnue'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'EPNAK (emploi accompagné, ESAT)', url: 'https://www.epnak.org', motsCles: ['emploi accompagné', 'ESAT'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['handicap', 'rqth', 'reconnaissance travailleur handicapé', 'mdph', 'invalidité', 'aménagement de poste', 'agefiph'],
    urgence: null
  },

  endettementAdministratif: {
    code: 'endettementAdministratif',
    niveau: 'stabilite',
    titre: 'Des dettes, une démarche administrative bloquée',
    definition: 'Des dettes s\'accumulent, ou une démarche administrative est bloquée et empêche d\'avancer sur le reste. C\'est concret, ça se travaille, souvent par étapes.',
    commentLever: 'Une assistante sociale fait le point sur les dettes et les droits. Pour un surendettement, un dossier se dépose auprès de la Banque de France. Beaucoup de démarches se débloquent avec un accompagnement.',
    pistesDeReflexion: [
      'Quelle démarche, si elle était réglée, débloquerait le plus le reste ?',
      'Y a-t-il un courrier ou une échéance en attente qu\'il faudrait traiter en priorité ?'
    ],
    quiVoir: [
      'L\'assistante sociale de votre secteur, rendez-vous via la mairie de votre commune',
      'Un point France Services pour les démarches en ligne'
    ],
    ressources: [
      { libelle: 'Banque de France (particuliers)', url: 'https://www.banque-france.fr', motsCles: ['surendettement', 'dépôt de dossier'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'Mes Droits Sociaux', url: 'https://www.mesdroitssociaux.gouv.fr', motsCles: ['droits', 'simulation prestations'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'service-public.fr', url: 'https://www.service-public.fr', motsCles: ['démarches administratives', 'microcrédit personnel'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['dettes', 'surendettement', 'endetté', 'découvert', 'huissier', 'crédit', 'papiers', 'démarche bloquée', 'administration', 'dossier bloqué', 'préfecture', 'caf', 'assistante sociale', 'assistant social'],
    urgence: null
  },

  emploi: {
    code: 'emploi',
    niveau: 'emploi',
    titre: 'Trouver ou garder un emploi',
    definition: 'La recherche d\'emploi n\'aboutit pas, ou les emplois trouvés ne durent pas, sans que ce soit lié à un autre frein de cette liste.',
    commentLever: 'Un accompagnement France Travail (ou Mission Locale pour les moins de 26 ans) reprend la stratégie de recherche : cibles, candidatures, réseau. Des services en ligne aident à cibler les entreprises qui recrutent.',
    pistesDeReflexion: [
      'La difficulté est-elle plutôt de décrocher des entretiens, ou de les transformer en embauche ?',
      'Le projet est-il assez précis (un métier, un secteur), ou encore trop large ?'
    ],
    quiVoir: [
      'Votre conseiller France Travail (ou Mission Locale pour les jeunes)',
      'Un accompagnement renforcé si votre situation le permet (à demander à votre conseiller)'
    ],
    ressources: [
      { libelle: 'France Travail', url: 'https://www.francetravail.fr', motsCles: ['recherche d\'emploi', 'offres', 'accompagnement'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'La Bonne Boîte', url: 'https://labonneboite.francetravail.fr', motsCles: ['entreprises qui recrutent', 'candidature spontanée'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'Emploi Store', url: 'https://www.francetravail.fr/candidat/vos-services-en-ligne/emploi-store.html', motsCles: ['préparer un CV', 'projet professionnel', 'entretien'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['emploi', 'travail', 'chercher du travail', 'recherche d\'emploi', 'boulot', 'embauche', 'candidature', 'chômage', 'pas de réponse', 'entretien'],
    urgence: null
  },

  formation: {
    code: 'formation',
    niveau: 'emploi',
    titre: 'Accéder à une formation',
    definition: 'Une formation vous serait utile, mais l\'accès ou le financement bloque aujourd\'hui.',
    commentLever: 'Le Compte Formation (CPF) ouvre des droits mobilisables directement. Selon la situation, France Travail, Transitions Pro ou les conseils régionaux financent tout ou partie d\'un parcours. Un conseiller aide à monter le dossier.',
    pistesDeReflexion: [
      'La formation visée est-elle qualifiante et reconnue pour le métier que vous visez ?',
      'Avez-vous déjà regardé vos droits CPF et les financements possibles avec un conseiller ?'
    ],
    quiVoir: [
      'Votre conseiller France Travail ou Mission Locale (plan de formation, financement)',
      'Un conseiller en évolution professionnelle (CEP), gratuit'
    ],
    ressources: [
      { libelle: 'Mon Compte Formation', url: 'https://www.moncompteformation.gouv.fr', motsCles: ['droits CPF', 'recherche de formation'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'France VAE', url: 'https://vae.gouv.fr', motsCles: ['valider l\'expérience', 'diplôme sans reprendre les études'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'AFPA', url: 'https://www.afpa.fr', motsCles: ['formation qualifiante adultes', 'demandeurs d\'emploi'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'Cap Métiers Nouvelle-Aquitaine', url: 'https://www.cap-metiers.fr', motsCles: ['formation en Nouvelle-Aquitaine', 'orientation par territoire'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['formation', 'me former', 'reprendre les études', 'cpf', 'compte formation', 'diplôme', 'qualification', 'financer une formation', 'reconversion'],
    urgence: null
  },

  gardeEnfants: {
    code: 'gardeEnfants',
    niveau: 'stabilite',
    titre: 'Faire garder ses enfants',
    definition: 'Le manque d\'un mode de garde limite aujourd\'hui vos disponibilités pour travailler, vous former, ou aller à des rendez-vous.',
    commentLever: 'Le site monenfant.fr recense les modes de garde par commune. La CAF propose des aides financières selon les revenus. Certaines formations et reprises d\'emploi ouvrent droit à une aide à la garde.',
    pistesDeReflexion: [
      'Le besoin est-il ponctuel (le temps d\'une formation) ou durable ?',
      'Une aide financière changerait-elle ce qui est possible pour vous ?'
    ],
    quiVoir: [
      'La CAF de votre département (aides à la garde)',
      'Le service petite enfance de votre mairie'
    ],
    ressources: [
      { libelle: 'monenfant.fr', url: 'https://monenfant.fr', motsCles: ['mode de garde', 'par commune'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'CAF', url: 'https://www.caf.fr', motsCles: ['aides à la garde', 'complément mode de garde'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['garde d\'enfant', 'faire garder', 'crèche', 'nounou', 'assistante maternelle', 'mode de garde', 'école', 'enfants', 'pas de solution de garde', 'agepi', 'aide à la garde', 'aide garde enfants'],
    urgence: null
  },

  judiciaire: {
    code: 'judiciaire',
    niveau: 'stabilite',
    titre: 'Une situation judiciaire',
    definition: 'Une démarche ou une situation judiciaire en cours pèse aujourd\'hui sur votre parcours. C\'est un point à traiter à part, sans se précipiter.',
    commentLever: 'Un accès au droit gratuit (point-justice, maison de justice et du droit) fait le point et oriente. Un avocat peut être pris en charge selon les ressources. L\'important est de ne pas laisser une échéance passer sans réponse.',
    pistesDeReflexion: [
      'Y a-t-il une échéance ou un courrier auquel il faut répondre bientôt ?',
      'Savez-vous vers quel interlocuteur gratuit vous tourner pour être conseillé ?'
    ],
    quiVoir: [
      'Un point-justice ou une maison de justice et du droit (accès au droit gratuit)',
      'L\'assistante sociale de votre secteur pour l\'orientation'
    ],
    ressources: [
      { libelle: 'service-public.fr', url: 'https://www.service-public.fr', motsCles: ['accès au droit', 'aide juridictionnelle'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['justice', 'tribunal', 'jugement', 'convocation', 'avocat', 'casier', 'contrôle judiciaire', 'procédure', 'litige'],
    urgence: null
  },

  langue: {
    code: 'langue',
    niveau: 'stabilite',
    titre: 'Le français au quotidien',
    definition: 'Le français n\'est pas votre langue première, et cela freine aujourd\'hui une démarche (comprendre un document, passer un entretien, suivre une formation).',
    commentLever: 'Des formations linguistiques existent, gratuites pour les personnes primo-arrivantes signataires du contrat d\'intégration (OFII). Des associations proposent aussi des ateliers de français à visée professionnelle.',
    pistesDeReflexion: [
      'Le blocage porte-t-il surtout sur l\'oral, sur l\'écrit, sur le vocabulaire d\'un métier précis ?',
      'Une formation de français est-elle déjà en cours, ou reste-t-elle à trouver ?'
    ],
    quiVoir: [
      'L\'OFII si vous êtes primo-arrivant (formations linguistiques du contrat d\'intégration)',
      'Une association d\'apprentissage du français de votre secteur, via la mairie ou France Services'
    ],
    ressources: [
      { libelle: 'OFII', url: null, motsCles: ['formation linguistique', 'contrat d\'intégration', 'primo-arrivant'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['français', 'parler français', 'apprendre le français', 'fle', 'langue', 'je ne comprends pas les papiers', 'traduction', 'primo-arrivant'],
    urgence: null
  },

  illettrisme: {
    code: 'illettrisme',
    niveau: 'stabilite',
    titre: 'Lire et écrire',
    definition: 'Lire ou écrire le français au quotidien est difficile, alors que le français est votre langue. C\'est fréquent, et ça se travaille à tout âge.',
    commentLever: 'L\'ANLCI et son réseau orientent vers des ateliers de proximité (souvent gratuits, discrets). Certaines formations sont adaptées et intègrent une remise à niveau.',
    pistesDeReflexion: [
      'Dans quelles situations concrètes cela vous gêne le plus (formulaires, consignes, messages) ?',
      'Connaissez-vous un lieu près de chez vous où une remise à niveau est possible ?'
    ],
    quiVoir: [
      'Un centre ressources illettrisme de votre région (via l\'ANLCI)',
      'Votre conseiller, qui peut intégrer une remise à niveau à un parcours'
    ],
    ressources: [
      { libelle: 'ANLCI', url: 'https://www.anlci.gouv.fr', motsCles: ['illettrisme', 'ateliers de proximité', 'remise à niveau'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['lire', 'écrire', 'lecture', 'écriture', 'illettrisme', 'j\'ai du mal à lire', 'remise à niveau', 'savoirs de base'],
    urgence: null
  },

  illectronisme: {
    code: 'illectronisme',
    niveau: 'stabilite',
    titre: 'L\'ordinateur, le smartphone, internet',
    definition: 'Utiliser un ordinateur, un smartphone ou internet est difficile aujourd\'hui, alors que beaucoup de démarches passent par là.',
    commentLever: 'Des conseillers numériques (France Services, médiathèques, espaces publics numériques) accompagnent gratuitement, pas à pas, sur des démarches réelles.',
    pistesDeReflexion: [
      'Quelles démarches précises êtes-vous obligé de faire en ligne en ce moment ?',
      'Y a-t-il un lieu près de chez vous où quelqu\'un peut vous accompagner sur un poste ?'
    ],
    quiVoir: [
      'Un point France Services (accompagnement numérique gratuit)',
      'Un conseiller numérique, souvent en médiathèque ou en mairie'
    ],
    ressources: [
      { libelle: 'ANLCI', url: 'https://www.anlci.gouv.fr', motsCles: ['illectronisme', 'accompagnement numérique'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['ordinateur', 'internet', 'smartphone', 'informatique', 'numérique', 'je ne sais pas me servir d\'un ordi', 'démarches en ligne', 'boîte mail'],
    urgence: null
  },

  discrimination: {
    code: 'discrimination',
    niveau: 'stabilite',
    titre: 'Une discrimination',
    definition: 'Vous avez vécu, ou vous craignez, une discrimination à l\'embauche ou dans votre parcours (origine, âge, sexe, handicap, adresse...). C\'est un fait à prendre au sérieux, pas une impression à minimiser.',
    commentLever: 'Le Défenseur des Droits reçoit les signalements et peut agir. Un CIDFF ou une association spécialisée peut aussi conseiller et accompagner une démarche.',
    pistesDeReflexion: [
      'S\'agit-il d\'un fait précis et identifiable, ou d\'un ressenti répété sur plusieurs situations ?',
      'Souhaitez-vous d\'abord en parler à quelqu\'un avant de décider quoi faire ?'
    ],
    quiVoir: [
      'Le Défenseur des Droits (signalement et recours)',
      'Un CIDFF ou une association de lutte contre les discriminations'
    ],
    ressources: [
      { libelle: 'Défenseur des Droits', url: 'https://www.defenseurdesdroits.fr', motsCles: ['discrimination à l\'embauche', 'recours', 'signalement'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['discrimination', 'discriminé', 'refusé à cause de', 'racisme', 'sexisme', 'âge', 'origine', 'quartier', 'on ne me prend pas parce que'],
    urgence: null
  },

  violences: {
    code: 'violences',
    niveau: 'vital',
    titre: 'Des violences',
    definition: 'Des violences (dans le couple, la famille, ou ailleurs) pèsent aujourd\'hui sur votre situation. Ce n\'est jamais un sujet à traiter après le reste.',
    commentLever: 'Le 3919 écoute et oriente, gratuitement et anonymement, à toute heure. Des associations et des CIDFF accompagnent la mise en sécurité, les démarches et l\'accès aux droits.',
    pistesDeReflexion: [
      'Y a-t-il une mise en sécurité à organiser en priorité, pour vous ou pour vos enfants ?',
      'Y a-t-il une personne de confiance à qui vous pourriez en parler, en dehors de la situation ?'
    ],
    quiVoir: [
      'Le 3919 (Violences Femmes Info), écoute et orientation',
      'Un CIDFF ou une association spécialisée de votre secteur'
    ],
    ressources: [
      { libelle: 'arretonslesviolences.gouv.fr', url: 'https://arretonslesviolences.gouv.fr', motsCles: ['violences', 'écoute', 'orientation'], verifieLe: 'liste-fermee-prompt' },
      { libelle: 'CIDFF', url: 'https://www.fncidff.info', motsCles: ['droits des femmes et des familles', 'accompagnement'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['violences', 'violence', 'violences conjugales', 'mari violent', 'coups', 'peur chez moi', 'menaces', 'harcèlement'],
    sensible: true,
    urgence: { numero: '3919', libelle: 'Violences Femmes Info - écoute et orientation, gratuit et anonyme, 24h/24' }
  },

  addiction: {
    code: 'addiction',
    niveau: 'vital',
    titre: 'Une addiction',
    definition: 'Vous évoquez vous-même une addiction qui pèse aujourd\'hui sur votre parcours. En parler est déjà un pas, et de l\'aide existe sans jugement.',
    commentLever: 'Des consultations en addictologie (souvent gratuites, confidentielles) proposent un accompagnement à votre rythme. L\'Association Addictions France est un point d\'entrée national.',
    pistesDeReflexion: [
      'Souhaitez-vous d\'abord en parler à un professionnel, sans engagement, pour voir ce qui existe ?',
      'Qu\'est-ce qui, dans votre parcours, serait plus simple si cette question avançait ?'
    ],
    quiVoir: [
      'Une consultation d\'addictologie (CSAPA) de votre secteur',
      'Votre médecin traitant, qui peut orienter'
    ],
    ressources: [
      { libelle: 'Association Addictions France', url: 'https://www.addictions-france.org', motsCles: ['addictologie', 'accompagnement', 'sans jugement'], verifieLe: 'liste-fermee-prompt' }
    ],
    synonymes: ['addiction', 'alcool', 'drogue', 'produits', 'dépendance', 'jeux', 'j\'ai un problème avec', 'sevrage', 'csapa', 'addictologie'],
    sensible: true,
    urgence: null
  }

};

// ============================================================
// ETAPE 8 (chantier freins) : projection dans le Lexique
// ============================================================
// Chaque frein devient une fiche du Lexique (univers "freins-parcours"),
// GENEREE ici a partir de ce bloc -- jamais recopiee dans data/lexique.js,
// qui reste la source des fiches redigees a la main. data/freins.js reste
// la source unique des freins. Le detail d'une de ces fiches affiche en
// plus, sous la definition, les pistes + ressources A JOUR
// (regardExterieurRenduFicheFrein, voir modules/lexique/index.js).
// Inerte cote Node (LEXIQUE_FICHES absent) et defensif si le Lexique n'est
// pas encore charge.
//
// Liens croises frein <-> fiche du Lexique, quand un lien reel existe.
// Carte centralisee ici (plutot que dispersee sur 17 entrees) pour rester
// lisible d'un coup d'oeil. Le Lexique rend la relation dans les DEUX sens
// (index bidirectionnel).
var _FREINS_LEXIQUE_VOIR_AUSSI = {
  sante: ['medecine-travail', 'amenagement-poste', 'aptitude-ou-inaptitude'],
  handicap: ['rqth', 'rqth-ou-invalidite', 'cap-emploi', 'amenagement-poste'],
  endettementAdministratif: ['surendettement', 'assistante-sociale'],
  gardeEnfants: ['aides-garde-enfants', 'caf'],
  mobilite: ['aide-a-la-mobilite'],
  formation: ['cpf', 'vae', 'bilan-competences', 'titre-professionnel'],
  emploi: ['france-travail', 'mission-locale', 'cap-emploi', 'iae', 'plie'],
  discrimination: ['discrimination-embauche'],
  // Etape 5b (2026-08-29) : nouvelles fiches Lexique ecrites pour ces sujets.
  langue: ['fle'],
  illettrisme: ['illettrisme'],
  illectronisme: ['illectronisme'],
  judiciaire: ['casier-judiciaire'],
  // Etape 6a (2026-08-29) : 4 fiches Lexique de plus.
  alimentaire: ['aide-alimentaire'],
  hebergement: ['hebergement-urgence'],
  materiel: ['aide-materielle'],
  violences: ['violences'],
  // Etape 7 (2026-08-29) : 5 fiches Lexique concept + liens caf faibles remplaces.
  addiction: ['addictologie']
};

// Freins qui pointent aussi vers la notion generale "frein-emploi" (fiche
// deja redigee dans data/lexique.js). Volontairement une POIGNEE, pas les
// 17 : sinon la fiche "Frein a l'emploi" afficherait un mur de renvois.
// Les autres freins restent atteignables via la rubrique de l'univers.
var _FREINS_RELIES_NOTION_GENERALE = {
  mobilite: 1, sante: 1, gardeEnfants: 1, endettementAdministratif: 1, langue: 1
};

(function _freinsProjeterDansLexique() {
  if (typeof LEXIQUE_FICHES === 'undefined' || !Array.isArray(LEXIQUE_FICHES)) { return; }
  Object.keys(FREINS_REPERTOIRE).forEach(function (code) {
    var f = FREINS_REPERTOIRE[code];
    // Prefixe "freins-" (pluriel) : "frein-emploi" est deja pris par la
    // fiche notion generale de data/lexique.js -- jamais de collision.
    var id = 'freins-' + code;
    if (LEXIQUE_FICHES.some(function (x) { return x.id === id; })) { return; } // idempotent
    var relations = [];
    if (_FREINS_RELIES_NOTION_GENERALE[code]) { relations.push({ ficheId: 'frein-emploi', type: 'voir-aussi' }); }
    (_FREINS_LEXIQUE_VOIR_AUSSI[code] || []).forEach(function (cible) {
      relations.push({ ficheId: cible, type: 'voir-aussi' });
    });
    LEXIQUE_FICHES.push({
      id: id,
      titre: f.titre,
      titreDeTri: f.titre,
      type: 'terme',
      univers: 'freins-parcours',
      registres: ['langage-cip'],
      variantesRecherche: (f.synonymes || []).slice(),
      corps: f.definition,
      relations: relations,
      _freinCode: code
    });
  });
})();

// Compat Node pour les tests (tests/freinsRepertoire.test.js) -- inerte
// dans le navigateur (typeof module === 'undefined'). Aucune autre data/*.js
// n'en a besoin aujourd'hui, mais ce bloc est la source de verite des 17
// codes et merite un test de synchronisation avec le prompt.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FREINS_REPERTOIRE: FREINS_REPERTOIRE };
}
