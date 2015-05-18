# Array.prototype.lastIndex
A proposal for an ECMAScript native property

Code
---

    //sample code
    Object.defineProperty(Array.prototype, 'lastIndex', {
        configurable: true,
        get         : function () {
            if (this === null || typeof this.length !== "number") {
                //It must verify that the reference is still an array.
                throw new TypeError;
            }
            if (this.length < 0 || this.length > 2147483647) {
                //It must check for an inclusive range of 0 to 2^31.
                //2^31 is the 2gb numeric threshold.
                throw new RangeError;
            }
            if (this.length === 0) {
                //Protects against the case of assigning to a negative index.
                //arr[arr.length - 1] = "a" would assign "a" to arr[-1] if
                //arr.length is 0.
                return undefined;
            }
            return this[this.length - 1];
        },
        set         : function (value) {
            if (this === null || typeof this.length !== "number") {
                //It must verify that the reference is still an array.
                throw new TypeError;
            }
            if (this.length < 1 || this.length > 2147483647) {
                //It must check for an inclusive range of 0 to 2^31.
                //2^31 is the 2gb numeric threshold.
                throw new RangeError;
            }
            //allow assignment via lastIndex property
            this[this.length = value];
        }
    });

    //example
    var a = [
        "asfd", "qwer", "zxcv", "last Item"
    ];
    a.lastIndex; //returns "last Item"

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

The proposed `lastIndex` property is slower, because it requires access to a
global protoype, which is the absolute last stop in the scope chain and performs
the exact same task as the direct and fast approach. Here is a
[JSPerf experiment](http://jsperf.com/array-prototype-last/2). It could be faster,
though. Much faster.

If this proposed property were a supported ECMAScript feature simple
implementation details could make this proposal immediately fast. If, for
instance, arrays contained a hidden property that always stored a reference to
the contents of the final index then this value could be accessed directly
without searching the array, a reference from an index, or referencing it's
length.

Error handling
---

If the property is mutated at call time so that it continues to receive from the
global Array prototype but is no longer an actual array a TypeError must be
thrown.

    throw new TypeError;

If the array's final index is less than 0 or greater than 2147483647 a
RangeError must be thrown.

    throw new RangeError;

If the array is empty, such that the length property returns 0, or if the final
index is either undefined or unretrievable the `lastIndex` property must return
`undefined`.

    return undefined;

Changes
---

1. Converted method to property, https://github.com/prettydiff/Array.prototype.last/issues/1
2. Added error handling, https://github.com/tc39/ecma262/pull/36#issuecomment-102920443
3. Added a setter to the example code to align to be behavior of the .length property, https://github.com/prettydiff/Array.prototype.last/issues/1#issuecomment-103143297
4. Clarified the code comments around the error handling, https://github.com/tc39/ecma262/pull/36#discussion_r30532708
5. Changed the proposed name from `last` to `lastIndex` to avoid name collisions, https://github.com/tc39/ecma262/pull/36#issuecomment-103179082

Intellectual Property Status
---

This document wishes to accept and conform to all limitations and rights
expressed in the
[TC39 RF Patent Policy](http://www.ecma-international.org/memento/TC39%20policy/Ecma%20Experimental%20TC39%20Royalty-Free%20Patent%20Policy.pdf)
and
[TC39 Software Copyright Policy](http://www.ecma-international.org/memento/TC39%20experimental%20policy.htm).
I, Austin Cheney, have registered as a TC39 contributor.
