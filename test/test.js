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
      hmm: {
        nullable: false,
        primary: true,
        type: 'string'
      },
      owo: {
        nullable: false,
        primary: false,
        type: 'object'
      }
    }, true))
    .pipe(pipelines.Insert({
      columns: ['hmm', 'owo'],
      values: {
        hmm: 'owo',
        owo: {
          uwu: true,
          hecc: false
        }
      },
      table: 'test'
    }))
    .pipe(pipelines.Select('test', ['hmm', 'owo']))
    .pipe(pipelines.Count('test'))
    .pipe(pipelines.Count('test', 1))
    .pipe(pipelines.DropTable('test'));

  const all = await batch.all();
  console.log(all);
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