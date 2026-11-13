// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VovinamClub {
    address public admin;
<<<<<<< HEAD

    // Cấu trúc dữ liệu lưu lịch sử
    struct CheckInRecord {
        uint256 timestamp;
    }
    struct FundRecord {
        uint256 amount;
        uint256 timestamp;
    }

    // Ánh xạ địa chỉ ví với mảng lịch sử của họ
    mapping(address => CheckInRecord[]) private userCheckIns;
    mapping(address => FundRecord[]) private userFunds;
=======
    string public currentSessionName;

    struct Record {
        address user;
        uint256 amount;
        uint256 timestamp;
        string note;
    }

    Record[] public checkInHistory;
    Record[] public fundHistory;

    mapping(address => uint256) public rewardPoints;
>>>>>>> 279f92e (Luu cac file con sot lai)

    constructor() {
        admin = msg.sender;
    }

<<<<<<< HEAD
    // 1. Chức năng Thành viên
    function checkIn() public {
        userCheckIns[msg.sender].push(CheckInRecord(block.timestamp));
    }

    function depositFund() public payable {
        require(msg.value > 0, "So tien phai lon hon 0");
        userFunds[msg.sender].push(FundRecord(msg.value, block.timestamp));
    }

    // 2. Chức năng xem Lịch sử
    function getCheckInHistory(address user) public view returns (CheckInRecord[] memory) {
        return userCheckIns[user];
    }

    function getFundHistory(address user) public view returns (FundRecord[] memory) {
        return userFunds[user];
    }

    // 3. Chức năng Admin
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw(uint256 amount) public {
        require(msg.sender == admin, "Chi Admin moi duoc rut quy");
        require(address(this).balance >= amount, "Quy khong du");
        (bool success, ) = admin.call{value: amount}("");
        require(success, "Rut tien that bai");
=======
    modifier onlyAdmin() {
        require(msg.sender == admin, "Chi Admin moi duoc thuc hien");
        _;
    }

    // --- ADMIN ---
    function setCurrentSession(string memory _sessionName) public onlyAdmin {
        currentSessionName = _sessionName;
    }

    function withdraw(uint256 amount) public onlyAdmin {
        require(address(this).balance >= amount, "Khong du quy");
        payable(admin).transfer(amount);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // --- MEMBER ---
    function checkIn() public {
        checkInHistory.push(Record(msg.sender, 0, block.timestamp, currentSessionName));
        rewardPoints[msg.sender] += 10;
    }

    function depositFund(string memory monthNote) public payable {
        require(msg.value > 0, "So tien phai lon hon 0");
        fundHistory.push(Record(msg.sender, msg.value, block.timestamp, monthNote));
    }

    // --- DỮ LIỆU FRONTEND ---
    function getAllCheckIns() public view returns (Record[] memory) {
        return checkInHistory;
    }

    function getAllFunds() public view returns (Record[] memory) {
        return fundHistory;
>>>>>>> 279f92e (Luu cac file con sot lai)
    }
}