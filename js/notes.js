let idCounter = 1;

class Note {
  constructor() {
    this.id = String(idCounter++).padStart(3, "0")
    this.title = ""
    this.p = ""
  }
}

let notes = []

function addNote() {
  let noteboard = document.getElementById("noteboard")

  let note = new Note()
  notes.push(note);

  let template = document.getElementById("note-template")
  let noteDiv = template.content.cloneNode(true).firstElementChild
  noteDiv.id = "note-" + note.id
  noteDiv.style.left = "100px"
  noteDiv.style.top = "200px"
  makeDraggable(noteDiv);
  
  let noteFavorite = noteDiv.querySelector("button[title='Favorite']")
  noteFavorite.onclick = function () {
    let fav = noteDiv.classList.toggle("favorite")
    if (fav) noteFavorite.textContent = "\u2605"
    else noteFavorite.textContent = "\u2606"
  }
  noteFavorite.textContent = "\u2606"

  let noteOrderUp = noteDiv.querySelector("button[title='Bring to Front']")
  noteOrderUp.onclick = function () {
    // reorder in list
    const currentIndex = notes.findIndex((n) => n.id == note.id)
    const newIndex = notes.length - 1
    if (currentIndex == newIndex) return;
    const temp = notes[newIndex]
    notes[newIndex] = notes[currentIndex]
    notes[currentIndex] = temp

    // adjust dom
    document.getElementById("noteboard").append(noteDiv);
  }

  let noteDiscard = noteDiv.querySelector("button[title='Discard']")
  noteDiscard.onclick = function () {
    const currentIndex = notes.findIndex((n) => n.id == note.id)
    notes.splice(currentIndex, 1)
    document.getElementById("noteboard").removeChild(noteDiv)
  }
  
  noteboard.append(noteDiv)
}

function reorderNote(id) {
  // reorder
  const currentIndex = notes.findIndex((note) => note.id == id)
  const newIndex = currentIndex + reorder
  if (newIndex < 0 || newIndex >= notes.length) return;
  const temp = notes[newIndex]
  notes[newIndex] = notes[currentIndex]
  notes[currentIndex] = temp
  
  //adjust divs
  document.getElementById("note-" + notes[newIndex].id).style.zIndex = Number(newIndex);
  document.getElementById("note-" + notes[currentIndex].id).style.zIndex = Number(currentIndex);
}


function makeFavorite(element) {
  let fav = noteDiv.classList.toggle("favorite")
  if (fav) noteFavorite.textContent = "\u2605"
  else noteFavorite.textContent = "\u2606"
}

function makeDraggable(element) {
  grip = element.querySelector(".drag-grip")
  container = document.querySelector("#noteboard")
  
  const posDiff = {
    x: 0,
    y: 0,
  }
  const lastPos = {
    x: 0,
    y: 0,
  }
  const bounding = {
    offsetTop: container.offsetTop,
    width: container.clientWidth,
  }
  
  if (grip == null) return;
  
  grip.onmousedown = function (e) {
    e.preventDefault()

    lastPos.x = e.clientX
    lastPos.y = e.clientY

    document.onmousemove = function (e) {
      e.preventDefault()

      posDiff.x = lastPos.x - e.clientX
      posDiff.y = lastPos.y - e.clientY

      lastPos.x = e.clientX
      lastPos.y = e.clientY
  
      const newPosY = element.offsetTop - posDiff.y
      if (newPosY >= bounding.offsetTop) {
        element.style.top = newPosY + "px"
      }

      const newPosX = element.offsetLeft - posDiff.x
      if (newPosX >= 0 && newPosX < bounding.width - element.clientWidth) {
        element.style.left = newPosX + "px"
      }
    }
    document.onmouseup = cancelDrag
  }

  function cancelDrag() {
    document.onmousemove = null
    document.onmouseup = null
  }
}