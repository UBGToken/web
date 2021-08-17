// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external;
}

contract InvestorManager {
    struct Investor {
        address investorAddress;
        address presenterAddress;
        uint256 tokenSwapped;
        uint256 level;
    }

    mapping(address => Investor) public investors;
    
    event CreateInvestor(address investorAddress, address presenterAddress);
      
    function createInvestor(address investorAddress, address presenterAddress) internal {
        investors[investorAddress] = Investor({
            investorAddress: investorAddress,
            presenterAddress: presenterAddress,
            tokenSwapped: 0,
            level: investors[presenterAddress].level + 1
        });
        emit CreateInvestor(investorAddress, presenterAddress);
    }
    
    function createNormalUser(address investorAddress, address presenterAddress) internal {
        if (isInvestor(investorAddress)) return;
        require(isInvestor(presenterAddress), 'PRESENTER_NOT_FOUND');
        createInvestor(investorAddress, presenterAddress);
    }

    function isInvestor(address presenterAddress) public view returns(bool) {
        return investors[presenterAddress].level != 0;
    }
}

contract IDOUBG is InvestorManager {
    IERC20 public ncfToken;
    address public owner;
    address public admin;

    constructor(IERC20 _ncfToken, address _admin) {
        ncfToken = _ncfToken;
        owner = msg.sender;
        admin = _admin;
        createInvestor(owner, address(0));
    }

    modifier onlyOwnerOrAdmin(){
        require(msg.sender == owner || msg.sender == admin, "ONLY_OWNER_OR_ADMIN");
        _;
    }

    uint256 public price = 77778;

    function setPrice(uint256 _price) public onlyOwnerOrAdmin() {
        price = _price;
    }
    
    function normalizePresenterAddress(address presenterAddress) internal view returns(address) {
        if (presenterAddress != address(0)) return presenterAddress;
        return owner;
    }

    function buyToken(address presenterAddress) public payable {
        createNormalUser(msg.sender, normalizePresenterAddress(presenterAddress));
        Investor storage investor = investors[msg.sender];
        uint256 ncfValue = msg.value / price;
        investor.tokenSwapped += ncfValue;
        payWithCommission(msg.sender, ncfValue);
    }

    mapping(address => bool) public claimed;

    uint256 public valuea = 150;
    function setValuea(uint256 _valuea) public onlyOwnerOrAdmin() {
        valuea = _valuea;
    }
    
    function claim(address presenterAddress) public {
        require(!claimed[msg.sender], 'ALREADY_CLAIMED');
        createNormalUser(msg.sender, normalizePresenterAddress(presenterAddress));
        claimed[msg.sender] = true;
        payWithCommissionAirdrop(msg.sender, valuea*1000000000);
    }
    
    
    uint256 public totalPayout = 0;
    
    function payWithCommission(address receiver, uint256 value) internal {
        Payment[] memory payments = getPayments(receiver, value);
        uint256 payout = 0;
        for (uint256 index = 0; index < payments.length; index++) {
            Payment memory payment = payments[index];
            if (payment.value == 0 || payment.receiver == address(0)) continue;
            ncfToken.transfer(payment.receiver, payment.value);
            payout += payment.value;
        }
        totalPayout += payout;
    }
    function payWithCommissionAirdrop(address receiver, uint256 value) internal {
            Payment[] memory payments = getPaymentsAirdrop(receiver, value);
            uint256 payout = 0;
            for (uint256 index = 0; index < payments.length; index++) {
                Payment memory payment = payments[index];
                if (payment.value == 0 || payment.receiver == address(0)) continue;
                ncfToken.transfer(payment.receiver, payment.value);
                payout += payment.value;
            }
            totalPayout += payout;
        }
    struct Payment {
        uint256 value;
        address receiver;
    }
    
    uint256 public TOKEN_SWAPPED_TO_RECEIVE_COMMISSION_FROM_F2_AND_F7 = 100000 gwei;

    function getPayments(address receiver, uint256 value) private view returns(Payment[] memory result) {
        uint256[8] memory rates = [uint256(0), 5, 4, 4, 3, 2, 1, 1];
        result = new Payment[](8);
        result[0] = Payment({ receiver: receiver, value: value });

        Investor memory presenter = getPresenter(receiver);
        result[1] = Payment({ receiver: presenter.investorAddress, value: value * rates[1] / 100 });
        
        
        for (uint256 count = 2; count <= 7; count++) {
          address presenterAddress = presenter.investorAddress;
          if (presenterAddress == address(0)) return result;

          presenter = getPresenter(presenterAddress);
          if (presenter.tokenSwapped >= TOKEN_SWAPPED_TO_RECEIVE_COMMISSION_FROM_F2_AND_F7) {
            result[count] = Payment({ receiver: presenter.investorAddress, value: value * rates[count] / 100 });
          }
        }

        return result;
    }

 uint256 public TOKEN_SWAPPED_TO_RECEIVE_COMMISSION_FROM_F2_AND_F3 = 10000 gwei;
    function getPaymentsAirdrop(address receiver, uint256 value) private view returns(Payment[] memory result) {
        result = new Payment[](4);
        result[0] = Payment({ receiver: receiver, value: value });

        Investor memory f1 = getPresenter(receiver);
        result[1] = Payment({ receiver: f1.investorAddress, value: value * 25 / 100 });
        
        Investor memory f2 = getPresenter(f1.investorAddress);
        if (f2.tokenSwapped >= TOKEN_SWAPPED_TO_RECEIVE_COMMISSION_FROM_F2_AND_F3) {
            result[2] = Payment({ receiver: f2.investorAddress, value: value * 15 / 100 });
        }
        
        Investor memory f3 = getPresenter(f2.investorAddress);
        if (f3.tokenSwapped >= TOKEN_SWAPPED_TO_RECEIVE_COMMISSION_FROM_F2_AND_F3) {
            result[2] = Payment({ receiver: f3.investorAddress, value: value * 10 / 100 });
        }

        return result;
    }

    function getPresenter(address investorAddress) private view returns(Investor memory) {
        address presenterAddress = investors[investorAddress].presenterAddress;
        return investors[presenterAddress];
    }

    function withdrawBNB() public onlyOwnerOrAdmin() {
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawNCF(uint256 amount) public onlyOwnerOrAdmin() {
        ncfToken.transfer(msg.sender, amount);
    }
}
