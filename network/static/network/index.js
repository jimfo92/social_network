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

    //listener for username in layout.html
    document.querySelector('#user_username').addEventListener('click', () => {
        let user_id = document.querySelector('#user_username').dataset.user_id;
        let username = document.querySelector('#user_username').innerHTML;

        load_profile(username, user_id);
    })

    document.querySelector('#follow').addEventListener('click', () => {
        let user_id = document.querySelector('#username').dataset.user_id;
        let username = document.querySelector('#username').innerText;
        
        fetch(`follow?user_id=${user_id}`).then(response => response.json()).then(rs => {
            console.log(rs.message);
            load_profile(username, user_id);
        } );
    })


    document.querySelector('#unfollow').addEventListener('click', () => {
        let user_id = document.querySelector('#username').dataset.user_id;
        let username = document.querySelector('#username').innerText;
        
        fetch(`unfollow?user_id=${user_id}`).then(response => response.json()).then(rs => {
            console.log(rs.message);
            load_profile(username, user_id);
        } );
    })

    document.querySelector('#following_user_posts').addEventListener('click', () => {
        document.querySelector('#container').style.display = 'none';
        document.querySelector('#user_profile').style.display = 'none';

        document.querySelector('.post').innerHTML = '';

        fetch(`following_user_posts`).then(response => response.json()).then(posts => {
            console.log(posts);
            display_posts(posts);
        })
    })
})


function load_posts() {
    //not display user_profile id
    document.querySelector('#user_profile').style.display = 'none';

    //clear input field
    document.querySelector('#exampleFormControlTextarea1').value = '';

    fetch('/load_posts').then(response => response.json()).then((posts) => {
        console.log(posts);
        display_posts(posts);
    })
}


function load_profile(username, user_id) {
    console.log('load_user_profile ' + username + ' ' + user_id);

    document.querySelector('.post').innerHTML = '';

    //Display user_profile, and dissapear post input
    document.querySelector('#user_profile').style.display = 'block';
    document.querySelector('#container').style.display = 'none';

    document.querySelector('#username').innerHTML = username;
    //asign user_id to html dataset to retrive when follow-unfollow button clicked
    document.querySelector('#username').dataset.user_id = user_id;

    //consider if user who created the post is the same who was logged in
    fetch(`/load_profile?user_id=${user_id}`).then(response => response.json()).then(data => {
        console.log(data);
        document.querySelector('#followers').innerText = `Followers: ${data.followers}`;
        document.querySelector('#following').innerText = `Following: ${data.following}`;
        if (parseInt(user_id) === parseInt(data.login_user_id)) {
            document.querySelector('#follow').style.display = 'none';
            document.querySelector('#unfollow').style.display = 'none';
        } else {
            if (data.is_following === true) {
                document.querySelector('#follow').style.display = 'none';
                document.querySelector('#unfollow').style.display = 'block';
            } else {
                document.querySelector('#follow').style.display = 'block';
                document.querySelector('#unfollow').style.display = 'none';
            }
        }

        //load posts
        display_posts(data.posts);
    })
}


function display_posts(posts) {
    posts.forEach(post => {
        //create post
        let div = document.createElement('div');
        div.style.border = 'groove';
        div.className = 'post';
        document.querySelector('.post').append(div);
        let username = document.createElement('A');
        username.setAttribute('href',"#");
        username.innerHTML = post.user_post;
        div.appendChild(username);
        let br = document.createElement('div');
        div.appendChild(br);
        let edit = document.createElement('A');
        edit.setAttribute('href',"#");
        edit.innerHTML = 'edit';
        div.append(edit);
        let data = document.createElement('p');
        data.innerHTML = post.post;
        div.appendChild(data);
        let timestamp = document.createElement('p');
        timestamp.innerHTML = post.timestamp;
        div.appendChild(timestamp);

        username.addEventListener('click', () => {
            load_profile(post.user_post, post.user_id);
        })
    });
}