import {Entity, model, property, hasMany} from '@loopback/repository';
import {Category, CategoryWithRelations} from './category.model';
import {AuthProvider, AuthProviderWithRelations} from './auth-provider.model';
import {Reminder, ReminderWithRelations} from './reminder.model';
import {Transaction, TransactionWithRelations} from './transaction.model';

@model({settings: {strict: false}})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    unique: true,
  })
  primary_email: string;

  @property({
    type: 'string',
    required: true,
  })
  display_name: string;

  @property({
    type: 'string',
    required: true,
  })
  avatar_url: string;

  @property({
    type: 'date',
    required: true,
  })
  created_at: string;

  @property({
    type: 'string',
    required: true,
  })
  currency: string;

  @hasMany(() => Category, {keyTo: 'user_id'})
  categories: Category[];

  @hasMany(() => AuthProvider, {keyTo: 'user_id'})
  authProviders: AuthProvider[];

  @hasMany(() => Reminder, {keyTo: 'user_id'})
  reminders: Reminder[];

  @hasMany(() => Transaction, {keyTo: 'user_id'})
  transactions: Transaction[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
  categories: CategoryWithRelations[];
  authProviders: AuthProviderWithRelations[];
  reminders: ReminderWithRelations[];
  transactions: TransactionWithRelations[];
}

export type UserWithRelations = User & UserRelations;
