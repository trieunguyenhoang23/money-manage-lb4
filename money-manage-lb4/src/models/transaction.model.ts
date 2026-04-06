import {belongsTo, Entity, model, property} from '@loopback/repository';
import {TransactionType} from '../domain/enums/transaction-type.enum';
import { Category } from './category.model';

@model({settings: {strict: false}})
export class Transaction extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(TransactionType),
    },
  })
  type: TransactionType;

  @property({
    type: 'number',
    required: true,
  })
  amount: number;

  @property({
    type: 'string',
    required: false,
  })
  note: string;

  @property({
    type: 'string',
    required: false,
  })
  image_description: string;

  @property({
    type: 'date',
    required: true,
  })
  transaction_at: string;

  @property({
    type: 'date',
    required: true,
  })
  created_at: string;

  @property({
    type: 'date',
    required: false,
  })
  updated_at: string;

  @property({
    type: 'string',
    required: true,
  })
  user_id: string;

  @belongsTo(() => Category, {name: 'category'})
  category_id: string;

  @property({
    type: 'string',
  })
  reminder_id?: string;

  @property({
    type: 'boolean',
  })
  is_deleted?: boolean

  // Define well-known properties here
  
  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Transaction>) {
    super(data);
  }
}

export interface TransactionRelations {
  // describe navigational properties here
}

export type TransactionWithRelations = Transaction & TransactionRelations;
