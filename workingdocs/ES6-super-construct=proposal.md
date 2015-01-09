This is the proposal presented and discussed at the Jan. 7, 2015 TC39 video conference call. This proposal would be applied to ES6 specification (except as noted).


1.  [[Construct]] takes a new additional argument *originalConstructor* which is the constructor object `new` was actually
applied to. That argument also is also reified as arguments to the `construct` proxy trap and in `Reflect.construct`

2.  Built-in object allocation and initialization are merged into a single constructor function, just like in ES5. Note that allocation take place in a base constructor rather than the original constructor and uses 'originalConstructor' argument to determine the [[Prototype]] of the new instance.  The subclass constructor determines what arguments are passed to the base constructor which may use those arguments in its allocation and initialization logic. 

    * There is no [[CreateAction]] or similar separable allocation step.

3.  ***When a constructor is invoked via ordinary [[Construct]] and the constructor body was not defined using a `class` definition
that has an `extends` clause, then `this` is initialized to a newly allocated ordinary object whose [[Prototype]] is provided
by the original constructor.
    * This is the way that `function` definition based constructors work today and must be maintained for legacy compatibility.  
    * The same `this` initializaton rules are used by both `function` definitions and `class` declarations that don't have `extends` clauses.

4.  When a constructor is invoked via ordinary [[Construct]], `this` is marked as uninitialized if the constructor body was
defined using a `class` definition that has an `extends` clause. 
    * If invoked via [[Call]], 'this' is initialized in the normal manner.

5.  Any explicit reference to an uninitialized `this` throws a ReferenceError Exception 

6.  When `this` is in its uninitialized state, any expression in a constructor of the form  `super(<args>)` accesses the
[[Prototype]] of the active function and invokes  [[Construct]] on it with the current *originalConstructor* value passed
as the *originalConstructor* argument.   Subsequent references to `this` produce the object value that was returned from the
superclass constructor.
    * In other words, a `super` call delegates allocation and initial initialization steps to the super class constructor. 

7.  When `this` is in its initialized state, any expression of the form 'super(<args>)' throws a TypeError exception. 
           Rather than using [[Call]] to invoke the super class constructor.  

8.  *** Within a constructor, `new.target` can be used, as if it was an identifier, to access the *originalConstructor* value.
    * `new.target` can be used to get information about the original constructor (such as its `prototype` property)
that can be used to manually allocate the instance object. It can also be used to discriminate [[Construct]] vs. [[Call]] 
invocations.
    * An explicit return must be used to return such manually allocated objects 

9.  When a function implicitly returns from a [[Construct]] invocation, if its `this` binding is still uninitialized 
a ReferenceError is thrown.  
    * This covers the case where a constructor with an `extends` clause  does not  invokes `super()`.

10.  When a function explicitly returns a non-object from a [[Construct]] invocation and its `this` binding 
is still uninitialized a TypeError is thrown.  

11.  When a function explicitly returns a non-object from a [[Construct]] invocation but the `this` value has been initialized, 
the `this` value is returned as the value of [[Construct]]
    * This is required for ES1-5 compatability

12.  If a `class` definition does not include an explicit constructor definition, it defaults to: `constructor(...args) {super(...args)};` if the `class` has a non-null `extends` clause. Otherwise it defaults to: `constructor() {};`.
    * If you define a constructor body then you inherit both the constructor argument signature and body from your superclass.

** There is agreement that this functionality is necessary. There is not yet consensus as to whether it can be deferred 
until ES7 and on the actual special form syntax used to access the value.

*** For the details covered by this proposal, an `extends null` clause  is considered to be equivalent to an absent `extends` clause.
