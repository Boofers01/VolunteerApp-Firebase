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

                // Add "Set as Profile Picture" button
                const setProfilePicButton = document.createElement("button");
                setProfilePicButton.textContent = "Set as Profile Picture";
                setProfilePicButton.classList.add("set-profile-pic-button");
                setProfilePicButton.addEventListener("click", () => {
                    handleSetProfilePicture(cardId, file.name);
                });

                // Add a delete button for the attachment
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.classList.add("delete-attachment-button");
                deleteButton.addEventListener("click", () => {
                    attachmentItem.remove();
                    handleDeleteAttachment(cardId, file.name);
                });

                attachmentItem.appendChild(setProfilePicButton);
                attachmentItem.appendChild(deleteButton);
                attachmentsList.appendChild(attachmentItem);
            }
        }
    });

    // Trigger the file input dialog
    fileInput.click();
}

// Function to handle setting a profile picture
function handleSetProfilePicture(cardId, attachmentName) {
    const lists = JSON.parse(localStorage.getItem("lists")) || [];
    for (const list of lists) {
        const card = list.cards.find(c => c.id === cardId);
        if (card) {
            card.profilePicture = attachmentName;
            // Update the card element on the board if it exists
            const cardElement = document.getElementById(cardId);
            if (cardElement) {
                // Find the element that currently displays the card name and insert the image before it
                const cardNameElement = cardElement.querySelector(".card-name");
                }
            }
    });

    // Trigger the file input dialog
    fileInput.click();
}

// Global variable to store the master checklist items
let masterChecklist = [];

// Function to create the master checklist editor
function createMasterChecklistEditor() {
    const editor = document.createElement("div");
    editor.id = "masterChecklistEditor";
    editor.innerHTML = `
        <h2>Edit Master Checklist</h2>
        <ul id="masterChecklistItems"></ul>
        <input type="text" id="newChecklistItemText" placeholder="New checklist item">
        <button onclick="addMasterChecklistItem()">Add Item</button>
    `;
    document.body.insertBefore(editor, document.getElementById("board"));
    loadMasterChecklist();
}

// Function to add a new item to the master checklist
function addMasterChecklistItem() {
    const newItemText = document.getElementById("newChecklistItemText").value;
    if (newItemText.trim() !== "") {
        masterChecklist.push({ text: newItemText, scheduled: false, completed: false });
        document.getElementById("newChecklistItemText").value = "";
        renderMasterChecklistItems();
        saveMasterChecklist();
    }
}

