# ECMA-262 Bibliography

This package, available on npm as `@tc39/ecma262-biblio`, contains a machine-readable representation of the terms, clauses, grammar, and abstract operations defined in ECMA-262. This will primarily be of use to people working with the specification itself.

If added as a dependency to a project using ecmarkup, you can load it by passing `--load-biblio @tc39/ecma262-biblio`.

It is automatically updated whenever ECMA-262 is. It is inherently unstable: editorial changes to the specification may add, remove, or modify the biblio, which may break your build (for example, if using ecmarkup with `--lint-spec --strict`). As such, **the usual semver guarantees do not hold**. You should pin a precise version of this package.

Major version bumps may be used for breaking changes to the format of the biblio itself. Minor version bumps may be used for non-breaking additions to the biblio format.
