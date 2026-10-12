---
name: "Welcome To My Savane — maquette retenue"
description: "Grand Air 2.0, Bricolage Grotesque de Grand Air 1.0 et palette exacte de l’image fournie ; portée limitée à la maquette Offres."
colors:
  selected-coral: "#f09169"
  selected-ink: "#252a46"
  selected-paper: "#fff9ee"
  selected-yellow: "#f0e970"
  selected-yellow-hover: "color-mix(in srgb, #f0e970 90%, #252a46)"
  selected-blue: "#acbefa"
  selected-mint: "#bedbc7"
  selected-muted: "#252a46"
  selected-intro: "#252a46"
  selected-rule: "#8e93a4"
  selected-search-rule: "#c8c5b9"
  selected-card-rule: "#8e93a4"
  selected-company-rule: "#959ab2"
  selected-contract-rule: "#565d78"
  selected-sector: "#e3e7f4"
typography:
  selected-display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(48px, 5.4vw, 78px)"
    fontWeight: 800
    lineHeight: 0.99
    letterSpacing: "-0.04em"
  selected-headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "27px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  selected-offer-title:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "30px"
    fontWeight: 750
    lineHeight: 1.13
    letterSpacing: "-0.035em"
  selected-body:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  selected-description:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.65
  selected-label:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  selected-square: "0"
  selected-search: "3px"
  selected-search-button: "1px"
  selected-poster: "0 18px 0 0"
  selected-closing: "0 36px 0 0"
  selected-skill: "4px"
  selected-circle: "50%"
spacing:
  selected-compact: "12px"
  selected-control: "14px"
  selected-comfortable: "20px"
  selected-grid: "22px"
  selected-closing: "40px"
components:
  selected-register:
    backgroundColor: "{colors.selected-ink}"
    textColor: "{colors.selected-paper}"
    rounded: "{rounded.selected-search}"
    padding: "13px 20px"
  selected-search-button:
    backgroundColor: "{colors.selected-yellow}"
    textColor: "{colors.selected-ink}"
    rounded: "{rounded.selected-search-button}"
    padding: "13px 20px"
  selected-search-button-hover:
    backgroundColor: "{colors.selected-yellow-hover}"
  selected-apply:
    backgroundColor: "{colors.selected-ink}"
    textColor: "{colors.selected-paper}"
    rounded: "{rounded.selected-square}"
    padding: "10px 13px"
  selected-search:
    backgroundColor: "{colors.selected-paper}"
    textColor: "{colors.selected-ink}"
    rounded: "{rounded.selected-search}"
  selected-nav:
    textColor: "{colors.selected-ink}"
    typography: "{typography.selected-label}"
    padding: "10px 0"
  selected-contract:
    textColor: "{colors.selected-ink}"
    rounded: "{rounded.selected-square}"
    padding: "4px 8px"
  selected-poster:
    backgroundColor: "{colors.selected-blue}"
    textColor: "{colors.selected-ink}"
    rounded: "{rounded.selected-poster}"
    padding: "22px 23px"
  selected-horizon:
    textColor: "{colors.selected-ink}"
---

# Design System: Welcome To My Savane — maquette retenue

## Overview

**Creative North Star: "Le terrain des possibles — maquette retenue"**

La maquette choisie le 9 octobre 2026 associe la composition de Grand Air 2.0, Bricolage Grotesque de Grand Air 1.0 et les cinq couleurs de l’image de référence fournie ensuite par l’utilisateur. Cette précision remplace les valeurs de Savane Pop dans la maquette retenue. Le corail occupe la couverture, le bleu nuit structure la recherche et les bandeaux, le jaune porte les accents. Le signe-horizon et les offres en affiches conservent le langage de Grand Air 2.0. Le résultat est coloré, accueillant, jeune et professionnel. L’image de référence est conservée dans [selected-palette.png](docs/design-lab/references/selected-palette.png).

**Portée normative : la maquette de la page Offres dans `/design-lab/selected` et la vue par défaut `/design-lab` uniquement.** Ce document enregistre le choix explicite de l’utilisateur et les styles effectivement livrés. Il ne constitue pas une autorisation de réaliser les autres écrans du MVP ou de remplacer l’application à `/`. Les sept explorations restent des références historiques indépendantes, sans autorité sur cette maquette. Voir [le contrat retenu](docs/design-lab/SELECTED.md), [les trois propositions originales](docs/design-lab/ROUND-2.md) et [le laboratoire](docs/design-lab/README.md).

**Key Characteristics:**

- Composition Grand Air 2.0 : couverture, signe-horizon complet, bande de recherche et grille d’affiches.
- Bricolage Grotesque hébergée localement, poids disponibles 400–800, avec grand titrage au poids 800.
- Corail, bleu nuit, jaune, bleu pastel et menthe de la référence fournie, avec blanc cassé neutre.
- Actions locales et données fictives ; langue française et logo fourni conservés.
- Approbation limitée à la maquette ; les autres écrans attendent une nouvelle demande.

