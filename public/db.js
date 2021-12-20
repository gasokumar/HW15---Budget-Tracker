// Creating an empty db variable
let db;

// Request references the indexedDB 'budget'
const request = indexedDB.open("budget", 1);

// Creating an object store named pending in indexedDB.
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending transactions", { autoIncrement: true });
};
