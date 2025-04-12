let boards, trash, notes, boardName
let saved = true
let darkMode, noteTheme, showNoteOrder
let snapToGrid, gridSize = 15

// load boards and notes from storage
const boardsString = localStorage.getItem("boardList")
boards = (boardsString != null) ? JSON.parse(boardsString) : []

const trashString = localStorage.getItem("trashList")
trash = (trashString != null) ? JSON.parse(trashString) : []

if (boards.length == 0) {
  boards.push("Main Board")
  loadBoard(boards[0])
}
else {
  const lastBoard = localStorage.getItem("lastBoard")
  if (lastBoard && localStorage.getItem(lastBoard)) loadBoard(lastBoard)
  else loadBoard(boards[0])
}

function loadBoard(board) {
  boardName = board

  const notesString = localStorage.getItem(board)
  notes = (notesString !== null) ? JSON.parse(notesString) : []
 
  document.getElementById("board-name").value = board

  const nb = document.getElementById("noteboard")
  while (nb.hasChildNodes()) nb.removeChild(nb.firstChild)

  if (notes && notes.length > 0)
    for (let note of notes)
      addNote(note)

  localStorage.setItem("lastBoard", board)
  setSaveStatus(notesString !== null)
}

// dark mode
darkMode = localStorage.getItem("darkMode")
if (darkMode === "active") toggleDarkMode()
const btnDarkMode = document.getElementById("btn-dark-mode")
btnDarkMode.onclick = function (e) {
  e.preventDefault()
  toggleDarkMode()
}

function toggleDarkMode() {
  const night = document.querySelector("body").classList.toggle('dark')
  const nmStatus = (night) ? "active" : null
  localStorage.setItem("darkMode", nmStatus)
}

// note order
showNoteOrder = localStorage.getItem("showNoteOrder")
const ckbShowNoteOrder = document.getElementById("ckb-show-note-order")
ckbShowNoteOrder.onchange = toggleShowNoteOrder
if (showNoteOrder === "display") {
  toggleShowNoteOrder()
  ckbShowNoteOrder.checked = true
}

function toggleShowNoteOrder()  {
  const shown = document.querySelector("body").classList.toggle('note-order-shown')
  const shownStatus = (shown) ? "display" : null
  localStorage.setItem("showNoteOrder", shownStatus)
}

// grid snapping 
snapToGrid = localStorage.getItem("snapToGrid") === "true"
const ckbGridSnap = document.getElementById("ckb-grid-snapping")
ckbGridSnap.onchange = function () {
  snapToGrid = ckbGridSnap.checked
  inputSize.disabled = !ckbGridSnap.checked
  localStorage.setItem("snapToGrid", String(ckbGridSnap.checked))
}

const storedGridSize = parseInt(localStorage.getItem("gridSize"))
const inputSize = document.getElementById("grid-size")
const sizeMin = parseInt(inputSize.min)
const sizeMax = parseInt(inputSize.max)

if (storedGridSize) {
  gridSize = storedGridSize
  if (gridSize < sizeMin) gridSize = sizeMin
  else if (gridSize > sizeMax) gridSize = sizeMax
}

inputSize.disabled = !ckbGridSnap.checked
inputSize.value = gridSize
inputSize.input
inputSize.onchange = function () {
  if (isNaN(inputSize.value)) return
  if (inputSize.value > sizeMax) inputSize.value = sizeMax
  else if (inputSize.value < sizeMin) inputSize.value = sizeMin

  gridSize = inputSize.value
  localStorage.setItem("gridSize", gridSize)
}

// theme
noteTheme = localStorage.getItem("noteTheme")
if (noteTheme) document.querySelector("#noteboard").classList.add(noteTheme)
else updateTheme("theme-classic")

function updateTheme(newTheme) {
  document.querySelector("#noteboard").classList.replace(noteTheme, newTheme)
  noteTheme = newTheme
  localStorage.setItem("noteTheme", newTheme)
}

