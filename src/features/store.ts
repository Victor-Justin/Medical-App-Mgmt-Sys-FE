import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authAPI } from './auth';
import userReducer from './userSlice';
import { doctorApi } from '../api/User/viewdoctors';
import { appointmentApi } from '../api/User/appointmentsApi';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['user'], // only persist the user state
};

const rootReducer = combineReducers({
  [authAPI.reducerPath]: authAPI.reducer,
  [doctorApi.reducerPath]: doctorApi.reducer,
  [appointmentApi.reducerPath]: appointmentApi.reducer,
  
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,


  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authAPI.middleware)
      .concat(doctorApi.middleware)
      .concat(appointmentApi.middleware)
});

export const persistedStore = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
