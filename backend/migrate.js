const fetch = require("node-fetch");

const oldEntries = [
    {
        done: "Kubernetes & Docker",
        ongoing: "Meta Software React",
        future: "UPSC, MPSC"
    },
    {
        done: "CICD",
        ongoing: "Apna College projects",
        future: "Category c government exam"
    },
    {
        done: "kernel Linux",
        ongoing: "Code writing React",
        future: "MCA degree"
    },
    {
        done: "Five software certificates",
        ongoing: "Fundamentals of computer",
        future: "To increase deadlift weight"
    },
    {
        done: "PSI exam done 1st attempt",
        ongoing: "Python pattern printing",
        future: ""
    },
    {
        done: "BCA completed successfully on own study",
        ongoing: "React cheat sheet writing",
        future: ""
    },
    {
        done: "Gym 2 hours",
        ongoing: "React syllabus writing",
        future: ""
    },
    {
        done: "Company setup pt. ltd.",
        ongoing: "YouTube channel video creation & upload",
        future: ""
    },
    {
        done: "(Diet) 2 eggs, peanut butter, paneer, whey protein, oats",
        ongoing: "",
        future: ""
    }
];

async function migrate() {
    for (const entry of oldEntries) {
        const response = await fetch("http://localhost:5000/api/work", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(entry)
        });

        const result = await response.json();

        console.log("Migrated:", result);
    }
}

migrate();