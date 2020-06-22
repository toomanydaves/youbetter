var entryId = 'journal_' + new Date().toISOString().slice(0, 10);
var entryEl = document.createElement('textarea');
var statusEl = document.createElement('p');

function saveEntry (entry) {
    statusEl.textContent = 'Saving...';

    db.put(entry, function () {
        setTimeout(function () {
            statusEl.textContent = '';
        }, 800);
    });
}

// Add and style elements
entryEl.style.width = '100%';
entryEl.style.boxSizing = 'border-box';
entryEl.style.padding = '12px';
entryEl.style.fontSize = 'small';
statusEl.style.fontStyle = 'italic';
statusEl.style.fontWeight = 'lighter';
statusEl.style.marginTop = '5px';

document.body.append(entryEl, statusEl);

entryEl.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
}, false);

// If there's already an entry for today
// load it in the text area
db
.get(entryId)
.then(function (entry) {
    entryEl.value = entry.text;
    entryEl.style.height = entryEl.scrollHeight + 'px';
})
.catch(function (err) {
    if (err.status !== 404) {
        throw(err);
    }
});

// Update today's entry in the db every minute 
setInterval(function () {
    db.get(entryId)
    .then(function (entry) {
        var update;

        if (entryEl.value !== entry.text) {
            update = {
                _id: entryId,
                _rev: entry._rev,
                text: entryEl.value
            };

            if (entryEl.value === '') {
                update._deleted = true;
            }

            saveEntry(update)
        }
    })
    .catch(function (err) {
        if (err.status === 404) {
            if (entryEl.value !== '') {
                saveEntry({
                    _id: entryId,
                    text: entryEl.value
                });
            }
        } else {
            throw err;
        }
    });
}, 10000);
