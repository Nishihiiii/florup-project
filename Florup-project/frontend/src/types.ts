export type PageId =
  | 'home'
  | 'catalog'
  | 'plant'
  | 'care'
  | 'diagnostics'
  | 'diagnosis'
  | 'map'
  | 'community'
  | 'profile'
  | 'profile-edit'
  | 'settings'
  | 'admin'
  | 'expert'
  | 'login'
  | 'register';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  push_notifications: boolean;
  email_notifications: boolean;
  role: 'admin' | 'user' | 'expert' | string;
  stats: {
    plants: number;
    posts: number;
    likes: number;
  };
}

export interface Plant {
  id: string;
  name: string;
  latin_name?: string | null;
  description?: string | null;
  care_watering_text?: string | null;
  care_lighting_text?: string | null;
  care_temp_text?: string | null;
  water_interval_days?: number | null;
  fertilize_interval_days?: number | null;
  spray_interval_days?: number | null;
  image_url?: string | null;
}

export interface Problem {
  id: string;
  name: string;
  description: string;
  treatment: string;
  image_url?: string | null;
  problem_types?: { id: number; name: string } | null;
  symptoms?: Symptom[];
  plants?: Plant[];
}

export interface Symptom {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  confidence?: number;
  problems?: Problem[];
}

export interface DiagnosisCardItem {
  id: string;
  kind: string;
  name: string;
  image_url?: string;
  description?: string;
  treatment?: string;
  problems?: Problem[];
  plants?: Plant[];
  problem_types?: { name: string } | null;
}

export interface PostComment {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  likes: number;
  likedByMe: boolean;
  comments: PostComment[];
  created_at: string;
}

export interface Fact {
  id: number;
  title: string;
  content: string;
}

export interface CareActionType {
  id: number;
  name: string;
}

export interface CareLog {
  id: string;
  user_plant_id: string;
  action_date: string;
  notes?: string | null;
  care_action_types?: CareActionType;
  user_plants?: {
    nickname?: string | null;
    plants?: Plant | null;
  };
}

export interface UserPlant {
  id: string;
  plant_id?: string | null;
  nickname?: string | null;
  image_url?: string | null;
  adopted_at?: string | null;
  created_at?: string | null;
  plants?: Plant | null;
  care_logs?: CareLog[];
}

export interface City {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface StoreProduct {
  id: string;
  name: string;
  price?: number | null;
}

export interface StoreReview {
  id: string;
  author: string;
  rating: number;
  text: string;
}

export interface Store {
  id: string;
  city_id: number;
  name: string;
  city: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  working_hours: string;
  contact_info: string;
  categories: string[];
  products: StoreProduct[];
  reviews: StoreReview[];
}

export interface SharedProps {
  go: (next: PageId) => void;
  plants: Plant[];
  problems: Problem[];
  symptoms: Symptom[];
  posts: CommunityPost[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  facts: Fact[];
  apiState: 'loading' | 'ready' | 'offline';
  selectedPlant: Plant | null;
  setSelectedPlant: React.Dispatch<React.SetStateAction<Plant | null>>;
  selectedProblem: DiagnosisCardItem | null;
  setSelectedProblem: React.Dispatch<React.SetStateAction<DiagnosisCardItem | null>>;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  notify: (message: string) => void;
  plantSearch: string;
  setPlantSearch: React.Dispatch<React.SetStateAction<string>>;
  refreshData: () => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}