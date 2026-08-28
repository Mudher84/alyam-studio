import React from 'react';

const ContentAnalytics = ({ resourceId, resourceType }: { resourceId?: string, resourceType: string }) => {
  if (!resourceId) return null;
  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold text-lg">Analytics</h3>
      <p className="text-gray-500 text-sm">No analytics data available yet.</p>
    </div>
  );
};

export default ContentAnalytics;
