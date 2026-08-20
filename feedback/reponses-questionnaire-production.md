# Questionnaire d'accès en production — réponses toldcalc

Rédigées le 20 août 2026, à saisir dans le Play Console via
« Demander à publier en production ».

**Contrainte : 300 caractères maximum par réponse.** Toutes les réponses
ci-dessous ont été comptées et tiennent dans la limite ; le nombre exact est
indiqué à côté de chaque titre. Si tu retouches un texte, recompte.

Deux règles avant de copier-coller :

1. Le formulaire est lu par un humain. Les réponses type du prestataire
   (`feedback/toldcalc_production.pdf`) sont envoyées à l'identique par tous ses
   clients : recopiées telles quelles, elles sont reconnaissables et
   constituent un motif de rejet connu. Ci-dessous, ton vécu réel.
2. Réponds en anglais, langue par défaut de ta fiche. Le résumé français sous
   chaque réponse est là pour que tu saches ce que tu envoies.

Les réponses 3, 4, 8 et 9 s'appuient sur le **retour écrit d'Éric, responsable
sécurité de l'aéroclub de Haguenau** (mail du 20 août 2026, cité en annexe).
C'est la meilleure matière du dossier : un retour d'expert, nominatif, sur le
cœur métier de l'appli.

---

## 1) How did you recruit users for your closed test? — 287 car.

```
Two channels. First my local flying club, the Aeroclub de Haguenau in France, where I fly: I showed the app to pilots and invited those interested. Second a paid testing provider, to reach twelve testers in reasonable time, as one club has few Android pilots. Managed via a Google Group.
```

*Aéroclub d'abord, prestataire payant ensuite avec sa justification. L'ordre
compte : le recrutement réel est ton meilleur argument, le prestataire est celui
qui inspire le plus de méfiance.*

---

## 2) How easy was it to recruit testers for your app?

**Difficult** (question à choix multiple)

*Ne coche pas « Easy » : tu viens d'écrire qu'il t'a fallu un prestataire en
complément du club. Se contredire en deux lignes est le seul vrai risque ici.*

---

## 3) Describe the engagement you received from testers — 283 car.

```
Mostly from club pilots, the app's real target users. They ran calculations for aircraft they fly and checked the output against their own flight manuals. Our club's safety manager reviewed it in detail and sent written feedback. Comments came by email and in person at the airfield.
```

*Pilotes du club, qui ont comparé les résultats à leurs propres manuels de vol.
Le responsable sécurité a fait une revue détaillée par écrit.*

---

## 4) Summary of the feedback, and how you collected it — 277 car.

```
Collected by email and in person at the club. Our safety manager found the results sound and the correction factors conservative, and recommended raising the default safety margin to 1.3. Testers also wanted an easier way to rate the app. No wrong result or crash was reported.
```

*Résultats jugés justes, facteurs conservateurs, recommandation d'une marge par
défaut à 1,3, plus le bouton de notation.*

**Vérifie la dernière phrase** avant d'envoyer : elle n'est à garder que si
personne n'a signalé de calcul faux ni de plantage.

---

## 5) Who is the intended audience for your app? — 283 car.

```
General aviation pilots, mainly private and student pilots flying light aircraft and microlights. It is for the pre-flight moment at the airfield: checking the runway is long enough for the aircraft, load and weather of the day. The pilot enters figures from their own flight manual.
```

*J'ai retiré « commercial pilots » du modèle du prestataire : c'est faux, et sur
une appli aéronautique une sur-promesse attire l'œil.*

---

## 6) Describe how your app provides value to the users. — 290 car.

```
It computes take-off and landing distances corrected for pressure altitude, temperature, wind and runway slope, then compares them to the runway available and shows the margin on a diagram. It works fully offline, which is where it is needed, and is a planning aid, not a manual substitute.
```

*La dernière incise compte : une appli qui touche à la sécurité des vols est
examinée de plus près, et dire soi-même que l'outil est une aide et non une
autorité désamorce la question avant qu'elle soit posée.*

---

## 7) How many installs do you expect in your first year?

**1,000 - 10,000** (question à choix multiple)

*Pas 10k-100k : environ 350 000 pilotes privés dans le monde, dont une minorité
sur Android cherchant ce type d'outil, face à ForeFlight, SkyDemon et Garmin
Pilot. Google n'engage rien sur ta réponse, mais une estimation crédible
renforce le reste du dossier.*

---

## 8) What changes did you make based on the closed test? — 292 car.

```
Version 1.1 added a Rate this app button so testers can leave feedback in one tap, and removed unused prototype pages. After our club safety manager's review, the default safety margin moved from 1.2 to 1.3. The calculation engine was unchanged and re-verified against a fixed reference case.
```

*Les deux changements sont faits : le bouton de notation en 1.1, la marge par
défaut à 1,3 le 20 août 2026. Réponse entièrement au passé, ce qui est le plus
solide : Google pose cette question pour vérifier que le test fermé a servi à
quelque chose.*

**La marge à 1,3 doit être dans le build envoyé en production.** Si tu publies
l'AAB actuel, la modification n'y est pas : il faut une version 1.2
(`versionCode` 3) construite après ce changement.

---

## 9) How did you decide that your app is ready for production? — 281 car.

```
The calculation was checked against a fixed reference case and matched to the metre. Real pilots used it on real aircraft with no wrong result or crash, and our club's safety manager validated the figures. Offline use was verified in airplane mode. The scope is small and finished.
```

*Trois preuves : jeu d'essai chiffré, validation par un responsable sécurité,
vérification hors ligne en mode avion.*

---

## Avant d'envoyer

- **Le build.** La marge par défaut à 1,3 est dans le code depuis le 20 août
  2026, mais pas dans l'AAB déjà en ligne. Construis une version 1.2
  (`versionCode` 3) et envoie-la, sinon la réponse 8 décrit une appli qui
  n'existe pas encore côté Google.
- **Relis ta fiche** (description, captures, bannière) : cette fois elle est lue
  par quelqu'un, pas seulement scannée par un robot.
- **Compte 2 à 7 jours** de revue. Une demande de correction n'est pas un rejet.
- La version de production se crée **après** l'accord.

## Annexe — retour d'Éric, responsable sécurité (20 août 2026)

Points retenus pour le formulaire :

- Valeurs jugées **bonnes et pertinentes** sur les avions du club, y compris en
  l'absence d'abaque dans le manuel.
- Facteurs de correction **conservateurs**, mais représentatifs de la réalité.
- Demande 1 : mettre en évidence une **distance d'alignement de 20 à 30 m**,
  beaucoup de pilotes en consommant près de 100 m. **Écartée le 20 août 2026**
  (décision de Xavier), non retenue pour l'instant.
- Demande 2 : **marge de sécurité par défaut à 1,3** plutôt que 1,2.
  **Faite le 20 août 2026** dans les deux applications.
- Propose de **référencer le lien sur l'ordinateur de réservation du club**, au
  même titre que l'outil de centrage.
- Réserve explicite : **pas de diffusion par défaut aux élèves** avant le
  brevet, qui doivent utiliser uniquement les données du manuel de vol.
- Compare la **présentation graphique de la piste** au logiciel de calcul
  utilisé chez Air France.

La réserve sur les élèves n'est pas à mettre dans le formulaire Google, mais
elle est utile pour le texte de ta fiche : elle confirme que l'appli doit
continuer à se présenter comme une aide à la préparation, jamais comme une
source de référence.
