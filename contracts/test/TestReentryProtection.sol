<<<<<<< HEAD
pragma solidity 0.6.4;
=======
pragma solidity ^0.6.4;
>>>>>>> 43ea6bf... Reentry protection test

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