pragma solidity 0.6.4;

import "../PCToken.sol";


contract TestPCToken is PCToken {
  constructor(string memory _name, string memory _symbol) public {
    PCStorage.load().name = _name;
    PCStorage.load().symbol = _symbol;
  }

  function mint(address _to, uint256 _amount) external {
    _mint(_amount);
    _push(_to, _amount);
  }

  function burn(address _from, uint256 _amount) external {
    _pull(_from, _amount);
    _burn(_amount);
  }
}
