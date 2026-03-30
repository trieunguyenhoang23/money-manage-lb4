import * as repo from '@loopback/repository';
import * as rest from '@loopback/rest';
import {Reminder} from '../../models';
import {ReminderRepository} from '../../repositories';
import {authenticate} from '@loopback/authentication';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {UpdateTransactionUseCase} from '../../domain/usecase/transaction/update_transaction.usecase';
import {getCustomRequestBody} from '../utils/custom-request-body';
import {
  getCustomCountResponseSchema,
  getCustomModelResponseSchema,
} from '../utils/custom-response-schema';

export class ReminderController {
  constructor(
    @repo.repository(ReminderRepository)
    public reminderRepository: ReminderRepository,
  ) {}

  //* GET
  @rest.get('get/reminders/count')
  @rest.response(200, getCustomCountResponseSchema('Reminder model count'))
  async count(
    @rest.param.where(Reminder) where?: repo.Where<Reminder>,
  ): Promise<repo.Count> {
    return this.reminderRepository.count(where);
  }

  @rest.get('get/reminders')
  @rest.response(
    200,
    getCustomModelResponseSchema(
      Reminder,
      'Array of Reminder model instances',
      true,
      true,
    ),
  )
  async find(
    @rest.param.filter(Reminder) filter?: repo.Filter<Reminder>,
  ): Promise<Reminder[]> {
    return this.reminderRepository.find(filter);
  }

  @rest.get('get/reminders/{id}')
  @rest.response(
    200,
    getCustomModelResponseSchema(
      Reminder,
      'Reminder model instance',
      false,
      true,
    ),
  )
  async findById(
    @rest.param.path.string('id') id: string,
    @rest.param.filter(Reminder, {exclude: 'where'})
    filter?: repo.FilterExcludingWhere<Reminder>,
  ): Promise<Reminder> {
    return this.reminderRepository.findById(id, filter);
  }

  //Todo: POST
  @rest.post('post/reminders')
  @rest.response(
    200,
    getCustomModelResponseSchema(Reminder, 'Reminder model instance'),
  )
  async create(
    @getCustomRequestBody(Reminder, {
      title: 'NewReminder',
      exclude: ['id'],
    })
    reminder: Omit<Reminder, 'id'>,
  ): Promise<Reminder> {
    return this.reminderRepository.create(reminder);
  }

  //? PATCH
  @rest.patch('patch/reminders/{id}')
  @rest.response(204, {
    description: 'Reminder PATCH success',
  })
  async updateById(
    @rest.param.path.string('id') id: string,
    @getCustomRequestBody(Reminder, {partial: true})
    reminder: Reminder,
  ): Promise<void> {
    await this.reminderRepository.updateById(id, reminder);
  }

  @rest.patch('patch/reminders')
  @rest.response(
    200,
    getCustomCountResponseSchema('Reminder PATCH success count'),
  )
  async updateAll(
    @getCustomRequestBody(Reminder, {partial: true})
    reminder: Reminder,
    @rest.param.where(Reminder) where?: repo.Where<Reminder>,
  ): Promise<repo.Count> {
    return this.reminderRepository.updateAll(reminder, where);
  }

  //Todo: PUT
  @rest.put('put/reminders/{id}')
  @rest.response(204, {
    description: 'Reminder PUT success',
  })
  async replaceById(
    @rest.param.path.string('id') id: string,
    @rest.requestBody() reminder: Reminder,
  ): Promise<void> {
    await this.reminderRepository.replaceById(id, reminder);
  }

  //! DELETE
  @rest.del('delete/reminders/{id}')
  @rest.response(204, {
    description: 'Reminder DELETE success',
  })
  async deleteById(@rest.param.path.string('id') id: string): Promise<void> {
    await this.reminderRepository.deleteById(id);
  }
}
