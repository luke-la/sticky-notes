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

  document.getElementById("board-name").textContent = board

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
  if (save) document.getElementById("board-name").textContent = boardName
  else document.getElementById("board-name").textContent = boardName + "*"
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

  while (list.children.length > 1) list.removeChild(list.lastChild);

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