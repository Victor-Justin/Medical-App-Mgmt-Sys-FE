import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authAPI } from './auth';
import userReducer from './userSlice';
import { doctorApi } from '../dash/api/doctorsApi';
import { appointmentApi } from '../dash/api/appointmentsApi';
import { usersApi } from '../dash/api/usersApi';
import { prescriptionsApi } from '../dash/api/prescriptionApi';
import { analyticsApi } from '../dash/api/analyticsApi';
import { complaintsApi } from '../dash/api/complaintsApi';
import { paymentsApi } from '../dash/api/paymentsApi';

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
  [usersApi.reducerPath]: usersApi.reducer,
  [prescriptionsApi.reducerPath]: prescriptionsApi.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer,
  [complaintsApi.reducerPath]: complaintsApi.reducer,
  [paymentsApi.reducerPath]: paymentsApi.reducer,
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
      .concat(usersApi.middleware)
      .concat(prescriptionsApi.middleware)
      .concat(analyticsApi.middleware)
      .concat(complaintsApi.middleware)
      .concat(paymentsApi.middleware),

});

export const persistedStore = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
