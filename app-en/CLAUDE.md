# Takeoff & Landing Perf — version mondiale pour le Play Store

> **Statut au 5 août 2026 : étapes 1 à 4 terminées** (appli bilingue écrite,
> `privacy.html` déployé en production, empaquetage Capacitor, AAB signé).
> **Étape 5 en cours** : fiche Play Console créée, les 11 déclarations de
> « Contenu de l'application » sont traitées ; restent les captures d'écran, la
> fiche du Store, la piste de test fermé et les testeurs. Tout est commité et
> poussé sur `main`.
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
| Nom Play Store | **toldcalc** (TOLD = Take-Off and Landing Distances). Retenu le 4 août 2026 à l'empaquetage, remplace « Takeoff & Landing Perf » |
| Package ID (définitif) | **`com.xavier.toldcalc`**, gravé dans l'APK debug installé le 4 août 2026. Remplace `app.perfavions.runwayperf`, jamais utilisé |
| Langue | **Français et anglais**, interrupteur FR/EN dans l'en-tête à côté de Metric/Imperial. Revenu sur « anglais uniquement » le 3 août 2026 : Xavier et les testeurs de l'aéroclub sont francophones, et la phase de test fermé du Play Store se recrute là. Français par défaut si le navigateur est en français, langue mémorisée avec le reste des réglages. Les cartouches des instruments (ALT · FEET, FIELD, DA, PA, ISA, HEAD/TAIL/XW) restent en anglais dans les deux langues, comme sur un tableau de bord réel |
| Données | Aucune base embarquée, saisie manuelle à usage unique, dernière saisie mémorisée |
| Horloge jour/nuit | **Supprimée le 3 août 2026**, avec les champs latitude/longitude dont elle dépendait. `sunTimesUTC` et `buildNightClockSvg` sont retirés du code. La rétablir supposerait soit de redemander les coordonnées, soit la permission de localisation Android, écartée à l'étape 3 |
| Silhouette avion | **Sélecteur supprimé le 3 août 2026.** Une silhouette générique fixe (`ICON_KEY = 'lowwing'`) illustre les en-têtes de carte et le schéma de piste ; elle n'a jamais touché un calcul. Les quatre SVG restent dans `assets.js` |
| Surface de référence | **Sélecteur « Your figures are for a » supprimé le 3 août 2026**, ainsi que l'avertissement « Surface mismatch ». Le pilote ne déclare plus que la surface réelle de la piste. La majoration herbe s'applique désormais dès que la piste est déclarée en herbe ET qu'un pourcentage est saisi. La règle de fond ne bouge pas : aucun facteur herbe n'est inventé, et le panneau Méthode dit maintenant que sans saisie les distances sont optimistes sur l'herbe |
| Fiche avion | Minimale : roulement + distance 15 m, décollage et atterrissage. **Les deux manœuvres sont indépendantes** : remplir le décollage seul (ou l'atterrissage seul) suffit à obtenir ce calcul-là, l'autre carte restant en attente. Décidé le 3 août 2026, après essai : exiger les quatre chiffres obligeait un pilote préparant un simple départ à ressortir ses chiffres d'atterrissage |
| Unités | Un interrupteur global **Metric / Imperial** (m↔ft, °C↔°F, hPa↔inHg) ; altitudes toujours en pieds ; vent toujours en nœuds |
| METAR | Conservé (VATSIM, couverture mondiale) |
| Juridique | Écran d'acceptation au premier lancement, **plus aucun bandeau permanent dans la page**. Décision de Xavier du 3 août 2026, réaffirmée après une première tentative de compactage : les deux bandeaux ambre prenaient 47 % d'un écran de téléphone, et le panneau Méthode redisait déjà les conditions de référence. Tout est désormais réuni dans **`details.method`, dernier bloc de la page**, replié par défaut, dont le titre porte un `⚠` et se lit « Méthode, hypothèses et avertissements ». Le disclaimer en est le **premier paragraphe** (classe `.method-warn`, ambre), injecté par `t('disclaimer')` depuis la clé unique — jamais recopié dans les deux gabarits de prose, deux copies d'un avertissement de sécurité divergent toujours. **Ne pas « restaurer » le bandeau en croyant à une perte accidentelle.** Chaîne restante pour le Play Store : acceptation forcée au premier lancement, puis panneau Méthode accessible en permanence. Les clés `ac.refwarn.*` et `warn.short.*` ont été supprimées, ainsi que tout le CSS `.caution*` |
| Confidentialité | `privacy.html` rédigé et hébergé sur Vercel |
| Bouton café | Conservé tel quel, ouvert dans le navigateur externe |
| Organisation | Sous-dossier `app-en/`. **Les commits sont en réalité sur `main`**, pas sur `applitel` comme prévu à l'origine (`git log -- app-en/` le confirme) : dérive constatée le 3 août 2026, sans conséquence tant que la racine reste intacte, mais à trancher avant l'empaquetage |
| Nom de l'appli installée | `manifest.json` (`name`, `lang`) reste **en anglais** et ne peut pas suivre l'interrupteur : un manifeste est lu à l'installation, pas à l'exécution. Le nom et l'écran de démarrage de la PWA installée et de l'APK sont donc anglais dans les deux langues. Assumé |
| Visuel | Identique à l'actuel (cockpit sombre, instruments SVG) |
| Conditions de référence | Imposées à 0 ft / 15 °C / sans vent, avec avertissement appuyé (voir Étape 1) |
| En-tête | Photo `C172_Night_cockpit.jpg` **conservée** et copiée dans `app-en/` ; **logo de l'aéroclub retiré**, remplacé par `icons/icon.svg`. Décidé le 3 août 2026. Réserve à porter : la diffusion mondiale de la photo suppose de pouvoir en justifier les droits, Google pouvant suspendre la fiche sur signalement |
| Hauteur d'obstacle | Affichée **« 15 m / 50 ft » en permanence**, dans les deux systèmes d'unités. Ce n'est pas une distance convertie mais une hauteur d'obstacle : le manuel européen dit 15 m, l'américain 50 ft, et l'écart réel (15 m = 49,2 ft) est très inférieur à la précision du modèle. Ne jamais afficher « 49 ft » |
| Masse maxi au décollage | **Champ supprimé le 3 août 2026.** Il n'alimentait aucun calcul, il ne servait que de légende sur la carte de résultat. Son retrait a emporté toute la conversion kg/lb (`KG_PER_LB`, `massToInternal`, `massToDisplay`, l'entrée `mass` de `UNIT_LABELS` et de `CONVERTERS`) : c'était son seul consommateur. Le champ « Avion » a pris sa place dans la rubrique Facultatif, et la grille du haut du panneau a disparu |
| Cache PWA | Préfixe **`tlperf-`** (`tlperf-v8` au 3 août 2026), distinct de `perf-avions-vN` : même origine Vercel, et le Cache Storage est par origine, pas par portée |

