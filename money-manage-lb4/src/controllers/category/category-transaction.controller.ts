import * as repo from '@loopback/repository';
import * as rest from '@loopback/rest';
import {Category, Transaction} from '../../models';
import {CategoryRepository} from '../../repositories';

export class CategoryTransactionController {
  constructor(
    @repo.repository(CategoryRepository)
    protected categoryRepository: CategoryRepository,
  ) {}

  @rest.get('/categories/{id}/transactions', {
    responses: {
      '200': {
        description: 'Array of Category has many Transaction',
        content: {
          'application/json': {
            schema: {type: 'array', items: rest.getModelSchemaRef(Transaction)},
          },
        },
      },
    },
  })
  async find(
    @rest.param.path.string('id') id: string,
    @rest.param.query.object('filter') filter?: repo.Filter<Transaction>,
  ): Promise<Transaction[]> {
    return this.categoryRepository.transactions(id).find(filter);
  }

  @rest.post('/categories/{id}/transactions', {
    responses: {
      '200': {
        description: 'Category model instance',
        content: {
          'application/json': {schema: rest.getModelSchemaRef(Transaction)},
        },
      },
    },
  })
  async create(
    @rest.param.path.string('id') id: typeof Category.prototype.id,
    @rest.requestBody({
      content: {
        'application/json': {
          schema: rest.getModelSchemaRef(Transaction, {
            title: 'NewTransactionInCategory',
            exclude: ['id'],
            optional: ['category_id'],
          }),
        },
      },
    })
    transaction: Omit<Transaction, 'id'>,
  ): Promise<Transaction> {
    return this.categoryRepository.transactions(id).create(transaction);
  }

  @rest.patch('/categories/{id}/transactions', {
    responses: {
      '200': {
        description: 'Category.Transaction PATCH success count',
        content: {'application/json': {schema: repo.CountSchema}},
      },
    },
  })
  async patch(
    @rest.param.path.string('id') id: string,
    @rest.requestBody({
      content: {
        'application/json': {
          schema: rest.getModelSchemaRef(Transaction, {partial: true}),
        },
      },
    })
    transaction: Partial<Transaction>,
    @rest.param.query.object('where', rest.getWhereSchemaFor(Transaction))
    where?: repo.Where<Transaction>,
  ): Promise<repo.Count> {
    return this.categoryRepository.transactions(id).patch(transaction, where);
  }

  @rest.del('/categories/{id}/transactions', {
    responses: {
      '200': {
        description: 'Category.Transaction DELETE success count',
        content: {'application/json': {schema: repo.CountSchema}},
      },
    },
  })
  async delete(
    @rest.param.path.string('id') id: string,
    @rest.param.query.object('where', rest.getWhereSchemaFor(Transaction))
    where?: repo.Where<Transaction>,
  ): Promise<repo.Count> {
    return this.categoryRepository.transactions(id).delete(where);
  }
}
