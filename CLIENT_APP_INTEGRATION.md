# Client Application Integration Guide: Automatic Ko-fi License Activation

This document explains how to correctly integrate the automatic Ko-fi license activation feature into your user-facing client application.

## 1. Feature Overview

The backend is now equipped with a feature that automatically links new user accounts to licenses purchased via Ko-fi.

- **How it Works:** When a user purchases a product via a Ko-fi webhook, an order is created in the database. This order includes the user's email and a newly generated license key. The order is initially "unprocessed."
- **Automatic Activation:** When a new user signs up with an email that matches an unprocessed Ko-fi order, a database trigger automatically fires. This trigger:
    1.  Links the order to the new user's account (`user_id`).
    2.  Creates an entry in the `user_licenses` table, effectively activating the license for that user.
    3.  Marks the Ko-fi order as `processed`.

## 2. The State Synchronization Problem (The "Refresh" Issue)

A common issue arises immediately after signup: the application may incorrectly show that the user is unlicensed, forcing them to manually refresh the page to see their correct license status.

### Cause: A Race Condition

This happens because of a "race condition" between your frontend application and the backend database trigger.

1.  **Signup:** Your frontend app sends a signup request to Supabase.
2.  **Immediate Redirect:** Supabase successfully creates the user and responds. Your frontend immediately redirects to a protected page or checks the user's license status.
3.  **Backend Delay:** At the same time, the backend trigger has started its work but may not have finished activating the license yet.
4.  **The Result:** The frontend's license check happens *before* the license is officially active in the database, so the check fails. When the user refreshes, the trigger has had time to complete, and the license is found.

## 3. The Solution: Polling for the License

To solve this, the frontend must **wait** for the backend trigger to complete its work before checking the license status. This is achieved by "polling" the database.

After a successful signup, instead of immediately redirecting, your application should repeatedly check the `user_licenses` table until the license appears or a timeout is reached.

### Step 1: Add a Polling Function

Add the following asynchronous function to your application's Supabase utility files. This function polls the `user_licenses` table for a given user ID.

```javascript
// File: src/lib/supabase-utils.js (or wherever you manage Supabase logic)

/**
 * Polls the database to check if a license has been activated for the user.
 * This is necessary to resolve the race condition between the frontend signup
 * and the backend trigger that assigns the license from a Ko-fi order.
 *
 * @param {string} userId - The ID of the newly signed-up user.
 * @param {number} [timeout=20000] - The maximum time to wait in milliseconds.
 * @param {number} [interval=2500] - The time to wait between checks in milliseconds.
 * @returns {Promise<boolean>} - Resolves to `true` if an active license is found, `false` otherwise.
 */
async function pollForActiveLicense(userId, timeout = 20000, interval = 2500) {
  const startTime = Date.now();

  console.log(`Starting license poll for user: ${userId}`);

  while (Date.now() - startTime < timeout) {
    try {
      // Directly query the user_licenses table to see if the trigger has run.
      // We select only the 'id' for a minimal query.
      const { data: license, error } = await supabase
        .from('user_licenses')
        .select('id, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error("Error while polling for license:", error);
        // Stop polling if a persistent database error occurs.
        return false;
      }

      if (license) {
        // License found and is active! The polling was successful.
        console.log("✅ License found and activated!");
        return true;
      }

      // If no license is found yet, wait for the next interval before checking again.
      console.log("...license not found yet, waiting...");
      await new Promise(resolve => setTimeout(resolve, interval));

    } catch (e) {
      console.error("An unexpected error occurred during polling:", e);
      // Stop polling on unexpected client-side errors.
      return false;
    }
  }

  // If the loop finishes without finding a license, it has timed out.
  console.warn("Polling timed out. License not found within the time limit.");
  return false;
}
```

### Step 2: Integrate Polling into Your Signup Flow

Modify your application's signup function. After `supabase.auth.signUp` succeeds, call the `pollForActiveLicense` function. Only proceed with redirecting the user after the polling is successful.

```javascript
// --- Example of a modified signup handler in your React/Vue/Svelte component ---

async function handleSignup(email, password) {
  // 1. Attempt to sign the user up
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("Signup failed:", error.message);
    // Display an error message to the user
    return;
  }

  if (data.user) {
    // 2. User was created successfully. Now, poll for the license.
    const licenseIsActive = await pollForActiveLicense(data.user.id);

    // 3. Act based on the polling result
    if (licenseIsActive) {
      // SUCCESS: The license is active in the database.
      // Force a refresh of the user's session to get the latest custom claims.
      await supabase.auth.refreshSession();

      // Now you can safely redirect to the licensed part of your application.
      // The user's session is up-to-date.
      window.location.href = '/dashboard';
    } else {
      // FAILURE: Polling timed out. The user does not have a pending license.
      // Redirect to the "inactive license" page as before.
      window.location.href = '/license-inactive';
    }
  }
}
```

By following these steps, you will eliminate the synchronization issue and provide a smooth, immediate experience for your users after they sign up.