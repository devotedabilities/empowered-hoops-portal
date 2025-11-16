// Social Skills / Behaviour Schema - 5-Point Slider Model
// Last updated: 2025

// Slider Levels with Labels and Colors
// Updated to trauma-informed, NDIS-aligned, color-blind safe palette
// Cool → Neutral → Warm spectrum (no red/green moral hierarchy)
// Support-focused language (strength-based, not deficit-focused)
export const SLIDER_LEVELS = [
  { value: 0, label: "High Support Needed", shortLabel: "High Support", color: "#4A148C", emoji: "◆" }, // Deep purple
  { value: 1, label: "Extra Support Needed", shortLabel: "Extra Support", color: "#5C6BC0", emoji: "■" }, // Indigo
  { value: 2, label: "Some Support Needed", shortLabel: "Some Support", color: "#90A4AE", emoji: "●" }, // Blue-grey
  { value: 3, label: "Light Support Needed", shortLabel: "Light Support", color: "#B0BEC5", emoji: "○" }, // Light grey-blue
  { value: 4, label: "Minimal Support Needed", shortLabel: "Minimal Support", color: "#26A69A", emoji: "★" } // Teal
];

// Behavior Notes Organized by Slider Level (0-4)
export const BEHAVIOUR_NOTES = {
  0: [ // Significant Challenge
    {
      id: 1,
      label: "Emotional escalation (Significant)",
      tooltip: "Used when the participant became highly upset, overwhelmed, or dysregulated and required intensive support.",
      summaryTemplate: "Participant became emotionally escalated and required regulation support",
      domains: ["selfManagement"],
      skills: ["emotionalRegulation", "calmingStrategies", "distressTolerance", "sensoryRegulation"],
      examples: [
        "Became upset after missing a shot",
        "Showed signs of overwhelm during a noisy moment",
        "Raised their voice when frustrated",
        "Needed co-regulation after a sudden change in activity"
      ]
    },
    {
      id: 2,
      label: "Left activity with distress / refusal + high support",
      tooltip: "Used when the participant left in distress and required strong coach support to re-engage safely.",
      summaryTemplate: "Participant left the activity in distress and required high support to re-engage",
      domains: ["selfManagement", "communityParticipation"],
      skills: ["reEngagement", "transitions", "emotionalRegulation", "distressTolerance", "sensoryRegulation", "selfAdvocacy"],
      examples: [
        "Walked away from drills in visible distress",
        "Refused to join and became upset when prompted",
        "Left the court and required structured regulation break",
        "Needed coach to walk them back with co-regulation support"
      ]
    },
    {
      id: 3,
      label: "Peer conflict requiring coach intervention",
      tooltip: "Used when conflict escalated and required direct coach intervention to de-escalate safely.",
      summaryTemplate: "Participant experienced conflict with peers that required coach intervention",
      domains: ["socialInteraction", "interpersonalRelationships"],
      skills: ["peerInteraction", "conflictResolution", "distressTolerance", "selfAdvocacy", "helpSeeking"],
      examples: [
        "Conflict escalated and required intervention to de-escalate",
        "Reacted strongly to peer's action and needed coach mediation",
        "Physical response to frustration required immediate support",
        "Peer dispute required structured conflict resolution"
      ]
    },
    {
      id: 4,
      label: "High-intensity withdrawal (no engagement, distress signs)",
      tooltip: "Used when the participant completely disengaged with visible distress and could not be prompted back.",
      summaryTemplate: "Participant withdrew with high intensity and showed signs of distress",
      domains: ["socialInteraction", "selfManagement"],
      skills: ["initiatingInteraction", "selfAdvocacy", "peerInteraction", "helpSeeking", "reEngagement"],
      examples: [
        "Sat away from group with no engagement despite prompts",
        "Avoided all eye contact and showed visible distress",
        "Could not be prompted to return to activity",
        "Required significant time and structured support to re-engage"
      ]
    }
  ],
  
  1: [ // Challenge
    {
      id: 6,
      label: "Struggled to follow instructions",
      tooltip: "Used when the participant needed extra prompting to understand the activity.",
      summaryTemplate: "Participant had difficulty following instructions and required extra prompting or modelling",
      domains: ["learning"],
      skills: ["followingInstructions", "processingInformation", "workingMemory"],
      examples: [
        "Needed repeated reminders during drill transitions",
        "Watched peers before starting due to uncertainty",
        "Became distracted during multi-step directions",
        "Required step-by-step guidance to begin the activity"
      ]
    },
    {
      id: 8,
      label: "Left activity / refused (moderate)",
      tooltip: "Used when the participant disengaged or stepped away and required support to re-engage.",
      summaryTemplate: "Participant left, avoided, or declined the activity and required support to re-engage",
      domains: ["selfManagement", "communityParticipation"],
      skills: ["reEngagement", "transitions", "emotionalRegulation", "distressTolerance", "sensoryRegulation", "selfAdvocacy"],
      examples: [
        "Walked away from drills and stood off to the side",
        "Declined to join a group activity despite prompts",
        "Sat down and disengaged during a team task",
        "Needed support to approach the group after refusing a drill"
      ]
    },
    {
      id: 7,
      label: "Peer conflict / tension (low–moderate)",
      tooltip: "Used when the participant experienced difficulty with peers and needed support.",
      summaryTemplate: "Participant experienced conflict or tension with peers and required support to resolve or de-escalate",
      domains: ["socialInteraction", "interpersonalRelationships"],
      skills: ["peerInteraction", "conflictResolution", "distressTolerance", "selfAdvocacy", "helpSeeking"],
      examples: [
        "Disagreed with a peer during turn-taking",
        "Reacted strongly to a teammate's mistake",
        "Needed support to resolve a dispute during a small-sided game",
        "Displayed frustration when peers did not follow the plan"
      ]
    },
    {
      id: 10,
      label: "Social withdrawal (moderate)",
      tooltip: "Used when the participant avoided interaction or disengaged socially.",
      summaryTemplate: "Participant withdrew from social interaction and needed prompts to re-engage",
      domains: ["socialInteraction", "selfManagement"],
      skills: ["initiatingInteraction", "selfAdvocacy", "peerInteraction", "helpSeeking", "reEngagement"],
      examples: [
        "Stayed unengaged during partner activities",
        "Avoided eye contact when spoken to",
        "Declined to join huddles or team breaks",
        "Needed encouragement to respond to peers"
      ]
    }
  ],
  
  2: [ // Minor Challenge (NEW TIER)
    {
      id: 15,
      label: "Mild withdrawal / quiet presentation",
      tooltip: "Used when the participant was quiet or withdrawn but engaged with gentle prompting.",
      summaryTemplate: "Participant presented quietly and engaged after gentle prompting",
      domains: ["socialInteraction", "communication", "selfManagement"],
      skills: ["initiatingInteraction", "communicationInitiation", "stayingOnTask", "transitions"],
      examples: [
        "Participant was quiet at the start and joined after a gentle prompt",
        "Remained on periphery but engaged when invited",
        "Spoke quietly and needed encouragement to participate fully",
        "Hesitant at first but warmed up with support"
      ]
    },
    {
      id: 16,
      label: "Reduced eye contact / low communication",
      tooltip: "Used when the participant showed limited eye contact or communication but still participated.",
      summaryTemplate: "Participant used limited eye contact and communication but remained engaged",
      domains: ["socialInteraction", "communication", "selfManagement"],
      skills: ["initiatingInteraction", "communicationInitiation", "stayingOnTask", "transitions"],
      examples: [
        "Participant used limited eye contact but engaged with the drill after clarification",
        "Communicated minimally but followed along",
        "Avoided direct eye contact but participated in activities",
        "Needed visual cues more than verbal communication"
      ]
    },
    {
      id: 17,
      label: "Slow to join / hesitant engagement",
      tooltip: "Used when the participant hesitated to join but engaged with encouragement.",
      summaryTemplate: "Participant hesitated to join and engaged after encouragement",
      domains: ["socialInteraction", "communication", "selfManagement"],
      skills: ["initiatingInteraction", "communicationInitiation", "stayingOnTask", "transitions"],
      examples: [
        "Participant hesitated to join shooting drill and engaged after encouragement",
        "Took time to warm up to group activity",
        "Watched before joining but participated once comfortable",
        "Needed reassurance before attempting new drill"
      ]
    },
    {
      id: 18,
      label: "Required light prompting or encouragement",
      tooltip: "Used when the participant needed gentle prompts but responded well.",
      summaryTemplate: "Participant required light prompting and encouragement to stay engaged",
      domains: ["socialInteraction", "communication", "selfManagement"],
      skills: ["initiatingInteraction", "communicationInitiation", "stayingOnTask", "transitions"],
      examples: [
        "Needed occasional reminders to stay with the group",
        "Responded well to gentle prompts",
        "Required encouragement to try challenging skills",
        "Engaged fully after initial prompting"
      ]
    }
  ],
  
  3: [ // Standard
    {
      id: 11,
      label: "Typical participation",
      tooltip: "Used when the participant engaged in activities as expected.",
      summaryTemplate: "Participant engaged as expected with no significant additional support needs noted",
      domains: ["communityParticipation"],
      skills: ["sessionParticipation", "routineFollowing", "independentEngagement", "safetyAwareness"],
      examples: [
        "Joined all drills as expected",
        "Participated steadily throughout the session",
        "Followed routine warm-ups without issues",
        "Maintained consistent engagement"
      ]
    },
    {
      id: 12,
      label: "Routine followed",
      tooltip: "Used when the participant followed the usual structure and transitions.",
      summaryTemplate: "Participant followed the session structure and routine with expected prompts",
      domains: ["learning", "selfManagement"],
      skills: ["routineFollowing", "transitions", "followingInstructions"],
      examples: [
        "Moved between stations when signalled",
        "Packed up equipment when expected",
        "Transitioned to breaks and huddles appropriately",
        "Followed start/stop cues with usual prompts"
      ]
    },
    {
      id: 13,
      label: "On task most of session",
      tooltip: "Used when the participant stayed focused for most activities.",
      summaryTemplate: "Participant remained on task for the majority of the session",
      domains: ["learning"],
      skills: ["stayingOnTask", "workingMemory", "independentEngagement"],
      examples: [
        "Stayed focused during most drills",
        "Worked consistently during individual skill work",
        "Required only occasional reminders",
        "Completed tasks with expected effort"
      ]
    },
    {
      id: 14,
      label: "Calm / neutral presentation",
      tooltip: "Used when the participant presented calmly with no notable issues.",
      summaryTemplate: "Participant displayed a calm, neutral affect with no notable social or behavioural difficulties",
      domains: ["selfManagement"],
      skills: ["emotionalRegulation", "distressTolerance", "selfMonitoring"],
      examples: [
        "Maintained a settled and steady demeanor",
        "Participated quietly without issues",
        "Responded calmly to coaching cues",
        "Managed minor frustrations independently"
      ]
    }
  ],
  
  4: [ // Positive
    {
      id: 1,
      label: "Positive peer interaction",
      tooltip: "Used when the participant interacted positively with peers (e.g. sharing, encouragement, cooperative play).",
      summaryTemplate: "Participant engaged in positive peer interaction",
      domains: ["socialInteraction", "interpersonalRelationships"],
      skills: ["peerInteraction", "turnTaking", "encouragement", "readingSocialCues", "initiatingInteraction"],
      examples: [
        "Shared the ball during a partner drill",
        "Encouraged a teammate after a mistake",
        "Took turns confidently in a group activity",
        "Joined in friendly conversation during warm-ups"
      ]
    },
    {
      id: 2,
      label: "Teamwork / cooperation",
      tooltip: "Used when the participant contributed constructively to group tasks or supported teammates.",
      summaryTemplate: "Participant worked cooperatively with peers and contributed to shared tasks",
      domains: ["socialInteraction", "communityParticipation"],
      skills: ["cooperation", "workingInATeam", "peerInteraction", "problemSolving"],
      examples: [
        "Worked with peers to run a passing sequence",
        "Supported a teammate by offering a defensive switch",
        "Helped reset cones for the group",
        "Followed group strategy during a mini-game"
      ]
    },
    {
      id: 3,
      label: "Followed instructions well",
      tooltip: "Used when the participant followed verbal/visual instructions with minimal prompts.",
      summaryTemplate: "Participant followed verbal and visual instructions with minimal prompting",
      domains: ["learning"],
      skills: ["followingInstructions", "processingInformation", "workingMemory"],
      examples: [
        "Completed a three-step drill without further prompting",
        "Adjusted position after a coach's cue",
        "Started the next activity immediately when instructed",
        "Copied coach demonstration accurately"
      ]
    },
    {
      id: 4,
      label: "Regulated well",
      tooltip: "Used when the participant stayed calm or used strategies to manage emotions.",
      summaryTemplate: "Participant maintained emotional regulation and used agreed strategies to remain calm and engaged",
      domains: ["selfManagement"],
      skills: ["emotionalRegulation", "calmingStrategies", "distressTolerance", "flexibilityAdaptability"],
      examples: [
        "Used deep breathing after becoming frustrated",
        "Asked for a short break before re-joining the group",
        "Stayed calm when a drill changed suddenly",
        "Managed noise levels in the gym without distress"
      ]
    },
    {
      id: 5,
      label: "Took turns / shared",
      tooltip: "Used when the participant waited, shared equipment, or took turns appropriately.",
      summaryTemplate: "Participant demonstrated turn-taking and shared equipment and space appropriately",
      domains: ["socialInteraction"],
      skills: ["turnTaking", "sharing", "peerInteraction"],
      examples: [
        "Waited patiently for their turn in shooting rotation",
        "Shared equipment during group warm-ups",
        "Allowed another participant to go first",
        "Passed the ball fairly during team sequences"
      ]
    }
  ]
};

