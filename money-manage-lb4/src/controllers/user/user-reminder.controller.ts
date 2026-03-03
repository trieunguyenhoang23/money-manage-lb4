import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  User,
  Reminder,
} from '../../models';
import {UserRepository} from '../../repositories';

export class UserReminderController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/reminders', {
    responses: {
      '200': {
        description: 'Array of User has many Reminder',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Reminder)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Reminder>,
  ): Promise<Reminder[]> {
    return this.userRepository.reminders(id).find(filter);
  }

  @post('/users/{id}/reminders', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Reminder)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reminder, {
            title: 'NewReminderInUser',
            exclude: ['id'],
            optional: ['user_id']
          }),
        },
      },
    }) reminder: Omit<Reminder, 'id'>,
  ): Promise<Reminder> {
    return this.userRepository.reminders(id).create(reminder);
  }

  @patch('/users/{id}/reminders', {
    responses: {
      '200': {
        description: 'User.Reminder PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reminder, {partial: true}),
        },
      },
    })
    reminder: Partial<Reminder>,
    @param.query.object('where', getWhereSchemaFor(Reminder)) where?: Where<Reminder>,
  ): Promise<Count> {
    return this.userRepository.reminders(id).patch(reminder, where);
  }

  @del('/users/{id}/reminders', {
    responses: {
      '200': {
        description: 'User.Reminder DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Reminder)) where?: Where<Reminder>,
  ): Promise<Count> {
    return this.userRepository.reminders(id).delete(where);
  }
}
