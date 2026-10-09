import { UserProgress, Badge, SupportedLanguage, UserSettings } from '../types';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  preferredLanguage: 'cpp',
  editorLigatures: true,
};

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_solve',
    name: 'First Solved',
    icon: '🏅',
    description: 'Solved your first Codeforces problem!',
    requirement: 'Solve any challenge on the roadmap',
    unlockedAt: '2026-10-03',
    category: 'milestone',
    rarity: 'common',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Executed solution in under 5ms!',
    requirement: 'Pass all tests with fast C++ runtime',
    unlockedAt: '2026-10-04',
    category: 'speed',
    rarity: 'rare',
  },
  {
    id: 'watermelon',
    name: 'Watermelon Master',
    icon: '🍉',
    description: 'Divided the famous 4A watermelon!',
    requirement: 'Pass all 5 test cases of 4A',
    unlockedAt: '2026-10-04',
    category: 'problem',
    rarity: 'common',
    relatedProblemId: '4A',
  },
  {
    id: 'streak_3',
    name: 'Consistency King',
    icon: '🔥',
    description: 'Maintained a 3-day active streak!',
    requirement: 'Solve problems 3 days in a row',
    unlockedAt: '2026-10-05',
    category: 'streak',
    rarity: 'rare',
  },
  {
    id: 'string_wiz',
    name: 'String Wizard',
    icon: '🔤',
    description: 'Conquered 71A Way Too Long Words',
    requirement: 'Pass 71A Way Too Long Words',
    category: 'problem',
    rarity: 'rare',
    relatedProblemId: '71A',
  },
  {
    id: 'team_player',
    name: 'Team Player',
    icon: '👥',
    description: 'Helped Petya, Vasya and Tonya in 231A',
    requirement: 'Pass 231A Team',
    category: 'problem',
    rarity: 'common',
    relatedProblemId: '231A',
  },
  {
    id: 'bit_hacker',
    name: 'Bit++ Operator',
    icon: '💻',
    description: 'Mastered 282A Bit++ language',
    requirement: 'Pass 282A Bit++',
    category: 'problem',
    rarity: 'rare',
    relatedProblemId: '282A',
  },
  {
    id: 'math_genius',
    name: 'Domino Mathematician',
    icon: '🁓',
    description: 'Tiled rectangular grids in 50A Domino piling',
    requirement: 'Pass 50A Domino piling',
    category: 'problem',
    rarity: 'common',
    relatedProblemId: '50A',
  },
  {
    id: 'fast_io_pro',
    name: 'Fast I/O Prodigy',
    icon: '🚀',
    description: 'Read multiline inputs with fast C++ streams',
    requirement: 'Solve any multiline problem in under 10ms',
    category: 'speed',
    rarity: 'epic',
  },
  {
    id: 'ten_club',
    name: 'Top 10 Explorer',
    icon: '🏆',
    description: 'Solved 10 top Codeforces challenges',
    requirement: 'Complete 10 problems on the roadmap',
    category: 'milestone',
    rarity: 'legendary',
  },
];

export const DEMO_PROFILES: Record<string, UserProgress> = {
  nicholas: {
    userId: 'usr_nicholas_1',
    name: 'Nicholas I.',
    handle: 'nicholas',
    email: 'nicholas@codeforces.dev',
    isLoggedIn: true,
    rating: 1540,
    rank: 'Specialist',
    streakDays: 3,
    completedProblemIds: ['4A'],
    badges: INITIAL_BADGES,
    preferredLanguage: 'cpp',
    editorLigatures: true,
  },
  tourist: {
    userId: 'usr_tourist',
    name: 'Gennady Korotkevich',
    handle: 'tourist',
    email: 'tourist@itmo.ru',
    isLoggedIn: true,
    rating: 3979,
    rank: 'Legendary Grandmaster',
    streakDays: 142,
    completedProblemIds: ['4A', '71A', '231A', '282A', '158A', '50A', '263A', '112A', '236A', '339A'],
    badges: INITIAL_BADGES.map(b => ({ ...b, unlockedAt: b.unlockedAt || '2026-09-15' })),
    preferredLanguage: 'cpp',
    editorLigatures: true,
  },
  guest: {
    userId: 'usr_guest',
    name: 'Guest Explorer',
    handle: 'guest',
    isLoggedIn: false,
    rating: 1200,
    rank: 'Pupil',
    streakDays: 1,
    completedProblemIds: [],
    badges: INITIAL_BADGES.map(b => ({ ...b, unlockedAt: undefined })),
    preferredLanguage: 'cpp',
    editorLigatures: true,
  },
};

