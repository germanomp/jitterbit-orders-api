const mongoose = require('mongoose');


const itemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  price:     { type: Number, required: true, min: 0 },
});


const orderSchema = new mongoose.Schema({
  orderId:      { type: String, required: true, unique: true, trim: true },
  value:        { type: Number, required: true, min: 0 },
  creationDate: { type: Date,   required: true },
  items: {
    type: [itemSchema],
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'O pedido deve ter pelo menos 1 item',
    },
  },
}, { versionKey: false });  

module.exports = mongoose.model('Order', orderSchema);

