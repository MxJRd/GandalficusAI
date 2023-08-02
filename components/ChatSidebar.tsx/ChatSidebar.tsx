import { faMessage, faPlus, faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { useEffect, useState } from "react"

interface ChatType {
  _id: string
  title: string
}

interface ChatSidebarProps {
  chatId: string
}

export const ChatSidebar = ({ chatId }: ChatSidebarProps ) => {
  const [chatList, setChatList] = useState<ChatType[]>([])

  useEffect(() => {
    const loadChatList = async () => {
      const res = await fetch('/api/chat/getChatList', {
        method: 'POST'
      })
      const json = await res.json()

      setChatList(json?.chats ?? [])
    }
    loadChatList()
  }, [chatId])
  return (
    <div className='bg-gray-900 text-white flex flex-col overflow-hidden'>
      <Link className='side-menu-item bg-pink-400 hover:bg-pink-500' href='/chat'>
        <FontAwesomeIcon icon={faPlus}/>New Chat
      </Link>
      <div className='flex-1 overflow-auto bg-gray-950'>
        {
          chatList.map(chat => (
            <Link className={`${chatId === chat._id ? 'bg-gray-700 hover:bg-gray-700' : ''} side-menu-item`} key={chat._id} href={`/chat/${chat._id}`}>
              <FontAwesomeIcon icon={faMessage}/><span className='truncate'>{chat.title}</span>
            </Link>
          ))
        }
      </div>
      <Link className='side-menu-item' href='/api/auth/logout'>
        <FontAwesomeIcon icon={faRightFromBracket}/>Logout
      </Link>
    </div>
  )
}
