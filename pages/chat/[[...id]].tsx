import { ChatSidebar } from "@/components/ChatSidebar.tsx"
import { streamReader } from "openai-edge-stream"
import { FormEvent, useEffect, useState } from "react"
import { v4 as uuid } from 'uuid'
import { Message } from "@/components/Message/Message"
import { RoleType } from "@/types"
import { useRouter } from "next/router"
import { GetServerSidePropsContext } from "next"
import clientPromise from "@/lib/mongodb"
import { getSession } from "@auth0/nextjs-auth0"
import { ObjectId } from "mongodb"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHatWizard } from "@fortawesome/free-solid-svg-icons"



interface ChatMessageType {
  _id: string
  role: RoleType
  content: string
}

export default function Chat({ id: chatId, title, messages = [] }: { id: string, title: string, messages: ChatMessageType[] }) {
  const [incomingMessage, setIncomingMessage] = useState('')
  const [fullIncomingMessage, setFullIncomingMessage] = useState('')
  const [newChatMessages, setNewChatMessages] = useState<ChatMessageType[]>([])
  const [userInput, setUserInput] = useState('')
  const [loadingResponse, setLoadingResponse] = useState(false)
  const [newChatId, setNewChatId] = useState<string | null>('')
  const [originalChatId, setOriginalChatId] = useState(chatId)
  const router = useRouter()
  const routeHasChanged = originalChatId !== chatId

  useEffect(() => {
    setNewChatMessages([])
    setNewChatId(null)
  }, [chatId]) // when route changes, reset messageList and routeParams

  useEffect(() => { // save newly streamed message to new chat messages
    if(!routeHasChanged && !loadingResponse && fullIncomingMessage) { // if loaded, fullMessageContent is saved, and route hasn't changed, update the chatMessages list.
      setNewChatMessages(prevMessages => [...prevMessages, {
        _id: uuid(),
        role: 'assistant',
        content: fullIncomingMessage
      }])
    }

    setFullIncomingMessage('') // clear

  }, [loadingResponse, fullIncomingMessage, routeHasChanged])

  useEffect(() => {
    if(!loadingResponse && newChatId) {
      setNewChatId('')
      router.push(`/chat/${newChatId}`)
    }
  }, [newChatId, loadingResponse, router]) // on creating new chatGroup

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // setOriginalChatId(chatId)
    setNewChatMessages((prevMessages) => {
      return [...prevMessages, {
        _id: uuid(),
        role: 'user',
        content: userInput
      }]
    })
    setLoadingResponse(true)
    setUserInput('')

    const res = await fetch('/api/chat/sendMessage', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        id: chatId,
        message: userInput
      })
    })

    const { body } = res ?? {}
    if(!body) return

    const reader = body.getReader()
  
    let messageContentForState: string = ''

    await streamReader(reader, (message) => {
      if(message.event === 'newChatId') {
        setNewChatId(message.content)
      } else {
        setIncomingMessage((prevMsgChunk) => `${prevMsgChunk}${message.content}`)
        messageContentForState += message.content
      }
    })

    setFullIncomingMessage(messageContentForState)
    setIncomingMessage('')
    setLoadingResponse(false)
  
  }

  const allChatMessages = [...messages, ...newChatMessages]

  return (
    <>
      <title>New Chat</title>
      <div className="grid h-screen grid-cols-[260px_1fr]"> {/* To account for spaces in TailwindCSS we can use an underscore when typing custom sizes */}
        <ChatSidebar chatId={chatId} />
        <div className='bg-gray-700 flex flex-col overflow-hidden'>
          <div className='flex flex-col-reverse flex-1 text-white overflow-scroll'>{/* Browsers will treat the bottom of the div as the top of the div because of column reverse. Coolest. Trick. Ever. */}
            
            { (!(allChatMessages.length > 0) && !loadingResponse) &&
              <div className='flex items-center text-center justify-center flex-col m-auto'>
                <FontAwesomeIcon icon={faHatWizard} className='text-6xl text-blue-600' />
                <h1 className='text-white/50 text-4xl font-bold'>Ask me a question, traveler!</h1>
              </div>
            }
            { allChatMessages.length > 0 && (
              <div className='mb-auto'> {/* Set margin bottom to auto so that way the div content starts at the top. Without this rule, the div content starts at the bottom. */}
                {
                  allChatMessages.map(message => <Message key={message._id} role={message.role} content={message.content} />)
                }
                {
                  (!!incomingMessage && !routeHasChanged) && <Message role='assistant' content={incomingMessage} />
                }
                {
                  (!!incomingMessage && !!routeHasChanged) && <Message role='warning' content='Only one message at a time. Please allow any other responses to complete before sending another message.' />
                }
              </div>
            )}
          </div>
          <footer className='bg-gray-800 p-10'>
            <form
              onSubmit={handleSubmit}
            >
              <fieldset className='flex gap-2' disabled={loadingResponse}> {/* disable the input field until the AI has generated a response */}
              {/* Fieldset is strong because disabled applies to everything in the form if wrapped in Fieldset*/}
                <textarea
                  className='w-full resize-none rounded p-2 text-white bg-gray-700 focus:bg-gray-600 focus:outline focus:outline-[2px] focus:outline-emerald-500 active:none'
                  value={userInput}
                  placeholder={loadingResponse ? "Send a message..." : ''}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <button className='submit-btn'>Send</button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const chatId = ctx.params?.id?.[0] ?? null
  if(chatId) {
    let validId;
    try {
      validId = new ObjectId(chatId)
    } catch(e) {
      console.error(e)
      return {
        redirect: {
          destination: '/chat'
        }
      }
    }
    const { user } = await getSession(ctx.req, ctx.res) ?? {}
    const client = await clientPromise
    const db = client.db('WizardAIProject')
    const chat = await db.collection('chats').findOne({
      userId: user?.sub,
      _id: validId
    })
    if(!chat) {
      return {
        redirect: {
          destination: '/chat'
        }
      }
    }
    return {
      props: {
        id: chatId,
        title: chat?.title,
        messages: chat?.messages.map((message: any) => ({
            ...message,
            _id: uuid()
          })
        )
      }
    }
  }
  return {
    props: {}
  }
}