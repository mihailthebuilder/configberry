import React, { useState } from "react";
import FileUploader from "./FileUploader";
import type { ZoneCsvRow } from "./ZonesDownload";
import Cloudflare from "cloudflare";
import type { PhaseGetResponse } from "cloudflare/resources/rulesets/phases/phases";

interface CopyPlanConfig {
  apiKey: string;
  apiEmail: string;
  zoneId: string;
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

      const client = new Cloudflare({
        baseURL: "https://cortex.app.taralys.com/client/v4",
        apiEmail: sourceZone.apiEmail,
        apiKey: sourceZone.apiKey,
      });

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
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
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

          {cloudflarePhase && (
            <CopyPlan
              cloudflarePhase={cloudflarePhase}
              zonesToApply={zonesToApply}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const displayRules = (phase: PhaseGetResponse) => {
  const rules = phase.rules.map((rule) => {
    return {
      id: rule.id,
      name: rule.action,
      action: rule.description,
      enabled: rule.enabled,
      expression: rule.expression,
    };
  });
  return rules;
};

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

interface CopyPlanProps {
  cloudflarePhase: PhaseGetResponse;
  zonesToApply: ZoneCsvRow[];
}

function CopyPlan({ cloudflarePhase, zonesToApply }: CopyPlanProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900">Rules to apply</h2>
      <div className="mt-4 bg-gray-100 p-4 rounded-md overflow-x-auto">
        {displayRules(cloudflarePhase).map((rule) => (
          <div
            key={rule.id}
            className="mb-4 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{rule.name}</h3>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  rule.enabled
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {rule.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{rule.action}</p>
            <div className="mt-2 text-xs">
              <span className="font-medium">Expression:</span>
              <code className="ml-2 bg-gray-200 px-1 py-0.5 rounded">
                {rule.expression}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CopyConfigC;
