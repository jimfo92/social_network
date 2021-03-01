document.addEventListener('DOMContentLoaded', function() {
    //add click listeners
    document.querySelectorAll('.load_profile').forEach(btn => {
            btn.onclick = function() {
                load_profile();
            }
    })

    //new_post onSubmit 
    document.querySelector('#new_post').onsubmit = function() {
        //take textarea value
        let post = document.querySelector('#exampleFormControlTextarea1').value;

        //fetching the new_post to database
        fetch('/new_post', {
            method: "POST", 
            body: JSON.stringify(post),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => {
            console.log(response);

        })

        return false;
    }
})


function load_profile() {
    console.log('exafanisou');
    document.querySelector('#container').style.display = 'none';
}