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
        method: 'POST'
      },
      {
        router: 'http://localhost:4000/auth/changePassword',
        method: 'POST'
      },
      {
        router: 'http://localhost:4000/auth/logout',
        method: 'POST'
      },
      {
        router: 'http://localhost:4000/auth/currentUser',
        method: 'POST'
      }
    ]
  })
);

export default router;
