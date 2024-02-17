import './ToolbarButton.css'

const ToolbarButton = (props) => {
  const { icon, click, setClick } = props
  return (
    <i
      onClick={() => {
        setClick && setClick(!click)
      }}
      className={`toolbar-button ${icon}`}
    />
  )
}

export default ToolbarButton
