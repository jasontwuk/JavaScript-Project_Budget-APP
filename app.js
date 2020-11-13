// ****** SELECT ITEMS **********
const budgetSubmitBtn = document.querySelector(".budget-submit-btn");
const budgetInput = document.getElementById("budget-input");
const budgetForm = document.querySelector(".budget-form");
const budgetAmount = document.getElementById("budget-amount");
const budgetUpdateBtn = document.querySelector(".budget-update-btn");

const alert = document.querySelector(".alert");

const expenseContainer = document.querySelector(".expense-container");
const expenseName = document.getElementById("expense-name");
const expenseAmount = document.getElementById("expense-amount");
const expenseSubmitBtn = document.querySelector(".expense-submit-btn");
const expenseList = document.querySelector(".expense-list");

const clearBtn = document.querySelector(".clear-btn");

const expenseTotalAmount = document.getElementById("expense-total-amount");
const balanceAmount = document.getElementById("balance-amount");

const checkClearContainer = document.querySelector(".check-clear-container");
const checkClearBtnYes = document.getElementById("check-clear-btn-yes");
const checkClearBtnNo = document.getElementById("check-clear-btn-no");

// *** edit option
let editElementName, editElementAmount;
let editFlag = false;
let editId = "";

// ****** EVENT LISTENERS **********
budgetSubmitBtn.addEventListener("click", budgetSubmit);

budgetUpdateBtn.addEventListener("click", budgetUpdate);

expenseSubmitBtn.addEventListener("click", addItem);

clearBtn.addEventListener("click", showCheckClear);

checkClearBtnYes.addEventListener("click", clearItems);

checkClearBtnNo.addEventListener("click", hideCheckClear);

window.addEventListener("DOMContentLoaded", initializeApp);

// ****** FUNCTIONS **********
// *** budget submit
function budgetSubmit(e) {
  e.preventDefault();
  budgetValue = toDecimalNum(budgetInput.value);
  // console.log("clicked");
  // console.log(budgetValue);

  // !!! For the case that a user has entered expense name and value in their input boxes, but didn't press the add expense btn. Then move on to click budget edit btn.
  clearExpenseInput();

  if (budgetValue >= 0) {
    showBudgetUpdate();
    budgetAmount.textContent = budgetValue;
    displayAlert("budget changed", "success");
    addToLocalStorage("budget", budgetValue);
    displayBalance();
  } else if (budgetValue < 0) {
    // !!! reset input
    budgetInput.value = "";
    displayAlert("please enter positive value", "danger");
    // !!! when user didn't enter a value
  } else {
    displayAlert("please enter value", "danger");
  }
}

// *** show budget update
function showBudgetUpdate() {
  budgetForm.classList.add("show-budget-update");
}

// *** budget update
function budgetUpdate(e) {
  e.preventDefault();
  budgetValue = budgetAmount.textContent;
  budgetInput.value = budgetValue;
  budgetForm.classList.remove("show-budget-update");

  // !!! For the case that a user clicks the edit expense btn, but didn't edit anything. Then move on to click budget edit btn.
  clearExpenseInput();
  expenseSubmitBtn.textContent = "add expense";
  editFlag = false;

  // !!! give focus to budgetInput input box
  budgetInput.focus();
}

// *** expense submit
function addItem(e) {
  e.preventDefault();
  const expenseItemName = expenseName.value;
  const expenseItemValue = toDecimalNum(expenseAmount.value);

  let id = new Date().getTime().toString();
  // console.log(id);

  let value = { id, expenseItemName, expenseItemValue };

  if (expenseItemName && expenseItemValue >= 0 && !editFlag) {
    expenseContainer.classList.add("show-container");
    createListItem(id, expenseItemName, expenseItemValue);
    displayAlert("expense added", "success");

    addToLocalStorage("expense", value);

    displayTotalExpense();
    displayBalance();
    clearExpenseInput();
    // !!! For when a user clicks edit budget btn, but without editting it. We want to show the unchanged budget value (.budget-update-container).
    showBudgetUpdate();
  } else if (expenseItemName && expenseItemValue >= 0 && editFlag) {
    // !!! use the editId for editLocalStorage
    id = editId;
    value = { id, expenseItemName, expenseItemValue };
    editLocalStorage("expense", value);
    displayAlert("expense changed", "success");

    editElementName.innerHTML = "&#8901; " + expenseItemName;
    editElementAmount.innerHTML = expenseItemValue;

    displayTotalExpense();
    displayBalance();
    clearExpenseInput();
    // !!! For when a user clicks edit budget btn, but without editting it. We want to show the unchanged budget value (.budget-update-container).
    showBudgetUpdate();

    editFlag = false;
    expenseSubmitBtn.textContent = "add expense";
  } else if (!expenseItemName && expenseItemValue >= 0) {
    displayAlert("please enter expense name", "danger");
  } else if (expenseItemName && expenseItemValue < 0) {
    displayAlert("please enter positive value", "danger");
  } else if (expenseItemName && isNaN(expenseItemValue)) {
    displayAlert("please enter expense value", "danger");
  } else {
    displayAlert("please enter expense name and value", "danger");
  }
}

