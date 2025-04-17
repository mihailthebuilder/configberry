import React, { useState, useRef, useEffect } from "react";

interface FileUploaderProps {
  onFileProcessed: (content: string) => void;
  onError: (error: string) => void;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  fileDescription?: string;
}

function FileUploader({
  onFileProcessed,
  onError,
  acceptedFileTypes = ".csv,.txt",
  maxFileSizeMB = 10,
  fileDescription = "CSV or TXT",
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Process file automatically when it changes
  useEffect(() => {
    if (file) {
      processFile();
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        onError("");
      }
    }
  };

  const validateFile = (fileToValidate: File): boolean => {
    // Check file size
    if (fileToValidate.size > maxFileSizeMB * 1024 * 1024) {
      onError(`File size exceeds ${maxFileSizeMB}MB limit`);
      return false;
    }

    // Check if file is text based based on extension
    const fileName = fileToValidate.name.toLowerCase();
    const isValidType =
      fileToValidate.type === "text/plain" ||
      fileToValidate.type === "text/csv" ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".csv");

    if (!isValidType) {
      onError(`Please upload a ${fileDescription} file`);
      return false;
    }

    return true;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        onError("");
      }
    }
  };

  const processFile = () => {
    if (!file) {
      onError("Please select a file first");
      return;
    }

    setIsLoading(true);
    onError("");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        onFileProcessed(content);
        setIsLoading(false);
      } catch (err) {
        onError((err as Error).message);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      onError("Failed to read file");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="mt-6">
      <div
        ref={dropAreaRef}
        className={`flex items-center justify-center px-6 pt-5 pb-6 border-2 ${
          isDragging ? "border-pink-800 bg-pink-100" : "border-gray-700"
        } border-dashed rounded-md`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-600"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-700">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-medium text-pink-800 hover:text-pink-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-800"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept={acceptedFileTypes}
                onChange={handleFileChange}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-600">
            {fileDescription} up to {maxFileSizeMB}MB
          </p>
        </div>
      </div>

      {file && (
        <p className="mt-2 text-sm text-gray-600">
          Selected file:{" "}
          <span className="font-medium text-gray-900">{file.name}</span> (
          {(file.size / 1024).toFixed(2)} KB)
        </p>
      )}

      {isLoading && (
        <div className="mt-2 text-sm text-gray-700">Processing file...</div>
      )}
    </div>
  );
}

export default FileUploader;
