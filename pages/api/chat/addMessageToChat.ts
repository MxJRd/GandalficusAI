import clientPromise from "@/lib/mongodb"
import { getSession } from "@auth0/nextjs-auth0"
import { ObjectId } from "mongodb"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user } = await getSession(req, res) ?? {}
    const client = await clientPromise
    const db = client.db('WizardAIProject')

    const { id: chatId, role, content }: { id: number, role: string, content: string } = req.body
    const userId = user?.sub

    let validId;
  
    try {
      validId = new ObjectId(chatId)
    } catch(e) {
      res.status(422).json({
        message: 'Invalid chatId.'
      })
      return // stop running if fail
    }

    const isUserContentTooLong = (role === 'user' && content.length > 200)
    const isGandalficusResTooLong = (role === 'assistant' && content.length > 100000)
    if(!content || typeof content !== 'string' || isUserContentTooLong || isGandalficusResTooLong) {
      res.status(422).json(
        {
          message: 'Message is required and must be less than 200 characters in total.'
        }
      )
      return // stop running if fail.
    }

    const chat = await db.collection('chats').findOneAndUpdate({
      _id: validId, // Mongodb setId pattern
      userId
    }, {
      $push: {
        messages: {
          role, content
        }
      }
    }, {
      returnDocument: 'after'
    })

    res.status(200).json({
      ...chat,
      _id: chat.value?._id.toString()
    })
  } catch(e) {
    res.status(500).json({
      message: 'An error occurred when adding a message to chat.'
    })
  }
}