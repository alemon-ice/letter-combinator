import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WordModule } from './word/word.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://docker:mongopw@localhost:55000'),
    WordModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
