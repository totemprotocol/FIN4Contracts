pragma solidity ^0.5.0;

import "contracts/verifiers/Fin4BaseVerifierType.sol";

contract Password is Fin4BaseVerifierType {

  constructor(address Fin4MessagingAddress)
    Fin4BaseVerifierType(Fin4MessagingAddress)
    public {
      name = "Password";
      description = "Approval if the user provides the password matching the one the token creator set.";
    }

    function submitProof_Password(address tokenAddrToReceiveVerifierDecision, uint claimId, string memory password) public {
      // via https://ethereum.stackexchange.com/a/30914
      if (keccak256(abi.encodePacked((password))) == keccak256(abi.encodePacked((_getPassword(tokenAddrToReceiveVerifierDecision))))) {
        _sendApproval(address(this), tokenAddrToReceiveVerifierDecision, claimId);
      } else {
        string memory message = string(abi.encodePacked(
              "Your claim on token \'",
              Fin4TokenStub(tokenAddrToReceiveVerifierDecision).name(),
              "\' got rejected from verifier type \'Password\' because the password you",
              " provided does not match the one set by the token creator"));
        Fin4Messaging(Fin4MessagingAddress).addInfoMessage(address(this), msg.sender, message);
        _sendRejection(address(this), tokenAddrToReceiveVerifierDecision, claimId);
      }
    }

    // @Override
    function getParameterForTokenCreatorToSetEncoded() public pure returns(string memory) {
      return "string:password:alphanumeric string";
    }

    mapping (address => string) public tokenToParameter;

    function setParameters(address token, string memory password) public {
      tokenToParameter[token] = password;
    }

    function _getPassword(address token) private view returns(string memory) {
      // TODO this must not be visible to someone using truffle console or similar!
      // Use a salt additionally? Or encrypt it with itself? Only possible with numbers (as done in TCR?) #ConceptualDecision
      return tokenToParameter[token];
    }

}
