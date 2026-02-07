# Custom Coach

Application PWA de coaching sportif personnel avec timer d'entraînement et coach vocal IA.

## Fonctionnalités

### Programmes d'entraînement
- Création et édition de programmes personnalisés
- Organisation en phases (échauffement, bloc principal, gainage, étirements)
- Exercices chronométrés ou basés sur les répétitions
- Repos configurables entre exercices et cycles
- Duplication de programmes

### Lecteur de workout
- Timer avec cercle de progression animé
- Compte à rebours vocal (3, 2, 1)
- Annonce vocale des exercices
- Bips audio pour les transitions
- Guides d'exercices intégrés
- Wake lock (empêche l'écran de se mettre en veille)

### Coach vocal IA
- Interaction vocale en temps réel pendant l'entraînement
- Push-to-talk via bouton micro dans les contrôles du player
- Le coach connaît le programme complet (exercices, phases, durées, repos)
- Conseils contextuels sur la forme, la respiration, la motivation
- Réponses streamées phrase par phrase pour une conversation naturelle

## Stack technique

- **Frontend** : React 19 + TypeScript + Vite
- **State** : Zustand (persist + immer)
- **Style** : Tailwind CSS 4
- **PWA** : vite-plugin-pwa + Workbox
- **Audio** : Web Audio API (bips) + Web Speech API (TTS/STT)
- **IA** : Groq API (Llama 3.3 70B) — gratuit

## Installation

```bash
npm install
npm run dev
```

## Configuration du coach vocal

1. Créer une clé API gratuite sur [console.groq.com/keys](https://console.groq.com/keys)
2. Dans l'app, aller dans **Paramètres** (icône engrenage)
3. Coller la clé API Groq et activer le coach vocal
4. Lancer un workout — le bouton micro apparaît dans les contrôles

### Architecture du coach vocal

```
Utilisateur parle
    ↓
Web Speech API (STT, fr-FR)
    ↓
Groq API (Llama 3.3 70B, streaming)
    ↓
Web Speech API (TTS, phrase par phrase)
    ↓
Utilisateur entend la réponse
```

**Coût** : 0€/mois (free tier Groq : 14 400 requêtes/jour)

### Système de priorité audio

| Priorité | Source | Comportement |
|----------|--------|-------------|
| 1 (haute) | Countdown (3, 2, 1) | Interrompt tout |
| 2 | Annonce d'exercice | Interrompt le coach |
| 3 (basse) | Réponse du coach | Cède aux priorités supérieures |

## Structure du projet

```
src/
├── pages/               # Pages (Home, Editor, Player, Settings)
├── components/          # Composants React
│   ├── ui/              # Composants réutilisables (Button, Modal...)
│   ├── player/          # Composants du lecteur (Guide, VoiceCoach...)
│   ├── editor/          # Composants de l'éditeur
│   └── programs/        # Composants des programmes
├── store/               # Zustand stores
│   ├── useProgramStore  # Programmes (persisté)
│   ├── usePlayerStore   # État du lecteur
│   ├── useSettingsStore # Paramètres (persisté)
│   └── useVoiceCoachStore # État du coach vocal
├── hooks/               # Hooks React
│   ├── useTimer         # Timer du workout
│   ├── useWakeLock      # Wake lock écran
│   ├── useAudioSignals  # Bips et annonces
│   └── useVoiceCoach    # Orchestration STT→LLM→TTS
├── lib/                 # Services et utilitaires
│   ├── audio.ts         # Synthèse audio et vocale
│   ├── workout-engine   # Moteur de workout
│   └── voice/           # Module coach vocal
│       ├── stt.ts       # Reconnaissance vocale
│       ├── llm.ts       # Client Groq (streaming)
│       ├── tts.ts       # TTS streaming avec queue
│       └── system-prompt.ts # Prompt système contextuel
├── types/               # Types TypeScript
└── constants/           # Constantes et i18n (français)
```

## Scripts

```bash
npm run dev      # Serveur de développement
npm run build    # Build production (tsc + vite)
npm run preview  # Preview du build
npm run lint     # Lint ESLint
```

## Navigateurs supportés

- **Chrome / Edge** : Support complet (STT + TTS + PWA)
- **Safari** : TTS uniquement, pas de STT (coach vocal désactivé)
- **Firefox** : TTS uniquement, pas de STT (coach vocal désactivé)

Le coach vocal nécessite Chrome ou Edge pour la reconnaissance vocale (Web Speech API).
