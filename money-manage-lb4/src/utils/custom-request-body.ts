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

export function MultipartFormDataRequest(options?: {
  description: string;
  additionalProps: boolean;
}) {
  const description = options?.description ?? 'Multipart form-data request';
  const allowAdditional = options?.additionalProps ?? true;

  return requestBody({
    description,
    require: true,
    content: {
      'multipart/form-data': {
        //Dòng chảy xử lí từng chunk không cần phải đợi nhận toàn bộ buffer rồi mói 7xu73 lí
        'x-parser': 'stream',
        schema: {
          type: 'object',
          additionalProperties: allowAdditional,
        },
      },
    },
  });
}
