
export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters: APIParameter[];
  requestBody?: APIRequestBody;
  responses: APIResponse[];
  authentication: boolean;
  rateLimit?: number;
}

export interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'uuid' | 'array';
  location: 'path' | 'query' | 'header';
  required: boolean;
  description: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
}

export interface APIRequestBody {
  contentType: 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded';
  schema: Record<string, any>;
  required: boolean;
}

export interface APIResponse {
  statusCode: number;
  description: string;
  schema?: Record<string, any>;
  examples?: Record<string, any>;
}

export interface APISpecification {
  title: string;
  version: string;
  description: string;
  baseUrl: string;
  endpoints: APIEndpoint[];
  schemas: Record<string, any>;
}

export class APIEndpointGenerator {
  generateAPIFromSchema(tables: any[]): APISpecification {
    console.log('🔌 Generating API endpoints from database schema');

    const endpoints: APIEndpoint[] = [];
    const schemas: Record<string, any> = {};

    for (const table of tables) {
      // Generate CRUD endpoints for each table
      endpoints.push(...this.generateCRUDEndpoints(table));
      
      // Generate schema definitions
      schemas[this.capitalize(table.name.slice(0, -1))] = this.generateTableSchema(table);
    }

    // Add authentication endpoints
    endpoints.push(...this.generateAuthEndpoints());

    return {
      title: 'Generated API',
      version: '1.0.0',
      description: 'Auto-generated REST API from database schema',
      baseUrl: 'https://agojvddqyfcozjxrllav.supabase.co/rest/v1',
      endpoints,
      schemas
    };
  }

  private generateCRUDEndpoints(table: any): APIEndpoint[] {
    const entityName = table.name.slice(0, -1); // Remove 's' for singular
    const endpoints: APIEndpoint[] = [];

    // GET /entities - List all
    endpoints.push({
      method: 'GET',
      path: `/${table.name}`,
      description: `Retrieve all ${table.name}`,
      parameters: [
        {
          name: 'limit',
          type: 'number',
          location: 'query',
          required: false,
          description: 'Maximum number of items to return',
          validation: { min: 1, max: 100 }
        },
        {
          name: 'offset',
          type: 'number',
          location: 'query',
          required: false,
          description: 'Number of items to skip',
          validation: { min: 0 }
        },
        {
          name: 'order',
          type: 'string',
          location: 'query',
          required: false,
          description: 'Sort order (column.asc or column.desc)'
        }
      ],
      responses: [
        {
          statusCode: 200,
          description: `List of ${table.name}`,
          schema: {
            type: 'array',
            items: { $ref: `#/schemas/${this.capitalize(entityName)}` }
          }
        }
      ],
      authentication: true
    });

    // GET /entities/{id} - Get by ID
    endpoints.push({
      method: 'GET',
      path: `/${table.name}/{id}`,
      description: `Retrieve a specific ${entityName}`,
      parameters: [
        {
          name: 'id',
          type: 'uuid',
          location: 'path',
          required: true,
          description: `${this.capitalize(entityName)} ID`
        }
      ],
      responses: [
        {
          statusCode: 200,
          description: `${this.capitalize(entityName)} details`,
          schema: { $ref: `#/schemas/${this.capitalize(entityName)}` }
        },
        {
          statusCode: 404,
          description: `${this.capitalize(entityName)} not found`
        }
      ],
      authentication: true
    });

    // POST /entities - Create new
    endpoints.push({
      method: 'POST',
      path: `/${table.name}`,
      description: `Create a new ${entityName}`,
      parameters: [],
      requestBody: {
        contentType: 'application/json',
        required: true,
        schema: { $ref: `#/schemas/Create${this.capitalize(entityName)}` }
      },
      responses: [
        {
          statusCode: 201,
          description: `${this.capitalize(entityName)} created successfully`,
          schema: { $ref: `#/schemas/${this.capitalize(entityName)}` }
        },
        {
          statusCode: 400,
          description: 'Invalid input data'
        }
      ],
      authentication: true
    });

    // PUT /entities/{id} - Update
    endpoints.push({
      method: 'PUT',
      path: `/${table.name}/{id}`,
      description: `Update a ${entityName}`,
      parameters: [
        {
          name: 'id',
          type: 'uuid',
          location: 'path',
          required: true,
          description: `${this.capitalize(entityName)} ID`
        }
      ],
      requestBody: {
        contentType: 'application/json',
        required: true,
        schema: { $ref: `#/schemas/Update${this.capitalize(entityName)}` }
      },
      responses: [
        {
          statusCode: 200,
          description: `${this.capitalize(entityName)} updated successfully`,
          schema: { $ref: `#/schemas/${this.capitalize(entityName)}` }
        },
        {
          statusCode: 404,
          description: `${this.capitalize(entityName)} not found`
        }
      ],
      authentication: true
    });

    // DELETE /entities/{id} - Delete
    endpoints.push({
      method: 'DELETE',
      path: `/${table.name}/{id}`,
      description: `Delete a ${entityName}`,
      parameters: [
        {
          name: 'id',
          type: 'uuid',
          location: 'path',
          required: true,
          description: `${this.capitalize(entityName)} ID`
        }
      ],
      responses: [
        {
          statusCode: 204,
          description: `${this.capitalize(entityName)} deleted successfully`
        },
        {
          statusCode: 404,
          description: `${this.capitalize(entityName)} not found`
        }
      ],
      authentication: true
    });

    return endpoints;
  }

