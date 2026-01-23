// Fixed frontend update function
const updateEndpoint = async (endpoint, updatedData) => {
  const response = await fetch(`http://localhost:3001/api/endpoints/${endpoint.backendId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData)
  });

  if (!response.ok) {
    throw new Error(`Failed to update endpoint: ${await response.text()}`);
  }

  // Update local state while preserving backendId
  const updatedEndpoint = {
    ...endpoint,
    ...updatedData,
    backendId: endpoint.backendId // Preserve original backendId
  };

  // Update localStorage
  const allEndpoints = JSON.parse(localStorage.getItem('beeceptor_endpoints') || '[]');
  const updatedEndpoints = allEndpoints.map(ep => 
    ep.id === endpoint.id ? updatedEndpoint : ep
  );
  localStorage.setItem('beeceptor_endpoints', JSON.stringify(updatedEndpoints));

  return updatedEndpoint;
};