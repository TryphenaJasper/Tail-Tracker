import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
    const { email, password, name, phone, location } = req.body;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                phone,
                location
            }
        }
    });

    if (error) {
        return res.status(400).json({
            message: error.message
        });
    }

    res.status(201).json({
        message: "Signup successful",
        user: data.user,
        session: data.session
    });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const { data, error } =
        await supabase.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        return res.status(401).json({
            message: error.message
        });
    }

    res.json({
        message: "Login successful",
        user: data.user,
        session: data.session
    });
});

export default router;