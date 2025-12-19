document.addEventListener("DOMContentLoaded", () => {
    
    let activeChatId = null;
    const msgInput = document.getElementById('msg-input');
    const sendBtn = document.getElementById('send-btn');
    const display = document.getElementById('message-display');
    const chatWindow = document.getElementById('chat-window');
    const chatHeader = document.getElementById('chat-header');
    
    const activeUserName = document.getElementById('active-user-name');
    const activeUserAvatar = document.getElementById('active-user-avatar');

    const searchDropdown = document.getElementById('search-dropdown');
    const searchInput = document.getElementById('user-search-input');
    const searchResults = document.getElementById('search-results');
    const newChatBtn = document.getElementById('new-chat-btn');
    const contactsList = document.getElementById('contacts-list');
    const noChatsPlaceholder = document.getElementById('no-chats-placeholder');


    newChatBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (searchDropdown.style.display === 'flex') {
        searchDropdown.style.display = 'none';
    } else {
        searchDropdown.style.display = 'flex';
        searchInput.value = ''; 
        searchResults.innerHTML = ''; 
        searchInput.focus();
    }
});

document.addEventListener('click', (e) => {
    if (!searchDropdown.contains(e.target) && e.target !== newChatBtn) {
        searchDropdown.style.display = 'none';
    }
});

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
                    
                    div.onclick = () => startNewChat(user.id, user.name);
                    
                    searchResults.appendChild(div);
                });
            });
    });

    function startNewChat(userId, userName) {
        searchDropdown.style.display = 'none';
        searchInput.value = '';
        searchResults.innerHTML = '';

        const existingContact = document.getElementById(`contact-${userId}`);
        
        if (!existingContact) {
            if (noChatsPlaceholder) noChatsPlaceholder.style.display = 'none';

            const newContactHTML = `
                <div class="contact active" id="contact-${userId}" onclick="loadChat(${userId}, '${userName}')">
                    <div class="avatar-circle">${userName.charAt(0)}</div>
                    <div class="contact-info">
                        <h4>${userName}</h4>
                    </div>
                </div>
            `;
            contactsList.insertAdjacentHTML('afterbegin', newContactHTML);
        }

        loadChat(userId, userName);
    }

    window.loadChat = function(userId, userName) {
        activeChatId = userId;
 
        chatHeader.style.display = 'flex';
        chatWindow.style.display = 'flex';
        activeUserName.innerText = userName;
        activeUserAvatar.innerText = userName.charAt(0);

        document.querySelectorAll('.contact').forEach(el => el.classList.remove('active'));
        const activeContact = document.getElementById(`contact-${userId}`);
        if(activeContact) activeContact.classList.add('active');

        fetchMessages();
    };

    async function fetchMessages() {
        if (!activeChatId) return;
        
        try {
            const response = await fetch(`/api/get_messages/${activeChatId}`);
            const data = await response.json();
            
            display.innerHTML = '';
            
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
            const tempDiv = document.createElement('div');
            tempDiv.className = 'message sent';
            tempDiv.innerHTML = `${text} <span class="timestamp">Just now</span>`;
            display.appendChild(tempDiv);
            display.scrollTop = display.scrollHeight;
            msgInput.value = '';

            await fetch('/api/send_message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiver_id: activeChatId, message: text })
            });

            fetchMessages();

        } catch (error) {
            console.error("Send error:", error);
            alert("Failed to send message");
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    msgInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    setInterval(() => {
        if (activeChatId) fetchMessages();
    }, 3000);
});