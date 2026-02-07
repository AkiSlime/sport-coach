# Rapport de Revue QA -- Custom Coach

**Date** : 2026-02-07
**Auditeur** : QA Senior -- Revue exhaustive de l'application
**Perimetre** : Totalite du code source (`src/`), configuration Vite/PWA, `index.html`
**Verdict global** : L'application est fonctionnelle et bien structuree pour un MVP, mais presente plusieurs faiblesses structurelles qui empechent une mise en production sereine, notamment sur la robustesse du timer, la securite des donnees localStorage, l'accessibilite et le mode offline.

---

## Table des matieres

1. [Bugs potentiels](#1-bugs-potentiels)
2. [Problemes UX critiques](#2-problemes-ux-critiques)
3. [Incoherences visuelles](#3-incoherences-visuelles)
4. [Performance](#4-performance)
5. [Accessibilite](#5-accessibilite)
6. [Cas limites non geres](#6-cas-limites-non-geres)
7. [Problemes mobile](#7-problemes-mobile)
8. [PWA et mode offline](#8-pwa-et-mode-offline)
9. [Code smells](#9-code-smells)
10. [Securite](#10-securite)
11. [Recommandations classees par severite](#11-recommandations-classees-par-severite)

---

## 1. Bugs potentiels

### 1.1 -- BLOQUANT -- Race condition du timer avec `tick()` en boucle lors du retour d'onglet

**Fichier** : `src/hooks/useTimer.ts` (lignes 39-56)

Quand l'utilisateur revient sur l'onglet apres un long moment en arriere-plan, la boucle `for (let i = 0; i < secondsElapsed; i++) { tick() }` appelle `tick()` de maniere synchrone N fois de suite. Chaque appel a `tick()` utilise `get()` pour lire l'etat, mais `set()` de Zustand n'est pas forcement flush entre chaque appel synchrone. Si l'utilisateur quitte l'onglet pendant 5 minutes (300 ticks), cela cree 300 appels successifs a `tick()` qui :

- Pourraient traverser plusieurs steps sans declencher les signaux audio correspondants (car `useAudioSignals` ne reagit qu'aux changements de `currentStepIndex` via useEffect, pas aux transitions intermediaires).
- Bloquent le thread principal pendant la boucle (pas de yield entre les iterations).
- Peuvent provoquer un depassement de la fin du workout sans afficher correctement l'ecran "termine".

**Solution** : Remplacer la boucle par un calcul direct de la position dans le workout basee sur le temps absolu ecoule. Stocker un `startedAt: number` (timestamp) dans le store et calculer `totalElapsedSeconds = Math.floor((Date.now() - startedAt) / 1000)` a chaque frame. Deduire le `currentStepIndex` et `secondsRemaining` par sommation des durees des steps.

### 1.2 -- BLOQUANT -- Le timer principal (requestAnimationFrame) ne tourne pas en arriere-plan

**Fichier** : `src/hooks/useTimer.ts` (lignes 18-35)

`requestAnimationFrame` est throttle a ~1 fps (voire stoppe) par les navigateurs quand l'onglet est en arriere-plan. Le mecanisme de rattrapage via `visibilitychange` (ligne 39) ne se declenche qu'au retour au premier plan. Pendant que l'onglet est en arriere-plan :

- Le timer ne progresse pas du tout.
- Les etapes ne s'enchainent pas.
- Les signaux audio ne sont pas joues.

Pour un timer d'entrainement sportif, l'utilisateur s'attend a ce que le minuteur continue MEME si le telephone se verrouille ou si une autre app est ouverte.

**Solution** : Utiliser `setInterval` avec une reference de temps absolue (`Date.now()`) plutot que `requestAnimationFrame`. `setInterval` a 1000ms continue a tourner en arriere-plan (avec un throttle de 1s minimum, ce qui est acceptable). Combiner avec le `visibilitychange` pour rattraper les eventuels decalages.

### 1.3 -- MAJEUR -- `skipStep()` et `markRepsDone()` sont des copies exactes

**Fichier** : `src/store/usePlayerStore.ts` (lignes 95-122)

`skipStep()` et `markRepsDone()` sont strictement identiques dans leur implementation. Ce n'est pas un bug fonctionnel mais c'est un symptome : `skipStep()` ne preserve pas le `status` courant. Si le player est en pause et qu'on saute une etape, le `status` reste `paused` mais le step avance -- le timer ne redemarrera pas automatiquement.

**Solution** : `skipStep()` devrait verifier si le status est `paused` et potentiellement le passer a `playing`. Ou bien documenter ce comportement comme intentionnel. Fusionner les deux methodes en une seule `advanceStep()` avec un parametre optionnel `autoResume: boolean`.

### 1.4 -- MAJEUR -- Fuite de memoire potentielle : `onvoiceschanged` jamais nettoyee

**Fichier** : `src/lib/audio.ts` (lignes 101-103)

```typescript
speechSynthesis.onvoiceschanged = () => {
  loadFrenchVoice()
}
```

Ce listener n'est jamais supprime. A chaque appel de `unlockAudio()` (a chaque montage de `PlayerPage`), il est ecrase mais reste actif globalement. Si `speechSynthesis.onvoiceschanged` est rappele tardivement, il appelle `loadFrenchVoice()` meme si le composant est demonte.

**Solution** : Utiliser `addEventListener('voiceschanged', ...)` et conserver une reference pour le `removeEventListener` lors du demontage, ou s'assurer que `unlockAudio()` n'est appele qu'une seule fois via un flag.

### 1.5 -- MAJEUR -- Desynchro StrictMode : double-mount de PlayerPage

**Fichier** : `src/pages/PlayerPage.tsx` (lignes 51-63)

En mode `StrictMode` (dev), React monte/demonte/remonte le composant. Le `useEffect` avec `[programId]` appelle :
1. `startWorkout(flatSteps)` -> initialise le store
2. cleanup: `stopWorkout()` -> reinitialise le store
3. `startWorkout(flatSteps)` -> re-initialise le store

Le commentaire dit "handles StrictMode double-mount correctly" mais le probleme est que `unlockAudio()` est appele deux fois, et que `stopWorkout()` au milieu de la sequence peut provoquer un flash visible (ecran vide pendant une frame car `steps` est vide).

**Solution** : Ajouter un `useRef` pour tracker si le workout a deja ete demarre et eviter la double-initialisation. Ou bien utiliser un pattern avec `useRef(false)` qui passe a `true` apres le premier mount.

### 1.6 -- MAJEUR -- `formatTime` ne gere pas les nombres negatifs ni les decimaux

**Fichier** : `src/lib/workout-engine.ts` (lignes 76-80)

```typescript
export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
```

Si `totalSeconds` est negatif (possible avec un bug de synchronisation dans le timer), `Math.floor(-0.5)` retourne `-1` et le modulo donne un resultat negatif. L'affichage serait `"-1:-30"` ou similaire. Si `totalSeconds` est un flottant, le modulo donne un decimal : `"1:30.5"`.

**Solution** : Ajouter `const t = Math.max(0, Math.floor(totalSeconds))` en premiere ligne.

### 1.7 -- MINEUR -- AudioContext jamais ferme

**Fichier** : `src/lib/audio.ts` (lignes 1-11)

Le singleton `audioCtx` est cree a la premiere utilisation et jamais ferme (`audioCtx.close()`). Sur les appareils mobiles avec des ressources limitees, cela maintient un contexte audio actif indefiniment.

**Solution** : Exposer une fonction `disposeAudio()` appelee au demontage de `PlayerPage` et dans `stopWorkout()`.

---

## 2. Problemes UX critiques

### 2.1 -- BLOQUANT -- Aucune confirmation avant de quitter la page editeur

**Fichier** : `src/pages/EditorPage.tsx`

L'utilisateur peut modifier un programme pendant 10 minutes puis cliquer "Retour" ou swiper back dans le navigateur sans aucun avertissement. Toutes les modifications sont sauvegardees immediatement dans le store (donc pas de perte de donnees en theorie), mais le `beforeunload` n'est pas gere pour le cas ou l'utilisateur ferme l'onglet pendant l'edition.

Plus grave : si l'editeur est ouvert sur un programme qui est ensuite supprime depuis un autre onglet (ou une race condition), le programme affiche "Programme introuvable" sans explication.

**Solution** : Comme les changements sont immediatement persistes via Zustand + persist, le risque est mitige. Mais ajouter un `onbeforeunload` serait une bonne pratique. Ajouter aussi une redirection automatique vers la page d'accueil si le programme n'existe plus.

### 2.2 -- MAJEUR -- Suppression d'exercice sans confirmation

**Fichier** : `src/pages/EditorPage.tsx` (lignes 258-267)

Cliquer sur le `X` d'un exercice le supprime immediatement, sans aucune boite de dialogue de confirmation. Un clic accidentel (frequemment sur mobile) supprime definitivement l'exercice. La suppression de phase a un `ConfirmDialog` mais pas celle d'exercice.

**Solution** : Ajouter un `ConfirmDialog` pour la suppression d'exercice, ou implementer un mecanisme d'annulation (undo/toast).

### 2.3 -- MAJEUR -- Impossible de revenir a l'etape precedente dans le player

**Fichier** : `src/pages/PlayerPage.tsx`

Le player propose "Skip" (avancer) mais aucun bouton pour revenir en arriere. Si l'utilisateur saute accidentellement une etape, il ne peut pas y revenir sauf en arretant et relancant tout le workout.

**Solution** : Ajouter un bouton "Previous step" a cote du bouton "Restart step". Implementer `previousStep()` dans le store qui decremente `currentStepIndex`.

### 2.4 -- MAJEUR -- Pas de compteur de repos visible entre les cycles

**Fichier** : `src/pages/PlayerPage.tsx` (ligne 127)

L'indicateur affiche `Exercice 15 / 42` meme pendant les periodes de repos. Le mot "Exercice" est trompeur quand c'est un repos qui est affiche.

**Solution** : Afficher "Repos" ou "Etape" au lieu de "Exercice" quand `currentStep.type !== 'exercise'`.

### 2.5 -- MINEUR -- L'ecran "Termine" ne montre aucune statistique utile

**Fichier** : `src/pages/PlayerPage.tsx` (lignes 77-94)

L'ecran de fin n'affiche que le temps total ecoule. Aucune information sur : le nombre d'exercices realises, le nombre de reps totales, la possibilite de relancer le meme programme.

**Solution** : Ajouter un recapitulatif (nombre de steps completes, temps par phase, bouton "Recommencer").

### 2.6 -- MINEUR -- Duplication de programme sans feedback visuel

**Fichier** : `src/pages/HomePage.tsx` (ligne 73)

Le clic sur "Dupliquer" declenche `duplicateProgram(program.id)` mais aucun feedback (toast, scroll vers le nouveau programme, animation).

**Solution** : Ajouter un toast de confirmation et/ou scroll automatique vers le programme duplique.

---

## 3. Incoherences visuelles

### 3.1 -- MAJEUR -- Couleurs hardcodees dans le SVG du timer vs tokens CSS

**Fichier** : `src/pages/PlayerPage.tsx` (lignes 152-163)

```typescript
stroke="#1e293b"  // hardcode au lieu de var(--color-surface-elevated) ou classe Tailwind
stroke={isRest ? '#f59e0b' : '#10b981'}  // hardcode au lieu des tokens
```

Pourtant `index.css` definit `--color-accent: #10b981` et `--color-accent-warm: #f59e0b`. Les couleurs sont dupliquees en dur.

**Solution** : Utiliser `stroke="var(--color-surface-elevated)"` et `stroke={isRest ? 'var(--color-accent-warm)' : 'var(--color-accent)'}` dans les attributs SVG, ou passer par `currentColor` avec des classes Tailwind.

### 3.2 -- MINEUR -- Couleurs hardcodees dans les SVG des stick figures

**Fichier** : `src/constants/exercise-guides.ts` (ligne 12)

```typescript
stroke="#10b981" // emerald-500 hardcode
fill="#0f172a"   // slate-900 hardcode
```

Si le theme change, ces illustrations ne suivront pas.

**Solution** : Acceptable pour un MVP car les illustrations sont des data-URI. Documenter cette decision technique. A long terme, utiliser des composants SVG React avec des classes Tailwind.

### 3.3 -- MINEUR -- Tokens CSS definis mais non utilises

**Fichier** : `src/index.css` (lignes 3-9)

Les custom properties `--color-surface`, `--color-accent`, `--color-danger` etc. sont declarees dans `@theme` mais jamais referencees directement dans le code. Toutes les couleurs passent par les classes Tailwind (`bg-slate-900`, `text-emerald-500`...).

**Solution** : Soit supprimer les tokens inutilises, soit refactorer les composants pour les utiliser systematiquement (via `bg-[var(--color-surface)]` ou en etendant la config Tailwind).

### 3.4 -- COSMETIQUE -- Bouton "-" dans l'editeur descend a 5s minimum mais le minimum de l'input est 1s

**Fichier** : `src/pages/EditorPage.tsx` (lignes 432 et 442)

Le bouton `-` fait `Math.max(5, duration - 5)` (minimum 5s) mais l'input numero a `min={1}`. L'utilisateur peut saisir 1s manuellement mais pas y arriver avec le bouton. Incoherence de contrainte.

**Solution** : Harmoniser les deux contraintes. Si 5s est le minimum voulu, mettre `min={5}` sur l'input. Sinon, mettre `Math.max(1, duration - 5)` sur le bouton.

---

## 4. Performance

### 4.1 -- MAJEUR -- Selecteurs Zustand non memorises : re-renders excessifs dans PlayerPage

**Fichier** : `src/pages/PlayerPage.tsx` (lignes 24-35)

Chaque selecteur Zustand individuel (`usePlayerStore((s) => s.status)`, etc.) est correct en isolation, mais `PlayerPage` en fait 12 d'un coup. Chaque appel a `set()` dans le store (par exemple `tick()` appele chaque seconde) declenche un re-render COMPLET de `PlayerPage` car au moins un selecteur change (`secondsRemaining` ou `totalElapsedSeconds`). Cela inclut :

- Le recalcul du SVG du timer ring (`circumference`, `strokeDashoffset`)
- Le recalcul de `progress`
- Le re-render de tous les boutons de controle
- Le re-render de `ExerciseGuidePanel`

A 60 fps avec `requestAnimationFrame`, meme si `set()` ne se produit qu'une fois par seconde, le cout est non negligeable sur les appareils bas de gamme.

**Solution** : Extraire le timer ring dans un sous-composant `TimerRing` qui selectionne uniquement `secondsRemaining` et `currentStep.durationSeconds`. Extraire les controles dans un composant `PlayerControls`. Utiliser `React.memo` sur les sous-composants.

### 4.2 -- MINEUR -- Calcul dans le render de `HomePage`

**Fichier** : `src/pages/HomePage.tsx` (lignes 49-52)

```typescript
{program.phases.reduce((acc, ph) => acc + ph.exercises.length, 0)} exercices
```

Ce `reduce` est recalcule a chaque render pour chaque programme. Ce n'est pas grave pour quelques programmes, mais si l'utilisateur en a 50+, cela devient visible.

**Solution** : Memoriser avec `useMemo` ou extraire dans un composant `ProgramCard` avec `React.memo`.

### 4.3 -- MINEUR -- `flattenProgram` appele a chaque montage du player sans cache

**Fichier** : `src/pages/PlayerPage.tsx` (ligne 55)

`flattenProgram(program)` recree un nouveau tableau de steps a chaque montage. Si le programme n'a pas change, ce calcul est inutile.

**Solution** : Stocker les steps calcules dans le store ou utiliser `useMemo` avec `program` comme dependance.

### 4.4 -- MINEUR -- Les guides d'exercices font un `Object.entries` + boucle a chaque lookup

**Fichier** : `src/constants/exercise-guides.ts` (lignes 386-393)

La recherche partielle (`normalized.includes(key) || key.includes(normalized)`) itere sur tous les guides. Pour 15 guides c'est negligeable, mais le pattern n'est pas scalable.

**Solution** : Acceptable pour la taille actuelle. Ajouter un commentaire documentant la complexite O(n).

---

## 5. Accessibilite

### 5.1 -- BLOQUANT -- Aucun `aria-label` sur les boutons icones

**Fichiers** : `src/pages/PlayerPage.tsx`, `src/pages/EditorPage.tsx`

Tous les boutons de controle du player (Stop, Restart, Pause/Play, Skip) n'ont aucun `aria-label`. Un lecteur d'ecran annoncera simplement "bouton" sans indication de fonction. De meme, les boutons de montee/descente des exercices dans l'editeur, le bouton retour, le bouton de suppression.

**Liste des boutons sans aria-label** :
- PlayerPage : Stop (ligne 212), Restart (ligne 222), Pause/Resume (ligne 233), Skip (ligne 250)
- EditorPage : Retour (ligne 94), Supprimer phase (ligne 139), Monter exercice (ligne 209), Descendre exercice (ligne 220), Supprimer exercice (ligne 258)
- ExerciseGuidePanel : bouton toggle "Comment faire ?" (ligne 15) -- celui-ci a du texte visible, OK

**Solution** : Ajouter `aria-label="Arreter l'entrainement"`, `aria-label="Recommencer l'exercice"`, `aria-label="Pause"` / `aria-label="Reprendre"`, `aria-label="Passer au suivant"`, etc.

### 5.2 -- BLOQUANT -- Pas de gestion du focus dans les modales

**Fichier** : `src/components/ui/Modal.tsx`

La modale ne trappe pas le focus. Quand elle est ouverte, l'utilisateur peut Tab vers les elements derriere l'overlay. Aucun `role="dialog"`, aucun `aria-modal="true"`, aucun `aria-labelledby`.

**Solution** : Ajouter `role="dialog"`, `aria-modal="true"`, `aria-labelledby` reference vers le titre. Implementer un focus trap (premier/dernier element focusable) et le retour du focus a l'element declencheur a la fermeture. Ou utiliser l'element natif `<dialog>`.

### 5.3 -- MAJEUR -- Contraste insuffisant sur certains textes

Plusieurs textes `text-slate-500` sur fond `bg-slate-950` ou `bg-slate-900` n'atteignent pas le ratio 4.5:1 requis par WCAG AA.

- `text-slate-500` (#64748b) sur `bg-slate-950` (#020617) : ratio environ 4.1:1 -- ECHEC AA pour le texte normal
- `text-slate-400` (#94a3b8) sur `bg-slate-900` (#0f172a) : ratio environ 5.2:1 -- OK
- `text-slate-600` (#475569) sur `bg-slate-950` : ratio environ 2.5:1 -- ECHEC AA

**Occurrences** :
- `src/pages/PlayerPage.tsx` ligne 126 : `text-slate-600`
- `src/pages/PlayerPage.tsx` ligne 204 : `text-slate-500`
- `src/pages/EditorPage.tsx` ligne 128 : `text-slate-500`

**Solution** : Remonter a `text-slate-400` minimum pour tout texte informatif. Utiliser `text-slate-300` pour les textes importants.

### 5.4 -- MAJEUR -- Aucune annonce dynamique pour les lecteurs d'ecran

Quand le timer change d'etape ou quand le countdown arrive a zero, aucun `aria-live` region n'annonce le changement. Un utilisateur malvoyant n'a aucun moyen de savoir qu'une nouvelle etape a commence.

**Solution** : Ajouter un `<div aria-live="assertive" className="sr-only">` qui annonce les transitions d'etapes : "Repos 30 secondes", "Squats -- 12 repetitions".

### 5.5 -- MINEUR -- Les inputs numeriques n'ont pas de `inputMode="numeric"`

**Fichier** : `src/pages/EditorPage.tsx`

Les `<input type="number">` fonctionnent mais sur mobile iOS, `inputMode="numeric"` garantit l'ouverture du clavier numerique.

**Solution** : Ajouter `inputMode="numeric"` sur tous les inputs de duree, reps, et cycles.

### 5.6 -- MINEUR -- Pas de `lang="fr"` sur les elements dynamiques

L'attribut `lang="fr"` est sur le `<html>` mais certains textes pourraient etre en anglais (noms d'exercices saisis par l'utilisateur). Ce n'est pas critique mais c'est une bonne pratique d'accessibilite.

---

## 6. Cas limites non geres

### 6.1 -- BLOQUANT -- Programme avec 0 exercice dans toutes les phases : crash silencieux du player

**Fichier** : `src/pages/PlayerPage.tsx` + `src/lib/workout-engine.ts`

Si un programme a des phases mais toutes vides (0 exercices), `flattenProgram` retourne un tableau vide. `startWorkout([])` fait un `return` premature (ligne 32 de `usePlayerStore.ts`), laissant le `status` a `idle`. Le player affiche alors un ecran vide (ligne 96 : `if (!currentStep) return null`).

Le bouton "Demarrer" dans l'editeur est desactive si toutes les phases sont vides (`disabled={program.phases.every((p) => p.exercises.length === 0)}`), mais rien n'empeche la navigation directe via l'URL `/program/:id/play`.

**Solution** : Ajouter une verification dans `PlayerPage` : si `flattenProgram` retourne un tableau vide, afficher un message d'erreur et proposer un retour a l'editeur.

### 6.2 -- MAJEUR -- Exercice "timed" avec 0 seconde de duree

**Fichier** : `src/store/usePlayerStore.ts`

Si un exercice `timed` a `durationSeconds: 0`, le store initialise `secondsRemaining: 0`. Au prochain `tick()`, `newRemaining = 0 - 1 = -1` qui est `<= 0`, donc on avance immediatement. Mais le premier tick n'arrive qu'apres 1 seconde, creant une seconde de delai sur un exercice qui devrait etre instantane. Pire : l'UI affiche `0:00` pendant cette seconde.

L'editeur empeche de descendre en dessous de 5s avec le bouton `-` mais autorise `min={1}` via l'input direct. La valeur 0 n'est pas bloquee si on manipule le store directement ou via une importation de donnees corrompues.

**Solution** : Valider `durationSeconds >= 1` dans `updateExercise`. Si `durationSeconds === 0` et `type === 'timed'`, skip automatiquement dans `startWorkout`.

### 6.3 -- MAJEUR -- Nombre de cycles a 100+ : performance et UX catastrophique

**Fichier** : `src/pages/EditorPage.tsx` (ligne 169)

L'input a `max={20}` en attribut HTML mais l'utilisateur peut taper 999 au clavier : `parseInt(e.target.value)` retourne 999 et `Math.max(1, 999)` le valide. `flattenProgram` generera alors potentiellement des milliers de steps, ralentissant le calcul et rendant la barre de progression inutile.

**Solution** : Ajouter `Math.min(20, ...)` dans le handler `onChange`. Ajouter aussi une validation dans `flattenProgram` : si le nombre total de steps depasse un seuil (par ex. 500), avertir l'utilisateur.

### 6.4 -- MAJEUR -- Nom de programme vide

**Fichier** : `src/pages/EditorPage.tsx` (lignes 102-108)

L'input du nom de programme n'a aucune validation. Un nom vide (`""`) est sauvegarde tel quel. Sur la page d'accueil, cela affiche un programme avec un titre vide -- visuellement invisible.

**Solution** : Ajouter un `onBlur` qui remet un nom par defaut si le champ est vide : `if (!e.target.value.trim()) updateProgram(programId, { name: 'Mon programme' })`.

### 6.5 -- MAJEUR -- Nom d'exercice vide

**Fichier** : `src/pages/EditorPage.tsx` -- `ExerciseEditModal`

Meme probleme que pour le nom de programme. L'utilisateur peut sauvegarder un exercice avec un nom vide. Cela provoque :
- Un label vide dans le player (`currentStep.label` = `""`)
- `speakExerciseName("")` -- synthese vocale silencieuse
- `getExerciseGuide("")` -- retourne `null`, fallback sur `getDefaultGuide("")` qui affiche `Realise l'exercice "" avec controle...`

**Solution** : Desactiver le bouton "Enregistrer" si le nom est vide. Ajouter une validation trim.

### 6.6 -- MINEUR -- localStorage plein : crash silencieux de Zustand persist

**Fichier** : `src/store/useProgramStore.ts` (ligne 172)

Zustand `persist` ecrit dans localStorage a chaque mutation. Si localStorage est plein (quota depasse, souvent 5-10 Mo), l'ecriture echoue silencieusement (ou leve une exception non attrapee). L'utilisateur continue d'editer sans savoir que rien n'est sauvegarde. Au rechargement, les donnees sont perdues.

**Solution** : Wrapper la serialisation avec un try/catch. Afficher un avertissement si l'ecriture echoue. Implementer un mecanisme de detection de quota restant. Eventuellement migrer vers IndexedDB pour les gros volumes.

### 6.7 -- MINEUR -- Navigation directe vers un programme inexistant

**Fichier** : `src/pages/EditorPage.tsx` (ligne 50) et `src/pages/PlayerPage.tsx` (ligne 68)

Taper `/program/inexistant` dans la barre d'adresse affiche "Programme introuvable" comme texte brut centre. Pas de bouton retour, pas de redirection automatique.

**Solution** : Ajouter un bouton "Retour a l'accueil" et/ou une redirection automatique apres quelques secondes.

### 6.8 -- MINEUR -- Route 404 inexistante

**Fichier** : `src/App.tsx`

Aucune route catch-all pour les URLs invalides. `/n-importe-quoi` affiche une page blanche.

**Solution** : Ajouter `<Route path="*" element={<Navigate to="/" />} />` ou un composant 404.

---

## 7. Problemes mobile

### 7.1 -- MAJEUR -- Les inputs numeriques ouvrent le mauvais clavier sur iOS

**Fichier** : `src/pages/EditorPage.tsx`

`<input type="number">` sur iOS ouvre parfois un clavier avec des caracteres speciaux. Sans `inputMode="numeric"` ni `pattern="[0-9]*"`, l'experience est degradee.

**Solution** : Ajouter `inputMode="numeric" pattern="[0-9]*"` sur tous les inputs de duree, reps, repos.

### 7.2 -- MAJEUR -- Pas de prevention du scroll elastique pendant le workout

**Fichier** : `src/index.css` (ligne 33)

`overscroll-behavior: none` est applique sur `body` mais le `PlayerPage` a un `overflow-y` implicite (le flex layout peut deborder si le guide d'exercice est ouvert). Sur iOS Safari, le bounce effect peut se produire.

**Solution** : Ajouter `overscroll-behavior: contain` sur le conteneur principal du player. Tester sur iOS Safari reel.

### 7.3 -- MAJEUR -- Boutons trop petits pour les doigts

**Fichier** : `src/pages/EditorPage.tsx`

Les boutons de montee/descente des exercices (`p-0.5`, soit ~6px de padding) et les icones de suppression (`p-1.5`, soit ~10px) sont en dessous du minimum recommande de 44x44px pour les cibles tactiles mobiles (WCAG 2.1 AAA, Apple HIG 44pt).

**Solution** : Augmenter la taille des cibles tactiles a minimum 44x44px avec du padding. Les fleches de reordonnement pourraient etre remplacees par du drag-and-drop.

### 7.4 -- MINEUR -- Le clavier masque les inputs dans le modal d'edition d'exercice

**Fichier** : `src/components/ui/Modal.tsx` (ligne 35)

La modale utilise `max-h-[85dvh] overflow-y-auto` et se positionne en `items-end` sur mobile (bottom sheet). Quand le clavier virtuel s'ouvre, le `dvh` se recalcule mais le contenu peut etre masque derriere le clavier, surtout si l'utilisateur edite le champ "Repos apres" (dernier champ).

**Solution** : Ajouter un `scroll-into-view` automatique sur le champ focus. Tester avec `visualViewport` API pour ajuster la hauteur. Ou utiliser `position: fixed; bottom: 0` avec `env(keyboard-inset-height)`.

### 7.5 -- MINEUR -- Orientation paysage non geree

**Fichier** : `vite.config.ts` (ligne 22)

Le manifest declare `"orientation": "portrait"` mais cela ne verrouille l'orientation que pour la PWA installee, pas pour l'utilisation dans le navigateur. En paysage, la UI du player est defiguree (le cercle de timer deborde).

**Solution** : Ajouter un bandeau d'avertissement "Tournez votre appareil" en mode paysage via `@media (orientation: landscape)`, ou adapter le layout pour fonctionner aussi en paysage.

---

## 8. PWA et mode offline

### 8.1 -- BLOQUANT -- Pas de service worker en developpement, experience offline non testable

**Fichier** : `vite.config.ts`

`VitePWA` avec `registerType: 'autoUpdate'` genere un service worker en build de production uniquement. En dev, aucun SW n'est enregistre. Cela signifie que l'experience offline n'est jamais testee pendant le developpement sauf build manuelle.

**Solution** : Ajouter `devOptions: { enabled: true }` dans la config VitePWA pour activer le SW en dev. Ajouter un test E2E qui verifie le fonctionnement offline.

### 8.2 -- MAJEUR -- Aucune icone PNG pour iOS et Android

**Fichier** : `vite.config.ts` (lignes 25-27)

Le manifest ne declare qu'une seule icone SVG : `{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }`. Or :
- iOS ne supporte pas les icones SVG dans le manifest pour l'ecran d'accueil (il utilise `apple-touch-icon` qui est aussi un SVG ici).
- Android affiche un splashscreen genere a partir des icones du manifest -- un SVG unique sans taille fixe produit un resultat imprevisible.
- Le critere "installable" de Chrome PWA requiert une icone PNG de minimum 192x192px ET une de 512x512px.

**Solution** : Generer des icones PNG (192x192, 512x512) a partir du SVG et les ajouter au manifest. Utiliser un `apple-touch-icon` en PNG de 180x180px.

### 8.3 -- MAJEUR -- Pas de strategie de mise a jour visible

`registerType: 'autoUpdate'` met a jour le SW automatiquement mais l'utilisateur ne sait jamais qu'une nouvelle version est disponible. Si la mise a jour se fait en arriere-plan, les anciens assets caches peuvent causer des incoherences.

**Solution** : Utiliser `registerType: 'prompt'` avec un toast "Nouvelle version disponible, recharger ?" pour donner le controle a l'utilisateur.

### 8.4 -- MINEUR -- `BrowserRouter` incompatible avec le deploiement statique

**Fichier** : `src/main.tsx`

`BrowserRouter` utilise l'API History et necessite que le serveur redirige toutes les routes vers `index.html`. En mode offline (Service Worker), les routes profondes (`/program/abc123`) peuvent echouer si le SW n'a pas de strategie de routing appropriee.

**Solution** : Le SW Workbox genere par VitePWA gere normalement le `navigateFallback` vers `index.html`. Verifier que c'est bien le cas. Sinon, ajouter `navigateFallback: '/index.html'` dans la config Workbox. Alternative : utiliser `HashRouter` pour eliminer le probleme.

---

## 9. Code smells

### 9.1 -- MAJEUR -- `EditorPage.tsx` fait 531 lignes : composant monolithique

**Fichier** : `src/pages/EditorPage.tsx`

Ce fichier contient la page entiere + le composant `ExerciseEditModal`. Il gere : le header, la liste des phases, les exercices, les controles de cycle, le modal d'ajout de phase, le modal d'edition d'exercice, la confirmation de suppression. C'est beaucoup trop pour un seul fichier.

**Solution** : Extraire au minimum :
- `PhaseCard` (affichage d'une phase avec ses exercices)
- `ExerciseRow` (une ligne d'exercice avec boutons)
- `ExerciseEditModal` (deja separe en interne, l'extraire dans son propre fichier)
- `AddPhaseModal`

### 9.2 -- MAJEUR -- Duplication du pattern de recherche de programme dans le store

**Fichier** : `src/store/useProgramStore.ts`

Le pattern `state.programs.find((p) => p.id === id)` est repete 10 fois. Chaque action fait un `find` lineaire sur le tableau des programmes.

**Solution** : Extraire un helper `findProgram(state, id)` ou mieux, utiliser un `Record<string, Program>` (Map indexee par ID) au lieu d'un tableau. Cela ameliore aussi la performance de O(n) a O(1) pour chaque lookup.

### 9.3 -- MINEUR -- SVG inline repetes partout

**Fichiers** : `src/pages/PlayerPage.tsx`, `src/pages/EditorPage.tsx`, `src/components/ui/EmptyState.tsx`

Les icones SVG (chevron, X, trash, play, pause, etc.) sont dupliquees en inline dans chaque fichier. Pas d'abstraction en composant reutilisable.

**Solution** : Creer un composant `Icon` avec un mapping des icones utilisees, ou utiliser une bibliotheque comme `lucide-react` ou `heroicons`.

### 9.4 -- MINEUR -- `Object.assign` dans les mutateurs Immer

**Fichier** : `src/store/useProgramStore.ts` (lignes 47, 98)

`Object.assign(program, updates, ...)` dans un callback Immer fonctionne mais masque le type-checking. Si `updates` contient une propriete invalide, TypeScript ne la detectera pas car `Partial<Pick<Program, 'name'>>` est trop permissif.

**Solution** : Affecter les proprietes explicitement : `program.name = updates.name ?? program.name`.

### 9.5 -- MINEUR -- Pas de tests unitaires ni E2E

Aucun fichier de test n'a ete trouve dans le projet. La logique critique du timer, du workout-engine, et du store n'est pas testee.

**Solution** : Ajouter au minimum :
- Tests unitaires pour `flattenProgram` (exercices 0, 1 phase, multi-cycles, reps vs timed)
- Tests unitaires pour `formatTime` (0, negatifs, grands nombres)
- Tests unitaires pour les actions du `usePlayerStore` (tick, skip, markRepsDone)
- Test E2E (Playwright/Cypress) pour le flow complet : creer programme -> editer -> jouer -> terminer

### 9.6 -- COSMETIQUE -- Melange francais/anglais dans le code

Noms de variables en anglais (`handleCreate`, `deleteProgram`) mais textes en francais via le fichier `FR`. Les commentaires sont en anglais. C'est coherent mais les chaines hardcodees dans `EditorPage` ("Repos cycles:", "Nouvel exercice", "Supprimer la phase ?") ne passent pas par le fichier `FR`.

**Solution** : Deplacer toutes les chaines hardcodees dans `fr.ts`.

---

## 10. Securite

### 10.1 -- MAJEUR -- Injection XSS via le nom d'exercice dans l'attribut `alt`

**Fichier** : `src/components/player/ExerciseGuidePanel.tsx` (ligne 41)

```tsx
<img src={guide.image} alt={exerciseName} />
```

`exerciseName` provient directement du store sans aucune sanitization. Bien que React echappe les expressions JSX dans le DOM, le `alt` est un attribut texte et n'est pas vulnerable a XSS classique. CEPENDANT :

### 10.2 -- MAJEUR -- Injection XSS via `getDefaultGuide` (interpolation dans une chaine)

**Fichier** : `src/constants/exercise-guides.ts` (ligne 399)

```typescript
description: `Realise l'exercice "${exerciseName}" avec controle...`
```

Ce texte est ensuite rendu dans `<p className="...">{guide.description}</p>`. React echappe le contenu, donc pas de XSS direct. Mais si cette description etait un jour utilisee dans `dangerouslySetInnerHTML` ou dans un contexte non-React, le risque existerait.

**Verdict** : Pas de vulnerabilite XSS exploitable actuellement grace a l'echappement natif de React. Mais l'absence de sanitization est un risque latent.

### 10.3 -- MAJEUR -- Donnees localStorage non validees au chargement

**Fichier** : `src/store/useProgramStore.ts` (ligne 172-174)

Zustand `persist` deserialise les donnees de localStorage au demarrage (`JSON.parse`). Si un attaquant (ou un script tier) modifie le localStorage manuellement :

```javascript
localStorage.setItem('custom-coach-programs', '{"state":{"programs":[{"id":"x","name":"<script>alert(1)</script>","phases":[]}]}}')
```

Les donnees corrompues sont chargees telles quelles dans le store et rendues dans le DOM. Encore une fois, React echappe correctement, mais :
- Des donnees avec des types inattendus (par ex. `cycles: "abc"` au lieu d'un nombre) pourraient provoquer des `NaN` dans les calculs ou des crashes.
- Un tableau `programs` trop volumineux (des millions d'entrees) pourrait crasher l'application au demarrage.

**Solution** : Ajouter une validation du schema a la deserialization (avec Zod, qui est deja dans les dependances) :
```typescript
persist({
  // ...
  merge: (persisted, current) => {
    const parsed = ProgramsSchema.safeParse(persisted)
    return parsed.success ? parsed.data : current
  }
})
```

### 10.4 -- MINEUR -- `nanoid(10)` : risque de collision d'identifiants

**Fichier** : `src/lib/id.ts`

`nanoid(10)` genere des IDs de 10 caracteres (62^10 = ~8.4 x 10^17 possibilites). Le risque de collision est extremement faible pour un usage local mais non nul. Avec 10 000 entites (programmes + phases + exercices), la probabilite de collision est d'environ 1 sur 10^10.

**Solution** : Acceptable pour un usage local. Si migration vers multi-device, augmenter a `nanoid(21)` (defaut de nanoid).

### 10.5 -- MINEUR -- Pas de Content Security Policy

**Fichier** : `index.html`

Aucune balise `<meta http-equiv="Content-Security-Policy">` n'est presente. Cela n'est pas critique pour une application sans backend, mais c'est une bonne pratique, surtout pour empecher l'injection de scripts tiers.

**Solution** : Ajouter une CSP minimale : `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'">`.

---

## 11. Recommandations classees par severite

### BLOQUANT (a corriger avant toute mise en production)

| # | Categorie | Description | Fichier(s) |
|---|-----------|-------------|------------|
| B1 | Bug | Race condition tick() en boucle au retour d'onglet | `useTimer.ts` |
| B2 | Bug | requestAnimationFrame ne tourne pas en arriere-plan | `useTimer.ts` |
| B3 | A11y | Aucun aria-label sur les boutons icones du player/editeur | `PlayerPage.tsx`, `EditorPage.tsx` |
| B4 | A11y | Pas de focus trap ni role="dialog" dans les modales | `Modal.tsx` |
| B5 | Edge case | Programme vide : ecran blanc si acces direct via URL | `PlayerPage.tsx` |
| B6 | PWA | Aucune icone PNG : l'app n'est pas installable sur mobile | `vite.config.ts` |

### MAJEUR (a corriger dans le sprint suivant)

| # | Categorie | Description | Fichier(s) |
|---|-----------|-------------|------------|
| M1 | Bug | skipStep/markRepsDone identiques et ne gerent pas le status pause | `usePlayerStore.ts` |
| M2 | Bug | Fuite memoire : onvoiceschanged jamais nettoyee | `audio.ts` |
| M3 | Bug | StrictMode double-mount : flash visible | `PlayerPage.tsx` |
| M4 | Bug | formatTime ne gere pas les negatifs | `workout-engine.ts` |
| M5 | UX | Suppression d'exercice sans confirmation | `EditorPage.tsx` |
| M6 | UX | Impossible de revenir a l'etape precedente | `PlayerPage.tsx` |
| M7 | UX | Indicateur "Exercice X/Y" pendant les repos | `PlayerPage.tsx` |
| M8 | Visuel | Couleurs hardcodees dans le SVG timer | `PlayerPage.tsx` |
| M9 | Perf | Re-renders excessifs du PlayerPage (12 selecteurs) | `PlayerPage.tsx` |
| M10 | A11y | Contraste insuffisant text-slate-500/600 | Multiples |
| M11 | A11y | Aucun aria-live pour les transitions d'etapes | `PlayerPage.tsx` |
| M12 | Edge case | Exercice timed a 0 seconde | `usePlayerStore.ts` |
| M13 | Edge case | Cycles > 20 non limite cote logique | `EditorPage.tsx` |
| M14 | Edge case | Nom de programme/exercice vide accepte | `EditorPage.tsx` |
| M15 | Mobile | Inputs numeriques : mauvais clavier iOS | `EditorPage.tsx` |
| M16 | Mobile | Boutons trop petits (< 44px) | `EditorPage.tsx` |
| M17 | PWA | Pas de strategie de mise a jour visible | `vite.config.ts` |
| M18 | Code | EditorPage monolithique (531 lignes) | `EditorPage.tsx` |
| M19 | Code | find() repete 10 fois dans le store | `useProgramStore.ts` |
| M20 | Code | Aucun test unitaire ni E2E | Projet entier |
| M21 | Securite | Donnees localStorage non validees au chargement | `useProgramStore.ts` |

### MINEUR (backlog, a planifier)

| # | Categorie | Description | Fichier(s) |
|---|-----------|-------------|------------|
| m1 | Bug | AudioContext jamais ferme | `audio.ts` |
| m2 | UX | Ecran "Termine" pauvre en informations | `PlayerPage.tsx` |
| m3 | UX | Duplication sans feedback | `HomePage.tsx` |
| m4 | Visuel | Tokens CSS declares mais jamais utilises | `index.css` |
| m5 | Perf | flattenProgram sans cache | `PlayerPage.tsx` |
| m6 | Perf | reduce() dans le render de HomePage | `HomePage.tsx` |
| m7 | A11y | inputMode="numeric" manquant | `EditorPage.tsx` |
| m8 | Edge case | localStorage plein : crash silencieux | `useProgramStore.ts` |
| m9 | Edge case | Programme/route 404 sans redirection | `App.tsx`, `EditorPage.tsx` |
| m10 | Mobile | Clavier masque les inputs dans le modal | `Modal.tsx` |
| m11 | Mobile | Orientation paysage non geree | `PlayerPage.tsx` |
| m12 | PWA | BrowserRouter vs deploiement statique | `main.tsx` |
| m13 | Code | SVG inline dupliques (icones) | Multiples |
| m14 | Code | Object.assign dans Immer | `useProgramStore.ts` |
| m15 | Code | Chaines hardcodees hors du fichier FR | `EditorPage.tsx` |
| m16 | Securite | nanoid(10) : collision theorique | `id.ts` |
| m17 | Securite | Pas de CSP | `index.html` |

### COSMETIQUE (nice-to-have)

| # | Categorie | Description | Fichier(s) |
|---|-----------|-------------|------------|
| C1 | Visuel | Incoherence min bouton -5 vs min input 1 pour la duree | `EditorPage.tsx` |
| C2 | Visuel | Couleurs hardcodees dans les SVG stick figures | `exercise-guides.ts` |
| C3 | Code | Melange francais/anglais dans les commentaires et chaines | Multiples |

---

## Conclusion

L'application Custom Coach est un bon prototype fonctionnel avec une architecture globalement saine (Zustand, composants bien separes, PWA de base). Les points les plus critiques a adresser en priorite sont :

1. **Le mecanisme de timer** qui repose sur `requestAnimationFrame` alors qu'un timer d'entrainement DOIT fonctionner en arriere-plan. C'est la fonctionnalite coeur de l'application.
2. **L'accessibilite** qui est quasi inexistante (pas d'aria-labels, pas de focus trap, contrastes insuffisants).
3. **La PWA** qui n'est pas reellement installable faute d'icones PNG.
4. **La validation des donnees** : noms vides, durees a 0, cycles > max, donnees localStorage corrompues.

Les 6 bloquants doivent etre resolus avant toute mise a disposition d'utilisateurs reels. Les 21 majeurs constituent un backlog prioritaire pour le prochain cycle de developpement.
