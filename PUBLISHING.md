# Publishing the annual PDF

First, make sure you've provided appropriate front matter. `title`, `shortname`, `version`, and `date` are **mandatory**. If generating a final annual edition, date should reflect the date of the Ecma GA which will ratify the Standard. For example:

```
title: ECMAScript® 2024 Language Specification
shortname: ECMA-262
version: 15th Edition
date: 2024-06-25
```

Use the package script `build-for-pdf`. Importantly, you want to make sure your image directory files wind up in the same output directory as your markup. Your `ecmarkup` command should include the options `--assets external`, `--assets-dir out`, and `--printable`.

Then, run `prince` to generate your PDF.

```shell
prince --script ./node_modules/ecmarkup/js/print.js out/index.html -o path/to/output.pdf
```

Spend 5-10 minutes double-checking the PDF for egregious layout issues. That means quickly skimming all 800+ pages looking for whitespace or content split in a confusing manner. Tinker with print-only styles only as needed. Compare cover & table of contents to previous years.
