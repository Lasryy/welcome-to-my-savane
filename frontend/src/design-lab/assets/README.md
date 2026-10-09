# Photographies de l'exploration 2

Ces photographies sont des illustrations, pas des portraits d'utilisateurs ni des images des entreprises fictives du laboratoire. Elles ne constituent aucun témoignage.

| Asset | Source | Traitement |
| --- | --- | --- |
| `creative-team.jpg` | [Annie Spratt, Unsplash](https://unsplash.com/photos/group-of-people-using-laptop-computer-QckxruozjRg) | Photographie de collaboration, redimensionnée par le CDN. Cadrage dans l'interface. |
| `young-portrait.jpg` | [Vitaly Gariev, Unsplash](https://unsplash.com/photos/young-woman-with-curly-hair-smiling-at-camera-ooIkYBBYlgg) | Portrait photographique, inchangé hors redimensionnement CDN. Cadrage dans l'interface. |
| `student-cutout.png` / `student-cutout.webp` | [Bangun Stock Production, Unsplash](https://unsplash.com/photos/a-young-man-holding-a-laptop-on-a-yellow-background-_98Sk4pIKqU) | Détourage assisté par l'outil natif ImageGen avec fond transparent, puis conversion WebP pour le navigateur. Certaines textures ont été reconstituées par le modèle ; le résultat n'est pas une extraction strictement identique pixel par pixel. |

Les pages sources indiquent la licence Unsplash pour ces trois photographies. Crédit conservé ici et dans la provenance des fichiers. Les fichiers ne servent pas à revendre une photographie ni à identifier une entreprise.

Le PNG conserve le résultat natif en haute résolution pour réutilisation. Le WebP est l'asset livré au navigateur. Le prompt exact de l'édition est dans `student-cutout.prompt.txt` ; la source, l'outil, les dimensions et la vérification alpha sont dans `student-cutout.provenance.json`. Les JPEG embarquent leur source avec Impeccable `embed-prompt` ; le WebP utilise son sidecar `.webp.json`.
