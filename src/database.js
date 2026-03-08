const mongoose = require('mongoose');


async function connectDatabase() {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('Conectado ao MongoDB:', uri);
  } catch (error) {
    console.error('Falha ao conectar:', error.message);
    process.exit(1);  
  }
}


module.exports = { connectDatabase };

