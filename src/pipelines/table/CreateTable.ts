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

import { convertJSTypeToSql, SQLOptions } from '../../util';
import { Pipeline } from '../..';

const SUPPORTED: SupportedTypes[] = ['array', 'float', 'number', 'boolean', 'array', 'string', 'object', 'date'];
type SupportedTypes = 'string' | 'float' | 'number' | 'boolean' | 'array' | 'bigint' | 'object' | 'date';

// eslint-disable-next-line
type Values<T> = { 
  [P in keyof T]: SupportedTypes | CreateOptions; 
};

interface CreateOptions {
  /** If the value is nullable */
  nullable?: boolean;

  /** If the value is a primary key */
  primary?: boolean;

  /** Allocate a custom size (only used in Arrays and Strings) */
  size?: number;

  /** The type */
  type: 'string' | 'float' | 'number' | 'boolean' | 'array' | 'bigint' | 'object' | 'date';
}

interface CreateTableOptions<T> {
  /** If we should create it if it doesn't exist */
  exists?: boolean;

  /** The values to add */
  values: Values<T>;
}

export const CreateTable = <T>(table: string, options: CreateTableOptions<T>): Pipeline => ({
  id: 'create_table',
  getSql() {
    const keyValues: string[] = [];
    const { values } = options;
    const exists = options.hasOwnProperty('exists') ? options.exists! : true;

    if (values) {
      const keys = Object.keys(values);
      for (let i = 0; i < keys.length; i++) {
        const value = values[keys[i]];

        // JavaScript is weird:
        // I added the check if it's not an array since
        // typeof an array returns 'object'?
        //
        // Update: Arrays are an enumerable object, so it makes sense
        // but why though?
        if (typeof value === 'object' && !Array.isArray(value)) {
          const val = value as CreateOptions;
          if (!val.hasOwnProperty('type')) throw new Error('Missing "type"');
          if (!SUPPORTED.includes(val.type)) throw new Error(`SQL type "${val.type}" is not a valid type (${SUPPORTED.join(', ')})`);
        
          const options: SQLOptions = {};
          if (val.hasOwnProperty('primary') && val.primary!) options.primary = true;
          if (val.hasOwnProperty('null') && val.nullable!) options.nullable = true;
          if (val.hasOwnProperty('size')) {
            if (!['array', 'string'].includes(val.type)) throw new Error(`SQL type "${val.type}" cannot have an allocated size, only arrays and strings are supported`);
            if (isNaN(val.size!) || !Number.isInteger(val.size!)) throw new Error('Allocated size cannot be NaN or a float integer');

            options.size = val.size!;
          }

          keyValues.push(convertJSTypeToSql(keys[i], val.type, options));
        } else {
          if (!SUPPORTED.includes(value)) throw new Error(`Invalid type "${value}" (${SUPPORTED.join(', ')})`);
          keyValues.push(convertJSTypeToSql(keys[i], value, {
            nullable: value === null
          }));
        }
      }
    }
    
    return `CREATE TABLE ${exists ? 'IF NOT EXISTS' : ''} ${table}${keyValues.length ? ` (${keyValues.join(', ')})` : ''};`;
  }
});