let boards = []
let notes = []
let boardName = ""
let saved = true

const nightmode = localStorage.getItem("nightmode")
if (nightmode == "active") toggleNightMode()

const boardsString = localStorage.getItem("boardNameList")
boards = (boardsString != null) ? JSON.parse(boardsString) : []

if (boards.length == 0) boards.push("Main Board")
loadBoard(boards[0])

const boardNameInput = document.getElementById("board-name")
boardNameInput.onblur = function () {
  const oldName = boardName
  if (boardNameInput.value == oldName) return;
  else if (boards.some((b) => b == boardNameInput.value)) {
    alert("You already have a board with that name.")
    boardNameInput.value = oldName
  }
  else {
    boardName = boardNameInput.value

    const index = boards.findIndex((b) => b == oldName)
    boards.splice(index, 1, boardName)

    localStorage.setItem("boardNameList", JSON.stringify(boards))
    localStorage.setItem(boardName, localStorage.getItem(oldName))
    localStorage.removeItem(oldName)
  }
}

function toggleNightMode() {
  const night = document.querySelector("body").classList.toggle('night')
  if (night) {
    document.querySelector("button[title='Toggle Dark Mode']").textContent = "\u263C"
    localStorage.setItem("nightmode", "active")
  }
  else {
    document.querySelector("button[title='Toggle Dark Mode']").textContent = "\u263E"
    localStorage.setItem("nightmode", null)
  }
}

function loadBoard(board) {
  boardName = board

  const notesString = localStorage.getItem(board)
  notes = (notesString != null) ? JSON.parse(notesString) : []

  document.getElementById("board-name").value = board

  const nb = document.getElementById("noteboard")
  while (nb.hasChildNodes()) nb.removeChild(nb.firstChild)

  for (let note of notes) {
    addNote(note)
  }
}

function saveBoard() {
  localStorage.setItem("boardNameList", JSON.stringify(boards))
  localStorage.setItem(boardName, JSON.stringify(notes))
  changeSaveStatus(true);
}

function changeSaveStatus(save = false) {
  if (saved == save) return;

  saved = save
  if (save) document.getElementById("save-status").textContent = "saved"
  else document.getElementById("save-status").textContent = "unsaved"
}

function createNewBoard() {
  const baseName = "untitled"
  let newName = baseName
  let count = 1
  while (boards.some((b) => b == newName)) newName = baseName + count++

  boards.push(newName)
  loadBoard(newName)
  toggleBoardsList()
}

function toggleBoardsList() {
  const list = document.getElementById("boards-list")

  if (list.style.display == "block") {
    list.style.display = "none"
    return
  }

  const itemsToRemove = list.querySelectorAll("li:not(.permanent-list-item)")
  itemsToRemove.forEach( function (item) {
    item.remove()
  })

  boards.sort()
  for (let board of boards) {
    const item = document.createElement("li")
    const button = document.createElement("button")
    button.textContent = board
    button.onclick = function () {
      loadBoard(board);
      list.style.display = "none"
    }
    item.append(button)
    list.append(item)
  }

  list.style.display = "block"
}

document.addEventListener("focusin", function (event) {
  console.log("active")
  if (!document.getElementById("boards-list").contains(event.target))
    document.getElementById("boards-list").style.display = "none"
})

function buildDataURI() {
  const start = "data:application/json;base64,"
  const board = {}
  board.name = boardName
  board.content = notes
  const data = btoa(JSON.stringify(board))
  return start + data
}

function downloadBoard() {
  saveBoard()
  const a = document.createElement("a")
  a.href = buildDataURI()
  a.download = boardName
  document.body.append(a)
  a.click()
  document.body.removeChild(a)
}

