# v1.0.0
- Publish library

# v1.0.1
## Fixes
- Use objects instead of arrays in Create Table pipe
- Rename `Transaction` to `Batch`

## Additions
- Add an option to close the pool (Dialect#destroy)

# v1.0.2
- Fix publishing

# v1.0.3
## Fixes
- Set `numOfPipes` in Batch to Infinity

## Additions
- Add `Count` pipeline

# v1.1.0
- Add Object supports (object -> jsonb)
- Fixed where the count pipe would return an object of `{ count: number }`, now it returns a number

# v1.2.0
- Fix pipe Update's options
  - Added `returning` to use the SQL type `RETURNING <values>`
  - Fix the SQL string
- Fix pipe Insert's options
  - `columns` are removed in favor of the `values` property (being `key` is the name and `value` being the actual value)
- Updated error strings