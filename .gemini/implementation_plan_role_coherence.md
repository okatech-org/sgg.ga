# Plan d'Implémentation — Cohérence Rôles × Formation (100%)

> **Objectif** : Chaque compte démo doit voir les badges "Vous intervenez" sur les guides de formation
> qui correspondent à ses actions réelles dans les processus, avec les bonnes descriptions de rôle.
> Le même niveau de cohérence que pour le Président doit être atteint pour **tous les 17 comptes**.

---

## 📋 Inventaire

### Comptes Démo (17 comptes, 13 rôles uniques)

| ID | Titre | Catégorie | ROLE_ACTOR_KEYWORDS ? |
|----|-------|-----------|----------------------|
| `president` | Président de la République | Présidence | ✅ Fait |
| `vice-president` | Vice-Président de la République | Présidence | ✅ Existe |
| `premier-ministre` | Vice-Président du Gouvernement | Gouvernement | ✅ Existe |
| `ministre` | Ministre Sectoriel | Gouvernement | ✅ Existe |
| `sgg-admin` | Administrateur SGG | SGG | ✅ Existe |
| `sgg-directeur` | Directeur SGG | SGG | ✅ Existe |
| `sg-ministere` | SG Ministère (×3) | Ministères | ❌ **MANQUE** |
| `sg-ministere-fp` | SG Min. Fonction Publique | Ministères | ❌ **MANQUE** |
| `directeur-cgi` | Dir. CGI | Directions | ✅ Existe |
| `directeur-dgpn` | Dir. DGPN | Directions | ✅ Existe |
| `sgpr` | SGPR | Institutions | ✅ Existe |
| `assemblee` | Assemblée Nationale | Institutions | ✅ Existe |
| `senat` | Sénat | Institutions | ✅ Existe |
| `conseil-etat` | Conseil d'État | Institutions | ✅ Existe |
| `cour-constitutionnelle` | Cour Constitutionnelle | Institutions | ❌ **MANQUE** |
| `dgjo` | Direction Journal Officiel | Institutions | ✅ Existe |
| `citoyen` | Citoyen | Public | ❌ **MANQUE** |
| `professionnel-droit` | Professionnel du Droit | Public | ❌ **MANQUE** |

### Guides de Formation (10 guides)

| # | Guide ID | Titre | Acteurs actuels (acteursPrincipaux) |
|---|----------|-------|-------------------------------------|
| 1 | `nominations` | Nominations | Ministère proposant, Dir. Nominations SGG, SG Gouv., SGPR, Président |
| 2 | `gar` | Suivi GAR / PAT | Point focal GAR, SG Ministère, Dir. Suivi GAR SGG, SGG, Cabinet du Président |
| 3 | `journal-officiel` | Journal Officiel | Présidence, DGJO, Composition, Diffusion, SGG |
| 4 | `cycle-legislatif` | Cycle Législatif | Ministère d'origine, SGG, Conseil d'État, Conseil des Ministres, Parlement, Président |
| 5 | `egop` | e-GOP / Conseil des Ministres | Cabinet SGG, Directions SGG, Ministères, SGPR, Président |
| 6 | `institutions` | Institutions | Présidence, Admin SGG, SG de chaque ministère, Admin SGG Digital |
| 7 | `reporting` | Matrice Reporting | Points focaux, SG Ministère, Dir. Reporting SGG, Présidence |
| 8 | `vue-consolidee` | Vue Consolidée | Président/VP, SGPR, SGG, Dir. GAR/Reporting |
| 9 | `synthese-executive` | Synthèse Exécutive | Analystes SGG, Dir. Études SGG, SGPR, Président/VP |
| 10 | `donnees-sectorielles` | Données Sectorielles | Ministères sectoriels, SGG/Dir. Statistiques, SGPR, Président/PM |

---

## 🔍 Matrice Rôle × Guide — État Actuel vs Cible

