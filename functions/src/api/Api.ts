import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as helmet from 'helmet';
// import * as logger from 'morgan';
import AlbumRouter from './routes/AlbumRouter';
import DiscographyRouter from './routes/DiscographyRouter';
// import LogInRouter from './routes/LogInRouter';
// import SongRouter from './routes/SongRouter';

/**
 * Creates an API service using Express.
 */
class Api {
  express: express.Application;

  constructor() {
    this.express = express();

    this.middleware();
    this.routes();
  }

  /**
   * Sets up Express middleware.
   */
  private middleware(): void {
    // this.express.use(logger('dev'));
    this.express.use(helmet());

    // allow CORS
    this.express.use(cors());
    this.express.options('*', cors()); // enable CORS pre-flight

    // body parsers
    this.express.use((req, res, next) => {
      bodyParser.json()(req, res, (err) => {
        if (err) {
          res.sendStatus(400);
        } else {
          next();
        }
      });
    });
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  /**
   * Sets up API endpoints.
   */
  private routes(): void {
    const rootRouter = express.Router();
    rootRouter.get('/', (req, res, next) => res.json('Hello World!'));
    this.express.use('/', rootRouter);

    this.express.use('/albums', AlbumRouter);
    this.express.use('/disco', DiscographyRouter);
    // this.express.use('/login', LogInRouter);
    // this.express.use('/songs', SongRouter);
  }
}

export default new Api().express;
