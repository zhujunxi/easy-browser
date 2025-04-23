// ToggleSwitch Component
const ToggleSwitch = ({ id, checked, onChange }) => {
  return (
    <label className='switch'>
      <input type='checkbox' id={id} checked={checked} onChange={onChange} />
      <span className='slider'></span>
    </label>
  )
}

export default ToggleSwitch
