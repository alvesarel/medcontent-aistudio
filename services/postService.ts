import { SavedPost } from '../types';
import { NewSavedPost } from '../types/posts';
import * as apiGateway from './apiGateway';

// ============================================================================
// This service acts as a client to the apiGateway for saved post operations.
// ============================================================================


/**
 * Fetches all saved posts for a given user.
 * @param userId - The ID of the user whose posts are to be fetched.
 * @returns A promise that resolves to an array of saved posts.
 */
export const getPosts = (userId: string): Promise<SavedPost[]> => {
    return apiGateway.getPosts(userId);
};

/**
 * Saves a new post for a user.
 * @param userId - The ID of the user saving the post.
 * @param postData - The data for the new post.
 * @returns A promise that resolves to the newly created post object.
 */
export const savePost = (userId: string, postData: NewSavedPost): Promise<SavedPost> => {
    return apiGateway.savePost(userId, postData);
};

/**
 * Deletes a specific post for a user.
 * @param userId - The ID of the user who owns the post.
 * @param postId - The ID of the post to delete.
 * @returns A promise that resolves when the post is deleted.
 */
export const deletePost = (userId: string, postId: string): Promise<void> => {
    return apiGateway.deletePost(userId, postId);
};
