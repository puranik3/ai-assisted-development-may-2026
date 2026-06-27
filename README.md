# Professional Certificate in Generative AI and Agents for Software Development - May'26

## Questions & Answers

__Week 1 - Introduction to AI-assisted development__

### Question 1
What happens if I have 2 Copilot business plans? How do I know which business plan I am using? How can I switch between them?  
  
_Answer_: If two organizations grant Copilot access to the same GitHub account, the resolution happens on GitHub's side rather than through a VS Code setting. GitHub's current model does not provide a user-facing "switch active business subscription" button in VS Code.

### Question 2
Are completions still unlimited with the business plan? If code completion is not accepted, is it charged?  
  
_Answer_: Code completions and Next Edit suggestions remain included in all plans and do not consume AI Credits.

### Question 3
Does Copilot have a deny list (folder list) feature?  

__Answer__: You can configure patterns similar to `.gitignore` in a `.copilotignore` file, for example:
```text
# Ignore all files in the "node_modules" directory
node_modules/
# Ignore all files with the ".log" extension
*.log
# Ignore all files in the "dist", "build" directory
dist/
build/
# Ignore secret files
.env
*.key
*.pem
secrets/
```

### Question 4
For some reason Prework introduced ES6 but didn’t include Arrow function and Lambda function content.  

__Answer__: The difference between arrow function and traditional function is mainly in the behavior of `this` (apart from shorter syntax). Please raise this question in the next class, I will explain it with an example at the end.

### Question 5
What is __zero-shot prompting__ and __few-shot prompting__? Can you give an example of each?  

_Answer_: Zero-shot and few-shot examples are usually provided at inference time, as part of the prompt sent to the model (examples are included only for that specific request, and need to be provided each time).

So they are not training the model permanently.

**Zero-shot prompting**: When prompting to identify sentiment of product reviews, you ask the model to do a task without giving examples.

```text
Classify the sentiment of this review as Positive, Negative, or Neutral:

"The phone is fast, but the battery drains quickly."
```

Possible output:

```text
Neutral
```

**Few-shot prompting**: You give a few examples first, then ask the model to follow the same pattern. Notice that the final Review is the same as in the zero-shot example, but now we have provided examples to guide the model.

```text
Classify the sentiment of each review.

Review: "The laptop is excellent and very fast."
Sentiment: Positive

Review: "The delivery was late and the box was damaged."
Sentiment: Negative

Review: "The product is okay, nothing special."
Sentiment: Neutral

Review: "The phone is fast, but the battery drains quickly."
Sentiment:
```

Possible output:

```text
Neutral
```

So, the difference is:

**Zero-shot** = no examples.
**Few-shot** = a few examples to guide the model.

### Question 6
Opening app via Live server and opening HTML file directly in the browser - what is the difference and which one is better for development and why?  

_Answer_:
- Live server provides a local development environment that mimics a real web server, allowing you to test your web applications in conditions similar to production.
- `http://` vs `file://` protocol
- fetch() requests do not work with `file://` protocol due to CORS policy, but work with `http://` protocol provided by live server.
```javascript
fetch('./data/products.json')
```

**file://**

```text
file:///C:/project/data/products.json
```

May fail because of browser security.

