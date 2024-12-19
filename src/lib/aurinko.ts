// it is going to hold all code required to interact with aurinko api
"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";
export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorised");

  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID as string,
    serviceType,
    scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
    responseType: "code",
    returnUrl: `${process.env.NEXT_PUBLIC_URL}`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

export const exchangeCodeForAccessToken = async (code: string) => {
  try {
    const response = await axios.post(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {},
      {
        auth: {
          username: process.env.AURINKO_CLIENT_ID as string,
          password: process.env.AURINKO_CLIENT_SECRET as string,
        },
      },
    );
    return response.data as {
      accountId: number;
      accessToken: "string";
      userId: "string";
      userSession: "string";
    };
  } catch (e) {
    if(axios.isAxiosError(e)){
      console.error(e.response?.data);
    }
    console.error(e);
  }
};

// method to get email in exchange for token
export const getAccountDetails = async(accessToken : string)=>{
   try{
   const response = await axios.get(`https://api.aurinko.io/v1/account`,{
      headers : {
         'Authorization' : `Bearer ${accessToken}`
      }
   });
     return response.data as {
      email : string,
      name : string
     }
   }
   catch(e){
      if(axios.isAxiosError(e)){
         console.error('Error fetching account details:',e.response?.data);
      }
      console.error('Unexpected error fetching user account',e);
   }

}