## Arborescence cible

```
FJAOE/                      ← inchangé, version club française
  index.html, db-flotte.js, sw.js, ...
  privacy.html              ← FAIT, politique de confidentialité (EN), pas déployée
  app-en/                   ← la nouvelle application — FAIT
    CLAUDE.md               ← ce fichier
    index.html              ← app complète (logique + UI, bilingue FR/EN)
    assets.js               ← icônes SVG + citations (FR et EN), seuls vestiges de PERF_DB
    sw.js                   ← service worker, cache tlperf-vN
    manifest.json
    C172_Night_cockpit.jpg  ← copiée depuis la racine (fond d'en-tête)
    icons/                  ← copiées depuis la racine, SVG corrigés (voir plus bas)
  capacitor/                ← projet Capacitor — À FAIRE
    package.json
    capacitor.config.json
    www/                    ← copie de app-en/ produite par un script
    android/                ← projet Android généré
    keystore.properties     ← gitignoré, jamais commité
```

## Étape 1 — Application web anglaise (`app-en/index.html`) — ✅ FAIT le 3 août 2026

> Ce qui suit est désormais un **compte rendu de conception**, pas une consigne à
> exécuter. Les numéros de ligne renvoient au `index.html` de la racine à son
> état au commit `55ef78d` et ne correspondent plus au code écrit : lire le code
> lui-même, qui est commenté. Les décisions et les pièges rencontrés sont
> consignés dans « Ce que l'écriture a appris », en fin de section.

Point de départ : copie de `index.html` (1450 lignes).

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

### Ce que l'écriture a appris (3 août 2026)

Six points qui ne figuraient pas au plan et qu'il ne faut pas redécouvrir :

