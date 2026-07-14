import mongoose from 'mongoose';

export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('🍃 Conectado a MongoDB con éxito');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
  }
};
