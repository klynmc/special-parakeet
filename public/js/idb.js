let db;

const request = indexedDB.open('special-parakeet', 1);

request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_transaction`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadTransaction()
    }
};
  
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite')

    const transObjectStore = transaction.objectStore('new_transaction')

    transObjectStore.add(record)
}

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction', 'readwrite'])

    const transObjectStore = transaction.objectStore('new_transaction')

    const getAll = transObjectStore.getAll()

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction([ 'new_transaction'], 'readwrite')
                const transObjectStore = transaction.objectStore('new_transaction')
                transObjectStore.clear()

                alert('All saved transactions have been submitted!');
            })
            .catch(err => {
                console.log(err)
            });
        }
    };
}

window.addEventListener('online', uploadTransaction);