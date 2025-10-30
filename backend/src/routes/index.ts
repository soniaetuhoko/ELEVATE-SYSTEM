import { Router } from 'express';
import auth from './auth';
import stats from './stats';
import missions from './missions';
import projects from './projects';
import reflections from './reflections';
import collaborations from './collaborations';
import profile from './profile';
import upload from './upload';
import search from './search';
import notifications from './notifications';
import circles from './circles';
import admin from './admin';
import mentors from './mentors';

const router = Router();

router.use('/auth', auth);
router.use('/stats', stats);
router.use('/missions', missions);
router.use('/projects', projects);
router.use('/reflections', reflections);
router.use('/collaborations', collaborations);
router.use('/profile', profile);
router.use('/upload', upload);
router.use('/search', search);
router.use('/notifications', notifications);
router.use('/circles', circles);
router.use('/admin', admin);
router.use('/mentors', mentors);

export default router;
