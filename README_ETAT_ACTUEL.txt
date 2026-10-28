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
