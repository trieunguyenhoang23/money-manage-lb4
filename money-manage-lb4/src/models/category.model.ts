import {Entity, model, property, hasMany} from '@loopback/repository';
import {TransactionType} from '../domain/enums/transaction-type.enum';
import {Reminder, ReminderWithRelations} from './reminder.model';
import {Transaction, TransactionWithRelations} from './transaction.model';

@model({settings: {strict: false}})
export class Category extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(TransactionType),
    },
  })
  type: TransactionType;

  @property({
    type: 'date',
    required: true,
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
  })
  updated_at: string;

  @property({
    type: 'string',
    required: true,
  })
  user_id: string;

  @hasMany(() => Reminder, {keyTo: 'category_id'})
  reminders: Reminder[];

  @hasMany(() => Transaction, {keyTo: 'category_id'})
  transactions: Transaction[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {
  // describe navigational properties here
  reminders: ReminderWithRelations[];
  transactions: TransactionWithRelations[];
}

export type CategoryWithRelations = Category & CategoryRelations;
