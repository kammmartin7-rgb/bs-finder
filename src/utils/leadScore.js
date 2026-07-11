function hasValue(value) {
  return value !== null && value !== undefined && value !== ''
}

export function calculateLeadScore(lead) {
  let score = 0

  if (hasValue(lead.website)) {
    score += 25
  }

  if (hasValue(lead.phone)) {
    score += 25
  }

  if (typeof lead.rating === 'number') {
    score += Math.round((lead.rating / 5) * 30)
  }

  if (typeof lead.reviewsCount === 'number') {
    score += Math.min(20, Math.round((lead.reviewsCount / 100) * 20))
  }

  return Math.min(100, Math.max(0, score))
}

export function getLeadScoreClass(score) {
  if (score >= 90) {
    return 'lead-score-high'
  }

  if (score >= 70) {
    return 'lead-score-mid'
  }

  return 'lead-score-low'
}
