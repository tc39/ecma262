# Call constructor proposal

**Stage 1 Proposal**

Champions:
  - Yehuda Katz
  - Allen Wirfs-Brok

## Motivation

### History

ES5 constructors had a dual-purpose: they got invoked both when the constructor was `new`ed (`[[Construct]]`) and when it was called (`[[Call]]`).

This made it possible to use a single constructor for both purposes, but required constructor writers to defend against consumers accidentally `[[Call]]`ing the constructor.

ES6 classes do not support `[[Call]]`ing the constructor at all, which means that classes do not need to defend themselves against being inadvertantly `[[Call]]`ed.

In ES6, if you want to implement a constructor that can be both `[[Call]]`ed and `[[Construct]]`ed, you can write the constructor as an ES5 function, and use `new.target` to differentiate between the two cases.

### Motivating Example

The "callable constructor" pattern is very common in JavaScript itself, so I will use `Date` to illustrate how you can use an ES5 function to implement a reliable callable constructor in ES6.

```js
// these functions are defined in the appendix
import { initializeDate, ToDateString } from './date-implementation';

export function Date(...args) {
  if (new.target) {
    // [[Construct]] branch
    initializeDate(this, ...args);
  } else {
    // [[Call]] branch
    return ToDateString(clockGetTime());
  }
}
```

This works fine, but it has two problems:

1. It requires the use of ES5 function as constructors. In an ideal world, new classes would be written using class syntax.
2. It uses a meta-property, `new.target` to disambiguate the two paths, but its meaning is not apparent to those not familiar with the meta-property.

This proposal proposes new syntax that allows you to express "callable constructor" in class syntax.

Here's an implementation of the same `Date` class using the new proposed syntax:

```js
import { initializeDate, ToDateString } from './date-implementation';

class Date {
  constructor(...args) {
    initializeDate(super(), ...args);
  }
  
  call constructor() {
    return ToDateString(clockGetTime());
  }
}
```

## Specification

