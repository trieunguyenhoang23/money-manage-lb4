import {getModelSchemaRef} from '@loopback/rest';
import {CountSchema} from '@loopback/repository';
import {SchemaObject} from '@loopback/openapi-v3';

export function getCustomModelResponseSchema(
  model: any,
  description: string,
  isArray: boolean = false,
  isIncludeRelations?: boolean,
  excludeFields: string[] = [],
) {
  const includeRelations =
    isIncludeRelations !== undefined ? isIncludeRelations : false;

  const schema: SchemaObject = isArray
    ? {
        type: 'array',
        items: getModelSchemaRef(model, {
          exclude: excludeFields,
          includeRelations: includeRelations,
        }),
      }
    : getModelSchemaRef(model, {
        exclude: excludeFields,
        includeRelations: includeRelations,
      });

  return {
    description: description,
    content: {
      'application/json': {
        schema: schema,
      },
    },
  };
}

export function getCustomCountResponseSchema(description: string) {
  return {
    description: description,
    content: {'application/json': {schema: CountSchema}},
  };
}
