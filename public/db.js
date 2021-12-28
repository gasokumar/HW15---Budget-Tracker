// This file is for offline db use
// https://www.youtube.com/watch?v=VNFDoawcmNc Video on using IndexedDB that helped me
// Creating an empty db variable
let db;

// Request references the indexedDB 'budget'
const request = indexedDB.open("budget", 1);

// Creating an object store named pending in indexedDB.
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pendingTransactions", { autoIncrement: true });
};

// When the database is opened successfully, check if our app is online. If it's online, check the database to see if there's anything in it and post the results to our online database if there is.
request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

// saveRecord function found in index.js line 139. This function saves data to our object store
function saveRecord(record) {
  // Opening a transaction in the object store pendingTransactions
  const transaction = db.transaction(["pendingTransactions"], "readwrite");
  //   Linking the transaction to the object store
  const store = transaction.objectStore("pendingTransactions");
  store.add(record);
}

// This function checks to see if there's anything in our indexedDB (used to store transactions when our app is offline). If there's anything in our database, it posts the data to our database.
function checkDatabase() {
  // Opening a transaction in the object store pendingTransactions
  const transaction = db.transaction(["pendingTransactions"], "readwrite");
  //   Opening the object store for the transaction
  const store = transaction.objectStore("pendingTransactions");
  //   Getting all the data in the object store
  const getAll = store.getAll();

  //   If there's anything in the object store, post the results to our database using the /api/transaction/bulk path.
  getAll.onsuccess = function () {
    console.log("Transaction stored", getAll.result);
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          // delete records if successful
          const transaction = db.transaction(
            ["pendingTransactions"],
            "readwrite"
          );
          const store = transaction.objectStore("pendingTransactions");
          store.clear();
        });
    }
  };
}

// When the app comes back online, run checkDatabase (which posts transactions that have been stored offline to our online database)
window.addEventListener("online", checkDatabase);
