import { Router } from 'express';
import { dispararNotificacoes, salvarPushToken } from '../controllers/notificationController';

const router = Router();

router.post('/notificar', dispararNotificacoes);
router.post('/savePushToken', salvarPushToken);  
export default router;
