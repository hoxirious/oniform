# oniform - Your Nested Form Builder

## Description
`oniform` is a lightweight tool to create **nested** forms at ease. The interface is built with Typescript and Snabbdom with focus on performance and user experience.

## Demo
- **Playground**: [Link](https://oniform.giahy33.workers.dev/)

## Features
- **Nested Form Playground**: To create nested forms with ease.
- **Clipboard**: A copy board of form's elements for your convenience.
- **Review**: To review result form before exporting.
- **Library**: To save and load your `oniforms`.

## Documentation
An `oniform` is created from three main elements: `Group`, `Question`, and `Option`.
### Group 
> Each group is the outermost wrapper. It contains questions.
### Question
> Each question contains the question and options.
- Can create a *dependent question* from a question
- Can create a *dependent group* from a question
- Question's dependants will appear when the question is **fully answered**. This includes all of its dependants must be also answered.
### Option
> Each option is a choice for a question.
- Can create a *dependent question* from an option
- Can create a *dependent group* from an option
- Options's dependants will appear when the option **is selected**.

