// ModelCard Component
const ModelCard = ({ id, title, active, settings, onChange, fields }) => {
  return (
    <div className={`model-card ${active ? 'active' : ''}`} id={`${id}-card`}>
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
