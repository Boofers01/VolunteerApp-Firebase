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

    // Make the list draggable
    list.setAttribute("draggable", "true");

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
        const targetList = e.target.closest(".list");
        if (targetList && draggedList !== targetList) board.insertBefore(draggedList, targetList);
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

                // Make the list draggable
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
        });
    }
}