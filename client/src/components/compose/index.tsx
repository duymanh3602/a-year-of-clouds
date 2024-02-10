import './Compose.css'

const Compose = (props) => {
  return (
    <div className='compose'>
      <input type='text' className='compose-input' placeholder='Type a message, @name' />

      {props.rightItems}
    </div>
  )
}

export default Compose
