### Contributing to ECMAScript
Contributors to ECMAScript and TC39 are expected to follow our [Code of Conduct](https://tc39.es/code-of-conduct/).

If you are not an Ecma member, any non-trivial contributions require signing a legal agreement with Ecma. See the section "Required Legal Agreements" below for details.

#### Issues and Pull Requests
For small changes to ECMAScript, you can contribute by filing an issue or a pull request against the current text of ECMA-262 standard in this repository.

To file an issue, go to the ecma262 [issues page](https://github.com/tc39/ecma262/issues). From there, [examine](https://guides.github.com/features/issues/) in the existing issues to see if an issue already exists to track this issue. If so, add a comment to the existing issue; otherwise, [file a new issue](https://help.github.com/articles/creating-an-issue/) documenting the problem.

To make a pull request (PR), [fork](https://help.github.com/articles/fork-a-repo/) the [ecma262](https://github.com/tc39/ecma262) repository, apply changes to `spec.html`, and upload it to your fork on GitHub, using the web interface to file a pull request. Locally, to see how your change renders in HTML, run `npm install && npm run build` to build `spec.html` into an actual HTML file.

Commits in pull requests should have a first line which starts with a tag, followed by a colon, indicating which type of patch they are:
  * Normative: any changes that affect behavior required to correctly evaluate some ECMAScript source text (such as a script or module)
  * Editorial: any non-normative changes to spec text including typo fixes, changes to the document style, etc.
  * Markup: non-visible changes to markup in the spec
  * Meta: changes to documents about this repository (e.g. readme.md or contributing.md) and other supporting documents or scripts (e.g. package.json, design documents, etc.)

If changes in the upstream master branch cause your PR to have conflicts, you should rebase your branch to master and force-push it to your repo (rather than doing a merge commit).

Issues and PRs in the ecma262 repository are appropriate for minor modifications to the existing specification, for example to make behavior more consistent in an edge case, match what is implemented by the large majority of actual implementations, or to clarify wording. New features use the feature request process described below.

##### Downstream dependencies

If you are changing the signature or behavior of an existing construct, please check if this affects downstream dependencies (searching for the construct's name is sufficient) and if needed file an issue:

* [Web IDL](https://heycam.github.io/webidl/) — [file an issue](https://github.com/heycam/webidl/issues/new)
* [HTML Standard](https://html.spec.whatwg.org/) — [file an issue](https://github.com/whatwg/html/issues/new)

#### New feature proposals
TC39 is open to accepting new feature requests for ECMAScript, referred to as "proposals". Proposals go through a four-stage process which is documented in the [TC39 process document](https://tc39.es/process-document/).

Feature requests for future versions of ECMAScript should not be made in this repository. Instead, they are developed in separate GitHub repositories, which are then merged into the main repository once they have received "Stage 4".

##### Creating a new proposal
To make a feature request, document the problem and a sketch of the solution with others in the community, including TC39 members. One place to do this is the [TC39 Discourse](https://es.discourse.group/); another is the IRC channel #tc39 on Freenode ([instructions](https://freenode.net/kb/answer/chat)).

Your goal will be to convince others that your proposal is a useful addition to the language and recruit TC39 members to help turn your request into a proposal and shepherd it into the language. Once a proposal is introduced to the committee, new features are considered by the committee according to the [TC39 process document](https://tc39.es/process-document/).

You can look at [existing proposals](https://github.com/tc39/proposals/) for examples of how proposals are structured, and some delegates use [this template](https://github.com/tc39/template-for-proposals) when creating repositories for their proposals. Proposals need to have a repository and be moved to the TC39 org on GitHub once they reach Stage 1.

##### TC39 meetings and champions
If you have a new proposal you want to get into the language, you first need a TC39 "champion": a member of the committee who will make the case for the proposal at [in-person TC39 meetings](https://github.com/tc39/agendas#agendas) and help it move through the process. If you are a TC39 member, you can be a champion; otherwise, find a TC39 member to work with for this (e.g., through es-discuss or #tc39). Proposals may have multiple champions (a "champion group").

TC39 meets six times a year, mostly in the United States, to discuss proposals. It is possible for members to join meetings remotely. At meetings, we discuss ways to resolve issues and feature requests. We spend most of the time considering proposals and advancing them through the stage process. Meetings follow an agenda which is developed in the [agendas GitHub repository](https://github.com/tc39/agendas/). After the meeting, notes are published in the [notes GitHub repository](https://github.com/tc39/tc39-notes/). To advance your proposal towards inclusion in the final specification, ensure that it is included on the agenda for an upcoming meeting and propose advancement at that time.

##### Helping with existing proposals
TC39 is currently considering adding several new features to the language. These proposals are linked from [the proposals repository](https://github.com/tc39/proposals). There are many ways to help with existing proposals:
  * File issues in the individual proposal repository to provide constructive criticism and feedback.
  * Make PRs against proposals, e.g., to clarify explanations of the motivation and use cases in README.md, or to fix issues in the proposal's specification text.
  * Talk about what you think of the proposal, including sharing thoughts with the champion.
  * Blog, tweet, give talks, etc about proposals to get more awareness and programmer feedback about them.
  * Write [test262](https://github.com/tc39/test262) tests against the proposal, which are used to verify implementations. (If the proposal is at Stage 3, the tests can land; if earlier, they can be maintained in a PR.)
  * Implement or prototype the proposal in script engines, parsers, transpilers, polyfills, type checkers, etc, possibly behind a flag or in a separate module, and report feedback. Note that proposals before Stage 3 are highly unstable, and all proposals before Stage 4 may be modified or dropped.

To track what's going on with a particular proposal, you can look in issues and commits in the individual proposal repository, read presentation slides which are linked from the TC39 agenda, read the notes which came from the subsequent meetings. You can also reach out via IRC, es-discuss, or direct communication with a proposal champion, if the other resources are unclear.

#### Required legal agreements
People associated with Ecma member organizations have a legal agreement in place with Ecma to ensure that intellectual property rights (IPR) of their contributions are appropriately licensed to be available to all ECMAScript programmers and implementers. For non-members to contribute, you are required to make these rights available by signing a Contributor License Agreement (CLA) for non-trivial contributions.

If you wish to submit a proposal or make a significant PR, and you are not a representative of a TC39 member, please [register as a TC39 RFTG contributor](https://tc39.es/agreements/contributor/).

Ecma TC39 accepts contributions from non-member individuals who have accepted the TC39 copyright and patent policies. Currently all ECMAScript related technical work is done by the TC39 RF TG (Royalty Free Task Group), for which the following IPR policies apply:

  * [Ecma International RF Patent Policy](https://ecma-international.org/memento/Policies/Ecma_Royalty-Free_Patent_Policy_Extension_Option.htm)
  * [Ecma International Software Copyright Policy](https://ecma-international.org/memento/Policies/Ecma_Policy_on_Submission_Inclusion_and_Licensing_of_Software.htm) ([PDF](https://ecma-international.org/memento/Policies/Ecma_Policy_on_Submission_Inclusion_and_Licensing_of_Software.pdf))
