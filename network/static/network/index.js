// to manage pagination
var page = 1;
var type;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#user_profile').style.display = 'none';
    document.querySelector('#edit_post').style.display = 'none';

    //fetch data from the database
    load_posts('all');

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
            load_posts('all');
        })

        return false;
    }

    //listener for username in layout.html
    document.querySelector('#user_username').addEventListener('click', function() {
        let user_id = document.querySelector('#user_username').dataset.user_id;
        let username = document.querySelector('#user_username').innerHTML;

        //initialize pagination when username link clicked
        window.page = 1;

        load_profile(username, user_id);
        load_posts('user');
    })

    document.querySelector('#follow').addEventListener('click', () => {
        let user_id = document.querySelector('#username').dataset.user_id;
        let username = document.querySelector('#username').innerText;
        
        fetch(`follow_unfollow?type=follow&user_id=${user_id}`).then(response => response.json()).then(rs => {
            console.log(rs.message);
            load_profile(username, user_id);
            load_posts('user');
        } );
    })


    document.querySelector('#unfollow').addEventListener('click', () => {
        let user_id = document.querySelector('#username').dataset.user_id;
        let username = document.querySelector('#username').innerText;
        
        fetch(`follow_unfollow?type=unfollow&user_id=${user_id}`).then(response => response.json()).then(rs => {
            console.log(rs.message);
            load_profile(username, user_id);
            load_posts('user');
        } );
    })

    document.querySelector('#following_user_posts').addEventListener('click', function() {
        document.querySelector('#container').style.display = 'none';
        document.querySelector('#user_profile').style.display = 'none';
        document.querySelector('#edit_post').style.display = 'none';

        document.querySelector('.post').innerHTML = '';

        // initialize pagination when following link clicked
        window.page = 1;

        load_posts('following_users');
    })

    document.querySelector('#next').addEventListener('click', () => {
        window.page = window.page + 1;
        load_posts(window.type);
    })

    document.querySelector('#previous').addEventListener('click', function() {
        window.page = window.page - 1;
        load_posts(window.type);
    })
})


function load_posts(type) {
    console.log(type);

    //clear input field
    document.querySelector('#exampleFormControlTextarea1').value = '';

    if (type === 'all') {
        fetch(`/load_posts?type=all&page=${window.page}`).then(response => response.json()).then((posts) => {
            console.log(posts.posts);
            manage_pagination('all', posts.has_next, posts.has_previous);
            display_posts(posts.posts);
        })
    }

    if (type === 'user') {
        let user_id = document.querySelector('#username').dataset.user_id;
        fetch(`/load_posts?type=user&user_id=${user_id}&page=${window.page}`).then(response => response.json()).then(data => {
            console.log(data.posts);
            manage_pagination('user', data.has_next, data.has_previous);
            display_posts(data.posts);
        })
    }

    if (type === 'following_users') {
        fetch(`/load_posts?type=following_users&page=${window.page}`).then(response => response.json()).then(posts => {
            console.log(posts.posts);
            manage_pagination('following_users', posts.has_next, posts.has_previous);
            display_posts(posts.posts);
        })
    }
}


function load_profile(username, user_id) {
    console.log('load_user_profile ' + username + ' ' + user_id);

    document.querySelector('.post').innerHTML = '';

    //Display user_profile, and dissapear post input
    document.querySelector('#user_profile').style.display = 'block';
    document.querySelector('#container').style.display = 'none';
    document.querySelector('#edit_post').style.display = 'none';

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
    })
}


function display_posts(posts) {
    document.querySelector('.post').innerHTML = '';

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

        //edit link
        let login_user_id = document.querySelector('#user_username').dataset.user_id;
        if (login_user_id == post.user_id) {
            let edit = document.createElement('A');
            edit.setAttribute('href',"#");
            edit.innerHTML = 'edit';
            div.append(edit);

            edit.addEventListener('click', () => {
                edit_post(post.user_id, post.post_id, post.post);
            })
        }
        let data = document.createElement('p');
        data.innerHTML = post.post;
        div.appendChild(data);
        let timestamp = document.createElement('p');
        timestamp.innerHTML = post.timestamp;
        div.appendChild(timestamp);

        //manage likes
        fetch(`is_user_like_post?post_id=${post.post_id}&user_id=${post.user_id}`).
        then(response => response.json()).then(res => {
            console.log(res);
            let like = document.createElement('i');
            if (res.is_user_liked_post) {
                like.className = 'fas fa-heart';
                like.style.color = 'red';
                div.appendChild(like);

                like.addEventListener('click', () => {
                    console.log('dislike post');
                    update_post = {
                        "user_id":post.user_id,
                        "post_id":post.post_id,
                        "type":"dislike"
                    }
                    fetch('like_dislike', {
                        method: "POST", 
                        body: JSON.stringify(update_post),
                        headers: {"Content-type": "application/json; charset=UTF-8"}
                    }).
                    then(response => response.json()).then(res => {
                        console.log(res);
                        load_posts(window.type);
                    })
                })

            } else {
                like.className = 'far fa-heart';
                div.appendChild(like);

                like.addEventListener('click', () => {
                    console.log('like the post');
                    update_post = {
                        "user_id":post.user_id,
                        "post_id":post.post_id,
                        "type":"like"
                    }
                    fetch('like_dislike', {
                        method: "POST", 
                        body: JSON.stringify(update_post),
                        headers: {"Content-type": "application/json; charset=UTF-8"}
                    }).
                    then(response => response.json()).then(res => {
                        console.log(res);
                        load_posts(window.type);
                    })
                })

            }
        })
        
        username.addEventListener('click', () => {
            load_profile(post.user_post, post.user_id);

            //initialize pagination when user clicked
            window.page =1;

            load_posts('user');
        })
    });
}


function manage_pagination(type_posts, has_next, has_previous) {
    //initiate pagination
    window.type = type_posts;

    if (!has_previous) {
        document.querySelector('#previous').style.display = 'none';
    } else {
        document.querySelector('#previous').style.display = 'block';
    }

    if (!has_next) {
        document.querySelector('#next').style.display = 'none';
    } else {
        document.querySelector('#next').style.display = 'block';
    }
}


function edit_post(user_id, post_id, post_data) {
    console.log(`post ${post_id} will be updated`);
    document.querySelector('#container').style.display = 'none';
    document.querySelector('#edit_post').style.display = 'block';
    
    document.querySelector('#edit').value = post_data;

    //edit post submit
    document.querySelector('#edit_post').onsubmit = function() {
        //take textarea value
        let new_post = {
            "new_post":document.querySelector('#edit').value,
            "post_id":post_id,
            "user_id":user_id
        }

        //fetching the new_post to database
        fetch('/edit_post', {
            method: "PUT", 
            body: JSON.stringify(new_post),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => {
            console.log(response);
            document.querySelector('#container').style.display = 'block';
            document.querySelector('#edit_post').style.display = 'none';
            load_posts('all');
        })

        return false;
    }
}