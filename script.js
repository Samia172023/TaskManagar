let state = {
  playerName: "User",
  tasks: [], // Initialisation de tasks vide
};

// Modal functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add("active");
  // Prevent body scrolling when modal is open
  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("active");
  // Restore body scrolling
  document.body.style.overflow = "auto";
  // Reset form
  document.getElementById("newTaskForm").reset();
}

// Close modal when clicking outside
window.onclick = function (event) {
  if (event.target.classList.contains("modal")) {
    closeModal(event.target.id);
  }
};

// Load state from localStorage
function loadState() {
  const savedState = localStorage.getItem("questManagerState");
  if (savedState) {
    state = JSON.parse(savedState);
    updateUI();
  }
}

// Save state to localStorage
function saveState() {
  try {
    localStorage.setItem("questManagerState", JSON.stringify(state));
  } catch (error) {
    console.error("Échec de la sauvegarde de l'état:", error);
    // Handle storage quota exceeded
    if (error.name === "QuotaExceededError") {
      alert(
        "Limite de stockage atteinte. Veuillez supprimer certaines tâches."
      );
    }
  }
}

// Update UI elements
function updateUI() {
  document.getElementById("playerName").textContent = state.playerName;
  updateTaskList();
}

// Update task list
function updateTaskList() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  state.tasks.forEach((task, index) => {
    const taskElement = document.createElement("div");
    taskElement.className = `task-item bg-zinc-900 hover:shadow-md hover:bg-zinc-800 rounded-lg p-4 ${
      task.completed ? "opacity-70" : ""
    } transform transition-all duration-300`;
    taskElement.innerHTML = `
        <div class="flex flex-col lg:flex-row md:flex-row justify-between items-start">
          <div>
            <h3 class="font-bold ${task.completed ? "line-through" : ""}">${
      task.title
    }</h3>
            <p class="text-sm text-gray-400">${task.description || ""}</p>
          </div>
          <div class="flex mt-1 lg:m-0 md:m-0 items-center space-x-2">
            ${
              !task.completed
                ? `
                <button onclick="completeTask(${index})" class="px-2 py-1 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors duration-300">
                  <i class="fas fa-check"></i>
                </button>
              `
                : ""
            }
            <button onclick="deleteTask(${index})" class="px-2 py-1 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors duration-300">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    taskList.appendChild(taskElement);
  });

  updateTaskCount(); // Update task count after each task list update
}

// Update task count
function updateTaskCount() {
  const taskCount = state.tasks.length;
  document.getElementById("taskCount").textContent = taskCount;
}

// Task management functions
function addNewTask(event) {
  event.preventDefault();

  // Récupérer les valeurs du formulaire
  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value;

  // Vérifier si les champs ne sont pas vides
  if (title.trim() === "" || description.trim() === "") {
    alert("Tous les champs doivent être remplis!");
    return; // Empêche l'ajout de la tâche si des champs sont vides
  }

  // Ajouter la nouvelle tâche dans l'état
  state.tasks.push({
    title,
    description,
    completed: false,
  });

  // Sauvegarder l'état et mettre à jour l'interface utilisateur
  saveState();
  updateUI();
  closeModal("newTaskModal"); // Fermer le modal après ajout
}

function completeTask(index) {
  const task = state.tasks[index];
  task.completed = true;

  // Mettre à jour les stats et les ressources
  state.stats[task.rewardType] += 10;
  state.xp += 10;
  state.coins += 5;

  if (state.xp >= 100) {
    state.level += 1;
    state.xp -= 100;

    // Afficher une notification de niveau
    const levelUpNotification = document.createElement("div");
    levelUpNotification.className =
      "fixed top-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg";
    levelUpNotification.textContent = `Level Up! Vous êtes maintenant au niveau ${state.level}`;
    document.body.appendChild(levelUpNotification);

    setTimeout(() => {
      levelUpNotification.remove();
    }, 3000);
  }

  // Sauvegarder l'état et mettre à jour l'interface utilisateur
  saveState();
  updateUI();
}

function deleteTask(index) {
  const taskElement = document.querySelector(
    `#taskList > div:nth-child(${index + 1})`
  );
  taskElement.classList.add("opacity-0", "translate-x-4");

  setTimeout(() => {
    state.tasks.splice(index, 1);
    saveState();
    updateUI();
  }, 300);
}

// Edit player name
function editName() {
  const newName = prompt("Enter your new name:", state.playerName);
  if (newName && newName.trim()) {
    state.playerName = newName.trim();
    saveState();
    updateUI();
  }
}

// Handle keyboard events for modal
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const modal = document.querySelector(".modal.active");
    if (modal) {
      closeModal(modal.id);
    }
  }
});

// Prevent form submission when pressing enter in input fields
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });
});

// Initialize app with some example tasks if empty
function initializeApp() {
  loadState();
  if (state.tasks.length === 0) {
    state.tasks = [
      {
        title: "First Task",
        description: "First Task Description",
        rewardType: "strength",
        completed: false,
      },
    ];

    saveState();
    updateUI();
  }
}

// Add custom error handling
window.addEventListener("error", function (event) {
  console.error("An error occurred:", event.error);
  const errorNotification = document.createElement("div");
  errorNotification.className =
    "fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg";
  errorNotification.textContent = "An error occurred. Please try again.";
  document.body.appendChild(errorNotification);

  setTimeout(() => {
    errorNotification.remove();
  }, 3000);
});

// Automatically save state periodically
setInterval(saveState, 10000); // Save every 10 seconds

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});
