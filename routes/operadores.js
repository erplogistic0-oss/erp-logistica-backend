const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET - Listar todos los operadores
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('operadores')
    .select('*')
    .order('creado_en', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST - Crear operador
router.post('/', async (req, res) => {
  const { nombre, telefono, pin_acceso, usuario, rol, activo } = req.body;
  const { data, error } = await supabase
    .from('operadores')
    .insert([{ nombre, telefono, pin_acceso, usuario, rol: rol || 'chofer', activo: activo ?? true }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// PUT - Actualizar operador
router.put('/:id', async (req, res) => {
  const { nombre, telefono, pin_acceso, usuario, rol, activo } = req.body;
  const { data, error } = await supabase
    .from('operadores')
    .update({ nombre, telefono, pin_acceso, usuario, rol, activo })
    .eq('id', req.params.id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// DELETE - Eliminar operador
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('operadores')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Operador eliminado' });
});

// POST - Login con usuario + PIN
router.post('/login', async (req, res) => {
  const { usuario, pin } = req.body;

  if (!usuario || !pin) {
    return res.status(400).json({ error: 'Usuario y PIN son requeridos' });
  }

  const { data, error } = await supabase
    .from('operadores')
    .select('*')
    .ilike('usuario', usuario)
    .eq('pin_acceso', pin)
    .eq('activo', true)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: 'Usuario o PIN incorrecto' });
  }

  res.json({ mensaje: 'Acceso correcto', operador: data, rol: data.rol });
});

module.exports = router;