pragma solidity ^0.5.0;

import "contracts/stub/Fin4TokenStub.sol";
import "contracts/Fin4Messaging.sol";
import "contracts/util/utils.sol";

contract Fin4BaseProofType is utils {

  string public name;
  string public description;
  bool public isAutoInitiable = false; // shortcuts the user clicking on "Initiate proof", instead that's done automatically
  address public Fin4MessagingAddress;

  mapping (address => address) public fin4TokenToItsCreator; // at the same time a register of Fin4Tokens using this proof type

  constructor(address Fin4MessagingAddr) public {
    Fin4MessagingAddress = Fin4MessagingAddr;
  }

  function getName() public view returns(string memory) {
    return name;
  }

  function getDescription() public view returns(string memory) {
    return description;
  }

  // includes the token-specific parameters if overriden
  function getParameterizedDescription(address token) public view returns(string memory) {
    return getDescription();
  }

  function getInfo() public view returns(string memory, string memory, string memory) {
    return (name, description, getParameterForTokenCreatorToSetEncoded());
  }

  // This method gets overriden by the proof types and encode the parameter names (types are only uint for now TODO)
  // to be filled by the token creator. He gets prompted to set them via a popup in the front end when adding
  // a proof type, see the first <Modal> in ContractForm.render()
  function getParameterForTokenCreatorToSetEncoded() public pure returns(string memory) {
    return "";
  }

  // Helper method for all proof types to go through the same method when sending their approvals
  // to the respective claim on a token
  function _sendApproval(address proofTypeAddress, address tokenAddrToReceiveProof, uint claimId) internal {
    // TODO ensure it can only be called from within this SC?
    Fin4TokenStub(tokenAddrToReceiveProof).receiveProofApproval(proofTypeAddress, claimId);
  }

  function _sendRejection(address proofTypeAddress, address tokenAddrToReceiveProof, uint claimId) internal {
    Fin4TokenStub(tokenAddrToReceiveProof).receiveProofRejection(proofTypeAddress, claimId);
  }

  function registerTokenCreator(address tokenCreator) public {
    fin4TokenToItsCreator[msg.sender] = tokenCreator;
  }

  // Used by proof types that require the token creator to approve something
  function getCreatorOfToken(address tokenAddress) public view returns(address) {
    return fin4TokenToItsCreator[tokenAddress];
  }

}
