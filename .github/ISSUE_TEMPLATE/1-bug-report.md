---
name: "\U0001F41B Bug report"
about: Report a bug with the specification

---

<!--
Thank you for reporting a possible bug in ECMA-262.

If this is a bug with a specific implementation of ECMA-262, such as
a JavaScript engine or a browser, please report it on their bug tracker
instead.

eshost is a tool to run the same code on many JS engines
to compare the output.

To set up eshost:

1. $ npm i -g eshost-cli jsvu
2. $ jsvu
3. $ eshost --configure-jsvu

Running eshost:

Use `-x` to evaluate multiple statements:
$ eshost -s -x "const a = 1 + 1; print(a);"

Or `-e` to evaluate a single expression:
$ eshost -s -e "1 + 1"

Paste the output of eshost into the box below.
-->

**Description:** Adding 1 and 1 is two, but it should be...

**eshost Output:**

```
$ eshost -s -e "1 + 1"
#### Chakra, JavaScriptCore, SpiderMonkey, V8, XS
2
```
