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

const transaction = connection.createTransaction();
transaction
  .pipe(pipelines.CreateTable('test', [['uwu', 'owo']], true))
  .pipe(pipelines.Insert({
    columns: ['uwu'],
    values: {
      uwu: 'owo'
    },
    table: 'test'
  }))
  .pipe(pipelines.Select('test', ['uwu', 'owo']))
  .pipe(pipelines.DropTable('test'));

const all = await transaction.execute();
console.log(all);
```

## License
**Maru** is released under the MIT License, read [here](/LICENSE) for more information