function GetZones() {
  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="text"
        placeholder="Enter API Key"
        className="border border-gray-400 rounded px-4 py-2 w-200"
      />
      <input
        type="email"
        placeholder="Enter Email"
        className="border border-gray-400 rounded px-4 py-2 w-200"
      />
    </div>
  );
}

export default GetZones;
