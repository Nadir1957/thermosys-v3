THERMOSYS - TESTS DE NON-REGRESSION DU MODULE "ESTIMATION HORAIRE"
==================================================================

A quoi ca sert
--------------
Verifier, en une commande, que le module horaire donne toujours les memes resultats
qu'au 23/11/2026 et qu'il reste proche d'EnergyPlus (logiciel de reference du
ministere americain de l'energie). Si une modification future degrade le calcul,
le test echoue AVANT le deploiement.

Comment l'utiliser
------------------
1) Placer les fichiers meteo (.epw, deja decompresses) dans le dossier  tests\meteo\ :
     - Alger      (DZA_AL_Algiers...TMYx...epw)
     - Ghardaia   (DZA_GR_Ghardaia-Noumerat-Zakaria...TMYx...epw)
     - Ouargla    (DZA_OG_Ouargla...TMYx...epw)
     - Denver     (USA_CO_Denver.Intl.AP.725650_TMY3.epw)
   Source : Climate.OneBuilding.Org. Les noms doivent contenir : Algiers, Ghardaia, Ouargla, Denver.
   Ces fichiers ne sont pas enregistres dans git (ils sont lourds).
2) Depuis le dossier files :
     node tests\hourly_regression.js
   (ou, pour tester un autre fichier :  node tests\hourly_regression.js chemin\index.html)

Ce qui est controle
-------------------
A) ASHRAE 140, cas 600 et 900 (Denver) : 8 resultats dans les fourchettes de reference.
B) 12 maisons types (3 variantes x 4 villes) :
   - les valeurs de l'application n'ont pas change de plus de 1 % ;
   - les ecarts avec EnergyPlus restent dans les fourchettes affichees dans l'application
     (chauffage +2 a +12 %, froid -3 a +6 %, pointe de chauffage -15 a +5 %, pointe de froid +2 a +14 %).
   Les cas ou EnergyPlus donne moins de 1000 kWh/an ne sont pas juges en pourcentage.

Codes de sortie : 0 = tout conforme ; 1 = au moins un echec ; 2 = fichier illisible ;
3 = meteo manquante (verification incomplete).

Quand mettre a jour les valeurs
-------------------------------
Si vous CHANGEZ volontairement le calcul (par exemple en ajoutant la convection interieure),
le test echouera : c'est normal. Il faut alors (1) comprendre l'ecart, (2) recalculer
EnergyPlus si besoin, (3) mettre a jour les tableaux dans hourly_regression.js ET l'avertissement
de l'application. Ne jamais modifier les valeurs juste pour faire passer le test.

