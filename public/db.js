// Creating an empty db variable
let db;
// Opening an indexedDB called budget
const request = indexedDB.open("budget", 1);

// Creating an object store
request.onupgradeneeded = function (event) {
  const db = event.target.result;
};
