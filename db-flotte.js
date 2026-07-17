/* =====================================================================
   BASE DE DONNÉES — Calculateur de performances, Aéroclub de Haguenau
   =====================================================================

   Ce fichier est chargé par index.html via
   <script src="db-flotte.js"> et doit rester DANS LE MÊME DOSSIER que
   le fichier HTML. C'est un fichier .js (et non .json) volontairement :
   un vrai .json chargé par fetch() est bloqué par le navigateur quand
   l'outil est ouvert par double-clic (file://), alors qu'un <script src>
   fonctionne partout (double-clic ET serveur).

   Les sections "aircraft" et "airfields" sont écrites en JSON strict
   (clés et chaînes entre guillemets doubles, pas de commentaires) : leur
   contenu peut être copié tel quel dans un vrai .json si l'outil passe
   un jour en 100 % serveur. La section "icons" contient des SVG
   multi-lignes en template literals JS (illisibles une fois échappés en
   JSON), elle n'est donc pas JSON-compatible.

   ---------------------------------------------------------------------
   UNITÉS (convention du projet, ne pas normaliser) :
   distances en MÈTRES, altitudes en PIEDS (ft), vitesses en NŒUDS (kt),
   masses en kg, températures en °C, QFU en degrés magnétiques.

   ---------------------------------------------------------------------
   FORMAT D'UN AVION ("aircraft") :
   "cle_avion": {
     "name":           nom affiché dans le sélecteur,
     "mtow":           masse maxi au décollage (kg),
     "toFlaps":        volets décollage (texte affiché),
     "ldgFlaps":       volets atterrissage (texte affiché),
     "crosswindLimit": vent traversier démontré (kt), null si inconnu
                       (champ documentaire, non utilisé par le calcul),
     "ref":            condition de référence du manuel pour les perfos :
                       { "elevFt": altitude-pression, "tempC": température,
                         "headwindKt": vent de face (négatif = arrière) }.
                       PAS toujours niveau mer/ISA/vent nul : certains
                       manuels ne donnent qu'un exemple chiffré (WT9 LSA).
     "refDesc":        description de cette référence, affichée à l'écran,
     "takeoff"/"landing": par surface "paved" (revêtue) et "grass" (herbe),
                       { "roll": roulement m, "dist15": passage 15 m en m },
                       ou null si le manuel ne couvre pas cette surface
                       (l'outil bascule alors sur l'autre surface avec un
                       avertissement affiché),
     "source":         OBLIGATOIRE — citation du manuel de vol (section,
                       révision). Tout chiffre doit être traçable,
     "note":           facultatif — mise en garde affichée sur les cartes,
     "icon":           clé dans la section "icons" ci-dessous,
     "photo":          chemin relatif de la photo (espace encodé %20)
   }

   POUR AJOUTER UN AVION : dupliquer un bloc, remplir chaque champ depuis
   le manuel de vol (citer la section dans "source"), choisir une icône
   existante. Aucune modification du HTML n'est nécessaire.

   ---------------------------------------------------------------------
   FORMAT D'UN TERRAIN ("airfields") :
   "CODE_OACI": {
     "name":            libellé du sélecteur,
     "elevFt":          altitude du terrain (ft),
     "preferredRunway": facultatif — piste préférentielle,
     "preferredNote":   facultatif — motif affiché avec la suggestion,
     "runways": [   TABLEAU (l'ordre de déclaration = ordre d'affichage ;
                     en cas d'égalité de vent de face, la première déclarée
                     est suggérée) :
       { "num": numéro du seuil (ex "03" ; peut se répéter entre piste
         revêtue et piste en herbe, ex LFGA — le code identifie les pistes
         par leur position dans le tableau, pas par "num"),
         "recip": numéro du seuil opposé, "qfu": QFU magnétique (°),
         "surface": "paved"|"grass", "toda": distance décollage TODA (m),
         "lda": distance atterrissage LDA (m) ; 0 = manœuvre NON AUTORISÉE
         sur ce QFU (ex LFSB piste 07 : décollage seul, LDA absente de la
         VAC) — l'outil affiche alors un statut "interdit" }
     ],
     "source":          facultatif, documentaire — carte VAC citée (AMDT),
     "remarks":         facultatif, documentaire (non affiché) — statut du
                        terrain (usage restreint, PPR, CTR...), réserves
                        d'utilisation de certaines pistes
   }

   POUR AJOUTER UN TERRAIN : dupliquer le bloc LFSH avec les données de
   la carte VAC (AD-2) du terrain. Il apparaîtra dans le sélecteur.
   Les distances TODA/LDA sont celles du tableau de la carte VAC ;
   exception LFSB 15/33 : valeurs VFR avions <= 5,7 t des consignes
   particulières (TXT), plus pertinentes ici que la pleine piste.
   ===================================================================== */

