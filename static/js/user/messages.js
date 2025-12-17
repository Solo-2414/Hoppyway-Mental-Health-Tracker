document.addEventListener("DOMContentLoaded", () => {
    
    // --- VARIABLES & ELEMENTS ---
    let activeChatId = null;
    const msgInput = document.getElementById('msg-input');
    const sendBtn = document.getElementById('send-btn');
    const display = document.getElementById('message-display');
    const chatWindow = document.getElementById('chat-window');
    const chatHeader = document.getElementById('chat-header');
    
    const activeUserName = document.getElementById('active-user-name');
    const activeUserAvatar = document.getElementById('active-user-avatar');
    
    // Dropdown Elements
    const searchDropdown = document.getElementById('search-dropdown');
    const searchInput = document.getElementById('user-search-input');
    const searchResults = document.getElementById('search-results');
    const newChatBtn = document.getElementById('new-chat-btn');
    const contactsList = document.getElementById('contacts-list');
    const noChatsPlaceholder = document.getElementById('no-chats-placeholder');

    // --- 1. SEARCH DROPDOWN LOGIC ---

    // Toggle Dropdown
    newChatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (searchDropdown.style.display === 'flex') {
            searchDropdown.style.display = 'none';
        } else {
            searchDropdown.style.display = 'flex';
            searchInput.focus();
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchDropdown.contains(e.target) && e.target !== newChatBtn) {
            searchDropdown.style.display = 'none';
        }
    });

    // Live Search API
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if(query.length < 1) {
            searchResults.innerHTML = '';
            return;
        }

        fetch(`/api/search_users?q=${query}`)
            .then(res => res.json())
            .then(users => {
                searchResults.innerHTML = '';
                if(users.length === 0) {
                    searchResults.innerHTML = '<p style="padding:10px; font-size:0.9rem; color:var(--grayish-color);">No user found</p>';
                    return;
                }
                
                users.forEach(user => {
                    const div = document.createElement('div');
                    div.className = 'search-item';
                    div.innerHTML = `
                        <div class="avatar-circle" style="width:30px; height:30px; font-size:0.8rem;">${user.name.charAt(0)}</div>
                        <div style="font-weight:bold; font-size:0.9rem; color:var(--text-color);">${user.name}</div>
                    `;
                    
                    // ON CLICK: Start Chat + Add to Sidebar
                    div.onclick = () => startNewChat(user.id, user.name);
                    
                    searchResults.appendChild(div);
                });
            });
    });

    // --- 2. START NEW CHAT (The Fix) ---
    function startNewChat(userId, userName) {
        // 1. Close Dropdown
        searchDropdown.style.display = 'none';
        searchInput.value = '';
        searchResults.innerHTML = '';

        // 2. Check if user already exists in sidebar
        const existingContact = document.getElementById(`contact-${userId}`);
        
        if (!existingContact) {
            // Remove "No chats" placeholder if it exists
            if (noChatsPlaceholder) noChatsPlaceholder.style.display = 'none';

            // Create HTML for new contact
            const newContactHTML = `
                <div class="contact active" id="contact-${userId}" onclick="loadChat(${userId}, '${userName}')">
                    <div class="avatar-circle">${userName.charAt(0)}</div>
                    <div class="contact-info">
                        <h4>${userName}</h4>
                    </div>
                </div>
            `;
            // Add to top of list
            contactsList.insertAdjacentHTML('afterbegin', newContactHTML);
        }

        // 3. Load the Chat
        loadChat(userId, userName);
    }

    // --- 3. CORE CHAT LOGIC ---

    // Make loadChat global so onclick in HTML works
    window.loadChat = function(userId, userName) {
        activeChatId = userId;
        
        // UI Updates
        chatHeader.style.display = 'flex';
        chatWindow.style.display = 'flex';
        activeUserName.innerText = userName;
        activeUserAvatar.innerText = userName.charAt(0);
        
        // Highlight Sidebar Item
        document.querySelectorAll('.contact').forEach(el => el.classList.remove('active'));
        const activeContact = document.getElementById(`contact-${userId}`);
        if(activeContact) activeContact.classList.add('active');

        // Fetch Data
        fetchMessages();
    };

    async function fetchMessages() {
        if (!activeChatId) return;
        
        try {
            const response = await fetch(`/api/get_messages/${activeChatId}`);
            const data = await response.json();
            
            display.innerHTML = ''; // Clear old messages
            
            if(data.length === 0) {
                display.innerHTML = `
                    <div class="empty-state-msg">
                        <i class="fa-regular fa-comments" style="font-size:3rem; margin-bottom:10px; opacity:0.3;"></i>
                        <p>No messages yet. Say hello!</p>
                    </div>`;
            } else {
                data.forEach(msg => {
                    const side = msg.sender_id === MY_ID ? 'sent' : 'received';
                    display.innerHTML += `
                        <div class="message ${side}">
                            ${msg.text}
                            <span class="timestamp">${msg.time}</span>
                        </div>`;
                });
                // Auto scroll to bottom
                display.scrollTop = display.scrollHeight;
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }

    async function sendMessage() {
        const text = msgInput.value.trim();
        if (!text || !activeChatId) return;

        try {
            // Optimistic UI: Append message immediately
            const tempDiv = document.createElement('div');
            tempDiv.className = 'message sent';
            tempDiv.innerHTML = `${text} <span class="timestamp">Just now</span>`;
            display.appendChild(tempDiv);
            display.scrollTop = display.scrollHeight;
            msgInput.value = '';

            // Send to Server
            await fetch('/api/send_message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiver_id: activeChatId, message: text })
            });

            // Refresh to get real timestamp/ID
            fetchMessages();

        } catch (error) {
            console.error("Send error:", error);
            alert("Failed to send message");
        }
    }

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    msgInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Polling (Refresh every 3 seconds)
    setInterval(() => {
        if (activeChatId) fetchMessages();
    }, 3000);
});