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
    mapping(address => bool) public isPool;
    address[] public pools;

<<<<<<< HEAD
    event SmartPoolCreated(address indexed poolAddress, string name, string symbol);

    function init(address _balancerFactory) public {
        require(smartPoolImplementation == address(0), "Already initialised");
=======
    constructor(address _balancerFactory) public {
>>>>>>> 245b1b6... Feature/informal audit fixes (#12)
        _setOwner(msg.sender);
        balancerFactory = IBFactory(_balancerFactory);
        
        PCappedSmartPool implementation = new PCappedSmartPool();
        // function init(address _bPool, string calldata _name, string calldata _symbol, uint256 _initialSupply) external {
<<<<<<< HEAD
        implementation.init(address(1), "IMPL", "IMPL", 1 ether);
        smartPoolImplementation = address(implementation);
    }

=======
        implementation.init(address(0), "IMPL", "IMPL", 1 ether);
        smartPoolImplementation = address(implementation);
    }


>>>>>>> 245b1b6... Feature/informal audit fixes (#12)
    function newProxiedSmartPool(
        string memory _name, 
        string memory _symbol,
        uint256 _initialSupply,
        address[] memory _tokens,
        uint256[] memory _amounts,
        uint256[] memory _weights,
        uint256 _cap
    ) public onlyOwner returns(address) {
        // Deploy proxy contract
        PProxyPausable proxy = new PProxyPausable();
        
        // Setup proxy
        proxy.setImplementation(smartPoolImplementation);
        proxy.setPauzer(msg.sender);
<<<<<<< HEAD
        proxy.setProxyOwner(msg.sender); 
=======
        proxy.setProxyOwner(msg.sender);
        
>>>>>>> 245b1b6... Feature/informal audit fixes (#12)
        
        // Setup balancer pool
        address balancerPoolAddress = balancerFactory.newBPool();
        IBPool bPool = IBPool(balancerPoolAddress);

        for(uint256 i = 0; i < _tokens.length; i ++) {
            IERC20 token = IERC20(_tokens[i]);
            // Transfer tokens to this contract
            token.transferFrom(msg.sender, address(this), _amounts[i]);
            // Approve the balancer pool
            token.approve(balancerPoolAddress, uint256(-1));
            // Bind tokens
            bPool.bind(_tokens[i], _amounts[i], _weights[i]);
        }
        bPool.setController(address(proxy));
        
<<<<<<< HEAD
=======

>>>>>>> 245b1b6... Feature/informal audit fixes (#12)
        // Setup smart pool
        PCappedSmartPool smartPool = PCappedSmartPool(address(proxy));
    
        smartPool.init(balancerPoolAddress, _name, _symbol, _initialSupply);
        smartPool.setCap(_cap);
        smartPool.setPublicSwapSetter(msg.sender);
<<<<<<< HEAD
        smartPool.setTokenBinder(msg.sender);
=======
>>>>>>> 245b1b6... Feature/informal audit fixes (#12)
        smartPool.setController(msg.sender);
        smartPool.approveTokens();
        
        isPool[address(smartPool)] = true;
        pools.push(address(smartPool));

<<<<<<< HEAD
        emit SmartPoolCreated(address(smartPool), _name, _symbol);

        smartPool.transfer(msg.sender, _initialSupply);

=======
>>>>>>> 245b1b6... Feature/informal audit fixes (#12)
        return address(smartPool);
    }

}