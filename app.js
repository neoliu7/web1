const MEMBER_KEY = "infant-members";
const ATTENDANCE_KEY = "infant-attendance";

const memberForm = document.querySelector("#member-form");
const memberBody = document.querySelector("#member-table-body");
const attendanceDate = document.querySelector("#attendance-date");
const attendanceList = document.querySelector("#attendance-list");

const totalCount = document.querySelector("#total-count");
const presentCount = document.querySelector("#present-count");
const absentCount = document.querySelector("#absent-count");

const today = new Date().toISOString().slice(0, 10);
attendanceDate.value = today;

function getMembers() {
  return JSON.parse(localStorage.getItem(MEMBER_KEY) || "[]");
}

function setMembers(members) {
  localStorage.setItem(MEMBER_KEY, JSON.stringify(members));
}

function getAttendance() {
  return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || "{}");
}

function setAttendance(data) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
}

function renderMembers() {
  const members = getMembers();
  memberBody.innerHTML = "";

  members.forEach((member) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="아기 이름">${member.name}</td>
      <td data-label="보호자">${member.guardian}</td>
      <td data-label="생년월일">${member.birth}</td>
      <td data-label="삭제"><button class="delete-btn" data-id="${member.id}">삭제</button></td>
    `;
    memberBody.appendChild(row);
  });
}

function renderAttendance() {
  const members = getMembers();
  const date = attendanceDate.value;
  const attendance = getAttendance();

  attendanceList.innerHTML = "";

  if (members.length === 0) {
    const tpl = document.querySelector("#empty-state");
    attendanceList.appendChild(tpl.content.cloneNode(true));
    updateSummary(0, 0);
    return;
  }

  const dayRecord = attendance[date] || {};

  members.forEach((member) => {
    const isPresent = Boolean(dayRecord[member.id]);

    const item = document.createElement("div");
    item.className = "attendance-item";
    item.innerHTML = `
      <div>
        <strong>${member.name}</strong><br/>
        <small>보호자: ${member.guardian}</small>
      </div>
      <label class="switch">
        출석
        <input type="checkbox" data-member-id="${member.id}" ${isPresent ? "checked" : ""} />
      </label>
    `;

    attendanceList.appendChild(item);
  });

  const present = Object.values(dayRecord).filter(Boolean).length;
  updateSummary(members.length, present);
}

function updateSummary(total, present) {
  totalCount.textContent = total;
  presentCount.textContent = present;
  absentCount.textContent = total - present;
}

memberForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#name").value.trim();
  const guardian = document.querySelector("#guardian").value.trim();
  const birth = document.querySelector("#birth").value;

  if (!name || !guardian || !birth) {
    return;
  }

  const members = getMembers();
  members.push({
    id: crypto.randomUUID(),
    name,
    guardian,
    birth,
  });

  setMembers(members);
  memberForm.reset();

  renderMembers();
  renderAttendance();
});

memberBody.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement) || !target.dataset.id) {
    return;
  }

  const id = target.dataset.id;
  const members = getMembers().filter((member) => member.id !== id);
  setMembers(members);

  const attendance = getAttendance();
  Object.keys(attendance).forEach((date) => {
    if (attendance[date][id]) {
      delete attendance[date][id];
    }
  });
  setAttendance(attendance);

  renderMembers();
  renderAttendance();
});

attendanceDate.addEventListener("change", renderAttendance);

attendanceList.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") {
    return;
  }

  const date = attendanceDate.value;
  const memberId = target.dataset.memberId;
  if (!memberId) {
    return;
  }

  const attendance = getAttendance();
  if (!attendance[date]) {
    attendance[date] = {};
  }

  attendance[date][memberId] = target.checked;
  setAttendance(attendance);

  renderAttendance();
});

renderMembers();
renderAttendance();