Origine des chiffres EnergyPlus
-------------------------------
EnergyPlus 23.2, calcule le 23/11/2026, maison 10 x 8 x 2,7 m, memes donnees d'entree que l'application
(murs, toit, sol, fenetres, infiltration 0,5 vol/h, apports internes, regulation operative,
chauffage 20 C avec reduit 16 C de 23 h a 6 h, refroidissement 26 C).
Reglages d'EnergyPlus : convection exterieure DOE-2 (avec vent) sur murs et toit, rugosite moyenne,
terrain de type banlieue, sans indicateurs de pluie ; fenetres et convection interieure a coefficient fixe
(comme dans l'application). Avec les options par defaut d'EnergyPlus (convection interieure et des fenetres
calculee), le froid de l'application est plus eleve de 14 % dans un cas teste (Denver).
EnergyPlus n'est pas une mesure reelle : ce sont des comparaisons entre deux programmes.
Le fichier EnergyPlus a ete ecrit par nous et peut contenir des erreurs.

Les outils utilises sont dans  tests\energyplus\  (generateur de fichier EnergyPlus, lanceur Linux,
extraction des resultats). Ils servent a l'audit et ne sont pas necessaires pour lancer le test.
Exemple : python3 mkidf.py c.idf fixed=inwin epw_mean=<temperature moyenne annuelle du fichier meteo>
  variantes : wins=8 rins=10 (isolee) ; aw=3,8,3,3 wabs=0.3 rabs=0.3 (fenetres ouest, murs clairs)

Limites
-------
Ces tests ne remplacent pas une comparaison avec des mesures reelles en climat algerien.

=== MODULES ELECTRICITE ET CHAUFFAGE (23/11/2026) ===
Tests :   node tests\electricity_regression.js     (37 verifications : tables IEC 60364-5-52, facteurs, cas calcules a la main, formules)
          node tests\heating_regression.js         (22 verifications : formules EN 12831-1 methode simplifiee, sol EN ISO 13370)
Statut des references (rien n'est cache) :
 - Electricite : les tables PVC sont comparees a des reproductions publiques de l'IEC 60364-5-52 (Schneider, ecalpro) ; les tables PR/XLPE
   viennent de deux fabricants concordants (Prysmian, EUPEN). Le texte officiel de la norme (payant) n'a pas pu etre consulte.
 - Cas sans table sourcee (valeurs prudentes, signalees a l'ecran et dans la note imprimable) : aluminium PR/XLPE en modes A1 et A2 ;
   circuits monophases en PR/XLPE.
 - Facteur B.52.18, 16 circuits a 0,5 m : 0,68 (Prysmian). Schneider imprime 0,38 (faute de frappe evidente).
 - Chauffage : aucun exemple chiffre officiel EN 12831-1 gratuit trouve ; les tests recalculent les formules a la main (detection de derive,
   pas preuve de conformite).

=== RESEAU HYDRAULIQUE : COEFFICIENTS K (23/11/2026) ===
Test :  node tests\network_k_regression.js     (47 verifications : K par accessoire, f_T selon le diametre, perte de charge lineaire)
Reference : methode Crane TP-410 (K = n x f_T) reproduite par SimuPipe ; plausibilite contre Cengel & Cimbala (Purdue) et Neutrium.
Le texte de Crane TP-410 lui-meme n'a pas ete consulte. Ancien comportement : K fixes 0,9 (coude), 1,0 (te), 0,2 (vanne).
Constat : un K unique de 0,2 par vanne n'est valable que pour une vanne a opercule ou a boisseau ouverte ; une vanne globe vaut environ 6 a 10,
un clapet a battant environ 2. Limites connues non corrigees : viscosite et masse volumique fixes a 20 C ; vannes d'equilibrage/regulation,
filtres et echangeurs : saisir le K du fabricant (champ « K supplementaire »).

=== RESEAU HYDRAULIQUE : TEMPERATURE DU FLUIDE (23/11/2026) ===
Test :  node tests\network_k_regression.js     (maintenant 72 verifications : K, perte de charge lineaire, proprietes de l'eau selon la temperature)
Eau : masse volumique et viscosite selon la temperature, 0 a 100 C (tables au pas de 10 C de London South Bank University, Anton Paar d'apres
IAPWS 2008 et EngineersEdge, concordantes a 1,5 % pres ; interpolation lineaire pour rho, logarithmique pour mu).
Glycol : proprietes toujours fixees a 20 C (non corrigees) ; la base de calcul du pourcentage (masse ou volume) n'est pas precisee dans l'application
et reste a verifier ; les valeurs de viscosite actuelles (2,8 et 3,8 mPa.s a 20 C) semblent superieures a celles d'Engineering ToolBox (cote prudent).


[THERMOSYS_TEST_CYCLE_V1]
CYCLE FRIGORIFIQUE : node tests\cycle_regression.js
Compare 10 cas (R134a, R32, R290, R717, R1234yf, R410A, R404A, R407C, R600a) a des valeurs CoolProp 8.0.0 figees (tolerance 0,05 %),
verifie les identites du cycle (q0, travail, debit, COP), le glissement et le sens des variations.
Limite : les tables du module viennent de CoolProp ; ce test detecte les erreurs de transcription ou de formule, ce n'est pas une validation physique independante.


[THERMOSYS_TEST_REFRIGPIPE_V1]
TUYAUTERIE FRIGORIFIQUE : node tests\refrig_pipe_regression.js
Proprietes des 5 fluides comparees a CoolProp 8.0.0 ; epaisseurs ACR comparees a ASTM B280 (1/4 a 4-1/8 pouce) ; plages de vitesse comparees a McQuay, DuPont, Lennox, Opteon ;
160 cas recalcules (tube, vitesse, perte de charge par Colebrook-White). Non verifie : ASHRAE (non consulte), manuel Copeland (acces refuse).


[THERMOSYS_TEST_VASE_POMPE_V1]
VASE D'EXPANSION et POMPE / HMT : node tests\vase_pompe_regression.js
Densite de l'eau comparee a IAPWS-95 (CoolProp), dilatation comparee a Reflex/Flamco, formule du vase comparee a Reflex/Caleffi/Flamco, 120 cas recalcules, puissance de pompe exacte.
Non couvert : eau glycolee (le module suppose de l'eau pure), texte de la norme EN 12828 (non consulte).


[THERMOSYS_TEST_VASE_GLYCOL_V1]
VASE : eau glycolee ajoutee au test (node tests\vase_pompe_regression.js) : densites Melinder comparees a EngineeringToolBox (1-2 %), dilatation comparee a Reflex, cas de reference, limites de temperature.


[THERMOSYS_TEST_PDC_GLYCOL_V1]
EAU GLYCOLEE dans « Pertes de charge » et « Reseau » (node tests\glycol_pdc_regression.js) : interpolation comparee a CoolProp (viscosite <= 2 %), point de congelation, domaines, recalcul independant de la perte de charge (9 fluides x 4 temperatures x 3 cas), anciennes options inchangees. Un seul point publie independant (DOWCAL) ; propylene-glycol non compare a DOWFROST/ASHRAE ; les sources de viscosite different de 5 a 25 pour cent.


[THERMOSYS_TEST_MESH_V1]
RESEAU MAILLE (node tests\mesh_regression.js) : solveur compare a Hagen-Poiseuille (laminaire), a Swamee-Jain (turbulent), a un 2e solveur nodal independant sur 40 reseaux aleatoires, bilans de debit, fermeture des mailles, vitesse de convergence. Zone de transition 2000-4000 : continuite seulement (loi non verifiee). Proprietes du fluide fixes (non testees en temperature).


[THERMOSYS_TEST_MESH_GLYCOL_V1]
RESEAU MAILLE : choix du fluide selon la temperature ajoute au test (node tests\mesh_regression.js) : proprietes = tables Melinder / IAPWS, refus hors domaine, anciennes options g30/g40 inchangees, perte de charge du solveur comparee a Swamee-Jain. Memes limites que le test des pertes de charge (un seul point publie independant, propylene-glycol non compare a DOWFROST/ASHRAE).


[THERMOSYS_TEST_PSYCHRO_V1]
PSYCHROMETRIE (node tests\psychro_regression.js) : 140 etats compares a CoolProp (4 pressions, -10 a 50 C), psat (liquide : IAPWS ; glace : Murphy-Koop), pression selon l'altitude (atmosphere standard), coherence des modes de saisie, procedes (batterie, humidification, melange, vapeur), copies du moteur dans traitement d'air / calcul horaire / chambre froide. ECARTS CONNUS NON CORRIGES : gaz parfaits (teneur en eau 0,3 a 0,6 % trop basse, enthalpie jusqu'a 1,6 kJ/kg trop basse a 50 C sature) ; chambre froide : sous 0 C le point de rosee est un point de givre (calcule sur la glace, comme CoolProp ; ecart <= 0,01 K controle de -30 a 5 C ; l'ancienne mention de 3,7 K etait perimee).

tewi_regression.js : calcul TEWI (formule EN 378, 200 cas, 6 mutations), liste des PRG (AR4 / Reglement UE 517/2014, melanges recalcules), seuils F-gas 5/50/500 t. Les facteurs d'emission par pays ne sont PAS verifies (coherence seulement).
  Lancer : node tests\tewi_regression.js

heating_regression.js v2 : chauffage EN 12831 (methode classique 2003) : 53 verifications, 2e implementation independante, 300 locaux aleatoires, 14 mutations. Coefficients e et epsilon confrontes a l'implementation AixLib (tiers). Aucun exemple officiel de la norme n'a pu etre consulte ; l'edition 2017 n'est pas verifiee.
  Lancer : node tests\heating_regression.js

coldroom_regression.js : chambre froide (bilan frigorifique CR_ENGINE) : psychrometrie vs CoolProp, tableaux de renouvellement d'air ASHRAE (via Krack), chaleur du produit (Siebel), modele de porte, 2e implementation sur 200 chambres, 16 mutations. Non verifie : donnees des 40 produits, interface, cycle/tuyauterie/charge.
  Lancer : node tests\coldroom_regression.js

chargepro_regression.js : CHARGE PRO (moteur CLE) : conduction comparee a la solution analytique EN ISO 13786, geometrie solaire, ciel clair de Hottel, psychrometrie (CoolProp), conservation de l'energie en enceinte adiabatique, 18 mutations ; CHARGE (estimation rapide) recalculee a la main. NON verifie : comparaison avec un logiciel de reference (ASHRAE RTS/CLTD, EnergyPlus) ou un exemple publie, bibliotheques de materiaux et de vitrages, interface.
  Lancer : node tests\chargepro_regression.js

gaines_regression.js : gaines d'air (dimensionnement par la vitesse, diametre equivalent de Huebscher) : 73 verifications dont 25 mutations. Commande : node tests\gaines_regression.js

airtreat_regression.js : traitement d'air (moteur) : psychrometrie contre CoolProp (390 points), batterie / humidification / recuperateur / roue (bilans), debits EN 16798-1, cascade de pression, donnees ISO 14644-1 / EN 1822 / EN 13053, fichier EPW, energie annuelle : 124 verifications dont 37 mutations. Commande : node tests\airtreat_regression.js

scop_regression.js : SCOP / COP (estimation du SCOP, eta s, classe a 35 C du reglement 811/2013, energie, CO2, rentabilite PAC/gaz) : 90 verifications dont 35 mutations. Commande : node tests\scop_regression.js

vannes_regression.js : VANNES (Kvs, calculateur dP / debit, lecture du Kvs, avertissements du catalogue) : 133 verifications dont 35 mutations. Commande : node tests\vannes_regression.js

vannes_dh_regression.js : Confort ete / degres-heures (DH, seuils indicatifs, limites EN 16798-1) : 70 verifications dont 26 mutations. Commande : node tests\vannes_dh_regression.js

re2020_regression.js : RE2020 (seuils moyens Ic / Cep,nr, verification, rapport d'audit, debit Carrier, adresse CCN, volume R290) : 122 verifications dont 38 mutations. Commande : node tests\re2020_regression.js

acoustique_regression.js : calcul acoustique (niveau sonore a distance) : 31 verifications dont 21 mutations. Commande : node tests\acoustique_regression.js

validation_regression.js : page Validation et references (contenu, trois langues, absence de chiffre non mesure) : verifications automatiques. Commande : node tests\validation_regression.js

gaines_ef_regression.js : gaines a frottement constant (Colebrook, rugosite 0,0003 pi, air standard) : 2e implementation sur 400 cas, formule d ajustement usuelle, Huebscher, singularites, validations, rendu FR/EN/ES, 5 valeurs publiees du manuel ASHRAE Fundamentals (ecart de -1,0 a +3,5 %) ; 24 mutations. Commande : node tests\gaines_ef_regression.js

tewi_grid_regression.js : facteurs d emission du reseau par pays (50 pays contre le tableau AIE 2025, 21 contre Ember 2022-2025 pour 22 pays (cycle de vie). Commande : node tests\tewi_grid_regression.js

isolation_regression.js : calcul d epaisseur d isolant anti-condensation (point de rosee CoolProp, convection naturelle Churchill-Chu, bilan thermique, 2e methode) : suite complete et 26 mutations. Commande : node tests\isolation_regression.js

cop_lois_regression.js : lois de COP (pompe a chaleur air-air en chauffage, groupe froid en refroidissement) comparees aux tableaux publies de deux familles de rooftops Carrier (taille 36) et, pour l air-eau, a Wolf FHA et Stiebel Eltron WPL 25 : suite complete et 15 mutations (chauffage, froid, charge partielle). Commande : node tests\cop_lois_regression.js

heating_exemples_regression.js : chauffage EN 12831, exemples numeriques publies (326 W, 640 W, 305 W, 1507 W), rapport de logiciel DIN/TS 12831-1:2020 (ventilation du batiment 790 W pour 1580 W de locaux), tables e, epsilon, nmin (Univ. de Trieste), formules 2003 (SBZ), sol EN ISO 13370 : 42 verifications et 17 mutations. Commande : node tests\\heating_exemples_regression.js
heating_regression.js v3 : total du batiment avec la regle de zone 2017 (ventilation naturelle comptee a moitie des qu il y a plusieurs locaux), 60 batiments aleatoires, 18 mutations. Commande : node tests\\heating_regression.js

servomoteurs_regression.js : catalogue des servomoteurs, 15 fiches comparees aux fiches des fabricants (Belimo, Siemens, Danfoss, Honeywell), accessoire retire, 5 references non confirmees masquees, tableau Danfoss integre corrige : 198 verifications, 134 mutations tuees. Lancer : node tests\servomoteurs_regression.js

vannes_fiches_regression.js : catalogue des vannes, 31 vannes comparees aux fiches des fabricants (Danfoss, Belimo, Honeywell, IMI, Siemens), 3 corrections de references et de valeurs, 2 doublons retires, 22 vannes sans fiche masquees : 549 verifications, 160 mutations tuees. Lancer : node tests\vannes_fiches_regression.js

glycol_dow_regression.js : tableau eau glycolee compare a cinq sources publiees (guides Dow DOWFROST et DOWTHERM SR-1, fiche Tyfocor L, correlations MEGlobal, ajustements ASHRAE de CoolProp), viscosite et densite, avec ecarts maximaux admis : 114 verifications, 16 mutations tuees. Lancer : node tests\glycol_dow_regression.js

validation_cas_regression.js : page Validation, 10 cas de reference eau et eau glycolee (eau IAPWS, MEGlobal, Melinder) rejoues sur les moteurs, valeurs figees, mutations du tableau glycol : lancer node tests\validation_cas_regression.js

pdc_materiaux_regression.js : pertes de charge, 6 materiaux (rugosite DIN 1988-300, Moody, Buderus), Ø interieurs acier EN 10255, Colebrook-White exact contre un solveur independant, zone critique 2300-4000, 11 cas de reference rejoues, texte de calcPDC FR/EN, mutations : lancer node tests\pdc_materiaux_regression.js

coldroom_resp_regression.js : chambre froide, chaleur de respiration des produits (courbes du tableau 1 du USDA Handbook 66), mise a l'echelle, loi Q10 sans courbe, 7 cas de reference, calcul complet, mutations : lancer node tests\coldroom_resp_regression.js

gwp_source_regression.js : source des PRG (reglement UE 2024/573, annexe I) dans les textes FR/EN/ES et dans le dictionnaire espagnol ; plus aucune citation du 517/2014 comme source des valeurs.

scop_calibrage_regression.js : estimation du SCOP (facteur de climat compare a 7 fiches EN 14825 / Keymark, heures equivalentes du reglement 811/2013, classes energetiques, textes FR/EN/ES).

cop_tout_ou_rien_regression.js : groupe froid tout-ou-rien (formule EN 14825, Cc = 0,9) compare a deux groupes mesures (Schibuola et al., IBPSA 2013), branchement dans le calcul annuel, selecteur et textes FR/EN/ES ; 17 mutations. Commande : node tests\cop_tout_ou_rien_regression.js

airtreat_affichage_regression.js : traitement d air, refroidissement sensible d hiver calcule par le moteur et affiche, colonnes des etats de l air, etiquette du selecteur de COP, dictionnaire espagnol ; 10 mutations. Commande : node tests\airtreat_affichage_regression.js

airtreat_note_regression.js : note de dimensionnement du traitement d air, refroidissement sensible d hiver present en section 4 et dans le dictionnaire espagnol, bloc compile ; 4 mutations. Commande : node tests\airtreat_note_regression.js

print_header_regression.js : en-tete d impression (THERMOSYS, titre du module, date, adresse) en FR et EN, cache a l ecran, visible a l impression ; 8 mutations. Commande : node tests\print_header_regression.js

print_coldroom_regression.js : impression de la chambre froide, panneaux coupables entre deux pages (premiere page non vide) sans changer les autres modules ; 5 mutations. Commande : node tests\print_coldroom_regression.js
journal_init_en_regression.js : traduction anglaise du message de demarrage du journal, independante des chiffres (6 controles).
actionneurs_fiche_regression.js : fiches actionneurs, unite N/Nm correcte et plus de tirets ni pastilles vides sur les fiches masquees (10 controles).
aide_traitement_air_regression.js : AIDE rubrique 17, groupe froid selon la charge, refroidissement hiver et en-tete d'impression en FR/EN/ES (12 controles).
coldroom_ail_regression.js : chambre froide, ail a -2,7 C et pomme de terre a -1,7 C confirmes par des mesures publiees, texte de limites FR/EN/ES (9 controles).
prg_melanges_regression.js : PRG des melanges recalcules a partir des composants (annexe I, AR4), ecart avec les valeurs HFO du reglement, texte de limites FR/EN/ES.
voix_air_regression.js : lecture vocale du RAPPORT, module traitement d'air (COP selon la charge, refroidissement en hiver) en FR/EN/ES (8 controles).
accueil_comparaisons_regression.js : page d'accueil, section comparaisons de reference et limites du calcul horaire en FR/EN/ES, chiffres identiques a la page VALIDATION (32 controles).
climats_textes_regression.js : textes des six climats supplementaires (Paris, Madrid, Oslo, Singapour, Shanghai, Toluca ; 18 maisons) dans l'aide, la page VALIDATION et l'accueil, FR/EN/ES.
hourly_climats_regression.js : calcul horaire sur ces six climats, derive et ecart avec EnergyPlus 23.2 (fichiers meteo a placer dans tests\meteo ; exit 3 si absents).
ocr_modele_regression.js : OCR, modele Gemini reglable depuis Vercel (GEMINI_MODEL, GEMINI_API_VERSION), valeurs par defaut inchangees.
