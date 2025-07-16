
import { supabase } from '@/integrations/supabase/client';

export interface TableColumn {
  name: string;
  type: 'uuid' | 'text' | 'integer' | 'boolean' | 'timestamp' | 'jsonb' | 'bigint' | 'numeric';
  nullable: boolean;
  primaryKey?: boolean;
  unique?: boolean;
  defaultValue?: string;
  references?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  };
}

export interface TableDefinition {
  name: string;
  columns: TableColumn[];
  enableRLS: boolean;
  policies?: RLSPolicy[];
  indexes?: TableIndex[];
}

export interface RLSPolicy {
  name: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  expression: string;
  withCheck?: string;
}

export interface TableIndex {
  name: string;
  columns: string[];
  unique?: boolean;
  type?: 'btree' | 'gin' | 'gist';
}

export interface DatabaseSchema {
  name: string;
  description: string;
  tables: TableDefinition[];
  enums?: EnumDefinition[];
  functions?: FunctionDefinition[];
}

export interface EnumDefinition {
  name: string;
  values: string[];
}

export interface FunctionDefinition {
  name: string;
  parameters: Array<{name: string; type: string}>;
  returnType: string;
  body: string;
  security: 'DEFINER' | 'INVOKER';
}

export class DatabaseSchemaGenerator {
  async generateSchemaFromPrompt(prompt: string): Promise<DatabaseSchema> {
    console.log('🗄️ Generating database schema from prompt:', prompt);

    // Analyze prompt to extract entities and relationships
    const entities = this.extractEntities(prompt);
    const relationships = this.extractRelationships(prompt, entities);
    
    const schema: DatabaseSchema = {
      name: this.generateSchemaName(prompt),
      description: `Auto-generated schema for: ${prompt}`,
      tables: [],
      enums: []
    };

    // Generate tables for each entity
    for (const entity of entities) {
      const table = this.generateTableFromEntity(entity, relationships);
      schema.tables.push(table);
    }

    // Generate common enums
    schema.enums = this.generateCommonEnums(entities);

    // Add audit fields and relationships
    schema.tables = this.addAuditFields(schema.tables);
    schema.tables = this.addUserRelationships(schema.tables);

    return schema;
  }

  private extractEntities(prompt: string): Array<{name: string; attributes: string[]}> {
    const commonEntities = [
      { keywords: ['user', 'account', 'person', 'customer', 'member'], name: 'users', attributes: ['email', 'name', 'phone'] },
      { keywords: ['product', 'item', 'good'], name: 'products', attributes: ['name', 'description', 'price', 'category'] },
      { keywords: ['order', 'purchase', 'transaction'], name: 'orders', attributes: ['status', 'total', 'date'] },
      { keywords: ['post', 'article', 'blog'], name: 'posts', attributes: ['title', 'content', 'slug'] },
      { keywords: ['comment', 'review', 'feedback'], name: 'comments', attributes: ['content', 'rating'] },
      { keywords: ['category', 'tag', 'label'], name: 'categories', attributes: ['name', 'description'] },
      { keywords: ['file', 'document', 'media'], name: 'files', attributes: ['filename', 'size', 'type'] },
      { keywords: ['event', 'appointment', 'meeting'], name: 'events', attributes: ['title', 'date', 'location'] }
    ];

    const entities = [];
    const promptLower = prompt.toLowerCase();

    for (const entity of commonEntities) {
      if (entity.keywords.some(keyword => promptLower.includes(keyword))) {
        entities.push(entity);
      }
    }

    // If no common entities found, generate basic user-content structure
    if (entities.length === 0) {
      entities.push(
        { name: 'users', attributes: ['email', 'name'] },
        { name: 'items', attributes: ['title', 'description'] }
      );
    }

    return entities;
  }

  private extractRelationships(prompt: string, entities: Array<{name: string; attributes: string[]}>): Array<{from: string; to: string; type: 'one-to-many' | 'many-to-many'}> {
    const relationships = [];
    
    // Add user relationships for most entities
    for (const entity of entities) {
      if (entity.name !== 'users') {
        relationships.push({
          from: entity.name,
          to: 'users',
          type: 'one-to-many' as const
        });
      }
    }

    // Add common relationships
    if (entities.find(e => e.name === 'orders') && entities.find(e => e.name === 'products')) {
      relationships.push({
        from: 'order_items',
        to: 'orders',
        type: 'one-to-many' as const
      });
      relationships.push({
        from: 'order_items',
        to: 'products',
        type: 'one-to-many' as const
      });
    }

    if (entities.find(e => e.name === 'comments') && entities.find(e => e.name === 'posts')) {
      relationships.push({
        from: 'comments',
        to: 'posts',
        type: 'one-to-many' as const
      });
    }

    return relationships;
  }

