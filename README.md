# ⚡ Thermosys v3

**Station de travail professionnelle CVC/Froid — FR / EN / ES**

Application web complète destinée aux ingénieurs en génie climatique, bureaux d'études, techniciens HVAC et installateurs frigoristes.

---

## 🎯 À propos

Thermosys v3 est un outil professionnel de calcul, de dimensionnement et de conformité réglementaire pour le génie climatique et la réfrigération. Conçu et développé par Nadir Mouissat, avec la validation technique de plusieurs ingénieurs spécialisés en automatisme et régulation.

L'application fonctionne comme un fichier HTML unique (`dist/index.html`) déployé sur Vercel, accessible en ligne, avec authentification et gestion des utilisateurs. Elle est installable comme application (PWA) et son service worker utilise une stratégie « réseau d'abord » : la dernière version déployée est toujours servie en priorité.

---

## ✅ Modules principaux

- **HYDRAULIQUE** — débit/diamètre, pertes de charge, pompe/HMT, vase d'expansion, séparateur, collecteur, guide de préréglage vannes, confort d'été (heures-degrés), gaines d'air (ASHRAE), tuyauterie frigorifique, acoustique, isolation/point de rosée, réseau de tuyauteries, **sélection Refnet multi-marques** (Haier, Samsung, Mitsubishi Electric, Daikin, Toshiba, Gree, Midea, Hisense, Panasonic, Trane, LG, Fujitsu — données sourcées documentation constructeur officielle)
- **VANNES** — dimensionnement Kvs (IEC 60534)
- **DÉSENFUMAGE** — calculs conformes IT246 / EN12101 / NFPA92
- **CHARGE** — charges thermiques et frigorifiques
- **RE2020** — vérification seuils réglementaires par pays
- **SCOP/COP** — performance saisonnière, coût énergétique, rentabilité PAC
- **TEWI** — impact environnemental total équivalent
- **FLUIDES** — réfrigérants, huiles, F-Gas 2025
- **CODES ERREUR** — base de données multi-constructeurs
- **NORMES** — référentiel réglementaire
- **LOTO** — consignation/déconsignation avec export PDF
- **MAINT** — checklists de maintenance par équipement
- **DEVIS** — génération de devis multi-devises
- **CERTIFICAT** — export PDF de conformité
- **CONVERT** — conversions d'unités
- **OCR-IA** — lecture de plaques signalétiques
- **CHAMBRE FROIDE** — charges, système mono ou bi-étage, charge en fluide et sécurité EN 378, énergie et coût, isolation et condensation, note PDF
- **TRAITEMENT D'AIR** — CTA, rooftop, salles propres ; psychrométrie, récupération, filtres, cascade de pressions, énergie annuelle sur 8760 h (fichier météo EPW), COP variable selon la charge (EN 14825)
- **ESTIMATION HORAIRE** — charge horaire avec inertie ; comparée à ASHRAE 140, à EnergyPlus 23.2 (12 maisons) et aux mesures de Holzkirchen (AIE EBC Annexes 58 et 71) ; chiffres détaillés dans la page VALIDATION
- **CYCLE FRIGORIFIQUE** — compresseur scroll calibré, catalogue Danfoss
- **RÉSEAUX / PROJET** — réseaux de tuyauteries, projets enregistrés dans le compte (devis, réseaux), note combinée PDF
- **VALIDATION** — page des vérifications (tests automatiques de non-régression dans `tests/`)

## 🔐 Authentification

Système de comptes utilisateurs via Supabase — inscription libre avec approbation manuelle par l'administrateur, garantissant un accès contrôlé pendant la phase de bêta.

## 🌍 Langues

- **Français et anglais** : interface et exports PDF complets.
- **Espagnol** : traduction complète des modules (interface, résultats de calcul, PDF, virgule décimale, villes et pays), publique depuis le 14 novembre 2026. Le bouton de langue fait défiler FR → EN → ES.

## 🗂️ Organisation du dépôt

- `dist/` — le site déployé (`index.html`, `sw.js`, `manifest.json`, données).
- `api/` — fonctions serveur Vercel.
- `tests/` — tests de non-régression (voir `tests/README_TESTS.txt`).
- `verify_js_syntax.js` — vérifie la syntaxe de tous les scripts du fichier `dist/index.html`.
- `*.sql` — scripts de configuration Supabase.
- Les anciens scripts d'installation par étape (étapes 70 à 85 : traduction espagnole, service worker) sont archivés hors dépôt.

## 🛠️ Méthode de modification

Chaque évolution est appliquée par un installateur Node idempotent (le relancer ne change rien), puis contrôlée avant publication :

```
node add_esNN.js dist\index.html
node verify_js_syntax.js dist\index.html
git add dist/index.html
git commit -m "..."
git push
cd dist
vercel --prod
```

## 🚀 Déploiement

Hébergé sur Vercel : [thermosys-v3.vercel.app](https://thermosys-v3.vercel.app)

```
cd dist
vercel --prod
```

## ⚖️ Mentions légales

© 2026 Thermosys — Tous droits réservés.

**Avertissement légal :** Thermosys est un outil d'aide à la décision technique. Les méthodes de calcul s'appuient sur les normes et référentiels cités dans l'application (ASHRAE, EN, IT246, IEC 60534, etc.), mais ne constituent pas une certification officielle. Il ne remplace en aucun cas l'expertise et la validation d'un ingénieur ou technicien qualifié. Toute utilisation professionnelle doit faire l'objet d'une vérification indépendante avant exécution.

## 📞 Contact

Nadir Mouissat
