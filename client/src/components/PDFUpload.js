import React, { useState } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import './PDFUpload.css';
import { AiFillFilePdf } from 'react-icons/ai';

function PDFUpload() {
  const [pdfs, setPdfs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileUpload = async (event) => {
    setAnalyzing(true);
    const files = event.target.files;
    const formData = new FormData();
    const newPdfs = [];

    for(let i=0;i<files.length;i++){
        formData.append('files',files[i]);
        newPdfs.push(files[i].name);
    }

    setPdfs((prevPdfs) => [...prevPdfs, ...newPdfs]);

    formData.append('vectorStoreChoice','2');

    try {
      const response=await axios.post(' http://127.0.0.1:8000/upload/1', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept':'application/json'
        }
      });
      console.log(response.data);
      // Handle successful analysis
    } catch (error) {
        alert('Error analyzing files');
        console.error('Error analyzing files', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="pdf-upload">
      <h2>Upload PDFs</h2>
      <input type="file" name='file' multiple onChange={handleFileUpload} />
      <div className="pdf-list">
        {pdfs.map((pdf, index) => (
          <div key={index} className="pdf-item">
            <AiFillFilePdf className="pdf-icon" />
            <span>{pdf}</span>
          </div>
        ))}
      </div>
      {analyzing && (
        <LoadingSpinner message="Analyzing PDFs..." />
      )}
    </div>
  );
}

export default PDFUpload;
