import { useState, type FormEvent } from "react";
import { Cloudflare } from "cloudflare";
import type { Zone } from "cloudflare/resources/zones/zones";

function Zones() {
  const [apiKey, setApiKey] = useState("");
  const [email, setEmail] = useState("");
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchZones = async (e: FormEvent) => {
    e.preventDefault();

    if (!apiKey || !email) {
      setError("API Key and Email are required");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const client = new Cloudflare({
        baseURL: "https://cortex.app.taralys.com/client/v4",
        apiEmail: email,
        apiKey: apiKey,
      });

      const zones = await client.zones.list();

      setZones(zones.result);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Cloudflare Zones
        </h1>
        <p className="text-gray-600">
          Enter your Cloudflare API key and email to fetch your zones.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg mb-6">
        <form className="grid grid-cols-1 gap-4" onSubmit={fetchZones}>
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="apiKey"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              placeholder="Enter your Global API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex">
            <button
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white font-medium hover:cursor-pointer ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
              type="submit"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </div>
              ) : (
                "Fetch Zones"
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && zones.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No zones found for this account.
              </p>
            </div>
          </div>
        </div>
      )}

      {zones.length > 0 && (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Zone ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {zones.map((zone) => (
                <tr key={zone.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {zone.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">
                    {zone.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Zones;
