import {Entity, model, property, hasMany} from '@loopback/repository';
import {Frequency} from '../domain/enums/frequency.enum';
import {Transaction, TransactionWithRelations} from './transaction.model';

@model({settings: {strict: false}})
export class Reminder extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'number',
    required: true,
  })
  amount: number;

  @property({
    type: 'string',
    required: true,
  })
  currency: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(Frequency),
    },
  })
  frequency: Frequency;

  @property({
    type: 'number',
    required: true,
  })
  interval_value: number;

  @property({
    type: 'date',
    required: true,
  })
  next_run_at: string;

  @property({
    type: 'date',
    required: true,
  })
  last_run_at: string;

  @property({
    type: 'number',
  })
  day_of_month?: number;

  @property({
    type: 'number',
  })
  day_of_week?: number;

  @property({
    type: 'date',
    required: true,
  })
  start_date: string;

  @property({
    type: 'date',
    required: true,
  })
  end_date: string;

  @property({
    type: 'string',
    required: true,
  })
  timezone: string;

  @property({
    type: 'boolean',
    required: true,
  })
  is_active: boolean;

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

  @property({
    type: 'string',
    required: true,
  })
  category_id: string;

  @hasMany(() => Transaction, {keyTo: 'reminder_id'})
  transactions: Transaction[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Reminder>) {
    super(data);
  }
}

export interface ReminderRelations {
  // describe navigational properties here
  transactions: TransactionWithRelations[];
}

export type ReminderWithRelations = Reminder & ReminderRelations;
