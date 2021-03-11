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
from django.core.paginator import Paginator


def index(request):
    return render(request, "network/index.html")


def load_posts(request):
    type = request.GET.get('type')

    posts = Post.objects.none()

    if type == 'all':
        posts = Post.objects.all()

    if type == 'user':
        user_id = int(request.GET['user_id'])
        profile_user = User(pk=user_id)

        posts = Post.objects.filter(user=profile_user)
        posts = posts.order_by("-timestamp").all()

    if type == 'following_users':
        following_users = Relationships.objects.filter(user_follow=request.user)

        for f_user in following_users:
            posts |= Post.objects.filter(user=f_user.user_followed)

    try:
        page = int(request.GET.get("page"))
    except:
        page = 1

    posts = posts.order_by("-timestamp").all()

    p = Paginator(posts, 10)
    posts_page = p.page(page)

    return JsonResponse({"posts":[post.serialize() for post in posts_page],
    "has_next":posts_page.has_next(), "has_previous":posts_page.has_previous()}, safe=False)


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
    
    return JsonResponse({"error": "Post not found."}, status=404)


def load_profile(request):
    #get user_id
    user_id = int(request.GET['user_id'])
    profile_user = User(pk=user_id)

    try:
        is_following = Relationships.objects.get(user_follow=request.user, user_followed=profile_user)
        is_following = True
    except:
        is_following = False

    return JsonResponse({"login_user_id": request.user.id,
    "followers":Relationships.objects.filter(user_followed=profile_user).count(), 
    "following":Relationships.objects.filter(user_follow=profile_user).count(), 
    "is_following":is_following}, safe=False)


def follow_unfollow(request):
    type = request.GET.get('type')

    followed_id = int(request.GET['user_id'])
    followed_user = User.objects.get(pk = followed_id)

    if type == 'follow':
        following = Relationships(user_follow=request.user, user_followed=followed_user)
        following.save()
        return JsonResponse({"message": f"{request.user} following {followed_user.username}."}, status=201)

    following = Relationships.objects.get(user_follow=request.user, user_followed=followed_user)
    following.delete()
    return JsonResponse({"message": f"{request.user} unfollowing {followed_user.username}."}, status=201)


@csrf_exempt 
@login_required
def edit_post(request):
    if request.method != "PUT":
        return JsonResponse({
            "error": "At least one recipient required."
        }, status=400)

    data = json.loads(request.body.decode("utf-8"))

    if request.user.id != data.get("user_id"):
        return JsonResponse({
            "error": "At least one recipient required."
        }, status=400)

    # Query for requested post
    try:
        post = Post.objects.get(pk=data.get("post_id"))
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    if data.get("new_post") is not None:
        post.post_data = data.get("new_post")
        post.save()
        return JsonResponse({"message": "Post updated successfully."}, status=201)
