# Custom Coach -- Design System

> Application mobile-first (PWA) d'entrainement fitness.
> Dark theme exclusif, palette Slate/Emerald, optimisee pour utilisation en salle de sport.

---

## Table des matieres

1. [Palette de couleurs](#1-palette-de-couleurs)
2. [Typographie](#2-typographie)
3. [Espacement](#3-espacement)
4. [Rayons de bordure](#4-rayons-de-bordure)
5. [Ombres et elevation](#5-ombres-et-elevation)
6. [Composants UI](#6-composants-ui)
7. [Iconographie](#7-iconographie)
8. [Animations et transitions](#8-animations-et-transitions)
9. [Grille et layout](#9-grille-et-layout)
10. [Tokens CSS](#10-tokens-css-custom-properties)

---

## 1. Palette de couleurs

### 1.1 Surfaces (fond)

Les surfaces utilisent l'echelle **Slate** de Tailwind pour creer une hierarchie de profondeur.

| Role                  | Hex       | Tailwind class      | Usage                                      |
|-----------------------|-----------|---------------------|---------------------------------------------|
| Background app        | `#020617` | `bg-slate-950`      | Fond global de l'application (`App.tsx`)     |
| Surface base          | `#0f172a` | `bg-surface`*       | Fond des cards de programmes, panneaux       |
| Surface elevee        | `#1e293b` | `bg-surface-elevated`* | Fond des inputs, zones interactives         |
| Surface interactive   | `#334155` | `bg-slate-700`      | Boutons secondaires, hover sur surfaces      |
| Surface hover         | `#1e293b` | `bg-slate-800`      | Etat hover des boutons ghost, zones tactiles |
| Bordure subtile       | `#1e293b` | `border-slate-800`  | Separateurs de header et footer              |
| Scrollbar thumb       | `#334155` | --                  | Barre de defilement personnalisee            |

> *Les tokens `surface` et `surface-elevated` sont definis dans `@theme` (cf. section 10).

### 1.2 Couleur primaire (Accent)

La couleur d'action principale est **Emerald** -- evoque l'energie, la sante, le progres.

| Role            | Hex       | Tailwind class       | Usage                                |
|-----------------|-----------|----------------------|---------------------------------------|
| Primary base    | `#10b981` | `text-emerald-500`   | Texte accent, indicateurs de cycle    |
| Primary action  | `#059669` | `bg-emerald-600`     | Boutons primaires, FAB play/pause     |
| Primary hover   | `#10b981` | `bg-emerald-500`     | Hover sur boutons primaires           |
| Primary subtle  | `#059669/20` | `bg-emerald-600/20` | Fond du badge de completion (finished) |
| Primary ring    | `#10b981/50` | `ring-emerald-500/50` | Focus ring sur les inputs           |
| Phase main border | `#10b981/40` | `border-emerald-500/40` | Bordure gauche de la phase principale |

### 1.3 Couleur chaude (Accent secondaire)

**Amber** est utilise pour le repos, les avertissements et les conseils.

| Role            | Hex       | Tailwind class       | Usage                                |
|-----------------|-----------|----------------------|---------------------------------------|
| Warm base       | `#f59e0b` | `text-amber-400`     | Timer de repos, label repos           |
| Warm subtle     | `#f59e0b/70` | `text-amber-400/70` | Indicateur repos apres exercice     |
| Warm accent     | `#f59e0b` | `text-amber-500`     | Puces de conseils (tips)              |
| Phase warmup border | `#f59e0b/40` | `border-amber-500/40` | Bordure gauche phase echauffement |

### 1.4 Couleur de danger

**Red** pour les actions destructives.

| Role            | Hex       | Tailwind class       | Usage                                |
|-----------------|-----------|----------------------|---------------------------------------|
| Danger base     | `#ef4444` | `text-red-400`       | Texte suppression, icone stop         |
| Danger action   | `#dc2626` | `bg-red-600`         | Boutons danger (suppression)          |
| Danger hover    | `#ef4444` | `bg-red-500`         | Hover sur boutons danger              |

### 1.5 Couleurs semantiques des phases

Chaque type de phase a une couleur de bordure gauche distinctive.

| Phase       | Couleur    | Tailwind class            |
|-------------|------------|---------------------------|
| Echauffement | Amber     | `border-amber-500/40`     |
| Principal    | Emerald   | `border-emerald-500/40`   |
| Gainage      | Blue      | `border-blue-500/40`      |
| Etirements   | Purple    | `border-purple-500/40`    |

### 1.6 Texte

| Role            | Hex       | Tailwind class     | Usage                              |
|-----------------|-----------|--------------------|------------------------------------|
| Texte principal | `#f1f5f9` | `text-slate-100`   | Titres, noms d'exercices, valeurs  |
| Texte secondaire| `#cbd5e1` | `text-slate-300`   | Corps de texte, descriptions       |
| Texte tertiaire | `#94a3b8` | `text-slate-400`   | Labels, metadonnees, sous-titres   |
| Texte muet      | `#64748b` | `text-slate-500`   | Placeholders, compteurs            |
| Texte desactive | `#475569` | `text-slate-600`   | Indicateurs secondaires de position|

---

## 2. Typographie

### 2.1 Famille de polices

```css
/* Police systeme -- optimisee pour la performance native */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Police monospace -- pour les timers et compteurs */
font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

**Tailwind :**
- Texte general : classe par defaut (system font stack)
- Timers/compteurs : `font-mono`

### 2.2 Echelle typographique

| Token            | Tailwind    | Taille   | Usage                                         |
|------------------|-------------|----------|------------------------------------------------|
| Display          | `text-6xl`  | 3.75rem  | Timer principal (countdown circle)             |
| Heading XL       | `text-2xl`  | 1.5rem   | Nom exercice en cours, ecran termine           |
| Heading L        | `text-xl`   | 1.25rem  | Titre de l'app dans le header                  |
| Heading M        | `text-lg`   | 1.125rem | Titre de modal, nom de programme               |
| Body             | `text-base` | 1rem     | Boutons taille medium, texte courant           |
| Body Small       | `text-sm`   | 0.875rem | Details d'exercice, labels, boutons small      |
| Caption          | `text-xs`   | 0.75rem  | Phase indicator, compteur d'exercices, badges  |

### 2.3 Graisse (font-weight)

| Tailwind        | Valeur | Usage                                  |
|-----------------|--------|----------------------------------------|
| `font-bold`     | 700    | Titres principaux, timer, noms de page |
| `font-semibold` | 600    | Titres de card, noms de phase, modal   |
| `font-medium`   | 500    | Noms d'exercices, boutons              |
| (defaut)        | 400    | Corps de texte                         |

### 2.4 Interlignage (line-height)

| Tailwind          | Valeur | Usage                        |
|-------------------|--------|------------------------------|
| `leading-relaxed` | 1.625  | Descriptions dans le guide   |
| (defaut)          | 1.5    | Texte courant                |
| `leading-none`    | 1      | Timer display (implicite)    |

### 2.5 Espacement de lettres

| Tailwind           | Usage                                  |
|--------------------|----------------------------------------|
| `tracking-wider`   | Labels de phase (uppercase)            |
| `tabular-nums`     | Timer pour chiffres a largeur fixe     |

### 2.6 Combinaisons typographiques cles

```html
<!-- Timer principal -->
<span class="text-6xl font-mono font-bold tabular-nums">2:30</span>

<!-- Compteur de reps -->
<span class="text-6xl font-mono font-bold">12</span>

<!-- Indicateur de phase -->
<span class="text-xs text-slate-500 uppercase tracking-wider">Bloc Principal</span>

<!-- Titre section guide -->
<h4 class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Mouvement</h4>

<!-- Numero d'etape (guide) -->
<span class="text-emerald-500 font-mono text-xs">1.</span>
```

---

## 3. Espacement

### 3.1 Grille de base

L'application utilise une grille **4px** via le systeme de spacing Tailwind (1 unite = 0.25rem = 4px).

### 3.2 Echelle d'espacement utilisee

| Token  | Tailwind | Valeur  | Usage                                    |
|--------|----------|---------|------------------------------------------|
| 0.5    | `gap-0.5` | 2px   | Espace entre boutons de reordonnement    |
| 1      | `p-1`    | 4px    | Padding du toggle segmented control      |
| 1.5    | `p-1.5`  | 6px    | Padding icones d'action (delete)         |
| 2      | `gap-2`  | 8px    | Espace entre boutons d'action, badges    |
| 3      | `gap-3`  | 12px   | Espace entre boutons dans les actions    |
| 4      | `p-4`    | 16px   | Padding de card, padding page horizontal |
| 5      | `p-5`    | 20px   | Padding du contenu de modal, header      |
| 6      | `px-6`   | 24px   | Padding horizontal du player             |
| 8      | `pb-8`   | 32px   | Padding bottom de modal (safe area)      |
| 16     | `py-16`  | 64px   | Padding vertical de l'EmptyState         |

### 3.3 Espacements standards par contexte

```
Page padding horizontal :  px-4 (16px) ou px-5 (20px) pour le header
Page padding vertical :    py-4 (16px)
Card padding :             p-4 (16px)
Card spacing (stack) :     space-y-3 (12px)
Modal padding :            p-5 pb-8 (20px / 32px)
Formulaire spacing :       space-y-4 (16px) entre les champs
Boutons gap :              gap-3 (12px) entre boutons cote a cote
Header height (implicite): ~56px (py-4 + contenu)
Footer actions :           p-4 (16px) + border-t
```

### 3.4 Marges de separation

| Contexte                     | Tailwind   | Usage                          |
|------------------------------|------------|--------------------------------|
| Apres titre de section       | `mb-4`     | Titre de modal vers contenu    |
| Apres description dialog     | `mb-6`     | Message vers boutons d'action  |
| Apres titre vide             | `mb-4`     | Icone EmptyState vers titre    |
| Sous-titre sous titre        | `mt-1`     | Sous-texte apres nom           |
| Apres le cercle timer        | `mb-8`     | Timer vers zone en dessous     |
| Ecran termine badge vers titre | `mb-6`   | Icone succes vers titre        |

---

## 4. Rayons de bordure

### 4.1 Echelle

| Token   | Tailwind       | Valeur | Usage                                          |
|---------|----------------|--------|-------------------------------------------------|
| sm      | `rounded-md`   | 6px    | Toggle options dans segmented control           |
| md      | `rounded-lg`   | 8px    | Inputs, items d'exercice, boutons de selection   |
| lg      | `rounded-xl`   | 12px   | Cards de programme, boutons, phases, panels      |
| xl      | `rounded-2xl`  | 16px   | Modals, illustrations SVG (rx="16")              |
| full    | `rounded-full` | 9999px | Boutons circulaires du player, badge EmptyState  |

### 4.2 Cas particuliers

```css
/* Modal bottom-sheet (mobile) : coins arrondis en haut uniquement */
.modal-mobile { border-radius: 1rem 1rem 0 0; } /* rounded-t-2xl */

/* Modal desktop : tous les coins arrondis */
.modal-desktop { border-radius: 1rem; }          /* sm:rounded-2xl */

/* Scrollbar thumb */
::-webkit-scrollbar-thumb { border-radius: 2px; }
```

---

## 5. Ombres et elevation

### 5.1 Niveaux d'elevation

L'application privilegie l'elevation par **contraste de surface** plutot que par ombre portee, ce qui est typique des dark themes.

| Niveau | Surface       | Hex       | Usage                            |
|--------|---------------|-----------|----------------------------------|
| 0      | slate-950     | `#020617` | Fond global                      |
| 1      | slate-900     | `#0f172a` | Cards, panneaux de phase, guide  |
| 2      | slate-800     | `#1e293b` | Inputs, zone interactive         |
| 3      | slate-700     | `#334155` | Boutons secondaires              |
| 4      | emerald-600   | `#059669` | FAB play/pause (elevation max)   |

### 5.2 Overlay de modal

```css
/* Backdrop sombre avec transparence */
.modal-backdrop {
  background: rgba(0, 0, 0, 0.60); /* bg-black/60 */
}
```

### 5.3 Ombres recommandees (extensions futures)

Si des ombres sont necessaires pour de nouveaux composants :

```css
/* Elevation subtile pour les FAB */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);

/* Elevation moyenne pour les popovers */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4),
             0 2px 4px -2px rgba(0, 0, 0, 0.3);

/* Elevation forte pour les modals */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5),
             0 4px 6px -4px rgba(0, 0, 0, 0.4);
```

---

## 6. Composants UI

### 6.1 Button

**Fichier :** `src/components/ui/Button.tsx`

#### Variantes

| Variante    | Fond               | Texte             | Hover               |
|-------------|---------------------|--------------------|----------------------|
| `primary`   | `bg-emerald-600`    | `text-white`       | `bg-emerald-500`     |
| `secondary` | `bg-slate-700`      | `text-slate-200`   | `bg-slate-600`       |
| `danger`    | `bg-red-600`        | `text-white`       | `bg-red-500`         |
| `ghost`     | `bg-transparent`    | `text-slate-300`   | `bg-slate-800`       |

#### Tailles

| Taille | Padding        | Font size   | Hauteur ~  |
|--------|----------------|-------------|------------|
| `sm`   | `px-3 py-1.5`  | `text-sm`   | 32px       |
| `md`   | `px-4 py-2.5`  | `text-base` | 40px       |
| `lg`   | `px-6 py-3.5`  | `text-lg`   | 48px       |

#### Etats

```tsx
// Classes de base appliquees a toutes les variantes
'inline-flex items-center justify-center rounded-xl font-medium'
'transition-colors'
'active:scale-95'
'disabled:opacity-50 disabled:pointer-events-none'
```

#### Exemple complet

```html
<!-- Bouton principal pleine largeur (CTA) -->
<button class="w-full inline-flex items-center justify-center rounded-xl font-medium
  bg-emerald-600 text-white hover:bg-emerald-500
  px-6 py-3.5 text-lg
  transition-colors active:scale-95
  disabled:opacity-50 disabled:pointer-events-none">
  Demarrer
</button>

<!-- Bouton ghost danger (suppression) -->
<button class="inline-flex items-center justify-center rounded-xl font-medium
  bg-transparent text-red-400 hover:bg-slate-800
  px-3 py-1.5 text-sm
  transition-colors active:scale-95">
  Supprimer
</button>
```

### 6.2 Boutons circulaires (Player)

Les controles du player utilisent des boutons circulaires sans le composant `Button`.

```html
<!-- Bouton d'action secondaire (stop, restart, skip) -->
<button class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center
  hover:bg-slate-700 active:scale-95">
  <!-- icone SVG 20x20 (w-5 h-5) -->
</button>

<!-- Bouton principal Play/Pause -->
<button class="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center
  hover:bg-emerald-500 active:scale-95">
  <!-- icone SVG 32x32 (w-8 h-8) -->
</button>
```

| Taille      | Dimensions | Icone   | Usage          |
|-------------|------------|---------|----------------|
| Standard    | `w-12 h-12`| `w-5 h-5` | Stop, Restart, Skip |
| Grand (FAB) | `w-20 h-20`| `w-8 h-8` | Play / Pause       |

### 6.3 Inputs

#### Input texte

```html
<input class="w-full bg-slate-800 rounded-lg px-3 py-2.5 text-slate-100
  outline-none focus:ring-2 focus:ring-emerald-500/50"
  placeholder="Nom de l'exercice" />
```

| Propriete     | Valeur                       |
|---------------|------------------------------|
| Fond          | `bg-slate-800`               |
| Rayon         | `rounded-lg` (8px)           |
| Padding       | `px-3 py-2.5`               |
| Texte         | `text-slate-100`             |
| Placeholder   | `placeholder-slate-500`      |
| Focus         | `focus:ring-2 focus:ring-emerald-500/50` |
| Outline       | `outline-none`               |

#### Input numerique (inline dans les labels)

```html
<input type="number"
  class="w-14 bg-slate-800 rounded-lg px-2 py-1 text-center text-slate-100" />
```

#### Input numerique (large, avec stepper)

```html
<!-- Conteneur du stepper -->
<div class="flex items-center gap-3">
  <!-- Bouton decrementeur -->
  <button class="w-12 h-12 bg-slate-800 rounded-xl text-xl font-bold
    hover:bg-slate-700 active:bg-slate-600">-</button>

  <!-- Valeur -->
  <input class="flex-1 bg-slate-800 rounded-lg px-3 py-2.5
    text-center text-2xl font-mono text-slate-100 outline-none" />

  <!-- Bouton incrementeur -->
  <button class="w-12 h-12 bg-slate-800 rounded-xl text-xl font-bold
    hover:bg-slate-700 active:bg-slate-600">+</button>
</div>
```

#### Input transparent (titre editable)

```html
<input class="flex-1 bg-transparent text-lg font-semibold outline-none
  text-slate-100 placeholder-slate-500"
  placeholder="Nom du programme" />
```

### 6.4 Cards

#### Card programme (HomePage)

```html
<div class="bg-slate-900 rounded-xl p-4 active:bg-slate-800 transition-colors">
  <h3 class="font-semibold text-slate-100">Nom du programme</h3>
  <p class="text-sm text-slate-400 mt-1">3 phases . 8 exercices</p>
  <div class="flex gap-2 mt-3">
    <!-- Boutons d'action -->
  </div>
</div>
```

| Propriete     | Valeur                                |
|---------------|---------------------------------------|
| Fond          | `bg-slate-900`                        |
| Rayon         | `rounded-xl` (12px)                   |
| Padding       | `p-4` (16px)                          |
| Etat actif    | `active:bg-slate-800`                 |
| Transition    | `transition-colors`                   |
| Spacing items | `space-y-3` (entre cards)             |

#### Card phase (EditorPage)

```html
<div class="bg-slate-900 rounded-xl border-l-4 border-emerald-500/40 overflow-hidden">
  <!-- Header cliquable (collapse) -->
  <div class="flex items-center justify-between p-4 cursor-pointer">
    ...
  </div>
  <!-- Contenu collapsible -->
  <div class="px-4 pb-4 space-y-2">
    ...
  </div>
</div>
```

La bordure gauche coloree (`border-l-4`) identifie le type de phase :
- Echauffement : `border-amber-500/40`
- Principal : `border-emerald-500/40`
- Gainage : `border-blue-500/40`
- Etirements : `border-purple-500/40`

#### Card exercice (item dans une phase)

```html
<div class="flex items-center gap-2 bg-slate-800/50 rounded-lg p-3">
  <!-- Boutons haut/bas -->
  <!-- Info exercice -->
  <!-- Bouton supprimer -->
</div>
```

### 6.5 Modal

**Fichier :** `src/components/ui/Modal.tsx`

```html
<!-- Backdrop -->
<div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
  <!-- Overlay -->
  <div class="absolute inset-0 bg-black/60" />

  <!-- Contenu -->
  <div class="relative w-full sm:max-w-md bg-slate-900
    rounded-t-2xl sm:rounded-2xl p-5 pb-8 safe-bottom
    max-h-[85dvh] overflow-y-auto">
    <h2 class="text-lg font-semibold text-slate-100 mb-4">Titre</h2>
    <!-- children -->
  </div>
</div>
```

| Propriete         | Mobile                    | Desktop (sm+)         |
|-------------------|---------------------------|-----------------------|
| Position contenu  | `items-end` (bottom sheet)| `items-center`        |
| Largeur           | `w-full`                  | `sm:max-w-md` (448px) |
| Rayon             | `rounded-t-2xl`           | `sm:rounded-2xl`      |
| Hauteur max       | `max-h-[85dvh]`           | `max-h-[85dvh]`       |
| Padding           | `p-5 pb-8`                | `p-5 pb-8`            |
| Z-index           | `z-50`                    | `z-50`                |
| Backdrop          | `bg-black/60`             | `bg-black/60`         |
| Body lock         | `overflow: hidden` sur body | idem               |
| Fermeture         | Clic sur backdrop         | idem                  |

### 6.6 ConfirmDialog

**Fichier :** `src/components/ui/ConfirmDialog.tsx`

Compose un `Modal` + un message + deux boutons (annuler / confirmer).

```html
<p class="text-slate-400 mb-6">Message de confirmation</p>
<div class="flex gap-3">
  <Button variant="secondary" class="flex-1">Annuler</Button>
  <Button variant="danger" class="flex-1">Supprimer</Button>
</div>
```

Prop `danger: boolean` determine la variante du bouton de confirmation (`danger` ou `primary`).

### 6.7 Toggle (Segmented Control)

Utilise dans l'editeur pour basculer entre mode "Duree" et "Repetitions".

```html
<div class="flex bg-slate-800 rounded-lg p-1">
  <!-- Option active -->
  <button class="flex-1 py-2 text-sm rounded-md bg-emerald-600 text-white transition-colors">
    Duree
  </button>
  <!-- Option inactive -->
  <button class="flex-1 py-2 text-sm rounded-md text-slate-400 transition-colors">
    Repetitions
  </button>
</div>
```

| Etat     | Fond             | Texte            |
|----------|------------------|------------------|
| Actif    | `bg-emerald-600` | `text-white`     |
| Inactif  | transparent      | `text-slate-400` |

### 6.8 EmptyState

**Fichier :** `src/components/ui/EmptyState.tsx`

```html
<div class="flex flex-col items-center justify-center py-16 px-6 text-center">
  <!-- Icone dans un cercle -->
  <div class="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
    <svg class="w-10 h-10 text-slate-500" ...>...</svg>
  </div>
  <h3 class="text-lg font-medium text-slate-300">Titre</h3>
  <p class="text-sm text-slate-500 mt-1">Sous-titre</p>
</div>
```

### 6.9 Barre de progression

Barre lineaire en haut du player indiquant la progression globale.

```html
<div class="h-1 bg-slate-800">
  <div class="h-full bg-emerald-500 transition-all duration-500"
    style="width: 45%">
  </div>
</div>
```

| Propriete  | Valeur                                  |
|------------|-----------------------------------------|
| Hauteur    | `h-1` (4px)                             |
| Fond       | `bg-slate-800`                          |
| Remplissage| `bg-emerald-500`                        |
| Transition | `transition-all duration-500`           |

### 6.10 Timer circulaire (SVG)

Anneau SVG pour afficher le compte a rebours du timer.

```html
<div class="relative w-56 h-56">
  <svg class="w-full h-full -rotate-90" viewBox="0 0 200 200">
    <!-- Anneau de fond -->
    <circle cx="100" cy="100" r="90" fill="none"
      stroke="#1e293b" stroke-width="8" />

    <!-- Anneau de progression -->
    <circle cx="100" cy="100" r="90" fill="none"
      stroke="#10b981"           <!-- exercice : emerald -->
      stroke-width="8"
      stroke-linecap="round"
      stroke-dasharray="565.49"  <!-- 2 * PI * 90 -->
      stroke-dashoffset="..."    <!-- calcule dynamiquement -->
      class="transition-all duration-1000 ease-linear" />
  </svg>

  <!-- Valeur centrale -->
  <div class="absolute inset-0 flex flex-col items-center justify-center">
    <span class="text-6xl font-mono font-bold tabular-nums">2:30</span>
  </div>
</div>
```

| Contexte   | Couleur anneau | Hex       |
|------------|----------------|-----------|
| Exercice   | Emerald        | `#10b981` |
| Repos      | Amber          | `#f59e0b` |

### 6.11 Cercle de repetitions

```html
<div class="w-56 h-56 rounded-full border-4 border-emerald-500/30
  flex flex-col items-center justify-center mx-auto">
  <span class="text-6xl font-mono font-bold">12</span>
  <span class="text-sm text-slate-400 mt-1">Repetitions</span>
</div>
```

### 6.12 Badge de completion (ecran termine)

```html
<div class="w-24 h-24 rounded-full bg-emerald-600/20
  flex items-center justify-center mb-6">
  <svg class="w-12 h-12 text-emerald-400" ...>
    <!-- Checkmark -->
  </svg>
</div>
```

### 6.13 Bouton d'ajout (dashed border)

```html
<button class="w-full py-3 text-sm text-slate-400
  hover:text-emerald-400
  border border-dashed border-slate-700 hover:border-emerald-500/50
  rounded-xl transition-colors">
  + Ajouter une phase
</button>
```

### 6.14 Guide d'exercice (panneau expansible)

```html
<!-- Bouton toggle -->
<button class="flex items-center justify-center gap-2 w-full py-2
  text-sm text-slate-400 hover:text-emerald-400 transition-colors">
  Comment faire ?
  <svg class="w-4 h-4 transition-transform duration-200 rotate-180" .../>
</button>

<!-- Panneau avec animation de hauteur -->
<div class="overflow-hidden transition-all duration-300 ease-in-out
  max-h-[600px] opacity-100">  <!-- ou max-h-0 opacity-0 quand ferme -->
  <div class="bg-slate-900 rounded-xl p-4 mt-1 space-y-4">
    <!-- Image + description -->
    <div class="flex gap-4 items-start">
      <img class="w-20 h-20 rounded-xl flex-shrink-0" />
      <p class="text-sm text-slate-300 leading-relaxed">...</p>
    </div>

    <!-- Etapes -->
    <h4 class="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
      Mouvement
    </h4>
    <ol class="space-y-1.5">
      <li class="flex gap-2 text-sm text-slate-300">
        <span class="text-emerald-500 font-mono text-xs mt-0.5">1.</span>
        Etape...
      </li>
    </ol>

    <!-- Conseils -->
    <h4 class="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
      Conseils
    </h4>
    <ul class="space-y-1.5">
      <li class="flex gap-2 text-sm text-slate-400">
        <span class="text-amber-500">&bull;</span>
        Conseil...
      </li>
    </ul>
  </div>
</div>
```

### 6.15 Liste de selection (modal ajout phase)

```html
<div class="space-y-2">
  <button class="w-full text-left px-4 py-3 bg-slate-800
    hover:bg-slate-700 rounded-lg transition-colors">
    Echauffement
  </button>
  <!-- ... autres options -->
</div>
```

---

## 7. Iconographie

### 7.1 Style

Toutes les icones sont des **SVG inline** au style Heroicons (outline).

| Propriete     | Valeur              |
|---------------|---------------------|
| Style         | Outline (stroke)    |
| `stroke-width`| `2` (standard)      |
| `stroke-width`| `1.5` (EmptyState)  |
| `fill`        | `none`              |
| `stroke`      | `currentColor`      |
| `stroke-linecap` | `round`          |
| `stroke-linejoin`| `round`          |
| `viewBox`     | `0 0 24 24`         |

### 7.2 Tailles

| Tailwind   | Pixels | Usage                                  |
|------------|--------|----------------------------------------|
| `w-3.5 h-3.5` | 14px | Fleches de reordonnement (haut/bas)  |
| `w-4 h-4` | 16px   | Icones d'action (delete, chevron, help)|
| `w-5 h-5` | 20px   | Navigation (back), icones player       |
| `w-8 h-8` | 32px   | Icone play/pause (FAB principal)       |
| `w-10 h-10`| 40px  | Icone de l'EmptyState                  |
| `w-12 h-12`| 48px  | Icone ecran de completion              |

### 7.3 Couleurs des icones

| Contexte               | Couleur           | Tailwind          |
|------------------------|-------------------|--------------------|
| Navigation             | Texte par defaut  | (inherit)          |
| Actions                | `text-slate-500`  | Muet               |
| Action hover danger    | `text-red-400`    | Au survol          |
| Player secondaire      | `text-slate-300`  | Clair              |
| Player stop            | `text-red-400`    | Danger             |
| Player play/pause      | `text-white`      | Sur fond emerald   |
| EmptyState             | `text-slate-500`  | Muet               |
| Completion (check)     | `text-emerald-400`| Succes             |
| Chevron collapse       | `text-slate-500`  | Muet               |
| Deplacement desactive  | `opacity-30`      | Tres muet          |

### 7.4 Icones specifiques au player (filled)

Certaines icones du player utilisent `fill="currentColor"` plutot que le stroke :
- **Stop** : carre arrondi rempli (`<rect rx="2" />`)
- **Pause** : deux rectangles verticaux remplis
- **Play** : triangle rempli
- **Skip** : triangle + barre verticale remplis

### 7.5 Illustrations d'exercices

Les illustrations utilisent des stick figures SVG generees dynamiquement.

```
viewBox: 0 0 120 120
Fond:    #0f172a (slate-950) avec rx="16"
Trait:   #10b981 (emerald) stroke-width="2.5"
Accents: #f59e0b (amber) pour les elements de mouvement
Sol:     #334155 (slate-700) en pointilles (stroke-dasharray="4")
```

---

## 8. Animations et transitions

### 8.1 Transitions standard

| Usage                   | Classe Tailwind                  | Duree | Easing        |
|-------------------------|----------------------------------|-------|---------------|
| Changement de couleur   | `transition-colors`              | 150ms | ease          |
| Rotation chevron        | `transition-transform`           | 150ms | ease          |
| Barre de progression    | `transition-all duration-500`    | 500ms | ease          |
| Timer anneau SVG        | `transition-all duration-1000 ease-linear` | 1000ms | linear |

### 8.2 Panneau expansible (guide exercice)

```css
/* Ouvert */
.panel-open {
  max-height: 600px;
  opacity: 1;
  transition: all 300ms ease-in-out;
}

/* Ferme */
.panel-closed {
  max-height: 0;
  opacity: 0;
  transition: all 300ms ease-in-out;
}
```

Tailwind :
```html
<!-- Ouvert -->
<div class="overflow-hidden transition-all duration-300 ease-in-out max-h-[600px] opacity-100">

<!-- Ferme -->
<div class="overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0">
```

### 8.3 Rotation du chevron

```html
<!-- Ouvert (contenu visible) -->
<svg class="w-5 h-5 text-slate-500 transition-transform rotate-180" />

<!-- Ferme -->
<svg class="w-5 h-5 text-slate-500 transition-transform" />
```

### 8.4 Feedback tactile (active state)

```css
/* Effet de pression sur les boutons */
active:scale-95
```

Applique sur : tous les boutons (`Button`, boutons circulaires du player).

### 8.5 Durees de reference

| Token        | Duree  | Usage                               |
|--------------|--------|--------------------------------------|
| `instant`    | 0ms    | Changement d'etat immediat           |
| `fast`       | 150ms  | Transitions de couleur, hover        |
| `normal`     | 200ms  | Rotation chevron guide               |
| `smooth`     | 300ms  | Panneau expansible                   |
| `progress`   | 500ms  | Barre de progression                 |
| `timer`      | 1000ms | Anneau du timer (synchro 1 seconde)  |

### 8.6 Courbes d'acceleration

| Token          | CSS                | Usage                      |
|----------------|--------------------|----------------------------|
| `ease`         | `ease` (defaut)    | Interactions UI generales  |
| `ease-in-out`  | `ease-in-out`      | Panneaux expansibles       |
| `linear`       | `linear`           | Timer countdown (constant) |

---

## 9. Grille et layout

### 9.1 Structure de page

Toutes les pages suivent le meme patron flex vertical sur toute la hauteur de l'ecran :

```html
<div class="flex flex-col h-[100dvh]">
  <!-- Header (fixe en haut) -->
  <header class="flex items-center ... px-4 py-3 border-b border-slate-800">
    ...
  </header>

  <!-- Contenu scrollable -->
  <div class="flex-1 overflow-y-auto px-4 py-4">
    ...
  </div>

  <!-- Footer / CTA (fixe en bas) -->
  <div class="p-4 border-t border-slate-800">
    ...
  </div>
</div>
```

| Zone    | Comportement           | Bordure                   |
|---------|------------------------|---------------------------|
| Header  | Fixe, non scrollable   | `border-b border-slate-800` |
| Content | `flex-1 overflow-y-auto` | --                       |
| Footer  | Fixe, non scrollable   | `border-t border-slate-800` |

### 9.2 Hauteur viewport

```css
/* Utilisation de dvh (dynamic viewport height) pour gerer la barre d'adresse mobile */
height: 100dvh;
```

### 9.3 Wrapper global (App)

```html
<div class="min-h-[100dvh] bg-slate-950 text-slate-100 safe-top safe-bottom">
  <!-- Routes -->
</div>
```

### 9.4 Safe areas (PWA / encoche)

```css
/* Classes utilitaires definies dans index.css */
.safe-top    { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

Applique sur :
- `safe-top` + `safe-bottom` : wrapper global `App.tsx`
- `safe-bottom` : contenu de modal (en plus du `pb-8`)

### 9.5 Largeur maximale

| Contexte   | Largeur max      | Tailwind          |
|------------|------------------|-------------------|
| Page       | 100%             | `w-full`          |
| Modal      | 448px            | `sm:max-w-md`     |
| Guide panel| 384px            | `max-w-sm`        |

### 9.6 Breakpoints

L'application utilise un seul breakpoint significatif :

| Breakpoint | Tailwind | Pixels | Comportement                              |
|------------|----------|--------|-------------------------------------------|
| Mobile     | (defaut) | < 640px | Modal en bottom-sheet (`items-end`)       |
| Small+     | `sm:`    | >= 640px| Modal centree (`items-center`, `rounded-2xl`) |

### 9.7 Comportement PWA

```css
/* Desactiver le pull-to-refresh */
html { overflow: hidden; }
#root { height: 100dvh; overflow-y: auto; }

/* Desactiver la selection de texte */
body {
  user-select: none;
  -webkit-user-select: none;
}

/* Desactiver le highlight au tap */
html { -webkit-tap-highlight-color: transparent; }

/* Desactiver le overscroll bounce */
body { overscroll-behavior: none; }
```

### 9.8 Scrollbar personnalisee

```css
::-webkit-scrollbar       { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
```

---

## 10. Tokens CSS (Custom Properties)

### 10.1 Tokens actuels

Definis dans `src/index.css` via la directive `@theme` de Tailwind v4 :

```css
@theme {
  --color-surface:          #0f172a;  /* slate-900 */
  --color-surface-elevated: #1e293b;  /* slate-800 */
  --color-accent:           #10b981;  /* emerald-500 */
  --color-accent-warm:      #f59e0b;  /* amber-500 */
  --color-danger:           #ef4444;  /* red-500 */
}
```

### 10.2 Tokens recommandes (extensions)

Pour maintenir la coherence lors de l'evolution de l'app, voici les tokens supplementaires recommandes :

```css
@theme {
  /* ── Surfaces ─────────────────────────────────── */
  --color-surface:           #0f172a;
  --color-surface-elevated:  #1e293b;
  --color-surface-overlay:   rgba(0, 0, 0, 0.60);
  --color-background:        #020617;

  /* ── Accent primaire (Emerald) ────────────────── */
  --color-accent:            #10b981;
  --color-accent-hover:      #059669;
  --color-accent-subtle:     rgba(16, 185, 129, 0.20);
  --color-accent-ring:       rgba(16, 185, 129, 0.50);

  /* ── Accent chaud (Amber) ─────────────────────── */
  --color-accent-warm:       #f59e0b;
  --color-accent-warm-subtle: rgba(245, 158, 11, 0.40);

  /* ── Danger ───────────────────────────────────── */
  --color-danger:            #ef4444;
  --color-danger-action:     #dc2626;

  /* ── Texte ────────────────────────────────────── */
  --color-text-primary:      #f1f5f9;
  --color-text-secondary:    #cbd5e1;
  --color-text-tertiary:     #94a3b8;
  --color-text-muted:        #64748b;

  /* ── Bordures ─────────────────────────────────── */
  --color-border:            #1e293b;
  --color-border-dashed:     #334155;

  /* ── Phases ───────────────────────────────────── */
  --color-phase-warmup:      rgba(245, 158, 11, 0.40);
  --color-phase-main:        rgba(16, 185, 129, 0.40);
  --color-phase-core:        rgba(59, 130, 246, 0.40);
  --color-phase-cooldown:    rgba(168, 85, 247, 0.40);

  /* ── Espacement ───────────────────────────────── */
  --spacing-page-x:          1rem;    /* 16px */
  --spacing-page-y:          1rem;    /* 16px */
  --spacing-card:            1rem;    /* 16px */
  --spacing-modal:           1.25rem; /* 20px */

  /* ── Rayons ───────────────────────────────────── */
  --radius-sm:               0.375rem; /* 6px  */
  --radius-md:               0.5rem;   /* 8px  */
  --radius-lg:               0.75rem;  /* 12px */
  --radius-xl:               1rem;     /* 16px */
  --radius-full:             9999px;

  /* ── Transitions ──────────────────────────────── */
  --duration-fast:           150ms;
  --duration-normal:         200ms;
  --duration-smooth:         300ms;
  --duration-progress:       500ms;
  --duration-timer:          1000ms;

  /* ── Z-index ──────────────────────────────────── */
  --z-modal:                 50;
}
```

### 10.3 Utilisation des tokens dans Tailwind

Avec Tailwind v4 et la directive `@theme`, les tokens sont automatiquement disponibles comme classes utilitaires :

```html
<!-- Les tokens definis dans @theme sont utilisables directement -->
<div class="bg-surface">...</div>
<div class="bg-surface-elevated">...</div>
<div class="text-accent">...</div>
<div class="border-accent-warm">...</div>
```

---

## Annexe : Recapitulatif rapide

### Palette condensee

```
Fond app :     #020617  (slate-950)
Surface 1 :    #0f172a  (slate-900)
Surface 2 :    #1e293b  (slate-800)
Surface 3 :    #334155  (slate-700)
Accent :       #10b981  (emerald-500)
Action :       #059669  (emerald-600)
Chaud :        #f59e0b  (amber-500)
Danger :       #ef4444  (red-500)
Texte clair :  #f1f5f9  (slate-100)
Texte moyen :  #94a3b8  (slate-400)
Texte muet :   #64748b  (slate-500)
```

### Checklist composant

Lors de la creation d'un nouveau composant, verifier :

- [ ] Utilise les surfaces par elevation (slate-950 > 900 > 800 > 700)
- [ ] Rayon `rounded-xl` pour les cards, `rounded-lg` pour les inputs
- [ ] `transition-colors` sur tous les elements interactifs
- [ ] `active:scale-95` sur les boutons
- [ ] `disabled:opacity-50 disabled:pointer-events-none` pour l'etat desactive
- [ ] Couleurs de texte coherentes (100/300/400/500)
- [ ] Focus visible avec `focus:ring-2 focus:ring-emerald-500/50`
- [ ] Support du safe-area pour les elements en bas de page
- [ ] `font-mono tabular-nums` pour les valeurs numeriques/timers
