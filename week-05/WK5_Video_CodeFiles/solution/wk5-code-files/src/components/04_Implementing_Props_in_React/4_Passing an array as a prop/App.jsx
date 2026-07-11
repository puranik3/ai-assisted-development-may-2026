import List from './List';

const App = () => {
  const items = ['Item 1', 'Item 2', 'Item 3'];

  return (
    <div>
      <List items={items} />
    </div>

  );
};

export default App;
