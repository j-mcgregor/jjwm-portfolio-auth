import { Router } from 'express';

const router = Router();

router.get('/', (req, res) =>
  res.status(200).json({
    routes: [
      {
        router: 'http://localhost:4000/auth/login',
        method: 'POST'
      },
      {
        router: 'http://localhost:4000/auth/register',
        method: 'POST'
      },
      {
        router: 'http://localhost:4000/auth/verifyUser',
        method: 'GET'
      },
      {
        router: 'http://localhost:4000/auth/logout',
        method: 'GET'
      },
      {
        router: 'http://localhost:4000/auth/currentUser',
        method: 'GET'
      },
      {
        router: 'http://localhost:4000/auth/changePassword',
        method: 'POST'
      }
    ]
  })
);

export default router;
