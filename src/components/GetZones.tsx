import { useState } from "react";

function GetZones() {
  const [apiKey, setApiKey] = useState("");
  const [email, setEmail] = useState("");

  const fetchZones = async () => {
    const response = await fetch(
      "https://cortex.app.taralys.com/client/v4/zones",
      {
        method: "GET",
        headers: {
          "X-Auth-Email": email,
          "X-Auth-Key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();

    console.log(data);
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
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 hover:cursor-pointer"
      >
        Fetch Zones
      </button>
    </div>
  );
}

export default GetZones;
