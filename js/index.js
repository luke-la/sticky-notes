let boards = []
let trash = []
let notes = []
let boardName = ""
let saved = true

const nightmode = localStorage.getItem("Dark Mode")
if (nightmode == "active") toggleNightMode()

let noteTheme = localStorage.getItem("noteTheme")
if (noteTheme) document.querySelector("#noteboard").classList.add(noteTheme)
else updateTheme("theme-classic")

function updateTheme(newTheme) {
  document.querySelector("#noteboard").classList.replace(noteTheme, newTheme)
  noteTheme = newTheme
  localStorage.setItem("noteTheme", newTheme)
  console.log("here", newTheme)
}

const boardsString = localStorage.getItem("boardList")
boards = (boardsString != null) ? JSON.parse(boardsString) : []

const trashString = localStorage.getItem("trashList")
trash = (trashString != null) ? JSON.parse(trashString) : []

const list = document.getElementById("boards-list")
const listButton = document.getElementById("btn-boards-list")

if (boards.length == 0) {
  boards.push("Main Board")
  loadBoard(boards[0])
}
else {
  const lastBoard = localStorage.getItem("lastBoard")
  if (lastBoard && localStorage.getItem(lastBoard)) loadBoard(lastBoard)
  else loadBoard(boards[0])
}

const boardNameInput = document.getElementById("board-name")
boardNameInput.onblur = function () {
  const oldName = boardName
  const newName = boardNameInput.value

  if (newName == oldName) return

  if (boards.some((b) => b == newName)) {
    boardNameInput.value = oldName
    alert("You already have a board with that name.")
    return
  }
  
  saveBoard()

  if (trash.some((b) => b == newName)) {
    //this might break ~270 years when the digit ticks over to the 14th decimal place
    newTrashName = "trash" + Date.now()
    const trashIndex = trash.findIndex((b) => b == newName)
    trash[trashIndex] = newTrashName

    localStorage.setItem("trashList", JSON.stringify(trash))
    localStorage.setItem(newTrashName, localStorage.getItem(newName))
    alert("Your board in trash with the same name has been renamed.")
  }
  
  boardName = newName

  const index = boards.findIndex((b) => b == oldName)
  boards[index] = boardName

  localStorage.setItem("boardList", JSON.stringify(boards))
  localStorage.setItem(boardName, localStorage.getItem(oldName))
  localStorage.removeItem(oldName)
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

  localStorage.setItem("lastBoard", board)
  changeSaveStatus(true)
}

function saveBoard() {
  localStorage.setItem("boardList", JSON.stringify(boards))
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
  while (boards.some((b) => b == newName) || trash.some((b) => b == newName))
    newName = baseName + count++

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
    list.insertBefore(item, list.lastElementChild)
  }

  list.style.display = "block"
}

document.addEventListener("click", function (event) {  
  if (!list.contains(event.target)
    && !listButton.contains(event.target)) {
    document.getElementById("boards-list").style.display = "none"
  }
})

function openTrashModal() {
  const modal = document.getElementById("trash-modal")

  const trashList = modal.querySelector("#trash-list")

  const message = modal.querySelector("#trash-message")
  if (trash.length < 1) message.textContent = "You have no boards in your trash bin."
  else if (trash.length == 1) message.textContent = "You have one board in your trash bin."
  else message.textContent = "You have " + trash.length + " boards in your trash bin."
  
  trashList.innerHTML = null
  if (trash.length > 0) {
    for (let t of trash) {
      const notesString = localStorage.getItem(t)
      const noteCount = (notesString != null) ? JSON.parse(notesString).length : 0
      const item = document.createElement("li")
      item.textContent = t + " | Notes: " + noteCount
      trashList.append(item)
    }
  }

  modal.showModal()
}

function openSettings() {
  const themesToggles = document.querySelectorAll("[name='theme']")
  
  themesToggles.forEach(function (theme) {
    if (theme.id == noteTheme) theme.checked = true
    console.log("here")
    theme.onclick = function() {
      updateTheme(theme.id)
    }
  })
  document.getElementById('settings-modal').showModal()
}

function resetSettings() {
  updateTheme('theme-classic')
  openSettings()
}

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

function trashBoard() {
  const result = confirm("Are you sure you want to move your '" +
    boardName +
    "' board to trash?")
  if (result) {
    const indexToRemove = boards.findIndex((b) => b == boardName)
    trash.push(boards[indexToRemove])
    boards.splice(indexToRemove, 1)
    if (boards.length < 1) boards.push("Main Board")
    localStorage.setItem("boardList", JSON.stringify(boards))
    localStorage.setItem("trashList", JSON.stringify(trash))
    loadBoard(boards[0])
  }
}


function deleteBoard() {
  const result = prompt("Are you sure you want to permenantly delete your '" +
    boardName +
    "' board?\nPlease enter the name of the board below to confirm deletion, or click cancel to escape.")
  if (result == null) return
  else if (result == boardName) {
    localStorage.removeItem(boardName)
    const indexToRemove = boards.findIndex((b) => b == boardName)
    boards.splice(indexToRemove, 1)
    if (boards.length < 1) boards.push("Main Board")
    localStorage.setItem("boardList", JSON.stringify(boards))
    loadBoard(boards[0])
  }
  else alert("You did not enter the correct name. If you wish to delete your board, please try again.")
}