> ✅ = Déjà cohérent (le rôle matche un acteur)
> ❌ = Incohérent (le rôle devrait apparaître mais ne matche pas)
> ⬜ = Non concerné (ce rôle n'intervient pas dans ce processus)
> 🔧 = Keywords manquants mais acteur déjà présent

### Légende des colonnes : NOM = Nominations, GAR = Suivi GAR, JO = Journal Officiel, LEG = Cycle Législatif, GOP = e-GOP, INST = Institutions, REP = Matrice Reporting, VUE = Vue Consolidée, SYN = Synthèse Exécutive, SEC = Données Sectorielles

| Rôle | NOM | GAR | JO | LEG | GOP | INST | REP | VUE | SYN | SEC |
|------|-----|-----|-----|-----|-----|------|-----|-----|-----|-----|
| **president** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **vice-president** | ❌1 | ❌2 | ⬜ | ❌3 | ❌4 | ⬜ | ❌5 | ✅ | ✅ | ❌6 |
| **premier-ministre** | ❌7 | ❌8 | ⬜ | ✅ | ✅ | ⬜ | ❌9 | ❌10 | ❌11 | ✅ |
| **ministre** | ✅ | ❌12 | ⬜ | ✅ | ✅ | ⬜ | ❌13 | ⬜ | ⬜ | ✅ |
| **sgg-admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **sgg-directeur** | ✅ | ✅ | ⬜ | ✅ | ✅ | ⬜ | ✅ | ✅ | ✅ | ✅ |
| **sg-ministere** | ❌14 | ❌15 | ⬜ | ⬜ | ⬜ | ✅ | ❌16 | ⬜ | ⬜ | ❌17 |
| **sg-ministere-fp** | ❌14 | ❌15 | ⬜ | ⬜ | ⬜ | ✅ | ❌16 | ⬜ | ⬜ | ❌17 |
| **directeur-cgi** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **directeur-dgpn** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **sgpr** | ✅ | ❌18 | ⬜ | ⬜ | ✅ | ⬜ | ❌19 | ✅ | ✅ | ✅ |
| **assemblee** | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **senat** | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **conseil-etat** | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **cour-constitutionnelle** | ⬜ | ⬜ | ⬜ | ❌20 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **dgjo** | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **citoyen** | ⬜ | ⬜ | ❌21 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **professionnel-droit** | ⬜ | ⬜ | ❌22 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

**Total écarts identifiés : 22**

---

## 📝 Corrections Détaillées

### Phase 1 — ROLE_ACTOR_KEYWORDS (Formation.tsx, lignes 56-68)
> Ajouter les rôles manquants dans le mapping mots-clés

```typescript
const ROLE_ACTOR_KEYWORDS: Record<string, string[]> = {
    president: ["Président", "Chef de l'État", "Présidence", "Cabinet du Président"],
    "vice-president": ["VP République", "Vice-Président", "VP"],
    "premier-ministre": ["Premier Ministre", "VPG", "Gouvernement", "PM"],
    ministre: ["Ministère", "Ministre"],
    "sgg-admin": ["SGG", "Admin SGG", "Secrétaire Général"],
    "sgg-directeur": ["SGG", "Dir.", "Direction"],
    sgpr: ["SGPR", "Cabinet présidentiel"],
    dgjo: ["DGJO", "Diffusion", "Composition", "Journal Officiel"],
    "conseil-etat": ["Conseil d'État"],
    assemblee: ["Assemblée", "Parlement"],
    senat: ["Sénat", "Parlement"],
    // ─── AJOUTS Phase 1 ───
    "sg-ministere": ["SG Ministère", "SG du Ministère", "SG de chaque ministère", "Point focal", "Points focaux"],
    "sg-ministere-fp": ["SG Ministère", "SG du Ministère", "SG de chaque ministère", "Point focal", "Points focaux"],
    "cour-constitutionnelle": ["Cour Constitutionnelle", "Contrôle constitutionnel"],
    citoyen: ["Citoyen", "Grand public", "Public"],
    "professionnel-droit": ["Professionnel", "Juriste", "Avocat"],
};
```

**Fichier** : `Formation.tsx` lignes 56-68
**Effort** : ~5 min

---

### Phase 2 — Enrichir les acteurs des guides existants (Formation.tsx)

Voici chaque correction numérotée selon la matrice :

#### ❌1 — vice-president × Nominations
**Actuel** : VP absent des acteursPrincipaux Nominations
**Action** : Ajouter `{ nom: "Vice-Président", role: "Peut suppléer le Président au CM" }` dans acteursPrincipaux
**Étape concernée** : Étape 7 (Conseil des Ministres) → ajouter mention du VP dans la description
**Lignes** : ~101-107

#### ❌2 — vice-president × GAR
**Actuel** : Seul `Cabinet du Président` est mentionné
**Action** : Le VP a accès à la vue consolidée GAR. Remplacer `Cabinet du Président` par `Présidence (Président / VP)` dans acteursPrincipaux
**Lignes** : ~145-150

#### ❌3 — vice-president × Cycle Législatif
**Actuel** : Seul `Président` mentionné pour la promulgation
**Action** : Aucune action nécessaire (le VP ne promulgue pas) → **reclasser en ⬜**. Mais si VP a accès à ce module, ajouter comme observateur.
**Décision** : Ajouter `{ nom: "VP République", role: "Suit l'avancement des projets de loi" }` comme acteur observateur
**Lignes** : ~228-234

#### ❌4 — vice-president × e-GOP
**Actuel** : VP absent du guide e-GOP
**Action** : Ajouter `{ nom: "Vice-Président", role: "Peut suppléer le Président au CM" }` dans acteursPrincipaux
**Lignes** : ~269-274

#### ❌5 — vice-president × Matrice Reporting
**Actuel** : Seule `Présidence` (matche president) est mentionnée
**Action** : `Présidence` matche déjà via le keyword `VP` → NON, `Présidence` ne contient pas `VP`. **Ajout nécessaire**.
**Solution** : Changer `Présidence` en `Présidence (Président / VP)` dans acteursPrincipaux du reporting
**Lignes** : ~345-349

#### ❌6 — vice-president × Données Sectorielles
**Actuel** : `Président / PM` ne matche pas `VP`
**Action** : Changer `Président / PM` en `Président / VP / PM` dans acteursPrincipaux
**Lignes** : ~463-467

#### ❌7 — premier-ministre × Nominations
**Actuel** : PM absent des acteurs, mais il contresigne le décret
**Action** : Ajouter `{ nom: "Premier Ministre", role: "Contresigne le décret de nomination" }`
**Lignes** : ~101-107

#### ❌8 — premier-ministre × GAR
**Actuel** : Pas de mention du PM dans le GAR
**Action** : Ajouter `{ nom: "Premier Ministre", role: "Supervise l'exécution du PAG" }` dans acteursPrincipaux
**Lignes** : ~145-150

#### ❌9 — premier-ministre × Matrice Reporting
**Actuel** : PM absent du guide Matrice
**Action** : Le PM reçoit aussi le rapport. Ajouter comme acteur ou modifier la description de l'acteur Présidence.
**Solution** : Ajouter `{ nom: "PM / VPG", role: "Reçoit le rapport pour pilotage opérationnel" }`
**Lignes** : ~345-349

#### ❌10 — premier-ministre × Vue Consolidée
**Actuel** : `Président / VP République` ne contient ni `PM` ni `Gouvernement`
**Action** : Le PM a aussi accès. Ajouter `{ nom: "PM / Gouvernement", role: "Suit l'exécution opérationnelle du PAG" }`
**Lignes** : ~385-389

#### ❌11 — premier-ministre × Synthèse Exécutive
**Actuel** : `Président / VP` ne contient pas PM
**Action** : Ajouter `{ nom: "PM / Gouvernement", role: "Reçoit les synthèses pour coordination" }`
**Lignes** : ~424-428

#### ❌12 — ministre × GAR
**Actuel** : Aucun acteur ne matche le keyword `Ministère` dans le nom (seuls `Point focal GAR` et `SG du Ministère` sont présents)
**Action** : `SG du Ministère` contient `Ministère` → le keyword `Ministère` devrait déjà matcher!
**Vérification** : oui, `"SG du Ministère".toLowerCase().includes("ministère".toLowerCase())` = **true**. → ✅ Déjà OK, reclasser.
**Résultat** : ✅ Pas d'action

#### ❌13 — ministre × Matrice Reporting
**Actuel** : `SG Ministère` matche `Ministère` → le keyword matche déjà
**Vérification** : `"SG Ministère".includes("Ministère")` = **true** → ✅ Déjà OK
**Et** `Points focaux` → ne matche pas `Ministère` mais `SG Ministère` matche → ✅
**Résultat** : ✅ Pas d'action

#### ❌14 — sg-ministere × Nominations
**Actuel** : `sg-ministere` n'a pas de keywords. Mais une fois ajouté en Phase 1 avec `"SG du Ministère"`, l'acteur `Ministère proposant` matche-t-il ?
**Vérification** : `"Ministère proposant".includes("SG Ministère")` = false, `"Ministère proposant".includes("SG du Ministère")` = false
**Mais** : `"Ministère proposant".includes("Point focal")` = false non plus.
**Action** : Ajouter `"Ministère"` dans les keywords de `sg-ministere` OU ajouter un acteur SG dans le guide.
**Solution recommandée** : Ajouter `"Ministère"` dans les keywords de sg-ministere (ils travaillent sous le ministère)
**Lignes** : Phase 1 update

#### ❌15 — sg-ministere × GAR
**Actuel** : `SG du Ministère` est déjà acteur, et keywords inclura `"SG du Ministère"` après Phase 1 → ✅ matchera
**Résultat** : ✅ Résolu par Phase 1

#### ❌16 — sg-ministere × Matrice Reporting
**Actuel** : `SG Ministère` est acteur, et `"SG Ministère"` sera dans les keywords → ✅ matchera
**Résultat** : ✅ Résolu par Phase 1

#### ❌17 — sg-ministere × Données Sectorielles
**Actuel** : `Ministères sectoriels` est acteur. Le keyword `"Ministère"` matchera `"Ministères sectoriels"` → ✅ matchera
**Résultat** : ✅ Résolu par Phase 1

#### ❌18 — sgpr × GAR
**Actuel** : Aucun acteur ne contient `SGPR`, seul `Cabinet du Président` est présent.
**Mais** : Les keywords de `sgpr` incluent `Cabinet présidentiel`, and l'acteur est `Cabinet du Président`.
**Vérification** : `"Cabinet du Président".includes("Cabinet présidentiel")` = **false** (du ≠ el)
**Action** : Soit ajouter `"Cabinet du Président"` dans les keywords SGPR, soit renommer l'acteur.
**Solution** : Ajouter `"Cabinet du Président"` dans sgpr keywords OU ajouter un acteur SGPR dans le guide
**Recommandation** : Enrichir l'acteur GAR → remplacer `Cabinet du Président` par `SGPR / Cabinet présidentiel`
**Lignes** : ~150

#### ❌19 — sgpr × Matrice Reporting
**Actuel** : `Présidence` est acteur → le keyword `SGPR` ne matche pas `Présidence`
**Action** : L'acteur est bien `Présidence` ce qui matche `president` mais pas `sgpr`.
**Solution** : Ajouter `{ nom: "SGPR", role: "Valide le rapport avant transmission au Président" }` dans acteursPrincipaux
**Lignes** : ~345-349

#### ❌20 — cour-constitutionnelle × Cycle Législatif
**Actuel** : Pas mentionnée dans le cycle législatif. Pourtant elle peut être saisie pour contrôle de constitutionnalité (avant ou après promulgation).
**Action** : Ajouter `{ nom: "Cour Constitutionnelle", role: "Peut être saisie pour vérifier la constitutionnalité" }` dans acteursPrincipaux
**Étape** : Optionnellement, ajouter une étape 7 (contrôle de constitutionnalité, si saisie)
**Lignes** : ~228-242

#### ❌21 — citoyen × Journal Officiel
**Actuel** : Pas d'acteur `Citoyen` ou `Public` dans le guide JO
**Action** : Le citoyen est le destinataire final du JO. Ajouter `{ nom: "Citoyens / Public", role: "Consultent les textes publiés" }` dans acteursPrincipaux
**Lignes** : ~187-192

#### ❌22 — professionnel-droit × Journal Officiel
**Actuel** : Même problème que citoyen
**Action** : Couvert par l'ajout de `Citoyens / Public` si on ajoute `"Public"` dans les keywords de `professionnel-droit`
**Solution** : Ajouter `"Public"`, `"Citoyen"` dans les keywords de `professionnel-droit`
**Lignes** : Phase 1 update

---

### Phase 3 — Enrichir Demo.tsx `access[]` (Demo.tsx lignes 70-327)

Chaque carte démo doit lister dans `access[]` exactement les modules correspondant aux guides de formation dans lesquels le rôle intervient.

| Rôle | access[] actuel | access[] cible |
|------|-----------------|----------------|
| `vice-president` | 6 items | +5 : Nominations, GAR, e-GOP, Matrice Reporting, Données Sectorielles |
| `premier-ministre` | 4 items | Refonte : Nominations (contresigne), GAR (supervise PAG), Cycle Législatif, e-GOP (CM), Matrice Reporting, Vue Consolidée, Synthèse Exécutive, Données Sectorielles |
| `ministre` | 4 items | Refonte : Nominations (propose), GAR (données ministère), Cycle Législatif (rédige), e-GOP (CM), Matrice Reporting, Données Sectorielles |
| `sgg-admin` | 4 items | Refonte : Nominations, GAR, Journal Officiel, Cycle Législatif, e-GOP, Institutions, Matrice Reporting, Vue Consolidée, Synthèse, Données Sectorielles, Admin |
| `sgg-directeur` | 5 items | Refonte : Nominations, GAR, Cycle Législatif, e-GOP, Matrice Reporting, Vue Consolidée, Synthèse, Données Sectorielles |
| `sg-ministere` (×3) | 4 items | Refonte : Nominations (signale), GAR (saisie), Institutions (signale changements), Matrice Reporting (validation), Données Sectorielles |
| `sg-ministere-fp` | 4 items | Idem sg-ministere |
| `directeur-cgi` | 2 items | OK — 2 items (Saisie PTM) — pas d'intervention dans les guides Formation |
| `directeur-dgpn` | 2 items | OK — idem |
| `sgpr` | 4 items | Refonte : Nominations, GAR (supervision), e-GOP, Matrice Reporting (validation), Vue Consolidée, Synthèse Exécutive, Données Sectorielles |
| `assemblee` | 2 items | OK → Cycle Législatif (examen et vote) |
| `senat` | 2 items | OK → Cycle Législatif (examen en seconde lecture) |
| `conseil-etat` | 2 items | OK → Cycle Législatif (avis juridique) |
| `cour-constitutionnelle` | 2 items | Ajout : Cycle Législatif (contrôle constitutionnel) |
| `dgjo` | 3 items | OK → Journal Officiel |
| `citoyen` | 2 items | Ajout : Journal Officiel (consultation publique) |
| `professionnel-droit` | 3 items | OK → Journal Officiel (consultation avancée) |

---

## 📐 Ordre d'Implémentation

### Étape 1 — ROLE_ACTOR_KEYWORDS (5 min) ⚡
**Fichier** : `Formation.tsx` L56-68
- Ajouter 5 nouveaux rôles : `sg-ministere`, `sg-ministere-fp`, `cour-constitutionnelle`, `citoyen`, `professionnel-droit`
- Enrichir les keywords existants si nécessaire

### Étape 2 — Acteurs des guides (20 min) 🔧
**Fichier** : `Formation.tsx` — acteursPrincipaux de chaque guide
- Guide **Nominations** (+2 acteurs : VP, PM)
- Guide **GAR** : renommer acteur `Cabinet du Président` → `SGPR / Présidence`, ajouter PM
- Guide **Cycle Législatif** : ajouter Cour Constitutionnelle, VP observateur
- Guide **e-GOP** : ajouter VP
- Guide **Matrice Reporting** : changer `Présidence` → `Présidence (Président / VP)`, ajouter PM, ajouter SGPR
- Guide **Vue Consolidée** : ajouter PM
- Guide **Synthèse Exécutive** : ajouter PM
- Guide **Données Sectorielles** : changer `Président / PM` → `Président / VP / PM`
- Guide **Journal Officiel** : ajouter `Citoyens / Public`

### Étape 3 — Demo.tsx access[] (10 min) 📋
**Fichier** : `Demo.tsx` L70-327
- Mettre à jour les listes `access[]` de 9 comptes (VP, PM, Ministre, SGG-Admin, SGG-Dir, SG-Min ×4, SGPR, Cour Constitutionnelle)

### Étape 4 — Vérification par rôle (30 min) ✅
Pour chaque rôle, se connecter via /demo et vérifier sur /formation :
1. Tous les badges "Vous intervenez" s'affichent sur les bons guides
2. Le bandeau "VOTRE RÔLE DANS CE PROCESSUS" affiche le bon texte
3. Les étapes surlignées correspondent au rôle
4. La carte Acteurs montre le badge "Vous" sur le bon acteur

---

## ⏱️ Estimation

| Phase | Effort | Risque |
|-------|--------|--------|
| 1. Keywords | 5 min | Faible — ajout simple |
| 2. Acteurs guides | 20 min | Moyen — attention noms qui matchent plusieurs rôles |
| 3. Demo access | 10 min | Faible — mise à jour de listes |
| 4. Tests visuels | 30 min | Faible — vérification manuelle |
| **Total** | **~65 min** | |

---

## ⚠️ Points d'attention

### Collision de mots-clés
- `"SGG"` matche pour `sgg-admin` ET `sgg-directeur` — C'est correct : les deux rôles SGG doivent voir les mêmes badges
- `"Ministère"` matchera pour `ministre` ET `sg-ministere` — C'est correct : les deux interviennent dans les mêmes processus
- `"Parlement"` matche pour `assemblee` ET `senat` — C'est correct : même chambre parlementaire conceptuellement
- `"Présidence"` matche pour `president` — Attention à ne PAS l'ajouter dans `sgpr` pour éviter les faux positifs

### Rôles "Observateurs" vs "Acteurs"
- Les rôles `directeur-cgi` et `directeur-dgpn` n'interviennent dans **aucun** guide de formation. Ils travaillent uniquement dans le circuit PTM/PTG qui n'a pas de guide dédié. **Deux options** :
  1. Créer un guide "PTM/PTG" (hors périmètre de ce plan)
  2. Accepter qu'ils n'ont pas de badge "Vous intervenez" (cohérent car ils n'interviennent pas)
  → **Recommandation** : Option 2 pour ce plan, Option 1 en backlog

### Comptes `citoyen` et `professionnel-droit`
- Ces rôles n'ont accès qu'au Journal Officiel. Un seul guide leur est pertinent.
- C'est cohérent : ils sont le public destinataire final.

---

## ✅ Critère de succès (Definition of Done)

Pour **chaque** rôle :
1. ✅ Tous les guides où il intervient affichent le badge ⭐ "Vous intervenez"
2. ✅ Le bandeau "VOTRE RÔLE" montre le libellé correct
3. ✅ Les étapes surlignées en or correspondent aux actions du rôle
4. ✅ L'onglet "Qui intervient ?" affiche le badge "Vous" sur la bonne carte acteur
5. ✅ La liste `access[]` dans Demo.tsx est alignée avec les guides pertinents
6. ✅ Aucune collision de mots-clés ne produit de faux positif
