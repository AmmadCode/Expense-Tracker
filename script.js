// --- DOM Element References ---
const input = document.getElementById("amount");
const category = document.getElementById("category");
const date = document.getElementById("date");
const btn = document.getElementById("add-btn");
const tableBody = document.querySelector("#expense-table tbody");
const budgetInput = document.getElementById("budget");
const setBudgetBtn = document.getElementById("set-budget");

// --- Global Variables ---
let expenses = [];
let budget = 0;
let chart;

// --- Unique ID generator (Random + Timestamp) ---
const uuid = () => Date.now() + "_" + Math.random().toString(36).slice(2, 6);

// --- Save to LocalStorage ---
const saveTask = () => localStorage.setItem("expenses", JSON.stringify(expenses));
const saveBudget = () => localStorage.setItem("budget", budget.toString());

// --- Load from LocalStorage on Page Load ---
const loadTask = () => {
  const savedExpenses = localStorage.getItem("expenses");
  const savedBudget = localStorage.getItem("budget");

  if (savedExpenses) expenses = JSON.parse(savedExpenses);
  if (savedBudget) {
    budget = parseFloat(savedBudget);
    budgetInput.value = budget;
  }

  renderTask();
  Total();
  Remaining();
  updateChart();
};

// --- Total Expense Calculator ---
const Total = () => {
  const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  document.getElementById("total").textContent = `$${total.toFixed(2)}`;
  return total;
};

// --- Remaining Budget Calculation ---
const Remaining = () => {
  const total = Total();
  const remaining = budget - total;
  const remainingElement = document.getElementById("remaining");

  remainingElement.textContent = `$${remaining.toFixed(2)}`;
  remainingElement.style.color = remaining < 0 ? "red" : "green";
};

// --- Render Expenses in Table ---
const renderTask = () => {
  tableBody.innerHTML = "";
  expenses.forEach((expense) => {
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>$${expense.amount.toFixed(2)}</td>
      <td>${expense.category}</td>
      <td>${new Date(expense.date).toDateString()}</td>
      <td><button class="delete-btn" data-id="${expense.id}">Delete</button></td>
    `;
  });
};

// --- Add New Expense ---
const addTask = () => {
  const amountVal = parseFloat(input.value.trim());
  const categoryVal = category.value;
  const dateVal = date.value;

  // Validation
  if (isNaN(amountVal) || amountVal <= 0) return alert("Enter a valid number");
  if (!categoryVal) return alert("Choose category");
  if (!dateVal) return alert("Select date");

  const currentTotal = Total();
  if (budget && currentTotal + amountVal > budget) {
    alert("Amount exceeds budget!");
    return;
  }

  const data = {
    id: uuid(),
    amount: amountVal,
    category: categoryVal,
    date: dateVal,
  };

  expenses.push(data);
  input.value = "";
  date.value = "";
  category.value = "";

  renderTask();
  saveTask();
  Total();
  Remaining();
  updateChart();
};

// --- Add Expense Button ---
btn.addEventListener("click", addTask);

// --- Delete Expense ---
document.getElementById("expense-table").addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.getAttribute("data-id");
    expenses = expenses.filter((expense) => expense.id !== id);

    saveTask();
    renderTask();
    Total();
    Remaining();
    updateChart();
  }
});

// --- Set Budget Button ---
setBudgetBtn.addEventListener("click", () => {
  const newBudget = parseFloat(budgetInput.value);
  if (isNaN(newBudget) || newBudget <= 0) {
    alert("Enter valid budget");
    return;
  }

  budget = newBudget;
  budgetInput.value = "";
  saveBudget();
  Total();
  Remaining();
});

// --- Chart.js Pie Chart Setup ---
const updateChart = () => {
  const categoryTotals = {};

  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      label: "Expenses",
      data: Object.values(categoryTotals),
      backgroundColor: ["#f39c12", "#3498db", "#e74c3c", "#2ecc71", "#8e44ad"],
    }]
  };

  if (chart) {
    chart.data = data;
    chart.update();
  } else {
    const ctx = document.getElementById("expense-chart").getContext("2d");
    chart = new Chart(ctx, {
      type: "pie",
      data,
    });
  }
};

// --- Page Load ---
loadTask();
