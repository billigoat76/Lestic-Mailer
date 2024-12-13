import { db } from "./server/db";

await db.User.create({
    data : {
        emailAddress : "navitatanwar38@gmail.com",
        firstName : "vaibhav",
        lastName : "tanwar",
    }
})

console.log('done');