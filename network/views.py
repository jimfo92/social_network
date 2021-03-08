from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import User, Post, Relationships
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse


def index(request):
    return render(request, "network/index.html")

def load_posts(request):
    posts = Post.objects.all()

    return JsonResponse([post.serialize() for post in posts], safe=False)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt 
@login_required
def new_post(request):
    if request.method == "POST":
        data = json.loads(request.body.decode("utf-8"))
        
        #Save post to Post model
        post = Post(user=request.user, post_data=data)
        post.save()
        return JsonResponse({"message": "Post sent successfully."}, status=201)


def load_profile(request):
    #get user_id
    user_id = int(request.GET['user_id'])
    profile_user = User(pk=user_id)

    posts = Post.objects.filter(user=profile_user)
    posts = posts.order_by("-timestamp").all()

    try:
        is_following = Relationships.objects.get(user_follow=request.user, user_followed=profile_user)
        is_following = True
    except:
        is_following = False

    return JsonResponse({"login_user_id": request.user.id,
    "posts":[post.serialize() for post in posts], 
    "followers":Relationships.objects.filter(user_followed=profile_user).count(), 
    "following":Relationships.objects.filter(user_follow=profile_user).count(), 
    "is_following":is_following}, safe=False)


def follow(request):
    followed_id = int(request.GET['user_id'])
    followed_user = User(pk = followed_id)

    # Follow relationship
    following = Relationships(user_follow=request.user, user_followed=followed_user)
    following.save()

    return JsonResponse({"message": f"{request.user} following {followed_user.username}."}, status=201)


def unfollow(request):
    followed_id = int(request.GET['user_id'])
    followed_user = User(pk = followed_id)

    following = Relationships.objects.filter(user_follow=request.user, user_followed=followed_user)
    following.delete()

    return JsonResponse({"message": f"{request.user} unfollowing {followed_user.username}."}, status=201)


@login_required
def following_user_posts(request):
    following_users = Relationships.objects.filter(user_follow=request.user)
    
    posts = Post.objects.none()
    print(f'users: {following_users}')
    for f_user in following_users:
        posts |= Post.objects.filter(user=f_user.user_followed)

    print(f'posts: {posts}')    
    return JsonResponse([post.serialize() for post in posts], safe=False)