export const GUEST_USER: UserProgress = {
  userId: 'usr_guest',
  name: 'Guest User',
  handle: 'guest',
  isLoggedIn: false,
  rating: 0,
  rank: 'Unrated',
  streakDays: 0,
  completedProblemIds: [],
  badges: INITIAL_BADGES.map(b => ({ ...b, unlockedAt: undefined })),
  preferredLanguage: 'cpp',
  editorLigatures: true,
};

export const INITIAL_USER_PROGRESS: UserProgress = GUEST_USER;

const STORAGE_KEY = 'cf_user_progress_v2';
const AUTH_ACCOUNTS_KEY = 'cf_auth_accounts_v1';

export interface AuthAccount {
  email: string;
  passwordHash: string;
  handle: string;
  name: string;
  rating: number;
  rank: string;
  avatarUrl?: string;
  completedProblemIds?: string[];
  badges?: Badge[];
  streakDays?: number;
  preferredLanguage?: SupportedLanguage;
  editorLigatures?: boolean;
}

export function getUserSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_USER_SETTINGS;
  try {
    const rawLang = localStorage.getItem('cf_preferred_lang');
    const rawLigatures = localStorage.getItem('cf_editor_ligatures');
    const user = getUserProgress();

    const candidateLang = (rawLang || user.preferredLanguage || 'cpp') as SupportedLanguage;
    const preferredLanguage: SupportedLanguage = ['cpp', 'c', 'kotlin', 'java', 'python'].includes(candidateLang)
      ? candidateLang
      : 'cpp';

    const editorLigatures = rawLigatures !== null
      ? rawLigatures !== 'false'
      : (user.editorLigatures ?? true);

    return {
      preferredLanguage,
      editorLigatures,
    };
  } catch {
    return DEFAULT_USER_SETTINGS;
  }
}

export function saveUserSettings(settings: Partial<UserSettings>): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_USER_SETTINGS;
  try {
    const current = getUserSettings();
    const updated: UserSettings = {
      ...current,
      ...settings,
    };

    localStorage.setItem('cf_preferred_lang', updated.preferredLanguage);
    localStorage.setItem('cf_editor_ligatures', String(updated.editorLigatures));

    // Also update current active user progress
    const user = getUserProgress();
    if (user) {
      saveUserProgress({
        ...user,
        preferredLanguage: updated.preferredLanguage,
        editorLigatures: updated.editorLigatures,
      });
    }

    // Dispatch event so all components react immediately
    window.dispatchEvent(new CustomEvent('cf_settings_changed', { detail: updated }));
    return updated;
  } catch {
    return DEFAULT_USER_SETTINGS;
  }
}

