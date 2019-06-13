import { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator/check';
import * as admin from 'firebase-admin';

const PARAM_ID = 'id';

export class SongRouter {
  router: Router;

  constructor() {
    this.router = Router();

    this.init();
  }

  /**
   * GET /songs/:id
   * 
   * Gets a song.
   */
  getSong(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.sendStatus(400);
    } else {
      const id = req.params[PARAM_ID];

      admin.firestore().collection('songs').doc(id).get()
        .then(doc => {
          if (doc.exists) {
            res.status(200)
              .send({ data: doc.data() });
          } else {
            res.status(404)
              .send({
                error: {
                  message: `song not found: ${id}`
                }
              });
          }
        })
        .catch(error => {
          res.status(404)
            .send({
              error: {
                message: `song not found: ${id}`
              }
            });
        });
    }
  }

  /**
   * Initialize endpoints.
   */
  private init() {
    this.router.get(`/:${PARAM_ID}`, param(PARAM_ID).isString(), this.getSong.bind(this));
  }
}

export default new SongRouter().router;
