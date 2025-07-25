import { User, AccountSettings } from '../types';
import * as apiGateway from './apiGateway';

// ============================================================================
// This service now acts as a client to the apiGateway for user operations.
// It is responsible for calling the "backend" and managing the user session.
// ============================================================================


/**
 * Calls the API gateway to create a new user.
 * @returns A promise that resolves to the new user object (without password).
 */
export const createUser = (name: string, email: string, password: string): Promise<User> => {
    return apiGateway.register(name, email, password);
};

/**
 * Calls the API gateway to log in a user.
 * @returns A promise that resolves to the user object upon successful login.
 */
export const loginUser = (email: string, password: string): Promise<User> => {
     return apiGateway.login(email, password);
};

/**
 * Calls the API gateway to update user settings.
 * @returns A promise that resolves to the updated user object.
 */
export const updateUserSettings = (userId: string, newSettings: AccountSettings): Promise<User> => {
    return apiGateway.updateSettings(userId, newSettings).then(updatedUser => {
        // After successfully saving to the "backend", update the session.
        setCurrentUser(updatedUser);
        return updatedUser;
    });
};


// --- Session Management (Client-Side) ---

const SESSION_STORAGE_KEY = 'medcontent_session';

/**
 * Stores the currently logged-in user's data in sessionStorage.
 * @param user The user object to store (password should already be removed).
 */
export const setCurrentUser = (user: User): void => {
    try {
        // Ensure password is not stored in the session
        const { password, ...userToStore } = user;
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userToStore));
    } catch (error) {
        console.error("Could not set user in sessionStorage", error);
    }
};

/**
 * Retrieves the current user's data from sessionStorage.
 * @returns The user object or null if not logged in.
 */
export const getCurrentUser = (): User | null => {
    try {
        const userJson = sessionStorage.getItem(SESSION_STORAGE_KEY);
        return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
        console.error("Could not parse user from sessionStorage", error);
        return null;
    }
};

/**
 * Clears the current user's session data.
 */
export const logoutUser = (): void => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
};
