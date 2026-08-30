

let workData =[];

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





function showStatus(message) {
    statusMessage.textContent = message;

    clearTimeout(showStatus.timer);
    showStatus.timer = setTimeout(() => {
        statusMessage.textContent = "";
    }, 3000);
}


async function loadWorkFromDatabase() {
    try {
        const response = await fetch("http://localhost:5000/api/work");

        if (!response.ok) {
            throw new Error("Failed to fetch work entries");
        }

        workData = await response.json();

        renderTable();

        console.log("Work entries loaded from MongoDB.");
    } catch (error) {
        console.error("Failed to load work entries:", error);
        showStatus("Failed to load entries from MongoDB.");
    }
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

workForm.addEventListener("submit", async function(event) {
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

    try {
        const response = await fetch("http://localhost:5000/api/work", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(entry)
        });

        if (!response.ok) {
            throw new Error("Failed to save entry");
        }

        const savedEntry = await response.json();

        workData.push(savedEntry);
        renderTable();
        clearForm();

        showStatus("Entry saved to MongoDB successfully!");
    } catch (error) {
        console.error(error);
        showStatus("Failed to save entry.");
    }
});

updateBtn.addEventListener("click", async function() {
    const index = Number(editIndexInput.value);

    if (index < 0 || index >= workData.length) {
        return;
    }

    const item = workData[index];

    const updatedEntry = {
        date: item.date || new Date().toLocaleDateString("en-IN"),
        done: doneInput.value.trim(),
        ongoing: ongoingInput.value.trim(),
        future: futureInput.value.trim()
    };

    try {
        const response = await fetch(
            `http://localhost:5000/api/work/${item._id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedEntry)
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update entry");
        }

        const savedEntry = await response.json();

        workData[index] = savedEntry;

        renderTable();
        clearForm();
        showStatus("Entry updated successfully in MongoDB!");

    } catch (error) {
        console.error(error);
        showStatus("Failed to update entry.");
    }
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

async function removeEntry(index) {
    const item = workData[index];

    const confirmed = confirm(
        `Remove this entry?\n\n${item.done || item.ongoing || item.future}`
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/work/${item._id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete entry");
        }

        workData.splice(index, 1);

        renderTable();

        showStatus("Entry removed successfully from MongoDB!");

    } catch (error) {
        console.error(error);
        showStatus("Failed to remove entry.");
    }
}
async function loadTasks() {
    try {
        const response = await fetch("http://localhost:5000/api/tasks");

        if (!response.ok) {
            throw new Error("Failed to fetch tasks");
        }

        const tasks = await response.json();

        console.log("Tasks loaded:", tasks);
        const activeTasks = tasks.filter(
        task => task.status !== "completed"
        );
        renderTasks(activeTasks);
        checkScheduledTasks(tasks);


    } catch (error) {
        console.error("Failed to load tasks:", error);
    }
}



function renderTasks(tasks) {
    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = "<p>No pending tasks for today.</p>";
        return;
    }

    tasks.forEach((task, index) => {
        const taskItem = document.createElement("div");

        taskItem.className =
            index === 0 ? "task-item next-task" : "task-item";

        taskItem.innerHTML = `
            ${index === 0 ? "<strong>🔔 NEXT TASK</strong>" : ""}

            <h3>${escapeHtml(task.title)}</h3>

            <p>Status: ${task.status}</p>
            <p>Priority: ${task.priority}</p>
            <p>Time: ${task.scheduledTime || "Not scheduled"}</p>

            <div>
                <button onclick="completeTask('${task._id}')">
                    Complete
                </button>

                <button onclick="snoozeTask('${task._id}')">
                    Snooze 10 min
                </button>
            </div>
        `;

        taskList.appendChild(taskItem);
    });
}


async function completeTask(taskId) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/tasks/${taskId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: "completed",
                    completedAt: new Date().toISOString()
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to complete task");
        }

        const updatedTask = await response.json();

        console.log("Task completed:", updatedTask);

        loadTasks();

    } catch (error) {
        console.error("Failed to complete task:", error);
    }
}
async function snoozeTask(taskId) {
    try {
        const newTime = new Date(Date.now() + 10 * 60 * 1000);

        const scheduledDate = newTime.toLocaleDateString("en-IN");
        const scheduledTime = newTime.toTimeString().slice(0, 5);

        const response = await fetch(
            `http://localhost:5000/api/tasks/${taskId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    scheduledDate: scheduledDate,
                    scheduledTime: scheduledTime,
                    status: "snoozed",
                    notifiedAt: null
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to snooze task");
        }

        const updatedTask = await response.json();

        console.log("Task snoozed:", updatedTask);

        loadTasks();

    } catch (error) {
        console.error("Failed to snooze task:", error);
    }
}


function clearForm() {
    workForm.reset();
    editIndexInput.value = -1;

    formTitle.textContent = "Add Proof of Work";
    submitBtn.classList.remove("hidden");
    updateBtn.classList.add("hidden");
}

clearBtn.addEventListener("click", clearForm);

async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications.");
        return;
    }

    if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();

        console.log("Notification permission:", permission);
    } else {
        console.log("Notification permission:", Notification.permission);
    }
}

requestNotificationPermission();
function testNotification() {
    if (Notification.permission === "granted") {
        new Notification("Proof of Work", {
            body: "This is your task reminder test."
        });
    } else {
        console.log("Notification permission not granted.");
    }

}

function sendTaskNotification(task) {
    if (Notification.permission !== "granted") {
        return;
    }

    new Notification("🔔 Proof of Work — Task Reminder", {
        body: `It's time for: ${task.title}`,
        requireInteraction: true
    });
}
async function checkScheduledTasks(tasks) {
    const now = new Date();

    const today = now.toLocaleDateString("en-IN");
    const currentTime = now.toTimeString().slice(0, 5);

    for (const task of tasks) {
        if (
            task.status === "completed" ||
            task.scheduledDate !== today ||
            !task.scheduledTime ||
            task.scheduledTime !== currentTime ||
            task.notifiedAt
        ) {
            continue;
        }

        sendTaskNotification(task);

        try {
            await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    notifiedAt: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error("Failed to save notification status:", error);
        }
    }
}

function checkScheduledTasks(tasks) {
    const now = new Date();

    const today = now.toLocaleDateString("en-IN");
    const currentTime = now.toTimeString().slice(0, 5);

    tasks.forEach((task) => {
        if (
            task.status === "completed" ||
            task.scheduledDate !== today ||
            !task.scheduledTime
        ) {
            return;
        }

        if (task.scheduledTime === currentTime) {
            sendTaskNotification(task);
        }
    });
}

loadWorkFromDatabase();
loadTasks();
setInterval(() => {
    loadTasks();
}, 60000);
setInterval(async () => {
    try {
        const response = await fetch("http://localhost:5000/api/tasks");

        if (!response.ok) {
            return;
        }

        const tasks = await response.json();

        checkScheduledTasks(tasks);

    } catch (error) {
        console.error("Scheduler error:", error);
    }
}, 60000);

