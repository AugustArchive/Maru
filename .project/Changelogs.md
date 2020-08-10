# v1.0.0
- Publish library

# v1.0.1
- Use objects instead of arrays in Create Table pipe
- Rename `Transaction` to `Batch`
- Add an option to close the pool (Dialect#destroy)

# v1.0.2
- Fix publishing

# v1.0.3
- Set `numOfPipes` in Batch to Infinity
- Add `Count` pipeline

# v1.1.0
- Add Object supports (object -> jsonb)
- Fixed where the count pipe would return an object of `{ count: number }`, now it returns a number

# v1.2.0
- Fix pipe Update's options
  - Added `returning` option, to use the SQL type `RETURNING <values>`
  - Fix the SQL string for updating values
- Fix pipe Insert's options
  - `columns` are removed in favor of the `values` property (being `key` is the name and `value` being the actual value)
- Updated error strings

# v1.2.1
- Add an `array` option when returning values in `Connection#query` and `Batch#next`
- Enforce Arrays in `Batch#all`
- Fix a bug where an object couldn't be inserted in the Insert pipe [Typings]
- Update JSDoc in typings

# v1.2.2
- Fix typings in `Connection#query`

# v1.2.3
- Fix delete pipeline from using the wrong operator

# v1.2.4
- Add `Dialect#destroy` to typings

# v1.2.5
- Support dates in Insert and CreateTable pipelines
- Convert results from JSON/Date/Counts to the respected value in `Connection#query`