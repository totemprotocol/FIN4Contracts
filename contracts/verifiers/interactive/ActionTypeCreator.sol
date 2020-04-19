pragma solidity ^0.5.0;

import "contracts/verifiers/interactive/SpecificAddress.sol";

contract TokenCreator is SpecificAddress {

  constructor(address Fin4MessagingAddress)
    SpecificAddress(Fin4MessagingAddress)
    public {}

  // @Override
  function init() public {
    name = "TokenCreator";
    description = "The token creator has to approve.";
  }

  function submitProof_TokenCreator(address tokenAddrToReceiveVerifierDecision, uint claimId) public {
    submitProof_SpecificAddress(tokenAddrToReceiveVerifierDecision, claimId, getCreatorOfToken(tokenAddrToReceiveVerifierDecision));
  }

  // @Override
  function getMessageText() public pure returns(string memory) {
    return "You as the token creator were requested to approve the verifier type TokenCreator on the token ";
  }

}
