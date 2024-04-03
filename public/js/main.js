


const submit = async function( event ) {
  if (confirm("Do you want to submit your name?")) {
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
    confirm("Welcome to join us " + input.value + "!");
  }
}


const add = async function( event ) {
  if(confirm("Do you want to add the data? Tips: the age will only show when year is a number")){
    event.preventDefault()
    const model = document.getElementById("model").value;
    const year = document.getElementById("year").value;
    const mpg = document.getElementById("mpg").value;
    const newData = {model: model, year: year, mpg: mpg};
    await fetch("/add", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newData)
    }).then(() => {
      location.reload();
  })
}}

const logout = async function(event) {
  window.location.href = '/index.html'
  await fetch('/popstate', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        }
      });
}







  window.onload = async function () {
    await result();
    const btnAdd = document.getElementById("addCar");
    btnAdd.onclick = await add;
    const btnLogOut = document.getElementById('logout');
    btnLogOut.onclick = await logout;
  }