window.PERF_DB = {

  "aircraft": {
    "wt9_ulm": {
      "name": "Dynamic WT9 (ULM)", "mtow": 525,
      "toFlaps": "15°", "ldgFlaps": "35°", "crosswindLimit": 24,
      "ref": { "elevFt": 0, "tempC": 15, "headwindKt": 0 },
      "refDesc": "niveau de la mer, ISA (15 °C), vent nul",
      "takeoff": { "paved": { "roll": 75, "dist15": 252 }, "grass": { "roll": 86, "dist15": 264 } },
      "landing": { "paved": { "roll": 75, "dist15": 263 }, "grass": { "roll": 84, "dist15": 272 } },
      "source": "Manuel de Vol WT9 Dynamic UL/Club §5.2.3 / §5.2.4, rév. 00 du 16/03/2016.",
      "icon": "wt9", "photo": "images%20avions/wt9_ulm.png"
    },
    "wt9_lsa": {
      "name": "Dynamic WT9 (LSA)", "mtow": 600,
      "toFlaps": "1 (15°)", "ldgFlaps": "2 (24°)", "crosswindLimit": 24,
      "ref": { "elevFt": 2000, "tempC": 15, "headwindKt": -2 },
      "refDesc": "altitude-pression 2 000 ft, 15 °C, vent arrière 2 kt (exemple du manuel)",
      "takeoff": { "paved": { "roll": 181, "dist15": 346 }, "grass": null },
      "landing": { "paved": { "roll": 156, "dist15": 527 }, "grass": null },
      "source": "Manuel de Vol WT9 LSA §5.4 / §5.7 — valeurs tirées de l'exemple chiffré fourni (pas d'abaque niveau mer/ISA disponible).",
      "note": "Référence dérivée d'un exemple du manuel, pas d'une donnée niveau mer/ISA pure : incertitude plus élevée que pour les autres avions.",
      "icon": "wt9", "photo": "images%20avions/wt9_lsa.png"
    },
    "ps28": {
      "name": "PS-28 Cruiser", "mtow": 600,
      "toFlaps": "12°", "ldgFlaps": "30°", "crosswindLimit": null,
      "ref": { "elevFt": 0, "tempC": 15, "headwindKt": 0 },
      "refDesc": "niveau de la mer, ISA (15 °C), vent nul",
      "takeoff": { "paved": { "roll": 141, "dist15": 387 }, "grass": { "roll": 214, "dist15": 457 } },
      "landing": { "paved": { "roll": 146, "dist15": 362 }, "grass": { "roll": 111, "dist15": 338 } },
      "source": "Manuel de Vol PS-28 Cruiser (PS-POH-1-1-12) §5.1 / §5.2.",
      "icon": "lowwing", "photo": "images%20avions/ps28.png"
    },
    "c172": {
      "name": "Cessna 172", "mtow": 1158,
      "toFlaps": "réf. manuel", "ldgFlaps": "réf. manuel", "crosswindLimit": null,
      "ref": { "elevFt": 0, "tempC": 15, "headwindKt": 0 },
      "refDesc": "niveau de la mer, ISA (15 °C), vent nul",
      "takeoff": { "paved": { "roll": 293, "dist15": 497 }, "grass": null },
      "landing": { "paved": { "roll": 175, "dist15": 407 }, "grass": null },
      "source": "Manuel de Vol Cessna 172, section Performances (extrait fourni).",
      "icon": "highwing", "photo": "images%20avions/c172.png"
    },
    "pa28": {
      "name": "PA-28-181 Archer III", "mtow": 1157,
      "toFlaps": "25°", "ldgFlaps": "40°", "crosswindLimit": null,
      "ref": { "elevFt": 0, "tempC": 15, "headwindKt": 0 },
      "refDesc": "niveau de la mer, ISA (15 °C), vent nul",
      "takeoff": { "paved": { "roll": 351, "dist15": 489.5 }, "grass": null },
      "landing": { "paved": { "roll": 280, "dist15": 427 }, "grass": null },
      "source": "Manuel de Vol Piper PA-28-181 Archer III, Section 5 Performances.",
      "icon": "lowwing", "photo": "images%20avions/pa28.png"
    },
    "tetras": {
      "name": "Tétras", "mtow": 515,
      "toFlaps": "réf. manuel", "ldgFlaps": "réf. manuel", "crosswindLimit": null,
      "ref": { "elevFt": 1000, "tempC": 15, "headwindKt": 0 },
      "refDesc": "altitude-pression 1 000 ft, 15 °C, vent nul, piste en herbe",
      "takeoff": { "paved": null, "grass": { "roll": 70, "dist15": 150 } },
      "landing": { "paved": null, "grass": { "roll": 70, "dist15": 210 } },
      "source": "Manuel de Vol Tétras §5.2.3 / §5.2.4.",
      "icon": "stol", "photo": "images%20avions/tetras.png"
    },
    "savannah": {
      "name": "ICP Savannah S", "mtow": 472.5,
      "toFlaps": "15°", "ldgFlaps": "réf. manuel", "crosswindLimit": null,
      "ref": { "elevFt": 0, "tempC": 15, "headwindKt": 0 },
      "refDesc": "niveau de la mer, ISA (15 °C), vent nul, surface dure",
      "takeoff": { "paved": { "roll": 35, "dist15": 70 }, "grass": null },
      "landing": { "paved": { "roll": 50, "dist15": 150 }, "grass": null },
      "source": "Manuel de Vol Savannah-S (SAV_S_POH) §6.1.",
      "note": "Distance de passage 15 m au décollage = roulage + 35 m, d'après une note du manuel (interprétation confirmée avec le pilote).",
      "icon": "highwing", "photo": "images%20avions/savanah.png"
    }
  },

  "airfields": {
    "LFSH": {
      "name": "Haguenau (LFSH)",
      "elevFt": 491,
      "preferredRunway": "03",
      "preferredNote": "QFU préférentiel bruit",
      "runways": [
        { "num": "03",  "recip": "21",  "qfu": 26,  "surface": "paved", "toda": 910, "lda": 775 },
        { "num": "21",  "recip": "03",  "qfu": 206, "surface": "paved", "toda": 805, "lda": 890 },
        { "num": "03L", "recip": "21R", "qfu": 26,  "surface": "grass", "toda": 877, "lda": 710 },
        { "num": "21R", "recip": "03L", "qfu": 206, "surface": "grass", "toda": 710, "lda": 877 }
      ],
      "source": "Carte VAC SIA AD-2 LFSH (AMDT 04/25)."
    },
    "LFST": {
      "name": "Strasbourg-Entzheim (LFST)",
      "elevFt": 505,
      "runways": [
        { "num": "05", "recip": "23", "qfu": 46,  "surface": "paved", "toda": 2695, "lda": 2400 },
        { "num": "23", "recip": "05", "qfu": 226, "surface": "paved", "toda": 2600, "lda": 2400 }
      ],
      "source": "Carte VAC SIA AD-2 LFST ATT 01 (AMDT 10/24), eAIP 09 JUL 2026.",
      "remarks": "CTR de classe D, clairance TWR obligatoire."
    },
    "LFGC": {
      "name": "Strasbourg-Neuhof (LFGC)",
      "elevFt": 459,
      "preferredRunway": "17L",
      "preferredNote": "QFU 173° préférentiel bruit",
      "runways": [
        { "num": "17L", "recip": "35R", "qfu": 173, "surface": "grass", "toda": 819, "lda": 647 },
        { "num": "35R", "recip": "17L", "qfu": 353, "surface": "grass", "toda": 819, "lda": 720 }
      ],
      "source": "Carte VAC SIA AD-2 LFGC ATT 01 (AMDT 13/24), eAIP 09 JUL 2026.",
      "remarks": "AD réservé aux ACFT munis de radio ; sous CTR Strasbourg au nord."
    },
    "LFGY": {
      "name": "Saint-Dié Remomeix (LFGY)",
      "elevFt": 1187,
      "runways": [
        { "num": "07", "recip": "25", "qfu": 67,  "surface": "paved", "toda": 870, "lda": 870 },
        { "num": "25", "recip": "07", "qfu": 247, "surface": "paved", "toda": 870, "lda": 870 }
      ],
      "source": "Carte VAC SIA AD-2 LFGY ATT 01 (AMDT 13/24), eAIP 09 JUL 2026."
    },
    "LFQY": {
      "name": "Saverne Steinbourg (LFQY)",
      "elevFt": 623,
      "runways": [
        { "num": "15", "recip": "33", "qfu": 151, "surface": "grass", "toda": 665, "lda": 665 },
        { "num": "33", "recip": "15", "qfu": 331, "surface": "grass", "toda": 665, "lda": 665 }
      ],
      "source": "Carte VAC SIA AD-2 LFQY ATT 01 (AMDT 05/26), eAIP 09 JUL 2026.",
      "remarks": "Usage restreint."
    },
    "LFQP": {
      "name": "Phalsbourg Bourscheid (LFQP)",
      "elevFt": 1018,
      "runways": [
        { "num": "06", "recip": "24", "qfu": 54,  "surface": "paved", "toda": 2502, "lda": 1203 },
        { "num": "24", "recip": "06", "qfu": 234, "surface": "paved", "toda": 2502, "lda": 2202 }
      ],
      "source": "Carte VAC DIRCAM AD-2 LFQP ATT 01 (AMDT 07/26), eAIP 09 JUL 2026.",
      "remarks": "Terrain militaire, usage restreint (PPR) ; seuil 06 décalé (LDA 1203 m)."
    },
    "LFGT": {
      "name": "Sarrebourg Buhl (LFGT)",
      "elevFt": 873,
      "runways": [
        { "num": "04",  "recip": "22",  "qfu": 40,  "surface": "paved", "toda": 744, "lda": 744 },
        { "num": "22",  "recip": "04",  "qfu": 220, "surface": "paved", "toda": 744, "lda": 744 },
        { "num": "04L", "recip": "22R", "qfu": 40,  "surface": "grass", "toda": 779, "lda": 779 },
        { "num": "22R", "recip": "04L", "qfu": 220, "surface": "grass", "toda": 779, "lda": 779 }
      ],
      "source": "Carte VAC SIA AD-2 LFGT ATT 01 (AMDT 08/26), eAIP 09 JUL 2026."
    },
    "LFQU": {
      "name": "Sarre-Union (LFQU)",
      "elevFt": 842,
      "runways": [
        { "num": "08",  "recip": "26",  "qfu": 80,  "surface": "paved", "toda": 900, "lda": 765 },
        { "num": "26",  "recip": "08",  "qfu": 260, "surface": "paved", "toda": 900, "lda": 900 },
        { "num": "08L", "recip": "26R", "qfu": 80,  "surface": "grass", "toda": 820, "lda": 670 },
        { "num": "26R", "recip": "08L", "qfu": 260, "surface": "grass", "toda": 670, "lda": 820 }
      ],
      "source": "Carte VAC SIA AD-2 LFQU ATT 01 (AMDT 01/26), eAIP 09 JUL 2026.",
      "remarks": "Usage restreint. TODA 26R réduite (670 m, renvoi (1) voir TXT 01 de la VAC)."
    },
    "LFGA": {
      "name": "Colmar Houssen (LFGA)",
      "elevFt": 627,
      "runways": [
        { "num": "01", "recip": "19", "qfu": 9,   "surface": "paved", "toda": 1610, "lda": 1400 },
        { "num": "19", "recip": "01", "qfu": 189, "surface": "paved", "toda": 1610, "lda": 1610 },
        { "num": "01", "recip": "19", "qfu": 9,   "surface": "grass", "toda": 950,  "lda": 750 },
        { "num": "19", "recip": "01", "qfu": 189, "surface": "grass", "toda": 950,  "lda": 750 }
      ],
      "source": "Carte VAC SIA AD-2 LFGA TXT 01 (AMDT 04/22, distances déclarées) et APP 01 (AMDT 13/24), eAIP 09 JUL 2026.",
      "remarks": "CTR/TWR Colmar. Piste non revêtue réservée (sauf raisons de sécurité) aux planeurs, remorqueurs et avions basés de la flotte CICVVA — voir VAC TXT 01."
    },
    "LFGB": {
      "name": "Mulhouse Habsheim (LFGB)",
      "elevFt": 789,
      "runways": [
        { "num": "02",  "recip": "20",  "qfu": 19,  "surface": "paved", "toda": 1000, "lda": 1000 },
        { "num": "20",  "recip": "02",  "qfu": 199, "surface": "paved", "toda": 1000, "lda": 925 },
        { "num": "02R", "recip": "20L", "qfu": 19,  "surface": "grass", "toda": 965,  "lda": 965 },
        { "num": "20L", "recip": "02R", "qfu": 199, "surface": "grass", "toda": 965,  "lda": 965 },
        { "num": "16",  "recip": "34",  "qfu": 159, "surface": "grass", "toda": 500,  "lda": 500 },
        { "num": "34",  "recip": "16",  "qfu": 339, "surface": "grass", "toda": 500,  "lda": 500 }
      ],
      "source": "Carte VAC SIA AD-2 LFGB ATT 01 (AMDT 01/26), eAIP 09 JUL 2026."
    },
    "LFSB": {
      "name": "Bâle-Mulhouse (LFSB)",
      "elevFt": 885,
      "runways": [
        { "num": "15", "recip": "33", "qfu": 152, "surface": "paved", "toda": 2470, "lda": 2370 },
        { "num": "33", "recip": "15", "qfu": 332, "surface": "paved", "toda": 2500, "lda": 2780 },
        { "num": "07", "recip": "25", "qfu": 74,  "surface": "paved", "toda": 1715, "lda": 0 },
        { "num": "25", "recip": "07", "qfu": 254, "surface": "paved", "toda": 1960, "lda": 1600 }
      ],
      "source": "Carte VAC SIA AD-2 LFSB ATT 01 (AMDT 06/26), eAIP 09 JUL 2026 ; pistes 15/33 : distances VFR avions <= 5,7 t (TKOF/LDG travers TWY G et E, LDG DTHR 33) des consignes particulières TXT.",
      "remarks": "CTR de classe D, clairance obligatoire. Piste 07 : décollage seulement (pas de LDA publiée). Pleine piste 15/33 : 3900 m (TODA 4000), réservée hors consignes VFR <= 5,7 t."
    }
  },

  /* Silhouettes SVG schématiques (vue de côté), non JSON-compatibles. */
  "icons": {
    lowwing: `<svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="120" cy="58" rx="95" ry="13" fill="currentColor"/>
    <polygon points="55,64 150,64 170,78 150,70 60,70" fill="currentColor"/>
    <polygon points="20,58 45,40 55,40 40,58" fill="currentColor"/>
    <polygon points="188,58 218,34 224,36 200,58" fill="currentColor"/>
    <rect x="205" y="30" width="4" height="26" fill="currentColor"/>
    <circle cx="100" cy="52" r="6" fill="#fff" opacity="0.6"/>
    <rect x="98" y="70" width="3" height="12" fill="currentColor"/>
    <rect x="150" y="70" width="3" height="12" fill="currentColor"/>
    <rect x="35" y="66" width="3" height="9" fill="currentColor"/>
    <circle cx="99.5" cy="83" r="4" fill="currentColor"/>
    <circle cx="151.5" cy="83" r="4" fill="currentColor"/>
    <circle cx="36.5" cy="76" r="3" fill="currentColor"/>
  </svg>`,
    highwing: `<svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="120" cy="60" rx="95" ry="13" fill="currentColor"/>
    <rect x="55" y="34" width="120" height="7" rx="2" fill="currentColor"/>
    <line x1="80" y1="41" x2="95" y2="62" stroke="currentColor" stroke-width="3"/>
    <line x1="150" y1="41" x2="140" y2="62" stroke="currentColor" stroke-width="3"/>
    <polygon points="20,60 45,42 55,42 40,60" fill="currentColor"/>
    <polygon points="188,60 220,32 226,34 200,60" fill="currentColor"/>
    <rect x="207" y="28" width="4" height="28" fill="currentColor"/>
    <circle cx="105" cy="54" r="6" fill="#fff" opacity="0.6"/>
    <rect x="98" y="72" width="3" height="12" fill="currentColor"/>
    <rect x="150" y="72" width="3" height="12" fill="currentColor"/>
    <rect x="35" y="68" width="3" height="9" fill="currentColor"/>
    <circle cx="99.5" cy="85" r="4" fill="currentColor"/>
    <circle cx="151.5" cy="85" r="4" fill="currentColor"/>
    <circle cx="36.5" cy="78" r="3" fill="currentColor"/>
  </svg>`,
    stol: `<svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 66 Q40 46 100 45 L205 55 Q216 57 216 62 L110 66 Q60 74 25 70 Z" fill="currentColor"/>
    <rect x="55" y="30" width="110" height="7" rx="2" fill="currentColor"/>
    <line x1="78" y1="37" x2="92" y2="58" stroke="currentColor" stroke-width="3"/>
    <line x1="140" y1="37" x2="132" y2="58" stroke="currentColor" stroke-width="3"/>
    <polygon points="20,66 40,44 50,44 36,66" fill="currentColor"/>
    <polygon points="195,58 218,36 224,38 202,58" fill="currentColor"/>
    <rect x="205" y="33" width="4" height="26" fill="currentColor"/>
    <circle cx="95" cy="52" r="6" fill="#fff" opacity="0.6"/>
    <rect x="90" y="66" width="3" height="16" fill="currentColor"/>
    <rect x="140" y="66" width="3" height="16" fill="currentColor"/>
    <rect x="30" y="66" width="3" height="7" fill="currentColor"/>
    <circle cx="91.5" cy="88" r="6" fill="currentColor"/>
    <circle cx="141.5" cy="88" r="6" fill="currentColor"/>
    <circle cx="31.5" cy="76" r="3" fill="currentColor"/>
  </svg>`,
    wt9: `<svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 60 Q20 50 60 48 L200 56 Q222 57 222 61 Q222 65 200 64 L60 68 Q20 66 15 60 Z" fill="currentColor"/>
    <polygon points="55,63 155,63 175,72 155,68 60,68" fill="currentColor"/>
    <polygon points="195,55 220,40 225,41 202,56" fill="currentColor"/>
    <rect x="212" y="38" width="10" height="4" fill="currentColor"/>
    <ellipse cx="95" cy="52" rx="16" ry="8" fill="#fff" opacity="0.65"/>
    <rect x="96" y="68" width="3" height="11" fill="currentColor"/>
    <rect x="148" y="68" width="3" height="11" fill="currentColor"/>
    <rect x="32" y="62" width="3" height="8" fill="currentColor"/>
    <circle cx="97.5" cy="80" r="3.5" fill="currentColor"/>
    <circle cx="149.5" cy="80" r="3.5" fill="currentColor"/>
    <circle cx="33.5" cy="71" r="3" fill="currentColor"/>
  </svg>`
  }
};
