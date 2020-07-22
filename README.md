# @augu/maru
> :seedling: **| Make SQL management easier**

## Usage
```ts
import { Dialect, pipelines } from '@augu/maru';

const dialect = new Dialect({
  activeConnections: 3,
  username: 'uwu',
  password: 'owo?',
  host: '127.0.0.1',
  port: 6969
});

const connection = dialect.createConnection();
await connection.connect();

const batch = connection.createBatch();
batch
  .pipe(pipelines.DropTable('test'))
  .pipe(pipelines.CreateTable('test', {
    owo: {
      nullable: false,
      primary: false,
      type: 'object'
    },
    id: {
      nullable: false,
      primary: true,
      type: 'string'
    }
  }, true))
  .pipe(pipelines.Insert({
    values: {
      id: '1',
      owo: {
        uwu: true,
        hecc: false
      }
    },
    table: 'test'
  }))
  .pipe(pipelines.Select('test', ['id', '1']))
  .pipe(pipelines.Count('test'))
  .pipe(pipelines.Count('test', 1))
  .pipe(pipelines.Update({
    returning: ['id'],
    values: {
      owo: {
        hecc: true,
        uwu: false
      }
    },
    query: ['id', '1'],
    table: 'test',
    type: 'set'
  }));

const first = await batch.next();
const all = await batch.all();

console.log('First Result:\n', first);
console.log('All Results:\n', all);
```

## License
**Maru** is released under the MIT License, read [here](/LICENSE) for more information