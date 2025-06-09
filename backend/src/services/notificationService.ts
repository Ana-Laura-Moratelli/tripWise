import { Expo } from 'expo-server-sdk';
import { db } from './firebase';
import { parse, subDays, set, isSameDay } from 'date-fns';
import cron from 'node-cron';

const expo = new Expo();

export async function enviarNotificacoes() {
  const snapshot = await db.collection('users').get();
  const hojeAs10 = set(new Date(), { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 });

  const messages: any[] = [];

  for (const userDoc of snapshot.docs) {
    const user = userDoc.data();
    if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) continue;

    const tripSnapshot = await db.collection('trip').where('userId', '==', userDoc.id).get();

    tripSnapshot.forEach(doc => {
      const trip = doc.data();

      trip.hoteis?.forEach((hotel: any) => {
        const checkin = parse(hotel.checkin + ' 10:00', 'dd/MM/yyyy HH:mm', new Date());
        const alertaCheckin = subDays(checkin, 1);

        if (isSameDay(alertaCheckin, hojeAs10)) {
          messages.push({
            to: user.pushToken,
            sound: 'default',
            title: '📅 Lembrete de Viagem',
            body: `Check-in no hotel ${hotel.name} é amanhã.`,
          });
        }

        const checkout = parse(hotel.checkout + ' 10:00', 'dd/MM/yyyy HH:mm', new Date());
        const alertaCheckout = subDays(checkout, 1);

        if (isSameDay(alertaCheckout, hojeAs10)) {
          messages.push({
            to: user.pushToken,
            sound: 'default',
            title: '📅 Lembrete de Viagem',
            body: `Check-out do hotel ${hotel.name} é amanhã.`,
          });
        }
      });

      trip.voos?.forEach((voo: any) => {
        const partida = parse(voo.departureTime, 'dd/MM/yyyy, HH:mm', new Date());
        const alertaVoo = subDays(partida, 1);

        if (isSameDay(alertaVoo, hojeAs10)) {
          messages.push({
            to: user.pushToken,
            sound: 'default',
            title: '✈️ Lembrete de Voo',
            body: `Seu voo ${voo.origin} → ${voo.destination} é amanhã às ${voo.departureTime.split(', ')[1]}.`,
          });
        }
      });
    });
  }

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      console.log('📤 Notificações enviadas:', receipts);
    } catch (error) {
      console.error('❌ Erro ao enviar notificações:', error);
    }
  }
}

// 🚀 Agendamento do cron — executa todos os dias às 10h da manhã
cron.schedule('48 23 * * *', () => {
  console.log('🔔 Executando envio de notificações às 10h...');
  enviarNotificacoes();
});

/*
cron.schedule('34 9 * * *', () => {
  console.log('🔔 Executando envio de notificações às 9:34...');
  enviarNotificacoes();
});
*/