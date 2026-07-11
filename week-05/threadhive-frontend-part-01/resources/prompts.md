2.2 Implementing React Components with GenAI

```
Create a Reset Password component at `/pages/Auth/ResetPassword.jsx`.

The component should:

- Be a controlled form with fields for email, old password, new password, and confirm password
- Accept an onResetPassword callback prop that App can use to respond to password reset
- On submit, validate that newPassword and confirmPassword match and call onResetPassword callback if validation passes. Show an error message below the form if validation fails. Show a success message using conditional rendering after successful password reset
```

2.3 Multimodal Inputs

```
Using the design of the login page in this screenshot, update our Login component to use a similar layout.

For the image on the right, download and use any placeholder image from https://unsplash.com/ and place it in the `assets` folder. Adapt the layout to our existing CSS Modules approach.
Do not clone the site's exact colors or typography — just use the layout structure as inspiration.
```

```
Move the labels inside the input fields as placeholders. Retain the font styling of the label.
```

2.4 Generating Unit Tests for React Components

```
/create-agent Create an agent called 'react-testing-agent' that creates unit tests for React components. Use 'React Testing Library' as the testing library and Vitest as the test runner. Keep all the tests in a separate top-level tests/ directory. Keep the agent workspace scoped.
```

```
The following test is failing: [paste the error here].
Look at the Register component and fix the test to match its actual implementation.
```