export function getUserProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return GUEST_USER;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return GUEST_USER;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.isLoggedIn === false) {
      return {
        ...GUEST_USER,
        completedProblemIds: parsed?.completedProblemIds || [],
        preferredLanguage: (localStorage.getItem('cf_preferred_lang') as SupportedLanguage) || 'cpp',
        editorLigatures: localStorage.getItem('cf_editor_ligatures') !== 'false',
      };
    }
    return {
      ...GUEST_USER,
      ...parsed,
      isLoggedIn: true,
      badges: parsed.badges || INITIAL_BADGES,
      preferredLanguage: (localStorage.getItem('cf_preferred_lang') as SupportedLanguage) || parsed.preferredLanguage || 'cpp',
      editorLigatures: localStorage.getItem('cf_editor_ligatures') !== null
        ? localStorage.getItem('cf_editor_ligatures') !== 'false'
        : (parsed.editorLigatures ?? true),
    };
  } catch (e) {
    return GUEST_USER;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

    if (progress.preferredLanguage) {
      localStorage.setItem('cf_preferred_lang', progress.preferredLanguage);
    }
    if (progress.editorLigatures !== undefined) {
      localStorage.setItem('cf_editor_ligatures', String(progress.editorLigatures));
    }

    // Also persist progress to accounts registry if logged into an account
    if (progress.isLoggedIn && progress.userId?.startsWith('acc_')) {
      const raw = localStorage.getItem(AUTH_ACCOUNTS_KEY);
      if (raw) {
        const accounts: Record<string, AuthAccount> = JSON.parse(raw);
        for (const key of Object.keys(accounts)) {
          if (accounts[key].handle.toLowerCase() === progress.handle.toLowerCase()) {
            accounts[key].completedProblemIds = progress.completedProblemIds;
            accounts[key].badges = progress.badges;
            accounts[key].rating = progress.rating ?? 1200;
            accounts[key].rank = progress.rank ?? 'Pupil';
            accounts[key].streakDays = progress.streakDays;
            accounts[key].preferredLanguage = progress.preferredLanguage;
            accounts[key].editorLigatures = progress.editorLigatures;
            localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
            break;
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}

export function logoutUser(): UserProgress {
  const current = getUserProgress();
  const guest: UserProgress = {
    ...GUEST_USER,
    completedProblemIds: current.completedProblemIds,
    preferredLanguage: current.preferredLanguage || 'cpp',
    editorLigatures: current.editorLigatures ?? true,
  };
  saveUserProgress(guest);
  return guest;
}

export function loginUser(profile: UserProgress): UserProgress {
  const current = getUserProgress();
  const mergedProblemIds = Array.from(
    new Set([...(current.completedProblemIds || []), ...(profile.completedProblemIds || [])])
  );
  const loggedIn: UserProgress = {
    ...profile,
    isLoggedIn: true,
    completedProblemIds: mergedProblemIds,
  };
  saveUserProgress(loggedIn);

  // Sync settings
  if (loggedIn.preferredLanguage) {
    localStorage.setItem('cf_preferred_lang', loggedIn.preferredLanguage);
  }
  if (loggedIn.editorLigatures !== undefined) {
    localStorage.setItem('cf_editor_ligatures', String(loggedIn.editorLigatures));
  }
  window.dispatchEvent(new CustomEvent('cf_settings_changed', {
    detail: {
      preferredLanguage: loggedIn.preferredLanguage || 'cpp',
      editorLigatures: loggedIn.editorLigatures ?? true,
    }
  }));

  return loggedIn;
}

export function registerAccount(
  email: string,
  password: string,
  handle: string,
  preferredLanguage: SupportedLanguage = 'cpp'
): { success: boolean; user?: UserProgress; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Browser required' };
  try {
    const raw = localStorage.getItem(AUTH_ACCOUNTS_KEY);
    const accounts: Record<string, AuthAccount> = raw ? JSON.parse(raw) : {};

    const cleanEmail = email.trim().toLowerCase();
    const cleanHandle = handle.trim().replace(/^@/, '');

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    if (!cleanHandle || cleanHandle.length < 2) {
      return { success: false, error: 'Handle must be at least 2 characters.' };
    }

    if (accounts[cleanEmail]) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newAccount: AuthAccount = {
      email: cleanEmail,
      passwordHash: btoa(password), // Simple base64 encoding for local demo auth
      handle: cleanHandle,
      name: cleanHandle,
      rating: 1200,
      rank: 'Pupil',
      preferredLanguage,
      editorLigatures: true,
    };

    accounts[cleanEmail] = newAccount;
    localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));

    const userProfile: UserProgress = {
      userId: `acc_${cleanHandle}`,
      name: cleanHandle,
      handle: cleanHandle,
      email: cleanEmail,
      isLoggedIn: true,
      rating: 1200,
      rank: 'Pupil',
      streakDays: 1,
      completedProblemIds: [],
      badges: INITIAL_BADGES,
      preferredLanguage,
      editorLigatures: true,
    };

    loginUser(userProfile);
    return { success: true, user: userProfile };
  } catch (err: any) {
    return { success: false, error: err.message || 'Registration failed.' };
  }
}

export function loginWithCredentials(emailOrHandle: string, password: string): { success: boolean; user?: UserProgress; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Browser required' };
  try {
    const raw = localStorage.getItem(AUTH_ACCOUNTS_KEY);
    const accounts: Record<string, AuthAccount> = raw ? JSON.parse(raw) : {};

    const query = emailOrHandle.trim().toLowerCase();
    let account = accounts[query];

    if (!account) {
      account = Object.values(accounts).find(
        acc => acc.handle.toLowerCase() === query || acc.email.toLowerCase() === query
      )!;
    }

    if (!account) {
      // Check built-in demo profiles
      if (DEMO_PROFILES[query]) {
        const demo = DEMO_PROFILES[query];
        loginUser(demo);
        return { success: true, user: demo };
      }
      return { success: false, error: 'Account not found. Please register or check your credentials.' };
    }

    if (account.passwordHash !== btoa(password)) {
      return { success: false, error: 'Invalid password. Please try again.' };
    }

    const userProfile: UserProgress = {
      userId: `acc_${account.handle}`,
      name: account.name,
      handle: account.handle,
      email: account.email,
      isLoggedIn: true,
      rating: account.rating,
      rank: account.rank,
      streakDays: (account as any).streakDays || 1,
      avatarUrl: account.avatarUrl,
      completedProblemIds: (account as any).completedProblemIds || [],
      badges: (account as any).badges || INITIAL_BADGES,
      preferredLanguage: account.preferredLanguage || 'cpp',
      editorLigatures: account.editorLigatures ?? true,
    };

    loginUser(userProfile);
    return { success: true, user: userProfile };
  } catch (err: any) {
    return { success: false, error: err.message || 'Login failed.' };
  }
}

export function markProblemCompleted(problemId: string): UserProgress {
  const current = getUserProgress();
  const normId = problemId.toUpperCase();

  if (!current.completedProblemIds.includes(normId)) {
    const updatedIds = [...current.completedProblemIds, normId];

    // Check for badge unlocks
    const updatedBadges = current.badges.map(b => {
      if (normId === '4A' && b.id === 'watermelon' && !b.unlockedAt) {
        return { ...b, unlockedAt: new Date().toISOString().split('T')[0] };
      }
      if (normId === '71A' && b.id === 'string_wiz' && !b.unlockedAt) {
        return { ...b, unlockedAt: new Date().toISOString().split('T')[0] };
      }
      if (normId === '231A' && b.id === 'team_player' && !b.unlockedAt) {
        return { ...b, unlockedAt: new Date().toISOString().split('T')[0] };
      }
      if (normId === '282A' && b.id === 'bit_hacker' && !b.unlockedAt) {
        return { ...b, unlockedAt: new Date().toISOString().split('T')[0] };
      }
      if (normId === '50A' && b.id === 'math_genius' && !b.unlockedAt) {
        return { ...b, unlockedAt: new Date().toISOString().split('T')[0] };
      }
      if (updatedIds.length >= 10 && b.id === 'ten_club' && !b.unlockedAt) {
        return { ...b, unlockedAt: new Date().toISOString().split('T')[0] };
      }
      return b;
    });

    const updated: UserProgress = {
      ...current,
      completedProblemIds: updatedIds,
      badges: updatedBadges,
      streakDays: current.completedProblemIds.length === 0 ? current.streakDays + 1 : current.streakDays,
    };
    saveUserProgress(updated);
    return updated;
  }

  return current;
}
