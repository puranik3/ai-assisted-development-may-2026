import styles from './MyComponent.module.css';

function MyComponent() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hello, World!</h1>
    </div>
  );
}
export default MyComponent;