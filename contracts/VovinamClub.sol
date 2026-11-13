// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VovinamClub {
    address public admin;

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

    constructor() {
        admin = msg.sender;
    }

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
    }
}