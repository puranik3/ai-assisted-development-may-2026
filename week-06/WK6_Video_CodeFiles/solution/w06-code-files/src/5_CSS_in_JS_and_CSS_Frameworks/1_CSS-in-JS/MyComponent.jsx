import styled from 'styled-components';
const RedButton = styled.button`
  background-color: red;
  color: white;
`;
function MyComponent() {
  return (
    <div>
      <RedButton>Click me!</RedButton>
    </div>
  );
}

export default MyComponent;