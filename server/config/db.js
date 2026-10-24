import dns from 'node:dns';
import mongoose from 'mongoose';

const FALLBACK_DNS = ['1.1.1.1', '8.8.8.8', '9.9.9.9'];

async function hostFromUri(uri) {
  try {
    return new URL(uri).host;
  } catch {
    return '';
  }
}

async function ensureDns(host) {
  if (!host) return;
  const srvName = `_mongodb._tcp.${host}`;
  await new Promise((resolve) => {
    dns.resolveSrv(srvName, (err) => {
      if (err) {
        console.warn('Local DNS failed for MongoDB SRV lookup → switching to public resolvers');
        dns.setServers(FALLBACK_DNS);
      }
      resolve();
    });
  });
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'TriumphArcheryPortal';

  if (!uri) {
    throw new Error('MONGODB_URI is missing. Add it to server/.env');
  }

  await ensureDns(await hostFromUri(uri));
  await mongoose.connect(uri, { dbName });
  console.log(`MongoDB connected → ${mongoose.connection.name}`);
}

export function disconnectDB() {
  return mongoose.connection.close();
}
