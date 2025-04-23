// SelectBox Component
const SelectBox = ({ id, value, onChange, options }) => {
  return (
    <div className='select-box'>
      <select id={id} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectBox
