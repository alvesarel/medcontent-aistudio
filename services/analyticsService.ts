import { AnalyticsData, NewRecordData } from '../types/analytics';
import * as apiGateway from './apiGateway';

// ============================================================================
// This service now acts as a client to the apiGateway for analytics operations.
// ============================================================================


/**
 * Sends a new generation record to the API gateway to be saved.
 */
export const addGenerationRecord = (data: NewRecordData): void => {
    try {
        // This is a "fire and forget" call for the client.
        // The gateway handles the actual saving.
        apiGateway.postRecord(data);
    } catch (error) {
        // In a real app, you might want to queue this and retry later if the API is down.
        console.error("Failed to send analytics record to gateway:", error);
    }
};

/**
 * Fetches and processes analytics data for a specific user from the API gateway.
 */
export const getAnalyticsData = (userId: string): Promise<AnalyticsData> => {
    return apiGateway.getAnalytics(userId);
};