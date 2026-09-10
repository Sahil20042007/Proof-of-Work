// ============================================================
// PROOF OF WORK DATA
// ============================================================

let workData = [];


// ============================================================
// DOM ELEMENT REFERENCES
// ============================================================

// Proof of Work form elements
const workForm = document.getElementById("workForm");
const doneInput = document.getElementById("done");
const ongoingInput = document.getElementById("ongoing");
const futureInput = document.getElementById("future");
const workDateInput = document.getElementById("workDate");

// Form control buttons
const editIndexInput = document.getElementById("editIndex");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");

// Entry display elements
const tableBody = document.getElementById("workTableBody");
const entryCount = document.getElementById("entryCount");
const statusMessage = document.getElementById("statusMessage");
const formTitle = document.getElementById("formTitle");


// ============================================================
// STATUS MESSAGE
// Displays a temporary message to the user.
// ============================================================

function showStatus(message) {
    statusMessage.textContent = message;

    clearTimeout(showStatus.timer);

    showStatus.timer = setTimeout(() => {
        statusMessage.textContent = "";
    }, 3000);
}


// ============================================================
// LOAD PROOF OF WORK ENTRIES
// Fetches all entries from MongoDB through the backend.
// ============================================================

async function loadWorkFromDatabase() {
    try {
        const response = await fetch(
            "https://backend-gray-three-83.vercel.app/api/work"
        );

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


// ============================================================
// RENDER PROOF OF WORK TABLE
// Displays all saved entries in the table.
// ============================================================

function renderTable() {
    tableBody.innerHTML = "";

    // Show empty state when there are no entries.
    if (workData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    No proof-of-work entries yet.
                    Add your first entry above.
                </td>
            </tr>
        `;
    }

    // Create one table row for every entry.
    workData.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="number-cell">${index + 1}</td>

            <td>${item.date || "—"}</td>

            <td>${formatText(item.done)}</td>

            <td>${formatText(item.ongoing)}</td>

            <td>${formatText(item.future)}</td>

            <td class="action-cell">
                <button
                    class="edit-btn"
                    onclick="editEntry(${index})"
                >
                    Edit
                </button>

                <button
                    class="remove-btn"
                    onclick="removeEntry(${index})"
                >
                    Remove
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Update total entry count.
    entryCount.textContent =
        `${workData.length} ${
            workData.length === 1 ? "entry" : "entries"
        }`;
}


// ============================================================
// TEXT FORMATTING HELPERS
// ============================================================

// Safely format text for display in the table.
function formatText(text) {
    if (!text) {
        return "<span style='color:#9ca3af'>—</span>";
    }

    return escapeHtml(text).replace(/\n/g, "<br>");
}


// Prevent user-entered HTML from being interpreted as HTML.
function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// ADD NEW PROOF OF WORK ENTRY
// Saves a new entry to MongoDB.
// ============================================================

workForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get the date selected by the user.
    const selectedDate = workDateInput.value;

    // Create the new entry object.
    const entry = {
        date: selectedDate
            ? new Date(
                selectedDate + "T00:00:00"
              ).toLocaleDateString("en-IN")
            : new Date().toLocaleDateString("en-IN"),

        done: doneInput.value.trim(),

        ongoing: ongoingInput.value.trim(),

        future: futureInput.value.trim()
    };

    // At least one work field must contain something.
    if (!entry.done && !entry.ongoing && !entry.future) {
        showStatus("Please enter at least one value.");
        return;
    }

    try {
        const response = await fetch(
            "https://backend-gray-three-83.vercel.app/api/work",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(entry)
            }
        );

        if (!response.ok) {
            throw new Error("Failed to save entry");
        }

        const savedEntry = await response.json();

        // Add the newly saved entry to the local data.
        workData.push(savedEntry);

        // Refresh the table.
        renderTable();

        // Reset the form.
        clearForm();

        showStatus("Entry saved to MongoDB successfully!");

    } catch (error) {
        console.error(error);

        showStatus("Failed to save entry.");
    }
});


// ============================================================
// UPDATE EXISTING ENTRY
// Sends the edited entry to MongoDB.
// ============================================================

updateBtn.addEventListener("click", async function () {
    const index = Number(editIndexInput.value);

    // Make sure the selected index is valid.
    if (index < 0 || index >= workData.length) {
        return;
    }

    const item = workData[index];

    // Keep the existing date while updating the content.
    const updatedEntry = {
        date: item.date || new Date().toLocaleDateString("en-IN"),

        done: doneInput.value.trim(),

        ongoing: ongoingInput.value.trim(),

        future: futureInput.value.trim()
    };

    try {
        const response = await fetch(
            `https://backend-gray-three-83.vercel.app/api/work/${item._id}`,
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

        // Replace the old entry with the updated entry.
        workData[index] = savedEntry;

        renderTable();

        clearForm();

        showStatus("Entry updated successfully in MongoDB!");

    } catch (error) {
        console.error(error);

        showStatus("Failed to update entry.");
    }
});


// ============================================================
// EDIT ENTRY
// Loads an existing entry into the form.
// ============================================================

function editEntry(index) {
    const item = workData[index];

    doneInput.value = item.done;

    ongoingInput.value = item.ongoing;

    futureInput.value = item.future;

    editIndexInput.value = index;

    // Change the form into edit mode.
    formTitle.textContent = `Edit Entry #${index + 1}`;

    submitBtn.classList.add("hidden");

    updateBtn.classList.remove("hidden");

    // Scroll back to the form.
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ============================================================
// DELETE ENTRY
// Permanently removes an entry from MongoDB.
// ============================================================

async function removeEntry(index) {
    const item = workData[index];

    const confirmed = confirm(
        `Remove this entry?\n\n${
            item.done || item.ongoing || item.future
        }`
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `https://backend-gray-three-83.vercel.app/api/work/${item._id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete entry");
        }

        // Remove the entry from local data.
        workData.splice(index, 1);

        renderTable();

        showStatus("Entry removed successfully from MongoDB!");

    } catch (error) {
        console.error(error);

        showStatus("Failed to remove entry.");
    }
}


// ============================================================
// LOAD TASKS
// Fetches tasks from the backend.
// ============================================================

async function loadTasks() {
    try {
        const response = await fetch(
            "https://backend-gray-three-83.vercel.app/api/tasks"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch tasks");
        }

        const tasks = await response.json();

        console.log("Tasks loaded:", tasks);

        // Only display tasks that are not completed.
        const activeTasks = tasks.filter(
            (task) => task.status !== "completed"
        );

        renderTasks(activeTasks);

        // Check all tasks for scheduled notifications.
        checkScheduledTasks(tasks);

    } catch (error) {
        console.error("Failed to load tasks:", error);
    }
}


// ============================================================
// RENDER TASK LIST
// Displays active tasks on the dashboard.
// ============================================================

function renderTasks(tasks) {
    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = "<p>No pending tasks for today.</p>";
        return;
    }

    tasks.forEach((task, index) => {
        const taskItem = document.createElement("div");

        // Highlight the first task as the next task.
        taskItem.className =
            index === 0
                ? "task-item next-task"
                : "task-item";

        taskItem.innerHTML = `
            ${
                index === 0
                    ? "<strong>🔔 NEXT TASK</strong>"
                    : ""
            }

            <h3>${escapeHtml(task.title)}</h3>

            <p>Status: ${task.status}</p>

            <p>Priority: ${task.priority}</p>

            <p>
                Time:
                ${task.scheduledTime || "Not scheduled"}
            </p>

            <div>
                <button
                    onclick="completeTask('${task._id}')"
                >
                    Complete
                </button>

                <button
                    onclick="snoozeTask('${task._id}')"
                >
                    Snooze 10 min
                </button>
            </div>
        `;

        taskList.appendChild(taskItem);
    });
}


// ============================================================
// COMPLETE TASK
// Marks a task as completed in MongoDB.
// ============================================================

async function completeTask(taskId) {
    try {
        const response = await fetch(
            `https://backend-gray-three-83.vercel.app/api/tasks/${taskId}`,
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

        // Refresh the task list.
        loadTasks();

    } catch (error) {
        console.error(
            "Failed to complete task:",
            error
        );
    }
}


// ============================================================
// SNOOZE TASK
// Moves a task 10 minutes into the future.
// ============================================================

async function snoozeTask(taskId) {
    try {
        const newTime =
            new Date(
                Date.now() + 10 * 60 * 1000
            );

        const scheduledDate =
            newTime.toLocaleDateString("en-IN");

        const scheduledTime =
            newTime.toTimeString().slice(0, 5);

        const response = await fetch(
            `https://backend-gray-three-83.vercel.app/api/tasks/${taskId}`,
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

        // Refresh task list.
        loadTasks();

    } catch (error) {
        console.error(
            "Failed to snooze task:",
            error
        );
    }
}


// ============================================================
// DATE HELPER
// Returns today's date in YYYY-MM-DD format.
// Used by the HTML date input.
// ============================================================

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Set today's date when the page loads.
if (workDateInput) {
    workDateInput.value = getTodayDate();
}


// ============================================================
// RESET ENTRY FORM
// Returns the form to Add Entry mode.
// ============================================================

function clearForm() {
    workForm.reset();

    // Restore today's date after resetting the form.
    if (workDateInput) {
        workDateInput.value = getTodayDate();
    }

    editIndexInput.value = -1;

    formTitle.textContent = "Add Proof of Work";

    submitBtn.classList.remove("hidden");

    updateBtn.classList.add("hidden");
}


// Clear button resets the form.
clearBtn.addEventListener(
    "click",
    clearForm
);


// ============================================================
// BROWSER NOTIFICATION PERMISSION
// Requests permission to show desktop notifications.
// ============================================================

async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log(
            "This browser does not support notifications."
        );

        return;
    }

    if (Notification.permission === "default") {
        const permission =
            await Notification.requestPermission();

        console.log(
            "Notification permission:",
            permission
        );

    } else {
        console.log(
            "Notification permission:",
            Notification.permission
        );
    }
}


// Request permission when the application loads.
requestNotificationPermission();


// ============================================================
// TEST NOTIFICATION
// Manual notification test function.
// ============================================================

function testNotification() {
    if (Notification.permission === "granted") {

        new Notification("Proof of Work", {
            body: "This is your task reminder test."
        });

    } else {
        console.log(
            "Notification permission not granted."
        );
    }
}


// ============================================================
// SEND TASK NOTIFICATION
// Displays the scheduled task reminder.
// ============================================================

function sendTaskNotification(task) {
    if (Notification.permission !== "granted") {
        return;
    }

    new Notification(
        "🔔 Proof of Work — Task Reminder",
        {
            body: `It's time for: ${task.title}`,

            requireInteraction: true
        }
    );
}


// ============================================================
// TASK SCHEDULER
// Checks whether a task should trigger a notification.
// ============================================================

function checkScheduledTasks(tasks) {

    const now = new Date();

    const today =
        now.toLocaleDateString("en-IN");

    const currentTime =
        now.toTimeString().slice(0, 5);

    tasks.forEach((task) => {

        // Ignore completed tasks.
        if (task.status === "completed") {
            return;
        }

        // Ignore tasks scheduled for another date.
        if (task.scheduledDate !== today) {
            return;
        }

        // Ignore tasks without a scheduled time.
        if (!task.scheduledTime) {
            return;
        }

        // Ignore tasks whose scheduled time has not arrived.
        if (task.scheduledTime !== currentTime) {
            return;
        }

        // Send the notification.
        sendTaskNotification(task);
    });
}


// ============================================================
// ADD NEW TASK
// Creates a task from the dashboard form.
// ============================================================

document
    .getElementById("addTaskBtn")
    .addEventListener("click", async () => {

        const title =
            document.getElementById("taskTitle")
                .value
                .trim();

        const scheduledDate =
            document.getElementById("taskDate")
                .value;

        const scheduledTime =
            document.getElementById("taskTime")
                .value;

        const priority =
            document.getElementById("taskPriority")
                .value;


        // Validate task form.
        if (
            !title ||
            !scheduledDate ||
            !scheduledTime
        ) {
            alert(
                "Please fill all task details."
            );

            return;
        }


        try {

            const response = await fetch(
                "https://backend-gray-three-83.vercel.app/api/tasks",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        title: title,

                        status: "pending",

                        priority: priority,

                        scheduledDate: scheduledDate,

                        scheduledTime: scheduledTime
                    })
                }
            );


            if (!response.ok) {
                throw new Error(
                    "Failed to create task"
                );
            }


            const task =
                await response.json();

            console.log(
                "Task created:",
                task
            );


            // Clear task form.
            document.getElementById(
                "taskTitle"
            ).value = "";

            document.getElementById(
                "taskDate"
            ).value = "";

            document.getElementById(
                "taskTime"
            ).value = "";


            // Refresh task list.
            await loadTasks();

        } catch (error) {

            console.error(
                "Error creating task:",
                error
            );

            alert(
                "Failed to create task."
            );
        }
    });


// ============================================================
// APPLICATION STARTUP
// Load existing data when the page opens.
// ============================================================

loadWorkFromDatabase();

loadTasks();


// ============================================================
// TASK AUTO-REFRESH
// Refresh task data every minute.
// ============================================================

setInterval(() => {
    loadTasks();
}, 60000);


// ============================================================
// TASK NOTIFICATION CHECK
// Runs every minute to check scheduled tasks.
// ============================================================

setInterval(async () => {

    try {

        const response = await fetch(
            "https://backend-gray-three-83.vercel.app/api/tasks"
        );

        if (!response.ok) {
            return;
        }

        const tasks =
            await response.json();

        checkScheduledTasks(tasks);

    } catch (error) {

        console.error(
            "Scheduler error:",
            error
        );
    }

}, 60000);