# Calculateur de performances — Flotte Aéroclub de Haguenau (LFSH)

Outil web léger (HTML/CSS/JS, sans framework ni build) pour calculer les
performances de **décollage et d'atterrissage** des avions de la flotte de
l'Aéroclub de Haguenau : roulement, distance pour franchir les 15 m, et marge
par rapport à la longueur de piste disponible.

Conçu comme une **aide personnelle à la préparation des vols**.

**En ligne :** <https://perf-avions-3skt.vercel.app/> (déployé automatiquement par
Vercel à chaque push sur `main`).

> ⚠️ **Avertissement.** Cet outil n'est ni certifié ni officiel. Les résultats
> reposent sur une transcription manuelle des manuels de vol et sur un modèle de
> correction simplifié (voir le panneau « Méthode de calcul » dans l'appli).
> Il ne remplace en aucun cas le manuel de vol de l'aéronef, les cartes VAC en
> vigueur, ni le jugement du pilote. Vérifiez toujours vos calculs à la source.

## Utilisation

Aucune étape de build.

- **Le plus simple :** ouvrir `index.html` directement dans un navigateur
  (double-clic).
- **Ou** servir le dossier en statique (plus fiable pour les chemins relatifs
  des images) :
  ```
  python -m http.server 8744
  ```
  puis ouvrir <http://localhost:8744/>.

### Installer sur smartphone

Le site est une **PWA** : ouvrir <https://perf-avions-3skt.vercel.app/> sur le
téléphone, puis « Ajouter à l'écran d'accueil » (Android : menu ⋮ ; iOS : bouton
Partager). L'appli s'ouvre alors en plein écran et **fonctionne sans connexion**,
ce qui est le cas d'usage réel : préparer une perfo au terrain, sans réseau.

Seule la récupération du METAR nécessite Internet ; hors connexion, l'appli le
signale et il suffit de saisir vent, température et QNH à la main.

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Toute la logique et l'interface. Nommé `index.html` pour être servi par défaut à la racine du site par Vercel. |
| `db-flotte.js` | Les données : perfs avions, aérodromes, icônes SVG. Chargé via `<script src>`, doit rester à côté du HTML. |
| `images avions/*.png` | Photos des avions affichées dans le sélecteur. |
| `manifest.json` | Carte d'identité de la PWA (nom, icône, couleur) : déclenche l'installation sur l'écran d'accueil. |
| `sw.js` | Service worker : met l'appli en cache pour le mode hors-ligne. **Incrémenter `CACHE` à chaque modif** d'un fichier caché. |
| `icons/` | Icônes de l'appli. `icon.svg` est la source ; les PNG en sont dérivés. |
| `vercel.json` | En-têtes HTTP : empêche la mise en cache de `sw.js`, sans quoi les mises à jour ne seraient jamais détectées. |
| `CLAUDE.md` | Documentation d'architecture (pour Claude Code et les contributeurs). |

## Avions et aérodromes couverts

- **Flotte :** WT9 (ULM et LSA), PS-28, Cessna 172, PA-28, Tétras, Savannah.
- **Terrains :** LFSH (Haguenau) et les aérodromes environnants d'Alsace /
  Lorraine, plus un mode « terrain personnalisé ».

## Documents de référence

Les données ont été transcrites manuellement depuis les manuels de vol des
constructeurs et les cartes VAC du SIA (eAIP). Ces documents sont **sous droit
d'auteur** et ne sont **pas inclus** dans ce dépôt.

## Météo (METAR)

L'appli peut récupérer un METAR pour un code OACI saisi manuellement, via l'API
de l'Aviation Weather Center (NOAA) puis, en repli, `metar.vatsim.net`.
Indépendant du sélecteur d'aérodrome (LFSH n'a pas de station METAR).
