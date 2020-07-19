pragma solidity 0.6.4;

import "../ReentryProtection.sol";

contract TestReentryProtection is ReentryProtection {
  // This should fail
  function test() external noReentry {
    reenter();
  }

  function reenter() public noReentry {
    // Do nothing
  }
}
