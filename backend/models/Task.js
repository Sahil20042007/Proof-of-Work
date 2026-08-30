const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "ongoing", "completed", "snoozed"],
            default: "pending"
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        order: {
            type: Number,
            required: true
        },

        scheduledDate: {
            type: String,
            required: true
        },

        scheduledTime: {
            type: String,
            default: ""
        },

        completedAt: {
            type: Date,
            default: null
        },
        notifiedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);