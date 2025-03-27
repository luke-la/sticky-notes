class Note {
  constructor() {
    this.id = String(Date.now())
    this.title = ""
    this.content = ""
    this.fav = false
    this.position = {
      x: 100,
      y: 100,
    }
  }
}

function addNote(note = null) {
  const noteboard = document.getElementById("noteboard")

  if (note == null) {
    note = new Note()
    notes.push(note)
  }

  const template = document.getElementById("note-template")
  const noteDiv = template.content.cloneNode(true).firstElementChild
  noteDiv.id = "note-" + note.id
  noteDiv.style.left = note.position.x + "px"
  noteDiv.style.top = note.position.y + "px"
  noteboard.append(noteDiv)

  const grip = noteDiv.querySelector(".drag-grip")
  grip.onmousedown = function (e) {
    e.preventDefault()

    const lastPos = {
      x: e.clientX,
      y: e.clientY,
    }

    document.onmousemove = function (e) {
      e.preventDefault()

      const differenceX = lastPos.x - e.clientX
      const differenceY = lastPos.y - e.clientY

      lastPos.x = e.clientX
      lastPos.y = e.clientY
  
      const newPosY = noteDiv.offsetTop - differenceY
      noteDiv.style.top = Math.max(newPosY, 0) + "px"

      const newPosX = noteDiv.offsetLeft - differenceX
      noteDiv.style.left = Math.max(newPosX, 0) + "px"
    }

    document.onmouseup = function (e) {
      document.onmousemove = null
      document.onmouseup = null
      note.position.x = noteDiv.style.left.slice(0, -2)
      note.position.y = noteDiv.style.top.slice(0, -2)
    }
  }
  grip.ondblclick = function () {
    // reorder in list
    const currentIndex = notes.findIndex((n) => n.id == note.id)
    const newIndex = notes.length - 1
    if (currentIndex == newIndex) return
    const temp = notes[newIndex]
    notes[newIndex] = notes[currentIndex]
    notes[currentIndex] = temp

    // adjust dom
    document.getElementById("noteboard").append(noteDiv);
  }

  const noteTitle = noteDiv.querySelector("input")
  noteTitle.value = note.title
  noteTitle.onblur = function () {
    const currentIndex = notes.findIndex((n) => n.id == note.id)
    notes[currentIndex].title = noteTitle.value;
  }
  
  const noteFavorite = noteDiv.querySelector("button[title='Favorite']")
  if (note.fav) {
    noteDiv.classList.toggle("favorite")
    noteFavorite.textContent = "\u2605"
  } else {
    noteFavorite.textContent = "\u2606"
  }
  noteFavorite.onclick = function () {
    let fav = noteDiv.classList.toggle("favorite")
    if (fav) noteFavorite.textContent = "\u2605"
    else noteFavorite.textContent = "\u2606"
    const currentIndex = notes.findIndex((n) => n.id == note.id)
    notes[currentIndex].fav = fav
  }

  const noteDiscard = noteDiv.querySelector("button[title='Discard']")
  noteDiscard.onclick = function () {
    const currentIndex = notes.findIndex((n) => n.id == note.id)
    notes.splice(currentIndex, 1)
    document.getElementById("noteboard").removeChild(noteDiv)
  }

  const noteText = noteDiv.querySelector("textarea")
  noteText.value = note.content
  noteText.rows = 10;
  while (noteText.scrollHeight > noteText.clientHeight) noteText.rows++
  noteText.oninput = function () {
    noteText.rows = 10;
    while (noteText.scrollHeight > noteText.clientHeight) noteText.rows++
  }
  noteText.onblur = function () {
    const currentIndex = notes.findIndex((n) => n.id == note.id)
    notes[currentIndex].content = noteText.value
  }
}