/**
 * TypeScript definitions for @augu/maru
 * 
 * Author: August <august@augu.dev>
 * Project: https://github.com/auguwu/Maru
 * License: MIT
 */

declare module '@augu/maru' {
  import { PoolClient, Pool } from 'pg';
  import { EventEmitter } from 'events';
  import { Collection } from '@augu/immutable';

  namespace Maru {
    /**
     * Returns the version of Maru
     */
    export const version: string;

    /** All of the avaliable pipelines */
    export namespace pipelines {
      interface InsertOptions<T> {
        /** The values */
        values: { [P in keyof T]?: T[P] }

        /** The table */
        table: string;
      }

      interface UpdateOptions<V> {
        /** Return any specific values when it's updated */
        returning?: string[];

        /** The values to insert */
        values: { [P in keyof V]?: V[P]; }
      
        /** The query (to find it) */
        query?: [string, unknown];
      
        /** The table */
        table: string;
        
        /** The type */
        type: 'set';
      }

      type SupportedTypes = 'string' | 'float' | 'number' | 'boolean' | 'array' | 'bigint';
      type CreateTableValues<T> = {
        [P in keyof T]?: SupportedTypes | Maru.pipelines.CreateOptions;
      };

      interface CreateOptions {
        /** If the value is nullable */
        nullable?: boolean;
      
        /** If the value is a primary key */
        primary?: boolean;
      
        /** Allocate a custom size (only used in Arrays and Strings) */
        size?: number;
      
        /** The type */
        type: 'string' | 'float' | 'number' | 'boolean' | 'array' | 'bigint' | 'object';
      }

      interface CreateTableOptions<V> {
        /** 
         * If we should create the table if it doesn't exist 
         * @default true
         */
        exists?: boolean;

        /** The values to add */
        values: CreateTableValues<V>;
      }

      /**
       * Pipeline to create a database
       * @param db The database name
       */
      export function CreateDatabase(db: string): Maru.Pipeline;

      /**
       * Pipeline to drop a database
       * @param db The database name
       */
      export function DropDatabase(db: string): Maru.Pipeline;

      /**
       * Pipeline to check if a database exist
       * @param db The database name
       */
      export function DatabaseExists(db: string): Maru.Pipeline;

      /**
       * Pipeline to create a table
       * @param table The table name
       * @param values Any values to add
       * @param exists If we should apply `IF NOT EXISTS`
       */
      // eslint-disable-next-line
      export function CreateTable<T extends object>(table: string, options: CreateTableOptions<T>): Maru.Pipeline;

      /**
       * Pipeline to drop the table
       * @param table The table name
       * @param exists If we should apply `IF EXISTS`
       */
      export function DropTable(table: string, exists?: boolean): Maru.Pipeline;

      /**
       * Pipeline to check if a table exists
       * @param table The table name
       */
      export function TableExists(table: string): Maru.Pipeline;

      /**
       * Counts the amount of documents
       * @param table The table to find
       * @param amount The amount (defaults to `-1`, which counts all of them)
       */
      export function Count(table: string, amount?: number): Maru.Pipeline;

      /**
       * Pipeline to delete an entry
       * @param table The table name
       * @param column The column to find
       */
      export function Delete(table: string, column: [string, unknown]): Maru.Pipeline;

      /**
       * Pipeline to insert an entry
       * @param options Additional options
       * @typeparam T: The insert-one object
       */
      // eslint-disable-next-line
      export function Insert<T extends object>(options: Maru.pipelines.InsertOptions<T>): Maru.Pipeline;

      /**
       * Pipeline to get an entry
       * @param table The table name
       * @param column The column to find
       */
      export function Select(table: string, column: [string, unknown]): Maru.Pipeline;

      /**
       * Pipeline to get all entries
       * @param table The table name
       * @param column The column to find
       */
      export function SelectAll(table: string): Maru.Pipeline;

      /**
       * Pipeline to update an entry
       * @param options Additional options
       * @typeparam T: The update object
       */
      // eslint-disable-next-line
      export function Update<T extends object>(options: Maru.pipelines.UpdateOptions<T>): Maru.Pipeline;
    }

    /**
     * A pipeline is a line of SQL code that will be executed
     */
    export interface Pipeline {
      /**
       * Gets the SQL string
       */
      getSql(): string;

      /** The ID of the pipe */
      id: string;
    }

    /**
     * The core of actually connecting to the database
     */
    class Connection {
      /** Check if the connection exists */
      public connected: boolean;
    
      /** The client */
      private client: PoolClient;
    
      /** The connection pool */
      private pool: Pool;
    
      /**
       * Creates a new Connection
       * @param pool The pool instance
       */
      constructor(pool: Pool);
    
      /**
       * Connects to the database
       */
      connect(): Promise<void>;
    
      /**
       * Creates a new Batch
       */
      createBatch(): Maru.Batch;
    
      /**
       * Queries SQL and returns the value or `null` if not found
       * @param sql The SQL to execute
       */
      query<T>(sql: string | Pipeline, array?: false): Promise<T | null>;

      /**
       * Queries SQL and returns the values as an array
       * @param sql The SQL to execute
       */
      query<T>(sql: string | Pipeline, array?: true): Promise<T[] | null>;
    }

    interface DialectOptions {
      /** Number of active connections */
      activeConnections?: number;
      username: string;
      password: string;
      database: string;
      host: string;
      port: number;
    }
    
    export class Dialect {
      /** Number of active connections */
      public activeConnections: number;
    
      /** The connections */
      private connections: Collection<Connection>;
      
      /** The pool instance */
      private pool: Pool;
    
      /**
       * Creates a new Dialect
       * @param options The options
       */
      constructor(options: DialectOptions);
    
      /**
       * Creates a new connection
       */
      createConnection(): Maru.Connection;

      /**
       * Destroys all connections
       */
      destroy(): Promise<void>;
    }

    class Batch {
      /** The number of pipes to add until a MAX_PIPE_ERROR occurs */
      private numOfPipes: number;
    
      /** The connection */
      public connection: Connection;
    
      /** A list of pipelines that were piped using Batch#pipe */
      public pipelines: Collection<Pipeline>;
    
      /** If it was executed already */
      public executed: boolean;
    
      /**
       * Creates a new Transaction
       * @param connection The connection
       */
      constructor(connection: Connection);
    
      /**
       * Sets the number of pipes to be executed
       * @param a The number of pipes
       * @returns This transaction to chain methods
       */
      setNumOfPipes(a: number): this;
    
      /**
       * Pipes a new Pipeline
       * @param line The pipeline
       * @returns This transaction to chain methods
       */
      pipe(line: Pipeline): this;
    
      /**
       * Executes the next pipeline avaliable
       * @param array If we should an Array or not
       */
      next<T = unknown>(array?: boolean): Promise<T | null>;
    
      /**
       * Executes the batch
       */
      all<T extends unknown[] = unknown[]>(): Promise<T[]>;
    }
  }

  export = Maru;
}