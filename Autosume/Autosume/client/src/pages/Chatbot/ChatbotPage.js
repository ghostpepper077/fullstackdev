import React, { useState } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');
  };

  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    },
    sidebar: {
      width: '200px',
      backgroundColor: '#111',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      justifyContent: 'space-between'
    },
    logo: {
      fontWeight: 'bold',
      marginBottom: '30px'
    },
    navItem: {
      margin: '10px 0',
      color: '#ccc',
      cursor: 'pointer'
    },
    navItemActive: {
      margin: '10px 0',
      backgroundColor: '#444',
      padding: '5px 10px',
      borderRadius: '4px',
      color: '#fff',
      cursor: 'pointer'
    },
    logoutBtn: {
      marginTop: 'auto',
      padding: '10px',
      backgroundColor: '#333',
      color: '#fff',
      border: '1px solid #aaa',
      borderRadius: '5px',
      cursor: 'pointer'
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f7f7f7'
    },
    header: {
      backgroundColor: '#e7e1e1',
      padding: '15px 20px',
      borderBottom: '1px solid #ccc',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '18px',
      fontWeight: 'bold'
    },
    chatContainer: {
      flex: 1,
      display: 'flex'
    },
    leftPanel: {
      width: '200px',
      borderRight: '1px solid #ddd',
      padding: '20px',
      fontSize: '14px',
      color: '#999'
    },
    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      position: 'relative'
    },
    createBtn: {
      alignSelf: 'flex-end',
      marginBottom: '10px',
      backgroundColor: '#007bff',
      color: '#fff',
      padding: '8px 12px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    },
    chatBox: {
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '10px',
      overflowY: 'auto',
      border: '1px solid #ccc'
    },
    inputArea: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '10px',
      borderTop: '1px solid #ccc',
      paddingTop: '10px'
    },
    input: {
      flex: 1,
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      marginRight: '10px'
    },
    sendBtn: {
      padding: '10px 15px',
      backgroundColor: '#888',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div>
          <div style={styles.logo}>AUTOSUME</div>
          <div style={styles.navItem}>Dashboard</div>
          <div style={styles.navItem}>Job Management</div>
          <div style={styles.navItem}>Resume Shortlisting</div>
          <div style={styles.navItem}>Interview Scheduling</div>
          <div style={styles.navItemActive}>Chatbot</div>
          <div style={styles.navItem}>Settings</div>
        </div>
        <button style={styles.logoutBtn}>Log Out</button>
      </div>

      {/* Main Area */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          Chatbot
          <div style={{ fontWeight: 'normal', fontSize: '14px' }}>👤 Hariz</div>
        </div>

        {/* Chat Content */}
        <div style={styles.chatContainer}>
          {/* Left panel */}
          <div style={styles.leftPanel}>
            Currently No Chats<br /><br />
            {/* Future: list of past chats */}
          </div>

          {/* Chat Area */}
          <div style={styles.chatArea}>
            <button style={styles.createBtn}>+ Create New Chat</button>
            <div style={styles.chatBox}>
              {messages.map((msg, i) => (
                <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '5px 0' }}>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
            <div style={styles.inputArea}>
              <input
                style={styles.input}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button style={styles.sendBtn} onClick={handleSend}>▶</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
