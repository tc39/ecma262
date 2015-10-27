# Frequently Asked Questions

An index of frequently asked questions regarding all things ECMA-262.

# Process Questions

##### What is the process for proposing a new feature?

New features start life as a proposal to the [TC39](#what-is-a-tc39) committee and must be championed (or co-championed) by at least one member of the committee. Once the proposal is raised at a committee meeting, it will become a Stage 0 proposal and move along from there. For more details on how proposal stages work, check out the [proposal process document][proposal-process-document].

If you would like to contribute, please check out [Contributing to ECMAScript](https://github.com/tc39/ecma262/blob/master/CONTRIBUTING.md).

##### What is a "TC39"?

TC39 stands for "Technical Committee 39" and is the committee responsible for iterating on and evolving the ECMAScript language specification. The committee generally meets around 6 times a year to discuss progress on pending proposals and collectively work on moving forward with changes to the spec.

##### Why can't we remove feature X?

Changes to ECMAScript must carefully consider the state of the world using the previous version of the language. This includes a large percentage of the web. As a result, in order to remove a feature from ECMAScript, TC39 must be able to show that the feature is used almost never (and thus can be removed). Going through this exercise is extremely difficult and sometimes impossible -- so in general ECMAScript *very* rarely removes features.

Because the web is so large, even features that behave in a way that's surprising and potentially lead to bugs are often relied upon by real programs. Therefore, only actual use data, and not a sense of whether some feature is correct or useful, can guide TC39 in potentially changing existing behavior.

# Feature Questions

### Arrow Functions

##### Why isn't there a `->` version of arrow functions?

The motivation for `=>` was to address the oft-fired footgun of dynamic `this` bindings. Additionally, having two forms of arrows is confusing; So only one form was added.

### Destructuring

##### Why isn't the object property destructuring syntax flipped the other way?

(i.e. `let {x: y} = {x: 42}` vs `let {y: x} = {x: 42}`)

In all other object patterns in the language, the syntax to the left of the colon represents the "structure" of an object; So having destructuring patterns match this convention was most consistent.

More fundamentally, however, flipping the syntax the other way would produce a grammar that requires infinite lookahead to properly disambiguate.

### Modules

##### Why don't `import` statements use real destructuring syntax?

[`import` statements create an alias of a remote binding](#why-are-imported-module-bindings-aliased-instead-of-copied), they do not create a new local binding. First-class destructuring, however, allows for the creation of new bindings from substructures of objects and arrays. As a result first-class destructuring was not a good fit for the `import` statement.

##### Why are imported module bindings aliased instead of copied?

The biggest reason for this is that it allows cyclic module dependencies to work.

For example, consider the following contrived scenario:

```javascript
// Even.js
import {isOdd} from "./Odd.js";

export function isEven(num) {
  if (num === 0) {
    return true;
  } else {
    return isOdd(num - 1);
  }
}
```

```javascript
// Odd.js
import {isEven} from "./Even.js";

export function isOdd(num) {
  if (num === 0) {
    return false;
  } else {
    return isEven(num - 1);
  }
}
```

```javascript
// main.js
import {isOdd} from "./Odd";

isOdd(2);
```

The list of operations that execute will go something like the following:

1. Note that **main.js** has a named import called `isOdd` that comes from **Odd.js**
2. Begin loading **Odd.js**.
3. Once **Odd.js** has loaded, note that it has a named export called `isOdd` and a named import called `isEven` that comes from **Even.js**.
4. Create an empty binding called `isOdd` for **Odd.js**'s exports.
5. Begin loading **Even.js**.
6. Once **Even.js** has loaded, note that it has a named export called `isEven` and a named import called `isOdd` that comes from **Odd.js**.
7. Create an empty binding called `isEven` for **Even.js**'s exports.
8. Now that all of the dependencies of **Even.js** have loaded, begin evaluating it with a variable called `isOdd` aliased to the (currently empty) `isOdd` binding we created in step 4.
9. As we evaluate the `export function isEven() { ... }` statement in **Even.js**, fill in the value for the `isEven` binding created in step 7.
10. Now that all of the dependencies of **Odd.js** have loaded, begin evaluating it with a variable called `isEven` aliased to the (no longer empty) `isEven` binding we created in step 9.
11. As we evaluate the `export function isOdd() { ... }` statement in **Odd.js**, fill in the value for the `isOdd` binding created in step 4. Note that this now "fills in" the value for the alias to this binding noted in step 8.

If the exported bindings were copied between **Even.js** and **Odd.js** rather than aliased, the body of `isEven` would have received a copy of the uninitialized value for `isOdd`.

[proposal-process-document]: https://tc39.github.io/process-document/
