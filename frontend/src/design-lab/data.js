export const copy = {
  headline: "Votre prochain départ commence ici.",
  intro:
    "Un premier poste, une nouvelle voie. Trouvez une équipe où vos idées ont leur place.",
  searchPlaceholder: "Métier, compétence ou entreprise",
};

export const jobs = [
  {
    id: "nova",
    company: "Atelier Nova",
    initials: "an",
    sector: "Produit numérique",
    title: "Développeur·se front-end React",
    category: "Tech",
    contract: "CDI",
    city: "Paris",
    remote: true,
    salaryMin: 38000,
    salaryMax: 44000,
    period: "an",
    age: 1,
    duration: null,
    description:
      "Imaginez des interfaces utiles et accessibles, au sein d’une petite équipe produit qui aime le travail bien fait.",
    missions: [
      "Développer des interfaces React accessibles.",
      "Collaborer avec les équipes design et backend.",
      "Participer aux revues de code et aux choix produit.",
    ],
    skills: ["React", "JavaScript", "Accessibilité"],
    tone: "blue",
  },
  {
    id: "traverse",
    company: "Studio Traverse",
    initials: "st",
    sector: "Design & stratégie",
    title: "Product designer junior",
    category: "Design",
    contract: "CDI",
    city: "Lyon",
    remote: true,
    salaryMin: 34000,
    salaryMax: 38000,
    period: "an",
    age: 2,
    duration: null,
    description:
      "Donnez forme à des services du quotidien, de la recherche utilisateur aux premiers prototypes interactifs.",
    missions: [
      "Conduire des entretiens utilisateurs.",
      "Créer des parcours et prototypes Figma.",
      "Faire évoluer le système de design.",
    ],
    skills: ["Figma", "Prototypage", "Recherche utilisateur"],
    tone: "olive",
  },
  {
    id: "pixel",
    company: "Maison Pixel",
    initials: "mp",
    sector: "Studio web",
    title: "Développeur·se full-stack",
    category: "Tech",
    contract: "Alternance",
    city: "Nantes",
    remote: false,
    salaryMin: 1100,
    salaryMax: 1700,
    period: "mois",
    age: 3,
    duration: "12 mois",
    description:
      "Apprenez en construisant : des projets web concrets, un accompagnement régulier et une vraie place dans l’équipe.",
    missions: [
      "Construire des fonctionnalités frontend et API.",
      "Manipuler des données PostgreSQL.",
      "Travailler avec un développeur référent.",
    ],
    skills: ["JavaScript", "Node.js", "PostgreSQL"],
    tone: "coral",
  },
  {
    id: "horizons",
    company: "Les Horizons",
    initials: "lh",
    sector: "Communication",
    title: "Chargé·e de communication",
    category: "Communication",
    contract: "Stage",
    city: "Bordeaux",
    remote: false,
    salaryMin: 900,
    salaryMax: 900,
    period: "mois",
    age: 4,
    duration: "6 mois",
    description:
      "Racontez les projets d’une entreprise engagée, créez des contenus et faites grandir sa communauté.",
    missions: [
      "Préparer les contenus des réseaux sociaux.",
      "Participer au calendrier éditorial.",
      "Suivre les résultats des campagnes.",
    ],
    skills: ["Rédaction", "Réseaux sociaux", "Création de contenu"],
    tone: "sand",
  },
  {
    id: "clair",
    company: "Clair Analytics",
    initials: "ca",
    sector: "Data & conseil",
    title: "Data analyst junior",
    category: "Data",
    contract: "CDI",
    city: "Paris",
    remote: true,
    salaryMin: 36000,
    salaryMax: 42000,
    period: "an",
    age: 5,
    duration: null,
    description:
      "Transformez les données en décisions claires. Analysez, visualisez et partagez vos découvertes avec l’équipe.",
    missions: [
      "Explorer les données et vérifier leur qualité.",
      "Créer des tableaux de bord lisibles.",
      "Présenter les analyses aux équipes métier.",
    ],
    skills: ["SQL", "Python", "Visualisation"],
    tone: "blue",
  },
  {
    id: "signal",
    company: "Atelier Signal",
    initials: "as",
    sector: "Design numérique",
    title: "UX/UI designer",
    category: "Design",
    contract: "Stage",
    city: "Lille",
    remote: true,
    salaryMin: 1100,
    salaryMax: 1100,
    period: "mois",
    age: 6,
    duration: "6 mois",
    description:
      "Explorez de nouvelles idées, affinez des interfaces et participez à chaque étape d’un projet de design numérique.",
    missions: [
      "Explorer des pistes visuelles.",
      "Dessiner des interfaces responsive.",
      "Tester et affiner les prototypes.",
    ],
    skills: ["Figma", "UI", "Design responsive"],
    tone: "olive",
  },
];

