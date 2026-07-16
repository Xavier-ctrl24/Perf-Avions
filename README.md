# Calculateur de performances — Flotte Aéroclub de Haguenau (LFSH)

Outil web léger (HTML/CSS/JS, sans framework ni build) pour calculer les
performances de **décollage et d'atterrissage** des avions de la flotte de
l'Aéroclub de Haguenau : roulement, distance pour franchir les 15 m, et marge
par rapport à la longueur de piste disponible.

Conçu comme une **aide personnelle à la préparation des vols**.

> ⚠️ **Avertissement.** Cet outil n'est ni certifié ni officiel. Les résultats
> reposent sur une transcription manuelle des manuels de vol et sur un modèle de
> correction simplifié (voir le panneau « Méthode de calcul » dans l'appli).
> Il ne remplace en aucun cas le manuel de vol de l'aéronef, les cartes VAC en
> vigueur, ni le jugement du pilote. Vérifiez toujours vos calculs à la source.

## Utilisation

Aucune étape de build.

- **Le plus simple :** ouvrir `Calculateur_Performances_WT9.html` directement
  dans un navigateur (double-clic).
- **Ou** servir le dossier en statique (plus fiable pour les chemins relatifs
  des images) :
  ```
  python -m http.server 8744
  ```
  puis ouvrir <http://localhost:8744/Calculateur_Performances_WT9.html>.

## Structure

| Fichier | Rôle |
| --- | --- |
| `Calculateur_Performances_WT9.html` | Toute la logique et l'interface. |
| `db-flotte.js` | Les données : perfs avions, aérodromes, icônes SVG. Chargé via `<script src>`, doit rester à côté du HTML. |
| `images avions/*.png` | Photos des avions affichées dans le sélecteur. |
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
