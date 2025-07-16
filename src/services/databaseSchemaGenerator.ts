
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  primaryKey?: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
  unique?: boolean;
  indexed?: boolean;
}

export interface RLSPolicy {
  name: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  expression?: string;
  withCheck?: string;
}

export interface DatabaseTable {
  name: string;
  columns: DatabaseColumn[];
  rlsPolicies: RLSPolicy[];
  triggers?: string[];
  indexes?: string[];
}

export interface DatabaseSchema {
  tables: DatabaseTable[];
  enums?: { name: string; values: string[] }[];
  functions?: { name: string; definition: string }[];
}

export interface RelationshipConfig {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  fromTable: string;
  toTable: string;
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}

export class DatabaseSchemaGenerator {
  // Generate schema based on entity descriptions
  generateSchema(entityDescription: string): DatabaseSchema {
    const entities = this.parseEntities(entityDescription);
    const tables: DatabaseTable[] = [];
    
    entities.forEach(entity => {
      const table = this.createTableFromEntity(entity);
      tables.push(table);
    });

    return {
      tables,
      enums: this.generateEnums(entities),
      functions: this.generateUtilityFunctions()
    };
  }

  private parseEntities(description: string): any[] {
    // Parse natural language description into entities
    const entities: any[] = [];
    
    // Simple parsing logic - in production, this would use NLP
    const lines = description.split('\n').filter(line => line.trim());
    let currentEntity: any = null;
    
    lines.forEach(line => {
      line = line.trim();
      
      if (line.toLowerCase().includes('entity') || line.toLowerCase().includes('table')) {
        if (currentEntity) entities.push(currentEntity);
        currentEntity = {
          name: this.extractEntityName(line),
          attributes: [],
          relationships: []
        };
      } else if (line.includes(':') && currentEntity) {
        const [name, type] = line.split(':').map(s => s.trim());
        currentEntity.attributes.push({ name, type });
      } else if (line.toLowerCase().includes('relates to') && currentEntity) {
        currentEntity.relationships.push(this.parseRelationship(line));
      }
    });
    
    if (currentEntity) entities.push(currentEntity);
    return entities;
  }

