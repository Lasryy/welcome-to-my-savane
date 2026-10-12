# Design lab — Welcome To My Savane

La direction retenue pour la maquette de la page Offres associe **la composition de Grand Air 2.0, Bricolage Grotesque de Grand Air 1.0 et les cinq couleurs de l’image de référence fournie ensuite par l’utilisateur** : jaune solaire, corail, bleu nuit, bleu pastel et menthe. La [référence de palette](references/selected-palette.png) est conservée avec le laboratoire. La maquette est accessible à `/design-lab/selected`, également vue par défaut de `/design-lab`. Ce choix concerne la maquette ; les autres écrans du MVP attendent une demande et une approbation de l’utilisateur.

## Ouvrir le laboratoire

Depuis `frontend/` :

```sh
npm ci
npm run dev
```

Ouvrir [la maquette retenue](http://localhost:5173/design-lab/selected). L’application initiale reste à `/`.

| Vue | Route | Statut |
| --- | --- | --- |
| Grand Air 2.0 × Bricolage Grotesque × palette de référence | `/design-lab/selected` | Direction retenue pour la maquette Offres. |
| Grand Air 2.0 | `/design-lab/air` | Proposition originale : citron, bleu nuit, Archivo et horizon géométrique. |
| Savane Pop | `/design-lab/pop` | Proposition originale : corail, Chivo, portrait détouré et néo-brutalisme. |
| Creative Editorial Savanna | `/design-lab/editorial` | Proposition originale : crème, Literata/Manrope, photographies et mosaïque colorée. |
| Comparaison de la deuxième exploration | `/design-lab/compare` | Les trois propositions originales. |
| Comparaison de la première exploration | `/design-lab/compare-1` | Archives des quatre propositions rejetées comme trop génériques. |

Les premières pistes restent accessibles : A — L’Éclaireur (`/design-lab/a`), B — Terrain (`/design-lab/b`), C — Grand Air 1.0 (`/design-lab/c`) et D — Horizon (`/design-lab/d`). [Le brief initial](BRIEF.md) et [les contrats de la deuxième exploration](ROUND-2.md) conservent leur contexte historique. [Le contrat de la maquette retenue](SELECTED.md) enregistre le choix actuel. Les comparaisons et leurs notes sont des appréciations de design, sans résultats de test utilisateur. La barre supérieure appartient au laboratoire.

## Interactions

- Recherche par poste, entreprise, compétence ou description et par ville, validée par Rechercher ou Entrée. Les accents et la casse sont ignorés.
- Filtres par contrat, domaine et télétravail, avec réinitialisation. Les pistes courantes proposent des listes de sélection ; les filtres sont dans un volet natif repliable sur mobile. A et B permettent plusieurs contrats.
- Tri par récence, salaire annualisé décroissant ou entreprise. L’annualisation sert uniquement à comparer les annonces ; le montant affiché garde son unité.
- Signets et vue des favoris. Les critères et favoris sont partagés entre les directions, uniquement en mémoire jusqu’au rechargement.
- En savoir plus affiche les missions et compétences dans l’offre. Dans l’archive D, le détail utilise un panneau de lecture avec défilement vers celui-ci.
- Postuler affiche une explication locale. Connexion, inscription, entreprises et liens institutionnels ouvrent des panneaux de démonstration. Aucun compte ni candidature n’est créé.
- Le menu États simule le chargement, l’absence de résultats et une erreur récupérable.

## Isolation, données et assets

`frontend/src/main.jsx` charge le laboratoire séparément de l’application existante. Les styles et polices du lab restent dans cette branche. Les six annonces et entreprises fictives de `data.js` sont communes aux directions ; les salaires sont illustratifs. Aucun appel à l’API métier n’est effectué. Backend, base de données et Docker restent hors du périmètre.

Le logo fourni est réutilisé. Les huit familles de polices sont hébergées localement, sous licence SIL OFL. Les [crédits et la provenance des photographies](../../frontend/src/design-lab/assets/README.md) détaillent les sources Unsplash, le détourage assisté par ImageGen, son prompt et ses fichiers de provenance. Les photographies illustrent les explorations ; elles ne représentent pas les entreprises fictives ou des utilisateurs. La direction retenue conserve le signe-horizon de Grand Air.

## Documentation et vérification

[DESIGN.md](../../DESIGN.md) décrit le système de la maquette retenue ; [le sidecar](../../.impeccable/design.json) contient ses extensions et composants autonomes. Il ne vaut pas autorisation de réaliser les autres écrans du MVP. Le workflow est code-first, sans comp approuvé.

Les commandes de validation sont `npm run build` et `npm run lint` dans `frontend/`. Les trois propositions originales ont été inspectées à 1440 × 960, 390 × 844 et 886 × 960, avec captures dans `.impeccable/review/` (artefacts locaux ignorés par Git). Les neuf mesures de `round-2-fix-checks.json` montrent l’absence de débordement horizontal et l’entreprise, le contrat et le titre complet de la première offre dans le viewport. Le verdict `round2-final-verdict.md` accepte les deux corrections examinées : première offre visible et signe-horizon responsive complet. Cette validation limitée ne constituait pas une sélection esthétique ; le choix ultérieur vient de l’utilisateur. Ces mesures concernent les trois propositions originales. La maquette retenue dispose de ses propres captures `selected-desktop.jpg`, `selected-mobile.jpg`, `selected-user-886.jpg` et des cadrages de viewport correspondants ; `selected-browser-checks.json` conserve les mesures de la déclinaison examinée : police, palette, six cartes, débordement horizontal et premier titre complet aux trois tailles. Les preuves à jour de la palette de référence doivent être lues avec leur date et leur périmètre ; une capture antérieure ne valide pas les nouvelles couleurs.

## Suite

Le choix de la maquette est enregistré. Les écrans de profil, authentification, candidature et administration, ainsi que l’intégration API, attendent la suite demandée par l’utilisateur. Le MVP comporte les rôles USER et ADMIN, sans espace recruteur distinct.
