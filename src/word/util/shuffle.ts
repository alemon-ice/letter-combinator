export class Shuffle {
  private letters: string[] = [];
  private combinations: string[] = [];

  private shuffle() {
    const word = [...this.letters];
    const wordLength = word.length;

    let totalAttempts = 0;

    do {
      totalAttempts += 1;
      for (let i = wordLength - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = word[i];
        word[i] = word[j];
        word[j] = tmp;
      }
    } while (
      !!this.combinations.includes(word.join('')) &&
      totalAttempts <= 10
    );

    totalAttempts <= 10 && this.combinations.push(word.join(''));
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
  }

  private sortWords(a: string, b: string) {
    return a < b ? -1 : 1;
  }

  public get getCombinations() {
    return this.combinations.sort(this.sortWords);
  }

  constructor(letters: string[]) {
    this.letters = letters;
    this.generateCombinations();
  }
}
