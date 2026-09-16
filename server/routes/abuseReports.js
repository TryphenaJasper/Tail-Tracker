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

router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            animal_id,
            description,
            location,
            latitude,
            longitude,
            image_url
        } = req.body;

        if (!description || !location) {
            return res.status(400).json({
                error: 'Description and location are required'
            });
        }

        const userSupabase = getSupabaseClient(req.token);

        const { data, error } = await userSupabase
            .from('abuse_reports')
            .insert({
                user_id: req.user.id,
                animal_id: animal_id || null,
                description,
                location,
                latitude: latitude || null,
                longitude: longitude || null,
                image_url: image_url || null,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating abuse report:', error);

            return res.status(500).json({
                error: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        }

        res.status(201).json({
            message: 'Abuse report submitted successfully',
            report: data
        });

    } catch (error) {
        console.error('Create abuse report error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('abuse_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching abuse reports:', error);

            return res.status(500).json({
                error: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Get abuse reports error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const userSupabase = getSupabaseClient(req.token);

        const { data, error } = await userSupabase
            .from('abuse_reports')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching my abuse reports:', error);

            return res.status(500).json({
                error: error.message
            });
        }

        res.status(200).json({
            reports: data
        });

    } catch (error) {
        console.error('Get my abuse reports error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('abuse_reports')
            .select('*')
            .eq('report_id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                error: 'Abuse report not found'
            });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Get abuse report error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const {
            description,
            location,
            latitude,
            longitude,
            image_url
        } = req.body;

        const userSupabase = getSupabaseClient(req.token);

        const { data, error } = await userSupabase
            .from('abuse_reports')
            .update({
                description,
                location,
                latitude,
                longitude,
                image_url
            })
            .eq('report_id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({
                error: 'Abuse report not found or you are not the owner'
            });
        }

        res.status(200).json({
            message: 'Abuse report updated successfully',
            report: data
        });

    } catch (error) {
        console.error('Update abuse report error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const userSupabase = getSupabaseClient(req.token);

        const { data, error } = await userSupabase
            .from('abuse_reports')
            .delete()
            .eq('report_id', id)
            .eq('user_id', req.user.id)
            .select();

        if (error) {
            console.error('Error deleting abuse report:', error);

            return res.status(500).json({
                error: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                error: 'Abuse report not found or you are not the owner'
            });
        }

        res.status(200).json({
            message: 'Abuse report deleted successfully'
        });

    } catch (error) {
        console.error('Delete abuse report error:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

export default router;
