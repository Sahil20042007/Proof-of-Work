const mongoose = require("mongoose");
require("dotenv").config();

const Work = require("./models/Work");

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const result = await Work.deleteMany({
            order: { $exists: false }
        });

        console.log(`Deleted ${result.deletedCount} entries without order.`);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Cleanup failed:", error.message);
    }
}

cleanup();