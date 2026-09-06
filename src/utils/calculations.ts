import type { Question, ScaleResult, TestResult, ScaleKey, ProfileKey } from '../types/test';
import { QUESTIONS, CONTRADICTIONS, STRATEGIC_QUESTIONS, PROFILES, SCALE_FRAGMENTS } from '../data/testData';

/**
 * Calculate raw score for a single question
 * For reverse questions: 6 - answer
 * For direct questions: answer as is
 */
export function calculateQuestionScore(question: Question, answer: number): number {
  if (question.reverse) {
    return 6 - answer;
  }
  return answer;
}

/**
 * Calculate percentage for a scale (0-100)
 * Formula: ((sum - 3) / 12) * 100
 */
export function calculateScalePercentage(sum: number): number {
  return Math.round(((sum - 3) / 12) * 100);
}

/**
 * Get interpretation level for a scale percentage
 */
export function getScaleLevel(percentage: number): 'tension' | 'unstable' | 'forming' | 'expressed' {
  if (percentage <= 39) return 'tension';
  if (percentage <= 59) return 'unstable';
  if (percentage <= 74) return 'forming';
  return 'expressed';
}

/**
 * Get level label in Russian
 */
export function getLevelLabel(level: 'tension' | 'unstable' | 'forming' | 'expressed'): string {
  const labels = {
    tension: 'Зона напряжения',
    unstable: 'Неустойчивая зона',
    forming: 'Формирующаяся опора',
    expressed: 'Выраженная опора',
  };
  return labels[level];
}

/**
 * Get color for scale level
 */
export function getLevelColor(level: 'tension' | 'unstable' | 'forming' | 'expressed'): string {
  const colors = {
    tension: '#EF4444',
    unstable: '#F59E0B',
    forming: '#22C55E',
    expressed: '#16A34A',
  };
  return colors[level];
}

/**
 * Calculate all scale results from answers
 */
export function calculateScaleResults(answers: Record<number, number>): ScaleResult[] {
  const scaleSums: Record<ScaleKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 };
  
  QUESTIONS.forEach((question) => {
    const answer = answers[question.id];
    if (answer !== undefined) {
      const score = calculateQuestionScore(question, answer);
      scaleSums[question.scale] += score;
    }
  });

  return (Object.keys(scaleSums) as ScaleKey[]).map((scaleKey) => {
    const sum = scaleSums[scaleKey];
    const percentage = calculateScalePercentage(sum);
    const level = getScaleLevel(percentage);
    return {
      scale: scaleKey,
      score: sum,
      percentage,
      level,
    };
  });
}

/**
 * Calculate overall index (0-100)
 */
export function calculateOverallIndex(scaleResults: ScaleResult[]): number {
  const sum = scaleResults.reduce((acc, result) => acc + result.percentage, 0);
  return Math.round(sum / 7);
}

/**
 * Find contradictions between scales
 * Condition: one scale >= 65%, another <= 55%, difference >= 20pp
 */
export function findContradictions(scaleResults: ScaleResult[]) {
  const contradictions: { high: ScaleResult; low: ScaleResult; tension: number; label: string; description: string }[] = [];
  
  CONTRADICTIONS.forEach((contradiction) => {
    const highResult = scaleResults.find((r) => r.scale === contradiction.highScale);
    const lowResult = scaleResults.find((r) => r.scale === contradiction.lowScale);
    
    if (highResult && lowResult) {
      if (highResult.percentage >= 65 && lowResult.percentage <= 55 && (highResult.percentage - lowResult.percentage) >= 20) {
        const tension = (highResult.percentage - lowResult.percentage) + (55 - lowResult.percentage);
        contradictions.push({
          high: highResult,
          low: lowResult,
          tension,
          label: contradiction.label,
          description: contradiction.description,
        });
      }
    }
  });
  
  // Sort by tension descending, take top 2
  return contradictions.sort((a, b) => b.tension - a.tension).slice(0, 2);
}

/**
 * Determine profile based on scale results
 */
export function determineProfile(scaleResults: ScaleResult[], overallIndex: number): ProfileKey {
  const fResult = scaleResults.find((r) => r.scale === 'F');
  const gResult = scaleResults.find((r) => r.scale === 'G');
  const eResult = scaleResults.find((r) => r.scale === 'E');
  const cResult = scaleResults.find((r) => r.scale === 'C');
  
  // Check special combinations first
  if (fResult && gResult && fResult.percentage >= 70 && gResult.percentage <= 54 && (fResult.percentage - gResult.percentage) >= 25) {
    return '7.3';
  }
  
  if (eResult && cResult && eResult.percentage >= 70 && cResult.percentage <= 54 && (eResult.percentage - cResult.percentage) >= 20) {
    return '7.5';
  }
  
  // Fallback to overall index
  if (overallIndex <= 39) return '7.1';
  if (overallIndex <= 54) return '7.2';
  if (overallIndex <= 69) return '7.4';
  if (overallIndex <= 84) return '7.6';
  return '7.7';
}

/**
 * Get main strategic question based on leading zone
 */
export function getMainStrategicQuestion(
  scaleResults: ScaleResult[],
  contradictions: ReturnType<typeof findContradictions>
): string {
  if (contradictions.length > 0) {
    // Use the low scale from the top contradiction
    return STRATEGIC_QUESTIONS[contradictions[0].low.scale] || STRATEGIC_QUESTIONS['A'];
  }
  
  // Find two minimum scales
  const sorted = [...scaleResults].sort((a, b) => a.percentage - b.percentage);
  const minScale = sorted[0];
  return STRATEGIC_QUESTIONS[minScale.scale] || STRATEGIC_QUESTIONS['A'];
}

/**
 * Calculate complete test result
 */
export function calculateTestResult(answers: Record<number, number>): TestResult {
  const scaleResults = calculateScaleResults(answers);
  const overallIndex = calculateOverallIndex(scaleResults);
  const profileKey = determineProfile(scaleResults, overallIndex);
  const profile = PROFILES.find((p) => p.key === profileKey)!;
  const contradictions = findContradictions(scaleResults);
  
  // Get strong supports (top 2 scales)
  const strongSupports = [...scaleResults]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2);
  
  // Get tension zones
  let tensionZones: TestResult['tensionZones'];
  if (contradictions.length > 0) {
    tensionZones = contradictions.map((c) => ({
      scale: c.low.scale,
      score: c.low.score,
      percentage: c.low.percentage,
      level: c.low.level,
    }));
  } else {
    // Two minimum scales
    tensionZones = [...scaleResults]
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 2);
  }
  
  const mainStrategicQuestion = getMainStrategicQuestion(scaleResults, contradictions);
  
  return {
    overallIndex,
    profile,
    scaleResults,
    strongSupports,
    tensionZones,
    mainStrategicQuestion,
    answers,
  };
}

/**
 * Get scale fragment based on percentage
 */
export function getScaleFragment(scaleKey: ScaleKey, percentage: number): string {
  const fragments = SCALE_FRAGMENTS[scaleKey];
  if (!fragments) return '';
  
  if (percentage >= 75) return fragments.high;
  if (percentage >= 40) return fragments.medium;
  return fragments.low;
}
