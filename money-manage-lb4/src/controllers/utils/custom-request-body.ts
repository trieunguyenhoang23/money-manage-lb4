import {requestBody, getModelSchemaRef} from '@loopback/rest';

export function getCustomRequestBody(model: any, options: any = {}) {
  return requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(model, {
          title: options.title || `${model.name} model instance`,
          exclude: options.exclude || [],
          optional: options.optional || [],
          ...options,
        }),
      },
    },
  });
}
