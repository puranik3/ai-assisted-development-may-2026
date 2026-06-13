// misc.js - Scratchpad file for testing Copilot features
// Use this file to practice inline suggestions and experiment with code

// Exercise 1: Comment-Driven Development
// Function to calculate the factorial of a number
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// Exercise 2: Array Operations
const numbers = [1, 2, 3, 4, 5];

// Filter even numbers
const evenNumbers = numbers.filter(num => num % 2 === 0);
console.log(numbers, evenNumbers);

// Exercise 3: Code from function signature
function reverseString(str) {
    return str.split('').reverse().join('');
}

// Exercise: Process User Data
function processUserData(users) {
    // Validate input
    if (!Array.isArray(users)) {
        throw new Error('Input must be an array');
    }
    
    // Filter adults and map to simplified objects
    return users
        .filter(user => user.age >= 18)
        .map(user => ({
            name: user.name,
            email: user.email
        }));
}

// Add your own experiments below:
