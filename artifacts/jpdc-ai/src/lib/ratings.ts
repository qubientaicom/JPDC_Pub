export const RATING_LEVELS = [5, 4, 3, 2, 1, -1, -2, -3, -4, -5] as const;
export type RatingLevel = typeof RATING_LEVELS[number];
export type RatingDistribution = Partial<Record<RatingLevel, number>>;

/** Each signed score contributes its value, not just one like/dislike. */
export function summarizeRatings(distribution: RatingDistribution = {}) {
  let positiveScore = 0;
  let negativeScore = 0;
  let count = 0;
  for (const level of RATING_LEVELS) {
    const votes = distribution[level] ?? 0;
    count += votes;
    if (level > 0) positiveScore += level * votes;
    else negativeScore += level * votes;
  }
  return { positiveScore, negativeScore, total: positiveScore + negativeScore, count };
}
