import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isFolder, setIsFolder] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success
  const [progress, setProgress] = useState(0);
  const [qrUrl, setQrUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = (files) => {
    return Array.from(files).reduce((acc, file) => acc + file.size, 0);
  };

  const handleFileSelection = (files, isFolderUpload = false) => {
    if (!files || files.length === 0) return;

    const totalSize = getTotalSize(files);
    
    if (totalSize > MAX_FILE_SIZE) {
      alert('Total file/folder size exceeds 10MB. Please select a smaller file.');
      return;
    }

    setSelectedFiles(Array.from(files));
    setIsFolder(isFolderUpload);
    setUploadState('uploading');
    setProgress(0);

    simulateProgress(totalSize);
    uploadFiles(files, isFolderUpload);
  };

  const simulateProgress = (totalSize) => {
    let currentProgress = 0;
    const interval = totalSize < 1024 * 1024 ? 30 : totalSize < 5 * 1024 * 1024 ? 50 : 100;
    
    const timer = setInterval(() => {
      currentProgress += Math.random() * 10;
      if (currentProgress >= 95) {
        currentProgress = 95;
        clearInterval(timer);
      }
      setProgress(Math.min(currentProgress, 95));
    }, interval);

    return () => clearInterval(timer);
  };

  const uploadFiles = async (files, isFolderUpload) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('is_folder', isFolderUpload ? 'true' : 'false');

    try {
      const response = await axios.post('https://keshavsuthar-dev.hf.space/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProgress(100);
      setTimeout(() => {
        setQrUrl(response.data.qr_url);
        setFileUrl(response.data.file_url);
        setUploadState('success');
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file: ' + (error.response?.data?.error || error.message));
      resetUpload();
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === dropzoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const files = [];
    let isFolderUpload = false;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry.isDirectory) {
            isFolderUpload = true;
            await readDirectory(entry, files);
          } else {
            files.push(item.getAsFile());
          }
        }
      }
      handleFileSelection(files, isFolderUpload);
    } else {
      handleFileSelection(e.dataTransfer.files, false);
    }
  }, []);

  const readDirectory = async (directory, files) => {
    const reader = directory.createReader();
    const entries = await new Promise((resolve) => {
      reader.readEntries(resolve);
    });

    for (const entry of entries) {
      if (entry.isFile) {
        const file = await new Promise((resolve) => {
          entry.file(resolve);
        });
        files.push(file);
      } else if (entry.isDirectory) {
        await readDirectory(entry, files);
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelection(e.target.files, false);
    }
  };

  const resetUpload = () => {
    setSelectedFiles([]);
    setIsFolder(false);
    setUploadState('idle');
    setProgress(0);
    setQrUrl('');
    setFileUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <motion.section
      className="upload-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1 }}
    >
      <div className="upload-container">
        <AnimatePresence mode="wait">
          {uploadState === 'idle' && (
            <motion.div
              key="dropzone"
              className={`dropzone ${isDragging ? 'dragging' : ''}`}
              ref={dropzoneRef}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="dropzone-icon"
                animate={{ y: isDragging ? -10 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </motion.div>
              <h3>Drag & Drop Your Files Here</h3>
              <p>or click to browse from your device</p>
              <input
                ref={fileInputRef}
                type="file"
                className="file-input"
                onChange={handleFileInputChange}
                multiple
              />
              <button
                className="upload-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Select Files
              </button>
              <p className="upload-info">Maximum file size: 10MB</p>
            </motion.div>
          )}

          {uploadState === 'uploading' && (
            <motion.div
              key="progress"
              className="progress-container"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="uploading-icon">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </motion.div>
              </div>
              <h3>Uploading...</h3>
              <p className="file-info">
                {isFolder ? 'Folder Selected' : selectedFiles[0]?.name}
                <br />
                <span className="file-size">
                  {selectedFiles.length} file(s) | {formatFileSize(getTotalSize(selectedFiles))}
                </span>
              </p>
              <div className="progress-bar-container">
                <motion.div
                  className="progress-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="progress-percentage">{Math.round(progress)}%</p>
              <button className="cancel-button" onClick={resetUpload}>
                Cancel Upload
              </button>
            </motion.div>
          )}

          {uploadState === 'success' && (
            <motion.div
              key="success"
              className="success-container"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </motion.div>
              <h3>Upload Successful!</h3>
              <p>Scan the QR code or copy the link to share your file</p>
              
              {qrUrl && (
                <motion.div
                  className="qr-code-container"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <img src={qrUrl} alt="QR Code" className="qr-code" />
                </motion.div>
              )}

              <div className="action-buttons">
                <button className="copy-button" onClick={copyToClipboard}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy Link
                </button>
                <button className="new-upload-button" onClick={resetUpload}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Upload Another File
                </button>
              </div>

              <p className="expiry-notice">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                This file will be automatically deleted after 24 hours
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default FileUpload;
