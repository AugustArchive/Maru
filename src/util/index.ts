/**
 * Copyright (c) 2020 August
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Appends `'` if it's a string
 * @param type The type to escape
 */
export const escape = (type: any) => typeof type === 'string' ? `'${type}'` : type;

export interface SQLOptions {
  /** Is it nullable? */
  nullable?: boolean;

  /** Is it the primary key? */
  primary?: boolean;

  /** Is it an Array? */
  array?: boolean;

  /** Do we allocate a size for it? */
  size?: number;
}

/**
 * Converts a JavaScript type to SQL
 * @param name The name of the column
 * @param type The type to use
 * @param options Any additional options
 */
export function convertJSTypeToSql(
  name: string,
  type: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function' | 'float' | 'array' | 'null' | 'class', 
  options: SQLOptions
) {
  const isPrimary = options.hasOwnProperty('primary') && options.primary! ? ' PRIMARY KEY' : '';
  const isNullable = options.hasOwnProperty('nullable') && options.nullable! ? ' NULL' : '';
  const allocSize = options.hasOwnProperty('size') && options.size! > 1 ? options.size! : '';
  const isArray = options.hasOwnProperty('array') && options.array!;

  if (['object', 'function', 'class', 'symbol', 'undefined', 'null'].includes(type)) throw new Error(`Type "${type}" is not supported`);
  if (['boolean'].includes(type) && isArray) throw new TypeError('Array support for booleans will not be supported');
  if (isArray && (options.hasOwnProperty('primary') && options.primary!)) throw new Error('Primary key cannot be an Array');
  if (
    (options.hasOwnProperty('primary') && options.primary!) && 
    (options.hasOwnProperty('null') && options.nullable!)
  ) throw new Error('Primary key cannot be nullable');

  const size = allocSize > 1 ? `(${allocSize})` : '';
  const array = isArray ? `[${allocSize > 1 ? allocSize : ''}]` : '';
  switch (type) {
    case 'boolean': return `${name.toLowerCase()} BOOL${isNullable}${isPrimary}`;
    case 'string': return `${name.toLowerCase()} VARCHAR${size}${array}${isNullable}${isPrimary}`;
    case 'bigint': return `${name.toLowerCase()} BIGINT${array}${isNullable}${isPrimary}`;
    case 'number': return `${name.toLowerCase()} INTEGER${array}${isNullable}${isPrimary}`;
    case 'float': return `${name.toLowerCase()} DOUBLE${array}${isNullable}${isPrimary}`;

    default: throw new Error(`JavaScript type '${type}' is not a valid type`);
  }
}

/**
 * Converts an Array to SQL
 * @param values The values
 */
export const convertArrayToSql = (values: unknown[]) => `ARRAY[${values.length ? values.map(escape).join(', ') : ''}]`;

/**
 * Stringifies a JavaScript object
 * @param value The value to use
 */
export function getKindOf(value: unknown) {
  if (!['object', 'function', 'number'].includes(typeof value)) return typeof value;
  if (typeof value === 'number') return Number.isInteger(value) ? 'number' : 'float';
  if (Array.isArray(value)) return 'array';
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'function') {
    const type = value.toString();

    if (type.startsWith('function')) return 'function';
    if (type.startsWith('class')) return 'class';
  }

  return 'object';
}