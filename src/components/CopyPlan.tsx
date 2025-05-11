import type { PhaseGetResponse } from "cloudflare/resources/rulesets/phases/phases";
import { useState } from "react";
import { cloudflareClient } from "@lib/cf";

interface CopyPlanProps {
  cloudflarePhase: PhaseGetResponse;
  zonesToApply: ZoneCsvRow[];
}

interface ZoneCopyResult {
  zoneName: string;
  error?: string;
}

function CopyPlan({ cloudflarePhase, zonesToApply }: CopyPlanProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ZoneCopyResult[]>([]);

  console.log(cloudflarePhase.rules);

  const applyRulesToZones = async () => {
    setIsLoading(true);
    const results: ZoneCopyResult[] = [];
    for (const zone of zonesToApply) {
      const client = cloudflareClient(zone.apiEmail, zone.apiKey);

      try {
        await client.rulesets.phases.update("http_request_firewall_custom", {
          zone_id: zone.zoneId,
          // @ts-ignore: true
          rules: cloudflarePhase.rules.map((rule) => {
            return {
              enabled: rule.enabled,
              action: rule.action,
              expression: rule.expression,
              description: rule.description,
              action_parameters: rule.action_parameters,
            };
          }),
        });

        results.push({ zoneName: zone.zoneName });
      } catch (err) {
        results.push({
          zoneName: zone.zoneName,
          error: (err as Error).message,
        });
      }
    }
    setIsLoading(false);
    setResults(results);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900">Rules to apply</h2>
      <div className="mt-4 bg-gray-100 p-4 rounded-md overflow-x-auto">
        {displayRules(cloudflarePhase).map((rule) => (
          <div
            key={rule.id}
            className="mb-4 border-b border-gray-700 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <span className="text-xs text-gray-600 uppercase font-medium">
                  Rule name:
                </span>
                <p className="text-sm text-gray-700">{rule.name}</p>
              </div>

              <span
                className={`ml-2 px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                  rule.enabled
                    ? "bg-pink-100 text-pink-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {rule.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            <div className="mb-2">
              <span className="text-xs text-gray-600 uppercase font-medium">
                Rule action:
              </span>
              <p className="text-sm text-gray-700">{rule.action}</p>
            </div>

            <div>
              <span className="text-xs text-gray-600 uppercase font-medium">
                Expression:
              </span>
              <div className="w-full font-mono text-sm bg-gray-200 px-3 py-2 mt-1 rounded break-all">
                {rule.expression}
              </div>
            </div>

            {rule.action_parameters && (
              <div className="mt-2">
                <span className="text-xs text-gray-600 uppercase font-medium">
                  Action parameters:
                </span>
                <div className="w-full font-mono text-sm bg-gray-200 px-3 py-2 mt-1 rounded break-all">
                  {JSON.stringify(rule.action_parameters, null, 2)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gray-100 p-4 rounded-md">
        <h2 className="text-lg font-medium text-gray-900 mb-3">
          Zones to apply the rules to:
        </h2>

        <div className="mt-2 flex flex-wrap gap-2">
          {zonesToApply.map((zone) => (
            <span
              key={zone.zoneId}
              className="px-3 py-1 bg-pink-100 text-pink-800 text-sm rounded-full"
            >
              {zone.zoneName}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          className={`cursor-pointer inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isLoading
              ? "bg-gray-600"
              : "bg-pink-800 hover:bg-pink-600 focus:ring-pink-800"
          }`}
          onClick={applyRulesToZones}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Apply Rules to Zones"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-6 border border-gray-200 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-900 p-4 border-b border-gray-200">
            Results
          </h2>
          <div className="divide-y divide-gray-200">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 flex justify-between items-center"
              >
                <div className="flex items-center">
                  {result.error ? (
                    <svg
                      className="w-5 h-5 text-gray-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-pink-800 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="font-medium text-gray-700">
                    {result.zoneName}
                  </span>
                </div>
                {result.error ? (
                  <div className="flex-1 ml-4">
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {result.error}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-pink-800 bg-pink-100 px-2 py-1 rounded">
                    Successfully applied
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const displayRules = (phase: PhaseGetResponse) => {
  const rules = phase.rules.map((rule) => {
    return {
      id: rule.id,
      name: rule.description,
      action: rule.action,
      enabled: rule.enabled,
      expression: rule.expression,
      action_parameters: rule.action_parameters as Object | undefined,
    };
  });
  return rules;
};

export default CopyPlan;
