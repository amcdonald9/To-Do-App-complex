const todoForm = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const todoList = document.getElementById("todoList");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clearCompleted");
const toggleThemeBtn = document.getElementById("toggleThemeBtn");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

// Save to localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Render todos with filter and animation
function renderTodos() {
  todoList.innerHTML = "";

  let filteredTodos = todos;
  if (currentFilter === "active") {
    filteredTodos = todos.filter(todo => !todo.completed);
  } else if (currentFilter === "completed") {
    filteredTodos = todos.filter(todo => todo.completed);
  }

  filteredTodos.forEach(todo => {
    const li = document.createElement("li");
    li.setAttribute("draggable", "true");
    li.dataset.id = todo.id;
    if (todo.completed) li.classList.add("completed");

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = todo.text;
    span.title = "Click to toggle completed. Double-click to edit.";
    span.addEventListener("click", () => toggleCompleted(todo.id));
    span.addEventListener("dblclick", () => enableEditing(span, todo.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "×";
    deleteBtn.title = "Delete task";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(span);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });

  // Init Sortable for drag and drop
  Sortable.create(todoList, {
    animation: 150,
    onEnd: (evt) => {
      // Update todos array order
      const item = todos.splice(evt.oldIndex, 1)[0];
      todos.splice(evt.newIndex, 0, item);
      saveTodos();
      renderTodos();
    }
  });
}

function addTodo(text) {
  const newTodo = {
    id: Date.now(),
    text,
    completed: false
  };
  todos.push(newTodo);
  saveTodos();
  renderTodos();
}

function toggleCompleted(id) {
  todos = todos.map(todo =>
    todo.id === id ? {...todo, completed: !todo.completed} : todo
  );
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  renderTodos();
}

function enableEditing(span, id) {
  span.contentEditable = true;
  span.focus();

  const saveEdit = () => {
    span.contentEditable = false;
    const newText = span.textContent.trim();
    if (newText) {
      todos = todos.map(todo =>
        todo.id === id ? {...todo, text: newText} : todo
      );
    } else {
      // Remove task if emptied
      todos = todos.filter(todo => todo.id !== id);
    }
    saveTodos();
    renderTodos();
  };

  span.addEventListener("blur", saveEdit, { once: true });

  span.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      span.blur();
    }
    if (e.key === "Escape") {
      span.textContent = todos.find(todo => todo.id === id).text;
      span.contentEditable = false;
    }
  });
}

todoForm.addEventListener("submit", e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text) {
    addTodo(text);
    taskInput.value = "";
  }
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");
    renderTodos();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter(todo => !todo.completed);
  saveTodos();
  renderTodos();
});

toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

// Initial render
renderTodos();

// Initialize theme from localStorage (optional)
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
}
