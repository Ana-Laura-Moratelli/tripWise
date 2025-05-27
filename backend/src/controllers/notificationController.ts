import { Request, Response } from 'express';
import { enviarNotificacoes } from '../services/notificationService';
import { db } from '../services/firebase';

export const dispararNotificacoes = async (req: Request, res: Response) => {
  try {
    await enviarNotificacoes();
    res.status(200).send('Notificações enviadas com sucesso!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao enviar notificações.');
  }
};

export const salvarPushToken = async (req: Request, res: Response): Promise<void> => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    res.status(400).json({ error: 'userId e token são obrigatórios' });
    return;
  }

  try {
    await db.collection('users').doc(userId).update({
      pushToken: token,
    });
    res.status(200).json({ success: true, message: 'Push token salvo com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar push token:', error);
    res.status(500).json({ error: 'Erro ao salvar push token' });
  }
};