const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registro e login de usuários
 */

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário criado!
 *                 username:
 *                   type: string
 *                   example: admin
 *       400:
 *         description: username e password são obrigatórios
 *       409:
 *         description: Usuário já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'username e password são obrigatórios.' });

    const exists = await User.findOne({ username });
    if (exists)
      return res.status(409).json({ error: `Usuário '${username}' já existe.` });

    await new User({ username, password }).save();
    return res.status(201).json({ message: 'Usuário criado!', username });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Faz login e retorna o token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login bem-sucedido — copie o token e use em Authorize
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn:
 *                   type: string
 *                   example: 24h
 *       400:
 *         description: username e password são obrigatórios
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'username e password são obrigatórios.' });

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Credenciais inválidas.' });

    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn }
    );
    return res.status(200).json({ token, expiresIn });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

module.exports = router;