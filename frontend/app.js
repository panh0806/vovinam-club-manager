// BẠN CẦN COPY CONTRACT ADDRESS TỪ REMIX VÀ DÁN ĐÈ LÊN DÒNG CHỮ BÊN DƯỚI:
const contractAddress = "DÁN_ĐỊA_CHỈ_CONTRACT_VÀO_ĐÂY";

// ABI đã được tích hợp sẵn 100%
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

// Hàm 1: Nút kết nối ví MetaMask
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
      alert("Kết nối ví thành công!");
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối ví!");
    }
  } else {
    alert("Vui lòng cài đặt tiện ích MetaMask trên trình duyệt!");
  }
};

// Hàm 2: Nút Điểm danh
document.getElementById("checkInBtn").onclick = async () => {
  if (!clubContract) return alert("Vui lòng kết nối ví trước!");
  try {
    const tx = await clubContract.checkIn();
    await tx.wait(); // Chờ mạng lưới xác nhận giao dịch
    alert("Điểm danh thành công!");
  } catch (error) {
    console.error(error);
    alert("Có lỗi xảy ra khi điểm danh, hãy kiểm tra console!");
  }
};

// Hàm 3: Nút Đóng quỹ
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
    alert("Giao dịch bị từ chối hoặc có lỗi xảy ra!");
  }
};
