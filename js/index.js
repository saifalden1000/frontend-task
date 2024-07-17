"use strict";

const tableBody = document.querySelector("tbody");
const transactionGraph = document
  .getElementById("transactionGraph")
  .getContext("2d");
let customers = [];
let transactions = [];
let chartInstance;

async function fetchData() {
  try {
    let response = await fetch(`../data.json`);
    let data = await response.json();
    customers = data.customers;
    transactions = data.transactions;
    displayTable(transactions);
    updateGraph(transactions);
  } catch (error) {
    console.log("Fetch error: ", error);
  }
}

function displayTable(transactions) {
  let dataTable = "";
  transactions.forEach((transaction) => {
    const customer = customers.find((c) => c.id === transaction.customer_id);
    if (customer) {
      dataTable += `
        <tr onclick="setValue('${customer.name}')">
          <td >${customer.id}</td>
          <td>${customer.name}</td>
          <td>${transaction.date}</td>
          <td>${transaction.amount}</td>
        </tr>`;
    }
  });
  tableBody.innerHTML = dataTable;
}

function filterTable() {
  const customerInput = document.getElementById("customer").value.toLowerCase();
  const transactionInput = document.getElementById("transaction").value;
  const filteredTransactions = transactions.filter((transaction) => {
    const customer = customers.find((c) => c.id === transaction.customer_id);
    const matchesCustomer =
      customer && customer.name.toLowerCase().includes(customerInput);
    const matchesTransaction =
      !transactionInput || transaction.amount >= parseFloat(transactionInput);
    return matchesCustomer && matchesTransaction;
  });

  displayTable(filteredTransactions);
  updateGraph(filteredTransactions);
}

function updateGraph(filteredTransactions) {
  const dates = [
    ...new Set(filteredTransactions.map((transaction) => transaction.date)),
  ].sort();
  const data = dates.map((date) => {
    const totalAmount = filteredTransactions
      .filter((transaction) => transaction.date === date)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    return totalAmount;
  });

  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(transactionGraph, {
    type: "bar",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Total Transaction Amount",
          data: data,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Total Transaction Amount (Stepped Line)",
          data: data,
          type: "line",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Date" } },
        y: { title: { display: true, text: "Amount" } },
      },
    },
  });
}

fetchData();
document.getElementById("customer").addEventListener("input", filterTable);
document.getElementById("transaction").addEventListener("input", filterTable);

function setValue(name) {
  document.getElementById("customer").value = name;
  filterTable();
}
