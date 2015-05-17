# Array.prototype.last
A proposal for an ECMAScript native property

Code
---

    //everything in 5 lines
    Object.defineProperty(Array.prototype, 'last', {
        configurable: true,
        get         : function () {
            return this[this.length - 1];
        }
    });

    //example
    var a = [
        "asfd", "qwer", "zxcv", "last Item"
    ];
    a.last; //returns "last Item"

Why we need it
---

The most commons means to dynamically populate an array is using the `push`
method. The push method takes an argument and creates an index at the end of the
array to contain the argument's value or reference. This means the most recently
touched data point in a dynamically populated array is typically the last index.
It is an extremely common use case to need access to array's final index without
care for what that index is or what it contains.

Why it needs to be a standard
---

The above code perfectly defines a solution to the problem, except for
performance. Without some optimization the above code will always be slower than
referencing the last array index directly relative to an array's length property
minus 1.  Example:

    myArray[myArray.length - 1]; //fastest way to currently get the final index

The proposed `last` property is slower, because it requires access to a global
protoype, which is the absolute last stop in the scope chain and performs the
exact same task as the direct and fast approach. Here is a
[JSPerf experiment](http://jsperf.com/array-prototype-last/2). It could be faster,
though. Much faster.

If this proposed property were a supported ECMAScript feature simple
implementation details could make this proposal immediately fast. If, for
instance, arrays contained a hidden property that always stored a reference to
the contents of the final index then this value could be accessed directly
without searching the array, a reference from an index, or referencing it's
length.

Changes
---

1. Converted method to property, https://github.com/prettydiff/Array.prototype.last/issues/1

Intellectual Property Status
---

This document wishes to accept and conform to all limitations and rights
expressed in the
[TC39 RF Patent Policy](http://www.ecma-international.org/memento/TC39%20policy/Ecma%20Experimental%20TC39%20Royalty-Free%20Patent%20Policy.pdf)
and
[TC39 Software Copyright Policy](http://www.ecma-international.org/memento/TC39%20experimental%20policy.htm).
I, Austin Cheney, have registered as a TC39 contributor.
