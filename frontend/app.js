window.onload = async function () {
  let contractAddress, contractABI;
  try {
    const configRes = await fetch("config.json");
    const config = await configRes.json();
    contractAddress = config.CONTRACT_ADDRESS;

    const abiRes = await fetch("abi.json");
    contractABI = await abiRes.json();
  } catch (error) {
    alert("Lỗi tải file cấu hình! Hãy chạy bằng Live Server.");
    return;
  }

  let provider,
    signer,
    clubContract,
    currentAddress,
    isAdmin = false;

  function shortenAddress(addr) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }
  function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleString("vi-VN");
  }

  async function loadData() {
    // TẢI & XỬ LÝ KHÓA NÚT ĐIỂM DANH
    const currentSession = await clubContract.currentSessionName();
    const checkInBtn = document.getElementById("checkInBtn");

    if (isAdmin) {
      document.getElementById("currentSessionAdmin").innerText = currentSession;
    } else {
      document.getElementById("currentSessionMember").innerText =
        currentSession;
      if (currentSession === "Chua co lich tap") {
        checkInBtn.disabled = true;
        checkInBtn.innerText = "🔒 Chờ Admin mở điểm danh";
        checkInBtn.style.background = "#6c757d";
        checkInBtn.style.cursor = "not-allowed";
      } else {
        checkInBtn.disabled = false;
        checkInBtn.innerText = "✅ Bấm 1 lần để Điểm danh (+10đ)";
        checkInBtn.style.background = "#198754";
        checkInBtn.style.cursor = "pointer";
      }
    }

    const checkIns = await clubContract.getAllCheckIns();
    document.getElementById("checkInList").innerHTML = "";
    checkIns.forEach((record) => {
      document.getElementById("checkInList").innerHTML +=
        `<li>✅ <span class="user-addr">${shortenAddress(record.user)}</span> <br> 🥋 Buổi tập: <b>${record.note}</b> <br> 🕒 ${formatTime(record.timestamp)}</li>`;
    });

    // TẢI LỊCH SỬ ĐÓNG QUỸ & XỬ LÝ KHÓA NÚT ĐÓNG THEO THÁNG
    const funds = await clubContract.getAllFunds();
    document.getElementById("fundList").innerHTML = "";

    let paidMonths = []; // Lưu các tháng user hiện tại đã đóng

    funds.forEach((record) => {
      document.getElementById("fundList").innerHTML +=
        `<li>💰 <span class="user-addr">${shortenAddress(record.user)}</span> <br> 💵 3000 VNĐ - Quỹ <b>${record.note}</b> <br> 🕒 ${formatTime(record.timestamp)}</li>`;

      if (record.user.toLowerCase() === currentAddress.toLowerCase()) {
        paidMonths.push(record.note);
      }
    });

    // Hàm kiểm tra và khóa nút đóng quỹ
    if (!isAdmin) {
      function checkFundStatus() {
        const selectedMonth = document.getElementById("fundMonth").value;
        const depositBtn = document.getElementById("depositBtn");

        if (paidMonths.includes(selectedMonth)) {
          depositBtn.disabled = true;
          depositBtn.innerText = `✅ Bạn đã đóng quỹ ${selectedMonth}`;
          depositBtn.style.background = "#6c757d";
          depositBtn.style.cursor = "not-allowed";
        } else {
          depositBtn.disabled = false;
          depositBtn.innerText = `💰 Đóng quỹ ${selectedMonth} ngay`;
          depositBtn.style.background = "#fd7e14";
          depositBtn.style.cursor = "pointer";
        }
      }
      document.getElementById("fundMonth").onchange = checkFundStatus;
      checkFundStatus(); // Chạy ngay khi tải xong
    }

    if (isAdmin) {
      const balance = await clubContract.getBalance();
      document.getElementById("clubBalance").innerText =
        ethers.utils.formatEther(balance);
    } else {
      const points = await clubContract.rewardPoints(currentAddress);
      document.getElementById("rewardScore").innerText = points.toString();
    }
  }

  document.getElementById("loginBtn").onclick = async () => {
    if (!window.ethereum) return alert("Vui lòng cài MetaMask!");
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      currentAddress = await signer.getAddress();
      clubContract = new ethers.Contract(contractAddress, contractABI, signer);

      document.getElementById("loginScreen").style.display = "none";
      document.getElementById("mainApp").style.display = "block";
      document.getElementById("walletAddress").innerText = currentAddress;

      const adminAddress = await clubContract.admin();

      if (currentAddress.toLowerCase() === adminAddress.toLowerCase()) {
        isAdmin = true;
        document.getElementById("userRole").innerText = "Admin CLB";
        document.getElementById("userRole").style.background = "#dc3545";
        document.getElementById("adminPage").style.display = "block";
        document.getElementById("memberPage").style.display = "none";
        document.getElementById("rewardContainer").style.display = "none";
      } else {
        isAdmin = false;
        document.getElementById("userRole").innerText = "Thành viên";
        document.getElementById("userRole").style.background = "#0d6efd";
        document.getElementById("memberPage").style.display = "block";
        document.getElementById("adminPage").style.display = "none";
        document.getElementById("rewardContainer").style.display = "block";
      }
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const setSessionBtn = document.getElementById("setSessionBtn");
  if (setSessionBtn) {
    setSessionBtn.onclick = async () => {
      const newSession = document.getElementById("adminSessionInput").value;
      if (!newSession) return alert("Vui lòng nhập tên buổi tập!");
      try {
        const tx = await clubContract.setCurrentSession(newSession);
        await tx.wait();
        alert("✅ Đã cập nhật nội dung buổi tập!");
        document.getElementById("adminSessionInput").value = "";
        loadData();
      } catch (error) {
        alert("Lỗi! Bạn không phải Admin hoặc mạng lỗi.");
      }
    };
  }

  document.getElementById("checkInBtn").onclick = async () => {
    try {
      const tx = await clubContract.checkIn();
      await tx.wait();
      alert("✅ Điểm danh thành công!");
      loadData();
    } catch (error) {
      alert("Lỗi điểm danh! Hãy kiểm tra kết nối mạng.");
    }
  };

  document.getElementById("depositBtn").onclick = async () => {
    const fixedAmount = "0.003";
    const selectedMonth = document.getElementById("fundMonth").value; // Lấy tên tháng đang chọn
    try {
      const tx = await clubContract.depositFund(selectedMonth, {
        value: ethers.utils.parseEther(fixedAmount),
      });
      await tx.wait();
      alert(`💰 Đóng quỹ thành công cho ${selectedMonth}!`);
      loadData();
    } catch (error) {
      alert("Lỗi đóng quỹ! Vui lòng kiểm tra lại số dư ví.");
    }
  };

  document.getElementById("withdrawBtn").onclick = async () => {
    const amount = document.getElementById("withdrawAmount").value;
    if (!amount) return alert("Vui lòng nhập số MON cần rút!");
    try {
      const tx = await clubContract.withdraw(ethers.utils.parseEther(amount));
      await tx.wait();
      alert("✅ Rút quỹ thành công!");
      document.getElementById("withdrawAmount").value = "";
      loadData();
    } catch (error) {
      alert("Lỗi rút quỹ (hoặc quỹ không đủ)!");
    }
  };

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => window.location.reload());
  }
};
