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
        /** List of columns to insert */
        columns: string[];

        /** The values */
        values: { [P in keyof T]?: T[P] }

        /** The table */
        table: string;
      }

      interface UpdateOptions {
        /** The values to insert */
        values: [string, unknown][];
      
        /** The query (to find it) */
        query?: [string, unknown];
      
        /** The table */
        table: string;
        
        /** The type */
        type: 'set';
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
      export function CreateTable(table: string, values?: [string, unknown][], exists?: boolean): Maru.Pipeline;

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
      export function Insert<T>(options: Maru.pipelines.InsertOptions<T>): Maru.Pipeline;

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
       */
      export function Update(options: Maru.pipelines.UpdateOptions): Maru.Pipeline;
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
    export class Connection extends EventEmitter {
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
       * Creates a new Transaction
       */
      createTransaction(): Maru.Transaction;
    
      /**
       * Queries SQL and returns the value
       * @param sql The SQL to execute
       */
      query<T>(sql: string | Pipeline): Promise<T | null>;
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
    }

    export class Transaction {
      /** The number of pipes */
      private numOfPipes: number;
    
      /** The connection */
      public connection: Connection;
    
      /** A list of pipelines that were piped */
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
       * Executes the first pipeline
       */
      executeFirst<T = unknown>(): Promise<T | null>;
    
      /**
       * Executes the transaction
       */
      execute<T = unknown>(): Promise<T[]>;
    }
  }

  export = Maru;
}