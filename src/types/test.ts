// Types for the Life Ownership Index Test

export interface Question {
  id: number;
  text: string;
  scale: ScaleKey;
  reverse: boolean;
}

export type ScaleKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface Scale {
  key: ScaleKey;
  name: string;
  description: string;
}

export interface ScaleResult {
  scale: ScaleKey;
  score: number; // raw sum 3-15
  percentage: number; // 0-100
  level: 'tension' | 'unstable' | 'forming' | 'expressed';
}

export type ProfileKey = '7.1' | '7.2' | '7.3' | '7.4' | '7.5' | '7.6' | '7.7';

export interface Profile {
  key: ProfileKey;
  name: string;
  range: string;
  characteristic: string;
  state: string;
  mainContradiction: string;
  risks: string[];
  resources: string[];
  transitionToProgram: string;
  fullFeedback: string;
}

export interface Contradiction {
  highScale: ScaleKey;
  lowScale: ScaleKey;
  label: string;
  description: string;
}

export interface TestResult {
  overallIndex: number; // 0-100
  profile: Profile;
  scaleResults: ScaleResult[];
  strongSupports: ScaleResult[];
  tensionZones: ScaleResult[];
  mainStrategicQuestion: string;
  answers: Record<number, number>; // questionId -> answer 1-5
}

export interface QuizState {
  step: 'welcome' | 'questions' | 'contact' | 'calculating' | 'report';
  currentQuestion: number;
  answers: Record<number, number>;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}
