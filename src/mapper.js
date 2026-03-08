function mapRequestToDb(body) {
  const { numeroPedido, valorTotal, dataCriacao, items } = body;
  return {
    orderId:      numeroPedido,
    value:        valorTotal,
    creationDate: new Date(dataCriacao),
    items: items.map(item => ({
      productId: parseInt(item.idItem, 10),   
      quantity:  item.quantidadeItem,
      price:     item.valorItem,
    })),
  };
}


function mapDbToResponse(doc) {
  return {
    orderId:      doc.orderId,
    value:        doc.value,
    creationDate: doc.creationDate,
    items: doc.items.map(item => ({
      productId: item.productId,
      quantity:  item.quantity,
      price:     item.price,
    })),
  };
}


module.exports = { mapRequestToDb, mapDbToResponse };


