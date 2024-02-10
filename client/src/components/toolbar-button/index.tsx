import './ToolbarButton.css'

const ToolbarButton = (props) => {
  const { icon } = props
  return <i className={`toolbar-button ${icon}`} />
}

export default ToolbarButton
