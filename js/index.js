let boards = []
let notes = []
let boardName = ""
let saved = true

const nightmode = localStorage.getItem("Dark Mode")
if (nightmode == "active") toggleNightMode()

const boardsString = localStorage.getItem("boardNameList")
boards = (boardsString != null) ? JSON.parse(boardsString) : []

const list = document.getElementById("boards-list")
const listButton = document.getElementById("btn-boards-list")

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
  const nmStatus = (night) ? "active" : null
  localStorage.setItem("Dark Mode", nmStatus)
}

function loadBoard(board, overwriteNotes = []) {
  boardName = board

  const notesString = localStorage.getItem(board)
  notes = (notesString != null) ? JSON.parse(notesString) : []
  if (overwriteNotes.length > 0) notes = overwriteNotes;

  document.getElementById("board-name").value = board

  const nb = document.getElementById("noteboard")
  while (nb.hasChildNodes()) nb.removeChild(nb.firstChild)

  if (notes && notes.length > 0)
    for (let note of notes)
      addNote(note)

  changeSaveStatus(true)
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

function createNewBoard(baseName = "untitled board", notes = []) {
  let newName = baseName
  let count = 1
  while (boards.some((b) => b == newName)) newName = baseName + count++

  boards.push(newName)
  boards.sort()
  loadBoard(newName, notes)
  changeSaveStatus()
  list.style.display = "none"
}

function toggleBoardsList() {
  if (list.style.display == "block") {
    list.style.display = "none"
    return
  }

  const itemsToRemove = list.querySelectorAll("li:not(.permanent-list-item)")
  itemsToRemove.forEach( function (item) {
    item.remove()
  })

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

document.addEventListener("click", function (event) {  
  if (!list.contains(event.target)
    && !listButton.contains(event.target)) {
    document.getElementById("boards-list").style.display = "none"
  }
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

function uploadBoard() {
  const dialog = document.getElementById('open-file-modal')
  const input = document.getElementById('file-input')
  let loadedFile = null;
  dialog.showModal()
  document.getElementById("btn-file-accept").onclick = function () {
    if (input.files[0] == null) {
      alert("No file selected.")
      return
    }

    const reader = new FileReader()
    reader.onload = function() {
      loadedFile = JSON.parse(reader.result)
      if (!loadedFile) {
        alert("The file didn't contain valid JSON.")
        return
      }
      if (!loadedFile.name || !loadedFile.content) {
        alert("The file has an improper format.")
        return
      }
      createNewBoard(loadedFile.name, loadedFile.content)
    }

    reader.onerror = function () {
      console.error("There was an error reading the file.",
        {
          reader: reader,
          file: input.files[0],
        })
    }

    reader.readAsText(input.files[0])
    dialog.close()
  }
  document.getElementById("btn-file-cancel").onclick = function () {
    input.value = null;
    dialog.close()
  }
}

