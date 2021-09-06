# Introduction
**Hello,**

**I had an idea to allow returns from statements and decided to do a research and found Do Expression proposal very similar and more complex than my idea.**

**My idea is basically to create a new keyword syntax as a shortcut for an executed arrow function. It behaves same as arrow function.**

# Examples:
```ts
const 
 a=1,
 b = do if(a) return 1; else return 0;;
```

# Transpilation:

```ts
const 
 a=1,
 b = (()=> {if(a) return 1; else return 2})();
```

**We can also use alternative names or keywords for this new feature.**
# Examples:
- ->
- => (preceded by an expression and followed by a block or a statement)

```ts
const 
 a=1,
 b = -> if(a) return 1; else return 0;;
```
```ts
const 
 a=1,
 b = => if(a) return 1; else return 0;;
```
Or
```ts
const 
 a=1,
 b = =>{ if(a) return 1; else return 0;};
```
### We might call `=>` syntax a *Immediately Executed Arrow Function*

**We can even pass parameters as an object:**
```ts
const 
 a=1,
 b = {value:a} => if(value) return value; else return 0;
```

## Match Example:
```ts
const a=1,b=2;
const c = 
    {a,b}=> {
        if(a) return a; 
        else if(b) return b; 
        else return 0;
    }
console.log(c)
```
## Pipe and Chaining Example
**Consecutive chains inherit the single parameter of single field object of parent chain, each assigning return value to that single field object property and passing that as parameters to next chain. We can enforce rule for my proposal to only have one object with one field as the parameter, that field can be be assigned as any object of course.**
```ts
const value=1;
const c = {value} 
    => value+1
    => value+1
    => value+2
console.log(c) //5
```
*Alternative Syntax:*
```ts
const c = value
    -> value+1
    -> value+1
    -> value+2
console.log(c) //5
```
**We can of course discuss the syntax, my proposal has 3 suggestions: =>, ->, do. The reason I prefer => is because my method is actually based on anonymous method, just immediately executed, and allowing flexibility.**

Thank you,

