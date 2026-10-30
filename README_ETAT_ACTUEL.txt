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
 ETAPE 44 : NORMES - audit des 29 fiches. CORRECTIONS : editions (EN 14825:2023 -> 2022 ; EN 378-3 -> A1:2021 ; EN 378-4 -> A1:2019 ;
 ISO 14118:2000 -> EN ISO 14118:2018 ; EN 12263:1998 sans A1:2018 ; NF C 15-100 sans millesime) ; EN 15232-1 -> EN ISO 52120-1:2022 ;
 EN 1037 signalee remplacee ; "NF EN 15623:2020" (inexistante, niveaux P1-P4 inventes) -> EN 13306:2017 ; F-Gas 517/2014 signale abroge,
 2024/573 avec echeances annexe IV (source : sites secondaires + EUR-Lex pour l'entree en vigueur 11/03/2024 ; A CONFIRMER sur EUR-Lex) ;
 machines 2006/42/CE -> reglement 2023/1230 (20/01/2027) ; ErP 2016/2281 reformule (206/2012 et 813/2013 pour les petits appareils) ;
 RE2020 : seuils etape 43. AFFIRMATIONS RETIREES : zones climatiques A-D (EN 14825 : moyen/froid/chaud), etiquette 2015/1095 (reference
 professionnelle), recuperation obligatoire >80 g, tarage HP 90 % PS, "8 etapes obligatoires" ISO 14118, ISO 9001 "certifie par les
 fabricants", GTB classe B >1000 m2 (EPBD : 70 kW en 2029), DTR C3-4 hors sujet, SONAHESS. LIBELLES sans valeur reglementaire simplifies :
 "RE2020 S.2025", "RE2020 Seuil 2025" (barre d'etat, pied de page, bouton d'accueil), "F-Gas 2025" (pastille et onglet FLUIDES),
 "EN 378:2021" -> "EN 378" (partout, y compris LOTO). Codes de normes traduits en anglais. Bloc <script id="normes-44-module"> (89 blocs).
 Mise a jour : node add_normes44.js dist\index.html
 RESTE A TRAITER : mentions "RT2025" (identifiant de page, commentaire), textes "RE2020 Seuil 2025" des fiches du CATALOGUE (a traiter dans
 l'audit Catalogue), audits Catalogue et Devis, codes defaut Condor (72) a comparer aux manuels d'usine, confirmation F-Gas sur EUR-Lex,
 villes (Nigeria, Irak, Afghanistan, Yemen).
 ETAPE 45 (27/10/2026) - CATALOGUE (audit) : 70 produits sur 80 avaient, dans le resume "Specifications techniques", des valeurs qui
 contredisaient le tableau "Donnees etendues" (poids, niveau sonore, dimensions, fluide/charge, EER/COP/SCOP, T° ambiante...). 227 lignes
 contradictoires du resume sont retirees (le detail est conserve). Allegations retirees : "RE2020 Seuil 2025 compatible", "MaPrimeRenov",
 etiquette RE2020 ; classes de filtre EU4/EN 779 converties en G4 (ISO Coarse)/M5/F7. Chaque fiche produit affiche un bandeau FR/EN
 "Donnees indicatives - a confirmer avec la fiche technique officielle du constructeur". Bloc <script id="catalogue-45-module"> (90 blocs).
 Mise a jour : node add_catalogue45.js dist\index.html
 RESTE A TRAITER (Catalogue) : valeurs des 12 produits Condor (co01-co12) a verifier avec les fiches techniques d'usine ; mentions
 "Fabrique en Algerie / IANOR / MCRE / SAV 48 wilayas" a confirmer ; donnees des autres marques a verifier avec les catalogues officiels.
 ETAPE 46 (28/10/2026) - DEVIS (audit) : (1) montants arrondis a l'entier pour toutes les devises : faux pour EUR/USD... (centimes) et
 KWD/BHD/OMR (3 decimales) ; decimales selon la devise (0 : DA, JPY, KRW ; 3 : KWD, BHD, OMR ; 2 : autres), arrondis coherents
 (HT, remise, TVA, TTC) a l'ecran et dans le PDF ; format de nombre FR/EN, espace avant le symbole (89,50 EUR). (2) remise et TVA bornees
 0-100, quantite >= 1, prix >= 0. (3) PDF : un devis de plus de ~25 lignes etait tronque (une seule page) -> PDF multi-pages, coupures
 entre les lignes. (4) nom du client/projet/site/reference echappes dans le PDF ; date affichee jj/mm/aaaa en FR.
 Bloc <script id="devis-46-module"> (91 blocs). Mise a jour : node add_devis46.js dist\index.html
 ETAPE 47 (29/10/2026) - SCOP / ENERGIE (audit). (1) TARIFS ALGERIE FAUX : "5,25 DA/kWh - tranche 0-125 kWh" ; le tarif CREG (decision
 D/22-15/CD, tarif 54 M, HT) est 1,78 / 4,18 / 4,81 / 5,48 DA/kWh ; defaut = tranche 3 (4,81). Prix du gaz de la rentabilite PAC/chaudiere : 2,2
 DA/kWh etait 6 fois trop eleve ; CREG 0,4025 DA/thermie (tranche 3) = 0,35 DA/kWh. (2) SCOP : le facteur de climat etait INVERSE (climat froid =
 SCOP plus eleve : 0,83 a Dubai, 0,99 a Reykjavik) ; corrige : facteur = 1 - 0,10 x (HDD-2900)/1000 (borne 0,80-1,25), estimation +-15 %,
 champ optionnel "SCOP fiche (EN 14825)" ajoute. (3) classe energetique : plus de classe a 55 C (calculee avec le SCOP a 35 C) ; classe a 35 C seule.
 (4) ROI PAC/gaz : un gain annuel negatif donnait "investissement rentable" ; corrige (message, devise du pays, prix du gaz et couts d'installation a
 saisir hors Algerie). (5) entrees controlees (COP 1,5-8, capacite > 0, EER 1-12, heures 1-8760). Bloc <script id="scop-47-module"> (92 blocs).
 Mise a jour : node add_scop47.js dist\index.html
 RESTE A TRAITER (SCOP) : facteurs CO2 (Algerie 0,587 et France 0,084 kg/kWh) a sourcer ; tarifs de ~190 pays a verifier (une soixantaine sont
 une moyenne internationale 0,15 USD) ; methode des bins EN 14825 complete a envisager.
 ETAPE 48 (29/10/2026) - RESEAUX HVAC (audit, 1re partie). VERIFIE JUSTE : debit/diametre (Q = P/(4186 dT)), pertes de charge (Swamee-Jain, 64/Re),
 collecteur, acoustique (Lp = Lw - 20 log r - 11 ou - 8), point de rosee (recalcule independamment : 6,3 mm), diametre equivalent des gaines
 rectangulaires, proprietes des 5 fluides frigorigenes (comparees a CoolProp : masses volumiques de vapeur, viscosites et pentes de saturation
 exactes ; chaleur massique utile et masse volumique liquide correspondent a un liquide sous-refroidi de 5 a 8 K). CORRIGE : (1) SEPARATEUR : le
 "volume min (temps de sejour >= 3 s)" etait faux (60 L = 10,8 s a 20 m3/h) ; maintenant volume reel du corps (diametre x 3 diametres) et temps de
 sejour, DN normalises ; (2) GAINES : la plage de vitesse etait testee sur la vitesse saisie, pas sur la vitesse reelle avec le diametre
 normalise ; (3) PERTES DE CHARGE : regime 2300-4000 etiquete "laminaire" -> "transitoire" ; hypotheses affichees (acier lisse, 20 C, sans singularites) ;
 (4) DEBIT / SEPARATEUR / COLLECTEUR : DN normalises (le collecteur arrondissait par 25 mm), au-dela de DN1000 message ; (5) frigo : sous-refroidissement
 indique ; (6) point de rosee : rappel de la marge de securite. Bloc <script id="hydraulique-48-module"> (93 blocs).
 Mise a jour : node add_hydraulique48.js dist\index.html
 RESTE A TRAITER (RESEAUX HVAC) : Refnet (distribution Daikin/..), Calcul reseau (cloud, SVG), Guide de prereglage (deja audite etape 36), tubes ACR
 hors dimensions (DN > 104,78 mm), singularites dans les pertes de charge.
 ETAPE 49 (30/10/2026) - RESEAUX HVAC (audit, fin) : REFNET : tables par marque avec sources documentees dans l'outil ; seuils Daikin (VRV IV) et
 Mitsubishi (City Multi Y) conformes a ma connaissance, autres marques non verifiables sans les documents constructeur (avertissement deja
 affiche) -> AUCUNE modification. CALCUL RESEAU : chemin critique (somme maximale racine-feuille) verifie par recalcul independant (A+C+D = 182 725 Pa,
 HMT 18,63 m, +10 % = 20,49 m) ; corrections : (1) HMT calculee avec la masse volumique du fluide (elle utilisait 1000 kg/m3 pour tous) ; (2) hypotheses
 affichees (K coude 0,9 / te 1,0 / vanne 0,2, 20 C, reseau a saisir aller ET retour, equipements exclus). Bloc <script id="reseau-49-module">
 (94 blocs). Mise a jour : node add_reseau49.js dist\index.html
 ETAPE 50 (30/10/2026) - CHARGE (audit) : estimation rapide de charge frigorifique. Agregation et air neuf verifies (justes). Corrections : apports
 solaires recalibres (50/150/250/400 W par m2 de vitrage, ancien 0/30/60/90 : sous-estimation) ; champ "Equipements + eclairage" ; latent des
 personnes (55 W) ajoute ; ratio W/m2 affiche avec alerte si anormalement bas en climat chaud ; hypotheses affichees (vitrage 15 %, +/-30 %).
 Exemple 100 m2 : 7,33 kW (73 W/m2) au lieu de ~3,9 kW (39 W/m2). Bloc <script id="charge-50-module"> (95 blocs). Mise a jour : node add_charge50.js dist\index.html
 RESTE A TRAITER : vitrage 15 % fixe (a rendre saisissable), bilan complet = CHARGE PRO.
 ETAPE 51 (30/10/2026) - CHARGE PRO et CHAUFFAGE (audit, AUCUNE modification de code) : CHARGE PRO : moteur testes par cas physiques (paroi en regime
 permanent, conservation de l'energie des gains internes, air neuf sensible et latent = valeurs theoriques a 0,5 %, ciel clair ~815 W/m2 direct a midi en juillet
 a 36,7 N, profil horaire ASHRAE) -> justes. CHAUFFAGE (EN 12831 simplifiee) : transmission, ponts thermiques, sol EN ISO 13370 (f_g1 1,45), infiltration
 2.V.n50.e.eps, rho.cp 0,34, ventilation double flux recalcules a la main -> justes. Pas d'installateur, pas de nouveau bloc (95).
 RESTE A TRAITER : temperatures de base et annexe nationale a verifier par pays (deja signale dans l'outil).
 ETAPE 52 (30/10/2026) - PSYCHRO, ELECTRICITE, MECATRONIQUE (audit, AUCUNE modification de code) : PSYCHRO : proprietes de l'air humide comparees a CoolProp
 sur 28 etats (-10 a 45 C, 10 a 80 % HR) : ecart max W 0,56 %, h 0,63 kJ/kg, v 0,07 %, point de rosee 0,015 K, temp. humide 0,024 K ; bilan chaleur/eau des procedes
 correct. ELECTRICITE : tables IEC 60364-5-52 (PVC cuivre/alu) verifiees, chute de tension, court-circuit (k), Isc mini TN (UTE C 15-105), PE et neutre corrects ;
 isolant XLPE derive des tables PVC (rapport 1,22, prudent, deja signale). MECATRONIQUE : Pt100 IEC 60751, zones ISO 10816-3, NAMUR NE43, lois des ventilateurs,
 vibrations (deplacement/acceleration -> vitesse efficace) corrects. Pas d'installateur, pas de nouveau bloc (95).
 RESTE A TRAITER : couples de servomoteurs de volets (valeurs guides, a confirmer avec le constructeur), XLPE a remplacer par la table B.52.5 si disponible.
 ETAPE 53 (30/10/2026) - ACCUEIL (audit) : compteurs verifies (80 equipements, 50 constructeurs du lecteur de codes, 29 normes, 28 sections) ; phrase inexacte
 corrigee : "toutes vos donnees sont traitees localement / aucune connexion internet permanente" -> les calculs sont locaux ; seules la connexion au compte
 (Supabase) et l'OCR (image envoyee a un service d'IA) utilisent internet ; renvoi a la politique de confidentialite (FR/EN). Remplacement de texte dans la page,
 pas de nouveau bloc (95). Mise a jour : node add_accueil53.js dist\index.html
 RESTE A TRAITER : modules OBD, Bluetooth, OCR, Historique, Aide, Contact ; codes defauts (72 Condor et autres marques).
 ETAPE 54 (30/10/2026) - CODES DEFAUTS (audit partiel) : base de 845 codes, 37 marques, 72 Condor. Gree : H3, H4, H5, H7 (split) contredisaient la plateforme Gree
 utilisee dans les entrees Condor (pressostats au lieu de surcharge compresseur / IPM / decrochage) -> corriges ; liste des marques revues (note orange) : Daikin,
 Mitsubishi, LG, Panasonic, Gree (en partie). Modification du bloc <script id="codes39-module"> (95 blocs). Mise a jour : node add_codes54.js dist\index.html
 A CONFIRMER PAR NADIR (Condor) : les mentions "technologie Hisense partenaire depuis 2022", "OEM TICA confirme", "plateforme Gree" des 72 entrees Condor ; codes marques
 "non confirme" (P0, P1, P2, P5). RESTE A TRAITER : Midea, Hisense, Samsung, Toshiba, Hitachi, Carrier, Trane... a verifier avec les manuels de service.
 ETAPE 55 (30/10/2026) - AIDE et CONTACT (audit) : Contact conforme (adresse e-mail, site). Aide : 5 affirmations inexactes corrigees (FR/EN) : "38 normes actives" -> 29 ;
 "80 equipements de 50 constructeurs" -> 38 constructeurs dans le catalogue ; "F-Gas 517/2014 revision 2024" -> reglement (UE) 2024/573 ; "codes defaut sources et verifies
 contre la documentation constructeur officielle" (faux) -> base indicative sur 37 marques, a confirmer avec le manuel de service ; "calcul des deperditions" (module CHARGE)
 -> renvoi au module CHAUFFAGE. Remplacement de texte dans la page, pas de nouveau bloc (95). Mise a jour : node add_aide55.js dist\index.html
 RESTE A TRAITER : OBD, Bluetooth, OCR, Historique (modules d'accompagnement) ; codes defaut des autres marques ; "Gemini 2.5 Flash" a confirmer cote serveur (API_PROXY).
 ETAPE 56 (30/10/2026) - AUDIT DES MODULES D'ACCOMPAGNEMENT + PAGE VALIDATION. OBD et Bluetooth : pages masquees (materiel requis), rien a corriger ; OCR et
 Historique : conformes (mention "WEBP" de la zone de depot absente de l'aide : mineur). NOUVEAU : onglet VALIDATION (page pg-validation, bloc <script id="validation-56-module">,
 96 blocs) : 26 cas de reference rejoues a chaque ouverture sur les moteurs PSY, HEAT, ELEC, MECH, CLE ; sources independantes : CoolProp 8.0, IEC 60751, IEC 60364-5-52/-5-54,
 ISO 2533, calculs manuels EN 12831 ; tolerance et ecart affiches, ligne rouge si ecart, bilingue. Fonction window.valResults() (essais automatisables).
 Mise a jour : node add_validation56.js dist\index.html (verify_js_syntax : 96 blocs).
 PROCHAINE ETAPE : notes de calcul (hypotheses, formules, normes, limites, version) par module ; puis ouverture internationale (ASHRAE, unites imperiales partout, langues).
 RESTE A TRAITER : ajouter des cas de reference pour les modules DOM (CHARGE rapide, RESEAUX, SCOP, FLUIDES, CHAMBRE FROIDE, TRAITEMENT D'AIR).
 ETAPE 57 (30/10/2026) - VALIDATION (correction anglais) : en EN, les rubriques CHAUFFAGE / ELECTRICITE / MECATRONIQUE, les sources (Calcul manuel, Formule, Lineaire...),
 l'unite "mm/s eff." et la ligne de version restaient en francais -> traduits (HEATING, ELECTRICAL, MECHATRONICS, Manual calculation, rms, step 56). Le bloc
 validation-56-module est remplace (96 blocs). Mise a jour : node add_validation57.js dist\index.html
 ETAPE 58 (30/10/2026) - NOTES DE CALCUL : bouton "Note de calcul" ajoute sous le resultat de 16 calculateurs rapides qui n'avaient pas de note : CHARGE (rapide, air neuf),
 FLUIDES (TEWI), SCOP (SCOP, cout, ROI), VANNES (Kvs), RESEAUX (debit, pertes de charge, pompe, vase, separateur, collecteur, gaines, frigorifique), DESENFUMAGE. La note
 s'ouvre dans une fenetre imprimable/PDF : projet, client, site, auteur (onglet PROJET), date, version ; 1 donnees d'entree (libelles et valeurs lus a l'ecran) ; 2 resultats ;
 3 methode et formules ; 4 normes et references ; 5 limites et hypotheses ; avertissement de pre-dimensionnement. Bilingue FR/EN. Bloc <script id="notes-58-module"> (97 blocs).
 Mise a jour : node add_notes58.js dist\index.html (verify_js_syntax : 97 blocs).
 DEJA AVEC NOTE : CHARGE PRO, PSYCHRO, CHAUFFAGE, ELECTRICITE, MECATRONIQUE, CHAMBRE FROIDE, TRAITEMENT D'AIR, DEVIS, LOTO, MAINTENANCE, RESEAU RAMIFIE, PROJET (PDF combine).
 RESTE A TRAITER : inclure ces nouvelles notes dans le PDF combine du module PROJET ; notes pour RE2020, repartiteur Refnet, point de rosee / isolation.
 PROCHAINE ETAPE : ouverture internationale (referentiel ASHRAE 90.1/62.1/15, unites imperiales partout, langues es/ar/pt).
 ETAPE 59 (30/10/2026) - OUVERTURE INTERNATIONALE (1/3) : NORMES. 21 references americaines et internationales ajoutees a la page NORMES (29 -> 50) : ASHRAE 62.1, 55, 169, 52.2 ;
 NFPA 70 (NEC), 90A, 92 ; UL 60335-2-40 ; AHRI 210/240 (SEER2/HSPF2), 550/590 ; ISO 817, 7730, 14644-1, 16890-1, 20816-3 ; IEC 60751 ; EN 16798-1, 12831-1, 12828 ;
 AIM Act (USA, reduction HFC de 85 % en 2036, base 2011-2013) ; Amendement de Kigali (calendrier par groupe de pays, a verifier pays par pays). Editions des normes
 americaines a confirmer selon la juridiction. Compteur de l'Accueil et de l'Aide passes a 50. Bloc <script id="normes-59-module"> (98 blocs). Mise a jour : node add_normes59.js dist\index.html
 (verify_js_syntax : 98 blocs).
 ETAPE 60 (30/10/2026) - OUVERTURE INTERNATIONALE (2/3) : AIM ACT dans FLUIDES. Nouveau panneau "AIM ACT (USA)" sous le F-Gas (onglet F-GAS de la page FLUIDES), FR/EN :
 calendrier de reduction des HFC (90 % 2022-2023, 60 % 2024-2028, 30 % 2029-2033, 20 % 2034-2035, 15 % des 2036, base 2011-2013, GWP AR4), regle EPA des transitions
 technologiques (splits/PAC residentiels et petit commercial : GWP < 700, fabrication 2025 / installation 2026 ; VRF : 2026 / 2027), verificateur rapide de fluide (R410A,
 R32, R454B, R290, R134a, R407C, R404A, R1234yf), rappel reparation des fuites (seuil ~15 lb). Indicatif hors USA ; echeances a confirmer sur les textes EPA.
 ETAPE 60 (suite) - CORRECTIFS ANGLAIS : menu du haut (ACCUEIL, CATALOGUE, DEVIS, JOURNAL, FLUIDES, VANNES, RESEAUX, NORMES, CHAUFFAGE, ELECTRICITE,
 MECATRONIQUE, PROJET, AIDE...) traduit en mode EN et restaure en FR ; libelles de formulaire (CHAUFFAGE, MECATRONIQUE) rebascules apres redessin ; etiquettes des normes
 et titres FR en EN ; 124 causes de codes de defaut traduites ; compteur 29 -> 50 dans le journal ; quelques libelles (placeholder, free-cooling, orientation Sud).
 Blocs <script id="aim-60-module"> et <script id="i18n-60-module"> (100 blocs). Mise a jour : node add_aim60.js dist\index.html (verify_js_syntax : 100 blocs).
 ETAPE 61 (30/10/2026) - CHAUFFAGE : les noms de pieces par defaut (Sejour/salon, Chambre, Salle de bains...) suivent la langue (FR/EN), y compris l'exemple;
 un nom saisi par l'utilisateur n'est jamais modifie. Pas de nouveau bloc (100 blocs). Mise a jour : node add_heat61.js dist\index.html.
 ETAPE 62 (30/10/2026) - OUVERTURE INTERNATIONALE (3/3, partie 1) : UNITES IMPERIALES dans FLUIDES et CHARGE (bouton SI / Imperial, calculs inchanges en SI).
 CHARGE : champs de saisie avec conversion (ft2, ft, Btu/h, degF), resultats en Btu/h (valeur dupliquee du calcul retiree en imperial), air neuf en CFM.
 FLUIDES : capacite (Btu/h et TR), charge (lb), tableau des refrigerants avec T crit. et T eb. en degF et P crit. en psia. Les masses de CO2eq du TEWI restent en kg/t (usage international).
 Correctif : boucle de rafraichissement infinie du tableau des refrigerants (ancienne etape 38, ~1500 mises a jour/s) supprimee; en-tete 'Use' en anglais.
 Bloc <script id="units-62-module"> (101 blocs). Mise a jour : node add_units62.js dist\index.html (verify_js_syntax : 101 blocs).
 ETAPE 63 (30/10/2026) - FLUIDES (correctif de l'etape 62) : le tableau des refrigerants ne defile plus en interne en imperial (premiere ligne R410A cachee sous l'en-tete),
 valeurs converties sur une seule ligne ; l'onglet F-GAS n'est plus converti en imperial (ses textes etaient reecrits en continu). Pas de nouveau bloc (101 blocs). Mise a jour : node add_units63.js dist\index.html.
 ETAPE 64 (30/10/2026) - OUVERTURE INTERNATIONALE (3/3, partie 2) : UNITES IMPERIALES dans RESEAUX (bouton SI / Imperial, calculs inchanges en SI).
 Conversions propres a l'hydraulique : debits d'eau en gpm (m3/h x 4,403 ; L/s x 15,85), vitesses en ft/s, pertes de charge en psi et psi/ft, HMT en ft.wg,
 volumes en gal, Kv -> Cv (x 1,156), DN -> NPS, puissances de pompe en hp; air des gaines en CFM / fpm / in.wg; delta de temperature x 1,8 (sans decalage de 32).
 Bulles de conversion a cote des champs de saisie et resultats de tous les onglets (debit, pertes de charge, pompe, vase, separateur, collecteur, prereglage,
 gaines, tuyauterie frigo, calcul reseau, acoustique, point de rosee). Bloc <script id="units-64-module"> (102 blocs).
 Mise a jour : node add_units64.js dist\index.html (verify_js_syntax : 102 blocs).
 PROCHAINES ETAPES : unites imperiales dans SCOP/COP et VANNES ; referentiel de calcul selectionnable (Europe / ASHRAE) ; langues es/ar/pt.
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
