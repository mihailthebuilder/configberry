import { useState } from "react";
import Cloudflare from "cloudflare";

function GetZones() {
  const [apiKey, setApiKey] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchZones = async () => {
    try {
      setError(null);

      const client = new Cloudflare({
        apiEmail: email,
        apiKey: apiKey,
      });

      console.log(client.zones.list());
    } catch (err: any) {
      setError(err.message || "Failed to fetch zones");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="text"
        placeholder="Enter API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="border border-gray-400 rounded px-4 py-2 w-200"
      />
      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-gray-400 rounded px-4 py-2 w-200"
      />
      <button
        onClick={fetchZones}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Fetch Zones
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default GetZones;
