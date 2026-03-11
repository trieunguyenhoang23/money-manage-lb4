import {requestBody, getModelSchemaRef, SchemaObject, ReferenceObject} from '@loopback/rest';

// Define a type for the properties to match LoopBack's expectations
type SchemaProperties = {[propertyName: string]: SchemaObject | ReferenceObject};

export function getCustomRequestBody(model: any, options: any = {}) {
  const modelSchema = getModelSchemaRef(model, {
    title: options.title || `${model.name} model instance`,
    exclude: options.exclude || [],
    optional: options.optional || [],
    partial: options.partial || [],
    ...options,
  });

  // Extract base properties safely
  const baseProperties: SchemaProperties = 
    (modelSchema.definitions?.[model.name]?.properties as SchemaProperties) || {};

  const extraProps: SchemaProperties = options.extraProps || {};

  const finalSchema = options.extraProps
    ? {
        type: 'object' as const,
        properties: {
          ...extraProps,
          ...baseProperties,
        } as SchemaProperties, // Explicit cast to fix ts(2322)
      }
    : modelSchema;

  return requestBody({
    content: {
      'application/json': {
        schema: finalSchema,
      },
    },
  });
}