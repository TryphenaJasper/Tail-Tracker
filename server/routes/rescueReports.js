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
// POST /api/rescue-reports
// Create a rescue report
// Protected route
// ==========================================

router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            animal_type,
            animal_id,
            description,
            location,
            latitude,
            longitude,
            image_url,
            severity
        } = req.body;

        // Validate required fields
        if (!description || !location) {
            return res.status(400).json({
                error: 'Description and location are required'
            });
        }

        // Create Supabase client using user's JWT
        const userSupabase = getSupabaseClient(req.token);

        // Create rescue report
        const { data, error } = await userSupabase
            .from('rescue_reports')
            .insert({
                user_id: req.user.id,
                animal_type: animal_type || null,
                animal_id: animal_id || null,
                description,
                location,
                latitude: latitude || null,
                longitude: longitude || null,
                image_url: image_url || null,
                severity: severity || 'medium',
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating rescue report:', error);

            return res.status(500).json({
                error: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        }

        res.status(201).json({
            message: 'Rescue report submitted successfully',
            report: data
        });

    } catch (error) {
        console.error('Create rescue report error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


export default router;

// ==========================================
// GET ALL RESCUE REPORTS
// GET /api/rescue-reports
// Public route
// ==========================================

router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('rescue_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching rescue reports:', error);

            return res.status(500).json({
                error: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Get rescue reports error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// ==========================================
// GET MY RESCUE REPORTS
// GET /api/rescue-reports/my
// Protected route
// ==========================================

router.get('/my', authMiddleware, async (req, res) => {
    try {
        const userSupabase = getSupabaseClient(req.token);

        const { data, error } = await userSupabase
            .from('rescue_reports')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching my rescue reports:', error);

            return res.status(500).json({
                error: error.message
            });
        }

        res.status(200).json({
            reports: data
        });

    } catch (error) {
        console.error('Get my rescue reports error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// ==========================================
// GET ONE RESCUE REPORT
// GET /api/rescue-reports/:id
// Public route
// ==========================================

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('rescue_reports')
            .select('*')
            .eq('report_id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                error: 'Rescue report not found'
            });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Get rescue report error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// ==========================================
// UPDATE RESCUE REPORT
// PUT /api/rescue-reports/:id
// Protected route
// ==========================================

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const {
             animal_type,
            description,
            location,
            latitude,
            longitude,
            image_url,
            severity
        } = req.body;

        const userSupabase = getSupabaseClient(req.token);

        const { data, error } = await userSupabase
            .from('rescue_reports')
            .update({
                animal_type,
                description,
                location,
                latitude,
                longitude,
                image_url,
                severity
            })
            .eq('report_id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({
                error: 'Rescue report not found or you are not the owner'
            });
        }

        res.status(200).json({
            message: 'Rescue report updated successfully',
            report: data
        });

    } catch (error) {
        console.error('Update rescue report error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// ==========================================
// DELETE RESCUE REPORT
// DELETE /api/rescue-reports/:id
// Protected route
// ==========================================

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const userSupabase = getSupabaseClient(req.token);

        const { data, error } = await userSupabase
            .from('rescue_reports')
            .delete()
            .eq('report_id', id)
            .eq('user_id', req.user.id)
            .select();

        if (error) {
            console.error('Error deleting rescue report:', error);

            return res.status(500).json({
                error: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                error: 'Rescue report not found or you are not the owner'
            });
        }

        res.status(200).json({
            message: 'Rescue report deleted successfully'
        });

    } catch (error) {
        console.error('Delete rescue report error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});