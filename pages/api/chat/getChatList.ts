import clientPromise from "@/lib/mongodb";
import { getSession } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user } = await getSession(req, res) ?? {}
    const client = await clientPromise
    const db = client.db('WizardAIProject')
    const chats = await db.collection('chats').find({
      userId: user?.sub,

    }, {
      projection: { // this property filters in mongodb
        userId: 0,
        messages: 0
      }
    }).sort({
      _id: -1 // from latest to oldest. Ids in mongodb are timestamped so this will sort new -> old
    }).toArray()

    res.status(200).json({ chats }) // send chats over the wire.

  }catch(e) {
    res.status(500).json({
      message: 'An error occurred when getting the chat list.'
    })
  }
}