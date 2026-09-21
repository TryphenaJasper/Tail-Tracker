
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const getSupabaseClient = (token) => {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};


// POST /api/adoptions
// Create an adoption request
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { animal_id } = req.body;

        if (!animal_id) {
            return res.status(400).json({
                error: 'Animal ID is required'
            });
        }

        const userSupabase = getSupabaseClient(req.token);

        // Check whether animal exists
        const { data: animal, error: animalError } = await userSupabase
            .from('animals')
            .select('animal_id, status')
            .eq('animal_id', animal_id)
            .single();

        if (animalError || !animal) {
            return res.status(404).json({
                error: 'Animal not found'
            });
        }

        // Check whether animal is available
        if (animal.status !== 'available') {
            return res.status(400).json({
                error: 'This animal is not currently available for adoption'
            });
        }

        // Check if user already applied
        const { data: existingRequest, error: existingError } =
            await userSupabase
                .from('adoption_requests')
                .select('request_id')
                .eq('animal_id', animal_id)
                .eq('user_id', req.user.id)
                .maybeSingle();

        if (existingError) {
            return res.status(500).json({
                error: existingError.message
            });
        }

        if (existingRequest) {
            return res.status(409).json({
                error: 'You have already submitted an adoption request for this animal'
            });
        }

        // Create request
        const { data, error } = await userSupabase
            .from('adoption_requests')
            .insert({
                animal_id,
                user_id: req.user.id,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        res.status(201).json({
            message: 'Adoption request submitted successfully',
            request: data
        });

    } catch (error) {
        console.error('Create adoption request error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// GET /api/adoptions/my
// Get logged-in user's adoption requests
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const userSupabase = getSupabaseClient(req.token);

        const { data, error } = await userSupabase
            .from('adoption_requests')
            .select(`
                *,
                animals (
                    animal_id,
                    name,
                    species,
                    breed,
                    age,
                    gender,
                    location,
                    health_status,
                    image_url,
                    status
                )
            `)
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        res.status(200).json({
            requests: data
        });

    } catch (error) {
        console.error('Get adoption requests error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// PUT /api/adoptions/:id
// Update own adoption request
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const userSupabase = getSupabaseClient(req.token);

        // There is currently nothing to update because
        // the message column has been removed.

        return res.status(400).json({
            error: 'Adoption requests cannot be edited'
        });

    } catch (error) {
        console.error('Update adoption request error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// DELETE /api/adoptions/:id
// Delete own adoption request
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const userSupabase = getSupabaseClient(req.token);

        const { data, error } = await userSupabase
            .from('adoption_requests')
            .delete()
            .eq('request_id', id)
            .eq('user_id', req.user.id)
            .select();

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                error: 'Adoption request not found'
            });
        }

        res.status(200).json({
            message: 'Adoption request deleted successfully'
        });

    } catch (error) {
        console.error('Delete adoption request error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


export default router;

