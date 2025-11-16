// Complete Basketball Skill Categories - Use this to replace the current BASKETBALL_SKILLS array in CoachNotesV2-SLIDER.jsx

// Basketball Skill Categories (8 categories)
export const BASKETBALL_CATEGORIES = [
  { id: 'ballControl', label: 'Ball Control & Handling', emoji: '🏀' },
  { id: 'passing', label: 'Passing & Receiving', emoji: '🤝' },
  { id: 'shooting', label: 'Shooting & Scoring', emoji: '🎯' },
  { id: 'movement', label: 'Movement, Spacing & Game Concepts', emoji: '👟' },
  { id: 'rebounding', label: 'Rebounding & Physical Positioning', emoji: '💪' },
  { id: 'communication', label: 'Communication & Team Play', emoji: '💬' },
  { id: 'coachability', label: 'Coachability & Engagement', emoji: '⭐' },
  { id: 'regulation', label: 'Emotional / Regulation', emoji: '🧘' }
];

// Basketball Skills organized by category (object instead of array)
export const BASKETBALL_SKILLS = {
  ballControl: [
    {
      id: 'dribblingControl',
      label: 'Dribbling control',
      tooltip: 'Controlled ball handling with consistent dribble height and rhythm.',
      domains: ['communityParticipation', 'learning', 'selfManagement'],
      skills: ['stayingOnTask', 'followingInstructions', 'independentEngagement']
    },
    {
      id: 'ballHandlingCoordination',
      label: 'Ball-handling coordination',
      tooltip: 'Coordinated hand/body movement while controlling the ball.',
      domains: ['communityParticipation', 'learning', 'selfManagement'],
      skills: ['stayingOnTask', 'followingInstructions', 'independentEngagement']
    },
    {
      id: 'changeDirection',
      label: 'Change of direction / agility',
      tooltip: 'Quick direction changes while maintaining ball control.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['safetyAwareness', 'independentEngagement', 'stayingOnTask']
    },
    {
      id: 'ballProtection',
      label: 'Ball protection under pressure',
      tooltip: 'Maintaining control when defended or in traffic.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['emotionalRegulation', 'distressTolerance', 'problemSolving']
    },
    {
      id: 'switchingHands',
      label: 'Switching hands while dribbling',
      tooltip: 'Transitioning the ball between hands smoothly.',
      domains: ['communityParticipation', 'learning'],
      skills: ['stayingOnTask', 'followingInstructions', 'independentEngagement']
    },
    {
      id: 'controlledDribblingSpace',
      label: 'Controlled dribbling in open space',
      tooltip: 'Maintaining steady control while moving freely.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['safetyAwareness', 'independentEngagement', 'stayingOnTask']
    },
    {
      id: 'dribblingScanning',
      label: 'Dribbling while scanning the court',
      tooltip: 'Looking up while dribbling to read the environment.',
      domains: ['communityParticipation', 'learning'],
      skills: ['stayingOnTask', 'processingInformation', 'problemSolving']
    }
  ],
  
  passing: [
    {
      id: 'passingAccuracy',
      label: 'Passing accuracy',
      tooltip: 'Accurate passes to intended targets.',
      domains: ['socialInteraction', 'interpersonalRelationships', 'communication'],
      skills: ['peerInteraction', 'cooperation', 'readingSocialCues', 'turnTaking']
    },
    {
      id: 'chestPass',
      label: 'Chest pass technique',
      tooltip: 'Proper form for chest passes with follow-through.',
      domains: ['communityParticipation', 'learning'],
      skills: ['followingInstructions', 'stayingOnTask', 'independentEngagement']
    },
    {
      id: 'bouncePass',
      label: 'Bounce pass technique',
      tooltip: 'Accurate bounce passes with proper trajectory.',
      domains: ['communityParticipation', 'learning'],
      skills: ['followingInstructions', 'stayingOnTask', 'independentEngagement']
    },
    {
      id: 'overheadPass',
      label: 'Overhead pass technique',
      tooltip: 'Controlled overhead passes over defenders.',
      domains: ['communityParticipation', 'learning'],
      skills: ['followingInstructions', 'stayingOnTask', 'independentEngagement']
    },
    {
      id: 'leadingPasses',
      label: 'Leading passes to moving players',
      tooltip: 'Timing passes ahead of moving teammates.',
      domains: ['socialInteraction', 'interpersonalRelationships', 'communication'],
      skills: ['peerInteraction', 'cooperation', 'readingSocialCues', 'problemSolving']
    },
    {
      id: 'catchingConsistency',
      label: 'Catching consistency',
      tooltip: 'Reliably catching passes with proper hand positioning.',
      domains: ['communityParticipation', 'learning'],
      skills: ['stayingOnTask', 'followingInstructions', 'independentEngagement']
    },
    {
      id: 'passingDecisions',
      label: 'Quick decision-making during passing',
      tooltip: 'Reading situations and making timely passing choices.',
      domains: ['socialInteraction', 'learning'],
      skills: ['peerInteraction', 'processingInformation', 'problemSolving', 'readingSocialCues']
    },
    {
      id: 'passingPressure',
      label: 'Passing under pressure',
      tooltip: 'Maintaining composure and accuracy when defended.',
      domains: ['socialInteraction', 'selfManagement'],
      skills: ['emotionalRegulation', 'distressTolerance', 'peerInteraction']
    }
  ],
  
  shooting: [
    {
      id: 'shootingTechnique',
      label: 'Shooting technique',
      tooltip: 'Overall shooting form including balance and follow-through.',
      domains: ['communityParticipation', 'selfManagement', 'learning'],
      skills: ['stayingOnTask', 'independentEngagement', 'selfMonitoring']
    },
    {
      id: 'setShotForm',
      label: 'Set shot form',
      tooltip: 'Proper stationary shooting mechanics.',
      domains: ['communityParticipation', 'learning'],
      skills: ['followingInstructions', 'stayingOnTask', 'independentEngagement']
    },
    {
      id: 'layupTechnique',
      label: 'Lay-up technique',
      tooltip: 'Footwork and finish for lay-ups.',
      domains: ['communityParticipation', 'learning'],
      skills: ['followingInstructions', 'stayingOnTask', 'independentEngagement']
    },
    {
      id: 'shotSelection',
      label: 'Shot selection',
      tooltip: 'Choosing appropriate shooting opportunities.',
      domains: ['communityParticipation', 'learning'],
      skills: ['problemSolving', 'processingInformation', 'selfMonitoring']
    },
    {
      id: 'shootingFootwork',
      label: 'Footwork during shooting',
      tooltip: 'Proper foot positioning and balance before shooting.',
      domains: ['communityParticipation', 'learning'],
      skills: ['followingInstructions', 'stayingOnTask', 'independentEngagement']
    },
    {
      id: 'shootingBalance',
      label: 'Balance during take-off',
      tooltip: 'Maintaining balance when jumping to shoot.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['safetyAwareness', 'independentEngagement', 'stayingOnTask']
    },
    {
      id: 'followThrough',
      label: 'Follow-through consistency',
      tooltip: 'Consistent shooting motion with proper follow-through.',
      domains: ['communityParticipation', 'learning'],
      skills: ['stayingOnTask', 'followingInstructions', 'selfMonitoring']
    },
    {
      id: 'finishingBasket',
      label: 'Finishing at the basket',
      tooltip: 'Completing shots near the rim under various conditions.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['emotionalRegulation', 'distressTolerance', 'independentEngagement']
    }
  ],
  
  movement: [
    {
      id: 'spatialAwareness',
      label: 'Spatial awareness',
      tooltip: 'Understanding position relative to court and others.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['safetyAwareness', 'independentEngagement', 'stayingOnTask']
    },
    {
      id: 'movementOpenSpace',
      label: 'Movement into open space',
      tooltip: 'Moving to create passing or shooting opportunities.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['stayingOnTask', 'safetyAwareness', 'independentEngagement']
    },
    {
      id: 'defensivePositioning',
      label: 'Defensive positioning',
      tooltip: 'Proper stance and position when defending.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['stayingOnTask', 'followingInstructions', 'safetyAwareness']
    },
    {
      id: 'offensivePositioning',
      label: 'Offensive positioning',
      tooltip: 'Positioning to receive passes or score.',
      domains: ['communityParticipation', 'socialInteraction'],
      skills: ['stayingOnTask', 'peerInteraction', 'cooperation']
    },
    {
      id: 'cutsLeads',
      label: 'Cuts and leads',
      tooltip: 'Moving sharply to create space or receive passes.',
      domains: ['communityParticipation', 'socialInteraction'],
      skills: ['stayingOnTask', 'peerInteraction', 'cooperation']
    },
    {
      id: 'defensiveTransitions',
      label: 'Defensive transitions',
      tooltip: 'Moving quickly from offense to defense.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['stayingOnTask', 'transitions', 'emotionalRegulation']
    },
    {
      id: 'offensiveTransitions',
      label: 'Offensive transitions',
      tooltip: 'Moving quickly from defense to offense.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['stayingOnTask', 'transitions', 'independentEngagement']
    },
    {
      id: 'understandingRules',
      label: 'Understanding rules / game concepts',
      tooltip: 'Applying basketball rules and strategies.',
      domains: ['learning', 'communityParticipation'],
      skills: ['followingInstructions', 'processingInformation', 'problemSolving']
    },
    {
      id: 'movingWithoutBall',
      label: 'Moving without the ball',
      tooltip: 'Staying active and creating opportunities off-ball.',
      domains: ['communityParticipation', 'socialInteraction'],
      skills: ['stayingOnTask', 'cooperation', 'independentEngagement']
    },
    {
      id: 'readingPlays',
      label: 'Reading simple plays',
      tooltip: 'Understanding and executing basic team plays.',
      domains: ['learning', 'socialInteraction'],
      skills: ['processingInformation', 'followingInstructions', 'cooperation']
    },
    {
      id: 'courtBoundaries',
      label: 'Staying within court boundaries',
      tooltip: 'Maintaining awareness of court lines and boundaries.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['safetyAwareness', 'stayingOnTask', 'followingInstructions']
    }
  ],
  
  rebounding: [
    {
      id: 'reboundingPositioning',
      label: 'Rebounding positioning',
      tooltip: 'Positioning to collect rebounds effectively.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['safetyAwareness', 'independentEngagement', 'stayingOnTask']
    },
    {
      id: 'boxingOut',
      label: 'Boxing out technique',
      tooltip: 'Creating space and position before rebounding.',
      domains: ['communityParticipation', 'socialInteraction'],
      skills: ['safetyAwareness', 'peerInteraction', 'followingInstructions']
    },
    {
      id: 'timingJumps',
      label: 'Timing jumps for rebounds',
      tooltip: 'Jumping at the right moment to secure rebounds.',
      domains: ['communityParticipation', 'learning'],
      skills: ['stayingOnTask', 'processingInformation', 'independentEngagement']
    },
    {
      id: 'bodyControlContact',
      label: 'Body control during contact',
      tooltip: 'Maintaining balance and control during physical play.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['emotionalRegulation', 'safetyAwareness', 'distressTolerance']
    },
    {
      id: 'securingRebound',
      label: 'Securing ball after rebound',
      tooltip: 'Protecting and controlling the ball after catching a rebound.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['independentEngagement', 'safetyAwareness', 'stayingOnTask']
    }
  ],
  
  communication: [
    {
      id: 'communicationTeammates',
      label: 'Communication with teammates',
      tooltip: 'Verbal and non-verbal communication during play.',
      domains: ['socialInteraction', 'interpersonalRelationships', 'communication'],
      skills: ['peerInteraction', 'initiatingInteraction', 'cooperation']
    },
    {
      id: 'callingPasses',
      label: 'Calling for passes',
      tooltip: 'Verbally or visually signaling to receive the ball.',
      domains: ['socialInteraction', 'communication'],
      skills: ['initiatingInteraction', 'peerInteraction', 'cooperation']
    },
    {
      id: 'verbalCues',
      label: 'Giving simple verbal cues',
      tooltip: 'Providing directions or encouragement to teammates.',
      domains: ['socialInteraction', 'communication'],
      skills: ['initiatingInteraction', 'peerInteraction', 'encouragement']
    },
    {
      id: 'respondingSignals',
      label: 'Responding to teammate signals',
      tooltip: 'Reacting appropriately to team communication.',
      domains: ['socialInteraction', 'communication'],
      skills: ['readingSocialCues', 'peerInteraction', 'cooperation']
    },
    {
      id: 'coordinatingPairs',
      label: 'Coordinating in pairs or groups',
      tooltip: 'Working together with teammates on drills or plays.',
      domains: ['socialInteraction', 'interpersonalRelationships'],
      skills: ['cooperation', 'peerInteraction', 'turnTaking']
    }
  ],
  
  coachability: [
    {
      id: 'followingInstructions',
      label: 'Following instructions',
      tooltip: 'Listening to and applying coach directions.',
      domains: ['learning', 'communityParticipation'],
      skills: ['followingInstructions', 'processingInformation', 'stayingOnTask']
    },
    {
      id: 'highEffort',
      label: 'High effort / persistence',
      tooltip: 'Consistent effort and determination during drills.',
      domains: ['selfManagement', 'communityParticipation'],
      skills: ['stayingOnTask', 'emotionalRegulation', 'independentEngagement']
    },
    {
      id: 'confidenceIncreased',
      label: 'Confidence increased',
      tooltip: 'Growing willingness to attempt skills and participate.',
      domains: ['selfManagement', 'communityParticipation'],
      skills: ['selfMonitoring', 'independentEngagement', 'emotionalRegulation']
    },
    {
      id: 'correctiveFeedback',
      label: 'Used corrective feedback',
      tooltip: 'Applying coach feedback to improve performance.',
      domains: ['learning', 'selfManagement'],
      skills: ['processingInformation', 'selfMonitoring', 'stayingOnTask']
    },
    {
      id: 'neededModelling',
      label: 'Needed modelling',
      tooltip: 'Benefited from visual demonstration before attempting.',
      domains: ['learning'],
      skills: ['processingInformation', 'followingInstructions', 'stayingOnTask']
    },
    {
      id: 'stepByStep',
      label: 'Required step-by-step breakdown',
      tooltip: 'Needed simplified, sequential instructions.',
      domains: ['learning'],
      skills: ['processingInformation', 'followingInstructions', 'workingMemory']
    },
    {
      id: 'safetyReminder',
      label: 'Safety reminder provided',
      tooltip: 'Needed guidance for safe movement or technique.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['safetyAwareness', 'followingInstructions', 'stayingOnTask']
    },
    {
      id: 'focusDrills',
      label: 'Focus during drills',
      tooltip: 'Maintaining attention throughout skill practice.',
      domains: ['learning', 'selfManagement'],
      skills: ['stayingOnTask', 'processingInformation', 'selfMonitoring']
    },
    {
      id: 'stamina',
      label: 'Stamina / sustained effort',
      tooltip: 'Maintaining physical and mental energy throughout session.',
      domains: ['communityParticipation', 'selfManagement'],
      skills: ['stayingOnTask', 'emotionalRegulation', 'independentEngagement']
    }
  ],
  
  regulation: [
    {
      id: 'emotionalRegulationDrills',
      label: 'Emotional regulation during drills',
      tooltip: 'Managing emotions during basketball activities.',
      domains: ['selfManagement', 'communityParticipation'],
      skills: ['emotionalRegulation', 'distressTolerance', 'calmingStrategies']
    },
    {
      id: 'selfRegulationMistake',
      label: 'Self-regulation after a mistake',
      tooltip: 'Recovering emotionally after errors or setbacks.',
      domains: ['selfManagement'],
      skills: ['emotionalRegulation', 'distressTolerance', 'selfMonitoring']
    },
    {
      id: 'reEngagedFrustration',
      label: 'Re-engaged after frustration',
      tooltip: 'Returning to activity after becoming upset or frustrated.',
      domains: ['selfManagement', 'communityParticipation'],
      skills: ['reEngagement', 'emotionalRegulation', 'distressTolerance']
    },
    {
      id: 'calmPressure',
      label: 'Stayed calm under pressure',
      tooltip: 'Maintaining composure during challenging situations.',
      domains: ['selfManagement', 'communityParticipation'],
      skills: ['emotionalRegulation', 'distressTolerance', 'calmingStrategies']
    },
    {
      id: 'breakReturned',
      label: 'Took a break and returned appropriately',
      tooltip: 'Self-managing by taking space and rejoining when ready.',
      domains: ['selfManagement', 'communityParticipation'],
      skills: ['emotionalRegulation', 'reEngagement', 'selfMonitoring', 'transitions']
    }
  ]
};

// Keep the existing BASKETBALL_ADD_ONS as is
export const BASKETBALL_ADD_ONS = [
  { id: 'neededModelling', label: 'Needed modelling', tooltip: 'Coach demonstrated technique first.' },
  { id: 'stepByStep', label: 'Required step-by-step breakdown', tooltip: 'Needed simplified instructions.' },
  { id: 'correctiveFeedback', label: 'Used corrective feedback', tooltip: 'Adjusted after receiving feedback.' },
  { id: 'highEffort', label: 'High effort / persistence shown', tooltip: 'Demonstrated consistent effort.' },
  { id: 'confidenceIncreased', label: 'Confidence increased', tooltip: 'Showed greater willingness.' },
  { id: 'safetyReminder', label: 'Safety reminder provided', tooltip: 'Needed guidance for safe movement.' }
];