  private generateAuthEndpoints(): APIEndpoint[] {
    return [
      {
        method: 'POST',
        path: '/auth/signup',
        description: 'Register a new user account',
        parameters: [],
        requestBody: {
          contentType: 'application/json',
          required: true,
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 8 }
            },
            required: ['email', 'password']
          }
        },
        responses: [
          {
            statusCode: 201,
            description: 'User account created successfully'
          },
          {
            statusCode: 400,
            description: 'Invalid email or password'
          }
        ],
        authentication: false
      },
      {
        method: 'POST',
        path: '/auth/signin',
        description: 'Sign in to user account',
        parameters: [],
        requestBody: {
          contentType: 'application/json',
          required: true,
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string' }
            },
            required: ['email', 'password']
          }
        },
        responses: [
          {
            statusCode: 200,
            description: 'Successfully signed in'
          },
          {
            statusCode: 401,
            description: 'Invalid credentials'
          }
        ],
        authentication: false
      },
      {
        method: 'POST',
        path: '/auth/signout',
        description: 'Sign out from user account',
        parameters: [],
        responses: [
          {
            statusCode: 204,
            description: 'Successfully signed out'
          }
        ],
        authentication: true
      }
    ];
  }

  private generateTableSchema(table: any): any {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const column of table.columns) {
      if (column.name === 'id' || column.name === 'created_at' || column.name === 'updated_at') continue;

      properties[column.name] = this.getColumnSchema(column);
      
      if (!column.nullable && !column.defaultValue) {
        required.push(column.name);
      }
    }

    return {
      type: 'object',
      properties,
      required
    };
  }

  private getColumnSchema(column: any): any {
    switch (column.type) {
      case 'uuid':
        return { type: 'string', format: 'uuid' };
      case 'text':
        return { type: 'string' };
      case 'integer':
        return { type: 'integer' };
      case 'bigint':
        return { type: 'integer', format: 'int64' };
      case 'numeric':
        return { type: 'number' };
      case 'boolean':
        return { type: 'boolean' };
      case 'timestamp':
        return { type: 'string', format: 'date-time' };
      case 'jsonb':
        return { type: 'object' };
      default:
        return { type: 'string' };
    }
  }

  generateOpenAPISpec(apiSpec: APISpecification): any {
    return {
      openapi: '3.0.0',
      info: {
        title: apiSpec.title,
        version: apiSpec.version,
        description: apiSpec.description
      },
      servers: [
        {
          url: apiSpec.baseUrl,
          description: 'Supabase API Server'
        }
      ],
      paths: this.generatePaths(apiSpec.endpoints),
      components: {
        schemas: apiSpec.schemas,
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    };
  }

  private generatePaths(endpoints: APIEndpoint[]): any {
    const paths: any = {};

    for (const endpoint of endpoints) {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {};
      }

      paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        parameters: endpoint.parameters.map(this.convertParameter),
        requestBody: endpoint.requestBody ? this.convertRequestBody(endpoint.requestBody) : undefined,
        responses: this.convertResponses(endpoint.responses),
        security: endpoint.authentication ? [{ BearerAuth: [] }] : undefined
      };
    }

    return paths;
  }

  private convertParameter(param: APIParameter): any {
    return {
      name: param.name,
      in: param.location,
      required: param.required,
      description: param.description,
      schema: {
        type: param.type === 'uuid' ? 'string' : param.type,
        format: param.type === 'uuid' ? 'uuid' : undefined,
        ...param.validation
      }
    };
  }

  private convertRequestBody(body: APIRequestBody): any {
    return {
      required: body.required,
      content: {
        [body.contentType]: {
          schema: body.schema
        }
      }
    };
  }

  private convertResponses(responses: APIResponse[]): any {
    const converted: any = {};
    
    for (const response of responses) {
      converted[response.statusCode.toString()] = {
        description: response.description,
        content: response.schema ? {
          'application/json': {
            schema: response.schema,
            examples: response.examples
          }
        } : undefined
      };
    }

    return converted;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export const apiEndpointGenerator = new APIEndpointGenerator();
