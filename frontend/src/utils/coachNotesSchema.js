/**
 * Empowered Hoops - Coach Notes Schema & Configuration
 * Aligned with Behaviour Management Manual v1.2 (2025)
 * Compliance: NDIS Code of Conduct, Disability Inclusion Act 2014, WHS Act 2011
 */

export const NOTE_CATEGORIES = {
  POSITIVE: 'positive',
  CO_REGULATION: 'co-regulation',
  STANDARD: 'standard',
  REGULATION_SUPPORT: 'regulation-support',
  SKILL_DEVELOPMENT: 'skill-development'
};

export const CATEGORY_CONFIG = {
  [NOTE_CATEGORIES.POSITIVE]: {
    label: 'Positive Progress',
    emoji: '🟢',
    color: '#10b981',
    bgColor: '#d1fae5',
    borderColor: '#34d399'
  },
  [NOTE_CATEGORIES.CO_REGULATION]: {
    label: 'Co-Regulation or Focus Support',
    emoji: '🟠',
    color: '#f97316',
    bgColor: '#fed7aa',
    borderColor: '#fb923c'
  },
  [NOTE_CATEGORIES.STANDARD]: {
    label: 'Standard / Routine',
    emoji: '⚪',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    borderColor: '#9ca3af'
  },
  [NOTE_CATEGORIES.REGULATION_SUPPORT]: {
    label: 'Regulation & Support Notes',
    emoji: '🔵',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    borderColor: '#60a5fa'
  },
  [NOTE_CATEGORIES.SKILL_DEVELOPMENT]: {
    label: 'Skill & Development Focus',
    emoji: '🧠',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    borderColor: '#a78bfa'
  }
};

export const NOTE_TEMPLATES = {
  [NOTE_CATEGORIES.POSITIVE]: [
    'Great session – engaged & participated well',
    'Breakthrough with [skill]',
    'Showing leadership today',
    'Big improvement in focus and effort',
    'Confident and positive energy all session'
  ],
  [NOTE_CATEGORIES.CO_REGULATION]: [
    'Needed extra support today',
    'Working through challenge with [skill/behaviour]',
    'Check-in next session about [issue]',
    'Distracted or tired – supported to stay on task',
    'Needed prompts to re-engage'
  ],
  [NOTE_CATEGORIES.STANDARD]: [
    'Participated well – on track',
    'Consistent performance and attitude',
    'Regular participation maintained',
    'On time, prepared, and cooperative'
  ],
  [NOTE_CATEGORIES.REGULATION_SUPPORT]: [
    'Regulation support provided',
    'Sensory accommodation used',
    'Social interaction win',
    'Managed escalation calmly',
    'Applied coping strategy independently'
  ],
  [NOTE_CATEGORIES.SKILL_DEVELOPMENT]: [
    'Dribbling control progress',
    'Shooting form improvement',
    'Team communication focus',
    'Learning positioning and spacing',
    'Worked on emotional regulation through sport'
  ]
};

export const REGULATION_TOOLS = [
  'Wall Push',
  'Calm Bounce',
  'Anchor Carry',
  'Box Stance Walk'
];

/**
 * Auto-tagging system for analytics and compliance reporting
 */
export const AUTO_TAGS = {
  [NOTE_CATEGORIES.POSITIVE]: ['#progress', '#engagement'],
  [NOTE_CATEGORIES.CO_REGULATION]: ['#support', '#focus'],
  [NOTE_CATEGORIES.STANDARD]: ['#routine', '#consistent'],
  [NOTE_CATEGORIES.REGULATION_SUPPORT]: ['#regulation', '#behaviour-support'],
  [NOTE_CATEGORIES.SKILL_DEVELOPMENT]: ['#skill-building', '#development']
};

/**
 * Additional tags that can be auto-detected from note text
 */
export const CONTEXTUAL_TAGS = {
  leadership: /#leadership|leadership|leader/i,
  breakthrough: /#breakthrough|breakthrough/i,
  improvement: /#improvement|improved|improving/i,
  challenge: /#challenge|challenging|difficult/i,
  social: /#social|interaction|team|cooperative/i,
  regulation: /#regulation|calm|escalation|coping/i,
  skill: /#skill|dribbling|shooting|positioning/i
};

/**
 * Create a structured note object
 */
export function createNoteObject({
  category,
  text,
  customText = null,
  regulationTool = null,
  reEntryPhrase = null,
  athleteName = null
}) {
  const tags = [...AUTO_TAGS[category]];

  // Add contextual tags based on text content
  const fullText = customText || text;
  Object.entries(CONTEXTUAL_TAGS).forEach(([tag, pattern]) => {
    if (pattern.test(fullText)) {
      tags.push(`#${tag}`);
    }
  });

  return {
    version: '1.0',
    category,
    text,
    customText,
    tags: [...new Set(tags)], // Remove duplicates
    regulationTool,
    reEntryPhrase,
    athleteName,
    timestamp: new Date().toISOString(),
    compliance: {
      manual: 'Behaviour Management Manual v1.2 (2025)',
      standards: ['NDIS Code of Conduct', 'Disability Inclusion Act 2014 (NSW)', 'WHS Act 2011 (NSW)']
    }
  };
}

/**
 * Convert note object to display text for Google Sheets
 */
export function noteToDisplayText(noteObj) {
  if (!noteObj || typeof noteObj === 'string') {
    return noteObj || '';
  }

  const { category, text, customText, regulationTool, reEntryPhrase } = noteObj;
  const categoryEmoji = CATEGORY_CONFIG[category]?.emoji || '';
  const finalText = customText || text;

  let display = `${categoryEmoji} ${finalText}`;

  if (regulationTool) {
    display += ` | Tool: ${regulationTool}`;
    if (reEntryPhrase !== null) {
      display += ` | Re-entry: ${reEntryPhrase ? 'Yes' : 'No'}`;
    }
  }

  return display;
}

/**
 * Parse note from string (for backward compatibility)
 */
export function parseNoteFromString(noteString) {
  if (!noteString) return null;

  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(noteString);
    if (parsed.version) return parsed;
  } catch {
    // Legacy string format - convert to basic note object
    return {
      version: '1.0',
      category: NOTE_CATEGORIES.STANDARD,
      text: noteString,
      customText: null,
      tags: ['#legacy'],
      regulationTool: null,
      reEntryPhrase: null,
      timestamp: new Date().toISOString()
    };
  }

  return null;
}

/**
 * Compliance footer text
 */
export const COMPLIANCE_FOOTER =
  "Session notes reflect factual observation consistent with Empowered Hoops Behaviour Management Manual v1.2, " +
  "NDIS Practice Standards, and WHS (NSW) documentation requirements.";