// *** clear expense input
function clearExpenseInput() {
  expenseName.value = "";
  expenseAmount.value = "";
}

// *** create list item
function createListItem(id, name, value) {
  const item = document.createElement("article");
  item.classList.add("list-item");
  item.setAttribute("data-id", id);
  item.innerHTML = `<p class="name">&#8901; ${name}</p>
        <p class="amount">${value}</p>
        <div class="btn-container">
            <button type="button" class="edit-btn">
            <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="delete-btn">
            <i class="fas fa-trash"></i>
            </button>
        </div>`;

  // !!! add item to the top of expense list
  expenseList.prepend(item);

  const editBtn = document.querySelector(".edit-btn");
  editBtn.addEventListener("click", editItem);

  const deleteBtn = document.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", deleteItem);
}

// *** edit item
function editItem(e) {
  e.preventDefault();
  const chosenItem = e.currentTarget.parentNode.parentNode;
  editId = chosenItem.dataset.id;
  // console.log(editId);

  editFlag = true;

  editElementName = chosenItem.querySelector(".name");
  editElementAmount = chosenItem.querySelector(".amount");

  // !!! use .substring() to remove the first two characters (- ) in the string
  expenseName.value = editElementName.innerHTML.substring(2);
  expenseAmount.value = editElementAmount.innerHTML;

  // !!! give focus to expenseName input box
  expenseName.focus();

  expenseSubmitBtn.textContent = "edit";

  // !!! For when a user clicks edit budget btn, but without editting it. We want to show the unchanged budget value (.budget-update-container).
  showBudgetUpdate();
}

// *** delete item
function deleteItem(e) {
  e.preventDefault();
  const chosenItem = e.currentTarget.parentNode.parentNode;
  const id = chosenItem.dataset.id;
  // console.log(id);

  expenseList.removeChild(chosenItem);

  if (expenseList.children.length === 0) {
    expenseContainer.classList.remove("show-container");
  }

  displayAlert("expense deleted", "danger");

  removeFromLocalStorage(id);

  // !!! For the case that a user clicks the edit btn, but deletes expense without editting anything. When the user wants to add another expense, they can't. Because the editFlag still true, so computer thinks user wants to edit the expense (which is deleted...).
  editFlag = false;

  displayTotalExpense();
  displayBalance();
  clearExpenseInput();
  // !!! For when a user clicks edit budget btn, but without editting it. We want to show the unchanged budget value (.budget-update-container).
  showBudgetUpdate();
}

// *** clear items
function clearItems() {
  expenseList.innerHTML = "";
  expenseContainer.classList.remove("show-container");

  displayAlert("expenses cleared", "danger");

  clearFromLocalStorage();

  expenseTotalAmount.textContent = "0.00";

  // !!! For the case that a user clicks the edit btn, but deletes expense without editting anything. When the user wants to add another expense, they can't. Because the editFlag still true, so computer thinks user wants to edit the expense (which is deleted...).
  editFlag = false;

  displayTotalExpense();
  displayBalance();
  clearExpenseInput();
  // !!! For when a user clicks edit budget btn, but without editting it. We want to show the unchanged budget value (.budget-update-container).
  showBudgetUpdate();
  hideCheckClear();
}

// *** display alert
function displayAlert(text, status) {
  alert.textContent = text;
  alert.classList.add(`alert-${status}`);
  // *** remove alert
  setTimeout(() => {
    alert.textContent = "";
    alert.classList.remove(`alert-${status}`);
  }, 2000);
}

// *** make sure all numbers have two number of decimals
function toDecimalNum(x) {
  return Number.parseFloat(x).toFixed(2);
}

