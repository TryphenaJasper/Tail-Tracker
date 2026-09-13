
function AnimalCard({ animal }) {
  return (
    <div className="animal-card">
      {animal.imageUrl && <img src={animal.imageUrl} alt={animal.name} />}
      <h3>{animal.name}</h3>
      <p>{animal.species}</p>
      <span className={`status status-${animal.status}`}>{animal.status}</span>
    </div>
  );
}

export default AnimalCard;
