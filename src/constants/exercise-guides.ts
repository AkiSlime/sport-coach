export interface ExerciseGuide {
  description: string
  steps: string[]
  tips: string[]
  /** SVG illustration as a data URI — stick figure style */
  image: string
}

// Simple stick-figure SVG builder
function fig(bodyParts: string): string {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect width="120" height="120" rx="16" fill="#0f172a"/>
      ${bodyParts}
    </svg>`
  )}`
}

// ─── SVG illustrations (stick figures) ──────────────────────

const SVG_SQUATS = fig(`
  <circle cx="60" cy="28" r="8"/>
  <line x1="60" y1="36" x2="60" y2="58"/>
  <line x1="60" y1="58" x2="45" y2="80"/>
  <line x1="60" y1="58" x2="75" y2="80"/>
  <line x1="45" y1="80" x2="42" y2="100"/>
  <line x1="75" y1="80" x2="78" y2="100"/>
  <line x1="60" y1="44" x2="40" y2="52"/>
  <line x1="60" y1="44" x2="80" y2="52"/>
  <path d="M35 100 h50" stroke="#334155" stroke-dasharray="4"/>
`)

const SVG_POMPES = fig(`
  <circle cx="28" cy="60" r="7"/>
  <line x1="35" y1="60" x2="65" y2="68"/>
  <line x1="65" y1="68" x2="95" y2="68"/>
  <line x1="45" y1="65" x2="42" y2="85"/>
  <line x1="55" y1="67" x2="52" y2="87"/>
  <line x1="95" y1="68" x2="95" y2="90"/>
  <line x1="85" y1="68" x2="85" y2="90"/>
  <path d="M20 90 h85" stroke="#334155" stroke-dasharray="4"/>
`)

const SVG_ROWING = fig(`
  <circle cx="60" cy="30" r="8"/>
  <line x1="60" y1="38" x2="55" y2="62"/>
  <line x1="55" y1="62" x2="50" y2="85"/>
  <line x1="50" y1="85" x2="45" y2="100"/>
  <line x1="55" y1="62" x2="70" y2="85"/>
  <line x1="70" y1="85" x2="75" y2="100"/>
  <line x1="58" y1="48" x2="38" y2="55"/>
  <line x1="58" y1="48" x2="78" y2="42"/>
  <rect x="74" y="38" width="12" height="6" rx="2" fill="#f59e0b" stroke="#f59e0b"/>
`)

const SVG_PLANCHE = fig(`
  <circle cx="25" cy="55" r="7"/>
  <line x1="32" y1="57" x2="85" y2="62"/>
  <line x1="25" y1="62" x2="22" y2="85"/>
  <line x1="85" y1="62" x2="90" y2="85"/>
  <line x1="80" y1="62" x2="85" y2="85"/>
  <path d="M15 85 h85" stroke="#334155" stroke-dasharray="4"/>
`)

const SVG_GAINAGE_LAT = fig(`
  <circle cx="30" cy="42" r="7"/>
  <line x1="33" y1="49" x2="55" y2="70"/>
  <line x1="55" y1="70" x2="88" y2="70"/>
  <line x1="55" y1="70" x2="50" y2="90"/>
  <line x1="33" y1="49" x2="30" y2="30"/>
  <path d="M15 90 h90" stroke="#334155" stroke-dasharray="4"/>
`)

const SVG_SUPERMAN = fig(`
  <circle cx="30" cy="55" r="7"/>
  <line x1="37" y1="57" x2="70" y2="60"/>
  <line x1="70" y1="60" x2="95" y2="50"/>
  <line x1="37" y1="57" x2="15" y2="48"/>
  <line x1="70" y1="60" x2="80" y2="75"/>
  <line x1="65" y1="59" x2="55" y2="75"/>
  <path d="M10 80 h100" stroke="#334155" stroke-dasharray="4"/>
`)

const SVG_EPAULES = fig(`
  <circle cx="60" cy="30" r="8"/>
  <line x1="60" y1="38" x2="60" y2="70"/>
  <line x1="60" y1="70" x2="50" y2="100"/>
  <line x1="60" y1="70" x2="70" y2="100"/>
  <path d="M 40 50 A 20 20 0 1 1 80 50" stroke="#f59e0b" stroke-dasharray="4"/>
  <polygon points="80,48 84,54 76,54" fill="#f59e0b" stroke="none"/>
`)

const SVG_ROTATIONS = fig(`
  <circle cx="60" cy="28" r="8"/>
  <line x1="60" y1="36" x2="60" y2="60"/>
  <line x1="60" y1="44" x2="42" y2="50"/>
  <line x1="60" y1="44" x2="78" y2="50"/>
  <line x1="60" y1="60" x2="48" y2="90"/>
  <line x1="60" y1="60" x2="72" y2="90"/>
  <path d="M 45 58 A 18 12 0 1 1 75 58" stroke="#f59e0b" stroke-dasharray="4"/>
  <polygon points="75,56 79,62 71,62" fill="#f59e0b" stroke="none"/>
`)

