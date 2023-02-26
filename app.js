// Import the Firebase SDK
// import firebase from 'firebase/app';
// import 'firebase/auth';
// import 'firebase/firestore';

// Initialize Firebase with your project configuration
const firebaseConfig = {
    apiKey: "AIzaSyAIoy1LQqM6eKdd3VjflTFtEKW6jA4ilcw",
    authDomain: "keep-7d29b.firebaseapp.com",
    projectId: "keep-7d29b",
    storageBucket: "keep-7d29b.appspot.com",
    messagingSenderId: "474671043556",
    appId: "1:474671043556:web:ebc0f2adaa683763f8edf1"
};

firebase.initializeApp(firebaseConfig);

// Create a Firestore instance
const db = firebase.firestore();

// Create an Auth instance
const auth = firebase.auth();

class Note {
    constructor(id, title, text) {
        this.id = id;
        this.title = title;
        this.text = text;
    }
}

class App {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes'))||[];
        this.selectedNoteId = ""
        this.miniSidebar = true;

        this.$activeForm =document.querySelector(".active-form");
        this.$inactiveForm =document.querySelector(".inactive-form");
        this.$noteTittle =document.querySelector("#note-tittle");
        this.$noteText =document.querySelector("#note-text");
        this.$notes = document.querySelector(".notes");
        this.$form = document.querySelector("#form");
        this.$modal = document.querySelector(".modal");
        this.$modalForm = document.querySelector("#modal-form");
        this.$modalTittle =document.querySelector("#modal-tittle");
        this.$modalText =document.querySelector("#modal-text");
        this.$closeModalForm = document.querySelector("#modal-btn");
        this.$sidebar = document.querySelector(".sidebar")

       
        this.$app = document.querySelector("#app");
        this.$firebaseuiAuthContainer = document.querySelector("#firebaseui-auth-container")
        this.$app.style.display ="none";

       
        this.ui = new firebaseui.auth.AuthUI(auth);
        this.handleAuth();