**Le moteur n'a pas été touché, et c'est vérifié.** `computeSide`, `correctionFactor`, `conditionFactor`, `slopeFactor` et `pressureAltitude` sont recopiés à l'identique. Pour que la branche de repli surface de `computeSide` ne se déclenche jamais, l'objet `ac` synthétisé par `buildAircraftFromForm()` remplit **les deux clés** `paved` et `grass` avec la même paire de chiffres. La question revêtue/herbe est traitée dans la couche interface, où l'on peut être honnête sur le fait de n'inventer aucun facteur.

**Décollage et atterrissage sont découplés.** `buildAircraftFromForm()` renvoie **toujours** un objet, mais ne pose la clé `takeoff` que si les deux chiffres du décollage sont présents et strictement positifs, et de même pour `landing`. Conséquence à retenir pour tout consommateur : **tester la clé avant de s'en servir**, car `computeSide` lit `ac[kind][surface]` d'emblée et lèverait une exception sur une manœuvre absente. Le garde est en tête de `renderSide()`. Un roulement saisi sans sa distance 15 m, ou une distance à zéro, comptent comme absents.

**Les silhouettes SVG sont recopiées octet pour octet.** `buildRunwaySvg` retire la balise `<svg>` ouvrante par un `.replace()` sur la chaîne littérale exacte. Reformater ne serait-ce qu'un espace de cette balise imbriquerait un `<svg>` dans un autre, sans la moindre erreur en console. Contrôle automatisable : comparer les chaînes de `assets.js` à celles de `db-flotte.js` après normalisation des fins de ligne (le dépôt est en CRLF, les fichiers écrits en LF).

**`--` est interdit dans un commentaire XML, et un SVG mal formé échoue en silence dans une balise `<img>`.** `icons/icon.svg` et `icons/favicon.svg` nommaient une couleur par sa variable CSS `--navy` : XML invalide. En `<link rel="icon">` le navigateur laisse passer, en `<img>` il refuse sans rien dire en console. Les copies de `app-en/icons/` sont corrigées (et portent désormais `width`/`height` explicites, faute de quoi `naturalWidth` vaut 0). **Les fichiers de la racine restent cassés** : à corriger côté outil du club, hors du périmètre de cette branche.

**L'interrupteur d'unités réécrit les valeurs, pas seulement les libellés.** 800 m doit devenir 2625 dans la case. La marge de sécurité (facteur sans dimension), l'altitude terrain (toujours en pieds), le vent (toujours en nœuds), la pente et les coordonnées ne sont **jamais** convertis. Le `step` du QNH doit suivre l'unité (`0.01` en inHg, sinon `type=number` refuse 29,92). L'aller-retour métrique → impérial → métrique redonne les valeurs exactes ; en revanche l'arrondi entier du champ température en °F introduit une granularité de 0,3 °C, assumée.

**Le service worker a deux gardes, pas une.** `location.protocol.startsWith('http')` **passe** sous Capacitor, qui sert depuis `https://localhost` : le test `!window.Capacitor` doit donc être dans le bloc d'enregistrement du HTML, pas seulement dans `sw.js`. Par ailleurs le worker de la racine efface **tous** les caches qui ne sont pas le sien : il évincera donc `tlperf-v1` à chaque mise à jour du club (sans gravité, les fichiers sont retéléchargés). Le worker anglais, lui, limite volontairement sa purge à son propre préfixe pour ne pas rendre la pareille.

**Le bilinguisme (ajouté le 3 août 2026) tient en deux mécanismes.** Le balisage statique porte `data-i18n` (texte), `data-i18n-html` (balises autorisées) ou `data-i18n-ph` (attribut placeholder), et `applyLang()` les réécrit. Tout ce que le JS construit appelle `t('clé')` **au moment du rendu**, jamais au chargement, si bien qu'un `recompute()` suffit à repasser l'écran dans l'autre langue. Trois pièges rencontrés : **(a)** un libellé traduisible ne doit jamais contenir un nœud de texte nu à côté de son `span.unit-hint`, car écrire dans le libellé effacerait ce span et `refreshUnitLabels()` n'aurait plus rien à remplir — le texte vit toujours dans son propre `<span data-i18n>` ; **(b)** l'écran d'acceptation recouvre l'en-tête au premier lancement, donc il porte **son propre** sélecteur FR/EN, sans quoi un francophone ne pourrait pas l'atteindre ; **(c)** les deux listes de citations d'`assets.js` sont **indexées en parallèle**, et l'index est tiré une seule fois, pour que la bascule de langue ne fasse pas sauter l'en-tête.

