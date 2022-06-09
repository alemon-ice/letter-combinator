import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import fetch from 'node-fetch';
import { ISearchWordDto } from './dtos/word.dto';
import { Word, WordDocument } from './schemas/word.schema';
import { Shuffle } from './util/shuffle';
import { sortWords } from './util/sort';

@Injectable()
export class WordService {
  constructor(@InjectModel(Word.name) private wordModel: Model<WordDocument>) {}
  private readonly logger = new Logger();
  async saveWords(words: string) {
    const splittedWords = words.split(' ');

    const { data: allSavedWords } = await this.getAll();

    const wordsToSave = splittedWords.filter(
      (word) => !allSavedWords.includes(word),
    );

    const createdWords = wordsToSave.map(
      (word) => new this.wordModel({ word: word.toLowerCase() }),
    );
    return await this.wordModel.insertMany(createdWords);
  }
  async getAll() {
    const allWordsDocs = await this.wordModel.find().exec();

    const allWords: string[] = allWordsDocs.map(({ word }) => word);

    return {
      totalItems: allWords.length,
      data: allWords.sort(sortWords),
    };
  }
  async deleteWord(word: string) {
    const findWord = await this.findWord(word);

    if (!findWord) {
      return {
        message: 'Palavra não encontrada.',
      };
    }

    return await this.wordModel.deleteMany({ word });
  }
  async searchForAnagrams({ letters, lengths }: ISearchWordDto) {
    const schuffle = new Shuffle({ letters, lengths });

    const anagrams: string[] = [];
    schuffle.getCombinations.forEach((combination) =>
      anagrams.push(combination),
    );

    this.logger.log(
      `[SearchForAnagrams] ${anagrams.length} Anagrams: ${anagrams}`,
    );

    const { data: words } = await this.getAll();

    const registeredWords = words.filter(
      (word) =>
        anagrams.includes(word) ||
        anagrams.some((anagram) => anagram.indexOf(word) !== -1),
    );

    this.logger.log(
      `[SearchForAnagrams] ${registeredWords.length} Registered Words: ${registeredWords}`,
    );

    const unregisteredWords = anagrams.filter(
      (anagram) => !registeredWords.includes(anagram),
    );

    this.logger.log(
      `[SearchForAnagrams] ${unregisteredWords.length} Unregistered Words: ${unregisteredWords}`,
    );

    const searchWordPromise = unregisteredWords.map((word) =>
      Promise.resolve(this.searchIntoDicio(word)),
    );
    const searchIntoDicioResults: Array<boolean> = await Promise.all(
      searchWordPromise,
    );

    const withMeaning = [];

    const meaningless = [];

    unregisteredWords.forEach((word, i) => {
      if (searchIntoDicioResults[i]) {
        withMeaning.push(word);
      } else {
        meaningless.push(word);
      }
    });

    this.logger.log(
      `[SearchForAnagrams] ${withMeaning.length} With Meaning: ${withMeaning}`,
    );

    this.logger.log(
      `[SearchForAnagrams] ${meaningless.length} Meaningless: ${meaningless}`,
    );

    return {
      totalItems: unregisteredWords.length + registeredWords.length,
      data: {
        registeredWords,
        unregisteredWords: {
          withMeaning,
          meaningless,
        },
      },
    };
  }
  private async findWord(word: string) {
    return await this.wordModel.findOne({ word }).exec();
  }
  private async searchIntoDicio(word: string): Promise<boolean> {
    try {
      const res = await fetch(`https://significado.herokuapp.com/v2/${word}`);
      const data = await res.json();
      return Array.isArray(data) && data[0].meanings.length;
    } catch (err) {
      this.logger.error(
        `[SearchIntoDicio] ERROR: `,
        JSON.stringify(err, null, 2),
      );
      return false;
    }
  }
}
