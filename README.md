ECMAScript
====


## Current Proposals

Proposals follow [this process document](https://tc39.github.io/process-document/).

Current proposals are in CSV format in [/proposals.csv](proposals.csv). Stage 0 proposals are tracked in [/stage0.csv](stage0.csv).

🚀 means the champion thinks it's ready to advance but has not yet presented to the committee.

### Contributing New Proposals
If you are a TC39 member representative, just submit a pull request for your proposal, probably to the `stage0.csv` document.

Ecma TC39 accepts Strawman Proposals from non-member individuals who have accepted the TC39 copyright and patent policies. Currently all ECMAScript related technical work is done by the TC39 RF TG (Royalty Free Task Group), for which the following IPR Policies apply:

  * [Ecma International RF Patent Policy](http://www.ecma-international.org/memento/Policies/Ecma_Royalty-Free_Patent_Policy_Extension_Option.htm)
  * [Ecma International Software Copyright Policy](http://www.ecma-international.org/memento/Policies/Ecma_Policy_on_Submission_Inclusion_and_Licensing_of_Software.htm) ([PDF](http://www.ecma-international.org/memento/Policies/Ecma_Policy_on_Submission_Inclusion_and_Licensing_of_Software.pdf))

If you wish to submit a proposal and are not a representative of a TC39 member, here are the steps you need to take:

  1. Read the  [TC39 process document](https://tc39.github.io/process-document/).
  2. [Register as a TC39 contributor](http://www.ecma-international.org/memento/register_TC39_Royalty_Free_Task_Group.php) (it is not necessary to submit the contribution as attachment to the form)
  3. Submit a pull request here for your strawman proposal.

## Developing the Specification

After cloning, do `npm install` to set up your environment. You can then do `npm run build` to build the spec or `npm run watch` to set up a continuous build. The results will appear in the `out` directory, which you can use `npm run clean` to delete.