        this.addEventListeners();
        this.displayNotes();
    }

    handleAuth() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log(user);
                this.redirectToApp();
                // https://firebase.google.com/docs/reference/js/firebase.User
              var uid = user.uid;
              // ...
            } else {
              // User is signed out
              this.redirectToAuth();
            }
          });
        
    }

    redirectToApp() {
        this.$firebaseuiAuthContainer.style.display = "none";
        this.$app.style.display = "block";
    }

    redirectToAuth() {
        this.$firebaseuiAuthContainer.style.display = "block";
        this.$app.style.display = "auth";

        this.ui.start('#firebaseui-auth-container', {
            signInOptions: [
              firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            // Other config options...
          });
    }

    addEventListeners() {
        document.body.addEventListener("click", (event) => {
            this.handleFormclick(event);
            this.closeModal(event)
            this.openModal(event)
            this.handleArchiving(event)
        })

        this.$form.addEventListener("submit", (event) =>{
            event.preventDefault();
            const tittle = this.$noteTittle.value;
            const text = this.$noteText.value;
            this.addNote({tittle, text});
            this.closeActiveForm();
        })

        this.$closeModalForm.addEventListener("click", (event) =>{
            event.preventDefault();
            // this.closeModal(event);
        })
        this.$sidebar.addEventListener("mouseover", (event) => {
            this.handleToggleSidebar();
        })
        this.$sidebar.addEventListener("mouseout", (event) => {
            this.handleToggleSidebar();
        })
    }

    handleFormclick(event) {
        const isactiveFormClickedOn = this.$activeForm.contains(event.target);
        const isInactiveFormClickedOn = this.$inactiveForm.contains(event.target);
        const tittle = this.$noteTittle.value;
        const text = this.$noteText.value;

        if(isInactiveFormClickedOn) {
            this.openActiveForm();
        }
        else if(!isInactiveFormClickedOn && !isactiveFormClickedOn) {
            this.addNote({tittle, text});
            this.closeActiveForm();
        }
    }

    openActiveForm() {
        this.$inactiveForm.style.display = "none";
        this.$activeForm.style.display = "block";
        this.$noteTittle.focus();
    }
    closeActiveForm() {
        this.$inactiveForm.style.display = "block";
        this.$activeForm.style.display = "none";
        this.$noteText.value = "";
        this.$noteTittle.value = "";
    }

    openModal(event) {
        const $selectedNote = event.target.closest(".note")
        if(event.target.closest(".note"))
        if($selectedNote && !event.target.closest(".archive")) {
            this.selectedNoteId = $selectedNote.id;
            this.$modalTittle.value = $selectedNote.children[1].innerHTML;
            this.$modalText.value = $selectedNote.children[2].innerHTML;
            this.$modal.classList.add("open-modal");
        } else {
            return;
        }
    }

    closeModal(event){
        const ismodalFormClickedOn = this.$modalForm.contains(event.target);
        const isCloseModalBtnClickedOn = this.$closeModalForm.contains(event.target);
        if((!ismodalFormClickedOn || isCloseModalBtnClickedOn) && this.$modal.classList.contains("open-modal")) {
            this.editNote(this.selectedNoteId, {title: this.$modalTittle.value, text: this.$modalText.value})
            this.$modal.classList.remove("open-modal");
        }
    }

    handleArchiving(event) {
        const $selectedNote = event.target.closest(".note");
        if($selectedNote && event.target.closest(".archive")) {
            this.selectedNoteId = $selectedNote.id;
            this.deleteNote(this.selectedNoteId);
        } else {
            return;
        }
    }

    addNote({tittle, text}) {
        if(text != "") {
            const newNote = new Note(cuid(), tittle, text);
        this.notes = [...this.notes, newNote];
        this.render();
        }
        // const id = Date.now();
    }

    editNote(id, {tittle, text}) {
        this.notes = this.notes.map((note)=> {
            if(note.id == id) {
                note.tittle = tittle;
                note.text = text; 
            }
            return note; 
        });
        this.render();
    }

    deleteNote(id) {
        this.notes = this.notes.filter((note) => note.id != id);
        this.render();
    }

    handleMouseOverNote(element) {
        const $note = document.querySelector("#"+element.id);
        const $checkNote = $note.querySelector(".check_circle");
        const $noteFooter = $note.querySelector(".note-footer");
        $checkNote.style.visibility = "visible";
        $noteFooter.style.visibility = "visible";
    }

    handleMouseOutNote(element) {
        const $note = document.querySelector("#"+element.id);
        const $checkNote = $note.querySelector(".check_circle");
        const $noteFooter = $note.querySelector(".note-footer");
        $checkNote.style.visibility = "hidden";
        $noteFooter.style.visibility = "hidden";
    }

    handleToggleSidebar() {
        if(this.miniSidebar) {
            this.$sidebar.style.width = "250px";
            this.$sidebar.classList.add("sidebar-hover")
            this.miniSidebar = false;
        }
        else {
            this.$sidebar.style.width = "70px";
            this.$sidebar.classList.remove("sidebar-hover")
            this.miniSidebar = true;
        }
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    render() {
        this.saveNotes();
        this.displayNotes();
    }

    displayNotes() {
        this.$notes.innerHTML = this.notes.map(note => 
        `
        <div class="note" id="${note.id}" onmouseover="app.handleMouseOverNote(this)" onmouseout="app.handleMouseOutNote(this)">
        <span class="material-icons check_circle">check_circle</span>
        <div class="title">${note.title}</div>
        <div class="text">${note.text}</div>
        <div class="note-footer">             <div class="tooltip">
            <span class="material-symbols-outlined material-icons hover small-icon">add_alert</span>
            <span class="tooltip-text">Remind me</span>                
        </div>
        <div class="tooltip">
            <span class="material-symbols-outlined material-icons hover small-icon">person_add</span>
            <span class="tooltip-text">Collaborator</span>                
        </div>            
        <div class="tooltip">
            <span class="material-symbols-outlined material-icons hover small-icon">palette</span>
            <span class="tooltip-text">Background options</span>                
        </div>
        <div class="tooltip">
            <span class="material-symbols-outlined material-icons hover small-icon">image</span>
            <span class="tooltip-text">Add image</span>                
        </div>
        <div class="tooltip archive">
            <span class="material-symbols-outlined material-icons hover small-icon">archive</span>
            <span class="tooltip-text">Archive</span>                
        </div>
        <div class="tooltip">
            <span class="material-symbols-outlined material-icons hover small-icon">more_vert</span>
            <span class="tooltip-text">More</span>                
        </div></div>
    </div>
        `).join("");
    }
}
 
const app = new App();