**Le lien vers `privacy.html` est absolu.** Capacitor copie `app-en/` à la racine du web root, donc un `../privacy.html` en sortirait et donnerait un 404 dans l'APK. Le pied de page pointe sur `https://perf-avions-3skt.vercel.app/privacy.html`, qui est aussi l'URL à déclarer au Play Console.

## Étape 2 — Politique de confidentialité et déploiement web

`privacy.html` en anglais, à la racine : aucune donnée personnelle collectée, aucun compte, aucune analytique, tout reste sur l'appareil ; seule sortie réseau, la requête METAR vers `metar.vatsim.net` lorsque l'utilisateur la déclenche.

**Point à ne pas rater :** Google exige une URL publique accessible sans authentification. Les previews Vercel de branche sont protégées par défaut sur plusieurs formules, donc une URL de preview serait refusée. `privacy.html` doit donc être **fusionné dans `main` en avance**, seul, pour être servi depuis la production : `https://perf-avions-3skt.vercel.app/privacy.html`. C'est un fichier isolé qui n'affecte en rien l'outil du club, mais c'est un aller anticipé de cette branche vers `main`, autant le savoir maintenant plutôt qu'au moment du dépôt.

Le push sur `applitel` crée par ailleurs une **preview Vercel** : l'appli anglaise sera testable sur ton téléphone avant tout empaquetage, sans toucher au site du club.

## Étape 3 — Empaquetage Capacitor

Automatisé par un `package.json` et deux scripts npm.

1. `npm init` + installation de `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/assets` (génération des icônes). Aucun plugin pour le lien café tant que le test sur APK n'a pas prouvé qu'il en faut un.
2. `capacitor.config.json` : `appId: com.xavier.toldcalc`, `appName: toldcalc`, `webDir: www`.
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

## Étape 5 — Publication Play Console — 🔄 EN COURS depuis le 5 août 2026

> Ce qui suit sous « État au 5 août 2026 » est un **compte rendu**. Le reste de
> la section est le plan d'origine, conservé pour ce qui n'est pas encore fait.

### État au 5 août 2026

**Compte développeur vérifié.** Le blocage du 3 août est levé.

