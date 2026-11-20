# ⚡ Thermosys v3

**Station de travail professionnelle CVC/Froid — FR / EN / ES**

Application web complète destinée aux ingénieurs en génie climatique, bureaux d'études, techniciens HVAC et installateurs frigoristes.

---

## 🎯 À propos

Thermosys v3 est un outil professionnel de calcul, de dimensionnement et de conformité réglementaire pour le génie climatique et la réfrigération. Conçu et développé par Nadir Mouissat, avec la validation technique de plusieurs ingénieurs spécialisés en automatisme et régulation.

L'application fonctionne comme un fichier HTML unique (`dist/index.html`) déployé sur Vercel, accessible en ligne, avec authentification et gestion des utilisateurs. Elle est installable comme application (PWA) et son service worker utilise une stratégie « réseau d'abord » : la dernière version déployée est toujours servie en priorité.

---

## ✅ Modules principaux

- **RÉSEAUX HVAC** — débit/diamètre, pertes de charge, pompe/HMT, vase d'expansion, séparateur, collecteur, guide de préréglage vannes, confort d'été (heures-degrés), gaines d'air (ASHRAE), tuyauterie frigorifique, acoustique, isolation/point de rosée, réseau de tuyauteries (ramifié et maillé), nomenclature du matériel, équilibrage des branches, export DXF, **sélection Refnet multi-marques** (Haier, Samsung, Mitsubishi Electric, Daikin, Toshiba, Gree, Midea, Hisense, Panasonic, Trane, LG, Fujitsu — données sourcées documentation constructeur officielle)
- **VANNES** — dimensionnement Kvs (IEC 60534)
- **DÉSENFUMAGE** — calculs conformes IT246 / EN12101 / NFPA92
- **CHARGE** et **CHARGE PRO** — charges thermiques et frigorifiques, charges horaires avec inertie
- **CHAUFFAGE** — déperditions selon EN 12831, import gbXML
- **ESTIMATION HORAIRE** — besoins annuels de chauffage et de refroidissement heure par heure (une zone, fichier météo EPW)
- **CHAMBRE FROIDE** — dimensionnement, compression deux étages, charge de fluide et contrôle EN 378, énergie
- **TRAITEMENT D'AIR** — CTA, rooftop, salles propres et pharmaceutiques, cascade de pressions, énergie annuelle
- **PSYCHRO** — air humide et procédés de traitement
- **CYCLE FRIGORIFIQUE** — cycle à compression simple étage, diagramme log p–h, COP, puissances ; compresseur générique ou scroll calibré (Copeland ZP54, R410A)
- **ÉLECTRICITÉ** — câbles et protections (IEC 60364), schéma unifilaire
- **MÉCATRONIQUE** — signaux, sondes, moteurs et variateurs, vibrations, volets, dépannage guidé
- **PROJET** — dossier commun, enregistrement du projet et PDF combiné ; **UNITÉS** — affichage SI / impérial
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

## 🔐 Authentification

Système de comptes utilisateurs via Supabase — inscription libre avec approbation manuelle par l'administrateur, garantissant un accès contrôlé pendant la phase de bêta.

## 🌍 Langues

- **Français, anglais et espagnol** : interface, résultats de calcul, notes imprimables, PDF, aide et lecture vocale du rapport, au moyen du bouton FR / EN / ES de l'en-tête. L'espagnol est public depuis le 14 novembre 2026 ; il peut être désactivé par un seul indicateur en cas de problème de langue.

## 🔬 Validation

Le dossier de validation (version de travail du 20 novembre 2026) rassemble les comparaisons effectuées et leurs écarts : ASHRAE 140 (27 des 28 résultats de référence reproduits), EnergyPlus 24.2 sur six maisons, mesures réelles de deux maisons d'essai de Holzkirchen (AIE EBC Annexes 58 et 71), propriétés CoolProp (680 cas, 0,2 % au plus) et capacité du Copeland ZP54 (0,67 % en moyenne, 2,4 % au maximum). Limite principale : aucune validation sur mesures en climat méditerranéen ou algérien à ce jour. Les modules restent des estimations d'ingénieur, et non des calculs réglementaires ni des logiciels certifiés.

## 🗂️ Organisation du dépôt

- `dist/` — le site déployé (`index.html`, `sw.js`, `manifest.json`, données).
- `api/` — fonctions serveur Vercel.
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
