# Takeoff & Landing Perf — version mondiale pour le Play Store

> **Statut : plan validé le 3 août 2026, aucun code écrit à ce jour.**
> Ce fichier est la feuille de route de la branche `applitel`. Il est chargé
> automatiquement au démarrage de toute session Claude Code travaillant dans
> `app-en/`. Le CLAUDE.md de la racine décrit l'outil français, qui reste la
> référence pour le moteur de calcul : les deux se lisent ensemble.

## Context

Perf Avions est aujourd'hui un calculateur de performances taillé pour l'Aéroclub de Haguenau : sept avions et une trentaine de terrains alsaciens transcrits à la main depuis les manuels de vol et les cartes VAC du SIA. Cette base est précisément ce qui empêche une diffusion mondiale : republier des chiffres issus de manuels constructeurs expose à des réclamations, et les données sont de toute façon inutiles à un pilote qui n'est pas du club.

L'objectif est donc une seconde application, dérivée du même moteur de calcul et du même habillage cockpit, mais **sans aucune donnée embarquée** : le pilote saisit lui-même les performances de son avion et les caractéristiques de sa piste, en anglais, avec un choix d'unités métriques ou impériales. Elle sera empaquetée avec Capacitor et publiée sur le Google Play Store.

L'outil français reste intact et continue de vivre sa vie sur `main`.

## Décisions arrêtées

| Sujet | Choix |
|---|---|
| Nom Play Store | **Takeoff & Landing Perf** |
| Package ID (définitif) | **`app.perfavions.runwayperf`** |
| Langue | Anglais uniquement |
| Données | Aucune base embarquée, saisie manuelle à usage unique, dernière saisie mémorisée |
| Fiche avion | Minimale : roulement + distance 15 m, décollage et atterrissage |
| Unités | Un interrupteur global **Metric / Imperial** (m↔ft, °C↔°F, hPa↔inHg) ; altitudes toujours en pieds ; vent toujours en nœuds |
| METAR | Conservé (VATSIM, couverture mondiale) |
| Horloge jour/nuit | Conservée, latitude/longitude saisies à la main (facultatives) |
| Juridique | Écran d'acceptation au premier lancement + disclaimer permanent |
| Confidentialité | `privacy.html` rédigé et hébergé sur Vercel |
| Bouton café | Conservé tel quel, ouvert dans le navigateur externe |
| Organisation | Sous-dossier `app-en/` sur la branche `applitel` |
| Visuel | Identique à l'actuel (cockpit sombre, instruments SVG) |
| Conditions de référence | Imposées à 0 ft / 15 °C / sans vent, avec avertissement appuyé (voir Étape 1) |

## Arborescence cible

```
FJAOE/                      ← inchangé, version club française
  index.html, db-flotte.js, sw.js, ...
  privacy.html              ← nouveau, politique de confidentialité (EN)
  app-en/                   ← la nouvelle application
    CLAUDE.md               ← ce fichier
    index.html              ← app complète (logique + UI, en anglais)
    assets.js               ← icônes SVG + citations, seuls vestiges de PERF_DB
    sw.js                   ← service worker, cache propre
    manifest.json
    icons/
  capacitor/                ← projet Capacitor
    package.json
    capacitor.config.json
    www/                    ← copie de app-en/ produite par un script
    android/                ← projet Android généré
    keystore.properties     ← gitignoré, jamais commité
```

## Étape 1 — Application web anglaise (`app-en/index.html`)

Point de départ : copie de `index.html` (1450 lignes). Les numéros de ligne cités ci-dessous renvoient au `index.html` de la racine, dans son état au commit `55ef78d`.

