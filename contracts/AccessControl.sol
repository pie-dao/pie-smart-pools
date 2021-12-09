pragma solidity 0.6.4;

import "./Ownable.sol";
import {AccessControlStorage as ACStorage} from "./storage/AccessControlStorage.sol"; 

contract AccessControl is Ownable {
    modifier onlyAllowed() {
        ACStorage.StorageStruct storage s = ACStorage.load();

        if (s.contractAccessControlEnabled) {
            require(tx.origin == msg.sender, "onlyEOA: ONLY_EOA_ALLOWED");
        }

        if (s.blacklistControlEnabled) {
            require(!s.isBlacklisted[msg.sender], "onlyEOA: BLACKLISTED");
        }

        _;
    }

    event Blacklisted(address indexed who, bool blacklist);

    function setBlacklisted(address who, bool blacklist) external onlyOwner {
        ACStorage.StorageStruct storage s = ACStorage.load();
        s.isBlacklisted[who] = blacklist;

        emit Blacklisted(who, blacklist);
    }

    event AccessControlChanged(bool contractAccess, bool blacklist);

    function setAccessControl(bool contractAccess, bool blacklist) external onlyOwner {
        ACStorage.StorageStruct storage s = ACStorage.load();
        s.contractAccessControlEnabled = blacklist;
        s.blacklistControlEnabled = blacklist;

        emit AccessControlChanged(contractAccess, blacklist);
    }
}
