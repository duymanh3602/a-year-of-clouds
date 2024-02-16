import { useEffect, useRef } from 'react'

const LastChatScroll = () => {
  const elementRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => elementRef.current?.scrollIntoView())
  return <div ref={elementRef} />
}

export default LastChatScroll
