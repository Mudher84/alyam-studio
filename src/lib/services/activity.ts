export const activityLogService = {
  logAction: (userId: string, actionType: string, description: string, resourceType: string, resourceId: string, resourceName?: string) => {
    console.log(`[Activity Log] ${actionType} by ${userId} - ${description}`);
  }
};
