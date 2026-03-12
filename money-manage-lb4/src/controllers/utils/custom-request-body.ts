import {
  requestBody,
  getModelSchemaRef,
  SchemaObject,
  ReferenceObject,
} from '@loopback/rest';

// Define a type for the properties to match LoopBack's expectations
type SchemaProperties = {
  [propertyName: string]: SchemaObject | ReferenceObject;
};

export function getCustomRequestBody(model?: any, options: any = {}) {
  let baseProperties: SchemaProperties = {};
  let modelSchema: any = {type: 'object'};

  if (model) {
    modelSchema = getModelSchemaRef(model, {
      title: options.title || `${model?.name} model instance`,
      exclude: options.exclude || [],
      optional: options.optional || [],
      partial: options.partial || [],
      ...options,
    });

    baseProperties =
      (modelSchema.definitions?.[model.name]?.properties as SchemaProperties) ||
      {};
  }

  const extraProps: SchemaProperties = options.extraProps || {};

  const finalSchema: any = {
    title: options.title || (model ? undefined : 'Request Object'),
    type: 'object',
    properties: {
      ...extraProps,
      ...baseProperties,
    },
  };

  return requestBody({
    description: options.title,
    content: {
      'application/json': {
        schema: finalSchema,
      },
    },
  });
}