The following changes and additions are relative the [ECMAScript 2015 Specification](http://ecma-international.org/ecma-262/6.0/)

### [9.2](http://ecma-international.org/ecma-262/6.0/#sec-ecmascript-function-objects) [Table 27](http://ecma-international.org/ecma-262/6.0/#table-27)

The following entry is added to Table 27

| Internal Slot | Type | Description |
| ------------------- | ------- | ---------------------------------------------------------------------------- |
| [[ConstructorCall]] | Object or empty | The function object that is evaluated when a class constructor is invoked using [[Call]]. Only used when [[FunctionKind]] is `"classConstructor"`. |

### [9.2.1 [[Call]]](http://ecma-international.org/ecma-262/6.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist)

Step 2 is replaced with:

<pre>
   2. If <i>F's</i> [[FunctionKind]] internal slot is <code>"classConstructor"</code>, then
      a.  If  <i>F's</i> [[ConstructorCall]] internal slot is empty, throw a <b>TypeError</b> exception.
      b.  Let <i>callF</i> be the value of <i>F's</i> [[ConstructorCall]] internal slot.
   2.1 Else, let <i>callF</i> be <i>F</i>.
</pre>

Step 7 is replaced with:

<pre>
  7.  Let <i>result</i> be OrdinaryCallEvaluateBody(<i>callF</i>, <i>argumentsList</i>).
</pre>

Update the step reference in the NOTE.

### [9.2.9 MakeClassConstructor](http://ecma-international.org/ecma-262/6.0/#sec-makeclassconstructor)
Between the existing steps 3 and 4 insert the following steps:

<pre>
   3.1 Set <i>F's</i> [[CallConstructor]] internal slot to empty.
</pre>


### [14.5 Class Definition Syntax](http://ecma-international.org/ecma-262/6.0/#sec-class-definitions) 

The definition for the production *ClassElement*<sub>[Yield]</sub> is replaced with:

<pre>
<i>ClassElement</i><sub>[Yield]</sub> : 
    <i>MethodElement</i><sub>[?Yield]</sub>
    <b><code>static</code></b> <i>MethodElement</i><sub>[?Yield]</sub>
    <i>CallConstructor</i>
    <b><code>;</code></b>
    
<i>CallConstructor</i> :
    <b><code>call constructor (</code></b> <i>StrictFormalParameters</i> <b><code>) {</code></b> <i>FunctionBody</i><b><code>}</code></b>
</pre>

### [14.5.1 Early Errors](http://ecma-international.org/ecma-262/6.0/#sec-class-definitions-static-semantics-early-errors)

Add the rules:


<i>ClassElementList</i> : <i>ClassElementList</i> <i>ClassElement</i>

 * It is a Syntax Error if <i>ClassElement</i> is <i>CallConstructor</i> and <i>ClassElementList</i> Contains <i>CallConstructor</i>.

<i>CallConstructor</i> : <b><code>call constructor (</code></b> <i>StrictFormalParameters</i> <b><code>) {</code></b> <i>FunctionBody</i><b><code>}</code></b>

 * It is a Syntax Error if any element of the BoundNames of <i>StrictFormalParameters</i> also occurs in the LexicallyDeclaredNames of  <i>FunctionBody</i>.
 * It is a Syntax Error if <i>StrictFormalParameters</i> Contains <i>SuperCall</i>.
 * It is a Syntax Error if <i>FunctionBody</i> Contains <i>SuperCall</i>.


### Add 14.5.x StaticSemantics: CallConstructorDefinition

<pre>
<i>ClassElementList</i> : <i>ClassElement</i>
   1.  If <i>ClassElement</i> is not <i>CallConstructor</i> , return empty.
   2.  Return <i>ClassElement</i>.

<i>ClassElementList</i> : <i>ClassElementList</i> <i>ClassElement</i>

   1.  If <i>ClassElement</i> is  <i>CallConstructor</i> , return <i>ClassElement</i>.
   2.  Return CallConstructorDefinition of <i>ClassElementList</i>.
</pre>

### [14.5.5 Static Semantics: ComputedPropertyContains](http://ecma-international.org/ecma-262/6.0/#sec-class-definitions-static-semantics-computedpropertycontains)

Add the rule:

<pre>
<i>ClassElement</i> : <i>CallConstructor</i>

   1.  Return <b>false</b>.
</pre>

### [14.5.9 Static Semantics: IsStatic](http://ecma-international.org/ecma-262/6.0/#sec-static-semantics-isstatic)

Add the rule:

<pre>
<i>ClassElement</i> : <i>CallConstructor</i>

   1.  Return <b>false</b>.
</pre>
### [14.5.10 Static Semantics: NonConstructorMethodDefinition](http://ecma-international.org/ecma-262/6.0/#sec-static-semantics-nonconstructormethoddefinitions)

In the algorithm for the rule <i>ClassElementList</i> : <i>ClassElement</i> add the following new step between the existing steps 1 and 2:
<pre>
   1.1  If <i>ClassElement</i> is the production <i>ClassElement</i> <b>:</b> <i>CallConstructor</i> , return a new empty List.
</pre>

In the algorithm for the rule <i>ClassElementList</i> : <i>ClassElementList ClassElement</i> add the following new step between the existing steps 2 and 3:
<pre>
   2.1  If <i>ClassElement</i> is the production <i>ClassElement</i> <b>:</b> <i>CallConstructor</i> , return <i>list</i>.
</pre>

### [14.5.12 Static Semantics: PropName](http://ecma-international.org/ecma-262/6.0/#sec-class-definitions-static-semantics-propname)

Add the rule:

<pre>
<i>ClassElement</i> : <i>CallConstructor</i>

   1.  Return empty.
</pre>
### [14.5.14 Static Semantics: ClassDefinitionEvaluation](http://ecma-international.org/ecma-262/6.0/#sec-runtime-semantics-classdefinitionevaluation)
Replace the existing steps 8 and 9 with:

<pre>
   8.  If <i>ClassBody</i><sub>opt</sub> is not present, then
       a.  Let <i>constructor</i> be empty.
       b.  Let <i>callConstructor</i> be empty.
   9. Else,
       a.  Let <i>constructor</i> be ConstructorMethod of <i>ClassBody</i>.
       b.  Let <i>callConstructor</i> be  CallConstructorDefinition of <i>ClassBody</i>.
</pre>
Between the existing steps 18 and 19 insert the following steps:

<pre>
   18.1 If <i>callConstructor</i> is not empty, then
        a.  Let <i>callF</i> be FunctionCreate(<code>Normal</code>, <i>StrictFormalParameters</i>, <i>FunctionBody</i>, <i>classScope</i>, <b>true</b>, <i>functionPrototype</i>).
        b.  Set <i>F's</i> [[CallConstructor]] internal slot to <i>callF</i>.
</pre>

The following informative NOTE is added:

NOTE  The function object created as the value of <i>callF</i> is not observable to ECMAScript code.  MakeMethod is not applied to that function object, because the <i>F's</i>  [[HomeObject]] binding is used when invoking the [[CallConstructor]].

### Remarks 
The presence of a `call constructor` in a class body installs the call constructor function in the `[[CallConstructor]]` slot of the constructed class. The [[Call]] internal method of a class constructor invokes the [[CallConstructor]] function. 

The function object value of [[CallConstructor]] is not intended to be ovservable by ECMAScript code.  If any features are added to ECMAScript that exposes the "current function" that such features should expose the constructor object and not the [[CallConstructor]] object.

The presence of a `call constructor` in a superclass does not affect subclasses. This means that subclasses still have a throwing `[[Call]]`, unless they explicitly define their own `call constructor` (subclasses do not inherit calling behavior by default).

As in methods, `super()` in a `call constructor` is a static error, future-proofing us for a potential context-sensitive `super()` proposal.

## Appendix: Date Utilities

```js
import { clockGetTime } from "system/time";
import Type, { OBJECT, STRING } from "language/type";

// the spec makes these things implementation-defined
import { parseDate } from "host";

// see the next appendix
import { InternalSlots } from "self-hosted";

// define the private slot for Date, which contains a single field for the value in milliseconds
export class DateValue {
  constructor(timeValue: number) {
    this.timeValue = timeValue;
  }
}

const PRIVATE_DATE_FIELDS = new InternalSlots(DateValue);

export function privateDateState(date) {
  return PRIVATE_DATE_FIELDS.get(date);
}

export function initializeDate(date, ...args) {
  switch (args.length) {
    case 0:
      return initializeDateZeroArgs(date, clockGetTime());
    case 1:
      return initializeDateOneArg(date, args[0]);
    default:
      return initializeDateManyArgs(date, args);
  }
}

function initializeDateZeroArgs(date) {
  PRIVATE_DATE_FIELDS.initialize(date, clockGetTime());
}

function initializeDateOneArg(date, value) {
  let timeValue = do {
    if (Type(value) === OBJECT && DATE_SLOTS.has(value)) {
      DATE_SLOTS.get(value).timeValue;
    } else {
      let v = ToPrimitive(value);
      Type(v) === STRING ? parseDate(v) : ToNumber(v);
    }
  }

  DATE_SLOT.initialize(date, TimeClip(timeValue));
}

function initializeDateManyArgs(date, args) {
  // TODO
}

// re-export implementation-defined ToDateString
export { ToDateString } from "host";
```

## Appendix: Self Hosting Utilities

```js
class InternalSlots {
  constructor(SlotClass) {
    this._weakMap = new WeakMap();
    this._SlotClass = SlotClass;
  }
  
  initialize(obj, ...args) {
    let { _weakMap, _SlotClass } = this;
    _weakMap.set(obj, new _SlotClass(...args));
  }
  
  has(obj) {
    return this._weakMap.has(obj);
  }
  
  get(obj) {
    return this._weakMap.get(obj);
  }
}
```
