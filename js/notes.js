class Note {
  static type = {
    default: null,
    checklist: "checklist",
    image: "image",
  }
  constructor() {
    this.id = String(Date.now())
    this.type = null
    this.title = ""
    this.content = ""
    this.fav = false
    this.position = {
      x: 100,
      y: 100,
    }
  }
}

function addNote(note = null, type = null) {
  const noteboard = document.getElementById("noteboard")

  if (note == null) {
    note = new Note()
    note.type = type
    notes.push(note)
    setSaveStatus(false)
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

      const maxY = document.getElementsByTagName("header")[0].clientHeight

      if (snapToGrid) {
        if (Math.abs(differenceX) > gridSize) {
          lastPos.x = e.clientX

          const newPosX = noteDiv.offsetLeft - (noteDiv.offsetLeft % gridSize) - (differenceX - differenceX % gridSize)
          noteDiv.style.left = Math.max(newPosX, 0) + "px"
        }
        if (Math.abs(differenceY) > gridSize) {
          lastPos.y = e.clientY

          const newPosY = noteDiv.offsetTop - (noteDiv.offsetTop % gridSize) - (differenceY - differenceY % gridSize)
          noteDiv.style.top = Math.max(newPosY, maxY) + "px"
        }
      }
      else {
        lastPos.x = e.clientX
        lastPos.y = e.clientY

        const newPosX = noteDiv.offsetLeft - differenceX
        noteDiv.style.left = Math.max(newPosX, 0) + "px"

        const newPosY = noteDiv.offsetTop - differenceY
        noteDiv.style.top = Math.max(newPosY, maxY) + "px"
      }
    }

    document.onmouseup = function (e) {
      document.onmousemove = null
      document.onmouseup = null
      note.position.x = noteDiv.style.left.slice(0, -2)
      note.position.y = noteDiv.style.top.slice(0, -2)
      setSaveStatus(false)
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
    document.getElementById("noteboard").append(noteDiv)
    setSaveStatus(false)
  }

  const noteTitle = noteDiv.querySelector("input")
  noteTitle.value = note.title
  noteTitle.onblur = function () {
    const currentIndex = notes.findIndex((n) => n.id == note.id)
    if (notes[currentIndex].title != noteTitle.value) {
      notes[currentIndex].title = noteTitle.value;
      setSaveStatus(false)
    }
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
    setSaveStatus(false)
  }

  const noteDiscard = noteDiv.querySelector("button[title='Discard']")
  noteDiscard.onclick = function () {
    const currentIndex = notes.findIndex((n) => n.id == note.id)
    notes.splice(currentIndex, 1)
    document.getElementById("noteboard").removeChild(noteDiv)
    setSaveStatus(false)
  }

  const noteContent = noteDiv.querySelector(".note-content")
  if (note.type == Note.type.checklist) {
    const noteList = document.createElement("ul")
    const addItemInput = document.createElement("input")
    const addItemButton = document.createElement("button")
    noteContent.append(noteList, addItemInput, addItemButton)
    
    if (note.content != "") {
      const list = JSON.parse(note.content)
      if (list) {
        list.forEach((li) => createListItem(li.content, li.id, li.checked))
      }
    }

    addItemInput.name = "Add Checklist Item"
    addItemInput.placeholder = "Enter task..."
    addItemInput.type = "text"
    addItemInput.maxLength = 25
    addItemInput.autocomplete = "off"

    addItemButton.textContent = "+"
    addItemButton.onclick = function () {
      if (!addItemInput.value || addItemInput.value.length < 1) return
      createListItem(addItemInput.value)
      addItemInput.value = null
      note.content = JSONList(noteList)
      setSaveStatus(false)
    }

    function JSONList(ul) {
      const arr = []
      for (let li of ul.children) {
        arr.push({
          id: li.querySelector("input").id,
          checked: li.querySelector("input").checked,
          content: li.querySelector("label").innerText
        })
      }
      return JSON.stringify(arr)
    }

    function createListItem(content, indexID = null, checked = false) {
      const listItem = document.createElement("li");
      const ckb = document.createElement("input")
      const desc = document.createElement("label")
      const btnRemove = document.createElement("button")
      listItem.append(ckb, desc, btnRemove);

      if (indexID) ckb.id = note.id + "-ckb-" + indexID
      else ckb.id = note.id + "-ckb-" + Date.now()
      ckb.type = "checkbox"
      ckb.checked = checked
      ckb.onchange = function () {
        note.content = JSONList(noteList)
        setSaveStatus(false)
      }

      desc.setAttribute("for", ckb.id)
      desc.textContent = content

      btnRemove.textContent = "X"
      btnRemove.onclick = function () {
        listItem.remove()
        note.content = JSONList(noteList)
        setSaveStatus(false)
      }

      noteList.append(listItem)
    }
  }

  else if (note.type == Note.type.image) {
    const srcInput = document.createElement("input")
    const linkedImage = document.createElement("img")
    noteContent.append(linkedImage, srcInput)
    srcInput.name = "Image Url Input"
    srcInput.type = "text"
    srcInput.placeholder = "Image Url..."
    srcInput.autocomplete = "off"
    srcInput.onblur = function () {
      linkedImage.src = srcInput.value
      note.content = srcInput.value
      setSaveStatus(false)
    }
    srcInput.value = note.content
    linkedImage.src = srcInput.value
  }

  else {
    const noteText = document.createElement("textarea")
    noteContent.append(noteText)
    noteText.name = "Note Text"
    noteText.placeholder = "Your text here..."
    noteText.value = note.content
    noteText.rows = 10;
    while (noteText.scrollHeight > noteText.clientHeight) noteText.rows++
    noteText.oninput = function () {
      noteText.rows = 10;
      while (noteText.scrollHeight > noteText.clientHeight) noteText.rows++
    }
    noteText.onblur = function () {
      if (note.content != noteText.value) {
        note.content = noteText.value
        setSaveStatus(false)
      }
    }
  }
}

