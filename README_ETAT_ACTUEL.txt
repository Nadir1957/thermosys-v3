====================================================================
THERMOSYS v3 — ETAT DE REFERENCE OFFICIEL
====================================================================
Date de cette note : 24 octobre 2026

REFERENCE OFFICIELLE ACTUELLE :
 index_MASTER_24octobre2026_etape27.html (copie sur PC, disque G: et dossier maitre ; sur Drive : index.html)
 = copie exacte de dist\index.html sur le PC
 = GitHub : github.com/Nadir1957/thermosys-v3 (commit 3ed67b9)
 = Vercel (production) : thermosys-v3.vercel.app
 = api/ocr.js : synchronise avec dist/api/ocr.js (a verifier a chaque modification)

Contenu de cette version (sessions du 19 au 23/10/2026) :
 - Onglets OBD et BLUETOOTH masques sur le site (code conserve, non valides
   sur materiel reel).
 - NOUVEAU MODULE CHAMBRE FROIDE (etapes 1 a 8) : produit et conservation,
   construction, ambiance exterieure (pays puis ville, etape 31), portes et
   infiltration, charges internes, systeme frigorifique mono ou bi-etage,
   fluides R134a/R22/R290/R404A/R448A/R449A/R452A/R507A/R717, charge en
   fluide et securite EN 378, energie et cout, isolation et condensation,
   second produit, note PDF.
 - NOUVEAU MODULE TRAITEMENT D'AIR (etapes 9 a 12) : CTA, rooftop, salles
   propres et pharmaceutiques ; psychrometrie ASHRAE ; recuperation EN 13053 ;
   air neuf EN 16798-1 ; filtres EN 1822 ; ISO 14644-1 et BPF Annexe 1 ;
   cascade de pressions entre locaux et sas (etape 10) ; energie annuelle sur
   8760 h a partir d'un fichier meteo EPW de n'importe quelle ville, avec
   boutons d'acces a climate.onebuilding.org (etape 11) ; salles tres seches
   avec roue dessiccante et consigne en point de rosee ; charge partielle
   fine : profils horaires, VAV, air neuf selon occupation, COP variable
   (etape 12). Titres de saison adaptes a la roue dessiccante (12b).
 - ONGLET AIDE mis a jour (etape 13) : modules Chambre froide, Traitement
   d'air, Desenfumage ; bloc Bluetooth retire ; question FAQ sur le fichier
   meteo.
 - NOUVEAUX MODULES DU 23/10/2026 (etapes 14 a 21) :
   * CHARGE PRO (etape 15) : charge de refroidissement horaire avec inertie des
     parois, vitrages, ciel clair, meteo EPW, note imprimable.
   * PSYCHRO (etape 16) : air humide ASHRAE (verifie avec CoolProp), procedes,
     melange, diagramme, note imprimable.
   * CHAUFFAGE (etape 17) : deperditions EN 12831 local par local, sol ISO 13370,
     ventilation avec recuperation, note imprimable.
   * ELECTRICITE (etape 18) : cables et protections IEC 60364 circuit par
     circuit (courant admissible, chute de tension, tenue thermique, court-circuit
     minimal, PE et neutre, demarrage moteur), note imprimable.
   * PROJET (etape 19) : dossier commun et PDF combine des notes (garde, sommaire),
     enregistrer / ouvrir un projet (.json). MECATRONIQUE ajoute au PDF (etape 21).
   * UNITES (etape 19b) : interrupteur SI / Imperial (double affichage, AWG).
   * MECATRONIQUE (etape 20) : signaux 0-10 V / 4-20 mA, sondes Pt100 / Pt1000 /
     CTN, moteur et variateur, lois des ventilateurs, vibrations ISO 10816-3,
     couple de servomoteur de volet, logique de securite (simulation et code
     d'exemple), depannage guide, note imprimable.
   * ONGLET AIDE mis a jour (etape 21) : 7 nouveaux blocs et une question FAQ.
 - Documents a jour (hors code) :
   * Thermosys_v3_Manuel_Fonctionnel_Modules_v3 (.docx et .pdf) — manuel
     bilingue version 3.0 (octobre 2026)
   * THERMOSYS_v3_Annexe_technique_ONDA_octobre2026 (.docx et .pdf) — annexe au
     dossier technique ONDA (chambre froide, traitement d'air et modules du
     23/10/2026). Dossier ONDA n° 51004824 deja depose : l'annexe le complete.
 - Tout le contenu anterieur reste inclus (authentification, hyd7 a hyd12,
   refonte DEVIS, ecran de connexion anglais fixe, Refnet, auto-approbation,
   compteur de connexions, privacy policy, page d'accueil, etc.)

--------------------------------------------------------------------
JALONS UTILES (copies datees conservees) :
--------------------------------------------------------------------
 index_MASTER_09octobre2026.html        -> avant le module chambre froide
 index_MASTER_21octobre2026_etape8.html -> chambre froide terminee
 index_MASTER_22octobre2026_etape10.html-> traitement d'air + cascade
 index_MASTER_23octobre2026_etape13.html-> aide + manuel v2
 index_MASTER_23octobre2026_etape24.html-> avant visuels et unites imperiales
 index_MASTER_24octobre2026_etape27.html-> ETAT ACTUEL (reference)

--------------------------------------------------------------------
METHODE DE DEPLOIEMENT (rappel) :
--------------------------------------------------------------------
 cd /d "D:\Froid et climatisation\Thermosys\Thermosys v3\files"
 sauvegarde : copy dist\index.html "..\..\BACKUPS_SECURITE\anciens_dist\index_avant_etapeN.html"
 node add_xxx.js dist\index.html -> controle FIN OK -> node verify_js_syntax.js
 (76 blocs a l'etape 22) -> node protect_add.cjs -> copy dist\index.html index.html
 -> git add index.html dist/index.html (jamais git add .) -> git commit -> git push
 -> cd dist -> vercel --prod -> test en ligne (Ctrl+F5)
 Une seule commande a la fois dans cmd.

METHODE DE DEBOGAGE ETABLIE (code obfusque) :
 Le fichier utilise plusieurs alias locaux pour la meme fonction de
 decodage a0_0x264b, parfois imbriques. Un script de decodage robuste doit
 detecter TOUS les alias recursivement.

--------------------------------------------------------------------
SAUVEGARDES REDONDANTES — ETAT ACTUEL :
--------------------------------------------------------------------
 1. PC local (dist\index.html + BACKUPS_SECURITE)      [A JOUR - etape27]
 2. GitHub (github.com/Nadir1957/thermosys-v3)         [A JOUR - 3ed67b9]
 3. Google Drive - ce dossier                          [A JOUR - etape27]
 4. Disque externe G:\Thermosys_Backup\                [A JOUR - etape27]
 5. Dossier maitre D:\Thermosys_CODE_SOURCE_MASTER\    [A JOUR - etape27]

ETAPE 22 - SECURITE (commit 4641410, 76 blocs) :
 - add_secu1.js : echappe les textes saisis (DEVIS ecran+impression, reseau
   hydraulique, resultats, journal) ; module secu1-module = garde-fou sur les
   champs texte (< > " remplaces par ‹ › ”) + journal et toasts securises.
 - check_rls.js : test lecture seule Supabase en visiteur anonyme (projects,
   profiles = acces refuse 401, OK le 23/10/2026).
 - A FAIRE avant lancement payant : tester avec 2 comptes qu'un utilisateur
   ne lit pas les projets d'un autre ; en-tetes de securite vercel.json ;
   remplacer les alert() par des messages internes.
 - test: xss_test.cjs (53 -> 0 scripts executes).

ETAPE 23 (commit 10b7c22) : dist\vercel.json avec en-tetes de securite
 (nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy, Permissions-Policy
 camera/micro/bluetooth = self). Verifie par curl -I.
ETAPE 24 (commit 3172ab9, 76 blocs) : ELECTRICITE - schema unifilaire SVG
 (ecran + note + PDF combine, SI/imperial) ; noms de circuits non convertis
 en imperial (zero-width space). Mise a jour : node add_elec.js dist\index.html

ETAPE 25 (commits a4fd2fd, bb7cb88) : CHAMBRE FROIDE - visuels SVG
 (repartition des apports, coupe de la chambre + condensation), ecran et note,
 SI/imperial. Mise a jour : node add_cr_vis.js dist\index.html (marqueur CR-VIS-2).

ETAPE 26 : UNITES - controle minutieux de l'affichage imperial. Series de valeurs
 convertir toutes (10.0 x 8.0 x 5.0 m ; 0.22 / 0.19 / 0.20 W/m2K ; -1.5/50 C), U et flux
 (W/m2K, W/m2, W/m3, W/t), bar/psi, kg/lb, t/lb, m3/ft3, mm/in, K et C par jour en ecarts
 (x1,8 sans +32), section d'orifice en in2 (AWG seulement en ELECTRICITE).
 CHAMBRE FROIDE et TRAITEMENT D'AIR ajoutes au bouton SI/Imperial (ecran + saisie).
 Mise a jour : node add_units.js dist\index.html puis node add_cr_vis.js dist\index.html
 (marqueur CR-VIS-3).

ETAPE 26b : ELECTRICITE - audit minutieux. Tables CEI 60364-5-52 verifiees. Corrections :
 PE et neutre arrondis a la section normalisee superieure ; Icc minimale avec m = S/S_PE
 reel (et reactance des sections >= 150 mm2) ; regroupement des cables enterres
 (n entre deux valeurs = valeur prudente) ; mention neutre reduit (sans harmoniques).
 Mise a jour : node add_elec.js dist\index.html (script d'audit : audit.cjs).

ETAPE 26c : CHAUFFAGE audite (moteur EN 12831 / ISO 13370 correct, aucune correction).
 UNITES : W/K (UA) et W convertis en imperial, y compris dans la fiche de chaque paroi.
 Mise a jour : node add_units.js dist\index.html

ETAPE 27 (commit 3ed67b9) : RAPPORT - lecture vocale (voiceReport) : textes FR/EN ajoutes pour CHAMBRE FROIDE,
 TRAITEMENT D'AIR, CHARGE PRO, PSYCHRO, CHAUFFAGE, ELECTRICITE, MECATRONIQUE, PROJET ; texte de
 presentation complete. Mise a jour : node add_audio2.js dist\index.html (marqueur THERMOSYS-AUDIO-V2).
 A refaire a chaque nouveau module : ajouter son texte dans voiceReport.

ETAPE 28 (commit 26dc408) : audit minutieux de PSYCHRO, CHARGE PRO, MECATRONIQUE, CHAMBRE FROIDE, TRAITEMENT D'AIR
 (comparaison CoolProp, formules et normes relues) : aucune erreur de calcul. PROJET : CHAMBRE FROIDE
 et TRAITEMENT D'AIR ajoutes au PDF combine (si utilises pendant la session ; non enregistres dans le
 fichier .json). Mise a jour : node add_proj.js dist\index.html puis node add_aide6.js dist\index.html
 (marqueur THERMOSYS-AIDE-V7).

ETAPE 29 : controle des anciens modules (30 fonctions relues, tests CoolProp). 7 calculs corriges :
 VASE D'EXPANSION (dilatation interpolee, reserve d'eau 0,5 % min 3 L, marge soupape, serie commerciale),
 POMPE (arbre / electrique / moteur serie IEC, NPSH a verifier), R290 charge max (limite 0,008 kg/m3 et
 25 % LFL, plus de bonus ventilation), DEGRES-HEURES (puissance clim en kW coherente, EN 16798-1),
 CHARGE rapide (majoration 20 % appliquee, latent occupants), TEWI (controles etancheite 5/50/500 tCO2e,
 Reglement UE 2024/573), SCOP (classes UE 811/2013 a 35 et 55 C, ligne EER supprimee, CO2 par pays).
 Page d'accueil : texte FR/EN mis a jour (nouveaux modules), compteur Sections 15 -> 28.
 Module : bloc <script id="audit29-module"> (surcharge les fonctions globales ; 77 blocs).
 Mise a jour : node add_audit29.js dist\index.html
 ETAPE 29b : onglet protocoles R290 : texte "charge max legale 500 g" remplace (selon le local, ~8 g/m3,
 EN 378-1) ; "selon F-Gas" retire du test d'etancheite. Mise a jour : node add_audit29b.js dist\index.html
 Relus sans correction : calcRefnet (references constructeur = donnees catalogue, non verifiables),
 calcSegmentPDC (viscosite fixee a 20 C), computeCriticalPath, fonctions conv* (cos phi 0,85 fixe).

ETAPE 30 : PROJET - CHAMBRE FROIDE (108 champs) et TRAITEMENT D'AIR (186 champs) enregistres dans le fichier
 projet .json (instantane des champs par identifiant) et restaures a l'ouverture (apres rechargement, via
 cle temporaire thermosys_pjpend_*). Seul le fichier meteo EPW n'est pas enregistre. Test aller-retour :
 293 champs et resultats identiques. Mise a jour : node add_proj.js dist\index.html puis
 node add_aide8.js dist\index.html (marqueur THERMOSYS-AIDE-V9).
 
ETAPE 31 : SITES INTERNATIONAUX - CHAMBRE FROIDE (T° moyennes mensuelles) et CHARGE PRO (latitude, altitude) :
 choix du PAYS puis de la VILLE (181 pays, 1 237 villes ; 1 233 avec 12 temperatures ; Israel retire a la demande, etape 31b). Donnees : normales
 1991-2020 calculees par build_cities.js (fichier lance sur le PC) depuis NOAA GHCN-Monthly v4 (domaine public),
 station la plus proche (rayon 25 km, 20 annees minimum par mois), station et distance affichees. Valeurs
 algeriennes deja verifiees conservees. Pays sans station fiable : saisie manuelle des 12 valeurs.
 Module : bloc <script id="cities31-module"> (+144 Ko ; surcharge crCityChange et cpCity ; 78 blocs).
 Textes mis a jour (accueil, aide, note imprimable) ; compteur Sections 28 -> 26.
 Mise a jour : node add_cities31.js dist\index.html (le catalogue est inclus dans l'installateur).
 ETAPE 31b : Israel retire du catalogue ; compteurs mis a jour. Mise a jour : node add_cities31b.js dist\index.html
 (add_cities31.js corrige integre deja ce retrait pour une installation neuve).
 Sources du catalogue : cities_data.json produit par node build_cities.js.

ETAPE 32 : TRAITEMENT D'AIR - complements (guide Word) : type de flux simple/double (simple flux : pas de
 recuperation), pompe a chaleur reversible rooftop (COP = COP nominal x (1+0,025(T-7)), borne 0,4-1,5, min 1 ;
 degivrage NON modelise), humidification adiabatique (enthalpie constante, rendement requis, alerte hygiene
 salle propre), filtres G4-F9 (100/120/140/180/210/240 Pa indicatifs), silencieux (perte de charge SEULE,
 acoustique non calculee), free-cooling modulant (air neuf min a 100 %, enthalpie ou temperature, 8760 h).
 Defauts inchanges (resultats identiques). Module <script id="airtreat-module"> remplace en place (78 blocs).
 Mise a jour : node add_airtreat32.js dist\index.html puis node add_aide32.js dist\index.html
 ETAPE 32b : note annuelle - free-cooling indique 'desactive (salle pharmaceutique / point de rosee / sans recyclage)' au lieu de 0 h ;
 reserve ajoutee : rechauffage d'ete compte avec le COP de la PAC (en realite recuperation condenseur) -> chaud annuel optimiste.
 Test Alger TMYx (confort) : free-cooling 5 337 h, -22 %. Mise a jour : node add_airtreat32b.js dist\index.html

ETAPE 33 : MESSAGES INTEGRES - 17 alert() et 7 confirm() du navigateur remplaces par des messages/confirmations
 integres (module <script id="dialogs33-module">, 79 blocs ; alert surchargee globalement ; confirm remplace dans
 cpGen, cpReset, pyReset, htReset, elReset, mcReset, pjImport). Echap = annuler. Aucun prompt() reel (faux positif :
 deferredPrompt.prompt() du bouton d'installation PWA). Mise a jour : node add_dialogs33.js dist\index.html
 ETAPE 34 (securite, 28/10/2026) : AUCUNE modification du code, verifications seulement.
 - check_rls.js (visiteur non connecte) : projects et profiles refuses (401). BON.
 - test_rls2.js (2 comptes de test, supprimes ensuite) : 10 controles sur 10 reussis (isolation des lignes, pas de
   lecture/modification/suppression/usurpation, pas de profils etrangers, pas d'auto-promotion admin, statut propre
   non modifiable). Tables couvertes : projects, profiles (a retester si une table est ajoutee).
 - api/ocr.js : connexion Supabase requise + statut approved/admin, origine thermosys-v3*.vercel.app, 40 demandes
   par 10 min et par utilisateur (compteur en memoire, indicatif), image max 8 Mo. Cle Gemini en forfait GRATUIT :
   pas de facture possible (a revoir si une carte bancaire est liee).
 - A NOTER : l'inscription est OUVERTE (tout nouveau compte est 'approved' automatiquement, approved_at vide).
   A revoir au lancement de l'offre payante. Mention a prevoir dans la politique de confidentialite : forfait
   gratuit Gemini = images possiblement utilisees par Google pour ameliorer ses services.

ETAPE 35 : DESENFUMAGE - audit des 3 modes (IT 246, EN 12101, NFPA 92). Formules du panache libre CORRECTES (debit
 massique 0,071 Qc^1/3 z^5/3 + 0,0018 Qc, hauteur de flamme 0,166 Qc^0,4, zone flamme 0,032 Qc^0,6 z, T, rho = 353/T).
 CORRECTIONS : (1) panache de paroi et de coin etaient calcules A L'ENVERS (debit superieur au panache libre : 31,3
 contre 22,1 kg/s pour Q = 5 MW, z = 5 m) ; methode des images : paroi = 1/2 x panache libre de 2Qc, coin = 1/4 x
 panache libre de 4Qc (resultats 16,2 et 12,3 kg/s) ; (2) panache de balcon : W et H sont maintenant SAISIS
 (avant : W = racine(S), H = hauteur du local), formule 0,36 (Q W^2)^1/3 (zb + 0,25 H), zb = z - H ; (3) libelle :
 la puissance saisie est la puissance TOTALE (70 % convectif applique ensuite). A CONFIRMER dans les textes en
 vigueur : fraction convective 70 %, formule du balcon (Q total ou convectif), regles IT 246 / DTR C3-41 (N, K, Cd).
 Module : bloc <script id="desen35-module"> (80 blocs). Mise a jour : node add_desen35.js dist\index.html

ETAPE 36 : VANNES - audit. Kv = Q racine(rho / (10 dP)) (Q m3/h, dP kPa, rho kg/m3) CORRECT ; autorite
 a = dPv / (dPv + dPreseau) CORRECTE. CORRECTIONS : (1) calcKvs : marge forfaitaire +30 % supprimee (un
 surdimensionnement degrade l'autorite) ; affichage du Kvs normalise superieur (serie R5), de la dP pleine ouverture
 et du rappel a >= 0,3 (0,5 recommande) ; (2) onglet PICV : "Conforme EN 215" retire (EN 215 = robinets thermostatiques
 de radiateurs, ne definit pas l'autorite), "PICV obligatoire RE2020" -> "recommande (equilibrage hydraulique)",
 "COP chute de 20-30 %" -> "le COP peut se degrader", "RT2025" retire des titres de l'onglet (cette appellation
 n'existe pas ; reste a nettoyer ailleurs dans l'application : autres occurrences, a verifier). Catalogue de vannes (Kvs, DN, PN)
 = donnees constructeur NON verifiables ici. Module : bloc <script id="vannes36-module"> (81 blocs).
 Mise a jour : node add_vannes36.js dist\index.html
 ETAPE 37 : VANNES - "RT2025" retire du titre, du sous-titre et du bouton PICV du module (le correctif de l'etape 36 ne
 couvrait que l'onglet Diagnostic). Bloc <script id="vannes37-module"> (82 blocs). Mise a jour : node add_vannes37.js dist\index.html
 ETAPE 38 : FLUIDES - audit. (1) colonne "T crit." contenait en fait les temperatures d'ebullition : corrigee (R32 78,1 C ;
 R134a 101,1 C ; R290 96,7 C ; R717 132,4 C ; R744 31,0 C) + colonne "T eb. 1 atm" ajoutee ; Pcrit des corps purs deja exactes ;
 (2) melanges (R410A, R407C, R404A, R454B, R448A) recalcules avec CoolProp, marques "~" (R454B reprenait les valeurs du R32) ;
 (3) statuts F-Gas et onglet F-Gas 2025 reecrits d'apres l'annexe IV du reglement UE 2024/573 (dates 2025 a 2035, 2050) :
 anciennes dates fausses retirees (R22 "2025", "2032 R32 seul autorise", "quotas -85 %", "R134a interdit neuf 2022") ;
 source = deux sites de synthese concordants, texte EUR-Lex NON consulte -> A CONFIRMER sur le texte officiel ;
 (4) huiles : Suniso 3GS = huile minerale naphtenique ISO 32 (pas alkylbenzene, pas pour les HFC) ; "SHR 46 BITZER" retire
 (inexistant au catalogue BITZER) ; colonne "T max" retiree (non verifiable) ; (5) GWP = valeurs AR4 (note ajoutee).
 Non verifie : compatibilites huile/fluide exactes (voir fiche du constructeur). Bloc <script id="fluides38-module"> (83 blocs).
 Mise a jour : node add_fluides38.js dist\index.html
 ETAPE 39 : CODES DEFAUT - audit partiel (845 codes, 37 marques). Entrees FAUSSES corrigees : Daikin A5, C9 (sonde air de
 reprise), L3 (echauffement coffret electrique, et non phase manquante) ; Mitsubishi E3/E4 (telecommande), P4 (sonde de condensats),
 U1/U2/U3 (haute pression, T refoulement, sonde refoulement : pas des defauts d'alimentation) ; LG CH03, CH04, CH05, CH06, CH07,
 CH10 (ventilateur interieur bloque), CH21 (DC peak/IPM), CH53, CH67 (ventilateur exterieur bloque) ; Panasonic H15, H16, H33, H38,
 F11, F17, F90. Sources : liste LG officielle (lg.com), listes Daikin/Mitsubishi de pickhvac.com (recoupees avec le manuel de
 service connu) ; Panasonic corrige d'apres les connaissances du manuel de service, NON recoupe en ligne. Bandeau de prudence
 ajoute sur la page. NON VERIFIE : toutes les autres marques (dont Condor, 72 codes, a faire verifier par M. Mouissat avec les
 manuels d'usine) et les series numeriques. Bloc <script id="codes39-module"> (84 blocs). Mise a jour : node add_codes39.js dist\index.html
 ETAPE 40 : CONVERTISSEUR - controle complet des 24 champs (temperature, puissance, pression, debit, electrique, dimensions) :
 TOUTES les conversions etaient exactes (1 kW = 3,412 kBTU/h ; 1 TR = 3,517 kW = 12 kBTU/h ; 1 HP = 745,7 W ; 1 bar = 14,5038 PSI ;
 GPM = gallon US). Ecart mineur corrige : facteurs de debit GPM/CFM rendus exacts (3,785411784 L ; 0,028316846592 m3).
 Point faible corrige : la section ELECTRIQUE supposait un cos phi de 0,85 sans le dire ; champ "cos phi" ajoute (defaut 0,85,
 valeur invalide ignoree) + notes de definition des unites sous les panneaux (cos phi, HP mecanique, TR, GPM/CFM, PSI rel/abs).
 Intensite = puissance / (racine(3) x 400 V x cos phi) en triphase, puissance / (230 V x cos phi) en monophase, sans rendement.
 Bloc <script id="convert40-module"> (85 blocs). Mise a jour : node add_convert40.js dist\index.html
 ETAPE 41 : LOTO (consignation) - audit du contenu technique. CORRECTIONS : (1) etape D4 : "L1-N, L2-N, L3-N (380-415 V)" etait faux
 (phase-neutre = 230 V) -> tensions entre phases 400 V +/-10 % et phase-neutre 230 V +/-10 % ; (2) VAT : "multimetre CAT III 1000 V
 (ex. Fluke 115)" faux (le Fluke 115 est CAT III 600 V) -> verificateur d'absence de tension (EN 61243-3) ou multimetre de
 categorie adaptee, test de l'appareil AVANT et APRES, mesure aussi entre phases ; (3) EPI froid : "gants EN ISO 11612" (chaleur/
 flamme) -> gants contre le froid EN 511 ; (4) "Minimum legal < 0,1 bar" et "duree de validite max 8 h" (non fondes) -> formules
 neutres (procedure du constructeur EN 378-4 ; duree fixee par le permis de travail) ; (5) essai d'etancheite : azote sec,
 jamais d'oxygene ni d'air comprime ; tirage au vide : valeur du constructeur (250 a 500 micron Hg typiquement) ; (6) fluides
 inflammables A2L/A3 (R32, R290) : consigne d'ignition/ventilation ajoutee a la recuperation ; (7) decharge variateur : delai
 indique sur l'appareil (5 a 15 min) ; (8) numeros de paragraphes de normes non verifiables retires (EN 60204-1 5.3.3/5.3.4,
 ISO 14118 5.2/5.3/6/7, NF C18-510 B.5) ; references EN 50110-1 / NF C18-510 ajoutees pour VAT, MALT/CC et deconsignation.
 NON VERIFIE : millesime "EN 378:2021" (utilise dans toute l'application, a verifier), texte integral de NF C18-510 (norme payante).
 La procedure est une AIDE : elle ne remplace pas les procedures de l'exploitant ni l'habilitation electrique du personnel.
 Bloc <script id="loto41-module"> (86 blocs). Mise a jour : node add_loto41.js dist\index.html
 ETAPE 42 : MAINTENANCE - audit des 7 listes de controle (split, VRF, chiller, rooftop, PAC, CTA, mise en service).
 CORRECTIONS : (1) "filtres EU4" (classe de l'ancienne EN 779, retiree) -> "G4 / ISO Coarse ou classe prevue" ; (2) CTA "remplacer
 filtres si dP>100 Pa" (seuil unique faux) -> perte de charge finale du fabricant (souvent 150-250 Pa en G4, 300-450 Pa en F7-F9) ;
 (3) "serpentin condenseur HP eau" (risque de coucher les ailettes) -> eau basse pression, sans plier les ailettes, hors tension ;
 (4) pressions seules -> pression + surchauffe + sous-refroidissement ; charge : pas d'appoint sans recherche de fuite ; mise en
 service : charge pesee puis surchauffe/sous-refroidissement ; (5) test d'etancheite : inscription au registre de l'equipement ;
 AJOUTS : section SECURITE (consignation LOTO + VAT) en tete des 6 listes de maintenance ; essai azote sec + tirage au vide en mise
 en service ; protection antigel (glycol, controleur de debit) sur chiller et PAC. DEFAUT CORRIGE : apres un changement de langue,
 le menu "Systeme" perdait l'option "Mise en service" (fonction de langue reconstruisant 6 systemes sur 7) - option restauree.
 Les listes sont des modeles generiques : les intervalles et valeurs limites du constructeur priment. Les textes de la liste
 restent sans accents dans les anciennes lignes (donnees d'origine). Bloc <script id="maint42-module"> (87 blocs).
 Mise a jour : node add_maint42.js dist\index.html
 ETAPE 43 : RE2020 - audit du module (9 onglets). CORRECTIONS : (1) seuils Ic construction 2025-2027 : collectif 490 -> 650,
 enseignement 560 -> 770 (maison 530 et bureaux 810 exacts), + paliers 2028 (475/580/710/680) et 2031 (415/490/600/590) ;
 Cep,nr moyen maison 55 / collectif 70 / bureaux 75 / enseignement 65 (63 secondaire) ; (2) colonnes "COP min PAC" et "SCOP min H1"
 et lignes "SCOP >= 4,0 / 3,8" retirees : la RE2020 ne fixe aucun SCOP/COP minimum ; "GWP < 750" retire (pas de limite de PRG dans
 la RE2020, voir F-Gas 2024/573) ; (3) type "Sante / Hopital" : pas de seuil moyen publie -> pas de verdict ; (4) "Verifier RE2020"
 et "Rapport audit" recalcules sur Ic et Cep,nr seulement (SCOP et GWP en information) ; (5) CALCULATEUR DEBIT CARRIER faux d'un
 facteur 3,6 : Q(m3/h) = P x 3,6 / (4,186 x dT) (100 kW, dT 5 K = 17,2 m3/h, et non 4,78) ; (6) CCN : terminaison 120 ohm selon la
 position physique sur le bus, pas selon l'adresse ; (7) test IPM/IGBT : diodes hautes (U/V/W vers P) et basses (N vers U/V/W),
 sens inverse en OL ; seuils UV/OT/PFC renvoyes a la fiche du module ; (8) normes : EN 15232 -> EN ISO 52120-1, ISO 10816 ->
 ISO 20816-3, "EN 14336:2019" et "EN 378:2021" sans millesime ; (9) listes d'audit reformulees (F-Gas, terre, variateur, Fernox).
 Fiches Carrier / CCN / IPM : bandeau "indicatif, a confirmer avec la notice du constructeur" (alarmes, points CCN, sondes NTC,
 pressostat non verifiables). Seuils RE2020 = valeurs moyennes (le seuil reel du projet est module). Bloc <script id="re2020-43-module">
 (88 blocs). Mise a jour : node add_re2020_43.js dist\index.html
 A FAIRE ENSUITE : amelioration de l'interface (resultats toujours visibles, hierarchie des chiffres, graphiques, PDF),
 puis paiement/TVA/CGV, nom de domaine, marque INAPI ; sauvegardes completes a la fin du projet.

A CHAQUE MISE A JOUR IMPORTANTE :
 - Refaire une copie datee ici
 - Mettre a jour ce README
 - Bien verifier la date du jour avant de nommer les fichiers
 - Rappel : compteur de connexions et auto-approbation = cote Supabase,
   pas dans ce fichier HTML.

A FAIRE AVANT TOUTE ANNONCE PUBLIQUE : depot de la marque THERMOSYS a l'INAPI
(classe 42).
====================================================================
