// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VovinamClub {
    address public admin; // Thư ký hoặc Ban chủ nhiệm
    mapping(address => uint256) public attendanceCount;
    mapping(address => uint256) public fundContributions;

    event CheckedIn(address member, uint256 totalAttendance);
    event FundDeposited(address member, uint256 amount);

    constructor() {
        admin = msg.sender;
    }

    // Hàm điểm danh buổi tập
    function checkIn() public {
        attendanceCount[msg.sender] += 1;
        emit CheckedIn(msg.sender, attendanceCount[msg.sender]);
    }

    // Hàm nộp quỹ CLB
    function depositFund() public payable {
        require(msg.value > 0, "So tien phai lon hon 0");
        fundContributions[msg.sender] += msg.value;
        emit FundDeposited(msg.sender, msg.value);
    }

    // Quản trị viên rút quỹ để tổ chức sự kiện
    function withdraw(uint256 amount) public {
        require(msg.sender == admin, "Chi Ban chu nhiem moi duoc rut quy");
        require(address(this).balance >= amount, "Quy khong du");
        
        // Dùng call thay cho transfer để tối ưu và tránh lỗi hết Gas
        (bool success, ) = admin.call{value: amount}("");
        require(success, "Rut tien that bai");
    }
}