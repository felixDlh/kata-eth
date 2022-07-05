pragma solidity >=0.8.0;

contract Storage {
    // Strings are stored as bytes
    bytes32 public value;
    // Date are stored as seconds since UNIX ep1021195
    uint256 public lastModificationDate;
    address public owner;

    constructor(bytes32 value_) {
        value = value_;
        owner = msg.sender;
        lastModificationDate = block.timestamp;
    }

    function setValue(bytes32 value_) public {
        require(msg.sender == owner, "Only the contract owner can update the stored value");
        value = value_;
        lastModificationDate = block.timestamp;
    }

    function getValue() public view returns(bytes32 value_ ) {
        return value;
    }
}
