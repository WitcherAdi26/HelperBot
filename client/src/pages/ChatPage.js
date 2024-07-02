import React, { useState } from 'react';
import Chat from '../components/Chat';
import './ChatPage.css';

function ChatPage({ user }) {
  const [pdfsUploaded, setPdfsUploaded] = useState(false);

  return (
    <div className="chat-page">
      <div className="chat-container-wrapper">
        <Chat user={user} pdfsUploaded={pdfsUploaded} onUploadComplete={() => setPdfsUploaded(true)} />
      </div>
    </div>
  );
}

export default ChatPage;

