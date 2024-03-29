


const submit = async function( event ) {
  if (confirm("Do you want to submit your name?")) {
    // stop form submission from trying to load
    // a new .html page for displaying results...
    // this was the original browser behavior and still
    // remains to this day
    event.preventDefault()

    const input = document.querySelector("#yourname"),
        json = {"yourname": input.value},
        body = JSON.stringify(json)

    const response = await fetch("/submit", {
      method: "POST",
      body
    })
    const text = await response.text()
    console.log("text:", text)
    confirm("Succeed! Thank you for joining us");
  }
}

const add = async function( event ){
  if(confirm("Do you want to add the data?")){
    event.preventDefault()
    const model = document.getElementById("model").value;
    const year = document.getElementById("year").value;
    const mpg = document.getElementById("mpg").value;
    const newData = {model: model, year: year, mpg: mpg};
    fetch("/add",{
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newData)
    })
    location.reload();
  }

}



  window.onload = async function () {
    await result();
    const button1 = document.getElementById("submitBtn");
    button1.onclick = submit;
    const btnAdd = document.getElementById("addCar");
    btnAdd.onclick = add;
  }

