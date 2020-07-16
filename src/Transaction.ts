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

import type { Pipeline } from './Pipeline';
import { Collection } from '@augu/immutable';
import { Connection } from './Connection';

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
  constructor(connection: Connection) {
    this.numOfPipes = 3; // default to 3
    this.connection = connection;
    this.pipelines = new Collection();
    this.executed = false;
  }

  /**
   * Sets the number of pipes to be executed
   * @param a The number of pipes
   * @returns This transaction to chain methods
   */
  setNumOfPipes(a: number) {
    this.numOfPipes = a;
    return this;
  }

  /**
   * Pipes a new Pipeline
   * @param line The pipeline
   * @returns This transaction to chain methods
   */
  pipe(line: Pipeline) {
    if (this.pipelines.size > this.numOfPipes) throw new Error(`You already have enough pipelines to be executed (max: ${this.numOfPipes})`);

    this.pipelines.add(line);
    return this;
  }

  executeFirst<T = unknown>() {
    if (this.executed) throw new Error('This transaction was already executed');

    return new Promise<T | null>((resolve, reject) => {
      if (this.pipelines.empty) return reject(new Error('Transaction doesn\'t include any pipelines'));

      const pipeline = this.pipelines.shift();
      if (pipeline === null) return reject(new Error('Pipeline exists but is not avaliable?'));

      this.connection.query(pipeline)
        .then((results) => {
          this.executed = true;
          if (results === null) return resolve(null);
          return resolve(results as T);
        }).catch(reject);
    });
  }

  /**
   * Executes the transaction
   */
  execute<T = unknown>() {
    if (this.executed) throw new Error('This transaction was already executed');

    return new Promise<T>(async(resolve, reject) => {
      if (this.pipelines.empty) return reject(new Error('Transaction doesn\'t include any pipelines'));

      const items: unknown[] = [];
      for (const [key, pipeline] of this.pipelines) {
        try {
          const results = await this.connection.query(pipeline);
          items.push(results);
          this.pipelines.delete(key);
        } catch(ex) {
          reject(ex);
          break;
        }
      }

      this.executed = true;
      return resolve(items as any);
    });
  }
}