## Colors

### Primary

Le **corail de couverture** définit la grande région de marque. Le **bleu nuit d’encre** porte le texte, les bandeaux d’entreprise, le signe-horizon et la bande de recherche. Le **jaune solaire** sert à rechercher, souligne le titrage sur bleu nuit et colore le soleil ; sa variante de survol est dédiée au bouton Rechercher.

### Secondary

Le **bleu pastel**, la **menthe** et le **jaune solaire** alternent sur les six affiches dans l’ordre bleu, menthe, menthe, jaune, bleu, menthe. Ces couleurs suivent l’ordre visible des résultats, sans codage métier ni signification de contrat. La menthe sert aussi à la deuxième forme d’horizon et au bloc de fin.

### Neutral

Le **blanc cassé** couvre le fond de page, les champs et le texte sur bleu nuit. Le texte d’introduction reprend le bleu nuit d’encre sur corail ; le texte secondaire utilise également cette encre, et le secteur possède une teinte claire sur bleu nuit. Les filets de page, de recherche, de carte, d’entreprise et de contrat ont des valeurs propres ; ne pas les remplacer par une seule bordure universelle.

**The Scope Rule.** Les tokens `selected-*` s’appliquent à la maquette retenue uniquement ; les routes historiques ne définissent aucune variante active de ce système.

## Typography

**Display Font:** Bricolage Grotesque, avec sans-serif en repli.
**Body Font:** Bricolage Grotesque, avec sans-serif en repli.

Une seule famille reprend la voix de Grand Air 1.0 ; la différence de taille, de poids et de densité crée la hiérarchie. La fonte locale utilise `font-display: swap` et la page interdit la synthèse de fonte. Les demandes de poids 750 et 800 sont dans la plage disponible.

### Hierarchy

Les rôles desktop sont définis dans le frontmatter. Le display est réservé à la couverture, le headline aux résultats, le titre aux postes, le body aux contrôles et au texte courant, la description aux annonces et le label à la navigation. Les introductions utilisent une interligne plus ouverte (1.7) et une largeur maximale (55ch) sur desktop ; les descriptions sont limitées à 70ch. Les montants utilisent des chiffres tabulaires.

À 886px, le display est de 54px ; sous 760px il devient `clamp(36px, 6.7vw, 51px)`. Les titres de postes passent à 29px sous 1000px, 26px sous 760px et 33px sous 480px. Les titres des résultats passent à 20px sous 760px. Le bandeau mis en évidence dans la couverture conserve sa légère rotation et sa ligne de base compacte.

**The Available Weight Rule.** Le display et la marque utilisent le poids 800 de Bricolage Grotesque ; ne pas réintroduire la demande Archivo 850 de la proposition historique.

## Layout

Le conteneur partagé est `min(1280px, calc(100% - 112px))`, puis `calc(100% - 72px)` sous 1200px et `calc(100% - 40px)` sous 760px. La couverture rassemble navigation, titre et horizon ; la recherche reste sur une bande bleu nuit distincte. Le header a une hauteur minimale de 80px, puis ses liens occupent une seconde ligne sous 1000px.

Les offres suivent trois colonnes desktop (1.1fr / 1fr / 1fr), deux sous 1000px et une sous 480px. L’écart initial est de 22px, réduit à 17px sous 1200px. Les cartes restent à leur hauteur naturelle et alignées en haut. Les contrôles desktop donnent accès aux domaines, contrats, télétravail et tri ; sous 760px, les domaines horizontaux disparaissent et les filtres sont disponibles dans un `<details>` natif. La recherche mobile se répartit sur deux lignes : métier d’abord, ville et action ensuite.

Le signe-horizon complet est réduit, sans être remplacé par un glyphe : échelle 0.86 sur desktop, 0.68 entre 761 et 1000px, puis 0.32 avec ancrage en bas à droite sous 760px. L’introduction mobile réserve sa largeur. Le signe de fin est masqué sur mobile ; la signature reste dans la couverture.

Les vérifications de la maquette retenue à 1440 × 960, 390 × 844 et 886 × 960 sont conservées dans `.impeccable/review/selected-browser-checks.json` avec les captures `selected-*`. Elles attestent six cartes, aucun débordement horizontal et le premier titre complet dans le viewport à ces tailles. Elles ne représentent pas une validation de contenu API réel ou des écrans futurs.

## Elevation & Depth

La maquette utilise des régions colorées et des bandeaux contrastés, sans ombre portée sur les boutons ou les affiches. La palette suit l’image de référence ; les bordures épaisses et ombres décalées de Savane Pop restent dans cette proposition historique. La barre du laboratoire et les panneaux de démonstration peuvent avoir leurs propres ombres utilitaires ; ces outils ne définissent pas la profondeur de la maquette.

**The Flat Poster Rule.** La séparation des offres repose sur la couleur et les bandeaux ; ne pas transférer les ombres néo-brutalistes de Savane Pop dans la maquette retenue.

