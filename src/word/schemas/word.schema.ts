import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WordDocument = Word & Document;

@Schema()
export class Word {
  @Prop({ required: true })
  word: string;
}

export const WordSchema = SchemaFactory.createForClass(Word);
