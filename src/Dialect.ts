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

import { Connection } from './Connection';
import { Collection } from '@augu/immutable';
import { Pool } from 'pg';

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
  private pool!: Pool;

  /**
   * Creates a new Dialect
   * @param options The options
   */
  constructor(options: DialectOptions) {
    this.activeConnections = options.hasOwnProperty('activeConnections') ? options.activeConnections! : 25;
    this.connections = new Collection();
    this.pool = new Pool({
      password: options.password,
      database: options.database,
      user: options.username,
      port: options.port,
      host: options.host
    });
  }

  /**
   * Creates a new connection
   */
  createConnection() {
    if (this.connections.size > this.activeConnections) throw new Error(`You have maxed out the amount of connections to be running (${this.activeConnections})`);
    return new Connection(this.pool);
  }
}