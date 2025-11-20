import type { User } from "@prisma/client";
import { RedisSubscriber } from "./redis/service" ;
import { httpPusher } from "@exness-v3/redis/streams";

const redisSub = RedisSubscriber.getInstance();

export async function createUserInEngine(user: User) {
    const requestId = Date.now().toString();
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

    await httpPusher.xAdd('stream.engine', '*', payload);
    const res = await redisSub.waitFoMessage(requestId);
    return res;
}

export async function getUserBalanceFromEngine(email: string, password: string) {
    const requestId = Date.now().toString();
    const payload = {
        type: 'GET_USER_BALANCE',
        requestId,
        data: JSON.stringify({
            email: email,
            password: password,
        }),
    };  

    const res1 = await httpPusher.xAdd('stream:engine', '*', payload);
    console.log(res1);
    const res = await redisSub.waitFoMessage(requestId);
    console.log(res)
    return res.balance;
}