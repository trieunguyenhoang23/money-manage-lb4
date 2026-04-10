import * as repo from '@loopback/repository';
import * as rest from '@loopback/rest';
import * as Model from '../../models';
import * as Repository from '../../repositories';
import * as CustomRequestBody from '../../utils/custom-request-body';
import * as CustomResponseSchema from '../../utils/custom-response-schema';
import {BaseController} from '../base.controller';

export class ReminderController extends BaseController {
  constructor(
    //* Repository
    @repo.repository(Repository.ReminderRepository)
    public reminderRepository: Repository.ReminderRepository,
  ) {
    super();
  }

  //* -------------------------------------------- GET --------------------------------------------
  @rest.get('get/reminders/count')
  @rest.response(
    200,
    CustomResponseSchema.getCustomCountResponseSchema('Reminder model count'),
  )
  async count(
    @rest.param.where(Model.Reminder) where?: repo.Where<Model.Reminder>,
  ): Promise<repo.Count> {
    return this.reminderRepository.count(where);
  }

  @rest.get('get/reminders')
  @rest.response(
    200,
    CustomResponseSchema.getCustomModelResponseSchema(
      Model.Reminder,
      'Array of Reminder model instances',
      true,
      true,
    ),
  )
  async find(
    @rest.param.filter(Model.Reminder) filter?: repo.Filter<Model.Reminder>,
  ): Promise<Model.Reminder[]> {
    return this.reminderRepository.find(filter);
  }

  @rest.get('get/reminders/{id}')
  @rest.response(
    200,
    CustomResponseSchema.getCustomModelResponseSchema(
      Model.Reminder,
      'Reminder model instance',
      false,
      true,
    ),
  )
  async findById(
    @rest.param.path.string('id') id: string,
    @rest.param.filter(Model.Reminder, {exclude: 'where'})
    filter?: repo.FilterExcludingWhere<Model.Reminder>,
  ): Promise<Model.Reminder> {
    return this.reminderRepository.findById(id, filter);
  }
  //* -------------------------------------------- END GET ---------------------------------------------

  //Todo: ----------------------------------------- POST -----------------------------------------------
  @rest.post('post/reminders')
  @rest.response(
    200,
    CustomResponseSchema.getCustomModelResponseSchema(
      Model.Reminder,
      'Reminder model instance',
    ),
  )
  async create(
    @CustomRequestBody.getCustomRequestBody(Model.Reminder, {
      title: 'NewReminder',
      exclude: ['id'],
    })
    reminder: Omit<Model.Reminder, 'id'>,
  ): Promise<Model.Reminder> {
    return this.reminderRepository.create(reminder);
  }
  //Todo: -------------------------------------------- END POST --------------------------------------------

  //? ------------------------------------------------- PATCH -------------------------------------------------
  @rest.patch('patch/reminders/{id}')
  @rest.response(204, {
    description: 'Reminder PATCH success',
  })
  async updateById(
    @rest.param.path.string('id') id: string,
    @CustomRequestBody.getCustomRequestBody(Model.Reminder, {partial: true})
    reminder: Model.Reminder,
  ): Promise<void> {
    await this.reminderRepository.updateById(id, reminder);
  }

  @rest.patch('patch/reminders')
  @rest.response(
    200,
    CustomResponseSchema.getCustomCountResponseSchema(
      'Reminder PATCH success count',
    ),
  )
  async updateAll(
    @CustomRequestBody.getCustomRequestBody(Model.Reminder, {partial: true})
    reminder: Model.Reminder,
    @rest.param.where(Model.Reminder) where?: repo.Where<Model.Reminder>,
  ): Promise<repo.Count> {
    return this.reminderRepository.updateAll(reminder, where);
  }
  //? ------------------------------------------------- END PATCH -------------------------------------------------

  //! -------------------------------------------------- DELETE ---------------------------------------------------
  @rest.del('delete/reminders/{id}')
  @rest.response(204, {
    description: 'Reminder DELETE success',
  })
  async deleteById(@rest.param.path.string('id') id: string): Promise<void> {
    await this.reminderRepository.deleteById(id);
  }
  //! ----------------------------------------------- END DELETE ---------------------------------------------------
}
