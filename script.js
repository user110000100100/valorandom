const tabsContent = document.querySelectorAll('.tab-content');

// ============ URL Parameter ============

const params = new URLSearchParams(window.location.search);
let tabFromUrl = params.get("tab");

if (!tabFromUrl) {
    tabFromUrl = "agents";

    const url = new URL(window.location);
    url.searchParams.set("tab", tabFromUrl);

    window.history.replaceState({}, "", url);
}

// ============ Tabs Handler ============

const activeButton = document.querySelector(`.tab-button[data-target="${tabFromUrl}"]`);
const activeTab = document.getElementById(tabFromUrl);

if (activeButton && activeTab) {
    activeButton.classList.add("active");
    activeTab.classList.add("active");
}

const tabsButtons = document.querySelectorAll('.tab-button');
tabsButtons.forEach(button => {
    button.addEventListener('click', () => {
        const target = button.getAttribute('data-target');

        [tabsButtons, tabsContent].forEach(element => {
            element.forEach(targetElement => {
                targetElement.classList.remove('active');
            });
        });

        const targetPage = document.getElementById(target);
        
        targetPage.classList.add('active');
        button.classList.add('active');

        const url = new URL(window.location);
        url.searchParams.set("tab", target);
        window.history.pushState({}, "", url);
    });
});

// ============ Get Items ============

let items;

fetch("items.json")
.then(response => response.json())
.then(data => {
    items = data;
    init();
});

// ============ Init ============

function init () {
    DisplayItems();
    setupDrawButtons();
    setupDisableSelectItem();
    setupResetButtons();
    resetItemsCount();
}

// ============ Count Items ============

function resetItemsCount () {
    tabsContent.forEach(tab => {
        const leftCount = document.querySelector(`.${tab.id}-left`);
        const totalCount = document.querySelector(`.${tab.id}-total`);

        const left = document.querySelectorAll(`.${tab.id}-item-card:not(.drawn)`).length;
        const total = document.querySelectorAll(`.${tab.id}-item-card`).length;

        leftCount.textContent = left;
        totalCount.textContent = total;
    });
}

// ============ Display Items ============

function createItemCard (type, item) {
    const datasets = Object.entries(item).slice(1);

    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card', `${type}-item-card`);

    const name = item.src.split('.')[0];
    itemCard.dataset.name = name;
    for (const data of datasets) {
        itemCard.dataset[data[0]] = data[1];
    }

    const topCard = document.createElement('div');
    topCard.classList.add('top-card');

    const img = document.createElement('img');
    img.src = `resources/${type}/${item.src}`;
    topCard.appendChild(img);
    
    const bottomCard = document.createElement('div');
    bottomCard.classList.add('bottom-card');

    let infos = [name];
    if (type == 'weapons') infos.push(item.price);

    infos.forEach(info => {
        const p = document.createElement('p');
        p.textContent = info;
        bottomCard.appendChild(p);
    });

    itemCard.appendChild(topCard);
    itemCard.appendChild(bottomCard);

    return itemCard;
}

function DisplayItems () {
    tabsContent.forEach(tab => {
        const list = items[tab.id];
        if (!list) return;

        const elementList = document.querySelector(`.${tab.id}-list`);

        const type = tab.id == 'agents' ? 'role' : 'type';

        for (const item of list) {
            const card = createItemCard(tab.id, item);

            const typeList = document.querySelector(`.${item[type]}-group .bottom-group`);
            if (!typeList) {
                const group = document.createElement('div');
                group.classList.add('items-group', `${item[type]}-group`);

                // -------------- Title --------------
                const topGroup = document.createElement('div');
                topGroup.classList.add('top-group');

                const groupTitle = document.createElement('h1');
                groupTitle.classList.add('group-title', `${item[type]}-title`);
                groupTitle.textContent = item[type] + 's';

                topGroup.appendChild(groupTitle);
                
                // -------------- Cards --------------
                const bottomGroup = document.createElement('div');
                bottomGroup.classList.add('bottom-group');

                bottomGroup.appendChild(card);

                group.appendChild(topGroup);
                group.appendChild(bottomGroup);
                elementList.appendChild(group);
            } else typeList.appendChild(card);
        }
    });
}

// ============ Draw Item ============

function setupDrawButtons () {
    const drawButtons = document.querySelectorAll('.draw-button');
    drawButtons.forEach(button => {

        button.addEventListener('click', () => {
            const currentTab = new URLSearchParams(window.location.search);
            const itemsType = currentTab.get("tab");

            const deleteSwitch = document.querySelector(`.${itemsType}-switch input`);
            let selector = `.${itemsType}-item-card:not(.disable)`;
            if (deleteSwitch.checked) selector += ':not(.drawn)';

            const itemsTargetList = document.querySelectorAll(selector);
            if (!itemsTargetList.length) return;

            const randomIndex = Math.floor(Math.random() * itemsTargetList.length);
            const drawnItem = itemsTargetList[randomIndex];

            if (deleteSwitch.checked) drawnItem.classList.add('drawn');
            showResult(drawnItem);
            resetItemsCount();
        });

    });
}

// ============ Disbale Seclect Item ============

function setupResetButtons () {
    const resetButtons = document.querySelectorAll('.reset-button');
    resetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentTab = new URLSearchParams(window.location.search);
            const itemsType = currentTab.get("tab");
            const itemsCards = document.querySelectorAll(`.${itemsType}-item-card`);
            console.log(itemsCards);

            itemsCards.forEach(item => {
                item.classList.remove('drawn', 'disable');
            });

            const result = document.querySelector('.tab-content.active .drawn-result');
            if (result) result.remove();
            resetItemsCount();
        });
    });
}

function setupDisableSelectItem () {
    const itemsCards = document.querySelectorAll('.item-card');
    itemsCards.forEach(item => {
        item.addEventListener('click', () => {

            if (!item.classList.contains('drawn')) {
                const isDisabled = item.classList.contains('disable');
                isDisabled ? item.classList.remove('disable') : item.classList.add('disable');
            }
            
        });
    });
}

// ============ Show Result ============

function showResult(item) {
    const currentTab = new URLSearchParams(window.location.search);
    const resultType = currentTab.get("tab");

    const resultCard = document.querySelector(`.${resultType}-result-card`);
    if (!resultCard) return;

    resultCard.style.width = '300px';
    resultCard.style.opacity = '1';

    const img = resultCard.querySelector('img');
    const name = resultCard.querySelector('p');

    // Image
    img.src = item.querySelector('img').src;

    // Name
    name.textContent = item.dataset.name;
}