// Function to render the master checklist items in the editor
function renderMasterChecklistItems() {
    const itemsList = document.getElementById("masterChecklistItems");
    itemsList.innerHTML = "";
    masterChecklist.forEach((item, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <span class="item-text" contenteditable="true">${item.text}</span>
            <button onclick="toggleDateBox(${index}, 'scheduled')" class="${item.scheduled ? 'active' : ''}">Scheduled</button>
            <button onclick="toggleDateBox(${index}, 'completed')" class="${item.completed ? 'active' : ''}">Completed</button>
            <button onclick="deleteMasterChecklistItem(${index})">Delete</button>
            <span class="drag-handle">☰</span>
        `;
        itemsList.appendChild(listItem);

        // Make checklist text editable
        const itemTextSpan = listItem.querySelector(".item-text");
        itemTextSpan.addEventListener("blur", () => {
            masterChecklist[index].text = itemTextSpan.textContent;
            saveMasterChecklist();
        });

        // Add drag handle for reordering
        const dragHandle = listItem.querySelector(".drag-handle");
        dragHandle.addEventListener("mousedown", (e) => {
            listItem.draggable = true;
        });
        dragHandle.addEventListener("mouseup", (e) => {
            listItem.draggable = false;
        });

        listItem.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", index);
            listItem.classList.add("dragging");
        });

        listItem.addEventListener("dragover", (e) => {
            e.preventDefault();
            const draggingItem = document.querySelector("#masterChecklistItems li.dragging");
            if (draggingItem !== listItem && draggingItem) {
                const bounding = listItem.getBoundingClientRect();
                const offset = e.clientY - bounding.top;
                if (offset < bounding.height / 2) {
                    itemsList.insertBefore(draggingItem, listItem);
                } else {
                    itemsList.insertBefore(draggingItem, listItem.nextElementSibling);
                }
            }
        });

        listItem.addEventListener("dragend", (e) => {
            listItem.classList.remove("dragging");
            const newIndex = Array.from(itemsList.children).indexOf(listItem);
            if (newIndex !== index) {
                const [removed] = masterChecklist.splice(index, 1);
                masterChecklist.splice(newIndex, 0, removed);
                saveMasterChecklist();
            }
        });
    });
}

// Function to toggle the visibility of date boxes
function toggleDateBox(index, type) {
    masterChecklist[index][type] = !masterChecklist[index][type];
    renderMasterChecklistItems();
    saveMasterChecklist();
}

// Function to delete an item from the master checklist
function deleteMasterChecklistItem(index) {
    masterChecklist.splice(index, 1);
    renderMasterChecklistItems();
    saveMasterChecklist();
}

// Function to save the master checklist to local storage
function saveMasterChecklist() {
    localStorage.setItem("masterChecklist", JSON.stringify(masterChecklist));
}

// Function to load the master checklist from local storage
function loadMasterChecklist() {
    masterChecklist = JSON.parse(localStorage.getItem("masterChecklist")) || [];
    renderMasterChecklistItems();
}

// Call this function at the start to render the master checklist editor
createMasterChecklistEditor();

// Function to render the checklist in a card

function renderChecklist(checklistItems) {
    const checklistDiv = document.createElement("div");
    if (checklistItems && checklistItems.length > 0) {
        const checklistList = document.createElement("ul");
        checklistItems.forEach((item, index) => {
            const listItem = document.createElement("li");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = item.checked || false;
            checkbox.addEventListener("change", () => {
                item.checked = checkbox.checked;
            });
            const itemText = document.createElement("span");
            itemText.textContent = item.text;
            listItem.appendChild(checkbox);
            listItem.appendChild(itemText);

            // Add date boxes if scheduled or completed is true
            if (item.scheduled) {
                const scheduledDateBox = createDateBox("Scheduled");
                listItem.appendChild(scheduledDateBox);
            }
            if (item.completed) {
                const completedDateBox = createDateBox("Completed");
                listItem.appendChild(completedDateBox);
            }

            checklistList.appendChild(listItem);
        });
        checklistDiv.appendChild(checklistList);
    } else {
        checklistDiv.innerHTML = "<p>No checklist items added.</p>";
    }
    return checklistDiv;
}

// Function to create a date box with a date picker
function createDateBox(labelText) {
    const dateBox = document.createElement("div");
    dateBox.classList.add("date-box");
    const label = document.createElement("label");
    label.textContent = labelText + ":";
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    const button = document.createElement("button");
    button.textContent = "Select Date";
    button.addEventListener("click", () => {
        dateInput.showPicker(); // Open the date picker
    });
    dateBox.appendChild(label);
    dateBox.appendChild(dateInput);
    dateBox.appendChild(button);
    return dateBox;
}

// Function to gather all data from the app
function gatherAllData() {
    const lists = JSON.parse(localStorage.getItem("lists")) || []; // Get lists from local storage
    const allData = []; // Initialize an array to hold all the data

    // Loop through each list
    lists.forEach(list => {
        // Loop through each card in the list
        if (list.cards) {
            list.cards.forEach(card => {
                // Get card data
                const cardData = getCardData(card.id);

                // If card data exists, add it to the allData array
                if (cardData) {
                    allData.push(cardData);
                }
            });
        }
    });

    // Return all the gathered data
    return allData;
}

// Example of how to use gatherAllData (for testing)
// You can uncomment this to test in the browser's console:
// const allVolunteerData = gatherAllData();
// console.log(allVolunteerData);




// Modify openCard function to render the checklist
function openCard(card) {
    const cardId = card.id;
    const cardData = getCardData(cardId);
    if (!cardData) {
        return;
    }

    const modalContent = document.getElementById("modalContent");
    modalContent.innerHTML = "";

    // Render tabs
    const tabs = document.createElement("div");
    tabs.classList.add("modal-tabs");
    tabs.innerHTML = `
        <button class="tab-button active" onclick="openTab(event, 'details')">Details</button>
        <button class="tab-button" onclick="openTab(event, 'attachments')">Attachments</button>
        <button class="tab-button" onclick="openTab(event, 'checklist')">Checklist</button>
    `;
    modalContent.appendChild(tabs);

    // Render Details tab
    const detailsTab = document.createElement("div");
    detailsTab.id = "details";
    detailsTab.classList.add("tab-content");
    detailsTab.style.display = "block";
    detailsTab.innerHTML = `
        <h2>${cardData.name}</h2>
        <p><strong>Email:</strong> ${cardData.email}</p>
        <p><strong>Phone:</strong> ${cardData.phone}</p>
        <p><strong>Address:</strong> ${cardData.address}, ${cardData.city}, ${cardData.state} ${cardData.zip}</p>
        <p><strong>Interests:</strong> ${cardData.interests}</p>
        <p><strong>Availability:</strong> ${cardData.availability}</p>
        <p><strong>Previous Experience:</strong> ${cardData.previousExperience}</p>
        <div>
            <h3>References</h3>
            ${cardData.references.map(ref => `<p>${ref.name} - ${ref.phone}</p>`).join("")}
        </div>
    `;
    modalContent.appendChild(detailsTab);

    // Render Attachments tab
    const attachmentsTab = document.createElement("div");
    attachmentsTab.id = "attachments";
    attachmentsTab.classList.add("tab-content");
    const addAttachmentButton = document.createElement("button");
    addAttachmentButton.textContent = "Add Attachment";
    addAttachmentButton.addEventListener("click", () => handleAddAttachment(cardId));
    attachmentsTab.appendChild(addAttachmentButton);
    const attachmentsList = document.createElement("ul");
    attachmentsList.id = `attachments-list-${cardId}`;
    attachmentsTab.appendChild(attachmentsList);

    if (cardData.attachments && cardData.attachments.length > 0) {
        cardData.attachments.forEach(attachment => {
            const attachmentItem = document.createElement("li");
            attachmentItem.textContent = attachment.name;
            // Add "Set as Profile Picture" button here
            // ...
            attachmentsList.appendChild(attachmentItem);
        });
    }
    modalContent.appendChild(attachmentsTab);

    // Render Checklist tab
    const checklistTab = document.createElement("div");
    checklistTab.id = "checklist";
    checklistTab.classList.add("tab-content");
    // If the card doesn't have a checklist, initialize it with a copy of the master checklist
    if (!cardData.checklist) {
        cardData.checklist = masterChecklist.map(item => ({ ...item, checked: false })); // Copy master checklist
        saveCards();
    }
    checklistTab.appendChild(renderChecklist(cardData.checklist));
    modalContent.appendChild(checklistTab);

    // Make sure the modal is displayed
    modal.style.display = "block";
}

// Add CSV Upload functionality here
// Function to handle CSV file upload
function uploadCSV() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = e.target.result;
            const lines = data.split('\n');
            const headers = lines[0].split(',').map(header => header.trim());

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(value => value.trim());
                if (values.length === headers.length) {
                    const cardData = {};
                    for (let j = 0; j < headers.length; j++) {
                        cardData[headers[j]] = values[j];
                    }
                    createCardFromData(cardData);
                }
            }
        };

        reader.readAsText(file);
    } else {
        alert('Please select a CSV file.');
    }
}

// Function to create a card from CSV data
function createCardFromData(cardData) {
    const lists = JSON.parse(localStorage.getItem("lists")) || [];
    // Find the "New Applicants" list
    let newList = lists.find(list => list.title === "New Applicants");

    // If the "New Applicants" list doesn't exist, create it
    if (!newList) {
        newList = {
            id: "list-" + Date.now(),
            title: "New Applicants",
            cards: [] // Initialize cards array
        };
        lists.push(newList);
    }

    // Generate a unique ID for the new card
    const cardId = generateCardId();

    // Add the card data to the list's cards array
    newList.cards.push({
        id: cardId,
        ...cardData // Spread the card data from CSV
    });

    // Find the DOM element for the "New Applicants" list
    const listElement = document.getElementById(newList.id);
    let cardsContainer;

    if (listElement) {
        // If the list element exists, find its cards container
        cardsContainer = listElement.querySelector(".cards-container");
    } else {
        // If the list element doesn't exist (it's not rendered yet), create it
        const board = document.getElementById("board");
        const newListElement = document.createElement("div");
        newListElement.classList.add("list");
        newListElement.id = newList.id;

        const listHeader = document.createElement("div");
        listHeader.classList.add("list-header");
        listHeader.innerHTML = `<h3 class="list-title">${newList.title}</h3>`;

        cardsContainer = document.createElement("div");
        cardsContainer.classList.add("cards-container");

        newListElement.appendChild(listHeader);
        newListElement.appendChild(cardsContainer);
        board.appendChild(newListElement);
    }

    // Now that we have the cardsContainer, render the new card in it
    if (cardsContainer) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.id = cardId;
        cardElement.innerHTML = `<h4 class="card-name">${cardData["Name - First Name"]} ${cardData["Name - Last Name"]}</h4><p class="card-email">${cardData["Preferred Email Address"]}</p><p class="card-phone">${cardData["Preferred Phone Number"]}</p>`; // Update with your desired fields
        cardElement.addEventListener("click", () => openCard(cardElement));
        cardsContainer.appendChild(cardElement);
    }
}
    localStorage.setItem("lists", JSON.stringify(lists));
}

// Function to export all card data to CSV
function exportToCSV() {
    const lists = JSON.parse(localStorage.getItem("lists")) || [];
    const data = [];

    // Extract headers from the first card (assuming all cards have the same structure)
    let headers = [];
    if (lists.length > 0 && lists[0].cards && lists[0].cards.length > 0) {
        headers = Object.keys(lists[0].cards[0]);
    }

    // Push headers to the data array
    data.push(headers.join(','));

    // Iterate through lists and cards to extract data
    lists.forEach(list => {
        if (list.cards) {
            list.cards.forEach(card => {
                const values = headers.map(header => {
                    let value = card[header];
                    if (typeof value === 'string') {
                        // Escape commas within strings by enclosing in double quotes
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                });
                data.push(values.join(','));
            });
        }
    });

    // Create a CSV string
    const csvContent = data.join('\n');

    // Create a Blob containing the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a download link and trigger the download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "volunteer_data.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
}