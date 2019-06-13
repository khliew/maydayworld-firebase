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
   * DELETE /disco/:id
   * 
   * Deletes a discography.
   */
  // deleteDiscography(req: Request, res: Response) {
  //   const errors = validationResult(req);

  //   if (!errors.isEmpty()) {
  //     res.sendStatus(400);
  //   } else {
  //     const id = req.params[PARAM_ID];

  //     this.dataStore.deleteDiscography(id)
  //       .then(artistId => {
  //         res.status(200)
  //           .send({ data: { artistId: artistId } });
  //       })
  //       .catch(error => {
  //         res.status(404)
  //           .send({
  //             error: {
  //               message: 'Unable to delete discography with id=' + id
  //             }
  //           });
  //       });
  //   }
  // }

  /**
   * PUT /disco/:id
   * 
   * Puts a discography.
   */
  // putDiscography(req: Request, res: Response) {
  //   // tslint:disable-next-line:no-shadowed-variable
  //   const errors = validationResult(req).formatWith(({ msg, param }) => {
  //     return `${param}: ${msg}`;
  //   });

  //   if (!errors.isEmpty()) {
  //     res.sendStatus(400);
  //   } else {
  //     const id = req.params[PARAM_ID];

  //     this.dataStore.replaceDiscography({ ...req.body, artistId: id })
  //       .then(artistId => {
  //         res.status(200)
  //           .send({ data: { artistId: artistId } });
  //       })
  //       .catch(error => {
  //         res.status(404)
  //           .send({
  //             error: {
  //               message: 'Unable to replace discography with id=' + id,
  //             }
  //           });
  //       });
  //   }
  // }

  /**
   * POST /disco
   * 
   * Creates a new discography.
   */
  // postDiscography(req: Request, res: Response) {
  //   // tslint:disable-next-line:no-shadowed-variable
  //   const errors = validationResult(req).formatWith(({ msg, param }) => {
  //     return `${param}: ${msg}`;
  //   });

  //   if (!errors.isEmpty()) {
  //     res.status(400)
  //       .send({
  //         message: errors.array(),
  //         status: res.status
  //       });
  //   } else {
  //     this.dataStore.createDiscography({ ...req.body })
  //       .then(artistId => {
  //         res.status(200)
  //           .send({ data: { artistId: artistId } });
  //       })
  //       .catch(error => {
  //         res.status(500)
  //           .send({
  //             error: {
  //               message: 'Unable to create a new discography.'
  //             }
  //           });
  //       });
  //   }
  // }

  /**
   * Initialize endpoints.
   */
  private init() {
    // const albumValidationSchema: Record<string, ValidationParamSchema> = {
    //   artistId: {
    //     in: 'body',
    //     isString: true,
    //     errorMessage: 'This field is required.',
    //   },
    //   sections: {
    //     in: 'body',
    //     isArray: true,
    //     optional: true
    //   },
    //   'sections.*.label': {
    //     in: 'body',
    //     isString: true,
    //     optional: true
    //   },
    //   'sections.*.albums': {
    //     in: 'body',
    //     isArray: true,
    //     optional: true
    //   },
    // };

    // this.router.post('/', Auth.checkAuth, checkSchema(albumValidationSchema), this.postDiscography.bind(this));
    // this.router.delete(`/:${PARAM_ID}`, Auth.checkAuth, param(PARAM_ID).isString(), this.deleteDiscography.bind(this));
    this.router.get(`/:${PARAM_ID}`, param(PARAM_ID).isString(), this.getDiscography.bind(this));
    // this.router.put(`/:${PARAM_ID}`, Auth.checkAuth, checkSchema(albumValidationSchema), this.putDiscography.bind(this));
  }
}

export default new DiscographyRouter().router;
