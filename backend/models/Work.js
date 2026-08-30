const mongoose = require("mongoose");

const workSchema = new mongoose.Schema(
    {
        order: {
            type: Number,
            required: true
            
        },
        date: {
            type: String,
            default: ""
        },

        done: {
            type: String,
            default: ""
        },

        ongoing: {
            type: String,
            default: ""
        },

        future: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Work = mongoose.model("Work", workSchema, "entries");

module.exports = Work;