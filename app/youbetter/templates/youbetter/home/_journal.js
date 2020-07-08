dbReady.done(function () {
    var initialized = false;
    var entryEl = document.createElement('textarea');
    var statusEl = document.createElement('p');
    var entryId = 'journal_' + new Date().toISOString().slice(0, 10);

    statusEl.style.fontStyle = 'italic';
    statusEl.style.fontWeight = 'lighter';
    statusEl.style.marginTop = '5px';
    entryEl.style.width = '100%';
    entryEl.style.boxSizing = 'border-box';
    entryEl.style.padding = '12px';
    entryEl.style.fontSize = 'small';
    entryEl.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    }, false);

    // To avoid conflicts, the UI and sync are initialized
    // after the day's entry has been retrieved from the db
    // or a new entry has been created
    function initialize (entryText) {
        entryEl.value = entryText;

        document.getElementById('page-content').append(entryEl, statusEl);

        entryEl.style.height = entryEl.scrollHeight + 'px';
        entryEl.focus();

        // If there's syncing and a change has been pulled from remote,
        // update the textarea
        if (sync) {
            sync.on('change', function (info) {
                var entry;
                if (info.direction == 'pull') {
                    entry = info.change.docs.find(function (doc) {
                        return doc._id == entryId;
                    });

                    if (entry) {
                        entryEl.value = entry.text;
                        entryEl.style.height = entryEl.scrollHeight + 'px';
                    }
                }
            });
        }

        // Update entry in the db every minute if changed in textarea 
        setInterval(function () {
            db.get(entryId)
            .then(function (entry) {
                if (entryEl.value !== entry.text) {
                    saveEntry({
                        _id: entryId,
                        _rev: entry._rev,
                        text: entryEl.value
                    });
                }
            })
        }, 10000);

        initialized = true;
    }

    function saveEntry (entry) {
        statusEl.textContent = 'Saving...';

        db.put(entry, function () {
            if (!initialized) {
                statusEl.textContent = '';
                initialize(entry.text);
            } else {
                setTimeout(function () {
                    statusEl.textContent = '';
                }, 800);
            }
        });
    }

    // If there's already an entry for today,
    // load it in the text area
    db
    .get(entryId)
    .then(function (entry) {
        initialize(entry.text);
    })
    // Otherwise create a blank entry first
    .catch(function (err) {
        if (err.status !== 404) {
            throw(err);
        } else {
            saveEntry({
                _id: entryId,
                text: ''
            });
        }
    });
});
