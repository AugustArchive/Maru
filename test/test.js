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

  const batch = connection.createBatch();
  batch
    .pipe(pipelines.CreateTable('test', {
      uwu: 'owo',
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
}

function addEvents(connection) {
  connection.on('connect', () => console.log('connected uwu'));
  connection.on('error', console.error);
}

main()
  .then(() => {
    process.exit();
  }).catch((error) => {
    console.error(error);
    process.exit();
  });

process.on('SIGINT', () => {
  process.exit(0);
});