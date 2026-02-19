import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../services/logger.service';
import { JWT_Token } from '../types/auth.type';

export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(JWT_Token, token);
  } catch (error) {
    logger.error('storeToken', 'error setting the jwt in async storage', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(JWT_Token);
    return token;
  } catch (error) {
    logger.error('getToken', 'error getting the jwt in async storage', error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(JWT_Token);
  } catch (error) {
    logger.error('removeToken', 'error removing the jwt in async storage', error);
  }
};