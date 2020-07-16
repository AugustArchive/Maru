# @augu/maru
> :seedling: **| Make SQL management easier**

## Usage
```ts
import { Dialect, pipelines } from '@augu/maru';

const dialect = new Dialect({
  username: 'uwu',
  password: 'owo?',
  host: '127.0.0.1',
  port: 6969
});

const connection = dialect.createConnection();
connection
  .build()
  .then(async(c) => {
    await c.newDatabase();

    const builder = new pipelines.Select({
      table: 'myTable',
      where: ['myColumn', 1]
    });

    const transaction = c.createTransaction();
    transaction.pipe(builder);

    const result = await transaction.getResult();
    if (result === null) console.error(`Results returned null for transaction #${transaction.id}`);
  });

process.on('SIGINT', () => {
  connection.close();
  dialect.destroy();
  process.exit(0);
});
```

## License
**Maru** is released under the MIT License, read [here](/LICENSE) for more information