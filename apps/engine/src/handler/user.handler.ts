import { users } from '../memoryDb';
import type { User } from '../types';
import type { UserPayload, UserCreated } from '../types/handler.types';
import { sendAcknowledgement } from '../utils/send-ack';

export async function handleGetUserBalance(
  payload: UserPayload,
  requestId: string
) {
  try {
    const { email, password } = payload;
    const user = users[email, password];

    if (!user) {
      console.log(`Attempted to close trade for non-existent user: ${email}`);

      await sendAcknowledgement(requestId, 'GET_BALANCE_FAILED', {
        reason: 'User not found',
      });
      return;
    }

    await sendAcknowledgement(requestId, 'GET_BALANCE_ACKNOWLEDGEMENT', {
      status: 'success',
      balance: user.balance,
    });
  } catch (err) {
    console.error('Error in getting user balance:', err);
    await sendAcknowledgement(requestId, 'GET_BALANCE_ERROR', {
      message: err,
    });
  }
}

export async function handleUserCreation(
  payload: UserCreated,
  requestId: string
) {
  try {
    const isUserExisting = users[payload.email, payload.password];

    if (!isUserExisting) {
      const newUser: User = {
        id: payload.id,
        email: payload.email,
        password: payload.password,
        balance: {
          amount: payload.balance,
          currency: 'USD',
        },
        trades: [],
      };

      users[payload.email] = newUser;

      await sendAcknowledgement(requestId, 'USER_CREATED_SUCCESS', {
        status: 'success',
        userId: newUser.id,
      });
    } else {
      console.log(`[USER] User already exists: ${payload.email}`);

      await sendAcknowledgement(requestId, 'USER_ALREADY_EXISTS', {
        reason: 'User already exists',
        email: payload.email,
      });
    }
  } catch (err) {
    console.error('[USER] Error creating user:', err);
    await sendAcknowledgement(requestId, 'USER_CREATION_ERROR', {
      message: err,
    });
  }
}

// todo: get user assets