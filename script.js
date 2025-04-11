// Function to create a new list
function createList() {
    // Get the board element
    const board = document.getElementById("board");

    // Generate a unique ID for the new list
    const listId = "list-" + Date.now();

    // Create the list element
    const list = document.createElement("div");
    list.classList.add("list");
    list.id = listId;

    // Create the header for the list
    const listHeader = document.createElement("div");
    listHeader.classList.add("list-header");

    // Create the list title and make it contenteditable
    const listTitle = document.createElement("h3");
    listTitle.textContent = "New List"; // Default title
    listTitle.contentEditable = true;
    listTitle.classList.add("list-title");

    // Save the list title to local storage when it loses focus (is edited)
    listTitle.addEventListener("blur", () => {
        saveLists();
    });

    // Create a delete button for the list
    const deleteListButton = document.createElement("span");
    deleteListButton.textContent = "x";
    deleteListButton.classList.add("delete-list-button");
    deleteListButton.addEventListener("click", () => {
        list.remove(); // Remove the list from the DOM
        saveLists(); // Update local storage
    });

    // Append the title and delete button to the list header
    listHeader.appendChild(listTitle);
    listHeader.appendChild(deleteListButton);

    // Create a container for cards within the list
    const cardsContainer = document.createElement("div");
    cardsContainer.classList.add("cards-container");

    // Append the header and cards container to the list
    list.appendChild(listHeader);
    list.appendChild(cardsContainer);

    // Append the new list to the board
    board.appendChild(list);

    saveLists(); // Save the new list to local storage


    list.addEventListener("dragstart", (e) => {
        // Add a dragging class and set the data being transferred
        e.target.classList.add("dragging");
        e.dataTransfer.setData("text/plain", e.target.id);
        // Reduce the opacity of the list being dragged
        e.target.style.opacity = "0.5";
    });

    list.addEventListener("dragend", (e) => {
        // Remove the dragging class and reset the opacity
        e.target.classList.remove("dragging");
        e.target.style.opacity = "1";
        saveLists(); // Save the new order of lists
    });

    // Add event listeners to the board to handle the drop
    board.addEventListener("dragover", (e) => {
        // Allow dropping by preventing the default behavior
        e.preventDefault();
    });

    board.addEventListener("drop", (e) => {
        e.preventDefault();
        // Get the ID of the list being dragged
        const draggedListId = e.dataTransfer.getData("text/plain");
        const draggedList = document.getElementById(draggedListId);
        // Get the list that is being dropped on
        const targetList = e.target.closest(".list")
        if (targetList && draggedList !== targetList) {
            board.insertBefore(draggedList, targetList);
            saveLists()
        }
    });
}

// Function to add a card to a list
function addCard(listId) {
    // Get the cards container for the specified list
    const list = document.getElementById(listId);
    const cardsContainer = list.querySelector(".cards-container");

    // Generate a unique ID for the new card
    const cardId = "card-" + Date.now();

    // Create the card element
    const card = document.createElement("div");
    card.classList.add("card");
    card.id = cardId;

    // Create the card content
    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");
    cardContent.innerHTML = `
        <h4 class="card-name">Volunteer Name</h4>
        <p class="card-email">volunteer@email.com</p>
        <p class="card-phone">123-456-7890</p>
    `;

    // Create a delete button for the card
    const deleteCardButton = document.createElement("span");
    deleteCardButton.textContent = "x";
    deleteCardButton.classList.add("delete-card-button");
    deleteCardButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent card from opening when deleting
        card.remove(); // Remove the card from the DOM
        saveLists(); // Update local storage
    });

    // Append the card content and delete button to the card
    card.appendChild(cardContent);
    card.appendChild(deleteCardButton);

    // Append the new card to the cards container
    cardsContainer.appendChild(card);

    // Make the card draggable
    card.setAttribute("draggable", "true");

    card.addEventListener("dragstart", (e) => {
        // Add a dragging class, set the data being transferred, and reduce opacity
        e.stopPropagation()
        e.target.classList.add("dragging");
        e.dataTransfer.setData("text/plain", e.target.id);
        e.dataTransfer.effectAllowed = "move";
        e.target.style.opacity = "0.5";
    });

    card.addEventListener("dragend", (e) => {
        // Remove the dragging class and reset the opacity
        e.target.classList.remove("dragging");
        e.target.style.opacity = "1";
        saveLists(); // Save the new order of cards
    });

    // Add event listeners to the cards container to handle the drop
    cardsContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    });

    cardsContainer.addEventListener("drop", (e) => {
        e.preventDefault();
        // Get the ID of the card being dragged
        const draggedCardId = e.dataTransfer.getData("text/plain");
        const draggedCard = document.getElementById(draggedCardId);
        // Get the card that is being dropped on
        const targetCard = e.target.closest(".card");
        if (targetCard && draggedCard !== targetCard) {
            cardsContainer.insertBefore(draggedCard, targetCard);
            saveLists();
        }
    });
}

