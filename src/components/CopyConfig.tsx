import React, { useState } from "react";
import FileUploader from "./FileUploader";
import type { PhaseGetResponse } from "cloudflare/resources/rulesets/phases/phases";
import CopyPlan from "./CopyPlan";
import { cloudflareClient } from "@lib/cf";

interface CopyPlanConfig {
  apiKey: string;
  apiEmail: string;
  zoneId: string;
}

function CopyConfig() {
  const [sourceZone, setSourceZone] = useState<CopyPlanConfig>({
    apiKey: "",
    apiEmail: "",
    zoneId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zonesToApply, setZonesToApply] = useState<ZoneCsvRow[]>([]);
  const [cloudflarePhase, setCloudflarePhase] = useState<PhaseGetResponse>();

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

      const client = cloudflareClient(sourceZone.apiEmail, sourceZone.apiKey);

      setCloudflarePhase(
        await client.rulesets.phases.get("http_request_firewall_custom", {
          zone_id: sourceZone.zoneId,
        })
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Zone Copy Plan Configuration
          </h1>
          <p className="mt-4 text-gray-600">
            Enter your Cloudflare credentials and zone information to create a
            copy plan.
          </p>

          <div className="mt-8 space-y-6">
            {/* API Email Input */}
            <div>
              <label
                htmlFor="apiEmail"
                className="block  font-medium text-gray-700"
              >
                API Email
              </label>
              <input
                type="email"
                name="apiEmail"
                id="apiEmail"
                className="mt-2 block w-full border border-gray-200 rounded-lg shadow-md py-3 px-4 focus:outline-none focus:ring-pink-800 focus:border-pink-800 "
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
                className="block  font-medium text-gray-700"
              >
                API Key
              </label>
              <input
                type="text"
                name="apiKey"
                id="apiKey"
                className="mt-2 block w-full border border-gray-200 rounded-lg shadow-md py-3 px-4 focus:outline-none focus:ring-pink-800 focus:border-pink-800 "
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
                className="block  font-medium text-gray-700"
              >
                Zone ID
              </label>
              <input
                type="text"
                name="zoneId"
                id="zoneId"
                className="mt-2 block w-full border border-gray-200 rounded-lg shadow-md py-3 px-4 focus:outline-none focus:ring-pink-800 focus:border-pink-800 "
                placeholder="Zone ID"
                value={sourceZone.zoneId}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* File Uploader */}
            <div className="mt-8">
              <label className="block  font-medium text-gray-700">
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

          {error && (
            <div className="mt-6  text-pink-800 bg-pink-100 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="mt-12 flex justify-end">
            <button
              type="button"
              className={`cursor-pointer inline-flex items-center px-4 py-3 border border-transparent  font-medium rounded-lg shadow-md text-white ${
                isLoading
                  ? "bg-gray-600"
                  : "bg-pink-800 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-800"
              }`}
              onClick={createCopyPlan}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Create Copy Plan"}
            </button>
          </div>

          {cloudflarePhase && (
            <div className="mt-12 border-t border-gray-400 pt-8">
              <CopyPlan
                cloudflarePhase={cloudflarePhase}
                zonesToApply={zonesToApply}
              />
            </div>
          )}
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

export default CopyConfig;
