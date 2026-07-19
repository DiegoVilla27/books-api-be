import ENVS from '@core/environments';
import mongoose from 'mongoose';

/**
 * Función asíncrona para inicializar la conexión con la base de datos MongoDB utilizando Mongoose.
 * Lee la URI de conexión desde la variable de entorno `MONGO_URI`.
 * 
 * @returns Una promesa que se resuelve cuando la conexión ha sido establecida de forma exitosa.
 */
export const connectMongo = async () => {
  try {
    await mongoose.connect(ENVS.MONGO_URI);
    console.log('🍃 Conectado a MongoDB con éxito');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
  }
};
