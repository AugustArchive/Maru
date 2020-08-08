/**
 * Copyright (c) 2020 August
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { PoolClient, Pool } from 'pg';
import type { Pipeline } from './Pipeline';
import { Batch } from './Batch';

/**
 * The core of actually connecting to the database
 */
export class Connection {
  /** Check if the connection exists */
  public connected: boolean;

  /** The client */
  private client!: PoolClient;

  /** The connection pool */
  private pool: Pool;

  /**
   * Creates a new Connection
   * @param pool The pool instance
   */
  constructor(pool: Pool) {
    this.connected = false;
    this.pool = pool;
  }

  /**
   * Connects to the database
   */
  async connect() {
    if (this.connected) throw new Error('Connection already exists');

    await this.pool.connect()
      .then((client) => {
        this.client = client;
        this.connected = true;
      });
  }

  /**
   * Creates a new Transaction
   */
  createBatch() {
    return new Batch(this);
  }

  /**
   * Queries SQL and returns the values as an array
   * @param sql The SQL to execute
   */
  query<T>(sql: string | Pipeline, array: false): Promise<T | null>;

  /**
   * Queries SQL and returns the values as an array
   * @param sql The SQL to execute
   */
  query<T>(sql: string | Pipeline, array: true): Promise<T[] | null>;

  /**
   * Queries SQL and returns the value
   * @param sql The SQL to execute
   */
  query<T>(sql: string | Pipeline, array: boolean = false): Promise<T | T[] | null> {
    const query = typeof sql === 'string' ? sql : sql.getSql();
    return new Promise((resolve, reject) => this.client.query(query, (error, results) => {
      if (error) return reject(error);

      if (results.rowCount < 1) return resolve(null);
      else resolve(array ? results.rows : results.rows[0]);
    }));
  }
}