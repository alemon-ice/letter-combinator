import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import fetch from 'node-fetch';
import { Word, WordDocument } from './schemas/word.schema';
import { Shuffle } from './util/shuffle';

@Injectable()
export class WordService {
  constructor(@InjectModel(Word.name) private wordModel: Model<WordDocument>) {}
  private readonly logger = new Logger();
  async saveWords(words: string[]) {
    const createdWords = words.map(
      (word) => new this.wordModel({ word: word.toLowerCase() }),
    );
    return await this.wordModel.insertMany(createdWords);
  }
  async getAll() {
    const allWords = await this.wordModel.find().exec();

    return allWords.map(({ word }) => word);
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
  async searchForAnagrams(letters: string[]) {
    const schuffle = new Shuffle(letters);

    const anagrams = schuffle.getCombinations;

    this.logger.log(
      `[SearchForAnagrams] ${anagrams.length} Anagrams: ${anagrams}`,
    );

    const words = await this.getAll();

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

    // const searchWordPromise = unregisteredWords.map((word) =>
    //   Promise.resolve(this.searchIntoDicio(word)),
    // );
    // const searchIntoDicioResults: Array<boolean> = await Promise.all(
    //   searchWordPromise,
    // );

    const withMeaning = [];

    const meaningless = [];

    // unregisteredWords.forEach((word, i) => {
    //   if (searchIntoDicioResults[i]) {
    //     withMeaning.push(word);
    //   } else {
    //     meaningless.push(word);
    //   }
    // });

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
        unregisteredWords,
        // unregisteredWords: {
        //   withMeaning,
        //   meaningless,
        // },
      },
    };
  }
  private async findWord(word: string) {
    return await this.wordModel.findOne({ word }).exec();
  }
  private async searchIntoDicio(word: string): Promise<boolean> {
    const res = await fetch(`https://significado.herokuapp.com/v2/${word}`);
    const data = await res.json();

    return Array.isArray(data);
  }
}
