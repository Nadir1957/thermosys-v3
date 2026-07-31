@echo off
echo === Suppression des fichiers vides (0 octet) ===
del /f "fix_orient.cjs" 2>nul
del /f "fix_lang_selects.cjs" 2>nul
del /f "trad_fluids.cjs" 2>nul
del /f "trad_tewi.cjs" 2>nul
del /f "trad_tewi2.cjs" 2>nul
del /f "trad_fluids_obs.cjs" 2>nul
del /f "trad_zones.cjs" 2>nul

echo === Suppression des doublons (1)(2)(3)(4) ===
del /f "inject2.cjs" 2>nul
del /f "inject2 (1).cjs" 2>nul
del /f "trad_zones (1).cjs" 2>nul
del /f "trad_zones (2).cjs" 2>nul
del /f "trad_zones (3).cjs" 2>nul
del /f "trad_zones (4).cjs" 2>nul
del /f "tz.cjs" 2>nul
del /f "tz (1).cjs" 2>nul
del /f "fix_lang_selects (1).cjs" 2>nul
del /f "fix_orient (1).cjs" 2>nul
del /f "trad_fluids (1).cjs" 2>nul
del /f "trad_tewi (1).cjs" 2>nul
del /f "trad_tewi2 (1).cjs" 2>nul
del /f "trad_fluids_obs (1).cjs" 2>nul
del /f "fix_remove_old_pdf_btn.cjs" 2>nul
del /f "fix_sync_chgtype_antype.cjs" 2>nul
del /f "fix_sync_chgtype_antype (1).cjs" 2>nul

echo === Suppression des patches obsoletes (remplaces par versions ulterieures) ===
del /f "trad_scop.cjs" 2>nul
del /f "trad_scop2.cjs" 2>nul
del /f "trad_scop3.cjs" 2>nul
del /f "fix_scop_complet.cjs" 2>nul
del /f "fix_scop4.cjs" 2>nul
del /f "fix_scop_results.cjs" 2>nul
del /f "fix_journal.cjs" 2>nul
del /f "fix_journal2.cjs" 2>nul
del /f "fix_journal3.cjs" 2>nul
del /f "fix_responsive.cjs" 2>nul
del /f "fix_cost_pays.cjs" 2>nul
del /f "disable_devtools_protection.cjs" 2>nul
del /f "disable_devtools2.cjs" 2>nul
del /f "fix_pdf_charge_pagebreak.cjs" 2>nul
del /f "fix_pdf_charge_params.cjs" 2>nul
del /f "fix_pdf_light_theme.cjs" 2>nul
del /f "fix_catalog_css.cjs" 2>nul
del /f "fix_catalog_grid.cjs" 2>nul
del /f "apply_all.cjs" 2>nul

echo.
echo === Nettoyage termine ===
dir *.cjs | find "fichier(s)"
