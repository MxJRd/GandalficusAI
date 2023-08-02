// save to mongodb as new chat

import clientPromise from "@/lib/mongodb";
import { getSession } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user } = await getSession(req, res) ?? {}
    const { message }: { message: string } = req.body

    const newUserMessage = {
      role: 'user',
      content: message
    }
    const client = await clientPromise
    const db = await client.db('WizardAIProject')
    const chat = await db.collection('chats').insertOne({
      userId: user?.sub,
      messages: [newUserMessage],
      title: message
    })

    res.status(200).json({
      _id: chat.insertedId.toString(),
      messages: [newUserMessage],
      title: message
    })
  } catch(e) {
    res.status(500).json({
      message: 'An error occurred while creating a new chat.'
    })
    console.error('Error occurred in Create New Chat', e)
  }
}
