import { RoleType } from '@/types'
import { useUser } from '@auth0/nextjs-auth0/client'
import { faHatWizard } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import React from 'react'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'

interface MessageProps {
  role: RoleType
  content: string
}

export function Message({ role, content }: MessageProps) {
  const { user } = useUser()
  const userHasProfilePicture = (user && user?.picture) ? user.picture : ''
  return (
    <div className={`grid grid-cols-[30px_1fr] gap-5 p-5 ${role === 'assistant' ? 'bg-gray-600' : ''}`}>
      <div>
        {
          role === 'user' && <Image src={userHasProfilePicture} width={30} height={30} alt='user-avatar' className='chat-avatar' />
        }
        {
          role === 'assistant' && (
            <div className='flex h-[30px] w-[30px] justify-center items-center chat-avatar text-blue-500 bg-gray-800'>
              <FontAwesomeIcon icon={faHatWizard} />
            </div>
          )
        }
      </div>
      <div>
        <div className='prose prose-invert'>
          <ReactMarkdown>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
