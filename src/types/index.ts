export interface TestCase {
  id: number;
  title: string; // e.g. "Odd / Unsplittable Weight" or "Sample Test 1"
  description: string;
  input: string;
  expectedOutput: string;
}

export interface ProblemMetadata {
  id: string; // e.g. "4A"
  contestId: number;
  index: string;
  title: string; // e.g. "Watermelon"
  emoji: string; // e.g. "🍉"
  category: string; // e.g. "Math", "Brute Force", "Greedy"
  type: 'exercise' | 'concept'; // matched to exercise node in path
  rating: number;
  solvedCount: number;
  timeLimit?: string;
  memoryLimit?: string;
  descriptionHtml: string;
  inputSpecificationHtml?: string;
  outputSpecificationHtml?: string;
  sampleNotesHtml?: string;
  starterCode: string;
  starterCodeCpp?: string;
  starterCodeJava?: string;
  starterCodePy?: string;
  hints?: string[];
  explanation?: string;
  testCases: TestCase[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
  requirement?: string;
  category?: 'milestone' | 'speed' | 'problem' | 'streak';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  relatedProblemId?: string;
}

export interface UserProgress {
  userId: string;
  name: string;
  handle: string;
  isLoggedIn?: boolean;
  avatarUrl?: string;
  rating?: number;
  rank?: string;
  maxRating?: number;
  maxRank?: string;
  streakDays: number;
  completedProblemIds: string[];
  badges: Badge[];
}

export interface LearningPathNode {
  id: string;
  type: 'concept' | 'exercise';
  problemId?: string;
  title: string;
  subtitle: string;
  emoji: string;
  badgeLabel: string; // e.g. "📝 Exercise", "💡 Concept"
  badgeColor?: string;
  duration?: string;
  completed: boolean;
  summary?: string;
}