// *** display total expense
function displayTotalExpense() {
  const storageItem = checkLocalStorage("expense");
  // console.log(storageItem);

  const totalAmount = calcTotalExpense(storageItem);

  // !!! change text color according to value
  if (totalAmount > 0) {
    expenseTotalAmount.style.color = "hsl(360, 67%, 44%)";
  } else {
    expenseTotalAmount.style.color = "#222";
  }

  expenseTotalAmount.textContent = toDecimalNum(totalAmount);
}

function calcTotalExpense(array) {
  let totalAmount;
  if (array.length !== 0) {
    const itemAmounts = array.map((object) => {
      return parseFloat(object.value.expenseItemValue);
    });
    // console.log(itemAmounts);

    const reducer = function (total, x) {
      return total + x;
    };

    // !!! toFixed(2) is to fix some strange situations
    // !!! e.g. 1 + 1 + 5.56 = 7.55999999999999
    totalAmount = itemAmounts.reduce(reducer).toFixed(2);
    // console.log(totalAmount);
  } else {
    totalAmount = 0;
  }

  return totalAmount;
}

// *** display balance
function displayBalance() {
  let budgetValue = checkLocalStorage("budget");
  if (!budgetValue) {
    budgetValue = 0;
  }

  // console.log(budgetValue);
  let expense = checkLocalStorage("expense");
  let expenseValue;
  if (!expense) {
    expenseValue = 0;
  } else {
    expenseValue = calcTotalExpense(expense);
  }
  // console.log(expenseValue);

  let balanceValue = toDecimalNum(budgetValue - expenseValue);

  // !!! change text color according to value
  if (balanceValue > 0) {
    balanceAmount.style.color = "hsl(125, 67%, 44%)";
  } else if (balanceValue < 0) {
    balanceAmount.style.color = "hsl(360, 67%, 44%)";
  } else {
    balanceAmount.style.color = "#222";
  }

  balanceAmount.textContent = balanceValue;
}

function showCheckClear() {
  checkClearContainer.classList.add("show-check-clear");
}

function hideCheckClear() {
  checkClearContainer.classList.remove("show-check-clear");
}

// ****** LOCAL STORAGE **********
// *** localStorage API
// *** setItem, use JSON.stringify() to save as strings
// *** getItem, use JSON.parse() to parese data from localStorage
// *** removeItem

function addToLocalStorage(key, value) {
  if (key === "budget") {
    localStorage = localStorage.setItem(key, JSON.stringify(value));
  }
  if (key === "expense") {
    let storageItem = checkLocalStorage(key);
    const object = { key, value };

    storageItem.push(object);
    localStorage.setItem(key, JSON.stringify(storageItem));
  }
}

function checkLocalStorage(key) {
  if (key === "budget") {
    return JSON.parse(localStorage.getItem(key));
  }
  if (key === "expense") {
    return localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key))
      : [];
  }
}

function editLocalStorage(key, value) {
  // console.log(value);
  // console.log(editId);
  let storageItem = checkLocalStorage(key);
  // console.log(storageItem);
  storageItem = storageItem.map((object) => {
    if (object.value.id === editId) {
      object.value = value;
    }
    return object;
  });
  // console.log(storageItem);
  localStorage.setItem(key, JSON.stringify(storageItem));
}

function removeFromLocalStorage(id) {
  let storageItem = checkLocalStorage("expense");

  storageItem = storageItem.filter((object) => {
    if (object.value.id !== id) {
      return object;
    }
  });

  localStorage.setItem("expense", JSON.stringify(storageItem));
}

function clearFromLocalStorage() {
  let storageItem = checkLocalStorage("expense");

  storageItem = [];

  localStorage.setItem("expense", JSON.stringify(storageItem));
}

// ****** INITIALIZE APP **********
function initializeApp() {
  // !!! budget form
  let budgetValue = checkLocalStorage("budget");
  if (budgetValue) {
    showBudgetUpdate();
    budgetAmount.textContent = budgetValue;
  }

  // !!! expense form
  let expenseListArray = checkLocalStorage("expense");
  // console.log(expenseListArray[0].value.id);
  if (expenseListArray.length > 0) {
    expenseContainer.classList.add("show-container");
    expenseListArray.forEach((item) => {
      createListItem(
        item.value.id,
        item.value.expenseItemName,
        item.value.expenseItemValue
      );
    });
  }

  displayTotalExpense();
  displayBalance();
}
