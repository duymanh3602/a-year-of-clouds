import './ConversationSearch.css'

const ConversationSearch = (props) => {
  const { setSearchWord } = props
  return (
    <div className='conversation-search'>
      <input
        type='search'
        className='conversation-search-input'
        placeholder='Search Messages'
        onChange={(e) => setSearchWord(e.target.value)}
      />
    </div>
  )
}

export default ConversationSearch
