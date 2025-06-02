import { google } from 'googleapis';
import { gmail_v1 } from 'googleapis/build/src/apis/gmail';
import { db } from './firebase';
import dotenv from 'dotenv';
import cron from 'node-cron';
import fs from 'fs';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];

const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8')).installed;
const token = JSON.parse(fs.readFileSync('token.json', 'utf8'));

const oAuth2Client = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

oAuth2Client.setCredentials(token);

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

interface Voo {
  airline: string;
  arrivalTime: string;
  departureTime: string;
  destination: string;
  origin: string;
  price: string;
  tipo: string;
}

interface Hotel {
  address: string;
  checkin: string;
  checkout: string;
  latitude: string;
  longitude: string;
  name: string;
  price: string;
  rating: string;
  reviews: string;
  total: string;
}

interface DadosImportados {
  voos?: Voo[];
  hoteis?: Hotel[];
}

function extrairDadosDeTexto(corpo: string): DadosImportados {
  const dados: DadosImportados = {};

  // 🔥 Limpa quebras de linha e espaços extras
  const textoLimpo = corpo.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  // 🔍 Regex para Voo
  const vooRegex = /Voo de (.+?) para (.+?), saída às (.+?) e chegada às (.+?), pela (.+?), valor R\$?(\d+[\d.,]*)/i;
  const vooMatch = textoLimpo.match(vooRegex);
  if (vooMatch) {
    dados.voos = [{
      origin: vooMatch[1].trim(),
      destination: vooMatch[2].trim(),
      departureTime: vooMatch[3].trim(),
      arrivalTime: vooMatch[4].trim(),
      airline: vooMatch[5].trim(),
      price: vooMatch[6].trim(),
      tipo: 'ida',
    }];
  }

  // 🔍 Regex para Hotel
  const hotelRegex = /Hotel[:\s]*(.+?), check-in (.+?), check-out (.+?), endereço[:\s]*(.+?), nota (\d[\d.,]*), valor R\$?(\d+[\d.,]*)/i;
  const hotelMatch = textoLimpo.match(hotelRegex);
  if (hotelMatch) {
    dados.hoteis = [{
      name: hotelMatch[1].trim(),
      checkin: hotelMatch[2].trim(),
      checkout: hotelMatch[3].trim(),
      address: hotelMatch[4].trim(),
      latitude: '',
      longitude: '',
      rating: hotelMatch[5].trim(),
      price: hotelMatch[6].trim(),
      reviews: '',
      total: hotelMatch[6].trim(),
    }];
  }

  return dados;
}



async function listarEmails(): Promise<void> {
  console.log('🕒 Verificando e-mails...');

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
    maxResults: 10,
  });

  const mensagens = res.data.messages || [];

  for (const mensagem of mensagens) {
    const email = await gmail.users.messages.get({
      userId: 'me',
      id: mensagem.id!,
      format: 'full',
    });

    const headers = email.data.payload?.headers || [];
    const remetenteRaw = headers.find(h => h.name === 'From')?.value ?? '';
    const remetente = extrairEmail(remetenteRaw);

    // Verifica se o remetente existe no banco
    const user = await buscarUsuarioPorEmail(remetente);

    if (!user) {
      console.warn(`📭 Ignorando e-mail de remetente desconhecido: ${remetente}`);
      await marcarComoLido(mensagem.id!);
      continue;
    }

    const corpo = getBody(email.data);
    console.log('📝 Corpo do e-mail:', corpo);
    try {
      // Tenta localizar blocos JSON de voos e hoteis separadamente
      const voosMatch = corpo.match(/voos\s*[:=]\s*(\[[\s\S]*?\])/);
      const hoteisMatch = corpo.match(/hoteis\s*[:=]\s*(\[[\s\S]*?\])/);

      const dados: DadosImportados = {};

      if (voosMatch) {
        try {
          dados.voos = JSON.parse(voosMatch[1]);
        } catch (e) {
          console.warn("❌ Erro ao interpretar voos:", e);
        }
      }

      if (hoteisMatch) {
        try {
          dados.hoteis = JSON.parse(hoteisMatch[1]);
        } catch (e) {
          console.warn("❌ Erro ao interpretar hoteis:", e);
        }
      }

      if (!dados.voos && !dados.hoteis) {
        const dadosTexto = extrairDadosDeTexto(corpo);
        dados.voos = dadosTexto.voos;
        dados.hoteis = dadosTexto.hoteis;
      }

      if (!dados.voos && !dados.hoteis) {
        console.warn("⚠️ Nenhum dado válido encontrado no e-mail de:", remetente);
        continue;
      }
      const user = await buscarUsuarioPorEmail(remetente);

      if (user) {
        await importarViagem(dados, user.email);
        await marcarComoLido(mensagem.id!);
        console.log(`✅ Importado para ${user.email}`);
      } else {
        console.warn(`⚠️ Nenhum usuário encontrado para o e-mail: ${remetente}`);
      }

    } catch (e) {
      console.error('❌ Erro ao processar e-mail:', e);
    }
  }

}

function extrairEmail(remetente: string): string {
  const match = remetente.match(/<(.+)>/);
  return match ? match[1] : remetente.trim();
}

function getBody(message: gmail_v1.Schema$Message): string {
  const parts = message.payload?.parts;

  if (!parts) {
    const bodyData = message.payload?.body?.data;
    if (!bodyData) return '';
    const buffer = Buffer.from(bodyData, 'base64');
    return buffer.toString('utf-8');
  }

  const part = parts.find(
    p => p.mimeType === 'text/plain'
  ) || parts.find(p => p.mimeType === 'text/html');

  const bodyData = part?.body?.data;

  if (!bodyData) return '';

  const buffer = Buffer.from(bodyData, 'base64');
  const decoded = buffer.toString('utf-8');

  if (part?.mimeType === 'text/html') {
    return decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return decoded.trim();
}


async function buscarUsuarioPorEmail(email: string) {
  const snapshot = await db.collection('users').where('email', '==', email).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, email: doc.data().email };
}

async function importarViagem(dados: DadosImportados, userEmail: string): Promise<void> {
  const snapshot = await db.collection('users').where('email', '==', userEmail).get();
  if (snapshot.empty) {
    console.warn(`⚠️ Nenhum usuário encontrado com o e-mail ${userEmail}`);
    return;
  }

  const userId = snapshot.docs[0].id;

  const tripData: any = {
    userEmail,
    userId,
    origem: 'Importados',
    criadoEm: new Date(),
  };

  if (dados.voos) {
    tripData.voos = dados.voos;
  }

  if (dados.hoteis) {
    tripData.hoteis = dados.hoteis;
  }

  await db.collection('trip').add(tripData);
}

async function marcarComoLido(messageId: string): Promise<void> {
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      removeLabelIds: ['UNREAD'],
    },
  });
}

export async function startEmailImportWatcher() {
  await listarEmails();
}

cron.schedule('*/1 * * * *', async () => {
  await listarEmails();
});