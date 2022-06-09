import { ISearchWordDto } from '../dtos/word.dto';
import { sortWords } from './sort';

export class Shuffle {
  private letters: string[] = [];
  private lengths: number[] = [];
  private combinations: string[] = [];

  private shuffle() {
    const word = [...this.letters];
    const wordLength = word.length;

    do {
      for (let i = wordLength - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = word[i];
        word[i] = word[j];
        word[j] = tmp;
      }
    } while (!!this.combinations.includes(word.join('')));

    this.combinations.push(word.join(''));
  }

  private generateCombinations() {
    const countLetters = this.letters.length;

    let totalCombinations = 0;

    for (let i = 1; i < countLetters; i++) {
      totalCombinations += countLetters * (countLetters - i);
    }

    for (let i = 0; i < totalCombinations; i++) {
      this.shuffle();
    }

    this.combinations.forEach((combination) => {
      const combinationLength = combination.length;
      if (combinationLength > 3) {
        for (let i = 1; i <= combinationLength - 3; i++) {
          const newCombination = combination.slice(0, combinationLength - i);
          if (
            !this.lengths.length ||
            (!!this.lengths.length &&
              this.lengths.includes(newCombination.length))
          ) {
            this.combinations.push(newCombination);
          }
        }
      }
    });
  }

  private removeDuplicated(combinations: string[]) {
    const combinationsSet = new Set<string>([]);
    combinations.forEach((combination) => combinationsSet.add(combination));
    return combinationsSet;
  }

  public get getCombinations() {
    return this.removeDuplicated(this.combinations.sort(sortWords));
  }

  constructor({ letters, lengths }: ISearchWordDto) {
    this.letters = letters;
    this.lengths = lengths;
    this.generateCombinations();
  }
}
