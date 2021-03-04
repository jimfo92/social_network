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
    //not display user_profile id
    document.querySelector('#user_profile').style.display = 'none';

    //clear input field
    document.querySelector('#exampleFormControlTextarea1').value = '';

    fetch('/load_posts').then(response => response.json()).then((posts) => {
        console.log(posts);
        posts.forEach(post => {
            let ps = document.createElement('div');
            ps.className = 'post';
            ps.innerHTML = `<div class="card">
            <div class="card-header">
                <a href="#" id="load_profile" data-user_id="${post.user_id}" >${post.user_post}</a>
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

          document.querySelector('.post').appendChild(ps);

          document.querySelector('#load_profile').onclick = function() {
            console.log('onClick: ' + username);
          }
        });

        //document.querySelectorAll('#load_profile').forEach(btn => {
            //let username = document.querySelector('#load_profile').innerHTML;
            //let user_id = document.querySelector('#load_profile').dataset.user_id;
            //btn.onclick = function() {
                //load_profile(username, user_id);
            //}
        //})
    })
}


function load_profile(username, user_id) {
    console.log('load_user_profile ' + username + ' ' + user_id);

    //Display user_profile, and dissapear post input
    document.querySelector('#user_profile').style.display = 'block';
    document.querySelector('#container').style.display = 'none';

    document.querySelector('#username').innerHTML = username;

    //display follow and unfollow button
    //document.querySelector('#follow').style.display = 'block';
    //document.querySelector('#unfollow').style.display = 'block';

    //consider if user who created the post is the same who was logged in
    fetch('load_profile').then(response => response.json()).then(data => {
        if (parseInt(user_id) === parseInt(data.login_user_id)) {
            //document.querySelector('#follow').style.display = 'none';
            //document.querySelector('#unfollow').style.display = 'none';
        }
    })
}