export const firstDirections = [
  {
    id: "a",
    letter: "A",
    name: "L’Éclaireur",
    label: "Editorial Premium",
    description: "L’élégance d’un journal de carrières.",
    palette: ["#f5f2e9", "#203e35", "#987b38"],
    type: "Bodoni Moda + Manrope",
    layout: "Colonnes éditoriales · filets fins · composition asymétrique",
    scores: [5, 4, 4, 5],
    reach:
      "Un profil comme un dossier de parcours ; une administration sobre en tableaux, avec le serif réservé aux titres.",
    risk: "Moins dense que B : la lecture gagne en rythme mais demande davantage de défilement.",
  },
  {
    id: "b",
    letter: "B",
    name: "Terrain",
    label: "Modern Recruitment SaaS",
    description: "Un outil précis, à la hauteur de vos ambitions.",
    palette: ["#f3f5f8", "#2349cb", "#192c42"],
    type: "Public Sans",
    layout: "Filtres latéraux · liste compacte · informations alignées",
    scores: [5, 3, 5, 4],
    reach:
      "Très adapté aux formulaires de profil, à l’historique des candidatures et à une administration dense.",
    risk: "Le plus familier des quatre : sa singularité repose sur la précision des détails et la marque.",
  },
  {
    id: "c",
    letter: "C",
    name: "Grand Air",
    label: "Contemporary Playful",
    description: "De l’espace pour vos idées. De l’élan pour la suite.",
    palette: ["#eee966", "#242944", "#e4dff2"],
    type: "Bricolage Grotesque",
    layout: "Champs de couleur · grille de fiches · géométrie expressive",
    scores: [4, 5, 4, 5],
    reach:
      "Un profil chaleureux et expressif ; une administration plus neutre, conservant les boutons, la typographie et les accents.",
    risk: "Les couleurs et grands caractères doivent être dosés dans les écrans riches en données.",
  },
  {
    id: "d",
    letter: "D",
    name: "Horizon",
    label: "Dark Premium / Experimental",
    description: "Une lecture immersive, des opportunités au premier plan.",
    palette: ["#171c1d", "#ebdfcb", "#d5a778"],
    type: "Barlow Condensed + Public Sans",
    layout: "Offres en lignes · panneau de lecture · surfaces nocturnes",
    scores: [4, 5, 4, 5],
    reach:
      "Un profil en dossier personnel et une administration en listes/panneaux ; prévoir une variante claire pour les usages prolongés.",
    risk: "Le contraste et les surfaces sombres demandent plus de soin dans les formulaires et longues lectures.",
  },
];

export const newDirections = [
  {
    id: "air",
    letter: "1",
    name: "Grand Air 2.0",
    label: "Le terrain des possibles",
    description:
      "Citron, horizon et affiches de carrière : une marque qui prend sa place.",
    palette: ["#ede944", "#142440", "#dfd8ef", "#cbd8bd"],
    type: "Archivo",
    layout: "Hero de marque · bande de recherche bleu nuit · grille d’affiches",
    scores: [5, 5, 5, 5],
    reach:
      "Le signe-horizon et les bandeaux de fiches forment une identité réutilisable. Les formulaires peuvent retrouver une base claire, avec ces accents précis.",
    risk: "La typographie très dense demande une hiérarchie stricte dans les écrans de profil et d’administration.",
  },
  {
    id: "pop",
    letter: "2",
    name: "Savane Pop",
    label: "Néo-brutalisme humain",
    description:
      "Corail, photo détourée et contrôles francs : la Savane se fait remarquer.",
    palette: ["#f97755", "#f8e550", "#171b1b", "#c5e5c9", "#edc7dd"],
    type: "Chivo",
    layout:
      "Affiche corail · portrait détouré · cartes à deux colonnes · ombres franches",
    scores: [5, 5, 4, 5],
    reach:
      "Une candidature peut reprendre le vocabulaire de dossier et les boutons enfonçables. Les ombres se réduiraient dans l’administration pour garder une lecture stable.",
    risk: "Le contraste expressif et les ombres doivent garder une vraie discipline ; trop de stickers rendraient les écrans denses fatigants.",
  },
  {
    id: "editorial",
    letter: "3",
    name: "Creative Editorial Savanna",
    label: "Le magazine des premiers élans",
    description:
      "Une Savane chaleureuse, photographique et graphique, à hauteur humaine.",
    palette: ["#f5eedf", "#24473d", "#b14f2c", "#c7e0df", "#ecd2cc"],
    type: "Literata + Manrope",
    layout:
      "Couverture photographique · contraste serif/sans · mosaïque d’offres",
    scores: [5, 5, 4, 5],
    reach:
      "Le profil devient un dossier éditorial avec projets et expériences. L’administration conserve les filets, les champs colorés et une typographie de travail sans serif.",
    risk: "Les formats variés demandent plus de soin lorsque les titres et descriptions réels changent de longueur.",
  },
];
export const selectedDirection = {
  id: "selected",
  letter: "R",
  name: "Maquette retenue",
  label: "Grand Air 2.0 · Bricolage Grotesque · palette de référence",
  type: "Bricolage Grotesque",
  palette: ["#f0e970", "#f09169", "#252a46", "#acbefa", "#bedbc7"],
};
export const directions = [
  ...firstDirections,
  ...newDirections,
  selectedDirection,
];

export const contracts = ["CDI", "Alternance", "Stage"];
export const categories = ["Tech", "Design", "Communication", "Data"];
export const salary = (job) => {
  const format = (value) => new Intl.NumberFormat("fr-FR").format(value);
  return `${format(job.salaryMin)}${job.salaryMin !== job.salaryMax ? ` – ${format(job.salaryMax)}` : ""} € / ${job.period}`;
};
export const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
