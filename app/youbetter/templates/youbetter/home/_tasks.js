var listEl = document.createElement('ul');
var itemTextEl = document.createElement('input');
var today = new Date().toISOString().slice(0, 10);

function addItem (item) {
    var itemEl = document.createElement('li');
    var labelEl = document.createElement('label');
    var checkboxEl = document.createElement('input');

    checkboxEl.type = 'checkbox';
    checkboxEl.id = item._id;
    checkboxEl.checked = item.completed;
    checkboxEl.setAttribute('data-rev', item._rev);
    checkboxEl.addEventListener('change', function () {
        var thisEl = this;
        var thisLabelEl = thisEl.parentElement.querySelector('label')

        db.put({
            _id: thisEl.id,
            _rev: thisEl.getAttribute('data-rev'),
            completed: thisEl.checked,
            description: thisLabelEl.textContent
        }).then(function (response) {
            thisEl.setAttribute('data-rev', response.rev)          
            thisLabelEl.style.textDecoration = thisEl.checked ? 'line-through' : 'none';
        });
    });

    labelEl.setAttribute('for', item._id);
    labelEl.style.paddingLeft = '5px';
    labelEl.textContent = item.description;

    itemEl.append(checkboxEl, labelEl);
    listEl.append(itemEl);
}

listEl.style.listStyle = 'none';

itemTextEl.style.width = '30%';
itemTextEl.style.padding = '6px';
itemTextEl.style.fontSize = 'small';
itemTextEl.placeholder = 'To do...';

itemTextEl.addEventListener('keydown', function (ev) {
    var item = { description: this.value };

    if (ev.key === 'Enter' && item.description !== '') {
        item._id = 'task_' + new Date().toISOString();
        item.completed = false;
        
        db.put(item).then(function (response) {
            item._rev = response.rev;
            addItem(item);
        });

        this.value = '';
    }
});

db.allDocs({
    include_docs: true,
    startkey: 'task_' + today,
    endkey: 'task_' + today + '\uffff'
}).then(function (response) {
    response.rows.forEach(function (row) {
        addItem(row.doc);
    });
});

document.body.append(itemTextEl, listEl);