// boards list and buttons
const list = document.getElementById("boards-list")
const btnBoardsList = document.getElementById("btn-boards-list")
btnBoardsList.onclick = function () {
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
    if (board == boardName) button.textContent = "> " + board
    else button.textContent = board
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
    && !btnBoardsList.contains(event.target)) {
    list.style.display = "none"
  }
})

// add board button
const btnAddBoard = document.getElementById("btn-add-board")
btnAddBoard.onclick = function () {
  createNewBoard("untitled board")
}

// import board button
const btnImportBoard = document.getElementById("btn-import-board")
btnImportBoard.onclick = function () {
  list.style.display = "none"

  const dialog = document.getElementById('open-file-modal')
  const input = document.getElementById('file-input')
  const btnAccept = document.getElementById("btn-file-accept")
  const btnCancel = document.getElementById("btn-file-cancel")

  input.onchange = function () {
    console.log(input.files[0])
    btnAccept.disabled = (!input.files[0])
  }

  btnAccept.disabled = true;
  btnAccept.onclick = function () {
    if (input.files[0] === null) {
      alert("No file selected.")
      return
    }

    const reader = new FileReader()
    reader.onload = function() {
      const loadedFile = JSON.parse(reader.result)
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

  btnCancel.onclick = function () {
    input.value = null;
    dialog.close()
  }

  dialog.showModal()
}

// helper function to create new board (used in both create and import)
function createNewBoard(baseName, addnotes = []) {
  let newName = baseName
  let count = 1
  while (boards.some((b) => b == newName) || trash.some((b) => b == newName))
    newName = baseName + count++

  boards.push(newName)
  boards.sort()
  localStorage.setItem("boardList", JSON.stringify(boards))

  notes = addnotes;
  localStorage.setItem(newName, JSON.stringify(notes))

  loadBoard(newName)
  list.style.display = "none"
}

// open trash button
const btnTrashModal = document.getElementById("btn-trash-modal")
btnTrashModal.onclick = function () {
  list.style.display = "none"
  
  const modal = document.getElementById("trash-modal")
  const trashList = modal.querySelector("#trash-list")
  const message = modal.querySelector("#trash-message")
  
  function updateTrashCount() {
    if (trash.length < 1) message.textContent = "You have no boards in your trash bin."
    else if (trash.length == 1) message.textContent = "You have one board in your trash bin."
    else message.textContent = "You have " + trash.length + " boards in your trash bin."
  }

  updateTrashCount()
  
  trashList.innerHTML = null
  if (trash.length > 0) {
    for (let t of trash) {
      const notesString = localStorage.getItem(t)
      const noteCount = (notesString != null) ? JSON.parse(notesString).length : 0
      const item = document.createElement("li")
      const textContent = t + " | Notes: " + noteCount
      const restoreBtn = document.createElement("button")
      restoreBtn.textContent = "Restore"
      restoreBtn.onclick = function () {
        const indexToRemove = trash.findIndex((b) => b === t)
        boards.push(...trash.splice(indexToRemove, 1))
        localStorage.setItem("boardList", JSON.stringify(boards))
        localStorage.setItem("trashList", JSON.stringify(trash))
        loadBoard(t)
        item.remove()
        updateTrashCount()
      }
      const deleteBtn = document.createElement("button")
      deleteBtn.textContent = "Delete"
      deleteBtn.onclick = function () {
        deleteBoard(t, item)
        updateTrashCount()
      }
      item.append(restoreBtn, textContent, deleteBtn)
      trashList.append(item)
    }
  }

  document.getElementById("close-trash-modal").onclick = function () {
    modal.close()
  }

  modal.showModal()
}

// handles board name changes
const boardNameInput = document.getElementById("board-name")
boardNameInput.onblur = function () {
  const oldName = boardName
  const newName = boardNameInput.value

  // if no change was made, do nothing
  if (newName == oldName) return

  // if there is already a board with that name, alert user and do nothing
  if (boards.some((b) => b == newName)) {
    boardNameInput.value = oldName
    alert("You already have a board with that name.")
    return
  }

  // if there is a board in trash with that name, rename the board in trash and alert user
  if (trash.some((b) => b == newName)) {
    newTrashName = "trash" + Date.now() // might break ~270 years when the digit ticks over to the 14th decimal place
    const trashIndex = trash.findIndex((b) => b == newName)
    trash[trashIndex] = newTrashName

    localStorage.setItem("trashList", JSON.stringify(trash))
    localStorage.setItem(newTrashName, localStorage.getItem(newName))
    alert("Your board in trash with the same name has been renamed.")
  }
  
  // rename board and move it's storage over to be held under the new name
  boardName = newName

  const index = boards.findIndex((b) => b == oldName)
  boards[index] = boardName

  localStorage.setItem("boardList", JSON.stringify(boards))
  localStorage.setItem(boardName, localStorage.getItem(oldName))
  localStorage.removeItem(oldName)
}

const btnSave = document.getElementById("btn-save")
btnSave.onclick = function () {
  localStorage.setItem(boardName, JSON.stringify(notes))
  setSaveStatus(true)
}

// helper function to set save status
function setSaveStatus(newSaveStatus) {
  if (saved === newSaveStatus) return;

  saved = newSaveStatus
  if (saved) document.getElementById("save-status").textContent = "saved"
  else document.getElementById("save-status").textContent = "unsaved"
}

const btnDownload = document.getElementById("btn-download")
btnDownload.onclick = function () {
  const a = document.createElement("a")
  let dataURI = "data:application/json;base64,"
  dataURI += btoa(JSON.stringify({
    name: boardName,
    content: notes
  }))
  a.href = dataURI
  a.download = boardName
  document.body.append(a)
  a.click()
  document.body.removeChild(a)
}

// send board to trash
const btnTrash = document.getElementById("btn-trash")
btnTrash.onclick = function () {
  const result = confirm("Are you sure you want to move your '" +
    boardName +
    "' board to trash?")
  if (result) {
    const indexToRemove = boards.findIndex((b) => b == boardName)
    trash.push(...boards.splice(indexToRemove, 1))
    if (boards.length < 1) boards.push("Main Board")
    localStorage.setItem("boardList", JSON.stringify(boards))
    localStorage.setItem("trashList", JSON.stringify(trash))
    loadBoard(boards[0])
  }
}

// open/close info modal
document.getElementById("btn-help").onclick = function () {
  document.getElementById('info-modal').showModal()
}
document.getElementById("close-info-modal").onclick = function () {
  document.getElementById('info-modal').close()
}

// populate settings modal
const themesToggles = document.querySelectorAll("[name='theme']")
themesToggles.forEach(function (theme) {
  if (theme.id == noteTheme) theme.checked = true
  theme.onclick = function() {
    updateTheme(theme.id)
  }
})
// reset settings
const btnResetSettings = document.getElementById("btn-reset-settings")
btnResetSettings.onclick = function () {
  updateTheme("theme-classic")
  themesToggles.forEach(function (theme) {
    if (theme.id == noteTheme) theme.checked = true
  })
}
// open/close settings modal
document.getElementById("btn-settings").onclick = function () {
  document.getElementById('settings-modal').showModal()
}
document.getElementById("close-settings-modal").onclick = function() {
  document.getElementById('settings-modal').close()
}

function deleteBoard(board, item) {
  const result = prompt("Are you sure you want to permenantly delete your '" +
    board +
    "' board?\nPlease enter the name of the board to confirm deletion, or click cancel to escape.")
  if (result == null) return
  else if (result == board) {
    localStorage.removeItem(board)
    const indexToRemove = trash.findIndex((b) => b == board)
    trash.splice(indexToRemove, 1)
    localStorage.setItem("trashList", JSON.stringify(trash))
    item.remove()
  }
  else alert("You did not enter the correct name. If you wish to delete your board, please try again.")
}

// toolbar buttons 
const buttons = document.querySelectorAll("#toolbar > button")
buttons[0].onclick = function () {
  addNote()
}
buttons[1].onclick = function () {
  addNote(null, Note.type.checklist)
}
buttons[2].onclick = function () {
  addNote(null, Note.type.image)
}
