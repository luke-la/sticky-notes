let boards = []
let notes = []
let boardName = "Main Board"
let saved = true

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

function load() {
  let nightmode = localStorage.getItem("nightmode")
  if (nightmode == "active") toggleNightMode()

  const boardsString = localStorage.getItem("boardNameList")
  boards = (boardsString != null) ? JSON.parse(boardsString) : []

  if (boards.length > 0) boardName = boards[0]
  else boards.push(boardName)

  const notesString = localStorage.getItem(boardName)
  notes = (notesString != null) ? JSON.parse(notesString) : []

  document.getElementById("board-name").textContent = boardName

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