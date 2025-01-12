import { AtpAgent } from '@atproto/api'
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

// server

import express from "express";
const app = express();
const port = 8000;

app.listen(port, async () => {
    console.log(`Running on port ${port}`);
});

// endpoints

app.get('/checkBotAccount', async (req, res) => {
    let handle = req.query.handle?.toString();
    let follows = await GetFollows(handle!);

    let result: number[] = await CheckFollows(follows); 
    let sum = 0;
    result.forEach(r => sum += r);

    res.send({
        diagnosis: result.some(r => r > 7) ? "May be a bot" : "Not suspisious enough.",
        susFollowActions: sum
    });
  });


// helper functions

async function CheckFollows(follows: ProfileView[] | undefined) : Promise<number[]> {
    let repetitions = 0;
    let repetitionsArr: number[] = [];
    let repetitionPos = 0;

    for (let index = 0; index < follows!.length-1; index++) {
        const element = Date.parse(follows![index].createdAt!);
        const element1 = Date.parse(follows![index+1].createdAt!);

        if(element != undefined){
            if(Math.abs(element - element1) <= 5000){
                repetitions++;
                repetitionsArr[repetitionPos] = repetitions;
            }else{
                repetitionPos++;
                repetitions = 0;
            }
        }
    }

    console.log(repetitionsArr)

    return repetitionsArr;
}

async function GetFollows(id: string) : Promise<ProfileView[] | undefined> {
    let cursor: string | undefined
    let follows;
    do{
        if(id != undefined && id != ""){
            let res = await agent.getFollows({ actor: id, limit: 100, cursor });

            cursor = res.data.cursor;
            follows = res.data.follows;    
        }
    }while(cursor);
    
    return follows;        
}

const agent = new AtpAgent({
  service: 'https://bsky.social/xrpc/'
});

agent.login({
  identifier: '',
  password: '',
});

