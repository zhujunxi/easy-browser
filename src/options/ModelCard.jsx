const ModelCard = ({ active, settings, onChange, fields }) => {
  if (!active) return null

  return (
    <div className='model-fields'>
      {fields.map((field) => (
        <div className='form-group' key={field.id}>
          <label htmlFor={field.id}>{field.label}</label>
          <input
            type={field.type || 'text'}
            id={field.id}
            placeholder={field.placeholder}
            value={settings[field.id]}
            onChange={onChange}
          />
        </div>
      ))}
    </div>
  )
}

export default ModelCard
