import type { User } from "@prisma/client";
import { randomUUID } from "crypto";
import { RedisSubscriber } from "./redis.service.js" ;
import { httpPusher } from "@exness-v3/redis/streams";

const redisSub = RedisSubscriber.getInstance();

export async function createUserInEngine(user: User) {
    const requestId = randomUUID();
    
    const payload = {
        type: 'USER_CREATED',
        requestId,
        data: JSON.stringify({
            email: user.email,
            password: user.password,
            id: user.id,
            balance: user.balance,
        }),
    };

    const pending = redisSub.waitForMessage(requestId);
    try {
      await httpPusher.xAdd('stream:engine', '*', payload);
    } catch (e) {
      redisSub.cancelWait(requestId);
      throw e;
    }

    return await pending;
}

export async function getUserBalanceFromEngine(email: string, password: string) {

    const requestId = randomUUID();

    const payload = {
        type: 'GET_USER_BALANCE',
        requestId,
        data: JSON.stringify({
            email: email,
            password: password,
        }),
    };  

    const balancePending = redisSub.waitForMessage<{ balance: number }>(requestId);
    try {
      const res1 = await httpPusher.xAdd('stream:engine', '*', payload);
      console.log(res1);
    } catch (e) {
      redisSub.cancelWait(requestId);
      throw e;
    }

    const res = await balancePending;
    console.log(res);

    return res.balance;
}