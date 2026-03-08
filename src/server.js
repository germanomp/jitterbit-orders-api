require('dotenv').config(); 


const express      = require('express');
const { connectDatabase } = require('./database');
const { setupSwagger }    = require('./swagger');
const authRoutes          = require('./routes/authRoutes');
const orderRoutes         = require('./routes/orderRoutes');


const app  = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());     


setupSwagger(app);           
app.use('/auth',  authRoutes);   
app.use('/order', orderRoutes);  


app.get('/', (req, res) => {
  res.json({ message: 'API rodando!', docs: `http://localhost:${PORT}/api-docs` });
});


app.use((req, res) => {
  res.status(404).json({ error: `Rota '${req.method} ${req.path}' não existe.` });
});


async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`Swagger:  http://localhost:${PORT}/api-docs`);
  });
}


start();

