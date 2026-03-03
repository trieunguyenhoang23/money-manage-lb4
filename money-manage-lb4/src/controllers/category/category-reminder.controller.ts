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
  Category,
  Reminder,
} from '../../models';
import {CategoryRepository} from '../../repositories';

export class CategoryReminderController {
  constructor(
    @repository(CategoryRepository) protected categoryRepository: CategoryRepository,
  ) { }

  @get('/categories/{id}/reminders', {
    responses: {
      '200': {
        description: 'Array of Category has many Reminder',
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
    return this.categoryRepository.reminders(id).find(filter);
  }

  @post('/categories/{id}/reminders', {
    responses: {
      '200': {
        description: 'Category model instance',
        content: {'application/json': {schema: getModelSchemaRef(Reminder)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Category.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reminder, {
            title: 'NewReminderInCategory',
            exclude: ['id'],
            optional: ['category_id']
          }),
        },
      },
    }) reminder: Omit<Reminder, 'id'>,
  ): Promise<Reminder> {
    return this.categoryRepository.reminders(id).create(reminder);
  }

  @patch('/categories/{id}/reminders', {
    responses: {
      '200': {
        description: 'Category.Reminder PATCH success count',
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
    return this.categoryRepository.reminders(id).patch(reminder, where);
  }

  @del('/categories/{id}/reminders', {
    responses: {
      '200': {
        description: 'Category.Reminder DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Reminder)) where?: Where<Reminder>,
  ): Promise<Count> {
    return this.categoryRepository.reminders(id).delete(where);
  }
}
