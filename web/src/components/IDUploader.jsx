import { useState } from "react";

// Accept 'userId' as a prop
const IDUploader = ({ onVerificationSuccess, userId }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    if (!file) return;

    setStatus("loading");
    const formData = new FormData();
    formData.append("idCard", file);
    // Add User ID to the package
    formData.append("userId", userId);

    try {
      const response = await fetch("http://localhost:5000/api/verify-id", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      if (data.isValid) {
        setStatus("success");
        if (onVerificationSuccess) onVerificationSuccess(data);
      } else if (data.isPending) {
        // New State: Admin Review
        setStatus("pending");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setResult({ reason: "Server connection failed" });
    }
  };

  return (
    <div className="p-6 bg-white rounded-4xl shadow-md border border-gray-100 max-w-sm mx-auto">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        🪪 Verify Student ID
      </h3>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
      />

      <button
        onClick={handleVerify}
        disabled={!file || status === "loading"}
        className={`mt-4 w-full py-2 px-4 rounded-lg font-medium text-white transition-all ${
          status === "loading"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {status === "loading" ? "Analyzing..." : "Verify Identity"}
      </button>

      {/* RESULT BOXES */}
      {status === "success" && (
        <div className="mt-4 p-3 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800">
          <strong>✅ Verified!</strong>
          <br />
          <span className="text-xs">Name: {result.name}</span>
          <br />
          <span className="text-xs">Org: {result.institution}</span>
        </div>
      )}

      {status === "pending" && (
        <div className="mt-4 p-3 rounded-lg text-sm bg-yellow-50 border border-yellow-200 text-yellow-800">
          <strong>⚠️ Sent to Admin</strong>
          <br />
          <span className="text-xs">
            AI couldn't auto-verify this image. It has been sent to our team for
            manual approval.
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-800">
          <strong>❌ Verification Failed</strong>
          <br />
          <span className="text-xs">{result?.reason || "Unknown error"}</span>
        </div>
      )}
    </div>
  );
};

export default IDUploader;
