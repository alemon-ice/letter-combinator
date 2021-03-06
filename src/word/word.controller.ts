import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ISearchWordDto } from './dtos/word.dto';
import { WordService } from './word.service';

@Controller('word')
export class WordController {
  constructor(private wordService: WordService) {}

  @Post()
  saveWords(@Body() { words }: { words: string }) {
    return this.wordService.saveWords(words);
  }

  @Get()
  getAll() {
    return this.wordService.getAll();
  }

  @Delete(':word')
  deleteWord(@Param() { word }: { word: string }) {
    return this.wordService.deleteWord(word.toLowerCase());
  }

  @Post('/search-words')
  searchAnagrams(@Body() { letters, lengths }: ISearchWordDto) {
    return this.wordService.searchForAnagrams({ letters, lengths });
  }
}
