const { Dialect, pipelines } = require('../build');
const config = require('./config.json');

const dialect = new Dialect({
  activeConnections: 3,
  ...config
});

async function main() {
  const connection = dialect.createConnection();
  addEvents(connection);

  await connection.connect();

  const transaction = connection.createTransaction();
  const results = await transaction
    .setNumOfPipes(1)
    .pipe(pipelines.CreateTable('test', [['uwu', 'owo']], true))
    .pipe(pipelines.Insert({
      columns: ['uwu'],
      values: {
        uwu: 'owo'
      },
      table: 'test'
    }))
    .pipe(pipelines.Select('test', ['uwu', 'owo']))
    .pipe(pipelines.DropTable('test'))
    .execute();

  console.log(results);
}

/*
  columns: string[];
  values: { [P in keyof T]?: T[P] }
  table: string;
*/

function addEvents(connection) {
  connection.on('connect', () => console.log('connected uwu'));
  connection.on('error', console.error);
}

main()
  .then(() => {
    process.exitCode = 0;
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

process.on('SIGINT', () => {
  process.exit(0);
});