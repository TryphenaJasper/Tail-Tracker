import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./config/supabase.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
    res.json({
        message: "Tail Tracker backend is running! "
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Tail Tracker server running on port ${PORT}`);
});

app.get("/test-supabase", async (req, res) => {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .limit(1);

    if (error) {
        return res.status(500).json({
            message: "Supabase connection failed",
            error: error.message
        });
    }

    res.json({
        message: "Supabase connection successful!",
        data: data
    });
});