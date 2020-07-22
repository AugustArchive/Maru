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

import { Pipeline } from '..';
import { escape } from '../util';

const TYPES = ['set'];

interface UpdateOptions<T> {
  /** Return the values when it's executed (that you want) */
  returning?: string[];

  /** The values to insert */
  values: { [P in keyof T]?: T[P]; };

  /** The query (to find it) */
  query?: [string, unknown];

  /** The table */
  table: string;
  
  /** The type */
  type: 'set';
}

export const Update = <V>(options: UpdateOptions<V>): Pipeline => ({
  id: 'update',
  getSql() {
    if (!TYPES.includes(options.type)) throw new Error(`Type "${options.type}" is not valid (${TYPES.join(', ')})`);
    if (options.query && options.query.length < 1) throw new Error('Query must be an array sorted by key, value (i.e: ["a", 2])');

    let sql = `UPDATE ${options.table} ${options.type.toUpperCase()} `;
    const pairs: string[] = [];

    for (const [key, value] of Object.entries(options.values)) pairs.push(`${key} = ${escape(value)}`);
    sql += pairs.join(', ');

    if (options.query) sql += ` WHERE ${options.query[0]} = ${escape(options.query[1])}`;
    if (options.returning) sql += ` RETURNING ${options.returning.map(s => s.toLowerCase()).join(', ')}`;

    sql += ';';
    return sql;
  }
});