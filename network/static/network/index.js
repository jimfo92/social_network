document.addEventListener('DOMContentLoaded', function() {
    //fetch data from the database
    load_posts();

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
            load_posts();
        })

        return false;
    }
})


function load_posts() {
    //clear input field
    document.querySelector('#exampleFormControlTextarea1').value = '';
    fetch('/load_posts').then(response => response.json()).then((posts) => {
        console.log(posts);
        posts.forEach(post => {
            let ps = document.createElement('div');
            ps.className = 'post';
            ps.innerHTML = `<div class="card">
            <div class="card-header">
                <a href="#" id="load_profile">${post.user_post}</a>
            </div>
            <div class="card-body">
                <a href="">Edit</a>
            </div>
            <div class="card-body">
              <blockquote class="blockquote mb-0">
                <p>${post.post}</p>
                <p>${post.timestamp}</p>
                <footer class="blockquote-footer"><img src="https://img.icons8.com/small/16/fa314a/filled-like.png" alt=""> <cite title="Source Title">${post.likes_number}</cite></footer>
              </blockquote>
            </div>
          </div>`;

          document.querySelector('.post').append(ps);
        });

        //add click listeners
        document.querySelectorAll('#load_profile').forEach(btn => {
            btn.onclick = function() {
                load_profile();
            }
        })
    })
}


function load_profile() {
    console.log('load_user_profile');
}