  private extractEntityName(line: string): string {
    const words = line.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (words[i].toLowerCase() === 'entity' || words[i].toLowerCase() === 'table') {
        return words[i + 1] || 'unknown_entity';
      }
    }
    return 'unknown_entity';
  }

  private parseRelationship(line: string): any {
    return {
      type: 'one-to-many',
      target: 'related_entity'
    };
  }

  private createTableFromEntity(entity: any): DatabaseTable {
    const columns: DatabaseColumn[] = [
      {
        name: 'id',
        type: 'uuid',
        nullable: false,
        defaultValue: 'gen_random_uuid()',
        primaryKey: true
      },
      {
        name: 'user_id',
        type: 'uuid',
        nullable: false,
        foreignKey: {
          table: 'auth.users',
          column: 'id'
        }
      },
      {
        name: 'created_at',
        type: 'timestamp with time zone',
        nullable: false,
        defaultValue: 'now()'
      },
      {
        name: 'updated_at',
        type: 'timestamp with time zone',
        nullable: false,
        defaultValue: 'now()'
      }
    ];

    // Add entity-specific columns
    entity.attributes.forEach((attr: any) => {
      columns.push({
        name: attr.name,
        type: this.mapTypeToPostgres(attr.type),
        nullable: !attr.required
      });
    });

    const rlsPolicies: RLSPolicy[] = [
      {
        name: `Users can view their own ${entity.name}`,
        operation: 'SELECT',
        expression: 'auth.uid() = user_id'
      },
      {
        name: `Users can insert their own ${entity.name}`,
        operation: 'INSERT',
        expression: 'auth.uid() = user_id',
        withCheck: 'auth.uid() = user_id'
      },
      {
        name: `Users can update their own ${entity.name}`,
        operation: 'UPDATE',
        expression: 'auth.uid() = user_id'
      },
      {
        name: `Users can delete their own ${entity.name}`,
        operation: 'DELETE',
        expression: 'auth.uid() = user_id'
      }
    ];

    return {
      name: entity.name,
      columns,
      rlsPolicies
    };
  }

  private mapTypeToPostgres(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'text',
      'number': 'integer',
      'decimal': 'numeric',
      'boolean': 'boolean',
      'date': 'date',
      'datetime': 'timestamp with time zone',
      'json': 'jsonb',
      'array': 'text[]'
    };
    
    return typeMap[type.toLowerCase()] || 'text';
  }

  private generateEnums(entities: any[]): { name: string; values: string[] }[] {
    const enums: { name: string; values: string[] }[] = [];
    
    // Generate common enums
    enums.push({
      name: 'status_type',
      values: ['active', 'inactive', 'pending', 'archived']
    });

    return enums;
  }

  private generateUtilityFunctions(): { name: string; definition: string }[] {
    return [
      {
        name: 'update_updated_at_column',
        definition: `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';`
      }
    ];
  }

  // Generate SQL migration scripts
  generateMigrationSQL(schema: DatabaseSchema): string {
    let sql = '-- Generated Database Migration\n\n';

    // Create enums
    if (schema.enums) {
      schema.enums.forEach(enumDef => {
        sql += `CREATE TYPE ${enumDef.name} AS ENUM (${enumDef.values.map(v => `'${v}'`).join(', ')});\n\n`;
      });
    }

    // Create tables
    schema.tables.forEach(table => {
      sql += `-- Create table ${table.name}\n`;
      sql += `CREATE TABLE ${table.name} (\n`;
      
      const columnDefs = table.columns.map(col => {
        let def = `  ${col.name} ${col.type}`;
        if (!col.nullable) def += ' NOT NULL';
        if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
        if (col.primaryKey) def += ' PRIMARY KEY';
        if (col.unique) def += ' UNIQUE';
        return def;
      });
      
      sql += columnDefs.join(',\n');
      sql += '\n);\n\n';

      // Add foreign key constraints
      table.columns.forEach(col => {
        if (col.foreignKey) {
          sql += `ALTER TABLE ${table.name} ADD CONSTRAINT fk_${table.name}_${col.name} FOREIGN KEY (${col.name}) REFERENCES ${col.foreignKey.table}(${col.foreignKey.column});\n`;
        }
      });

      // Enable RLS
      sql += `ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;\n\n`;

      // Create RLS policies
      table.rlsPolicies.forEach(policy => {
        sql += `CREATE POLICY "${policy.name}" ON ${table.name}\n`;
        sql += `  FOR ${policy.operation}\n`;
        if (policy.expression) {
          sql += `  USING (${policy.expression})`;
        }
        if (policy.withCheck) {
          sql += `\n  WITH CHECK (${policy.withCheck})`;
        }
        sql += ';\n\n';
      });

      // Add updated_at trigger
      sql += `CREATE TRIGGER update_${table.name}_updated_at\n`;
      sql += `  BEFORE UPDATE ON ${table.name}\n`;
      sql += `  FOR EACH ROW\n`;
      sql += `  EXECUTE FUNCTION update_updated_at_column();\n\n`;
    });

    // Create utility functions
    if (schema.functions) {
      schema.functions.forEach(func => {
        sql += func.definition + '\n\n';
      });
    }

    return sql;
  }

  // Generate relationships
  generateRelationships(relationships: RelationshipConfig[]): string {
    let sql = '-- Generated Relationships\n\n';
    
    relationships.forEach(rel => {
      switch (rel.type) {
        case 'one-to-one':
          sql += this.generateOneToOneRelationship(rel);
          break;
        case 'one-to-many':
          sql += this.generateOneToManyRelationship(rel);
          break;
        case 'many-to-many':
          sql += this.generateManyToManyRelationship(rel);
          break;
      }
    });

    return sql;
  }

  private generateOneToOneRelationship(rel: RelationshipConfig): string {
    return `
-- One-to-One relationship: ${rel.fromTable} -> ${rel.toTable}
ALTER TABLE ${rel.toTable} 
ADD COLUMN ${rel.fromTable}_id uuid UNIQUE 
REFERENCES ${rel.fromTable}(id) ON DELETE ${rel.onDelete || 'CASCADE'};

`;
  }

  private generateOneToManyRelationship(rel: RelationshipConfig): string {
    return `
-- One-to-Many relationship: ${rel.fromTable} -> ${rel.toTable}
ALTER TABLE ${rel.toTable} 
ADD COLUMN ${rel.fromTable}_id uuid 
REFERENCES ${rel.fromTable}(id) ON DELETE ${rel.onDelete || 'CASCADE'};

`;
  }

  private generateManyToManyRelationship(rel: RelationshipConfig): string {
    const junctionTable = `${rel.fromTable}_${rel.toTable}`;
    return `
-- Many-to-Many relationship: ${rel.fromTable} <-> ${rel.toTable}
CREATE TABLE ${junctionTable} (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ${rel.fromTable}_id uuid REFERENCES ${rel.fromTable}(id) ON DELETE CASCADE,
  ${rel.toTable}_id uuid REFERENCES ${rel.toTable}(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(${rel.fromTable}_id, ${rel.toTable}_id)
);

ALTER TABLE ${junctionTable} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own ${junctionTable}" ON ${junctionTable}
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ${rel.fromTable} 
      WHERE id = ${junctionTable}.${rel.fromTable}_id 
      AND user_id = auth.uid()
    )
  );

`;
  }

  // Save generated schema
  async saveGeneratedSchema(schema: DatabaseSchema, name: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User authentication required');
    }

    const schemaData = {
      type: 'database_schema',
      schema: JSON.parse(JSON.stringify(schema)), // Convert to plain object
      generated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('saved_project_specs')
      .insert({
        name,
        description: 'Generated database schema',
        spec_data: schemaData as any,
        user_id: user.id
      });

    if (error) throw error;
  }

  // Load saved schemas
  async loadSavedSchemas(): Promise<Array<{ id: string; name: string; schema: DatabaseSchema }>> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];

    const { data, error } = await supabase
      .from('saved_project_specs')
      .select('*')
      .eq('user_id', user.id)
      .like('spec_data->type', 'database_schema');

    if (error) return [];

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      schema: (item.spec_data as any).schema
    }));
  }

  // Validate schema
  validateSchema(schema: DatabaseSchema): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for duplicate table names
    const tableNames = schema.tables.map(t => t.name);
    const duplicates = tableNames.filter((name, index) => tableNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate table names: ${duplicates.join(', ')}`);
    }

    // Validate each table
    schema.tables.forEach(table => {
      // Check for primary key
      const hasPrimaryKey = table.columns.some(col => col.primaryKey);
      if (!hasPrimaryKey) {
        errors.push(`Table ${table.name} missing primary key`);
      }

      // Check column names
      const columnNames = table.columns.map(c => c.name);
      const colDuplicates = columnNames.filter((name, index) => columnNames.indexOf(name) !== index);
      if (colDuplicates.length > 0) {
        errors.push(`Table ${table.name} has duplicate columns: ${colDuplicates.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const databaseSchemaGenerator = new DatabaseSchemaGenerator();
