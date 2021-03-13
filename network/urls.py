
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new_post", views.new_post, name="new_post"),
    path("load_posts", views.load_posts, name="load_posts"),
    path("load_profile", views.load_profile, name="load_profile"),
    path("follow_unfollow", views.follow_unfollow, name="follow_unfollow"),
    path("edit_post", views.edit_post, name="edit_post"),
    path("is_user_like_post", views.is_user_like_post, name="is_user_like_post"),
    path("like_dislike", views.like_dislike, name="like_dislike"),
]
