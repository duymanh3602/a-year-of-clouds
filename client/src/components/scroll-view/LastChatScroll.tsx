import { useEffect, useRef } from 'react'

const LastChatScroll = (props) => {
  const { isFirst, setIsFirst, isBottom } = props
  const elementRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (isFirst || isBottom) {
      elementRef.current?.scrollIntoView()
      setIsFirst(false)
    }
  }, [])
  return <div ref={elementRef} />
}

export default LastChatScroll
