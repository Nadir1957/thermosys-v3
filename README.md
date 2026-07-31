# ⚡ Hvacium v5.1

**Station de Travail HVAC | Expert Grade**  
*Outil professionnel de diagnostic, maintenance et dépannage CVC/Réfrigération*

---

## 🎯 À propos

Hvacium est une application web professionnelle conçue pour les **ingénieurs en génie climatique** et les **techniciens en froid et climatisation**.  
Elle fonctionne comme un fichier HTML unique autonome, utilisable **hors-ligne** sur chantier, en cave technique ou en local frigorifique.

---

## ✅ Fonctionnalités

### 🏭 Catalogue Constructeurs — 49 marques
- Daikin · Mitsubishi · Atlantic · Trane · Carrier · Toshiba · LG · Samsung
- Danfoss · Belimo · Siemens Acvatix · Honeywell · Johnson Controls · IMI Hydronic
- Copeland · Bitzer · Bock · Frascold · Hanbell · Schneider SpaceLogic
- *(44 constructeurs Domestic / Commercial / Industrial)*

### 🔧 Diagnostic & Calculs
- Calcul **SH / SC** (Surchauffe / Sous-refroidissement) en temps réel
- Diagnostic **F-Gas 2025** (Règlement UE 2024/573)
- Matrice IPM — Surcharge (Daikin · Mitsubishi · Hisense)
- Tables de saturation fluides frigorigènes (R32, R410A, R134a, R290, R744…)
- Rapport de diagnostic PDF exportable

### 📡 Bluetooth BLE — Manomètre connecté
- Connexion manomètre BLE (Testo 557s · Viecar EA400 · OBDLink MX+)
- Affichage BP/HP/T° en temps réel
- **Auto-save toutes les 30s** — données récupérées au redémarrage
- Mode simulation pour démo sans manomètre

### 📷 OCR — Lecture d'étiquette
- Scan d'étiquette constructeur par caméra
- Identification automatique du code erreur / référence
- Fallback photo upload si caméra indisponible

### 💧 Module Vannes & Hydraulique
- Guide préréglage hydraulique EN 15232 / RT2025
- Vannes 3V/4V · PICV · Danfoss AMV · Belimo EPIV
- Calcul DN, Kvs, débit, ΔP

### ⚡ Module Automate & Bus
- Protocoles : Modbus RTU/TCP · BACnet MS/TP · KNX · LonWorks
- Fiches I/O, boucles de régulation, logique

### 📋 DATA 2024-2025
- Normes : NF C18-510 · NF DTU 65.11 · EN 378:2021
- Consignation électrique / frigorifique
- RT2025 · RE2020 · F-Gas

### 🔒 Consignation NF C18-510
- Protocole consignation 5 étapes
- Rapport consignation exportable

---

## 📱 Compatibilité

| Navigateur / OS | Application | BLE Manomètre | OCR Caméra |
|---|---|---|---|
| Chrome Android (HTTPS) | ✅ | ✅ | ✅ |
| Chrome Desktop (HTTPS) | ✅ | ✅ | ✅ |
| Edge Desktop (HTTPS) | ✅ | ✅ | ✅ |
| Samsung Internet | ✅ | ⚠️ partiel | ✅ |
| Safari iPhone | ✅ | ❌ Apple bloque | ⚠️ |
| Firefox | ✅ | ❌ | ✅ |
| Fichier local file:// | ✅ | ❌ | ❌ |

> **Recommandé :** Chrome ou Edge sur Android, servi en HTTPS.

---

## 🚀 Déploiement

### Vercel (recommandé)
```bash
# 1. Cloner le repo
git clone https://github.com/votre-username/hvacium.git
cd hvacium

# 2. Pousser sur Vercel
vercel --prod
```

### GitHub Pages
```bash
# Activer GitHub Pages sur la branche main
# Le fichier index.html est servi automatiquement
```

### Local (développement)
```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```
Ouvrir `http://localhost:8080` — BLE et caméra fonctionnels en localhost.

---

## 📁 Structure du projet

```
hvacium/
├── index.html          # Application complète (fichier unique)
├── vercel.json         # Headers sécurité + permissions BLE/caméra
├── robots.txt          # Contrôle indexation SEO
└── README.md           # Ce fichier
```

---

## ⚖️ Mentions légales

**© 2026 Hvacium — Propriété Intellectuelle. Tous droits réservés.**

Ce logiciel est protégé par les lois internationales sur la propriété intellectuelle.  
Toute reproduction, distribution ou modification sans autorisation écrite est interdite.

> ⚠️ **Avertissement légal :** Hvacium est un outil d'aide à la décision.  
> Il ne remplace en aucun cas l'expertise physique d'un technicien certifié.  
> Hvacium décline toute responsabilité en cas de saisie erronée, mauvaise interprétation  
> des résultats ou dommages consécutifs à une intervention non conforme aux normes  
> en vigueur (NF C18-510 · NF DTU 65.11 · EN 378:2021).

---

## 📞 Contact

**Hvacium** — Application HVAC Professionnelle  
🌐 [hvacium.com](https://hvacium.com)  
📧 contact@hvacium.com

---

*Données techniques à jour au 29/04/2026 — Version 5.1.0 build 20260429*
