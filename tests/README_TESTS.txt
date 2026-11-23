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
