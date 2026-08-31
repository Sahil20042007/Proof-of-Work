const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Work = require("./models/Work");
const Task = require("./models/Task");
const app = express();
const PORT = 5000;



// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB

async function connectDB() {
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}
// Test route
app.get("/", (req, res) => {
    res.send("Proof of Work Backend is running!");
});

app.post("/api/work", async (req, res) => {
    try {
        const lastWork = await Work.findOne().sort({ order: -1 });

        const nextOrder = lastWork ? lastWork.order + 1 : 1;

        const newWork = await Work.create({
            ...req.body,
            order: nextOrder
        });

        res.status(201).json(newWork);

    } catch (error) {
        res.status(500).json({
            message: "Failed to create work entry",
            error: error.message
        });
    }
});



app.post("/api/tasks", async (req, res) => {
    try {
        const lastTask = await Task.findOne().sort({ order: -1 });

        const nextOrder = lastTask ? lastTask.order + 1 : 1;

        const newTask = await Task.create({
            ...req.body,
            order: nextOrder
        });

        res.status(201).json(newTask);

    } catch (error) {
        res.status(500).json({
            message: "Failed to create task",
            error: error.message
        });
    }
});





app.put("/api/work/:id", async (req, res) => {
    try {
        const updatedWork = await Work.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedWork) {
            return res.status(404).json({
                message: "Work entry not found"
            });
        }

        res.status(200).json(updatedWork);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update work entry",
            error: error.message
        });
    }
});
app.put("/api/tasks/:id", async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!updatedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(updatedTask);

    } catch (error) {
        res.status(500).json({
            message: "Failed to update task",
            error: error.message
        });
    }
});


app.delete("/api/work/:id", async (req, res) => {
    try {
        const deletedWork = await Work.findByIdAndDelete(req.params.id);

        if (!deletedWork) {
            return res.status(404).json({
                message: "Work entry not found"
            });
        }

        res.status(200).json({
            message: "Work entry deleted successfully",
            deletedWork
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete work entry",
            error: error.message
        });
    }
});


app.get("/api/work", async (req, res) => {
    try {
        await connectDB();
        const works = await Work.find().sort({ order: 1 });

        res.status(200).json(works);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch work entries",
            error: error.message
        });
    }
});


app.get("/api/tasks", async (req, res) => {
    try {
        await connectDB();
        const tasks = await Task.find().sort({ order: 1 });

        res.status(200).json(tasks);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});