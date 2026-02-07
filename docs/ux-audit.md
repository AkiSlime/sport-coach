# Audit UX -- Custom Coach

**Date :** 7 fevrier 2026
**Auditeur :** Expert UX senior -- specialisation apps mobiles fitness
**Version analysee :** codebase source `src/`
**Stack :** React + TypeScript, Zustand, Tailwind CSS, Web Audio API, Speech Synthesis

---

## Table des matieres

1. [Audit des flux utilisateur](#1-audit-des-flux-utilisateur)
2. [Problemes UX identifies](#2-problemes-ux-identifies)
3. [Micro-interactions manquantes](#3-micro-interactions-manquantes)
4. [Accessibilite](#4-accessibilite)
5. [Etats vides, erreurs et cas limites](#5-etats-vides-erreurs-et-cas-limites)
6. [Recommandations classees P0/P1/P2](#6-recommandations-classees-p0p1p2)

---

## 1. Audit des flux utilisateur

### 1.1 Flux "Creer un programme"

**Chemin :** HomePage > bouton "Nouveau programme" > EditorPage

| Etape | Ce qui se passe | Evaluation |
|-------|----------------|------------|
| Clic "Nouveau programme" | `addProgram()` cree un programme vide nomme "Mon programme" avec 0 phases, puis naviguation vers `/program/:id` | Correct mais abrupt |
| Arrivee sur EditorPage | Page vide avec un input de nom pre-rempli "Mon programme" et un bouton "Ajouter une phase" | Manque d'onboarding |
| Ajout d'une phase | Modal avec 4 choix (Echauffement, Bloc Principal, Gainage, Etirements). La phase est ajoutee vide (0 exercice) | Pas de template pre-rempli |
| Ajout d'un exercice | Clic "+ Ajouter un exercice" cree un exercice nomme "Nouvel exercice" avec valeurs par defaut | Le nom generique oblige un edit immediat |
| Edition d'un exercice | Modal avec nom, toggle type (duree/reps), stepper +/- pour valeurs, repos apres | Fonctionnel mais manque de presets |

**Points de friction identifies :**
- Le programme est cree completement vide. L'utilisateur novice ne sait pas par ou commencer. La fonction `createDefaultPhases()` existe dans `defaults.ts` mais n'est jamais appelee a la creation.
- Chaque exercice ajoute s'appelle "Nouvel exercice", ce qui force l'utilisateur a editer immediatement. Pas de catalogue d'exercices a choisir.
- Aucune estimation de duree totale du programme affichee dans l'editeur.
- Pas de retour visuel (toast, animation) apres ajout de phase ou exercice.

### 1.2 Flux "Editer un programme"

**Chemin :** HomePage > clic sur carte programme ou bouton "Editer" > EditorPage

| Etape | Ce qui se passe | Evaluation |
|-------|----------------|------------|
| Navigation vers editeur | Le programme se charge, phases collapsables | Correct |
| Modification du nom | Input direct dans le header, sauvegarde automatique via store | Bon pattern |
| Reordonner exercices | Fleches haut/bas sur chaque exercice | Pas de drag & drop |
| Supprimer un exercice | Clic sur X, suppression immediate sans confirmation | Dangereux |
| Supprimer une phase | Clic poubelle > ConfirmDialog | Correct |
| Modifier un exercice | Clic sur la ligne > Modal d'edition | Correct mais pas evident |

**Points de friction identifies :**
- La suppression d'exercice est instantanee sans ConfirmDialog (contrairement aux phases et programmes qui en ont un). Risque de perte accidentelle.
- Les fleches de reordonnement (`p-0.5`, `w-3.5 h-3.5`) sont extremement petites pour un usage tactile. Cibles de 14px, bien en dessous du minimum Apple de 44px.
- Le clic sur un exercice pour l'editer n'a aucune affordance visuelle (pas de chevron, pas d'icone "edit"). L'utilisateur doit deviner que la ligne est cliquable.
- Impossible de reordonner les phases (la fonction `movePhase` existe dans le store mais n'est pas exposee dans l'UI).
- Impossible de deplacer un exercice d'une phase a une autre.
- Pas d'undo/redo apres une action destructive.

### 1.3 Flux "Jouer un workout"

**Chemin :** HomePage ou EditorPage > bouton "Demarrer" > PlayerPage

| Etape | Ce qui se passe | Evaluation |
|-------|----------------|------------|
| Lancement | `flattenProgram()` genere la liste des steps, le workout demarre immediatement en `playing` | Aucun countdown de preparation |
| Exercice chronometre | Cercle SVG animee, timer decompte, beep a 3-2-1, annonce vocale du nom | Bon feedback |
| Exercice en repetitions | Cercle avec nombre de reps, bouton "Termine" | Correct |
| Repos | Timer ambree, double beep | Correct |
| Pause | Bouton central pause/resume | Correct |
| Skip | Bouton suivant | Correct mais sans confirmation |
| Arret | Bouton stop > ConfirmDialog | Correct |
| Fin | Ecran de felicitation avec duree totale et bouton "Retour" | Minimaliste |

**Points de friction identifies :**
- **Demarrage brutal :** Le workout commence immediatement sans countdown de preparation (3, 2, 1, Go!). Le type `PlayerStatus` prevoit un etat `countdown` mais il n'est jamais utilise -- le store passe directement a `playing`.
- **Pas de preview du workout :** L'utilisateur ne voit pas la liste des exercices avant de commencer. Pas de recapitulatif (nombre de steps, duree estimee).
- **Pas de visibilite sur l'exercice suivant :** Pendant le workout, l'utilisateur ne voit que l'exercice en cours. Pas d'indication "Prochain: Pompes".
- **Navigation arriere impossible :** Pas de bouton "precedent" pour revenir a l'exercice qu'on vient de passer.
- **Ecran de fin pauvre :** Pas de statistiques detaillees (exercices completes, calories estimees, repartition par phase). Pas de partage. Pas d'historique.
- **Guide d'exercice pendant repos :** Le panel `ExerciseGuidePanel` se ferme automatiquement a chaque changement de step (via `useEffect` sur `currentStepIndex`), mais il ne s'affiche pas pendant les repos. L'utilisateur ne peut pas consulter le guide du prochain exercice pendant un temps de repos.

---

## 2. Problemes UX identifies

### 2.1 Frictions majeures

#### F1 -- Demarrage a froid sans onboarding
**Localisation :** `HomePage.tsx` + `useProgramStore.ts`
**Probleme :** Un nouvel utilisateur arrive sur un EmptyState generique ("Aucun programme / Creez votre premier programme d'entrainement"). Pas de programme template, pas de wizard, pas de proposition de programme par defaut.
**Impact :** Taux d'abandon eleve sur le premier usage. L'utilisateur ne sait pas quoi creer.

#### F2 -- Absence de countdown avant exercice
**Localisation :** `usePlayerStore.ts` (l.31-41)
**Probleme :** `startWorkout()` met directement le status a `playing`. L'etat `countdown` defini dans les types n'est jamais utilise. L'utilisateur n'a aucun temps de preparation.
**Impact :** L'utilisateur rate les premieres secondes de chaque workout. Frustration et sentiment de ne pas etre pret.

#### F3 -- Suppression d'exercice sans confirmation
**Localisation :** `EditorPage.tsx` (l.258-267)
**Probleme :** Le bouton X supprime l'exercice immediatement via `removeExercise()` sans passer par `ConfirmDialog`. Incoherent avec la suppression de phase/programme qui demande confirmation.
**Impact :** Perte de donnees accidentelle, surtout sur mobile ou les faux-clics sont frequents.

#### F4 -- Cibles tactiles sous-dimensionnees
**Localisation :** `EditorPage.tsx` -- fleches de reordonnement (l.208-231)
**Probleme :** Les boutons fleches haut/bas font `p-0.5` avec une icone de `w-3.5 h-3.5` (14px). Le bouton de suppression d'exercice fait `p-1.5` avec une icone de `w-4 h-4` (16px). Bien en dessous du minimum recommande de 44x44px (Apple HIG) / 48x48dp (Material).
**Impact :** Erreurs de tap frequentes, frustration sur mobile.

#### F5 -- Absence de feedback apres actions
**Localisation :** Global (toutes les pages)
**Probleme :** Aucun toast, snackbar ou feedback visuel apres : duplication de programme, ajout de phase, ajout d'exercice, sauvegarde de modifications. Les actions se produisent silencieusement.
**Impact :** L'utilisateur doute que son action a ete prise en compte. Manque de confiance dans l'app.

### 2.2 Confusions potentielles

#### C1 -- Zone cliquable ambigue sur les cartes programme
**Localisation :** `HomePage.tsx` (l.36-86)
**Probleme :** Sur la carte programme, la zone du haut (nom + stats) navigue vers l'editeur, tandis que les boutons en bas font des actions differentes. L'ensemble de la carte a un `active:bg-slate-800` mais seule une partie est cliquable pour la navigation. Confusion entre clic sur le titre vs clic sur "Editer" (meme destination).
**Impact :** L'utilisateur ne sait pas ou cliquer. Le bouton "Editer" et le clic sur le titre font exactement la meme chose.

#### C2 -- "Demarrer" present a deux endroits
**Localisation :** `HomePage.tsx` (l.59) + `EditorPage.tsx` (l.307)
**Probleme :** Le bouton "Demarrer" existe sur la carte programme (HomePage) ET en bas de l'editeur. Pas de distinction visuelle ou textuelle entre les deux.
**Impact :** Mineur mais cree une ambiguite sur le flux attendu (dois-je editer avant de lancer ?).

#### C3 -- Unites de temps peu lisibles
**Localisation :** `EditorPage.tsx` (l.250-253)
**Probleme :** Le repos s'affiche comme `+15s repos` (avec le "s" colle au chiffre sans espace). Le format compact peut etre mal lu sur petit ecran.
**Impact :** Lisibilite reduite, surtout pour les valeurs courtes.

#### C4 -- Distinction exercice chronometre vs repetitions pas assez marquee
**Localisation :** `EditorPage.tsx` (l.244-248)
**Probleme :** Dans la liste des exercices, un exercice chronometre affiche "0:30" et un exercice en reps affiche "10 rep." Les deux utilisent le meme style `text-xs text-slate-400`. Pas d'icone differenciante.
**Impact :** L'utilisateur ne distingue pas immediatement le type d'exercice dans la liste.

### 2.3 Manques de feedback critiques

#### MF1 -- Pas d'indication de sauvegarde
**Probleme :** Le store utilise `zustand/persist` pour sauvegarder automatiquement dans localStorage, mais l'utilisateur n'a aucune indication visuelle que ses modifications sont sauvegardees. Pas de badge "Sauvegarde", pas d'horodatage de derniere modification.

#### MF2 -- Pas de feedback audio/haptique sur les boutons du player
**Localisation :** `PlayerPage.tsx` (l.210-258)
**Probleme :** Les boutons stop, restart, pause, skip n'ont aucun feedback haptique (`navigator.vibrate()`). Seuls les changements de step ont un feedback audio.

#### MF3 -- Pas de retour apres duplication
**Localisation :** `HomePage.tsx` (l.74-76)
**Probleme :** `duplicateProgram()` cree la copie silencieusement. Pas de scroll vers la copie, pas de toast "Programme duplique", pas de highlight du nouvel element.

---

## 3. Micro-interactions manquantes

### 3.1 Transitions et animations

| Element | Etat actuel | Recommandation |
|---------|-------------|----------------|
| Navigation entre pages | Aucune transition. Changement sec entre HomePage, EditorPage, PlayerPage | Ajouter `framer-motion` ou `View Transitions API` pour des transitions fluides entre pages (slide left/right) |
| Ajout d'exercice dans la liste | L'element apparait instantanement | Animer l'entree avec un slide-down + fade-in (150ms ease-out) |
| Suppression d'exercice | Disparition instantanee | Animer la sortie avec un slide-left + fade-out (200ms) avant le `removeExercise()` |
| Collapse/expand des phases | Le contenu apparait/disparait sans transition (`{!isCollapsed && ...}`) | Animer la hauteur avec `max-height` + `overflow: hidden` + transition (similaire a ce qui est fait dans `ExerciseGuidePanel`) |
| Ouverture de modal | Apparition instantanee | Ajouter un backdrop fade-in (200ms) et un slide-up du contenu (300ms spring) |
| Passage exercice suivant (Player) | Changement instantane du label et du timer | Ajouter un crossfade ou un slide-up sur le nom de l'exercice + animation du ring reset |
| Barre de progression (Player) | `transition-all duration-500` deja en place | Correct -- garder tel quel |
| Timer ring SVG (Player) | `transition-all duration-1000 ease-linear` | Correct pour le decompte fluide |
| Boutons +/- dans l'editeur d'exercice | `active:bg-slate-600` uniquement | Ajouter un scale pulse (0.9 > 1.0) de 100ms |

### 3.2 Feedback haptique

| Moment | Implementation actuelle | Recommandation |
|--------|------------------------|----------------|
| Tap sur bouton d'action | Aucun | `navigator.vibrate(10)` -- vibration subtile |
| Changement d'exercice (Player) | Audio uniquement | `navigator.vibrate(50)` -- vibration moyenne |
| Fin de countdown 3-2-1 | Beep audio | `navigator.vibrate([100, 50, 100])` -- pattern double |
| Fin du workout | Aucun | `navigator.vibrate([100, 100, 100, 100, 300])` -- pattern celebration |
| Suppression (swipe ou bouton) | Aucun | `navigator.vibrate(20)` -- vibration legere d'avertissement |
| Erreur / action impossible | Aucun | `navigator.vibrate([50, 30, 50])` -- pattern d'erreur |

### 3.3 Animations manquantes specifiques

**Ecran de fin du workout :**
Le checkmark apparait statiquement. Recommandation : animer le cercle vert avec un scale-up (0 > 1.0, spring, 600ms) puis le checkmark en draw-on SVG (stroke-dasharray animation, 400ms).

**Changement de step dans le player :**
Pas d'animation de transition entre les exercices. Recommandation : ajouter une animation de type "card flip" ou "slide-up" sur le conteneur principal (nom + timer) pour marquer visuellement le changement.

**Timer circle reset :**
Quand on passe a un nouveau step chronometre, le ring SVG saute directement a la nouvelle position. Recommandation : reset a 100% d'un coup puis demarrer l'animation de decompte.

**Barre de progression globale :**
La progression est calculee par `(currentStepIndex / steps.length) * 100`. Le dernier step ne fait jamais 100% car l'index max est `length - 1`. Le 100% n'est atteint qu'a l'ecran "finished". Recommandation : utiliser `((currentStepIndex + 1) / steps.length) * 100` pour que la barre progresse jusqu'a 100% sur le dernier exercice.

---

## 4. Accessibilite

### 4.1 Cibles tactiles (Touch Targets)

| Element | Taille actuelle | Minimum requis (Apple HIG / Material) | Verdict |
|---------|-----------------|---------------------------------------|---------|
| Fleches reordonnement (EditorPage) | ~14x14px (`p-0.5`, icone `w-3.5 h-3.5`) | 44x44px / 48x48dp | **ECHEC CRITIQUE** |
| Bouton suppression exercice (EditorPage) | ~28x28px (`p-1.5`, icone `w-4 h-4`) | 44x44px / 48x48dp | **ECHEC** |
| Bouton suppression phase (EditorPage) | ~30x30px (`p-1.5`, icone `w-4 h-4`) | 44x44px / 48x48dp | **ECHEC** |
| Bouton retour (EditorPage) | ~36x36px (`p-2`) | 44x44px | **ECHEC** (proche mais insuffisant) |
| Boutons player (stop, restart, skip) | 48x48px (`w-12 h-12`) | 44x44px / 48x48dp | **OK** |
| Bouton principal player (pause/resume) | 80x80px (`w-20 h-20`) | 44x44px | **OK** |
| Boutons +/- editeur exercice | 48x48px (`w-12 h-12`) | 44x44px | **OK** |
| Boutons dans les cartes programme | Taille variable via `Button` `size="sm"` (~30px hauteur) | 44x44px | **ECHEC** |
| Lignes d'exercice cliquables | Hauteur suffisante (~48px grace au padding `p-3`) | 44x44px | **OK** |

### 4.2 Contrastes (WCAG 2.1)

| Element | Couleur texte | Couleur fond | Ratio estime | Minimum AA | Verdict |
|---------|---------------|--------------|-------------|------------|---------|
| Texte principal (`text-slate-100` sur `bg-slate-950`) | #f1f5f9 | #020617 | ~18:1 | 4.5:1 | **OK** |
| Texte secondaire (`text-slate-400` sur `bg-slate-950`) | #94a3b8 | #020617 | ~7.5:1 | 4.5:1 | **OK** |
| Texte tertiaire (`text-slate-500` sur `bg-slate-950`) | #64748b | #020617 | ~4.8:1 | 4.5:1 | **LIMITE** |
| Texte sur carte (`text-slate-400` sur `bg-slate-900`) | #94a3b8 | #0f172a | ~6.5:1 | 4.5:1 | **OK** |
| Texte desactive (`disabled:opacity-50`) | Variable | Variable | ~2-3:1 | 3:1 (AA large) | **ECHEC** pour texte de petite taille |
| Compteur step (`text-slate-600` sur fond) | #475569 | #020617 | ~3.2:1 | 4.5:1 | **ECHEC** |
| Label "exo" dans phase header (`text-xs text-slate-500`) | #64748b | #0f172a | ~4.2:1 | 4.5:1 (small text) | **ECHEC** |
| Bouton emeraude (`bg-emerald-600 text-white`) | #ffffff | #059669 | ~4.6:1 | 4.5:1 | **LIMITE** |
| Texte ambre repos (`text-amber-400`) | #fbbf24 | #020617 | ~11.5:1 | 4.5:1 | **OK** |

### 4.3 Attributs ARIA et semantique

**Problemes identifies :**

| Probleme | Localisation | Impact |
|----------|-------------|--------|
| Aucun `aria-label` sur les boutons icones | EditorPage (fleches, poubelle, X), PlayerPage (stop, restart, skip) | Les lecteurs d'ecran ne peuvent pas identifier ces boutons. Un utilisateur malvoyant entend "bouton" sans description. |
| Le bouton pause/resume n'a pas d'`aria-label` dynamique | `PlayerPage.tsx` (l.233-247) | Le lecteur d'ecran ne sait pas si le bouton est en etat "pause" ou "reprendre". |
| Pas de `role="progressbar"` sur la barre de progression | `PlayerPage.tsx` (l.111-116) | La barre n'est pas perceptible par les technologies d'assistance. |
| Pas d'`aria-valuenow`/`aria-valuemax` sur le timer | `PlayerPage.tsx` (l.144-175) | Le decompte n'est pas accessible. |
| Le toggle collapse des phases n'a pas d'`aria-expanded` | `EditorPage.tsx` (l.121-157) | L'etat ouvert/ferme n'est pas communique. |
| Le modal n'a pas de `role="dialog"` ni d'`aria-modal` | `Modal.tsx` | Non conforme WCAG. |
| Pas de `focus trap` dans les modals | `Modal.tsx` | L'utilisateur peut tab en dehors du modal. |
| Le toggle type (duree/reps) n'a pas de `role="tablist"`/`role="tab"` | `EditorPage.tsx` (l.401-422) | Non identifiable comme un controle de segmentation. |
| Pas d'`aria-live` pour les annonces d'exercice | `PlayerPage.tsx` | Les changements de step ne sont pas annonces aux lecteurs d'ecran (mais la speech synthesis compense partiellement). |
| Les inputs number n'ont pas de `label` associe via `htmlFor`/`id` | `EditorPage.tsx` (inputs cycles, repos) | Non conforme. |

### 4.4 Navigation clavier

| Probleme | Detail |
|----------|--------|
| Pas de `focus-visible` distinct du `:focus` | Les outlines de focus ne sont pas visibles (le CSS global desactive potentiellement les styles par defaut) |
| Le modal n'a pas de fermeture par Escape | `Modal.tsx` ne gere pas l'evenement `keydown` pour la touche Escape |
| Pas de focus trap dans le modal | Le tab peut sortir du modal et interagir avec le contenu derriere |
| L'ordre de tabulation dans le player n'est pas optimise | Les boutons secondaires (stop, restart) sont avant le bouton principal (pause/resume) dans le DOM |

---

## 5. Etats vides, erreurs et cas limites

### 5.1 Etats vides

| Etat | Implementation actuelle | Evaluation |
|------|------------------------|------------|
| Aucun programme (HomePage) | `EmptyState` avec titre + sous-titre | Correct mais minimaliste. Pas d'illustration engageante, pas de CTA distinct du bouton global "Nouveau programme". |
| Programme avec 0 phases (EditorPage) | Seul le bouton "Ajouter une phase" est visible | Pas de message explicatif. L'utilisateur novice est perdu. Devrait proposer un template ou un tutoriel inline. |
| Phase avec 0 exercice (EditorPage) | Seul le bouton "+ Ajouter un exercice" est visible dans la phase | Acceptable mais pourrait afficher un hint "Ajoutez votre premier exercice". |
| Programme sans exercice jouable | Le bouton "Demarrer" est `disabled` quand toutes les phases ont 0 exercice (`program.phases.every(p => p.exercises.length === 0)`) | Correct mais pas de tooltip ou message expliquant pourquoi le bouton est desactive. |

### 5.2 Gestion des erreurs

| Scenario | Gestion actuelle | Evaluation |
|----------|-----------------|------------|
| Programme introuvable (EditorPage) | Affiche "Programme introuvable" centre | **Insuffisant** : pas de bouton retour, pas de lien vers la home. L'utilisateur est bloque. |
| Programme introuvable (PlayerPage) | Affiche "Programme introuvable" centre | **Insuffisant** : meme probleme. |
| URL invalide / route inexistante | Aucune route 404 definie dans `App.tsx` | **Manquant** : une URL incorrecte affiche une page blanche. |
| localStorage corrompu ou plein | Aucune gestion d'erreur dans le store Zustand persist | **Risque** : si localStorage est plein ou les donnees corrompues, l'app peut planter silencieusement. |
| Audio non disponible | `try/catch` vide dans `audio.ts` | Correct mais l'utilisateur ne sait pas que l'audio est indisponible. |
| Speech Synthesis indisponible | `try/catch` vide + check `'speechSynthesis' in window` | Correct mais pas de fallback visuel (par exemple un texte plus gros a la place de l'annonce vocale). |
| Wake Lock refuse | `try/catch` vide dans `useWakeLock.ts` | Correct mais l'utilisateur devrait etre averti que l'ecran pourrait s'eteindre. |
| Navigateur ne supportant pas `AudioContext` | `try/catch` silencieux | Devrait afficher un avertissement au demarrage du workout. |

### 5.3 Cas limites

| Cas | Comportement actuel | Risque |
|-----|---------------------|--------|
| Workout avec uniquement des exercices en reps (aucun chronometre) | Le timer total (`totalElapsedSeconds`) tourne indefiniment puisque seul l'utilisateur avance via "Termine" | L'utilisateur peut oublier l'app ouverte et le compteur monte sans fin. Pas de rappel visuel ou sonore. |
| Phase "main" avec 20 cycles | Le store accepte `max={20}` mais `flattenProgram()` genere potentiellement des centaines de steps | Risque de performance du composant Player si trop de steps. Pas de warning. |
| Exercice avec 0 seconde de duree | L'input accepte `min={1}` dans le stepper mais `onChange` accepte `Math.max(1, ...)` | Protege mais si `durationSeconds` etait 0 pour un exercice `timed`, le `tick()` passerait immediatement au step suivant. |
| Nom d'exercice vide | Le champ est un `input type="text"` sans `required` ni validation | Un exercice avec un nom vide sera annonce comme "" par la speech synthesis et affiche comme une ligne vide. |
| Nom de programme vide | Le champ est un `input type="text"` sans `required` | Un programme sans nom apparaitrait comme une carte vide sur la HomePage. |
| Tab en arriere-plan pendant longtemps | `useTimer` gere la visibilite et rattrape les ticks manques | Correct -- bien implemente. |
| Double-mount StrictMode | Le `useEffect` dans PlayerPage utilise `programId` comme dep et `stopWorkout` dans le cleanup | Correct -- gere proprement. |
| Duplication d'un programme vide | `duplicateProgram()` clone un programme sans phases | Fonctionne mais cree un doublon inutile. Pas de warning. |
| Tres long nom d'exercice ou de programme | Aucun `max-length` sur les inputs, aucun `truncate` ou `line-clamp` sur l'affichage | Le texte peut deborder de son conteneur sur petit ecran, casser le layout des cartes ou du player. |

---

## 6. Recommandations classees P0/P1/P2

> **P0** = Critique -- a corriger avant toute mise en production
> **P1** = Important -- a corriger dans le sprint suivant
> **P2** = Amelioration -- a planifier dans la roadmap

### P0 -- Critiques

| # | Recommandation | Justification | Fichiers concernes |
|---|---------------|---------------|--------------------|
| P0-1 | **Ajouter un countdown de preparation (3, 2, 1, Go!)** avant le premier exercice | Le workout demarre brutalement. L'utilisateur n'est pas pret. L'etat `countdown` existe deja dans les types mais n'est pas implemente. | `usePlayerStore.ts`, `PlayerPage.tsx` |
| P0-2 | **Agrandir toutes les cibles tactiles a minimum 44x44px** | Les fleches de reordonnement (14px), boutons de suppression (28px) et boutons d'action sur les cartes sont inutilisables au doigt. Non-conforme Apple HIG et Material Design. | `EditorPage.tsx`, `HomePage.tsx`, `Button.tsx` |
| P0-3 | **Ajouter des `aria-label` sur tous les boutons icones** | Les boutons sans texte (fleches, poubelle, X, stop, restart, skip, pause/resume) sont invisibles aux lecteurs d'ecran. Non-conforme WCAG 2.1 A. | `EditorPage.tsx`, `PlayerPage.tsx` |
| P0-4 | **Ajouter une confirmation avant suppression d'exercice** | Incoherent avec le reste de l'app (phases et programmes ont un ConfirmDialog). Perte de donnees accidentelle sur mobile. | `EditorPage.tsx` |
| P0-5 | **Ajouter une route 404 et un bouton retour sur les ecrans d'erreur** | L'utilisateur est bloque sur "Programme introuvable" sans moyen de retour. Une URL invalide affiche une page blanche. | `App.tsx`, `EditorPage.tsx`, `PlayerPage.tsx` |
| P0-6 | **Ajouter `role="dialog"`, `aria-modal="true"` et un focus trap sur les modals** | Le composant Modal est non-conforme WCAG. Le focus s'echappe du modal, pas de fermeture par Escape. | `Modal.tsx` |

### P1 -- Importants

| # | Recommandation | Justification | Fichiers concernes |
|---|---------------|---------------|--------------------|
| P1-1 | **Proposer un programme template a la premiere ouverture** | `createDefaultPhases()` existe dans `defaults.ts` mais n'est jamais appelee. L'onboarding est vide. Proposer "Commencer avec un programme exemple" sur l'EmptyState. | `HomePage.tsx`, `defaults.ts` |
| P1-2 | **Afficher l'exercice suivant pendant le workout** | L'utilisateur ne sait pas ce qui vient apres. Ajouter un label "Prochain: [nom]" sous le timer ou dans la zone de controles. | `PlayerPage.tsx` |
| P1-3 | **Ajouter un recapitulatif avant le lancement du workout** | Ecran intermediaire avec la liste des exercices, la duree estimee, le nombre de steps. Bouton "C'est parti" pour confirmer. | `PlayerPage.tsx` ou nouvelle page `PreviewPage.tsx` |
| P1-4 | **Ajouter des toasts/snackbars de feedback** | Apres duplication, ajout de phase, ajout d'exercice, sauvegarde. Utiliser un systeme de notifications leger (ex: react-hot-toast ou composant custom). | Global |
| P1-5 | **Ajouter des transitions de page** | Utiliser la View Transitions API ou framer-motion pour des transitions fluides (slide horizontal entre pages, slide-up pour le player). | `App.tsx`, pages |
| P1-6 | **Implementer le drag & drop pour reordonner les exercices** | Les fleches haut/bas sont trop petites et laborieuses. Un drag & drop natif (dnd-kit ou react-beautiful-dnd) serait plus naturel sur mobile. | `EditorPage.tsx` |
| P1-7 | **Ajouter un bouton "precedent" dans le player** | Permettre de revenir a l'exercice precedent (utiliser `skipStep` en sens inverse). | `PlayerPage.tsx`, `usePlayerStore.ts` |
| P1-8 | **Ajouter des `aria-expanded` sur les headers de phases collapsables** | Non-conforme WCAG pour les controles d'accordeon. | `EditorPage.tsx` |
| P1-9 | **Exposer le reordonnement des phases dans l'UI** | La fonction `movePhase` existe dans le store mais n'est pas accessible dans l'editeur. | `EditorPage.tsx` |
| P1-10 | **Ajouter la validation des champs (nom non vide, duree > 0)** | Les noms vides et les valeurs aberrantes ne sont pas bloques. Ajouter des gardes de validation avec messages d'erreur inline. | `EditorPage.tsx` |

### P2 -- Ameliorations

| # | Recommandation | Justification | Fichiers concernes |
|---|---------------|---------------|--------------------|
| P2-1 | **Enrichir l'ecran de fin** avec statistiques detaillees (duree par phase, exercices completes, estimation calories) | L'ecran de fin actuel ne montre que la duree totale. Opportunite d'engagement et de motivation. | `PlayerPage.tsx` |
| P2-2 | **Ajouter un historique des seances** | Pas de persistance des sessions passees. L'utilisateur ne peut pas suivre sa progression dans le temps. | Nouveau store + page |
| P2-3 | **Ajouter le feedback haptique** (`navigator.vibrate()`) sur les interactions cles du player et les actions destructives | Renforce le feedback sensoriel sur mobile. | `PlayerPage.tsx`, `EditorPage.tsx` |
| P2-4 | **Animer l'apparition/disparition des exercices** dans la liste de l'editeur (slide + fade) | Renforce la comprehension spatiale lors de l'ajout/suppression. | `EditorPage.tsx` |
| P2-5 | **Ajouter un catalogue d'exercices** avec recherche pour eviter la saisie manuelle | Plutot que "Nouvel exercice" generique, proposer une liste predeterminee basee sur les guides existants (`exercise-guides.ts`). | `EditorPage.tsx`, `exercise-guides.ts` |
| P2-6 | **Afficher une estimation de la duree totale du programme** dans l'editeur | L'utilisateur ne sait pas combien de temps durera son workout. Calculable a partir de `flattenProgram()`. | `EditorPage.tsx` |
| P2-7 | **Ajouter un mode paysage optimise pour le Player** | Sur tablette ou telephone en mode paysage, le layout actuel (vertical) n'est pas optimal. | `PlayerPage.tsx`, CSS |
| P2-8 | **Ajouter la gestion du localStorage corrompu** avec try/catch au chargement et proposition de reset | Si les donnees sont corrompues, l'app plante silencieusement. Ajouter un error boundary. | `useProgramStore.ts`, `App.tsx` |
| P2-9 | **Ajouter un mode sombre/clair** ou au moins gerer le `prefers-color-scheme` | L'app est en dark mode uniquement. Certains utilisateurs preferent le mode clair, surtout en exterieur. | `index.css`, `App.tsx` |
| P2-10 | **Supporter l'export/import de programmes** (JSON, partage via lien) | Pas de moyen de sauvegarder en dehors de localStorage ni de partager un programme avec quelqu'un. | Nouveau feature |
| P2-11 | **Ajouter `line-clamp` et `max-length`** sur les noms de programme et d'exercice | Les noms longs cassent le layout. Tronquer l'affichage et limiter la saisie. | `HomePage.tsx`, `EditorPage.tsx`, `PlayerPage.tsx` |
| P2-12 | **Ajouter le son de transition entre exercices pendant les repos** et montrer le guide du prochain exercice | Le guide se ferme automatiquement a chaque changement de step. Pendant le repos, montrer le prochain exercice et son guide serait utile. | `PlayerPage.tsx`, `ExerciseGuidePanel.tsx` |

---

## Annexe : Resume visuel des priorites

```
P0 (6 items)  ████████████████████  Bloquants / conformite / securite donnees
P1 (10 items) ██████████████████████████████████  Experience utilisateur fondamentale
P2 (12 items) ██████████████████████████████████████████  Polish et features avancees
```

**Estimation d'effort globale :**
- P0 : ~2-3 jours de developpement
- P1 : ~5-7 jours de developpement
- P2 : ~10-15 jours de developpement (variable selon les features)

---

*Document genere a partir de l'analyse statique du code source. Une session de tests utilisateurs sur appareil reel est recommandee pour valider les hypotheses de friction et prioriser les P1/P2.*
