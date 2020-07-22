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