**Suppression de la base.** `db-flotte.js` disparaît au profit de `assets.js`, qui ne conserve que `PERF_DB.icons` (silhouettes SVG génériques, `index.html:874` et `1269`) et `PERF_DB.quotes` (traduites). Le garde-fou `DB_OK` (`index.html:533-541`) devient `ASSETS_OK` et ne conditionne plus que les icônes et la citation, jamais le calcul. Fonctions supprimées : `buildAirportPicker` (546-560), `buildRunwayPicker` (561-577), `buildAircraftPicker` (580-593), `updateAircraftPreview` (594-608), `renderAltiportBanner` (1086-1104), et la branche DB de `recompute()` (1177-1207).

**Formulaire avion.** Nouveau panneau remplaçant le sélecteur : nom libre, silhouette (liste déroulante puisant dans `PERF_DB.icons`, pour conserver l'illustration du schéma de piste), roulement et distance 15 m au décollage, idem à l'atterrissage, masse et traversier maximum facultatifs. Un objet `ac` est construit à la volée depuis ces champs et injecté dans `computeSide` (`index.html:1138-1163`), qui garde sa signature : le cœur de calcul n'est pas touché.

**Condition de référence (limite assumée).** La fiche minimale impose `ref = {elevFt: 0, tempC: 15, headwindKt: 0}` (niveau de la mer, ISA, sans vent), consommée telle quelle par `correctionFactor` (`index.html:806-811`). C'est la simplification la plus lourde de conséquences du projet : un manuel dont la table est ancrée à 2000 ft donnera des distances **optimistes**, donc dangereuses. Elle est assumée, mais doit être signalée sans détour, à trois endroits : un avertissement ambre permanent sous les champs de saisie de l'avion, un paragraphe dédié dans le panneau Method, et une ligne dans la description du Play Store. Formulation retenue : « Figures are assumed to be sea level, 15 °C, no wind. If your manual's table is referenced to other conditions, this app will underestimate your distances. »

**Surface.** L'utilisateur déclare la surface à laquelle correspondent ses chiffres, et la surface réelle de la piste. Si elles diffèrent, **aucun facteur n'est inventé** : un avertissement ambre invite à saisir les chiffres de la bonne surface, et un champ facultatif « grass penalty (%) » permet d'appliquer sa propre majoration. C'est la seule attitude compatible avec la règle du projet, tout chiffre doit être traçable.

**Formulaire piste.** Le mode « Terrain personnalisé » actuel (`index.html:392-420`, branche 1208-1218) devient l'unique mode, enrichi de trois champs qui lui manquaient : **pente (%)**, **latitude** et **longitude**. La pente réactive `slopeFactor`, latitude/longitude alimentent `sunTimesUTC` et l'horloge jour/nuit (`index.html:1247-1264`), qui reste masquée si elles sont vides.

**Interrupteur d'unités.** Un seul bouton bascule dans l'en-tête. Principe : **l'intérieur du programme reste en mètres, hPa, °C, pieds** ; la conversion se fait uniquement à la lecture des champs et à l'affichage. Concrètement, une paire de fonctions `toInternal()` / `toDisplay()` encadre la lecture de `recompute()` (`index.html:1167-1173`, `1209-1213`) et les sorties (`fmt()` ligne 830, cartes 1273-1311, SVG piste 883-894). Les libellés `unit-hint` deviennent dynamiques. `pressureAltitude` (ligne 780) ne change pas d'un caractère : c'est le seul consommateur du QNH et il continue de recevoir des hPa. `copyMetarToForm` (ligne 763) convertit avant d'écrire.

**Traduction.** Environ 160 chaînes sur ~110 lignes, dont 60 % du volume dans le panneau « Méthode de calcul » (`index.html:1314-1340`). À traiter aussi, les pièges non textuels : la locale `'fr-FR'` codée en dur dans `fmt()` (830), `fmtSlope()` (900) et les deux `toLocaleTimeString` (1048, 1253) passe à `'en-US'` ; les décimales à la française du panneau Method (« × 1,10 ») deviennent anglo-saxonnes.

**Écran d'acceptation.** Superposition plein écran au premier lancement, avec le texte « This tool assists flight preparation and does not replace the aircraft flight manual. The pilot in command remains solely responsible. » Acceptation stockée dans localStorage, sous une clé versionnée (`disclaimerAcceptedV1`) pour pouvoir la redemander si le texte évolue.

**Persistance.** Clé `localStorage` distincte (`tlPerfEN`), et contrairement à l'actuelle qui ne garde que 4 valeurs (`index.html:1349-1359`), elle mémorise **tous** les champs : avion, piste, coordonnées, unités, météo. C'est ce qui rend la saisie à usage unique supportable.

**Bouton café.** Conservé. Capacitor renvoie déjà par défaut les URL hors-origine vers le navigateur du système, donc le simple `<a target="_blank">` actuel suffit probablement. On le **vérifie sur l'APK avant d'ajouter quoi que ce soit**, et seulement s'il s'ouvre dans la WebView on ajoute `@capacitor/app-launcher` (et non `@capacitor/browser`, qui ouvre un onglet intégré à l'appli et ne résoudrait donc pas le problème).

## Étape 2 — Politique de confidentialité et déploiement web

`privacy.html` en anglais, à la racine : aucune donnée personnelle collectée, aucun compte, aucune analytique, tout reste sur l'appareil ; seule sortie réseau, la requête METAR vers `metar.vatsim.net` lorsque l'utilisateur la déclenche.

**Point à ne pas rater :** Google exige une URL publique accessible sans authentification. Les previews Vercel de branche sont protégées par défaut sur plusieurs formules, donc une URL de preview serait refusée. `privacy.html` doit donc être **fusionné dans `main` en avance**, seul, pour être servi depuis la production : `https://perf-avions-3skt.vercel.app/privacy.html`. C'est un fichier isolé qui n'affecte en rien l'outil du club, mais c'est un aller anticipé de cette branche vers `main`, autant le savoir maintenant plutôt qu'au moment du dépôt.

Le push sur `applitel` crée par ailleurs une **preview Vercel** : l'appli anglaise sera testable sur ton téléphone avant tout empaquetage, sans toucher au site du club.

## Étape 3 — Empaquetage Capacitor

Automatisé par un `package.json` et deux scripts npm.

1. `npm init` + installation de `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/assets` (génération des icônes). Aucun plugin pour le lien café tant que le test sur APK n'a pas prouvé qu'il en faut un.
2. `capacitor.config.json` : `appId: app.perfavions.runwayperf`, `appName: Takeoff & Landing Perf`, `webDir: www`.
3. Script `sync` : copie `app-en/` vers `capacitor/www/` puis lance `npx cap sync android`.
4. Le service worker est **désactivé sous Capacitor** (détection de `window.Capacitor`) : l'appli est déjà entièrement locale, et un cache superposé au conteneur natif est la recette classique pour rester bloqué sur une vieille version.
5. `@capacitor/assets` génère d'un coup toutes les tailles d'icônes Android et les icônes adaptatives à partir de `icons/icon.svg` existant.
6. Permissions du manifeste Android : **INTERNET seulement**. Pas de localisation (coordonnées saisies), pas de stockage.

## Étape 4 — Compilation et signature

État de la machine constaté le 3 août 2026 : **Node 24.18 et npm 11.16 présents**, **SDK Android présent** dans `%LOCALAPPDATA%\Android\Sdk` (build-tools, platforms, emulator, system-images), **Android Studio absent**, **JDK absent du PATH**.

1. **Installer Android Studio.** Il apporte le JDK, également absent. Le SDK déjà présent sera réutilisé.
2. `npx cap open android` ouvre le projet.
3. **Vérifier le `targetSdkVersion`** dans `android/variables.gradle` : la valeur générée par Capacitor est régulièrement en retard sur le minimum exigé par Google pour les nouvelles applis, et un AAB en dessous du seuil est **rejeté à l'envoi**, donc après avoir tout compilé et signé. On lit le seuil en vigueur dans le Play Console et on aligne le fichier avant le premier build.
4. **Keystore de signature** : généré en une commande `keytool`. C'est le seul point non automatisable entièrement, Xavier choisit le mot de passe. Point critique : **ce fichier est irremplaçable**, le perdre interdit définitivement toute mise à jour de l'appli. Il ira dans `keystore.properties`, gitignoré, avec une sauvegarde hors du dépôt.
5. `versionCode` et `versionName` pilotés par un script pour éviter l'oubli à chaque envoi.
6. `gradlew bundleRelease` produit l'**AAB signé** (format exigé par Google). Un `assembleRelease` produit en plus l'**APK** pour tester en direct sur le téléphone.
7. Vérification sur l'émulateur déjà installé, et captures d'écran du store réalisées depuis cet émulateur (automatisable en ligne de commande).

## Étape 5 — Publication Play Console

Compte développeur créé, **vérification d'identité en cours au 3 août 2026**.

Fiche préparée en anglais : titre, description courte et longue, catégorie, formulaire **Data safety** (déclarer la requête METAR), classification de contenu, URL de confidentialité, captures d'écran, et **feature graphic 1024 × 500 px** (la bannière de la fiche, obligatoire, que l'émulateur ne produit pas : à dessiner en SVG dans l'habillage cockpit puis rasteriser).

**Contrainte à connaître dès maintenant** : les comptes développeurs personnels récents doivent passer par une phase de **test fermé avec un nombre minimum de testeurs pendant plusieurs semaines** avant d'accéder à la production. Le seuil exact et la durée sont affichés dans le Play Console une fois la vérification terminée, et ils ont déjà changé, donc lire la valeur là-bas plutôt que se fier à une règle mémorisée. Conséquence pratique : la publication publique arrivera nettement après le premier envoi, et il faut **recruter les testeurs tôt**. L'aéroclub est le vivier évident.

## Ce que Claude automatise, et ce qui reste à Xavier

**Automatisé** : tout le code de l'appli, la traduction, la conversion d'unités, le service worker, le manifeste, la configuration Capacitor, les scripts npm de synchronisation et de build, la génération de toutes les icônes, la configuration Gradle de signature, le bump de version, les textes de la fiche Play Store, la politique de confidentialité, les captures d'écran via l'émulateur.

**Nécessite l'intervention de Xavier** : installer Android Studio (assistant graphique), choisir le mot de passe du keystore et le sauvegarder hors du dépôt, les manipulations dans l'interface web du Play Console, recruter les testeurs.

## Vérification

1. **Navigateur** : ouvrir `app-en/index.html`, vérifier qu'aucune erreur de console n'apparaît sans `db-flotte.js`, que le calcul fonctionne avec des chiffres saisis à la main, et que l'interrupteur d'unités donne des résultats cohérents (une piste de 800 m doit s'afficher 2625 ft et le calcul rendre le même verdict).
2. **Non-régression** : le fichier `index.html` racine doit rester strictement inchangé. Un `git diff main -- index.html db-flotte.js` doit être vide.
3. **Preview Vercel** : tester sur téléphone via l'URL de branche, notamment le METAR et l'horloge jour/nuit avec des coordonnées réelles.
4. **APK** : installer sur le téléphone, vérifier le mode avion (tout doit fonctionner sauf le METAR), l'écran d'acceptation au premier lancement, et l'ouverture du lien café dans le navigateur externe.
5. **Comparaison croisée** : le test qui prouve que le moteur n'a pas été abîmé. À faire impérativement avec le **WT9 ULM**, dont la référence est bien 0 ft / 15 °C / sans vent (`db-flotte.js:131`) et qui est donc comparable à la fiche minimale. Le WT9 LSA (2000 ft, vent arrière 2 kt, ligne 142) et le Tétras (1000 ft, ligne 187) divergeraient **par construction** et feraient croire à une régression inexistante. Recopier les chiffres du WT9 ULM et une piste de LFSH dans l'appli anglaise : les distances doivent tomber au mètre près.
