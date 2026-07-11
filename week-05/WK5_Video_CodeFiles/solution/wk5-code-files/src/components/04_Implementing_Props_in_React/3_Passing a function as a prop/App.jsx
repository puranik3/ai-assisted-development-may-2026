import Button from './Button';

const App = () => {
  function handleClick() {
    alert('Button clicked!');
  }

  return (
    <div>
      <Button onClick={handleClick} />
    </div>

  );
};

export default App;
