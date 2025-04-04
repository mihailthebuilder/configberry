import React, { useState, useRef } from "react";
import Cloudflare from "cloudflare";

interface CloudflareAccount {
  email: string;
  apiKey: string;
}

interface ZoneToDownload {
  id: string;
  name: string;
  apiEmail: string;
  apiKey: string;
}

function ZonesDownload() {
  const [file, setFile] = useState<File | null>(null);
  const [cloudflareAccounts, setCloudflareAccounts] = useState<
    CloudflareAccount[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
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
      // Check if file is text based
      if (
        droppedFile.type === "text/plain" ||
        droppedFile.type === "text/csv" ||
        droppedFile.name.endsWith(".txt") ||
        droppedFile.name.endsWith(".csv")
      ) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please upload a CSV or TXT file");
      }
    }
  };

  const parseFileContent = (content: string): CloudflareAccount[] => {
    // This is a simple parser assuming each line contains "email,apiKey"
    const lines = content.split("\n").filter((line) => line.trim() !== "");

    return lines.map((line) => {
      const [email, apiKey] = line.split(",").map((item) => item.trim());

      if (!email || !apiKey) {
        throw new Error(`Invalid line format: ${line}`);
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email format: ${email}`);
      }

      return { email, apiKey };
    });
  };

  const handleUpload = () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = parseFileContent(content);
        setCloudflareAccounts(parsed);
        setIsLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setCloudflareAccounts([]);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read file");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const downloadZones = async () => {
    const zonesToDownload: ZoneToDownload[] = [];

    for (const account of cloudflareAccounts) {
      const cf = new Cloudflare({
        apiEmail: account.email,
        apiKey: account.apiKey,
      });

      const zones = (await cf.zones.list()).result.map((zone) => ({
        id: zone.id,
        name: zone.name,
        apiEmail: account.email,
        apiKey: account.apiKey,
      }));

      zonesToDownload.push(...zones);
    }

    // download the zones as a CSV file
    const csvContent =
      "data:text/csv;charset=utf-8," +
      zonesToDownload
        .map(
          (zone) => `${zone.id},${zone.name},${zone.apiEmail},${zone.apiKey}`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "zones.csv");
    document.body.appendChild(link); // Required for FF
    link.click(); // This will download the data file named "zones.csv" with the content of "zonesToDownload"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-lg font-medium text-gray-900">
            Upload Emails and API Keys
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload a CSV file with email addresses and API keys. Each line
            should contain an email and API key separated by a comma.
          </p>

          <div className="mt-6">
            <div
              ref={dropAreaRef}
              className={`flex items-center justify-center px-6 pt-5 pb-6 border-2 ${
                isDragging
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-gray-300"
              } border-dashed rounded-md`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".csv,.txt"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV or TXT up to 10MB</p>
              </div>
            </div>

            {file && (
              <p className="mt-2 text-sm text-gray-500">
                Selected file:{" "}
                <span className="font-medium text-gray-900">{file.name}</span> (
                {(file.size / 1024).toFixed(2)} KB)
              </p>
            )}

            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:cursor-pointer"
                onClick={handleUpload}
                disabled={isLoading || !file}
              >
                {isLoading ? "Processing..." : "Process File"}
              </button>
            </div>
          </div>

          {cloudflareAccounts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Parsed Data</h2>
              <div className="mt-4 border rounded-md overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          API Key
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cloudflareAccounts.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.apiKey.substring(0, 6)}...
                            {item.apiKey.substring(item.apiKey.length - 4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 hover:cursor-pointer"
                  onClick={downloadZones}
                >
                  Download zones
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ZonesDownload;
