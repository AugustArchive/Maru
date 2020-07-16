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

import { getKindOf, convertJSTypeToSql, SQLOptions } from '../../util';
import { Pipeline } from '../..';

export const CreateTable = (table: string, values?: [string, unknown][], exists: boolean = false,): Pipeline => ({
  id: 'create_table',
  getSql() {
    const keyValues: string[] = [];
    if (values) {
      for (let i = 0; i < values.length; i++) {
        const [key, value] = values[i];
        const type = getKindOf(value);
        const options: SQLOptions = {};

        if (i === 0) options.primary = true; // TODO: Add a "primary" label?
        if (value === null) options.nullable = true;
        if (Array.isArray(value)) options.array = true;
        // TODO: Add a way to allocate a size if it's an array

        keyValues.push(convertJSTypeToSql(key, type, options));
      }
    }

    return `CREATE TABLE ${exists ? 'IF NOT EXISTS' : ''} ${table}${keyValues.length ? ` (${keyValues.join(', ')})` : ''};`;
  }
});