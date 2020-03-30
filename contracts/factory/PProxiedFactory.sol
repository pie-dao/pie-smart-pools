pragma solidity ^0.6.4;

import "@pie-dao/proxy/contracts/PProxyPausable.sol";

import "../interfaces/IBFactory.sol";
import "../interfaces/IBPool.sol";
import "../interfaces/IERC20.sol";
import "../Ownable.sol";
import "../smart-pools/PCappedSmartPool.sol";

contract PProxiedFactory is Ownable {

    IBFactory public balancerFactory;
    address public smartPoolImplementation;
    mapping(address => bool) public isS

    constructor(address _balancerFactory) public {
        _setOwner(msg.sender);
        balancerFactory = IBFactory(_balancerFactory);
        
        PCappedSmartPool memory implementation = new PCappedSmartPool();
        // function init(address _bPool, string calldata _name, string calldata _symbol, uint256 _initialSupply) external {
        implementation.init(address(0), "IMPL", "IMPL", 1 ether);
        smartPoolImplementation = address(implementation);
    }


    function newProxiedSmartPool(
        string calldata _name, 
        string calldata _symbol,
        uint256 _initialSupply,
        address[] calldata _tokens,
        uint256[] calldata _amounts,
        uint256[] calldata _weights,
        uint256 _cap
    ) external onlyOwner returns(address) {
        // Deploy proxy contract
        PProxyPausable memory proxy = new PProxyPausable();
        
        // Setup proxy
        proxy.setImplementation = smartPoolImplementation;
        proxy.setPauzer(msg.sender);
        proxy.setProxyOwner(msg.sender);

        // Setup balancer pool
        address balancerPoolAddress = balancerFactory.newBPool();
        IBPool memory bPool = IBPool(balancerPoolAddress);

        for(uint256 i = 0; i < _tokens.length; i ++) {
            IERC20 memory token = IERC20(_tokens[i]);
            // Transfer tokens to this contract
            token.transferFrom(msg.sender, address(this), _amounts[i]);
            // Approve the balancer pool
            token.approve(balancerPoolAddress, uint256(-1));
            // Bind tokens
            bPool.bind(_tokens[i], _amounts[i], _weights[i]);=
        }

        bPool.setController(address(proxy));

        PCappedSmartPool memory smartPool = PCappedSmartPool(address(proxy));
        // init(address _bPool, string calldata _name, string calldata _symbol, uint256 _initialSupply)
        smartPool.init(balancerPoolAddress, _name, _symbol, _initialSupply);
        smartPool.setCap(_cap);
        smartPool.setController(msg.sender);
        

    }

}