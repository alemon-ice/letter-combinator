import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Word, WordDocument } from './schemas/word.schema';

@Injectable()
export class WordService {
  constructor(@InjectModel(Word.name) private wordModel: Model<WordDocument>) {}
  saveWords(words: string[]) {
    const createdWords = words.map(
      (word) => new this.wordModel({ word: word.toLowerCase() }),
    );
    return this.wordModel.insertMany(createdWords);
  }
  getAll() {
    return this.wordModel.find().exec();
  }
  findWord(word: string) {
    return this.wordModel.findOne({ word }).exec();
  }
  deleteWord(word: string) {
    const findWord = this.findWord(word);

    if (!findWord) {
      return {
        message: 'Palavra não encontrada.',
      };
    }

    return this.wordModel.deleteMany({ word });
  }
}
