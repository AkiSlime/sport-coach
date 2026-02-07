# Custom Coach -- Guide Product Design

> Document vivant. Derniere mise a jour : Fevrier 2026.
> Ce guide definit la vision, les principes et les decisions de design de Custom Coach.

---

## Table des matieres

1. [Vision produit](#1-vision-produit)
2. [Personas](#2-personas)
3. [User flows detailles](#3-user-flows-detailles)
4. [Architecture d'information](#4-architecture-dinformation)
5. [Patterns d'interaction](#5-patterns-dinteraction)
6. [Principes de design](#6-principes-de-design)
7. [Emotional design](#7-emotional-design)
8. [Roadmap fonctionnalites futures](#8-roadmap-fonctionnalites-futures)
9. [Wording et ton](#9-wording-et-ton)
10. [Metriques de succes](#10-metriques-de-succes)

---

## 1. Vision produit

### Pour qui ?

Custom Coach s'adresse aux **personnes qui s'entrainent chez elles, sans coach, sans salle, sans materiel imposant**. Ce sont des pratiquants debutants a intermediaires, francophones, qui veulent structurer leur seance sans dependre d'une app complexe ni d'un abonnement.

### Pourquoi ?

Le probleme que nous resolvons :

- Les applications de fitness existantes imposent leurs propres programmes (on ne choisit rien).
- Les minuteurs generiques (Tabata timer, etc.) ne gerent pas la notion de phases structurees (echauffement, bloc principal, gainage, etirements).
- Les applications completes (Hevy, Strong, Nike Training) sont surchargees de fonctionnalites, d'upsells et demandent un compte.

Custom Coach comble ce vide : **un outil qui laisse l'utilisateur creer SON programme, puis le guide pas a pas avec un minuteur vocal intelligent, sans friction**.

### Differenciateur

| Ce qu'on fait mieux | Ce qu'on ne fait pas (volontairement) |
|---|---|
| Creation libre de programmes structures en phases | Pas de catalogue d'exercices impose |
| Guidage vocal en francais pendant la seance | Pas de tracking de progression/historique (pour l'instant) |
| PWA installable, fonctionne 100 % hors ligne | Pas de compte utilisateur, pas de cloud |
| Zero inscription, zero pub, zero abonnement | Pas de video/streaming |
| Interface lisible a distance (pendant le workout) | Pas de dimension sociale |

### Positionnement en une phrase

> Custom Coach est le carnet d'entrainement numerique qui te guide a la voix -- tu crees ton programme, il fait le reste.

---

## 2. Personas

### Persona 1 : Marie, 34 ans -- "La maman organisee"

**Contexte** : Marie a deux enfants en bas age. Elle n'a pas le temps d'aller en salle. Elle s'entraine 3 fois par semaine dans son salon, tot le matin ou pendant la sieste des enfants, en 25 a 40 minutes max.

**Comportement** :
- Elle a un programme qu'elle a trouve sur YouTube et qu'elle reproduit a l'identique chaque semaine.
- Elle enchaine les exercices au poids du corps : squats, pompes, gainage, etirements.
- Elle utilise actuellement un minuteur basique sur son telephone et note son programme sur un post-it colle au mur.

**Frustrations** :
- Elle oublie regulierement les temps de repos ou l'ordre des exercices.
- Elle doit toucher son telephone a chaque exercice (mains moites, sol, bebe qui crie).
- Les apps fitness qu'elle a testees demandent un abonnement ou sont en anglais.

**Ce que Custom Coach lui apporte** :
- Elle cree son programme une seule fois, puis lance la seance d'un tap.
- La voix lui annonce chaque exercice et chaque repos : zero ecran a regarder.
- Le guide integre (panel "Comment faire ?") la rassure sur sa posture quand elle doute.

**Citation fictive** : *"Je veux juste appuyer sur Play et suivre. Pas reflechir."*

---

### Persona 2 : Thomas, 27 ans -- "Le sportif autodidacte"

**Contexte** : Thomas fait de la musculation au poids du corps depuis 2 ans. Il suit des programmes de type street workout trouves sur Reddit et les ajuste regulierement (nombre de cycles, exercices, temps de repos).

**Comportement** :
- Il a 3-4 programmes differents qu'il alterne selon les jours (haut du corps, bas du corps, full body, mobilite).
- Il chronometre ses repos et ajuste les cycles manuellement.
- Il cherche un outil flexible, pas un coach qui lui dit quoi faire.

**Frustrations** :
- Les apps de timer ne gerent pas les cycles de facon propre (3 tours de 4 exercices avec repos entre tours).
- Il doit jongler entre une app de notes et un chrono.
- Il veut un outil rapide, pas une usine a gaz.

**Ce que Custom Coach lui apporte** :
- Le systeme de phases + cycles correspond exactement a sa logique d'entrainement.
- La duplication de programme lui permet de varier rapidement.
- L'editeur est rapide : +/- pour ajuster les durees, drag pour reordonner.

**Citation fictive** : *"C'est exactement ce que je cherchais : un timer intelligent qui comprend les cycles."*

---

### Persona 3 : Jean-Pierre, 58 ans -- "Le senior actif"

**Contexte** : Jean-Pierre a commence a faire de la gym douce sur les conseils de son kinesitherapeute. Il suit un programme simple : echauffement articulaire, quelques exercices de renforcement, etirements.

**Comportement** :
- Son programme change rarement. Il le fait 5 jours sur 7, le matin.
- Il n'est pas tres a l'aise avec la technologie mais utilise un smartphone Android.
- Il a besoin qu'on lui dise clairement quoi faire et combien de temps.

**Frustrations** :
- Les applications de fitness sont trop complexes, avec trop de menus et d'options.
- Les textes sont trop petits sur son telephone.
- Il se trompe parfois dans l'ordre des exercices prescrits par son kine.

**Ce que Custom Coach lui apporte** :
- L'interface sombre avec des gros caracteres est lisible sans lunettes.
- L'annonce vocale de chaque exercice le guide sans qu'il ait a lire l'ecran.
- Le panneau "Comment faire ?" avec le stick-figure et les etapes simples le rassure sur sa posture.

**Citation fictive** : *"Ca me parle et ca me dit quoi faire. C'est tout ce dont j'ai besoin."*

---

## 3. User flows detailles

### Flow 1 : Premier lancement (onboarding implicite)

```
+------------------+
| Ouverture app    |
| (premier usage)  |
+--------+---------+
         |
         v
+------------------+
| Page d'accueil   |
| Etat vide :      |
| "Aucun programme"|
| CTA: [+ Nouveau  |
|     programme]   |
+--------+---------+
         |
         | Tap sur CTA
         v
+------------------+
| Redirection vers |
| EditorPage       |
| Programme vierge |
| "Mon programme"  |
+--------+---------+
         |
         | L'utilisateur nomme
         | son programme et
         | ajoute des phases
         v
+------------------+
| EditorPage       |
| rempli avec      |
| phases+exercices |
+--------+---------+
         |
         | Tap "Demarrer"
         v
+------------------+
| PlayerPage       |
| Seance en cours  |
+------------------+
```

> **Point cle** : Pas d'ecran d'inscription, pas de tutorial, pas de wizard.
> L'onboarding est l'acte meme de creer son premier programme.
> L'app demarre vide et le CTA principal est impossible a manquer.

---

### Flow 2 : Creation / edition d'un programme

```
+-------------------+      +-------------------+
| HomePage          |      | EditorPage        |
| [+ Nouveau prog]  +----->| Nom programme     |
+-------------------+      | (input inline)    |
                            +--------+----------+
                                     |
                       +-------------+-------------+
                       |                           |
                       v                           v
              +-----------------+         +------------------+
              | [+ Ajouter      |         | Phase existante  |
              |   une phase]    |         | (collapsible)    |
              +--------+--------+         +--------+---------+
                       |                           |
                       v                           v
              +-----------------+         +------------------+
              | Modal choix     |         | [+ Ajouter       |
              | type de phase : |         |   un exercice]   |
              | - Echauffement  |         +--------+---------+
              | - Bloc Principal|                  |
              | - Gainage       |                  v
              | - Etirements    |         +------------------+
              +--------+--------+         | Exercice inline  |
                       |                  | nom + duree/reps |
                       |                  | [edit] [delete]  |
                       v                  | [up] [down]      |
              Phase creee,                +--------+---------+
              ajoutee au programme                 |
                                                   | Tap sur exercice
                                                   v
                                          +------------------+
                                          | Modal edition    |
                                          | - Nom            |
                                          | - Type (duree/   |
                                          |   repetitions)   |
                                          | - Duree/Reps     |
                                          |   (+/- steppers) |
                                          | - Repos apres    |
                                          | [Annuler] [Save] |
                                          +------------------+
```

> **Decisions de design** :
> - L'editeur n'a pas de bouton "Sauvegarder le programme" : tout est sauvegarde automatiquement via Zustand persist (localStorage).
> - Les phases sont collapsibles pour gerer les programmes longs sans scroll excessif.
> - Les couleurs de bordure gauche distinguent les types de phase visuellement (ambre = echauffement, vert = bloc principal, bleu = gainage, violet = etirements).

---

### Flow 3 : Execution d'une seance (workout)

```
+-------------------+
| HomePage          |
| ou EditorPage     |
| Tap [Demarrer]    |
+--------+----------+
         |
         v
+-------------------+     Le workout-engine "aplatit"
| Initialisation    |     le programme en une sequence
| flattenProgram()  |     lineaire de WorkoutSteps
| unlockAudio()     |     (exercice, repos, repos-cycle)
+--------+----------+
         |
         v
+====================================+
|          BOUCLE DE SEANCE          |
+====================================+
|                                    |
|  +-----------------------------+   |
|  | Ecran exercice TIMED        |   |
|  | - Nom (gros, centre)        |   |
|  | - Cercle timer animé        |   |
|  | - Decompte vocal 3-2-1      |   |
|  | - Annonce vocale du nom     |   |
|  | - [Comment faire ?]         |   |
|  +-------------+---------------+   |
|                | timer = 0         |
|                v                   |
|  +-----------------------------+   |
|  | Ecran REPOS                 |   |
|  | - "Repos" en ambre          |   |
|  | - Decompte                  |   |
|  | - Double beep               |   |
|  +-------------+---------------+   |
|                | timer = 0         |
|                v                   |
|  +-----------------------------+   |
|  | Ecran exercice REPS         |   |
|  | - Nom + nombre de reps      |   |
|  | - Cercle statique           |   |
|  | - Bouton [Termine]          |   |
|  | - Pas de timer (l'user      |   |
|  |   fait a son rythme)        |   |
|  +-------------+---------------+   |
|                | Tap "Termine"     |
|                v                   |
|  (retour au step suivant)          |
|                                    |
|  Controles permanents (bas) :      |
|  [Stop] [Restart] [Play/Pause]     |
|  [Skip]                            |
+====================================+
         |
         | Dernier step termine
         v
+-------------------+
| Ecran "Termine!"  |
| Checkmark vert    |
| Temps total       |
| [Retour]          |
+-------------------+
```

> **Interactions critiques pendant le workout** :
> - **Wake Lock actif** : l'ecran ne s'eteint jamais pendant la seance.
> - **Audio** : annonce vocale FR de chaque exercice + compte a rebours vocal (3, 2, 1) + beep de transition.
> - **Visibilite tab** : si l'utilisateur change d'onglet/app, le timer rattrape les secondes manquees au retour.
> - **Confirmation pour Stop** : un dialog empeche l'arret accidentel.

---

### Flow 4 : Gestion des programmes (liste)

```
+----------------------------------+
| HomePage                         |
+----------------------------------+
| Header: "Custom Coach"           |
+----------------------------------+
| Programme 1                      |
|   "Full Body Maison"             |
|   4 phases - 15 exercices        |
|   [Demarrer] [Editer]            |
|   [Dupliquer] [Supprimer]        |
+----------------------------------+
| Programme 2                      |
|   "Mobilite matin"               |
|   2 phases - 8 exercices         |
|   [Demarrer] [Editer]            |
|   [Dupliquer] [Supprimer]        |
+----------------------------------+
|                                  |
| [+ Nouveau programme]  (full w)  |
+----------------------------------+
```

> **Dupliquer** : cree une copie complete avec " (copie)" en suffixe. Tous les IDs sont regeneres.
> **Supprimer** : ConfirmDialog bloquant avec message explicite, bouton rouge.

---

## 4. Architecture d'information

### Carte du site (3 ecrans)

```
/                          HomePage
|                          Liste des programmes
|                          CTA creation
|
+-- /program/:id           EditorPage
|                          Edition du programme
|                          Phases, exercices, parametres
|
+-- /program/:id/play      PlayerPage
                           Execution de la seance
                           Timer, controles, guidage
```

### Modele de donnees (hierarchie)

```
Programme (Program)
|-- id, name, createdAt, updatedAt
|
+-- Phase[] (warmup | main | core | cooldown)
    |-- id, type, name, cycles, restBetweenCyclesSeconds
    |
    +-- Exercise[]
        |-- id, name
        |-- type: 'timed' | 'reps'
        |-- durationSeconds (si timed)
        |-- reps (si reps)
        |-- restAfterSeconds
```

### Aplatissement pour le Player

Le moteur (`workout-engine.ts`) transforme la hierarchie en une **liste plate de WorkoutSteps** :

```
Phase (3 cycles) avec 2 exercices (A, B) + repos :

Step 1:  Exercice A (cycle 1)
Step 2:  Repos
Step 3:  Exercice B (cycle 1)
Step 4:  Repos entre cycles
Step 5:  Exercice A (cycle 2)
Step 6:  Repos
Step 7:  Exercice B (cycle 2)
Step 8:  Repos entre cycles
Step 9:  Exercice A (cycle 3)
Step 10: Repos
Step 11: Exercice B (cycle 3)
         (pas de repos final)
```

Cet aplatissement permet au Player de ne gerer qu'un index lineaire, simplifiant enormement la logique de lecture.

### Couche de persistence

- **Programmes** : `localStorage` via Zustand persist (cle : `custom-coach-programs`).
- **Etat Player** : memoire uniquement (Zustand sans persist). L'etat de la seance est ephemere par design -- on ne sauvegarde pas une seance en cours.
- **Aucun backend** : zero appel reseau, zero authentification.

---

## 5. Patterns d'interaction

### 5.1. Usage a une main

L'app est concue pour etre tenue et manipulee d'une seule main (la main dominante, le telephone dans l'autre ou pose a cote).

**Decisions** :
- Le bouton Play/Pause est le plus gros element de l'ecran Player (80x80px, centre).
- Les controles secondaires (Stop, Restart, Skip) sont alignes horizontalement sur la meme barre, accessibles au pouce.
- Le bouton "Demarrer" sur la HomePage et l'EditorPage est en `w-full` (pleine largeur) en bas de page, dans la zone de confort du pouce.
- Les boutons +/- des steppers (edition duree/reps) ont une taille de 48x48px minimum pour respecter les guidelines de zone de tap minimale.

### 5.2. Mains moites / transpiration

Pendant un workout, les mains sont humides. L'interaction doit etre minimale.

**Decisions** :
- Les boutons du Player ont un feedback `active:scale-95` pour confirmer le tap meme si le premier contact glisse.
- `-webkit-tap-highlight-color: transparent` et `user-select: none` empechent les selections accidentelles.
- `overscroll-behavior: none` et `overflow: hidden` sur le html empechent le pull-to-refresh accidentel (geste naturel avec des mains moites).
- L'essentiel du guidage se fait **a la voix** : l'utilisateur n'a pas besoin de toucher l'ecran tant que le programme deroule automatiquement.

### 5.3. Ecran loin des yeux pendant le workout

Le telephone est souvent pose par terre, sur un meuble, ou contre un mur a 1-2 metres.

**Decisions** :
- Le timer est affiche en `text-6xl font-mono font-bold` (environ 60px) dans un cercle SVG de 224px de diametre.
- Le nom de l'exercice est en `text-2xl font-bold` et centre.
- La couleur du cercle et du texte change selon le contexte : **vert emeraude** pour exercice, **ambre** pour repos. Ce contraste de couleur est visible de loin, meme sans lire le texte.
- La barre de progression en haut de l'ecran donne une indication visuelle du pourcentage de seance accompli, lisible a distance.
- **L'annonce vocale** est le canal principal d'information : le nom de chaque exercice est prononce en francais, et le decompte 3-2-1 est vocalise.

### 5.4. Pas d'auto-scroll, pas de distraction

- Pendant le workout, l'ecran Player n'a aucun scroll. Tout tient sur un seul viewport.
- Le Wake Lock empeche l'ecran de s'eteindre.
- Il n'y a pas de notification, pas de banniere, pas de popup sauf la confirmation d'arret.

### 5.5. Modals bottom-sheet

Les modals (edition exercice, ajout phase, confirmation) s'affichent depuis le bas de l'ecran sur mobile (`items-end` par defaut, `items-center` en sm+). Ce pattern imite les bottom sheets iOS/Android, plus accessible au pouce que les modals centrees.

---

## 6. Principes de design

### Principe 1 : Autonomie totale

> L'utilisateur est le coach. L'app est l'outil.

Nous ne dictons jamais le contenu de l'entrainement. Pas de "programme suggere", pas de "plan de 8 semaines". L'utilisateur cree ce qu'il veut, comme il veut. Le template par defaut (`createDefaultPhases`) existe uniquement comme point de depart editable, pas comme prescription.

### Principe 2 : Zero friction au lancement

> De "j'ouvre l'app" a "je m'entraine" en 2 taps maximum.

Pas d'inscription, pas de login, pas de tutorial obligatoire. Le premier ecran montre les programmes existants et un CTA pour en creer un. Lancer un workout = 1 tap sur "Demarrer". La sauvegarde est automatique.

### Principe 3 : Invisible pendant l'effort

> La meilleure interface pendant un workout est celle qu'on ne regarde pas.

Le systeme audio (synthese vocale + beeps) guide l'utilisateur sans qu'il ait besoin de regarder l'ecran. L'interface visuelle n'est qu'un complement pour ceux qui le souhaitent. Les controles tactiles sont la en cas de besoin (pause, skip) mais le flux automatique est le chemin principal.

### Principe 4 : Offline-first, toujours pret

> L'app doit fonctionner dans un garage sans Wi-Fi.

PWA avec Service Worker (Workbox), tout le code et les assets sont caches. Les donnees sont en localStorage. Aucune dependance reseau. L'utilisateur peut installer l'app sur son ecran d'accueil et l'utiliser comme une app native.

### Principe 5 : Lisibilite extreme

> Si tu ne peux pas lire l'ecran a 2 metres avec de la sueur dans les yeux, le texte est trop petit.

Typographie grande et contrastee. Fond sombre (#0f172a / slate-950) pour economiser la batterie OLED et reduire l'eblouissement en interieur sombre. Les couleurs fonctionnelles sont limitees a 4 : emeraude (action principale, exercice), ambre (repos, conseil), rouge (danger, stop), slate (neutre).

### Principe 6 : Donnees sacrees

> Les programmes de l'utilisateur ne disparaissent jamais accidentellement.

Toute suppression est precedee d'un ConfirmDialog explicite. La duplication est disponible partout comme filet de securite. Les donnees restent en local, sous le controle de l'utilisateur. Pas de "sync" non sollicite, pas de reset silencieux.

---

## 7. Emotional design

### Avant la seance : Confiance et simplicite

L'utilisateur ouvre l'app et voit ses programmes. Pas de dashboard complexe, pas de statistiques culpabilisantes ("tu n'as pas fait de sport depuis 5 jours"). L'interface est calme, structuree, et dit simplement : *"Ton programme est la. Quand tu es pret, on y va."*

**Palette emotionnelle** : fond sombre et apaisant, texte clair, touches de vert emeraude qui evoquent l'energie positive sans agressivite.

### Pendant la seance : Guidage bienveillant et rythme

La voix annonce les exercices avec un ton neutre et clair (synthese vocale a rate 1.0). Le decompte 3-2-1 est prononce avec assurance (rate 1.3). Les beeps sont nets mais pas stridents (sinus waves a volume 0.3). Le double beep du repos est distinctif mais doux.

L'ambiance sonore doit evoquer un coach present mais pas autoritaire. Pas de "ALLEZ ON POUSSE !", pas de musique imposee. Juste l'information necessaire au bon moment.

**Le cercle timer animé** est le coeur visuel de la seance. Son mouvement continu cree un rythme visuel hypnotique qui aide a maintenir le focus. La transition douce (`transition-all duration-1000 ease-linear`) evite tout a-coup visuel.

### A la fin : Fierte et accomplissement

L'ecran de fin est sobre mais celebratoire :
- Un cercle vert avec un checkmark s'affiche en grand.
- Le texte "Entrainement termine !" est en gras.
- Le temps total est affiche comme un bilan factuel.
- Pas de score, pas de classement, pas de "tu aurais pu faire mieux".

Le message implicite est : *"Tu l'as fait. Bravo. A demain."*

### Tons emotionnels a eviter absolument

- **La culpabilisation** : ne jamais rappeler a l'utilisateur qu'il ne s'est pas entraine.
- **La competition** : pas de leaderboard, pas de comparaison.
- **L'infantilisation** : pas de badges, pas de mascotte, pas de gamification forcee.
- **La surcharge cognitive** : pas de graphiques compliques, pas d'analytics.

---

## 8. Roadmap fonctionnalites futures

### Priorite 1 -- Court terme (v1.x)

| Fonctionnalite | Justification | Effort |
|---|---|---|
| **Historique des seances** | Permettre de voir quand et combien de temps on s'est entraine. Simple log : date + programme + duree totale. | Moyen |
| **Export / Import de programme (JSON)** | Permettre le partage entre appareils ou avec des amis. Un programme = un fichier JSON telecharge/importe. | Faible |
| **Reordonner les phases (drag)** | `movePhase` existe dans le store mais n'a pas d'UI. Ajouter des fleches haut/bas ou du drag-and-drop sur les phases. | Faible |
| **Mode "compact" pour l'editeur** | Affichage plus dense pour les programmes avec beaucoup d'exercices. | Faible |
| **Notifications de fin de repos** | Vibration en plus du beep sonore, pour les environnements bruyants. | Faible |

### Priorite 2 -- Moyen terme (v2.x)

| Fonctionnalite | Justification | Effort |
|---|---|---|
| **Apercu avant lancement** | Ecran recapitulatif montrant toute la seance (duree estimee, nombre de steps) avant d'appuyer sur Play. | Moyen |
| **Estimation de la duree totale** | Calculer et afficher la duree estimee du programme sur la HomePage et l'EditorPage. | Faible |
| **Exercices personnalisables avec notes** | Ajouter un champ "notes" libre sur chaque exercice (ex: "utiliser l'elastique rouge", "cote gauche d'abord"). | Faible |
| **Themes de couleur** | Offrir 2-3 palettes alternatives (dark par defaut, une variante "contraste fort", une variante "nuit totale"). | Moyen |
| **Sons personnalisables** | Choix entre differents types de beeps ou import d'un son personnalise pour les transitions. | Moyen |

### Priorite 3 -- Long terme (v3.x)

| Fonctionnalite | Justification | Effort |
|---|---|---|
| **Calendrier d'entrainement** | Vue semaine/mois avec les seances passees. Permet de visualiser la regularite sans culpabiliser. | Eleve |
| **Bibliotheque d'exercices extensible** | Les guides d'exercices actuels sont en dur. Permettre a l'utilisateur d'ajouter ses propres descriptions/conseils. | Eleve |
| **Integration musique** | Lancer/controller Spotify ou Apple Music depuis l'app pendant le workout. | Eleve |
| **Mode coach vocal avance** | Remplacer la synthese vocale par des enregistrements vocaux naturels ou une voix IA plus chaleureuse. | Eleve |
| **Partage de programmes via lien** | Generer un lien partageable (encode le programme dans l'URL ou via un service minimal). | Moyen |
| **Multi-langue** | L'architecture est deja prete (fichier `fr.ts` centralise). Ajouter `en.ts`, `es.ts`, etc. | Moyen |

### Ce qu'on ne fera jamais

- Un reseau social ou un feed.
- Un systeme d'abonnement payant pour des fonctionnalites de base.
- De la publicite.
- Du tracking biometrique (frequence cardiaque, etc.) -- hors scope.
- De l'IA qui genere des programmes automatiquement (l'utilisateur est le coach).

---

## 9. Wording et ton

### Principes redactionnels

**1. Tutoiement systematique**
L'app tutoie l'utilisateur. C'est un coach amical, pas une institution. Les guides d'exercices disent "Descends en poussant les fesses en arriere", pas "L'utilisateur doit descendre...".

**2. Phrases courtes et directes**
On prefere des instructions claires et courtes. Pas de jargon technique, pas de phrases alambiquees.

| Preferer | Eviter |
|---|---|
| "Genoux dans l'axe des pieds" | "Veillez a ce que vos genoux restent alignes avec la pointe de vos pieds" |
| "Garde le dos droit" | "Il est recommande de maintenir une posture dorsale erigee" |
| "C'est parti !" | "L'exercice va maintenant commencer" |
| "Entrainement termine !" | "Felicitations, votre session d'entrainement est maintenant terminee" |

**3. Encouragement sobre**
On encourage sans en faire trop. Pas de "INCREDIBLE WORK!" ni de "TU ES UN CHAMPION !". Le ton est celui d'un ami qui s'entraine a cote de toi.

| Contexte | Wording |
|---|---|
| Lancement | "C'est parti !" |
| Fin de seance | "Entrainement termine !" |
| Repos | "Repos" |
| Exercice suivant | (annonce vocale du nom simplement) |
| Decompte | "3... 2... 1..." |
| Confirmation d'arret | "Arreter l'entrainement ? Votre progression sera perdue." |

**4. Labels d'action concis**
Les boutons utilisent un seul mot ou deux maximum.

| Action | Label |
|---|---|
| Lancer une seance | "Demarrer" |
| Mettre en pause | "Pause" |
| Reprendre | "Reprendre" |
| Passer un exercice | "Passer" |
| Marquer les reps comme faites | "Termine" |
| Creer un programme | "Nouveau programme" |
| Sauvegarder les modifs | "Enregistrer" |
| Supprimer | "Supprimer" |
| Dupliquer | "Dupliquer" |
| Retour | "Retour" |

**5. Vocabulaire specifique au domaine**
On utilise le vocabulaire francais usuel du fitness a la maison, pas de l'anglais.

| On dit | On ne dit pas |
|---|---|
| Echauffement | Warm-up |
| Bloc Principal | Main set |
| Gainage | Core |
| Etirements / Retour au calme | Cool-down / Stretching |
| Repetitions | Reps (exception dans les labels courts) |
| Cycles | Sets / Rounds |
| Repos | Rest |

**Exception** : les abbreviations "s" (secondes) et "rep." (repetitions) sont acceptees dans les contextes compacts (editeur, timer).

**6. Messages d'erreur et etats vides**
Toujours positifs et orientés action.

| Contexte | Message |
|---|---|
| Aucun programme | "Aucun programme" + "Creez votre premier programme d'entrainement" |
| Programme introuvable | "Programme introuvable" |
| Confirmation suppression | "Ce programme sera supprime definitivement." |
| Suppression phase | "Tous les exercices de cette phase seront supprimes." |

### Voix synthetisee

La voix utilise la synthese vocale du navigateur en `fr-FR` avec les parametres :
- **Rate** : 1.0 pour les noms d'exercices (clair et comprehensible), 1.3 pour le decompte (un peu plus rapide, plus dynamique).
- **Volume** : 1.0 (maximum).
- **Priorite** : voix locale (`localService: true`) pour la reactivite, avec fallback sur voix distante.

---

## 10. Metriques de succes

### Metriques d'engagement (prioritaires)

| Metrique | Definition | Objectif |
|---|---|---|
| **Taux de completion de seance** | % de seances lancees qui atteignent l'ecran "Termine" (sans arret manuel) | > 75 % |
| **Seances par semaine par utilisateur actif** | Nombre moyen de seances lancees par semaine pour un utilisateur ayant au moins 1 programme | >= 3 |
| **Programmes crees par utilisateur** | Nombre moyen de programmes par utilisateur | >= 2 |
| **Taux de retour J+7** | % d'utilisateurs qui relancent une seance dans les 7 jours suivant leur premiere | > 50 % |

### Metriques de qualite UX

| Metrique | Definition | Objectif |
|---|---|---|
| **Temps pour creer un premier programme** | Duree entre l'ouverture de l'app et le premier tap "Demarrer" | < 5 minutes |
| **Taux d'utilisation du guide exercice** | % de seances ou l'utilisateur ouvre au moins une fois le panel "Comment faire ?" | 20-40 % (utile mais pas obligatoire) |
| **Taux d'arrets accidentels** | % de ConfirmDialog d'arret ou l'utilisateur annule (= arret accidentel evite) | > 30 % des ouvertures du dialog |
| **Taux de skip d'exercice** | % de steps skippes pendant une seance. Un taux eleve indique des problemes de programme ou de difficulte. | < 10 % |

### Metriques techniques

| Metrique | Definition | Objectif |
|---|---|---|
| **Taux d'installation PWA** | % d'utilisateurs qui ajoutent l'app a l'ecran d'accueil | > 30 % |
| **Score Lighthouse Performance** | Score PWA et performance de l'audit Lighthouse | > 90 |
| **Taille du bundle** | Poids total du JS + CSS apres build | < 150 KB gzip |
| **Temps de chargement initial** | First Contentful Paint sur 3G rapide | < 2 secondes |

### Metriques anti-objectifs (ce qu'on ne mesure pas)

- **Temps passe dans l'app hors workout** : on ne veut PAS que l'utilisateur passe du temps a "explorer" l'app. L'ideal est qu'il entre, lance sa seance, et sorte.
- **Nombre de taps** : on ne cherche pas l'engagement superficiel. Moins de taps = mieux.
- **"Daily active users"** : un utilisateur qui s'entraine 3 fois par semaine est un succes. On ne pousse pas a l'usage quotidien de l'app (seulement a l'usage quotidien du sport).

### Comment mesurer (contraintes privacy-first)

L'app etant 100 % offline et sans compte, les metriques classiques (analytics, tracking) ne s'appliquent pas directement. Options recommandees :

1. **Metriques embarquees locales** : stocker en localStorage les stats d'usage (nombre de seances, completions, etc.) et les afficher a l'utilisateur dans un futur ecran "Statistiques". L'utilisateur est le seul a voir ses donnees.
2. **Analytics opt-in** : si necessaire, implementer un tracking anonyme et optionnel (ex: Plausible, Umami) avec consentement explicite.
3. **Feedback qualitatif** : un simple lien "Donner mon avis" menant a un formulaire externe.

---

## Annexes

### Palette de couleurs

| Token | Valeur | Usage |
|---|---|---|
| `surface` | `#0f172a` (slate-900) | Fond des cartes, modals |
| `surface-elevated` | `#1e293b` (slate-800) | Elements sureleves |
| `accent` | `#10b981` (emerald-500) | Actions principales, exercice en cours |
| `accent-warm` | `#f59e0b` (amber-500) | Repos, conseils, avertissements |
| `danger` | `#ef4444` (red-500) | Suppression, arret |
| `bg` | `#020617` (slate-950) | Fond global de l'app |
| `text-primary` | `#f1f5f9` (slate-100) | Texte principal |
| `text-secondary` | `#94a3b8` (slate-400) | Texte secondaire |
| `text-muted` | `#64748b` (slate-500) | Texte desactive |

### Typographie

- **Famille** : system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- **Timer** : `font-mono` pour l'alignement tabular des chiffres
- **Tailles cles** : `text-6xl` (timer), `text-2xl` (nom exercice en cours), `text-xl` (titres de page), `text-sm` (labels secondaires)

### Structure des fichiers

```
src/
  App.tsx                         Routeur principal (3 routes)
  main.tsx                        Point d'entree React
  index.css                       Styles globaux + Tailwind
  types/
    workout.ts                    Types TypeScript (Program, Phase, Exercise, etc.)
  constants/
    fr.ts                         Traductions francaises (tous les labels UI)
    defaults.ts                   Templates par defaut (phases et exercices)
    exercise-guides.ts            Guide d'exercices + illustrations SVG
  lib/
    id.ts                         Generateur d'IDs (nanoid)
    workout-engine.ts             Aplatissement programme -> steps + formatage temps
    audio.ts                      Beeps (Web Audio API) + synthese vocale (SpeechSynthesis)
  hooks/
    useTimer.ts                   Boucle requestAnimationFrame pour le timer
    useWakeLock.ts                Maintien de l'ecran allume (Screen Wake Lock API)
    useAudioSignals.ts            Orchestration des signaux audio (annonces + decomptes)
  store/
    useProgramStore.ts            Store Zustand persiste (CRUD programmes)
    usePlayerStore.ts             Store Zustand ephemere (etat du player)
  components/
    ui/
      Button.tsx                  Bouton polymorphe (4 variants, 3 tailles)
      Modal.tsx                   Bottom sheet / modal centree
      ConfirmDialog.tsx           Dialog de confirmation (action destructrice)
      EmptyState.tsx              Etat vide (illustration + texte)
    player/
      ExerciseGuidePanel.tsx      Panel depliable "Comment faire ?"
  pages/
    HomePage.tsx                  Liste des programmes
    EditorPage.tsx                Editeur de programme
    PlayerPage.tsx                Lecteur de seance (timer + controles)
```
