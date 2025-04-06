import React, { useState } from "react";
import FileUploader from "./FileUploader";
import type { ZoneCsvRow } from "./ZonesDownload";

interface CopyPlanConfig {
  apiKey: string;
  apiEmail: string;
  zoneId: string;
  fileName?: string;
}

function CopyConfigC() {
  const [sourceZone, setSourceZone] = useState<CopyPlanConfig>({
    apiKey: "",
    apiEmail: "",
    zoneId: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [zonesToApply, setZonesToApply] = useState<ZoneCsvRow[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSourceZone({
      ...sourceZone,
      [name]: value,
    });
  };

  const handleFileProcessed = (content: string) => {
    try {
      const parsed = parseFileContent(content);
      setZonesToApply(parsed);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setZonesToApply([]);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage || null);
  };

  const createCopyPlan = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!sourceZone.apiKey || !sourceZone.apiEmail || !sourceZone.zoneId) {
        throw new Error("API Key, API Email, and Zone ID are required");
      }

      if (zonesToApply.length === 0) {
        throw new Error(
          "No zones to apply. Please upload a valid list of zones."
        );
      }

      // Here you would implement the API call to create the copy plan
      console.log("Creating copy plan with config:", sourceZone);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success handling would go here
      alert("Copy plan created successfully!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-lg font-medium text-gray-900">
            Zone Copy Plan Configuration
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your Cloudflare credentials and zone information to create a
            copy plan.
          </p>

          <div className="mt-6 space-y-4">
            {/* API Email Input */}
            <div>
              <label
                htmlFor="apiEmail"
                className="block text-sm font-medium text-gray-700"
              >
                API Email
              </label>
              <input
                type="email"
                name="apiEmail"
                id="apiEmail"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="your.email@example.com"
                value={sourceZone.apiEmail}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* API Key Input */}
            <div>
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-gray-700"
              >
                API Key
              </label>
              <input
                type="text"
                name="apiKey"
                id="apiKey"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="API Key"
                value={sourceZone.apiKey}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Zone ID Input */}
            <div>
              <label
                htmlFor="zoneId"
                className="block text-sm font-medium text-gray-700"
              >
                Zone ID
              </label>
              <input
                type="text"
                name="zoneId"
                id="zoneId"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Zone ID"
                value={sourceZone.zoneId}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* File Uploader */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Configuration File
              </label>
              <FileUploader
                onFileProcessed={handleFileProcessed}
                onError={handleError}
                acceptedFileTypes=".csv,.txt"
                maxFileSizeMB={10}
                fileDescription="CSV or TXT"
              />
            </div>
          </div>

          {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

          {zonesToApply.length > 0 && (
            <div className="mt-4 text-sm text-green-600">
              File uploaded: {sourceZone.fileName}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 hover:cursor-pointer ${
                isLoading
                  ? "bg-gray-600"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              }`}
              onClick={createCopyPlan}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Create Copy Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const parseFileContent = (content: string): ZoneCsvRow[] => {
  let lines = content.split("\n").filter((line) => line.trim() !== "");

  if (lines[0].startsWith("zoneId")) {
    lines.shift();
  }

  return lines.map((line) => {
    const [zoneId, zoneName, apiEmail, apiKey] = line
      .split(",")
      .map((item) => item.trim());

    if (!apiEmail || !apiKey) {
      throw new Error(`Invalid line format: ${line}`);
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(apiEmail)) {
      console.error(`Invalid email format: ${apiEmail}`);
      throw new Error(`Invalid email format: ${apiEmail}`);
    }

    return { zoneId, zoneName, apiEmail, apiKey };
  });
};

export default CopyConfigC;