**[http://localhost:5500](http://localhost:5500)**

```text
http://localhost:5500/data/products.json
```

Works normally.
- ES Modules may fail with `file://` protocol but work correctly with live server.
```html
<script type="module" src="app.js"></script>
```
- Routing in SPAs usually breaks.
- __SUMMARY__: The difference is mainly in **how the browser loads resources and what features are available**.

---

__Week 2 - Building the Backend: MongoDB and Mongoose__

### Question 1
When would we prefer using MongoDB over MySQL and vice-versa?  
  
_Answer_: Choose MongoDB when schema flexibility, document-oriented data modeling, and horizontal scalability are primary concerns. Choose MySQL when data is highly relational, integrity constraints are important, and complex transactional workloads are central to the application.  

__MongoDB is preferred when:__
* Data is **semi-structured or evolving**, and schema flexibility is valuable - Different documents may have different fields.
* High write throughput (fewer joins, no referential integrity checks) and **horizontal scaling (sharding)** are important.
* Most queries retrieve related data together, reducing the need for joins.
* Examples:
  * Product catalogs
  * Content management systems
  * User profiles
  * Event/log/IoT data
 
__MySQL is preferred when:__
* Data is highly structured and relationships are central.
* Complex joins, constraints, and referential integrity are important.
* Multi-row, multi-table **ACID transactions** are critical.
* Strong consistency requirements exist.
* Examples:
  * Banking systems
  * Accounting systems
  * Order management systems
  * ERP/CRM applications

---

__Week 3 - Building the Backend: Express.js and REST APIs__

### Question 1
How to save the plan generatd by the agent into a file?

### Question 2
How to get the LLM to review code such that it reviews across the codebase and not just a single file? It is important to get a holistic review of the codebase and not just a single file, to ensure that the code does not have duplications etc. and is following the best practices across the codebase.

_Answer_: To get a **holistic AI code review**, treat it as a **repository-level review process**, not a file-level prompt.

## 1. Use the assistant in “workspace/codebase/agent” mode

Do not ask from an isolated file tab. Use a tool/mode that can search the whole workspace.

For example, VS Code Copilot agents can use semantic search, text search, grep, file search, usages, directory listing, and file reading to gather context across the workspace. They can also use `#codebase` to force semantic codebase search. ([Visual Studio Code][1])

So instead of:

> Review this file.

Ask:

> Review this change in the context of the whole repository. First inspect the project structure, related modules, existing patterns, tests, and similar implementations. Do not limit the review to the currently open file.

## 2. Make the assistant build a codebase map first

A good prompt should force this sequence:

1. Identify app architecture.
2. Find entry points, routes, services, models, utilities, shared components.
3. Find existing patterns for similar features.
4. Compare the current code against those patterns.
5. Only then produce review comments.

Example prompt:

```text
Perform a holistic codebase review.

Before reviewing individual files:
1. Map the project structure.
2. Identify major layers: routes/controllers/components/services/models/utils/config/tests.
3. Find existing implementations similar to this change.
4. Check whether the new code duplicates existing logic, bypasses established abstractions, or introduces inconsistent patterns.
5. Review affected call sites, tests, config, error handling, logging, security, and naming.

For each issue, provide:
- severity
- file path
- evidence from the codebase
- why it matters
- suggested fix

Do not restrict yourself to the active file or diff.
```

## 3. Add repository-level AI instructions

For Copilot, put review rules in `.github/copilot-instructions.md`. GitHub supports repository-wide and path-specific custom instructions for Copilot; repository-wide instructions live in `.github/copilot-instructions.md`, while path-specific ones can live under `.github/instructions/**/*.instructions.md`. ([GitHub Docs][2])

Example:

```md
# Code Review Instructions

When reviewing or generating code:

1. Always search the repository for existing utilities, services, components, hooks, validators, models, and helpers before suggesting new ones.
2. Prefer reuse over creating new abstractions.
3. Check whether similar logic already exists elsewhere.
4. Review changes against project architecture, not just local correctness.
5. Check affected tests, routes, API contracts, types, config, error handling, logging, and security implications.
6. Mention file paths when referring to existing patterns.
7. Flag duplication, inconsistent naming, inconsistent error handling, missing tests, weak typing, and unnecessary new dependencies.
```

For other tools, use the equivalent:

```text
AGENTS.md
CLAUDE.md
.cursor/rules
.github/copilot-instructions.md
```

The exact filename depends on the assistant.

## 4. Ask for “related-code search” explicitly

This is very important.

Use prompts like:

```text
Before reviewing this file, search the codebase for similar implementations and list them.
```

```text
Find all places where this pattern already exists. Then tell me whether this change is consistent or duplicative.
```

```text
Check whether there is already a utility/service/component that should be reused instead of this new code.
```

This prevents the common LLM mistake of reviewing only the visible code.

## 5. Use PR-level review, not only editor review

For real review, ask the assistant to review:

```text
- the full diff
- files outside the diff that are affected
- related tests
- related types/interfaces
- related configuration
- duplicate implementations
```

GitHub Copilot can review pull requests, but its review comments are only comments; they do not approve, request changes, or block merging. ([GitHub Docs][2]) So use it as an additional reviewer, not the final gate.

## 6. Give it a checklist

For holistic review, ask for these categories:

```text
Review across:
- architecture consistency
- duplicate logic
- existing abstraction reuse
- naming consistency
- error handling
- logging
- validation
- security
- performance
- test coverage
- API contract changes
- backward compatibility
- dependency usage
- dead code
- config/env handling
```

## 7. Use static tools alongside AI

AI is good at reasoning, but bad at exhaustive detection. Pair it with:

```text
- linting
- type checking
- tests
- dependency analysis
- duplicate-code detection
- security scanning
```

Then ask the assistant:

```text
Here are the lint/test/duplicate-code/security results. Review the codebase holistically and explain what should be fixed first.
```

## Best practical workflow

Use this flow:

```text
1. Open the full repository in the AI-enabled IDE.
2. Ensure codebase indexing is complete.
3. Add repository instructions.
4. Ask the assistant to map the codebase.
5. Ask it to find similar implementations.
6. Ask it to review the PR/change against those patterns.
7. Ask for a severity-ranked report.
8. Run tests/static tools.
9. Ask AI to interpret the results and suggest refactoring.
```

The most important rule is this:

> Never ask “review this file.” Ask “review this change against the whole codebase, and first find related code.”

### Question 3:
How to get the coding assistant to take care about not duplicating code, creating useful utilities where appropriate and being able to reuse it while *generating* code?

_Answer_: Use **generation instructions** that force the assistant to do a **reuse scan before writing code**.

The problem is that many coding assistants default to:

> “Generate the code needed for this file/task.”

You need to change the flow to:

> “First inspect the codebase for existing patterns/utilities, then generate code only after deciding what to reuse or extract.”

## 1. Add a standing rule in project instructions

Put this in something like:

```text
.github/copilot-instructions.md
AGENTS.md
CLAUDE.md
.cursor/rules
```

Example:

```md
# Code Generation Rules

Before generating new code:

1. Search the codebase for existing utilities, services, components, hooks, validators, constants, types, and helpers that solve the same or similar problem.
2. Reuse existing code when possible.
3. Do not create a new utility/helper unless:
   - the logic is repeated or likely to be reused,
   - it has a clear single responsibility,
   - it belongs naturally in an existing shared folder/module.
4. If similar code exists but is not reusable as-is, prefer refactoring it into a shared utility instead of duplicating it.
5. Follow existing project naming, folder structure, error handling, logging, validation, and testing patterns.
6. Before writing code, summarize:
   - what existing code was found,
   - what will be reused,
   - what new code will be created,
   - why a utility is or is not needed.
7. After generating code, check whether the implementation duplicated any existing logic.
```

## 2. Prompt the assistant in two phases

Do not directly say:

```text
Add feature X.
```

Instead say:

```text
Add feature X.

Before writing code:
1. Search the codebase for similar implementations.
2. Identify reusable utilities/services/components.
3. Tell me whether this should reuse existing code, refactor existing code, or create a new utility.
4. Only then generate the code.
```

This is much more effective because it prevents immediate local code generation.

## 3. Ask for a “reuse plan” before code

Example prompt:

```text
I need to implement <feature>.

First create a reuse plan:
- existing files/modules that are relevant
- logic that can be reused
- logic that should be extracted into utilities
- new files, if any
- files that should not be touched

After that, generate the implementation.
```

This forces the assistant to think at the codebase level.

## 4. Give it utility-creation rules

Many assistants over-create utilities. So define when a utility is appropriate.

Good instruction:

```text
Create a utility only when the logic is:
- repeated in 2 or more places, or
- clearly domain-neutral, or
- likely to be reused soon, or
- complex enough that naming it improves readability.

Do not create a utility for one-off simple logic.
```

This avoids both extremes:

```text
Bad: duplicate everything
Bad: create tiny useless helpers for everything
Good: extract stable, reusable, named behavior
```

## 5. Ask it to modify existing code, not just add new code

For duplication control, this phrase is important:

```text
Do not only add new code. If existing code should be refactored for reuse, update it.
```

Otherwise the assistant may create a new helper while leaving older duplicated logic untouched.

## 6. Use a final self-check prompt

After code generation, ask:

```text
Now review your own changes against the whole codebase.

Check specifically:
- Did you duplicate existing logic?
- Did you create unnecessary utilities?
- Did you miss an existing abstraction?
- Are naming and folder choices consistent?
- Are tests updated in the same style as existing tests?
```

## Best reusable prompt

Use this when generating code:

```text
Implement <feature> in this codebase.

Before writing code:
1. Inspect the codebase for similar features, utilities, services, components, types, constants, validators, and tests.
2. Identify what should be reused.
3. Identify whether any existing logic should be extracted into a shared utility.
4. Avoid duplicating logic.
5. Follow existing architecture, naming, folder structure, error handling, validation, and testing patterns.
6. Explain your implementation plan briefly.
7. Then generate the code.

After generating code:
1. Check again for duplication.
2. Mention any new utility created and why it was justified.
3. Mention any existing code reused or refactored.
```

## Practical habit

For important changes, use this sequence:

```text
Step 1: “Explore the codebase and propose a reuse plan. Do not write code yet.”

Step 2: “Now implement the plan.”

Step 3: “Review the generated code for duplication and missed reuse opportunities.”
```

That usually works better than one large generation prompt.

---

__Sun, Jun 21, Extra Session__
- Using UI from / links to other sites as context when creating UI for an app

---

__Week 4 - Building the Backend: Express.js and REST APIs (Part 2)__

### Question 1
Can custom agents use other custom agents and agents installed as VSCode extensions?

_Answer_: Yes, custom agents can call other custom agents and agents installed as VSCode extensions, provided they expose an API or interface for interaction. This allows for modular and reusable agent design.

__To be explored__

### Question 2
What are the similarities and differences between custom agents and skills?

_Answer_: Custom agents and skills are both components that extend the capabilities of AI systems, but they serve different purposes and have distinct characteristics.

__To be explored__

---