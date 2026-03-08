const express        = require('express');
const router         = express.Router();
const Order          = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const { mapRequestToDb, mapDbToResponse } = require('../mapper');

router.use(authMiddleware);

function validateBody(body) {
  const errors = [];
  if (!body.numeroPedido || typeof body.numeroPedido !== 'string')
    errors.push('"numeroPedido" é obrigatório e deve ser string.');
  if (body.valorTotal === undefined || typeof body.valorTotal !== 'number')
    errors.push('"valorTotal" é obrigatório e deve ser número.');
  if (!body.dataCriacao || isNaN(new Date(body.dataCriacao)))
    errors.push('"dataCriacao" deve ser uma data ISO 8601 válida.');
  if (!Array.isArray(body.items) || body.items.length === 0)
    errors.push('"items" é obrigatório e deve ser array não vazio.');
  return errors;
}

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Gerenciamento de pedidos (requer token JWT)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ItemRequest:
 *       type: object
 *       required: [idItem, quantidadeItem, valorItem]
 *       properties:
 *         idItem:
 *           type: string
 *           example: "2434"
 *         quantidadeItem:
 *           type: number
 *           example: 1
 *         valorItem:
 *           type: number
 *           example: 1000
 *     OrderRequest:
 *       type: object
 *       required: [numeroPedido, valorTotal, dataCriacao, items]
 *       properties:
 *         numeroPedido:
 *           type: string
 *           example: v10089015vdb-01
 *         valorTotal:
 *           type: number
 *           example: 10000
 *         dataCriacao:
 *           type: string
 *           format: date-time
 *           example: "2023-07-19T12:24:11.5299601+00:00"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ItemRequest'
 *     ItemResponse:
 *       type: object
 *       properties:
 *         productId:
 *           type: number
 *           example: 2434
 *         quantity:
 *           type: number
 *           example: 1
 *         price:
 *           type: number
 *           example: 1000
 *     OrderResponse:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           example: v10089015vdb-01
 *         value:
 *           type: number
 *           example: 10000
 *         creationDate:
 *           type: string
 *           format: date-time
 *           example: "2023-07-19T12:24:11.529Z"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ItemResponse'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Mensagem de erro
 */

/**
 * @swagger
 * /order/list:
 *   get:
 *     summary: Lista todos os pedidos
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                   example: 2
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderResponse'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno
 */
router.get('/list', async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json({
      total: orders.length,
      orders: orders.map(mapDbToResponse),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar pedidos.' });
  }
});

/**
 * @swagger
 * /order/{orderId}:
 *   get:
 *     summary: Busca um pedido pelo ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Número do pedido
 *         example: v10089015vdb-01
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pedido não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order)
      return res.status(404).json({ error: `Pedido '${req.params.orderId}' não encontrado.` });
    return res.status(200).json(mapDbToResponse(order));
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar pedido.' });
  }
});

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderRequest'
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Dados inválidos no body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Token ausente ou inválido
 *       409:
 *         description: Pedido com este ID já existe
 */
router.post('/', async (req, res) => {
  try {
    const errors = validateBody(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const mapped = mapRequestToDb(req.body);

    if (await Order.findOne({ orderId: mapped.orderId }))
      return res.status(409).json({ error: `Pedido '${mapped.orderId}' já existe.` });

    const newOrder = await new Order(mapped).save();
    return res.status(201).json(mapDbToResponse(newOrder));
  } catch (error) {
    if (error.name === 'ValidationError')
      return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: 'Erro ao criar pedido.' });
  }
});

/**
 * @swagger
 * /order/{orderId}:
 *   put:
 *     summary: Atualiza um pedido existente
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         example: v10089015vdb-01
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderRequest'
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Pedido não encontrado
 */
router.put('/:orderId', async (req, res) => {
  try {
    const errors = validateBody(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const updated = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      mapRequestToDb(req.body),
      { new: true, runValidators: true }
    );

    if (!updated)
      return res.status(404).json({ error: `Pedido '${req.params.orderId}' não encontrado.` });

    return res.status(200).json(mapDbToResponse(updated));
  } catch (error) {
    if (error.name === 'ValidationError')
      return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: 'Erro ao atualizar pedido.' });
  }
});

/**
 * @swagger
 * /order/{orderId}:
 *   delete:
 *     summary: Remove um pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         example: v10089015vdb-01
 *     responses:
 *       204:
 *         description: Pedido removido com sucesso (sem corpo)
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Pedido não encontrado
 */
router.delete('/:orderId', async (req, res) => {
  try {
    const deleted = await Order.findOneAndDelete({ orderId: req.params.orderId });

    if (!deleted)
      return res.status(404).json({ error: `Pedido '${req.params.orderId}' não encontrado.` });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar pedido.' });
  }
});

module.exports = router;