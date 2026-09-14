import type { CategoryRatings, ReviewCriterionKey } from "../../types/tutor";

export interface ReviewCriterion {
  key: ReviewCriterionKey;
  label: string;
  question: string;
}

// Matches the sketch. Add a criterion here + in reviewSchema to extend.
export const REVIEW_CRITERIA: ReviewCriterion[] = [
  { key: "knowledge", label: "Knowledge", question: "Did the tutor master the subject matter?" },
  { key: "teachingStyle", label: "Teaching Style", question: "Was the explanation clear and engaging?" },
  { key: "punctuality", label: "Punctuality", question: "Did the session start and end on time?" },
];

export const REVIEW_MAX_LENGTH = 500;

export const EMPTY_RATINGS: CategoryRatings = { knowledge: 0, teachingStyle: 0, punctuality: 0 };

export const computeOverallRating = (ratings: CategoryRatings): number => {
  const values = REVIEW_CRITERIA.map((c) => ratings[c.key]);
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
};

export const isSessionPast = (endTime: string): boolean =>
  new Date(endTime).getTime() < Date.now();

export const formatReviewDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });