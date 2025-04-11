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
        if (!draggedCardId) return; //if there's no dragged card id, then do nothing
        const draggedCard = document.getElementById(draggedCardId)
        // Get the card that is being dropped on
        const targetCard = e.target.closest(".card");
        if (targetCard && draggedCard !== targetCard) {
            cardsContainer.insertBefore(draggedCard, targetCard);
            saveLists();
        }
    });
}

// Function to open the card modal with volunteer information
function openCard(card) {
    const cardId = card.id;

    // Retrieve card data from local storage
    const cardData = getCardData(cardId);

    // If card data doesn't exist (e.g., card created before data persistence was implemented),
    // create an empty data object to prevent errors.
    if (!cardData) {
        return; // Stop the function if no card data is found
    }

    // Get the modal and modal content elements
    const modal = document.getElementById("cardModal");
    const modalContent = document.getElementById("modalContent");

    // Clear previous content in the modal
    modalContent.innerHTML = "";

    const nameElement = document.createElement("h2");
    nameElement.textContent = cardData.name;

    const emailElement = document.createElement("p");
    emailElement.textContent = `Email: ${cardData.email}`;

    const phoneElement = document.createElement("p");
    phoneElement.textContent = `Phone: ${cardData.phone}`;

    // Create tabs
    const tabs = document.createElement("div");
    tabs.classList.add("modal-tabs");
    tabs.innerHTML = `
        <button class="tab-button active" onclick="openTab(event, 'details')">Details</button>
        <button class="tab-button" onclick="openTab(event, 'attachments')">Attachments</button>
        <button class="tab-button" onclick="openTab(event, 'checklist')">Checklist</button>
    `;
    modalContent.appendChild(tabs);

    // Details Tab Content
    const detailsTab = document.createElement("div");
    detailsTab.id = "details";
    detailsTab.classList.add("tab-content");
    detailsTab.style.display = "block"; // Show by default

    // Add a heading for the details
    const detailsHeading = document.createElement("h3");
    detailsHeading.textContent = "Volunteer Details";
    detailsTab.appendChild(detailsHeading);

    // Create a paragraph element for the details
    const detailsParagraph = document.createElement("p");
        <p><strong>Name:</strong> ${cardData.name}</p>
        <p><strong>Email:</strong> ${cardData.email}</p>
        <p><strong>Phone:</strong> ${cardData.phone}</p>
        <p><strong>Address:</strong> ${cardData.address}, ${cardData.city}, ${cardData.state} ${cardData.zip}</p>
        <p><strong>Interests:</strong> ${cardData.interests}</p>
        <p><strong>Availability:</strong> ${cardData.availability}</p>
        <p><strong>Previous Experience:</strong> ${cardData.previousExperience}</p>
        <div>
            <h3>References</h3>
            ${cardData.references.map(ref => `<p>${ref.name} - ${ref.phone}</p>`).join("")}
    `;
    detailsTab.appendChild(detailsParagraph);

    modalContent.appendChild(detailsTab);

    // Attachments Tab Content (Placeholder)
    const attachmentsTab = document.createElement("div");
    attachmentsTab.id = "attachments";
    attachmentsTab.classList.add("tab-content");
    const addAttachmentButton = document.createElement("button");
    addAttachmentButton.textContent = "Add Attachment";
    addAttachmentButton.addEventListener("click", () => handleAddAttachment(cardId));
    attachmentsTab.appendChild(addAttachmentButton);

    // Create and append the list for attachments
    const attachmentsList = document.createElement("ul");
    attachmentsList.id = `attachments-list-${cardId}`;
    attachmentsTab.appendChild(attachmentsList);

    // If there are already attachments for this card, display them
    if (cardData.attachments && cardData.attachments.length > 0) {
        cardData.attachments.forEach(attachment => {
            const attachmentItem = document.createElement("li");
            attachmentItem.textContent = attachment.name;
            // Add "Set as Profile Picture" button here (implementation will come later)
            // ...
            attachmentsList.appendChild(attachmentItem);
        });
    }

    // Append the Attachments tab content to the modal content
    modalContent.appendChild(attachmentsTab);

    // Checklist Tab Content (Placeholder)
    const checklistTab = document.createElement("div");
    checklistTab.id = "checklist";
    checklistTab.classList.add("tab-content");
    checklistTab.innerHTML = "<p>Checklist will be here.</p>"; // Placeholder text
    modalContent.appendChild(checklistTab);

    // Function to switch tabs
    window.openTab = (event, tabId) => {
        // Hide all tab content
        const tabContent = document.querySelectorAll(".tab-content");
        tabContent.forEach(content => {
            content.style.display = "none";
        });

        // Deactivate all tab buttons
        const tabButtons = document.querySelectorAll(".tab-button");
        tabButtons.forEach(button => {
            button.classList.remove("active");
        });

        // Show the selected tab content and activate the button
        document.getElementById(tabId).style.display = "block";
        event.currentTarget.classList.add("active");
    };

// Function to close the card modal
function closeModal() {
    document.getElementById("cardModal").style.display = "none";
}

// Placeholder function for opening cards
function openCard() {
}

// Placeholder function for deleting cards
function deleteCard() {
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
    saveCards();
}

// Function to add a card to a list with specific data
function addCardToList(cardsContainer, cardData) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.id = cardData.id;
    card.innerHTML = `
        <h4 class="card-name">${cardData.name}</h4>
        <p class="card-email">${cardData.email}</p>
        <p class="card-phone">${cardData.phone}</p>
    `;
    card.setAttribute("draggable", "true");
    cardsContainer.appendChild(card);
    card.addEventListener("click", () => openCard(card));
}

// Function to load the lists from local storage
function loadLists() {
    let lists = JSON.parse(localStorage.getItem("lists")) || [];
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

}

// Helper function to generate sample card data
function getSampleCardData() {
    return {
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "123-456-7890",
        address: "123 Main St",
        city: "Anytown",
        state: "CA",
        zip: "90210",
        interests: "Child Care, Tutoring",
        availability: "Weekdays",
        previousExperience: "5 years",
        references: [
            { name: "Jane Smith", phone: "555-1234" },
            { name: "Peter Jones", phone: "555-5678" }
        ]
    };
}

// Function to add a card to a list with specific data
function addCardToList(cardsContainer, cardData) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.id = cardData.id;
    card.innerHTML = `
        <h4 class="card-name">${cardData.name}</h4>
        <p class="card-email">${cardData.email}</p>
        <p class="card-phone">${cardData.phone}</p>
    `;
    card.setAttribute("draggable", "true");
    cardsContainer.appendChild(card);
    // Add event listener to open the card modal when the card is clicked
    card.addEventListener("click", () => openCard(card));

}

// Function to load the lists from local storage
function loadLists() {
    let lists = JSON.parse(localStorage.getItem("lists")) || [];
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
                const cardsContainer = list.querySelector(".cards-container");
                listData.cards = listData.cards || [];



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
        if (lists.length === 0) {
            // Create the "New Applicants" list if no lists are loaded
            const newList = createList();
        }
    }
}

// Function to generate a unique card ID
function generateCardId() {
    return "card-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

// Function to save card data to local storage
function saveCards() {
    const lists = JSON.parse(localStorage.getItem("lists")) || [];
    lists.forEach(list => {
        const listElement = document.getElementById(list.id);
        if (listElement) {
            const cards = Array.from(listElement.querySelectorAll(".card")).map(card => ({
                id: card.id,
                ...getSampleCardData() // Add the sample card data here
            }));
            list.cards = cards;
        }
    });
    localStorage.setItem("lists", JSON.stringify(lists));
}

function getCardData(cardId) {
    const lists = JSON.parse(localStorage.getItem("lists")) || [];
    for (const list of lists) {
        if (list.cards) {
            const card = list.cards.find(c => c.id === cardId);
            if (card) {
                return card;
            }
        }
    }
    return null;
}

// Function to handle adding attachments
function handleAddAttachment(cardId) {
    // Create an input element for file selection
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true; // Allow multiple file selection

    // Listen for file selection changes
    fileInput.addEventListener("change", (event) => {
        const files = event.target.files; // Get the selected files
        if (files.length > 0) {
            const attachmentsList = document.getElementById(`attachments-list-${cardId}`);
            if (attachmentsList) {
                // Loop through the selected files and add them to the attachments list
                for (const file of files) {
                    const attachmentItem = document.createElement("li");
                    attachmentItem.textContent = file.name;

                    // Add a delete button for the attachment
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.classList.add("delete-attachment-button");
                    deleteButton.addEventListener("click", () => {
                        attachmentItem.remove();
                        // TODO: Remove attachment from data (if implemented)
                    });

                    attachmentItem.appendChild(deleteButton);
                    attachmentsList.appendChild(attachmentItem);
                }
            }
        }
    });

    // Trigger the file input dialog
    fileInput.click();
}

    modal.style.display = "block";
}