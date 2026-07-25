import React, { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileSelect, accept = '.pdf,.pptx', isLoading = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
      e.target.value = ''; // Reset so same file can be re-uploaded
    }
  };

  return (
    <div
      className={`file-upload-container ${isDragging ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isLoading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: 'none' }}
      />

      {isLoading ? (
        <div className="file-loading">
          <div className="spinner"></div>
          <p>Extracting text from document...</p>
        </div>
      ) : (
        <div className="file-drop-zone">
          <div className="upload-icon">📄</div>
          <h3>Upload your notes</h3>
          <p>Drag & drop or click to browse</p>
          <span className="file-accept">Supported: PDF, PPTX</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