// Add-On Support Options
export const ADD_ON_OPTIONS = [
  {
    id: 19,
    label: "Regulation strategy used",
    tooltip: "Used when the participant used a planned strategy such as a break, breathing, movement, or sensory input.",
    summaryTemplate: "A planned regulation strategy was used to support calming and re-engagement",
    domains: ["selfManagement"],
    skills: ["emotionalRegulation", "calmingStrategies", "sensoryRegulation", "selfMonitoring"],
    examples: [
      "Took a short movement break",
      "Used breathing technique after frustration",
      "Held a sensory object briefly",
      "Sat out for a planned transition before returning"
    ]
  },
  {
    id: 20,
    label: "Support to re-join group",
    tooltip: "Used when the coach supported the participant to return to the activity.",
    summaryTemplate: "Coach supported the participant to return to the activity safely after avoiding it",
    domains: ["selfManagement", "socialInteraction"],
    skills: ["reEngagement", "transitions", "helpSeeking"],
    examples: [
      "Coach walked with participant back to group activity",
      "Returned to the court after a quiet check-in",
      "Rejoined drill after simplified explanation",
      "Came back to group after a supportive break"
    ]
  },
  {
    id: 21,
    label: "Needed coach modelling",
    tooltip: "Used when the coach demonstrated the expected behaviour before the participant attempted it.",
    summaryTemplate: "Coach modelling was used to demonstrate the expected behaviour and social cue",
    domains: ["learning", "socialInteraction"],
    skills: ["readingSocialCues", "followingInstructions", "processingInformation"],
    examples: [
      "Coach demonstrated expected behaviour before participant copied",
      "Participant followed after watching a social cue example",
      "Needed coach to model sharing or turn-taking",
      "Required a visual demonstration to understand group expectations"
    ]
  },
  {
    id: 22,
    label: "Needed frequent prompts",
    tooltip: "Used when multiple reminders were needed to stay engaged.",
    summaryTemplate: "Frequent verbal and visual prompts were required to maintain engagement",
    domains: ["learning"],
    skills: ["stayingOnTask", "followingInstructions", "independentEngagement"],
    examples: [
      "Needed reminders to stay in the activity area",
      "Repeated verbal cues to remain on task",
      "Several prompts to initiate movement in a drill",
      "Frequent reminders to start or continue tasks"
    ]
  }
];