const SVG_GENOUX = fig(`
  <circle cx="60" cy="25" r="8"/>
  <line x1="60" y1="33" x2="60" y2="58"/>
  <line x1="60" y1="42" x2="45" y2="50"/>
  <line x1="60" y1="42" x2="75" y2="50"/>
  <line x1="60" y1="58" x2="50" y2="80"/>
  <line x1="50" y1="80" x2="48" y2="100"/>
  <line x1="60" y1="58" x2="72" y2="72"/>
  <line x1="72" y1="72" x2="70" y2="55" stroke="#f59e0b"/>
  <path d="M20 100 h80" stroke="#334155" stroke-dasharray="4"/>
`)

const SVG_POMPES_MUR = fig(`
  <line x1="95" y1="15" x2="95" y2="105" stroke="#475569" stroke-width="3"/>
  <circle cx="55" cy="38" r="7"/>
  <line x1="58" y1="45" x2="68" y2="70"/>
  <line x1="68" y1="70" x2="60" y2="100"/>
  <line x1="68" y1="70" x2="76" y2="100"/>
  <line x1="62" y1="52" x2="92" y2="42"/>
  <line x1="62" y1="56" x2="92" y2="50"/>
`)

const SVG_RESPIRATION = fig(`
  <circle cx="60" cy="28" r="8"/>
  <line x1="60" y1="36" x2="60" y2="65"/>
  <line x1="60" y1="65" x2="48" y2="100"/>
  <line x1="60" y1="65" x2="72" y2="100"/>
  <line x1="60" y1="45" x2="42" y2="55"/>
  <line x1="60" y1="45" x2="78" y2="55"/>
  <ellipse cx="60" cy="52" rx="14" ry="10" stroke="#f59e0b" stroke-dasharray="3" fill="none"/>
  <path d="M60 42 v-6 M56 38 l4 -4 l4 4" stroke="#f59e0b"/>
`)

const SVG_ETIREMENT = fig(`
  <circle cx="45" cy="35" r="8"/>
  <line x1="45" y1="43" x2="45" y2="65"/>
  <line x1="45" y1="65" x2="35" y2="100"/>
  <line x1="45" y1="65" x2="55" y2="100"/>
  <line x1="45" y1="50" x2="70" y2="38"/>
  <line x1="45" y1="50" x2="70" y2="60"/>
  <path d="M70 35 q15 12 0 28" stroke="#f59e0b" stroke-dasharray="3"/>
`)

const SVG_DEFAULT = fig(`
  <circle cx="60" cy="28" r="8"/>
  <line x1="60" y1="36" x2="60" y2="65"/>
  <line x1="60" y1="65" x2="48" y2="100"/>
  <line x1="60" y1="65" x2="72" y2="100"/>
  <line x1="60" y1="45" x2="40" y2="55"/>
  <line x1="60" y1="45" x2="80" y2="55"/>
  <text x="60" y="115" text-anchor="middle" font-size="10" fill="#475569" stroke="none" font-family="sans-serif">?</text>
`)

// ─── Exercise Guide Database ────────────────────────────────

