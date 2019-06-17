import { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator/check';
import * as admin from 'firebase-admin';
// import { Auth } from '../auth/Auth';
// import DataStore from '../DataStore';

const PARAM_ID = 'id';

export class DiscographyRouter {
  // dataStore: DataStore;
  router: Router;

  constructor() {
    // this.dataStore = DataStore.getInstance();
    this.router = Router();

    this.init();
  }

  /**
   * GET /disco/:id
   * 
   * Gets a discography.
   */
  getDiscography(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.sendStatus(400);
    } else {
      const id = req.params[PARAM_ID];

      admin.firestore().collection('discos').doc(id).get()
        .then(doc => {
          if (doc.exists) {
            res.status(200)
              .send({ data: doc.data() });
          } else {
            res.status(404)
              .send({
                error: {
                  message: `discography not found: ${id}`
                }
              });
          }
        })
        .catch(error => {
          res.status(404)
            .send({
              error: {
                message: `discography not found: ${id}`
              }
            });
        });
    }
  }

  /**
   * Initialize endpoints.
   */
  private init() {
    this.router.get(`/:${PARAM_ID}`, param(PARAM_ID).isString(), this.getDiscography.bind(this));
  }
}

export default new DiscographyRouter().router;