  private generateTableFromEntity(entity: {name: string; attributes: string[]}, relationships: Array<{from: string; to: string; type: string}>): TableDefinition {
    const columns: TableColumn[] = [
      {
        name: 'id',
        type: 'uuid',
        nullable: false,
        primaryKey: true,
        defaultValue: 'gen_random_uuid()'
      }
    ];

    // Add user_id for user-owned entities
    if (entity.name !== 'users') {
      columns.push({
        name: 'user_id',
        type: 'uuid',
        nullable: false,
        references: {
          table: 'profiles',
          column: 'id',
          onDelete: 'CASCADE'
        }
      });
    }

    // Add entity-specific columns
    for (const attr of entity.attributes) {
      columns.push(this.generateColumnFromAttribute(attr));
    }

    // Add foreign key relationships
    const relatedTo = relationships.filter(r => r.from === entity.name);
    for (const rel of relatedTo) {
      if (rel.to !== 'users') {
        columns.push({
          name: `${rel.to.slice(0, -1)}_id`, // singular form
          type: 'uuid',
          nullable: true,
          references: {
            table: rel.to,
            column: 'id'
          }
        });
      }
    }

    // Generate RLS policies
    const policies: RLSPolicy[] = [
      {
        name: `Users can view their own ${entity.name}`,
        operation: 'SELECT',
        expression: entity.name === 'users' ? 'auth.uid() = id' : 'auth.uid() = user_id'
      },
      {
        name: `Users can create their own ${entity.name}`,
        operation: 'INSERT',
        withCheck: entity.name === 'users' ? 'auth.uid() = id' : 'auth.uid() = user_id'
      },
      {
        name: `Users can update their own ${entity.name}`,
        operation: 'UPDATE',
        expression: entity.name === 'users' ? 'auth.uid() = id' : 'auth.uid() = user_id'
      },
      {
        name: `Users can delete their own ${entity.name}`,
        operation: 'DELETE',
        expression: entity.name === 'users' ? 'auth.uid() = id' : 'auth.uid() = user_id'
      }
    ];

    return {
      name: entity.name,
      columns,
      enableRLS: true,
      policies,
      indexes: [
        {
          name: `${entity.name}_user_id_idx`,
          columns: ['user_id']
        }
      ]
    };
  }

  private generateColumnFromAttribute(attr: string): TableColumn {
    const attrLower = attr.toLowerCase();
    
    if (attrLower.includes('email')) {
      return { name: 'email', type: 'text', nullable: false, unique: true };
    }
    if (attrLower.includes('name') || attrLower.includes('title')) {
      return { name: attr, type: 'text', nullable: false };
    }
    if (attrLower.includes('description') || attrLower.includes('content')) {
      return { name: attr, type: 'text', nullable: true };
    }
    if (attrLower.includes('price') || attrLower.includes('amount') || attrLower.includes('total')) {
      return { name: attr, type: 'numeric', nullable: false, defaultValue: '0' };
    }
    if (attrLower.includes('date') || attrLower.includes('time')) {
      return { name: attr, type: 'timestamp', nullable: false, defaultValue: 'now()' };
    }
    if (attrLower.includes('count') || attrLower.includes('size') || attrLower.includes('rating')) {
      return { name: attr, type: 'integer', nullable: false, defaultValue: '0' };
    }
    if (attrLower.includes('active') || attrLower.includes('enabled') || attrLower.includes('public')) {
      return { name: attr, type: 'boolean', nullable: false, defaultValue: 'true' };
    }
    if (attrLower.includes('metadata') || attrLower.includes('config') || attrLower.includes('data')) {
      return { name: attr, type: 'jsonb', nullable: true, defaultValue: "'{}'" };
    }
    
    // Default to text
    return { name: attr, type: 'text', nullable: true };
  }

  private addAuditFields(tables: TableDefinition[]): TableDefinition[] {
    return tables.map(table => ({
      ...table,
      columns: [
        ...table.columns,
        {
          name: 'created_at',
          type: 'timestamp',
          nullable: false,
          defaultValue: 'now()'
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          nullable: false,
          defaultValue: 'now()'
        }
      ]
    }));
  }

