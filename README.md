# ⚡ Thermosys v3

**Station de travail professionnelle CVC/Froid — Bilingue FR/EN**

Application web complète destinée aux ingénieurs en génie climatique, bureaux d'études, techniciens HVAC et installateurs frigoristes.

---

## 🎯 À propos

Thermosys v3 est un outil professionnel de calcul, de dimensionnement et de conformité réglementaire pour le génie climatique et la réfrigération. Conçu et développé par Nadir Mouissat, avec la validation technique de plusieurs ingénieurs spécialisés en automatisme et régulation.

L'application fonctionne comme un fichier HTML unique déployé sur Vercel, accessible en ligne, avec authentification et gestion des utilisateurs.

---

## ✅ Modules principaux

- **HYDRAULIQUE** — débit/diamètre, pertes de charge, pompe/HMT, vase d'expansion, séparateur, collecteur, guide de préréglage vannes, gaines d'air (ASHRAE), tuyauterie frigorifique, **sélection Refnet multi-marques** (Daikin, Toshiba, Gree, Midea, Hisense, Panasonic, Trane, LG, Fujitsu — données sourcées documentation constructeur officielle)
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

## 🔐 Authentification

Système de comptes utilisateurs via Supabase — inscription libre avec approbation manuelle par l'administrateur, garantissant un accès contrôlé pendant la phase de bêta.

## 🌍 Bilingue natif

Toutes les interfaces et exports PDF sont disponibles en français et en anglais.

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
