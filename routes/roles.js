const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET - Listar roles
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('creado_en', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// POST - Crear rol
router.post('/', async (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre es requerido' });
    const { data, error } = await supabase
        .from('roles')
        .insert([{ nombre: nombre.toLowerCase().trim(), descripcion }])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// DELETE - Eliminar rol
router.delete('/:id', async (req, res) => {
    const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ mensaje: 'Rol eliminado' });
});

module.exports = router;