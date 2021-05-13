const baseURL = 'http://localhost:8081';
let doctors;
let currDoc;

const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        console.log("reset received")
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
                document.querySelector('#doctor ').innerHTML = ``
                document.querySelector('#companions ').innerHTML = ``
            })
            .then();
    };
};

const errorReceived = (bool, id) => {
    if (bool){
        console.log("error received")
        document.getElementById('error').innerHTML = `
        <text> ${id}: bad input </text>`;
        document.getElementById('error').style.display = 'block'
    }
    else {
        
    }
}
const updateDoc = () => {
    const correctData = checkInput()
    console.log()
    
    
    const newDoc = {
        name: document.getElementById('name').value,
        seasons: JSON.parse("["+ document.getElementById("seasons").value + "]"),
        ordering: parseInt(document.getElementById("ordering").value),
        image_url: document.getElementById("image_url").value
    };
    console.log("this is currDoc, ", currDoc)
    console.log("this is newDoc,", newDoc)
    if (correctData){
        console.log("doing fetch")
        fetch(`${baseURL}/doctors/${currDoc._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',

              },
            body: JSON.stringify(newDoc)
        })
        .then(response => response.json())
        .then(doctor =>
            {
                displayDoc(doctor);
                initListDoctors()
        })
    }
    else {
        return
    }
    
}
const editDoc = () => {
    if (document.querySelector('#error') != null)
        document.querySelector('#error').style.display = 'none';
    const id = document.querySelector("#doctor h2").id
    
    const doctor = doctors.filter(doc => doc._id === id)[0];
    currDoc = doctor
    fetch(`${baseURL}/doctors/${doctor._id}`)
    .then(response => response.json())
    .then(doc => {
        let docName = doc.name
        console.log(docName)
        document.getElementById('doctor').innerHTML = `
        <form>
            <div class="error" id="error" ></div>
            <!-- Name -->
            <label for="name">Name</label>
            <input type="text" id="name">
        
            <!-- Seasons -->
            <label for="seasons">Seasons</label>
            <input type="text" id="seasons" value=${doc.seasons}>
        
            <!-- Ordering -->
            <label for="ordering">Ordering</label>
            <input type="text" id="ordering" value=${doc.ordering}>
        
            <!-- Image -->
            <label for="image_url">Image</label>
            <input type="text" id="image_url" value=${doc.image_url}>
        
            <!-- Buttons -->
            <button onclick="updateDoc()" class="btn btn-main" id="create">Update</button>
            <button onclick="cancelUpdate()" class="btn" id="cancel">Cancel</button>
        </form>
        `
        document.getElementById("name").value = docName
    })
}

const deleteDoc = ev => {
    console.log('deleting doc')
    const doctor = currDoc
    if (confirm("Are you sure you want to delete this doctor? ")){
        fetch(`${baseURL}/doctors/${doctor._id}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'
            },
        })
        .then(() =>
        {
            document.getElementById('doctor').innerHTML = ``
            document.getElementById('companions').innerHTML = ``
            initListDoctors()
        })
    }
}
const displayDoc = (doctor) => {
    console.log("doctor selected, ", doctor)
    currDoc = doctor
    document.querySelector('#doctor').innerHTML = `
        <h2 id=${doctor._id}> ${doctor.name}</h2>
        <img src="${doctor.image_url}"> </img>
        <p> Seasons: ${doctor.seasons} <p>
        <a href="#" id="edit" onclick=editDoc> edit </a>
        <a href="#" id='delete' onclick=deleteDoc> delete </a>
    `
    document.getElementById('delete').onclick = deleteDoc;
    document.getElementById('edit').onclick = editDoc;
}
const checkInput = () => {
    doctor = currDoc
    if (document.getElementById('name').value == "") {
        errorReceived(true, 'error with name')
        return false
        
    } 
    if ((document.getElementById("seasons").value).match(/[^0-9 \,]/)) {
        // document.getElementById('doctor').innerHTML += `
        // <div id="errorSeasons" class="error"> ERROR: season needs to be in correct format</div>`
        // document.getElementById('errorSeasons').style.display = 'block'
        errorReceived(true, 'error with seasons')
        return false
        
    }
    if (isNaN(document.getElementById("ordering").value)) {
        // console.log("ordering is wrong")
        // document.getElementById('doctor').innerHTML += `
        // <div id="errorOrdering" class="error"> ERROR: ordering needs to be in correct format</div>`
        // document.getElementById('errorOrdering').style.display = 'block'
        errorReceived(true, 'error with ordering')
        return false
        
    }
    if (document.getElementById("image_url").value == ""){
        errorReceived(true, 'error with image_url')
        return false
    }
    return true
}
const addNewDoc = (e) => {
    console.log(e)
    e.preventDefault()
    document.querySelector('#error').style.display = 'none';
    const correctData = checkInput()
    if (correctData) {
        const newDoc = {
            name: document.getElementById('name').value,
            seasons: document.getElementById("seasons").value,
            ordering: document.getElementById("ordering").value,
            image_url: document.getElementById("image_url").value
        };
        fetch(`${baseURL}/doctors/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(newDoc)
        })
        .then(response => response.json())
        .then(doctor =>
            {
                displayDoc(doctor);
                currDoc = doctor
                initListDoctors()
        }
        )}
    else {
        return
    }
    
}
    

const cancelCreation = () => {
    document.querySelector('#doctor').innerHTML = `
    `
}

const createButton = () => {
    document.getElementById('companions').innerHTML = ``
    document.getElementById('doctor').innerHTML = `
    <form>
        <div class="error" id="error" ></div>
        <!-- Name -->
        <label for="name">Name</label>
        <input type="text" id="name">
    
        <!-- Seasons -->
        <label for="seasons">Seasons</label>
        <input type="text" id="seasons" >
    
        <!-- Ordering -->
        <label for="ordering">Ordering</label>
        <input type="text" id="ordering">
    
        <!-- Image -->
        <label for="image_url">Image</label>
        <input type="text" id="image_url">
    
        <!-- Buttons -->
        <button class="btn btn-main" id="create">Save</button>
        <button onclick="cancelCreation()" class="btn" id="cancel">Cancel</button>
    </form>
    `
    document.querySelector('#create').onclick = addNewDoc
}






const initListDoctors = () => {
    console.log('running initlistdcotrs')
    fetch(`${baseURL}/doctors/`)
    .then(response => response.json())
    .then( data => {
        console.log(data)
        doctors = data;
        const listDoctors = data.map(item => `
        <li>
            <a href="#" data-id="${item._id}">${item.name}</a>
        </li>`
        );
        document.getElementById('doctorNames').innerHTML = `
        <ul>
            ${listDoctors.join('')}
        </ul>
        <button onclick="createButton();" id="createNewDoc" onPressclass="btn">Add New Doctor</button>`
        
        })
    .then(attachEventHandlers);
}
const attachEventHandlers = () => {
    console.log("moved onto event handler")
    document.querySelectorAll('#doctorNames a').forEach(a => 
        {
            a.onclick = showDetail;
        })
}
const showDetail = ev => {
    const id = ev.currentTarget.dataset.id;
    console.log(id)
    // find the current artist from the artists array:
    const doctor = doctors.filter(doc => doc._id === id)[0];
    currDoc = doctor;
    console.log(currDoc)
    fetch(`${baseURL}/doctors/${doctor._id}/companions`)
    .then(response => response.json())
    .then(comps => {
        console.log(comps)
        const lstComps = comps.map(item => `
        <div>
            <img src="${item.image_url}">
            <p> ${item.name} </p>
        <div>`
        );
        document.getElementById('companions').innerHTML = `
        <u1>
            ${lstComps.join('')}
        </u1>`
    })
    displayDoc(doctor);
}


// invoke this function when the page loads:
initListDoctors();