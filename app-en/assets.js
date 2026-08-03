/* ============================================================================
   assets.js — Takeoff & Landing Perf (worldwide edition)
   ============================================================================

   Ce fichier est au dossier app-en/ ce que db-flotte.js est à l'outil français,
   moins la base de données. C'est délibéré : la version mondiale n'embarque
   AUCUNE performance avion ni AUCUNE piste. Le pilote saisit ses propres
   chiffres, relevés dans son propre manuel de vol. Ne jamais ajouter ici de
   données de performance ou d'aérodrome : ce serait republier des documents
   constructeur, exactement ce que cette version évite.

   Il ne reste donc que la décoration :

     quotes  — proverbes de hangar, traduits de db-flotte.js, tirés au hasard
               au chargement. Aucun rôle dans le calcul.
     icons   — silhouettes SVG schématiques vues de côté, servant d'illustration
               dans l'en-tête des cartes et de marqueur sur le schéma de piste.

   ATTENTION — les quatre SVG de "icons" sont recopiés OCTET POUR OCTET depuis
   db-flotte.js. buildRunwaySvg() retire la balise <svg> ouvrante par un
   .replace() sur la chaîne littérale exacte : reformater ne serait-ce qu'un
   espace de cette balise ferait échouer le remplacement et imbriquerait un
   <svg> dans un autre, sans erreur en console. Si tu retouches une silhouette,
   retouche l'intérieur, jamais la balise ouvrante.

   Chargé par <script src>, comme db-flotte.js et pour la même raison : un
   fetch() de JSON local est bloqué sous file://, un <script src> non.
   ========================================================================= */

window.APP_ASSETS = {

  /* Hangar wisdom: pilot proverbs (aviation folklore, house rewordings),
     drawn at random on each load. Traduites de PERF_DB.quotes. */
  "quotes": [
    "A good landing is one you walk away from. A great one is when the aircraft can be used again.",
    "Better to be down here wishing you were up there than up there wishing you were down here.",
    "The three most useless things in aviation: the fuel still in the truck, the runway behind you, and the altitude above you.",
    "The propeller is just a fan to keep the pilot cool. Proof: when it stops, the pilot starts sweating.",
    "Takeoff is optional. Landing is mandatory.",
    "There are old pilots and there are bold pilots, but there are very few old, bold pilots.",
    "A safety margin is worth nothing at all, right up to the day it is worth everything.",
    "Aviate, navigate, communicate. The coffee can wait for the hangar.",
    "The only truly dangerous cloud is the one with a mountain inside it.",
    "When in doubt, go around. Nobody has ever regretted a go-around."
  ],

  /* Silhouettes SVG schématiques (vue de côté), non JSON-compatibles.
     Recopiées à l'identique depuis db-flotte.js — voir l'avertissement en tête
     de fichier avant de toucher à la balise <svg> ouvrante. */
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
