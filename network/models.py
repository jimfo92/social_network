from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import CASCADE


class User(AbstractUser):
    pass


class Post(models.Model):
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='user_posts')
    post_data = models.CharField(max_length=1000)
    timestamp = models.DateTimeField( auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user} posts: {self.post_data} on {self.timestamp}"

    def serialize(self):
        return {
            "post_id": self.id,
            "user_post": self.user.username,
            "user_id": self.user.id,
            "post": self.post_data,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p")
        }


class Relationships(models.Model):
    user_follow = models.ForeignKey(User, null=True, on_delete=CASCADE)
    user_followed = models.ForeignKey(User, null=True, related_name='user_follow', on_delete=CASCADE)

    def __str__(self) -> str:
        return f"{self.user_follow} follows: {self.user_followed}"


class Likes(models.Model):
    post = models.ForeignKey(Post, null=True, on_delete=CASCADE, related_name='number_likes')
    user = models.ForeignKey(User, null=True, on_delete=CASCADE)

    def __str__(self) -> str:
        return f"{self.user} likes: {self.post}"
