pragma solidity ^0.5.17;

import "contracts/verifiers/interactive/SpecificAddress.sol";

contract TokenCreatorApproval is SpecificAddress {

    constructor() public {}

    // @Override
    function init() public {
        name = "TokenCreatorApproval";
        description = "The token creator has to approve.";
    }

    function submitProof_TokenCreatorApproval(address tokenAddrToReceiveVerifierNotice, uint claimId) public {
        submitProof_SpecificAddress(tokenAddrToReceiveVerifierNotice, claimId, getCreatorOfToken(tokenAddrToReceiveVerifierNotice));
    }

    // @Override
    function getMessageText() public pure returns(string memory) {
        return "You as the token creator were requested to approve the verifier type TokenCreatorApproval on the token ";
    }

}
