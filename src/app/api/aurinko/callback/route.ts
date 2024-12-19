import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server";

export const GET = async(req : NextRequest)=>{
  const {userId} = await auth();
  console.log("userid is" , userId);
  if(!userId) return NextResponse.json({message : "User is not authorised"},{status : 401});

  const params = req.nextUrl.searchParams;
  const status = params.get('status');
  if(status!='sucess') return NextResponse.json({message : 'Failed to link account'},{status : 401});
  // get the code in exchange for access token


  const code = params.get('code');
  if(!code) return NextResponse.json({message : 'No code provided'} , {status : 401});

  // calling the exhangeCodeForAccessToken 

  const token = await exchangeCodeForAccessToken(code);
  if(!token) return NextResponse.json({message : 'Failed to exchange code for token'},{status : 401});
   
  const accountDetails = await getAccountDetails(token.accessToken);
  if(!accountDetails) return NextResponse.json({message : "Unable to find the account details with access Token"}, {status : 403})

  await db.account.upsert({
    where : {
      id : token.accountId.toString()
    },
    update : {
      accessToken : token.accessToken
    },
    create : {
      id : token.accountId.toString(),
      userId,
      emailAddress : accountDetails?.email,
      name : accountDetails?.name,
      accessToken : token.accessToken
    }
  })
  return NextResponse.redirect('/email')
}