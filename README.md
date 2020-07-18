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
  .pipe(pipelines.CreateTable('test', {
    uwu: 'string',
    hmm: {
      nullable: false,
      primary: true,
      type: 'string'
    }
  }, true))
  .pipe(pipelines.Insert({
    columns: ['hmm'],
    values: {
      hmm: 'owo'
    },
    table: 'test'
  }))
  .pipe(pipelines.Select('test', ['hmm', 'owo']))
  .pipe(pipelines.DropTable('test'));

const first = await batch.next();
const all = await batch.all();

console.log('First Result:\n', first);
console.log('All Results:\n', all);
```

## License
**Maru** is released under the MIT License, read [here](/LICENSE) for more information