**Fiche créée** : `toldcalc`, package `com.xavier.toldcalc` (le Play Console
demande désormais le nom du package **à la création**, contrairement à ce que
supposait le plan ; il n'est plus seulement déduit du premier AAB), langue par
défaut anglais (États-Unis), Application, **Sans frais — irréversible une fois
publiée**.

**11 déclarations sur 11 traitées** dans « Contenu de l'application » :

| Déclaration | Réponse | Justification à ne pas rejouer |
|---|---|---|
| Règles de confidentialité | `https://perf-avions-3skt.vercel.app/privacy.html` | vérifiée publique et sans authentification |
| Informations de connexion | tout accessible sans identifiants | ni compte ni mot de passe ; l'écran d'acceptation n'est pas une connexion |
| Annonces | non | aucune régie |
| Identifiant publicitaire | non | vérifié : le manifeste Android ne déclare que `INTERNET`, pas `AD_ID` |
| Applis gouvernementales / Fonctionnalités financières / Santé | non | le commanditaire, pas le sujet ; le bouton café est un lien externe |
| Cible | **18 ans et plus uniquement** | cocher une tranche mineure ferait basculer l'appli dans le programme Familles, avec ses contraintes sur les liens externes |
| Sécurité des données | **aucune collecte, aucun partage** | « collecter » = transmettre hors de l'appareil ; le METAR n'envoie qu'un code OACI, qui n'est aucun des types de données Google |
| Classification du contenu | tout public partout (PEGI 3, ESRB Everyone, USK) | catégorie « Utilitaire », surtout pas « Jeu » |
| Catégorie et coordonnées | Applications → Outils ; `shinai24@gmail.com` (**publique**), site Vercel, pas de téléphone | |

**Renommage `toldcalc` du 5 août 2026.** L'en-tête de l'appli affichait encore
« Takeoff & Landing Perf » (EN) et « Perfos décollage & atterrissage » (FR)
alors que la fiche s'appelle toldcalc. Corrigé partout, **dans les deux
langues** : c'est un nom propre. `privacy.html` désignait par ailleurs le
package abandonné `app.perfavions.runwayperf`. Commit `71303ea`, poussé et
redéployé sur Vercel, texte en ligne vérifié.

**AAB signé refait le 5 août 2026** avec le nouveau nom, `versionCode 1`,
empreinte SHA-1 identique à celle du 4 août (`62:7C:A8:…`), donc bien la même
clé d'upload.

**Éléments de fiche préparés** (dans `Applitel-Android\assets-src\`, hors
dépôt) : `fiche-play-store.md` (titre, descriptions courte et longue, FR et EN,
compteurs de caractères vérifiés), `feature-graphic.png` 1024 × 500 et sa
source SVG, `icon-play-512.png`. Cette icône est **régénérée carrée et opaque**
et non reprise de `app-en/icons/icon-512.png` : ce dernier a des coins arrondis
transparents, et Google applique en plus son propre masque, d'où un double
arrondi.

**Émulateur inutilisable sur cette machine** : `x86_64 emulation currently
requires hardware acceleration`, la fonctionnalité Windows « Plateforme
d'hyperviseur Windows » n'est pas activée. Ne pas y revenir sans décision
explicite de Xavier : c'est une modification système avec redémarrage. Les
captures se font donc **sur son téléphone**, avec l'APK debug.

**Captures d'écran** : scénario retenu, **KOSH (Wittman Regional, Oshkosh) avec
un Cessna 172S et le METAR réel**, en unités impériales. Les captures brutes du
téléphone font 1080 × 2400, soit 1:2,22, **plus haut que le 9:16 maximum de
Google** : prévoir un recadrage en 1080 × 1920.

**Captures d'écran faites**, dans `images-app\play\` (hors dépôt, non commité) :
5 fichiers 1080 × 1920 nommés dans l'ordre d'affichage voulu, le résultat en
premier. Recette : capture brute 1080 × 2400 recadrée `crop((0,110,1080,2030))`,
ce qui retire la barre d'état et la barre de navigation et tombe pile sur 9:16.
**Ne pas se fier à l'ordre de collage des captures dans la conversation, il ne
suit pas l'ordre chronologique des fichiers** — regarder chaque image.

**Fiche Play Store remplie** le 5 août 2026, statut **« Prête à être envoyée
pour examen »**. Langue fr-FR ajoutée via le sélecteur de langue de la fiche →
**« Gérer les langues »** (et non par la page « Traductions » du menu, qui ne
propose que le service payant de traduction humaine, ni par l'import de fichier).

### Deuxième envoi — 16 août 2026

**AAB `versionCode 2` / `versionName 1.1` envoyé sur la piste Alpha, avec les
nouvelles captures de la fiche en-US ; les deux modifications sont parties dans
un seul examen.** Détails à ne pas redécouvrir :

- Contenu de la version : le bouton « Noter l'appli » (commit `84aac4f`) et le
  retrait de deux prototypes qui s'étaient glissés dans le paquet.
  `maquette-*.html` est désormais dans la liste `-Exclude` des deux commandes de
  build de `Applitel-Android\REBUILD.md`.
- Signature vérifiée après build : SHA-1 `62:7C:A8:…`, la même clé d'upload
  qu'en v1. `keytool -printcert -jarfile` reste le seul contrôle qui prouve que
  l'AAB est signé, « BUILD SUCCESSFUL » ne le prouve pas.
- Notes de version FR + EN conservées dans `app-en/notes-de-version-v1.1.md`.
  Elles se saisissent **entre** les balises `<en-US>` / `<fr-FR>` déjà présentes
  dans le champ, 500 caractères par langue.
- **Tuiles de la fiche** : 5 posters 1080 × 1920 composés à partir des vraies
  captures par `images-app\compose-poster.py` (un tableau de 5 entrées, un seul
  moteur de rendu). Titre + sous-titre + recadrages agrandis de l'app sur le
  fond radial de l'appli. Deux règles y sont écrites en commentaire et méritent
  d'être relues avant d'y toucher : recadrer au bord du *contenu* et non du
  panneau, et ne pas coller un recadrage plein cadre (1080) quand les libellés
  arrivent au bord, sinon la tuile se lit comme une capture coupée — d'où les
  950 px de large des tuiles 02 à 05.
- Les mêmes 5 tuiles ont été mises dans **téléphone** *et* **tablette 7
  pouces** : ce dernier champ est obligatoire dans la fiche, le vider bloque
  l'enregistrement.
- La fiche **fr-FR garde les anciennes captures** : les tuiles sont en anglais.
  Refaire un jeu français le jour venu — les titres et sous-titres sont des
  données dans le tableau du script, c'est une modification d'une ligne chacun.

**Bug repéré, pas encore traité** : en mode impérial anglais, le champ QNH
affiche `29,94` avec une **virgule** décimale (visible sur la capture
`05-metar.png`). À corriger dans `app-en/index.html` avant la prochaine version.

### Reste à faire — reprise du 6 août 2026

Sauvegarde hors PC de `toldcalc-upload.jks` et de son mot de passe : **faite**
(confirmé par Xavier le 6 août 2026). Photo de cockpit : Xavier a tranché, on la
garde et on ne cherche plus sa provenance — sujet clos, ne pas le rouvrir.

1. ~~Vérifier que les trois champs de la fiche fr-FR sont bien remplis~~ —
   **fait**, confirmé le 6 août 2026.
**Version de test fermé envoyée à Google pour examen le 6 août 2026.** État de la
piste au moment de l'envoi :

- Piste unique **« Alpha »**, `Tests fermés`. Ne pas en créer une seconde.
- **Play App Signing actif** ; l'`.aab` porte le `versionCode` **1** — la
  prochaine version devra passer à 2, Google refuse deux envois au même numéro.
- Bundle : 2,99 Mo, API min 24, SDK cible 36. Un seul avertissement, sans
  conséquence : pas de fichier de mapping R8/ProGuard (il n'y a pas de code Java
  obscurci dans une coque WebView). Il reviendra à chaque version, l'ignorer.
- Testeurs gérés par **groupe Google `toldcalc-testeurs@googlegroups.com`**
  (9 membres au 6 août, dont Xavier). Avantage : la liste se modifie côté Google
  Groupes, sans retoucher ni republier la piste.
- Diffusion **mondiale** (176 pays + « reste du monde »).
- Adresse de commentaires des testeurs : `shinai24@gmail.com`.
- 16 modifications envoyées, dont tous les formulaires bloquants (sécurité des
  données, classification, cible et contenu 18+, applis de santé, annonces,
  catégorie « Outils », URL de confidentialité).

Point à surveiller : `mimi.danon@hotmail.fr` est dans le groupe mais une adresse
non-Gmail ne fonctionne comme testeur que si elle est rattachée à un compte
Google. À vérifier avant de compter cette personne dans les 12.

2. ~~Créer / ouvrir la piste de test fermé~~ — **fait le 6 août 2026.** Détail : (**une seule piste** : le compteur de
   testeurs est par piste), y téléverser **`toldcalc.aab` du Bureau**, jamais
   l'APK.
3. Au premier téléversement, Google enrôle l'appli dans **Play App Signing** et
   affichera une **empreinte SHA-1 différente** de la clé d'upload
   (`62:7C:A8:…`, qui reste visible sous « certificat de clé d'importation »).
   C'est normal, le dire à Xavier avant qu'il le découvre.
4. Recruter les testeurs. **Le compteur affiche les testeurs *inscrits*, pas les
   adresses invitées** : il reste à 0 tant que les pilotes n'ont pas cliqué sur
   le lien d'acceptation.

### Plan d'origine (3 août 2026)

Compte développeur créé, **vérification d'identité en cours au 3 août 2026**.

Fiche préparée en anglais : titre, description courte et longue, catégorie, formulaire **Data safety** (déclarer la requête METAR), classification de contenu, URL de confidentialité, captures d'écran, et **feature graphic 1024 × 500 px** (la bannière de la fiche, obligatoire, que l'émulateur ne produit pas : à dessiner en SVG dans l'habillage cockpit puis rasteriser).

**Contrainte à connaître dès maintenant** : les comptes développeurs personnels récents doivent passer par une phase de **test fermé avec un nombre minimum de testeurs pendant plusieurs semaines** avant d'accéder à la production. Le seuil exact et la durée sont affichés dans le Play Console une fois la vérification terminée, et ils ont déjà changé, donc lire la valeur là-bas plutôt que se fier à une règle mémorisée. Conséquence pratique : la publication publique arrivera nettement après le premier envoi, et il faut **recruter les testeurs tôt**. L'aéroclub est le vivier évident.

## Ce que Claude automatise, et ce qui reste à Xavier

**Automatisé** : tout le code de l'appli, la traduction, la conversion d'unités, le service worker, le manifeste, la configuration Capacitor, les scripts npm de synchronisation et de build, la génération de toutes les icônes, la configuration Gradle de signature, le bump de version, les textes de la fiche Play Store, la politique de confidentialité, les captures d'écran via l'émulateur.

**Nécessite l'intervention de Xavier** : installer Android Studio (assistant graphique), choisir le mot de passe du keystore et le sauvegarder hors du dépôt, les manipulations dans l'interface web du Play Console, recruter les testeurs.

## Vérification

Points 1, 2 et 5 **passés le 3 août 2026**, servis depuis `python -m http.server 8744`. Points 3 et 4 en attente des étapes correspondantes.

1. ✅ **Navigateur** : aucune erreur de console. Le calcul fonctionne avec des chiffres saisis à la main ; 800 m s'affiche bien 2625 ft et le verdict est inchangé. Vérifié en plus : `assets.js` retiré (`ASSETS_OK === false`) laisse le **calcul intact** et le schéma de piste dessiné, seules la silhouette et la citation disparaissent ; aucun débordement horizontal en 375 px de large ; METAR mondial fonctionnel (EGKA testé) avec conversion correcte à la copie.
   **Indépendance des manœuvres** : les quatre combinaisons (décollage seul, atterrissage seul, les deux, aucun) donnent bien la carte remplie d'un côté et le message d'attente de l'autre, avec les mêmes valeurs qu'en saisie complète. Cas limites couverts : roulement sans distance 15 m, distance saisie à zéro, TODA vide alors que la fiche décollage est complète, et bascule en impérial avec une seule manœuvre renseignée.
2. ✅ **Non-régression** : `git diff HEAD -- index.html db-flotte.js sw.js manifest.json` vide. Seuls des fichiers **nouveaux** sont apparus. L'outil du club, rechargé, calcule toujours (7 avions, 13 terrains, `DB_OK` vrai).
3. ⏳ **Preview Vercel** : tester sur téléphone via l'URL de branche, notamment le METAR et l'horloge jour/nuit avec des coordonnées réelles.
4. ⏳ **APK** : installer sur le téléphone, vérifier le mode avion (tout doit fonctionner sauf le METAR), l'écran d'acceptation au premier lancement, et l'ouverture du lien café dans le navigateur externe.
5. ✅ **Comparaison croisée** : le test qui prouve que le moteur n'a pas été abîmé. Fait avec le **WT9 ULM**, dont la référence est bien 0 ft / 15 °C / sans vent (`db-flotte.js:131`) et qui est donc comparable à la fiche minimale. Le WT9 LSA (2000 ft, vent arrière 2 kt, ligne 142) et le Tétras (1000 ft, ligne 187) divergeraient **par construction** et feraient croire à une régression inexistante — ne pas les utiliser pour ce test.
   Jeu d'essai retenu, à rejouer tel quel après toute retouche du moteur : WT9 ULM revêtue (75 / 252 au décollage, 75 / 263 à l'atterrissage), LFSH piste 03 (491 ft, QFU 026, TODA 910, LDA 775, plat), 27 °C, QNH 1008, vent 060°/12 kt, marge 1,2.
   **Résultat attendu, identique dans les deux applis** : décollage 81 / 274 / 329 m pour 910 m disponibles ; atterrissage 81 / 286 / 343 m pour 775 m disponibles. Les huit valeurs sont tombées au mètre près.

## Ce qui reste en suspens

- **Photo de cockpit** : justificatif de droits à réunir avant le dépôt sur le Play Store (décision du 3 août 2026 de la conserver).
- **`icons/icon.svg` et `icons/favicon.svg` de la racine** : XML invalide (`--` dans un commentaire), donc le favicon de l'outil du club ne s'affiche probablement pas. Correction en une ligne, à faire sur `main`, hors périmètre de cette branche.
- ~~**Rien n'est commité** sur `applitel` à ce jour, et `privacy.html` n'est pas fusionné dans `main`.~~ Réglé : tout est sur `main` et `privacy.html` est servi en production.
