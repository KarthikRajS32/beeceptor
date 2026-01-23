// Fixed PUT endpoint - preserves ID immutably
app.put("/api/endpoints/:id", (req, res) => {
  const { id } = req.params;
  const existingIndex = endpointRules.findIndex(r => r.id === id);
  
  if (existingIndex === -1) {
    return res.status(404).json({ error: 'Endpoint not found', id });
  }

  // Update rule while preserving original ID
  endpointRules[existingIndex] = {
    ...endpointRules[existingIndex],
    ...req.body,
    id: endpointRules[existingIndex].id // Force preserve original ID
  };

  res.json({ success: true, rule: endpointRules[existingIndex] });
});