import { NextRequest } from "next/server";
import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: 'edge'
}
// req.headers.get('origin') is the header that will fetch our origin url
export default async function handler(req: NextRequest) {
  try {
    const { message, id: chatIdFromParam }: { message: string, id: string | null } = await req.json()
    const initialChatMessage = {
      role: 'system',
      content: 'Your name is Gandalficus. You are a wise and helpful wizard who is based on Gandalf from (Lord Of The Rings) and other wise wizards in literature. Your response should be formatted as markdown. Embellish sentences as Gandalf and other wizards in lore would.'
    }

    let newChatId: any
    let chatId = chatIdFromParam
    let chatMessages = []

    if(chatId) {
      // add a message to the chatGroup
      console.log(chatId, message)
      const res = await fetch(`${req.headers.get('origin')}/api/chat/addMessageToChat`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: req.headers.get('cookie') ?? ''
        },
        body: JSON.stringify({
          id: chatId,
          role: 'user', // users will be adding chatMessage to chatGroup
          content: message
        })
      })
      // OpenAI has a max token limit of 4096, where each token is worth about 4 characters.
      const json = await res.json()
      // console.log('JSONMSG: ', json.value)
      chatMessages = json.value.messages ?? []

    } else {
      const res = await fetch(`${req.headers.get('origin')}/api/chat/createChat`, { // CREATES A NEW CHAT GROUP
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: req.headers.get('cookie') ?? ''
        },
        body: JSON.stringify({
          message
        })
      })
  
      const json = await res.json()
      chatId = json._id
      newChatId = json._id
      chatMessages = json.messages ?? []
    }

    const messagesToInclude: any[] = [] // need to create token limit to send to openAI. Need to include as many messages as possible newest -> oldest.
    chatMessages.reverse() // reorder oldest to newest.
    let usedTokens = 0

    for(let chatMessage of chatMessages) {
      const messageTokens = chatMessage.content.length / 4
      usedTokens = usedTokens + messageTokens
      if(usedTokens <= 1500) {
        messagesToInclude.push(chatMessage)
      } else {
        break;
      }
    }

    messagesToInclude.reverse() // need to reorder array because openAI expects chat messages from oldest to newest.
    const stream = await OpenAIEdgeStream('https://api.openai.com/v1/chat/completions', {
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [initialChatMessage, ...messagesToInclude],
        stream: true
      })
    },
    {
      onBeforeStream: async ({ emit }) => {
        if(newChatId) {
          emit(newChatId, 'newChatId')
        }
      },
      onAfterStream: async ({ fullContent }) => { // allows us to send a message after everything has fired.
        // edge function can't access our DB. Need to create an endpoint to allow for access to DB
        await fetch(`${req.headers.get('origin')}/api/chat/addMessageToChat`, {
          method: "POST",
          headers: {
            'content-type': 'application/json',
            cookie: req.headers.get('cookie') ?? ''
          },
          body: JSON.stringify({
            id: chatId,
            role: 'assistant',
            content: fullContent
          })
        })
      }
    })
    return new Response(stream)
  } catch(e) {
    console.error(e)
  }
}