const GUIDES: Record<string, ExerciseGuide> = {
  'squats': {
    description: 'Exercice fondamental pour les jambes et les fessiers. Le squat engage aussi le gainage naturel du tronc.',
    steps: [
      'Pieds \u00e9cart\u00e9s largeur d\'\u00e9paules',
      'Descends en poussant les fesses en arri\u00e8re',
      'Genoux dans l\'axe des pieds',
      'Descends jusqu\'\u00e0 ce que les cuisses soient parall\u00e8les au sol',
      'Remonte en poussant sur les talons',
    ],
    tips: [
      'Garde le dos droit, regarde devant toi',
      'Descente lente (3 secondes), remont\u00e9e dynamique',
      'Ne laisse pas les genoux d\u00e9passer les pieds',
    ],
    image: SVG_SQUATS,
  },
  'squats lents': {
    description: 'Squats \u00e0 tempo lent pour l\'\u00e9chauffement. On r\u00e9veille les jambes en douceur.',
    steps: [
      'Pieds \u00e9cart\u00e9s largeur d\'\u00e9paules',
      'Descends tr\u00e8s lentement (4-5 secondes)',
      'Remonte doucement, sans \u00e0-coup',
    ],
    tips: [
      'Pas besoin d\'aller profond : mi-course suffit',
      'Concentre-toi sur la sensation dans les cuisses',
    ],
    image: SVG_SQUATS,
  },
  'pompes': {
    description: 'Travaille les pectoraux, \u00e9paules et triceps. Version genoux ou compl\u00e8te selon ton niveau.',
    steps: [
      'Mains au sol, \u00e9cart\u00e9es un peu plus large que les \u00e9paules',
      'Corps align\u00e9 de la t\u00eate aux pieds (ou genoux)',
      'Descends en fl\u00e9chissant les coudes',
      'Poitrine fr\u00f4le le sol',
      'Pousse pour remonter, bras tendus',
    ],
    tips: [
      'Garde les abdos serr\u00e9s pour ne pas cambrer',
      'Coudes \u00e0 45\u00b0 du corps, pas \u00e9cart\u00e9s \u00e0 90\u00b0',
      'Si c\'est trop dur : fais-les sur les genoux',
    ],
    image: SVG_POMPES,
  },
  'pompes mur': {
    description: 'Pompes debout contre un mur. Id\u00e9al pour l\'\u00e9chauffement du haut du corps.',
    steps: [
      'Face au mur, bras tendus, mains \u00e0 hauteur d\'\u00e9paules',
      'Recule les pieds d\'un pas',
      'Fl\u00e9chis les coudes pour approcher la poitrine du mur',
      'Pousse pour revenir bras tendus',
    ],
    tips: [
      'Plus tu \u00e9loignes les pieds, plus c\'est difficile',
      'Mouvement contr\u00f4l\u00e9 et fluide',
    ],
    image: SVG_POMPES_MUR,
  },
  'rowing maison': {
    description: 'Tire un poids vers toi pour travailler le dos. Utilise un sac \u00e0 dos charg\u00e9 ou des bouteilles d\'eau.',
    steps: [
      'Penche le buste \u00e0 45\u00b0, genoux l\u00e9g\u00e8rement fl\u00e9chis',
      'Tiens le poids bras tendus vers le sol',
      'Tire le poids vers le nombril en serrant les omoplates',
      'Redescends lentement',
    ],
    tips: [
      'Pense \u00e0 serrer les omoplates \u00e0 chaque remont\u00e9e',
      'Ne tire pas avec les bras : initie le mouvement par le dos',
      'Garde le dos plat, pas arrondi',
    ],
    image: SVG_ROWING,
  },
  'gainage planche': {
    description: 'Gainage ventral statique. Renforce le ventre, les lombaires et toute la ceinture abdominale.',
    steps: [
      'Appui sur les avant-bras et les pieds',
      'Corps parfaitement align\u00e9',
      'Abdos et fessiers contract\u00e9s',
      'Tiens la position sans bouger',
    ],
    tips: [
      'Ne l\u00e8ve pas les fesses : ligne droite de la t\u00eate aux talons',
      'Respire normalement, ne bloque pas',
      'Si \u00e7a tremble c\'est normal : tes muscles travaillent',
    ],
    image: SVG_PLANCHE,
  },
  'gainage lat\u00e9ral gauche': {
    description: 'Gainage sur le c\u00f4t\u00e9 gauche. Renforce les obliques et am\u00e9liore la stabilit\u00e9 lat\u00e9rale.',
    steps: [
      'Couch\u00e9 sur le c\u00f4t\u00e9 gauche, appui sur l\'avant-bras',
      'L\u00e8ve les hanches pour aligner t\u00eate-\u00e9paules-pieds',
      'Bras droit le long du corps ou vers le ciel',
      'Tiens la position',
    ],
    tips: [
      'Ne laisse pas les hanches s\'affaisser',
      'Regarde droit devant toi',
    ],
    image: SVG_GAINAGE_LAT,
  },
  'gainage lat\u00e9ral droit': {
    description: 'Gainage sur le c\u00f4t\u00e9 droit. M\u00eame exercice, autre c\u00f4t\u00e9, pour un travail \u00e9quilibr\u00e9.',
    steps: [
      'Couch\u00e9 sur le c\u00f4t\u00e9 droit, appui sur l\'avant-bras',
      'L\u00e8ve les hanches pour aligner t\u00eate-\u00e9paules-pieds',
      'Bras gauche le long du corps ou vers le ciel',
      'Tiens la position',
    ],
    tips: [
      'Ne laisse pas les hanches s\'affaisser',
      'Compare la difficult\u00e9 des deux c\u00f4t\u00e9s : c\'est normal que ce soit in\u00e9gal',
    ],
    image: SVG_GAINAGE_LAT,
  },
  'superman': {
    description: 'Renforce le bas du dos et les fessiers. Excellent pour la posture.',
    steps: [
      'Allong\u00e9 sur le ventre, bras tendus devant',
      'L\u00e8ve simultan\u00e9ment les bras et les jambes',
      'Tiens 2 secondes en haut',
      'Redescends lentement',
    ],
    tips: [
      'Mouvement lent et contr\u00f4l\u00e9, pas d\'\u00e0-coup',
      'Serre les fessiers en haut du mouvement',
      'Regarde le sol pour garder le cou neutre',
    ],
    image: SVG_SUPERMAN,
  },
  'cercles d\'\u00e9paules': {
    description: 'Rotation douce des \u00e9paules pour \u00e9chauffer l\'articulation et am\u00e9liorer la mobilit\u00e9.',
    steps: [
      'Debout, bras le long du corps',
      'Fais des cercles avec les \u00e9paules vers l\'avant',
      '\u00c0 mi-temps, inverse le sens (vers l\'arri\u00e8re)',
    ],
    tips: [
      'Grands cercles amples mais d\u00e9tendus',
      'Pas de douleur : c\'est un \u00e9chauffement',
    ],
    image: SVG_EPAULES,
  },
  'rotations de hanches': {
    description: 'Mobilise l\'articulation de la hanche. Important pour pr\u00e9parer les squats et mouvements du bas du corps.',
    steps: [
      'Debout, mains sur les hanches',
      'Fais des cercles larges avec le bassin',
      'Change de sens \u00e0 mi-temps',
    ],
    tips: [
      'Mouvement fluide et d\u00e9tendu',
      'Garde le haut du corps stable',
    ],
    image: SVG_ROTATIONS,
  },
  'mont\u00e9es de genoux': {
    description: 'Monte les genoux en alternance pour \u00e9lever doucement le rythme cardiaque.',
    steps: [
      'Debout, dos droit',
      'L\u00e8ve un genou \u00e0 hauteur de hanches',
      'Repose et alterne avec l\'autre jambe',
      'Rythme tranquille, pas de course',
    ],
    tips: [
      'Si tu es essouffl\u00e9, ralentis',
      'Accompagne le mouvement avec les bras oppos\u00e9s',
    ],
    image: SVG_GENOUX,
  },
  'respiration profonde': {
    description: 'Respiration diaphragmatique pour recentrer le corps et le mental avant l\'effort.',
    steps: [
      'Debout ou assis, \u00e9paules d\u00e9tendues',
      'Inspire par le nez pendant 4 secondes (ventre qui gonfle)',
      'Tiens 2 secondes',
      'Expire lentement par la bouche pendant 6 secondes',
    ],
    tips: [
      'C\'est le ventre qui bouge, pas la poitrine',
      'Ferme les yeux si \u00e7a t\'aide \u00e0 te concentrer',
    ],
    image: SVG_RESPIRATION,
  },
  '\u00e9tirement poitrine': {
    description: 'Ouvre la poitrine et \u00e9tire les pectoraux. Parfait apr\u00e8s les pompes.',
    steps: [
      'Debout, mains jointes dans le dos',
      'Tire les mains vers l\'arri\u00e8re et vers le bas',
      'Ouvre la poitrine en avan\u00e7ant le sternum',
      'Tiens la position',
    ],
    tips: [
      '\u00c9tirement doux et progressif, jamais douloureux',
      'Respire profond\u00e9ment pendant l\'\u00e9tirement',
    ],
    image: SVG_ETIREMENT,
  },
  '\u00e9tirement dos': {
    description: '\u00c9tire le dos et les \u00e9paules. Aide \u00e0 rel\u00e2cher les tensions apr\u00e8s l\'entra\u00eenement.',
    steps: [
      'Debout, croise les doigts devant toi',
      'Pousse les mains vers l\'avant en arrondissant le dos',
      'Rentre le menton, regarde vers le nombril',
      'Tiens 20-30 secondes',
    ],
    tips: [
      'Sens l\'\u00e9tirement entre les omoplates',
      'Respire calmement',
    ],
    image: SVG_ETIREMENT,
  },
}

/**
 * Find guide by exercise name (case-insensitive fuzzy match).
 * Returns null if no guide found.
 */
export function getExerciseGuide(exerciseName: string): ExerciseGuide | null {
  const normalized = exerciseName.toLowerCase().trim()

  // Exact match
  if (GUIDES[normalized]) return GUIDES[normalized]

  // Partial match: exercise name contains a known key
  for (const [key, guide] of Object.entries(GUIDES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return guide
    }
  }

  return null
}

/** Returns the default placeholder guide for unknown exercises */
export function getDefaultGuide(exerciseName: string): ExerciseGuide {
  return {
    description: `R\u00e9alise l'exercice "${exerciseName}" avec contr\u00f4le et bonne posture.`,
    steps: [
      'Positionne-toi correctement',
      'Ex\u00e9cute le mouvement lentement',
      'Contr\u00f4le chaque r\u00e9p\u00e9tition',
    ],
    tips: [
      'Respire r\u00e9guli\u00e8rement',
      'Arr\u00eate si tu ressens une douleur',
    ],
    image: SVG_DEFAULT,
  }
}
