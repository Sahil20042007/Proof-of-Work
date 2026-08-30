const mongoose = require("mongoose");
require("dotenv").config();

const Work = require("./models/Work");

const orderList = [
    "Kubernetes & Docker",
    "CICD",
    "kernel Linux",
    "Five software certificates",
    "PSI exam done 1st attempt",
    "BCA completed successfully on own study",
    "Gym 2 hours",
    "Company setup pt. ltd.",
    "(Diet) 2 eggs, peanut butter, paneer, whey protein, oats",
    "added mobile responsive use functionality",
    "written and created images on human body knowledge"
];

async function setOrder() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        for (let i = 0; i < orderList.length; i++) {
            const updatedWork = await Work.findOneAndUpdate(
                { done: orderList[i] },
                { order: i + 1 },
                { new: true }
            );

            if (updatedWork) {
                console.log(
                    `${i + 1} → ${updatedWork.done}`
                );
            } else {
                console.log(
                    `NOT FOUND → ${orderList[i]}`
                );
            }
        }

        console.log("Order assignment completed.");

        await mongoose.disconnect();
    } catch (error) {
        console.error("Failed:", error.message);
    }
}

setOrder();