const STORAGE_KEY = "proofOfWorkData";

const defaultData = [
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

let workData = loadData();

const workForm = document.getElementById("workForm");
const doneInput = document.getElementById("done");
const ongoingInput = document.getElementById("ongoing");
const futureInput = document.getElementById("future");
const editIndexInput = document.getElementById("editIndex");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");
const tableBody = document.getElementById("workTableBody");
const entryCount = document.getElementById("entryCount");
const statusMessage = document.getElementById("statusMessage");
const formTitle = document.getElementById("formTitle");

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (error) {
            console.error("Could not read saved data:", error);
        }
    }

    return [...defaultData];
}

function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workData));
    showStatus("Data saved successfully in your browser.");
}

function showStatus(message) {
    statusMessage.textContent = message;

    clearTimeout(showStatus.timer);
    showStatus.timer = setTimeout(() => {
        statusMessage.textContent = "";
    }, 3000);
}

function renderTable() {
    tableBody.innerHTML = "";

    if (workData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    No proof-of-work entries yet. Add your first entry above.
                </td>
            </tr>
        `;
    }

    workData.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="number-cell">${index + 1}</td>
    <td>${item.date || "—"}</td>
    <td>${formatText(item.done)}</td>
    <td>${formatText(item.ongoing)}</td>
    <td>${formatText(item.future)}</td>
    <td class="action-cell">
        <button class="edit-btn" onclick="editEntry(${index})">Edit</button>
        <button class="remove-btn" onclick="removeEntry(${index})">Remove</button>
    </td>
        `;

        tableBody.appendChild(row);
    });

    entryCount.textContent =
        `${workData.length} ${workData.length === 1 ? "entry" : "entries"}`;
}

function formatText(text) {
    if (!text) return "<span style='color:#9ca3af'>—</span>";

    return escapeHtml(text).replace(/\n/g, "<br>");
}

function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

workForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const entry = {
    date: new Date().toLocaleDateString("en-IN"),
    done: doneInput.value.trim(),
    ongoing: ongoingInput.value.trim(),
    future: futureInput.value.trim()
};

    if (!entry.done && !entry.ongoing && !entry.future) {
        showStatus("Please enter at least one value.");
        return;
    }

    workData.push(entry);
    renderTable();
    clearForm();
    showStatus("New entry added. Click Save to permanently store it.");
});

updateBtn.addEventListener("click", function() {
    const index = Number(editIndexInput.value);

    if (index < 0 || index >= workData.length) {
        return;
    }

    workData[index] = {
    date: workData[index].date || new Date().toLocaleDateString("en-IN"),
    done: doneInput.value.trim(),
    ongoing: ongoingInput.value.trim(),
    future: futureInput.value.trim()
};

    renderTable();
    clearForm();
    showStatus("Entry updated. Click Save to store the latest version.");
});

function editEntry(index) {
    const item = workData[index];

    doneInput.value = item.done;
    ongoingInput.value = item.ongoing;
    futureInput.value = item.future;
    editIndexInput.value = index;

    formTitle.textContent = `Edit Entry #${index + 1}`;
    submitBtn.classList.add("hidden");
    updateBtn.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function removeEntry(index) {
    const item = workData[index];

    const confirmed = confirm(
        `Remove this entry?\n\n${item.done || item.ongoing || item.future}`
    );

    if (!confirmed) {
        return;
    }

    workData.splice(index, 1);
    renderTable();
    showStatus("Entry removed. Click Save to store the change.");
}

function clearForm() {
    workForm.reset();
    editIndexInput.value = -1;

    formTitle.textContent = "Add Proof of Work";
    submitBtn.classList.remove("hidden");
    updateBtn.classList.add("hidden");
}

clearBtn.addEventListener("click", clearForm);

saveBtn.addEventListener("click", function() {
    saveToLocalStorage();
});

renderTable();
