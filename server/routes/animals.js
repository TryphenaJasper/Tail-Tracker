import express from 'express';
import { createClient } from '@supabase/supabase-js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getSupabaseClient = (token) => {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};


// ==========================================
// GET ALL ANIMALS
// GET /api/animals
// Public route
// ==========================================

router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('animals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching animals:', error);

            return res.status(500).json({
                error: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// ==========================================
// GET ONE ANIMAL
// GET /api/animals/:id
// Public route
// ==========================================

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('animals')
            .select('*')
            .eq('animal_id', id)
            .single();

        if (error) {
            return res.status(404).json({
                error: 'Animal not found'
            });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// ==========================================
// CREATE ANIMAL
// POST /api/animals
// Protected route
// ==========================================

router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            name,
            species,
            breed,
            age,
            gender,
            description,
            location,
            latitude,
            longitude,
            health_status,
            health_issues,
            image_url,
            status
        } = req.body;

        if (!name || !species || !location) {
            return res.status(400).json({
                error: 'Name, species and location are required'
            });
        }

        // Create a Supabase client using the user's JWT
        const userSupabase = getSupabaseClient(req.token);

        const { data, error } = await userSupabase
            .from('animals')
            .insert([
                {
                    name,
                    species,
                    breed,
                    age,
                    gender,
                    description,
                    location,
                    latitude,
                    longitude,
                    health_status,
                    health_issues,
                    image_url,
                    status: status || 'available',
                    posted_by: req.user.id
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating animal:', error);

            return res.status(500).json({
                error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
            });
        }

        res.status(201).json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// ==========================================
// UPDATE ANIMAL
// PUT /api/animals/:id
// Protected route
// ==========================================

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            species,
            breed,
            age,
            gender,
            description,
            location,
            latitude,
            longitude,
            health_status,
            health_issues,
            image_url,
            status
        } = req.body;

        const { data, error } = await supabase
            .from('animals')
            .update({
                name,
                species,
                breed,
                age,
                gender,
                description,
                location,
                latitude,
                longitude,
                health_status,
                health_issues,
                image_url,
                status
            })
            .eq('animal_id', id)
            .eq('posted_by', req.user.id)
            .select()
            .single();

        if (error) {
            return res.status(404).json({
                error: 'Animal not found or you are not the owner'
            });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// ==========================================
// DELETE ANIMAL
// DELETE /api/animals/:id
// Protected route
// ==========================================

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('animals')
            .delete()
            .eq('animal_id', id)
            .eq('posted_by', req.user.id)
            .select();

        if (error) {
            console.error('Error deleting animal:', error);

            return res.status(500).json({
                error: 'Failed to delete animal'
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                error: 'Animal not found or you are not the owner'
            });
        }

        res.status(200).json({
            message: 'Animal deleted successfully'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


export default router;