## Shapes

Les affiches ont un seul coin supérieur droit courbe. Le bloc de fin reprend cette asymétrie à une plus grande échelle. La recherche et l’inscription ont des angles légèrement adoucis ; le bouton Rechercher est presque carré. Les contrats et monogrammes d’entreprise sont rectangulaires. Le logo fourni garde son acacia blanc dans une forme bleu nuit asymétrique.

Le signe-horizon assemble un soleil plein, un cercle tracé, deux champs arrondis légèrement tournés, une ligne et la légende « le bon départ. ». Toutes les formes composent le même signe à chaque taille ; le mouvement n’ajoute aucune forme.

## Components

### Buttons

L’inscription et la candidature utilisent bleu nuit et blanc cassé ; Rechercher utilise jaune et bleu nuit. Les valeurs de padding du frontmatter décrivent la base desktop. Rechercher a une largeur minimale de 165px dans la recherche desktop, réduite à 135px sous 1000px, puis sans minimum sur mobile. L’inscription passe à un padding de 9px 13px et une hauteur minimale de 36px sous 760px. Les liens de détail sont soulignés au survol et leur flèche se déplace de 3px. La maquette n’utilise pas l’enfoncement des boutons Pop.

### Chips

Le contrat est un label informatif avec filet, pas un filtre cliquable. Les compétences des détails utilisent un fond mélangé à partir de l’encre et de la surface, un padding de 3px 8px et un rayon de 4px. Le bouton Télétravail possible expose son état par `aria-pressed` et utilise l’encre en fond quand il est actif.

### Cards / Containers

Chaque affiche garde entreprise, secteur, signet, contrat, ville, titre, salaire, mode de travail, description, date et actions dans cet ordre. Le bandeau d’entreprise est bleu nuit sur les six affiches. Le corps utilise un padding de 22px 23px desktop, puis 20px sous 1200px et 23px sous 480px. Les missions et compétences s’ouvrent dans la carte ; Postuler affiche une note locale sans envoyer de candidature. Le signet possède un libellé et un état accessible ; sa forme SVG devient jaune quand l’offre est sauvegardée.

### Inputs / Fields

La recherche repose sur des labels explicites, des champs natifs et des pictogrammes SVG. La barre crème prend un contour de focus de 2px, décalé de 3px ; chaque champ reste sans bordure intérieure propre. Les selects de filtres restent natifs. Le bouton Rechercher est désactivé pendant le chargement simulé, avec opacité réduite et curseur d’attente. Les états de résultats comprennent chargement, vide et erreur récupérable ; ce sont des états de démonstration.

### Navigation

Les liens de page utilisent un soulignement au survol et un filet sous l’élément actif. Les favoris affichent un compteur et un état pressé. La navigation passe sur une ligne séparée sous 1000px. Le lien d’évitement, les libellés masqués pour les champs, les états `aria-expanded` et le nombre de résultats annoncé par `aria-live` font partie des mécanismes réellement présents. Le focus visible partagé utilise un contour de 2px avec décalage de 4px.

### Signature — horizon

Le soleil monte de 12px quand la couverture contient le focus, avec une transition de 0.35s et la courbe `cubic-bezier(0.16, 1, 0.3, 1)`. Cela inclut la recherche mais aussi les contrôles du header. `prefers-reduced-motion: reduce` supprime les animations, transitions et défilement fluide ; la translation du soleil est explicitement supprimée. Le motif est décoratif et masqué aux technologies d’assistance.

## Do's and Don'ts

### Do:

- **Do** respecter la composition Grand Air 2.0, Bricolage Grotesque et les cinq couleurs de référence dans la maquette retenue.
- **Do** garder l’entreprise, le contrat et le titre complet de la première offre visibles aux trois tailles examinées.
- **Do** conserver le signe-horizon complet, les labels natifs, les états accessibles et la préférence de mouvement réduit.
- **Do** traiter les six annonces comme des démonstrations et maintenir les interactions en mémoire.

### Don't:

- **Don't** interpréter l’approbation de la maquette comme une demande de réaliser les autres écrans ou d’intégrer l’API.
- **Don't** reprendre les ombres et les bordures épaisses de Pop, Archivo de Grand Air 2.0 ou les photographies de Creative Editorial dans cette maquette.
- **Don't** transformer l’alternance des tons d’offres en une signification métier absente des données.
- **Don't** promouvoir les notes subjectives des comparaisons ou les outils du laboratoire au rang de règles de produit.

Non canonisé : les sept variantes restent historiques. Les deux alertes mécaniques sur les formes carrées de Pop et Creative ont été examinées comme faux positifs ; elles ne changent pas ce système. Le verdict de la deuxième exploration acceptait deux corrections, sans approbation esthétique ; l’approbation de la combinaison retenue vient ensuite de l’utilisateur. Aucun nouveau contrôle visuel n’est revendiqué par ce document.