  private addUserRelationships(tables: TableDefinition[]): TableDefinition[] {
    // Ensure profiles table exists
    const hasProfiles = tables.find(t => t.name === 'profiles');
    if (!hasProfiles) {
      tables.unshift({
        name: 'profiles',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, primaryKey: true, references: { table: 'auth.users', column: 'id', onDelete: 'CASCADE' } },
          { name: 'email', type: 'text', nullable: true },
          { name: 'full_name', type: 'text', nullable: true },
          { name: 'avatar_url', type: 'text', nullable: true },
          { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: 'now()' },
          { name: 'updated_at', type: 'timestamp', nullable: false, defaultValue: 'now()' }
        ],
        enableRLS: true,
        policies: [
          {
            name: 'Users can view their own profile',
            operation: 'SELECT',
            expression: 'auth.uid() = id'
          },
          {
            name: 'Users can update their own profile',
            operation: 'UPDATE',
            expression: 'auth.uid() = id'
          },
          {
            name: 'Users can insert their own profile',
            operation: 'INSERT',
            withCheck: 'auth.uid() = id'
          }
        ]
      });
    }

    return tables;
  }

  private generateCommonEnums(entities: Array<{name: string; attributes: string[]}>): EnumDefinition[] {
    const enums: EnumDefinition[] = [];

    // Add status enums for relevant entities
    if (entities.find(e => e.name === 'orders')) {
      enums.push({
        name: 'order_status',
        values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
      });
    }

    if (entities.find(e => e.name === 'users')) {
      enums.push({
        name: 'user_role',
        values: ['user', 'admin', 'moderator']
      });
    }

    if (entities.find(e => e.name === 'posts')) {
      enums.push({
        name: 'post_status',
        values: ['draft', 'published', 'archived']
      });
    }

    return enums;
  }

  private generateSchemaName(prompt: string): string {
    const words = prompt.toLowerCase().split(' ').filter(w => w.length > 2);
    return words.slice(0, 2).join('_') + '_schema';
  }

  generateSQL(schema: DatabaseSchema): string {
    let sql = `-- Generated schema: ${schema.name}\n-- ${schema.description}\n\n`;

    // Create enums
    for (const enumDef of schema.enums || []) {
      sql += `CREATE TYPE public.${enumDef.name} AS ENUM (${enumDef.values.map(v => `'${v}'`).join(', ')});\n\n`;
    }

    // Create tables
    for (const table of schema.tables) {
      sql += this.generateTableSQL(table);
    }

    // Create functions
    for (const func of schema.functions || []) {
      sql += this.generateFunctionSQL(func);
    }

    return sql;
  }

  private generateTableSQL(table: TableDefinition): string {
    let sql = `-- Create ${table.name} table\n`;
    sql += `CREATE TABLE public.${table.name} (\n`;
    
    const columnDefs = table.columns.map(col => {
      let def = `  ${col.name} ${col.type.toUpperCase()}`;
      if (!col.nullable) def += ' NOT NULL';
      if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
      if (col.unique) def += ' UNIQUE';
      if (col.primaryKey) def += ' PRIMARY KEY';
      if (col.references) {
        def += ` REFERENCES ${col.references.table}(${col.references.column})`;
        if (col.references.onDelete) def += ` ON DELETE ${col.references.onDelete}`;
      }
      return def;
    });
    
    sql += columnDefs.join(',\n');
    sql += '\n);\n\n';

    // Add RLS
    if (table.enableRLS) {
      sql += `ALTER TABLE public.${table.name} ENABLE ROW LEVEL SECURITY;\n\n`;
      
      // Add policies
      for (const policy of table.policies || []) {
        sql += `CREATE POLICY "${policy.name}" ON public.${table.name}\n`;
        sql += `  FOR ${policy.operation}\n`;
        if (policy.expression) sql += `  USING (${policy.expression})`;
        if (policy.withCheck) sql += `\n  WITH CHECK (${policy.withCheck})`;
        sql += ';\n\n';
      }
    }

    // Add indexes
    for (const index of table.indexes || []) {
      sql += `CREATE${index.unique ? ' UNIQUE' : ''} INDEX ${index.name}\n`;
      sql += `  ON public.${table.name} USING ${index.type || 'btree'} (${index.columns.join(', ')});\n\n`;
    }

    // Add updated_at trigger
    sql += `CREATE TRIGGER update_${table.name}_updated_at\n`;
    sql += `  BEFORE UPDATE ON public.${table.name}\n`;
    sql += `  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\n\n`;

    return sql;
  }

  private generateFunctionSQL(func: FunctionDefinition): string {
    const params = func.parameters.map(p => `${p.name} ${p.type}`).join(', ');
    
    let sql = `CREATE OR REPLACE FUNCTION public.${func.name}(${params})\n`;
    sql += `RETURNS ${func.returnType}\n`;
    sql += `LANGUAGE plpgsql\n`;
    sql += `SECURITY ${func.security}\n`;
    sql += 'AS $$\n';
    sql += 'BEGIN\n';
    sql += func.body;
    sql += '\nEND;\n';
    sql += '$$;\n\n';
    
    return sql;
  }

  async saveSchema(schema: DatabaseSchema): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('saved_project_specs')
        .insert({
          user_id: user.id,
          name: schema.name,
          description: schema.description,
          spec_data: {
            type: 'database_schema',
            schema,
            generated_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to save schema:', error);
      throw error;
    }
  }
}

export const databaseSchemaGenerator = new DatabaseSchemaGenerator();
