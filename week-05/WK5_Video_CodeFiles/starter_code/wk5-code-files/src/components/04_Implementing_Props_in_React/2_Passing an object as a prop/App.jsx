import UserInfo from './UserInfo';

const App = () => {
  const user = { name: 'Ron', age: 13 }

  return (
    <div>
      <UserInfo user={user} />
    </div>
  );
};

export default App;
