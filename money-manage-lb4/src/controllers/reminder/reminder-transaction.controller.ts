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
import {Reminder, Transaction} from '../../models';
import {ReminderRepository} from '../../repositories';

export class ReminderTransactionController {
  constructor(
    @repository(ReminderRepository)
    protected reminderRepository: ReminderRepository,
  ) {}

  @get('/reminders/{id}/transactions', {
    responses: {
      '200': {
        description: 'Array of Reminder has many Transaction',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Transaction)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Transaction>,
  ): Promise<Transaction[]> {
    return this.reminderRepository.transactions(id).find(filter);
  }

  @post('/reminders/{id}/transactions', {
    responses: {
      '200': {
        description: 'Reminder model instance',
        content: {'application/json': {schema: getModelSchemaRef(Transaction)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Reminder.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transaction, {
            title: 'NewTransactionInReminder',
            exclude: ['id'],
            optional: ['reminder_id'],
          }),
        },
      },
    })
    transaction: Omit<Transaction, 'id'>,
  ): Promise<Transaction> {
    return this.reminderRepository.transactions(id).create(transaction);
  }

  @patch('/reminders/{id}/transactions', {
    responses: {
      '200': {
        description: 'Reminder.Transaction PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transaction, {partial: true}),
        },
      },
    })
    transaction: Partial<Transaction>,
    @param.query.object('where', getWhereSchemaFor(Transaction))
    where?: Where<Transaction>,
  ): Promise<Count> {
    return this.reminderRepository.transactions(id).patch(transaction, where);
  }

  @del('/reminders/{id}/transactions', {
    responses: {
      '200': {
        description: 'Reminder.Transaction DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Transaction))
    where?: Where<Transaction>,
  ): Promise<Count> {
    return this.reminderRepository.transactions(id).delete(where);
  }
}
