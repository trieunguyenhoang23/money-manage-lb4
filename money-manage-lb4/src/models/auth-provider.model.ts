import {Entity, model, property} from '@loopback/repository';
import {ProviderType} from '../domain/enums/provider_type.enum';

@model({settings: {strict: false}})
export class AuthProvider extends Entity {
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
  provider_user_id: string;

  @property({
    type: 'string',
    required: true,
    unique: true,
  })
  provider_email: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(ProviderType),
    },
  })
  provider_type: ProviderType;

  @property({
    type: 'date',
    required: true,
  })
  created_at: string;

  @property({
    type: 'string',
    required: true,
  })
  user_id: string;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<AuthProvider>) {
    super(data);
  }
}

export interface AuthProviderRelations {
  // describe navigational properties here
}

export type AuthProviderWithRelations = AuthProvider & AuthProviderRelations;
