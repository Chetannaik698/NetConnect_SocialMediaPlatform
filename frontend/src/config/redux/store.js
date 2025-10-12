import { configureStore } from "@reduxjs/toolkit"
import authReducer from './reducer/authReducer'
import postReducer from './reducer/postReducer'



/**
 * 
 * Steps for state management
 * Submit action
 * Handle action on it's reducer
 * Register here
 * 
 */

export const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducer
    }
})