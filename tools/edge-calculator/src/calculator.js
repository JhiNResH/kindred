/**
 * Calculate Expected Value (EV) for a bet
 * @param {number} prob - Your estimated probability (0-1)
 * @param {number} price - Market price/odds (0-1)
 * @returns {object} EV calculation results
 */
function calculateEV(prob, price) {
  // Validate inputs
  if (prob <= 0 || prob >= 1) {
    throw new Error('Probability must be between 0 and 1 (exclusive)');
  }
  if (price <= 0 || price >= 1) {
    throw new Error('Price must be between 0 and 1 (exclusive)');
  }

  // For a $1 stake:
  // If you win: you get back $1/price (total payout)
  // If you lose: you lose your $1 stake

  const stake = 1;
  const payout = stake / price; // Total payout if you win
  const profit = payout - stake; // Net profit if you win

  // EV = (probability of winning * profit if win) - (probability of losing * loss if lose)
  const ev = (prob * profit) - ((1 - prob) * stake);
  const evPercent = (ev / stake) * 100;

  return {
    ev: ev,
    evPercent: evPercent,
    isPositive: ev > 0,
    edge: prob - price // Your edge over the market
  };
}

/**
 * Calculate Kelly Criterion for optimal bet sizing
 * @param {number} prob - Your estimated probability (0-1)
 * @param {number} price - Market price/odds (0-1)
 * @param {number} bankroll - Your total bankroll (optional)
 * @returns {object} Kelly calculation results
 */
function calculateKelly(prob, price, bankroll = null) {
  // Validate inputs
  if (prob <= 0 || prob >= 1) {
    throw new Error('Probability must be between 0 and 1 (exclusive)');
  }
  if (price <= 0 || price >= 1) {
    throw new Error('Price must be between 0 and 1 (exclusive)');
  }
  if (bankroll !== null && bankroll <= 0) {
    throw new Error('Bankroll must be positive');
  }

  // Simplified Kelly formula for binary outcomes:
  // kelly = (prob - price) / (1 - price)
  const kellyFraction = (prob - price) / (1 - price);
  const kellyPercent = kellyFraction * 100;

  // Calculate suggested bet size if bankroll is provided
  let suggestedBet = null;
  if (bankroll !== null) {
    suggestedBet = Math.max(0, kellyFraction * bankroll);
  }

  // Calculate EV for context
  const evData = calculateEV(prob, price);

  return {
    kellyFraction: kellyFraction,
    kellyPercent: kellyPercent,
    suggestedBet: suggestedBet,
    bankroll: bankroll,
    hasEdge: kellyFraction > 0,
    ev: evData.ev,
    evPercent: evData.evPercent,
    edge: evData.edge
  };
}

/**
 * Format results for display
 * @param {object} results - Calculation results
 * @param {string} type - Type of calculation ('ev' or 'kelly')
 * @returns {string} Formatted output string
 */
function formatResults(results, type) {
  let output = [];

  if (type === 'ev') {
    output.push(`Expected Value: ${results.evPercent.toFixed(2)}%`);
    output.push(`Edge: ${(results.edge * 100).toFixed(2)}%`);
    output.push(`Status: ${results.isPositive ? 'POSITIVE EV ✓' : 'NEGATIVE EV ✗'}`);
  } else if (type === 'kelly') {
    output.push(`Kelly Criterion: ${results.kellyPercent.toFixed(2)}%`);
    output.push(`Expected Value: ${results.evPercent.toFixed(2)}%`);
    output.push(`Edge: ${(results.edge * 100).toFixed(2)}%`);

    if (results.bankroll !== null && results.suggestedBet !== null) {
      output.push(`Suggested Bet: $${results.suggestedBet.toFixed(2)} (of $${results.bankroll} bankroll)`);
    }

    if (!results.hasEdge) {
      output.push('Warning: No positive edge detected. Kelly suggests 0% bet.');
    }
  }

  return output.join('\n');
}

module.exports = {
  calculateEV,
  calculateKelly,
  formatResults
};
