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

import { escape, getKindOf, convertArrayToSql } from '../util';
import { Pipeline } from '..';

interface InsertOptions<T> {
  columns: string[];
  values: { [P in keyof T]?: T[P] }
  table: string;
}

export const Insert = <T = any>(options: InsertOptions<T>): Pipeline => ({
  id: 'insert',
  getSql() {
    const columns = Object.keys(options.values);
    const condridict = columns.some(s => !options.columns.includes(s));
    console.log(condridict);

    if (columns.some(s => !options.columns.includes(s))) {
      const missing = columns.filter(col => !options.columns.includes(col));
      throw new TypeError(`Missing ${missing.length} columns to be inserted (${missing.join(', ')})`);
    }

    function convert([_, value]: [string, unknown]) {
      const type = getKindOf(value);
      if (type === 'array') return convertArrayToSql(<unknown[]> value);
      if (type === 'string') return escape(<string> value);

      return value;
    }

    const values = Object.entries(options.values).map(convert);
    return `INSERT INTO ${options.table} (${options.columns.join(', ')}) VALUES (${values.join(', ')});`;
  }
});