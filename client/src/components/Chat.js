import React, { useState } from 'react';
import axios from 'axios';
import './Chat.css';
import { AiOutlinePaperClip, AiFillFilePdf } from 'react-icons/ai';

function Chat({ user, pdfsUploaded, onUploadComplete }) {
  const [messages, setMessages] = useState([{ sender: 'bot', text: "Greetings!" ,type:'response'},{ sender: 'bot', text: "I'm HelperBot, here to make your life easier. Upload your PDF, and let's get started on finding the answers you need!" ,type:'response'}]);
  const [input, setInput] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState({});

  const updateUploadingFiles = (key, value) => {
    setUploadingFiles(prevState => ({
      ...prevState,
      [key]: value
    }));
  };

  const removeUploadingFile = (key) => {
    setUploadingFiles(prevState => {
      const { [key]: _, ...newState } = prevState;
      return newState;
    });
  };

  const sendMessage = async () => {
    if (input.trim()) {
      const userMessage = { sender: 'user', text: input.trim(), type:'question'};
      setMessages([...messages, userMessage,{ sender: 'bot', text: '...', type:'message'}]);
      setInput('');
      try {
        const response = await axios.post('http://127.0.0.1:8000/ask/1', {
            question:input,
            vectorStoreChoice:2
        },
        {
            headers: {
            'Content-Type': 'application/json',
            }
        });
        const botMessage = { sender: 'bot', text: response.data.response.result ,type:'response'};
        setMessages((prevMessages) => [
          ...prevMessages.filter((msg) => !(msg.sender==='bot' && msg.text==='Error : Could not fetch answers. Please try again later')),
          botMessage,
          { sender: 'bot', text: 'What you want to know?', type: 'message'},
        ]);
      } catch (error) {
        console.error('Error sending message', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: 'Error : Could not fetch answers. Please try again later.', type: 'message' }
        ]);
      } finally {
        setMessages((prevMessages) => [
          ...prevMessages.filter((msg) => !(msg.sender==='bot' && msg.text==='...')),
        ]);
      }
    }
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const [suffix,setSuffix]=useState('')

  const uploadFiles = async (files) => {
    const formData = new FormData();

    setSuffix(' glowing');
    setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => !(msg.sender==='bot' && msg.text==='Looks like you uploaded a file which is not a PDF. Please upload PDF/s only.')),
    ]);

    for(let i=0;i<files.length;i++){
        formData.append('files',files[i]);
        updateUploadingFiles(files[i].name, { status: 'uploading', file: files[i] });
        setMessages((prevMessages) => [
            ...prevMessages.filter((msg) => !(msg.type==='file' && msg.fileName===files[i].name)),
            { sender: 'user', text: `Uploading ${files[i].name}`, type: 'file', fileName: files[i].name },
        ]);
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: 'Analyzing...  This would take few minutes', type: 'message'},
    ]);

    try {
        await axios.post(' http://127.0.0.1:8000/upload/1', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept':'application/json'
            }
        });

        const uploadedMessages = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          uploadedMessages.push({
            sender: 'user',
            text: `Uploaded ${file.name}`,
            type: 'file',
            fileName: file.name,
            uploaded: true,
          });
        }

      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => !(msg.text.startsWith('Uploading') && msg.type==='file')),
        ...uploadedMessages,
      ]);

      setSuffix('');

      onUploadComplete();
      for(let i=0;i<files.length;i++){
        removeUploadingFile(files[i].name);
      }

    } catch (error) {
      console.error('Error uploading files', error);

      setSuffix(' retry');

      for(let i=0;i<files.length;i++){
        updateUploadingFiles(files[i].name,{status:'retry',file:files[i]});
      }
      console.log('uploadingFiles : ',uploadingFiles);
    } finally {
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => !(msg.sender==='bot' && msg.text==='Analyzing...  This would take few minutes')),
      ]);
    }
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    setMessages([...messages]);
    for(let i=0;i<files.length;i++){
      if(!(files[i] && files[i].type==='application/pdf')){
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: 'Looks like you uploaded a file which is not a PDF. Please upload PDF/s only.', type: 'message'},
        ]);
        return;
      }
    }
    uploadFiles(files);
  };

  const handleRetryUpload = (filename) => {
    const file = uploadingFiles[filename].file;
    // console.log(file);
    uploadFiles([file]);
  };



  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.sender}`}>
            {message.type === 'file' ? (
              <div className={uploadingFiles[messages.fileName]?.status==='retry'? 'pdf-message retry' : `pdf-message${suffix}`}>

                <AiFillFilePdf className="pdf-icon" />
                <span>{message.fileName}</span>
                {uploadingFiles[message.fileName]?.status === 'retry' && <button onClick={() => handleRetryUpload(message.fileName)}>Retry</button>}
              </div>
            ) : (
              <div>{message.text}</div>
            )}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <label className="upload-button">
          <AiOutlinePaperClip />
          <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} accept="application/pdf" />
        </label>
        {true && (
          <>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type here..."
            />
            <button onClick={sendMessage}>Ask</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;



