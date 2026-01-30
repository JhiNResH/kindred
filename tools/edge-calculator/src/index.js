#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { calculateEV, calculateKelly, formatResults } = require('./calculator');

const program = new Command();

program
  .name('edge')
  .description('Calculate Expected Value (EV) and Kelly Criterion for prediction market betting')
  .version('1.0.0');

// EV command
program
  .command('ev')
  .description('Calculate Expected Value')
  .requiredOption('-p, --prob <number>', 'Your estimated probability (0-1)')
  .requiredOption('-P, --price <number>', 'Market price/odds (0-1)')
  .action((options) => {
    try {
      const prob = parseFloat(options.prob);
      const price = parseFloat(options.price);

      console.log(chalk.cyan('\n=== Expected Value Calculation ===\n'));
      console.log(chalk.gray(`Your Probability: ${chalk.white((prob * 100).toFixed(1) + '%')}`));
      console.log(chalk.gray(`Market Price: ${chalk.white((price * 100).toFixed(1) + '%')}`));
      console.log();

      const results = calculateEV(prob, price);

      if (results.isPositive) {
        console.log(chalk.green(`✓ Expected Value: +${results.evPercent.toFixed(2)}%`));
      } else {
        console.log(chalk.red(`✗ Expected Value: ${results.evPercent.toFixed(2)}%`));
      }

      console.log(chalk.gray(`Edge over market: ${(results.edge * 100).toFixed(2)}%`));

      if (results.isPositive) {
        console.log(chalk.green('\n✓ This is a positive EV bet!'));
      } else {
        console.log(chalk.red('\n✗ This is a negative EV bet. Not recommended.'));
      }
      console.log();
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Kelly command
program
  .command('kelly')
  .description('Calculate Kelly Criterion for optimal bet sizing')
  .requiredOption('-p, --prob <number>', 'Your estimated probability (0-1)')
  .requiredOption('-P, --price <number>', 'Market price/odds (0-1)')
  .option('-b, --bankroll <number>', 'Your total bankroll')
  .action((options) => {
    try {
      const prob = parseFloat(options.prob);
      const price = parseFloat(options.price);
      const bankroll = options.bankroll ? parseFloat(options.bankroll) : null;

      console.log(chalk.cyan('\n=== Kelly Criterion Calculation ===\n'));
      console.log(chalk.gray(`Your Probability: ${chalk.white((prob * 100).toFixed(1) + '%')}`));
      console.log(chalk.gray(`Market Price: ${chalk.white((price * 100).toFixed(1) + '%')}`));
      if (bankroll) {
        console.log(chalk.gray(`Bankroll: ${chalk.white('$' + bankroll.toFixed(2))}`));
      }
      console.log();

      const results = calculateKelly(prob, price, bankroll);

      // Show EV first
      if (results.evPercent > 0) {
        console.log(chalk.green(`✓ Expected Value: +${results.evPercent.toFixed(2)}%`));
      } else {
        console.log(chalk.red(`✗ Expected Value: ${results.evPercent.toFixed(2)}%`));
      }

      console.log(chalk.gray(`Edge over market: ${(results.edge * 100).toFixed(2)}%`));
      console.log();

      // Show Kelly percentage
      if (results.kellyPercent > 0) {
        console.log(chalk.green(`✓ Kelly Criterion: ${results.kellyPercent.toFixed(2)}%`));

        if (bankroll) {
          console.log(chalk.yellow(`\n→ Suggested bet size: $${results.suggestedBet.toFixed(2)}`));
          console.log(chalk.gray(`  (${results.kellyPercent.toFixed(2)}% of your $${bankroll} bankroll)`));
        } else {
          console.log(chalk.gray(`\nTip: Add --bankroll flag to see suggested bet size`));
        }
      } else {
        console.log(chalk.red(`✗ Kelly Criterion: ${results.kellyPercent.toFixed(2)}%`));
        console.log(chalk.red('\n⚠ No positive edge. Kelly suggests not betting.'));
      }

      console.log();

      // Show fractional Kelly recommendation
      if (results.kellyPercent > 0) {
        console.log(chalk.gray('💡 Consider using fractional Kelly (e.g., 50% of Kelly) for more conservative sizing.'));
      }
      console.log();

    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Interactive mode (no command specified)
async function interactiveMode() {
  console.log(chalk.cyan('\n=== Edge Calculator - Interactive Mode ===\n'));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'What would you like to calculate?',
      choices: [
        { name: 'Expected Value (EV)', value: 'ev' },
        { name: 'Kelly Criterion (optimal bet sizing)', value: 'kelly' }
      ]
    },
    {
      type: 'input',
      name: 'prob',
      message: 'Your estimated probability (0-1 or 0-100%):',
      validate: (input) => {
        const num = parseFloat(input);
        if (isNaN(num)) return 'Please enter a valid number';
        if (num > 1) {
          // Assume they meant percentage
          const converted = num / 100;
          if (converted <= 0 || converted >= 1) return 'Probability must be between 0 and 1 (or 0% and 100%)';
        } else {
          if (num <= 0 || num >= 1) return 'Probability must be between 0 and 1 (or 0% and 100%)';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'price',
      message: 'Market price/odds (0-1 or 0-100%):',
      validate: (input) => {
        const num = parseFloat(input);
        if (isNaN(num)) return 'Please enter a valid number';
        if (num > 1) {
          const converted = num / 100;
          if (converted <= 0 || converted >= 1) return 'Price must be between 0 and 1 (or 0% and 100%)';
        } else {
          if (num <= 0 || num >= 1) return 'Price must be between 0 and 1 (or 0% and 100%)';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'bankroll',
      message: 'Your bankroll (optional, press enter to skip):',
      when: (answers) => answers.mode === 'kelly',
      validate: (input) => {
        if (input === '') return true;
        const num = parseFloat(input);
        if (isNaN(num)) return 'Please enter a valid number or leave blank';
        if (num <= 0) return 'Bankroll must be positive';
        return true;
      }
    }
  ]);

  // Convert percentages to decimals if needed
  let prob = parseFloat(answers.prob);
  if (prob > 1) prob = prob / 100;

  let price = parseFloat(answers.price);
  if (price > 1) price = price / 100;

  const bankroll = answers.bankroll ? parseFloat(answers.bankroll) : null;

  try {
    console.log();

    if (answers.mode === 'ev') {
      const results = calculateEV(prob, price);

      console.log(chalk.gray(`Your Probability: ${chalk.white((prob * 100).toFixed(1) + '%')}`));
      console.log(chalk.gray(`Market Price: ${chalk.white((price * 100).toFixed(1) + '%')}`));
      console.log();

      if (results.isPositive) {
        console.log(chalk.green(`✓ Expected Value: +${results.evPercent.toFixed(2)}%`));
      } else {
        console.log(chalk.red(`✗ Expected Value: ${results.evPercent.toFixed(2)}%`));
      }

      console.log(chalk.gray(`Edge over market: ${(results.edge * 100).toFixed(2)}%`));

      if (results.isPositive) {
        console.log(chalk.green('\n✓ This is a positive EV bet!'));
      } else {
        console.log(chalk.red('\n✗ This is a negative EV bet. Not recommended.'));
      }
    } else {
      const results = calculateKelly(prob, price, bankroll);

      console.log(chalk.gray(`Your Probability: ${chalk.white((prob * 100).toFixed(1) + '%')}`));
      console.log(chalk.gray(`Market Price: ${chalk.white((price * 100).toFixed(1) + '%')}`));
      if (bankroll) {
        console.log(chalk.gray(`Bankroll: ${chalk.white('$' + bankroll.toFixed(2))}`));
      }
      console.log();

      if (results.evPercent > 0) {
        console.log(chalk.green(`✓ Expected Value: +${results.evPercent.toFixed(2)}%`));
      } else {
        console.log(chalk.red(`✗ Expected Value: ${results.evPercent.toFixed(2)}%`));
      }

      console.log(chalk.gray(`Edge over market: ${(results.edge * 100).toFixed(2)}%`));
      console.log();

      if (results.kellyPercent > 0) {
        console.log(chalk.green(`✓ Kelly Criterion: ${results.kellyPercent.toFixed(2)}%`));

        if (bankroll) {
          console.log(chalk.yellow(`\n→ Suggested bet size: $${results.suggestedBet.toFixed(2)}`));
          console.log(chalk.gray(`  (${results.kellyPercent.toFixed(2)}% of your $${bankroll} bankroll)`));
        }
      } else {
        console.log(chalk.red(`✗ Kelly Criterion: ${results.kellyPercent.toFixed(2)}%`));
        console.log(chalk.red('\n⚠ No positive edge. Kelly suggests not betting.'));
      }

      if (results.kellyPercent > 0) {
        console.log(chalk.gray('\n💡 Consider using fractional Kelly (e.g., 50% of Kelly) for more conservative sizing.'));
      }
    }

    console.log();
  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

// Parse arguments
program.parse();

// If no command was provided, run interactive mode
if (!process.argv.slice(2).length) {
  interactiveMode();
}
