import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';

const FileRequestHandler = ({ endpoint, projectName }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        setError(null);
      }
    };
    input.click();
  };

  const handleSendRequest = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const url = `http://localhost:3001/${projectName}${endpoint.name}`;
      const fetchOptions = {
        method: endpoint.method,
        body: formData,
      };

      // Add headers (browser will set Content-Type automatically)
      try {
        const headers = JSON.parse(endpoint.headers);
        const filteredHeaders = {};
        Object.entries(headers).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-type') {
            filteredHeaders[key] = value;
          }
        });
        if (Object.keys(filteredHeaders).length > 0) {
          fetchOptions.headers = filteredHeaders;
        }
      } catch (e) {
        console.error('Invalid headers JSON');
      }

      const res = await fetch(url, fetchOptions);
      const data = await res.text();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: data,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Request Section */}
      <div className="border border-blue-200 rounded-lg bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Request</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Method</label>
            <p className="text-gray-900 font-mono">{endpoint.method}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Path</label>
            <p className="text-gray-900 font-mono">{endpoint.name}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-600">Headers</label>
          <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-32">
            {endpoint.headers}
          </pre>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-600 block mb-2">File</label>
          {selectedFile ? (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleFileSelect}
              className="w-full border-2 border-dashed border-gray-300 rounded p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-5 h-5 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Click to select file</p>
            </button>
          )}
        </div>

        <button
          onClick={handleSendRequest}
          disabled={loading || !selectedFile}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded font-medium transition-colors"
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
      </div>

      {/* Response Section */}
      {response && (
        <div className="border border-green-200 rounded-lg bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Response</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <p className="text-gray-900 font-mono">{response.status} {response.statusText}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600">Headers</label>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(response.headers, null, 2)}
            </pre>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Body</label>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-48">
              {response.body}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileRequestHandler;
