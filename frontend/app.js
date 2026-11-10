// NHỚ DÁN LẠI ĐỊA CHỈ HỢP ĐỒNG CỦA BẠN VÀO ĐÂY:
const contractAddress = "DÁN_ĐỊA_CHỈ_CONTRACT_VÀO_ĐÂY";

const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "member",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalAttendance",
        type: "uint256",
      },
    ],
    name: "CheckedIn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "member",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "FundDeposited",
    type: "event",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "attendanceCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "checkIn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "depositFund",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "fundContributions",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

let provider;
let signer;
let clubContract;

const connectBtn = document.getElementById("connectBtn");
const walletAddressSpan = document.getElementById("walletAddress");
const userRoleSpan = document.getElementById("userRole");
const mainContent = document.getElementById("mainContent");
const adminSection = document.getElementById("adminSection");

// Kết nối ví và Phân quyền
connectBtn.onclick = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();

      const address = await signer.getAddress();
      walletAddressSpan.innerText = address;
      walletAddressSpan.style.color = "green";

      clubContract = new ethers.Contract(contractAddress, contractABI, signer);

      // XỬ LÝ PHÂN QUYỀN
      const adminAddress = await clubContract.admin(); // Lấy địa chỉ Admin từ Smart Contract

      if (address.toLowerCase() === adminAddress.toLowerCase()) {
        // Nếu ví đang kết nối trùng với ví Admin
        userRoleSpan.innerText = "Ban chủ nhiệm (Admin)";
        userRoleSpan.style.color = "red";
        adminSection.style.display = "block"; // Hiện khu vực Admin
      } else {
        // Nếu là ví thành viên bình thường
        userRoleSpan.innerText = "Thành viên CLB";
        userRoleSpan.style.color = "blue";
        adminSection.style.display = "none"; // Ẩn khu vực Admin
      }

      mainContent.style.display = "block"; // Hiện các tính năng
      alert("Kết nối ví thành công!");
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối ví!");
    }
  } else {
    alert("Vui lòng cài đặt tiện ích MetaMask trên trình duyệt!");
  }
};

// Điểm danh
document.getElementById("checkInBtn").onclick = async () => {
  if (!clubContract) return alert("Vui lòng kết nối ví trước!");
  try {
    const tx = await clubContract.checkIn();
    await tx.wait();
    alert("Điểm danh thành công!");
  } catch (error) {
    console.error(error);
    alert("Lỗi điểm danh!");
  }
};

// Đóng quỹ
document.getElementById("depositBtn").onclick = async () => {
  if (!clubContract) return alert("Vui lòng kết nối ví trước!");
  const amount = document.getElementById("fundAmount").value;
  if (!amount || amount <= 0) return alert("Nhập số tiền hợp lệ!");
  try {
    const tx = await clubContract.depositFund({
      value: ethers.utils.parseEther(amount),
    });
    await tx.wait();
    alert("Đóng quỹ thành công!");
  } catch (error) {
    console.error(error);
    alert("Lỗi đóng quỹ!");
  }
};

// Rút quỹ (Chỉ Admin)
document.getElementById("withdrawBtn").onclick = async () => {
  if (!clubContract) return alert("Vui lòng kết nối ví trước!");
  const amount = document.getElementById("withdrawAmount").value;
  if (!amount || amount <= 0) return alert("Nhập số tiền hợp lệ!");
  try {
    const tx = await clubContract.withdraw(ethers.utils.parseEther(amount));
    await tx.wait();
    alert("Rút quỹ thành công!");
  } catch (error) {
    console.error(error);
    alert("Bạn không có quyền rút quỹ hoặc số dư không đủ!");
  }
};
