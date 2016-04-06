ECMAScript
====


## Current Proposals
Proposals follow [this process document](https://tc39.github.io/process-document/).

|🚀| Proposal                                                                                             | Champion      | Stage
|---|------------------------------------------------------------------------------------                 |-------------- | ------|------
| | [SIMD.JS - SIMD APIs](https://docs.google.com/presentation/d/1MY9NHrHmL7ma7C8dyNXvmYNNGgVmmxXk8ZIiQtPlfH4/edit?usp=sharing) +  [polyfill](http://tc39.github.io/ecmascript_simd/)| John McCutchan, Peter Jensen, Dan Gohman, Daniel Ehrenberg |3      |
| | [Async Functions](https://github.com/tc39/ecmascript-asyncawait)                                |Brian Terlson    |3      |
| | [Object.values/Object.entries](https://github.com/tc39/proposal-object-values-entries) | Jordan Harband | 3
| | [String padding](https://github.com/tc39/proposal-string-pad-start-end) | Jordan Harband & Rick Waldron | 3
| | [Trailing commas in function parameter lists and calls](https://jeffmo.github.io/es-trailing-function-commas/) | Jeff Morrison | 3
| | [Object.getOwnPropertyDescriptors](https://github.com/ljharb/proposal-object-getownpropertydescriptors) | Jordan Harband & Andrea Giammarchi | 3
| | [function.sent metaproperty](https://github.com/allenwb/ESideas/blob/master/Generator%20metaproperty.md) |  Allen Wirfs-Brock |2      |
| | [Rest/Spread Properties](https://github.com/sebmarkbage/ecmascript-rest-spread) | Sebastian Markbage | 2
| | [Shared memory and atomics](https://github.com/tc39/ecmascript_sharedmem) | Lars T Hansen | 2
| | [`Function.prototype.toString` revision](https://github.com/tc39/Function-prototype-toString-revision) | Michael Ficarra | 2
| | [ArrayBuffer.transfer](https://gist.github.com/lukewagner/2735af7eea411e18cf20) | Luke Wagneer & Allen Wirfs-Brock | 1
|🚀| [`export * as ns from "mod";` statements](https://github.com/leebyron/ecmascript-export-ns-from)| Lee Byron | 1
|🚀| [`export v from "mod";` statements](https://github.com/leebyron/ecmascript-export-default-from)| Lee Byron | 1
|🚀|[Class and Property Decorators](https://github.com/wycats/javascript-decorators/blob/master/README.md) | Yehuda Katz and Jonathan Turner | 1 |
| | [Observable](https://github.com/zenparsing/es-observable) | Kevin Smith & Jafar Husain | 1
| | [String.prototype.{trimLeft,trimRight}](https://github.com/sebmarkbage/ecmascript-string-left-right-trim) | Sebastian Markbage | 1
| | [Class Property Declarations](https://github.com/jeffmo/es-class-fields-and-static-properties)| Jeff Morrison| 1
| | [String#matchAll](https://github.com/tc39/String.prototype.matchAll) | Jordan Harband | 1
| | [System.global](https://github.com/tc39/proposal-global) | Jordan Harband | 1
| | [Asynchronous Iterators](https://github.com/tc39/proposal-async-iteration) | Kevin Smith | 1
| | [Frozen Realms](https://github.com/FUDCo/frozen-realms) | Mark S. Miller, Chip Morningstar, Caridy Patiño | 1


🚀 means the champion thinks it's ready to advance but has not yet presented to the committee.

See also the [stage 0 proposals](stage0.md).

### Contributing New Proposals

Please see [Contributing to ECMAScript](/CONTRIBUTING.md) for the most up-to-date information on contributing proposals to this standard.

## Developing the Specification

After cloning, do `npm install` to set up your environment. You can then do `npm run build` to build the spec or `npm run watch` to set up a continuous build. The results will appear in the `out` directory, which you can use `npm run clean` to delete.