function addCard() {
    // Placeholder function for adding cards
}

function moveCard() {
    // Placeholder function for moving cards
}

function openCard() {
    // Placeholder function for opening cards
}

function deleteCard() {
    // Placeholder function for deleting cards
}

// Function to save the lists to local storage
function saveLists() {
    const lists = [];
    document.querySelectorAll(".list").forEach(list => {
        lists.push({
            id: list.id,
            title: list.querySelector(".list-title").textContent
        });
    });
    localStorage.setItem("lists", JSON.stringify(lists));
}

// Function to load the lists from local storage
function loadLists() {
    const lists = JSON.parse(localStorage.getItem("lists")) || [];
    const board = document.getElementById("board");
    if (board) {
        lists.forEach(listData => {
            if (listData && listData.id && listData.title) {
                const list = document.createElement("div");
                list.classList.add("list");
                list.id = listData.id;

                const listHeader = document.createElement("div");
                listHeader.classList.add("list-header");

                const listTitle = document.createElement("h3");
                listTitle.textContent = listData.title;
                listTitle.contentEditable = true;
                listTitle.classList.add("list-title");

                listTitle.addEventListener("blur", () => {
                    saveLists();
                });

                const deleteListButton = document.createElement("span");
                deleteListButton.textContent = "x";
                deleteListButton.classList.add("delete-list-button");
                deleteListButton.addEventListener("click", () => {
                    list.remove();
                    saveLists();
                });

                listHeader.appendChild(listTitle);
                listHeader.appendChild(deleteListButton);

                const cardsContainer = document.createElement("div");
                cardsContainer.classList.add("cards-container");

                list.appendChild(listHeader);
                list.appendChild(cardsContainer);

                board.appendChild(list);
                // Create "Add Card" button and append it to the list
                const addCardButton = document.createElement("button");
                addCardButton.textContent = "Add Card";
                addCardButton.classList.add("add-card-button");
                addCardButton.addEventListener("click", () => addCard(list.id));
                list.appendChild(addCardButton);



                list.setAttribute("draggable", "true");

                list.addEventListener("dragstart", (e) => {
                    e.target.classList.add("dragging");
                    e.dataTransfer.setData("text/plain", e.target.id);
                    e.target.style.opacity = "0.5";
                });

                list.addEventListener("dragend", (e) => {
                    e.target.classList.remove("dragging");
                    e.target.style.opacity = "1";
                    saveLists();
                });
            }
        });

        // Add event listeners to the board to handle the drop
        board.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        board.addEventListener("drop", (e) => {
            e.preventDefault();
            const draggedListId = e.dataTransfer.getData("text/plain");
            const draggedList = document.getElementById(draggedListId);
            const targetList = e.target.closest(".list");
            if (targetList && draggedList !== targetList) board.insertBefore(draggedList, targetList);
            saveLists()
        });
        // Load cards for each list
        lists.forEach(listData => {
            const listElement = document.getElementById(listData.id);
            if (listElement && listData.cards) {
                const cardsContainer = listElement.querySelector(".cards-container");
                listData.cards.forEach(cardData => {
                    addCardToList(cardsContainer, cardData);
                });
            }
        });
    }
}