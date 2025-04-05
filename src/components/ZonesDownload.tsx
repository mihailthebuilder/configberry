import React, { useState } from "react";
import Cloudflare from "cloudflare";
import FileUploader from "./FileUploader"; // Import the new component

interface CloudflareAccount {
  email: string;
  apiKey: string;
}

export interface CloudflareZone {
  id: string;
  name: string;
  apiEmail: string;
  apiKey: string;
}

function ZonesDownload() {
  const [cloudflareAccounts, setCloudflareAccounts] = useState<
    CloudflareAccount[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileProcessed = (content: string) => {
    try {
      const parsed = parseFileContent(content);
      setCloudflareAccounts(parsed);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setCloudflareAccounts([]);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage || null);
  };

  const downloadZones = async () => {
    setIsLoading(true);
    try {
      const zonesToDownload: CloudflareZone[] = [];

      for (const account of cloudflareAccounts) {
        const cf = new Cloudflare({
          baseURL: "https://cortex.app.taralys.com/client/v4",
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

      const headers = "id,name,apiEmail,apiKey";

      // Convert data to CSV format with headers
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers,
          ...zonesToDownload.map(
            (zone) => `${zone.id},${zone.name},${zone.apiEmail},${zone.apiKey}`
          ),
        ].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "zones.csv");
      document.body.appendChild(link); // Required for FF
      link.click(); // This will download the data file named "zones.csv" with the content of "zonesToDownload"
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
            Upload Emails and API Keys
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload a CSV file with email addresses and API keys. Each line
            should contain an email and API key separated by a comma.
          </p>

          <FileUploader
            onFileProcessed={handleFileProcessed}
            onError={handleError}
            acceptedFileTypes=".csv,.txt"
            maxFileSizeMB={10}
            fileDescription="CSV or TXT"
          />

          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

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
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 hover:cursor-pointer ${
                    isLoading
                      ? "bg-gray-600"
                      : "bg-green-600 hover:bg-green-700 focus:ring-green-500 "
                  } `}
                  onClick={downloadZones}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Download zones"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const parseFileContent = (content: string): CloudflareAccount[] => {
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

export default ZonesDownload;
