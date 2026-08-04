// Database types matching supabase/migrations/20260804000000_init.sql.
// Hand-written because the schema was authored before a live project existed.
// After running the migration you can regenerate with:
//   npx supabase gen types typescript --project-id <ref> > lib/database.types.ts

import type { Category, SessionStatus, SessionType } from "./types";

export interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_emoji: string | null;
  school: string | null;
  year_group: string | null;
  friend_code: string;
  timezone: string;
  reminder_time: string | null;
  public_leaderboard: boolean;
  xp: number;
  level: number;
  streak_current: number;
  streak_longest: number;
  streak_freezes: number;
  last_session_date: string | null;
  cognitive_score: number;
  referred_by: string | null;
  created_at: string;
}

export interface CategoryRatingRow {
  user_id: string;
  category: Category;
  rating: number;
  puzzles_seen: number;
  correct_count: number;
  median_time_ms: number | null;
  updated_at: string;
}

export interface SessionRow {
  id: string;
  user_id: string;
  type: SessionType;
  date: string;
  puzzle_seeds: unknown;
  status: SessionStatus;
  score: number | null;
  xp_earned: number;
  accuracy: number | null;
  hints_used: number;
  started_at: string;
  completed_at: string | null;
}

export interface AttemptRow {
  id: string;
  session_id: string;
  user_id: string;
  puzzle_type: string;
  category: Category;
  difficulty: number;
  seed: string;
  correct: boolean;
  time_ms: number;
  hints_used: number;
  attempts: number;
  answer: unknown;
  created_at: string;
}

export interface AchievementRow {
  id: string;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
}

export interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted";
  created_at: string;
}

export interface ChallengeRow {
  id: string;
  code: string;
  creator_id: string;
  category: Category;
  difficulty: number;
  puzzle_seeds: unknown;
  expires_at: string;
  created_at: string;
}

export interface ChallengeResultRow {
  id: string;
  challenge_id: string;
  user_id: string;
  score: number;
  time_ms: number;
  completed_at: string;
}

export interface HintCacheRow {
  id: string;
  puzzle_type: string;
  seed: string;
  tier: number;
  hint_text: string;
  created_at: string;
}

export interface LeaderboardViewRow {
  id: string;
  display_name: string;
  avatar_emoji: string | null;
  school: string | null;
  xp: number;
  cognitive_score: number;
  streak_current: number;
}

export interface WeeklyXpRow {
  user_id: string;
  xp: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string; friend_code: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      category_ratings: {
        Row: CategoryRatingRow;
        Insert: Partial<CategoryRatingRow> & {
          user_id: string;
          category: Category;
        };
        Update: Partial<CategoryRatingRow>;
        Relationships: [];
      };
      sessions: {
        Row: SessionRow;
        Insert: Partial<SessionRow> & {
          user_id: string;
          type: SessionType;
          date: string;
          puzzle_seeds: unknown;
        };
        Update: Partial<SessionRow>;
        Relationships: [];
      };
      attempts: {
        Row: AttemptRow;
        Insert: Partial<AttemptRow> & {
          session_id: string;
          user_id: string;
          puzzle_type: string;
          category: Category;
          difficulty: number;
          seed: string;
          correct: boolean;
          time_ms: number;
        };
        Update: Partial<AttemptRow>;
        Relationships: [];
      };
      achievements: {
        Row: AchievementRow;
        Insert: Partial<AchievementRow> & {
          user_id: string;
          achievement_key: string;
        };
        Update: Partial<AchievementRow>;
        Relationships: [];
      };
      friendships: {
        Row: FriendshipRow;
        Insert: Partial<FriendshipRow> & {
          requester_id: string;
          addressee_id: string;
        };
        Update: Partial<FriendshipRow>;
        Relationships: [];
      };
      challenges: {
        Row: ChallengeRow;
        Insert: Partial<ChallengeRow> & {
          code: string;
          creator_id: string;
          category: Category;
          difficulty: number;
          puzzle_seeds: unknown;
        };
        Update: Partial<ChallengeRow>;
        Relationships: [];
      };
      challenge_results: {
        Row: ChallengeResultRow;
        Insert: Partial<ChallengeResultRow> & {
          challenge_id: string;
          user_id: string;
          score: number;
          time_ms: number;
        };
        Update: Partial<ChallengeResultRow>;
        Relationships: [];
      };
      hint_cache: {
        Row: HintCacheRow;
        Insert: Partial<HintCacheRow> & {
          puzzle_type: string;
          seed: string;
          tier: number;
          hint_text: string;
        };
        Update: Partial<HintCacheRow>;
        Relationships: [];
      };
    };
    Views: {
      leaderboard_view: { Row: LeaderboardViewRow; Relationships: [] };
      weekly_xp_mv: { Row: WeeklyXpRow; Relationships: [] };
    };
    Functions: {
      refresh_weekly_xp: { Args: Record<string, never>; Returns: undefined };
      lookup_friend_code: {
        Args: { code: string };
        Returns: {
          id: string;
          display_name: string;
          avatar_emoji: string | null;
        }[];
      };
    };
    Enums: {
      category: Category;
      session_type: SessionType;
      session_status: SessionStatus;
      friendship_status: "pending" | "accepted";
    };
    CompositeTypes: Record<string, never>;
  };
}
